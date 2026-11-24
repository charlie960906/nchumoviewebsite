"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Maximize2, Map as MapIcon, RotateCw } from "lucide-react";

// three.js 與整個地圖只在使用者按下「載入」時才下載
const VenueMap = dynamic(() => import("./venue/VenueMap"), { ssr: false });

type Status = "idle" | "loading" | "ready" | "error";

/**
 * 3D／2D 場地互動地圖。
 * 為了不拖慢首屏與低階裝置，預設只顯示佔位卡片，使用者點擊後才載入地圖；
 * 載入期間顯示「載入中」過場，等場景畫出第一個畫面後再淡出。
 */
export default function MapEmbed({ tall = false }: { tall?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [attempt, setAttempt] = useState(0);
  const [expand, setExpand] = useState(false);

  const start = (full = false) => {
    setExpand(full);
    setAttempt((n) => n + 1);
    setStatus("loading");
  };

  const active = status !== "idle";
  const showOverlay = status === "loading" || status === "error";

  return (
    <div className={`card relative overflow-hidden bg-night ${tall ? "h-[70vh] min-h-[480px]" : "h-[480px] md:h-[580px]"}`}>
      {active && status !== "error" && (
        <div className={`absolute inset-0 transition-opacity duration-700 ${status === "ready" ? "opacity-100" : "opacity-0"}`}>
          <VenueMap
            key={attempt}
            startExpanded={expand}
            onReady={() => setStatus("ready")}
            onError={() => setStatus("error")}
          />
        </div>
      )}

      {/* 載入中過場：與佔位卡片同一套背景，平順地交棒給地圖 */}
      {active && (
        <div
          role="status"
          aria-live="polite"
          aria-hidden={!showOverlay}
          className={`absolute inset-0 grid place-items-center p-6 text-center transition-opacity duration-500 ${showOverlay ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <MapGrid />
          {status === "error" ? (
            <div className="relative">
              <MapIcon aria-hidden size={36} className="mx-auto text-dim" />
              <p className="mt-4 font-serif text-lg font-bold">地圖暫時無法載入</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-dim">這個瀏覽器可能不支援 WebGL，請改用其他瀏覽器開啟。</p>
              <button type="button" className="btn btn-primary mt-5" onClick={() => start()}>
                <RotateCw aria-hidden size={16} />
                重新載入
              </button>
            </div>
          ) : (
            <div className="relative">
              <div aria-hidden className="relative mx-auto h-14 w-14">
                <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-glow/20 border-t-glow motion-reduce:[animation-duration:2.4s]" />
                <MapIcon size={22} className="absolute inset-0 m-auto text-glow" />
              </div>
              <p className="mt-4 font-serif text-lg font-bold">場地地圖載入中…</p>
              <p className="mt-1 text-sm text-dim">正在鋪草皮、搭帳篷與 22 個市集攤位</p>
            </div>
          )}
        </div>
      )}

      {!active && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <MapGrid />
          <div className="relative">
            <MapIcon aria-hidden size={40} className="mx-auto text-glow" />
            <p className="mt-4 font-serif text-xl font-bold">場地互動地圖</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-dim">
              可切換 3D／2D 檢視，查看 22 個市集攤位、草地表演區、放映區與「傍、佮、佇、佗」四個展區的位置。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn btn-primary" onClick={() => start()}>
                載入互動地圖
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => start(true)}>
                <Maximize2 aria-hidden size={16} />
                全螢幕開啟
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MapGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(140,196,236,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(140,196,236,.14)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_50%_45%,black,transparent_70%)]"
    />
  );
}
