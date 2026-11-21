"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { m, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { THEME_CHAR } from "@/lib/theme";
import { zoneName, zonePath, zones } from "@/lib/zones";

/**
 * 策展理念頁「沉浸式三態故事線」完整版：
 * 往下捲動時畫面鎖住，鏡頭沿著一條水的旅程往右走——
 * 一滴水落下泛起漣漪（泱）→ 冰山流下融水（固）→ 溪流往右流進下一段（液）
 * → 流過河堤邊的夜晚城市、水面倒映大樓 → 蒸發成霧（氣）
 * → 凝成水滴落下，漣漪散開成兩個展區（泅、涯）。
 * 首頁的 StatesScroll 是簡化版；這裡是完整內容版。
 */

/* ───────── 內容（詩句、故事段落可直接在這裡改） ───────── */
const chapters = {
  prologue: {
    en: "Prologue",
    quote: "電影是平靜的水面，一滴水落下，泛起微波。",
    text: "觀者與創作者的情感在這裡交會，像水滴墜落，漣漪一圈圈推開。這是一段在異鄉與家鄉之間尋找歸屬的旅程——它從一塊冰開始。",
  },
  solid: {
    key: "固",
    en: "Solid",
    title: "留在原地",
    quote: "在離開之前，我們從不知道家有形狀。",
    text: "故事從冰開始。家、土地、口音、一張餐桌——這些穩定而沉靜的東西，在我們離開之前，從來不覺得它們有形狀。它們像一塊冰，安靜地待在原地；直到某天你轉身，才發現自己一直被它的溫度包圍。",
  },
  liquid: {
    key: "液",
    en: "Liquid",
    title: "開始流動",
    quote: "水不問去處，只是一直往前。",
    text: "然後我們出發。穿過城市與人群，被新的語言和關係沖刷。一滴水落下，泛起的漣漪碰到了另一個人的漣漪。我們在流動裡學會換氣，也在別人的岸邊，看見自己的倒影。",
  },
  city: {
    caption: "在陌生的城市，每一扇亮著的窗後面，都有一個想家的人。",
  },
  gas: {
    key: "氣",
    en: "Gas",
    title: "無所不在",
    quote: "看不見的，從來沒有消失。",
    text: "最後它變成空氣。看不見，卻滲進呼吸裡——一首歌的前奏、颱風天的鹹味、某句脫口而出的家鄉話。你發現你從未真正離開。",
  },
  zones: {
    title: "漣漪散開，落成兩個展區",
    quote: "以生命為定點，歪扭地繪出一圈圈沒有終點的尋途，落腳於一陣陣深淺互織的漣漪。",
  },
};

/* ───────── 捲動節奏：6 個畫面（泱、固、液、城、氣、泅・涯），各自的「正中央」進度 ───────── */
const PANELS = 6;
const HOLD = 0.04; // 頭尾各停一下
const center = (i: number) => HOLD + (i * (1 - HOLD * 2)) / (PANELS - 1); // 0.04, 0.224, 0.408, 0.592, 0.776, 0.96
const STEP = (1 - HOLD * 2) / (PANELS - 1);
/** 第 1～5 格（冰山之後）的時間點：q 以「冰山＝0.04、結尾＝0.96」的尺度寫，換算成實際進度 */
const at = (q: number) => center(1) + ((q - HOLD) * (center(PANELS - 1) - center(1))) / (1 - HOLD * 2);
/** 泱 → 固：鏡頭先停住，水滴與漣漪停下、冰山從水裡長出來（到 RISE_END），之後鏡頭才往右走到「固」 */
const RISE_END = center(0) + 0.09;
/** 固：冰山到位後鏡頭再停一下，讓融水從山上流下來，之後才往「液」走 */
const MELT = 0.035;
const C1 = center(1);

/* 固定亂數：星星、窗戶每次渲染都一樣（避免 SSR / CSR 不一致） */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = rng(7);
const STARS = Array.from({ length: 90 }, () => ({
  x: r1() * 100,
  y: r1() * 55,
  s: 1 + r1() * 2.2,
  d: r1() * 5,
  o: 0.35 + r1() * 0.6,
}));
const r2 = rng(19);
const BUILDINGS = (() => {
  const out: {
    x: number;
    w: number;
    h: number;
    windows: { x: number; y: number; on: boolean; d: number }[];
  }[] = [];
  let x = 20;
  while (x < 780) {
    const w = 38 + Math.floor(r2() * 52);
    const h = 70 + Math.floor(r2() * 190);
    const windows = [];
    for (let wy = 300 - h + 12; wy < 290; wy += 16) {
      for (let wx = x + 7; wx < x + w - 8; wx += 12) {
        windows.push({ x: wx, y: wy, on: r2() > 0.62, d: r2() * 6 });
      }
    }
    out.push({ x, w, h, windows });
    x += w + 4 + Math.floor(r2() * 10);
  }
  return out;
})();
/** 河堤上的路燈 */
const LAMPS = [70, 250, 430, 610, 760];

/* 霧氣（沿用首頁 .states-mist / .states-sway 動畫） */
const MIST = [
  { x: 200, amp: 16, w: 18, o: 0.5, delay: 0, dur: 6.5 },
  { x: 160, amp: 12, w: 12, o: 0.42, delay: 1.6, dur: 7.2 },
  { x: 244, amp: 14, w: 13, o: 0.42, delay: 3.1, dur: 6.8 },
  { x: 128, amp: 10, w: 9, o: 0.32, delay: 4.4, dur: 7.8 },
  { x: 276, amp: 10, w: 10, o: 0.32, delay: 2.4, dur: 8 },
  { x: 214, amp: 18, w: 22, o: 0.28, delay: 5.2, dur: 7.5 },
];

