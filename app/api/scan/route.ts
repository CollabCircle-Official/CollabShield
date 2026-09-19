import { NextResponse } from "next/server";
import { scanTarget } from "@/lib/scanner/scan";
import { consumeScanQuota } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const clientId = forwarded || request.headers.get("x-real-ip") || "local";
    const quota = consumeScanQuota(clientId);
    if (!quota.allowed) return NextResponse.json(
      { error: "Too many scans. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(quota.retryAfter), "X-RateLimit-Remaining": "0" } },
    );
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 4096) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    const body = await request.json() as { url?: unknown };
    if (typeof body.url !== "string") return NextResponse.json({ error: "A URL is required." }, { status: 400 });
    return NextResponse.json(await scanTarget(body.url), { headers: { "Cache-Control": "no-store", "X-RateLimit-Remaining": String(quota.remaining) } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The scan could not be completed.";
    const timeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return NextResponse.json({ error: timeout ? "The target took too long to respond." : message }, { status: timeout ? 504 : 400 });
  }
}
