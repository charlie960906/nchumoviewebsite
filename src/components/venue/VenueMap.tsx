"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight, Box, ChevronLeft, ChevronRight, Clapperboard, Clock, Layers, LayoutGrid, LocateFixed,
  Maximize2, Mic, Minimize2, Minus, Plus, Search, Sparkles, Store, X,
} from "lucide-react";
import {
  CATEGORIES, ENTRIES, ENTRY_BY_ID, PERFORMANCES, SCREENINGS, STALLS, matches, stallColor,
  type Category, type MapEntry,
} from "@/lib/venueMap";
import { VenueScene } from "./VenueScene";

type Props = {
  onReady?: () => void;
  onError?: () => void;
  /** 一載入就以全螢幕（覆蓋整頁）顯示 */
  startExpanded?: boolean;
};

type Rect = { x: number; y: number; w: number; h: number };
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/** 卡片（地圖平常所在的位置）在視窗中的矩形 */
function cardRect(slot: HTMLElement): Rect {
  const r = slot.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

const CAT_ICON = { all: LayoutGrid, market: Store, stage: Mic, movie: Clapperboard, exhibition: Sparkles } as const;

/**
 * 場地互動地圖（3D／2D）。three.js 場景在 VenueScene，這裡負責所有 HTML 介面：
 * 跟著 3D 位置移動的標籤、搜尋、分類篩選、2D／3D 切換、全螢幕、資訊面板。
 */
export default function VenueMap({ onReady, onError, startExpanded = false }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const barH = useRef(0);
  const panelRef = useRef<HTMLElement>(null);
  const labelEls = useRef(new Map<string, HTMLElement>()).current;
  const sceneRef = useRef<VenueScene | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [cat, setCat] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [is2D, setIs2D] = useState(false);
  const [expanded, setExpanded] = useState(startExpanded);
  /** 頁面捲動鎖：全螢幕「完全蓋住頁面之後」才鎖、收合「開始之前」先解開 */
  const [locked, setLocked] = useState(false);
  const [hint, setHint] = useState(true);
  const [touch, setTouch] = useState(false);
  const [ready, setReady] = useState(false);
  /** 全螢幕展開／收合的動畫中（3D 暫停，只縮放靜止畫面） */
  const [morphing, setMorphing] = useState(false);

  // 地圖本體放在一個獨立節點裡：平常掛在卡片內，全螢幕時整個搬到 <body>。
  // 這樣 position: fixed 不會被頁面上任何 transform（例如捲動進場動畫）困住，
  // 而且搬移 DOM 節點不會重建 WebGL 場景。
  const slotRef = useRef<HTMLDivElement>(null);
  const [shell] = useState(() => document.createElement("div"));
  // 全螢幕切換動畫：整個地圖框（工具列 + 3D 畫面）從卡片的位置與大小，慢慢變成整個畫面；
  // 關閉時再縮回卡片。框的實際尺寸逐幀改變，3D 畫面也逐幀重設大小，所以模型會跟著平滑縮放、維持置中。
  const wasExpanded = useRef(false);
  const frameAnim = useRef(0);
  const collapsing = useRef(false);

  const viewportRect = (): Rect => ({ x: 0, y: 0, w: window.innerWidth, h: window.innerHeight });

  /** 把地圖框擺到指定的矩形（null = 還原成 CSS 的預設位置） */
  const placeBox = (r: Rect | null, radius = 0) => {
    const root = rootRef.current;
    if (!root) return;
    const st = root.style;
    if (r) {
      st.top = `${r.y}px`;
      st.left = `${r.x}px`;
      st.width = `${r.w}px`;
      st.height = `${r.h}px`;
      st.right = st.bottom = "auto";
      st.borderRadius = `${radius}px`;
    } else {
      st.top = st.left = st.width = st.height = st.right = st.bottom = st.borderRadius = "";
    }
  };

  // 動畫開始：3D 先停住（保留最後一幀），標籤淡出、畫面微微模糊；
  // 動畫結束：3D 一次調整到最終尺寸並重畫，模糊散去、標籤淡入
  const beginMorph = () => {
    sceneRef.current?.freeze();
    setMorphing(true);
  };
  const endMorph = () => {
    sceneRef.current?.thaw();
    setMorphing(false);
  };

  const animateBox = (from: Rect, to: Rect, ms: number, ease: (t: number) => number, done?: () => void) => {
    cancelAnimationFrame(frameAnim.current);
    const vw = window.innerWidth, vh = window.innerHeight;
    // 卡片是 8px 圓角，全螢幕是直角
    const isFull = (r: Rect) => r.w >= vw - 1 && r.h >= vh - 1;
    const rad0 = isFull(from) ? 0 : 8, rad1 = isFull(to) ? 0 : 8;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      const k = ease(t);
      placeBox(
        {
          x: from.x + (to.x - from.x) * k,
          y: from.y + (to.y - from.y) * k,
          w: from.w + (to.w - from.w) * k,
          h: from.h + (to.h - from.h) * k,
        },
        rad0 + (rad1 - rad0) * k,
      );
      if (t < 1) frameAnim.current = requestAnimationFrame(step);
      else done?.();
    };
    step(t0);
    frameAnim.current = requestAnimationFrame(step);
  };

  useLayoutEffect(() => {
    (expanded ? document.body : slotRef.current)?.appendChild(shell);
    const slot = slotRef.current;
    if (expanded && !wasExpanded.current) {
      if (slot && !prefersReducedMotion()) {
        // 第一幀就擺在卡片的位置，再慢慢長大；完全蓋住頁面後才鎖住後面的頁面
        beginMorph();
        animateBox(cardRect(slot), viewportRect(), 560, easeOutQuint, () => {
          placeBox(null);
          endMorph();
          setLocked(true);
        });
      } else {
        placeBox(null);
        sceneRef.current?.resize();
        setLocked(true);
      }
    }
    if (!expanded && wasExpanded.current) {
      cancelAnimationFrame(frameAnim.current);
      collapsing.current = false;
      placeBox(null);
      endMorph();
      sceneRef.current?.resize();
    }
    if (!expanded && !wasExpanded.current) sceneRef.current?.resize();
    wasExpanded.current = expanded;
  }, [expanded, shell]);

  useEffect(() => () => cancelAnimationFrame(frameAnim.current), []);

  const collapse = () => {
    if (collapsing.current) return;
    // 先讓後面的頁面恢復原狀（解除捲動鎖、捲軸回來、版面穩定），再量卡片位置並縮回去
    setLocked(false);
    const slot = slotRef.current;
    if (!slot || prefersReducedMotion()) return setExpanded(false);
    collapsing.current = true;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        beginMorph();
        animateBox(viewportRect(), cardRect(slot), 460, easeInOutCubic, () => setExpanded(false));
      }),
    );
  };
  useLayoutEffect(() => () => shell.remove(), [shell]);

  const cbs = useRef({ onReady, onError });
  cbs.current = { onReady, onError };

  /* ───────── 建立／銷毀場景 ───────── */
  useEffect(() => {
    let cancelled = false;
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    // 背板與地面字樣用網站字型繪製，先等字型載入
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() => {
      if (cancelled || !hostRef.current || !labelRootRef.current) return;
      try {
        const scene = new VenueScene({
          container: hostRef.current,
          labels: labelEls,
          labelRoot: labelRootRef.current,
          onPick: (id) => setSelected(id),
          onHover: (id) => setHovered(id),
          onInteract: () => setHint(false),
        });
        sceneRef.current = scene;
        scene.setTopInset(barH.current);
        scene.start(() => {
          setReady(true);
          cbs.current.onReady?.();
        });
      } catch (err) {
        console.error(err);
        cbs.current.onError?.();
      }
    });
    const t = window.setTimeout(() => setHint(false), 7000);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [labelEls]);

  // 玻璃工具列蓋在 3D 畫面上：量它的高度，讓 3D 畫面置中在工具列以下、資訊面板從工具列下方開始
  useLayoutEffect(() => {
    const bar = barRef.current, root = rootRef.current;
    if (!bar || !root) return;
    const sync = () => {
      const bottom = bar.offsetTop + bar.offsetHeight;
      barH.current = bottom;
      root.style.setProperty("--bar-h", `${bottom}px`);
      sceneRef.current?.setTopInset(bottom);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  /* ───────── 篩選 ───────── */
  const visibleIds = useMemo(() => new Set(ENTRIES.filter((e) => matches(e, cat, query)).map((e) => e.id)), [cat, query]);
  useEffect(() => {
    sceneRef.current?.setDimmed(new Set(ENTRIES.filter((e) => !visibleIds.has(e.id)).map((e) => e.id)));
  }, [visibleIds]);
  const results = useMemo(() => (query.trim() ? ENTRIES.filter((e) => visibleIds.has(e.id)) : []), [query, visibleIds]);

  /* ───────── 選取 ───────── */
  const choose = useCallback((id: string | null) => {
    setSelected(id);
    setSearchOpen(false);
  }, []);

  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;
    s.select(selected);
    if (selected) s.focus(selected);
  }, [selected]);

  // 面板遮住的區域 → 讓 3D 畫面中心往旁邊挪
  useEffect(() => {
    const s = sceneRef.current, panel = panelRef.current, root = rootRef.current;
    if (!s || !root) return;
    if (!selected || !panel) {
      s.setInset(0, 0);
      return;
    }
    const update = () => {
      const side = panel.offsetWidth < root.clientWidth * 0.8;
      s.setInset(side ? panel.offsetWidth + 12 : 0, side ? 0 : panel.offsetHeight + 8);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(panel);
    ro.observe(root);
    return () => ro.disconnect();
  }, [selected]);

  /* ───────── 2D／3D、全螢幕 ───────── */
  useEffect(() => sceneRef.current?.set2D(is2D), [is2D]);

  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    // 補上捲軸寬度，鎖住捲動時頁面不會左右位移
    const scrollbar = window.innerWidth - html.clientWidth;
    const prev = { overflow: html.style.overflow, pad: html.style.paddingRight };
    html.style.overflow = "hidden";
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`;
    return () => {
      html.style.overflow = prev.overflow;
      html.style.paddingRight = prev.pad;
    };
  }, [locked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (searchOpen) setSearchOpen(false);
      else if (selected) setSelected(null);
      else if (expanded) collapse();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, selected, expanded]);

  const entry = selected ? ENTRY_BY_ID.get(selected) : undefined;

  return (
    <>
      <div ref={slotRef} className="absolute inset-0" />
      {createPortal(
    <div
      ref={rootRef}
      className={`@container isolate overflow-hidden bg-night text-moon select-none ${
        expanded ? "fixed inset-0 z-[80] h-dvh w-screen" : "absolute inset-0"
      }`}
      role="region"
      aria-label="場地互動地圖"
    >
      {/* ───────── 上方工具列：浮在場景上的 Liquid Glass 面板，標籤可以從它底下穿過 ───────── */}
      <div
        ref={barRef}
        className="liquid-glass absolute inset-x-2 top-2 z-30 rounded-2xl px-2 pb-2 pt-2 @lg:inset-x-3 @lg:top-3 @lg:px-2.5"
      >
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 @lg:max-w-sm">
            <Search aria-hidden size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) choose(results[0].id);
              }}
              placeholder="搜尋攤位、展區…"
              aria-label="搜尋地圖"
              className="h-10 w-full rounded-xl liquid-pill border pl-9 pr-8 text-[13px] text-moon placeholder:text-mist/60 transition-colors focus:border-glow/60 focus:bg-white/[0.14] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                aria-label="清除搜尋"
                onClick={() => setQuery("")}
                className="absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-dim hover:text-moon"
              >
                <X size={14} aria-hidden />
              </button>
            )}
            {searchOpen && query.trim() && (
              <div className="absolute inset-x-0 top-full mt-1.5 max-h-64 overflow-y-auto liquid-glass rounded-xl bg-night/70 py-1">
                {results.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-dim">找不到「{query}」</p>
                ) : (
                  results.slice(0, 8).map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => choose(e.id)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-glow/10"
                    >
                      <EntryDot entry={e} />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold">{e.title}</span>
                      <span className="shrink-0 text-[11px] text-dim">{e.kicker.split(" · ")[0]}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="ml-auto flex h-10 shrink-0 items-center rounded-xl liquid-pill border p-1" role="group" aria-label="檢視模式">
            {([false, true] as const).map((two) => (
              <button
                key={String(two)}
                type="button"
                aria-pressed={is2D === two}
                onClick={() => setIs2D(two)}
                className={`flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-bold transition-colors ${
                  is2D === two ? "bg-glow text-night" : "text-mist hover:text-moon"
                }`}
              >
                {two ? <Layers size={14} aria-hidden /> : <Box size={14} aria-hidden />}
                {two ? "2D" : "3D"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => (expanded ? collapse() : setExpanded(true))}
            aria-label={expanded ? "結束全螢幕" : "全螢幕"}
            title={expanded ? "結束全螢幕（Esc）" : "全螢幕"}
            className="grid size-10 shrink-0 place-items-center rounded-xl liquid-pill border text-mist transition-colors hover:text-moon"
          >
            {expanded ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}
          </button>
        </div>

        {/* 分類 */}
        <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto" role="group" aria-label="分類篩選">
          {CATEGORIES.map((c) => {
            const Icon = CAT_ICON[c.id];
            const on = cat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={on}
                onClick={() => setCat(c.id)}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-colors ${
                  on ? "border-transparent bg-moon text-night shadow-[0_2px_10px_rgba(234,240,247,0.25)]" : "liquid-pill text-mist hover:text-moon"
                }`}
              >
                <Icon size={13} aria-hidden style={on ? undefined : { color: c.color }} />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────── 3D 畫面區 ───────── */}
      <div className="absolute inset-0 overflow-hidden">
      <div
        ref={hostRef}
        className={`absolute inset-0 transition-[filter] duration-300 ${morphing ? "blur-[3px] brightness-90" : ""}`}
      />

      {/* 柔和的暗角，讓介面浮在場景上 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(0,18,24,0.75))]" />

      {/* ───────── 3D 標籤 ───────── */}
      <div
        ref={labelRootRef}
        data-zoom="mid"
        className={`group/labels pointer-events-none absolute inset-0 z-10 overflow-hidden transition-opacity ${
          morphing ? "opacity-0 duration-150" : "opacity-100 duration-300"
        }`}
      >
        {ENTRIES.map((e) => (
          <MapLabel
            key={e.id}
            entry={e}
            refCb={(el) => (el ? labelEls.set(e.id, el) : labelEls.delete(e.id))}
            dim={!visibleIds.has(e.id)}
            active={selected === e.id}
            hot={hovered === e.id}
            onClick={() => choose(e.id)}
          />
        ))}
      </div>

      {/* ───────── 縮放 ───────── */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-night/85 shadow-lg shadow-black/30">
        {[
          { label: "放大", icon: Plus, run: () => sceneRef.current?.zoom(0.72) },
          { label: "縮小", icon: Minus, run: () => sceneRef.current?.zoom(1.38) },
          { label: "回到全景", icon: LocateFixed, run: () => sceneRef.current?.home() },
        ].map(({ label, icon: Icon, run }) => (
          <button key={label} type="button" onClick={run} aria-label={label} title={label} className="grid size-10 place-items-center text-mist hover:bg-glow/10 hover:text-moon [&+&]:border-t [&+&]:border-white/10">
            <Icon size={16} aria-hidden />
          </button>
        ))}
      </div>

      {/* ───────── 操作提示 ───────── */}
      <p
        aria-hidden
        className={`pointer-events-none absolute bottom-3 left-3 z-10 max-w-[calc(100%-5rem)] rounded-full border border-white/10 bg-night/85 px-3 py-1.5 text-[11px] text-mist transition-opacity duration-500 ${
          hint && !selected ? "opacity-100" : "opacity-0"
        }`}
      >
        {touch ? "單指旋轉 · 雙指縮放 · 點一下查看" : "拖曳旋轉 · 右鍵平移 · 滾輪縮放"}
      </p>

      {/* ───────── 資訊面板 ───────── */}
      {entry && (
        <aside
          ref={panelRef}
          key={entry.id}
          aria-label={entry.title}
          className="absolute inset-x-2 bottom-2 z-30 flex max-h-[55%] flex-col overflow-hidden rounded-2xl border border-white/12 bg-night/90 shadow-2xl shadow-black/60 backdrop-blur-xl animate-[venue-sheet_420ms_var(--ease-ripple)] @xl:inset-x-auto @xl:bottom-3 @xl:left-3 @xl:top-[calc(var(--bar-h,6rem)+0.5rem)] @xl:max-h-none @xl:w-80 @xl:animate-[venue-side_420ms_var(--ease-ripple)]"
        >
          <InfoPanel entry={entry} onClose={() => choose(null)} onGo={choose} />
        </aside>
      )}
      </div>

      {/* 場景畫出第一幀前的過場（全螢幕開啟時也看得到） */}
      <div
        aria-hidden={ready}
        className={`absolute inset-0 z-40 grid place-items-center bg-night transition-opacity duration-500 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <p className="flex items-center gap-3 font-serif text-base font-bold text-mist">
          <span aria-hidden className="ripple-spinner text-glow" />
          場地地圖載入中…
        </p>
      </div>
    </div>,
        shell,
      )}
    </>
  );
}

/* ───────────────────── 標籤 ───────────────────── */

function MapLabel({
  entry: e, refCb, dim, active, hot, onClick,
}: {
  entry: MapEntry;
  refCb: (el: HTMLElement | null) => void;
  dim: boolean;
  active: boolean;
  hot: boolean;
  onClick: () => void;
}) {
  const state = `${dim ? "opacity-15 pointer-events-none" : ""} ${active ? "scale-110" : hot ? "scale-105" : ""}`;
  let inner: ReactNode;

  if (e.kind === "stall") {
    inner = (
      <span
        className={`grid size-6 place-items-center rounded-full font-mono text-[10.5px] font-bold text-night shadow-md shadow-black/40 ring-2 transition-transform ${
          active ? "ring-moon" : "ring-night/70"
        } ${state}`}
        style={{ background: stallColor(e.stall.id) }}
      >
        {e.stall.id}
      </span>
    );
  } else if (e.kind === "room") {
    inner = (
      <span className={`flex flex-col items-center transition-transform ${state}`}>
        <span
          className="grid size-10 place-items-center rounded-full border-2 bg-night/90 font-serif text-xl font-bold shadow-lg shadow-black/50"
          style={{ borderColor: e.zone.color, color: active ? "#001218" : e.zone.color, background: active ? e.zone.color : undefined, boxShadow: active || hot ? `0 0 18px ${e.zone.color}` : undefined }}
        >
          {e.room.char}
        </span>
        <span className="mt-0.5 rounded bg-night/70 px-1 font-mono text-[9.5px] tracking-wider text-mist">{e.room.roman}</span>
      </span>
    );
  } else {
    const big = e.kind === "stage" || e.kind === "movie";
    const Icon = e.kind === "stage" ? Mic : e.kind === "movie" ? Clapperboard : null;
    inner = (
      <span
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border shadow-lg shadow-black/40 transition-[transform,background-color] ${
          big ? "px-3 py-1.5 text-[13px]" : "px-2.5 py-1 text-[11px]"
        } ${active ? "border-transparent bg-glow font-bold text-night" : "border-white/15 bg-night/90 font-bold text-moon"} ${state}`}
      >
        {Icon && <Icon size={13} aria-hidden className={active ? "" : "text-glow"} />}
        {e.title}
      </span>
    );
  }

  // 拉遠時標籤不再隱藏，只是稍微縮小，避免彼此擠在一起
  const farScale = "origin-bottom transition-[scale,opacity] group-data-[zoom=far]/labels:scale-[0.8]";
  return (
    <div ref={refCb} className="absolute left-0 top-0 will-change-transform" style={{ visibility: "hidden" }}>
      <button
        type="button"
        onClick={onClick}
        tabIndex={dim ? -1 : 0}
        aria-label={`${e.kicker}：${e.title}`}
        className={`pointer-events-auto absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center duration-300 ${farScale}`}
      >
        {inner}
        {e.kind !== "stall" && <span aria-hidden className={`h-2.5 w-px ${dim ? "bg-transparent" : "bg-moon/50"}`} />}
      </button>
    </div>
  );
}

