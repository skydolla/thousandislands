import type { ApiError } from "@shared/types";
import { API_URL } from "./config";
import { supabase } from "./supabase";

/**
 * fetch() for the web app's JSON API. Sends the signed-in user's access token, and throws an Error
 * carrying the API's message on failure.
 */
export async function apiFetch<T>(
  path: string,
  init?: { method?: string; json?: unknown; signal?: AbortSignal }
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (session) headers.authorization = `Bearer ${session.access_token}`;
  if (init?.json !== undefined) headers["content-type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: init?.method ?? "GET",
      headers,
      body: init?.json === undefined ? undefined : JSON.stringify(init.json),
      signal: init?.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((body as ApiError | null)?.error?.message ?? `Request failed (${res.status})`);
  }
  return body as T;
}
