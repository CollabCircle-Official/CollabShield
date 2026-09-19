import { describe, expect, it } from "vitest";
import { normalizeTarget } from "./url-security";

describe("target normalization", () => {
  it("adds HTTPS to bare domains", () => expect(normalizeTarget("example.com").href).toBe("https://example.com/"));
  it("preserves HTTP URLs", () => expect(normalizeTarget("http://example.com/path").href).toBe("http://example.com/path"));
  it.each(["ftp://example.com", "https://user:pass@example.com", "https://example.com:8080"])("rejects unsupported target %s", (value) => {
    expect(() => normalizeTarget(value)).toThrow();
  });
});
