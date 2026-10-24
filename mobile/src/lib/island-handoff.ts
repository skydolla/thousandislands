import type { Island } from "@shared/types";

// Hands an island created on the "New island" screen back to the trip editor underneath it.
let pending: Island | null = null;

export function handOffIsland(island: Island) {
  pending = island;
}

export function takeHandedOffIsland(): Island | null {
  const island = pending;
  pending = null;
  return island;
}
