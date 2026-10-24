// Creates (or resets the password of) the owner account that can edit trips, and marks it as owner.
// Run in your own terminal: npm run create-owner
// The password is typed at a hidden prompt, never passed on the command line.
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

process.loadEnvFile(".env.local");

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

const email = (await ask("Owner email: ")).toLowerCase();
if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("That doesn't look like an email address.");
const password = await ask("Password (min 12 characters): ", { hidden: true });
if (password.length < 12) throw new Error("Use at least 12 characters.");
if ((await ask("Confirm password: ", { hidden: true })) !== password) {
  throw new Error("Passwords don't match.");
}

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let userId;
const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
if (created.error?.code === "email_exists") {
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  userId = data.users.find((u) => u.email === email)?.id;
  const updated = await admin.auth.admin.updateUserById(userId, { password });
  if (updated.error) throw updated.error;
  console.log("Existing account found; password updated.");
} else if (created.error) {
  throw created.error;
} else {
  userId = created.data.user.id;
  console.log("Account created.");
}

const sql = postgres(process.env.SUPABASE_DB_URL, { max: 1, prepare: false });
await sql`insert into owners (user_id) values (${userId}) on conflict do nothing`;
await sql.end();
console.log(`${email} is the owner. Sign in at /login.`);
