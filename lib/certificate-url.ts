// Pure URL builders for certificate verification + QR code.
// Kept out of "use server" actions so they can stay synchronous.

export function getCertVerifyUrl(certId: string, locale = "th"): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  return `${base}/${locale}/certificate/verify/${certId}`;
}

export function getCertQRCodeUrl(certId: string, size = 160): string {
  const verifyUrl = getCertVerifyUrl(certId);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(verifyUrl)}&color=1A2320&bgcolor=ffffff&margin=6`;
}
