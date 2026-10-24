import { getTripDetail } from "@/lib/services/trips";
import { requireOwner } from "@/lib/auth";
import { apiError, fromDbError, ok, parseBody } from "@/lib/api";
import { deleteObjects } from "@/lib/r2";
import { tripInputSchema } from "@/lib/validation";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tripId } = await params;
    const result = await getTripDetail(tripId);
    if (!result) return apiError("NOT_FOUND", "Trip not found.");
    return ok(result);
  } catch (err) {
    console.error("Failed to load trip details", err);
    return apiError("INTERNAL_ERROR", "Failed to load trip details.");
  }
}

/**
 * Replaces a trip's details, attendees and ordered islands. Removing an island from the trip deletes
 * that island's photos for this trip.
 */
export async function PUT(request: Request, { params }: Params) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;
  const body = await parseBody(request, tripInputSchema);
  if (body.error) return body.error;

  const { tripId } = await params;
  const t = body.data;
  const { data, error } = await auth.supabase
    .rpc("save_trip", {
      p_trip_id: tripId,
      p_name: t.name,
      p_description: t.description,
      p_start_date: t.startDate,
      p_end_date: t.endDate,
      p_attendee_names: t.attendeeNames,
      p_island_ids: t.islandIds,
    })
    .single<{ trip_id: string; removed_storage_keys: string[] }>();
  if (error) return fromDbError(error, "Failed to save trip.");

  await deleteObjects(data?.removed_storage_keys ?? []);
  return ok({ id: tripId });
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  const { tripId } = await params;
  const { data, error } = await auth.supabase.rpc("delete_trip", { p_trip_id: tripId });
  if (error) return fromDbError(error, "Failed to delete trip.");

  await deleteObjects((data as string[] | null) ?? []);
  return ok({ id: tripId });
}
