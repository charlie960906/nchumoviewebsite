import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { programs } from "@/lib/programs";
import { breadcrumbLd, festivalLd } from "@/lib/jsonld";
import { site } from "@/lib/site";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import Schedule from "@/components/Schedule";
import LumaButton from "@/components/LumaButton";
import AddToCalendar from "@/components/AddToCalendar";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = pageMeta({
  title: "活動與市集｜活動時間表",
  description: "2027 興大國際星空電影節完整日程：3/19（五）放映《美國女孩》並規劃阮鳳儀導演映後講座，3/20（六）放映《琳達！琳達！》，另有市集、展覽、表演與《反正你也不睡覺》讀書會。",
  path: "/program",
});

export default function ProgramPage() {
  return (
    <>
      <JsonLd data={[festivalLd, breadcrumbLd([{ name: "活動與市集", path: "/program" }])]} />
      <PageHero
        eyebrow="Program"
        title="活動與市集"
        summary={`${site.name}為期兩天：3 月 19 日（五）15:00–22:00、3 月 20 日（六）14:00–23:00。
每晚 18:30 於星空下放映一部電影，
下午起有市集、展覽、快閃遊戲與現場演出。
所有場次免費且不需報名，當天直接到場即可。`}
      >
        <LumaButton source="program" />
        <AddToCalendar />
      </PageHero>

      <section aria-labelledby="tt-h" className="container-x">
        <SectionHeading id="tt-h" index={1} eyebrow="Timetable" title="日程總覽" />
        <div className="reveal mt-8">
          <Schedule />
        </div>
      </section>

      <section aria-labelledby="list-h" className="container-x mt-24">
        <SectionHeading id="list-h" index={2} eyebrow="Highlights" title="節目介紹" />
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {programs.map((p, i) => (
            <li key={p.slug} className="reveal" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
              <article className="card card-hover relative flex h-full flex-col p-6 md:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`tag ${p.kind === "film" ? "border-shore/50 bg-shore/10 text-shore" : "tag-glow"}`}>{p.kindLabel}</span>
                  {p.tentative && <span className="tag tag-warn">時間待定</span>}
                </div>
                <h3 className="mt-4 font-serif text-2xl font-black">
                  <Link href={`/program/${p.slug}`} className="after:absolute after:inset-0 hover:text-glow">
                    {p.kind === "film" ? `《${p.title}》` : p.title}
                  </Link>
                </h3>
                <p className="mt-3 flex-1 text-sm text-mist/90">{p.summary}</p>
                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {p.facts.slice(0, 4).map((f) => (
                    <div key={f.label}>
                      <dt className="text-xs text-dim">{f.label}</dt>
                      <dd className="font-medium">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-glow">
                  單場詳情 <ArrowRight aria-hidden size={15} />
                </span>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
