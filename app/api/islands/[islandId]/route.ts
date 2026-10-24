import { requireOwner } from "@/lib/auth";
import { apiError, fromDbError, ok, parseBody } from "@/lib/api";
import { islandInputSchema } from "@/lib/validation";
import { toIsland, type IslandRow } from "../route";

type Params = { params: Promise<{ islandId: string }> };

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
      notes: i.notes || null,
    })
    .eq("id", islandId)
    .select("*")
    .maybeSingle<IslandRow>();
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
    return apiError("CONFLICT", "This island is part of a trip. Remove it from its trips first.");
  }
  if (error) return fromDbError(error, "Failed to delete island.");
  if (!data.length) return apiError("NOT_FOUND", "Island not found.");
  return ok({ id: islandId });
}
