"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

/** 直接跳到頁首（不做平滑捲動，避免長頁面先閃過中段內容）。 */
function jumpToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

/** 平滑捲回頁首（使用者偏好減少動態時改為直接跳）。 */
function scrollToTopSmooth() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, left: 0, behavior: reduced ? "instant" : "smooth" });
}

/** 比對路徑時忽略結尾斜線與 .html（靜態輸出時網址可能帶 .html）。 */
function normalizePath(path: string) {
  return path.replace(/\.html$/, "").replace(/\/index$/, "/").replace(/(.)\/$/, "$1");
}

/**
 * 點選任何頁面都直接跳到頁首。
 * Next 內建的換頁捲動會被 html 的 smooth scroll 與 template 進場位移干擾，所以自己處理：
 * - 換到別頁：在新頁面繪製前就跳到頁首（useLayoutEffect），柔和感交給 template 的淡入。
 * - 點擊指向「目前這一頁」的連結（例如在 /team#crew-xxx 時點選單的「團隊成員」）：pathname 不變，
 *   在點擊時處理，改用平滑捲動回到頁首（已在頁首則不動）。
 * - 直接開啟或重新整理頁面：關掉瀏覽器的捲動位置還原，同樣從頁首開始。
 * 例外：帶 #錨點 的連結（交給瀏覽器捲到該區塊）。
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // 不讓瀏覽器在重新整理／上一頁時還原舊的捲動位置
    history.scrollRestoration = "manual";
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || normalizePath(url.pathname) !== normalizePath(window.location.pathname) || url.hash) return;
      // 等 Next 處理完同頁導覽（清掉 #hash）後再平滑捲回頁首
      setTimeout(scrollToTopSmooth, 0);
    };
    // capture：Next 的 <Link> 會先 preventDefault，所以要在它之前攔到點擊
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (window.location.hash) return;
    jumpToTop();
  }, [pathname]);

  return null;
}
