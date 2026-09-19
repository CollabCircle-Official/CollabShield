import { describe, expect, it } from "vitest";
import { analyzeCsp, parseCsp } from "./csp";

describe("CSP analysis", () => {
  it("parses multiple enforced policies", () => {
    expect(parseCsp("default-src 'self', require-trusted-types-for 'script'")).toHaveLength(2);
  });

  it("understands that nonce-based strict CSP makes unsafe-inline inactive", () => {
    const result = analyzeCsp("script-src 'nonce-abc123' 'unsafe-inline' 'strict-dynamic'; object-src 'none'; base-uri 'self'");
    expect(result).toMatchObject({ strong: true, hasNonceOrHash: true, hasStrictDynamic: true, unsafeInlineEffective: false });
  });

  it("detects an actually effective unsafe-inline policy", () => {
    expect(analyzeCsp("script-src 'self' 'unsafe-inline'")).toMatchObject({ unsafeInlineEffective: true, strong: false });
  });
});
