import { describe, expect, it } from "vitest";
import { evaluateHeaders, gradeForScore } from "./score";

describe("security scoring", () => {
  it("awards 100 and A+ when all controls are strong", () => {
    const headers = new Headers({
      "content-security-policy": "script-src 'nonce-random123' 'strict-dynamic'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "x-frame-options": "DENY",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "camera=(), microphone=(), geolocation=()",
    });
    expect(evaluateHeaders(headers)).toMatchObject({ score: 100, grade: "A+" });
  });

  it("gives limited fallback credit without claiming missing optional headers are vulnerabilities", () => {
    expect(evaluateHeaders(new Headers())).toMatchObject({ score: 9, grade: "F" });
  });

  it("recognizes a nonce and strict-dynamic compatibility policy", () => {
    const result = evaluateHeaders(new Headers({
      "content-security-policy": "base-uri 'self'; object-src 'none'; script-src 'nonce-random123' 'unsafe-inline' 'strict-dynamic' https: 'unsafe-eval'; require-trusted-types-for 'script'",
      "strict-transport-security": "max-age=31536000",
      "x-frame-options": "SAMEORIGIN",
      "x-content-type-options": "nosniff",
      "permissions-policy": "ch-ua-platform=*",
    }));
    expect(result).toMatchObject({ score: 85, grade: "A" });
    expect(result.findings[0]).toMatchObject({ status: "warn", severity: "medium", earned: 23 });
    expect(result.findings[0].evidence).toContain("unsafe-inline is a compatibility token and is ignored by modern CSP3 script processing here.");
  });

  it("accepts CSP frame-ancestors without legacy X-Frame-Options", () => {
    const result = evaluateHeaders(new Headers({ "content-security-policy": "default-src 'self'; frame-ancestors 'none'" }));
    expect(result.findings.find((finding) => finding.id === "x-frame-options")).toMatchObject({ status: "pass", earned: 15 });
  });

  it("gives partial credit to weak values", () => {
    const result = evaluateHeaders(new Headers({
      "content-security-policy": "script-src 'unsafe-inline'",
      "strict-transport-security": "max-age=60",
    }));
    expect(result.score).toBe(25);
  });

  it.each([[95, "A+"], [85, "A"], [75, "B"], [65, "C"], [50, "D"], [49, "F"]])("maps %i to %s", (score, grade) => {
    expect(gradeForScore(score as number)).toBe(grade);
  });
});
