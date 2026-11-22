import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { PrimaryButton } from "@/components/form";
import { plural } from "@/lib/format";
import { useIslands } from "@/lib/queries";
import { colors, radius } from "@/lib/theme";

/** Every island, searchable, with how many trips visited each. */
export function IslandList() {
  const islands = useIslands();
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const shown = (islands.data ?? []).filter((i) =>
    [i.name, i.country, i.regionOrState ?? ""].some((v) => v.toLowerCase().includes(term))
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: "Name, region or country",
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
        refreshControl={<RefreshControl refreshing={islands.isRefetching} onRefresh={() => void islands.refetch()} />}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/manage/islands/[islandId]", params: { islandId: item.id } })}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.fill : colors.cell,
              borderRadius: radius.card,
              borderCurve: "continuous",
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
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
            <Text style={{ color: item.tripCount ? colors.tertiaryLabel : colors.warning, fontSize: 14 }}>
              {item.tripCount ? plural(item.tripCount, "trip") : "Not on a trip"}
            </Text>
            <SymbolView name="chevron.right" size={14} tintColor={colors.tertiaryLabel} />
          </Pressable>
        )}
        ListEmptyComponent={
          islands.isLoading ? (
            <ActivityIndicator style={{ marginTop: 48 }} />
          ) : islands.error ? (
            <View style={{ gap: 12, paddingVertical: 32, alignItems: "center" }}>
              <Text selectable style={{ color: colors.label, textAlign: "center" }}>
                Couldn&apos;t load islands. {islands.error.message}
              </Text>
              <PrimaryButton label="Try again" onPress={() => islands.refetch()} />
            </View>
          ) : (
            <Text style={{ color: colors.secondaryLabel, textAlign: "center", paddingVertical: 32, fontSize: 15 }}>
              {term ? `No islands match “${q.trim()}”.` : "No islands yet. They're added from a trip."}
            </Text>
          )
        }
      />
    </>
  );
}
