import { useQuery, type QueryClient } from "@tanstack/react-query";
import type {
  IslandDetailResponse,
  IslandSummary,
  MapPinsResponse,
  ProgressResponse,
  TripDetailResponse,
  TripSummary,
} from "@shared/types";
import { apiFetch } from "./api";

export const keys = {
  pins: ["map-pins"] as const,
  progress: ["progress"] as const,
  trips: ["trips"] as const,
  trip: (id: string) => ["trip", id] as const,
  islands: ["islands"] as const,
  island: (id: string) => ["island", id] as const,
};

export const useMapPins = () =>
  useQuery({
    queryKey: keys.pins,
    queryFn: ({ signal }) => apiFetch<MapPinsResponse>("/api/map-pins", { signal }).then((r) => r.pins),
  });

export const useProgress = () =>
  useQuery({
    queryKey: keys.progress,
    queryFn: ({ signal }) => apiFetch<ProgressResponse>("/api/progress", { signal }),
  });

export const useTrips = () =>
  useQuery({
    queryKey: keys.trips,
    queryFn: ({ signal }) =>
      apiFetch<{ trips: TripSummary[] }>("/api/trips", { signal }).then((r) => r.trips),
  });

export const useTrip = (id: string | undefined) =>
  useQuery({
    queryKey: keys.trip(id ?? ""),
    queryFn: ({ signal }) =>
      apiFetch<TripDetailResponse>(`/api/trips/${id}`, { signal }).then((r) => r.trip),
    enabled: !!id,
  });

export const useIslands = () =>
  useQuery({
    queryKey: keys.islands,
    queryFn: ({ signal }) =>
      apiFetch<{ islands: IslandSummary[] }>("/api/islands", { signal }).then((r) => r.islands),
  });

export const useIsland = (id: string) =>
  useQuery({
    queryKey: keys.island(id),
    queryFn: ({ signal }) => apiFetch<IslandDetailResponse>(`/api/islands/${id}`, { signal }),
  });

/** After any edit: the map, progress and trip list may all have changed. */
export function invalidateAll(queryClient: QueryClient) {
  return queryClient.invalidateQueries();
}
