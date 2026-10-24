import type { ProgressResponse } from "@/lib/types";
import { createPublicSupabase } from "@/lib/supabase/server";

const GOAL = 1000;

/** Returns the count of unique islands visited and the goal. */
export async function getProgress(): Promise<ProgressResponse> {
  const { data, error } = await createPublicSupabase().rpc("unique_islands_visited");
  if (error) throw error;
  return { uniqueIslandsVisited: data as number, goal: GOAL };
}
