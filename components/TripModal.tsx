"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, MapPin, Calendar, Globe, Mountain, Pencil } from "lucide-react";
import type { MapPinTrip, TripDetailResponse } from "@/lib/types";
import { cn } from "@/lib/cn";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import PhotoCarousel from "./PhotoCarousel";
import IslandSwitcher from "./IslandSwitcher";

interface TripModalProps {
  /** The island whose pin was clicked. */
  islandId: string;
  /** Every trip that visited the island, most recent first. */
  trips: MapPinTrip[];
  onClose: () => void;
}

type TripResult =
  | { tripId: string; data: TripDetailResponse; error?: never }
  | { tripId: string; error: string; data?: never };

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

const FOCUSABLE =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function TripModal({ islandId, trips, onClose }: TripModalProps) {
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.tripId);
  const [selectedIslandId, setSelectedIslandId] = useState(islandId);
  const [result, setResult] = useState<TripResult | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  // Sign-ups are disabled, so a signed-in visitor is the owner.
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    createBrowserSupabase()
      .auth.getSession()
      .then(({ data }) => setSignedIn(!!data.session));
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!selectedTripId) return;
    const controller = new AbortController();
    fetch(`/api/trips/${selectedTripId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load trip");
        return res.json();
      })
      .then((json: TripDetailResponse) => {
        setResult({ tripId: selectedTripId, data: json });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setResult({ tripId: selectedTripId, error: "Could not load trip details." });
      });
    return () => controller.abort();
  }, [selectedTripId]);

  // Escape to close, focus trap, and background scroll lock.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, []);

  const current = result?.tripId === selectedTripId ? result : null;
  const loading = !current;
  const error = current?.error ?? null;
  const trip = current?.data?.trip;
  const selectedTripIsland =
    trip?.islands.find((ti) => ti.island.id === selectedIslandId) ??
    trip?.islands[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-modal-title"
        className="relative z-10 w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:mx-4 bg-zinc-900 md:rounded-2xl border border-zinc-700/50 overflow-y-auto shadow-2xl"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trip switcher, for islands visited on more than one trip */}
        {trips.length > 1 && (
          <div className="px-6 md:px-8 pt-6 pr-16 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Visited on {trips.length} trips
            </h3>
            <div className="flex flex-wrap gap-2">
              {trips.map((t) => (
                <button
                  key={t.tripId}
                  onClick={() => {
                    setSelectedTripId(t.tripId);
                    setSelectedIslandId(islandId);
                  }}
                  aria-pressed={t.tripId === selectedTripId}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    t.tripId === selectedTripId
                      ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                  )}
                >
                  {t.tripName}
                </button>
              ))}
            </div>
          </div>
        )}

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
              <h2
                id="trip-modal-title"
                className="text-2xl font-bold text-white leading-tight"
              >
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
                selectedIslandId={selectedTripIsland?.island.id ?? ""}
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
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Photos — {selectedTripIsland.island.name}
                  </h3>
                  {signedIn && (
                    <Link
                      href={`/admin/islands/${selectedTripIsland.island.id}`}
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit island
                    </Link>
                  )}
                </div>
                <PhotoCarousel
                  key={selectedTripIsland.tripIslandId}
                  pictures={selectedTripIsland.pictures}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
