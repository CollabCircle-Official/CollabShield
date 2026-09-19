import { analyzeCsp } from "./csp";
import type { HeaderRule, RuleAssessment } from "./types";

const secureReferrerPolicies = new Set(["no-referrer", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]);
const sensitivePermissions = ["camera", "microphone", "geolocation"];

function evaluateCsp(value: string | null): RuleAssessment {
  if (!value) return { status: "fail", severity: "high", earnedRatio: 0, summary: "No enforced Content-Security-Policy header was observed.", evidence: ["The response does not define an enforced CSP."], confidence: "high" };
  const analysis = analyzeCsp(value);
  if (analysis.strong) return { status: "pass", summary: "A nonce/hash-based strict CSP is enforced.", evidence: analysis.evidence, confidence: "high" };
  if (analysis.unsafeInlineEffective) return { status: "fail", severity: "high", earnedRatio: .2, summary: "The effective script policy permits unrestricted inline script execution.", evidence: analysis.evidence, confidence: "high" };
  const ratio = analysis.hasNonceOrHash && analysis.hasStrictDynamic ? .75 : .5;
  return {
    status: "warn", severity: analysis.hasUnsafeEval ? "medium" : "low", earnedRatio: ratio,
    summary: analysis.hasUnsafeEval ? "CSP uses modern nonce-based controls, but unsafe-eval remains an active relaxation." : "CSP is enforced but does not meet all strict-policy defense-in-depth checks.",
    evidence: analysis.evidence, confidence: "high",
  };
}

function evaluateHsts(value: string | null): RuleAssessment {
  if (!value) return { status: "fail", severity: "high", summary: "HSTS is missing.", evidence: ["No Strict-Transport-Security header was observed."], confidence: "high" };
  const match = value.match(/(?:^|;)\s*max-age\s*=\s*(\d+)/i);
  const seconds = match ? Number(match[1]) : 0;
  if (!seconds) return { status: "fail", severity: "high", summary: "HSTS has no effective max-age.", evidence: [`Observed max-age: ${seconds} seconds.`], confidence: "high" };
  if (seconds < 31_536_000) return { status: "warn", severity: "medium", earnedRatio: .5, summary: "HSTS is active, but max-age is shorter than one year.", evidence: [`Observed max-age: ${seconds} seconds.`], confidence: "high" };
  const evidence = [`Observed max-age: ${seconds} seconds.`, /includesubdomains/i.test(value) ? "Subdomains are included." : "includeSubDomains is not enabled; this may be intentional."];
  return { status: "pass", summary: "HTTPS is enforced for at least one year.", evidence, confidence: "high" };
}

function evaluateFrame(value: string | null, headers: Headers): RuleAssessment {
  const cspValue = headers.get("content-security-policy");
  const ancestors = cspValue ? analyzeCsp(cspValue).frameAncestors : null;
  const cspProtects = Boolean(ancestors?.length);
  const xfoProtects = Boolean(value && /^(deny|sameorigin)$/i.test(value.trim()));
  if (cspProtects && xfoProtects) return { status: "pass", summary: "Modern CSP and legacy frame protections are both configured.", evidence: [`CSP frame-ancestors: ${ancestors?.join(" ")}`, `X-Frame-Options: ${value}`], confidence: "high" };
  if (cspProtects) return { status: "pass", summary: "CSP frame-ancestors restricts embedding in modern browsers.", evidence: [`CSP frame-ancestors: ${ancestors?.join(" ")}`], confidence: "high" };
  if (xfoProtects) return { status: "pass", summary: "X-Frame-Options restricts cross-origin framing.", evidence: [`X-Frame-Options: ${value}`], confidence: "high" };
  if (value) return { status: "warn", severity: "medium", summary: "A frame header exists but its value is not an effective DENY or SAMEORIGIN policy.", evidence: [`X-Frame-Options: ${value}`], confidence: "high" };
  return { status: "fail", severity: "high", summary: "No effective frame-embedding restriction was found.", evidence: ["Neither CSP frame-ancestors nor a valid X-Frame-Options value was observed."], confidence: "high" };
}

function evaluateReferrer(value: string | null): RuleAssessment {
  if (!value) return { status: "warn", severity: "low", earnedRatio: .6, summary: "No explicit header was observed; modern browsers apply a protective default.", evidence: ["Modern browsers generally default to strict-origin-when-cross-origin.", "HTML meta or element-level policies are outside this header-only scan."], confidence: "medium" };
  const effective = value.split(",").at(-1)?.trim().toLowerCase() ?? "";
  if (secureReferrerPolicies.has(effective)) return { status: "pass", summary: `An explicit privacy-preserving policy is configured: ${effective}.`, evidence: [`Effective policy: ${effective}`], confidence: "high" };
  if (effective === "unsafe-url") return { status: "fail", severity: "medium", summary: "The policy can expose complete URLs to cross-origin destinations.", evidence: [`Effective policy: ${effective}`], confidence: "high" };
  return { status: "warn", severity: "low", earnedRatio: .5, summary: "A referrer policy exists, but a more privacy-preserving value is recommended.", evidence: [`Effective policy: ${effective}`], confidence: "high" };
}

