"use client";

import { useEffect, useState } from "react";
import type { ProgressResponse } from "@/lib/types";

interface ProgressWidgetProps {
  visible: boolean;
}

export default function ProgressWidget({ visible }: ProgressWidgetProps) {
  const [progress, setProgress] = useState<ProgressResponse | null>(null);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data: ProgressResponse) => setProgress(data))
      .catch(() => {});
  }, []);

  if (!visible || !progress) return null;

  const pct = Math.min(
    (progress.uniqueIslandsVisited / progress.goal) * 100,
    100
  );

  return (
    <div className="absolute top-4 left-4 z-10 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-xl px-4 py-3 shadow-lg">
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
        Island Progress
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-cyan-400 tabular-nums">
          {progress.uniqueIslandsVisited}
        </span>
        <span className="text-sm text-zinc-500">
          / {progress.goal.toLocaleString()}
        </span>
      </div>
      <div className="mt-2 w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
