"use client";

import { useEffect } from "react";
import { trackFromElement } from "@/lib/track";

/** 全站監聽帶有 data-track 屬性的元素點擊，轉成 GA4 自訂事件（見 src/lib/track.ts）。 */
export default function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (el) trackFromElement(el);
    };
    // capture：搶在 Luma 等第三方腳本攔截點擊之前記錄
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
