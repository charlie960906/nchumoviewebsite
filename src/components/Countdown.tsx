"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const target = new Date(site.start).getTime();
const endAt = new Date(site.end).getTime();

function parts(now: number) {
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor(diff / 3_600_000) % 24,
    m: Math.floor(diff / 60_000) % 60,
    s: Math.floor(diff / 1000) % 60,
  };
}

/** 倒數至 2027/3/19 15:00（星空市集開始）。伺服器端先輸出文字日期，掛載後才開始跳秒，避免 hydration 不一致。 */
export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (now !== null && now >= endAt) {
    return <p className="font-serif text-lg text-mist">本屆電影節已圓滿落幕，謝謝每一圈漣漪。</p>;
  }
  if (now !== null && now >= target) {
    return (
      <p className="inline-flex items-center gap-3 font-serif text-xl text-glow">
        <span className="ripple-spinner" aria-hidden /> 電影節進行中，歡迎入場
      </p>
    );
  }

  const p = now === null ? null : parts(now);
  const cells: [string, number | null][] = [
    ["天", p?.d ?? null],
    ["時", p?.h ?? null],
    ["分", p?.m ?? null],
    ["秒", p?.s ?? null],
  ];

  return (
    <div>
      <p className="mb-3 text-sm text-dim">
        距離 <time dateTime={site.start}>2027/3/19（五）15:00</time> 星空市集開始
      </p>
      <div
        role="timer"
        aria-label={p ? `距離開幕還有 ${p.d} 天 ${p.h} 小時 ${p.m} 分` : "倒數計時"}
        className="flex gap-2.5 sm:gap-3"
      >
        {cells.map(([label, v]) => (
          <div
            key={label}
            aria-hidden
            className="card w-[68px] px-2 py-3 text-center backdrop-blur-sm sm:w-[84px] sm:py-4"
          >
            <div className="font-mono text-2xl font-bold tabular-nums text-moon sm:text-4xl">
              {v === null ? "--" : String(v).padStart(label === "天" ? 3 : 2, "0")}
            </div>
            <div className="mt-1 text-xs text-dim">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
