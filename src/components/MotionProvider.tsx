"use client";

import { LazyMotion, domAnimation } from "motion/react";

/** 以 LazyMotion 只載入 domAnimation 功能集，搭配 `m.*` 元件縮小 motion 打包體積。 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
