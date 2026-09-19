import { Agent, type Dispatcher } from "undici";
import { collectObservations } from "./observations";
import { evaluateHeaders } from "./score";
import type { ScanResult } from "./types";
import { assertPublicTarget, normalizeTarget } from "./url-security";
import { inspectTls } from "./tls";

const TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;
const HTML_SAMPLE_LIMIT = 512 * 1024;

interface PinnedResponse { response: Response; dispatcher: Agent; target: Awaited<ReturnType<typeof assertPublicTarget>>[number] }

async function readBoundedSample(response: Response): Promise<string> {
  if (!response.headers.get("content-type")?.toLowerCase().includes("text/html") || !response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < HTML_SAMPLE_LIMIT) {
    const { done, value } = await reader.read();
    if (done) break;
    const remaining = HTML_SAMPLE_LIMIT - size;
    chunks.push(value.byteLength <= remaining ? value : value.slice(0, remaining));
    size += Math.min(value.byteLength, remaining);
  }
  await reader.cancel();
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}

/** Connects to the DNS result that was validated, closing the check/use gap used by DNS rebinding. */
async function fetchPinned(url: URL): Promise<PinnedResponse> {
  const [target] = await assertPublicTarget(url);
  const dispatcher = new Agent({
    connect: {
      // Undici requests all DNS records for Happy Eyeballs; return only the vetted address.
      lookup: (_hostname, _options, callback) => callback(null, [target]),
    },
  });
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "CollabShield/2.1 Security Header Scanner", Accept: "text/html,*/*;q=0.1" },
      dispatcher,
    } as RequestInit & { dispatcher: Dispatcher });
    return { response, dispatcher, target };
  } catch (error) {
    await dispatcher.close();
    throw error;
  }
}

export async function scanTarget(input: string): Promise<ScanResult> {
  const requested = normalizeTarget(input);
  const started = performance.now();
  let current = requested;
  let finalHeaders: Headers | undefined;
  let finalStatus = 0;
  let finalCookies: string[] = [];
  let finalTarget: Awaited<ReturnType<typeof assertPublicTarget>>[number] | undefined;
  let finalHtmlSample = "";
  const redirectChain: { url: string; statusCode: number }[] = [];

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const { response, dispatcher, target } = await fetchPinned(current);
    const headers = new Headers(response.headers);
    const status = response.status;
    const cookies = (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ?? [];
    redirectChain.push({ url: current.toString(), statusCode: status });

    const isRedirect = [301, 302, 303, 307, 308].includes(status);
    const location = headers.get("location");
    if (!isRedirect || !location) finalHtmlSample = await readBoundedSample(response);
    else await response.body?.cancel();
    await dispatcher.close();

    if (!isRedirect || !location) {
      finalHeaders = headers;
      finalStatus = status;
      finalCookies = cookies;
      finalTarget = target;
      break;
    }
    if (redirect === MAX_REDIRECTS) throw new Error("The target redirected too many times.");
    current = new URL(location, current);
    if (!["http:", "https:"].includes(current.protocol)) throw new Error("The target redirected to an unsupported protocol.");
  }

  if (!finalHeaders) throw new Error("The target did not return a response.");
  const assessment = evaluateHeaders(finalHeaders);
  const tls = finalTarget ? await inspectTls(current, finalTarget) : null;
  return {
    methodologyVersion: "2.1",
    requestedUrl: requested.toString(), finalUrl: current.toString(), statusCode: finalStatus,
    scannedAt: new Date().toISOString(), durationMs: Math.round(performance.now() - started), redirectChain,
    ...assessment, passed: assessment.findings.filter((item) => item.status === "pass").length,
    total: assessment.findings.length, tls, observations: collectObservations(finalHeaders, current, finalCookies, tls, finalHtmlSample),
  };
}
