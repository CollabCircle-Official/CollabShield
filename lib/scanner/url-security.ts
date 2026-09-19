import dns from "node:dns/promises";
import net from "node:net";

const BLOCKED_HOSTS = new Set(["localhost", "localhost.localdomain"]);

export function normalizeTarget(input: string): URL {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 2048) throw new Error("Enter a valid website URL.");
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    throw new Error("Only public HTTP or HTTPS URLs without credentials or custom ports are supported.");
  }
  let url: URL;
  try { url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`); }
  catch { throw new Error("Enter a valid website URL."); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) {
    throw new Error("Only public HTTP or HTTPS URLs without credentials or custom ports are supported.");
  }
  return url;
}

function isPrivateIp(address: string): boolean {
  const normalized = address.toLowerCase().replace(/^::ffff:/, "");
  if (net.isIPv4(normalized)) {
    const [a, b] = normalized.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  if (net.isIPv6(normalized)) {
    return normalized === "::" || normalized === "::1" || normalized.startsWith("fc") ||
      normalized.startsWith("fd") || /^fe[89ab]/.test(normalized) || normalized.startsWith("ff");
  }
  return true;
}

/** Reject hostnames resolving to local, private, link-local, or reserved networks. */
export interface ResolvedTarget { address: string; family: 4 | 6 }

export async function assertPublicTarget(url: URL): Promise<ResolvedTarget[]> {
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTS.has(hostname) || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new Error("Private and local network targets are not allowed.");
  }
  let addresses: { address: string; family: number }[];
  try { addresses = await dns.lookup(hostname, { all: true, verbatim: true }); }
  catch { throw new Error("The target domain could not be resolved."); }
  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) {
    throw new Error("Private and local network targets are not allowed.");
  }
  return addresses.map(({ address, family }) => ({ address, family: family as 4 | 6 }));
}
