"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createBrowserSupabase().auth.signOut();
        router.replace("/");
        router.refresh();
      }}
      className="text-zinc-400 hover:text-white"
    >
      Sign out
    </button>
  );
}
