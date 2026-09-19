import { NextResponse } from "next/server";
import { scanTarget } from "@/lib/scanner/scan";
import { consumeScanQuota } from "@/lib/rate-limit";
import { anonymize, logEvent, requestId } from "@/lib/logging";
import { acquireScanSlot } from "@/lib/concurrency";
import { readScanBody } from "@/lib/request-body";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const id = requestId();
  const started = performance.now();
  try {
    const trustedHeader = process.env.TRUSTED_IP_HEADER ?? (process.env.VERCEL ? "x-forwarded-for" : process.env.CF_PAGES ? "cf-connecting-ip" : "");
    const forwarded = trustedHeader ? request.headers.get(trustedHeader)?.split(",")[0]?.trim() : undefined;
    const quota = await consumeScanQuota(anonymize(forwarded || "local-development"));
    if (!quota.configured) return NextResponse.json({ error: "Scanner rate limiting is not configured for this deployment." }, { status: 503, headers: { "X-Request-Id": id } });
    if (!quota.allowed) return NextResponse.json(
      { error: "Too many scans. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(quota.retryAfter), "X-RateLimit-Remaining": "0" } },
    );
    const body = await readScanBody(request);
    if (typeof body.url !== "string") return NextResponse.json({ error: "A URL is required." }, { status: 400 });
    const release = acquireScanSlot();
    if (!release) return NextResponse.json({ error: "The scanner is busy. Please try again shortly." }, { status: 503, headers: { "Retry-After": "5", "X-Request-Id": id } });
    let result;
    try { result = await scanTarget(body.url); }
    finally { release(); }
    logEvent("scan.completed", { requestId: id, target: anonymize(result.finalUrl), score: result.score, durationMs: Math.round(performance.now() - started) });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store", "X-RateLimit-Remaining": String(quota.remaining), "X-Request-Id": id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The scan could not be completed.";
    const timeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    logEvent("scan.failed", { requestId: id, reason: error instanceof Error ? error.name : "Unknown", durationMs: Math.round(performance.now() - started) });
    const tooLarge = error instanceof RangeError && message === "Request body is too large.";
    return NextResponse.json({ error: timeout ? "The target took too long to respond." : message }, { status: timeout ? 504 : tooLarge ? 413 : 400, headers: { "X-Request-Id": id } });
  }
}
