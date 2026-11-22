import { requireOwner } from "@/lib/auth";
import { apiError, fromDbError, ok, parseBody } from "@/lib/api";
import { islandMergeSchema } from "@/lib/validation";
import { toIsland, type IslandRow } from "../../route";

type Params = { params: Promise<{ islandId: string }> };

/**
 * Merges a duplicate island into this one: the duplicate's trips and photos move here, then the
 * duplicate is deleted. A trip that visited both keeps a single stop with all of their photos.
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;
  const body = await parseBody(request, islandMergeSchema);
  if (body.error) return body.error;

  const { islandId } = await params;
  const { error } = await auth.supabase.rpc("merge_islands", {
    p_keep_id: islandId,
    p_duplicate_id: body.data.duplicateId,
  });
  if (error?.code === "22023") return apiError("BAD_REQUEST", "Pick a different island to merge.");
  if (error?.code === "P0002") return apiError("NOT_FOUND", "One of those islands no longer exists.");
  if (error) return fromDbError(error, "Failed to merge islands.");

  const { data, error: readError } = await auth.supabase
    .from("islands")
    .select("*")
    .eq("id", islandId)
    .single<IslandRow>();
  if (readError) return fromDbError(readError, "Merged, but failed to reload the island.");
  return ok({ island: toIsland(data) });
}
