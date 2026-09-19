export type Severity = "critical" | "high" | "medium" | "low" | "secure";
export type RuleStatus = "pass" | "warn" | "fail";
export type Confidence = "high" | "medium";

export interface RuleAssessment {
  status: RuleStatus;
  summary: string;
  severity?: Exclude<Severity, "secure">;
  earnedRatio?: number;
  evidence?: string[];
  confidence?: Confidence;
}

export interface HeaderRule {
  id: string;
  header: string;
  title: string;
  description: string;
  recommendation: string;
  attackVector: string;
  severity: Exclude<Severity, "secure">;
  weight: number;
  standard: string;
  evaluate: (value: string | null, headers: Headers) => RuleAssessment;
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
  standard: string;
  evidence: string[];
  confidence: Confidence;
}

export interface ScanResult {
  methodologyVersion: "2.0";
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
