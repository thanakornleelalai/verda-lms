// Secure token management — stored in VerificationToken (Prisma / NextAuth table)

import { randomBytes } from "crypto";
import { db } from "@/lib/db";

// In-memory fallback store for dev/mock mode (no DB)
const memStore = new Map<string, { token: string; expires: number }>();

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex"); // 64 hex chars
}

// ── Store token ────────────────────────────────────────────────────────────────

export async function createToken(
  identifier: string,
  ttlMs = 60 * 60 * 1000, // 1 hour default
): Promise<string> {
  const token = generateToken();
  const expires = new Date(Date.now() + ttlMs);

  // Try DB first
  try {
    await db.verificationToken.deleteMany({ where: { identifier } });
    await db.verificationToken.create({ data: { identifier, token, expires } });
  } catch {
    // Fallback: in-memory store
    memStore.set(identifier, { token, expires: expires.getTime() });
  }

  return token;
}

// ── Verify & consume token ─────────────────────────────────────────────────────

export async function verifyAndConsumeToken(
  identifier: string,
  token: string,
): Promise<{ valid: boolean; error?: string }> {
  // Try DB first
  try {
    const record = await db.verificationToken.findUnique({
      where: { identifier_token: { identifier, token } },
    });

    if (!record) return { valid: false, error: "token ไม่ถูกต้องหรือหมดอายุแล้ว" };

    if (record.expires < new Date()) {
      await db.verificationToken.deleteMany({ where: { identifier } });
      return { valid: false, error: "token หมดอายุแล้ว กรุณาขอใหม่" };
    }

    // Consume
    await db.verificationToken.deleteMany({ where: { identifier } });
    return { valid: true };
  } catch {
    // Fallback: in-memory
    const entry = memStore.get(identifier);
    if (!entry) return { valid: false, error: "token ไม่ถูกต้องหรือหมดอายุแล้ว" };
    if (Date.now() > entry.expires) {
      memStore.delete(identifier);
      return { valid: false, error: "token หมดอายุแล้ว กรุณาขอใหม่" };
    }
    if (entry.token !== token) return { valid: false, error: "token ไม่ถูกต้อง" };
    memStore.delete(identifier);
    return { valid: true };
  }
}

// ── Peek (check without consuming) ────────────────────────────────────────────

export async function peekToken(
  identifier: string,
  token: string,
): Promise<boolean> {
  try {
    const record = await db.verificationToken.findUnique({
      where: { identifier_token: { identifier, token } },
    });
    return !!record && record.expires > new Date();
  } catch {
    const entry = memStore.get(identifier);
    return !!entry && entry.token === token && Date.now() <= entry.expires;
  }
}

// ── Identifiers convention ─────────────────────────────────────────────────────

export const tokenKey = {
  passwordReset: (email: string) => `pwd_reset:${email}`,
  emailVerify: (email: string) => `email_verify:${email}`,
};
