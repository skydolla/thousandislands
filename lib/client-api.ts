import type { ApiError } from "@/lib/types";

/** fetch() for this app's JSON API: throws an Error carrying the API's message on failure. */
export async function apiFetch<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(path, {
    ...rest,
    headers: json === undefined ? rest.headers : { "content-type": "application/json", ...rest.headers },
    body: json === undefined ? rest.body : JSON.stringify(json),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((body as ApiError | null)?.error?.message ?? `Request failed (${res.status})`);
  }
  return body as T;
}
