import { useState } from "react";
import { ScrollView } from "react-native";
import { router, Stack } from "expo-router";
import { ErrorText, Field, PrimaryButton, Section } from "@/components/form";
import { HeaderButton } from "@/components/header-button";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message);
      return;
    }
    router.replace("/manage");
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={{ backgroundColor: colors.groupedBackground }}
      contentContainerStyle={{ padding: 16, gap: 20 }}
    >
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderButton label="Cancel" onPress={() => router.back()} />,
        }}
      />
      <Section footer="Only the owner can sign in. Everyone else can browse the map without an account.">
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          returnKeyType="next"
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={signIn}
          placeholder="Required"
        />
      </Section>
      <ErrorText>{error}</ErrorText>
      <PrimaryButton label="Sign in" onPress={signIn} busy={busy} disabled={!email.trim() || !password} />
    </ScrollView>
  );
}
