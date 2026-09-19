import tls from "node:tls";
import type { TlsDetails } from "./types";
import type { ResolvedTarget } from "./url-security";

/** Inspects the certificate through the same validated IP while verifying the requested hostname. */
export function inspectTls(url: URL, target: ResolvedTarget): Promise<TlsDetails | null> {
  if (url.protocol !== "https:") return Promise.resolve(null);
  return new Promise((resolve) => {
    const socket = tls.connect({ host: target.address, port: 443, servername: url.hostname, rejectUnauthorized: true, timeout: 5_000 }, () => {
      const certificate = socket.getPeerCertificate();
      const validTo = new Date(certificate.valid_to);
      resolve({
        protocol: socket.getProtocol() ?? "unknown",
        validFrom: new Date(certificate.valid_from).toISOString(),
        validTo: validTo.toISOString(),
        daysRemaining: Math.max(0, Math.floor((validTo.getTime() - Date.now()) / 86_400_000)),
        issuer: [certificate.issuer?.O ?? certificate.issuer?.CN ?? "unknown"].flat().join(", "),
      });
      socket.end();
    });
    socket.once("timeout", () => { socket.destroy(); resolve(null); });
    socket.once("error", () => resolve(null));
  });
}
