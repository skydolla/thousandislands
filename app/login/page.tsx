"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await createBrowserSupabase().auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }
    const next = searchParams.get("next");
    router.replace(next?.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-700/50 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Sign in</h1>
          <p className="text-sm text-zinc-400">Owner access to edit trips and photos.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
