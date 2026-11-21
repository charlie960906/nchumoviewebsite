import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { THEME, THEME_CHAR } from "@/lib/theme";
import { breadcrumbLd } from "@/lib/jsonld";
import { zoneName, zonePath, zones } from "@/lib/zones";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import LumaButton from "@/components/LumaButton";
import JsonLd from "@/components/JsonLd";
import StoryJourney from "@/components/StoryJourney";

export const metadata: Metadata = pageMeta({
  title: "策展理念",
  description: `「${THEME}」策展理念：展區「泅 Siû」談親情與友情（傍、佮），展區「涯 Giâ」談家與土地認同（佇、佗），以水的固、液、氣三態串起從提問到抵達的敘事。`,
  path: "/themes",
});

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function ThemesPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "策展理念", path: "/themes" }])} />
      <PageHero
        eyebrow="Curatorial Theme"
        title={`策展理念：${THEME}`}
        summary={`「${THEME}」取台語「水泱 tsuí-iann」
（水面漣漪）之意，
談人在異鄉與家鄉之間尋找歸屬的過程。
現場以「泅」與「涯」兩大展區呈現：
前者關於親情與友情，
後者關於家與土地認同，各自從「探索」走到「抵達」。`}
      >
        {zones.map((z) => (
          <Link key={z.slug} href={zonePath(z)} className="btn btn-ghost">
            {zoneName(z)}
          </Link>
        ))}
      </PageHero>

      <section aria-labelledby="idea-h" className="container-x">
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
          <div aria-hidden className="reveal relative mx-auto grid h-56 w-56 place-items-center lg:mx-0">
            {[0, 1, 2].map((i) => (
              <span key={i} className="absolute inset-0 animate-ripple-out rounded-full border border-glow/40" style={{ animationDelay: `${i * 0.8}s` }} />
            ))}
            <span className="font-serif text-[120px] font-bold leading-none text-moon">{THEME_CHAR}</span>
          </div>
          <div>
            <SectionHeading id="idea-h" index={1} eyebrow="Core Idea" title="電影是平靜的水面" />
            <p className="reveal mt-5 text-mist/90">
              因為觀者與創作者的情感交會，光影層疊出前行的路。「{THEME_CHAR}」象徵水滴墜落水面泛起微波——人類在異鄉與家鄉之間摸索方向、尋覓歸屬的流動歷程。
            </p>
            <blockquote className="prose-poem reveal mt-6 border-l-2 border-glow/50 pl-5 text-lg text-moon">
              願你在漂泊裡仍能晤見流光，在水紋最深層之處，緩慢形成抵達的眼角……以生命為定點，歪扭地繪出一圈圈沒有終點的尋途，落腳於一陣陣深淺互織的漣漪。
            </blockquote>
          </div>
        </div>
      </section>

      <section aria-labelledby="story-h" className="mt-24 md:mt-28">
        <div className="container-x">
          <SectionHeading id="story-h" index={2} eyebrow="Three States" title="沉浸式三態故事線：固 → 液 → 氣" />
          <p className="reveal mt-4 max-w-2xl text-mist/90">從一滴水「泱」開始，經過固、液、氣，最後落成「泅」與「涯」兩個展區。水有三種形態，歸屬也是。整個電影節——從網站到現場——都沿著這條線走。</p>
        </div>
        {/* 完整版：往下捲、鏡頭沿著水的旅程往右走（首頁 StatesScroll 為簡化版） */}
        <StoryJourney labelledBy="story-h" />
      </section>

      <section aria-labelledby="zones-h" className="container-x mt-24 scroll-mt-24 md:mt-28" id="zones">
        <SectionHeading id="zones-h" index={3} eyebrow="Two Zones" title="兩大展區" />
        <p className="reveal mt-4 max-w-2xl text-mist/90">水滴落下的漣漪，在現場化成兩個展區。每個展區各有兩個空間，從「探索」走到「抵達」。選一個走進去看看。</p>
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {zones.map((z, i) => (
            <li key={z.slug} className="reveal" style={d(i * 100)}>
              <Link
                href={zonePath(z)}
                className="card group relative flex h-full flex-col overflow-hidden p-6 transition-colors hover:border-[color:var(--zone)] md:p-10"
                style={{ "--zone": `${z.color}99` } as React.CSSProperties}
              >
                {z.slug === "siu" ? (
                  <span aria-hidden className="pointer-events-none absolute -bottom-28 -right-28 h-80 w-80">
                    {[0, 56, 112].map((inset, k) => (
                      <span key={inset} className="absolute rounded-full border" style={{ inset, borderColor: `${z.color}${["1f", "33", "4d"][k]}` }} />
                    ))}
                  </span>
                ) : (
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-24">
                    <span className="block h-px" style={{ background: `${z.color}4d` }} />
                    <span className="mt-4 block h-px" style={{ background: `${z.color}26` }} />
                  </span>
                )}
                <div className="flex items-end gap-5">
                  <span aria-hidden className="font-serif text-[104px] font-black leading-[0.85] md:text-[148px]" style={{ color: z.color }}>
                    {z.char}
                  </span>
                  <div className="pb-2">
                    <p className="eyebrow" style={{ color: z.color }}>
                      Zone · {z.roman}
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-bold">
                      {zoneName(z)}｜{z.subtitle}
                    </h3>
                  </div>
                </div>
                <p className="mt-5 flex-1 text-mist/90">{z.intro}</p>
                <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-dim">
                  <span className="tag" style={{ borderColor: `${z.color}80`, color: z.color }}>
                    {z.rooms[0].char} {z.rooms[0].phase}
                  </span>
                  <ArrowRight aria-hidden size={14} />
                  <span className="tag" style={{ borderColor: `${z.color}80`, color: z.color }}>
                    {z.rooms[1].char} {z.rooms[1].phase}
                  </span>
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-glow group-hover:underline">
                  走進展區「{z.char}」 <ArrowRight aria-hidden size={15} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-x mt-20">
        <div className="card reveal flex flex-wrap items-center justify-between gap-5 p-6 md:p-8">
          <div>
            <h2 className="font-serif text-2xl font-bold">親自走一趟展區</h2>
            <p className="mt-1 text-sm text-dim">3/19（五）15:00、3/20（六）14:00 起開放，免費入場。</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LumaButton source="themes" />
            <Link href="/guide" className="btn btn-ghost">
              看場地地圖
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
