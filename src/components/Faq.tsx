"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { faqs } from "@/lib/content";

const INTERVAL = 9000; // 每題停留毫秒

/**
 * FAQ「播放器」：上方是片頭條（? FAQ + 箭頭），中間是答案，底部是播放／暫停與進度軌。
 * 所有答案都留在 DOM（未播到的以 hidden 隱藏），JSON-LD 另外輸出，AEO 不受影響。
 */
export default function Faq({ limit }: { limit?: number }) {
  const list = limit ? faqs.slice(0, limit) : faqs;
  const n = list.length;
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0); // 本題已播放比例 0–1，進度點會沿軌道慢慢移向下一個點
  const [tick, setTick] = useState(0); // 換題時重新起算
  const elapsed = useRef(0);

  // 預設自動播放；使用者偏好減少動態時維持暫停
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(true);
  }, []);

  const go = useCallback(
    (i: number) => {
      elapsed.current = 0;
      setStep(0);
      setIdx(((i % n) + n) % n);
      setTick((t) => t + 1);
    },
    [n],
  );

  // 播放中逐格推進；暫停時保留已播放時間，按下播放從原處接續
  useEffect(() => {
    if (!playing) return;
    const start = performance.now() - elapsed.current;
    let raf = 0;
    const loop = (now: number) => {
      const e = now - start;
      elapsed.current = e;
      if (e >= INTERVAL) return go(idx + 1);
      setStep(e / INTERVAL);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, idx, tick, go]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(idx + 1);
    else if (e.key === "ArrowLeft") go(idx - 1);
    else return;
    e.preventDefault();
  };

  // 手機左右滑動切換題目（水平位移夠大且大於垂直位移才算，避免干擾上下捲動）
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    go(dx < 0 ? idx + 1 : idx - 1);
  };

  // 最後一題時進度點停在終點，播完後回到第一題
  const pos = n > 1 ? ((idx + (idx < n - 1 ? step : 0)) / (n - 1)) * 100 : 0;
  const glide = playing ? "" : "transition-all duration-300";

  return (
    <div
      role="region"
      aria-roledescription="輪播"
      aria-label="常見問題"
      onKeyDown={onKey}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => (touch.current = null)}
      className="faq-player reveal flex h-full touch-pan-y select-none flex-col overflow-hidden rounded-lg sm:select-auto border border-white/10 shadow-[0_20px_60px_-30px_rgba(0,0,0,.8)]"
    >
      {/* 片頭條 */}
      <div className="relative faq-bar px-5 pb-6 pt-4 text-moon sm:px-8 sm:pb-8 sm:pt-5">
        <div aria-hidden className="pointer-events-none absolute right-4 top-5 flex gap-1 sm:right-3 sm:top-3 sm:gap-1.5 md:right-5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="faq-chev h-6 w-5 bg-glow/90 sm:h-9 sm:w-8 md:h-11 md:w-10" style={{ animationDelay: `${i * 0.18}s` }} />
          ))}
        </div>
        <p className="flex items-center gap-3">
          <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-glow font-sans text-2xl font-black text-night sm:h-12 sm:w-12 sm:text-[28px]">
            ?
          </span>
          <span className="font-mono text-3xl font-bold tracking-[0.18em] sm:text-4xl">FAQ</span>
        </p>
        {/* 所有題目疊在同一格：高度固定取最長的那題，換題時卡片不會跳動 */}
        <div className="mt-4 grid sm:mt-5">
          {list.map((f, i) => (
            <h3
              key={f.q}
              id={`faq-q-${i}`}
              aria-hidden={i !== idx}
              className={`col-start-1 row-start-1 text-lg font-bold leading-snug tracking-[0.12em] sm:text-[22px] ${i === idx ? "" : "invisible"}`}
            >
              {f.q}
            </h3>
          ))}
        </div>
      </div>

      {/* 答案 */}
      {/* 所有答案疊在同一格：高度固定取最長的答案 */}
      <div className="grid flex-1 bg-moon px-5 py-6 text-night sm:px-8 sm:py-8" aria-live={playing ? "off" : "polite"}>
        {list.map((f, i) => (
          <p
            key={f.q}
            aria-hidden={i !== idx}
            aria-labelledby={`faq-q-${i}`}
            className={`col-start-1 row-start-1 text-[15px] leading-[2] tracking-[0.08em] sm:text-[17px] ${i === idx ? "faq-answer" : "invisible"}`}
          >
            <span className="font-bold">A：</span>
            {f.a}
          </p>
        ))}
      </div>

      {/* 控制列 */}
      <div className="flex items-center gap-3 faq-bar px-4 py-2 sm:gap-5 sm:px-6">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "暫停自動播放" : "自動播放問題"}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-md text-moon hover:bg-white/10"
        >
          {playing ? <Pause aria-hidden size={22} fill="currentColor" /> : <Play aria-hidden size={22} fill="currentColor" />}
        </button>

        <div className="relative mx-1 flex h-11 flex-1 items-center sm:mx-4">
          <span aria-hidden className="absolute inset-x-0 h-1 rounded-full bg-white/15" />
          <span aria-hidden className={`absolute left-0 h-1 rounded-full bg-glow ${glide}`} style={{ width: `${pos}%` }} />
          {list.map((f, i) => (
            <button
              key={f.q}
              type="button"
              onClick={() => go(i)}
              aria-label={`第 ${i + 1} 題：${f.q}`}
              aria-current={i === idx ? "step" : undefined}
              className="group absolute grid h-8 w-8 -translate-x-1/2 place-items-center"
              style={{ left: `${n > 1 ? (i / (n - 1)) * 100 : 0}%` }}
            >
              <span className="h-1 w-1 rounded-full bg-mist/80 transition-all group-hover:h-2 group-hover:w-2" />
            </button>
          ))}
          {/* 播放頭：沿軌道慢慢跑向下一個點 */}
          <span
            aria-hidden
            className={`pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-glow shadow-[0_0_0_3px_rgba(140,196,236,.22)] ${glide}`}
            style={{ left: `${pos}%` }}
          />
        </div>

        <span className="shrink-0 font-mono text-xs tabular-nums text-mist/80 sm:text-sm">
          {String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
