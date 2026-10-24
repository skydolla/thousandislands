import "server-only";
import type { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createRequestSupabase } from "@/lib/supabase/server";
import { apiError } from "@/lib/api";

type OwnerResult =
  | { supabase: SupabaseClient; user: User; error?: never }
  | { supabase?: never; user?: never; error: NextResponse };

/**
 * Resolves the signed-in owner for a write request. Row Level Security enforces the same rule in the
 * database; checking here first gives clear 401/403 responses and guards the R2-only endpoints.
 */
export async function requireOwner(request: Request): Promise<OwnerResult> {
  const supabase = await createRequestSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: apiError("UNAUTHORIZED", "Sign in to make changes.") };

  const { data: isOwner, error } = await supabase.rpc("is_owner");
  if (error) {
    console.error("is_owner check failed", error);
    return { error: apiError("INTERNAL_ERROR", "Could not verify permissions.") };
  }
  if (!isOwner) return { error: apiError("FORBIDDEN", "Only the owner can make changes.") };
  return { supabase, user };
}
