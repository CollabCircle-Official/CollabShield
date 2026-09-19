import type { Metadata } from "next";
import { DocumentPage } from "@/components/document-page";

export const metadata: Metadata = { title: "Scoring Methodology — CollabShield", description: "How CollabShield evaluates HTTP response-header configuration." };

export default function MethodologyPage() {
  return <DocumentPage label="METHODOLOGY 2.1" title="Transparent by design">
    <p>CollabShield evaluates the response returned to its server-side scanner. The grade describes observed header configuration, not the overall security of a website.</p>
    <h2>Weighted controls</h2>
    <table><thead><tr><th>Control</th><th>Weight</th></tr></thead><tbody>
      <tr><td>Content Security Policy</td><td>30</td></tr><tr><td>HTTP Strict Transport Security</td><td>20</td></tr><tr><td>Frame protection</td><td>15</td></tr><tr><td>MIME sniffing protection</td><td>15</td></tr><tr><td>Referrer Policy</td><td>10</td></tr><tr><td>Permissions Policy</td><td>10</td></tr>
    </tbody></table>
    <h2>Interpretation</h2><p>Rules award evidence-based partial credit. Modern CSP semantics, browser defaults, compatibility tokens, and overlapping controls are considered. Supplemental cross-origin and disclosure observations do not affect the score because their suitability is application-dependent.</p>
    <h2>Limitations</h2><p>A response can vary by geography, user agent, authentication state, cookies, path, and deployment edge. CollabShield does not exploit targets, execute application code, or certify compliance. A finding is not proof of a vulnerability.</p>
  </DocumentPage>;
}
