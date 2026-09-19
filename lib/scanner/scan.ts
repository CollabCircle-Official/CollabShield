import { evaluateHeaders } from "./score";
import type { ScanResult } from "./types";
import { assertPublicTarget, normalizeTarget } from "./url-security";

const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;

export async function scanTarget(input: string): Promise<ScanResult> {
  const requested = normalizeTarget(input);
  const started = performance.now();
  let current = requested;
  let response: Response | undefined;

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertPublicTarget(current);
    response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "CollabShield/1.0 Security Header Scanner", Accept: "text/html,*/*;q=0.1" },
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) break;
    const location = response.headers.get("location");
    if (!location) break;
    await response.body?.cancel();
    if (redirect === MAX_REDIRECTS) throw new Error("The target redirected too many times.");
    current = new URL(location, current);
    if (!['http:', 'https:'].includes(current.protocol)) throw new Error("The target redirected to an unsupported protocol.");
  }

  if (!response) throw new Error("The target did not return a response.");
  const assessment = evaluateHeaders(response.headers);
  await response.body?.cancel();
  return {
    requestedUrl: requested.toString(), finalUrl: current.toString(), statusCode: response.status,
    scannedAt: new Date().toISOString(), durationMs: Math.round(performance.now() - started),
    ...assessment, passed: assessment.findings.filter((item) => item.status === "pass").length,
    total: assessment.findings.length,
  };
}
