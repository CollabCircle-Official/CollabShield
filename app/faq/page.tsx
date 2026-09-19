import type { Metadata } from "next";
import { DocumentPage } from "@/components/document-page";

export const metadata: Metadata = { title: "FAQ — ShieldCircle" };
export default function FaqPage() { return <DocumentPage label="FAQ" title="Questions, answered">
  <h2>Does a low grade mean a site is vulnerable?</h2><p>No. It means header-level defenses were not observed or were partially configured in the scanned response.</p>
  <h2>Can a major website receive a warning?</h2><p>Yes. Complex sites may use compatibility policies, return different headers by region, or intentionally accept a defense-in-depth tradeoff. ShieldCircle explains the evidence instead of claiming exploitation.</p>
  <h2>Does ShieldCircle retain URLs?</h2><p>The application does not store scan history. Production infrastructure may create short-lived operational logs; target identifiers are hashed by the application.</p>
  <h2>Why can results change?</h2><p>Headers can vary by CDN edge, request headers, experiments, authentication, redirects, and deployment changes.</p>
  <h2>May I scan any website?</h2><p>Use the service only for lawful, authorized assessment. Respect target terms, rate limits, and applicable law.</p>
  </DocumentPage>; }
