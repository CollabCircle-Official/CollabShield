import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const distributedRateLimit = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  const ready = distributedRateLimit || process.env.NODE_ENV !== "production" || process.env.ALLOW_IN_MEMORY_RATE_LIMIT === "true";
  return NextResponse.json({ status: ready ? "ok" : "misconfigured", service: "collabshield", version: process.env.npm_package_version ?? "unknown", distributedRateLimit }, {
    status: ready ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
