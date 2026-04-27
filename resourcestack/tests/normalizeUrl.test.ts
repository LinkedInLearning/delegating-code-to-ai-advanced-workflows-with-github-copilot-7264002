import { describe, expect, it } from "vitest";
import { normalizeUrl } from "@/lib/normalizeUrl";

describe("normalizeUrl", () => {
  it("lowercases hostname", () => {
    expect(normalizeUrl("https://Example.com/path")).toBe("https://example.com/path");
  });

  it("rejects non-http(s)", () => {
    expect(() => normalizeUrl("ftp://example.com")).toThrow();
  });

  it("should treat trailing slash variants as the same (this currently FAILS until the course bug is fixed)", () => {
    // Intended desired behavior:
    // https://example.com and https://example.com/ should normalize to the same string.
    const a = normalizeUrl("https://example.com");
    const b = normalizeUrl("https://example.com/");
    expect(a).toBe(b);
  });
});
