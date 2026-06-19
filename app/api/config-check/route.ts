import { NextResponse } from "next/server";

const checks = [
  "NEXT_PUBLIC_APP_NAME",
  "NEXT_PUBLIC_DEFAULT_ORG_SLUG",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
] as const;

export function GET() {
  return NextResponse.json({
    ok: true,
    configured: checks.map((name) => ({
      name,
      present: Boolean(process.env[name])
    }))
  });
}
