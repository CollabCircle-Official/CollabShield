import type { HeaderRule } from "./types";

const present = (label: string) => (value: string | null) =>
  value
    ? { status: "pass" as const, summary: `${label} is configured.` }
    : { status: "fail" as const, summary: `${label} is missing.` };

/** OWASP-aligned rules and their contribution to the 100-point score. */
export const HEADER_RULES: HeaderRule[] = [
  {
    id: "content-security-policy",
    header: "content-security-policy",
    title: "Content Security Policy",
    description: "Restricts which scripts, styles, frames, and other resources the browser may load.",
    recommendation: "Deploy a restrictive Content-Security-Policy; avoid unsafe-inline and unsafe-eval where possible.",
    attackVector: "Cross-Site Scripting (XSS) and content injection",
    severity: "critical",
    weight: 30,
    evaluate: (value) => {
      if (!value) return { status: "fail", summary: "CSP is missing, leaving content execution unrestricted." };
      if (/unsafe-inline|unsafe-eval/i.test(value)) return { status: "warn", summary: "CSP exists but permits unsafe script behavior." };
      return { status: "pass", summary: "CSP is present without obvious unsafe script directives." };
    },
  },
  {
    id: "strict-transport-security",
    header: "strict-transport-security",
    title: "HTTP Strict Transport Security",
    description: "Forces future browser connections to use HTTPS instead of insecure HTTP.",
    recommendation: "Set Strict-Transport-Security with max-age=31536000 and consider includeSubDomains and preload.",
    attackVector: "Man-in-the-Middle eavesdropping and SSL stripping",
    severity: "high",
    weight: 20,
    evaluate: (value) => {
      if (!value) return { status: "fail", summary: "HSTS is missing." };
      const maxAge = value.match(/max-age\s*=\s*(\d+)/i);
      if (!maxAge || Number(maxAge[1]) < 15_552_000) return { status: "warn", summary: "HSTS max-age is shorter than the recommended baseline." };
      return { status: "pass", summary: "HSTS enforces HTTPS for a meaningful duration." };
    },
  },
  {
    id: "x-frame-options",
    header: "x-frame-options",
    title: "Frame Protection",
    description: "Controls whether another site may embed the page in a frame.",
    recommendation: "Set X-Frame-Options to DENY or SAMEORIGIN, and reinforce it with CSP frame-ancestors.",
    attackVector: "Clickjacking and UI redress attacks",
    severity: "high",
    weight: 15,
    evaluate: (value) => {
      if (!value) return { status: "fail", summary: "Frame embedding protection is missing." };
      if (!/^(deny|sameorigin)$/i.test(value.trim())) return { status: "warn", summary: "The frame policy is present but uses an unsupported or weak value." };
      return { status: "pass", summary: "Cross-origin framing is restricted." };
    },
  },
  {
    id: "x-content-type-options",
    header: "x-content-type-options",
    title: "MIME Sniffing Protection",
    description: "Prevents browsers from interpreting files as a different content type.",
    recommendation: "Set X-Content-Type-Options: nosniff on every response.",
    attackVector: "MIME confusion and script execution",
    severity: "medium",
    weight: 15,
    evaluate: (value) => value?.toLowerCase().trim() === "nosniff"
      ? { status: "pass", summary: "MIME sniffing is disabled." }
      : { status: value ? "warn" : "fail", summary: "The required nosniff value is not configured." },
  },
  {
    id: "referrer-policy",
    header: "referrer-policy",
    title: "Referrer Policy",
    description: "Limits sensitive path and query information sent when navigating to another site.",
    recommendation: "Use strict-origin-when-cross-origin, no-referrer, or a similarly restrictive policy.",
    attackVector: "Sensitive URL and browsing-context leakage",
    severity: "medium",
    weight: 10,
    evaluate: present("Referrer-Policy"),
  },
  {
    id: "permissions-policy",
    header: "permissions-policy",
    title: "Permissions Policy",
    description: "Restricts access to powerful browser capabilities such as camera, microphone, and geolocation.",
    recommendation: "Set Permissions-Policy and explicitly disable features the application does not need.",
    attackVector: "Abuse of browser sensors and privileged capabilities",
    severity: "low",
    weight: 10,
    evaluate: present("Permissions-Policy"),
  },
];
