import type { User, PublicInstructor } from "@/types";

export const MOCK_STUDENT: User = {
  id: "usr_student_001",
  tenantId: "ten_default",
  email: "weerawat@example.com",
  name: "คุณวีรวัฒน์ จันทรชุม",
  role: "STUDENT",
  twoFactorEnabled: false,
  createdAt: "2026-01-15T08:00:00Z",
};

export const MOCK_INSTRUCTOR: User = {
  id: "usr_instructor_001",
  tenantId: "ten_default",
  email: "pimchanok@example.com",
  name: "คุณพิมพ์ชนก วัฒนากร",
  role: "INSTRUCTOR",
  twoFactorEnabled: false,
  createdAt: "2025-11-01T09:00:00Z",
};

export const MOCK_INSTRUCTORS: PublicInstructor[] = [
  {
    id: "usr_instructor_001",
    name: "คุณพิมพ์ชนก วัฒนากร",
    bio: "UX Designer & Trainer, 10+ ปี · อดีต UX Lead ที่ SCB Tech",
    courseCount: 4,
    studentCount: 3241,
    avgRating: 4.86,
    specialties: ["UX Design", "Figma", "Design Systems"],
  },
  {
    id: "usr_instructor_002",
    name: "คุณธนพล สิทธิกุล",
    bio: "Full-Stack Engineer · สร้าง SaaS มาแล้ว 3 ตัว",
    courseCount: 6,
    studentCount: 5812,
    avgRating: 4.91,
    specialties: ["Next.js", "TypeScript", "PostgreSQL"],
  },
  {
    id: "usr_instructor_003",
    name: "คุณนันทวัน ชัยวิชิต",
    bio: "Data Scientist · Kaggle Master · อาจารย์มหาวิทยาลัย",
    courseCount: 3,
    studentCount: 2104,
    avgRating: 4.78,
    specialties: ["Python", "ML", "Data Analysis"],
  },
  {
    id: "usr_instructor_004",
    name: "คุณภูริช อินทรศักดิ์",
    bio: "Digital Marketing Director · รันโฆษณา Meta/Google ให้แบรนด์ Top50",
    courseCount: 5,
    studentCount: 7390,
    avgRating: 4.83,
    specialties: ["Meta Ads", "Google Ads", "Marketing Analytics"],
  },
];
