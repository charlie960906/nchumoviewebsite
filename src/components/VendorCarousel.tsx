"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { vendors, vendorsAreSample } from "@/lib/vendors";
import VendorCard from "./VendorCard";

/**
 * 攤商介紹輪播：寬版一次三張、平板兩張、手機一張（露出下一張邊緣提示可滑）。
 * 以原生 scroll-snap 實作，觸控可直接滑動；左右鍵一次翻一整頁。
 */
export default function VendorCarousel() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [range, setRange] = useState({ first: 1, last: 3 });
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const left = el.scrollLeft;
    const right = left + el.clientWidth;
    let first = 0;
    let last = 0;
    items.forEach((li, i) => {
      // ul 設為 relative，li.offsetLeft 即相對於軌道起點
      const a = li.offsetLeft;
      const b = a + li.offsetWidth;
      // 卡片露出超過一半才算「看得到」
      if (Math.min(b, right) - Math.max(a, left) > li.offsetWidth / 2) {
        if (!first) first = i + 1;
        last = i + 1;
      }
    });
    setRange({ first: first || 1, last: last || 1 });
    setEdge({ start: left <= 2, end: left + el.clientWidth >= el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="市集攤商"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); page(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); page(-1); }
      }}
    >
      <p className="font-mono text-sm text-dim" aria-live="polite">
        <span className="text-moon">{range.first === range.last ? pad(range.first) : `${pad(range.first)}–${pad(range.last)}`}</span> / {pad(vendors.length)} 攤
        {vendorsAreSample && <span className="tag tag-warn ml-3 align-middle">示意資料</span>}
      </p>

      <div className="relative mt-4">
      <ul
        ref={trackRef}
        tabIndex={0}
        className="vendor-track relative flex snap-x snap-mandatory gap-5 overflow-x-auto pt-1 pb-4 outline-none focus-visible:ring-2 focus-visible:ring-glow/60"
      >
        {vendors.map((v, i) => (
          <li
            key={v.booth}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${vendors.length}：${v.name}`}
            className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <VendorCard vendor={v} />
          </li>
        ))}
      </ul>

        {/* 左右箭頭：垂直置中於卡片（扣掉捲軸下方 pb-4），寬螢幕放在卡片外側，較窄時壓在卡片邊緣 */}
        <button
          type="button"
          onClick={() => page(-1)}
          disabled={edge.start}
          aria-label="上一頁攤商"
          className="vendor-arrow -left-4 md:-left-5 xl:-left-16"
        >
          <ChevronLeft aria-hidden size={22} />
        </button>
        <button
          type="button"
          onClick={() => page(1)}
          disabled={edge.end}
          aria-label="下一頁攤商"
          className="vendor-arrow -right-4 md:-right-5 xl:-right-16"
        >
          <ChevronRight aria-hidden size={22} />
        </button>
      </div>
    </div>
  );
}
