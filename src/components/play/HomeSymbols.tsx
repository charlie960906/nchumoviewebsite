"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/track";
import { AnimatePresence, m } from "motion/react";
import { RefreshCw } from "lucide-react";
import { homeSymbols } from "@/lib/content";
import ShareCardButton from "./ShareCardButton";

const MAX = 4;
// 四個符號在家徽上的位置（上、右、下、左）
const slots = [
  { x: 50, y: 20 },
  { x: 80, y: 50 },
  { x: 50, y: 80 },
  { x: 20, y: 50 },
];

/** 展區「佗」互動小遊戲：從 12 個符號中挑 4 個，拼出自己的「家」。 */
export default function HomeSymbols() {
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < MAX ? [...p, id] : p));

  const chosen = picked.map((id) => homeSymbols.find((s) => s.id === id)!);
  const complete = chosen.length === MAX;
  useEffect(() => {
    if (complete) track("interactive_play", { game: "home", action: "complete" });
  }, [complete]);
  const sentence = complete
    ? `我的家，是${chosen
        .slice(0, 3)
        .map((c) => c.label)
        .join("、")}，和${chosen[3].label}。`
    : "";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.1fr]">
      {/* 家徽 */}
      <div>
        <div className="card relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden" role="img" aria-label={complete ? sentence : `已選 ${chosen.length} 個符號，共需 ${MAX} 個`}>
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,.2),transparent_65%)]" />
          {[30, 52, 74, 96].map((s, i) => (
            <span
              key={s}
              aria-hidden
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-500 ${
                chosen.length > i ? "border-ok/60" : "border-white/10"
              }`}
              style={{ width: `${s}%`, height: `${s}%` }}
            />
          ))}
          <span aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-5xl font-bold text-moon/90">
            佗
          </span>
          <AnimatePresence>
            {chosen.map((c, i) => (
              <m.span
                key={c.id}
                aria-hidden
                initial={{ opacity: 0, scale: 0.3, left: "50%", top: "50%" }}
                animate={{ opacity: 1, scale: 1, left: `${slots[i].x}%`, top: `${slots[i].y}%` }}
                exit={{ opacity: 0, scale: 0.3 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-5xl drop-shadow-[0_4px_16px_rgba(0,0,0,.5)] md:text-6xl"
              >
                {c.glyph}
              </m.span>
            ))}
          </AnimatePresence>
        </div>

        <div aria-live="polite" className="mx-auto mt-5 max-w-[420px] text-center">
          {complete ? (
            <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="prose-poem text-lg text-moon">{sentence}</p>
              <div className="mt-5 flex flex-wrap items-start justify-center gap-3">
                <ShareCardButton
                  game="home"
                  filename="ripple-home-crest.png"
                  spec={{
                    kicker: "拼湊家的符號",
                    emoji: chosen.map((c) => c.glyph),
                    lines: ["我的家，是", ...chosen.map((c) => c.label)],
                    sub: "展區「佗」— 涯：家與土地認同",
                    accent: "#10B981",
                  }}
                />
                <button type="button" onClick={() => setPicked([])} className="btn btn-ghost">
                  <RefreshCw aria-hidden size={17} />
                  重拼
                </button>
              </div>
            </m.div>
          ) : (
            <p className="text-sm text-dim">
              還差 <span className="font-mono text-glow">{MAX - chosen.length}</span> 個符號
            </p>
          )}
        </div>
      </div>

      {/* 符號盤 */}
      <fieldset className="card p-6 md:p-8">
        <legend className="sr-only">挑選四個代表家的符號</legend>
        <p className="font-bold">
          想到「家」，你會想到什麼？
          <span className="ml-2 font-mono text-sm font-normal text-dim">
            {chosen.length} / {MAX}
          </span>
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {homeSymbols.map((s) => {
            const on = picked.includes(s.id);
            const full = !on && picked.length >= MAX;
            return (
              <m.button
                key={s.id}
                type="button"
                aria-pressed={on}
                disabled={full}
                onClick={() => toggle(s.id)}
                whileTap={{ scale: 0.92 }}
                className={`grid place-items-center gap-1 rounded-2xl border px-2 py-4 transition-colors duration-200 disabled:opacity-30 ${
                  on ? "border-ok bg-ok/15" : "border-white/15 bg-white/[0.03] hover:border-glow/60"
                }`}
              >
                <span aria-hidden className="text-3xl">
                  {s.glyph}
                </span>
                <span className="text-xs text-mist">{s.label}</span>
              </m.button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