function EntryDot({ entry: e }: { entry: MapEntry }) {
  const color =
    e.kind === "stall" ? stallColor(e.stall.id) : e.kind === "room" ? e.zone.color : CATEGORIES.find((c) => c.id === e.cat)!.color;
  return <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: color }} />;
}

/* ───────────────────── 資訊面板 ───────────────────── */

function InfoPanel({ entry: e, onClose, onGo }: { entry: MapEntry; onClose: () => void; onGo: (id: string) => void }) {
  const accent = e.kind === "stall" ? stallColor(e.stall.id) : e.kind === "room" ? e.zone.color : CATEGORIES.find((c) => c.id === e.cat)!.color;
  return (
    <>
      <div className="relative shrink-0 border-b border-white/10 px-4 pb-3 pt-3.5">
        <div aria-hidden className="absolute inset-x-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
        <div className="flex items-start gap-3">
          {e.kind === "room" && (
            <span className="grid size-12 shrink-0 place-items-center rounded-xl font-serif text-2xl font-bold text-night" style={{ background: accent }}>
              {e.room.char}
            </span>
          )}
          {e.kind === "stall" && (
            <span className="grid size-12 shrink-0 place-items-center rounded-xl font-mono text-lg font-bold text-night" style={{ background: accent }}>
              {String(e.stall.id).padStart(2, "0")}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-dim">
              <span aria-hidden className="size-1.5 rounded-full" style={{ background: accent }} />
              {e.kicker}
            </p>
            <h3 className="mt-0.5 font-serif text-lg font-bold leading-snug">{e.title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="關閉" className="-mr-1 grid size-9 shrink-0 place-items-center rounded-lg text-dim hover:bg-white/5 hover:text-moon">
            <X size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5 text-sm text-mist [overscroll-behavior:contain]">
        {e.kind === "stall" && (
          <>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
              <dt className="text-dim">品牌</dt>
              <dd className="font-bold text-moon">{e.stall.owner}</dd>
              <dt className="text-dim">價位</dt>
              <dd className="font-mono text-moon">{e.stall.price}</dd>
            </dl>
            <p className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] p-3 leading-relaxed">{e.stall.items}</p>
            <div className="mt-3 flex justify-between">
              {[-1, 1].map((d) => {
                const id = ((e.stall.id - 1 + d + STALLS.length) % STALLS.length) + 1;
                return (
                  <button key={d} type="button" onClick={() => onGo(`stall-${id}`)} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-glow hover:bg-glow/10">
                    {d < 0 && <ChevronLeft size={14} aria-hidden />}
                    {d < 0 ? "上一攤" : "下一攤"} {String(id).padStart(2, "0")}
                    {d > 0 && <ChevronRight size={14} aria-hidden />}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {e.kind === "stage" && (
          <>
            <p>沒有架高的舞台——表演就在場地中央的草皮上，現場音樂、舞蹈與快閃互動，席地而坐就能看。</p>
            <TimeList items={PERFORMANCES} />
          </>
        )}

        {e.kind === "movie" && (
          <>
            <p>鋪好野餐墊、席地而坐，享受星空下的光影。</p>
            <TimeList items={SCREENINGS} />
            <Link href="/program" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-glow hover:underline">
              放映片單 <ArrowRight size={13} aria-hidden />
            </Link>
          </>
        )}

        {e.kind === "room" && (
          <>
            <p className="flex items-center gap-2 text-xs">
              <span className="font-mono tracking-wider text-dim">{e.room.roman}</span>
              <span className="rounded-full border px-2 py-0.5 text-[11px] font-bold" style={{ borderColor: `${accent}66`, color: accent }}>
                {e.room.phase}
              </span>
            </p>
            <p className="mt-2 leading-relaxed text-moon/90">{e.room.desc}</p>
            <div className="mt-4 grid gap-2">
              <Link href={e.room.action.href} className="btn btn-primary btn-sm justify-between">
                {e.room.action.label}
                <ArrowRight size={14} aria-hidden />
              </Link>
              <Link href={e.zoneHref} className="btn btn-ghost btn-sm justify-between">
                認識展區「{e.zone.char}」· {e.zone.subtitle}
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </>
        )}

        {e.kind === "service" && <p className="leading-relaxed text-moon/90">{e.desc}</p>}
      </div>
    </>
  );
}

function TimeList({ items }: { items: { time: string; name: string }[] }) {
  return (
    <ul className="mt-3 grid gap-2">
      {items.map((it) => (
        <li key={it.time + it.name} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
          <Clock size={14} aria-hidden className="shrink-0 text-glow" />
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[11px] text-dim">{it.time}</span>
            <span className="block font-bold text-moon">{it.name}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
