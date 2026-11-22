import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import type { IslandSummary } from "@shared/types";
import { apiFetch } from "@/lib/api";
import { plural } from "@/lib/format";
import { invalidateAll, useIslands } from "@/lib/queries";
import { colors, radius } from "@/lib/theme";

/** Pick a duplicate to fold into the island being kept. */
export function IslandMerge({ keepId, keepName }: { keepId: string; keepName: string }) {
  const queryClient = useQueryClient();
  const islands = useIslands();
  const [q, setQ] = useState("");
  const [merging, setMerging] = useState<string | null>(null);

  const term = q.trim().toLowerCase();
  const shown = (islands.data ?? []).filter(
    (i) => i.id !== keepId && [i.name, i.country, i.regionOrState ?? ""].some((v) => v.toLowerCase().includes(term))
  );

  function confirmMerge(duplicate: IslandSummary) {
    const moves =
      duplicate.tripCount === 0
        ? `${duplicate.name} isn't on any trip, so it will just be deleted.`
        : `${duplicate.name}'s ${plural(duplicate.tripCount, "trip")} and their photos will move to ${keepName}. A trip that visited both keeps one stop with all the photos.`;
    Alert.alert(`Merge into ${keepName}?`, `${moves}\n\n${duplicate.name} (${duplicate.country}) is then deleted. This can't be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Merge", style: "destructive", onPress: () => merge(duplicate) },
    ]);
  }

  async function merge(duplicate: IslandSummary) {
    setMerging(duplicate.id);
    try {
      await apiFetch(`/api/islands/${keepId}/merge`, { method: "POST", json: { duplicateId: duplicate.id } });
      await invalidateAll(queryClient);
      router.back();
    } catch (err) {
      setMerging(null);
      Alert.alert("Couldn't merge", (err as Error).message);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Choose the duplicate",
          headerSearchBarOptions: {
            placeholder: "Search islands",
            onChangeText: (e) => setQ(e.nativeEvent.text),
            hideWhenScrolling: false,
          },
        }}
      />
      <FlatList
        data={shown}
        keyExtractor={(i) => i.id}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListHeaderComponent={
          <Text style={{ color: colors.secondaryLabel, fontSize: 13, paddingHorizontal: 16, paddingBottom: 4 }}>
            The island you pick moves into {keepName} and is deleted.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            disabled={!!merging}
            onPress={() => confirmMerge(item)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.fill : colors.cell,
              borderRadius: radius.card,
              borderCurve: "continuous",
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              opacity: merging && merging !== item.id ? 0.4 : 1,
            })}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={{ color: colors.label, fontSize: 17 }} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={{ color: colors.secondaryLabel, fontSize: 14 }} numberOfLines={1}>
                {[item.regionOrState, item.country].filter(Boolean).join(", ")}
              </Text>
            </View>
            {merging === item.id ? (
              <ActivityIndicator />
            ) : (
              <Text style={{ color: colors.tertiaryLabel, fontSize: 14 }}>{plural(item.tripCount, "trip")}</Text>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          islands.isLoading ? (
            <ActivityIndicator style={{ marginTop: 48 }} />
          ) : (
            <Text selectable style={{ color: colors.secondaryLabel, textAlign: "center", paddingVertical: 32, fontSize: 15 }}>
              {islands.error ? `Couldn't load islands. ${islands.error.message}` : "No other islands match."}
            </Text>
          )
        }
      />
    </>
  );
}
