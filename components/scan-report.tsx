import type { ScanResult } from "@/lib/scanner/types";
import { AlertIcon, CheckIcon, GlobeIcon } from "./icons";
import { ScoreRing } from "./score-ring";

export function ScanReport({ result }: { result: ScanResult }) {
  return <section className="report" aria-live="polite">
    <div className="report-summary panel">
      <ScoreRing score={result.score} grade={result.grade} />
      <div className="summary-copy"><span className="eyebrow">SCAN COMPLETE</span><h2>{result.grade.startsWith("A") ? "Strong security posture" : result.score >= 65 ? "Room for improvement" : "Security headers need attention"}</h2>
        <p>{result.passed} of {result.total} protections passed on <strong>{new URL(result.finalUrl).hostname}</strong>.</p>
        <div className="metadata"><span><GlobeIcon /> HTTP {result.statusCode}</span><span>{result.durationMs} ms</span><span>{new Date(result.scannedAt).toLocaleString()}</span></div>
      </div>
    </div>
    <div className="report-heading"><div><span className="eyebrow">HEADER ANALYSIS</span><h2>Protection breakdown</h2></div><span>{result.findings.length} checks</span></div>
    <div className="findings">
      {result.findings.map((finding) => <details className={`finding ${finding.status}`} key={finding.id}>
        <summary><span className="finding-icon">{finding.status === "pass" ? <CheckIcon /> : <AlertIcon />}</span><span className="finding-title"><strong>{finding.title}</strong><code>{finding.header}</code></span><span className={`severity ${finding.severity}`}>{finding.severity}</span><span className="points">{finding.earned}/{finding.weight} pts</span></summary>
        <div className="finding-body"><p>{finding.summary}</p>{finding.value && <div><b>Observed value</b><code className="header-value">{finding.value}</code></div>}<div className="detail-grid"><div><b>Risk addressed</b><p>{finding.attackVector}</p></div><div><b>Recommendation</b><p>{finding.recommendation}</p></div></div></div>
      </details>)}
    </div>
    <p className="disclaimer">This automated scan reviews response headers only. It is not a substitute for a full security audit or penetration test.</p>
  </section>;
}
