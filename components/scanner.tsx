"use client";

import { FormEvent, useState } from "react";
import type { ScanResult } from "@/lib/scanner/types";
import { ArrowIcon, ShieldIcon } from "./icons";
import { ScanReport } from "./scan-report";

export function Scanner() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const data = await response.json() as ScanResult | { error: string };
      if (!response.ok || "error" in data) throw new Error("error" in data ? data.error : "Scan failed.");
      setResult(data);
      requestAnimationFrame(() => document.querySelector(".report")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The scan could not be completed."); }
    finally { setLoading(false); }
  }

  return <><section id="scanner" className="scanner-card panel"><form onSubmit={submit}>
    <label htmlFor="target"><span className="label-icon"><ShieldIcon /></span><span><strong>Target URL</strong><small>Enter a public website to inspect</small></span></label>
    <div className="input-row"><span className="protocol">https://</span><input id="target" name="target" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="example.com" autoComplete="url" spellCheck="false" required disabled={loading} /><button disabled={loading || !url.trim()}>{loading ? <><span className="spinner" />Scanning…</> : <>Run security scan<ArrowIcon /></>}</button></div>
    <p className="form-note"><span /> Only public websites are scanned. No data is stored.</p>
    {error && <div className="error" role="alert">{error}</div>}
  </form></section>{result && <ScanReport result={result} />}</>;
}
