import { NextResponse } from "next/server";
import { scanTarget } from "@/lib/scanner/scan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 4096) return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
    const body = await request.json() as { url?: unknown };
    if (typeof body.url !== "string") return NextResponse.json({ error: "A URL is required." }, { status: 400 });
    return NextResponse.json(await scanTarget(body.url), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The scan could not be completed.";
    const timeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return NextResponse.json({ error: timeout ? "The target took too long to respond." : message }, { status: timeout ? 504 : 400 });
  }
}
