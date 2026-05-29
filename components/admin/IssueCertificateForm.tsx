"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Award } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { cn } from "@/lib/utils";

const COURSE_OPTIONS = [
  { title: "UX Design & Figma Masterclass", instructor: "คุณพิมพ์ชนก วัฒนากร" },
  { title: "Next.js 15 Fullstack Bootcamp", instructor: "คุณธนพล สิทธิกุล" },
  { title: "Python Data Science Bootcamp", instructor: "คุณนันทวัน ชัยวิชิต" },
  { title: "Meta Ads Masterclass 2026", instructor: "คุณภูริช อินทรศักดิ์" },
  { title: "English for Tech Professionals", instructor: "คุณพิมพ์ชนก วัฒนากร" },
  { title: "Financial Planning for Freelancers", instructor: "คุณธนพล สิทธิกุล" },
  { title: "Machine Learning Specialization", instructor: "Andrew Ng" },
];

export function IssueCertificateForm() {
  const locale = useLocale();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [name, setName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [customCourse, setCustomCourse] = useState("");
  const [instructor, setInstructor] = useState("");
  const [date, setDate] = useState(today);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCustom = selectedCourse === "__custom__";
  const finalCourse = isCustom ? customCourse : selectedCourse;

  function handleCourseChange(val: string) {
    setSelectedCourse(val);
    if (val !== "__custom__") {
      const opt = COURSE_OPTIONS.find((o) => o.title === val);
      if (opt) setInstructor(opt.instructor);
    } else {
      setInstructor("");
    }
    setErrors((e) => ({ ...e, course: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2)
      e.name = "กรุณากรอกชื่อผู้เรียน (อย่างน้อย 2 ตัวอักษร)";
    if (!finalCourse.trim()) e.course = "กรุณาเลือกหรือกรอกชื่อคอร์ส";
    if (!instructor.trim()) e.instructor = "กรุณากรอกชื่อผู้สอน";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const params = new URLSearchParams({
      name: name.trim(),
      course: finalCourse.trim(),
      instructor: instructor.trim(),
      date,
    });
    router.push(`/${locale}/certificate/preview?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Learner Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink-2">
            ชื่อผู้เรียน <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="เช่น วีรวัฒน์ ใจดี"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            className={cn(
              "input-base",
              errors.name && "border-danger focus:ring-danger/20"
            )}
          />
          {errors.name && (
            <p className="text-[12px] text-danger">{errors.name}</p>
          )}
        </div>

        {/* Issue Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink-2">
            วันที่ออกใบประกาศ
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-base"
          />
        </div>

        {/* Course Selection */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[13px] font-medium text-ink-2">
            คอร์ส <span className="text-danger">*</span>
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            className={cn(
              "input-base",
              errors.course && "border-danger focus:ring-danger/20"
            )}
          >
            <option value="">— เลือกคอร์ส —</option>
            {COURSE_OPTIONS.map((opt) => (
              <option key={opt.title} value={opt.title}>
                {opt.title}
              </option>
            ))}
            <option value="__custom__">กรอกชื่อคอร์สเอง...</option>
          </select>
          {isCustom && (
            <input
              type="text"
              placeholder="ชื่อคอร์ส"
              value={customCourse}
              onChange={(e) => {
                setCustomCourse(e.target.value);
                setErrors((prev) => ({ ...prev, course: "" }));
              }}
              className={cn(
                "input-base mt-2",
                errors.course && "border-danger focus:ring-danger/20"
              )}
            />
          )}
          {errors.course && (
            <p className="text-[12px] text-danger">{errors.course}</p>
          )}
        </div>

        {/* Instructor Name */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[13px] font-medium text-ink-2">
            ชื่อผู้สอน <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="เช่น คุณพิมพ์ชนก วัฒนากร"
            value={instructor}
            onChange={(e) => {
              setInstructor(e.target.value);
              setErrors((prev) => ({ ...prev, instructor: "" }));
            }}
            className={cn(
              "input-base",
              errors.instructor && "border-danger focus:ring-danger/20"
            )}
          />
          {errors.instructor && (
            <p className="text-[12px] text-danger">{errors.instructor}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 flex-wrap">
        <Button
          type="submit"
          variant="primary"
          size="default"
          className="flex items-center gap-2"
        >
          <Award size={16} />
          ดูตัวอย่างใบประกาศ
        </Button>
        <p className="text-[12px] text-ink-4">
          ระบบจะแสดงตัวอย่างใบประกาศ สามารถพิมพ์หรือบันทึก PDF ได้ทันที
        </p>
      </div>
    </form>
  );
}
