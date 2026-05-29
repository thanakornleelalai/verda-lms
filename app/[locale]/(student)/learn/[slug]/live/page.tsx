"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Video, Users, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { MOCK_COURSES } from "@/mock";

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const total = Math.max(0, Math.floor(diff / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    started: diff <= 0,
  };
}

// Mock: session starts 2 days from now
const SESSION_TARGET = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

export default function LiveSessionPage() {
  const params = useParams();
  const locale = useLocale();
  const slug = params.slug as string;
  const course = MOCK_COURSES.find((c) => c.slug === slug) ?? MOCK_COURSES[0];
  const { days, hours, minutes, seconds, started } = useCountdown(SESSION_TARGET);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "Weerawat", text: "สวัสดีครับ รอเริ่มอยู่นะครับ 🙌" },
    { id: 2, user: "Noon", text: "ตื่นเต้นมากเลยค่ะ!" },
  ]);
  const [input, setInput] = useState("");

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Header */}
      <header className="bg-[#1c2421] border-b border-[#2A332E] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${locale}`} className="font-display text-white text-[20px] tracking-[-0.02em]">
            VERDA
          </Link>
          <span className="text-[#3A4842]">·</span>
          <p className="text-[#8A938E] text-[13px] truncate max-w-[300px]">{course.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#8A938E] text-[13px]">
            <Users size={14} />
            <span>24 คน</span>
          </div>
          {started && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-danger/20 text-danger text-[12px] rounded-pill font-mono">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              LIVE
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {!started ? (
            <div className="text-center">
              <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#6E756F] mb-4">
                SESSION เริ่มใน
              </p>
              <div className="flex items-end gap-4 mb-8">
                {[
                  { value: days, label: "วัน" },
                  { value: hours, label: "ชม." },
                  { value: minutes, label: "นาที" },
                  { value: seconds, label: "วินาที" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="font-display text-[56px] text-white leading-none w-20">
                      {String(value).padStart(2, "0")}
                    </div>
                    <p className="font-mono text-[10px] text-[#6E756F] uppercase tracking-widest mt-1">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[14px] text-[#8A938E] mb-6">
                {SESSION_TARGET.toLocaleDateString("th-TH", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="ghost" className="border-[#3A4842] text-[#8A938E] hover:text-white flex items-center gap-2">
                  <Clock size={15} />
                  เพิ่มใน Calendar
                </Button>
                <Button variant="primary" className="flex items-center gap-2">
                  <Video size={15} />
                  ทดสอบกล้อง/ไมค์
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[800px] aspect-video bg-black rounded-r3 flex items-center justify-center">
              {/* Zoom SDK would embed here */}
              <p className="text-white/30 text-[14px]">Zoom SDK embed — wired in production</p>
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        <aside className="w-[280px] bg-[#1c2421] border-l border-[#2A332E] flex flex-col">
          <div className="px-4 py-3 border-b border-[#2A332E]">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#6E756F] flex items-center gap-1.5">
              <MessageSquare size={12} />
              LIVE CHAT
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-[13px]">
                <span className="font-semibold text-[#A8D4C4]">{msg.user}: </span>
                <span className="text-[#C9CDC8]">{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#2A332E] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim()) {
                  setChatMessages((m) => [...m, { id: m.length + 1, user: "คุณ", text: input.trim() }]);
                  setInput("");
                }
              }}
              placeholder="พิมพ์ข้อความ..."
              className="flex-1 bg-[#232a26] border border-[#3A4842] rounded-r2 px-3 py-1.5 text-[13px] text-white placeholder:text-[#6E756F] focus:outline-none focus:border-viridian-3"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
