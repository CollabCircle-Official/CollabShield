import type { ScanResult } from "@/lib/scanner/types";
import { AlertIcon, CheckIcon, GlobeIcon } from "./icons";
import { ScoreRing } from "./score-ring";

export function ScanReport({ result }: { result: ScanResult }) {
  return <section className="report" aria-live="polite">
    <div className="report-summary panel">
      <ScoreRing score={result.score} grade={result.grade} />
      <div className="summary-copy"><span className="eyebrow">SCAN COMPLETE · ANALYZER 2.0</span><h2>{result.grade.startsWith("A") ? "Strong header configuration" : result.score >= 65 ? "Defense-in-depth opportunities" : "Security headers need attention"}</h2>
        <p>{result.passed} of {result.total} controls fully passed on <strong>{new URL(result.finalUrl).hostname}</strong>.</p>
        <div className="metadata"><span><GlobeIcon /> HTTP {result.statusCode}</span><span>{result.durationMs} ms</span><span>{new Date(result.scannedAt).toLocaleString()}</span><span>Methodology v{result.methodologyVersion}</span></div>
      </div>
    </div>
    <div className="report-heading"><div><span className="eyebrow">HEADER ANALYSIS</span><h2>Protection breakdown</h2></div><span>{result.findings.length} checks</span></div>
    <div className="findings">
      {result.findings.map((finding) => <details className={`finding ${finding.status}`} key={finding.id}>
        <summary><span className="finding-icon">{finding.status === "pass" ? <CheckIcon /> : <AlertIcon />}</span><span className="finding-title"><strong>{finding.title}</strong><code>{finding.header}</code></span><span className={`severity ${finding.severity}`}>{finding.severity}</span><span className="points">{finding.earned}/{finding.weight} pts</span></summary>
        <div className="finding-body"><p>{finding.summary}</p><div className="finding-context"><span>Confidence: <strong>{finding.confidence}</strong></span><span>Reference: <strong>{finding.standard}</strong></span></div>{finding.evidence.length > 0 && <div className="evidence"><b>Analysis evidence</b><ul>{finding.evidence.map((item) => <li key={item}>{item}</li>)}</ul></div>}{finding.value && <div><b>Observed value</b><code className="header-value">{finding.value}</code></div>}<div className="detail-grid"><div><b>Threat mitigated</b><p>{finding.attackVector}</p></div><div><b>Recommendation</b><p>{finding.recommendation}</p></div></div></div>
      </details>)}
    </div>
    <p className="disclaimer">This grade describes observed response-header configuration—not confirmed vulnerabilities, overall site security, or certification. Results can vary by location, user agent, cookies, and target response.</p>
  </section>;
}
