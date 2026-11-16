"use client";

import { useEffect } from "react";
import { m, useReducedMotion } from "motion/react";

/** 首次載入不做過場：避免靜態 HTML 以 opacity:0 輸出、等 JS 水合後才顯示（拖慢 LCP）。 */
let hydrated = false;

/** 路由切換過場：內容由下輕微上浮 + 淡入（380ms，水波阻尼曲線）。 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const animateIn = hydrated && !reduced;
  useEffect(() => {
    hydrated = true;
  }, []);
  return (
    <m.div
      initial={animateIn ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}
