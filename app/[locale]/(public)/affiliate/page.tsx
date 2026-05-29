import { Share2, TrendingUp, Wallet, UserPlus, CheckCircle, Mail } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { Button } from "@/components/primitives/Button";

export const metadata = {
  title: "โปรแกรมพันธมิตร | VERDA",
  description: "แนะนำ VERDA ให้เพื่อน รับค่าคอมมิชชัน 30% จากทุกการสมัคร",
};

const STEPS = [
  { icon: UserPlus, title: "สมัครเป็นพันธมิตร", desc: "ลงทะเบียนฟรี รับลิงก์แนะนำเฉพาะตัว" },
  { icon: Share2, title: "แชร์ลิงก์", desc: "แชร์คอร์สที่ชอบให้เพื่อนหรือผู้ติดตาม" },
  { icon: Wallet, title: "รับค่าคอมมิชชัน", desc: "รับ 30% จากทุกการสมัครผ่านลิงก์ของคุณ" },
];

const BENEFITS = [
  "ค่าคอมมิชชัน 30% ต่อการสมัครสมาชิก",
  "Cookie tracking 60 วัน",
  "Dashboard ติดตามยอดแบบ real-time",
  "จ่ายค่าคอมทุกเดือน ขั้นต่ำ ฿500",
  "สื่อโปรโมทพร้อมใช้ (banner, ข้อความ)",
  "ทีม support เฉพาะพันธมิตร",
];

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        {/* Hero */}
        <section className="py-20 text-center border-b border-line">
          <Container>
            <EyebrowLabel className="mb-3">— AFFILIATE PROGRAM</EyebrowLabel>
            <h1 className="font-display text-[48px] text-ink tracking-[-0.02em] leading-[1.1] mb-5 max-w-[600px] mx-auto">
              แนะนำ VERDA<br /><em className="not-italic text-viridian">รับ 30% ทุกการสมัคร</em>
            </h1>
            <p className="text-[16px] text-ink-3 max-w-[500px] mx-auto font-thai leading-[1.8] mb-8">
              เปลี่ยนการแบ่งปันความรู้ให้เป็นรายได้ ร่วมเป็นพันธมิตรกับ VERDA วันนี้ — ฟรี ไม่มีค่าใช้จ่าย
            </p>
            <a href="mailto:affiliate@verda.co.th?subject=สมัครเป็นพันธมิตร VERDA">
              <Button variant="primary" size="lg" className="gap-2">
                <Share2 size={16} /> สมัครเป็นพันธมิตร
              </Button>
            </a>
          </Container>
        </section>

        {/* How it works */}
        <section className="py-16">
          <Container>
            <div className="text-center mb-10">
              <EyebrowLabel className="mb-2">— HOW IT WORKS</EyebrowLabel>
              <h2 className="font-display text-[32px] text-ink tracking-[-0.015em]">เริ่มต้นใน 3 ขั้นตอน</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[820px] mx-auto">
              {STEPS.map(({ icon: Icon, title, desc }, i) => (
                <div key={title} className="bg-paper-3 border border-line rounded-r3 p-6 text-center relative">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-viridian text-white font-mono text-[12px] flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="w-12 h-12 rounded-r2 bg-viridian/10 flex items-center justify-center mx-auto mb-4 mt-2">
                    <Icon size={22} className="text-viridian" />
                  </div>
                  <h3 className="font-semibold text-[16px] text-ink mb-1.5">{title}</h3>
                  <p className="text-[13px] text-ink-3 font-thai leading-[1.6]">{desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-paper-2 border-t border-b border-line">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[900px] mx-auto items-center">
              <div>
                <EyebrowLabel className="mb-3">— BENEFITS</EyebrowLabel>
                <h2 className="font-display text-[30px] text-ink mb-5 tracking-[-0.015em]">
                  สิทธิประโยชน์พันธมิตร
                </h2>
                <ul className="flex flex-col gap-3">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-[15px] text-ink-2 font-thai">
                      <CheckCircle size={18} className="text-viridian shrink-0 mt-0.5" />{b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-ink rounded-r4 p-8 text-center">
                <TrendingUp size={32} className="text-viridian-3 mx-auto mb-4" />
                <p className="font-mono text-[11px] text-[#8A938E] uppercase tracking-[0.15em] mb-2">รายได้เฉลี่ยพันธมิตร</p>
                <p className="font-display text-[48px] text-white leading-none mb-1">฿12,000</p>
                <p className="text-[13px] text-[#C9CDC8] font-thai">ต่อเดือน (Top affiliates)</p>
                <div className="h-[1px] bg-[#2A332E] my-6" />
                <p className="text-[13px] text-[#8A938E] font-thai leading-[1.7]">
                  พันธมิตรที่แอคทีฟแนะนำเฉลี่ย 40 การสมัคร/เดือน
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="py-14 text-center">
          <Container>
            <h2 className="font-display text-[28px] text-ink mb-3">พร้อมเริ่มหารายได้แล้วหรือยัง?</h2>
            <p className="text-[14px] text-ink-3 font-thai mb-6">สมัครฟรีวันนี้ เริ่มแชร์ได้ทันที</p>
            <a href="mailto:affiliate@verda.co.th?subject=สมัครเป็นพันธมิตร VERDA" className="inline-flex items-center gap-2 px-6 py-3 bg-viridian text-white rounded-pill text-[15px] hover:bg-viridian/90 transition-colors">
              <Mail size={16} /> affiliate@verda.co.th
            </a>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
