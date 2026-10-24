import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { router, Stack, useFocusEffect, useNavigation } from "expo-router";
import { usePreventRemove } from "expo-router/react-navigation";
import { SymbolView } from "expo-symbols";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { useQueryClient } from "@tanstack/react-query";
import type { Island, TripDetailIsland, TripDetailResponse } from "@shared/types";
import { ActionRow, ErrorText, Field, PrimaryButton, Section } from "@/components/form";
import { HeaderButton } from "@/components/header-button";
import { IslandPhotos } from "@/components/island-photos";
import { IslandSearch } from "@/components/island-search";
import { apiFetch } from "@/lib/api";
import { parseDay, plural, toDay } from "@/lib/format";
import { takeHandedOffIsland } from "@/lib/island-handoff";
import { invalidateAll, useTrip } from "@/lib/queries";
import { colors } from "@/lib/theme";

interface EditorIsland {
  island: Pick<Island, "id" | "name" | "country" | "regionOrState">;
  /** Present once the island has been saved as part of this trip (needed for photos). */
  saved?: TripDetailIsland;
}

interface Draft {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  attendees: string;
  islands: EditorIsland[];
}

type Trip = TripDetailResponse["trip"];

function draftFrom(trip: Trip | undefined): Draft {
  const today = toDay(new Date());
  return {
    name: trip?.name ?? "",
    description: trip?.description ?? "",
    startDate: trip?.startDate ?? today,
    endDate: trip?.endDate ?? today,
    attendees: trip?.attendees.map((a) => a.name).join(", ") ?? "",
    islands: trip?.islands.map((ti) => ({ island: ti.island, saved: ti })) ?? [],
  };
}

/** What the API receives; also used to tell whether there are unsaved changes. */
function payloadOf(d: Draft) {
  return {
    name: d.name.trim(),
    description: d.description.trim(),
    startDate: d.startDate,
    endDate: d.endDate,
    attendeeNames: d.attendees.split(",").map((s) => s.trim()).filter(Boolean),
    islandIds: d.islands.map((i) => i.island.id),
  };
}

/** Loads the trip, then hands it to the form. A new trip skips the load. */
export function TripEditorScreen({ tripId }: { tripId?: string }) {
  const trip = useTrip(tripId);
  const [formKey, setFormKey] = useState(0);
  if (tripId && !trip.data) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <Stack.Screen options={{ title: "Trip" }} />
        {trip.error ? (
          <>
            <Text selectable style={{ color: colors.label, textAlign: "center" }}>
              Couldn&apos;t load this trip. {trip.error.message}
            </Text>
            <PrimaryButton label="Try again" onPress={() => trip.refetch()} />
          </>
        ) : (
          <ActivityIndicator />
        )}
      </View>
    );
  }
  // After a save, reload the trip and start a fresh form from it, so newly added islands get their
  // photo sections. Background refreshes don't remount the form, so they never discard a draft.
  async function onSaved() {
    await trip.refetch();
    setFormKey((k) => k + 1);
  }
  return <TripForm key={formKey} tripId={tripId} trip={trip.data} onSaved={onSaved} />;
}

