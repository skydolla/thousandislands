import { requireOwner } from "@/lib/auth";
import { apiError, fromDbError, ok, parseBody } from "@/lib/api";
import { objectExists, publicUrlFor } from "@/lib/r2";
import { pictureCreateSchema } from "@/lib/validation";

/** Step 2 of a photo upload: records a file already uploaded to R2. Appends it after existing photos. */
export async function POST(request: Request) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;
  const body = await parseBody(request, pictureCreateSchema);
  if (body.error) return body.error;

  const p = body.data;
  if (!p.storageKey.startsWith(`photos/${p.tripIslandId}/`)) {
    return apiError("BAD_REQUEST", "storageKey does not belong to that island.");
  }
  if (!(await objectExists(p.storageKey))) {
    return apiError("BAD_REQUEST", "The photo has not been uploaded yet.");
  }

  const { data: last, error: lastError } = await auth.supabase
    .from("pictures")
    .select("sort_order")
    .eq("trip_island_id", p.tripIslandId)
    .order("sort_order", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (lastError) return fromDbError(lastError, "Failed to save photo.");

  const { data, error } = await auth.supabase
    .from("pictures")
    .insert({
      trip_island_id: p.tripIslandId,
      image_url: publicUrlFor(p.storageKey),
      storage_key: p.storageKey,
      width: p.width,
      height: p.height,
      caption: p.caption || null,
      taken_at: p.takenAt,
      sort_order: (last?.sort_order ?? 0) + 1,
    })
    .select("id, image_url, caption, taken_at, sort_order")
    .single();
  if (error) return fromDbError(error, "Failed to save photo.");
  return ok(
    {
      picture: {
        id: data.id,
        imageUrl: data.image_url,
        caption: data.caption,
        takenAt: data.taken_at,
        sortOrder: data.sort_order,
      },
    },
    201
  );
}
