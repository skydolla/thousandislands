import { NextResponse } from "next/server";
import { getMapPins } from "@/lib/services/map-pins";

export async function GET() {
  try {
    const pins = getMapPins();
    return NextResponse.json(
      { pins },
      {
        headers: {
          "Cache-Control": "public, max-age=600, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to load map pins." } },
      { status: 500 }
    );
  }
}
