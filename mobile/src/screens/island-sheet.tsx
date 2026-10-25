import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { Chip } from "@/components/chip";
import { PhotoPager } from "@/components/photo-pager";
import { formatDateRange, plural } from "@/lib/format";
import { useMapPins, useTrip } from "@/lib/queries";
import { colors } from "@/lib/theme";

function Meta({ icon, text }: { icon: "calendar" | "globe" | "mountain.2"; text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <SymbolView name={icon} size={14} tintColor={colors.secondaryLabel} />
      <Text selectable style={{ color: colors.secondaryLabel, fontSize: 14 }}>
        {text}
      </Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ color: colors.tertiaryLabel, fontSize: 12, fontWeight: "600", letterSpacing: 0.6 }}>
      {children.toUpperCase()}
    </Text>
  );
}

/** The sheet shown when a pin is tapped: each trip that visited the island, with its photos. */
export function IslandSheet({ islandId }: { islandId: string }) {
  const pins = useMapPins();
  const pin = pins.data?.find((p) => p.islandId === islandId);
  const [tripId, setTripId] = useState<string>();
  const [selectedIslandId, setSelectedIslandId] = useState(islandId);
  const selectedTripId = tripId ?? pin?.trips[0]?.tripId;
  const trip = useTrip(selectedTripId);

  const selected =
    trip.data?.islands.find((ti) => ti.island.id === selectedIslandId) ?? trip.data?.islands[0];

  let body;
  if (!pin && pins.isLoading) {
    body = <ActivityIndicator style={{ marginTop: 48 }} />;
  } else if (!pin) {
    body = <Text style={{ color: colors.secondaryLabel, marginTop: 24 }}>This island is no longer on the map.</Text>;
  } else if (!trip.data) {
    body = trip.error ? (
      <View style={{ gap: 12, marginTop: 24, alignItems: "flex-start" }}>
        <Text selectable style={{ color: colors.label }}>
          Couldn&apos;t load this trip. {trip.error.message}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => trip.refetch()} hitSlop={8}>
          <Text style={{ color: colors.accent, fontWeight: "600", fontSize: 15 }}>Try again</Text>
        </Pressable>
      </View>
    ) : (
      <ActivityIndicator style={{ marginTop: 48 }} />
    );
  } else {
    const t = trip.data;
    body = (
      <>
        <View style={{ gap: 8 }}>
          <Text selectable style={{ color: colors.label, fontSize: 26, fontWeight: "700" }}>
            {t.name}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 16, rowGap: 4 }}>
            <Meta icon="calendar" text={formatDateRange(t.startDate, t.endDate)} />
            {t.country && <Meta icon="globe" text={[t.country, t.regionOrState].filter(Boolean).join(", ")} />}
            <Meta icon="mountain.2" text={plural(t.islandCount, "island")} />
          </View>
        </View>

        {!!t.description && (
          <Text selectable style={{ color: colors.label, fontSize: 15, lineHeight: 22, opacity: 0.85 }}>
            {t.description}
          </Text>
        )}

        {t.attendees.length > 0 && (
          <Text selectable style={{ color: colors.secondaryLabel, fontSize: 14 }}>
            With {t.attendees.map((a) => a.name).join(", ")}
          </Text>
        )}

        {t.islands.length > 1 && (
          <View style={{ gap: 10 }}>
            <SectionTitle>Islands visited</SectionTitle>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {t.islands.map((ti) => (
                <Chip
                  key={ti.tripIslandId}
                  label={ti.island.name}
                  selected={ti.tripIslandId === selected?.tripIslandId}
                  onPress={() => setSelectedIslandId(ti.island.id)}
                />
              ))}
            </View>
          </View>
        )}

        {selected && (
          <View style={{ gap: 10 }}>
            <SectionTitle>{`Photos — ${selected.island.name}`}</SectionTitle>
            <PhotoPager key={selected.tripIslandId} pictures={selected.pictures} />
          </View>
        )}
      </>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#18181b" }}
      contentContainerStyle={{ padding: 20, paddingTop: 28, gap: 18 }}
    >
      {pin && pin.trips.length > 1 && (
        <View style={{ gap: 10 }}>
          <SectionTitle>{`Visited on ${pin.trips.length} trips`}</SectionTitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {pin.trips.map((t) => (
              <Chip
                key={t.tripId}
                label={t.tripName}
                selected={t.tripId === selectedTripId}
                onPress={() => {
                  setTripId(t.tripId);
                  setSelectedIslandId(islandId);
                }}
              />
            ))}
          </View>
        </View>
      )}
      {body}
    </ScrollView>
  );
}
