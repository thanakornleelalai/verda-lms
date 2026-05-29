# VERDA LMS — Product Requirements Document (PRD)

> **Platform:** Online Course Marketplace (Thai / English Bilingual)
> **Version:** 1.0.0
> **Last updated:** 2026-05-29 (Session 15 — Verdy AI Chatbot + Language Switcher + Flag icons)
> **Status:** Core modules complete — demo-ready

---

## 1. Product Overview

VERDA LMS คือแพลตฟอร์มเรียนออนไลน์ภาษาไทยที่เน้นคุณภาพเนื้อหาจากผู้เชี่ยวชาญที่ทำงานจริงในอุตสาหกรรม ดีไซน์แบบ editorial-modern ด้วย Viridian green + warm cream และรองรับทั้ง Web / PWA

### Brand DNA
- **Editorial-modern** — serif headlines, mono labels, generous whitespace
- **Thai-first** — UI ภาษาไทยเป็น primary, English สำหรับ labels เทคนิค
- **Trust signal** — เน้นความน่าเชื่อถือของ instructor มากกว่า discount

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + VERDA design tokens |
| Auth | NextAuth v5 (Credentials + Google + LINE) |
| Database | PostgreSQL (Neon) via Prisma v6 |
| Video | Mux (playback + upload + transcription) |
| Payment | Stripe + Omise (Thailand) |
| Email | Resend |
| Storage | Vercel Blob |
| Cache | Vercel KV (quiz timer) |
| Background jobs | Inngest |
| Deployment | Vercel (Edge + Serverless) |
| i18n | next-intl (th / en) |

---

## 3. User Roles

| Role | Description | Entry Point |
|------|-------------|-------------|
| `STUDENT` | ผู้เรียน — browse, enroll, learn, quiz, track | `/th/dashboard` |
| `INSTRUCTOR` | ผู้สอน — create/manage courses, view analytics | `/th/studio` |
| `ADMIN` | ผู้ดูแลระบบ — manage users/courses/orders | `/th/admin` |
| `SUPERADMIN` | Super admin — full system access | `/th/admin` |

### Role-Aware TopBar Dropdown (Strictly Separated)

Each role sees **exactly one** primary entry point in the user avatar dropdown — no overlapping links:

| Role | Dropdown Link | Icon | Destination |
|------|--------------|------|-------------|
| `STUDENT` | แดชบอร์ด | LayoutDashboard | `/th/dashboard` |
| `INSTRUCTOR` | Instructor Studio | Clapperboard (amber) | `/th/studio` |
| `ADMIN` | Admin Panel | ShieldCheck (viridian) | `/th/admin` |
| `SUPERADMIN` | Admin Panel | ShieldCheck (viridian) | `/th/admin` |

All roles share: Logout button at the bottom of the dropdown.

**Dev Test Accounts (mock mode — no DATABASE_URL needed):**

| Credential | Value | Role |
|------------|-------|------|
| Email `student@verda.dev` / `student1234` | — | STUDENT |
| Email `demo@verda.dev` / `demo1234` | — | STUDENT |
| Email `instructor@verda.dev` / `instructor1234` | — | INSTRUCTOR |
| Email `admin@verda.dev` / `admin1234` | — | ADMIN |
| Phone `081-234-5678` / password `phone1234` | Phone+Password login | STUDENT |
| Phone `081-234-5678` / OTP `123456` | Phone+OTP login | STUDENT |

---

## 4. Core Student Modules

> ทั้ง 5 module ด้านล่างนี้ **มีอยู่ในระบบแล้ว** และพร้อม demo ด้วย mock data

---

### Module 1 — Student Login / Logout (เข้าสู่ระบบ / ออกจากระบบ)

**สถานะ:** ✅ Implemented

#### User Stories
| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-1.1 | ผู้เรียนใหม่ | สมัครบัญชีด้วย email + password | ฉันสามารถเข้าถึงคอร์สได้ |
| US-1.2 | ผู้เรียนใหม่ | สมัครบัญชีด้วยเบอร์โทร + OTP (3 ขั้นตอน) | สมัครได้โดยไม่ต้องมี email |
| US-1.3 | ผู้เรียน | Login ด้วย email + password | กลับเข้าระบบได้เมื่อต้องการ |
| US-1.4 | ผู้เรียน | Login ด้วยเบอร์โทร + รหัสผ่าน | เข้าระบบด้วยเบอร์โทรและรหัสผ่านที่ตั้งตอนสมัคร |
| US-1.5 | ผู้เรียน | Login ด้วยเบอร์โทร + OTP (passwordless) | เข้าระบบได้โดยไม่ต้องจำ password |
| US-1.6 | ผู้เรียน | Login ด้วย Google | ไม่ต้องจำ password เพิ่ม |
| US-1.7 | ผู้เรียน | กด Logout | ออกจากระบบได้อย่างปลอดภัย |
| US-1.8 | ผู้เรียน | ขอ reset password | กู้บัญชีได้เมื่อลืม password |
| US-1.9 | ระบบ | redirect ไปหน้าที่เหมาะกับ role | STUDENT→dashboard, INSTRUCTOR→studio |

#### Routes & Files
| Route | File | Function |
|-------|------|---------|
| `/th/login` | `app/[locale]/(auth)/login/page.tsx` | Login + Signup tabs |
| `/th/forgot-password` | `app/[locale]/(auth)/forgot-password/page.tsx` | Email reset request |
| `/th/redirect` | `app/[locale]/(auth)/redirect/page.tsx` | Role-based redirect |

#### Auth Architecture
| Layer | File | Responsibility |
|-------|------|---------------|
| Shared OTP store | `lib/otp-store.ts` | In-memory singleton Map (dev) — swap to Redis in prod |
| Server actions | `actions/auth.ts` | `sendOTP`, `verifyOTP`, `registerWithPhone`, `sendLoginOTP`, `loginWithPhone`, `loginWithPhonePassword`, `registerUser` |
| NextAuth providers | `lib/auth.ts` | `credentials` (email+pw), `phone-password` (phone+pw), `phone-otp` (phone+OTP), Google, LINE |

