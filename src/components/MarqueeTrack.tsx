"use client";

import { useEffect, useRef } from "react";

/**
 * 跑馬燈軌道：內容需已重複兩份（前半＝後半），整條往左慢慢移動，移滿一半就無縫接回。
 * - 滑鼠／觸控可左右拖拉，往前或往後移動；放開後繼續自動播放
 * - 滑鼠移入或鍵盤聚焦時暫停自動播放
 * - 系統開啟「減少動態效果」時不自動播放，但仍可拖拉
 * 拖拉超過 6px 視為拖曳，不觸發卡片連結點擊。
 */
export default function MarqueeTrack({
  children,
  reflection,
  seconds = 48,
}: {
  children: React.ReactNode;
  /** 水面倒影：另一份同樣的卡片，上下翻轉後以 SVG 波紋濾鏡扭曲，跟著主軌道同步移動 */
  reflection?: React.ReactNode;
  seconds?: number;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const mirrorRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = ref.current;
    const root = el?.parentElement;
    if (!el || !root) return;

    let x = 0;
    let hover = false;
    let focus = false;
    let drag: { id: number; startX: number; startOffset: number; moved: boolean } | null = null;
    let suppressClick = false;
    let last = performance.now();
    let raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const half = () => el.scrollWidth / 2;
    const wrap = () => {
      const h = half();
      if (!h) return;
      x = ((x % h) + h) % h - h; // 永遠落在 (-h, 0]
    };
    const paint = () => {
      const t = `translate3d(${x}px,0,0)`;
      el.style.transform = t;
      if (mirrorRef.current) mirrorRef.current.style.transform = t;
    };

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100);
      last = now;
      if (!drag && !hover && !focus && !reduce.matches && !document.hidden) {
        x -= (half() / (seconds * 1000)) * dt;
        wrap();
        paint();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { id: e.pointerId, startX: e.clientX, startOffset: x, moved: false };
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.startX;
      if (!drag.moved && Math.abs(dx) > 6) {
        drag.moved = true;
        root.setPointerCapture(e.pointerId);
        root.classList.add("is-dragging");
      }
      if (drag.moved) {
        x = drag.startOffset + dx;
        wrap();
        paint();
      }
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      suppressClick = drag.moved;
      drag = null;
      root.classList.remove("is-dragging");
      last = performance.now();
    };
    // 拖曳結束後吃掉那一次 click，避免放開時誤開卡片連結
    const click = (e: MouseEvent) => {
      if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; }
    };
    const noNativeDrag = (e: DragEvent) => e.preventDefault();
    const enter = () => { hover = true; };
    const leave = () => { hover = false; };
    const fin = () => { focus = true; };
    const fout = () => { focus = root.contains(document.activeElement); };
    // 鍵盤聚焦到被遮罩淡出的卡片時，把它捲到可視區中間附近
    const focusIn = (e: FocusEvent) => {
      fin();
      const li = (e.target as HTMLElement).closest("li");
      if (!li) return;
      const r = root.getBoundingClientRect();
      const c = li.getBoundingClientRect();
      const target = r.left + r.width / 2 - c.width / 2;
      x += target - c.left;
      wrap();
      paint();
    };

    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
    root.addEventListener("click", click, true);
    root.addEventListener("dragstart", noNativeDrag);
    root.addEventListener("mouseenter", enter);
    root.addEventListener("mouseleave", leave);
    root.addEventListener("focusin", focusIn);
    root.addEventListener("focusout", fout);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
      root.removeEventListener("click", click, true);
      root.removeEventListener("dragstart", noNativeDrag);
      root.removeEventListener("mouseenter", enter);
      root.removeEventListener("mouseleave", leave);
      root.removeEventListener("focusin", focusIn);
      root.removeEventListener("focusout", fout);
    };
  }, [seconds]);

  return (
    <>
      <ul ref={ref} className="program-marquee-track">
        {children}
      </ul>
      {reflection && (
        <div className="marquee-reflection" aria-hidden inert>
          {/* 波紋濾鏡：fractalNoise 做水平拉長的雜訊，位移圖把倒影扭成水波；baseFrequency 緩慢變化讓水面晃動 */}
          <svg width="0" height="0" className="absolute" focusable="false">
            <filter id="marquee-ripple" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.006 0.07" numOctaves="2" seed="7" result="noise">
                <animate attributeName="baseFrequency" dur="9s" values="0.006 0.07;0.008 0.09;0.006 0.07" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
          <div className="marquee-reflection-flip">
            <ul ref={mirrorRef} className="program-marquee-track">
              {reflection}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
