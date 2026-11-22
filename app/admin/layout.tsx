import Link from "next/link";
import { redirect } from "next/navigation";
import { createCookieSupabase } from "@/lib/supabase/server";
import SignOutButton from "@/components/admin/SignOutButton";

export const metadata = { title: "Admin · 1000 Islands" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createCookieSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: isOwner } = await supabase.rpc("is_owner");

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/admin" className="font-semibold text-white">
              1000 Islands <span className="text-zinc-500 font-normal">· Admin</span>
            </Link>
            <Link href="/admin" className="text-zinc-400 hover:text-white">
              Trips
            </Link>
            <Link href="/admin/islands" className="text-zinc-400 hover:text-white">
              Islands
            </Link>
            <Link href="/" className="text-zinc-400 hover:text-white">
              View map
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <span className="hidden sm:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isOwner ? (
          children
        ) : (
          <p className="text-zinc-400">
            This account isn&apos;t the owner, so it can&apos;t edit trips.
          </p>
        )}
      </main>
    </div>
  );
}
