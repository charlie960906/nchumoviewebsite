import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { programHref, type Program } from "@/lib/programs";
import { dayOf, sessions, type Session } from "@/lib/schedule";
import MarqueeTrack from "./MarqueeTrack";

const KIND_EN: Record<Program["kind"], string> = {
  film: "SCREENING",
  talk: "TALK",
  market: "MARKET",
};

const sessionsOf = (p: Program) =>
  p.sessionIds.map((id) => sessions.find((s) => s.id === id)).filter((s): s is Session => !!s);

/** facts 裡的「日期」欄（如 2027/3/18（四）），給不在時間表上的活動用 */
const factDate = (p: Program) => {
  const m = p.facts.find((f) => f.label.includes("日期"))?.value.match(/(\d{1,2})\/(\d{1,2})（(.)）/);
  return m ? { key: m[1].padStart(2, "0") + m[2].padStart(2, "0"), label: `${m[1]}/${m[2]}（${m[3]}）` } : undefined;
};

/** 依時間先後排序（第一個場次的日期＋開始時間；沒有場次就用 facts 的日期）；都沒有的排最後 */
export function sortByTime(list: Program[]) {
  const key = (p: Program) => {
    const s = sessionsOf(p)[0];
    if (s) return `${s.day} ${s.start}`;
    const d = factDate(p);
    return d ? `${d.key} 99:99` : "9999";
  };
  return [...list].sort((a, b) => key(a).localeCompare(key(b)));
}

/** 卡片右上的「日期　時間」：讀時間表場次；跨兩天的（如市集）列出兩天，待定場次顯示「時間待定」 */
function programWhen(p: Program) {
  const ss = sessionsOf(p);
  if (!ss.length) {
    const d = factDate(p);
    return d ? `${d.label}　時間待定` : "日期待公布";
  }
  const label = (s: Session) => `${dayOf(s.day).label}（${dayOf(s.day).weekday}）`;
  if (ss.length > 1) return ss.map(label).join("・");
  const s = ss[0];
  return `${label(s)}　${p.tentative || s.tentative ? "時間待定" : `${s.start} – ${s.end}`}`;
}

/** 節目卡（樣式比照首頁原本「星空下的兩個夜晚」（現名「星空下的每一場相遇」）的放映卡，縮小成一排四張的尺寸） */
function ProgramCard({ p, tabbable, soon = false }: { p: Program; tabbable: boolean; soon?: boolean }) {
  const lead = p.facts[0];
  const tab = tabbable ? undefined : -1;
  // 片單未定的「敬請期待」卡：同樣外觀，但沒有連結
  if (soon)
    return (
      <article className="card relative flex h-full flex-col overflow-hidden border-dashed p-5">
        <p className="relative flex flex-wrap items-center justify-between gap-x-2 gap-y-1 font-mono text-xs">
          <span className="tracking-[0.2em] text-glow">{KIND_EN[p.kind]}</span>
          <span className="text-shore">{programWhen(p)}</span>
        </p>
        <div className="relative mt-4 grid aspect-[3/2] w-full place-items-center overflow-hidden rounded-sm bg-[#1d2a3a]">
          <span className="font-mono text-[11px] tracking-[0.3em] text-white/40">COMING SOON</span>
        </div>
        <div className="relative mt-4 border-b border-white/10 pb-3">
          <h3 className="font-serif text-xl font-black">{p.title}</h3>
          {p.titleEn && <p className="mt-1 font-mono text-xs text-dim">{p.titleEn}</p>}
        </div>
        <p className="relative mt-3 flex-1 text-sm text-dim">{lead && `${lead.label} ${lead.value}`}</p>
        <p className="relative mt-5">
          <span className="tag tag-warn">正在研擬中</span>
        </p>
      </article>
    );
  return (
    <article className="card card-hover group/card relative flex h-full flex-col overflow-hidden p-5">
      <p className="relative flex flex-wrap items-center justify-between gap-x-2 gap-y-1 font-mono text-xs">
        <span className="tracking-[0.2em] text-glow">{KIND_EN[p.kind]}</span>
        <span className="text-shore">{programWhen(p)}</span>
      </p>
      <div className="relative mt-4 aspect-[3/2] w-full overflow-hidden rounded-sm bg-[#1d2a3a]">
        {p.film?.still ? (
          <Image
            src={encodeURI(p.film.still)}
            alt={`《${p.title}》劇照`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 80vw"
            className="object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center font-mono text-[11px] tracking-[0.3em] text-white/40">PHOTO · COMING SOON</span>
        )}
      </div>
      <div className="relative mt-4 border-b border-white/10 pb-3">
        <h3 className="font-serif text-xl font-black">
          <Link href={programHref(p.slug)} tabIndex={tab} className="after:absolute after:inset-0 hover:text-glow">
            {p.kind === "film" ? `《${p.title}》` : p.title}
          </Link>
        </h3>
        {p.titleEn && <p className="mt-1 font-mono text-xs text-dim">{p.titleEn}</p>}
      </div>
      <p className="relative mt-3 flex-1 text-sm text-dim">{lead && `${lead.label} ${lead.value}`}</p>
      <div className="relative z-10 mt-5">
        <Link
          href={programHref(p.slug)}
          tabIndex={tab}
          className="group inline-flex min-h-10 items-center gap-1.5 border-b-2 border-glow text-sm font-bold text-glow hover:border-moon hover:text-moon"
        >
          了解更多
          <ArrowRight aria-hidden size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

/**
 * 節目跑馬燈：寬版一排四張，慢速無限往左滑；左右兩端以遮罩淡出／淡入，中間兩張最清楚。
 * 可拖拉往前往後移動；滑鼠移入或鍵盤聚焦時暫停（動作見 MarqueeTrack，樣式見 globals.css 的 .program-marquee）。放在 .container-x 裡使用。
 */
export default function ProgramMarquee({
  programs,
  placeholders = [],
  reflection = false,
}: {
  programs: Program[];
  /** 片單未定的「敬請期待」卡（comingSoonFilms），依時間插入但不可點 */
  placeholders?: Program[];
  reflection?: boolean;
}) {
  const soon = new Set(placeholders.map((p) => p.slug));
  const list = sortByTime([...programs, ...placeholders]);
  // 清單至少要撐滿可視區（一排四張）才能無縫循環，不足就先重複補滿
  const base = list.length >= 4 ? list : Array.from({ length: Math.ceil(4 / list.length) }, () => list).flat();
  const items = (mirror: boolean) =>
    [...base, ...base].map((p, i) => {
      const dup = mirror || i >= base.length;
      return (
        <li
          key={`${p.slug}-${i}`}
          className={`w-[78cqw] shrink-0 px-2.5 sm:w-[45cqw] lg:w-[25cqw] ${dup ? "program-marquee-dup" : ""}`}
          aria-hidden={dup || undefined}
        >
          <ProgramCard p={p} tabbable={!dup} soon={soon.has(p.slug)} />
        </li>
      );
    });
  return (
    <div className="program-marquee reveal -mx-2.5 mt-8">
      <MarqueeTrack reflection={reflection ? items(true) : undefined}>{items(false)}</MarqueeTrack>
    </div>
  );
}
