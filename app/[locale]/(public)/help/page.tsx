import { Search, BookOpen, CreditCard, Award, User, MessageCircle, Mail } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/layout/Container";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";

export const metadata = {
  title: "ศูนย์ช่วยเหลือ | VERDA",
  description: "คำถามที่พบบ่อยและวิธีใช้งาน VERDA LMS",
};

const CATEGORIES = [
  { icon: BookOpen, title: "การเรียน", desc: "เริ่มเรียน ดูวิดีโอ ทำแบบทดสอบ" },
  { icon: CreditCard, title: "การชำระเงิน", desc: "วิธีจ่าย คืนเงิน ใบเสร็จ" },
  { icon: Award, title: "ใบประกาศ", desc: "รับ ดาวน์โหลด ตรวจสอบใบประกาศ" },
  { icon: User, title: "บัญชีผู้ใช้", desc: "สมัคร ตั้งค่า รีเซ็ตรหัสผ่าน" },
];

const FAQ = [
  { q: "เริ่มเรียนคอร์สแรกได้อย่างไร?", a: "หลังจากสมัครสมาชิกและเลือกแผน เข้าไปที่หน้า คอร์สทั้งหมด เลือกคอร์สที่สนใจ แล้วกดเริ่มเรียนได้ทันที บทเรียนแรกของหลายคอร์สเปิดให้เรียนฟรี" },
  { q: "ดาวน์โหลดคอร์สมาเรียน offline ได้ไหม?", a: "ได้ครับ สมาชิกทุกแผนสามารถดาวน์โหลดเนื้อหาผ่านแอปมือถือ (iOS/Android) เพื่อเรียนแบบไม่ต้องใช้อินเทอร์เน็ต" },
  { q: "เรียนจบแล้วได้ใบประกาศเมื่อไหร่?", a: "เมื่อเรียนครบทุกบทเรียนและผ่านแบบทดสอบ ระบบจะออกใบประกาศนียบัตรดิจิทัลให้อัตโนมัติ ดาวน์โหลดเป็น PDF และแชร์ลง LinkedIn ได้" },
  { q: "ขอคืนเงินได้ภายในกี่วัน?", a: "สมาชิกรายเดือนยกเลิกได้ทุกเมื่อ (มีผลรอบบิลถัดไป) สมาชิกรายปีขอคืนเงินได้ภายใน 7 วันแรก" },
  { q: "ลืมรหัสผ่านทำอย่างไร?", a: "ไปที่หน้าเข้าสู่ระบบ กด 'ลืมรหัสผ่าน' กรอกอีเมล แล้วเช็คลิงก์รีเซ็ตในกล่องอีเมลของคุณ" },
  { q: "เรียน On-site ที่ไหนได้บ้าง?", a: "VERDA จัดเรียน On-site ที่ PIM สถาบันปัญญาภิวัฒน์ ถนนแจ้งวัฒนะ มี Workshop และ Bootcamp ทุกไตรมาส" },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-paper">
      <TopBar />
      <main>
        {/* Hero */}
        <section className="py-16 text-center border-b border-line bg-paper-2">
          <Container>
            <EyebrowLabel className="mb-3">— HELP CENTER</EyebrowLabel>
            <h1 className="font-display text-[44px] text-ink tracking-[-0.02em] leading-[1.1] mb-5">
              เราช่วยอะไรคุณได้บ้าง?
            </h1>
            <div className="max-w-[480px] mx-auto relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                type="search"
                placeholder="ค้นหาคำถาม เช่น 'คืนเงิน', 'ใบประกาศ'..."
                className="w-full bg-paper border border-line rounded-pill pl-12 pr-4 h-[48px] text-[14px] font-thai focus:outline-none focus:border-viridian transition-colors"
              />
            </div>
          </Container>
        </section>

        {/* Categories */}
        <section className="py-14">
          <Container>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-[880px] mx-auto">
              {CATEGORIES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-paper-3 border border-line rounded-r3 p-5 text-center hover:border-viridian/40 transition-colors">
                  <div className="w-11 h-11 rounded-r2 bg-viridian/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={20} className="text-viridian" />
                  </div>
                  <h3 className="font-semibold text-[14px] text-ink mb-1">{title}</h3>
                  <p className="text-[12px] text-ink-3 font-thai">{desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="pb-16">
          <Container className="max-w-[680px]">
            <h2 className="font-display text-[28px] text-ink text-center mb-8 tracking-[-0.015em]">
              คำถามที่พบบ่อย
            </h2>
            <div className="flex flex-col gap-3">
              {FAQ.map((item) => (
                <details key={item.q} className="group bg-paper-3 border border-line rounded-r3 p-5 [&_summary]:cursor-pointer">
                  <summary className="font-semibold text-[15px] text-ink list-none flex items-center justify-between">
                    {item.q}
                    <span className="text-ink-3 group-open:rotate-45 transition-transform text-[20px] leading-none">+</span>
                  </summary>
                  <p className="text-[14px] text-ink-3 leading-[1.8] font-thai mt-3">{item.a}</p>
                </details>
              ))}
            </div>
          </Container>
        </section>

        {/* Contact */}
        <section className="py-12 bg-paper-2 border-t border-line">
          <Container className="text-center">
            <h2 className="font-display text-[24px] text-ink mb-2">ยังไม่พบคำตอบ?</h2>
            <p className="text-[14px] text-ink-3 font-thai mb-6">ทีมงานพร้อมช่วยเหลือคุณ</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a href="mailto:hello@verda.co.th" className="inline-flex items-center gap-2 px-5 py-2.5 bg-viridian text-white rounded-pill text-[14px] hover:bg-viridian/90 transition-colors">
                <Mail size={15} /> hello@verda.co.th
              </a>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 border border-line rounded-pill text-[14px] text-ink-2">
                <MessageCircle size={15} /> Live Chat (มุมขวาล่าง)
              </span>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </div>
  );
}