#### Phone Login Flow (Password — ค่าเริ่มต้น)
```
1. User เลือก tab "เบอร์โทร" → เห็นฟอร์ม phone + password (default)
2. กรอกเบอร์โทร + รหัสผ่านที่ตั้งตอนสมัคร
3. loginWithPhonePassword(phone, password) → normalizePhone → signIn("phone-password")
4. auth.ts phone-password provider: normalizePhone → phoneToEmail → findUnique → bcrypt.compare
5. Dev bypass: +66812345678 / phone1234 → ข้ามการค้นหา DB
6. router.push → /redirect → role-based dispatch
```

#### Phone Login Flow (OTP — passwordless)
```
1. User คลิก "ใช้ OTP แทนรหัสผ่าน →" ใต้ฟอร์ม phone+password
2. sendLoginOTP(phone) → validates format, checks account exists (prod), stores OTP
3. User receives SMS with 6-digit OTP (dev: always "123456")
4. loginWithPhone(phone, otp) → calls signIn("phone-otp", {phone, otp})
5. auth.ts phone-otp provider verifies OTP via shared store, finds user, returns session
6. router.push → /redirect → role-based dispatch
```

#### Phone Signup Flow (3-step OTP)
```
Step 1 — Phone:   sendOTP(phone) → checks not already registered, stores OTP
Step 2 — OTP:     verifyOTP(phone, otp) → validates code
Step 3 — Details: registerWithPhone({phone, name, password, otp}) → creates user, auto sign-in
```

#### Features Implemented
- ✅ **Login: Email + password** — with show/hide password, remember-me checkbox
- ✅ **Login: เบอร์โทร + รหัสผ่าน** — phone field (+66 prefix) + password + ลืมรหัสผ่าน link (ค่าเริ่มต้นของ phone tab)
- ✅ **Login: เบอร์โทร + OTP (passwordless)** — 2-step flow, 60s resend countdown (สลับได้ด้วย "ใช้ OTP แทนรหัสผ่าน →")
- ✅ **Login toggle** — Email | เบอร์โทร tab switch; เบอร์โทร tab มี password ↔ OTP sub-toggle
- ✅ **Signup: Email** — name + email + password (strength meter + rules) + confirm + terms
- ✅ **Signup: เบอร์โทร** — 3-step (phone → OTP verify → name+password), step indicator
- ✅ **Signup toggle** — Email | เบอร์โทร tab switch inside SignupForm
- ✅ Google OAuth button
- ✅ LINE OAuth button
- ✅ Forgot password — email input + simulated send + success state
- ✅ OTP input — 6 individual digit boxes, paste support, auto-advance, backspace navigation
- ✅ NextAuth JWT session (role stored in token)
- ✅ `phone-password` Credentials provider in NextAuth (normalizePhone → bcrypt verify → dev bypass)
- ✅ `phone-otp` Credentials provider in NextAuth
- ✅ Shared OTP store (`lib/otp-store.ts`) used by both actions and auth provider
- ✅ Logout ใน TopBar dropdown
- ✅ Dev test accounts panel (email + phone+password hint + OTP hint)
- ✅ Role dispatch — STUDENT→`/dashboard`, INSTRUCTOR→`/studio`, ADMIN→`/admin`

#### Known Gaps (ต้อง external service)
- ⏳ Forgot password — backend token + Resend email delivery (ต้องการ RESEND_API_KEY)
- ⏳ SMS delivery — ต้องการ Twilio / Thai SMS gateway (INFOBIP, THAIBULKSMS) ใน production
- ⏳ OTP store — ต้องการ Redis/Upstash KV ใน production (ปัจจุบันเป็น in-memory)
- ⏳ Remember me — session duration persistence
- ⏳ LINE OAuth — ต้องการ LINE Channel credentials

---

### Module 2 — Browse Course (ค้นหาและดูคอร์ส)

**สถานะ:** ✅ Implemented

#### User Stories
| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-2.1 | ผู้เรียน | ดูรายการคอร์สทั้งหมด | เลือกคอร์สที่สนใจได้ |
| US-2.2 | ผู้เรียน | กรองคอร์สตามระดับ / ราคา | หาคอร์สที่เหมาะกับฉัน |
| US-2.3 | ผู้เรียน | ค้นหาด้วย keyword | หาคอร์สที่ต้องการได้เร็ว |
| US-2.4 | ผู้เรียน | ดู course detail — หัวข้อ, ราคา, ผู้สอน | ตัดสินใจก่อนซื้อ |
| US-2.5 | ผู้เรียน | ลงทะเบียนคอร์สฟรี / ชำระเงิน | เริ่มเรียนได้ |
| US-2.6 | ผู้เรียน | ดูโปรไฟล์ instructor | ประเมิน credibility |
| US-2.7 | ผู้เรียน | อ่าน review จากผู้เรียนอื่น | ประเมินคุณภาพคอร์ส |

#### Routes & Files
| Route | File | Function |
|-------|------|---------|
| `/th` | `app/[locale]/(public)/page.tsx` | Home — featured courses |
| `/th/courses` | `app/[locale]/(public)/courses/page.tsx` | Catalog + filter |
| `/th/courses/[slug]` | `app/[locale]/(public)/courses/[slug]/page.tsx` | Course detail |
| `/th/search` | `app/[locale]/(public)/search/page.tsx` | Keyword search |
| `/th/instructors/[slug]` | `app/[locale]/(public)/instructors/[slug]/page.tsx` | Instructor profile |
| `/th/pricing` | `app/[locale]/(public)/pricing/page.tsx` | Subscription plans |

#### Features Implemented
- ✅ Course grid — CourseCard (thumbnail, title, instructor, rating, price)
- ✅ Filter: ระดับ (BEGINNER/INTERMEDIATE/ADVANCED)
- ✅ Filter: ราคา (Free / <฿1,000 / <฿2,000)
- ✅ Sort: popular / newest / price asc-desc / rating
- ✅ Pagination (12 คอร์สต่อหน้า)
- ✅ Course detail — hero band, curriculum accordion, instructor, reviews
- ✅ Enroll CTA — free enrollment หรือ Add to Cart
- ✅ Enrolled state — เปลี่ยน CTA เป็น "ไปเรียน" เมื่อ enrolled แล้ว
- ✅ Review section — star rating + avatar + date
- ✅ Search bar ใน TopBar — keyword + category
- ✅ Instructor public profile page
- ✅ Pricing page — 3 แผน (Monthly/Yearly/Lifetime) + comparison table + FAQ

