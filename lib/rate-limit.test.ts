import { describe, expect, it } from "vitest";
import { consumeScanQuota } from "./rate-limit";

describe("scan rate limiting", () => {
  it("allows ten requests and rejects the eleventh within a window", () => {
    const id = `test-${Math.random()}`;
    for (let index = 0; index < 10; index += 1) expect(consumeScanQuota(id, 1_000).allowed).toBe(true);
    expect(consumeScanQuota(id, 1_000)).toMatchObject({ allowed: false, remaining: 0, retryAfter: 60 });
  });

  it("opens a fresh bucket after the window", () => {
    const id = `test-${Math.random()}`;
    consumeScanQuota(id, 1_000);
    expect(consumeScanQuota(id, 61_000)).toMatchObject({ allowed: true, remaining: 9 });
  });
});
