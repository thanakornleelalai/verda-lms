import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { getAboutContent } from "@/actions/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "เกี่ยวกับเรา | VERDA",
  description: "VERDA — แพลตฟอร์มเรียนออนไลน์ที่เชื่อว่าความรู้ที่ดีที่สุดมาจากประสบการณ์จริง",
};

export default async function AboutPage() {
  const about = await getAboutContent();

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        {/* Hero */}
        <section className="py-20 text-center border-b border-line">
          <Container>
            <EyebrowLabel className="mb-3">— ABOUT VERDA</EyebrowLabel>
            <h1 className="font-display text-[48px] text-ink tracking-[-0.02em] leading-[1.1] mb-5 max-w-[680px] mx-auto">
              {about.heroTitle}
            </h1>
            <p className="text-[16px] text-ink-3 max-w-[560px] mx-auto font-thai leading-[1.8]">
              {about.heroSubtitle}
            </p>
          </Container>
        </section>

        {/* Stats */}
        <section className="py-12 bg-paper-2 border-b border-line">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-[760px] mx-auto">
              {about.stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-[40px] text-viridian leading-none mb-1">{s.value}</p>
                  <p className="text-[13px] text-ink-3 font-thai">{s.label}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Mission & Story */}
        <section className="py-16">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[900px] mx-auto">
              <div>
                <EyebrowLabel className="mb-3">— MISSION</EyebrowLabel>
                <h2 className="font-display text-[28px] text-ink mb-4 tracking-[-0.015em]">พันธกิจของเรา</h2>
                <p className="text-[15px] text-ink-2 font-thai leading-[1.9] whitespace-pre-line">{about.mission}</p>
              </div>
              <div>
                <EyebrowLabel className="mb-3">— OUR STORY</EyebrowLabel>
                <h2 className="font-display text-[28px] text-ink mb-4 tracking-[-0.015em]">เรื่องราวของ VERDA</h2>
                <p className="text-[15px] text-ink-2 font-thai leading-[1.9] whitespace-pre-line">{about.story}</p>
              </div>
            </div>
          </Container>
        </section>

        {/* Values */}
        <section className="py-16 bg-paper-2 border-t border-line">
          <Container>
            <div className="text-center mb-10">
              <EyebrowLabel className="mb-2">— VALUES</EyebrowLabel>
              <h2 className="font-display text-[32px] text-ink tracking-[-0.015em]">ค่านิยมของเรา</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[960px] mx-auto">
              {about.values.map((v) => (
                <div key={v.title} className="bg-paper-3 border border-line rounded-r3 p-6">
                  <div className="text-[32px] mb-3">{v.icon}</div>
                  <h3 className="font-semibold text-[15px] text-ink mb-2">{v.title}</h3>
                  <p className="text-[13px] text-ink-3 font-thai leading-[1.7]">{v.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
