import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { comingSoonFilms, programs } from "@/lib/programs";
import { breadcrumbLd, festivalLd } from "@/lib/jsonld";
import { dayOf, sessions } from "@/lib/schedule";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import Schedule from "@/components/Schedule";
import VendorWall from "@/components/VendorWall";
import ProgramMarquee from "@/components/ProgramMarquee";
import Echoes from "@/components/echoes/Echoes";
import { staff } from "@/lib/staff";
import LumaButton from "@/components/LumaButton";
import AddToCalendar from "@/components/AddToCalendar";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = pageMeta({
  title: "活動與市集｜活動時間表",
  description: "2027 中興星空電影節完整日程：3/19（五）放映《美國女孩》並規劃阮鳳儀導演映後講座，3/20（六）第二部電影敬請期待（研擬中），另有市集、展覽、表演與《反正你也不睡覺》讀書會。",
  path: "/program",
});

/** 市集兩天的營業時間，例如「3/19（五）15:00–20:30・3/20（六）14:00–20:30」 */
const marketTimes = sessions
  .filter((s) => s.category === "market")
  .map((s) => `${dayOf(s.day).label}（${dayOf(s.day).weekday}）${s.start}–${s.end}`)
  .join("・");

export default function ProgramPage() {
  return (
    <>
      <JsonLd data={[festivalLd, breadcrumbLd([{ name: "活動與市集", path: "/program" }])]} />
      <PageHero
        eyebrow="Program"
        title="活動與市集"
        summary={`下午有市集、展覽、快閃遊戲與街頭藝人演出
18:30 於星空下放映電影
一起來逛逛吧!`}
      >
        <LumaButton source="program" />
        <AddToCalendar />
      </PageHero>

      <section id="market" aria-labelledby="vendor-h" className="container-x scroll-mt-24">
        <SectionHeading
          id="vendor-h"
          index={1}
          eyebrow="Market"
          title={
            <>
              市集攤商
              {/* 市集時間：讀時間表的市集場次，時間表改了這裡跟著變 */}
              <span className="mt-1 block font-sans text-sm font-normal tracking-normal text-dim sm:ml-4 sm:mt-0 sm:inline">
                {marketTimes}
              </span>
            </>
          }
        />
        <div className="reveal mt-8">
          <VendorWall />
        </div>
      </section>

      <section aria-labelledby="list-h" className="container-x mt-24">
        <SectionHeading id="list-h" index={2} eyebrow="Highlights" title="節目介紹" />
        {/* 市集已有上方「市集攤商」區塊，這裡不列星空市集卡 */}
        <ProgramMarquee programs={programs.filter((p) => p.slug !== "market")} placeholders={comingSoonFilms} />
      </section>

      {/* 波紋的音像：直接嵌入黑膠圓環互動（與 /interactive/echoes 同一個元件） */}
      <section aria-labelledby="echoes-h" className="container-x mt-24">
        <SectionHeading
          id="echoes-h"
          index={3}
          eyebrow="Echoes of Home"
          title="波紋的音像"
          more={{ href: "/interactive/echoes", label: "全部黑膠" }}
        />
        <p className="reveal mt-4 max-w-2xl text-mist/90">
          每位工作人員選了一首歌、寫了一篇關於家與漂泊的故事，化成一張黑膠。轉動圓環，抽出一張，聽見某個人的情感波紋。
        </p>
        <div className="mt-8">
          <Echoes staff={staff} />
        </div>
      </section>

      <section aria-labelledby="tt-h" className="container-x mt-24">
        <SectionHeading id="tt-h" index={4} eyebrow="Timetable" title="日程總覽" />
        <div className="reveal mt-8">
          <Schedule />
        </div>
      </section>
    </>
  );
}
