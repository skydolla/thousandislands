"use client";

import { useState, useEffect, useCallback } from "react";
import { X, MapPin, Calendar, Globe, Mountain } from "lucide-react";
import type { TripDetailResponse } from "@/lib/types";
import PhotoCarousel from "./PhotoCarousel";
import IslandSwitcher from "./IslandSwitcher";

interface TripModalProps {
  tripId: string;
  initialIslandId: string;
  onClose: () => void;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return `${s.toLocaleDateString("en-US", opts)} — ${e.toLocaleDateString("en-US", opts)}`;
}

export default function TripModal({
  tripId,
  initialIslandId,
  onClose,
}: TripModalProps) {
  const [data, setData] = useState<TripDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIslandId, setSelectedIslandId] = useState(initialIslandId);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/trips/${tripId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load trip");
        return res.json();
      })
      .then((json: TripDetailResponse) => {
        setData(json);
        const hasIsland = json.trip.islands.some(
          (ti) => ti.island.id === initialIslandId
        );
        if (!hasIsland && json.trip.islands.length > 0) {
          setSelectedIslandId(json.trip.islands[0].island.id);
        }
      })
      .catch(() => setError("Could not load trip details."))
      .finally(() => setLoading(false));
  }, [tripId, initialIslandId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const trip = data?.trip;
  const selectedTripIsland = trip?.islands.find(
    (ti) => ti.island.id === selectedIslandId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:mx-4 bg-zinc-900 md:rounded-2xl border border-zinc-700/50 overflow-y-auto shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64 text-red-400 text-sm">
            {error}
          </div>
        )}

        {trip && (
          <div className="p-6 md:p-8 space-y-6">
            {/* Trip header */}
            <div className="space-y-3 pr-8">
              <h2 className="text-2xl font-bold text-white leading-tight">
                {trip.name}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDateRange(trip.startDate, trip.endDate)}
                </span>
                {trip.country && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    {trip.country}
                    {trip.regionOrState ? `, ${trip.regionOrState}` : ""}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Mountain className="w-4 h-4" />
                  {trip.islandCount}{" "}
                  {trip.islandCount === 1 ? "island" : "islands"}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-zinc-300 text-sm leading-relaxed">
              {trip.description}
            </p>

            {/* Divider */}
            <div className="border-t border-zinc-800" />

            {/* Islands visited */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Islands visited
              </h3>
              <IslandSwitcher
                islands={trip.islands}
                selectedIslandId={selectedIslandId}
                onSelect={setSelectedIslandId}
              />
              {trip.islands.length === 1 && (
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  {trip.islands[0].island.name}
                </div>
              )}
            </div>

            {/* Photos for selected island */}
            {selectedTripIsland && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Photos — {selectedTripIsland.island.name}
                </h3>
                <PhotoCarousel pictures={selectedTripIsland.pictures} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
