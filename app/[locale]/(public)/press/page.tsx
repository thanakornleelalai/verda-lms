import { ExternalLink, Newspaper, Award, Handshake, Mic } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { getPressItems } from "@/actions/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "สื่อ | VERDA",
  description: "ข่าวสาร รางวัล และความร่วมมือของ VERDA ในสื่อต่าง ๆ",
};

const TYPE_ICON: Record<string, typeof Newspaper> = {
  News: Newspaper,
  Award: Award,
  Partnership: Handshake,
  Interview: Mic,
};

export default async function PressPage() {
  const items = await getPressItems();

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        <section className="py-20 text-center border-b border-line">
          <Container>
            <EyebrowLabel className="mb-3">— PRESS & MEDIA</EyebrowLabel>
            <h1 className="font-display text-[48px] text-ink tracking-[-0.02em] leading-[1.1] mb-5">
              VERDA ในสื่อ
            </h1>
            <p className="text-[16px] text-ink-3 max-w-[480px] mx-auto font-thai leading-[1.8]">
              ข่าวสาร รางวัล และความร่วมมือของเรา · สำหรับสื่อมวลชน ติดต่อ press@verda.co.th
            </p>
          </Container>
        </section>

        <section className="py-16">
          <Container className="max-w-[760px]">
            {items.length === 0 ? (
              <p className="text-center text-ink-3 py-12">ยังไม่มีข่าว</p>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((p) => {
                  const Icon = TYPE_ICON[p.type] ?? Newspaper;
                  const content = (
                    <div className="bg-paper-3 border border-line rounded-r3 p-6 hover:border-viridian/40 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-r2 bg-viridian/10 flex items-center justify-center shrink-0">
                          <Icon size={17} className="text-viridian" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-pill bg-viridian/10 text-viridian uppercase tracking-wider">{p.type}</span>
                            <span className="font-mono text-[11px] text-ink-4">
                              {p.outlet} · {new Date(p.date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          <h2 className="font-semibold text-[17px] text-ink leading-snug mb-1.5">{p.title}</h2>
                          <p className="text-[14px] text-ink-3 font-thai leading-[1.7]">{p.excerpt}</p>
                        </div>
                        {p.url && <ExternalLink size={16} className="text-ink-4 shrink-0 mt-1" />}
                      </div>
                    </div>
                  );
                  return p.url ? (
                    <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer" className="block">{content}</a>
                  ) : (
                    <div key={p.id}>{content}</div>
                  );
                })}
              </div>
            )}
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
