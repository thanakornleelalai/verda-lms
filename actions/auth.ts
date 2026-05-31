"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { storeOtp, checkOtp, consumeOtp, DEV_OTP } from "@/lib/otp-store";
import { createToken, verifyAndConsumeToken, tokenKey } from "@/lib/tokens";
import { sendPasswordResetEmail, sendEmailVerificationEmail, sendWelcomeEmail } from "@/lib/resend";
import { checkRateLimit } from "@/lib/kv";

// ── Phone number helpers ──────────────────────────────────────────────────────

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s\-\(\)]/g, "");
  if (digits.startsWith("0")) return "+66" + digits.slice(1);
  if (digits.startsWith("66")) return "+" + digits;
  return digits;
}

function phoneToEmail(phone: string): string {
  return `${phone.replace(/\+/g, "")}@phone.verda.dev`;
}

// ── OTP — Signup flow ─────────────────────────────────────────────────────────

export async function sendOTP(rawPhone: string): Promise<{ success: boolean; error?: string }> {
  const phone = normalizePhone(rawPhone);

  if (!/^\+66[6-9]\d{8}$/.test(phone)) {
    return { success: false, error: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ตัวอย่าง: 081-234-5678)" };
  }

  // Rate limit: max 3 OTP requests per phone per 10 minutes
  const rl = await checkRateLimit(`otp:signup:${phone}`, 3, 600);
  if (!rl.allowed) {
    return { success: false, error: "ขอ OTP บ่อยเกินไป กรุณารอ 10 นาทีแล้วลองใหม่" };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (db.user as any).findUnique({ where: { phone } });
    if (existing) return { success: false, error: "เบอร์โทรนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ" };
  } catch {
    // DB unavailable — skip duplicate check
  }

  const code =
    process.env.NODE_ENV === "production"
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : DEV_OTP;

  storeOtp(`signup_${phone}`, code);

  // Production: await smsClient.send({ to: phone, body: `OTP: ${code} (หมดอายุใน 5 นาที)` })

  return { success: true };
}

export async function verifyOTP(rawPhone: string, code: string): Promise<{ valid: boolean; error?: string }> {
  const phone = normalizePhone(rawPhone);
  return checkOtp(`signup_${phone}`, code);
}

export async function registerWithPhone(data: {
  phone: string;
  name: string;
  password: string;
  otp: string;
}): Promise<{ error?: string }> {
  const phone = normalizePhone(data.phone);
  const { name, password, otp } = data;

  if (!name || !phone || !password) return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  if (password.length < 8) return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };

  const otpResult = checkOtp(`signup_${phone}`, otp);
  if (!otpResult.valid) return { error: otpResult.error ?? "OTP ไม่ถูกต้อง" };
  consumeOtp(`signup_${phone}`);

  const derivedEmail = phoneToEmail(phone);
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (db.user as any).findUnique({ where: { phone } });
    if (existing) return { error: "เบอร์โทรนี้มีบัญชีอยู่แล้ว" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db.user as any).create({
      data: {
        name,
        phone,
        phoneVerified: new Date(),
        email: derivedEmail,
        passwordHash: hashedPassword,
        role: "STUDENT",
      },
    });
  } catch {
    // DB unavailable — proceed with mock sign-in for demo
  }

  await signIn("credentials", { email: derivedEmail, password, redirect: false });
  return {};
}

// ── OTP — Login flow ──────────────────────────────────────────────────────────

