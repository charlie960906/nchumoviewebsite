"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Tabs sliding（transitions.dev）：一顆膠囊（className 含 t-tabs-pill）依選中項目的
 * offsetLeft／offsetWidth 定位，由 globals.css 的 CSS transition 在新舊位置間滑動。
 * 首次定位、視窗 resize、字型載入完成時不帶動畫直接定位；之後 activeKey 改變就滑過去。
 * 用於時間表日期切換（Schedule）與團隊頁部門錨點列（TeamAnchorBar）。
 */
export function useSlidingPill(activeKey: string | undefined) {
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});
  const [ready, setReady] = useState(false);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const place = (animate: boolean) => {
      const tab = activeKey ? tabRefs.current[activeKey] : null;
      const pill = pillRef.current;
      if (!tab || !pill) return;
      if (!animate) pill.style.transition = "none";
      pill.style.transform = `translateX(${tab.offsetLeft}px)`;
      pill.style.width = `${tab.offsetWidth}px`;
      if (!animate) {
        void pill.offsetWidth; // 強制 reflow，讓位置先到位再恢復 transition
        pill.style.transition = "";
      }
    };

    place(placed.current);
    if (!placed.current) {
      placed.current = true;
      setReady(true);
      document.fonts?.ready.then(() => place(false));
    }
    const onResize = () => place(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeKey]);

  /** 綁在每個選項上：ref={tabRef(key)} */
  const tabRef = (key: string) => (el: HTMLElement | null) => {
    tabRefs.current[key] = el;
  };

  return { pillRef, tabRef, ready };
}
