import { requireOwner } from "@/lib/auth";
import { apiError, fromDbError, ok, parseBody } from "@/lib/api";
import { createPublicSupabase } from "@/lib/supabase/server";
import { islandInputSchema } from "@/lib/validation";
import type { IslandDetailResponse } from "@/lib/types";
import { duplicateIslandError, toIsland, type IslandRow } from "../route";

type Params = { params: Promise<{ islandId: string }> };

interface IslandDetailRow extends IslandRow {
  trip_islands: { trip: { id: string; name: string; start_date: string; end_date: string } }[];
}

/** One island and the trips that visited it. */
export async function GET(_request: Request, { params }: Params) {
  const { islandId } = await params;
  const { data, error } = await createPublicSupabase()
    .from("islands")
    .select("*, trip_islands(trip:trips(id, name, start_date, end_date))")
    .eq("id", islandId)
    .maybeSingle<IslandDetailRow>();
  if (error) return fromDbError(error, "Failed to load island.");
  if (!data) return apiError("NOT_FOUND", "Island not found.");

  const body: IslandDetailResponse = {
    island: toIsland(data),
    trips: data.trip_islands
      .map(({ trip }) => ({ id: trip.id, name: trip.name, startDate: trip.start_date, endDate: trip.end_date }))
      .sort((a, b) => b.startDate.localeCompare(a.startDate)),
  };
  return ok(body);
}

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;
  const body = await parseBody(request, islandInputSchema);
  if (body.error) return body.error;

  const { islandId } = await params;
  const i = body.data;
  const { data, error } = await auth.supabase
    .from("islands")
    .update({
      name: i.name,
      country: i.country,
      region_or_state: i.regionOrState || null,
      latitude: i.latitude,
      longitude: i.longitude,
      ...(i.notes !== undefined && { notes: i.notes || null }),
    })
    .eq("id", islandId)
    .select("*")
    .maybeSingle<IslandRow>();
  if (error?.code === "23505") return duplicateIslandError(i.name, i.country);
  if (error) return fromDbError(error, "Failed to update island.");
  if (!data) return apiError("NOT_FOUND", "Island not found.");
  return ok({ island: toIsland(data) });
}

/** Deletes an island that no trip uses. */
export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  const { islandId } = await params;
  const { data, error } = await auth.supabase
    .from("islands")
    .delete()
    .eq("id", islandId)
    .select("id");
  if (error?.code === "23503") {
    return apiError("CONFLICT", "This island is part of a trip. Remove it from its trips, or merge it into another island.");
  }
  if (error) return fromDbError(error, "Failed to delete island.");
  if (!data.length) return apiError("NOT_FOUND", "Island not found.");
  return ok({ id: islandId });
}
