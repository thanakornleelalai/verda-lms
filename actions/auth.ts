"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { storeOtp, checkOtp, consumeOtp, DEV_OTP } from "@/lib/otp-store";

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

  if (!name || !email || !password) return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  if (password.length < 8) return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };

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
  try {
    await signIn("credentials", { email: formData.email, password: formData.password, redirect: false });
    return {};
  } catch {
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }
}
