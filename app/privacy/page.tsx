import type { Metadata } from "next";
import { DocumentPage } from "@/components/document-page";

export const metadata: Metadata = { title: "Privacy — CollabShield" };
export default function PrivacyPage() { return <DocumentPage label="PRIVACY" title="Minimal data by default">
  <p>Last updated: September 19, 2026.</p><h2>Scan data</h2><p>CollabShield processes submitted public URLs to perform the requested scan. It does not provide user accounts, maintain a scan-history database, or intentionally retain report contents.</p>
  <h2>Operational data</h2><p>The application creates a random request identifier and logs timing, score, event status, and a truncated one-way hash of the target. Hosting, rate-limit, and monitoring providers may process IP addresses and request metadata under their own policies.</p>
  <h2>Local processing</h2><p>Downloaded reports and imported comparison reports remain in your browser unless you choose to share them.</p>
  <h2>Contact</h2><p>Use the official CollabCircle website linked from the application for privacy questions or deletion requests relating to provider logs.</p>
  </DocumentPage>; }
