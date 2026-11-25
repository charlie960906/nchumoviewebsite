import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bus, Car, Clapperboard, MapPin, TrainFront } from "lucide-react";
import { site } from "@/lib/site";
import { THEME, THEME_CHAR } from "@/lib/theme";
import { comingSoonFilms, programs } from "@/lib/programs";
import { faqLd, festivalLd } from "@/lib/jsonld";
import Countdown from "@/components/Countdown";
import LumaButton from "@/components/LumaButton";
import AddToCalendar from "@/components/AddToCalendar";
import ProgramMarquee from "@/components/ProgramMarquee";
import MapEmbed from "@/components/MapEmbed";
import Faq from "@/components/Faq";
import MerchPicker from "@/components/MerchPicker";
import JsonLd from "@/components/JsonLd";
import SectionHeading from "@/components/SectionHeading";
import AsciiKoi from "@/components/AsciiKoi";
import StatesScroll from "@/components/StatesScroll";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function Home() {

  return (
    <>
      <JsonLd data={[festivalLd, faqLd]} />

      {/* ───────── Hero ───────── */}
      <section className="relative -mt-16 flex min-h-[100svh] items-center overflow-hidden pt-16">
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {/* 上方海軍藍，往下慢慢過渡到頁面的深藍黑 */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#1d3352_0%,#172b46_30%,#10213a_50%,#071a26_75%,#001218_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_0%,rgba(52,88,132,.35),rgba(52,88,132,0)_100%)]" />
          <AsciiKoi className="absolute inset-0 opacity-90" />
          {/* 中央壓暗，讓標題與文字在魚游過時仍清楚 */}
          <div className="absolute inset-0 bg-[radial-gradient(42%_48%_at_50%_50%,rgba(12,26,46,.6),rgba(12,26,46,0)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night" />
        </div>
        <div className="container-x relative flex flex-col items-center py-[clamp(1rem,4svh,3rem)] text-center">
          <h1 className="reveal-now font-serif font-bold" style={d(70)}>
            <span className="block text-lg tracking-[0.2em] text-mist md:text-2xl">2027 中興星空電影節</span>
            <span className="mt-[clamp(0.25rem,1svh,0.75rem)] flex items-end justify-center gap-4 md:gap-6">
              <span className="text-[min(104px,14svh)] leading-[0.95] text-moon md:text-[min(168px,18svh)]">
                {THEME_CHAR}
              </span>
              <span className="pb-3 text-5xl italic tracking-wide text-glow md:pb-6 md:text-[64px]">Ripple</span>
            </span>
          </h1>

          <p className="prose-poem reveal-now mt-[clamp(0.5rem,2.5svh,1.5rem)] text-xl text-moon md:text-2xl" style={d(140)}>
            {site.tagline}
          </p>

          <p
            className="reveal-now mt-[clamp(1rem,3svh,2rem)] font-mono text-xl tracking-[0.18em] text-glow md:text-3xl"
            style={d(210)}
          >
            <time dateTime="2027-03-19">03.19</time> — <time dateTime="2027-03-20">03.20</time>
          </p>
        </div>
      </section>

      {/* ───────── 核心概念 ───────── */}
      <section aria-labelledby="concept-h" className="band-light mt-20 py-20 md:mt-28 md:py-28 lg:mt-32">
        <div className="container-x">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
            <div>
              <p className="eyebrow reveal">
                <span className="eyebrow-num">01 —</span>Concept
              </p>
              <h2 id="concept-h" className="reveal mt-4 font-serif text-[34px] font-black leading-[1.2] md:text-[52px]" style={d(60)}>
                何謂歸屬，
                <br />
                何從歸屬？
              </h2>
            </div>
            <div className="text-[17px] leading-[2] text-mist md:text-lg">
              <blockquote className="prose-poem reveal text-xl leading-[1.9] text-moon md:text-2xl" style={d(100)}>
                <p>願你在漂泊裡仍能晤見流光，在水紋最深層之處，緩慢形成抵達的眼角……</p>
                <p className="mt-2">以生命為定點，歪扭地繪出一圈圈沒有終點的尋途，落腳於一陣陣深淺互織的漣漪。</p>
              </blockquote>
              <p className="reveal mt-6" style={d(160)}>
                主題「{THEME}」取台語「水泱 tsuí-iann」之意。電影是平靜的水面，因為觀者與創作者的情感交會，光影層疊出前行的路。水滴墜落、漣漪擴散，像人在異鄉與家鄉之間摸索方向、尋覓歸屬的流動歷程。
              </p>
              <Link
                href="/themes"
                className="reveal mt-6 inline-flex min-h-11 items-center gap-1.5 border-b-2 border-glow font-bold text-glow hover:border-moon hover:text-moon"
                style={d(200)}
              >
                閱讀策展理念 <ArrowRight aria-hidden size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 固 → 液 → 氣（捲動敘事） ───────── */}
      <StatesScroll />

      {/* ───────── 所有活動（跑馬燈） ───────── */}
      <section aria-labelledby="films-h" className="container-x mt-20 md:mt-28 lg:mt-32">
        <SectionHeading id="films-h" index={3} eyebrow="Programs" title="星空下的每一場相遇" more={{ href: "/program", label: "全部節目" }} />
        {/* 所有活動依時間先後排成跑馬燈（市集、講座、放映…） */}
        <ProgramMarquee programs={programs} placeholders={comingSoonFilms} reflection />
      </section>

      {/* ───────── 前導短片 ───────── */}
      <section aria-labelledby="trailer-h" className="container-x mt-20 md:mt-28 lg:mt-32">
        <SectionHeading id="trailer-h" index={4} eyebrow="Trailer" title="前導短片" />
        <div className="card reveal relative mt-8 aspect-video overflow-hidden">
          {site.trailerUrl ? (
            <iframe
              src={site.trailerUrl}
              title={`${site.fullName} 前導短片`}
              loading="lazy"
              allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <span className="relative mx-auto grid h-20 w-20 place-items-center">
                  <span aria-hidden className="absolute inset-0 animate-ripple-out rounded-full border border-glow/60" />
                  <span aria-hidden className="absolute inset-0 animate-ripple-out rounded-full border border-glow/60 [animation-delay:1.2s]" />
                  <Clapperboard aria-hidden className="text-glow" size={30} />
                </span>
                <p className="mt-5 font-serif text-xl">前導短片即將上線</p>
                <p className="mt-1 text-sm text-dim">Coming soon</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ───────── 地圖與交通 ───────── */}
      <section aria-labelledby="map-h" className="container-x mt-20 md:mt-28 lg:mt-32">
        <SectionHeading id="map-h" index={5} eyebrow="Venue" title="地圖與交通指引" more={{ href: "/guide", label: "完整現場指引" }} />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="reveal">
            <MapEmbed />
          </div>
          <div className="grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-1">
            <div className="card reveal flex flex-col p-6" style={d(80)}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-glow/10 text-glow ring-1 ring-glow/20">
                  <MapPin aria-hidden size={20} />
                </span>
                <p className="eyebrow !text-dim">Venue</p>
              </div>
              <h3 className="mt-4 font-serif text-2xl font-bold leading-tight">{site.venue.name}</h3>
              <p className="mt-0.5 text-xs tracking-wide text-dim">{site.venue.nameEn}</p>
              <p className="mt-3 text-sm text-mist/90">{site.venue.address}</p>
              <a
                href={site.venue.mapsUrl}
                target="_blank"
                rel="noopener"
                className="btn btn-ghost btn-sm mt-5 self-start lg:mt-auto"
              >
                在 Google 地圖開啟 <ArrowUpRight aria-hidden size={15} />
              </a>
            </div>
            <div className="card reveal flex flex-col p-6" style={d(140)}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-glow/10 text-glow ring-1 ring-glow/20">
                  <Bus aria-hidden size={20} />
                </span>
                <h3 className="text-lg font-bold">怎麼來</h3>
              </div>
              <ul className="mt-4 grid divide-y divide-white/5 text-sm">
                {[
                  { Icon: Bus, label: "公車", text: "搭乘行經「中興大學」站的市區公車" },
                  { Icon: TrainFront, label: "火車", text: "搭至五權車站，步行或轉乘公車／計程車" },
                  { Icon: Car, label: "開車", text: "校內車位有限，建議多利用大眾運輸" },
                ].map(({ Icon, label, text }) => (
                  <li key={label} className="flex items-start gap-3 py-2 first:pt-0 last:pb-0">
                    <Icon aria-hidden size={16} className="mt-0.5 shrink-0 text-dim" />
                    <span className="w-8 shrink-0 font-bold">{label}</span>
                    <span className="text-mist/90">{text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/guide"
                className="mt-5 inline-flex items-center gap-1 self-start text-sm font-bold text-glow hover:underline lg:mt-auto lg:pt-4"
              >
                交通、停車與無障礙資訊 <ArrowRight aria-hidden size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section aria-labelledby="faq-h" className="container-x mt-20 md:mt-28 lg:mt-32">
        <SectionHeading id="faq-h" index={6} eyebrow="FAQ" title="常見問題" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
          <Faq />
          <MerchPicker />
        </div>
      </section>

      {/* ───────── 結尾 CTA ───────── */}
      <section aria-labelledby="cta-h" className="container-x mt-20 md:mt-28 lg:mt-32">
        <div className="card reveal relative overflow-hidden px-5 py-12 text-center sm:px-6 sm:py-14 md:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {[0, 1, 2].map((i) => (
              <span key={i} className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2">
                <span
                  className="block h-full w-full animate-ripple-out rounded-full border border-glow/25"
                  style={{ animationDelay: `${i * 1.6}s`, animationDuration: "4.8s" }}
                />
              </span>
            ))}
          </div>
          <h2 id="cta-h" className="relative font-serif text-[26px] font-bold sm:text-3xl md:text-4xl">
            把 3 月 19、20 日留給電影
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-mist/90">也留給一起看電影的人。不用報名，當天直接來就好；想收到活動提醒與電子報，可以在 Luma 留下 Email。</p>
          <div className="relative mx-auto mt-8 flex w-full max-w-sm flex-col items-stretch gap-2.5 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
            <LumaButton source="home-bottom" className="!px-7 !text-base">
              訂閱活動提醒
            </LumaButton>
            {/* 手機：兩顆行事曆按鈕並排在提醒鈕下方；平板以上與提醒鈕同一列 */}
            <AddToCalendar className="sm:justify-center" />
          </div>

          <div className="relative mt-10 flex justify-center">
            <Countdown />
          </div>
        </div>
      </section>
    </>
  );
}
