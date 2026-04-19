"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { MapPin } from "@/lib/types";
import TripModal from "@/components/TripModal";
import ProgressWidget from "@/components/ProgressWidget";

const MapComponent = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<{
    tripId: string;
    islandId: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/map-pins")
      .then((res) => res.json())
      .then((data) => setPins(data.pins ?? []))
      .catch(() => {});
  }, []);

  const handlePinClick = useCallback((tripId: string, islandId: string) => {
    setSelectedTrip({ tripId, islandId });
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTrip(null);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950">
      <MapComponent pins={pins} onPinClick={handlePinClick} />

      <ProgressWidget visible={!selectedTrip} />

      {selectedTrip && (
        <TripModal
          tripId={selectedTrip.tripId}
          initialIslandId={selectedTrip.islandId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
