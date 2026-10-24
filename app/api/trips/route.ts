import { requireOwner } from "@/lib/auth";
import { apiError, fromDbError, ok, parseBody } from "@/lib/api";
import { createPublicSupabase } from "@/lib/supabase/server";
import { tripInputSchema } from "@/lib/validation";
import type { TripSummary } from "@/lib/types";

/** Lists all trips, most recent first. */
export async function GET() {
  const { data, error } = await createPublicSupabase()
    .from("trips")
    .select("id, name, start_date, end_date, trip_islands(count)")
    .order("start_date", { ascending: false });
  if (error) return fromDbError(error, "Failed to load trips.");

  const trips: TripSummary[] = data.map((t) => ({
    id: t.id,
    name: t.name,
    startDate: t.start_date,
    endDate: t.end_date,
    islandCount: (t.trip_islands as unknown as { count: number }[])[0]?.count ?? 0,
  }));
  return ok({ trips });
}

/** Creates a trip with its attendees and ordered islands. */
export async function POST(request: Request) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;
  const body = await parseBody(request, tripInputSchema);
  if (body.error) return body.error;

  const t = body.data;
  const { data, error } = await auth.supabase
    .rpc("save_trip", {
      p_trip_id: null,
      p_name: t.name,
      p_description: t.description,
      p_start_date: t.startDate,
      p_end_date: t.endDate,
      p_attendee_names: t.attendeeNames,
      p_island_ids: t.islandIds,
    })
    .single<{ trip_id: string }>();
  if (error) return fromDbError(error, "Failed to create trip.");
  if (!data) return apiError("INTERNAL_ERROR", "Failed to create trip.");
  return ok({ id: data.trip_id }, 201);
}
