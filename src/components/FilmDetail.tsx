import Link from "next/link";
import { Play, Sparkles } from "lucide-react";
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
      {/* 場次 + 得獎（沒有得獎資料時改放延伸看點）。得獎一行一項、不換行。
          lg 以上左右並排：得獎在左、場次在右並靠右（lg 時日期字縮小才放得下）；lg 以下上下排、場次在上（md 起靠右） */}
      <section aria-label="場次與得獎" className="reveal grid gap-6 border-b border-white/10 pb-10 md:gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12 xl:gap-14">
        <div className="md:text-right lg:order-2 lg:border-l lg:border-white/10 lg:pl-12 xl:pl-14">
          {session ? (
            <p className="flex items-center gap-3 whitespace-nowrap font-mono md:justify-end text-[22px] tracking-[0.08em] text-moon sm:text-[28px] md:text-4xl md:tracking-[0.12em] lg:text-[30px] lg:tracking-[0.1em] xl:text-4xl xl:tracking-[0.12em]">
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
          <ul className="grid gap-y-2.5 text-[min(13px,3.4vw)] tracking-normal sm:text-[15px] sm:tracking-[0.06em] lg:order-1">
            {f.awards.map((a) => (
              <li key={`${a.year}-${a.title}`} className="flex gap-2 whitespace-nowrap sm:gap-3">
                <span className="shrink-0 font-mono text-glow">{a.year}</span>
                <span className="text-mist/90">{a.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          p.highlights && (
            <div className="lg:order-1">
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

          {p.slug === "american-girl" && (
            <Link href="/interactive/quiz" className="card card-hover reveal block p-5" style={{ "--d": "40ms" } as React.CSSProperties}>
              <span className="eyebrow inline-flex items-center gap-1.5">
                <Sparkles aria-hidden size={14} />
                心理測驗
              </span>
              <span className="mt-2 block font-bold">你是《美國女孩》中的哪個角色？→</span>
              <span className="mt-1 block text-sm text-mist/80">5 個關於愛與歸屬的問題，約 1 分鐘</span>
            </Link>
          )}
        </aside>
      </section>
    </div>
  );
}
