import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import type { ApiError } from "@/lib/types";

type ErrorCode = ApiError["error"]["code"];

const STATUS: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

// Reads reflect edits immediately; traffic is small enough that skipping the CDN cache costs nothing.
const NO_STORE = { "Cache-Control": "no-store" };

export function ok<T>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function apiError(code: ErrorCode, message: string) {
  return NextResponse.json<ApiError>(
    { error: { code, message } },
    { status: STATUS[code], headers: NO_STORE }
  );
}

/** Maps a Postgres/PostgREST error code to an API error. */
export function fromDbError(err: unknown, fallbackMessage: string) {
  const code = (err as { code?: string })?.code;
  if (code === "42501") return apiError("FORBIDDEN", "You don't have permission to do that.");
  // P0002: raised by our functions; 22P02: a malformed id in the URL.
  if (code === "P0002" || code === "22P02") return apiError("NOT_FOUND", "Not found.");
  if (code === "23505") return apiError("CONFLICT", "That already exists.");
  if (code === "23503") return apiError("CONFLICT", "That is still in use.");
  if (code === "22023" || code === "23514") return apiError("BAD_REQUEST", "Invalid data.");
  console.error(fallbackMessage, err);
  return apiError("INTERNAL_ERROR", fallbackMessage);
}

/** Parses a JSON request body with a zod schema. */
export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { error: apiError("BAD_REQUEST", "Request body must be JSON.") };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue.path.join(".");
    return { error: apiError("BAD_REQUEST", path ? `${path}: ${issue.message}` : issue.message) };
  }
  return { data: result.data };
}
