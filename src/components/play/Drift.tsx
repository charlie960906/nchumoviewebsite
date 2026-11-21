"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { RefreshCw, Sparkles } from "lucide-react";
import { drifts, type Drift as DriftT } from "@/lib/content";
import LumaButton from "@/components/LumaButton";
import ShareCardButton from "./ShareCardButton";

/** 漂流詞幸運籤：抽取 → 水波擴散 → 揭示籤詩與今日小指引 → 產生分享圖。 */
export default function Drift({ initialId }: { initialId?: string }) {
  const [cur, setCur] = useState<DriftT | null>(() => drifts.find((d) => d.id === initialId) ?? null);
  const [busy, setBusy] = useState(false);
  const last = useRef<string | null>(initialId ?? null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const draw = () => {
    if (busy) return;
    const pool = drifts.filter((d) => d.id !== last.current);
    const next = pool[Math.floor(Math.random() * pool.length)];
    last.current = next.id;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setBusy(true);
    setCur(null);
    timer.current = setTimeout(
      () => {
        setCur(next);
        setBusy(false);
        history.replaceState(null, "", `/interactive/drift/${next.id}`);
        requestAnimationFrame(() => resultRef.current?.focus({ preventScroll: true }));
      },
      reduced ? 0 : 1100,
    );
  };

  return (
    <div className="card relative overflow-hidden">
      <div className="relative grid min-h-[520px] place-items-center px-5 py-14 md:min-h-[560px]">
        {/* 水面 */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {(busy ? [0, 1, 2, 3] : [0, 1]).map((i) => (
            <span key={`${busy}-${i}`} className="absolute left-1/2 top-[45%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2">
              <span
                className="block h-full w-full animate-ripple-out rounded-full border border-glow/40"
                style={{ animationDuration: busy ? "1.1s" : "5s", animationDelay: `${i * (busy ? 0.22 : 2.5)}s` }}
              />
            </span>
          ))}
        </div>

        <div ref={resultRef} tabIndex={-1} aria-live="polite" className="relative w-full max-w-xl text-center outline-none">
          <AnimatePresence mode="wait">
            {cur ? (
              <m.div
                key={cur.id}
                initial={{ opacity: 0, y: 20, scale: 0.97, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="eyebrow">第 {cur.id} 籤</p>
                <blockquote className="prose-poem mt-6 whitespace-pre-line text-[28px] font-bold leading-[1.9] text-moon md:text-[36px]">{cur.text}</blockquote>
                <p className="mt-4 text-sm text-dim">— {cur.source}</p>
                <m.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full border border-glow/40 bg-glow/10 px-5 py-2 text-mist"
                >
                  <Sparkles aria-hidden size={16} className="text-glow" />
                  {cur.fortune}
                </m.p>
                <m.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.5 }}
                  className="mt-9 flex flex-wrap items-start justify-center gap-3"
                >
                  <ShareCardButton
                    filename={`ripple-drift-${cur.id}.png`}
                    spec={{ kicker: `漂流詞幸運籤・第 ${cur.id} 籤`, lines: cur.text.split("\n"), footnote: cur.source, sub: cur.fortune }}
                  />
                  <button type="button" onClick={draw} className="btn btn-ghost">
                    <RefreshCw aria-hidden size={17} />
                    再抽一支
                  </button>
                </m.div>
              </m.div>
            ) : busy ? (
              <m.p key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-serif text-xl text-mist">
                水面正在把一句話送過來…
              </m.p>
            ) : (
              <m.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
                <p className="prose-poem text-xl text-mist">心裡想著一件還沒有答案的事，</p>
                <p className="prose-poem text-xl text-mist">然後往水裡丟一顆石頭。</p>
                <button type="button" onClick={draw} className="btn btn-primary mt-9 !px-8 !text-base">
                  <Sparkles aria-hidden size={18} />
                  抽一支漂流詞
                </button>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 md:px-8">
        <p className="text-sm text-dim">共 {drifts.length} 支籤。把抽到的那句話，帶到現場的星空下。</p>
        <LumaButton size="sm" variant="ghost" source="drift" />
      </div>
    </div>
  );
}