function evaluatePermissions(value: string | null): RuleAssessment {
  if (!value) return { status: "warn", severity: "low", earnedRatio: .3, summary: "No explicit Permissions-Policy was observed.", evidence: ["Browser feature defaults still apply; absence is a defense-in-depth gap, not proof of exploitation."], confidence: "high" };
  const restrictions = sensitivePermissions.filter((feature) => new RegExp(`(?:^|,)\\s*${feature}\\s*=\\s*\\(\\s*\\)`, "i").test(value));
  if (restrictions.length === sensitivePermissions.length) return { status: "pass", summary: "Common sensitive browser capabilities are explicitly disabled.", evidence: restrictions.map((feature) => `${feature} is disabled.`), confidence: "high" };
  return { status: "warn", severity: "low", earnedRatio: .6, summary: "Permissions-Policy is present but does not disable all common sensitive capabilities.", evidence: restrictions.length ? restrictions.map((feature) => `${feature} is disabled.`) : ["Camera, microphone, and geolocation are not explicitly disabled by this header."], confidence: "high" };
}

/** Context-aware, OWASP-aligned response-header rules. Weights form a transparent 100-point model. */
export const HEADER_RULES: HeaderRule[] = [
  { id: "content-security-policy", header: "content-security-policy", title: "Content Security Policy", description: "Evaluates effective CSP3 script controls and defense-in-depth directives.", recommendation: "Prefer a nonce/hash-based strict CSP with strict-dynamic, object-src 'none', and a restricted base-uri; remove unsafe-eval where feasible.", attackVector: "Cross-Site Scripting (XSS) and content injection", severity: "high", weight: 30, standard: "W3C CSP Level 3 / OWASP CSP Cheat Sheet", evaluate: evaluateCsp },
  { id: "strict-transport-security", header: "strict-transport-security", title: "HTTP Strict Transport Security", description: "Checks whether browsers are instructed to keep future connections on HTTPS.", recommendation: "Set HSTS with max-age of at least 31536000; consider includeSubDomains and preload after operational review.", attackVector: "Man-in-the-Middle eavesdropping and SSL stripping", severity: "high", weight: 20, standard: "IETF RFC 6797 / OWASP", evaluate: evaluateHsts },
  { id: "x-frame-options", header: "x-frame-options", title: "Frame Protection", description: "Recognizes CSP frame-ancestors as well as legacy X-Frame-Options.", recommendation: "Define CSP frame-ancestors and optionally X-Frame-Options for legacy browser compatibility.", attackVector: "Clickjacking and UI redress attacks", severity: "high", weight: 15, standard: "W3C CSP Level 3 / OWASP", evaluate: evaluateFrame },
  { id: "x-content-type-options", header: "x-content-type-options", title: "MIME Sniffing Protection", description: "Checks for the only effective MIME-sniffing protection value.", recommendation: "Set X-Content-Type-Options: nosniff on every applicable response.", attackVector: "MIME confusion and script execution", severity: "medium", weight: 15, standard: "WHATWG Fetch / OWASP", evaluate: (value) => value?.toLowerCase().trim() === "nosniff" ? { status: "pass", summary: "MIME sniffing is disabled.", evidence: ["X-Content-Type-Options is nosniff."], confidence: "high" } : { status: value ? "warn" : "fail", severity: "medium", summary: "The required nosniff value is not configured.", evidence: [value ? `Observed value: ${value}` : "Header not observed."], confidence: "high" } },
  { id: "referrer-policy", header: "referrer-policy", title: "Referrer Policy", description: "Evaluates explicit policy values while accounting for modern browser fallback behavior.", recommendation: "Set strict-origin-when-cross-origin, no-referrer, same-origin, or strict-origin explicitly.", attackVector: "Sensitive URL and browsing-context leakage", severity: "medium", weight: 10, standard: "W3C Referrer Policy / OWASP", evaluate: evaluateReferrer },
  { id: "permissions-policy", header: "permissions-policy", title: "Permissions Policy", description: "Checks whether common sensitive capabilities are explicitly restricted.", recommendation: "Explicitly disable unused features, especially camera, microphone, and geolocation.", attackVector: "Unnecessary browser capability exposure", severity: "low", weight: 10, standard: "W3C Permissions Policy / OWASP", evaluate: evaluatePermissions },
];