#### Known Gaps
- ⏳ Wishlist / bookmark course
- ⏳ Course preview video (free lesson preview)
- ⏳ Coupon/promo code input

---

### Module 3 — Learn Lesson (เข้าเรียนบทเรียน)

**สถานะ:** ✅ Implemented

#### User Stories
| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-3.1 | ผู้เรียน | ดูวิดีโอบทเรียน | เรียนได้ตามต้องการ |
| US-3.2 | ผู้เรียน | ดูรายการบทเรียนทั้งหมดใน sidebar | นำทางระหว่างบทเรียนได้ |
| US-3.3 | ผู้เรียน | บันทึกความก้าวหน้าอัตโนมัติ | ระบบจำไว้ว่าเรียนถึงไหน |
| US-3.4 | ผู้เรียน | กลับมาเรียนต่อจากที่หยุดไว้ | ไม่ต้องหาจุดที่เรียนค้างไว้ |
| US-3.5 | ผู้เรียน | จด Notes ระหว่างเรียน | เก็บความรู้สำคัญไว้ |
| US-3.6 | ผู้เรียน | ถามคำถาม instructor ใน Q&A | ได้รับความช่วยเหลือ |
| US-3.7 | ผู้เรียน | เรียนบทเรียน Article (ข้อความ) | เนื้อหาที่ไม่ใช่วิดีโอ |
| US-3.8 | ผู้เรียน | เห็นว่าบทเรียนใด lock (drip feed) | รู้ว่าต้องรอกี่วัน |

#### Routes & Files
| Route | File | Function |
|-------|------|---------|
| `/th/learn/[slug]/[lessonId]` | `app/[locale]/(student)/learn/[slug]/[lessonId]/page.tsx` | Lesson wrapper |
| `/th/learn/[slug]/[lessonId]` | `components/learn/LessonPlayer.tsx` | Player + sidebar |
| `/th/learn/[slug]/live` | `app/[locale]/(student)/learn/[slug]/live/page.tsx` | Live session |

#### Features Implemented
- ✅ Mux video player (`@mux/mux-player-react`)
- ✅ `startTime` prop — กลับมาต่อจากจุดที่หยุด
- ✅ Lesson sidebar — curriculum navigation พร้อม completed ✓
- ✅ Drip feed gating — บทเรียน lock พร้อม countdown วันที่ปลดล็อก
- ✅ Progress beacon — `sendBeacon` ทุก 30 วินาที อัปเดต watchedPct
- ✅ Lesson completion — mark complete เมื่อดู 90%
- ✅ Notes tab — save/load จาก DB + local fallback
- ✅ Q&A tab — สร้าง thread + replies
- ✅ Article lesson — render markdown/text content
- ✅ Resources tab (UI พร้อม — file list ยังเป็น placeholder)
- ✅ Enrollment guard — redirect login ถ้าไม่ได้ enroll
- ✅ Prev/Next navigation ระหว่างบทเรียน

#### Known Gaps
- ⏳ Transcript อัตโนมัติ (ต้องการ Mux transcript API)
- ⏳ Resource file upload (ต้องการ Vercel Blob)
- ⏳ Playback speed control (1x / 1.5x / 2x)
- ⏳ Subtitles / CC

---

### Module 4 — Take Quiz (ทำแบบทดสอบ)

**สถานะ:** ✅ Implemented

#### User Stories
| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-4.1 | ผู้เรียน | เห็นหน้า start quiz พร้อม rules | เตรียมพร้อมก่อนทำ |
| US-4.2 | ผู้เรียน | ตอบคำถาม MCQ (เลือก 1 / หลายข้อ) | ทดสอบความเข้าใจ |
| US-4.3 | ผู้เรียน | เห็น countdown timer | บริหารเวลาได้ |
| US-4.4 | ผู้เรียน | ส่งคำตอบและเห็นผล Pass/Fail + คะแนน | รู้ว่าผ่านหรือไม่ |
| US-4.5 | ผู้เรียน | ดู review คำตอบที่ถูก/ผิด | เรียนรู้จากความผิดพลาด |
| US-4.6 | ผู้เรียน | ทำซ้ำได้ (จำกัด attempts) | มีโอกาสแก้ไข |
| US-4.7 | ระบบ | detect tab switching | ป้องกันการโกง |
| US-4.8 | Instructor | สร้าง/แก้ไข quiz ใน Studio | กำหนดคำถาม + ตัวเลือก |

#### Routes & Files
| Route | File | Function |
|-------|------|---------|
| `/th/learn/[slug]/quiz/[quizId]` | `app/[locale]/(student)/learn/[slug]/quiz/[quizId]/page.tsx` | Student quiz page |
| `/th/learn/[slug]/review` | `app/[locale]/(student)/learn/[slug]/review/page.tsx` | Post-quiz course review & rating |
| `/th/studio/courses/[slug]/quiz/[lessonId]` | `app/[locale]/(instructor)/studio/courses/[slug]/quiz/[lessonId]/page.tsx` | Quiz builder |
| — | `components/quiz/QuizRunner.tsx` | Quiz state machine |
| — | `components/quiz/QuestionCard.tsx` | Question + options |
| — | `components/quiz/QuizTimer.tsx` | Countdown display |
| — | `components/learn/CourseReviewForm.tsx` | Star rating form + skip option |
| — | `actions/quiz.ts` | `startAttempt`, `finalizeAttempt` |
| — | `actions/review.ts` | `submitReview`, `skipReviewAndGetCert` |

