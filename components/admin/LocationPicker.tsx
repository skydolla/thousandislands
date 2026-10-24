"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAP_STYLE_URL } from "@/lib/map-style";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (latitude: number, longitude: number) => void;
}

const round = (n: number) => Math.round(n * 1e5) / 1e5;

/** Small map: click to place the island's pin. Follows coordinates typed into the form. */
export default function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [20, 15],
      zoom: 1,
    });
    map.on("click", (e) => onChangeRef.current(round(e.lngLat.lat), round(e.lngLat.lng)));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || latitude === null || longitude === null) return;
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color: "#22d3ee" }).setLngLat([longitude, latitude]).addTo(map);
      map.jumpTo({ center: [longitude, latitude], zoom: Math.max(map.getZoom(), 8) });
    } else {
      markerRef.current.setLngLat([longitude, latitude]);
      if (!map.getBounds().contains([longitude, latitude])) map.panTo([longitude, latitude]);
    }
  }, [latitude, longitude]);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full rounded-lg overflow-hidden border border-zinc-700 cursor-crosshair"
    />
  );
}
