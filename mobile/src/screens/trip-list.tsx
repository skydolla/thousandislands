import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useQueryClient } from "@tanstack/react-query";
import { ActionRow, PrimaryButton, Section } from "@/components/form";
import { HeaderButton } from "@/components/header-button";
import { useSession } from "@/hooks/use-session";
import { formatDateRange, plural } from "@/lib/format";
import { useTrips } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import { colors, radius } from "@/lib/theme";

export function TripList() {
  const trips = useTrips();
  const { session } = useSession();
  const queryClient = useQueryClient();

  function signOut() {
    Alert.alert("Sign out?", "You can still browse the map while signed out.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          router.dismissTo("/");
          // Sign out once the sheet has closed; the manage screens require a session to render.
          setTimeout(() => {
            supabase.auth.signOut();
            queryClient.removeQueries({ queryKey: ["trips"] });
          }, 500);
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderButton label="Done" bold onPress={() => router.back()} />,
          headerRight: () => (
            <HeaderButton label="New trip" symbol="plus" onPress={() => router.push("/manage/new")} />
          ),
        }}
      />
      <FlatList
        data={trips.data ?? []}
        keyExtractor={(t) => t.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={trips.isRefetching} onRefresh={() => void trips.refetch()} />}
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 6 }}>
            <Section>
              <ActionRow label="Islands" onPress={() => router.push("/manage/islands")} />
            </Section>
            {trips.error && trips.data && (
              <Text selectable style={{ color: colors.destructive, fontSize: 14 }}>
                Couldn&apos;t refresh. {trips.error.message}
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/manage/[tripId]", params: { tripId: item.id } })}
            style={({ pressed }) => ({
              backgroundColor: pressed ? colors.fill : colors.cell,
              borderRadius: radius.card,
              borderCurve: "continuous",
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            })}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ color: colors.label, fontSize: 17, fontWeight: "600" }} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={{ color: colors.secondaryLabel, fontSize: 14 }}>
                {formatDateRange(item.startDate, item.endDate)} · {plural(item.islandCount, "island")}
              </Text>
            </View>
            <SymbolView name="chevron.right" size={14} tintColor={colors.tertiaryLabel} />
          </Pressable>
        )}
        ListEmptyComponent={
          trips.isLoading ? (
            <ActivityIndicator style={{ marginTop: 48 }} />
          ) : trips.error ? (
            <View style={{ gap: 12, paddingVertical: 32, alignItems: "center" }}>
              <Text selectable style={{ color: colors.label, textAlign: "center" }}>
                Couldn&apos;t load your trips. {trips.error.message}
              </Text>
              <PrimaryButton label="Try again" onPress={() => trips.refetch()} />
            </View>
          ) : (
            <View style={{ gap: 16, paddingVertical: 32 }}>
              <View style={{ gap: 6, alignItems: "center" }}>
                <Text style={{ color: colors.label, fontSize: 20, fontWeight: "600" }}>No trips yet</Text>
                <Text style={{ color: colors.secondaryLabel, fontSize: 15, textAlign: "center" }}>
                  Add a trip and its islands, and they&apos;ll appear on the map.
                </Text>
              </View>
              <PrimaryButton label="Add your first trip" onPress={() => router.push("/manage/new")} />
            </View>
          )
        }
        ListFooterComponent={
          <View style={{ paddingTop: 24 }}>
            <Section footer={session?.user.email ? `Signed in as ${session.user.email}` : undefined}>
              <ActionRow label="Sign out" destructive onPress={signOut} />
            </Section>
          </View>
        }
      />
    </>
  );
}
