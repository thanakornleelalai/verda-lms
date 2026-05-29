"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { submitReview, skipReviewAndGetCert } from "@/actions/review";

function StarPicker({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div>
      <p className="text-[13px] font-medium text-ink mb-2">{label}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none focus:ring-2 focus:ring-viridian focus:ring-offset-1 rounded"
            aria-label={`${star} ดาว`}
          >
            <Star
              size={32}
              className={`transition-colors ${
                star <= active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-paper-3 text-line"
              }`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-[13px] text-ink-3 self-center">
            {["", "แย่มาก", "พอใช้", "ดี", "ดีมาก", "ยอดเยี่ยม"][value]}
          </span>
        )}
      </div>
    </div>
  );
}

export function CourseReviewForm({
  courseSlug,
  courseTitle,
  instructorName,
  locale,
}: {
  courseSlug: string;
  courseTitle: string;
  instructorName: string;
  locale: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSkipping, startSkipTransition] = useTransition();
  const [courseRating, setCourseRating] = useState(0);
  const [instructorRating, setInstructorRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  function navigateToCert(certId: string | null) {
    if (certId) {
      router.push(`/${locale}/certificate/${certId}`);
    } else {
      router.push(`/${locale}/dashboard/certificates`);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (courseRating === 0 || instructorRating === 0) {
      setError("กรุณาให้คะแนนทั้งคอร์สและผู้สอนก่อนส่ง");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await submitReview({
        courseSlug,
        locale,
        courseRating,
        instructorRating,
        comment,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      navigateToCert(result.certId);
    });
  }

  function handleSkip() {
    startSkipTransition(async () => {
      const result = await skipReviewAndGetCert(courseSlug, locale);
      if ("success" in result) {
        navigateToCert(result.certId);
      } else {
        router.push(`/${locale}/dashboard/certificates`);
      }
    });
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center py-12 px-6">
      <div className="w-full max-w-[560px]">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ok/10 mb-5">
            <Trophy size={32} className="text-ok" />
          </div>
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-ink-3 mb-2">
            ยินดีด้วย — คุณผ่านแบบทดสอบแล้ว!
          </p>
          <h1 className="font-display text-[28px] text-ink leading-snug mb-2">
            ประเมินคอร์สและผู้สอน
          </h1>
          <p className="text-[14px] text-ink-3">
            ความคิดเห็นของคุณช่วยพัฒนา{" "}
            <span className="text-ink font-medium">{courseTitle}</span>{" "}
            ให้ดีขึ้น
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Course rating */}
          <div className="bg-paper-3 border border-line rounded-r3 p-5">
            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-4 mb-4">
              คุณภาพของคอร์สเรียน
            </p>
            <StarPicker
              value={courseRating}
              onChange={setCourseRating}
              label={courseTitle}
            />
          </div>

          {/* Instructor rating */}
          <div className="bg-paper-3 border border-line rounded-r3 p-5">
            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-4 mb-4">
              คุณภาพของผู้สอน
            </p>
            <StarPicker
              value={instructorRating}
              onChange={setInstructorRating}
              label={instructorName}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-[13px] font-medium text-ink mb-2">
              ความคิดเห็นเพิ่มเติม{" "}
              <span className="font-normal text-ink-4">(ไม่บังคับ)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="บอกเราว่าคุณชอบอะไรในคอร์สนี้ หรือมีสิ่งที่อยากให้ปรับปรุงไหม?"
              className="w-full bg-paper border border-line rounded-r2 px-4 py-3 text-[14px] text-ink placeholder:text-ink-4 resize-none outline-none focus:ring-2 focus:ring-viridian focus:border-transparent transition"
            />
            <p className="text-[11px] text-ink-4 mt-1 text-right">{comment.length}/500</p>
          </div>

          {/* Validation error */}
          {error && (
            <div className="px-4 py-3 bg-danger/10 border border-danger/30 rounded-r2 text-[13px] text-danger">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isPending || isSkipping}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  กำลังส่ง...
                </span>
              ) : (
                "ส่งการประเมินและรับใบประกาศ →"
              )}
            </Button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={isPending || isSkipping}
              className="text-[13px] text-ink-3 hover:text-ink transition-colors py-1"
            >
              {isSkipping ? "กำลังโหลด..." : "ข้ามไปรับใบประกาศ"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