export async function sendLoginOTP(rawPhone: string): Promise<{ success: boolean; error?: string }> {
  const phone = normalizePhone(rawPhone);

  if (!/^\+66[6-9]\d{8}$/.test(phone)) {
    return { success: false, error: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ตัวอย่าง: 081-234-5678)" };
  }

  // Rate limit: max 3 OTP requests per phone per 10 minutes
  const rl = await checkRateLimit(`otp:login:${phone}`, 3, 600);
  if (!rl.allowed) {
    return { success: false, error: "ขอ OTP บ่อยเกินไป กรุณารอ 10 นาทีแล้วลองใหม่" };
  }

  // In dev/mock mode always allow; in production verify the account exists
  if (process.env.DATABASE_URL) {
    try {
      const derivedEmail = phoneToEmail(phone);
      const user = await db.user.findUnique({ where: { email: derivedEmail } });
      if (!user) return { success: false, error: "ไม่พบบัญชีด้วยเบอร์นี้ กรุณาสมัครสมาชิกก่อน" };
    } catch {
      return { success: false, error: "เกิดข้อผิดพลาด กรุณาลองใหม่" };
    }
  }

  const code =
    process.env.NODE_ENV === "production"
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : DEV_OTP;

  storeOtp(`login_${phone}`, code);

  // Production: await smsClient.send({ to: phone, body: `OTP: ${code} (หมดอายุใน 5 นาที)` })

  return { success: true };
}

export async function loginWithPhone(rawPhone: string, otp: string): Promise<{ error?: string }> {
  const phone = normalizePhone(rawPhone);

  const result = checkOtp(`login_${phone}`, otp);
  if (!result.valid) return { error: result.error ?? "OTP ไม่ถูกต้อง" };

  try {
    await signIn("phone-otp", { phone, otp, redirect: false });
    return {};
  } catch {
    return { error: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function loginWithPhonePassword(
  rawPhone: string,
  password: string
): Promise<{ error?: string }> {
  const phone = normalizePhone(rawPhone);

  if (!/^\+66[6-9]\d{8}$/.test(phone)) {
    return { error: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ตัวอย่าง: 081-234-5678)" };
  }

  try {
    await signIn("phone-password", { phone, password, redirect: false });
    return {};
  } catch {
    return { error: "เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง" };
  }
}

// ── Email auth ────────────────────────────────────────────────────────────────

export async function registerUser(formData: {
  name: string;
  email: string;
  password: string;
}): Promise<{ error?: string }> {
  const { name, email, password } = formData;

  if (!name?.trim() || !email?.trim() || !password) return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "รูปแบบอีเมลไม่ถูกต้อง" };
  if (password.length < 8) return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  if (name.trim().length < 2) return { error: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" };

  // Rate limit: max 5 register attempts per email per hour
  const rl = await checkRateLimit(`register:${email.toLowerCase()}`, 5, 3600);
  if (!rl.allowed) return { error: "พยายามสมัครสมาชิกบ่อยเกินไป กรุณารอสักครู่" };

  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { error: "อีเมลนี้มีบัญชีอยู่แล้ว" };

    const hashedPassword = await bcrypt.hash(password, 12);
    await db.user.create({ data: { name, email, passwordHash: hashedPassword, role: "STUDENT" } });
  } catch {
    // DB unavailable — proceed with mock sign-in for demo
  }

  await signIn("credentials", { email, password, redirect: false });
  return {};
}

export async function loginWithCredentials(formData: {
  email: string;
  password: string;
}): Promise<{ error?: string }> {
  if (!formData.email?.trim() || !formData.password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  }

  // Rate limit: max 10 attempts per email per 15 minutes
  const rl = await checkRateLimit(`login:email:${formData.email.toLowerCase()}`, 10, 900);
  if (!rl.allowed) {
    return { error: "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ 15 นาทีแล้วลองใหม่" };
  }

  try {
    await signIn("credentials", { email: formData.email, password: formData.password, redirect: false });
    return {};
  } catch {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }
}

// ── Role-aware login (1 user = 1 role) ──────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "นักเรียน",
  INSTRUCTOR: "ผู้สอน",
  ADMIN: "ผู้ดูแลระบบ",
  SUPERADMIN: "ผู้ดูแลระบบ",
};

/** Maps the login dropdown value → the DB roles that satisfy it. */
function rolesFor(selected: "student" | "instructor" | "admin"): string[] {
  if (selected === "admin") return ["ADMIN", "SUPERADMIN"];
  if (selected === "instructor") return ["INSTRUCTOR"];
  return ["STUDENT"];
}

/**
 * Validate credentials + selected role WITHOUT signing in.
 * The actual sign-in is done client-side (next-auth/react signIn) so the client
 * SessionProvider updates immediately — otherwise useSession() stays
 * "unauthenticated" and the UI appears logged out after a server-action login.
 *
 * Enforces 1 user = 1 role: account's single role must match the chosen portal.
 */
export async function validateRoleLogin(formData: {
  email: string;
  password: string;
  role: "student" | "instructor" | "admin";
}): Promise<{ error?: string }> {
  const { email, password, role } = formData;
  if (!email?.trim() || !password) return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };

  const rl = await checkRateLimit(`login:email:${email.toLowerCase()}`, 10, 900);
  if (!rl.allowed) return { error: "พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอ 15 นาทีแล้วลองใหม่" };

  const allowed = rolesFor(role);

  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { role: true, passwordHash: true, suspended: true },
    });
    if (user) {
      if (user.suspended) {
        return { error: "บัญชีนี้ถูกระงับการใช้งานโดยผู้ดูแลระบบ — กรุณาติดต่อทีมงาน" };
      }
      if (!user.passwordHash) {
        return { error: "บัญชีนี้ใช้การเข้าสู่ระบบด้วย Google/LINE" };
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
      if (!allowed.includes(user.role)) {
        return {
          error: `บัญชีนี้เป็นบทบาท “${ROLE_LABEL[user.role] ?? user.role}” — กรุณาเลือกบทบาทให้ตรงกับบัญชี`,
        };
      }
    }
    // user not found in DB → allow (dev-bypass accounts validated by signIn)
  } catch {
    // DB unavailable → skip pre-check, rely on client signIn
  }

  return {}; // validation passed — client performs the actual signIn
}

