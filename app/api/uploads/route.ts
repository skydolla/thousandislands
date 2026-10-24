import { randomUUID } from "node:crypto";
import { requireOwner } from "@/lib/auth";
import { apiError, fromDbError, ok, parseBody } from "@/lib/api";
import { presignUpload, publicUrlFor } from "@/lib/r2";
import { uploadRequestSchema } from "@/lib/validation";

const EXTENSION = { "image/jpeg": "jpg", "image/webp": "webp", "image/png": "png" } as const;

/**
 * Step 1 of a photo upload: returns a short-lived URL the client PUTs the (already resized) file to.
 * Step 2 is POST /api/pictures with the returned storageKey.
 */
export async function POST(request: Request) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;
  const body = await parseBody(request, uploadRequestSchema);
  if (body.error) return body.error;

  const { tripIslandId, contentType, size } = body.data;
  const { data: tripIsland, error } = await auth.supabase
    .from("trip_islands")
    .select("id")
    .eq("id", tripIslandId)
    .maybeSingle();
  if (error) return fromDbError(error, "Failed to prepare upload.");
  if (!tripIsland) return apiError("NOT_FOUND", "That island is not part of a trip.");

  const storageKey = `photos/${tripIslandId}/${randomUUID()}.${EXTENSION[contentType]}`;
  try {
    const uploadUrl = await presignUpload(storageKey, contentType, size);
    return ok({ uploadUrl, storageKey, publicUrl: publicUrlFor(storageKey) });
  } catch (err) {
    console.error("Failed to presign upload", err);
    return apiError("INTERNAL_ERROR", "Failed to prepare upload.");
  }
}
