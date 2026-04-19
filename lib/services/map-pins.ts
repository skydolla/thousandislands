import type { MapPin } from "@/lib/types";
import { trips, islands, tripIslands } from "@/lib/data/seed";

/**
 * Returns the minimal data required to render island pins on the map.
 *
 * In a production system this would be a SQL query joining trip_islands → trips → islands
 * and selecting only the columns needed for rendering.
 */
export function getMapPins(): MapPin[] {
  return tripIslands.map((ti) => {
    const trip = trips.find((t) => t.id === ti.tripId)!;
    const island = islands.find((i) => i.id === ti.islandId)!;
    return {
      tripId: trip.id,
      tripName: trip.name,
      islandId: island.id,
      islandName: island.name,
      country: island.country,
      regionOrState: island.regionOrState,
      latitude: island.latitude,
      longitude: island.longitude,
    };
  });
}
