"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import { Button } from "@/components/primitives/Button";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { finalizeAttempt, startAttempt } from "@/actions/quiz";

type QuizQuestion = {
  id: string;
  text: string;
  type: "SINGLE" | "MULTIPLE";
  options: { id: string; text: string }[];
  correct: string[];
};

type QuizData = {
  id: string;
  title: string;
  timeLimitSec: number;
  passingScore: number;
  maxAttempts?: number;
  questions: QuizQuestion[];
};

type AttemptRecord = {
  id: string;
  score: number | null;
  passed: boolean | null;
  createdAt: string;
};

type ResultState = { score: number; passed: boolean; answers: Record<string, string[]> } | null;

export function QuizRunner({
  quiz,
  locale,
  slug,
  attemptHistory = [],
  nextLessonId = null,
}: {
  quiz: QuizData;
  locale: string;
  slug: string;
  attemptHistory?: AttemptRecord[];
  nextLessonId?: string | null;
}) {
  const router = useRouter();
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<ResultState>(null);
  const [expired, setExpired] = useState(false);
  const [started, setStarted] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const maxAttempts = quiz.maxAttempts ?? 3;
  const attemptsUsed = attemptHistory.length;
  const attemptsLeft = Math.max(0, maxAttempts - attemptsUsed);

  const question = quiz.questions[currentIndex];

  useEffect(() => {
    if (!started || result) return;
    const handleVisibility = () => {
      if (document.hidden) setTabSwitchCount((c) => c + 1);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [started, result]);

  const handleStart = useCallback(async () => {
    setStartError(null);
    setIsPending(true);
    const res = await startAttempt(quiz.id);
    setIsPending(false);
    if ("error" in res) {
      if (res.error === "max_attempts") {
        setStartError(`คุณใช้ครบ ${maxAttempts} ครั้งแล้ว ไม่สามารถทำซ้ำได้`);
        return;
      }
      // db_unavailable — proceed without attemptId (client-side scoring fallback)
    } else {
      setAttemptId(res.attemptId);
    }
    setStarted(true);
  }, [quiz.id, maxAttempts]);

  const handleSelect = useCallback(
    (optionId: string) => {
      setAnswers((prev) => {
        const current = prev[question.id] ?? [];
        if (question.type === "SINGLE") return { ...prev, [question.id]: [optionId] };
        const exists = current.includes(optionId);
        return {
          ...prev,
          [question.id]: exists ? current.filter((id) => id !== optionId) : [...current, optionId],
        };
      });
    },
    [question]
  );

  const handleSubmit = useCallback(async () => {
    if (attemptId) {
      const res = await finalizeAttempt(attemptId, answers);
      if ("score" in res) {
        setResult({ score: res.score, passed: res.passed, answers });
        return;
      }
    }
    // Client-side fallback scoring
    let correct = 0;
    quiz.questions.forEach((q) => {
      const given = answers[q.id] ?? [];
      const isCorrect = given.length === q.correct.length && q.correct.every((c) => given.includes(c));
      if (isCorrect) correct++;
    });
    const score = Math.round((correct / quiz.questions.length) * 100);
    setResult({ score, passed: score >= quiz.passingScore, answers });
  }, [attemptId, answers, quiz]);

  const handleExpire = useCallback(() => {
    setExpired(true);
    handleSubmit();
  }, [handleSubmit]);

  const handleRetry = useCallback(() => {
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setExpired(false);
    setStarted(false);
    setAttemptId(null);
    setStartError(null);
    setTabSwitchCount(0);
  }, []);

  if (result) {
    return (
      <ResultScreen
        result={result}
        quiz={quiz}
        attemptsLeft={Math.max(0, attemptsLeft - 1)}
        maxAttempts={maxAttempts}
        nextLessonId={nextLessonId}
        onRetry={handleRetry}
        onBack={() => router.push(`/${locale}/learn/${slug}`)}
        onContinue={() =>
          nextLessonId
            ? router.push(`/${locale}/learn/${slug}/${nextLessonId}`)
            : router.push(`/${locale}/learn/${slug}/review`)
        }
      />
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="w-full max-w-[520px]">
          <div className="text-center mb-8">
            <h1 className="font-display text-[32px] text-ink mb-3">{quiz.title}</h1>
            <p className="text-[14px] text-ink-3 mb-1">{quiz.questions.length} ข้อ</p>
            {quiz.timeLimitSec > 0 && (
              <p className="text-[14px] text-ink-3 mb-2">
                เวลา {Math.floor(quiz.timeLimitSec / 60)} นาที · เกณฑ์ผ่าน {quiz.passingScore}%
              </p>
            )}
            <p className="text-[13px] text-ink-4 mb-6">
              เหลืออีก <span className="font-semibold text-ink">{attemptsLeft}</span> ครั้ง จาก {maxAttempts} ครั้ง
            </p>

            {startError && (
              <div className="bg-danger/10 border border-danger/30 text-danger text-[13px] rounded-r2 px-4 py-3 mb-4">
                {startError}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleStart}
              disabled={isPending || attemptsLeft === 0}
            >
              {isPending ? "กำลังเริ่ม..." : "เริ่มทำข้อสอบ"}
            </Button>
          </div>

          {attemptHistory.length > 0 && (
            <div className="border border-line rounded-r3 overflow-hidden">
              <div className="bg-paper-2 px-4 py-3 border-b border-line">
                <p className="text-[12px] font-mono uppercase tracking-wider text-ink-3">ประวัติการทำข้อสอบ</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line text-[11px] text-ink-4 font-mono uppercase">
                    <th className="px-4 py-2 text-left">ครั้งที่</th>
                    <th className="px-4 py-2 text-left">วันที่</th>
                    <th className="px-4 py-2 text-right">คะแนน</th>
                    <th className="px-4 py-2 text-right">ผล</th>
                  </tr>
                </thead>
                <tbody>
                  {attemptHistory.map((a, i) => (
                    <tr key={a.id} className="border-b border-line last:border-0 text-[13px]">
                      <td className="px-4 py-3 text-ink-3">#{i + 1}</td>
                      <td className="px-4 py-3 text-ink-3">
                        {new Date(a.createdAt).toLocaleDateString("th-TH")}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink">
                        {a.score !== null ? `${a.score}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.passed === null ? (
                          <span className="text-ink-4">—</span>
                        ) : a.passed ? (
                          <span className="text-ok font-medium">ผ่าน</span>
                        ) : (
                          <span className="text-danger font-medium">ไม่ผ่าน</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="bg-paper-3 border-b border-line px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-3">QUIZ</p>
          <h1 className="font-semibold text-[16px] text-ink">{quiz.title}</h1>
        </div>
        {quiz.timeLimitSec > 0 && !expired && (
          <QuizTimer totalSeconds={quiz.timeLimitSec} onExpire={handleExpire} />
        )}
      </header>

      {tabSwitchCount > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-700 text-[12px] px-6 py-2 text-center font-mono">
          ⚠️ ระบบตรวจพบว่าคุณออกจากหน้าข้อสอบ {tabSwitchCount} ครั้ง
        </div>
      )}

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[640px]">
          <QuestionCard
            index={currentIndex}
            total={quiz.questions.length}
            text={question.text}
            options={question.options}
            selected={answers[question.id] ?? []}
            onSelect={handleSelect}
            isMultiple={question.type === "MULTIPLE"}
          />

          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
            >
              ← ก่อนหน้า
            </Button>
            {currentIndex < quiz.questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentIndex((i) => i + 1)}
                disabled={!answers[question.id]?.length}
              >
                ถัดไป →
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!answers[question.id]?.length}
              >
                ส่งคำตอบ
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ResultScreen({
  result,
  quiz,
  attemptsLeft,
  maxAttempts,
  nextLessonId = null,
  onRetry,
  onBack,
  onContinue,
}: {
  result: NonNullable<ResultState>;
  quiz: QuizData;
  attemptsLeft: number;
  maxAttempts: number;
  nextLessonId?: string | null;
  onRetry: () => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-[560px]">
        <div className="text-center mb-8">
          {result.passed ? (
            <CheckCircle size={56} className="text-ok mx-auto mb-5" />
          ) : (
            <XCircle size={56} className="text-danger mx-auto mb-5" />
          )}
          <h1 className="font-display text-[36px] text-ink mb-2">
            {result.passed ? "ผ่านแล้ว!" : "ยังไม่ผ่าน"}
          </h1>
          <div className="font-display text-[64px] text-viridian leading-none mb-1">{result.score}%</div>
          <p className="text-[14px] text-ink-3 mb-2">
            เกณฑ์ผ่าน {quiz.passingScore}% · {result.passed ? "ยินดีด้วย!" : "ลองใหม่อีกครั้งนะ"}
          </p>
          {!result.passed && (
            <p className="text-[13px] text-ink-4 mb-6">
              เหลืออีก <span className="font-semibold text-ink">{attemptsLeft}</span> ครั้ง จาก {maxAttempts} ครั้ง
            </p>
          )}

          {result.passed ? (
            <div className="flex flex-col items-center gap-3 mb-6">
              <Button variant="primary" size="lg" onClick={onContinue}>
                {nextLessonId ? "เรียนต่อ บทเรียนถัดไป →" : "ประเมินคอร์สและรับใบประกาศ →"}
              </Button>
              {!nextLessonId && (
                <p className="text-[12px] text-ink-4">กรุณาประเมินคอร์สก่อนรับใบประกาศ</p>
              )}
            </div>
          ) : (
            <div className="flex gap-3 justify-center mb-6">
              {attemptsLeft > 0 ? (
                <Button variant="primary" onClick={onRetry}>ลองใหม่อีกครั้ง</Button>
              ) : (
                <Button variant="ghost" onClick={onBack}>กลับไปทบทวน</Button>
              )}
              {attemptsLeft > 0 && (
                <Button variant="ghost" onClick={onBack}>กลับไปทบทวน</Button>
              )}
            </div>
          )}

          {!result.passed && attemptsLeft === 0 && (
            <p className="text-[13px] text-danger mb-6">ใช้ครบ {maxAttempts} ครั้งแล้ว กรุณาทบทวนเนื้อหาก่อน</p>
          )}

          <button
            onClick={() => setShowReview((v) => !v)}
            className="flex items-center gap-1.5 text-[13px] text-viridian hover:underline mx-auto"
          >
            {showReview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showReview ? "ซ่อนเฉลย" : "ดูเฉลยทุกข้อ"}
          </button>
        </div>

        {showReview && (
          <div className="flex flex-col gap-4">
            {quiz.questions.map((q, i) => {
              const given = result.answers[q.id] ?? [];
              const isCorrect =
                given.length === q.correct.length && q.correct.every((c) => given.includes(c));
              return (
                <div
                  key={q.id}
                  className={`border rounded-r3 overflow-hidden ${isCorrect ? "border-ok/40" : "border-danger/40"}`}
                >
                  <div
                    className={`px-4 py-3 text-[13px] font-medium flex items-center gap-2 ${
                      isCorrect ? "bg-ok/10 text-ok" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    ข้อ {i + 1}: {isCorrect ? "ถูก" : "ผิด"}
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-[14px] text-ink font-medium mb-3">{q.text}</p>
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt) => {
                        const isSelected = given.includes(opt.id);
                        const isCorrectOpt = q.correct.includes(opt.id);
                        let optClass = "border-line text-ink-3";
                        if (isCorrectOpt) optClass = "border-ok bg-ok/10 text-ok font-medium";
                        else if (isSelected && !isCorrectOpt) optClass = "border-danger bg-danger/10 text-danger";
                        return (
                          <div
                            key={opt.id}
                            className={`px-3 py-2 rounded-r2 border text-[13px] ${optClass}`}
                          >
                            {opt.text}
                            {isCorrectOpt && (
                              <span className="ml-2 text-[11px] font-mono">✓ เฉลย</span>
                            )}
                            {isSelected && !isCorrectOpt && (
                              <span className="ml-2 text-[11px] font-mono">✗ คำตอบของคุณ</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
