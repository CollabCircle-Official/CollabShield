import { describe, expect, it } from "vitest";
import { collectObservations } from "./observations";

describe("supplemental security observations", () => {
  it("reports cross-origin controls without affecting the main score", () => {
    const observations = collectObservations(new Headers({
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-resource-policy": "same-site",
      server: "example-server",
    }), new URL("https://example.com"));
    expect(observations.find((item) => item.id === "coop")).toMatchObject({ status: "configured", value: "same-origin" });
    expect(observations.find((item) => item.id === "technology-disclosure")).toMatchObject({ status: "disclosure" });
    expect(observations.find((item) => item.id === "transport")).toMatchObject({ status: "configured", value: "HTTPS" });
  });

  it("marks unencrypted final transport as an advisory", () => {
    expect(collectObservations(new Headers(), new URL("http://example.com")).find((item) => item.id === "transport")).toMatchObject({ status: "advisory", value: "HTTP" });
  });

  it("detects static mixed-content references and an HTML referrer policy", () => {
    const observations = collectObservations(new Headers(), new URL("https://example.com"), [], null, '<meta name="referrer" content="no-referrer"><script src="http://cdn.example/a.js"></script>');
    expect(observations.find((item) => item.id === "mixed-content")).toMatchObject({ status: "advisory" });
    expect(observations.find((item) => item.id === "html-referrer-policy")).toMatchObject({ status: "configured" });
  });
});
