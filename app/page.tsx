"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { MapPin, MapPinsResponse } from "@/lib/types";
import TripModal from "@/components/TripModal";
import ProgressWidget from "@/components/ProgressWidget";

const MapComponent = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [pinsError, setPinsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedIslandId, setSelectedIslandId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/map-pins", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load map pins (${res.status})`);
        return res.json();
      })
      .then((data: MapPinsResponse) => {
        setPins(data.pins ?? []);
        setPinsError(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.error(err);
        setPinsError(true);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const handlePinClick = useCallback((islandId: string) => {
    setSelectedIslandId(islandId);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedIslandId(null);
  }, []);

  const selectedPin = pins.find((p) => p.islandId === selectedIslandId);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950">
      <MapComponent pins={pins} onPinClick={handlePinClick} />

      <ProgressWidget visible={!selectedPin} />

      {pinsError && (
        <div
          role="alert"
          className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md border border-red-500/40 rounded-xl px-4 py-2 text-sm text-zinc-200 shadow-lg"
        >
          Couldn&apos;t load your islands.
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {selectedPin && (
        <TripModal
          islandId={selectedPin.islandId}
          trips={selectedPin.trips}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
