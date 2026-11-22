import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useQueryClient } from "@tanstack/react-query";
import type { IslandDetailResponse } from "@shared/types";
import { ActionRow, ErrorText, PrimaryButton, Section } from "@/components/form";
import { IslandForm } from "@/components/island-form";
import { apiFetch } from "@/lib/api";
import { formatDateRange, plural } from "@/lib/format";
import { handOffIsland } from "@/lib/island-handoff";
import { invalidateAll, useIsland } from "@/lib/queries";
import { colors } from "@/lib/theme";

/**
 * Edit an island, see the trips that visited it, merge a duplicate into it, or delete it.
 * Opened from a trip (`fromTrip`), saving returns the edit to the trip editor and goes back.
 */
export function IslandDetail({ islandId, fromTrip }: { islandId: string; fromTrip: boolean }) {
  const island = useIsland(islandId);

  if (!island.data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <Stack.Screen options={{ title: "Island" }} />
        {island.error ? (
          <>
            <Text selectable style={{ color: colors.label, textAlign: "center" }}>
              Couldn&apos;t load this island. {island.error.message}
            </Text>
            <PrimaryButton label="Try again" onPress={() => island.refetch()} />
          </>
        ) : (
          <ActivityIndicator />
        )}
      </View>
    );
  }
  // A merge (on the screen above) refetches this query, so the trip list here updates by itself.
  return <IslandDetailContent detail={island.data} fromTrip={fromTrip} />;
}

function IslandDetailContent({ detail, fromTrip }: { detail: IslandDetailResponse; fromTrip: boolean }) {
  const queryClient = useQueryClient();
  const { island, trips } = detail;
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function remove() {
    Alert.alert(`Delete ${island.name}?`, "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/islands/${island.id}`, { method: "DELETE" });
            invalidateAll(queryClient);
            router.back();
          } catch (err) {
            setError((err as Error).message);
          }
        },
      },
    ]);
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 48 }}
    >
      <Stack.Screen options={{ title: island.name }} />
      <Text style={{ color: colors.secondaryLabel, fontSize: 13, paddingHorizontal: 16 }}>
        Changes apply to every trip that visited this island.
      </Text>

      <IslandForm
        island={island}
        onSaved={(updated) => {
          invalidateAll(queryClient);
          if (fromTrip) {
            handOffIsland(updated);
            router.back();
          } else {
            setSaved(true);
          }
        }}
      />
      {saved && <Text style={{ color: colors.accent, fontSize: 14, paddingHorizontal: 16 }}>Saved</Text>}

      <Section title="Visited on">
        {trips.length === 0 ? (
          <Text style={{ color: colors.secondaryLabel, padding: 16, fontSize: 15 }}>No trips yet.</Text>
        ) : (
          trips.map((trip) => (
            <Pressable
              key={trip.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: "/manage/[tripId]", params: { tripId: trip.id } })}
              style={({ pressed }) => ({
                minHeight: 52,
                paddingHorizontal: 16,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                backgroundColor: pressed ? colors.fill : undefined,
              })}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.label, fontSize: 16 }} numberOfLines={1}>
                  {trip.name}
                </Text>
                <Text style={{ color: colors.secondaryLabel, fontSize: 13 }}>
                  {formatDateRange(trip.startDate, trip.endDate)}
                </Text>
              </View>
              <SymbolView name="chevron.right" size={14} tintColor={colors.tertiaryLabel} />
            </Pressable>
          ))
        )}
      </Section>

      <Section
        title="Duplicates"
        footer={`Added the same island twice? Pick the copy to fold into ${island.name}. Its trips and photos move here and the copy is deleted.`}
      >
        <ActionRow
          label="Merge a duplicate into this island…"
          onPress={() =>
            router.push({
              pathname: "/manage/islands/merge",
              params: { keepId: island.id, keepName: island.name },
            })
          }
        />
      </Section>

      <Section
        footer={
          trips.length > 0
            ? `${island.name} is on ${plural(trips.length, "trip")}, so it can't be deleted. Remove it from those trips first, or merge it into another island from that island's page.`
            : undefined
        }
      >
        <ActionRow label="Delete island" destructive disabled={trips.length > 0} onPress={remove} />
      </Section>

      <ErrorText>{error}</ErrorText>
    </ScrollView>
  );
}
