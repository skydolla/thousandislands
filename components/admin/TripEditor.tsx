"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import type { Island, TripDetailIsland, TripDetailResponse } from "@/lib/types";
import { apiFetch } from "@/lib/client-api";
import IslandPicker from "./IslandPicker";
import PhotoManager from "./PhotoManager";

interface TripEditorProps {
  /** Omit to create a new trip. */
  tripId?: string;
}

interface EditorIsland {
  island: Pick<Island, "id" | "name" | "country" | "regionOrState">;
  /** Present once the island has been saved as part of this trip (needed for photos). */
  saved?: TripDetailIsland;
}

export default function TripEditor({ tripId }: TripEditorProps) {
  const router = useRouter();
  const [loaded, setLoaded] = useState(!tripId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attendees, setAttendees] = useState("");
  const [islands, setIslands] = useState<EditorIsland[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!tripId) return;
    apiFetch<TripDetailResponse>(`/api/trips/${tripId}`)
      .then(({ trip }) => {
        setName(trip.name);
        setDescription(trip.description);
        setStartDate(trip.startDate);
        setEndDate(trip.endDate);
        setAttendees(trip.attendees.map((a) => a.name).join(", "));
        setIslands(trip.islands.map((ti) => ({ island: ti.island, saved: ti })));
        setLoaded(true);
      })
      .catch((err: Error) => setError(err.message));
  }, [tripId, reloadKey]);

  function moveIsland(index: number, delta: -1 | 1) {
    const next = [...islands];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setIslands(next);
  }

  function removeIsland(index: number) {
    const photoCount = islands[index].saved?.pictures.length ?? 0;
    if (
      photoCount > 0 &&
      !confirm(
        `Removing ${islands[index].island.name} will delete its ${photoCount} photo${photoCount === 1 ? "" : "s"} from this trip when you save. Continue?`
      )
    ) {
      return;
    }
    setIslands(islands.filter((_, i) => i !== index));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name,
      description,
      startDate,
      endDate,
      attendeeNames: attendees.split(",").map((s) => s.trim()).filter(Boolean),
      islandIds: islands.map((i) => i.island.id),
    };
    try {
      if (tripId) {
        await apiFetch(`/api/trips/${tripId}`, { method: "PUT", json: payload });
        setSavedAt(new Date());
        setReloadKey((k) => k + 1);
      } else {
        const { id } = await apiFetch<{ id: string }>("/api/trips", { method: "POST", json: payload });
        router.replace(`/admin/trips/${id}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTrip() {
    if (!tripId || !confirm(`Delete "${name}" and all of its photos? This can't be undone.`)) return;
    try {
      await apiFetch(`/api/trips/${tripId}`, { method: "DELETE" });
      router.replace("/admin");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!loaded) {
    return <p className="text-sm text-zinc-500">{error ?? "Loading…"}</p>;
  }

  const unsavedIslands = islands.some((i) => !i.saved);

  return (
    <div className="space-y-10">
      <form onSubmit={save} className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">{tripId ? "Edit trip" : "New trip"}</h1>
          {tripId && (
            <button type="button" onClick={deleteTrip} className="btn-danger">
              Delete trip
            </button>
          )}
        </div>

        <label className="block space-y-1.5">
          <span className="label">Trip name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="label">Start date</span>
            <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
          </label>
          <label className="block space-y-1.5">
            <span className="label">End date</span>
            <input
              type="date"
              required
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="label">Description</span>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input resize-y"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="label">Who came along</span>
          <input
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="Names, separated by commas"
            className="input"
          />
        </label>

        <div className="space-y-3">
          <span className="label">Islands, in visit order</span>
          {islands.length > 0 && (
            <ol className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900">
              {islands.map((item, index) => (
                <li key={item.island.id} className="flex items-center gap-3 px-3 py-2">
                  <span className="w-5 text-xs text-zinc-500 tabular-nums">{index + 1}</span>
                  <div className="flex-1 min-w-0 text-sm">
                    <span className="text-zinc-100">{item.island.name}</span>{" "}
                    <span className="text-zinc-500">
                      {[item.island.regionOrState, item.island.country].filter(Boolean).join(", ")}
                    </span>
                    {!item.saved && <span className="ml-2 text-xs text-amber-400">unsaved</span>}
                  </div>
                  <button type="button" onClick={() => moveIsland(index, -1)} disabled={index === 0} aria-label={`Move ${item.island.name} up`} className="text-zinc-500 hover:text-white disabled:opacity-30">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => moveIsland(index, 1)} disabled={index === islands.length - 1} aria-label={`Move ${item.island.name} down`} className="text-zinc-500 hover:text-white disabled:opacity-30">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => removeIsland(index)} aria-label={`Remove ${item.island.name}`} className="text-zinc-500 hover:text-red-400">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ol>
          )}
          <IslandPicker
            excludeIds={islands.map((i) => i.island.id)}
            onSelect={(island) => setIslands((prev) => [...prev, { island }])}
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : tripId ? "Save changes" : "Create trip"}
          </button>
          {savedAt && !saving && <span className="text-sm text-zinc-500">Saved</span>}
        </div>
      </form>

      {tripId && (
        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Photos</h2>
            <p className="text-sm text-zinc-500">
              Photos are resized before upload and saved immediately.
              {unsavedIslands && " Save the trip to add photos for newly added islands."}
            </p>
          </div>
          {islands
            .filter((i) => i.saved)
            .map((i) => (
              <PhotoManager
                key={`${i.saved!.tripIslandId}-${reloadKey}`}
                tripIslandId={i.saved!.tripIslandId}
                islandName={i.island.name}
                initialPictures={i.saved!.pictures}
              />
            ))}
        </section>
      )}
    </div>
  );
}
