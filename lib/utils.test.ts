import { describe, it, expect } from "vitest";
import { cn, formatBytes, formatNumber, formatDuration, nowSeconds, nowMs } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });
  it("filters falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });
  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });
  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
  });
  it("formats with decimals", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });
});

describe("formatNumber", () => {
  it("formats with commas", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });
  it("formats small numbers", () => {
    expect(formatNumber(42)).toBe("42");
  });
});

describe("formatDuration", () => {
  it("formats seconds", () => {
    expect(formatDuration(30)).toBe("30s");
  });
  it("formats minutes", () => {
    expect(formatDuration(90)).toBe("1m 30s");
  });
  it("formats hours", () => {
    expect(formatDuration(3661)).toBe("1h 1m 1s");
  });
});

describe("nowSeconds", () => {
  it("returns a number", () => {
    expect(typeof nowSeconds()).toBe("number");
  });
  it("returns current timestamp in seconds", () => {
    const before = Math.floor(Date.now() / 1000);
    const result = nowSeconds();
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(before + 1);
  });
});

describe("nowMs", () => {
  it("returns a number close to Date.now()", () => {
    const before = Date.now();
    const result = nowMs();
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(before + 100);
  });
});
