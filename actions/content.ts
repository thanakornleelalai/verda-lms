"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  aboutContent, blogPosts, jobOpenings, pressItems,
  genId, slugify,
  type AboutContent, type BlogPost, type JobOpening, type PressItem,
} from "@/lib/company-content";

type Result = { success: boolean; error?: string };

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  return !!role && ["ADMIN", "SUPERADMIN"].includes(role);
}

function revalidateAll(path: string) {
  revalidatePath("/admin/content");
  revalidatePath(`/th${path}`);
  revalidatePath(`/en${path}`);
}

// ── Read helpers (for public pages & admin) ──────────────────────────────────

export async function getAboutContent(): Promise<AboutContent> {
  return { ...aboutContent, values: [...aboutContent.values], stats: [...aboutContent.stats] };
}

export async function getBlogPosts(opts?: { publishedOnly?: boolean }): Promise<BlogPost[]> {
  const list = opts?.publishedOnly ? blogPosts.filter((p) => p.published) : blogPosts;
  return [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return blogPosts.find((p) => p.slug === slug) ?? null;
}

export async function getJobOpenings(opts?: { activeOnly?: boolean }): Promise<JobOpening[]> {
  const list = opts?.activeOnly ? jobOpenings.filter((j) => j.active) : jobOpenings;
  return [...list].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export async function getPressItems(): Promise<PressItem[]> {
  return [...pressItems].sort((a, b) => b.date.localeCompare(a.date));
}

// ── About ─────────────────────────────────────────────────────────────────────

export async function updateAboutContent(data: {
  heroTitle: string;
  heroSubtitle: string;
  mission: string;
  story: string;
}): Promise<Result> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  if (!data.heroTitle.trim()) return { success: false, error: "กรุณากรอกหัวข้อหลัก" };

  aboutContent.heroTitle = data.heroTitle.trim();
  aboutContent.heroSubtitle = data.heroSubtitle.trim();
  aboutContent.mission = data.mission.trim();
  aboutContent.story = data.story.trim();
  aboutContent.updatedAt = new Date().toISOString();

  revalidateAll("/about");
  return { success: true };
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export async function createBlogPost(data: {
  title: string;
  excerpt: string;
  body: string;
  author: string;
  category: string;
}): Promise<Result & { id?: string }> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  if (!data.title.trim()) return { success: false, error: "กรุณากรอกหัวข้อบทความ" };

  const GRADIENTS = [
    "linear-gradient(135deg, #0F5D4A 0%, #1A7A60 100%)",
    "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
    "linear-gradient(135deg, #713f12 0%, #a16207 100%)",
    "linear-gradient(135deg, #1A2320 0%, #2D6A4F 100%)",
  ];

  const post: BlogPost = {
    id: genId("blog"),
    slug: slugify(data.title),
    title: data.title.trim(),
    excerpt: data.excerpt.trim(),
    body: data.body.trim(),
    author: data.author.trim() || "ทีมงาน VERDA",
    category: data.category.trim() || "ทั่วไป",
    coverGradient: GRADIENTS[blogPosts.length % GRADIENTS.length],
    published: false,
    publishedAt: new Date().toISOString(),
  };
  blogPosts.unshift(post);
  revalidateAll("/blog");
  return { success: true, id: post.id };
}

export async function updateBlogPost(id: string, data: {
  title: string;
  excerpt: string;
  body: string;
  author: string;
  category: string;
}): Promise<Result> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  const post = blogPosts.find((p) => p.id === id);
  if (!post) return { success: false, error: "ไม่พบบทความ" };

  post.title = data.title.trim();
  post.slug = slugify(data.title);
  post.excerpt = data.excerpt.trim();
  post.body = data.body.trim();
  post.author = data.author.trim();
  post.category = data.category.trim();
  revalidateAll("/blog");
  return { success: true };
}

export async function toggleBlogPost(id: string): Promise<Result> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  const post = blogPosts.find((p) => p.id === id);
  if (!post) return { success: false, error: "ไม่พบบทความ" };
  post.published = !post.published;
  if (post.published) post.publishedAt = new Date().toISOString();
  revalidateAll("/blog");
  return { success: true };
}

export async function deleteBlogPost(id: string): Promise<Result> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  const idx = blogPosts.findIndex((p) => p.id === id);
  if (idx >= 0) blogPosts.splice(idx, 1);
  revalidateAll("/blog");
  return { success: true };
}

// ── Careers ─────────────────────────────────────────────────────────────────────

export async function createJob(data: {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
}): Promise<Result> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  if (!data.title.trim()) return { success: false, error: "กรุณากรอกตำแหน่งงาน" };

  const job: JobOpening = {
    id: genId("job"),
    title: data.title.trim(),
    department: data.department.trim() || "ทั่วไป",
    location: data.location.trim() || "Remote",
    type: data.type.trim() || "Full-time",
    description: data.description.trim(),
    requirements: data.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
    active: true,
    postedAt: new Date().toISOString(),
  };
  jobOpenings.unshift(job);
  revalidateAll("/careers");
  return { success: true };
}

export async function updateJob(id: string, data: {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
}): Promise<Result> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  const job = jobOpenings.find((j) => j.id === id);
  if (!job) return { success: false, error: "ไม่พบตำแหน่งงาน" };

  job.title = data.title.trim();
  job.department = data.department.trim();
  job.location = data.location.trim();
  job.type = data.type.trim();
  job.description = data.description.trim();
  job.requirements = data.requirements.split("\n").map((r) => r.trim()).filter(Boolean);
  revalidateAll("/careers");
  return { success: true };
}

export async function toggleJob(id: string): Promise<Result> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  const job = jobOpenings.find((j) => j.id === id);
  if (!job) return { success: false, error: "ไม่พบตำแหน่งงาน" };
  job.active = !job.active;
  revalidateAll("/careers");
  return { success: true };
}

export async function deleteJob(id: string): Promise<Result> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  const idx = jobOpenings.findIndex((j) => j.id === id);
  if (idx >= 0) jobOpenings.splice(idx, 1);
  revalidateAll("/careers");
  return { success: true };
}

// ── Press ─────────────────────────────────────────────────────────────────────

export async function createPressItem(data: {
  title: string;
  outlet: string;
  date: string;
  url: string;
  excerpt: string;
  type: string;
}): Promise<Result> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  if (!data.title.trim()) return { success: false, error: "กรุณากรอกหัวข้อข่าว" };

  const item: PressItem = {
    id: genId("press"),
    title: data.title.trim(),
    outlet: data.outlet.trim() || "—",
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    url: data.url.trim(),
    excerpt: data.excerpt.trim(),
    type: data.type.trim() || "News",
  };
  pressItems.unshift(item);
  revalidateAll("/press");
  return { success: true };
}

export async function deletePressItem(id: string): Promise<Result> {
  if (!await requireAdmin()) return { success: false, error: "Unauthorized" };
  const idx = pressItems.findIndex((p) => p.id === id);
  if (idx >= 0) pressItems.splice(idx, 1);
  revalidateAll("/press");
  return { success: true };
}
