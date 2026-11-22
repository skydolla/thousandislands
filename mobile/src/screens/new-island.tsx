import { ScrollView } from "react-native";
import { router } from "expo-router";
import { IslandForm } from "@/components/island-form";
import { handOffIsland } from "@/lib/island-handoff";
import { colors } from "@/lib/theme";

/** Adds a new island from the trip editor, then hands it back to the trip. */
export function NewIslandScreen({ initialName }: { initialName: string }) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      style={{ backgroundColor: colors.groupedBackground }}
      contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 48 }}
    >
      <IslandForm
        initialName={initialName}
        onCancel={() => router.back()}
        onSaved={(island) => {
          handOffIsland(island);
          router.back();
        }}
      />
    </ScrollView>
  );
}
