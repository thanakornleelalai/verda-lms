# VERDA LMS

> ระบบจัดการการเรียนรู้ออนไลน์ (LMS) สองภาษา ไทย–อังกฤษ  
> สร้างด้วย Next.js 15 · รองรับนักเรียน ผู้สอน และแอดมิน

---

## โปรเจกต์นี้คืออะไร?

VERDA LMS คือแพลตฟอร์มเรียนออนไลน์คล้าย SkillLane หรือ Udemy  
ผู้เรียนสามารถซื้อคอร์ส ดูวิดีโอ ทำแบบทดสอบ และรับใบประกาศนียบัตรได้  
ผู้สอนมี Studio สำหรับอัปโหลดคอร์สและดู analytics  
แอดมินจัดการผู้ใช้ คอร์ส และออกใบประกาศนียบัตรได้

---

## เทคโนโลยีที่ใช้

| หมวด | เทคโนโลยี |
|------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| ฐานข้อมูล | PostgreSQL บน Neon + Prisma 6 |
| Authentication | NextAuth v5 — รองรับ Email, Google, LINE, Phone OTP |
| วิดีโอ | Mux Player |
| ชำระเงิน | Stripe (บัตรเครดิต) + Omise (PromptPay) |
| อีเมล | Resend |
| งานเบื้องหลัง | Inngest |
| เก็บไฟล์ | Vercel Blob |
| Cache | Vercel KV (Redis) |
| หลายภาษา | next-intl (ไทย / อังกฤษ) |
| Deploy | Vercel (เซิร์ฟเวอร์สิงคโปร์) |

---

## ฟีเจอร์หลัก

### สำหรับนักเรียน
- ค้นหาและเรียกดูคอร์สกว่า 200+ คอร์ส
- ซื้อคอร์สด้วยบัตรเครดิตหรือ PromptPay
- ดูวิดีโอบทเรียนพร้อมติดตามความคืบหน้า
- ทำแบบทดสอบพร้อมจับเวลา (กด A B C D จากคีย์บอร์ดได้)
- รับและดาวน์โหลดใบประกาศนียบัตรดิจิทัล
- แดชบอร์ดส่วนตัว — ดูคอร์สที่เรียน, certificate, ตั้งค่าโปรไฟล์

### สำหรับผู้สอน
- สร้างและแก้ไขคอร์สผ่าน Instructor Studio
- อัปโหลดวิดีโอผ่าน Mux
- สร้างแบบทดสอบต่อบทเรียน
- ดู Analytics รายได้และสถิติผู้เรียน

### สำหรับแอดมิน (Advanced Admin)
- จัดการผู้ใช้ทั้งหมด กรองตาม role ได้
- จัดการคอร์ส / คำสั่งซื้อ / รายได้ + กราฟ Analytics
- ออกใบประกาศนียบัตรให้ผู้เรียนด้วยตนเอง
- จัดการโค้ดส่วนลด, ประกาศ, ตรวจสอบเนื้อหา (moderation)
- จัดการเนื้อหา COMPANY (เกี่ยวกับเรา/บล็อก/ร่วมงาน/สื่อ) ผ่าน CMS
- จัดการองค์กร white-label + ส่วนแบ่งรายได้ (Tenant provisioning)
- ตรวจสอบสถานะระบบ (System Health)

### หน้าแรก Dynamic ✨
- **แบนเนอร์คอร์สยอดนิยม** — carousel หมุนอัตโนมัติทุก 6 วินาที พร้อม live badge + progress bar
- **Trending Marquee** — แถบหัวข้อเทรนด์เลื่อนต่อเนื่องไม่มีหยุด
- Motion ทันสมัยทุกการเปลี่ยนหน้า (fade-up) เคารพ `prefers-reduced-motion`

### ฟีเจอร์ทั่วไป
- **ปุ่มสลับภาษา TH / EN** พร้อมธงชาติ 🇹🇭 🇬🇧 ใน TopBar — รักษา URL path เดิมเมื่อสลับ
- Dark mode / Light mode และเลือก accent color ได้เอง
- ติดตั้งเป็นแอปบนมือถือ (PWA)
- กด `Ctrl+K` หรือ `⌘K` เพื่อค้นหาคอร์สทันที
- ฟอรัมถาม-ตอบ และ Leaderboard
- Typography ทันสมัย (OpenType, tabular figures, balanced headings)

### 🤖 Verdy AI Chatbot
- หุ่นยนต์ผู้ช่วยน้อย Verdy ลอยมุมขวาล่างทุกหน้า
- ตอบคำถามเกี่ยวกับคอร์ส ราคา วิธีสมัคร ใบประกาศ และอื่น ๆ
- พูดสุภาพ น่ารัก ใช้ภาษาไทย ✨
- ทำงานได้ทันทีโดยไม่ต้องใช้ API key (keyword matching 25+ rules)

### 🏫 เรียน On-site ที่ PIM
- จัดเรียน On-site ที่ **PIM — สถาบันปัญญาภิวัฒน์** ถนนแจ้งวัฒนะ เขตหลักสี่ กรุงเทพฯ
- 🚇 MRT สายสีชมพู สถานี PIM (ลงตรงเลย)
- Workshop / Bootcamp / Intensive 5 วัน ทุกไตรมาส
- ใบประกาศนียบัตรออกร่วมกัน VERDA + PIM

