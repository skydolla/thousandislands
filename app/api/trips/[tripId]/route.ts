import { NextResponse } from "next/server";
import { getTripDetail } from "@/lib/services/trips";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;

    if (!tripId) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Trip ID is required." } },
        { status: 400 }
      );
    }

    const result = getTripDetail(tripId);

    if (!result) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Trip not found." } },
        { status: 404 }
      );
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=120, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to load trip details." } },
      { status: 500 }
    );
  }
}
