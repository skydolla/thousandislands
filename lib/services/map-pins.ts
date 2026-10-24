import type { MapPin } from "@/lib/types";
import { createPublicSupabase } from "@/lib/supabase/server";

export interface MapPinRow {
  island: {
    id: string;
    name: string;
    country: string;
    region_or_state: string | null;
    latitude: number;
    longitude: number;
  };
  trip: { id: string; name: string; start_date: string };
}

/** Groups trip_island rows into one pin per island, listing its trips most recent first. */
export function buildMapPins(rows: MapPinRow[]): MapPin[] {
  const pinsByIsland = new Map<string, MapPin>();

  for (const { island, trip } of rows) {
    let pin = pinsByIsland.get(island.id);
    if (!pin) {
      pin = {
        islandId: island.id,
        islandName: island.name,
        country: island.country,
        regionOrState: island.region_or_state,
        latitude: island.latitude,
        longitude: island.longitude,
        trips: [],
      };
      pinsByIsland.set(island.id, pin);
    }
    pin.trips.push({ tripId: trip.id, tripName: trip.name, startDate: trip.start_date });
  }

  const pins = [...pinsByIsland.values()];
  for (const pin of pins) {
    pin.trips.sort((a, b) => b.startDate.localeCompare(a.startDate));
  }
  return pins;
}

/** Returns one pin per visited island with the minimal data needed to render the map. */
export async function getMapPins(): Promise<MapPin[]> {
  const { data, error } = await createPublicSupabase()
    .from("trip_islands")
    .select(
      "island:islands!inner(id, name, country, region_or_state, latitude, longitude), trip:trips!inner(id, name, start_date)"
    )
    .returns<MapPinRow[]>();
  if (error) throw error;
  return buildMapPins(data);
}
