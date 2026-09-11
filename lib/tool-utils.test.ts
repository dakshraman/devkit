import { describe, expect, it } from "vitest";
import {
  base64Decode,
  base64Encode,
  compareText,
  convertCase,
  createLorem,
  jsonSummary,
  md5Digest,
  randomUuid,
  safeJsonParse,
  strengthScore,
} from "@/lib/tool-utils";

describe("base64", () => {
  it("round-trips utf-8 text", () => {
    expect(base64Decode(base64Encode("hello world"))).toBe("hello world");
  });
  it("handles unicode", () => {
    expect(base64Decode(base64Encode("héllo ✓"))).toBe("héllo ✓");
  });
});

describe("convertCase", () => {
  it("converts common cases and trims", () => {
    const cases = convertCase("DevKit toolkit example");
    expect(cases.camel).toBe("devKitToolkitExample");
    expect(cases.pascal).toBe("DevKitToolkitExample");
    expect(cases.snake).toBe("dev_kit_toolkit_example");
    expect(cases.kebab).toBe("dev-kit-toolkit-example");
    expect(cases.upper).toBe("DEV KIT TOOLKIT EXAMPLE");
    expect(cases.words).toBe("dev kit toolkit example");
  });
});

describe("strengthScore", () => {
  it("scores weak and strong passwords differently", () => {
    const weak = strengthScore("a");
    const strong = strengthScore("P4ssw0rd!x9#qZ");
    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.label).toMatch(/strong/i);
  });
});

describe("md5Digest", () => {
  it("matches the known MD5 of 'abc'", () => {
    expect(md5Digest("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
  });
});

describe("compareText", () => {
  it("returns a line-diff array for identical text", () => {
    const result = compareText("abcd", "abcd");
    expect(Array.isArray(result)).toBe(true);
    expect(result.some((part) => part.value === "abcd")).toBe(true);
  });
});

describe("jsonSummary", () => {
  it("counts value types (including nested values)", () => {
    const summary = jsonSummary({ a: 1, b: "x", c: [1], d: null, e: true });
    expect(summary.numbers).toBe(2);
    expect(summary.strings).toBe(1);
    expect(summary.arrays).toBe(1);
    expect(summary.nulls).toBe(1);
    expect(summary.booleans).toBe(1);
  });
});

describe("safeJsonParse", () => {
  it("parses valid JSON and reports invalid input", () => {
    expect(safeJsonParse('{"ok":true}')).toEqual({ ok: true, value: { ok: true } });
    const bad = safeJsonParse("{nope");
    expect(bad.ok).toBe(false);
  });
});

describe("createLorem", () => {
  it("respects paragraph counts", () => {
    const text = createLorem({ paragraphs: 2, sentencesPerParagraph: 1 });
    expect(text.split("\n\n")).toHaveLength(2);
  });
});

describe("randomUuid", () => {
  it("generates unique v4-ish uuids", () => {
    const a = randomUuid();
    const b = randomUuid();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).not.toBe(b);
  });
});