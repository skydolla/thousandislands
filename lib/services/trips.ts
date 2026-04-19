import type { TripDetailResponse } from "@/lib/types";
import {
  trips,
  islands,
  tripIslands,
  tripAttendees,
  attendees,
  pictures,
} from "@/lib/data/seed";

/**
 * Returns full trip detail for the modal, shaped for direct UI consumption.
 *
 * In production this would be a small number of SQL queries:
 * - trip row
 * - trip attendees
 * - trip islands ordered by sequence_number nulls last, island name
 * - pictures grouped by trip_island_id ordered by sort_order nulls last, created_at
 */
export function getTripDetail(tripId: string): TripDetailResponse | null {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return null;

  const tis = tripIslands
    .filter((ti) => ti.tripId === tripId)
    .sort((a, b) => {
      const seqA = a.sequenceNumber ?? Number.MAX_SAFE_INTEGER;
      const seqB = b.sequenceNumber ?? Number.MAX_SAFE_INTEGER;
      if (seqA !== seqB) return seqA - seqB;
      const nameA = islands.find((i) => i.id === a.islandId)?.name ?? "";
      const nameB = islands.find((i) => i.id === b.islandId)?.name ?? "";
      return nameA.localeCompare(nameB);
    });

  const tripAttendeeList = tripAttendees
    .filter((ta) => ta.tripId === tripId)
    .map((ta) => {
      const att = attendees.find((a) => a.id === ta.attendeeId)!;
      return { id: att.id, name: att.name };
    });

  const islandDetails = tis.map((ti) => {
    const island = islands.find((i) => i.id === ti.islandId)!;
    const pics = pictures
      .filter((p) => p.tripIslandId === ti.id)
      .sort((a, b) => {
        const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
        if (orderA !== orderB) return orderA - orderB;
        return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
      })
      .map((p) => ({
        id: p.id,
        imageUrl: p.imageUrl,
        caption: p.caption,
        takenAt: p.takenAt,
        sortOrder: p.sortOrder,
      }));

    return {
      tripIslandId: ti.id,
      sequenceNumber: ti.sequenceNumber,
      island: {
        id: island.id,
        name: island.name,
        country: island.country,
        regionOrState: island.regionOrState,
        latitude: island.latitude,
        longitude: island.longitude,
      },
      pictures: pics,
    };
  });

  // Derive country: if all islands share the same country, return it; otherwise null
  const countries = new Set(islandDetails.map((d) => d.island.country));
  const country = countries.size === 1 ? [...countries][0] : null;

  const regions = new Set(
    islandDetails.map((d) => d.island.regionOrState).filter(Boolean)
  );
  const regionOrState = regions.size === 1 ? [...regions][0]! : null;

  return {
    trip: {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      islandCount: islandDetails.length,
      country,
      regionOrState,
      attendees: tripAttendeeList,
      islands: islandDetails,
    },
  };
}
