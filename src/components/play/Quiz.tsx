"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { quiz, type QuizResultKey } from "@/lib/content";
import LumaButton from "@/components/LumaButton";
import SuccessRipple from "@/components/SuccessRipple";
import ShareCardButton from "./ShareCardButton";

const order: QuizResultKey[] = ["fen", "lily", "dad", "ann"];
const ease = [0.16, 1, 0.3, 1] as const;

export default function Quiz() {
  const total = quiz.questions.length;
  // step: -1 = 封面, 0..total-1 = 題目, total = 結果
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<QuizResultKey[]>([]);
  const headRef = useRef<HTMLHeadingElement>(null);

  const focusHead = () => requestAnimationFrame(() => headRef.current?.focus({ preventScroll: true }));

  const choose = (k: QuizResultKey) => {
    const next = [...answers.slice(0, step), k];
    setAnswers(next);
    setStep(step + 1);
    focusHead();
  };

  const result = (() => {
    if (step < total) return null;
    const score: Record<string, number> = {};
    answers.forEach((k) => (score[k] = (score[k] ?? 0) + 1));
    // 同分時以最後一次選擇較接近者為準，確保結果穩定
    const key = [...order].sort((a, b) => (score[b] ?? 0) - (score[a] ?? 0) || answers.lastIndexOf(b) - answers.lastIndexOf(a))[0];
    return { key, ...quiz.results[key] };
  })();

  return (
    <div className="card relative overflow-hidden">
      {/* 進度 */}
      <div
        role="progressbar"
        aria-label="測驗進度"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.max(0, Math.min(step, total))}
        className="h-1 bg-white/10"
      >
        <m.div className="h-full bg-glow" animate={{ width: `${(Math.max(0, step) / total) * 100}%` }} transition={{ duration: 0.4, ease }} />
      </div>

      <div className="min-h-[480px] p-5 sm:min-h-[520px] sm:p-6 md:p-10">
        <AnimatePresence mode="wait">
          {step === -1 && (
            <m.div key="cover" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease }} className="grid min-h-[440px] place-items-center text-center">
              <div>
                <p className="eyebrow">展區「傍」・心理測驗</p>
                <h2 className="mt-4 font-serif text-[26px] font-bold sm:text-3xl md:text-4xl">{quiz.title}</h2>
                <p className="mx-auto mt-4 max-w-md text-mist/90">{quiz.intro}</p>
                <button type="button" onClick={() => (setStep(0), focusHead())} className="btn btn-primary mt-8 !px-8 !text-base">
                  開始測驗
                </button>
                <p className="mt-4 text-xs text-dim">共 {total} 題，約 1 分鐘</p>
              </div>
            </m.div>
          )}

          {step >= 0 && step < total && (
            <m.div key={step} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.35, ease }}>
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm text-glow">
                  Q{step + 1} <span className="text-dim">/ {total}</span>
                </p>
                <button
                  type="button"
                  onClick={() => (setStep(step - 1), focusHead())}
                  className="inline-flex min-h-11 items-center gap-1 text-sm text-dim hover:text-glow"
                >
                  <ArrowLeft aria-hidden size={15} />
                  {step === 0 ? "回封面" : "上一題"}
                </button>
              </div>
              <h2 ref={headRef} tabIndex={-1} className="mt-4 font-serif text-2xl font-bold outline-none md:text-[28px]">
                {quiz.questions[step].q}
              </h2>
              <ul className="mt-7 grid gap-3">
                {quiz.questions[step].options.map((o, i) => (
                  <m.li key={o.text} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.06, duration: 0.35, ease }}>
                    <button
                      type="button"
                      onClick={() => choose(o.k)}
                      className={`card card-hover flex w-full items-center gap-4 px-5 py-4 text-left hover:!scale-[1.01] ${answers[step] === o.k ? "!border-glow/70 bg-glow/10" : ""}`}
                    >
                      <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-glow/40 font-mono text-sm text-glow">
                        {"ABCD"[i]}
                      </span>
                      <span>{o.text}</span>
                    </button>
                  </m.li>
                ))}
              </ul>
            </m.div>
          )}

          {result && (
            <m.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease }} className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
              <SuccessRipple color={result.color} />
              <div>
                <p className="eyebrow" style={{ color: result.color }}>
                  你的結果
                </p>
                <h2 ref={headRef} tabIndex={-1} className="mt-2 font-serif text-4xl font-bold outline-none md:text-5xl">
                  {result.name}
                </h2>
                <p className="mt-2 text-lg" style={{ color: result.color }}>
                  {result.tag}
                </p>
                <p className="mt-5 max-w-xl text-mist/90">{result.desc}</p>
                <p className="mt-5 inline-flex rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2 text-sm">
                  <span className="mr-2 text-dim">現場推薦</span>
                  <Link href="/themes" className="font-bold text-glow hover:underline">
                    {result.zone}
                  </Link>
                </p>
                <div className="mt-8 flex flex-wrap items-start gap-3">
                  <ShareCardButton
                    filename={`ripple-quiz-${result.key}.png`}
                    spec={{ kicker: "你是《美國女孩》裡的誰？", lines: [result.name, result.tag], sub: result.zone, accent: result.color }}
                  />
                  <LumaButton variant="ghost" source="quiz">
                    提醒我看《美國女孩》
                  </LumaButton>
                  <button type="button" onClick={() => (setAnswers([]), setStep(-1))} className="btn btn-ghost">
                    <RefreshCw aria-hidden size={17} />
                    重測
                  </button>
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
