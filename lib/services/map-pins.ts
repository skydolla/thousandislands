import type { MapPin } from "@/lib/types";
import { trips, islands, tripIslands } from "@/lib/data/seed";

/**
 * Returns one pin per visited island, listing every trip that visited it.
 *
 * In a production system this would be a SQL query joining trip_islands → trips → islands,
 * grouped by island with the trips aggregated, selecting only the columns needed for rendering.
 */
export function getMapPins(): MapPin[] {
  const pinsByIsland = new Map<string, MapPin>();

  for (const ti of tripIslands) {
    const trip = trips.find((t) => t.id === ti.tripId)!;
    const island = islands.find((i) => i.id === ti.islandId)!;

    let pin = pinsByIsland.get(island.id);
    if (!pin) {
      pin = {
        islandId: island.id,
        islandName: island.name,
        country: island.country,
        regionOrState: island.regionOrState,
        latitude: island.latitude,
        longitude: island.longitude,
        trips: [],
      };
      pinsByIsland.set(island.id, pin);
    }
    pin.trips.push({ tripId: trip.id, tripName: trip.name, startDate: trip.startDate });
  }

  const pins = [...pinsByIsland.values()];
  for (const pin of pins) {
    pin.trips.sort((a, b) => b.startDate.localeCompare(a.startDate));
  }
  return pins;
}
