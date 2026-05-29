// Thin wrapper around @vercel/kv for quiz timers and streak tracking.
// Falls back gracefully when KV_URL is not set (local dev).
import { createClient } from "@vercel/kv";

function getKv() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }
  return createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

export const kv = getKv();

// ── Quiz timer helpers ────────────────────────────────────────────────────────

export async function startQuizTimer(attemptId: string, durationSeconds: number) {
  if (!kv) return;
  const expiresAt = Date.now() + durationSeconds * 1000;
  await kv.set(`quiz:timer:${attemptId}`, expiresAt, { ex: durationSeconds + 60 });
}

export async function getRemainingTime(attemptId: string): Promise<number | null> {
  if (!kv) return null;
  const expiresAt = await kv.get<number>(`quiz:timer:${attemptId}`);
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

export async function clearQuizTimer(attemptId: string) {
  if (!kv) return;
  await kv.del(`quiz:timer:${attemptId}`);
}

// ── Rate limiting ─────────────────────────────────────────────────────────────

export async function checkRateLimit(key: string, limit: number, windowSeconds: number) {
  if (!kv) return { allowed: true, remaining: limit };
  const current = await kv.incr(`rate:${key}`);
  if (current === 1) {
    await kv.expire(`rate:${key}`, windowSeconds);
  }
  return { allowed: current <= limit, remaining: Math.max(0, limit - current) };
}
