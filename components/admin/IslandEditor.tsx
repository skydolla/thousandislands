"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Merge } from "lucide-react";
import type { IslandDetailResponse, IslandSummary } from "@/lib/types";
import { apiFetch } from "@/lib/client-api";
import IslandForm from "./IslandForm";

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const plural = (n: number, one: string) => `${n} ${n === 1 ? one : `${one}s`}`;

/** Edit one island, see which trips visited it, merge a duplicate into it, or delete it. */
export default function IslandEditor({ islandId }: { islandId: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<IslandDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    apiFetch<IslandDetailResponse>(`/api/islands/${islandId}`)
      .then(setDetail)
      .catch((err: Error) => setError(err.message));
  }, [islandId, reloadKey]);

  if (!detail) return <p className="text-sm text-zinc-500">{error ?? "Loading…"}</p>;
  const { island, trips } = detail;

  async function deleteIsland() {
    if (!confirm(`Delete ${island.name}? This can't be undone.`)) return;
    try {
      await apiFetch(`/api/islands/${islandId}`, { method: "DELETE" });
      router.replace("/admin/islands");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <Link href="/admin/islands" className="text-sm text-zinc-500 hover:text-white">
          ← Islands
        </Link>
        <h1 className="text-2xl font-bold text-white">{island.name}</h1>
        <p className="text-sm text-zinc-500">
          Changes apply to every trip that visited this island.
        </p>
      </div>

      <section className="space-y-3">
        <IslandForm
          key={`${island.id}-${reloadKey}`}
          island={island}
          layout="page"
          onCancel={() => router.push("/admin/islands")}
          onSaved={(saved) => {
            setDetail({ ...detail, island: saved });
            setSavedAt(new Date());
          }}
        />
        {savedAt && <p className="text-sm text-zinc-500 text-right">Saved</p>}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">Visited on</h2>
        {trips.length === 0 ? (
          <p className="text-sm text-zinc-400">No trips yet.</p>
        ) : (
          <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
            {trips.map((trip) => (
              <li key={trip.id}>
                <Link
                  href={`/admin/trips/${trip.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-800/50"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-zinc-100 truncate">{trip.name}</div>
                    <div className="text-sm text-zinc-500">{formatDate(trip.startDate)}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <MergeSection
        keepName={island.name}
        keepId={island.id}
        onMerged={() => {
          setError(null);
          setReloadKey((k) => k + 1);
        }}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">Delete</h2>
        {trips.length > 0 ? (
          <p className="text-sm text-zinc-400">
            {island.name} is on {plural(trips.length, "trip")}, so it can&apos;t be deleted. Remove it from those trips
            first, or merge it into another island from that island&apos;s page.
          </p>
        ) : (
          <button type="button" onClick={deleteIsland} className="btn-danger">
            Delete island
          </button>
        )}
      </section>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

/** Pick a duplicate of this island and fold it in. */
function MergeSection({ keepId, keepName, onMerged }: { keepId: string; keepName: string; onMerged: () => void }) {
  const [islands, setIslands] = useState<IslandSummary[] | null>(null);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function open() {
    try {
      const data = await apiFetch<{ islands: IslandSummary[] }>("/api/islands");
      setIslands(data.islands.filter((i) => i.id !== keepId));
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    }
  }

  async function merge(duplicate: IslandSummary) {
    const moves =
      duplicate.tripCount === 0
        ? `${duplicate.name} isn't on any trip, so it will just be deleted.`
        : `${duplicate.name}'s ${plural(duplicate.tripCount, "trip")} and their photos will move to ${keepName}. A trip that visited both keeps one stop with all the photos.`;
    if (!confirm(`Merge ${duplicate.name} (${duplicate.country}) into ${keepName}?\n\n${moves}\n\n${duplicate.name} is then deleted. This can't be undone.`)) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/api/islands/${keepId}/merge`, { method: "POST", json: { duplicateId: duplicate.id } });
      setMessage({ ok: true, text: `Merged ${duplicate.name} into ${keepName}.` });
      setIslands(null);
      setQ("");
      onMerged();
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const term = q.trim().toLowerCase();
  const matches = term
    ? islands?.filter((i) => [i.name, i.country, i.regionOrState ?? ""].some((v) => v.toLowerCase().includes(term)))
    : islands;

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white">Merge a duplicate</h2>
        <p className="text-sm text-zinc-500">
          Added the same island twice? Pick the copy to fold into {keepName}. Its trips and photos move here and the copy is
          deleted.
        </p>
      </div>
      {islands ? (
        <div className="space-y-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for the duplicate"
            aria-label="Search for the duplicate"
            autoFocus
            className="input"
          />
          <ul className="max-h-72 overflow-y-auto divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
            {matches?.length === 0 && <li className="px-4 py-3 text-sm text-zinc-500">No other islands match.</li>}
            {matches?.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => merge(i)}
                  className="w-full flex items-center justify-between gap-4 px-4 py-2.5 text-left hover:bg-zinc-800/50 disabled:opacity-50"
                >
                  <span className="min-w-0 truncate text-sm">
                    <span className="text-zinc-100">{i.name}</span>{" "}
                    <span className="text-zinc-500">{[i.regionOrState, i.country].filter(Boolean).join(", ")}</span>
                  </span>
                  <span className="text-xs text-zinc-500 shrink-0">{plural(i.tripCount, "trip")}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setIslands(null)} className="btn-secondary">
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" onClick={open} className="btn-secondary">
          <Merge className="w-4 h-4" /> Choose a duplicate…
        </button>
      )}
      {message && (
        <p role={message.ok ? "status" : "alert"} className={message.ok ? "text-sm text-cyan-400" : "text-sm text-red-400"}>
          {message.text}
        </p>
      )}
    </section>
  );
}
