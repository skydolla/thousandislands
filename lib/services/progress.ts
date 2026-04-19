import type { ProgressResponse } from "@/lib/types";
import { tripIslands } from "@/lib/data/seed";

const GOAL = 1000;

/**
 * Returns the count of unique islands visited and the goal.
 *
 * In production: SELECT COUNT(DISTINCT island_id) AS unique_islands_visited FROM trip_islands;
 */
export function getProgress(): ProgressResponse {
  const uniqueIslandIds = new Set(tripIslands.map((ti) => ti.islandId));
  return {
    uniqueIslandsVisited: uniqueIslandIds.size,
    goal: GOAL,
  };
}
