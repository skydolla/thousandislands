import { getProgress } from "@/lib/services/progress";
import { apiError, ok } from "@/lib/api";

export async function GET() {
  try {
    return ok(await getProgress());
  } catch (err) {
    console.error("Failed to load progress", err);
    return apiError("INTERNAL_ERROR", "Failed to load progress.");
  }
}