#### Features Implemented
- ✅ Quiz start screen — title, rules, attempt counter
- ✅ MCQ single-choice questions
- ✅ MCQ multiple-choice questions
- ✅ A/B/C/D keyboard shortcuts
- ✅ Question progress bar (ข้อที่ N/Total)
- ✅ Countdown timer — หมดเวลา = auto submit
- ✅ Tab-switch detection — warning banner ⚠️
- ✅ Submit + score calculation
- ✅ Pass/Fail result screen พร้อม score display
- ✅ Review mode — เห็นคำตอบที่ถูก (เขียว) / ผิด (แดง)
- ✅ Attempt history table — คะแนนและ Pass/Fail แต่ละครั้ง
- ✅ Max attempts limit (default 3)
- ✅ Client-side fallback scoring (ถ้า DB ไม่พร้อม)
- ✅ Studio quiz builder — สร้าง MCQ ด้วย drag order + correct toggle
- ✅ Post-quiz pass flow — "ประเมินคอร์สและรับใบประกาศ →" นำไปหน้า Review
- ✅ Post-quiz fail flow — "ลองใหม่อีกครั้ง" (ถ้ายังมีสิทธิ์) + "กลับไปทบทวน"; แจ้งหมดสิทธิ์เมื่อ attempts = 0
- ✅ Course Review page — star rating คอร์ส (1-5) + star rating ผู้สอน (1-5) + text comment + Skip option
- ✅ After review submit — redirect ไป `/certificate/[certId]` หรือ `/dashboard/certificates`
- ✅ Review DB+mock fallback — อัปเดต rolling average ใน `course.rating` + หา certId จาก DB หรือ mock map

#### Post-Quiz Flow (Pass vs Fail)

```
Submit Quiz
  │
  ├─ PASS (score ≥ passingScore)
  │    └─ "ประเมินคอร์สและรับใบประกาศ →"
  │         └─ /learn/[slug]/review   (CourseReviewForm)
  │               ├─ Submit rating    → /certificate/[certId]
  │               └─ Skip             → /dashboard/certificates
  │
  └─ FAIL (score < passingScore)
       ├─ attemptsLeft > 0  →  "ลองใหม่อีกครั้ง" + "กลับไปทบทวน"
       └─ attemptsLeft = 0  →  "กลับไปทบทวน" + แจ้งหมดสิทธิ์
```

#### Known Gaps
- ⏳ KV-based server-side timer validation (ป้องกัน client manipulation)
- ⏳ Auto certificate issuance เมื่อ quiz pass + course complete (currently mock cert lookup)
- ⏳ Question randomization / shuffle options
- ⏳ Answer explanations (คำอธิบายหลังตอบ)

---

### Module 5 — Track Progress (ติดตามความก้าวหน้า)

**สถานะ:** ✅ Implemented

#### User Stories
| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-5.1 | ผู้เรียน | เห็น dashboard รวมทุกคอร์สที่ลงทะเบียน | ติดตาม progress ได้ทีเดียว |
| US-5.2 | ผู้เรียน | เห็น progress bar ของแต่ละคอร์ส | รู้ว่าเรียนไปถึงไหน |
| US-5.3 | ผู้เรียน | เห็น XP / คะแนนสะสม | รู้สึก motivated |
| US-5.4 | ผู้เรียน | เห็น streak วันติดต่อกัน | สร้างนิสัยการเรียน |
| US-5.5 | ผู้เรียน | ดู weekly activity chart | เห็น learning pattern |
| US-5.6 | ผู้เรียน | เห็นประวัติ quiz scores | ทบทวนผลการทดสอบ |
| US-5.7 | ผู้เรียน | download / share ใบประกาศ | นำไปใช้ใน portfolio |
| US-5.8 | ผู้เรียน | แก้ไขโปรไฟล์ และตั้งค่าบัญชี | ปรับข้อมูลส่วนตัว |

#### Routes & Files
| Route | File | Function |
|-------|------|---------|
| `/th/dashboard` | `app/[locale]/(student)/dashboard/page.tsx` | Main dashboard |
| `/th/dashboard/certificates` | `app/[locale]/(student)/dashboard/certificates/page.tsx` | Certificate gallery |
| `/th/dashboard/settings` | `app/[locale]/(student)/dashboard/settings/page.tsx` | Account settings |
| `/th/certificate/[certId]` | `app/[locale]/certificate/[certId]/page.tsx` | Public cert page (DB + mock) |
| `/th/certificate/preview` | `app/[locale]/certificate/preview/page.tsx` | ✅ Certificate preview from URL params — admin issuance tool |
| `/th/leaderboard` | `app/[locale]/(public)/leaderboard/page.tsx` | Rankings + badges |

#### Features Implemented
- ✅ **Welcome header strip** — username + XP badge + Streak badge แบบ vertical card
- ✅ **Stats row** — 4 cards (คอร์สทั้งหมด / กำลังเรียน / สำเร็จแล้ว / สัปดาห์นี้)
- ✅ **"Continue Learning" hero card** — dark ink bg, แสดงคอร์สล่าสุดที่กำลังเรียน + progress bar + "เรียนต่อ" button พร้อม link ตรงไปบทเรียน
- ✅ **2-column layout** — left: course list, right: activity sidebar
- ✅ **Course progress cards** — SVG circular progress ring ทับ thumbnail + thick progress bar + lesson count (X/Y บทเรียน) + "เรียนต่อ" pill button ต่อบทเรียนได้โดยตรง
- ✅ **Completed course state** — แสดง "สำเร็จ" badge + ลิงก์ใบประกาศ
- ✅ **Activity chart** — 7-day bar chart (high: 120px), today highlighted, count label บนแต่ละ bar
- ✅ **Quiz scores sidebar** — score circle (เขียว/แดง) + pass/fail + date
- ✅ **Recent activity sidebar** — บทเรียนล่าสุดที่เรียนจบ (dot list)
- ✅ **Quick links** — Certificates / Settings / Leaderboard
- ✅ **Mock data fallback** — recentAttempts + recentActivity มีข้อมูล demo ครบ
- ✅ Certificate gallery — card + date + download link
- ✅ Certificate public page (ISR 86400s)
- ✅ Settings — Profile / Password / Notifications / Privacy (4 tabs)
- ✅ Leaderboard — XP ranking + badge display

#### Known Gaps
- ⏳ Avatar upload (Camera button UI มีแล้ว — ต้องการ Vercel Blob)
- ⏳ Password change server action (form UI มีแล้ว — action ยังไม่ wire)
- ⏳ Certificate PDF generation (`@react-pdf/renderer`)
- ⏳ Certificate social sharing (LinkedIn)
- ⏳ Account deletion endpoint

