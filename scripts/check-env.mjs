// Verifies .env.local credentials against the live services. Prints pass/fail only, never values.
// Run: npm run check:env
import postgres from "postgres";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
process.loadEnvFile(".env.local");
const e = process.env;
const ok = (m) => console.log("ok    " + m), bad = (m, err) => console.log("FAIL  " + m + " — " + (err?.message ?? err));

try {
  const r = await fetch(`${e.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: e.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const s = await r.json();
  ok(`publishable key accepted (email login enabled: ${s.external?.email}, signups disabled: ${s.disable_signup})`);
} catch (err) { bad("publishable key", err); }

try {
  const r = await fetch(`${e.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?per_page=1`, { headers: { apikey: e.SUPABASE_SECRET_KEY, Authorization: `Bearer ${e.SUPABASE_SECRET_KEY}` } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${await r.text()}`);
  const j = await r.json();
  ok(`secret key has admin access (auth users so far: ${j.users?.length ?? 0})`);
} catch (err) { bad("secret key", err); }

try {
  const sql = postgres(e.SUPABASE_DB_URL, { max: 1, prepare: false });
  const [v] = await sql`select current_setting('server_version') as v`;
  const tables = await sql`select table_name from information_schema.tables where table_schema = 'public'`;
  ok(`database connection (Postgres ${v.v}; public tables: ${tables.map((t) => t.table_name).join(", ") || "none"})`);
  await sql.end();
} catch (err) { bad("database URL", err); }

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: e.R2_ACCESS_KEY_ID, secretAccessKey: e.R2_SECRET_ACCESS_KEY },
});
const key = `_healthcheck/${Date.now()}.txt`;
try {
  await s3.send(new ListObjectsV2Command({ Bucket: e.R2_BUCKET, MaxKeys: 1 }));
  ok("R2 credentials can list the bucket");
  await s3.send(new PutObjectCommand({ Bucket: e.R2_BUCKET, Key: key, Body: "ok", ContentType: "text/plain" }));
  ok("R2 credentials can write");
  const r = await fetch(`${e.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`);
  if (r.ok && (await r.text()) === "ok") ok("R2 public URL serves uploaded files");
  else bad("R2 public URL", `HTTP ${r.status}`);
  const cors = await fetch(`https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${e.R2_BUCKET}/${key}`, {
    method: "OPTIONS", headers: { Origin: "http://localhost:3000", "Access-Control-Request-Method": "PUT", "Access-Control-Request-Headers": "content-type" },
  });
  if (cors.headers.get("access-control-allow-origin")) ok("R2 CORS allows browser uploads from localhost:3000");
  else bad("R2 CORS", `preflight HTTP ${cors.status}, no allow-origin header`);
} catch (err) { bad("R2", err); }
finally { await s3.send(new DeleteObjectCommand({ Bucket: e.R2_BUCKET, Key: key })).catch(() => {}); }
