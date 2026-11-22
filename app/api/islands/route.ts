import { requireOwner } from "@/lib/auth";
import { apiError, fromDbError, ok, parseBody } from "@/lib/api";
import { createPublicSupabase } from "@/lib/supabase/server";
import { islandInputSchema } from "@/lib/validation";
import type { Island, IslandSummary } from "@/lib/types";

export interface IslandRow {
  id: string;
  name: string;
  country: string;
  region_or_state: string | null;
  latitude: number;
  longitude: number;
  external_reference_id: string | null;
  notes: string | null;
  created_at: string;
}

export function toIsland(row: IslandRow): Island {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    regionOrState: row.region_or_state,
    latitude: row.latitude,
    longitude: row.longitude,
    externalReferenceId: row.external_reference_id,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

/** The unique index on (lower(name), country) turns into this message. */
export function duplicateIslandError(name: string, country: string) {
  return apiError("CONFLICT", `There's already an island called ${name} in ${country}.`);
}

/**
 * Lists islands by name with how many trips visited each, optionally filtered with ?q=
 * (matches name or country).
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim();
  let query = createPublicSupabase()
    .from("islands")
    .select("*, trip_islands(count)")
    .order("name")
    .limit(q ? 20 : 5000);
  if (q) {
    // Escape PostgREST filter syntax characters and LIKE wildcards in the search term.
    const term = q.replace(/[%_\\]/g, "\\$&").replace(/[,()]/g, " ");
    query = query.or(`name.ilike.%${term}%,country.ilike.%${term}%`);
  }
  const { data, error } = await query.returns<(IslandRow & { trip_islands: { count: number }[] })[]>();
  if (error) return fromDbError(error, "Failed to load islands.");
  const islands: IslandSummary[] = data.map((row) => ({
    ...toIsland(row),
    tripCount: row.trip_islands[0]?.count ?? 0,
  }));
  return ok({ islands });
}

export async function POST(request: Request) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;
  const body = await parseBody(request, islandInputSchema);
  if (body.error) return body.error;

  const i = body.data;
  const { data, error } = await auth.supabase
    .from("islands")
    .insert({
      name: i.name,
      country: i.country,
      region_or_state: i.regionOrState || null,
      latitude: i.latitude,
      longitude: i.longitude,
      notes: i.notes || null,
    })
    .select("*")
    .single<IslandRow>();
  if (error?.code === "23505") return duplicateIslandError(i.name, i.country);
  if (error) return fromDbError(error, "Failed to create island.");
  return ok({ island: toIsland(data) }, 201);
}