/** 結尾水滴落水後濺起的小水滴（水面座標 600×120，落點中心 300,60）：
 *  dx/dy 落點偏移、h 拋起高度、r 大小、t 飛行秒數、d 起跳延遲；每滴落下後在落點泛起自己的漣漪 */
const SPLASH = [
  { dx: -150, dy: -12, h: 120, r: 4.5, t: 0.95, d: 0 },
  { dx: 125, dy: -18, h: 140, r: 5, t: 1.05, d: 0.02 },
  { dx: -70, dy: 24, h: 80, r: 3.5, t: 0.75, d: 0.04 },
  { dx: 205, dy: 12, h: 100, r: 4, t: 1, d: 0.01 },
  { dx: -225, dy: 14, h: 90, r: 3.5, t: 1.1, d: 0.05 },
  { dx: 55, dy: 30, h: 65, r: 3, t: 0.7, d: 0.03 },
  { dx: -20, dy: -30, h: 170, r: 5.5, t: 1.25, d: 0 },
];

/** 每個畫面的文字：進場時從右側滑入、離場時往左淡出（比畫面本身多一點位移，產生視差） */
function PanelText({ p, i, className = "", children }: { p: MotionValue<number>; i: number; className?: string; children: React.ReactNode }) {
  const c = center(i);
  const first = i === 0;
  const last = i === PANELS - 1;
  // 捲動區間必須落在 0–1 且遞增（motion 會轉成原生 scroll timeline 動畫），頭尾兩格只做單邊
  const x = useTransform(p, first ? [c, c + STEP] : last ? [c - STEP, c] : [c - STEP, c, c + STEP], first ? [0, -140] : last ? [140, 0] : [140, 0, -140]);
  const opacity = useTransform(
    p,
    first ? [c + STEP * 0.3, c + STEP * 0.85] : last ? [c - STEP * 0.85, c - STEP * 0.3] : [c - STEP * 0.85, c - STEP * 0.3, c + STEP * 0.3, c + STEP * 0.85],
    first ? [1, 0] : last ? [0, 1] : [0, 1, 1, 0],
  );
  return (
    <m.div
      style={{ x, opacity }}
      className={`absolute inset-x-4 top-20 sm:inset-x-8 md:left-[8vw] md:right-auto md:top-[16%] md:max-w-md lg:max-w-lg ${className}`}
    >
      {children}
    </m.div>
  );
}

function ChapterHead({ k, en, title, quote, charClass = "" }: { k: string; en: string; title: string; quote: string; charClass?: string }) {
  return (
    <>
      <div className="flex items-end gap-4">
        <span className={`font-serif text-[72px] font-black leading-none md:text-[120px] ${charClass}`}>{k}</span>
        <span className="pb-2 font-mono text-xs tracking-[0.3em] text-dim uppercase md:text-sm">{en}</span>
      </div>
      <p className="mt-3 font-serif text-lg italic leading-relaxed text-moon md:mt-5 md:text-2xl">「{quote}」</p>
      <h3 className="mt-3 text-lg font-bold text-glow md:mt-5 md:text-xl">{title}</h3>
    </>
  );
}

/** 河堤上的城市：大樓（0–300）＋ 河堤步道、欄杆、路燈 ＋ 石砌堤岸（300–340，底邊就是水面） */
function CityShape({ reflection = false }: { reflection?: boolean }) {
  return (
    <>
      {BUILDINGS.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={300 - b.h}
            width={b.w}
            height={b.h}
            fill={reflection ? "#1d3d5c" : "#0d2135"}
            stroke={reflection ? "none" : "#1d3d5c"}
            strokeWidth="1"
          />
          {b.windows.map((w, j) =>
            w.on ? (
              <rect
                key={j}
                x={w.x}
                y={w.y}
                width="5"
                height="7"
                fill="#fde68a"
                opacity=".85"
                className="journey-window"
                style={{ animationDelay: `${w.d}s` }}
              />
            ) : null,
          )}
        </g>
      ))}
      {/* 路燈 */}
      {LAMPS.map((x) => (
        <g key={x}>
          {!reflection && <circle cx={x} cy="262" r="26" fill="url(#j-lamp)" />}
          <line x1={x} x2={x} y1="300" y2="264" stroke="#3b5f80" strokeWidth="2" />
          <circle cx={x} cy="262" r="3.2" fill="#fde68a" />
        </g>
      ))}
      {/* 步道欄杆 */}
      <line x1="0" x2="800" y1="290" y2="290" stroke="#3b5f80" strokeWidth="1.5" />
      {Array.from({ length: 41 }, (_, k) => (
        <line key={k} x1={k * 20} x2={k * 20} y1="290" y2="300" stroke="#3b5f80" strokeWidth="1" />
      ))}
      {/* 石砌河堤：微微斜向水面，上緣一道亮線 */}
      <path d="M-20 300 L820 300 L832 340 L-32 340 Z" fill="url(#j-bank)" />
      <line x1="-20" x2="820" y1="300.5" y2="300.5" stroke="#5b86ad" strokeOpacity=".7" strokeWidth="1.5" />
      <g stroke="#0b1d30" strokeOpacity=".7" strokeWidth="1">
        <line x1="-24" x2="824" y1="313" y2="313" />
        <line x1="-28" x2="828" y1="326" y2="326" />
        {Array.from({ length: 28 }, (_, k) => {
          const row = k % 3;
          const x = Math.floor(k / 3) * 92 + row * 30 - 10;
          const y1 = [300, 313, 326][row];
          return <line key={k} x1={x} x2={x} y1={y1} y2={y1 + 13} />;
        })}
      </g>
      {/* 水線：堤腳碰到水面的一道淡光 */}
      <line x1="-32" x2="832" y1="339" y2="339" stroke="#bae6fd" strokeOpacity=".35" strokeWidth="2" />
    </>
  );
}

