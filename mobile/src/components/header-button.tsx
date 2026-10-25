import { Pressable, Text } from "react-native";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { colors } from "@/lib/theme";

/** A navigation-bar button: a text label, or an SF Symbol with an accessibility label. */
export function HeaderButton({
  label,
  symbol,
  onPress,
  disabled,
  bold,
}: {
  label: string;
  symbol?: SymbolViewProps["name"];
  onPress: () => void;
  disabled?: boolean;
  bold?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={10}
      style={({ pressed }) => ({ opacity: disabled ? 0.35 : pressed ? 0.6 : 1, paddingHorizontal: 4 })}
    >
      {symbol ? (
        <SymbolView name={symbol} size={22} tintColor={colors.accent} />
      ) : (
        <Text style={{ color: colors.accent, fontSize: 17, fontWeight: bold ? "600" : "400" }}>{label}</Text>
      )}
    </Pressable>
  );
}
