"use client";

import { motion, useReducedMotion } from "motion/react";

/** 路由切換過場：內容由下輕微上浮 + 淡入（380ms，水波阻尼曲線）。 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
