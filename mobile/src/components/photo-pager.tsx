import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Image } from "expo-image";
import type { TripDetailIslandPicture } from "@shared/types";
import { colors, radius } from "@/lib/theme";

/** Swipeable photos for one island, with the caption and position under each. */
export function PhotoPager({ pictures }: { pictures: TripDetailIslandPicture[] }) {
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  if (pictures.length === 0) {
    return (
      <View
        style={{
          aspectRatio: 4 / 3,
          borderRadius: radius.photo,
          borderCurve: "continuous",
          backgroundColor: colors.fill,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.tertiaryLabel, fontSize: 14 }}>No photos for this island yet</Text>
      </View>
    );
  }

  const current = pictures[Math.min(index, pictures.length - 1)];
  return (
    <View style={{ gap: 10 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <FlatList
          data={pictures}
          keyExtractor={(p) => p.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          renderItem={({ item }) => (
            <Image
              source={item.imageUrl}
              alt={item.caption ?? "Trip photo"}
              contentFit="contain"
              transition={200}
              style={{
                width,
                aspectRatio: 4 / 3,
                borderRadius: radius.photo,
                backgroundColor: "#000",
              }}
            />
          )}
        />
      )}
      <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
        <Text selectable style={{ flex: 1, color: colors.secondaryLabel, fontSize: 14 }}>
          {current.caption ?? ""}
        </Text>
        {pictures.length > 1 && (
          <Text style={{ color: colors.tertiaryLabel, fontSize: 13, fontVariant: ["tabular-nums"] }}>
            {Math.min(index, pictures.length - 1) + 1} / {pictures.length}
          </Text>
        )}
      </View>
    </View>
  );
}
