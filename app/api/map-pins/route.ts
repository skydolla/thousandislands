import { getMapPins } from "@/lib/services/map-pins";
import { apiError, ok } from "@/lib/api";

export async function GET() {
  try {
    return ok({ pins: await getMapPins() });
  } catch (err) {
    console.error("Failed to load map pins", err);
    return apiError("INTERNAL_ERROR", "Failed to load map pins.");
  }
}