---

---

## Feature 6 — Advanced Theme & Color Customizer

**สถานะ:** ✅ Implemented (2026-05-17, extended 2026-05-17)

### Problem Statement
ผู้ใช้ต้องการปรับแต่งทั้งโทน (dark/light) และสีหลักของ UI ตามสไตล์ส่วนตัว และระบบต้องจดจำค่าทั้งคู่ข้ามการใช้งาน VERDA จึงพัฒนา "ThemeCustomizer" — แผงเดียวควบคุมทั้งโทนและสีหลัก 6 แบบ

### User Stories
| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-6.1 | ผู้ใช้ | สลับ dark/light โหมด | เลือกโหมดที่สบายตาได้ |
| US-6.2 | ผู้ใช้ | เลือกสีหลักจากสี 6 แบบ | ปรับ UI ให้ตรงสไตล์ |
| US-6.3 | ผู้ใช้ | ระบบจำค่า tone + color ไว้ | ไม่ต้องตั้งใหม่ทุก session |
| US-6.4 | ผู้ใช้ | สีที่เลือกทำงานถูกต้องใน dark + light | ไม่มีสีที่อ่านไม่ออกหรือดูผิดพลาด |
| US-6.5 | ผู้ใช้ | ไม่เห็น flash ก่อนโหลด | UX ลื่นไหล ไม่กระพริบ |
| US-6.6 | ผู้ใช้ | กด reset กลับเป็นค่าเริ่มต้น | กู้ค่า default ได้ง่าย |

### Acceptance Criteria

#### Tone (Dark / Light)
- [x] **AC-6.1** Palette icon ใน TopBar เปิด/ปิด panel แบบ dropdown
- [x] **AC-6.2** Panel มีปุ่ม "สว่าง" และ "มืด" — active state มี bg-viridian-wash + border-viridian
- [x] **AC-6.3** Tone ถูก persist ใน localStorage (`verda-theme`) และ restore เมื่อ reload
- [x] **AC-6.4** ถ้าไม่มีค่าใน localStorage → ใช้ `prefers-color-scheme` ของ OS
- [x] **AC-6.5** Anti-FOUC: inline blocking script ใน `<head>` set `data-theme` ก่อน React hydrate
- [x] **AC-6.6** สี transition เป็น `200ms ease` ทั่วทั้งแอปเมื่อสลับโหมด

#### Primary Color Picker
- [x] **AC-6.7** Panel แสดง swatch 6 สี: Viridian · Red · Blue · Pink · Amber · Purple
- [x] **AC-6.8** กด swatch → สี apply ทันทีทั่วทั้งแอปโดยไม่ต้อง refresh
- [x] **AC-6.9** Swatch ที่ active แสดง ring + check icon
- [x] **AC-6.10** Swatch แสดง dark variant ของสีนั้นเมื่อ dark mode เปิดอยู่
- [x] **AC-6.11** Color ถูก persist ใน localStorage (`verda-color`) และ restore เมื่อ reload
- [x] **AC-6.12** Anti-FOUC script restore ทั้ง tone + color ก่อน paint
- [x] **AC-6.13** ทุก color ผ่าน WCAG AA contrast ใน light + dark mode

#### Architecture
- [x] **AC-6.14** ใช้ CSS var override — เปลี่ยนเฉพาะ `--viridian-*` ตาม `[data-color]` attribute → ทุก component เดิมตอบสนองโดยไม่ต้องแก้โค้ด
- [x] **AC-6.15** `[data-theme="dark"][data-color="red"]` (specificity 0-2-0) ชนะ `[data-color="red"]` (0-1-0) และ `[data-theme="dark"]` (0-1-0) อย่างถูกต้อง
- [x] **AC-6.16** Tailwind `primary` alias (`bg-primary`, `text-primary`) map ไปยัง `var(--viridian)` สำหรับ new components
- [x] **AC-6.17** Panel ปิดเมื่อคลิก outside หรือกด Escape

### Technical Design
```
CSS cascade (increasing specificity):
  :root                           → light + viridian defaults
  [data-color="red|blue|..."]     → light-mode color override (0-1-0)
  [data-theme="dark"]             → dark ink/paper/line + dark viridian (0-1-0)
  [data-theme="dark"][data-color] → dark + non-viridian color combo (0-2-0)

React state:
  ThemeProvider  → { tone, color, toggleTone, setTone, setColor }
  useTheme()     → consumes context
  ThemeCustomizer → Palette button + dropdown panel (tone buttons + color swatches)

Anti-FOUC (app/layout.tsx <head>):
  localStorage('verda-theme') → setAttribute('data-theme', ...)
  localStorage('verda-color') → setAttribute('data-color', ...)
```

### Files
| File | Purpose |
|------|---------|
| `app/globals.css` | `:root` defaults, `[data-color="*"]` light overrides, `[data-theme="dark"]`, `[data-theme="dark"][data-color="*"]` combos, 200ms transitions |
| `app/layout.tsx` | Anti-FOUC inline `<script>` restoring tone + color |
| `app/[locale]/layout.tsx` | Wraps children with `<ThemeProvider>` |
| `tailwind.config.ts` | `primary` color alias via CSS var + `darkMode: ['selector', '[data-theme="dark"]']` |
| `components/theme/ThemeProvider.tsx` | Context: `tone`, `color`, `toggleTone`, `setTone`, `setColor` + localStorage sync |
| `components/theme/ThemeCustomizer.tsx` | Palette trigger + dropdown panel (tone buttons + color swatches + reset) |
| `components/theme/ThemeToggle.tsx` | Simple icon-only tone toggle (used in Studio / Admin sidebars) |
| `components/layout/TopBar.tsx` | Renders `<ThemeCustomizer />` |

---

## Feature 7 — Certificate Social Media Sharing

**สถานะ:** ✅ Implemented (2026-05-17)

### Problem Statement
เมื่อผู้เรียนเรียนจบและได้รับใบประกาศ พวกเขาต้องการแสดงความสำเร็จบน social media เพื่อเพิ่ม social proof และเป็น viral loop ให้ VERDA ด้วย

