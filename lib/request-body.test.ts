import { describe, expect, it } from "vitest";
import { readScanBody } from "./request-body";

describe("bounded request JSON", () => {
  it("parses a normal scan request", async () => {
    await expect(readScanBody(new Request("http://local", { method: "POST", body: JSON.stringify({ url: "example.com" }) }))).resolves.toEqual({ url: "example.com" });
  });
  it("rejects a body over the byte limit even without relying on Content-Length", async () => {
    await expect(readScanBody(new Request("http://local", { method: "POST", body: JSON.stringify({ url: "x".repeat(5_000) }) }))).rejects.toThrow("too large");
  });
});
