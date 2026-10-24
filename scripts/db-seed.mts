// Development data. Run: npm run db:seed        (loads the sample trips from lib/data/seed.ts)
//                        npm run db:wipe        (deletes ALL trips, islands, attendees and pictures)
// Both talk to the database in SUPABASE_DB_URL directly, bypassing Row Level Security.
import { randomUUID } from "node:crypto";
import postgres from "postgres";
import * as seed from "../lib/data/seed.ts";

process.loadEnvFile(".env.local");
const sql = postgres(process.env.SUPABASE_DB_URL!, { max: 1, prepare: false, onnotice: () => {} });

async function wipe(tx: postgres.TransactionSql) {
  await tx`truncate pictures, trip_attendees, trip_islands, attendees, islands, trips`;
}

try {
  if (process.argv.includes("--wipe")) {
    if (!process.argv.includes("--yes")) {
      console.error("This deletes every trip, island, attendee and picture row. Re-run with --yes to confirm.");
      process.exit(1);
    }
    await sql.begin(wipe);
    console.log("wiped all trip data (R2 photo files are not touched)");
  } else {
    const [{ count }] = await sql`select count(*)::int as count from trips`;
    if (count > 0) {
      console.error(`trips table already has ${count} rows; run "npm run db:wipe" first to reseed`);
      process.exit(1);
    }
    // Fixture ids like "isl-001" become real UUIDs.
    const ids = new Map<string, string>();
    const id = (fixtureId: string) => {
      if (!ids.has(fixtureId)) ids.set(fixtureId, randomUUID());
      return ids.get(fixtureId)!;
    };

    await sql.begin(async (tx) => {
      for (const t of seed.trips)
        await tx`insert into trips (id, name, description, start_date, end_date)
                 values (${id(t.id)}, ${t.name}, ${t.description}, ${t.startDate}, ${t.endDate})`;
      for (const i of seed.islands)
        await tx`insert into islands (id, name, country, region_or_state, latitude, longitude, external_reference_id, notes)
                 values (${id(i.id)}, ${i.name}, ${i.country}, ${i.regionOrState}, ${i.latitude}, ${i.longitude},
                         ${i.externalReferenceId}, ${i.notes})`;
      for (const a of seed.attendees)
        await tx`insert into attendees (id, name) values (${id(a.id)}, ${a.name})`;
      for (const ti of seed.tripIslands)
        await tx`insert into trip_islands (id, trip_id, island_id, sequence_number)
                 values (${id(ti.id)}, ${id(ti.tripId)}, ${id(ti.islandId)}, ${ti.sequenceNumber})`;
      for (const ta of seed.tripAttendees)
        await tx`insert into trip_attendees (id, trip_id, attendee_id, role)
                 values (${id(ta.id)}, ${id(ta.tripId)}, ${id(ta.attendeeId)}, ${ta.role})`;
      for (const p of seed.pictures)
        await tx`insert into pictures (id, trip_island_id, image_url, storage_key, width, height, caption, taken_at, sort_order)
                 values (${id(p.id)}, ${id(p.tripIslandId)}, ${p.imageUrl}, ${p.storageKey}, ${p.width}, ${p.height},
                         ${p.caption}, ${p.takenAt}, ${p.sortOrder})`;
    });
    console.log(`seeded ${seed.trips.length} trips, ${seed.islands.length} islands, ${seed.pictures.length} pictures`);
  }
} finally {
  await sql.end();
}
