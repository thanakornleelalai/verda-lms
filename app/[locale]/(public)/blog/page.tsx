import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { getBlogPosts } from "@/actions/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "บล็อก | VERDA",
  description: "บทความ ความรู้ และเคล็ดลับการเรียนรู้จาก VERDA",
};

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = await getBlogPosts({ publishedOnly: true });

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        <section className="py-16 text-center border-b border-line">
          <Container>
            <EyebrowLabel className="mb-3">— BLOG</EyebrowLabel>
            <h1 className="font-display text-[44px] text-ink tracking-[-0.02em] leading-[1.1] mb-4">
              บทความและความรู้
            </h1>
            <p className="text-[16px] text-ink-3 max-w-[480px] mx-auto font-thai leading-[1.7]">
              เคล็ดลับการเรียนรู้ เทรนด์อาชีพ และเรื่องราวจากผู้เชี่ยวชาญ
            </p>
          </Container>
        </section>

        <section className="py-16">
          <Container>
            {posts.length === 0 ? (
              <p className="text-center text-ink-3 py-12">ยังไม่มีบทความ</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
                {posts.map((p) => (
                  <Link key={p.id} href={`/${locale}/blog/${p.slug}`}
                    className="group bg-paper-3 border border-line rounded-r3 overflow-hidden hover:border-viridian transition-colors">
                    <div className="h-[160px] relative" style={{ background: p.coverGradient }}>
                      <span className="absolute top-3 left-3 font-mono text-[10px] px-2.5 py-1 rounded-pill bg-white/90 text-ink uppercase tracking-wider">
                        {p.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h2 className="font-semibold text-[16px] text-ink leading-snug mb-2 group-hover:text-viridian transition-colors line-clamp-2">
                        {p.title}
                      </h2>
                      <p className="text-[13px] text-ink-3 font-thai leading-[1.6] mb-3 line-clamp-2">{p.excerpt}</p>
                      <p className="font-mono text-[11px] text-ink-4">
                        {p.author} · {new Date(p.publishedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
