import type { Metadata } from "next";
import { DocumentPage } from "@/components/document-page";

export const metadata: Metadata = { title: "Terms and Responsible Use — CollabShield" };
export default function TermsPage() { return <DocumentPage label="TERMS" title="Responsible use">
  <p>Last updated: September 19, 2026.</p><h2>Authorized use</h2><p>You may scan only public systems you own or are authorized to assess. Do not use CollabShield to disrupt services, evade controls, or facilitate unlawful activity.</p>
  <h2>No certification</h2><p>Results are automated observations, not warranties, compliance certificates, penetration tests, or professional security advice.</p>
  <h2>Availability</h2><p>The service may enforce limits, reject targets, change methodology, or suspend access to protect users and infrastructure.</p>
  <h2>Disclaimer</h2><p>The service is provided as-is. You remain responsible for validating findings and safely testing remediation in your own environment.</p>
  </DocumentPage>; }
