import { describe, it, expect } from "vitest";
import { cn, formatPrice, formatDuration, formatNumber, getInitials, nameToHue } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });
  it("dedupes conflicting tailwind classes (last wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
  it("handles conditional/falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("formatPrice", () => {
  it("formats THB with no decimals", () => {
    const out = formatPrice(1990);
    expect(out).toContain("1,990");
  });
  it("formats zero", () => {
    expect(formatPrice(0)).toContain("0");
  });
  it("rounds to whole numbers", () => {
    const out = formatPrice(199.99);
    expect(out).not.toContain(".99");
  });
});

describe("formatDuration", () => {
  it("shows minutes only when under an hour", () => {
    expect(formatDuration(1800)).toBe("30 นาที");
  });
  it("shows hours and minutes", () => {
    expect(formatDuration(3900)).toBe("1 ชม. 5 นาที");
  });
  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0 นาที");
  });
  it("handles exactly one hour", () => {
    expect(formatDuration(3600)).toBe("1 ชม. 0 นาที");
  });
});

describe("formatNumber", () => {
  it("returns plain number below 1000", () => {
    expect(formatNumber(999)).toBe("999");
  });
  it("abbreviates thousands with K", () => {
    expect(formatNumber(1500)).toBe("1.5K");
  });
  it("abbreviates millions with M", () => {
    expect(formatNumber(2_400_000)).toBe("2.4M");
  });
  it("handles exact boundary 1000", () => {
    expect(formatNumber(1000)).toBe("1.0K");
  });
});

describe("getInitials", () => {
  it("takes first letters of first two words", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });
  it("uppercases", () => {
    expect(getInitials("alice smith")).toBe("AS");
  });
  it("caps at two letters for long names", () => {
    expect(getInitials("Anna Bella Clara")).toBe("AB");
  });
  it("handles single word", () => {
    expect(getInitials("Verda")).toBe("V");
  });
});

describe("nameToHue", () => {
  it("returns a hue between 0 and 359", () => {
    const hue = nameToHue("VERDA");
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  });
  it("is deterministic — same input gives same output", () => {
    expect(nameToHue("Alice")).toBe(nameToHue("Alice"));
  });
  it("differs for different inputs (typical case)", () => {
    expect(nameToHue("Alice")).not.toBe(nameToHue("Bob"));
  });
  it("handles empty string", () => {
    expect(nameToHue("")).toBe(0);
  });
});
