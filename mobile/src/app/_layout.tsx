import { useEffect } from "react";
import { AppState } from "react-native";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider, focusManager } from "@tanstack/react-query";
import { SessionProvider, useSession } from "@/hooks/use-session";
import { colors } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

// Refetch stale data when the app returns to the foreground, like a browser tab regaining focus.
AppState.addEventListener("change", (state) => focusManager.setFocused(state === "active"));

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: colors.accent, background: "#09090b" },
};

function RootStack() {
  const { ready } = useSession();
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  // Wait for the saved session, so the first screen never flashes the signed-out state.
  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
      <Stack.Screen name="index" options={{ headerShown: false, title: "Map" }} />
      <Stack.Screen
        name="island/[islandId]"
        options={{
          presentation: "formSheet",
          headerShown: false,
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.6, 1],
          sheetCornerRadius: 24,
        }}
      />
      <Stack.Screen name="login" options={{ presentation: "modal", title: "Sign in" }} />
      <Stack.Screen name="manage" options={{ presentation: "modal", headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider value={theme}>
          <RootStack />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
