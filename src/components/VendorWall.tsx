"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { vendors, type Vendor } from "@/lib/vendors";

const CLOSE_MS = 240;
/** 品牌牆固定格數（5 × 4） */
const SLOTS = 20;

/** 品牌照片；還沒有照片（vendors.ts 未填 image）時以攤名文字代替 */
function Photo({ v, sizes, big }: { v: Vendor; sizes: string; big?: boolean }) {
  return v.image ? (
    <Image src={encodeURI(v.image)} alt={v.name} fill sizes={sizes} className="object-cover" />
  ) : (
    <span
      aria-hidden
      className={`absolute inset-0 grid place-items-center px-2 text-center font-serif font-black leading-snug text-moon/80 ${big ? "text-4xl" : "text-sm sm:text-lg"}`}
    >
      {v.name}
    </span>
  );
}

/**
 * 市集攤商品牌牆：像百貨公司的品牌看板，只放品牌照片。
 * 固定 20 格：寬版 5 欄 × 4 列，手機 4 欄 × 5 列；已確定的攤商排前面，其餘格子顯示「敬請期待」。
 * 點照片開啟攤商詳情（可用左右鍵切換上一攤／下一攤）。
 */
export default function VendorWall() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [shown, setShown] = useState(false);

  const open = (i: number, el: HTMLElement) => {
    triggerRef.current = el;
    setIndex(i);
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    requestAnimationFrame(() => setShown(true));
    document.documentElement.style.overflow = "hidden";
  };

  const close = useCallback(() => {
    setShown(false);
    window.setTimeout(() => {
      dialogRef.current?.close();
      document.documentElement.style.overflow = "";
      triggerRef.current?.focus();
    }, CLOSE_MS);
  }, []);

  const step = (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + vendors.length) % vendors.length));

  // Esc：改為帶動畫的關閉
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      close();
    };
    d.addEventListener("cancel", onCancel);
    return () => d.removeEventListener("cancel", onCancel);
  }, [close]);

  useEffect(() => () => void (document.documentElement.style.overflow = ""), []);

  const v = index === null ? null : vendors[index];

  return (
    <>
      <ul aria-label="市集攤商" className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">
        {vendors.map((x, i) => (
          <li key={x.id}>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={`${x.name}（查看詳情）`}
              onClick={(e) => open(i, e.currentTarget)}
              className="group relative block aspect-square w-full overflow-hidden rounded-md border border-white/10 bg-night-3 outline-none transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-glow/60 focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-night"
            >
              <span className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                <Photo v={x} sizes="(min-width: 640px) 20vw, 25vw" />
              </span>
            </button>
          </li>
        ))}
        {Array.from({ length: Math.max(0, SLOTS - vendors.length) }, (_, i) => (
          <li key={`soon-${i}`} aria-hidden>
            <span className="grid aspect-square place-items-center rounded-md border border-dashed border-white/10 font-mono text-[10px] tracking-[0.2em] text-dim/70 sm:text-xs">
              敬請期待
            </span>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-labelledby="vendor-dialog-name"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-mist backdrop:bg-transparent"
      >
        {/* 背景：模糊 + 壓暗；點擊關閉 */}
        <div aria-hidden data-shown={shown} onClick={close} className="underwater absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center p-4">
          <div
            className={[
              "pointer-events-auto relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-glow/15 bg-night-2 shadow-[0_0_80px_-20px_rgb(0_0_0/0.8)]",
              "transition-[opacity,transform] duration-200 ease-[var(--ease-ripple)]",
              shown ? "scale-100 opacity-100" : "scale-95 opacity-0",
            ].join(" ")}
          >
            {v && (
              <>
                <div className="relative aspect-[4/3] w-full bg-night-3">
                  <Photo v={v} sizes="(min-width: 480px) 28rem, 92vw" big />
                </div>
                <div className="p-6">
                  <p className="flex items-center gap-3">
                    {v.booth && <span className="font-mono text-xs tracking-[0.2em] text-glow">BOOTH {v.booth}</span>}
                    <span className="tag">{v.category}</span>
                  </p>
                  <h2 id="vendor-dialog-name" className="mt-3 font-serif text-2xl font-black text-moon">
                    {v.name}
                  </h2>
                  {(v.description ?? [v.summary]).map((t, i) => (
                    <p key={i} className="mt-3 text-[15px] leading-relaxed text-mist/90">
                      {t}
                    </p>
                  ))}
                  {v.links && v.links.length > 0 && (
                    <p className="mt-5 flex flex-wrap gap-2">
                      {v.links.map((l) => (
                        <a key={l.href} href={l.href} target="_blank" rel="noopener" className="btn btn-ghost">
                          {l.label} <ExternalLink aria-hidden size={16} />
                        </a>
                      ))}
                    </p>
                  )}
                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <button type="button" onClick={() => step(-1)} className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-glow hover:text-moon">
                      <ChevronLeft aria-hidden size={18} /> 上一攤
                    </button>
                    <span className="font-mono text-xs text-dim">
                      {index! + 1} / {vendors.length}
                    </span>
                    <button type="button" onClick={() => step(1)} className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-glow hover:text-moon">
                      下一攤 <ChevronRight aria-hidden size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
            <button
              type="button"
              onClick={close}
              aria-label="關閉"
              className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-night/80 text-moon backdrop-blur hover:bg-night"
            >
              <X aria-hidden size={20} />
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
