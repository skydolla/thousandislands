import { describe, expect, it } from "vitest";
import { buildMapPins, type MapPinRow } from "@/lib/services/map-pins";
import { buildTripDetail, type TripDetailRow } from "@/lib/services/trips";
import * as seed from "@/lib/data/seed";

// The seed fixtures, reshaped into the rows Supabase returns for each query.

function islandRow(islandId: string) {
  const i = seed.islands.find((x) => x.id === islandId)!;
  return {
    id: i.id,
    name: i.name,
    country: i.country,
    region_or_state: i.regionOrState,
    latitude: i.latitude,
    longitude: i.longitude,
  };
}

const mapPinRows: MapPinRow[] = seed.tripIslands.map((ti) => {
  const trip = seed.trips.find((t) => t.id === ti.tripId)!;
  return {
    island: islandRow(ti.islandId),
    trip: { id: trip.id, name: trip.name, start_date: trip.startDate },
  };
});

function tripDetailRow(tripId: string): TripDetailRow {
  const trip = seed.trips.find((t) => t.id === tripId)!;
  return {
    id: trip.id,
    name: trip.name,
    description: trip.description,
    start_date: trip.startDate,
    end_date: trip.endDate,
    trip_attendees: seed.tripAttendees
      .filter((ta) => ta.tripId === tripId)
      .map((ta) => ({ attendee: seed.attendees.find((a) => a.id === ta.attendeeId)! })),
    // Reversed so the tests prove buildTripDetail sorts rather than relying on input order.
    trip_islands: seed.tripIslands
      .filter((ti) => ti.tripId === tripId)
      .reverse()
      .map((ti) => ({
        id: ti.id,
        sequence_number: ti.sequenceNumber,
        island: islandRow(ti.islandId),
        pictures: seed.pictures
          .filter((p) => p.tripIslandId === ti.id)
          .reverse()
          .map((p) => ({
            id: p.id,
            image_url: p.imageUrl,
            caption: p.caption,
            taken_at: p.takenAt,
            sort_order: p.sortOrder,
            created_at: p.createdAt,
          })),
      })),
  };
}

describe("buildMapPins", () => {
  it("returns one pin per visited island", () => {
    const ids = buildMapPins(mapPinRows).map((p) => p.islandId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(new Set(seed.tripIslands.map((ti) => ti.islandId)).size);
  });

  it("lists every trip for a revisited island, most recent first", () => {
    const santorini = buildMapPins(mapPinRows).find((p) => p.islandId === "isl-001")!;
    expect(santorini.trips.map((t) => t.tripId)).toEqual(["trip-011", "trip-001"]);
  });
});

describe("buildTripDetail", () => {
  it("orders islands by sequence number and pictures by sort order", () => {
    const { trip } = buildTripDetail(tripDetailRow("trip-002"));
    expect(trip.islands.map((ti) => ti.sequenceNumber)).toEqual([1, 2, 3]);
    for (const ti of trip.islands) {
      const orders = ti.pictures.map((p) => p.sortOrder ?? Infinity);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
  });

  it("puts islands without a sequence number last, by name", () => {
    const row = tripDetailRow("trip-002");
    row.trip_islands[0].sequence_number = null;
    const names = buildTripDetail(row).trip.islands.map((ti) => ti.sequenceNumber);
    expect(names.at(-1)).toBeNull();
  });

  it("derives country only when all islands share it", () => {
    expect(buildTripDetail(tripDetailRow("trip-002")).trip.country).toBe(
      "Saint Vincent and the Grenadines"
    );
    const cruise = buildTripDetail(tripDetailRow("trip-011")).trip;
    const countries = new Set(cruise.islands.map((ti) => ti.island.country));
    expect(cruise.country).toBe(countries.size === 1 ? [...countries][0] : null);
  });

  it("includes attendees", () => {
    const { trip } = buildTripDetail(tripDetailRow("trip-002"));
    expect(trip.attendees.length).toBe(
      seed.tripAttendees.filter((ta) => ta.tripId === "trip-002").length
    );
  });
});
