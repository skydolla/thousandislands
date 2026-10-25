import { useState } from "react";
import { ActionSheetIOS, ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { useQueryClient } from "@tanstack/react-query";
import type { TripDetailIslandPicture } from "@shared/types";
import { apiFetch } from "@/lib/api";
import { plural } from "@/lib/format";
import { pickPhotos, uploadPhoto } from "@/lib/photos";
import { invalidateAll } from "@/lib/queries";
import { colors, radius } from "@/lib/theme";

const THUMB = 104;

/** Upload, caption, reorder and delete one trip island's photos. Changes save immediately. */
export function IslandPhotos({
  tripIslandId,
  islandName,
  initialPictures,
}: {
  tripIslandId: string;
  islandName: string;
  initialPictures: TripDetailIslandPicture[];
}) {
  const queryClient = useQueryClient();
  const [pictures, setPictures] = useState(initialPictures);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setError(null);
    let assets;
    try {
      assets = await pickPhotos();
    } catch (err) {
      setError((err as Error).message);
      return;
    }
    if (assets.length === 0) return;
    const failures: string[] = [];
    setUploading({ done: 0, total: assets.length });
    for (const [index, asset] of assets.entries()) {
      try {
        const picture = await uploadPhoto(tripIslandId, asset);
        setPictures((prev) => [...prev, picture]);
      } catch (err) {
        failures.push((err as Error).message);
      }
      setUploading({ done: index + 1, total: assets.length });
    }
    setUploading(null);
    if (failures.length) {
      setError(`${plural(failures.length, "photo")} didn't upload: ${failures[0]}`);
    }
    invalidateAll(queryClient);
  }

  async function run(action: () => Promise<unknown>, rollback?: () => void) {
    setError(null);
    try {
      await action();
      invalidateAll(queryClient);
    } catch (err) {
      rollback?.();
      setError((err as Error).message);
    }
  }

  function editCaption(picture: TripDetailIslandPicture) {
    Alert.prompt(
      "Caption",
      undefined,
      (text) => {
        const caption = text.trim() || null;
        if (caption === picture.caption) return;
        run(async () => {
          await apiFetch(`/api/pictures/${picture.id}`, { method: "PATCH", json: { caption } });
          setPictures((prev) => prev.map((p) => (p.id === picture.id ? { ...p, caption } : p)));
        });
      },
      "plain-text",
      picture.caption ?? ""
    );
  }

  function move(index: number, delta: -1 | 1) {
    const previous = pictures;
    const next = [...pictures];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setPictures(next);
    run(
      () => apiFetch("/api/pictures/order", { method: "PUT", json: { tripIslandId, pictureIds: next.map((p) => p.id) } }),
      () => setPictures(previous)
    );
  }

  function remove(picture: TripDetailIslandPicture) {
    Alert.alert("Delete this photo?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          run(async () => {
            await apiFetch(`/api/pictures/${picture.id}`, { method: "DELETE" });
            setPictures((prev) => prev.filter((p) => p.id !== picture.id));
          }),
      },
    ]);
  }

  function openActions(picture: TripDetailIslandPicture, index: number) {
    const options = [
      picture.caption ? "Edit caption" : "Add caption",
      ...(index > 0 ? ["Move earlier"] : []),
      ...(index < pictures.length - 1 ? ["Move later"] : []),
      "Delete photo",
      "Cancel",
    ];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex: options.length - 2,
        cancelButtonIndex: options.length - 1,
        title: picture.caption ?? undefined,
      },
      (i) => {
        const choice = options[i];
        if (choice === "Edit caption" || choice === "Add caption") editCaption(picture);
        else if (choice === "Move earlier") move(index, -1);
        else if (choice === "Move later") move(index, 1);
        else if (choice === "Delete photo") remove(picture);
      }
    );
  }

  return (
    <View style={{ gap: 10, paddingVertical: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 12 }}>
        <Text style={{ flex: 1, color: colors.label, fontSize: 16, fontWeight: "600" }} numberOfLines={1}>
          {islandName}{" "}
          <Text style={{ color: colors.secondaryLabel, fontWeight: "400" }}>· {plural(pictures.length, "photo")}</Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add photos for ${islandName}`}
          onPress={add}
          disabled={!!uploading}
          hitSlop={8}
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, opacity: pressed ? 0.6 : 1 })}
        >
          {uploading ? (
            <>
              <ActivityIndicator size="small" />
              <Text style={{ color: colors.secondaryLabel, fontSize: 15, fontVariant: ["tabular-nums"] }}>
                {Math.min(uploading.done + 1, uploading.total)} of {uploading.total}
              </Text>
            </>
          ) : (
            <>
              <SymbolView name="photo.badge.plus" size={20} tintColor={colors.accent} />
              <Text style={{ color: colors.accent, fontSize: 16 }}>Add</Text>
            </>
          )}
        </Pressable>
      </View>

      {error && (
        <Text selectable style={{ color: colors.destructive, fontSize: 14, paddingHorizontal: 16 }}>
          {error}
        </Text>
      )}

      {pictures.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {pictures.map((p, index) => (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={p.caption ? `Photo: ${p.caption}` : `Photo ${index + 1}`}
              accessibilityHint="Shows options to caption, reorder or delete"
              onPress={() => openActions(p, index)}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Image
                source={p.imageUrl}
                contentFit="cover"
                recyclingKey={p.id}
                alt=""
                style={{ width: THUMB, height: THUMB, borderRadius: radius.photo / 1.5, backgroundColor: colors.fill }}
              />
              {p.caption && (
                <SymbolView
                  name="text.bubble.fill"
                  size={14}
                  tintColor="#fff"
                  style={{ position: "absolute", right: 6, bottom: 6 }}
                />
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
