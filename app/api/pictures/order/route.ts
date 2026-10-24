import { requireOwner } from "@/lib/auth";
import { apiError, fromDbError, ok, parseBody } from "@/lib/api";
import { pictureOrderSchema } from "@/lib/validation";

/** Sets the photo order for one trip island. pictureIds must list every photo of that island. */
export async function PUT(request: Request) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;
  const body = await parseBody(request, pictureOrderSchema);
  if (body.error) return body.error;

  const { tripIslandId, pictureIds } = body.data;
  const { data: existing, error } = await auth.supabase
    .from("pictures")
    .select("id")
    .eq("trip_island_id", tripIslandId);
  if (error) return fromDbError(error, "Failed to reorder photos.");

  const existingIds = new Set(existing.map((p) => p.id));
  if (existingIds.size !== pictureIds.length || !pictureIds.every((id) => existingIds.has(id))) {
    return apiError("BAD_REQUEST", "pictureIds must list every photo of the island exactly once.");
  }

  for (const [index, id] of pictureIds.entries()) {
    const { error: updateError } = await auth.supabase
      .from("pictures")
      .update({ sort_order: index + 1 })
      .eq("id", id);
    if (updateError) return fromDbError(updateError, "Failed to reorder photos.");
  }
  return ok({ tripIslandId });
}
