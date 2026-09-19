import type { SecurityObservation, TlsDetails } from "./types";

/** Supplemental signals are deliberately not scored because suitability depends on application context. */
export function collectObservations(headers: Headers, finalUrl: URL, setCookies: string[] = [], tls: TlsDetails | null = null, htmlSample = ""): SecurityObservation[] {
  const coop = headers.get("cross-origin-opener-policy");
  const coep = headers.get("cross-origin-embedder-policy");
  const corp = headers.get("cross-origin-resource-policy");
  const disclosure = headers.get("server") ?? headers.get("x-powered-by");
  const corsOrigin = headers.get("access-control-allow-origin");
  const corsCredentials = headers.get("access-control-allow-credentials")?.toLowerCase() === "true";
  const mixedReferences = finalUrl.protocol === "https:" ? (htmlSample.match(/(?:src|href|action)\s*=\s*["']http:\/\//gi) ?? []).length : 0;
  const metaReferrer = /<meta[^>]+name\s*=\s*["']referrer["'][^>]*>/i.test(htmlSample);

  const cookieIssues = setCookies.flatMap((cookie) => {
    const name = cookie.split("=", 1)[0] || "unnamed";
    const lower = cookie.toLowerCase();
    const issues = [];
    if (finalUrl.protocol === "https:" && !lower.includes("; secure")) issues.push(`${name}: missing Secure`);
    if (!lower.includes("; httponly")) issues.push(`${name}: missing HttpOnly`);
    if (!lower.includes("; samesite=")) issues.push(`${name}: SameSite not explicit`);
    return issues;
  });

  return [
    {
      id: "mixed-content",
      title: "Static mixed-content references",
      status: mixedReferences ? "advisory" : "configured",
      value: mixedReferences ? `${mixedReferences} HTTP reference(s) in sampled HTML` : null,
      summary: mixedReferences ? "The sampled HTML contains insecure HTTP resource, link, or form references." : "No obvious HTTP references were found in the bounded HTML sample.",
    },
    {
      id: "cors",
      title: "Cross-Origin Resource Sharing",
      status: corsOrigin === "*" && corsCredentials ? "advisory" : corsOrigin ? "configured" : "advisory",
      value: corsOrigin,
      summary: corsOrigin ? (corsOrigin === "*" ? "The response permits reads from every origin; confirm that its content is intentionally public." : "The response declares an explicit allowed origin.") : "No CORS opt-in header was observed; the browser same-origin policy remains the default.",
    },
    {
      id: "html-referrer-policy",
      title: "HTML referrer fallback",
      status: metaReferrer ? "configured" : "advisory",
      value: metaReferrer ? "meta referrer policy detected" : null,
      summary: metaReferrer ? "The bounded HTML sample includes a page-level referrer policy." : "No meta referrer policy was found in the bounded sample; header and browser defaults may still apply.",
    },
    {
      id: "tls-certificate",
      title: "TLS certificate",
      status: tls && tls.daysRemaining >= 14 ? "configured" : "advisory",
      value: tls ? `${tls.protocol} · ${tls.daysRemaining} days · ${tls.issuer}` : null,
      summary: tls ? `The verified certificate expires on ${new Date(tls.validTo).toLocaleDateString("en-US")}.` : "Certificate metadata was unavailable or the final response did not use HTTPS.",
    },
    {
      id: "cookie-attributes",
      title: "Cookie attributes",
      status: cookieIssues.length ? "advisory" : "configured",
      value: cookieIssues.length ? cookieIssues.slice(0, 5).join("; ") : null,
      summary: setCookies.length ? (cookieIssues.length ? `${cookieIssues.length} attribute hardening opportunity or opportunities were observed across ${setCookies.length} response cookie(s).` : `All ${setCookies.length} observed response cookie(s) use the reviewed defensive attributes.`) : "The scanned response did not set cookies.",
    },
    {
      id: "transport",
      title: "Encrypted transport",
      status: finalUrl.protocol === "https:" ? "configured" : "advisory",
      value: finalUrl.protocol.replace(":", "").toUpperCase(),
      summary: finalUrl.protocol === "https:" ? "The final response was delivered over HTTPS." : "The final response was delivered over unencrypted HTTP.",
    },
    {
      id: "coop",
      title: "Cross-Origin Opener Policy",
      status: coop ? "configured" : "advisory",
      value: coop,
      summary: coop ? "A browsing-context isolation policy is explicitly configured." : "COOP is not configured. This is optional and application-dependent.",
    },
    {
      id: "coep",
      title: "Cross-Origin Embedder Policy",
      status: coep ? "configured" : "advisory",
      value: coep,
      summary: coep ? "Cross-origin resource embedding requirements are explicitly configured." : "COEP is not configured. It is needed only for applications requiring cross-origin isolation.",
    },
    {
      id: "corp",
      title: "Cross-Origin Resource Policy",
      status: corp ? "configured" : "advisory",
      value: corp,
      summary: corp ? "The response declares which origins may load it as a resource." : "CORP is not configured. Its appropriate value depends on how the resource is shared.",
    },
    {
      id: "technology-disclosure",
      title: "Technology disclosure",
      status: disclosure ? "disclosure" : "configured",
      value: disclosure,
      summary: disclosure ? "The response exposes server or framework information. This is a low-impact hardening consideration." : "No Server or X-Powered-By disclosure was observed.",
    },
  ];
}
