"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { Search, X } from "lucide-react";
import type { Island } from "@/lib/types";
import { apiFetch } from "@/lib/client-api";

const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });

interface IslandFormProps {
  /** The island to edit. Omit to create a new one. */
  island?: Island;
  /** Prefills the name of a new island. */
  initialName?: string;
  onSaved: (island: Island) => void;
  onCancel: () => void;
  /** "dialog" floats over the page (used inside the trip form); "page" renders inline. */
  layout?: "dialog" | "page";
}

interface NominatimResult {
  lat: string;
  lon: string;
  address?: { country?: string; state?: string; region?: string; archipelago?: string };
}

/** Adds or edits an island: name, country, region and a pin placed on a map. */
export default function IslandForm({ island, initialName = "", onSaved, onCancel, layout = "dialog" }: IslandFormProps) {
  const [name, setName] = useState(island?.name ?? initialName);
  const [country, setCountry] = useState(island?.country ?? "");
  const [regionOrState, setRegionOrState] = useState(island?.regionOrState ?? "");
  const [latitude, setLatitude] = useState<number | null>(island?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(island?.longitude ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  // OpenStreetMap's free geocoder. Its usage policy allows occasional lookups like this button,
  // not search-as-you-type.
  async function lookUp() {
    setLookingUp(true);
    setError(null);
    try {
      const q = [name, regionOrState, country].filter(Boolean).join(", ");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&accept-language=en&q=${encodeURIComponent(q)}`
      );
      const [hit] = (await res.json()) as NominatimResult[];
      if (!hit) {
        setError("No match found. Click the map to place the island instead.");
        return;
      }
      setLatitude(Math.round(Number(hit.lat) * 1e5) / 1e5);
      setLongitude(Math.round(Number(hit.lon) * 1e5) / 1e5);
      if (!country && hit.address?.country) setCountry(hit.address.country);
      const region = hit.address?.state ?? hit.address?.region ?? hit.address?.archipelago;
      if (!regionOrState && region) setRegionOrState(region);
    } catch {
      setError("Lookup failed. Click the map to place the island instead.");
    } finally {
      setLookingUp(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    // React bubbles events through portals, so stop this reaching the trip form it is rendered from.
    e.stopPropagation();
    if (latitude === null || longitude === null) {
      setError("Place the island on the map (click it, or use Look up).");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const json = { name, country, regionOrState: regionOrState || null, latitude, longitude };
      const { island: saved } = await apiFetch<{ island: Island }>(
        island ? `/api/islands/${island.id}` : "/api/islands",
        { method: island ? "PUT" : "POST", json }
      );
      setSaving(false);
      onSaved(saved);
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  const fields = (
    <>
      <label className="block space-y-1.5">
        <span className="label">Name</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="label">Country</span>
          <input required value={country} onChange={(e) => setCountry(e.target.value)} className="input" />
        </label>
        <label className="block space-y-1.5">
          <span className="label">Region / state</span>
          <input
            value={regionOrState}
            onChange={(e) => setRegionOrState(e.target.value)}
            placeholder="Optional"
            className="input"
          />
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="label">Location</span>
          <button type="button" onClick={lookUp} disabled={!name || lookingUp} className="btn-secondary !py-1 !px-2.5 text-xs">
            <Search className="w-3.5 h-3.5" /> {lookingUp ? "Looking up…" : "Look up"}
          </button>
        </div>
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          onChange={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            step="any"
            min={-90}
            max={90}
            aria-label="Latitude"
            placeholder="Latitude"
            value={latitude ?? ""}
            onChange={(e) => setLatitude(e.target.value === "" ? null : Number(e.target.value))}
            className="input"
          />
          <input
            type="number"
            step="any"
            min={-180}
            max={180}
            aria-label="Longitude"
            placeholder="Longitude"
            value={longitude ?? ""}
            onChange={(e) => setLongitude(e.target.value === "" ? null : Number(e.target.value))}
            className="input"
          />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : island ? "Save changes" : "Add island"}
        </button>
      </div>
    </>
  );

  if (layout === "page") {
    return (
      <form onSubmit={save} className="space-y-4">
        {fields}
      </form>
    );
  }

  // Portaled to <body>: this form is opened from inside the trip form, and forms can't nest.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <form
        onSubmit={save}
        role="dialog"
        aria-modal="true"
        aria-labelledby="island-form-title"
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-700/50 rounded-2xl p-6 space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="island-form-title" className="text-lg font-bold text-white">
            {island ? `Edit ${island.name}` : "New island"}
          </h2>
          <button type="button" onClick={onCancel} aria-label="Cancel" className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        {fields}
      </form>
    </div>,
    document.body
  );
}