---

## เริ่มต้นรันโปรเจกต์

### ขั้นตอนที่ 1 — โหลดโค้ดลงเครื่อง

```bash
git clone https://github.com/thanakornleelalai/verda-lms.git
cd verda-lms
npm install
```

### ขั้นตอนที่ 2 — ตั้งค่า Environment Variables

```bash
# Windows
copy .env.example .env.local

# Mac / Linux
cp .env.example .env.local
```

จากนั้นเปิดไฟล์ `.env.local` แล้วกรอกค่าที่จำเป็น (ดูหัวข้อ Environment Variables ด้านล่าง)

### ขั้นตอนที่ 3 — ตั้งค่าฐานข้อมูล

```bash
npx prisma generate
npx prisma db push
```

### ขั้นตอนที่ 4 — รันเซิร์ฟเวอร์

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ **http://localhost:3000**

---

## Environment Variables ที่ต้องตั้งค่า

| ตัวแปร | ใช้ทำอะไร | จำเป็น |
|--------|-----------|--------|
| `DATABASE_URL` | เชื่อมต่อ PostgreSQL (Neon) | ✅ |
| `AUTH_SECRET` | เข้ารหัส session (สุ่มได้ 32 ตัวอักษร) | ✅ |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Login ด้วย Google | ไม่บังคับ |
| `STRIPE_SECRET_KEY` | รับชำระเงินบัตรเครดิต | ไม่บังคับ |
| `OMISE_SECRET_KEY` | รับชำระเงิน PromptPay | ไม่บังคับ |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | อัปโหลดและเล่นวิดีโอ | ไม่บังคับ |
| `RESEND_API_KEY` | ส่งอีเมล | ไม่บังคับ |
| `BLOB_READ_WRITE_TOKEN` | เก็บไฟล์รูปภาพ | ไม่บังคับ |
| `KV_URL` | Redis cache (quiz timer) | ไม่บังคับ |
| `NEXT_PUBLIC_BASE_URL` | URL ของแอปตัวเอง | ✅ |

> ดูรายละเอียดทั้งหมดได้ในไฟล์ `.env.example`

---

## บัญชีทดสอบ (Development)

| บทบาท | อีเมล | รหัสผ่าน |
|-------|-------|---------|
| นักเรียน | `student@verda.dev` | `demo1234` |
| ผู้สอน | `instructor@verda.dev` | `demo1234` |
| แอดมิน | `admin@verda.dev` | `demo1234` |

---

## หน้าหลักของระบบ

| URL | หน้า |
|-----|------|
| `/th` | หน้าแรก |
| `/th/courses` | รายการคอร์สทั้งหมด |
| `/th/courses/[slug]` | รายละเอียดคอร์ส |
| `/th/learn/[slug]/[lessonId]` | หน้าเรียนวิดีโอ |
| `/th/learn/[slug]/quiz/[id]` | แบบทดสอบ |
| `/th/certificate/[id]` | ใบประกาศนียบัตร |
| `/th/dashboard` | แดชบอร์ดนักเรียน |
| `/th/studio` | Instructor Studio |
| `/th/admin` | Admin Panel |
| `/th/pricing` | แผนราคาสมาชิก |
| `/th/forum` | ฟอรัมถาม-ตอบ |
| `/th/login` | เข้าสู่ระบบ / สมัครสมาชิก |

---

## คำสั่งที่ใช้บ่อย

```bash
npm run dev          # เปิด Development server
npm run build        # Build สำหรับ production
npm run lint         # ตรวจสอบ code style
npm run type-check   # ตรวจสอบ TypeScript
npx prisma studio    # เปิด GUI จัดการฐานข้อมูล
```

---

## การ Deploy บน Vercel

1. ไปที่ **vercel.com** → Import จาก GitHub repo นี้
2. ใส่ Environment Variables ทั้งหมดใน Vercel dashboard
3. กด Deploy — ระบบจะ build และ deploy อัตโนมัติ
4. ทุกครั้งที่ push code ไปที่ branch `main` จะ deploy ให้อัตโนมัติ

> CI/CD: ทุก Pull Request จะรัน lint + typecheck อัตโนมัติ ผ่าน GitHub Actions

---

## โครงสร้างโฟลเดอร์

```
verda-lms/
├── app/                    ← หน้าและ API ทั้งหมด (Next.js App Router)
│   ├── [locale]/
│   │   ├── (public)/       ← หน้าสาธารณะ: home, courses, pricing, forum
│   │   ├── (auth)/         ← login, signup, forgot-password
│   │   ├── (student)/      ← dashboard, เรียน, quiz, certificate
│   │   ├── (instructor)/   ← studio, สร้างคอร์ส, analytics
│   │   └── (admin)/        ← admin panel
│   └── api/                ← API endpoints
├── components/             ← UI components แยกตาม feature
├── lib/                    ← auth, database, payment, email
├── prisma/                 ← database schema (29 models)
├── mock/                   ← ข้อมูลจำลองสำหรับ development
├── messages/               ← ไฟล์แปลภาษา th.json / en.json
└── actions/                ← Server Actions
```

---

*© 2026 VERDA — All rights reserved*
