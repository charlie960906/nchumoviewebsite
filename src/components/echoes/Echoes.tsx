"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ChevronLeft, ChevronRight, Disc3, ExternalLink, Gauge, Link2, Pause, Play, Undo2, Volume2 } from "lucide-react";
import type { Staff } from "@/lib/staff";
import { spotifyTrackId } from "@/lib/echo-submissions";
import { EchoAudio } from "./audio";
import { fmtTime, spotifyTrackUrl, useSpotifyEmbed } from "./spotify";
import { track } from "@/lib/track";
import StoryBody from "./StoryBody";
import type { SceneHandle } from "./VinylScene";

const VinylScene = dynamic(() => import("./VinylScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center text-dim">
      <span className="inline-flex items-center gap-3">
        <span className="ripple-spinner text-glow" aria-hidden /> 唱片準備中…
      </span>
    </div>
  ),
});

type Phase = "ring" | "pulling" | "open";
const KEY = "ripple:echoes-simple";

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** staff 由頁面（Server Component）傳入：黑膠資料會合併團隊名單，只能在伺服器端組好 */
export default function Echoes({ staff }: { staff: Staff[] }) {
  const n = staff.length;
  const [focus, setFocus] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("ring");
  // null = 尚未判斷（SSR／首次渲染），避免在不需要時載入 three.js
  const [simple, setSimple] = useState<boolean | null>(null);
  const [forced, setForced] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [copied, setCopied] = useState(false);

  const scene = useRef<SceneHandle>(null);
  const audio = useRef<EchoAudio | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(rm);
    const saved = localStorage.getItem(KEY);
    if (!webglOk()) {
      setForced("此裝置不支援 WebGL，已切換為簡化模式。");
      setSimple(true);
    } else if (rm) {
      setSimple(true);
    } else setSimple(saved === "1");
    audio.current = new EchoAudio();
    return () => {
      audio.current?.dispose();
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const go = useCallback(
    (i: number) => {
      if (phase !== "ring") return;
      const k = ((i % n) + n) % n;
      if (simple) setFocus(k);
      else scene.current?.rotateTo(k);
    },
    [n, phase, simple],
  );

  /** 確認抽取：必須由使用者手勢觸發，才能合法啟動音訊 */
  const pull = useCallback(
    (i: number) => {
      if (phase !== "ring") return;
      track("interactive_play", { game: "echoes", action: "open", item: staff[i].id });
      setPicked(i);
      setFocus(i);
      // 綁了 Spotify 的成員改由嵌入播放器播放（故事展開時載入），不播合成環境音
      if (!spotifyTrackId(staff[i])) void audio.current?.play(staff[i]).then((ok) => setPlaying(!!ok));
      const open = () => {
        setPhase("open");
        requestAnimationFrame(() =>
          storyRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" }),
        );
      };
      if (simple || reduced) {
        // reduced-motion：跳過取出動畫，直接顯示故事與播放控制
        open();
      } else {
        setPhase("pulling");
        scene.current?.pull(i);
        timer.current = setTimeout(open, 1500);
      }
    },
    [phase, reduced, simple, staff],
  );

  const release = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    audio.current?.stop();
    setPlaying(false);
    scene.current?.release();
    setPhase("ring");
    setPicked(null);
    stageRef.current?.focus({ preventScroll: true });
    stageRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
  }, [reduced]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(focus - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(focus + 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (phase === "ring") pull(focus);
    } else if (e.key === "Escape" && phase !== "ring") {
      e.preventDefault();
      release();
    }
  };

  const toggleSimple = () => {
    if (phase !== "ring") release();
    setSimple((v) => {
      const next = !v;
      localStorage.setItem(KEY, next ? "1" : "0");
      return next;
    });
  };

  const onFallback = useCallback(() => {
    setForced("偵測到裝置效能較低，已自動切換為簡化模式。");
    setSimple(true);
    setPhase((p) => (p === "pulling" ? "open" : p));
  }, []);

  const cur = staff[focus];
  const sel = picked !== null ? staff[picked] : null;
  const spId = sel ? spotifyTrackId(sel) : null;
  // 故事展開才建立嵌入播放器；放回圓環時 trackId 變 null，播放器隨之銷毀
  const sp = useSpotifyEmbed(phase === "open" ? spId : null, true);
  const isPlaying = spId ? !sp.paused : playing;
  const listenUrl = sel?.externalUrl ?? (spId ? spotifyTrackUrl(spId) : undefined);

  const share = async () => {
    if (!sel) return;
    track("interactive_play", { game: "echoes", action: "share", item: sel.id });
    const url = `${location.origin}/interactive/echoes/${sel.id}`;
    const data = { title: `${sel.storyTitle}｜波紋的音像`, text: `我在「波紋的音像」抽到了${sel.name}的黑膠〈${sel.songTitle}〉`, url };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {}
  };

  return (
    <div>
      {/* ───────── 舞台 ───────── */}
      <div
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-roledescription="黑膠圓環"
        aria-label={`共 ${n} 張黑膠。使用左右方向鍵旋轉，Enter 抽取，Esc 放回。`}
        onKeyDown={onKey}
        className="card relative h-[58vh] min-h-[380px] max-h-[640px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-glow"
        style={{
          background: `radial-gradient(70% 80% at 50% 45%, ${(sel ?? cur).accentColor}1f, transparent 70%), linear-gradient(180deg, #031C24, #001218)`,
          transition: "background 600ms ease",
        }}
      >
        {simple === false && <VinylScene ref={scene} staff={staff} onFocus={setFocus} onPick={pull} onFallback={onFallback} />}
        {simple === true && (
          <SimpleStage accent={cur.accentColor} name={cur.name} song={cur.songTitle} spinning={phase !== "ring" && isPlaying} onPick={() => pull(focus)} idx={focus} />
        )}

        {/* 中心聚焦指示 */}
        {phase === "ring" && simple === false && (
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[19%] flex justify-center">
            <span className="h-2 w-2 animate-breathe rounded-full bg-glow" />
          </div>
        )}

        {/* 目前聚焦的資訊（同時是螢幕閱讀器的即時播報） */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <p className="tag !border-white/15 !bg-night/60 backdrop-blur">
            <span className="font-mono">
              {String(focus + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          </p>
          <button
            type="button"
            onClick={toggleSimple}
            aria-pressed={!!simple}
            className="tag pointer-events-auto cursor-pointer !border-white/15 !bg-night/60 !py-1 backdrop-blur hover:!border-glow"
          >
            <Gauge aria-hidden size={13} />
            簡化模式{simple ? "：開" : "：關"}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-night via-night/70 to-transparent p-4 pt-12">
          <button type="button" onClick={() => go(focus - 1)} disabled={phase !== "ring"} aria-label="上一張黑膠" className="btn btn-ghost !h-11 !w-11 !p-0">
            <ChevronLeft aria-hidden />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p aria-live="polite" aria-atomic="true" className="truncate">
              <span className="font-serif text-xl font-bold" style={{ color: cur.accentColor }}>
                {cur.name}
              </span>
              <span className="mx-2 text-dim">·</span>
              <span className="text-sm text-mist">{cur.role}</span>
              <span className="sr-only">，歌曲〈{cur.songTitle}〉。{phase === "ring" ? "按 Enter 抽取這張黑膠。" : "已抽出，正在播放。"}</span>
            </p>
            <p aria-hidden className="truncate text-sm text-dim">
              ♪ {cur.songTitle}
            </p>
            {phase === "ring" ? (
              <button type="button" onClick={() => pull(focus)} className="btn btn-primary btn-sm mt-2.5">
                <Disc3 aria-hidden size={15} />
                抽出這張黑膠
              </button>
            ) : (
              <button type="button" onClick={release} className="btn btn-ghost btn-sm mt-2.5">
                <Undo2 aria-hidden size={15} />
                放回圓環
              </button>
            )}
          </div>

          <button type="button" onClick={() => go(focus + 1)} disabled={phase !== "ring"} aria-label="下一張黑膠" className="btn btn-ghost !h-11 !w-11 !p-0">
            <ChevronRight aria-hidden />
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-dim">
        {forced ?? "拖曳或滑動旋轉圓環，點擊正中央的黑膠即可抽出。鍵盤：← → 旋轉、Enter 抽取、Esc 放回。"}
      </p>

      {/* ───────── 播放與揭示 ───────── */}
      <div ref={storyRef} className="scroll-mt-24">
        <AnimatePresence mode="wait">
          {phase === "open" && sel && (
            <m.article
              key={sel.id}
              initial={{ opacity: 0, y: 24, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 12, height: 0 }}
              transition={{ duration: reduced ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
              aria-labelledby="story-title"
            >
              <div className="card mt-6 overflow-hidden" style={{ borderColor: `${sel.accentColor}66` }}>
                {/* 播放控制 */}
                <div className="flex flex-wrap items-center gap-4 border-b border-white/10 p-5 md:px-8" style={{ background: `linear-gradient(90deg, ${sel.accentColor}22, transparent)` }}>
                  <button
                    type="button"
                    onClick={async () => {
                      if (spId) sp.toggle();
                      else setPlaying(!!(await audio.current?.toggle()));
                    }}
                    disabled={!!spId && !sp.ready}
                    aria-label={isPlaying ? "暫停音樂" : "播放音樂"}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-night transition-transform duration-150 hover:scale-105 active:scale-95 disabled:opacity-50"
                    style={{ background: sel.accentColor }}
                  >
                    {spId && (!sp.ready || (sp.buffering && !sp.paused)) ? (
                      <span aria-hidden className="ripple-spinner" />
                    ) : isPlaying ? (
                      <Pause aria-hidden fill="currentColor" size={20} />
                    ) : (
                      <Play aria-hidden fill="currentColor" size={20} className="ml-0.5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{sel.songTitle}</p>
                    <p className="truncate text-sm text-dim">{sel.songArtist}</p>
                    {spId && (
                      <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-dim">
                        <span className="w-9 text-right">{fmtTime(sp.position)}</span>
                        <input
                          type="range"
                          min={0}
                          max={Math.max(1, sp.duration)}
                          step={1000}
                          value={Math.min(sp.position, sp.duration)}
                          disabled={!sp.ready || !sp.duration}
                          onChange={(e) => sp.seek(Number(e.target.value))}
                          aria-label="播放進度"
                          aria-valuetext={`${fmtTime(sp.position)} / ${fmtTime(sp.duration)}`}
                          className="h-6 min-w-0 flex-1"
                          style={{ accentColor: sel.accentColor }}
                        />
                        <span className="w-9">{fmtTime(sp.duration)}</span>
                      </div>
                    )}
                  </div>
                  <span aria-hidden className={`flex h-5 items-end gap-[3px] ${isPlaying ? "" : "opacity-30"}`}>
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="w-[3px] origin-bottom rounded-full"
                        style={{
                          height: "100%",
                          background: sel.accentColor,
                          animation: isPlaying ? `breathe ${0.7 + i * 0.23}s ease-in-out ${i * 0.12}s infinite` : "none",
                          transform: `scaleY(${0.4 + ((i * 37) % 5) / 8})`,
                        }}
                      />
                    ))}
                  </span>
                  {/* Spotify 嵌入播放器沒有音量 API，綁 Spotify 時不顯示音量滑桿 */}
                  {!spId && <label className="flex items-center gap-2 text-dim">
                    <Volume2 aria-hidden size={18} />
                    <span className="sr-only">音量</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setVolume(v);
                        audio.current?.setVolume(v);
                      }}
                      className="h-11 w-24 accent-[#8CC4EC]"
                    />
                  </label>}
                  {listenUrl && (
                    <a href={listenUrl} target="_blank" rel="noopener" className="btn btn-ghost btn-sm">
                      <ExternalLink aria-hidden size={14} />
                      {spId && !sel.externalUrl ? "在 Spotify 開啟" : "完整歌曲"}
                    </a>
                  )}
                </div>
                {spId ? (
                  <div className="border-b border-white/10 bg-white/[0.02] px-5 py-3 md:px-8">
                    {/* Spotify 官方嵌入播放器（保留 Spotify 標誌）；上方的按鈕與進度條都是在控制它 */}
                    <div ref={sp.hostRef} className="min-h-[80px] overflow-hidden rounded-xl" />
                    <p className="mt-2 text-xs text-dim">
                      {sp.failed
                        ? "Spotify 播放器載入失敗，請改用「在 Spotify 開啟」收聽。"
                        : "由 Spotify 提供播放。未登入 Spotify 時播放 30 秒試聽；在這個瀏覽器登入 Spotify 後可聽完整首。"}
                    </p>
                  </div>
                ) : !sel.audioUrl && (
                  <p className="border-b border-white/10 bg-white/[0.02] px-5 py-2 text-xs text-dim md:px-8">
                    目前播放的是依這張黑膠即時合成的環境音（示範）。正式曲目確認授權後替換。
                  </p>
                )}

                {/* 故事 */}
                <div className="p-6 md:p-10">
                  <p className="eyebrow" style={{ color: sel.accentColor }}>
                    {sel.role}・{sel.name}
                  </p>
                  <h3 id="story-title" className="mt-2 font-serif text-[28px] font-bold md:text-[34px]">
                    {sel.storyTitle}
                  </h3>
                  <p className="mt-2 text-sm text-dim">{sel.bio}</p>
                  <StoryBody text={sel.storyContent} className="mt-7 max-w-2xl text-[17px] leading-[1.9] text-mist/90" />

                  <div className="mt-9 flex flex-wrap gap-3">
                    <button type="button" onClick={release} className="btn btn-primary">
                      <Undo2 aria-hidden size={17} />
                      再抽一張
                    </button>
                    <button type="button" onClick={share} className="btn btn-ghost">
                      <Link2 aria-hidden size={17} />
                      {copied ? "已複製連結" : "分享這張黑膠"}
                    </button>
                    <Link href={`/interactive/echoes/${sel.id}`} className="btn btn-ghost">
                      故事獨立頁
                    </Link>
                  </div>
                </div>
              </div>
            </m.article>
          )}
        </AnimatePresence>
      </div>

      {staff.some((s) => s.sample) && (
        <p className="mt-6 text-center text-xs text-dim">※ 部分黑膠為示範內容（暱稱、歌曲與故事皆為佔位），工作人員繳交後陸續替換。</p>
      )}
    </div>
  );
}

/** 2D 降級舞台：CSS 黑膠 + 簡易光效（不支援 WebGL、低階裝置、reduced-motion、或使用者手動開啟） */
function SimpleStage({
  accent,
  name,
  song,
  spinning,
  onPick,
  idx,
}: {
  accent: string;
  name: string;
  song: string;
  spinning: boolean;
  onPick: () => void;
  idx: number;
}) {
  return (
    <div className="absolute inset-0 grid place-items-center pb-24">
      <AnimatePresence mode="wait">
        <m.button
          key={idx}
          type="button"
          onClick={onPick}
          tabIndex={-1}
          aria-hidden
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative grid aspect-square h-[62%] max-h-[340px] place-items-center rounded-full"
          style={{ boxShadow: `0 0 90px -10px ${accent}88` }}
        >
          <span
            className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,#06080c_0,#06080c_2px,#141b28_3px,#06080c_4px)]"
            style={{ animation: "spin 5s linear infinite", animationPlayState: spinning ? "running" : "paused" }}
          >
            <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,transparent_0_8%,rgba(190,235,255,.22)_12%,transparent_17%_55%,rgba(190,235,255,.16)_60%,transparent_65%)]" />
          </span>
          <span
            className="relative grid h-[38%] w-[38%] place-items-center rounded-full text-center"
            style={{ background: `radial-gradient(circle at 30% 28%, #fff, ${accent} 30%, #001218 115%)` }}
          >
            <span className="px-1 leading-tight [text-shadow:0_1px_8px_rgba(0,18,24,.9)]">
              <span className="block font-serif text-xl font-bold text-moon">{name}</span>
              <span className="block text-[10px] text-moon/90">{song}</span>
            </span>
            <span className="absolute h-2.5 w-2.5 translate-y-[1px] rounded-full bg-night opacity-0" />
          </span>
        </m.button>
      </AnimatePresence>
    </div>
  );
}
