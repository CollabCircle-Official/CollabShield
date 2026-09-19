import { HEADER_RULES } from "./rules";
import type { HeaderFinding } from "./types";

export function gradeForScore(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

/** Evaluate all rules using each rule's evidence-based partial-credit ratio. */
export function evaluateHeaders(headers: Headers): { findings: HeaderFinding[]; score: number; grade: string } {
  const findings = HEADER_RULES.map((rule) => {
    const value = headers.get(rule.header);
    const assessment = rule.evaluate(value, headers);
    const defaultRatio = assessment.status === "pass" ? 1 : assessment.status === "warn" ? .5 : 0;
    const earned = Math.round(rule.weight * (assessment.earnedRatio ?? defaultRatio));
    const { evaluate: _evaluate, severity: defaultSeverity, ...metadata } = rule;
    void _evaluate;
    return {
      ...metadata,
      ...assessment,
      value,
      earned,
      evidence: assessment.evidence ?? [],
      confidence: assessment.confidence ?? "high",
      severity: assessment.status === "pass" ? "secure" as const : (assessment.severity ?? defaultSeverity),
    } satisfies HeaderFinding;
  });
  const score = Math.round(findings.reduce((sum, finding) => sum + finding.earned, 0));
  return { findings, score, grade: gradeForScore(score) };
}
