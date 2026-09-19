"use client";

import { ChangeEvent, useRef, useState } from "react";
import type { ScanResult } from "@/lib/scanner/types";
import { AlertIcon, CheckIcon, GlobeIcon } from "./icons";
import { ScoreRing } from "./score-ring";

export function ScanReport({ result }: { result: ScanResult }) {
  const [copied, setCopied] = useState(false);
  const [comparison, setComparison] = useState<{ score: number; grade: string; scannedAt: string } | null>(null);
  const importRef = useRef<HTMLInputElement>(null);

  function downloadReport() {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = `collabshield-${new URL(result.finalUrl).hostname}-${result.scannedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(href);
  }

  async function copySummary() {
    await navigator.clipboard.writeText(`CollabShield: ${new URL(result.finalUrl).hostname} scored ${result.score}/100 (${result.grade}). ${result.passed}/${result.total} controls fully passed.`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function importComparison(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const previous = JSON.parse(await file.text()) as Partial<ScanResult>;
      if (typeof previous.score !== "number" || typeof previous.grade !== "string" || typeof previous.scannedAt !== "string") throw new Error("Invalid report");
      setComparison({ score: previous.score, grade: previous.grade, scannedAt: previous.scannedAt });
    } catch { setComparison(null); }
    event.target.value = "";
  }

  return <section className="report" aria-live="polite">
    <div className="report-summary panel">
      <ScoreRing score={result.score} grade={result.grade} />
      <div className="summary-copy"><span className="eyebrow">SCAN COMPLETE · ANALYZER {result.methodologyVersion}</span><h2>{result.grade.startsWith("A") ? "Strong header configuration" : result.score >= 65 ? "Defense-in-depth opportunities" : "Security headers need attention"}</h2>
        <p>{result.passed} of {result.total} controls fully passed on <strong>{new URL(result.finalUrl).hostname}</strong>.</p>
        <div className="metadata"><span><GlobeIcon /> HTTP {result.statusCode}</span><span>{result.durationMs} ms</span><span>{new Date(result.scannedAt).toLocaleString()}</span><span>Methodology v{result.methodologyVersion}</span></div>
      </div>
    </div>
    <div className="report-actions" aria-label="Report actions">
      <button type="button" onClick={downloadReport}>Download JSON</button>
      <button type="button" onClick={copySummary}>{copied ? "Copied" : "Copy summary"}</button>
      <button type="button" onClick={() => importRef.current?.click()}>Compare report</button>
      <button type="button" onClick={() => window.print()}>Print report</button>
      <input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={importComparison} tabIndex={-1} />
    </div>
    {comparison && <div className="comparison" role="status"><strong>Score comparison</strong><span>{comparison.score} ({comparison.grade}) → {result.score} ({result.grade})</span><span className={result.score - comparison.score >= 0 ? "positive" : "negative"}>{result.score - comparison.score >= 0 ? "+" : ""}{result.score - comparison.score} points</span><small>Previous scan: {new Date(comparison.scannedAt).toLocaleString()}</small></div>}
    {result.redirectChain.length > 1 && <details className="redirect-chain">
      <summary>Redirect chain · {result.redirectChain.length - 1} redirect{result.redirectChain.length > 2 ? "s" : ""}</summary>
      <ol>{result.redirectChain.map((hop) => <li key={`${hop.statusCode}-${hop.url}`}><span>{hop.statusCode}</span><code>{hop.url}</code></li>)}</ol>
    </details>}
    <div className="report-heading"><div><span className="eyebrow">HEADER ANALYSIS</span><h2>Protection breakdown</h2></div><span>{result.findings.length} checks</span></div>
    <div className="findings">
      {result.findings.map((finding) => <details className={`finding ${finding.status}`} key={finding.id}>
        <summary><span className="finding-icon">{finding.status === "pass" ? <CheckIcon /> : <AlertIcon />}</span><span className="finding-title"><strong>{finding.title}</strong><code>{finding.header}</code></span><span className={`severity ${finding.severity}`}>{finding.severity}</span><span className="points">{finding.earned}/{finding.weight} pts</span></summary>
        <div className="finding-body"><p>{finding.summary}</p><div className="finding-context"><span>Confidence: <strong>{finding.confidence}</strong></span><span>Reference: <strong>{finding.standard}</strong></span></div>{finding.evidence.length > 0 && <div className="evidence"><b>Analysis evidence</b><ul>{finding.evidence.map((item) => <li key={item}>{item}</li>)}</ul></div>}{finding.value && <div><b>Observed value</b><code className="header-value">{finding.value}</code></div>}<div className="detail-grid"><div><b>Threat mitigated</b><p>{finding.attackVector}</p></div><div><b>Recommendation</b><p>{finding.recommendation}</p></div></div></div>
      </details>)}
    </div>
    <div className="report-heading supplemental-heading"><div><span className="eyebrow">SUPPLEMENTAL SIGNALS</span><h2>Advanced observations</h2></div><span>Not scored</span></div>
    <div className="observations">
      {result.observations.map((observation) => <article key={observation.id} className={`observation ${observation.status}`}>
        <div><strong>{observation.title}</strong><span>{observation.status}</span></div>
        <p>{observation.summary}</p>
        {observation.value && <code>{observation.value}</code>}
      </article>)}
    </div>
    <p className="disclaimer">This grade describes observed response-header configuration—not confirmed vulnerabilities, overall site security, or certification. Results can vary by location, user agent, cookies, and target response.</p>
  </section>;
}
