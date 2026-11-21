"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Disc3, X } from "lucide-react";
import type { CrewBoardGroup, CrewCard } from "@/lib/crew";
import TeamAnchorBar from "@/components/TeamAnchorBar";

const CLOSE_MS = 280;

/** 團隊名單：部門分組的頭像牆，點擊頭像開啟成員詳細資料（桌機左側抽屜、手機底部面板）。 */
export default function CrewBoard({ groups }: { groups: CrewBoardGroup[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [member, setMember] = useState<CrewCard | null>(null);
  const [shown, setShown] = useState(false);
  // 瀏覽器讀到的 Gravatar About Me：string＝內容，null＝沒有／讀取失敗；未列入＝讀取中
  const [live, setLive] = useState<Record<string, string | null>>({});
  const requested = useRef(new Set<string>());

  /** 滑過／聚焦／點開成員時向 Gravatar 讀取 About Me（每位成員每次載入頁面只讀一次；失敗時下次點開再試）。 */
  const refreshAbout = (p: CrewCard) => {
    if (!p.hash || requested.current.has(p.key)) return;
    requested.current.add(p.key);
    fetch(`https://api.gravatar.com/v3/profiles/${p.hash}`, { cache: "no-store" })
      .then(async (res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { description?: string };
        return data.description?.trim() || null;
      })
      .then((about) => setLive((prev) => ({ ...prev, [p.key]: about })))
      .catch(() => {
        requested.current.delete(p.key);
        setLive((prev) => ({ ...prev, [p.key]: null }));
      });
  };

  const open = (p: CrewCard, el: HTMLElement) => {
    triggerRef.current = el;
    setMember(p);
    refreshAbout(p);
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
    // 每次點開成員都從面板頂部開始，不沿用上一位成員的捲動位置
    if (panelRef.current) panelRef.current.scrollTop = 0;
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

  return (
    <>
      {groups.map((g) => (
        <section key={g.id} id={`crew-${g.id}`} aria-labelledby={`crew-${g.id}-h`} className="mt-16 scroll-mt-24 md:mt-24">
          <div className="reveal">
            <p className="eyebrow">
              {g.en} · {g.members.length}
            </p>
            <h2
              id={`crew-${g.id}-h`}
              className="mt-2 bg-gradient-to-br from-moon via-mist to-glow bg-clip-text font-serif text-[40px] font-bold leading-tight tracking-wide text-transparent md:text-[56px]"
            >
              {g.dept}
            </h2>
            <p className="mt-3 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-mist/80 md:text-base">{g.desc}</p>
          </div>
          {splitTeams(g.members).map((block) => (
            <div key={block.team ?? "_"} className={block.team ? "mt-12" : ""}>
              {block.team && (
                <h3 className="reveal flex items-baseline gap-3 border-b border-white/10 pb-3 font-serif text-2xl font-bold tracking-wide text-moon">
                  {block.team}
                  <span className="font-sans text-xs font-normal tracking-widest text-dim">{block.members.length} 人</span>
                </h3>
              )}
              <ul className="mt-8 grid grid-cols-3 gap-x-3 gap-y-7 sm:gap-x-4 md:grid-cols-4 md:gap-x-6 lg:grid-cols-5 xl:grid-cols-6">
                {block.members.map((p, i) => (
                  <li key={p.key} className="reveal" style={{ "--d": `${(i % 6) * 60}ms` } as React.CSSProperties}>
                    <button
                      type="button"
                      aria-haspopup="dialog"
                      onClick={(e) => open(p, e.currentTarget)}
                      onPointerEnter={() => refreshAbout(p)}
                      onFocus={() => refreshAbout(p)}
                      className="group flex w-full flex-col items-center rounded-xl text-center outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-4 focus-visible:ring-offset-night"
                    >
                      <Avatar p={p} className="w-full max-w-40 transition-[transform,border-color] duration-300 group-hover:-translate-y-1 group-hover:border-glow/45" />
                      <span className="mt-2.5 text-[15px] font-bold tracking-wide text-moon sm:mt-3 sm:text-[17px]">{p.name}</span>
                      {p.sub && <span className="mt-0.5 text-sm text-dim">{p.sub}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}

      <TeamAnchorBar groups={groups.map((g) => ({ id: g.id, label: g.dept }))} />

      <dialog
        ref={dialogRef}
        aria-labelledby="crew-dialog-name"
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-mist backdrop:bg-transparent"
      >
        {/* 背景：模糊 + 壓暗；點擊關閉 */}
        <div aria-hidden data-shown={shown} onClick={close} className="underwater absolute inset-0" />
        <div
          ref={panelRef}
          className={[
            "absolute inset-x-0 bottom-0 h-[88dvh] md:inset-y-0 md:left-0 md:right-auto md:h-dvh md:w-[min(28rem,92vw)]",
            "flex flex-col overflow-y-auto border-glow/15 bg-night-2 shadow-[0_0_80px_-20px_rgb(0_0_0/0.8)] transition-transform duration-300 ease-[var(--ease-ripple)]",
            "rounded-t-3xl border-t md:rounded-none md:rounded-r-3xl md:border-r md:border-t-0",
            shown ? "translate-x-0 translate-y-0" : "translate-y-full md:translate-x-[-100%] md:translate-y-0",
          ].join(" ")}
        >
          {member && (
            <Detail
              key={member.key}
              p={member}
              about={live[member.key] ?? undefined}
              loading={!!member.hash && !(member.key in live)}
              onClose={close}
            />
          )}
        </div>
      </dialog>
    </>
  );
}

/** 依組別分段：沒有組別的成員（例如部長）在最前，其餘依第一次出現的順序。 */
function splitTeams(members: CrewCard[]) {
  const blocks: { team?: string; members: CrewCard[] }[] = [];
  for (const p of members) {
    let b = blocks.find((x) => x.team === p.team);
    if (!b) blocks.push((b = { team: p.team, members: [] }));
    b.members.push(p);
  }
  return blocks.sort((a, b) => Number(!!a.team) - Number(!!b.team));
}

function Avatar({ p, className = "", eager }: { p: CrewCard; className?: string; eager?: boolean }) {
  return (
    <span
      className={`relative block aspect-square overflow-hidden rounded-xl border border-glow/15 bg-night-3 shadow-[0_16px_32px_-12px_rgb(0_0_0/0.55)] ${className}`}
    >
      <span
        aria-hidden
        className="absolute inset-0 grid place-items-center bg-gradient-to-br from-tide/35 via-night-2 to-night font-serif text-2xl font-bold text-moon/85 sm:text-4xl"
      >
        {p.name.slice(-2)}
      </span>
      {p.avatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.avatar}
          alt=""
          width={160}
          height={160}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "low"}
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full scale-105 object-cover transition-transform duration-500 group-hover:scale-110"
        />
      )}
    </span>
  );
}

function Detail({ p, about, loading, onClose }: { p: CrewCard; about?: string; loading: boolean; onClose: () => void }) {
  return (
    <>
      <div className="sticky top-0 z-10 flex justify-end bg-night-2/85 p-3 backdrop-blur md:p-4">
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="關閉"
          className="grid h-10 w-10 place-items-center rounded-full text-dim transition-colors hover:bg-white/5 hover:text-moon focus-visible:outline-2 focus-visible:outline-glow"
        >
          <X aria-hidden size={20} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-8 md:px-8">
        <h2 id="crew-dialog-name" className="font-serif text-[34px] font-bold leading-tight tracking-wide text-moon">
          {p.name}
        </h2>
        <p className="mt-1.5 text-[15px] text-glow">{p.title}</p>
        {p.sub && p.sub !== p.title && <p className="text-sm text-dim">{p.sub}</p>}

        <Avatar p={p} eager className="mt-6 w-40" />

        <section aria-labelledby="crew-dialog-about" className="mt-7">
          <p id="crew-dialog-about" className="eyebrow">
            About me
          </p>
          {loading ? (
            <span aria-busy="true" aria-label="載入自我介紹中" className="mt-4 block space-y-3">
              <span className="block h-3.5 w-full animate-pulse rounded bg-white/[0.07]" />
              <span className="block h-3.5 w-11/12 animate-pulse rounded bg-white/[0.07]" />
              <span className="block h-3.5 w-3/5 animate-pulse rounded bg-white/[0.07]" />
            </span>
          ) : about ? (
            <p className="mt-3 whitespace-pre-line text-[15px] leading-[1.9] text-mist/90">{about}</p>
          ) : (
            <p className="mt-3 text-[15px] leading-[1.9] text-dim">
              這位工人十分安靜，連一段文采都沒留下，只在電影節中留下了光影交錯的回憶。
            </p>
          )}
        </section>

        <div className="mt-auto pt-10">
          {p.echo ? (
            <Link
              href={`/interactive/echoes/${p.echo.id}`}
              className="group/vinyl flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-glow/40 hover:bg-white/[0.06]"
              style={{ "--accent": p.echo.accentColor } as React.CSSProperties}
            >
              <Vinyl accent={p.echo.accentColor} cover={p.echo.vinylCover} />
              <span className="min-w-0 flex-1">
                <span className="eyebrow block" style={{ color: p.echo.accentColor }}>
                  Echoes of Home
                </span>
                <span className="mt-1.5 block truncate text-lg font-bold text-moon">{p.echo.songTitle}</span>
                <span className="block truncate text-sm text-dim">{p.echo.songArtist}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-glow">
                  閱讀故事
                  <ArrowRight aria-hidden size={15} className="transition-transform group-hover/vinyl:translate-x-1" />
                </span>
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-5 rounded-2xl border border-dashed border-white/10 p-4">
              <Vinyl muted />
              <span>
                <span className="eyebrow block text-dim">Echoes of Home</span>
                <span className="mt-1.5 flex items-center gap-1.5 text-[15px] text-dim">
                  <Disc3 aria-hidden size={16} />
                  歌曲與故事即將上線
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Vinyl({ accent = "#334155", cover, muted }: { accent?: string; cover?: string; muted?: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative grid h-24 w-24 shrink-0 place-items-center rounded-full bg-[repeating-radial-gradient(circle,#06080c_0,#06080c_2px,#1a2434_3px,#06080c_4px)] ${
        muted ? "opacity-40" : "animate-spin-slow"
      }`}
      style={muted ? undefined : { boxShadow: `0 0 36px -8px ${accent}` }}
    >
      <span
        className="h-9 w-9 rounded-full bg-cover bg-center"
        style={{
          backgroundImage: cover
            ? `url(${cover})`
            : `radial-gradient(circle at 30% 30%, #fff, ${accent} 35%, #001218 120%)`,
        }}
      />
      <span className="absolute h-1.5 w-1.5 rounded-full bg-night" />
    </span>
  );
}
