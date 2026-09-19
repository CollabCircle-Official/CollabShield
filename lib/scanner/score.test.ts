import { describe, expect, it } from "vitest";
import { evaluateHeaders, gradeForScore } from "./score";

describe("security scoring", () => {
  it("awards 100 and A+ when all controls are strong", () => {
    const headers = new Headers({
      "content-security-policy": "default-src 'self'",
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "x-frame-options": "DENY",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "camera=(), microphone=()",
    });
    expect(evaluateHeaders(headers)).toMatchObject({ score: 100, grade: "A+" });
  });

  it("awards zero and F when every header is absent", () => {
    expect(evaluateHeaders(new Headers())).toMatchObject({ score: 0, grade: "F" });
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
