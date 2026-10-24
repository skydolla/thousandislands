import type { TripDetailResponse } from "@/lib/types";
import { createPublicSupabase } from "@/lib/supabase/server";

export interface TripDetailRow {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  trip_attendees: { attendee: { id: string; name: string } }[];
  trip_islands: {
    id: string;
    sequence_number: number | null;
    island: {
      id: string;
      name: string;
      country: string;
      region_or_state: string | null;
      latitude: number;
      longitude: number;
    };
    pictures: {
      id: string;
      image_url: string;
      caption: string | null;
      taken_at: string | null;
      sort_order: number | null;
      created_at: string;
    }[];
  }[];
}

const TRIP_DETAIL_SELECT = `
  id, name, description, start_date, end_date,
  trip_attendees(attendee:attendees!inner(id, name)),
  trip_islands(
    id, sequence_number,
    island:islands!inner(id, name, country, region_or_state, latitude, longitude),
    pictures(id, image_url, caption, taken_at, sort_order, created_at)
  )`;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Shapes a trip row for the modal: islands ordered by sequence number (nulls last) then name,
 * pictures by sort order (nulls last) then creation time.
 */
export function buildTripDetail(row: TripDetailRow): TripDetailResponse {
  const islandDetails = [...row.trip_islands]
    .sort((a, b) => {
      const seqA = a.sequence_number ?? Number.MAX_SAFE_INTEGER;
      const seqB = b.sequence_number ?? Number.MAX_SAFE_INTEGER;
      if (seqA !== seqB) return seqA - seqB;
      return a.island.name.localeCompare(b.island.name);
    })
    .map((ti) => ({
      tripIslandId: ti.id,
      sequenceNumber: ti.sequence_number,
      island: {
        id: ti.island.id,
        name: ti.island.name,
        country: ti.island.country,
        regionOrState: ti.island.region_or_state,
        latitude: ti.island.latitude,
        longitude: ti.island.longitude,
      },
      pictures: [...ti.pictures]
        .sort((a, b) => {
          const orderA = a.sort_order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.sort_order ?? Number.MAX_SAFE_INTEGER;
          if (orderA !== orderB) return orderA - orderB;
          return a.created_at.localeCompare(b.created_at);
        })
        .map((p) => ({
          id: p.id,
          imageUrl: p.image_url,
          caption: p.caption,
          takenAt: p.taken_at,
          sortOrder: p.sort_order,
        })),
    }));

  // Derive country: if all islands share the same country, return it; otherwise null
  const countries = new Set(islandDetails.map((d) => d.island.country));
  const country = countries.size === 1 ? [...countries][0] : null;

  const regions = new Set(
    islandDetails.map((d) => d.island.regionOrState).filter(Boolean)
  );
  const regionOrState = regions.size === 1 ? [...regions][0]! : null;

  return {
    trip: {
      id: row.id,
      name: row.name,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      islandCount: islandDetails.length,
      country,
      regionOrState,
      attendees: row.trip_attendees.map((ta) => ({
        id: ta.attendee.id,
        name: ta.attendee.name,
      })),
      islands: islandDetails,
    },
  };
}

/** Returns full trip detail for the modal, or null if there is no such trip. */
export async function getTripDetail(tripId: string): Promise<TripDetailResponse | null> {
  if (!UUID.test(tripId)) return null;
  const { data, error } = await createPublicSupabase()
    .from("trips")
    .select(TRIP_DETAIL_SELECT)
    .eq("id", tripId)
    .returns<TripDetailRow[]>()
    .maybeSingle();
  if (error) throw error;
  return data ? buildTripDetail(data) : null;
}
