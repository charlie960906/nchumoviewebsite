"use client";

import { useState } from "react";
import { Expand, Map as MapIcon } from "lucide-react";

/**
 * 3D／2D 場地互動地圖（獨立專案，位於 /public/map/index.html）。
 * 為了不拖慢首屏與低階裝置，預設只顯示佔位卡片，使用者點擊後才載入 iframe。
 */
export default function MapEmbed({ tall = false }: { tall?: boolean }) {
  const [on, setOn] = useState(false);
  return (
    <div className={`card relative overflow-hidden ${tall ? "h-[70vh] min-h-[480px]" : "h-[420px] md:h-[520px]"}`}>
      {on ? (
        <>
          <iframe
            src="/map/index.html"
            title="興大國際星空電影節 3D／2D 場地互動地圖"
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            allow="fullscreen"
          />
          <a
            href="/map/index.html"
            target="_blank"
            rel="noopener"
            className="btn btn-ghost btn-sm absolute bottom-3 right-3 !bg-night/80 backdrop-blur"
          >
            <Expand aria-hidden size={15} />
            全螢幕開啟
          </a>
        </>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(60%_60%_at_50%_40%,rgba(8,145,178,0.28),transparent)] p-6 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(56,189,248,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,.14)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_50%_45%,black,transparent_70%)]" />
          <div className="relative">
            <MapIcon aria-hidden size={40} className="mx-auto text-glow" />
            <p className="mt-4 font-serif text-xl font-bold">場地互動地圖</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-dim">
              可切換 3D／2D 檢視，查看 22 個市集攤位、舞台、放映區與「傍、佮、佇、佗」四個展區的位置。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn btn-primary" onClick={() => setOn(true)}>
                載入互動地圖
              </button>
              <a href="/map/index.html" target="_blank" rel="noopener" className="btn btn-ghost">
                <Expand aria-hidden size={17} />
                另開全螢幕
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
