import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { getBlogPost } from "@/actions/content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "ไม่พบบทความ | VERDA" };
  return { title: `${post.title} | VERDA Blog`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug, locale } = await params;
  const post = await getBlogPost(slug);
  if (!post || !post.published) notFound();

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        {/* Cover */}
        <div className="h-[220px] relative" style={{ background: post.coverGradient }} />

        <Container className="max-w-[720px]">
          <article className="-mt-16 relative bg-paper rounded-r4 border border-line p-10 shadow-lg">
            <Link href={`/${locale}/blog`} className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink mb-6 transition-colors">
              <ArrowLeft size={14} /> กลับไปบล็อก
            </Link>

            <span className="font-mono text-[10px] px-2.5 py-1 rounded-pill bg-viridian/10 text-viridian uppercase tracking-wider">
              {post.category}
            </span>

            <h1 className="font-display text-[36px] text-ink tracking-[-0.02em] leading-[1.2] mt-4 mb-3">
              {post.title}
            </h1>

            <p className="font-mono text-[12px] text-ink-4 mb-8 pb-8 border-b border-line">
              {post.author} · {new Date(post.publishedAt).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}
            </p>

            <div className="text-[16px] text-ink-2 font-thai leading-[1.9] whitespace-pre-line">
              {post.body}
            </div>
          </article>
        </Container>

        <div className="h-16" />
      </main>
      <Footer />
    </div>
  );
}
