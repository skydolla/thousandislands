"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import type { Island } from "@/lib/types";
import { apiFetch } from "@/lib/client-api";
import IslandForm from "./IslandForm";

interface IslandPickerProps {
  excludeIds: string[];
  onSelect: (island: Island) => void;
}

/** Search existing islands to add to a trip, or create a new one. */
export default function IslandPicker({ excludeIds, onSelect }: IslandPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Island[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      apiFetch<{ islands: Island[] }>(`/api/islands?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
        .then((data) => setResults(data.islands))
        .catch(() => {});
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const q = query.trim();
  const visible = q ? results.filter((i) => !excludeIds.includes(i.id)) : [];

  function choose(island: Island) {
    onSelect(island);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          // Enter picks the only match instead of submitting the trip form.
          if (e.key !== "Enter") return;
          e.preventDefault();
          if (visible.length === 1) choose(visible[0]);
        }}
        placeholder="Add an island: search by name or country…"
        aria-label="Search islands"
        className="input"
      />
      {q && (
        <ul className="absolute z-10 mt-1 w-full max-h-72 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
          {visible.map((island) => (
            <li key={island.id}>
              <button
                type="button"
                onClick={() => choose(island)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800"
              >
                <span className="text-zinc-100">{island.name}</span>{" "}
                <span className="text-zinc-500">
                  {[island.regionOrState, island.country].filter(Boolean).join(", ")}
                </span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="w-full text-left px-3 py-2 text-sm text-cyan-400 hover:bg-zinc-800 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create new island &ldquo;{q}&rdquo;
            </button>
          </li>
        </ul>
      )}
      {creating && (
        <IslandForm
          initialName={q}
          onCancel={() => setCreating(false)}
          onCreated={(island) => {
            setCreating(false);
            choose(island);
          }}
        />
      )}
    </div>
  );
}