export default function StoryJourney({ labelledBy }: { labelledBy?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* 鏡頭往右走：前景 500vw 長卷、背景（星空與遠山）只走一半，形成景深。
     泱（冰山長出來）與固（融水流下）各停一下，其餘每一格的正中央仍對準 center(i) */
  const camStops = [HOLD, RISE_END, C1, C1 + MELT, center(2), center(3), center(4), center(5)];
  const trackX = useTransform(p, camStops, ["0vw", "0vw", "-100vw", "-100vw", "-200vw", "-300vw", "-400vw", "-500vw"]);
  const backX = useTransform(p, camStops, ["0vw", "0vw", "-50vw", "-50vw", "-100vw", "-150vw", "-200vw", "-250vw"]);

  /* 泱 → 固：水滴、漣漪停下 → 冰山慢慢浮現 → 鏡頭右移時冰山滑到「固」的位置（冰山在螢幕固定層，到位後才跟著長卷走） */
  const pondFx = useTransform(p, [center(0), center(0) + 0.03], [1, 0]);
  const iceFade = useTransform(p, [center(0) + 0.01, RISE_END], [0, 1]);
  const iceScale = useTransform(p, [center(0) + 0.01, RISE_END, C1], [0.55, 0.75, 1]);
  const iceShift = useTransform(p, [RISE_END, C1], ["-14%", "0%"]);
  const iceX = useTransform(p, [C1 + MELT, center(2), center(3), center(4), center(5)], ["0vw", "-100vw", "-200vw", "-300vw", "-400vw"]);

  /* 固：使用者繼續往下捲，融水才從泉眼一段段流下山、在山腳濺起水花 */
  const melt1 = useTransform(p, [C1, C1 + 0.01], [0, 1]);
  const melt2 = useTransform(p, [C1 + 0.01, C1 + 0.02], [0, 1]);
  const melt3 = useTransform(p, [C1 + 0.02, C1 + 0.03], [0, 1]);
  const meltBranch = useTransform(p, [C1 + 0.008, C1 + 0.026], [0, 1]);
  const springGlow = useTransform(p, [C1 - 0.012, C1 + 0.004], [0, 1]);
  const meltFx = useTransform(p, [C1 + 0.024, C1 + 0.035], [0, 1]);
  // pathLength 為 0 時圓頭線端仍會留一個點，所以一起把透明度歸零
  const melt1On = useTransform(melt1, (v) => (v > 0.001 ? 1 : 0));
  const melt2On = useTransform(melt2, (v) => (v > 0.001 ? 1 : 0));
  const melt3On = useTransform(melt3, (v) => (v > 0.001 ? 1 : 0));
  const branchOn = useTransform(meltBranch, (v) => (v > 0.001 ? 0.8 : 0));

  /* 液：融水從冰山腳下往右「流出來」，一路流進「液」那一段（前緣永遠走在鏡頭前面一點） */
  const riverReveal = useTransform(p, [C1 + 0.025, C1 + 0.06, C1 + 0.106, C1 + 0.196], [240, 1000, 1600, 5000]);

  /* 泅・涯：霧氣在空中凝成一滴水 → 落下 → 漣漪散開 → 兩個展區 */
  const condense = useTransform(p, [at(0.8), at(0.88)], [1, 0]);
  const condenseScale = useTransform(p, [at(0.8), at(0.88)], [1.4, 0.3]);
  const dropY = useTransform(p, [at(0.86), at(0.935)], ["-46svh", "0svh"]);
  const dropOpacity = useTransform(p, [at(0.85), at(0.87), at(0.93), at(0.945)], [0, 1, 1, 0]);
  const splash = useTransform(p, [at(0.93), at(0.95)], [0, 1]);
  // 主水滴碰到水面的那一刻才「濺開」：水花是依時間播放的動畫（捲動停下也會落完），往回捲就收回
  const [splashed, setSplashed] = useState(false);
  useMotionValueEvent(p, "change", (v) => setSplashed(v >= at(0.935)));
  const finale = useTransform(p, [at(0.93), at(0.98)], [0, 1]);
  const finaleY = useTransform(p, [at(0.93), at(0.98)], [20, 0]);

  /* 底部進度條 */
  const barScale = useTransform(p, [HOLD, 1 - HOLD], [0, 1]);
  const marks = [
    { label: THEME_CHAR, i: 0 },
    { label: "固", i: 1 },
    { label: "液", i: 2 },
    { label: "城", i: 3 },
    { label: "氣", i: 4 },
    { label: zones.map((z) => z.char).join("・"), i: 5 },
  ];
  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + (el.offsetHeight - window.innerHeight) * center(i),
      behavior: "smooth",
    });
  };

  return (
    <section ref={ref} aria-labelledby={labelledBy} className="relative h-[620svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* ══════ 背景層：星空 + 遠山（半速移動） ══════ */}
        <m.div aria-hidden style={{ x: backX }} className="absolute inset-y-0 left-0 w-[350vw]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#071322_0%,#0b192c_55%,#0f2238_100%)]" />
          {STARS.map((s, i) => (
            <span
              key={i}
              className="journey-twinkle absolute rounded-full bg-moon"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.s,
                height: s.s,
                opacity: s.o,
                animationDelay: `${s.d}s`,
              }}
            />
          ))}
          <svg viewBox="0 0 3000 300" preserveAspectRatio="none" className="absolute inset-x-0 bottom-[16%] h-[30%] w-full">
            <path
              d="M0 300 L0 210 C120 170 220 120 330 150 C430 175 520 90 640 110 C760 130 820 200 950 180 C1080 160 1150 70 1290 95 C1420 120 1480 190 1620 175 C1760 160 1830 110 1960 130 C2100 150 2160 210 2300 190 C2440 170 2520 100 2660 120 C2800 140 2880 200 3000 185 L3000 300 Z"
              fill="#12304d"
              opacity=".55"
            />
            <path
              d="M0 300 L0 250 C160 230 260 200 420 215 C580 230 660 180 820 190 C980 200 1080 245 1240 235 C1400 225 1500 185 1660 200 C1820 215 1900 250 2060 240 C2220 230 2320 195 2480 210 C2640 225 2760 250 3000 235 L3000 300 Z"
              fill="#0f2740"
              opacity=".8"
            />
          </svg>
        </m.div>

        {/* ══════ 前景長卷（河）：在冰山後面 ══════ */}
        <m.div aria-hidden style={{ x: trackX }} className="absolute inset-y-0 left-0 w-[600vw]">
          {/* ── 一條連續的河：從「固」右側的冰山腳下開始，流過「液」與城市的河堤，在「氣」的霧裡變細、消失 ──
               座標：0–1000 固、1000–2000 液、2000–3000 城、3000–4000 氣、4000–5000 結尾 */}
          <svg aria-hidden viewBox="0 0 5000 240" preserveAspectRatio="none" className="absolute bottom-0 left-[100vw] h-[24%] w-[500vw]">
            <defs>
              <linearGradient id="j-river" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#e0f2fe" stopOpacity=".95" />
                <stop offset=".2" stopColor="#38bdf8" stopOpacity=".8" />
                <stop offset=".55" stopColor="#0891b2" stopOpacity=".7" />
                <stop offset=".8" stopColor="#5a9fd4" stopOpacity=".45" />
                <stop offset="1" stopColor="#cbd5e1" stopOpacity=".1" />
              </linearGradient>
              <linearGradient id="j-river-depth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity=".18" />
                <stop offset="1" stopColor="#0b192c" stopOpacity=".5" />
              </linearGradient>
              {/* 河水的前緣用漸層淡出，不是一刀切的直線 */}
              <linearGradient id="j-river-edge" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff" />
                <stop offset="1" stopColor="#000" />
              </linearGradient>
              <mask id="j-river-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="5000" height="240">
                <m.rect x="0" y="0" height="240" width={riverReveal} fill="#fff" />
                <m.rect x={riverReveal} y="0" height="240" width="320" fill="url(#j-river-edge)" />
              </mask>
            </defs>
            <g mask="url(#j-river-mask)">
              <path
                id="j-river-shape"
                d="M560 240 C566 170 600 108 660 102 C780 96 880 100 980 98 C1200 86 1500 66 1850 66 C2100 64 2900 64 3100 66 C3350 70 3500 96 3620 150 C3700 186 3760 216 3800 240 Z"
                fill="url(#j-river)"
              />
              <path
                d="M560 240 C566 170 600 108 660 102 C780 96 880 100 980 98 C1200 86 1500 66 1850 66 C2100 64 2900 64 3100 66 C3350 70 3500 96 3620 150 C3700 186 3760 216 3800 240 Z"
                fill="url(#j-river-depth)"
              />
              {/* 流動的水光 */}
              <g fill="none" stroke="#e0f2fe" strokeLinecap="round" vectorEffect="non-scaling-stroke">
                <path
                  className="journey-flow"
                  d="M640 150 C900 128 1500 110 1950 110 C2400 110 2900 110 3200 114 C3450 120 3560 160 3700 214"
                  strokeOpacity=".5"
                  strokeWidth="2"
                  strokeDasharray="60 140"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  className="journey-flow"
                  style={{ animationDuration: "9s" }}
                  d="M900 170 C1200 104 1600 90 2000 92 C2500 92 3000 92 3300 98 C3450 104 3520 130 3580 168"
                  strokeOpacity=".35"
                  strokeWidth="1.5"
                  strokeDasharray="30 170"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  className="journey-flow"
                  style={{ animationDuration: "12s" }}
                  d="M600 220 C900 180 1600 156 2050 156 C2600 156 3100 156 3350 160 C3550 166 3650 196 3740 232"
                  strokeOpacity=".3"
                  strokeWidth="1.5"
                  strokeDasharray="80 220"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
              {/* 河面倒映的星光 */}
              {[1080, 1320, 1560, 1800, 3150, 3350].map((x, i) => (
                <ellipse
                  key={x}
                  cx={x}
                  cy={110 + (i % 3) * 28}
                  rx="22"
                  ry="2"
                  fill="#f8fafc"
                  className="journey-twinkle"
                  style={{ animationDelay: `${i * 0.7}s` }}
                  opacity=".5"
                />
              ))}
            </g>
          </svg>
        </m.div>

        {/* ══════ 冰山（固）：螢幕固定層——從「泱」的水裡長出來，滑到「固」的位置；融水流完後才跟著長卷往左走。
             夾在河（下）與各畫面文字（上）之間，手機上不會蓋住文字 ══════ */}
        <m.div aria-hidden style={{ x: iceX }} className="pointer-events-none absolute inset-0">
          <m.div
            style={{ x: iceShift, scale: iceScale, originX: 0.555, originY: 1 }}
            className="absolute bottom-[14%] right-[4vw] w-[min(80vw,34svh)] md:right-[5vw] md:w-[min(48vw,70svh)]"
          >
            {/* 冰山不是從水裡鑽出來，而是在原地慢慢浮現 */}
            <div>
              <m.div style={{ opacity: iceFade }}>
                <svg viewBox="0 0 400 340" className="block h-auto w-full overflow-visible">
                  <defs>
                    <linearGradient id="j-ice-a" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#f8fcff" />
                      <stop offset=".55" stopColor="#c7e8fb" />
                      <stop offset="1" stopColor="#7dd3fc" />
                    </linearGradient>
                    <linearGradient id="j-ice-b" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#a5d8f3" stopOpacity=".95" />
                      <stop offset="1" stopColor="#0e7490" stopOpacity=".8" />
                    </linearGradient>
                    <linearGradient id="j-ice-back" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#9fc9e4" stopOpacity=".7" />
                      <stop offset="1" stopColor="#3f7ca3" stopOpacity=".55" />
                    </linearGradient>
                    {/* 融水：上游細而亮、下游寬而深 */}
                    <linearGradient id="j-melt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#e0f2fe" />
                      <stop offset="1" stopColor="#38bdf8" />
                    </linearGradient>
                    <filter id="j-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="22" />
                    </filter>
                    <filter id="j-spring" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur stdDeviation="5" />
                    </filter>
                  </defs>
                  <ellipse cx="220" cy="210" rx="190" ry="140" fill="#bae6fd" opacity=".13" filter="url(#j-glow)" />
                  <g strokeLinejoin="round">
                    {/* 後方較矮的副峰 */}
                    <polygon points="8,340 56,262 96,226 138,150 170,204 196,340" fill="url(#j-ice-back)" />
                    <polyline points="138,150 128,214 150,340" fill="none" stroke="#e0f2fe" strokeOpacity=".3" strokeWidth="1.5" />
                    {/* 主峰：左亮面、右暗面 */}
                    <polygon points="52,340 112,240 162,196 222,30 242,100 228,340" fill="url(#j-ice-a)" />
                    <polygon points="222,30 242,100 228,340 392,340 360,270 316,232 280,150" fill="url(#j-ice-b)" />
                    {/* 峰頂積雪 */}
                    <polygon points="222,30 204,82 214,92 224,78 234,96 242,100" fill="#ffffff" opacity=".95" />
                    {/* 切面線 */}
                    <polyline points="162,196 186,240 176,340" fill="none" stroke="#e0f2fe" strokeOpacity=".7" strokeWidth="2" />
                    <polyline points="280,150 266,236 300,340" fill="none" stroke="#e0f2fe" strokeOpacity=".35" strokeWidth="2" />
                    <polyline points="316,232 330,300 352,340" fill="none" stroke="#e0f2fe" strokeOpacity=".25" strokeWidth="1.5" />
                    <path d="M128 256 L160 214" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeOpacity=".8" />
                    <path d="M210 96 L218 66" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeOpacity=".9" />
                  </g>

                  {/* ── 融水河：冰山到位後，使用者繼續往下捲才從泉眼湧出，沿著暗面一段段流下、越流越寬，在山腳匯進河裡 ── */}
                  <m.g style={{ opacity: springGlow }}>
                    <circle cx="244" cy="108" r="9" fill="#e0f2fe" opacity=".8" filter="url(#j-spring)" className="journey-twinkle" />
                  </m.g>
                  <g fill="none" stroke="url(#j-melt)" strokeLinecap="round" strokeLinejoin="round">
                    <m.path d="M244 110 C256 138 240 166 260 194" strokeWidth="4" style={{ pathLength: melt1, opacity: melt1On }} />
                    <m.path d="M260 194 C278 220 264 250 288 276" strokeWidth="7" style={{ pathLength: melt2, opacity: melt2On }} />
                    <m.path d="M288 276 C304 296 304 320 318 340" strokeWidth="11" style={{ pathLength: melt3, opacity: melt3On }} />
                  </g>
                  {/* 亮面上一條較細的支流 */}
                  <m.path
                    d="M174 214 C166 250 182 280 172 306 C166 322 170 332 174 340"
                    fill="none"
                    stroke="url(#j-melt)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ pathLength: meltBranch, opacity: branchOn }}
                  />
                  {/* 流完之後：河面流動的亮點、山腳濕亮的一圈、融水落進河裡的水花 */}
                  <m.g style={{ opacity: meltFx }}>
                    <path
                      d="M244 110 C256 138 240 166 260 194 C278 220 264 250 288 276 C304 296 304 320 318 340"
                      fill="none"
                      stroke="#ffffff"
                      strokeOpacity=".85"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="5 13"
                      className="journey-trickle"
                    />
                    <path
                      d="M174 214 C166 250 182 280 172 306 C166 322 170 332 174 340"
                      fill="none"
                      stroke="#ffffff"
                      strokeOpacity=".7"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeDasharray="4 12"
                      className="journey-trickle"
                      style={{ animationDelay: "0.5s" }}
                    />
                    <ellipse cx="222" cy="340" rx="180" ry="7" fill="#7dd3fc" opacity=".5" />
                    <ellipse cx="318" cy="338" rx="26" ry="6" fill="#e0f2fe" opacity=".55" filter="url(#j-spring)" />
                    {[0, 1].map((i) => (
                      <ellipse
                        key={i}
                        cx="318"
                        cy="340"
                        rx="34"
                        ry="6"
                        fill="none"
                        stroke="#e0f2fe"
                        strokeOpacity=".6"
                        strokeWidth="1.2"
                        className="states-ripple"
                        style={{
                          animationDuration: "2.2s",
                          animationDelay: `${i * 1.1}s`,
                        }}
                      />
                    ))}
                  </m.g>
                  {/* 霜花閃光 */}
                  {[
                    [140, 280],
                    [206, 150],
                    [340, 300],
                    [96, 300],
                  ].map(([x, y], i) => (
                    <g key={i} className="journey-twinkle" style={{ animationDelay: `${i * 1.1}s` }} stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
                      <path d={`M${x - 7} ${y} L${x + 7} ${y} M${x} ${y - 7} L${x} ${y + 7}`} />
                    </g>
                  ))}
                </svg>
              </m.div>
            </div>
          </m.div>
        </m.div>

        {/* ══════ 前景長卷：各畫面的文字與場景 ══════ */}
        <m.div style={{ x: trackX }} className="absolute inset-y-0 left-0 w-[600vw]">
          {/* ━━━━━━ 0. 泱：一滴水落在平靜的水面 ━━━━━━ */}
          <div className="absolute inset-y-0 left-0 w-[100vw]">
            <PanelText p={p} i={0}>
              <p className="eyebrow">{chapters.prologue.en}</p>
              <p className="mt-3 font-serif text-[72px] font-black leading-none text-moon drop-shadow-[0_0_40px_rgba(56,189,248,0.45)] md:text-[120px]">
                {THEME_CHAR}
                <span className="ml-3 align-middle text-2xl italic font-bold text-glow md:text-4xl">Ripple</span>
              </p>
              <p className="mt-3 font-serif text-lg italic leading-relaxed text-moon md:mt-5 md:text-2xl">「{chapters.prologue.quote}」</p>
              <p className="mt-3 text-[15px] leading-[1.9] text-mist/85 md:text-base">{chapters.prologue.text}</p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-glow">
                往下捲，跟著水走 <ArrowRight aria-hidden size={14} />
              </p>
            </PanelText>
            <div
              aria-hidden
              className="absolute bottom-[10%] left-1/2 w-[min(100vw,80svh)] -translate-x-1/2 md:left-auto md:right-[6vw] md:w-[min(46vw,80svh)] md:translate-x-0"
            >
              <svg viewBox="0 0 600 160" className="block h-auto w-full overflow-visible">
                <defs>
                  <radialGradient id="j-still" cx=".5" cy=".5" r=".5">
                    <stop offset="0" stopColor="#38bdf8" stopOpacity=".4" />
                    <stop offset="1" stopColor="#0b192c" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <ellipse cx="300" cy="110" rx="300" ry="50" fill="url(#j-still)" />
                {/* 往下捲進入「固」時，漣漪與水滴先停下來，讓冰山從水裡長出 */}
                <m.g style={{ opacity: pondFx }}>
                  {[0, 1, 2].map((i) => (
                    <ellipse
                      key={i}
                      cx="300"
                      cy="110"
                      rx="270"
                      ry="44"
                      fill="none"
                      stroke="#e0f2fe"
                      strokeOpacity=".7"
                      strokeWidth="1.3"
                      className="states-ripple"
                      style={{
                        animationDuration: "3.6s",
                        animationDelay: `${1.62 + i * 0.45}s`,
                      }}
                    />
                  ))}
                  {/* 水滴：一次次落下，落點正是漣漪的中心 */}
                  <g className="journey-drop">
                    <path d="M300 78 C300 78 310 92 310 97 A10 10 0 0 1 290 97 C290 92 300 78 300 78 Z" fill="#bae6fd" />
                  </g>
                </m.g>
              </svg>
            </div>
          </div>

          {/* ━━━━━━ 1. 固：冰山 ━━━━━━ */}
          <div className="absolute inset-y-0 left-[100vw] w-[100vw]">
            {/* 文字在左、冰山在右：融水從山上流下，在山腳匯進河裡，往右流向下一段「液」 */}
            <PanelText p={p} i={1}>
              <ChapterHead
                k={chapters.solid.key}
                en={chapters.solid.en}
                title={chapters.solid.title}
                quote={chapters.solid.quote}
                charClass="bg-gradient-to-b from-moon to-[#7dd3fc] bg-clip-text text-transparent"
              />
              <p className="mt-2 text-[15px] leading-[1.9] text-mist/85 md:text-base">{chapters.solid.text}</p>
            </PanelText>
          </div>

          {/* ━━━━━━ 2. 液：溪流 ━━━━━━ */}
          <div className="absolute inset-y-0 left-[200vw] w-[100vw]">
            <PanelText p={p} i={2}>
              <ChapterHead
                k={chapters.liquid.key}
                en={chapters.liquid.en}
                title={chapters.liquid.title}
                quote={chapters.liquid.quote}
                charClass="journey-wave text-[#bae6fd]"
              />
              <p className="mt-2 text-[15px] leading-[1.9] text-mist/85 md:text-base">{chapters.liquid.text}</p>
            </PanelText>
          </div>

          {/* ━━━━━━ 3. 城：河堤上的夜晚城市，大樓倒映在河面 ━━━━━━ */}
          <div className="absolute inset-y-0 left-[300vw] w-[100vw]">
            <PanelText p={p} i={3} className="md:left-1/2 md:max-w-xl md:-translate-x-1/2 md:text-center">
              <p className="eyebrow">Through the City</p>
              <p className="mt-4 font-serif text-xl italic leading-relaxed text-moon md:text-3xl">「{chapters.city.caption}」</p>
            </PanelText>
            {/* 底緣對齊河面（河的上緣在這一段約是畫面底部 17.5%） */}
            <div aria-hidden className="absolute bottom-[17.5%] left-1/2 w-[min(120vw,150svh)] -translate-x-1/2 md:w-[min(80vw,140svh)]">
              <svg viewBox="0 0 800 340" className="block h-auto w-full overflow-visible">
                <defs>
                  <linearGradient id="j-bank" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#25496b" />
                    <stop offset="1" stopColor="#132a42" />
                  </linearGradient>
                  <radialGradient id="j-lamp" cx=".5" cy=".5" r=".5">
                    <stop offset="0" stopColor="#fde68a" stopOpacity=".55" />
                    <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <CityShape />
              </svg>
              {/* 倒影：整排大樓連同河堤上下翻轉，貼著水面往下、波紋扭曲、越往下越淡 */}
              <div className="absolute inset-x-0 top-full h-[150%] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_0%,rgba(0,0,0,.55)_35%,transparent_80%)]">
                <svg viewBox="0 0 800 340" className="journey-reflect block h-auto w-full -scale-y-100 opacity-40">
                  <defs>
                    <filter id="j-reflect" x="0" y="0" width="100%" height="100%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="2" seed="4" result="n" />
                      <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                  </defs>
                  <g filter="url(#j-reflect)">
                    <CityShape reflection />
                  </g>
                </svg>
                {/* 水面上斷續的反光橫紋 */}
                <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                  {[24, 46, 70, 96, 124].map((y, i) => (
                    <line
                      key={y}
                      x1={60 + i * 40}
                      x2={740 - i * 30}
                      y1={y}
                      y2={y}
                      stroke="#0b192c"
                      strokeWidth={3 + i}
                      strokeDasharray={`${40 + i * 10} ${18 + i * 6}`}
                      opacity=".55"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>

          {/* ━━━━━━ 4. 氣：蒸發成霧 ━━━━━━ */}
          <div className="absolute inset-y-0 left-[400vw] w-[100vw]">
            <PanelText p={p} i={4}>
              <ChapterHead
                k={chapters.gas.key}
                en={chapters.gas.en}
                title={chapters.gas.title}
                quote={chapters.gas.quote}
                charClass="journey-breathe text-moon/90"
              />
              <p className="mt-2 text-[15px] leading-[1.9] text-mist/85 md:text-base">{chapters.gas.text}</p>
            </PanelText>
            <svg
              aria-hidden
              viewBox="0 0 400 340"
              className="absolute bottom-[10%] right-[4vw] w-[min(70vw,40svh)] overflow-visible md:right-[10vw] md:w-[min(42vw,62svh)]"
            >
              <defs>
                <filter id="j-mist" x="-60%" y="-40%" width="220%" height="180%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
              </defs>
              <g fill="none" stroke="#e2e8f0" strokeLinecap="round" filter="url(#j-mist)">
                {MIST.map((w, i) => (
                  <g
                    key={i}
                    className="states-mist"
                    style={{
                      animationDelay: `${w.delay}s`,
                      animationDuration: `${w.dur}s`,
                    }}
                  >
                    <g className="states-sway" style={{ animationDelay: `${w.delay * 0.7}s` }}>
                      <path d={`M${w.x} 330 c-${w.amp} -24 ${w.amp} -46 0 -70 c-${w.amp} -24 ${w.amp} -46 0 -70`} strokeWidth={w.w} strokeOpacity={w.o} />
                    </g>
                  </g>
                ))}
              </g>
            </svg>
          </div>

          {/* ━━━━━━ 5. 泅・涯：一滴水落下、漣漪散開成兩個展區 ━━━━━━ */}
          <div className="absolute inset-y-0 left-[500vw] w-[100vw]">
            {/* 天上那團霧收攏成一滴水 */}
            <m.div
              aria-hidden
              style={{ opacity: condense, scale: condenseScale }}
              className="absolute left-1/2 top-[22%] h-24 w-40 -translate-x-1/2 rounded-full bg-mist/25 blur-2xl"
            />
            {/* 平靜的水面 */}
            <svg aria-hidden viewBox="0 0 600 120" className="absolute bottom-[6%] left-1/2 w-[min(110vw,90svh)] -translate-x-1/2 overflow-visible">
              <defs>
                <radialGradient id="j-pool" cx=".5" cy=".5" r=".5">
                  <stop offset="0" stopColor="#38bdf8" stopOpacity=".45" />
                  <stop offset="1" stopColor="#0b192c" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="300" cy="60" rx="300" ry="56" fill="url(#j-pool)" />
              <m.g style={{ opacity: splash }}>
                {[0, 1, 2, 3].map((i) => (
                  <ellipse
                    key={i}
                    cx="300"
                    cy="60"
                    rx="280"
                    ry="50"
                    fill="none"
                    stroke="#e0f2fe"
                    strokeOpacity=".7"
                    strokeWidth="1.3"
                    className="states-ripple"
                    style={{
                      animationDelay: `${i * 0.9}s`,
                      animationDuration: "3.6s",
                    }}
                  />
                ))}
              </m.g>
              {/* 水花：落點冒起一圈水冠，好幾滴往外拋、灑落回水面，各自泛起漣漪 */}
              {splashed && (
                <g>
                  <ellipse cx="300" cy="60" rx="34" ry="8" fill="#e0f2fe" className="journey-crown" />
                  {SPLASH.map((s, i) => {
                    const land = s.d + s.t;
                    return (
                      <g key={i}>
                        {/* 落點的漣漪（水滴落下那一刻才出現，之後持續一圈圈推開） */}
                        <g className="journey-show" style={{ animationDelay: `${land}s` }}>
                          {[0, 1].map((k) => (
                            <ellipse
                              key={k}
                              cx={300 + s.dx}
                              cy={60 + s.dy}
                              rx={50 + s.r * 10}
                              ry={(50 + s.r * 10) * 0.2}
                              fill="none"
                              stroke="#e0f2fe"
                              strokeOpacity=".6"
                              strokeWidth="1.1"
                              className="states-ripple"
                              style={{ animationDuration: `${2.6 + (i % 3) * 0.5}s`, animationDelay: `${land + k * 1.3}s` }}
                            />
                          ))}
                        </g>
                        {/* 拋物線：水平等速、垂直先上後下 */}
                        <g className="journey-splash-x" style={{ "--dx": `${s.dx}px`, animationDuration: `${s.t}s`, animationDelay: `${s.d}s` } as React.CSSProperties}>
                          <g
                            className="journey-splash-y"
                            style={{ "--h": `${-s.h}px`, "--dy": `${s.dy}px`, animationDuration: `${s.t}s`, animationDelay: `${s.d}s` } as React.CSSProperties}
                          >
                            <circle cx="300" cy="60" r={s.r} fill="#bae6fd" />
                          </g>
                        </g>
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
            {/* 水滴 */}
            <m.div aria-hidden style={{ y: dropY, opacity: dropOpacity }} className="absolute bottom-[calc(6%_+_min(110vw,90svh)_*_0.1)] left-1/2 -ml-2.5">
              <svg viewBox="0 0 20 28" className="h-7 w-5 drop-shadow-[0_0_10px_rgba(56,189,248,.8)]">
                <path d="M10 0 C10 0 20 14 20 19 A10 10 0 0 1 0 19 C0 14 10 0 10 0 Z" fill="#bae6fd" />
              </svg>
            </m.div>
            {/* 結尾：漣漪散開成兩個展區 */}
            <m.div style={{ opacity: finale, y: finaleY }} className="absolute inset-x-4 top-[12%] text-center sm:inset-x-8 md:top-[14%]">
              <p className="eyebrow">Two Zones</p>
              <h3 className="mt-2 font-serif text-2xl font-bold text-moon md:text-4xl">{chapters.zones.title}</h3>
              <p className="mx-auto mt-3 max-w-xl font-serif text-sm italic leading-relaxed text-mist md:mt-4 md:text-lg">「{chapters.zones.quote}」</p>
              <ul className="mx-auto mt-5 grid max-w-2xl grid-cols-2 gap-3 md:mt-8 md:gap-5">
                {zones.map((z) => (
                  <li key={z.slug}>
                    <Link
                      href={zonePath(z)}
                      className="card group flex h-full flex-col items-center px-3 py-4 transition-colors hover:border-[color:var(--zone)] md:px-6 md:py-6"
                      style={
                        {
                          "--zone": `${z.color}99`,
                          borderColor: `${z.color}55`,
                        } as React.CSSProperties
                      }
                    >
                      <span className="font-serif text-[56px] font-black leading-none md:text-[88px]" style={{ color: z.color }}>
                        {z.char}
                      </span>
                      <span className="mt-2 text-sm font-bold text-moon md:text-base">{zoneName(z)}</span>
                      <span className="mt-1 text-xs text-dim md:text-sm">{z.subtitle}</span>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-glow group-hover:underline md:text-sm">
                        走進展區 <ArrowRight aria-hidden size={13} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <a href="#zones" className="mt-4 inline-flex items-center gap-1 text-sm text-glow hover:underline">
                往下看展區介紹 <ArrowDown aria-hidden size={14} />
              </a>
            </m.div>
          </div>
        </m.div>

        {/* ══════ 底部進度條 ══════ */}
        <nav aria-label="三態故事線段落" className="absolute inset-x-4 bottom-4 sm:inset-x-8 md:inset-x-[8vw] md:bottom-6">
          <div className="relative h-px bg-white/15">
            <m.div style={{ scaleX: barScale, originX: 0 }} className="absolute inset-0 bg-glow" />
          </div>
          <ol className="relative mt-1 h-10">
            {marks.map((mk) => (
              <li key={mk.label} className="absolute -translate-x-1/2" style={{ left: `${(mk.i / (PANELS - 1)) * 100}%` }}>
                <button
                  type="button"
                  onClick={() => jump(mk.i)}
                  className="grid h-10 min-w-10 place-items-center whitespace-nowrap px-1 font-serif text-sm text-dim transition-colors hover:text-moon"
                >
                  {mk.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </section>
  );
}
