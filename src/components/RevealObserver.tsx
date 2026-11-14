"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * 滾動敘事：以單一 IntersectionObserver 觸發 .reveal 區塊的進場動畫，
 * 避免一次全部播放。新節點（路由切換、動態內容）以 MutationObserver 補登記。
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => io.observe(el));
    scan();
    // 保險：若 IntersectionObserver 遲遲未回報（例如分頁在背景載入），仍確保首屏內容可見
    const failsafe = setTimeout(() => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
      });
    }, 1500);
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      clearTimeout(failsafe);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
