// Public settings, read from mobile/.env at build time.
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`${name} is not set. Add it to mobile/.env.`);
  return value.replace(/\/$/, "");
}

export const API_URL = required("EXPO_PUBLIC_API_URL", process.env.EXPO_PUBLIC_API_URL);
export const SUPABASE_URL = required("EXPO_PUBLIC_SUPABASE_URL", process.env.EXPO_PUBLIC_SUPABASE_URL);
export const SUPABASE_PUBLISHABLE_KEY = required(
  "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export const GOAL = 1000;
