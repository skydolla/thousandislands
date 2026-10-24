import { z } from "zod";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const UPLOAD_CONTENT_TYPES = ["image/jpeg", "image/webp", "image/png"] as const;

export const tripInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    description: z.string().trim().max(5000),
    startDate: z.iso.date(),
    endDate: z.iso.date(),
    attendeeNames: z.array(z.string().trim().min(1).max(100)).max(100),
    islandIds: z
      .array(z.uuid())
      .max(500)
      .refine((ids) => new Set(ids).size === ids.length, "An island appears twice"),
  })
  .refine((t) => t.startDate <= t.endDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });
export type TripInput = z.infer<typeof tripInputSchema>;

export const islandInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  country: z.string().trim().min(1, "Country is required").max(100),
  regionOrState: z.string().trim().max(100).nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  notes: z.string().trim().max(2000).nullable(),
});
export type IslandInput = z.infer<typeof islandInputSchema>;

export const uploadRequestSchema = z.object({
  tripIslandId: z.uuid(),
  contentType: z.enum(UPLOAD_CONTENT_TYPES),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, "Photo is larger than 15 MB"),
});

export const pictureCreateSchema = z.object({
  tripIslandId: z.uuid(),
  storageKey: z.string().regex(/^photos\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|webp|png)$/),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  caption: z.string().trim().max(500).nullable(),
  takenAt: z.iso.datetime({ offset: true }).nullable(),
});

export const pictureUpdateSchema = z.object({
  caption: z.string().trim().max(500).nullable(),
});

export const pictureOrderSchema = z.object({
  tripIslandId: z.uuid(),
  pictureIds: z.array(z.uuid()).min(1).max(500),
});
