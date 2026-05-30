import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { checkOtp, consumeOtp } from "@/lib/otp-store";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[\s\-\(\)]/g, "");
  if (digits.startsWith("0")) return "+66" + digits.slice(1);
  if (digits.startsWith("66")) return "+" + digits;
  return digits;
}

function phoneToEmail(phone: string): string {
  return `${phone.replace(/\+/g, "")}@phone.verda.dev`;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    // LINE provider — custom OAuth2
    {
      id: "line",
      name: "LINE",
      type: "oauth",
      authorization: {
        url: "https://access.line.me/oauth2/v2.1/authorize",
        params: { scope: "profile openid email" },
      },
      token: "https://api.line.me/oauth2/v2.1/token",
      userinfo: "https://api.line.me/v2/profile",
      clientId: process.env.AUTH_LINE_ID ?? process.env.LINE_CLIENT_ID ?? "",
      clientSecret: process.env.AUTH_LINE_SECRET ?? process.env.LINE_CLIENT_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.userId,
          name: profile.displayName,
          email: profile.email ?? null,
          image: profile.pictureUrl,
        };
      },
    },
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Dev-mode bypass: hardcoded test accounts when DATABASE_URL is not set
        if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL) {
          const DEV_USERS = [
            { id: "dev_admin_001",      email: "admin@verda.dev",      password: "admin1234",      role: "ADMIN",      name: "Admin (Dev)" },
            { id: "dev_instructor_001", email: "instructor@verda.dev", password: "instructor1234", role: "INSTRUCTOR", name: "Instructor (Dev)" },
            { id: "dev_student_001",    email: "student@verda.dev",    password: "student1234",    role: "STUDENT",    name: "Student (Dev)" },
            // Demo account — id matches MOCK_ENROLLMENTS so dashboard shows real mock data
            { id: "usr_student_001",   email: "demo@verda.dev",       password: "demo1234",       role: "STUDENT",    name: "คุณสมชาย ทดสอบ" },
          ];
          const devUser = DEV_USERS.find(
            (u) => u.email === credentials.email && u.password === credentials.password
          );
          if (devUser) {
            return { id: devUser.id, name: devUser.name, email: devUser.email, role: devUser.role };
          }
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
            select: { id: true, name: true, email: true, image: true, role: true, passwordHash: true },
          });

          if (!user || !user.passwordHash) return null;

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          };
        } catch {
          return null;
        }
      },
    }),

    // ── Phone + Password login provider ───────────────────────────────────────
    Credentials({
      id: "phone-password",
      credentials: {
        phone:    { label: "Phone",    type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        const phone    = normalizePhone(credentials.phone as string);
        const password = credentials.password as string;
        const derivedEmail = phoneToEmail(phone);

        // Dev-mode bypass
        if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL) {
          if (phone === "+66812345678" && password === "phone1234") {
            return { id: "dev_phone_001", name: "ผู้ใช้มือถือ (Dev)", email: derivedEmail, role: "STUDENT" };
          }
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email: derivedEmail },
            select: { id: true, name: true, email: true, image: true, role: true, passwordHash: true },
          });
          if (!user || !user.passwordHash) return null;
          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;
          return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role };
        } catch {
          return null;
        }
      },
    }),

    // ── Phone OTP login provider ───────────────────────────────────────────────
    Credentials({
      id: "phone-otp",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp:   { label: "OTP",   type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null;

        const phone = normalizePhone(credentials.phone as string);
        const otp   = (credentials.otp as string).trim();

        // Verify OTP from shared store
        const check = checkOtp(`login_${phone}`, otp);
        if (!check.valid) return null;
        consumeOtp(`login_${phone}`);

        const derivedEmail = phoneToEmail(phone);

        // Dev-mode bypass
        if (process.env.NODE_ENV === "development" && !process.env.DATABASE_URL) {
          return {
            id:    "dev_phone_001",
            name:  "ผู้ใช้มือถือ (Dev)",
            email: derivedEmail,
            role:  "STUDENT",
          };
        }

        try {
          const user = await db.user.findUnique({
            where: { email: derivedEmail },
            select: { id: true, name: true, email: true, image: true, role: true },
          });
          if (!user) return null;
          return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "STUDENT";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/th/login",
    error: "/th/login",
  },
  session: { strategy: "jwt" },
});
