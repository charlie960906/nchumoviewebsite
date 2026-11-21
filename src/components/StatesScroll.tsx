"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  m,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

const states: StateItem[] = [
  {
    key: "固",
    en: "Solid",
    title: "留在原地的",
    text: "穩定、沉靜，如家與土地。時刻表、地圖與到場資訊，是你隨時可以回來確認的岸。",
    href: "/program",
    cta: "看時間表",
  },
  {
    key: "液",
    en: "Liquid",
    title: "流動著的",
    text: "穿梭於城市與人群之間的探索。兩大展區「泅」與「涯」，從提問一路流向抵達。",
    href: "/themes",
    cta: "走進展區",
  },
  {
    key: "氣",
    en: "Gas",
    title: "看不見的",
    text: "無形卻滲透生活的情感共鳴。在線上互動館抽一張黑膠，聽一個人的歌與故事。",
    href: "/interactive",
    cta: "進入互動館",
  },
];

/** 融化後的一灘水：不規則、扁平的水窪輪廓（中心約在 200,322） */
const PUDDLE =
  "M70 318 C58 304 96 296 132 300 C162 294 196 290 226 296 C258 300 300 296 322 306 C344 314 334 326 314 330 C300 334 318 344 344 348 C366 352 360 364 330 364 C298 366 268 352 238 350 C204 348 176 356 140 352 C104 348 74 340 64 330 C58 324 62 320 70 318 Z";

/** 霧氣：每縷的位置、擺幅、粗細、透明度與循環節奏（錯開才不會整齊劃一） */
const MIST = [
  { x: 200, amp: 16, w: 16, o: 0.55, delay: 0, dur: 6.5 },
  { x: 168, amp: 12, w: 11, o: 0.45, delay: 1.6, dur: 7.2 },
  { x: 234, amp: 14, w: 12, o: 0.45, delay: 3.1, dur: 6.8 },
  { x: 146, amp: 10, w: 8, o: 0.35, delay: 4.4, dur: 7.8 },
  { x: 256, amp: 10, w: 9, o: 0.35, delay: 2.4, dur: 8 },
  { x: 212, amp: 18, w: 20, o: 0.3, delay: 5.2, dur: 7.5 },
];

/* 捲動進度切段：固(停留) → 融化 → 液(停留) → 蒸發 → 氣(停留) */
const MELT: [number, number] = [0.2, 0.44];
const EVAP: [number, number] = [0.58, 0.82];
const SWITCH = [0.34, 0.7]; // 左側文字切換點（各轉場的中段）

/** 讓 SVG 濾鏡屬性跟著捲動值變化（濾鏡原語不吃 CSS，只能直接改屬性） */
function useSvgAttr(ref: React.RefObject<SVGElement | null>, attr: string, v: MotionValue<number>) {
  useEffect(() => {
    const set = (n: number) => ref.current?.setAttribute(attr, n.toFixed(2));
    set(v.get());
    return v.on("change", set);
  }, [ref, attr, v]);
}

function useDisplacement(ref: React.RefObject<SVGFEDisplacementMapElement | null>, v: MotionValue<number>) {
  useEffect(() => {
    const set = (n: number) => ref.current?.setAttribute("scale", n.toFixed(2));
    set(v.get());
    return v.on("change", set);
  }, [ref, v]);
}

/** 「液」蒸發時往上飄散的水氣 */
function Vapor({ p, x, delay, size }: { p: MotionValue<number>; x: string; delay: number; size: number }) {
  const a = 0.6 + delay;
  const y = useTransform(p, [a, a + 0.16], [0, -110]);
  const opacity = useTransform(p, [a, a + 0.03, a + 0.1, a + 0.16], [0, 0.85, 0.5, 0]);
  const scale = useTransform(p, [a, a + 0.16], [0.6, 1.8]);
  return (
    <m.span
      style={{ y, opacity, scale, left: x, width: size, height: size }}
      className="absolute top-[30%] rounded-full bg-mist/80 blur-[3px]"
    />
  );
}

/**
 * 「固 → 液 → 氣」捲動敘事（首頁、策展理念頁共用）：
 * 外層 300svh 提供捲動距離，內層 sticky 一個畫面；右側冰塊隨捲動融化成水、再蒸發成霧氣，左側文字同步切換。
 */
export type StateItem = { key: string; en: string; title: string; text: string; href?: string; cta?: string };

