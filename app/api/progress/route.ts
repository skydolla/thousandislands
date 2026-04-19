import { NextResponse } from "next/server";
import { getProgress } from "@/lib/services/progress";

export async function GET() {
  try {
    const progress = getProgress();
    return NextResponse.json(progress, {
      headers: {
        "Cache-Control": "public, max-age=600, stale-while-revalidate=300",
      },
    });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to load progress." } },
      { status: 500 }
    );
  }
}
