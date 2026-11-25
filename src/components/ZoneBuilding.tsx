"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { type Zone, zoneName, zonePath, zones } from "@/lib/zones";
import TypingGoose from "@/components/TypingGoose";

/**
 * 展區頁「施工中」畫面：頁面內容還在鍵盤上喀拉喀拉地敲出來。
 * 完整內容在 /themes/[zone]/dev（開發者預覽），完工後把 /themes/[zone] 換回 ZoneDetail 即可。
 */
export default function ZoneBuilding({ z }: { z: Zone }) {
  const other = zones.find((x) => x.slug !== z.slug)!;
  const lines = [
    `$ build 展區「${zoneName(z)}」`,
    `> 正在敲出「${z.rooms[0].char}」與「${z.rooms[1].char}」兩個空間……`,
    "> 喀拉喀拉喀拉喀拉……",
    "> 頁面還在趕工中，敬請期待 ✦",
  ];
  const full = lines.join("\n");
  const [n, setN] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(full.length);
      return;
    }
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < full.length) {
        // 打字節奏：換行稍停、偶爾頓一下，像真的在敲
        const ch = full[i - 1];
        t = setTimeout(tick, ch === "\n" ? 520 : 45 + Math.random() * 90);
      } else {
        // 打完停一會兒，退回「喀拉喀拉」那行重敲，無限循環
        t = setTimeout(() => {
          i = full.indexOf("> 喀拉");
          setN(i);
          t = setTimeout(tick, 600);
        }, 2600);
      }
    };
    t = setTimeout(tick, 500);
    return () => clearTimeout(t);
  }, [full]);

  const done = n >= full.length;

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: z.color }}
        />
      </div>
      <div className="container-x relative pb-20 pt-10 md:pb-28 md:pt-16">
        <Link
          href="/themes"
          className="inline-flex items-center gap-1.5 text-sm text-dim hover:text-glow"
        >
          <ArrowLeft aria-hidden size={15} /> 展區介紹
        </Link>

        <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3">
          <span
            aria-hidden
            className="font-serif text-[120px] font-bold leading-[0.9] md:text-[176px]"
            style={{ color: z.color, textShadow: `0 0 40px ${z.color}66` }}
          >
            {z.char}
          </span>
          <div className="pb-2 md:pb-4">
            <p className="eyebrow" style={{ color: z.color }}>
              Zone · {z.roman} · Under construction
            </p>
            <h1 className="mt-2 font-serif text-[32px] font-bold tracking-wide md:text-[44px]">
              展區「{zoneName(z)}」
              <span className="mt-1 block text-xl font-normal text-mist md:text-2xl">
                {z.subtitle}・頁面施工中
              </span>
            </h1>
          </div>
        </div>

        {/* 終端機打字畫面；螢幕閱讀器直接讀完整文字 */}
        <div className="mt-10 grid max-w-4xl items-end gap-6 md:grid-cols-[1fr_220px]">
          <div className="card order-2 overflow-hidden p-0 md:order-1">
            <div
              aria-hidden
              className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <span className="ml-3 font-mono text-xs text-dim">
                themes/{z.slug} — 施工中
              </span>
            </div>
            <p className="sr-only">{full}</p>
            <pre
              aria-hidden
              className="min-h-[9.5rem] whitespace-pre-wrap break-words px-5 py-4 font-mono text-[15px] leading-relaxed text-mist"
            >
              {full.slice(0, n)}
              <span
                className="ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-[caret_1s_steps(1)_infinite]"
                style={{
                  background: z.color,
                  animationPlayState: done ? "running" : "paused",
                }}
              />
            </pre>
          </div>
          <div className="order-1 mx-auto w-44 text-mist md:order-2 md:w-full">
            <TypingGoose typing={!done} accent={z.color} />
          </div>
        </div>

        <p className="mt-8 max-w-2xl text-[17px] text-mist/90">{z.summary}</p>
        <p className="mt-3 text-sm text-dim">
          展區現場 3/19（五）15:00、3/20（六）14:00 起開放，免費入場。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/themes" className="btn btn-ghost">
            <ArrowLeft aria-hidden size={16} /> 回展區介紹
          </Link>
          <Link href={zonePath(other)} className="btn btn-ghost">
            看看展區「{zoneName(other)}」 <ArrowRight aria-hidden size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
