// Shared in-memory OTP store (demo only — use Redis/Upstash KV with TTL in production)

export const DEV_OTP = "123456";

type OtpEntry = { code: string; expiresAt: number };
const store = new Map<string, OtpEntry>();

export function storeOtp(key: string, code: string, ttlMs = 5 * 60 * 1000) {
  store.set(key, { code, expiresAt: Date.now() + ttlMs });
}

export function checkOtp(key: string, code: string): { valid: boolean; error?: string } {
  const entry = store.get(key);
  if (!entry) return { valid: false, error: "ไม่พบ OTP กรุณาขอใหม่" };
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return { valid: false, error: "OTP หมดอายุแล้ว กรุณาขอใหม่" };
  }
  if (entry.code !== code.trim()) return { valid: false, error: "OTP ไม่ถูกต้อง" };
  return { valid: true };
}

export function consumeOtp(key: string) {
  store.delete(key);
}