export default function StatesScroll({
  items = states,
  index = 2,
  eyebrow = "Three States",
  labelledBy,
  className = "mt-20 md:mt-28 lg:mt-32",
}: {
  items?: StateItem[];
  /** 眉標編號；傳 null 不顯示眉標（例如外面已經有段落標題） */
  index?: number | null;
  eyebrow?: string;
  /** 外部標題的 id；有給就不另外輸出隱藏標題 */
  labelledBy?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(p, "change", (v) => {
    const next = v < SWITCH[0] ? 0 : v < SWITCH[1] ? 1 : 2;
    setActive((cur) => (cur === next ? cur : next));
  });

  /* ── 冰塊：維持正方體等比縮小，稜角逐漸融成圓弧，最後淡出 ── */
  const iceScale = useTransform(p, MELT, [1, 0.2]);
  const iceOpacity = useTransform(p, [MELT[0], MELT[1] - 0.06, MELT[1]], [1, 0.9, 0]);
  const iceRound = useTransform(p, [MELT[0], MELT[1] - 0.06], [0, 16]); // 外輪廓圓角程度
  const iceSoft = useTransform(p, [MELT[0], MELT[1] - 0.06], [0, 2.5]); // 面與面之間的稜線也跟著柔化
  const iceRoundRef = useRef<SVGFEGaussianBlurElement>(null);
  const iceSoftRef = useRef<SVGFEGaussianBlurElement>(null);
  useSvgAttr(iceRoundRef, "stdDeviation", iceRound);
  useSvgAttr(iceSoftRef, "stdDeviation", iceSoft);
  const iceGlow = useTransform(p, [0, MELT[0], MELT[1]], [1, 0.6, 0]);
  /* 融化時滴下的水珠 */
  const dripY = useTransform(p, MELT, [0, 40]); // 落到水面就停
  const dripOpacity = useTransform(p, [MELT[0], MELT[0] + 0.04, MELT[1] - 0.04, MELT[1]], [0, 1, 1, 0]);

  /* ── 水：融化時擴張成水面，蒸發時縮小消失 ── */
  // 蒸發後不完全消失：縮成一圈淡淡的水痕，霧氣從那裡升起
  const waterSX = useTransform(p, [MELT[0], MELT[1], EVAP[0], EVAP[1]], [0.25, 1, 1, 0.55]);
  const waterSY = useTransform(p, [MELT[0], MELT[1], EVAP[0], EVAP[1]], [0.25, 1, 1, 0.45]);
  const waterOpacity = useTransform(p, [MELT[0], MELT[0] + 0.06, EVAP[0], EVAP[1]], [0, 1, 1, 0.22]);
  const rippleOpacity = useTransform(p, [MELT[1] - 0.06, MELT[1], EVAP[0], EVAP[0] + 0.1], [0, 1, 1, 0]);

  /* ── 蒸氣與雲 ── */
  const mistOpacity = useTransform(p, [EVAP[0], EVAP[0] + 0.12], [0, 1]);
  const mistY = useTransform(p, [EVAP[0], 1], [30, -20]);

  /* 背景光暈：冰藍 → 潮青 → 月白 */
  const bgSolid = useTransform(p, [0, MELT[1]], [1, 0]);
  const bgLiquid = useTransform(p, [MELT[0], MELT[1], EVAP[0], EVAP[1]], [0, 1, 1, 0]);
  const bgGas = useTransform(p, [EVAP[0], EVAP[1]], [0, 1]);
  const hintOpacity = useTransform(p, [0, 0.12], [1, 0]);

  /* ── 左側大字：固 融化 → 液 由下注滿 → 液 蒸發 → 氣 凝聚 ── */
  // 固：字形被往下拉扯、塌陷、滴落
  const solidOpacity = useTransform(p, [0.26, 0.37], [1, 0]);
  const solidScaleY = useTransform(p, [0.22, 0.37], [1, 0.5]);
  const solidScaleX = useTransform(p, [0.22, 0.37], [1, 1.14]);
  const solidBlur = useTransform(p, [0.28, 0.37], [0, 3]);
  const solidFilter = useMotionTemplate`url(#txt-melt) blur(${solidBlur}px)`;
  const meltScale = useTransform(p, [0.2, 0.34], [0, 46]);
  // 液：像水位一樣由下往上漲滿，水波慢慢平靜；之後往上蒸散
  const liquidOpacity = useTransform(p, [0.32, 0.36, 0.62, 0.73], [0, 1, 1, 0]);
  const liquidLevel = useTransform(p, [0.32, 0.45], [-12, 112]);
  const liquidEdge = useTransform(liquidLevel, (v) => v + 12);
  // 蒸發：由下往上逐漸變透明（與注水方向相反）
  const evapLow = useTransform(p, [0.6, 0.73], [-30, 100]);
  const evapHigh = useTransform(evapLow, (v) => v + 30);
  const liquidMask = useMotionTemplate`linear-gradient(to top, transparent ${evapLow}%, #000 ${evapHigh}%, #000 ${liquidLevel}%, transparent ${liquidEdge}%)`;
  const liquidY = useTransform(p, [0.6, 0.73], [0, -40]);
  const liquidScale = useTransform(p, [0.6, 0.73], [1, 1.06]);
  const liquidBlur = useTransform(p, [0.62, 0.73], [0, 3]);
  const liquidFilter = useMotionTemplate`url(#txt-liquid) blur(${liquidBlur}px)`;
  const liquidWave = useTransform(p, [0.32, 0.46, 0.58, 0.72], [34, 0, 0, 30]);
  // 氣：從模糊、擴散的霧氣凝聚成字
  const gasOpacity = useTransform(p, [0.7, 0.82], [0, 1]);
  const gasY = useTransform(p, [0.68, 0.83], [36, 0]);
  const gasScale = useTransform(p, [0.68, 0.83], [1.25, 1]);
  const gasBlur = useTransform(p, [0.68, 0.83], [5, 0]);
  const gasFilter = useMotionTemplate`url(#txt-gas) blur(${gasBlur}px)`;
  const gasWave = useTransform(p, [0.7, 0.84], [18, 0]);

  const meltRef = useRef<SVGFEDisplacementMapElement>(null);
  const liquidRef = useRef<SVGFEDisplacementMapElement>(null);
  const gasRef = useRef<SVGFEDisplacementMapElement>(null);
  useDisplacement(meltRef, meltScale);
  useDisplacement(liquidRef, liquidWave);
  useDisplacement(gasRef, gasWave);

  /* ── 下方說明文字：跟大字同一套融化／注水／蒸發／凝聚，只是扭曲幅度依字級縮小 ── */
  const meltScaleSm = useTransform(meltScale, (v) => v * 0.35);
  const liquidWaveSm = useTransform(liquidWave, (v) => v * 0.35);
  const gasWaveSm = useTransform(gasWave, (v) => v * 0.4);
  const meltSmRef = useRef<SVGFEDisplacementMapElement>(null);
  const liquidSmRef = useRef<SVGFEDisplacementMapElement>(null);
  const gasSmRef = useRef<SVGFEDisplacementMapElement>(null);
  useDisplacement(meltSmRef, meltScaleSm);
  useDisplacement(liquidSmRef, liquidWaveSm);
  useDisplacement(gasSmRef, gasWaveSm);
  const solidFilterSm = useMotionTemplate`url(#txt-melt-sm) blur(${solidBlur}px)`;
  const liquidFilterSm = useMotionTemplate`url(#txt-liquid-sm) blur(${liquidBlur}px)`;
  const gasFilterSm = useMotionTemplate`url(#txt-gas-sm) blur(${gasBlur}px)`;
  const descStyles = [
    { opacity: solidOpacity, scaleY: solidScaleY, scaleX: solidScaleX, filter: solidFilterSm, originX: 0, originY: 1 },
    {
      opacity: liquidOpacity,
      y: liquidY,
      scale: liquidScale,
      filter: liquidFilterSm,
      maskImage: liquidMask,
      WebkitMaskImage: liquidMask,
      originX: 0,
      originY: 1,
    },
    { opacity: gasOpacity, y: gasY, scale: gasScale, filter: gasFilterSm, originX: 0, originY: 1 },
  ];

  const s = items[active];

  return (
    <section ref={ref} aria-labelledby={labelledBy ?? "states-h"} className={`relative h-[300svh] ${className}`}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden pt-16">
        {/* 背景光暈 */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <m.div style={{ opacity: bgSolid }} className="absolute inset-0" />
          <m.div style={{ opacity: bgLiquid }} className="absolute inset-0" />
          <m.div style={{ opacity: bgGas }} className="absolute inset-0" />
        </div>

        <div className="container-x relative grid w-full items-center gap-4 md:grid-cols-[1fr_1.1fr] md:gap-12">
          {/* ── 左：文字 ── */}
          <div className="order-2 md:order-1">
            {index !== null && (
              <p className="eyebrow">
                <span className="eyebrow-num">{String(index).padStart(2, "0")} —</span>
                {eyebrow}
              </p>
            )}
            {!labelledBy && (
              <h2 id="states-h" className="sr-only">
                水的三態：固、液、氣
              </h2>
            )}

            {/* 大字三態：隨捲動連續變形（純視覺；文字內容由下方 aria-live 區提供） */}
            <svg aria-hidden width="0" height="0" className="absolute">
              <defs>
                {/* 融化：x 向雜訊頻率高、y 向極低 → 每條直欄往下錯位，像字往下流 */}
                <filter id="txt-melt" x="-20%" y="-20%" width="140%" height="180%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.035 0.006" numOctaves="2" seed="3" result="n" />
                  <feDisplacementMap ref={meltRef} in="SourceGraphic" in2="n" scale="0" xChannelSelector="A" yChannelSelector="R" />
                </filter>
                {/* 液體水波 */}
                <filter id="txt-liquid" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence type="turbulence" baseFrequency="0.012 0.05" numOctaves="2" seed="8" result="n" />
                  <feDisplacementMap ref={liquidRef} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                {/* 霧氣：高頻碎散 */}
                <filter id="txt-gas" x="-30%" y="-30%" width="160%" height="160%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="5" result="n" />
                  <feDisplacementMap ref={gasRef} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                {/* 說明文字用的同款濾鏡（雜訊頻率配合小字級調高） */}
                <filter id="txt-melt-sm" x="-10%" y="-20%" width="120%" height="160%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.08 0.012" numOctaves="2" seed="3" result="n" />
                  <feDisplacementMap ref={meltSmRef} in="SourceGraphic" in2="n" scale="0" xChannelSelector="A" yChannelSelector="R" />
                </filter>
                <filter id="txt-liquid-sm" x="-10%" y="-20%" width="120%" height="140%">
                  <feTurbulence type="turbulence" baseFrequency="0.03 0.1" numOctaves="2" seed="8" result="n" />
                  <feDisplacementMap ref={liquidSmRef} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                <filter id="txt-gas-sm" x="-15%" y="-30%" width="130%" height="160%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.18" numOctaves="3" seed="5" result="n" />
                  <feDisplacementMap ref={gasSmRef} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
            </svg>

            <div aria-hidden className="relative mt-4 h-[96px] md:mt-6 md:h-[150px]">
              {/* 固 */}
              <m.div style={{ opacity: solidOpacity }} className="absolute inset-0 flex items-end gap-4">
                <m.span
                  style={{ scaleY: solidScaleY, scaleX: solidScaleX, filter: solidFilter, originY: 1 }}
                  className="block font-serif text-[88px] font-black leading-none text-moon md:text-[140px]"
                >
                  固
                </m.span>
                <span className="pb-2 font-mono text-sm tracking-[0.3em] text-dim uppercase">Solid</span>
              </m.div>

              {/* 液 */}
              <m.div style={{ opacity: liquidOpacity, y: liquidY }} className="absolute inset-0 flex items-end gap-4">
                <m.span
                  style={{ scale: liquidScale, filter: liquidFilter, maskImage: liquidMask, WebkitMaskImage: liquidMask, originY: 1 }}
                  className="block font-serif text-[88px] font-black leading-none text-[#bae6fd] md:text-[140px]"
                >
                  液
                </m.span>
                <span className="pb-2 font-mono text-sm tracking-[0.3em] text-dim uppercase">Liquid</span>
              </m.div>
              {/* 蒸散的水氣 */}
              <div className="pointer-events-none absolute left-0 top-0 h-full w-[88px] md:w-[140px]">
                <Vapor p={p} x="10%" delay={0} size={14} />
                <Vapor p={p} x="40%" delay={0.025} size={18} />
                <Vapor p={p} x="66%" delay={0.01} size={12} />
                <Vapor p={p} x="28%" delay={0.045} size={10} />
                <Vapor p={p} x="80%" delay={0.035} size={15} />
              </div>

              {/* 氣 */}
              <m.div style={{ opacity: gasOpacity, y: gasY }} className="absolute inset-0 flex items-end gap-4">
                <m.span
                  style={{ scale: gasScale, filter: gasFilter }}
                  className="block font-serif text-[88px] font-black leading-none text-moon/90 md:text-[140px]"
                >
                  氣
                </m.span>
                <span className="pb-2 font-mono text-sm tracking-[0.3em] text-dim uppercase">Gas</span>
              </m.div>
            </div>

            {/* 螢幕報讀：只念目前狀態 */}
            <p aria-live="polite" className="sr-only">
              {s.key}（{s.en}）：{s.title}
            </p>

            {/* 說明文字：三段疊在同一格，跟著捲動與大字同步融化／注水／蒸發／凝聚 */}
            <div className="relative grid min-h-[170px] md:min-h-[200px]">
              {items.map((it, i) => {
                const on = i === active;
                return (
                  <m.div
                    key={it.key}
                    style={descStyles[i] ?? descStyles[2]}
                    aria-hidden={!on}
                    inert={!on}
                    className={`[grid-area:1/1] ${on ? "" : "pointer-events-none"}`}
                  >
                    <h3 className="mt-4 text-2xl font-bold md:mt-6 md:text-3xl">{it.title}</h3>
                    <p className="mt-3 max-w-md text-[15px] leading-[1.9] text-mist/85 md:text-base">{it.text}</p>
                    {it.href && (
                      <Link
                        href={it.href}
                        className="group mt-5 inline-flex min-h-11 items-center gap-1.5 border-b-2 border-glow font-bold text-glow hover:border-moon hover:text-moon"
                      >
                        {it.cta}
                        <ArrowRight aria-hidden size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    )}
                  </m.div>
                );
              })}
            </div>
          </div>

          {/* ── 右：冰 → 水 → 雲 ── */}
          <div aria-hidden className="order-1 mx-auto w-full max-w-[260px] md:order-2 md:max-w-[520px]">
            <svg viewBox="0 0 400 400" className="h-auto w-full overflow-visible">
              <defs>
                <linearGradient id="ice-top" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f0f9ff" />
                  <stop offset="1" stopColor="#bae6fd" />
                </linearGradient>
                <linearGradient id="ice-left" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#7dd3fc" stopOpacity=".85" />
                  <stop offset="1" stopColor="#5A9FD4" stopOpacity=".7" />
                </linearGradient>
                <linearGradient id="ice-right" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#bae6fd" stopOpacity=".8" />
                  <stop offset="1" stopColor="#8CC4EC" stopOpacity=".55" />
                </linearGradient>
                <radialGradient id="water" cx=".5" cy=".4" r=".6">
                  <stop offset="0" stopColor="#7dd3fc" stopOpacity=".9" />
                  <stop offset=".6" stopColor="#5A9FD4" stopOpacity=".75" />
                  <stop offset="1" stopColor="#0e4a6b" stopOpacity=".6" />
                </radialGradient>
                <filter id="mist" x="-60%" y="-40%" width="220%" height="180%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
                <clipPath id="puddle-clip">
                  <path d={PUDDLE} />
                </clipPath>
                <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
                <filter id="ice-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="18" />
                </filter>
                {/* 冰塊稜角融圓：輪廓先模糊再用 alpha 門檻收回（gooey），把原圖裁進這個圓角輪廓 */}
                <filter id="ice-round" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur ref={iceRoundRef} in="SourceGraphic" stdDeviation="0" result="b" />
                  <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" result="shape" />
                  <feGaussianBlur ref={iceSoftRef} in="SourceGraphic" stdDeviation="0" result="s" />
                  <feComposite in="s" in2="shape" operator="in" />
                </filter>
              </defs>

              {/* 水面 + 漣漪：水窪中心（212,328）平移到冰塊底點（200,320），融出的水與縮到最小的冰塊在同一點 */}
              <g transform="translate(-12 -8)">
              <m.g style={{ opacity: waterOpacity }}>
                {/* 水窪以冰塊底點 (200,320) 為中心擴張／收縮，讓水始終從冰塊底下流出、不與冰塊分離 */}
                <m.g style={{ scaleX: waterSX, scaleY: waterSY, transformBox: "view-box", originX: "200px", originY: "320px" }}>
                  <path d={PUDDLE} fill="url(#water)" />
                  <path d={PUDDLE} fill="none" stroke="#e0f2fe" strokeOpacity=".45" strokeWidth="1.5" />
                  {/* 濺出的小水珠 */}
                  <ellipse cx="360" cy="330" rx="8" ry="3.5" fill="url(#water)" />
                  <ellipse cx="46" cy="312" rx="6" ry="3" fill="url(#water)" />
                  <ellipse cx="190" cy="366" rx="7" ry="3" fill="url(#water)" />
                  {/* 水面反光 */}
                  <path d="M128 312 q40 -10 82 -6" fill="none" stroke="#f0f9ff" strokeOpacity=".55" strokeWidth="3" strokeLinecap="round" />
                  <path d="M286 352 q20 4 40 2" fill="none" stroke="#f0f9ff" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />
                </m.g>
                <m.g style={{ opacity: rippleOpacity }} clipPath="url(#puddle-clip)">
                  {[0, 1, 2].map((i) => (
                    <ellipse
                      key={i}
                      cx="212"
                      cy="328"
                      rx="150"
                      ry="30"
                      fill="none"
                      stroke="#e0f2fe"
                      strokeOpacity=".7"
                      strokeWidth="1.2"
                      className="states-ripple"
                      style={{ animationDelay: `${i * 1.1}s` }}
                    />
                  ))}
                </m.g>
              </m.g>
              </g>

              {/* 冰塊 */}
              <m.g style={{ opacity: iceGlow }}>
                <ellipse cx="200" cy="235" rx="100" ry="90" fill="#bae6fd" opacity=".18" filter="url(#ice-glow)" />
              </m.g>
              <m.g
                style={{ scale: iceScale, opacity: iceOpacity, transformBox: "view-box", originX: "200px", originY: "320px" }}
              >
                <g strokeLinejoin="round" filter="url(#ice-round)">
                  <polygon points="122,185 200,230 200,320 122,275" fill="url(#ice-left)" stroke="#e0f2fe" strokeOpacity=".5" strokeWidth="2" />
                  <polygon points="200,230 278,185 278,275 200,320" fill="url(#ice-right)" stroke="#e0f2fe" strokeOpacity=".5" strokeWidth="2" />
                  <polygon points="122,185 200,140 278,185 200,230" fill="url(#ice-top)" stroke="#ffffff" strokeOpacity=".8" strokeWidth="2" />
                  {/* 高光與冰裂紋 */}
                  <path d="M138 205 L138 250" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" />
                  <path d="M150 178 L186 157" stroke="#fff" strokeOpacity=".9" strokeWidth="3" strokeLinecap="round" />
                  <path d="M228 238 L246 252 L240 270 M246 252 L262 248" fill="none" stroke="#f0f9ff" strokeOpacity=".55" strokeWidth="1.5" />
                  <path d="M160 260 L172 248 L168 232" fill="none" stroke="#f0f9ff" strokeOpacity=".4" strokeWidth="1.5" />
                </g>
              </m.g>

              {/* 融化滴落：跟冰塊同一個縮放中心（冰塊底點 200,320），水珠才會貼著變小的冰塊邊緣 */}
              <m.g style={{ scale: iceScale, transformBox: "view-box", originX: "200px", originY: "320px" }}>
                <m.g style={{ y: dripY, opacity: dripOpacity }}>
                  <path d="M266 270 q6 10 0 16 q-6 -6 0 -16z" fill="#bae6fd" />
                  <path d="M132 262 q5 9 0 14 q-5 -5 0 -14z" fill="#bae6fd" />
                </m.g>
              </m.g>

              {/* 霧氣：從水痕升起，一縷縷往上飄、扭動、散開；進入「氣」後持續循環 */}
              <m.g style={{ opacity: mistOpacity, y: mistY }} fill="none" stroke="#e2e8f0" strokeLinecap="round" filter="url(#mist)">
                {MIST.map((w, i) => (
                  <g key={i} className="states-mist" style={{ animationDelay: `${w.delay}s`, animationDuration: `${w.dur}s` }}>
                    <g className="states-sway" style={{ animationDelay: `${w.delay * 0.7}s` }}>
                      <path
                        d={`M${w.x} 322 c-${w.amp} -24 ${w.amp} -46 0 -70 c-${w.amp} -24 ${w.amp} -46 0 -70`}
                        strokeWidth={w.w}
                        strokeOpacity={w.o}
                      />
                    </g>
                  </g>
                ))}
              </m.g>
            </svg>
          </div>
        </div>

        {/* 捲動提示 */}
        <m.p
          aria-hidden
          style={{ opacity: hintOpacity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-xs tracking-[0.3em] text-dim uppercase"
        >
          Scroll ↓
        </m.p>
      </div>
    </section>
  );
}
