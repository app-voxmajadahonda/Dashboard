import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "dashboard-grupo-municipal",
    timestamp: new Date().toISOString()
  });
}
