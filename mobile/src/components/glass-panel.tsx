import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";

const glass = isLiquidGlassAvailable();

/** A floating panel over the map: Liquid Glass on iOS 26+, a translucent dark panel before that. */
export function GlassPanel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const shape: ViewStyle = { borderRadius: 16, borderCurve: "continuous", overflow: "hidden" };
  if (glass) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme="dark" style={[shape, style]}>
        {children}
      </GlassView>
    );
  }
  return (
    <View
      style={[
        shape,
        {
          backgroundColor: "rgba(24, 24, 27, 0.92)",
          borderWidth: 1,
          borderColor: "rgba(63, 63, 70, 0.5)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
