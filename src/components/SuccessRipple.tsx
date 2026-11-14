"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 回饋型動畫：水滴落水 → 漣漪擴散 → 成功勾選。
 * 進入視窗時播放一次；點擊可重播。reduced-motion 時直接顯示完成狀態（由全域 CSS 處理）。
 */
export default function SuccessRipple({ size = 168, color = "#10B981" }: { size?: number; color?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun((n) => n || 1);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setRun((n) => n + 1)}
      aria-label="重播報名成功動畫"
      className="relative mx-auto grid shrink-0 place-items-center rounded-full"
      style={{ width: size, height: size }}
    >
      {run > 0 && (
        <span key={run} aria-hidden className="absolute inset-0 grid place-items-center">
          <span
            className="absolute h-3 w-3 rounded-full"
            style={{ background: color, animation: "drop-fall 520ms cubic-bezier(.5,0,.9,.4) both" }}
          />
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute inset-0 rounded-full border-2 opacity-0"
              style={{ borderColor: color, animation: `ripple-out 1400ms var(--ease-ripple) ${480 + i * 220}ms both` }}
            />
          ))}
          <svg viewBox="0 0 52 52" className="relative h-16 w-16">
            <circle cx="26" cy="26" r="24" fill={`${color}22`} stroke={color} strokeWidth="2" />
            <path
              d="M15 27l8 8 15-17"
              fill="none"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="40"
              strokeDashoffset="40"
              style={{ animation: "check-draw 420ms ease-out 900ms forwards" }}
            />
          </svg>
        </span>
      )}
    </button>
  );
}
