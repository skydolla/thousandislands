import { useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import MapView, { Marker, type MapMarker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SymbolView } from "expo-symbols";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { GlassPanel } from "@/components/glass-panel";
import { useSession } from "@/hooks/use-session";
import { GOAL } from "@/lib/config";
import { useMapPins, useProgress } from "@/lib/queries";
import { colors } from "@/lib/theme";

const WORLD = { latitude: 20, longitude: 0, latitudeDelta: 140, longitudeDelta: 360 };

export function MapScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useSession();
  const pins = useMapPins();
  const progress = useProgress();
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef(new Map<string, MapMarker>());
  const fitted = useRef(false);

  // Frame every pin once, the first time they load.
  useEffect(() => {
    if (fitted.current || !pins.data?.length) return;
    fitted.current = true;
    mapRef.current?.fitToCoordinates(pins.data, {
      edgePadding: { top: insets.top + 120, right: 60, bottom: insets.bottom + 60, left: 60 },
      animated: false,
    });
  }, [pins.data, insets]);

  const error = pins.error ?? progress.error;
  const count = progress.data?.uniqueIslandsVisited;

  return (
    <View style={{ flex: 1, backgroundColor: "#09090b" }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={WORLD}
        mapType="mutedStandard"
        userInterfaceStyle="dark"
        showsPointsOfInterests={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {pins.data?.map((pin) => (
          <Marker
            key={pin.islandId}
            ref={(m) => {
              if (m) markerRefs.current.set(pin.islandId, m);
              else markerRefs.current.delete(pin.islandId);
            }}
            coordinate={pin}
            pinColor={colors.accent}
            title={pin.islandName}
            titleVisibility="adaptive"
            onPress={() => {
              // Deselect straight away so the same pin can be tapped again after the sheet closes.
              markerRefs.current.get(pin.islandId)?.hideCallout();
              Haptics.selectionAsync();
              router.push({ pathname: "/island/[islandId]", params: { islandId: pin.islandId } });
            }}
          />
        ))}
      </MapView>

      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 16,
          right: 16,
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <GlassPanel style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8, minWidth: 150 }}>
          <Text style={{ color: colors.secondaryLabel, fontSize: 11, fontWeight: "600", letterSpacing: 0.6 }}>
            ISLANDS VISITED
          </Text>
          <Text style={{ color: colors.label, fontSize: 15 }}>
            <Text style={{ color: colors.accent, fontSize: 26, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
              {count ?? "–"}
            </Text>
            {"  "}/ {GOAL.toLocaleString("en-US")}
          </Text>
          <View style={{ height: 5, borderRadius: 3, backgroundColor: "rgba(63, 63, 70, 0.8)", overflow: "hidden" }}>
            <View
              style={{
                height: "100%",
                width: `${Math.min(100, ((count ?? 0) / GOAL) * 100)}%`,
                minWidth: count ? 5 : 0,
                borderRadius: 3,
                backgroundColor: colors.accent,
              }}
            />
          </View>
        </GlassPanel>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={session ? "Manage trips" : "Sign in"}
          onPress={() => router.push(session ? "/manage" : "/login")}
          hitSlop={8}
        >
          <GlassPanel style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" }}>
            <SymbolView
              name={session ? "square.and.pencil" : "person.crop.circle"}
              tintColor={colors.label}
              size={22}
            />
          </GlassPanel>
        </Pressable>
      </View>

      {error && (
        <View pointerEvents="box-none" style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 16 }}>
          <GlassPanel style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text selectable style={{ flex: 1, color: colors.label, fontSize: 14 }}>
              {pins.data ? "Couldn't refresh the map." : "Couldn't load your islands."} {error.message}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                pins.refetch();
                progress.refetch();
              }}
              hitSlop={8}
            >
              <Text style={{ color: colors.accent, fontSize: 15, fontWeight: "600" }}>Retry</Text>
            </Pressable>
          </GlassPanel>
        </View>
      )}

      {!error && pins.data?.length === 0 && (
        <View pointerEvents="box-none" style={{ position: "absolute", left: 16, right: 16, bottom: insets.bottom + 16 }}>
          <GlassPanel style={{ padding: 16, gap: 4 }}>
            <Text style={{ color: colors.label, fontSize: 16, fontWeight: "600" }}>No islands yet</Text>
            <Text style={{ color: colors.secondaryLabel, fontSize: 14 }}>
              {session
                ? "Tap the edit button to add your first trip."
                : "Islands appear here as trips are added."}
            </Text>
          </GlassPanel>
        </View>
      )}
    </View>
  );
}
