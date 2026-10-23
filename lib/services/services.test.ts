import { describe, expect, it } from "vitest";
import { getMapPins } from "@/lib/services/map-pins";
import { getProgress } from "@/lib/services/progress";
import { getTripDetail } from "@/lib/services/trips";
import { islands, tripIslands } from "@/lib/data/seed";

describe("getMapPins", () => {
  it("returns one pin per visited island", () => {
    const pins = getMapPins();
    const ids = pins.map((p) => p.islandId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(new Set(tripIslands.map((ti) => ti.islandId)).size);
  });

  it("lists every trip for a revisited island, most recent first", () => {
    const santorini = getMapPins().find((p) => p.islandId === "isl-001")!;
    expect(santorini.trips.map((t) => t.tripId)).toEqual(["trip-011", "trip-001"]);
  });
});

describe("getProgress", () => {
  it("counts unique islands, not trip visits", () => {
    const progress = getProgress();
    expect(tripIslands.length).toBeGreaterThan(progress.uniqueIslandsVisited);
    expect(progress.uniqueIslandsVisited).toBe(getMapPins().length);
    expect(progress.goal).toBe(1000);
  });
});

describe("getTripDetail", () => {
  it("returns null for an unknown trip", () => {
    expect(getTripDetail("nope")).toBeNull();
  });

  it("orders islands by sequence number and pictures by sort order", () => {
    const { trip } = getTripDetail("trip-002")!;
    expect(trip.islands.map((ti) => ti.sequenceNumber)).toEqual([1, 2, 3]);
    for (const ti of trip.islands) {
      const orders = ti.pictures.map((p) => p.sortOrder ?? Infinity);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
  });

  it("derives country only when all islands share it", () => {
    expect(getTripDetail("trip-002")!.trip.country).toBe(
      "Saint Vincent and the Grenadines"
    );
    const cruise = getTripDetail("trip-011")!.trip;
    const countries = new Set(
      cruise.islands.map(
        (ti) => islands.find((i) => i.id === ti.island.id)!.country
      )
    );
    expect(cruise.country).toBe(countries.size === 1 ? [...countries][0] : null);
  });
});
