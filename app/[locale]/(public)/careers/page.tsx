import { MapPin, Briefcase, CheckCircle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";
import { getJobOpenings } from "@/actions/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ร่วมงานกับเรา | VERDA",
  description: "ร่วมเป็นส่วนหนึ่งของทีม VERDA — สร้างอนาคตการเรียนรู้ของคนไทย",
};

export default async function CareersPage() {
  const jobs = await getJobOpenings({ activeOnly: true });

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        <section className="py-20 text-center border-b border-line">
          <Container>
            <EyebrowLabel className="mb-3">— CAREERS</EyebrowLabel>
            <h1 className="font-display text-[48px] text-ink tracking-[-0.02em] leading-[1.1] mb-5 max-w-[620px] mx-auto">
              ร่วมสร้างอนาคต<br /><em className="not-italic text-viridian">การเรียนรู้ของคนไทย</em>
            </h1>
            <p className="text-[16px] text-ink-3 max-w-[520px] mx-auto font-thai leading-[1.8]">
              เรากำลังมองหาคนที่หลงใหลในการศึกษาและเทคโนโลยี มาร่วมทีมกับเรา
            </p>
          </Container>
        </section>

        <section className="py-16">
          <Container className="max-w-[760px]">
            <h2 className="font-display text-[26px] text-ink mb-6 tracking-[-0.015em]">
              ตำแหน่งที่เปิดรับ {jobs.length > 0 && <span className="text-ink-4 text-[18px]">({jobs.length})</span>}
            </h2>

            {jobs.length === 0 ? (
              <div className="text-center py-16 bg-paper-2 rounded-r3 border border-line">
                <Briefcase size={36} className="mx-auto mb-3 text-ink-4 opacity-40" />
                <p className="text-ink-3 font-thai">ยังไม่มีตำแหน่งที่เปิดรับในขณะนี้</p>
                <p className="text-[13px] text-ink-4 mt-1">ส่ง resume มาได้ที่ careers@verda.co.th</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {jobs.map((j) => (
                  <div key={j.id} className="bg-paper-3 border border-line rounded-r3 p-6 hover:border-viridian/40 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-[18px] text-ink mb-1">{j.title}</h3>
                        <div className="flex items-center gap-3 text-[13px] text-ink-3 flex-wrap">
                          <span className="flex items-center gap-1"><Briefcase size={13} />{j.department}</span>
                          <span className="flex items-center gap-1"><MapPin size={13} />{j.location}</span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded-pill bg-viridian/10 text-viridian uppercase">{j.type}</span>
                        </div>
                      </div>
                      <a href={`mailto:careers@verda.co.th?subject=สมัครงาน: ${encodeURIComponent(j.title)}`}>
                        <Button variant="primary" size="sm">สมัครงาน</Button>
                      </a>
                    </div>
                    {j.description && (
                      <p className="text-[14px] text-ink-2 font-thai leading-[1.7] mb-3">{j.description}</p>
                    )}
                    {j.requirements.length > 0 && (
                      <ul className="flex flex-col gap-1.5">
                        {j.requirements.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-[13px] text-ink-3 font-thai">
                            <CheckCircle size={14} className="text-viridian shrink-0 mt-0.5" />{r}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
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