function TripForm({ tripId, trip, onSaved }: { tripId?: string; trip?: Trip; onSaved: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  /** Set when leaving on purpose (after creating or deleting), so the discard prompt is skipped. */
  const leaving = useRef(false);
  const [saved, setSaved] = useState(() => draftFrom(trip));
  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingIsland, setAddingIsland] = useState(false);

  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const dirty = JSON.stringify(payloadOf(draft)) !== JSON.stringify(payloadOf(saved));

  // An island created on the "New island" screen comes back here.
  useFocusEffect(
    useCallback(() => {
      const island = takeHandedOffIsland();
      if (island) {
        setDraft((d) => ({ ...d, islands: [...d.islands, { island }] }));
        setAddingIsland(false);
      }
    }, [])
  );

  usePreventRemove(dirty && !saving, ({ data }) => {
    if (leaving.current) return navigation.dispatch(data.action);
    Alert.alert("Discard changes?", "Your changes to this trip haven't been saved.", [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  async function save() {
    const payload = payloadOf(draft);
    if (!payload.name) {
      setError("Give the trip a name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (tripId) {
        await apiFetch(`/api/trips/${tripId}`, { method: "PUT", json: payload });
        setSaved(draft);
        invalidateAll(queryClient);
        await onSaved();
      } else {
        const { id } = await apiFetch<{ id: string }>("/api/trips", { method: "POST", json: payload });
        leaving.current = true;
        invalidateAll(queryClient);
        router.replace({ pathname: "/manage/[tripId]", params: { tripId: id } });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function moveIsland(index: number, delta: -1 | 1) {
    const islands = [...draft.islands];
    [islands[index], islands[index + delta]] = [islands[index + delta], islands[index]];
    update({ islands });
  }

  function removeIsland(index: number) {
    const item = draft.islands[index];
    const photos = item.saved?.pictures.length ?? 0;
    const drop = () => update({ islands: draft.islands.filter((_, i) => i !== index) });
    if (!photos) return drop();
    Alert.alert(
      `Remove ${item.island.name}?`,
      `Its ${plural(photos, "photo")} will be deleted from this trip when you save.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: drop },
      ]
    );
  }

  function deleteTrip() {
    if (!tripId) return;
    Alert.alert(`Delete “${saved.name}”?`, "The trip and all of its photos will be deleted. This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete trip",
        style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(`/api/trips/${tripId}`, { method: "DELETE" });
            queryClient.removeQueries({ queryKey: ["trip", tripId] });
            invalidateAll(queryClient);
            leaving.current = true;
            router.back();
          } catch (err) {
            setError((err as Error).message);
          }
        },
      },
    ]);
  }

  const savedIslands = draft.islands.filter((i) => i.saved);
  const hasUnsavedIslands = draft.islands.some((i) => !i.saved);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 48 }}
    >
      <Stack.Screen
        options={{
          title: tripId ? "Edit trip" : "New trip",
          headerRight: () =>
            saving ? (
              <ActivityIndicator />
            ) : (
              <HeaderButton label={tripId ? "Save" : "Create"} bold onPress={save} disabled={tripId ? !dirty : false} />
            ),
        }}
      />

      <Section>
        <Field label="Name" value={draft.name} onChangeText={(name) => update({ name })} placeholder="Trip name" />
        <DateRow label="Starts" day={draft.startDate} onChange={(startDate) => update({ startDate, endDate: startDate > draft.endDate ? startDate : draft.endDate })} />
        <DateRow label="Ends" day={draft.endDate} minimum={draft.startDate} onChange={(endDate) => update({ endDate })} />
      </Section>

      <Section title="Who came along" footer="Names, separated by commas.">
        <Field label="With" value={draft.attendees} onChangeText={(attendees) => update({ attendees })} placeholder="Optional" autoCapitalize="words" />
      </Section>

      <Section>
        <Field
          label="Description"
          multiline
          value={draft.description}
          onChangeText={(description) => update({ description })}
          placeholder="What happened on this trip?"
        />
      </Section>

      <Section title="Islands, in visit order">
        {draft.islands.map((item, index) => (
          <View key={item.island.id} style={{ flexDirection: "row", alignItems: "center", minHeight: 52, paddingLeft: 16, paddingRight: 8, gap: 10 }}>
            <Text style={{ width: 20, color: colors.tertiaryLabel, fontVariant: ["tabular-nums"] }}>{index + 1}</Text>
            <View style={{ flex: 1, paddingVertical: 8 }}>
              <Text style={{ color: colors.label, fontSize: 16 }} numberOfLines={1}>
                {item.island.name}
              </Text>
              <Text style={{ color: colors.secondaryLabel, fontSize: 13 }} numberOfLines={1}>
                {[item.island.regionOrState, item.island.country].filter(Boolean).join(", ")}
                {!item.saved && <Text style={{ color: colors.warning }}>  · not saved yet</Text>}
              </Text>
            </View>
            <IconButton symbol="arrow.up" label={`Move ${item.island.name} up`} disabled={index === 0} onPress={() => moveIsland(index, -1)} />
            <IconButton symbol="arrow.down" label={`Move ${item.island.name} down`} disabled={index === draft.islands.length - 1} onPress={() => moveIsland(index, 1)} />
            <IconButton symbol="minus.circle.fill" label={`Remove ${item.island.name}`} destructive onPress={() => removeIsland(index)} />
          </View>
        ))}
        {addingIsland ? (
          <IslandSearch
            excludeIds={draft.islands.map((i) => i.island.id)}
            onSelect={(island) => {
              update({ islands: [...draft.islands, { island }] });
              setAddingIsland(false);
            }}
            onCreate={(name) => router.push({ pathname: "/manage/new-island", params: { name } })}
          />
        ) : (
          <ActionRow label="Add island" onPress={() => setAddingIsland(true)} />
        )}
      </Section>

      <ErrorText>{error}</ErrorText>

      {!tripId && <PrimaryButton label="Create trip" onPress={save} busy={saving} />}

      {tripId && (
        <View style={{ gap: 6 }}>
          <Text style={{ color: colors.secondaryLabel, fontSize: 13, paddingHorizontal: 16 }}>PHOTOS</Text>
          <View style={{ backgroundColor: colors.cell, borderRadius: 12, borderCurve: "continuous", overflow: "hidden" }}>
            {savedIslands.length === 0 ? (
              <Text style={{ color: colors.secondaryLabel, padding: 16, fontSize: 15 }}>
                Add an island and save to start adding photos.
              </Text>
            ) : (
              savedIslands.map((i, index) => (
                <View key={i.saved!.tripIslandId}>
                  {index > 0 && <View style={{ height: 0.5, marginLeft: 16, backgroundColor: colors.separator }} />}
                  <IslandPhotos tripIslandId={i.saved!.tripIslandId} islandName={i.island.name} initialPictures={i.saved!.pictures} />
                </View>
              ))
            )}
          </View>
          <Text style={{ color: colors.secondaryLabel, fontSize: 13, paddingHorizontal: 16 }}>
            Photos are resized and saved as soon as you add them. Tap one to caption, reorder or delete it.
            {hasUnsavedIslands ? " Save the trip to add photos for new islands." : ""}
          </Text>
        </View>
      )}

      {tripId && (
        <Section>
          <ActionRow label="Delete trip" destructive onPress={deleteTrip} />
        </Section>
      )}
    </ScrollView>
  );
}

function DateRow({ label, day, minimum, onChange }: { label: string; day: string; minimum?: string; onChange: (day: string) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48, paddingHorizontal: 16 }}>
      <Text style={{ color: colors.label, fontSize: 16 }}>{label}</Text>
      <DateTimePicker
        value={parseDay(day)}
        minimumDate={minimum ? parseDay(minimum) : undefined}
        mode="date"
        display="compact"
        accentColor={colors.accent}
        themeVariant="dark"
        onValueChange={(_, date) => onChange(toDay(date))}
      />
    </View>
  );
}

function IconButton({
  symbol,
  label,
  onPress,
  disabled,
  destructive,
}: {
  symbol: "arrow.up" | "arrow.down" | "minus.circle.fill";
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={4}
      style={({ pressed }) => ({ width: 36, height: 36, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.25 : pressed ? 0.6 : 1 })}
    >
      <SymbolView name={symbol} size={18} tintColor={destructive ? colors.destructive : colors.secondaryLabel} />
    </Pressable>
  );
}
