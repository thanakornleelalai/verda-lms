"use client";

import { useState } from "react";
import { Button } from "@/components/primitives/Button";
import { EyebrowLabel } from "@/components/primitives/EyebrowLabel";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-paper-3 border border-line rounded-r3 p-6">
      <h2 className="font-semibold text-[15px] text-ink mb-4 pb-3 border-b border-line">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <label className="flex items-center justify-between cursor-pointer py-2 border-b border-line last:border-0">
      <span className="text-[14px] text-ink">{label}</span>
      <button
        onClick={() => setChecked((v) => !v)}
        className={`w-10 h-5 rounded-full transition-colors relative ${checked ? "bg-viridian" : "bg-line"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="p-8 max-w-[760px]">
      <div className="mb-8">
        <EyebrowLabel className="mb-1">ADMIN / SETTINGS</EyebrowLabel>
        <h1 className="font-display text-[32px] text-ink tracking-[-0.015em]">ตั้งค่าแพลตฟอร์ม</h1>
        <p className="text-[14px] text-ink-3 mt-1">การตั้งค่าส่วนกลางของระบบ VERDA LMS</p>
      </div>

      {saved && (
        <div className="mb-5 px-4 py-3 bg-ok/10 border border-ok/30 rounded-r2 text-[13px] text-ok">
          บันทึกการตั้งค่าเรียบร้อย ✓
        </div>
      )}

      <div className="flex flex-col gap-6">
        <Section title="ข้อมูลแพลตฟอร์ม">
          <Field label="ชื่อแพลตฟอร์ม">
            <input type="text" className="input-base" defaultValue="VERDA LMS" />
          </Field>
          <Field label="URL หลัก">
            <input type="text" className="input-base" defaultValue="https://verda.dev" />
          </Field>
          <Field label="อีเมลผู้ดูแล" hint="รับการแจ้งเตือนระบบ">
            <input type="email" className="input-base" defaultValue="admin@verda.dev" />
          </Field>
        </Section>

        <Section title="การลงทะเบียน">
          <Toggle label="อนุญาตให้สมัครสมาชิกใหม่" defaultChecked />
          <Toggle label="ยืนยัน email ก่อนใช้งาน" defaultChecked />
          <Toggle label="อนุญาต OAuth (Google, LINE)" defaultChecked />
          <Toggle label="อนุญาตให้สมัครเป็นผู้สอน" />
        </Section>

        <Section title="คอร์สและเนื้อหา">
          <Toggle label="ต้องรอ Admin อนุมัติก่อนเผยแพร่คอร์ส" />
          <Toggle label="อนุญาตคอร์สฟรี" defaultChecked />
          <Toggle label="แสดงคะแนนรีวิวสาธารณะ" defaultChecked />
          <Field label="จำนวนวันที่ไม่มีกิจกรรมก่อนพัก (วัน)" hint="0 = ไม่มีกำหนด">
            <input type="number" className="input-base max-w-[120px]" defaultValue={0} min={0} />
          </Field>
        </Section>

        <Section title="การชำระเงิน">
          <Toggle label="เปิดใช้งาน Stripe" defaultChecked />
          <Toggle label="เปิดใช้งาน Omise (PromptPay)" />
          <Field label="สัดส่วนรายได้ผู้สอน (%)" hint="ค่าเริ่มต้น 70%">
            <input type="number" className="input-base max-w-[120px]" defaultValue={70} min={0} max={100} />
          </Field>
        </Section>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={() => setSaved(false)}>รีเซ็ต</Button>
          <Button variant="primary" onClick={() => setSaved(true)}>บันทึกการตั้งค่า</Button>
        </div>
      </div>
    </div>
  );
}
