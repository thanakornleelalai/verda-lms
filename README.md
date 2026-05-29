# VERDA LMS

ระบบ Learning Management System แบบ Thai/English Bilingual สร้างด้วย Next.js 15 App Router  
รองรับ 3 roles: นักเรียน · ผู้สอน · แอดมิน

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) + Prisma 6 |
| Auth | NextAuth v5 — Email/Password, Google, LINE, Phone OTP |
| Video | Mux Player |
| Payment | Stripe + Omise (PromptPay) |
| Email | Resend |
| Background Jobs | Inngest |
| File Storage | Vercel Blob |
| Cache / KV | Vercel KV (Redis) |
| i18n | next-intl (TH / EN) |
| State | Zustand + TanStack Query |
| Deploy | Vercel (region: Singapore) |

---

## Features

### นักเรียน (Student)
- เรียกดูและค้นหาคอร์สกว่า 200+ คอร์ส
- ซื้อคอร์สผ่าน Stripe / PromptPay
- ดูวิดีโอบทเรียนผ่าน Mux Player
- ทำแบบทดสอบพร้อม timer และ A/B/C/D keyboard shortcuts
- ระบบ progress tracking แบบ real-time
- รับใบประกาศนียบัตรดิจิทัล (พิมพ์ / บันทึก PDF ได้)
- แดชบอร์ดส่วนตัว — คอร์ส, certificate, การตั้งค่า

### ผู้สอน (Instructor)
- Instructor Studio — จัดการคอร์สและบทเรียน
- อัปโหลดวิดีโอผ่าน Mux
- สร้าง Quiz ต่อบทเรียน
- ดู Analytics รายได้และผู้เรียน
- จัดการรายชื่อนักเรียน

### แอดมิน (Admin)
- จัดการผู้ใช้ทั้งหมด (filter by role)
- จัดการคอร์ส (filter by status)
- ดู Orders และ Revenue
- ออกใบประกาศนียบัตรให้ผู้เรียนด้วยตนเอง

### ทั่วไป
- รองรับ 2 ภาษา: ไทย / อังกฤษ (สลับอัตโนมัติตาม URL prefix `/th` `/en`)
- Dark mode + Light mode + เลือก accent color
- PWA รองรับ install บนมือถือ
- ⌘K / Ctrl+K ค้นหาคอร์สได้ทันที
- Forum ถาม-ตอบ
- Leaderboard

---

## เริ่มต้นใช้งาน

### 1. Clone และติดตั้ง dependencies

```bash
git clone https://github.com/thanakornleelalai/verda-lms.git
cd verda-lms
npm install
```

### 2. ตั้งค่า Environment Variables

```bash
cp .env.example .env.local
```

เปิดไฟล์ `.env.local` แล้วกรอกค่าต่าง ๆ (ดูรายละเอียดด้านล่าง)

### 3. ตั้งค่า Database

```bash
npx prisma generate
npx prisma db push
```

### 4. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

คัดลอกจาก `.env.example` แล้วกรอกค่าจริง:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
AUTH_SECRET="random-32-char-string"
AUTH_URL="http://localhost:3000"
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# Payment
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
OMISE_SECRET_KEY="skey_test_..."

# Video
MUX_TOKEN_ID="..."
MUX_TOKEN_SECRET="..."

# Email
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@verda.co.th"

# Storage & Cache
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
KV_URL="redis://..."

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## โครงสร้างโปรเจกต์

```
verda-lms/
├── app/
│   ├── [locale]/
│   │   ├── (public)/        # หน้าสาธารณะ (home, courses, pricing…)
│   │   ├── (auth)/          # login, signup, forgot-password
│   │   ├── (student)/       # dashboard, learn, quiz, certificate
│   │   ├── (instructor)/    # studio, analytics, course editor
│   │   ├── (admin)/         # admin panel
│   │   └── certificate/     # ดูและ preview ใบประกาศ
│   └── api/                 # API routes
├── components/
│   ├── primitives/          # Button, Avatar, Tag, EyebrowLabel
│   ├── layout/              # TopBar, Footer, Sidebar
│   ├── course/              # CourseCard, CourseGrid
│   ├── quiz/                # QuizRunner, QuizTimer, QuestionCard
│   ├── learn/               # LessonPlayer, CourseReviewForm
│   ├── certificate/         # PrintButton, ShareButtons
│   └── theme/               # ThemeProvider, ThemeCustomizer
├── lib/                     # auth, db, stripe, mux, resend…
├── prisma/
│   └── schema.prisma        # 29 models, 9 enums
├── mock/                    # ข้อมูล mock สำหรับ development
├── messages/
│   ├── th.json              # ภาษาไทย
│   └── en.json              # ภาษาอังกฤษ
└── actions/                 # Server Actions
```

---

## Routes หลัก

| Path | หน้า |
|------|------|
| `/th` | หน้าแรก |
| `/th/courses` | รายการคอร์ส |
| `/th/courses/[slug]` | รายละเอียดคอร์ส |
| `/th/learn/[slug]/[lessonId]` | หน้าเรียน |
| `/th/learn/[slug]/quiz/[id]` | แบบทดสอบ |
| `/th/certificate/[certId]` | ใบประกาศนียบัตร |
| `/th/dashboard` | แดชบอร์ดนักเรียน |
| `/th/studio` | Instructor Studio |
| `/th/admin` | Admin Panel |
| `/th/login` | เข้าสู่ระบบ |
| `/th/pricing` | แผนราคา |
| `/th/forum` | Forum |

---

## Demo Accounts (Development)

| Role | Email | Password |
|------|-------|----------|
| Student | `student@verda.dev` | `demo1234` |
| Instructor | `instructor@verda.dev` | `demo1234` |
| Admin | `admin@verda.dev` | `demo1234` |

---

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npx prisma studio    # Database GUI
```

---

## Deploy

โปรเจกต์นี้ตั้งค่าสำหรับ Vercel ไว้แล้ว:

1. Import repo จาก GitHub เข้า Vercel
2. ใส่ Environment Variables ทั้งหมดใน Vercel dashboard
3. Vercel จะ auto-deploy ทุกครั้งที่ push ไปที่ `main`

CI/CD pipeline อยู่ที่ `.github/workflows/preview.yml` — รัน lint + typecheck ทุก PR

---

## License

Private — All rights reserved © 2026 VERDA
