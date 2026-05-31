// ── Company CMS content store ────────────────────────────────────────────────
// Shared in-memory store read by both admin Server Actions and public pages.
// Module-level singleton — persists within a server instance.
// In production, swap these arrays for a `CompanyContent` Prisma model.

// ── About (เกี่ยวกับเรา) ────────────────────────────────────────────────────────

export interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  mission: string;
  story: string;
  values: { title: string; description: string; icon: string }[];
  stats: { label: string; value: string }[];
  updatedAt: string;
}

export const aboutContent: AboutContent = {
  heroTitle: "เรียนกับคนที่ทำงานจริง",
  heroSubtitle:
    "VERDA คือแพลตฟอร์มเรียนออนไลน์ที่เชื่อว่าความรู้ที่ดีที่สุดมาจากประสบการณ์จริง เราคัดเลือกผู้สอนที่เป็นมืออาชีพในสายงานนั้นจริง ๆ",
  mission:
    "พันธกิจของเราคือทำให้คนไทยทุกคนเข้าถึงการเรียนรู้คุณภาพสูงจากผู้เชี่ยวชาญตัวจริง ในราคาที่จับต้องได้ และเรียนได้ทุกที่ทุกเวลา",
  story:
    "VERDA ก่อตั้งขึ้นในปี 2025 จากความตั้งใจของกลุ่มนักออกแบบ วิศวกร และนักการตลาดที่อยากแบ่งปันความรู้จากการทำงานจริงในอุตสาหกรรม เราเริ่มจากคอร์สเดียวในห้องเล็ก ๆ และเติบโตจนมีผู้เรียนกว่า 4,000 คนในวันนี้ พร้อมพันธมิตรการเรียน On-site ที่ PIM สถาบันปัญญาภิวัฒน์",
  values: [
    { title: "Practice over Theory", description: "เรียนจากเคสจริง ลงมือทำจริง ไม่ใช่แค่ทฤษฎี", icon: "🛠️" },
    { title: "Expert-led", description: "ผู้สอนทุกคนทำงานจริงในสายงานนั้น", icon: "🎯" },
    { title: "Accessible", description: "ราคาจับต้องได้ เรียนได้ทุกที่ทุกเวลา", icon: "🌏" },
    { title: "Community", description: "เรียนรู้ไปด้วยกัน เติบโตไปด้วยกัน", icon: "🤝" },
  ],
  stats: [
    { label: "ผู้เรียน", value: "4,200+" },
    { label: "คอร์ส", value: "200+" },
    { label: "ผู้สอน", value: "80+" },
    { label: "ความพึงพอใจ", value: "4.8/5" },
  ],
  updatedAt: new Date("2026-05-01").toISOString(),
};

// ── Blog (บล็อก) ───────────────────────────────────────────────────────────────

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  category: string;
  coverGradient: string;
  published: boolean;
  publishedAt: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "blog_001",
    slug: "5-skills-2026",
    title: "5 ทักษะที่ตลาดงานต้องการมากที่สุดในปี 2026",
    excerpt: "สำรวจทักษะที่บริษัทชั้นนำมองหา ตั้งแต่ AI, UX, ไปจนถึง Data — พร้อมแนวทางเริ่มต้น",
    body: "ในปี 2026 ตลาดงานเปลี่ยนแปลงอย่างรวดเร็ว ทักษะที่เคยเป็นที่ต้องการอาจไม่เพียงพออีกต่อไป...\n\n1. Generative AI & Prompt Engineering\n2. UX/UI Design\n3. Data Analysis\n4. Full-Stack Development\n5. Digital Marketing\n\nเริ่มต้นเรียนรู้ทักษะเหล่านี้ได้ที่ VERDA วันนี้",
    author: "ทีมงาน VERDA",
    category: "Career",
    coverGradient: "linear-gradient(135deg, #0F5D4A 0%, #1A7A60 100%)",
    published: true,
    publishedAt: new Date("2026-05-12").toISOString(),
  },
  {
    id: "blog_002",
    slug: "how-to-learn-online",
    title: "เรียนออนไลน์อย่างไรให้ได้ผลจริง",
    excerpt: "เทคนิคการเรียนออนไลน์ที่ช่วยให้คุณเรียนจบและนำไปใช้ได้จริง ไม่ใช่แค่ดูจบแล้วลืม",
    body: "หลายคนซื้อคอร์สออนไลน์แล้วเรียนไม่จบ บทความนี้รวบรวมเทคนิคที่ช่วยให้คุณเรียนได้อย่างมีประสิทธิภาพ...\n\n• ตั้งเป้าหมายชัดเจน\n• เรียนสม่ำเสมอวันละนิด\n• ลงมือทำตามทันที\n• เข้าร่วม community",
    author: "คุณพิมพ์พร วัฒนากร",
    category: "Learning",
    coverGradient: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
    published: true,
    publishedAt: new Date("2026-04-28").toISOString(),
  },
];

// ── Careers (ร่วมงานกับเรา) ──────────────────────────────────────────────────────

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string; // Full-time / Part-time / Contract / Remote
  description: string;
  requirements: string[];
  active: boolean;
  postedAt: string;
}

export const jobOpenings: JobOpening[] = [
  {
    id: "job_001",
    title: "Senior Content Producer",
    department: "Content",
    location: "กรุงเทพฯ (PIM) / Remote",
    type: "Full-time",
    description: "ดูแลการผลิตคอร์สเรียนคุณภาพสูงร่วมกับผู้สอน ตั้งแต่วางโครงสร้างจนถึงตัดต่อ",
    requirements: ["ประสบการณ์ผลิต content 3+ ปี", "เข้าใจ instructional design", "ใช้เครื่องมือตัดต่อวิดีโอได้"],
    active: true,
    postedAt: new Date("2026-05-10").toISOString(),
  },
  {
    id: "job_002",
    title: "Full-Stack Developer (Next.js)",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "พัฒนาและดูแลแพลตฟอร์ม VERDA LMS ด้วย Next.js 15, TypeScript, Prisma",
    requirements: ["Next.js / React 2+ ปี", "TypeScript", "PostgreSQL / Prisma", "ทำงานเป็นทีมได้ดี"],
    active: true,
    postedAt: new Date("2026-05-05").toISOString(),
  },
];

// ── Press (สื่อ) ───────────────────────────────────────────────────────────────

export interface PressItem {
  id: string;
  title: string;
  outlet: string;
  date: string;
  url: string;
  excerpt: string;
  type: string; // News / Interview / Award / Partnership
}

export const pressItems: PressItem[] = [
  {
    id: "press_001",
    title: "VERDA จับมือ PIM เปิดหลักสูตรเรียน On-site",
    outlet: "Thailand EdTech News",
    date: new Date("2026-04-20").toISOString(),
    url: "https://example.com/verda-pim",
    excerpt: "แพลตฟอร์มเรียนออนไลน์ VERDA ประกาศความร่วมมือกับสถาบันปัญญาภิวัฒน์ เปิดโอกาสเรียนแบบ On-site",
    type: "Partnership",
  },
  {
    id: "press_002",
    title: "VERDA คว้ารางวัล Best Learning Platform 2026",
    outlet: "Digital Awards Thailand",
    date: new Date("2026-03-15").toISOString(),
    url: "https://example.com/verda-award",
    excerpt: "VERDA ได้รับการยกย่องเป็นแพลตฟอร์มการเรียนรู้ยอดเยี่ยมแห่งปี จากผลงานด้านคุณภาพเนื้อหา",
    type: "Award",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export function genId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}`;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\sก-๙-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || `post-${Date.now().toString(36)}`;
}