### User Stories
| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-7.1 | ผู้เรียน | แชร์ใบประกาศไปยัง LinkedIn | แสดงความสำเร็จใน profile |
| US-7.2 | ผู้เรียน | แชร์ไปยัง Facebook | แจ้งเพื่อนและเครือข่าย |
| US-7.3 | ผู้เรียน | แชร์ไปยัง X (Twitter) | โพสต์ Tweet พร้อม hashtag |
| US-7.4 | ผู้เรียน | คัดลอก link ใบประกาศ | วางได้เอง ใน channel ใดก็ได้ |
| US-7.5 | ผู้เรียน | เห็น preview card สวยงามเมื่อ link ถูก share | ดูน่าเชื่อถือ + น่า click |

### Acceptance Criteria
- [x] **AC-7.1 — LinkedIn share:** เปิด `linkedin.com/sharing/share-offsite/?url=` พร้อม URL ใบประกาศ
- [x] **AC-7.2 — Facebook share:** เปิด `facebook.com/sharer/sharer.php?u=` พร้อม URL
- [x] **AC-7.3 — X/Twitter share:** เปิด `twitter.com/intent/tweet?text=&url=` พร้อม pre-filled Thai text + hashtags
- [x] **AC-7.4 — Copy link:** `navigator.clipboard.writeText(url)` พร้อม fallback `execCommand('copy')`, แสดง "คัดลอกแล้ว!" 2.5 วินาที
- [x] **AC-7.5 — Pop-up window:** share links เปิดใน popup window ขนาด 600×500 (noopener, noreferrer)
- [x] **AC-7.6 — Dynamic OG metadata:** `generateMetadata()` ใน certificate page ส่ง `og:title`, `og:description`, `og:image`, `twitter:card` ที่ dynamic ตาม certId
- [x] **AC-7.7 — OG image endpoint:** `/api/og/certificate?certId=` ส่งคืน 1200×630 PNG ที่มีชื่อผู้เรียน, ชื่อคอร์ส, logo — Edge runtime ใช้ `next/og` (ImageResponse built-in)
- [x] **AC-7.8 — LinkedIn credential hint:** แสดงคำแนะนำการเพิ่ม Certification ใน LinkedIn profile

### Technical Design
```
Share URL pattern (LinkedIn):  linkedin.com/sharing/share-offsite/?url={encodeURIComponent(certUrl)}
Share URL pattern (Facebook):  facebook.com/sharer/sharer.php?u={encodeURIComponent(certUrl)}
Share URL pattern (X):         twitter.com/intent/tweet?text={text}&url={url}
Copy to Clipboard:             navigator.clipboard.writeText() + execCommand fallback
Open Graph (server):           generateMetadata() → og:title, og:description, og:image, twitter:card
OG Image:                      /api/og/certificate — next/og ImageResponse (edge runtime, built-in Next.js 15)
```

### Files
| File | Purpose |
|------|---------|
| `components/certificate/CertificateShareButtons.tsx` | Share buttons + copy link (client component) |
| `app/[locale]/certificate/[certId]/page.tsx` | Dynamic `generateMetadata()` (OG tags) + renders share panel |
| `app/api/og/certificate/route.tsx` | ✅ OG image generation — Edge route, `next/og` ImageResponse, 1200×630 PNG with VERDA branding, student name, course title, instructor, decorative elements |

---

## Feature 8 — Role-Separated Dashboards (Instructor Studio & Admin Panel)

**สถานะ:** ✅ Implemented (2026-05-17)

### Instructor Studio (`/th/studio`)

INSTRUCTOR-only area (guard: session role must be `INSTRUCTOR` or `ADMIN`). Layout: dark sidebar (`bg-ink`, 220px) + content area.

#### Features
- ✅ Auth-aware: uses `session.user.id` + `session.user.name` from `auth()`
- ✅ DB queries (with mock fallback): instructor's courses list, recent 5 enrollments, open Q&A threads (unanswered)
- ✅ Stats row: total courses, total students, avg rating, total revenue
- ✅ Monthly revenue bar chart (6 bars, last month highlighted)
- ✅ Course table: title, status, enrolled count, rating
- ✅ Quick actions panel (create course, manage courses, view analytics)
- ✅ Recent enrollments list: Avatar + student name + course + progress indicator
- ✅ Open Q&A threads panel
- ✅ Notification hint

#### Sub-routes
| Route | File | Purpose |
|-------|------|---------|
| `/th/studio` | `app/[locale]/(instructor)/studio/page.tsx` | Main dashboard |
| `/th/studio/courses/[slug]/quiz/[lessonId]` | `app/[locale]/(instructor)/studio/courses/[slug]/quiz/[lessonId]/page.tsx` | Quiz builder |
| `/th/studio/settings` | `app/[locale]/(instructor)/studio/settings/page.tsx` | Profile / payout settings |

---

### Admin Panel (`/th/admin`)

ADMIN/SUPERADMIN-only area (guard: session role must be `ADMIN` or `SUPERADMIN`). Layout: light sidebar (`bg-paper-3`, 220px) + content area.

#### Features
- ✅ Auth-aware: uses `auth()` to verify session
- ✅ DB queries (with mock fallback): totalUsers, totalCourses, totalOrders, totalRevenue, newUsersThisWeek, pendingReviews, publishedCourses, draftCourses, recentOrders
- ✅ Stats row: 4 cards with sub-labels (weekly growth, published/draft counts)
- ✅ 6-month revenue bar chart (last month highlighted darker)
- ✅ Recent orders table: order ID, student, course, amount, status badge (STATUS_COLORS)
- ✅ Pending actions panel: courses awaiting review (warning state), new users this week, pending orders
- ✅ Quick nav links to sub-sections
- ✅ Platform status indicators: API / DB / Storage / Mux / Stripe (green dots)
- ✅ Certificates issued counter

