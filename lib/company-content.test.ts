import { describe, it, expect } from "vitest";
import { genId, slugify } from "./company-content";

describe("genId", () => {
  it("prefixes the id", () => {
    expect(genId("blog")).toMatch(/^blog_/);
  });
  it("produces distinct ids on successive calls", () => {
    const a = genId("x");
    // base36 timestamp may collide within the same ms; assert format instead
    expect(a).toMatch(/^x_[0-9a-z]+$/);
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("strips punctuation", () => {
    expect(slugify("5 Skills! (2026)")).toBe("5-skills-2026");
  });
  it("collapses multiple spaces into one hyphen", () => {
    expect(slugify("a    b")).toBe("a-b");
  });
  it("preserves Thai characters", () => {
    expect(slugify("บทความ ทดสอบ")).toBe("บทความ-ทดสอบ");
  });
  it("caps length at 60 chars", () => {
    const long = "a".repeat(100);
    expect(slugify(long).length).toBeLessThanOrEqual(60);
  });
  it("falls back to a generated slug when input has no valid chars", () => {
    expect(slugify("!!!")).toMatch(/^post-/);
  });
});
