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

/** Evaluate all rules. Warnings receive half of the rule's points. */
export function evaluateHeaders(headers: Headers): { findings: HeaderFinding[]; score: number; grade: string } {
  const findings = HEADER_RULES.map((rule) => {
    const value = headers.get(rule.header);
    const assessment = rule.evaluate(value);
    const earned = assessment.status === "pass" ? rule.weight : assessment.status === "warn" ? rule.weight / 2 : 0;
    return {
      ...rule,
      ...assessment,
      value,
      earned,
      severity: assessment.status === "pass" ? "secure" as const : rule.severity,
      evaluate: undefined,
    } as unknown as HeaderFinding;
  });
  const score = Math.round(findings.reduce((sum, finding) => sum + finding.earned, 0));
  return { findings, score, grade: gradeForScore(score) };
}
