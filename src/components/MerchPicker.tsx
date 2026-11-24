"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, SkipBack, SkipForward } from "lucide-react";
import { merch } from "@/lib/content";

/** 影展周邊挑選：左右切換商品。merch 為空時顯示「即將公開」預留畫面。 */
export default function MerchPicker() {
  const n = merch.length;
  const [idx, setIdx] = useState(0);
  const item = n ? merch[idx] : null;
  const go = (d: number) => n && setIdx((i) => (i + d + n) % n);

  return (
    <div className="reveal flex h-full flex-col" aria-roledescription="輪播" role="region" aria-label="影展周邊">
      <p className="eyebrow">Merch · 影展周邊</p>

      <div className="mt-4 grid flex-1 grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={n < 2}
          aria-label="上一個周邊"
          className="grid h-11 w-11 place-items-center rounded-md text-moon hover:bg-white/10 disabled:opacity-30"
        >
          <SkipBack aria-hidden size={26} fill="currentColor" />
        </button>

        <div className="mx-auto w-full max-w-[300px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-white/10 bg-night-3">
            {item ? (
              <Image src={item.image} alt={item.name} fill sizes="300px" className="object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-[repeating-linear-gradient(135deg,rgba(140,196,236,.06)_0_12px,transparent_12px_24px)] text-center">
                <div>
                  <ShoppingBag aria-hidden size={40} className="mx-auto text-glow" />
                  <p className="mt-4 font-serif text-xl">周邊即將公開</p>
                  <p className="mt-1 font-mono text-xs tracking-[0.2em] text-dim">COMING SOON</p>
                </div>
              </div>
            )}
          </div>
          <p className="mt-5 text-xl tracking-[0.2em] text-moon" aria-live="polite">
            {item ? item.name : "敬請期待"}
          </p>
          <p className="mt-3 text-right font-mono text-xl tracking-[0.15em] text-mist">{item ? `NTD $${item.price}` : "NTD $ ——"}</p>
          {n > 1 && (
            <p className="mt-2 text-center font-mono text-xs text-dim">
              {idx + 1} / {n}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          disabled={n < 2}
          aria-label="下一個周邊"
          className="grid h-11 w-11 place-items-center rounded-md text-moon hover:bg-white/10 disabled:opacity-30"
        >
          <SkipForward aria-hidden size={26} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
