export type Severity = "critical" | "high" | "medium" | "low" | "secure";
export type RuleStatus = "pass" | "warn" | "fail";

export interface HeaderRule {
  id: string;
  header: string;
  title: string;
  description: string;
  recommendation: string;
  attackVector: string;
  severity: Exclude<Severity, "secure">;
  weight: number;
  evaluate: (value: string | null) => Pick<HeaderFinding, "status" | "summary">;
}

export interface HeaderFinding {
  id: string;
  header: string;
  title: string;
  value: string | null;
  description: string;
  recommendation: string;
  attackVector: string;
  severity: Severity;
  status: RuleStatus;
  summary: string;
  weight: number;
  earned: number;
}

export interface ScanResult {
  requestedUrl: string;
  finalUrl: string;
  statusCode: number;
  scannedAt: string;
  durationMs: number;
  score: number;
  grade: string;
  passed: number;
  total: number;
  findings: HeaderFinding[];
}
