"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { createCourse } from "@/actions/studio";

type Step = "basics" | "content" | "pricing" | "publish";

const STEPS: { id: Step; label: string }[] = [
  { id: "basics", label: "ข้อมูลคอร์ส" },
  { id: "content", label: "เนื้อหา" },
  { id: "pricing", label: "ราคา" },
  { id: "publish", label: "เผยแพร่" },
];

type FormState = {
  title: string;
  description: string;
  level: string;
  language: string;
  price: number;
};

export default function NewCoursePage() {
  const [step, setStep] = useState<Step>("basics");
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    level: "BEGINNER",
    language: "th",
    price: 0,
  });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  function updateForm(updates: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...updates }));
  }

  function handlePublish() {
    setError("");
    startTransition(async () => {
      const result = await createCourse({
        title: form.title,
        description: form.description,
        level: form.level,
        language: form.language,
        price: form.price,
      });
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/${locale}/studio/courses`);
      }
    });
  }

  return (
    <div className="p-8 max-w-[800px]">
      <div className="mb-8">
        <EyebrowLabel className="mb-1">STUDIO / COURSES / NEW</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">สร้างคอร์สใหม่</h1>
      </div>

      {/* Step tabs */}
      <div className="flex gap-0 mb-8 border border-line rounded-r3 overflow-hidden">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={`flex-1 py-3 text-[13px] font-medium border-r border-line last:border-0 transition-colors ${
              s.id === step
                ? "bg-viridian text-white"
                : i < stepIndex
                ? "bg-ok/10 text-ok"
                : "text-ink-3 hover:text-ink hover:bg-paper-2"
            }`}
          >
            <span className="font-mono text-[10px] block mb-0.5 opacity-60">0{i + 1}</span>
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-danger/10 border border-danger/30 rounded-r2 text-[13px] text-danger">
          {error}
        </div>
      )}

      {/* Step content */}
      {step === "basics" && (
        <BasicsStep form={form} onChange={updateForm} onNext={() => setStep("content")} />
      )}
      {step === "content" && (
        <ContentStep onBack={() => setStep("basics")} onNext={() => setStep("pricing")} />
      )}
      {step === "pricing" && (
        <PricingStep
          price={form.price}
          onChange={(price) => updateForm({ price })}
          onBack={() => setStep("content")}
          onNext={() => setStep("publish")}
        />
      )}
      {step === "publish" && (
        <PublishStep
          isPending={isPending}
          onBack={() => setStep("pricing")}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}

function BasicsStep({
  form,
  onChange,
  onNext,
}: {
  form: { title: string; description: string; level: string; language: string };
  onChange: (u: Partial<{ title: string; description: string; level: string; language: string }>) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="ชื่อคอร์ส *" hint="ระบุชื่อที่ชัดเจนและน่าสนใจ">
        <input
          type="text"
          className="input-base"
          placeholder="เช่น UX Design & Figma Masterclass"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </Field>
      <Field label="คำอธิบายสั้น *">
        <textarea
          rows={3}
          className="input-base resize-none"
          placeholder="บอกผู้เรียนว่าคอร์สนี้เหมาะกับใครและจะได้อะไร"
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="หมวดหมู่">
          <select className="input-base">
            <option>Design</option>
            <option>Development</option>
            <option>Marketing</option>
            <option>Business</option>
          </select>
        </Field>
        <Field label="ระดับ">
          <select
            className="input-base"
            value={form.level}
            onChange={(e) => onChange({ level: e.target.value })}
          >
            <option value="BEGINNER">ผู้เริ่มต้น</option>
            <option value="INTERMEDIATE">ระดับกลาง</option>
            <option value="ADVANCED">ระดับสูง</option>
          </select>
        </Field>
      </div>
      <Field label="ภาษาหลัก">
        <select
          className="input-base"
          value={form.language}
          onChange={(e) => onChange({ language: e.target.value })}
        >
          <option value="th">ภาษาไทย</option>
          <option value="en">English</option>
        </select>
      </Field>
      <div className="flex justify-end pt-4 border-t border-line">
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!form.title.trim() || !form.description.trim()}
        >
          ถัดไป: เนื้อหา →
        </Button>
      </div>
    </div>
  );
}

function ContentStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-[14px] text-ink-3">
        สร้างโครงสร้างเนื้อหาคอร์ส (Sections &amp; Lessons) โดยสามารถลากเปลี่ยนลำดับได้ หลังสร้างคอร์สแล้ว
      </p>
      <div className="border border-dashed border-line rounded-r3 p-8 text-center">
        <p className="text-ink-3 text-[14px] mb-1">เพิ่ม Section และ Lesson ได้หลังสร้างคอร์ส</p>
        <p className="text-ink-4 text-[12px]">ระบบจะพาไปหน้าแก้ไขเนื้อหาหลังกดเผยแพร่</p>
      </div>
      <div className="bg-viridian-wash border border-viridian-3/30 rounded-r3 p-4 text-[13px] text-ink-2">
        <strong>Drip Content:</strong> ตั้งค่าจำนวนวันหลังลงทะเบียนที่จะปลดล็อค Lesson ได้จากหน้าแก้ไข Lesson
      </div>
      <div className="flex justify-between pt-4 border-t border-line">
        <Button variant="ghost" onClick={onBack}>← ย้อนกลับ</Button>
        <Button variant="primary" onClick={onNext}>ถัดไป: ราคา →</Button>
      </div>
    </div>
  );
}

function PricingStep({
  price,
  onChange,
  onBack,
  onNext,
}: {
  price: number;
  onChange: (price: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="ราคา (THB)" hint="ใส่ 0 เพื่อให้เป็นคอร์สฟรี">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 text-[14px]">฿</span>
          <input
            type="number"
            className="input-base pl-7"
            placeholder="1990"
            min={0}
            value={price}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      </Field>
      <Field label="ราคาที่ขีดทิ้ง (ไม่บังคับ)">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 text-[14px]">฿</span>
          <input type="number" className="input-base pl-7" placeholder="2990" min={0} />
        </div>
      </Field>
      <label className="flex items-center gap-3 py-3 px-4 bg-paper-2 rounded-r2 cursor-pointer">
        <input type="checkbox" className="rounded border-line" />
        <span className="text-[14px] text-ink">รองรับ PromptPay (Omise)</span>
      </label>
      <label className="flex items-center gap-3 py-3 px-4 bg-paper-2 rounded-r2 cursor-pointer">
        <input type="checkbox" className="rounded border-line" defaultChecked />
        <span className="text-[14px] text-ink">รองรับบัตรเครดิต / Stripe</span>
      </label>
      <div className="flex justify-between pt-4 border-t border-line">
        <Button variant="ghost" onClick={onBack}>← ย้อนกลับ</Button>
        <Button variant="primary" onClick={onNext}>ถัดไป: เผยแพร่ →</Button>
      </div>
    </div>
  );
}

function PublishStep({
  isPending,
  onBack,
  onPublish,
}: {
  isPending: boolean;
  onBack: () => void;
  onPublish: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-ok/10 border border-ok/30 rounded-r3 p-5 text-[14px] text-ink">
        <p className="font-semibold mb-2">พร้อมสร้างคอร์ส ✓</p>
        <ul className="list-disc list-inside text-ink-2 flex flex-col gap-1">
          <li>ตั้งชื่อและคำอธิบายครบ</li>
          <li>ตั้งราคาเรียบร้อย</li>
          <li>คอร์สจะถูกสร้างในสถานะ DRAFT — เพิ่มบทเรียนแล้วค่อย Publish</li>
        </ul>
      </div>
      <Field label="ภาพหน้าปก (thumbnail)">
        <div className="border-2 border-dashed border-line rounded-r2 p-8 text-center cursor-pointer hover:border-viridian transition-colors">
          <p className="text-ink-3 text-[13px]">คลิกหรือลากไฟล์มาวาง (JPG/PNG, 1280×720)</p>
          <p className="text-ink-4 text-[11px] mt-1">เพิ่มได้ภายหลังในหน้าแก้ไข</p>
        </div>
      </Field>
      <Field label="ตัวอย่างคอร์ส (Preview video)">
        <div className="border-2 border-dashed border-line rounded-r2 p-8 text-center cursor-pointer hover:border-viridian transition-colors">
          <p className="text-ink-3 text-[13px]">อัปโหลดวิดีโอตัวอย่าง (MP4, สูงสุด 500MB)</p>
          <p className="text-ink-4 text-[11px] mt-1">เพิ่มได้ภายหลังในหน้าแก้ไข</p>
        </div>
      </Field>
      <div className="flex justify-between pt-4 border-t border-line">
        <Button variant="ghost" onClick={onBack} disabled={isPending}>← ย้อนกลับ</Button>
        <Button variant="primary" onClick={onPublish} disabled={isPending}>
          {isPending ? "กำลังสร้าง..." : "สร้างคอร์ส (Draft)"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-ink mb-1.5">
        {label}
        {hint && <span className="font-normal text-ink-3 ml-2">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}
