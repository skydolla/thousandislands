"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Trash2 } from "lucide-react";
import type { TripDetailIslandPicture } from "@/lib/types";
import { apiFetch } from "@/lib/client-api";
import { resizeImage } from "@/lib/image-resize";

interface PhotoManagerProps {
  tripIslandId: string;
  islandName: string;
  initialPictures: TripDetailIslandPicture[];
}

/** Upload, caption, reorder and delete one trip island's photos. Changes save immediately. */
export default function PhotoManager({ tripIslandId, islandName, initialPictures }: PhotoManagerProps) {
  const [pictures, setPictures] = useState(initialPictures);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList) {
    setError(null);
    const list = [...files];
    setUploading({ done: 0, total: list.length });
    for (const [index, file] of list.entries()) {
      try {
        const { blob, width, height } = await resizeImage(file);
        const { uploadUrl, storageKey } = await apiFetch<{ uploadUrl: string; storageKey: string }>(
          "/api/uploads",
          { method: "POST", json: { tripIslandId, contentType: "image/jpeg", size: blob.size } }
        );
        const put = await fetch(uploadUrl, {
          method: "PUT",
          body: blob,
          headers: { "content-type": "image/jpeg" },
        });
        if (!put.ok) throw new Error(`${file.name}: upload failed (${put.status})`);
        const { picture } = await apiFetch<{ picture: TripDetailIslandPicture }>("/api/pictures", {
          method: "POST",
          json: { tripIslandId, storageKey, width, height, caption: null, takenAt: null },
        });
        setPictures((prev) => [...prev, picture]);
      } catch (err) {
        setError((err as Error).message);
      }
      setUploading({ done: index + 1, total: list.length });
    }
    setUploading(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function saveCaption(id: string, caption: string) {
    const current = pictures.find((p) => p.id === id);
    if ((current?.caption ?? "") === caption.trim()) return;
    try {
      await apiFetch(`/api/pictures/${id}`, { method: "PATCH", json: { caption: caption || null } });
      setPictures((prev) => prev.map((p) => (p.id === id ? { ...p, caption: caption.trim() || null } : p)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function move(index: number, delta: -1 | 1) {
    const next = [...pictures];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const previous = pictures;
    setPictures(next);
    try {
      await apiFetch("/api/pictures/order", {
        method: "PUT",
        json: { tripIslandId, pictureIds: next.map((p) => p.id) },
      });
    } catch (err) {
      setPictures(previous);
      setError((err as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this photo? This can't be undone.")) return;
    try {
      await apiFetch(`/api/pictures/${id}`, { method: "DELETE" });
      setPictures((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">
          {islandName} <span className="text-zinc-500 font-normal">
            · {pictures.length} {pictures.length === 1 ? "photo" : "photos"}
          </span>
        </h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!!uploading}
          className="btn-secondary !py-1.5 text-xs"
        >
          <ImagePlus className="w-4 h-4" />
          {uploading ? `Uploading ${uploading.done + 1} of ${uploading.total}…` : "Add photos"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          aria-label={`Add photos for ${islandName}`}
          onChange={(e) => e.target.files?.length && upload(e.target.files)}
        />
      </div>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}

      {pictures.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {pictures.map((p, index) => (
            <li key={p.id} className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
              <div className="relative aspect-[4/3] bg-zinc-800 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl} alt={p.caption ?? ""} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex justify-between p-1.5 bg-gradient-to-t from-black/70 to-transparent">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Move earlier"
                      className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === pictures.length - 1}
                      aria-label="Move later"
                      className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    aria-label="Delete photo"
                    className="w-7 h-7 rounded-full bg-black/60 text-red-300 flex items-center justify-center hover:text-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <input
                defaultValue={p.caption ?? ""}
                onBlur={(e) => saveCaption(p.id, e.target.value)}
                placeholder="Add a caption"
                aria-label="Caption"
                className="w-full bg-transparent px-2.5 py-2 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:bg-zinc-800/50"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
