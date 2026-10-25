import { Pressable, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, radius } from "@/lib/theme";

/** A selectable pill, used to switch between trips and islands. */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        if (selected) return;
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => ({
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: radius.chip,
        backgroundColor: selected ? colors.accentDim : colors.fill,
        borderWidth: 1,
        borderColor: selected ? "rgba(34, 211, 238, 0.45)" : "transparent",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: selected ? colors.accent : colors.secondaryLabel, fontSize: 14, fontWeight: "500" }}>
        {label}
      </Text>
    </Pressable>
  );
}
