import { useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { router, Stack } from "expo-router";
import type { Island } from "@shared/types";
import { ActionRow, ErrorText, Field, Section } from "@/components/form";
import { HeaderButton } from "@/components/header-button";
import { apiFetch } from "@/lib/api";
import { handOffIsland } from "@/lib/island-handoff";
import { photoLocation, pickPhotos } from "@/lib/photos";
import { colors } from "@/lib/theme";

interface NominatimResult {
  lat: string;
  lon: string;
  address?: { country?: string; state?: string; region?: string; archipelago?: string };
}

type Coordinate = { latitude: number; longitude: number };

const round = (n: number) => Math.round(n * 1e5) / 1e5;

/** Adds a new island: name, country, region and a pin on the map. */
export function NewIslandScreen({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [country, setCountry] = useState("");
  const [regionOrState, setRegionOrState] = useState("");
  const [position, setPosition] = useState<Coordinate | null>(null);
  const [busy, setBusy] = useState<"lookup" | "photo" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  function place(c: Coordinate, zoom = true) {
    const rounded = { latitude: round(c.latitude), longitude: round(c.longitude) };
    setPosition(rounded);
    if (zoom) mapRef.current?.animateToRegion({ ...rounded, latitudeDelta: 0.6, longitudeDelta: 0.6 }, 400);
  }

  // OpenStreetMap's free geocoder. Its usage policy allows occasional lookups like this button,
  // not search-as-you-type, and asks apps to identify themselves.
  async function lookUp() {
    setBusy("lookup");
    setError(null);
    try {
      const q = [name, regionOrState, country].filter(Boolean).join(", ");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&accept-language=en&q=${encodeURIComponent(q)}`,
        { headers: { "User-Agent": "ThousandIslands-iOS/1.0 (github.com/skydolla/thousandislands)" } }
      );
      const [hit] = (await res.json()) as NominatimResult[];
      if (!hit) {
        setError("No match found. Tap the map to place the island instead.");
        return;
      }
      place({ latitude: Number(hit.lat), longitude: Number(hit.lon) });
      if (!country && hit.address?.country) setCountry(hit.address.country);
      const region = hit.address?.state ?? hit.address?.region ?? hit.address?.archipelago;
      if (!regionOrState && region) setRegionOrState(region);
    } catch {
      setError("Lookup failed. Tap the map to place the island instead.");
    } finally {
      setBusy(null);
    }
  }

  async function fromPhoto() {
    setError(null);
    setBusy("photo");
    try {
      const [asset] = await pickPhotos({ multiple: false });
      if (!asset) return;
      const location = photoLocation(asset);
      if (location) place(location);
      else setError("That photo has no location saved in it. Try another, or tap the map.");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!name.trim() || !country.trim()) {
      setError("Name and country are required.");
      return;
    }
    if (!position) {
      setError("Place the island on the map: tap it, use Look up, or use a photo's location.");
      return;
    }
    setBusy("save");
    setError(null);
    try {
      const { island } = await apiFetch<{ island: Island }>("/api/islands", {
        method: "POST",
        json: { name, country, regionOrState: regionOrState.trim() || null, ...position, notes: null },
      });
      handOffIsland(island);
      router.back();
    } catch (err) {
      setError((err as Error).message);
      setBusy(null);
    }
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      style={{ backgroundColor: colors.groupedBackground }}
      contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 48 }}
    >
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} />,
          headerRight: () =>
            busy === "save" ? <ActivityIndicator /> : <HeaderButton label="Add" bold onPress={save} disabled={!!busy} />,
        }}
      />

      <Section>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Required" autoCapitalize="words" />
        <Field label="Country" value={country} onChangeText={setCountry} placeholder="Required" autoCapitalize="words" />
        <Field label="Region" value={regionOrState} onChangeText={setRegionOrState} placeholder="Optional" autoCapitalize="words" />
      </Section>

      <Section
        title="Location"
        footer={
          <Text selectable style={{ color: colors.secondaryLabel, fontSize: 13, fontVariant: ["tabular-nums"] }}>
            {position
              ? `${position.latitude}, ${position.longitude} · tap or drag to adjust`
              : "Tap the map to drop a pin."}
          </Text>
        }
      >
        <ActionRow label="Look up by name" onPress={lookUp} busy={busy === "lookup"} disabled={!name.trim() || !!busy} />
        <ActionRow label="Use a photo's location" onPress={fromPhoto} busy={busy === "photo"} disabled={!!busy} />
        <View style={{ height: 260 }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={{ latitude: 20, longitude: 0, latitudeDelta: 120, longitudeDelta: 180 }}
            mapType="mutedStandard"
            userInterfaceStyle="dark"
            onPress={(e) => place(e.nativeEvent.coordinate, false)}
          >
            {position && (
              <Marker
                coordinate={position}
                pinColor={colors.accent}
                draggable
                onDragEnd={(e) => place(e.nativeEvent.coordinate, false)}
              />
            )}
          </MapView>
        </View>
      </Section>

      <ErrorText>{error}</ErrorText>
    </ScrollView>
  );
}
