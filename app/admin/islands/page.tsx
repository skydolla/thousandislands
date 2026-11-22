"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import type { IslandSummary } from "@/lib/types";
import { apiFetch } from "@/lib/client-api";

export default function AdminIslandsPage() {
  const [islands, setIslands] = useState<IslandSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    apiFetch<{ islands: IslandSummary[] }>("/api/islands")
      .then((data) => setIslands(data.islands))
      .catch((err: Error) => setError(err.message));
  }, []);

  const term = q.trim().toLowerCase();
  const shown = islands?.filter((i) =>
    [i.name, i.country, i.regionOrState ?? ""].some((v) => v.toLowerCase().includes(term))
  );
  const unused = islands?.filter((i) => i.tripCount === 0).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Islands</h1>
        {islands && (
          <p className="text-sm text-zinc-500">
            {islands.length} {islands.length === 1 ? "island" : "islands"}
            {unused > 0 && ` · ${unused} not on any trip`}
          </p>
        )}
      </div>

      <label className="relative block">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by name, region or country"
          aria-label="Filter islands"
          className="input !pl-9"
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {!islands && !error && <p className="text-sm text-zinc-500">Loading…</p>}
      {islands?.length === 0 && (
        <p className="text-sm text-zinc-400">No islands yet. They&apos;re added from a trip.</p>
      )}
      {shown && islands!.length > 0 && shown.length === 0 && (
        <p className="text-sm text-zinc-400">No islands match &ldquo;{q}&rdquo;.</p>
      )}

      {shown && shown.length > 0 && (
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
          {shown.map((island) => (
            <li key={island.id}>
              <Link
                href={`/admin/islands/${island.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-800/50"
              >
                <div className="min-w-0">
                  <div className="font-medium text-zinc-100 truncate">{island.name}</div>
                  <div className="text-sm text-zinc-500 truncate">
                    {[island.regionOrState, island.country].filter(Boolean).join(", ")}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={island.tripCount ? "text-sm text-zinc-500" : "text-sm text-amber-400"}>
                    {island.tripCount === 0
                      ? "Not on any trip"
                      : `${island.tripCount} ${island.tripCount === 1 ? "trip" : "trips"}`}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
