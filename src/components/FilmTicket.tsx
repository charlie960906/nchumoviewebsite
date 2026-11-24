"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Repeat2, Scissors, Share2, Ticket, X } from "lucide-react";
import qrcode from "qrcode-generator";
import { code128B } from "@/lib/code128";
import type { Program } from "@/lib/programs";
import { site } from "@/lib/site";
import { THEME } from "@/lib/theme";
import { renderStub } from "@/lib/ticketStub";
import { track } from "@/lib/track";

/** 場次文字（由伺服器端從時間表算好傳進來） */
export type TicketShow = { date: string; weekday: string; time: string; start: string };

const QUIET = 10; // Code 128 規定左右各至少 10 個模組寬的空白
/** 票根拉開超過這個距離（px）就算撕下 */
const TEAR_AT = 90;
const FLY_MS = 650;

/** Code 128 條碼：直式（正面票根）或橫式（背面）。真的可以用手機掃（讀出 value 文字）。 */
function Barcode({ value, horizontal = false }: { value: string; horizontal?: boolean }) {
  const widths = code128B(value);
  const total = widths.reduce((a, b) => a + b, 0) + QUIET * 2;
  let at = QUIET;
  const bars: { at: number; w: number }[] = [];
  widths.forEach((w, i) => {
    if (i % 2 === 0) bars.push({ at, w });
    at += w;
  });
  return (
    <svg
      role="img"
      aria-label={`條碼 ${value}`}
      viewBox={horizontal ? `0 0 ${total} 1` : `0 0 1 ${total}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      className="absolute inset-0 h-full w-full"
    >
      {bars.map((b) =>
        horizontal ? (
          <rect key={b.at} x={b.at} y="0" width={b.w} height="1" fill="currentColor" />
        ) : (
          <rect key={b.at} x="0" y={b.at} width="1" height={b.w} fill="currentColor" />
        ),
      )}
    </svg>
  );
}

function Qr({ value }: { value: string }) {
  const { n, d } = useMemo(() => {
    const q = qrcode(0, "M");
    q.addData(value);
    q.make();
    const n = q.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return { n, d };
  }, [value]);
  return (
    <svg viewBox={`-3 -3 ${n + 6} ${n + 6}`} shapeRendering="crispEdges" className="block h-full w-full" aria-hidden>
      <rect x="-3" y="-3" width={n + 6} height={n + 6} fill="#fff" />
      <path d={d} fill="#1d2a3a" />
    </svg>
  );
}

/**
 * 電影介紹頁 Hero：可翻面、可撕的電影票。
 * - 正面：左存根（條碼＋片目）＋劇照；滑鼠移過去會 3D 傾斜，點一下翻面。
 * - 背面：Luma QR code、場次資訊、標語與印章；存根背面是票號。
 * - 沿虛線把存根拉開（桌機往左、手機往下）就撕下，產生可下載／分享的票根圖片。
 */
export default function FilmTicket({
  program,
  show,
}: {
  program: Program & { film: NonNullable<Program["film"]> };
  show?: TicketShow;
}) {
  const f = program.film;
  const meta = [
    `( ${f.year} )`,
    `${f.runtime} min`,
    f.directorEn.replace(/-/g, "‑"), // 不間斷連字號：不在 Feng-I 的連字號處斷行
    f.countries.join(", "),
    f.color,
    f.rating,
  ].filter(Boolean) as string[];
  const lumaUrl = `${site.luma.url}?utm_source=ticket-${program.slug}`;
  const ticketNo = `No. ${show ? show.date.slice(5).replace(".", "") : "0000"}-${f.code.split("-").pop()}`;
  const when = show ? `${show.date} ${show.weekday} ${show.start}` : "2027";
  const filename = `ticket-stub-${program.slug}.png`;

  /** 累計翻了幾個半圈（帶正負號）：+1 = 往右翻（右邊往下壓、左邊翻上來），−1 = 往左翻 */
  const [turns, setTurns] = useState(0);
  const flipped = Math.abs(turns) % 2 === 1;
  /** 在整張票上按下的位置：放開時移動超過 6px 就當成拖曳，不翻面 */
  const press = useRef<{ x: number; y: number } | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"whole" | "tearing" | "torn">("whole");
  const [wide, setWide] = useState(true);
  const [img, setImg] = useState<{ url: string; file: File } | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  /** 正面票根的實際高度（手機版背面票根要跟它一樣高，翻面後撕線位置才一致） */
  const [stubH, setStubH] = useState(0);
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const stubRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => {
      mq.removeEventListener("change", on);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const el = stubRef.current;
    if (!el) return;
    // offsetHeight 不受拖曳時的 transform 影響；掛載時先量一次，之後由 ResizeObserver 追蹤（字型載入、轉向等）
    const measure = () => setStubH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => void (img && URL.revokeObjectURL(img.url)), [img]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  /** dir：+1 點在右半邊（右邊往下、左邊往上），−1 點在左半邊（左邊往下、右邊往上） */
  const flip = (dir: 1 | -1 = 1) => {
    // 翻面前再量一次正面票根高度（ResizeObserver 若還沒回呼，例如開場動畫期間載入，也保證對齊）
    if (stubRef.current?.offsetHeight) setStubH(stubRef.current.offsetHeight);
    track("ticket_interact", { action: flipped ? "flip_front" : "flip_back", item: program.slug });
    setTurns((t) => t + dir);
  };

  const tear = () => {
    if (phase !== "whole") return;
    drag.current = null;
    setDragging(false);
    setPhase("tearing");
    track("ticket_interact", { action: "tear", item: program.slug });
    const fontFamily = stubRef.current ? getComputedStyle(stubRef.current).fontFamily : "sans-serif";
    renderStub({ title: program.title, titleEn: program.titleEn, meta, code: f.code, when, fontFamily, layout: wide ? "portrait" : "landscape" })
      .then((blob) => {
        const file = new File([blob], filename, { type: "image/png" });
        setImg({ url: URL.createObjectURL(blob), file });
        setCanShare(!!navigator.canShare?.({ files: [file] }));
      })
      .catch(() => setImg(null));
    later(() => {
      setPhase("torn");
      dialogRef.current?.showModal();
    }, FLY_MS);
  };


  const reset = () => {
    dialogRef.current?.close();
    setImg(null);
    setPull(0);
    setPhase("whole");
    track("ticket_interact", { action: "new_ticket", item: program.slug });
  };

  /** 分享：能分享圖片檔就分享票根圖；不行就分享頁面連結；連系統分享都沒有就複製連結 */
  const share = async () => {
    const text = `我拿到《${program.title}》的星空放映票根｜${site.fullName}`;
    const url = window.location.href.split("#")[0];
    try {
      if (img && canShare) {
        track("ticket_interact", { action: "share", method: "image", item: program.slug });
        await navigator.share({ files: [img.file], text: `${text} ${url}` });
      } else if (navigator.share) {
        track("ticket_interact", { action: "share", method: "link", item: program.slug });
        await navigator.share({ title: document.title, text, url });
      } else {
        track("ticket_interact", { action: "share", method: "copy", item: program.slug });
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
        later(() => setCopied(false), 2200);
      }
    } catch {}
  };

  // ── 傾斜（只對滑鼠；減少動態效果時不做） ──
  const onScenePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || dragging || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 8, y: px * 10 });
  };

  // ── 撕票拖曳（正反面都可以撕） ──
  const canTear = phase === "whole";
  /** 桌機：正面票根在左（往左拉）、背面票根在右（往右拉）；手機兩面都在下方（往下拉） */
  const pullDir = wide ? (flipped ? "right" : "left") : "down";
  const onStubDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTear || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag.current = { x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onStubMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d0 = drag.current;
    if (!d0) return;
    const dx = e.clientX - d0.x;
    const dy = e.clientY - d0.y;
    if (!d0.moved && Math.hypot(dx, dy) > 6) {
      d0.moved = true;
      setDragging(true);
      setTilt({ x: 0, y: 0 });
    }
    if (!d0.moved) return;
    const d = Math.max(0, pullDir === "left" ? -dx : pullDir === "right" ? dx : dy);
    setPull(d);
    if (d > TEAR_AT) {
      // 放開滑鼠時瀏覽器還會送一次 click，不要讓它把票翻面
      suppressClick.current = true;
      tear();
    }
  };
  const onStubUp = () => {
    const d0 = drag.current;
    drag.current = null;
    if (d0?.moved) suppressClick.current = true;
    // click 會緊接在 pointerup 之後送出；之後就清掉，免得吃掉下一次真正的點擊
    window.setTimeout(() => (suppressClick.current = false), 0);
    setDragging(false);
    if (phase === "whole") setPull(0);
  };

  const onCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const p0 = press.current;
    press.current = null;
    if (suppressClick.current || (p0 && Math.hypot(e.clientX - p0.x, e.clientY - p0.y) > 6)) {
      suppressClick.current = false;
      return;
    }
    // 用外層（不會跟著翻轉）的位置判斷點在左半邊還是右半邊
    const r = e.currentTarget.parentElement!.getBoundingClientRect();
    flip(e.clientX < r.left + r.width / 2 ? -1 : 1);
  };

  const gone = phase !== "whole";
  /** side：這一面的票根往哪邊撕。只有目前朝向使用者的那一面會跟著拖曳移動 */
  const stubStyle = (side: "front" | "back"): React.CSSProperties => {
    const facing = (side === "back") === flipped;
    const dir = !wide ? "down" : side === "back" ? "right" : "left";
    if (gone)
      return {
        transform: !facing
          ? "none"
          : dir === "left"
            ? "translate(-260px, 140px) rotate(-22deg)"
            : dir === "right"
              ? "translate(260px, 140px) rotate(22deg)"
              : "translate(40px, 260px) rotate(12deg)",
        opacity: 0,
        transition: `transform ${FLY_MS}ms cubic-bezier(.5,0,.75,0), opacity ${FLY_MS}ms ease-in`,
      };
    const p = facing ? pull : 0;
    return {
      transform:
        dir === "left"
          ? `translateX(${-p}px) rotate(${-p * 0.05}deg)`
          : dir === "right"
            ? `translateX(${p}px) rotate(${p * 0.05}deg)`
            : `translateY(${p}px) rotate(${p * 0.03}deg)`,
      transition: dragging ? "none" : "transform 420ms cubic-bezier(.2,1.4,.4,1)",
    };
  };
  const tearHandlers = {
    onPointerDown: onStubDown,
    onPointerMove: onStubMove,
    onPointerUp: onStubUp,
    onPointerCancel: onStubUp,
  };
  const hideStyle: React.CSSProperties = gone ? { opacity: 0, transition: `opacity ${FLY_MS}ms` } : {};

  const qrLink = (cls = "") => (
    <a
      href={lumaUrl}
      target="_blank"
      rel="noopener"
      tabIndex={flipped ? 0 : -1}
      onClick={(e) => {
        e.stopPropagation();
        track("ticket_interact", { action: "qr_click", item: program.slug });
      }}
      className={`block text-center ${cls}`}
      aria-label="訂閱放映提醒（Luma，另開新分頁）"
    >
      <span className="block w-24 rounded-md bg-white p-1 shadow-sm sm:w-28 md:w-32">
        <Qr value={lumaUrl} />
      </span>
      <span className="mt-1.5 block text-[11px] tracking-[0.12em] text-[#4e5d80]">掃描訂閱提醒</span>
    </a>
  );

  const schedule = (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 gap-y-0.5 text-[12px] tracking-[0.04em] sm:gap-x-3 sm:text-[13px] sm:tracking-[0.06em] md:gap-y-1.5 md:text-sm">
      {[
        ["DATE", show ? `${show.date} ${show.weekday}` : "待公布"],
        ["TIME", show?.time ?? "待公布"],
        ["VENUE", "國立中興大學"],
        ["SEAT", "草地席地・自由入座"],
        ["ENTRY", "免費・免報名"],
      ].map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="font-mono text-[10px] leading-6 tracking-[0.12em] text-[#4e5d80] sm:text-[11px] sm:tracking-[0.15em]">{k}</dt>
          <dd className="leading-6">{v}</dd>
        </div>
      ))}
    </dl>
  );

  const stamp = (cls: string) => (
    <span
      aria-hidden
      className={`pointer-events-none absolute grid rotate-[-14deg] place-items-center rounded-full border-2 border-dashed border-[#b0493a]/55 text-center font-mono text-[10px] leading-tight tracking-[0.12em] text-[#b0493a]/70 ${cls}`}
    >
      <span>
        NCHU
        <br />
        <span className="text-[13px] font-bold">{show ? show.date.slice(5) : "2027"}</span>
        <br />
        RIPPLE
      </span>
    </span>
  );

  return (
    <div className="ticket-fit reveal-now mx-auto w-full max-w-5xl" style={{ "--d": "60ms" } as React.CSSProperties}>
      <div className="ticket-scene" onPointerMove={onScenePointerMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
        <div className="ticket-tilt" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
          <div
            className="ticket-flip cursor-pointer"
            style={{ transform: `rotateY(${turns * 180}deg)` }}
            onPointerDown={(e) => (press.current = { x: e.clientX, y: e.clientY })}
            onClick={onCardClick}
          >
            {/* ───────── 正面 ───────── */}
            <div className="ticket ticket-face grid text-left text-[#3a3a3a]">
              <div
                ref={stubRef}
                className={`ticket-stub flex gap-5 bg-[#f2f2f0] p-6 sm:gap-7 sm:p-8 md:p-10 short:p-7 ${canTear && !flipped ? "ticket-tearable" : ""}`}
                style={stubStyle("front")}
                {...(flipped ? {} : tearHandlers)}
              >
                <div className="relative w-11 shrink-0 self-stretch text-[#4e5d80] sm:w-14">
                  <Barcode value={f.code} />
                </div>
                <div className="min-w-0 py-1">
                  <h1 className="font-sans text-[28px] font-light leading-tight tracking-[0.15em] md:text-[30px] md:tracking-[0.12em] short:text-[26px]">{program.title}</h1>
                  {program.titleEn && <p className="mt-3 text-lg font-medium italic tracking-wider md:text-xl short:mt-2 short:text-lg">{program.titleEn}</p>}
                  <ul className="mt-8 grid gap-1.5 text-[15px] font-light tracking-[0.08em] md:mt-12 md:gap-2 md:text-lg short:mt-6 short:gap-1 short:text-base">
                    {meta.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div aria-hidden className="ticket-perf" style={hideStyle} />

              <div className="ticket-main flex items-center justify-center bg-[#f2f2f0] p-6 sm:p-8 md:p-10 short:p-7">
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#1d2a3a]">
                  {f.still ? (
                    <Image src={f.still} alt={`《${program.title}》劇照`} fill sizes="(min-width: 768px) 60vw, 100vw" className="pointer-events-none object-cover" priority draggable={false} />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center font-mono text-xs tracking-[0.3em] text-white/40">STILL · COMING SOON</span>
                  )}
                </div>
              </div>
            </div>

            {/* ───────── 背面 ───────── */}
            {/* 手機：背面票根高度跟正面同步（--stub-h），翻面後撕線停在同一個位置；
                主票背面因此較矮，場次資訊與印章移到票根背面。桌機維持原排法。 */}
            <div
              className="ticket ticket-back ticket-face grid text-left text-[#3a3a3a]"
              aria-hidden={!flipped}
              style={stubH ? ({ "--stub-h": `${stubH}px` } as React.CSSProperties) : undefined}
            >
              {/* 存根背面：票號＋條碼（手機另有場次資訊與印章） */}
              <div
                className={`ticket-stub relative flex flex-col justify-between gap-4 overflow-hidden bg-[#f2f2f0] px-6 py-5 md:p-8 short:p-6 ${canTear && flipped ? "ticket-tearable" : ""}`}
                style={stubStyle("back")}
                {...(flipped ? tearHandlers : {})}
              >
                <div className="flex items-center justify-between gap-4 md:block">
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.3em] text-[#4e5d80]">TICKET</p>
                    <p className="mt-1 whitespace-nowrap font-mono text-lg tracking-[0.08em] sm:text-xl md:text-2xl md:tracking-[0.12em]">{ticketNo}</p>
                  </div>
                  <div className="relative h-10 w-24 shrink-0 text-[#4e5d80] sm:w-32 md:hidden">
                    <Barcode value={f.code} horizontal />
                  </div>
                </div>
                <div className="md:hidden">{schedule}</div>
                <p className="hidden text-sm leading-relaxed tracking-[0.08em] text-[#5a5a5a] md:block">
                  《{program.title}》
                  <br />
                  {show ? `${show.date} ${show.weekday}` : ""}
                </p>
                <div className="relative hidden h-14 w-full text-[#4e5d80] md:block">
                  <Barcode value={f.code} horizontal />
                </div>
                {stamp("bottom-5 right-5 size-20 md:hidden")}
              </div>

              <div aria-hidden className="ticket-perf" style={hideStyle} />

              {/* 主票背面：電影節、QR、（桌機）場次、標語、（桌機）印章 */}
              <div className="ticket-main relative flex flex-col justify-between gap-4 overflow-hidden bg-[#f2f2f0] p-6 sm:p-8 md:gap-5 md:p-10 short:gap-3 short:p-7">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 md:block">
                  {qrLink("md:hidden")}
                  <div>
                    <p className="whitespace-nowrap font-mono text-[11px] tracking-[0.12em] text-[#4e5d80] sm:tracking-[0.3em]">ADMIT ONE · 星空放映</p>
                    <p className="mt-2 font-serif text-lg font-bold leading-snug tracking-wider sm:text-xl md:text-2xl">
                      2027 中興星空電影節<wbr />「{THEME}」
                    </p>
                  </div>
                </div>

                <div className="hidden grid-cols-[auto_minmax(0,1fr)] items-center gap-7 md:grid">
                  {qrLink()}
                  {schedule}
                </div>

                <p className="font-serif text-xs tracking-[0.25em] text-[#4e5d80] sm:text-sm md:text-base md:tracking-[0.3em]">{site.tagline}</p>

                {stamp("hidden md:grid md:bottom-8 md:right-8 md:size-28")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作列 */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 short:mt-4">
        <button type="button" onClick={() => flip(1)} className="btn btn-ghost btn-sm">
          <Repeat2 aria-hidden size={16} />
          {flipped ? "翻回正面" : "翻到背面"}
        </button>
        {phase === "whole" ? (
          <button type="button" onClick={tear} className="btn btn-ghost btn-sm">
            <Scissors aria-hidden size={16} />
            撕下票根
          </button>
        ) : (
          <>
            <button type="button" onClick={() => dialogRef.current?.showModal()} className="btn btn-ghost btn-sm" disabled={phase === "tearing"}>
              <Ticket aria-hidden size={16} />
              查看票根
            </button>
            <button type="button" onClick={reset} className="btn btn-ghost btn-sm">
              再拿一張票
            </button>
          </>
        )}
      </div>
      {phase === "whole" && (
        <p className="mt-3 text-center text-xs tracking-[0.12em] text-dim short:mt-2">
          點票面翻面・按住票根{pullDir === "left" ? "往左" : pullDir === "right" ? "往右" : "往下"}拉，沿虛線撕下
        </p>
      )}

      {/* 票根視窗 */}
      <dialog
        ref={dialogRef}
        aria-labelledby={`stub-h-${program.slug}`}
        className="m-auto bg-transparent p-0 text-moon backdrop:bg-black/65 backdrop:backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
      >
        <div className="relative w-[min(90vw,400px)] rounded-2xl border border-white/10 bg-night-2 p-6 text-center shadow-2xl">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="關閉"
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-dim hover:bg-white/10 hover:text-moon"
          >
            <X aria-hidden size={18} />
          </button>
          <h2 id={`stub-h-${program.slug}`} className="font-serif text-xl font-bold">
            你的票根
          </h2>
          <p className="mt-1 text-sm text-dim">存起來，或分享給一起看電影的人</p>
          <div className="mt-5 grid aspect-[4/5] place-items-center overflow-hidden rounded-xl bg-night">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element -- 由 Canvas 產生的 blob 網址
              <img src={img.url} alt={`《${program.title}》票根`} className="h-full w-full object-contain" />
            ) : (
              <span className="ripple-spinner" aria-label="票根產生中" />
            )}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <a
              href={img?.url}
              download={filename}
              aria-disabled={!img}
              onClick={(e) => (img ? track("ticket_interact", { action: "download", item: program.slug }) : e.preventDefault())}
              className={`btn btn-primary ${img ? "" : "pointer-events-none opacity-50"}`}
            >
              <Download aria-hidden size={18} />
              下載票根
            </a>
            <button type="button" onClick={share} className="btn btn-ghost">
              {copied ? <Check aria-hidden size={18} /> : <Share2 aria-hidden size={18} />}
              {copied ? "已複製連結" : "分享"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