#### Sub-routes
| Route | File | Purpose |
|-------|------|---------|
| `/th/admin` | `app/[locale]/(admin)/admin/page.tsx` | Main dashboard |
| `/th/admin/users` | `app/[locale]/(admin)/admin/users/page.tsx` | User management |
| `/th/admin/courses` | `app/[locale]/(admin)/admin/courses/page.tsx` | Course approval queue |
| `/th/admin/orders` | `app/[locale]/(admin)/admin/orders/page.tsx` | Order management |
| `/th/admin/certificates` | `app/[locale]/(admin)/admin/certificates/page.tsx` | ✅ Certificate issuance form + issued list (2026-05-19) |
| `/th/admin/settings` | `app/[locale]/(admin)/admin/settings/page.tsx` | Platform settings (toggles + fields) |

---

## Feature 9 — Certificate Issuance Form (Admin)

**สถานะ:** ✅ Implemented (2026-05-19)

### Problem Statement
Admin ต้องการออกใบประกาศนียบัตรแบบ manual โดยระบุชื่อผู้เรียนและชื่อคอร์สได้เองโดยไม่ต้องรอ DB ระบบสร้าง preview ใบประกาศแบบ full-design ที่สามารถพิมพ์หรือบันทึกเป็น PDF ได้ทันที

### User Stories
| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-9.1 | Admin | กรอกชื่อผู้เรียน + เลือกคอร์ส + ชื่อผู้สอน | ออกใบประกาศแบบ manual ได้ |
| US-9.2 | Admin | ดูตัวอย่างใบประกาศก่อนออก | ตรวจสอบข้อมูลก่อนส่งให้ผู้เรียน |
| US-9.3 | Admin | พิมพ์หรือบันทึก PDF จากหน้า preview | มีไฟล์ใบประกาศพร้อมส่ง |
| US-9.4 | Admin | เห็นรายการใบประกาศที่ออกแล้ว | ตรวจสอบประวัติได้ |

### Acceptance Criteria
- [x] **AC-9.1 — Form fields:** ชื่อผู้เรียน (text, required) + คอร์ส (dropdown จาก 7 mock courses + option กรอกเอง) + ชื่อผู้สอน (auto-fill จาก course + แก้ได้) + วันที่ออก (date picker, default = today)
- [x] **AC-9.2 — Inline validation:** แสดง error ใต้ field ทันทีเมื่อ submit โดยไม่มีข้อมูลครบ
- [x] **AC-9.3 — Preview page:** `/certificate/preview?name=&course=&instructor=&date=` — render ใบประกาศเต็มรูปแบบจาก URL params ไม่ต้องใช้ DB
- [x] **AC-9.4 — Print support:** "พิมพ์ / บันทึก PDF" button → `window.print()`, ปุ่มและ preview badge ซ่อนด้วย `print:hidden`
- [x] **AC-9.5 — Issued list:** ตาราง mock (+ DB fallback) แสดงรายการใบประกาศที่ออกแล้ว พร้อม link ดูใบประกาศ
- [x] **AC-9.6 — Stats cards:** Total issued + This month counter

### Certificate Design (Preview & [certId] page)
ใบประกาศแสดงข้อมูลครบ 2 ฟิลด์หลัก:
1. **ชื่อผู้เรียน** — `font-display text-[48px]` กลางหน้า ใต้ "ขอมอบให้แก่"
2. **ชื่อคอร์ส** — `font-display text-[28px] text-viridian` ใต้ "สำเร็จการเรียนหลักสูตร"

### Files
| File | Purpose |
|------|---------|
| `components/admin/IssueCertificateForm.tsx` | Client form: name + course dropdown + instructor + date + validation |
| `app/[locale]/(admin)/admin/certificates/page.tsx` | Admin page: stats + form + issued list table |
| `app/[locale]/certificate/preview/page.tsx` | Preview certificate from URL query params (no DB) |
| `components/certificate/PrintButton.tsx` | Client "Print / Save PDF" button (`window.print()`) |
| `components/layout/AdminSidebar.tsx` | Added "Certificates" nav item (Award icon) |

### Technical Design
```
Flow:
  Admin fills form → validate → router.push(/certificate/preview?name=...&course=...&instructor=...&date=...)
  Preview page reads searchParams → renders full certificate design → window.print()

Certificate preview URL:
  /[locale]/certificate/preview?name={name}&course={course}&instructor={instructor}&date={YYYY-MM-DD}

Static route takes priority over [certId] dynamic route in Next.js App Router.
```

---

---

## Feature 10 — Verdy AI Chatbot

**สถานะ:** ✅ Implemented (2026-05-29)

### Problem Statement
ผู้ใช้ต้องการผู้ช่วยตอบคำถามเกี่ยวกับแพลตฟอร์ม คอร์สเรียน ราคา และสถานที่เรียน On-site ได้ทันทีโดยไม่ต้องรอทีม support

### User Stories
| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-10.1 | ผู้เยี่ยมชม | ถามเรื่องคอร์สและราคาได้ทันที | ตัดสินใจสมัครได้เร็วขึ้น |
| US-10.2 | ผู้สนใจ | ถามสถานที่เรียน On-site | วางแผนการเดินทางได้ |
| US-10.3 | ผู้ใช้ | ได้รับคำตอบเป็นภาษาไทย น่ารัก และเป็นมิตร | รู้สึกได้รับการดูแลจากแพลตฟอร์ม |

### Acceptance Criteria
- [x] **AC-10.1 — Widget ลอย:** ปุ่มหุ่นยนต์ 🤖 มุมขวาล่างทุกหน้า พร้อม sparkle badge
- [x] **AC-10.2 — Female robot persona:** Verdy พูดสุภาพ น่ารัก ใช้ "ค่ะ/นะคะ" และ "หนู" แทนตัวเอง
- [x] **AC-10.3 — Keyword matching 25+ rules:** ครอบคลุมคอร์ส ราคา สถานที่ ใบประกาศ ผู้สอน ชำระเงิน ฯลฯ
- [x] **AC-10.4 — On-site PIM info:** ที่อยู่ PIM สถาบันปัญญาภิวัฒน์ การเดินทาง สิ่งอำนวยความสะดวก
- [x] **AC-10.5 — Quick questions:** 4 ปุ่มคำถามด่วน กดแล้วถามได้ทันที
- [x] **AC-10.6 — Typing indicator:** จุดกระพริบสีเขียวขณะ bot กำลังตอบ
- [x] **AC-10.7 — Minimize / Reset:** ย่อหน้าต่างเหลือแถบแคบ และล้างบทสนทนาได้
- [x] **AC-10.8 — Unread badge:** แสดงตัวเลขเมื่อมีข้อความใหม่ขณะหน้าต่างปิด
- [x] **AC-10.9 — ไม่ต้องการ API key:** ใช้ keyword matching ทำงานได้ทันทีโดยไม่ต้องพึ่ง external API

