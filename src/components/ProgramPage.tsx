import Link from "next/link";
import { ArrowLeft, MessageCircleQuestion } from "lucide-react";
import { programHref, programs, type Program } from "@/lib/programs";
import { dayOf, sessions } from "@/lib/schedule";
import { sessionEvent } from "@/lib/calendar";
import { breadcrumbLd, programLd } from "@/lib/jsonld";
import { site } from "@/lib/site";
import PageHero from "@/components/PageHero";
import FilmTicket from "@/components/FilmTicket";
import FilmDetail from "@/components/FilmDetail";
import LumaButton from "@/components/LumaButton";
import AddToCalendar from "@/components/AddToCalendar";
import JsonLd from "@/components/JsonLd";

/** 節目詳情頁內容。/program/[slug] 與開發者預覽 /program/[slug]/dev 共用 */
export default function ProgramPage({ p, dev = false }: { p: Program; dev?: boolean }) {
  // 星空市集頁已刪除，攤商改在 /program 的「市集攤商」品牌牆；舊網址以 meta refresh 轉過去（靜態匯出沒有伺服器端轉址）
  if (p.kind === "market") {
    const to = programHref(p.slug);
    return (
      <div className="container-x py-24 text-center">
        <meta httpEquiv="refresh" content={`0;url=${to}`} />
        <p>
          星空市集已移到：
          <Link href={to} className="font-bold text-glow hover:underline">
            活動與市集・市集攤商
          </Link>
        </p>
      </div>
    );
  }
  const ss = sessions.filter((s) => p.sessionIds.includes(s.id));
  const title = p.kind === "film" ? `《${p.title}》` : p.title;
  const crumbs = [
    { name: "活動與市集", path: "/program" },
    { name: p.title, path: `/program/${p.slug}` },
  ];
  // 電影票背面的場次文字，例如「2027.03.19」「FRI」「18:30 – 20:30」
  const s0 = ss[0];
  const show = s0
    ? {
        date: dayOf(s0.day).date.replaceAll("-", "."),
        weekday: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(`${dayOf(s0.day).date}T12:00:00+08:00`).getUTCDay()],
        time: `${s0.start} – ${s0.end}`,
        start: s0.start,
      }
    : undefined;
  const others = programs.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      {dev ? (
        <p role="note" className="container-x pt-24">
          <span className="card block !border-warn/40 p-4 text-sm text-amber-200">
            <strong>開發者預覽</strong>：這個頁面{p.hidden ? "目前已下架，一般訪客看不到" : "是公開頁面的預覽"}。網址請勿外流。
          </span>
        </p>
      ) : (
        <JsonLd data={[programLd(p), breadcrumbLd(crumbs)]} />
      )}
      <PageHero
        eyebrow={p.kindLabel}
        title={
          <>
            {title}
            {p.titleEn && <span className="mt-2 block font-sans text-lg font-normal italic text-dim">{p.titleEn}</span>}
          </>
        }
        // 電影頁只留電影票，不顯示摘要與按鈕（摘要仍用於 meta description）
        summary={p.film ? undefined : p.summary}
        ticket={p.film ? <FilmTicket program={{ ...p, film: p.film }} show={show} /> : undefined}
      >
        {!p.film && (
          <>
            <LumaButton source={`program-${p.slug}`}>訂閱活動提醒</LumaButton>
            {ss[0] && !p.tentative && <AddToCalendar event={sessionEvent(ss[0].id)!} icsId={ss[0].id} />}
          </>
        )}
      </PageHero>

      {p.film ? (
        <FilmDetail program={{ ...p, film: p.film }} session={ss[0]} />
      ) : (
      <div className="container-x grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
        <article className="grid content-start gap-5">
          {p.tentative && (
            <p role="note" className="card reveal !border-warn/40 p-4 text-sm text-amber-200">
              <strong>場次資訊待定。</strong>確定後會同步更新本頁、時間表與 Luma 活動頁；訂閱 Luma 活動提醒者將收到 Email 通知。
            </p>
          )}
          {p.body.map((t, i) => (
            <p key={i} className="reveal text-[17px] text-mist/90" style={{ "--d": `${i * 60}ms` } as React.CSSProperties}>
              {t}
            </p>
          ))}

          {p.highlights && (
            <section aria-labelledby="hl-h" className="reveal mt-4">
              <h2 id="hl-h" className="text-xl font-bold">
                延伸看點
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.highlights.map((h) => (
                  <li key={h} className="tag tag-glow !py-1">
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.slug === "american-girl-talk" && (
            <section aria-labelledby="qa-h" className="card reveal mt-4 p-6">
              <MessageCircleQuestion aria-hidden className="text-glow" />
              <h2 id="qa-h" className="mt-3 text-xl font-bold">
                QA 事前提問
              </h2>
              <p className="mt-2 text-sm text-mist/90">想問阮鳳儀導演什麼？事先留下問題，現場將優先挑選回應。</p>
              {site.qaFormUrl ? (
                <a href={site.qaFormUrl} target="_blank" rel="noopener" className="btn btn-ghost mt-4">
                  前往提問表單
                </a>
              ) : (
                <p className="tag tag-warn mt-4">提問表單即將開放</p>
              )}
            </section>
          )}

          {p.slug === "american-girl" && (
            <p className="reveal">
              <Link href="/program/american-girl-talk" className="font-bold text-glow hover:underline">
                → 阮鳳儀導演映後講座與 QA 提問
              </Link>
            </p>
          )}
        </article>

        <aside className="grid content-start gap-5">
          <div className="card reveal p-6">
            <h2 className="eyebrow">場次資訊</h2>
            <dl className="mt-4 grid gap-3">
              {p.facts.map((f) => (
                <div key={f.label} className="flex justify-between gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0">
                  <dt className="shrink-0 text-sm text-dim">{f.label}</dt>
                  <dd className="text-right font-medium">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {ss.length > 0 && (
            <div className="card reveal p-6" style={{ "--d": "80ms" } as React.CSSProperties}>
              <h2 className="eyebrow">時間表場次</h2>
              <ul className="mt-4 grid gap-3">
                {ss.map((s) => (
                  <li key={s.id}>
                    <span className="block font-mono text-sm text-glow">
                      {dayOf(s.day).label}（{dayOf(s.day).weekday}）{s.start}–{s.end}
                    </span>
                    <span className="text-sm">
                      {s.title}
                      {s.tentative && <span className="tag tag-warn ml-2">待定</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card reveal p-6" style={{ "--d": "140ms" } as React.CSSProperties}>
            <h2 className="eyebrow">如何參加</h2>
            <ol className="mt-4 grid list-decimal gap-2 pl-5 text-sm text-mist/90 marker:font-mono marker:text-glow">
              <li>不需報名，活動當天直接到場即可</li>
              <li>想收到提醒？點「訂閱活動提醒」在 Luma 留下 Email</li>
              <li>活動前會收到 Email 提醒與最新消息</li>
            </ol>
          </div>
        </aside>
      </div>
      )}

      <section aria-labelledby="more-h" className="container-x mt-20">
        <h2 id="more-h" className="reveal font-serif text-2xl font-bold">
          其他節目
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug} className="reveal">
              <Link href={programHref(o.slug)} className="card card-hover block h-full p-5">
                <span className="tag">{o.kindLabel}</span>
                <span className="mt-3 block font-bold">{o.kind === "film" ? `《${o.title}》` : o.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/program" className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-glow hover:underline">
          <ArrowLeft aria-hidden size={15} /> 回日程總覽
        </Link>
      </section>
    </>
  );
}
