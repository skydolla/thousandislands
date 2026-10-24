import { Color } from "expo-router";

// The app is dark-only (see app.json), matching the web app. Semantic iOS colors keep contrast and
// accessibility settings right; the cyan accent matches the web app's.
export const colors = {
  accent: "#22d3ee",
  accentDim: "rgba(34, 211, 238, 0.18)",
  onAccent: "#09090b",
  label: Color.ios.label,
  secondaryLabel: Color.ios.secondaryLabel,
  tertiaryLabel: Color.ios.tertiaryLabel,
  separator: Color.ios.separator,
  background: Color.ios.systemBackground,
  groupedBackground: Color.ios.systemGroupedBackground,
  cell: Color.ios.secondarySystemGroupedBackground,
  fill: Color.ios.tertiarySystemFill,
  destructive: Color.ios.systemRed,
  warning: Color.ios.systemOrange,
};

export const radius = { card: 12, chip: 999, photo: 12 };
