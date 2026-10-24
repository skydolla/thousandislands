import { createPublicSupabase } from "@/lib/supabase/server";
import { apiError, ok } from "@/lib/api";

/**
 * Runs one cheap database query. Vercel Cron calls this daily (vercel.json) because Supabase's free
 * plan pauses a project after a week without activity.
 */
export async function GET() {
  const { error } = await createPublicSupabase().rpc("unique_islands_visited");
  if (error) {
    console.error("Health check failed", error);
    return apiError("INTERNAL_ERROR", "Database unreachable.");
  }
  return ok({ status: "ok" });
}
