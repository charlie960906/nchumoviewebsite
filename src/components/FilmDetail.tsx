import Link from "next/link";
import { Play } from "lucide-react";
import type { Program } from "@/lib/programs";
import { dayOf, type Session } from "@/lib/schedule";

const WEEKDAY_EN = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];

/**
 * 電影介紹頁內文：場次與得獎放同一列、劇情與引言左右並排，
 * 避免「右上一行時間、左下一串得獎」那種兩側各留大片空白的排法。
 */
export default function FilmDetail({
  program: p,
  session,
}: {
  program: Program & { film: NonNullable<Program["film"]> };
  session?: Session;
}) {
  const f = p.film;
  const day = session ? dayOf(session.day) : null;
  const [, mm, dd] = day?.date.split("-") ?? [];
  const weekday = day ? WEEKDAY_EN[new Date(`${day.date}T12:00:00+08:00`).getUTCDay()] : "";

  return (
    <div className="container-x grid gap-12 md:gap-14">
      {/* 場次 + 得獎（沒有得獎資料時改放延伸看點） */}
      <section aria-label="場次與得獎" className="reveal grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-14">
        <div>
          {session ? (
            <p className="flex items-center gap-3 whitespace-nowrap font-mono text-[22px] tracking-[0.08em] text-moon sm:text-[28px] md:text-4xl md:tracking-[0.12em]">
              <Play aria-hidden className="size-5 shrink-0 fill-current sm:size-6 md:size-7" />
              <span>
                {mm}/{dd} {weekday} {session.start}
              </span>
            </p>
          ) : (
            <p className="font-mono text-2xl tracking-[0.12em] text-dim">場次待公布</p>
          )}
          {f.format && <p className="mt-3 text-sm tracking-[0.08em] text-dim">{f.format}</p>}
          <p className="mt-2 text-sm tracking-[0.08em] text-mist/80">國立中興大學・草地放映・免費入場，免報名</p>
        </div>

        {f.awards?.length ? (
          <ul className="grid gap-x-10 gap-y-2.5 text-[15px] tracking-[0.06em] sm:grid-cols-2 md:border-l md:border-white/10 md:pl-14">
            {f.awards.map((a) => (
              <li key={`${a.year}-${a.title}`} className="flex gap-3">
                <span className="shrink-0 font-mono text-glow">{a.year}</span>
                <span className="text-mist/90">{a.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          p.highlights && (
            <div className="md:border-l md:border-white/10 md:pl-14">
              <h2 className="eyebrow">延伸看點</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.highlights.map((h) => (
                  <li key={h} className="tag tag-glow !py-1">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </section>

      {/* 劇情介紹 + 側欄（引言／講座／參加方式） */}
      <section aria-labelledby="story-h" className="grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-14">
        <article className="grid content-start gap-6">
          <h2 id="story-h" className="eyebrow reveal">
            劇情介紹
          </h2>
          {p.body.map((t, i) => (
            <p
              key={i}
              className="reveal text-[17px] leading-[1.95] tracking-[0.06em] text-mist/90"
              style={{ "--d": `${i * 60}ms` } as React.CSSProperties}
            >
              {t}
            </p>
          ))}
        </article>

        <aside className="grid content-start gap-5">
          {f.quote && (
            <figure className="reveal border-l-2 border-glow/60 pl-5">
              <blockquote className="font-serif text-lg leading-relaxed text-moon">「{f.quote.text}」</blockquote>
              <figcaption className="mt-3 text-sm text-dim">— {f.quote.by}</figcaption>
            </figure>
          )}

          {p.slug === "american-girl" && (
            <Link href="/program/american-girl-talk" className="card card-hover reveal block p-5">
              <span className="eyebrow">映後講座</span>
              <span className="mt-2 block font-bold">阮鳳儀導演映後講座與 QA 提問 →</span>
            </Link>
          )}

          <div className="card reveal p-6" style={{ "--d": "80ms" } as React.CSSProperties}>
            <h2 className="eyebrow">如何參加</h2>
            <ol className="mt-4 grid list-decimal gap-2 pl-5 text-sm text-mist/90 marker:font-mono marker:text-glow">
              <li>不需報名，活動當天直接到場即可</li>
              <li>草地席地而坐，建議攜帶野餐墊與薄外套</li>
              <li>想收到提醒？點右上「訂閱活動提醒」在 Luma 留下 Email</li>
            </ol>
          </div>
        </aside>
      </section>
    </div>
  );
}