// ── Password Reset ─────────────────────────────────────────────────────────────

export async function requestPasswordReset(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  if (!email.trim()) return { success: false, error: "กรุณากรอกอีเมล" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "รูปแบบอีเมลไม่ถูกต้อง" };
  }

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak whether email exists — always return success
      return { success: true };
    }
    if (!user.passwordHash) {
      return { success: false, error: "บัญชีนี้ใช้ Social Login กรุณาเข้าสู่ระบบด้วย Google หรือ LINE" };
    }
  } catch {
    // DB unavailable — proceed (mock mode)
  }

  try {
    const token = await createToken(tokenKey.passwordReset(email), 60 * 60 * 1000);
    await sendPasswordResetEmail(email, token);
  } catch {
    return { success: false, error: "ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่" };
  }

  return { success: true };
}

export async function resetPassword(
  token: string,
  email: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword) return { success: false, error: "กรุณากรอกรหัสผ่านใหม่" };
  if (newPassword.length < 8) return { success: false, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  if (newPassword !== confirmPassword) return { success: false, error: "รหัสผ่านไม่ตรงกัน" };

  const result = await verifyAndConsumeToken(tokenKey.passwordReset(email), token);
  if (!result.valid) return { success: false, error: result.error };

  try {
    const hashed = await bcrypt.hash(newPassword, 12);
    await db.user.update({ where: { email }, data: { passwordHash: hashed } });
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่" };
  }
}

// ── Email Verification ─────────────────────────────────────────────────────────

export async function sendEmailVerification(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await createToken(tokenKey.emailVerify(email), 24 * 60 * 60 * 1000);
    await sendEmailVerificationEmail(email, token);
    return { success: true };
  } catch {
    return { success: false, error: "ไม่สามารถส่งอีเมลได้" };
  }
}

export async function verifyEmailToken(
  token: string,
  email: string,
): Promise<{ success: boolean; error?: string }> {
  const result = await verifyAndConsumeToken(tokenKey.emailVerify(email), token);
  if (!result.valid) return { success: false, error: result.error };

  try {
    await db.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });
  } catch { /* DB unavailable */ }

  return { success: true };
}

// ── Register + Welcome email ───────────────────────────────────────────────────

export async function registerUserWithWelcome(formData: {
  name: string;
  email: string;
  password: string;
}): Promise<{ error?: string }> {
  const result = await registerUser(formData);
  if (result.error) return result;

  // Send welcome + verification email (non-blocking)
  sendWelcomeEmail(formData.email, formData.name).catch(() => {});
  sendEmailVerification(formData.email).catch(() => {});

  return {};
}
