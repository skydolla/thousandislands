import { requireOwner } from "@/lib/auth";
import { apiError, fromDbError, ok, parseBody } from "@/lib/api";
import { deleteObjects } from "@/lib/r2";
import { pictureUpdateSchema } from "@/lib/validation";

type Params = { params: Promise<{ pictureId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;
  const body = await parseBody(request, pictureUpdateSchema);
  if (body.error) return body.error;

  const { pictureId } = await params;
  const { data, error } = await auth.supabase
    .from("pictures")
    .update({ caption: body.data.caption || null })
    .eq("id", pictureId)
    .select("id");
  if (error) return fromDbError(error, "Failed to update photo.");
  if (!data.length) return apiError("NOT_FOUND", "Photo not found.");
  return ok({ id: pictureId });
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  const { pictureId } = await params;
  const { data, error } = await auth.supabase
    .from("pictures")
    .delete()
    .eq("id", pictureId)
    .select("storage_key");
  if (error) return fromDbError(error, "Failed to delete photo.");
  if (!data.length) return apiError("NOT_FOUND", "Photo not found.");

  await deleteObjects(data.map((p) => p.storage_key));
  return ok({ id: pictureId });
}
