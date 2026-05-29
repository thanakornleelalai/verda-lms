import { describe, it, expect } from "vitest";
import { getCertVerifyUrl, getCertQRCodeUrl } from "./certificate-url";

describe("getCertVerifyUrl", () => {
  it("builds a verify URL with default locale th", () => {
    expect(getCertVerifyUrl("cert_ux_001")).toMatch(/\/th\/certificate\/verify\/cert_ux_001$/);
  });
  it("respects the locale argument", () => {
    expect(getCertVerifyUrl("cert_ux_001", "en")).toMatch(/\/en\/certificate\/verify\/cert_ux_001$/);
  });
  it("includes a base origin", () => {
    expect(getCertVerifyUrl("abc")).toMatch(/^https?:\/\//);
  });
});

describe("getCertQRCodeUrl", () => {
  it("points at the qrserver API", () => {
    expect(getCertQRCodeUrl("cert_ux_001")).toContain("api.qrserver.com");
  });
  it("uses the default size 160 when unspecified", () => {
    expect(getCertQRCodeUrl("cert_ux_001")).toContain("size=160x160");
  });
  it("honors a custom size", () => {
    expect(getCertQRCodeUrl("cert_ux_001", 90)).toContain("size=90x90");
  });
  it("url-encodes the embedded verify URL", () => {
    // the verify URL's "://" must be percent-encoded inside the data= param
    // (protocol-agnostic: http or https depending on NEXT_PUBLIC_BASE_URL)
    expect(getCertQRCodeUrl("cert_ux_001")).toMatch(/data=https?%3A%2F%2F/);
  });
});