### On-site Information Covered
- 📍 PIM — สถาบันปัญญาภิวัฒน์ ถนนแจ้งวัฒนะ เขตหลักสี่ กรุงเทพฯ 10210
- 🚇 MRT สายสีชมพู สถานี PIM
- Workshop / Bootcamp / Intensive 5 วัน
- ใบประกาศร่วม VERDA + PIM

### Files
| File | Purpose |
|------|---------|
| `components/chatbot/VerdyChat.tsx` | Widget ครบชุด: UI + keyword engine + 25 rules |
| `app/[locale]/layout.tsx` | Import `<VerdyChat />` — แสดงทุกหน้า |

---

## Feature 11 — Language Switcher (TH ⇄ EN)

**สถานะ:** ✅ Implemented (2026-05-29)

### Problem Statement
ผู้ใช้ต้องการสลับภาษา UI ระหว่างไทยและอังกฤษได้ง่าย จาก TopBar ทุกหน้า

### User Stories
| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-11.1 | ผู้ใช้ | กดปุ่มสลับภาษา TH ↔ EN | เปลี่ยน UI language ได้ทันที |
| US-11.2 | ผู้ใช้ | เห็น flag ของภาษาปัจจุบันและภาษาปลายทาง | รู้ทันทีว่ากดแล้วจะเปลี่ยนเป็นอะไร |
| US-11.3 | ผู้ใช้ | รักษา URL path เดิมเมื่อสลับภาษา | ไม่ต้องกลับไปหน้าแรกทุกครั้ง |

### Acceptance Criteria
- [x] **AC-11.1 — ปุ่มใน TopBar:** อยู่ระหว่าง ThemeCustomizer และ Cart icon
- [x] **AC-11.2 — Flag SVG inline:** ธงชาติไทย (5 แถบ แดง/ขาว/น้ำเงิน/ขาว/แดง) และ Union Jack (UK) วาดเป็น inline SVG
- [x] **AC-11.3 — Active / Target state:** ธงปัจจุบัน opacity 100%, ธงปลายทาง opacity 40%
- [x] **AC-11.4 — Path preservation:** `/th/courses/xxx` → `/en/courses/xxx` (ไม่กลับ root)
- [x] **AC-11.5 — Hover style:** เปลี่ยนสีเป็น viridian เมื่อ hover เหมือน TopBar element อื่น
- [x] **AC-11.6 — Tooltip:** แสดงข้อความบอก action ที่จะเกิดขึ้น

### Technical Design
```
usePathname() → replace /{locale}/ → router.push(newPath)
Flag components: <FlagTH /> และ <FlagGB /> เป็น inline SVG ไม่ต้องโหลดภาพภายนอก
```

### Files
| File | Purpose |
|------|---------|
| `components/layout/TopBar.tsx` | เพิ่ม `FlagTH`, `FlagGB` SVG components + `handleLocaleSwitch()` + ปุ่มสลับ |

---

## 5. Supporting Pages & Features

| Page | Route | Status |
|------|-------|--------|
| Home | `/th` | ✅ |
| Forum (thread list) | `/th/forum` | ✅ |
| Forum (thread detail) | `/th/forum/[threadId]` | ✅ |
| Payment success | `/th/payment/success` | ✅ |
| Cart / Checkout | `/th/cart` | ✅ |
| Pricing | `/th/pricing` | ✅ |
| Leaderboard | `/th/leaderboard` | ✅ |
| Live Session | `/th/learn/[slug]/live` | ✅ (stub) |
| Post-Quiz Review | `/th/learn/[slug]/review` | ✅ |
| Instructor Studio | `/th/studio` | ✅ (auth-aware, DB+mock fallback, revenue chart, enrollments, Q&A) |
| Admin Panel | `/th/admin` | ✅ (auth-aware, DB+mock fallback, revenue chart, orders table, pending actions, platform status) |

---

## 6. Database Models (Prisma)

```
User → Account, Session, Enrollment, Attempt, Certificate, Thread, Post, Note, UserPoints
Course → Section → Lesson → Quiz → Question → QuestionOption
Enrollment → UserCourseProgress, LessonProgress
Attempt (quiz results)
Certificate
Order → OrderItem
Coupon
Thread → Post → PostVote
Badge, UserBadge, UserPoints
Tenant (multi-tenant ready)
```

---

## 7. API Surface

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/progress` | POST | Update lesson watchedPct |
| `/api/quiz/timer` | GET/POST | KV-based quiz timer |
| `/api/webhooks/stripe` | POST | Payment confirmation |
| `/api/webhooks/mux` | POST | Video upload ready |
| `/api/cron/analytics` | GET | Daily analytics rollup |
| `/api/cron/reminders` | GET | Streak reminder emails |
| `/api/inngest` | POST | Background job handler |
| `/api/chat` | POST | Verdy chatbot (keyword engine / AI fallback) |

---

## 8. Environment Variables Required

```env
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-32-chars>
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINE_CLIENT_ID=
LINE_CLIENT_SECRET=

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Video
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_SIGNING_KEY_ID=
MUX_SIGNING_PRIVATE_KEY=

# Payment
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Storage & Email
BLOB_READ_WRITE_TOKEN=
RESEND_API_KEY=
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

> **Demo mode:** ถ้าไม่ตั้ง `DATABASE_URL` ระบบจะใช้ mock data fallback อัตโนมัติ ทุก feature ยังทำงานได้ปกติ

---

## 9. Student Demo Walkthrough

ดู [TASKS.md § Demo Guide](TASKS.md) สำหรับ step-by-step demo

**Quick start:**
```bash
cd LMS/verda-lms
npm run dev
# เปิด http://localhost:3000/th
# Login: demo@verda.dev / demo1234
```
