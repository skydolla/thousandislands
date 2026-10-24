import { Children, isValidElement, type ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radius } from "@/lib/theme";

/** An iOS grouped-table section: optional header and footer around rounded, separated rows. */
export function Section({ title, footer, children }: { title?: string; footer?: ReactNode; children: ReactNode }) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={{ gap: 6 }}>
      {title && (
        <Text style={{ color: colors.secondaryLabel, fontSize: 13, paddingHorizontal: 16 }}>{title.toUpperCase()}</Text>
      )}
      {rows.length > 0 && (
        <View style={{ backgroundColor: colors.cell, borderRadius: radius.card, borderCurve: "continuous", overflow: "hidden" }}>
          {rows.map((row, i) => (
            <View key={row.key ?? i}>
              {i > 0 && <View style={{ height: 0.5, marginLeft: 16, backgroundColor: colors.separator }} />}
              {row}
            </View>
          ))}
        </View>
      )}
      {footer && (
        <View style={{ paddingHorizontal: 16 }}>
          {typeof footer === "string" ? (
            <Text style={{ color: colors.secondaryLabel, fontSize: 13 }}>{footer}</Text>
          ) : (
            footer
          )}
        </View>
      )}
    </View>
  );
}

/** A text field row with its label on the left, like the Settings app. */
export function Field({ label, multiline, ...props }: TextInputProps & { label: string }) {
  return (
    <View
      style={{
        flexDirection: multiline ? "column" : "row",
        alignItems: multiline ? "stretch" : "center",
        paddingHorizontal: 16,
        paddingVertical: multiline ? 12 : 0,
        minHeight: 48,
        gap: multiline ? 6 : 12,
      }}
    >
      <Text style={{ color: colors.label, fontSize: 16, width: multiline ? undefined : 96 }}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.tertiaryLabel as string}
        selectionColor={colors.accent}
        multiline={multiline}
        {...props}
        style={[
          { flex: multiline ? undefined : 1, color: colors.label, fontSize: 16, paddingVertical: multiline ? 0 : 12 },
          multiline && { minHeight: 88, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}

/** A tappable row, e.g. "Add island" or a destructive action. */
export function ActionRow({
  label,
  onPress,
  destructive,
  disabled,
  busy,
}: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: pressed ? colors.fill : undefined,
        opacity: disabled ? 0.4 : 1,
      })}
    >
      <Text style={{ color: destructive ? colors.destructive : colors.accent, fontSize: 16 }}>{label}</Text>
      {busy && <ActivityIndicator size="small" />}
    </Pressable>
  );
}

/** A full-width filled button. */
export function PrimaryButton({ label, onPress, busy, disabled }: { label: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => ({
        height: 50,
        borderRadius: radius.card,
        borderCurve: "continuous",
        backgroundColor: colors.accent,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
      })}
    >
      {busy ? (
        <ActivityIndicator color={colors.onAccent} />
      ) : (
        <Text style={{ color: colors.onAccent, fontSize: 17, fontWeight: "600" }}>{label}</Text>
      )}
    </Pressable>
  );
}

export function ErrorText({ children }: { children: string | null }) {
  if (!children) return null;
  return (
    <Text selectable accessibilityRole="alert" style={{ color: colors.destructive, fontSize: 14, paddingHorizontal: 16 }}>
      {children}
    </Text>
  );
}
