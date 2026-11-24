"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 機械翻頁板（split-flap）文字：數字以翻牌格呈現，`animate` 為 true 時
 * 每格先翻過幾張隨機數字再停在目標字。非數字（「:」等）不做翻牌格。
 * 實際文字以 sr-only 提供給螢幕閱讀器與搜尋引擎，翻牌格本身 aria-hidden。
 */
export default function SplitFlap({ text, animate = false, delay = 0 }: { text: string; animate?: boolean; delay?: number }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="flap-row">
        {[...text].map((ch, i) =>
          /\d/.test(ch) ? (
            <FlapChar key={i} target={ch} animate={animate} delay={delay + i * 45} />
          ) : (
            <span key={i} className="flap-sep">
              {ch}
            </span>
          ),
        )}
      </span>
    </>
  );
}

const STEP_MS = 110; // 與 globals.css 的 --flap-half（55ms）對應：一次翻牌＝上半落下＋下半翻上
const rand = () => String(Math.floor(Math.random() * 10));

function FlapChar({ target, animate, delay }: { target: string; animate: boolean; delay: number }) {
  // cur：目前顯示的字；prev：翻牌前的字；flip：每翻一次 +1，當作 key 讓動畫重新播放
  const [state, setState] = useState(() => ({ cur: animate ? rand() : target, prev: target, flip: 0 }));
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!animate) return;
    const steps = [...Array.from({ length: 3 + Math.floor(Math.random() * 3) }, rand), target];
    steps.forEach((ch, n) => {
      timers.current.push(
        window.setTimeout(() => setState((s) => ({ cur: ch, prev: s.cur, flip: s.flip + 1 })), delay + n * STEP_MS),
      );
    });
    const list = timers.current;
    return () => {
      list.forEach(clearTimeout);
      list.length = 0;
    };
  }, [animate, target, delay]);

  const { cur, prev, flip } = state;
  const flipping = flip > 0;

  return (
    <span className="flap">
      {/* 佔位，決定格子大小 */}
      <span className="flap-sizer">{cur}</span>
      {/* 底層：上半是新字（被翻下的舊上半露出），下半是舊字（等新下半翻上來蓋住） */}
      <span className="flap-half flap-top">{cur}</span>
      <span className="flap-half flap-bottom">{flipping ? prev : cur}</span>
      {flipping && (
        <span key={flip}>
          <span className="flap-half flap-top flap-fall">{prev}</span>
          <span className="flap-half flap-bottom flap-rise">{cur}</span>
        </span>
      )}
      <span className="flap-hinge" />
    </span>
  );
}
