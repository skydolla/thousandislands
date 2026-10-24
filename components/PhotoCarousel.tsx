"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TripDetailIslandPicture } from "@/lib/types";
import { cn } from "@/lib/cn";

interface PhotoCarouselProps {
  pictures: TripDetailIslandPicture[];
}

const SWIPE_THRESHOLD_PX = 40;

/**
 * Callers should pass a `key` that changes with the picture set (e.g. the trip island id)
 * so the current index resets when switching islands.
 */
export default function PhotoCarousel({ pictures }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (pictures.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-zinc-800/50 rounded-lg">
        <p className="text-zinc-500 text-sm">No photos for this island</p>
      </div>
    );
  }

  const current = pictures[Math.min(currentIndex, pictures.length - 1)];

  const goTo = (index: number) => {
    if (index < 0) setCurrentIndex(pictures.length - 1);
    else if (index >= pictures.length) setCurrentIndex(0);
    else setCurrentIndex(index);
  };

  return (
    <div className="space-y-3">
      <div
        className="relative group"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null || pictures.length <= 1) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (dx <= -SWIPE_THRESHOLD_PX) goTo(currentIndex + 1);
          else if (dx >= SWIPE_THRESHOLD_PX) goTo(currentIndex - 1);
        }}
      >
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.imageUrl}
            alt={current.caption ?? "Trip photo"}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        </div>

        {pictures.length > 1 && (
          <>
            <button
              onClick={() => goTo(currentIndex - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 transition-opacity hover:bg-black/80"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => goTo(currentIndex + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 transition-opacity hover:bg-black/80"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {current.caption && (
        <p className="text-sm text-zinc-400 text-center italic">
          {current.caption}
        </p>
      )}

      {pictures.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {pictures.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === currentIndex
                  ? "bg-cyan-400 w-4"
                  : "bg-zinc-600 hover:bg-zinc-500"
              )}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
