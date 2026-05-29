import { ContentManager } from "./ContentManager";
import { getAboutContent, getBlogPosts, getJobOpenings, getPressItems } from "@/actions/content";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [about, blog, jobs, press] = await Promise.all([
    getAboutContent(),
    getBlogPosts(),
    getJobOpenings(),
    getPressItems(),
  ]);

  return <ContentManager about={about} blog={blog} jobs={jobs} press={press} />;
}
