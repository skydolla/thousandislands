import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useQuery } from "@tanstack/react-query";
import type { Island } from "@shared/types";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

/** Search the islands already in the database, or start creating a new one. */
export function IslandSearch({
  excludeIds,
  onSelect,
  onCreate,
}: {
  excludeIds: string[];
  onSelect: (island: Island) => void;
  onCreate: (name: string) => void;
}) {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 250);
    return () => clearTimeout(timer);
  }, [text]);

  const results = useQuery({
    queryKey: ["islands", query],
    queryFn: ({ signal }) =>
      apiFetch<{ islands: Island[] }>(`/api/islands?q=${encodeURIComponent(query)}`, { signal }).then((r) => r.islands),
    enabled: query.length > 0,
    staleTime: 0,
  });
  const matches = (results.data ?? []).filter((i) => !excludeIds.includes(i.id));

  const row = { minHeight: 48, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12 } as const;
  const divider = <View style={{ height: 0.5, marginLeft: 16, backgroundColor: colors.separator }} />;

  return (
    <View>
      <View style={row}>
        <SymbolView name="magnifyingglass" size={16} tintColor={colors.secondaryLabel} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Search islands or add a new one"
          placeholderTextColor={colors.tertiaryLabel as string}
          selectionColor={colors.accent}
          accessibilityLabel="Search islands"
          autoCorrect={false}
          returnKeyType="search"
          style={{ flex: 1, color: colors.label, fontSize: 16, paddingVertical: 12 }}
        />
        {results.isFetching && <ActivityIndicator size="small" />}
      </View>

      {query.length > 0 && (
        <>
          {matches.map((island) => (
            <View key={island.id}>
              {divider}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onSelect(island);
                  setText("");
                  setQuery("");
                }}
                style={({ pressed }) => [row, { backgroundColor: pressed ? colors.fill : undefined }]}
              >
                <SymbolView name="plus.circle.fill" size={20} tintColor={colors.accent} />
                <Text style={{ flex: 1, color: colors.label, fontSize: 16 }} numberOfLines={1}>
                  {island.name}{" "}
                  <Text style={{ color: colors.secondaryLabel }}>
                    {[island.regionOrState, island.country].filter(Boolean).join(", ")}
                  </Text>
                </Text>
              </Pressable>
            </View>
          ))}
          {results.error && (
            <>
              {divider}
              <Text selectable style={{ color: colors.destructive, padding: 16, fontSize: 14 }}>
                {results.error.message}
              </Text>
            </>
          )}
          {divider}
          <Pressable
            accessibilityRole="button"
            onPress={() => onCreate(text.trim())}
            style={({ pressed }) => [row, { backgroundColor: pressed ? colors.fill : undefined }]}
          >
            <SymbolView name="mappin.and.ellipse" size={20} tintColor={colors.accent} />
            <Text style={{ flex: 1, color: colors.accent, fontSize: 16 }} numberOfLines={1}>
              Create “{text.trim()}” as a new island
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
