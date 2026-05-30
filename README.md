# VERDA LMS

ระบบบริหารจัดการการเรียนรู้ออนไลน์ (Learning Management System) แบบสองภาษา ไทย–อังกฤษ
พัฒนาด้วย Next.js 15 รองรับผู้ใช้งานสามบทบาท ได้แก่ ผู้เรียน ผู้สอน และผู้ดูแลระบบ

---

## สารบัญ

1. [ภาพรวมโครงการ](#1-ภาพรวมโครงการ)
2. [เทคโนโลยีที่ใช้](#2-เทคโนโลยีที่ใช้)
3. [คุณสมบัติหลัก](#3-คุณสมบัติหลัก)
4. [การติดตั้งและเริ่มใช้งาน](#4-การติดตั้งและเริ่มใช้งาน)
5. [การตั้งค่า Environment Variables](#5-การตั้งค่า-environment-variables)
6. [บัญชีทดสอบ](#6-บัญชีทดสอบ-development)
7. [แผนผังหน้าหลักของระบบ](#7-แผนผังหน้าหลักของระบบ)
8. [คำสั่งที่ใช้บ่อย](#8-คำสั่งที่ใช้บ่อย)
9. [การนำขึ้นใช้งานจริง (Deployment)](#9-การนำขึ้นใช้งานจริง-deployment)
10. [โครงสร้างโฟลเดอร์](#10-โครงสร้างโฟลเดอร์)

---

## 1. ภาพรวมโครงการ

VERDA LMS เป็นแพลตฟอร์มการเรียนรู้ออนไลน์ในลักษณะตลาดกลางคอร์สเรียน (Course Marketplace)
มีรูปแบบการใช้งานใกล้เคียงกับ SkillLane และ Udemy โดยแบ่งการทำงานตามบทบาทผู้ใช้ดังนี้

| บทบาท | ความสามารถหลัก |
|-------|----------------|
| ผู้เรียน (Student) | ค้นหาและซื้อคอร์ส รับชมวิดีโอ ทำแบบทดสอบ และรับใบประกาศนียบัตร |
| ผู้สอน (Instructor) | สร้างและจัดการคอร์สผ่าน Studio พร้อมดูรายงานสถิติการเรียน |
| ผู้ดูแลระบบ (Admin) | บริหารผู้ใช้ คอร์ส คำสั่งซื้อ เนื้อหา และตรวจสอบสถานะระบบ |

---

## 2. เทคโนโลยีที่ใช้

| หมวด | เทคโนโลยี |
|------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| ฐานข้อมูล | PostgreSQL (Supabase) + Prisma ORM v6 |
| การยืนยันตัวตน | NextAuth v5 — รองรับ Email, Google, LINE และ Phone OTP |
| วิดีโอ | Mux Player |
| การชำระเงิน | Stripe (บัตรเครดิต) และ Omise (PromptPay) |
| อีเมล | Resend |
| งานเบื้องหลัง | Inngest |
| การจัดเก็บไฟล์ | Vercel Blob |
| ระบบแคช | Vercel KV (Redis) |
| ระบบหลายภาษา | next-intl (ไทย / อังกฤษ) |
| การนำขึ้นใช้งาน | Vercel (เซิร์ฟเวอร์ภูมิภาคสิงคโปร์) |

---

## 3. คุณสมบัติหลัก

### 3.1 สำหรับผู้เรียน

- ค้นหาและเรียกดูคอร์สเรียนกว่า 200 คอร์ส
- บันทึกคอร์สที่สนใจไว้ในรายการโปรด (Wishlist) เพื่อลงทะเบียนในภายหลัง
- ตะกร้าสินค้าสำหรับรวบรวมหลายคอร์สก่อนชำระเงิน (ข้อมูลคงอยู่แม้รีโหลดหน้าเว็บ)
- ชำระเงินผ่านบัตรเครดิตหรือ PromptPay พร้อมรองรับโค้ดส่วนลด
- รับชมวิดีโอบทเรียนพร้อมระบบติดตามความคืบหน้า
- ทำแบบทดสอบพร้อมระบบจับเวลา (รองรับการเลือกคำตอบด้วยปุ่ม A–D)
- ให้คะแนนและเขียนรีวิวทั้งคอร์สและผู้สอน รวมถึงสอบถามข้อสงสัยกับผู้สอน
- รับและดาวน์โหลดใบประกาศนียบัตรในรูปแบบดิจิทัล
- แดชบอร์ดส่วนตัวสำหรับจัดการคอร์ส รายการโปรด ใบประกาศนียบัตร และข้อมูลส่วนตัว

### 3.2 สำหรับผู้สอน

- สร้างและแก้ไขคอร์สผ่าน Instructor Studio
- อัปโหลดวิดีโอบทเรียนผ่าน Mux
- สร้างแบบทดสอบประจำบทเรียน
- ดูรายงานสถิติรายได้และจำนวนผู้เรียน

### 3.3 สำหรับผู้ดูแลระบบ

- จัดการผู้ใช้งานทั้งหมด พร้อมกรองตามบทบาท
- จัดการคอร์ส คำสั่งซื้อ และรายได้ พร้อมแผนภูมิเชิงวิเคราะห์
- ออกใบประกาศนียบัตรให้ผู้เรียนด้วยตนเอง
- จัดการโค้ดส่วนลด ประกาศของระบบ และการตรวจสอบเนื้อหา
- จัดการเนื้อหาส่วนองค์กร (เกี่ยวกับเรา บล็อก ร่วมงานกับเรา และสื่อ) ผ่านระบบ CMS
- จัดการองค์กรพันธมิตรแบบ White-label พร้อมกำหนดส่วนแบ่งรายได้
- ตรวจสอบสถานะการทำงานของระบบ (System Health)

### 3.4 หน้าแรกแบบไดนามิก

- แบนเนอร์คอร์สยอดนิยมในรูปแบบ Carousel หมุนอัตโนมัติทุก 6 วินาที
- แถบหัวข้อยอดนิยม (Trending Marquee) เลื่อนแสดงอย่างต่อเนื่อง
- เอฟเฟกต์การเปลี่ยนหน้าที่ทันสมัย และรองรับการตั้งค่า `prefers-reduced-motion`

### 3.5 คุณสมบัติทั่วไป

- ปุ่มสลับภาษาไทย/อังกฤษ พร้อมไอคอนธงชาติ โดยคงเส้นทางหน้าเดิมไว้
- โหมดสว่าง/มืด และเลือกสีหลักของระบบได้
- ติดตั้งเป็นแอปพลิเคชันบนอุปกรณ์เคลื่อนที่ได้ (PWA)
- ค้นหาคอร์สอย่างรวดเร็วด้วยปุ่มลัด `Ctrl+K` หรือ `⌘K`
- กระดานสนทนา (Forum) และตารางจัดอันดับผู้เรียน (Leaderboard)

### 3.6 ผู้ช่วยอัจฉริยะ Verdy

- ผู้ช่วยตอบคำถามอัตโนมัติประจำทุกหน้าของเว็บไซต์
- ตอบคำถามเกี่ยวกับคอร์ส ราคา การสมัครสมาชิก และใบประกาศนียบัตร
- ทำงานได้ทันทีโดยไม่ต้องใช้ API Key (ใช้ระบบจับคู่คำสำคัญ)

### 3.7 การเรียนแบบ On-site

- จัดการเรียนการสอนแบบ On-site ที่สถาบันการจัดการปัญญาภิวัฒน์ (PIM) ถนนแจ้งวัฒนะ เขตหลักสี่ กรุงเทพมหานคร
- เดินทางสะดวกด้วยรถไฟฟ้า MRT สายสีชมพู สถานี PIM
- จัดกิจกรรม Workshop และ Bootcamp อย่างต่อเนื่องในแต่ละไตรมาส
- ใบประกาศนียบัตรออกร่วมกันระหว่าง VERDA และ PIM

---

## 4. การติดตั้งและเริ่มใช้งาน

### ขั้นตอนที่ 1 — โคลนโครงการ

```bash
git clone https://github.com/thanakornleelalai/verda-lms.git
cd verda-lms
npm install
```

### ขั้นตอนที่ 2 — ตั้งค่า Environment Variables

```bash
# Windows
copy .env.example .env.local

# macOS / Linux
cp .env.example .env.local
```

จากนั้นเปิดไฟล์ `.env.local` และกรอกค่าที่จำเป็น (โปรดดูรายละเอียดในหัวข้อที่ 5)

### ขั้นตอนที่ 3 — ตั้งค่าฐานข้อมูล (Supabase)

สร้างโครงการใหม่ที่ [supabase.com](https://supabase.com) จากนั้นคัดลอก Connection Strings จากเมนู **Connect → ORMs → Prisma** มาใส่ในไฟล์ `.env.local`

```bash
# รัน Migration เพื่อสร้างตาราง
npx prisma migrate deploy

# (ไม่บังคับ) บันทึกข้อมูลตัวอย่างลงฐานข้อมูล
npx prisma db seed
```

> **หมายเหตุ:** หากไม่ตั้งค่า `DATABASE_URL` ระบบจะทำงานในโหมด Mock Data โดยอัตโนมัติ

### ขั้นตอนที่ 4 — เริ่มต้นเซิร์ฟเวอร์สำหรับพัฒนา

```bash
npm run dev
```

เปิดเว็บเบราว์เซอร์ที่ `http://localhost:3000`

> **หมายเหตุ:** ระบบสามารถทำงานได้ทันทีในโหมดข้อมูลจำลอง (Mock Data) แม้ยังไม่ได้ตั้งค่าฐานข้อมูล

---

## 5. การตั้งค่า Environment Variables

### 5.1 ตัวแปรที่จำเป็น (Required)

| ตัวแปร | วัตถุประสงค์ |
|--------|--------------|
| `AUTH_SECRET` | เข้ารหัส Session (สร้างด้วย `openssl rand -base64 32`) |
| `DATABASE_URL` | Supabase Transaction Pooler (port 6543) |
| `DIRECT_URL` | Supabase Session Pooler (port 5432) สำหรับ Prisma migrate |
| `NEXT_PUBLIC_BASE_URL` | URL ของแอปพลิเคชัน เช่น `https://verda-lms.vercel.app` |

### 5.2 ตัวแปร Supabase

| ตัวแปร | วัตถุประสงค์ |
|--------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL เช่น `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key (`sb_secret_...`) |

### 5.3 ตัวแปรเพิ่มเติม (Optional)

| ตัวแปร | วัตถุประสงค์ |
|--------|--------------|
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | เข้าสู่ระบบด้วย Google |
| `AUTH_LINE_ID` / `AUTH_LINE_SECRET` | เข้าสู่ระบบด้วย LINE |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | รับชำระเงินผ่านบัตรเครดิต |
| `OMISE_SECRET_KEY` / `OMISE_PUBLIC_KEY` | รับชำระเงินผ่าน PromptPay |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | อัปโหลดและเล่นวิดีโอ |
| `RESEND_API_KEY` | ส่งอีเมล (password reset, email verify) |
| `BLOB_READ_WRITE_TOKEN` | จัดเก็บไฟล์ (Vercel Blob) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Rate limiting, quiz timer (Vercel KV) |
| `ANTHROPIC_API_KEY` | AI Chatbot (fallback ใช้ keyword matching) |

> รายละเอียดทั้งหมดอยู่ในไฟล์ `.env.example`

---

## 6. บัญชีทดสอบ

บัญชีเหล่านี้ถูกสร้างโดยคำสั่ง `npm run db:seed` และใช้งานได้ทั้งในโหมด Mock และ Supabase จริง

| บทบาท | อีเมล | รหัสผ่าน | เส้นทางหลัก |
|-------|-------|----------|-------------|
| ผู้เรียน | `student@verda.dev` | `student1234` | `/th/dashboard` |
| ผู้สอน | `instructor@verda.dev` | `instructor1234` | `/th/studio` |
| ผู้ดูแลระบบ | `admin@verda.dev` | `admin1234` | `/th/admin` |
| Demo | `demo@verda.dev` | `demo1234` | `/th/dashboard` |

---

## 7. แผนผังหน้าหลักของระบบ

| เส้นทาง (URL) | หน้าจอ |
|---------------|--------|
| `/th` | หน้าแรก |
| `/th/courses` | รายการคอร์สทั้งหมด |
| `/th/courses/[slug]` | รายละเอียดคอร์ส |
| `/th/learn/[slug]/[lessonId]` | หน้าเรียนวิดีโอ |
| `/th/learn/[slug]/quiz/[id]` | แบบทดสอบ |
| `/th/certificate/[id]` | ใบประกาศนียบัตร |
| `/th/dashboard` | แดชบอร์ดผู้เรียน |
| `/th/dashboard/wishlist` | รายการโปรด |
| `/th/cart` | ตะกร้าสินค้าและการชำระเงิน |
| `/th/studio` | Instructor Studio |
| `/th/admin` | หน้าผู้ดูแลระบบ |
| `/th/pricing` | แผนราคาสมาชิก |
| `/th/forum` | กระดานสนทนา |
| `/th/login` | เข้าสู่ระบบ / สมัครสมาชิก |

---

## 8. คำสั่งที่ใช้บ่อย

```bash
npm run dev          # เริ่มเซิร์ฟเวอร์สำหรับพัฒนา
npm run build        # สร้างไฟล์สำหรับใช้งานจริง
npm run lint         # ตรวจสอบรูปแบบโค้ด
npm run type-check   # ตรวจสอบความถูกต้องของ TypeScript
npm test             # รัน Unit Tests (Vitest)
npx prisma studio    # เปิดเครื่องมือจัดการฐานข้อมูล
```

---

## 9. การนำขึ้นใช้งานจริง (Deployment)

### Production URL
🌐 **https://verda-lms.vercel.app**

### ขั้นตอน Deploy

1. สร้าง Supabase Project ที่ [supabase.com](https://supabase.com)
2. Copy connection strings จาก **Connect → ORMs → Prisma**
3. นำเข้า Repository นี้ใน [vercel.com](https://vercel.com)
4. ตั้งค่า Environment Variables ใน Vercel Dashboard (ดูหัวข้อที่ 5)
5. Deploy — ระบบจะรัน `prisma generate && prisma migrate deploy && next build` อัตโนมัติ

### Vercel Environment Variables (Production)

| ตัวแปร | สถานะ |
|--------|--------|
| `AUTH_SECRET` | ✅ ตั้งค่าแล้ว |
| `DATABASE_URL` | ✅ Supabase Transaction Pooler |
| `DIRECT_URL` | ✅ Supabase Session Pooler |
| `NEXT_PUBLIC_BASE_URL` | ✅ https://verda-lms.vercel.app |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ ตั้งค่าแล้ว |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ ตั้งค่าแล้ว |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ ตั้งค่าแล้ว |

> **CI/CD:** ทุกครั้งที่ Push โค้ดเข้าสู่ Branch `main` ระบบจะ Deploy ใหม่โดยอัตโนมัติ

---

## 10. โครงสร้างโฟลเดอร์

```
verda-lms/
├── app/                    หน้าและ API ทั้งหมด (Next.js App Router)
│   ├── [locale]/
│   │   ├── (public)/       หน้าสาธารณะ — หน้าแรก คอร์ส ราคา ฟอรัม
│   │   ├── (auth)/         เข้าสู่ระบบ สมัครสมาชิก รีเซ็ตรหัสผ่าน
│   │   ├── (student)/      แดชบอร์ด เรียน แบบทดสอบ ใบประกาศนียบัตร
│   │   ├── (instructor)/   Studio การสร้างคอร์ส รายงานสถิติ
│   │   └── (admin)/        หน้าผู้ดูแลระบบ
│   └── api/                API Endpoints
├── components/             ส่วนประกอบ UI แยกตามคุณสมบัติ
├── lib/                    การยืนยันตัวตน ฐานข้อมูล การชำระเงิน อีเมล
├── prisma/                 โครงสร้างฐานข้อมูล (29 Models)
├── mock/                   ข้อมูลจำลองสำหรับการพัฒนา
├── messages/               ไฟล์แปลภาษา (th.json / en.json)
└── actions/                Server Actions
```

---

© 2026 VERDA — สงวนลิขสิทธิ์
