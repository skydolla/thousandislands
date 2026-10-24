import { Redirect, Stack } from "expo-router";
import { useSession } from "@/hooks/use-session";
import { colors } from "@/lib/theme";

export default function ManageLayout() {
  const { session } = useSession();
  if (!session) return <Redirect href="/login" />;

  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: "minimal",
        headerTintColor: colors.accent,
        contentStyle: { backgroundColor: colors.groupedBackground },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Your trips", headerLargeTitleEnabled: true }} />
      <Stack.Screen name="[tripId]" options={{ title: "Trip" }} />
      <Stack.Screen name="new-island" options={{ presentation: "modal", title: "New island" }} />
    </Stack>
  );
}
