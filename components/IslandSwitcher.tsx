"use client";

import type { TripDetailIsland } from "@/lib/types";
import { cn } from "@/lib/cn";

interface IslandSwitcherProps {
  islands: TripDetailIsland[];
  selectedIslandId: string;
  onSelect: (islandId: string) => void;
}

export default function IslandSwitcher({
  islands,
  selectedIslandId,
  onSelect,
}: IslandSwitcherProps) {
  if (islands.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {islands.map((ti) => (
        <button
          key={ti.island.id}
          onClick={() => onSelect(ti.island.id)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            ti.island.id === selectedIslandId
              ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
          )}
        >
          {ti.island.name}
        </button>
      ))}
    </div>
  );
}
