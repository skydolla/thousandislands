"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import type { TripSummary } from "@/lib/types";
import { apiFetch } from "@/lib/client-api";

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<TripSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ trips: TripSummary[] }>("/api/trips")
      .then((data) => setTrips(data.trips))
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Trips</h1>
        <Link href="/admin/trips/new" className="btn-primary">
          <Plus className="w-4 h-4" /> New trip
        </Link>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {!trips && !error && <p className="text-sm text-zinc-500">Loading…</p>}
      {trips?.length === 0 && (
        <p className="text-sm text-zinc-400">No trips yet. Add your first one.</p>
      )}

      {trips && trips.length > 0 && (
        <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900">
          {trips.map((trip) => (
            <li key={trip.id}>
              <Link
                href={`/admin/trips/${trip.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-800/50"
              >
                <div className="min-w-0">
                  <div className="font-medium text-zinc-100 truncate">{trip.name}</div>
                  <div className="text-sm text-zinc-500">
                    {formatDate(trip.startDate)} · {trip.islandCount}{" "}
                    {trip.islandCount === 1 ? "island" : "islands"}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
