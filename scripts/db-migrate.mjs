// Applies pending SQL migrations in supabase/migrations to the database in SUPABASE_DB_URL.
// Records applied versions in supabase_migrations.schema_migrations (same table the Supabase CLI uses).
// Run: npm run db:migrate
import { readdirSync, readFileSync } from "node:fs";
import postgres from "postgres";

process.loadEnvFile(".env.local");
const dir = "supabase/migrations";
const sql = postgres(process.env.SUPABASE_DB_URL, { max: 1, prepare: false, onnotice: () => {} });

try {
  await sql`create schema if not exists supabase_migrations`;
  await sql`create table if not exists supabase_migrations.schema_migrations (
    version text primary key, statements text[], name text)`;
  const applied = new Set(
    (await sql`select version from supabase_migrations.schema_migrations`).map((r) => r.version)
  );

  const files = readdirSync(dir).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();
  let count = 0;
  for (const file of files) {
    const [, version, name] = file.match(/^(\d+)_(.+)\.sql$/);
    if (applied.has(version)) continue;
    const body = readFileSync(`${dir}/${file}`, "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(body);
      await tx`insert into supabase_migrations.schema_migrations (version, name, statements)
               values (${version}, ${name}, ${[body]})`;
    });
    console.log(`applied ${file}`);
    count++;
  }
  console.log(count ? `${count} migration(s) applied` : "database is up to date");
} finally {
  await sql.end();
}
