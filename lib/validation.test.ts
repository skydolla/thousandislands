import { describe, expect, it } from "vitest";
import {
  islandInputSchema,
  islandMergeSchema,
  pictureCreateSchema,
  tripInputSchema,
  uploadRequestSchema,
} from "@/lib/validation";

const ISLAND_A = "1b4e28ba-2fa1-41d2-883f-0016d3cca427";
const ISLAND_B = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";

const trip = {
  name: "  Greek Islands ",
  description: "",
  startDate: "2025-05-10",
  endDate: "2025-05-17",
  attendeeNames: ["Alex"],
  islandIds: [ISLAND_A, ISLAND_B],
};

describe("tripInputSchema", () => {
  it("accepts a valid trip and trims text", () => {
    expect(tripInputSchema.parse(trip).name).toBe("Greek Islands");
  });

  it("rejects an end date before the start date", () => {
    const result = tripInputSchema.safeParse({ ...trip, endDate: "2025-05-01" });
    expect(result.success).toBe(false);
  });

  it("rejects the same island twice", () => {
    const result = tripInputSchema.safeParse({ ...trip, islandIds: [ISLAND_A, ISLAND_A] });
    expect(result.success).toBe(false);
  });

  it("rejects a blank name", () => {
    expect(tripInputSchema.safeParse({ ...trip, name: "   " }).success).toBe(false);
  });
});

describe("uploads", () => {
  it("rejects files over 15 MB and unsupported types", () => {
    const base = { tripIslandId: ISLAND_A, contentType: "image/jpeg", size: 1000 };
    expect(uploadRequestSchema.safeParse(base).success).toBe(true);
    expect(uploadRequestSchema.safeParse({ ...base, size: 16 * 1024 * 1024 }).success).toBe(false);
    expect(uploadRequestSchema.safeParse({ ...base, contentType: "image/gif" }).success).toBe(false);
  });

  it("only accepts storage keys in the photos/ folder", () => {
    const base = {
      tripIslandId: ISLAND_A,
      storageKey: `photos/${ISLAND_A}/${ISLAND_B}.jpg`,
      width: 2048,
      height: 1536,
      caption: null,
      takenAt: null,
    };
    expect(pictureCreateSchema.safeParse(base).success).toBe(true);
    expect(
      pictureCreateSchema.safeParse({ ...base, storageKey: "../secrets.jpg" }).success
    ).toBe(false);
  });
});

describe("islands", () => {
  const island = { name: "Bequia", country: "Saint Vincent and the Grenadines", regionOrState: null, latitude: 13, longitude: -61.2 };

  it("leaves notes out when they aren't sent, so an edit keeps existing notes", () => {
    expect(islandInputSchema.parse(island)).not.toHaveProperty("notes");
  });

  it("rejects coordinates off the globe", () => {
    expect(islandInputSchema.safeParse({ ...island, latitude: 91 }).success).toBe(false);
  });

  it("requires a real island id to merge", () => {
    expect(islandMergeSchema.safeParse({ duplicateId: ISLAND_A }).success).toBe(true);
    expect(islandMergeSchema.safeParse({ duplicateId: "isl-001" }).success).toBe(false);
  });
});
