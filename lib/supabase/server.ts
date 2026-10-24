import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublishableKey, supabaseUrl } from "./env";

/** Anonymous client for public reads. No session, so Row Level Security allows reads only. */
export function createPublicSupabase(): SupabaseClient {
  return createClient(supabaseUrl(), supabasePublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client acting as the signed-in web user, via the session cookies. */
export async function createCookieSupabase(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only; proxy.ts refreshes the session.
        }
      },
    },
  });
}

/**
 * Client acting as whoever made the request: the iOS app sends `Authorization: Bearer <access token>`,
 * the web app sends session cookies.
 */
export async function createRequestSupabase(request: Request): Promise<SupabaseClient> {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    return createClient(supabaseUrl(), supabasePublishableKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: authorization } },
    });
  }
  return createCookieSupabase();
}
