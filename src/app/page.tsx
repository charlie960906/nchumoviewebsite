import Link from "next/link";
import { ArrowRight, Bus, CalendarDays, Clapperboard, Disc3, MapPin, Sparkles, Ticket, Waves } from "lucide-react";
import { site } from "@/lib/site";
import { THEME, THEME_CHAR } from "@/lib/theme";
import { programs } from "@/lib/programs";
import { faqLd, festivalLd } from "@/lib/jsonld";
import Countdown from "@/components/Countdown";
import LumaButton from "@/components/LumaButton";
import AddToCalendar from "@/components/AddToCalendar";
import Schedule from "@/components/Schedule";
import MapEmbed from "@/components/MapEmbed";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import SectionHeading from "@/components/SectionHeading";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

const states = [
  {
    key: "固",
    en: "Solid",
    title: "留在原地的",
    text: "穩定、沉靜，如家與土地。時刻表、地圖與報名資訊，是你隨時可以回來確認的岸。",
    href: "/program",
    cta: "看時間表",
  },
  {
    key: "液",
    en: "Liquid",
    title: "流動著的",
    text: "穿梭於城市與人群之間的探索。兩大展區「泅」與「涯」，從提問一路流向抵達。",
    href: "/themes",
    cta: "走進展區",
  },
  {
    key: "氣",
    en: "Gas",
    title: "看不見的",
    text: "無形卻滲透生活的情感共鳴。在線上互動館抽一張黑膠，聽一個人的歌與故事。",
    href: "/interactive",
    cta: "進入互動館",
  },
];

export default function Home() {
  const films = programs.filter((p) => p.kind === "film");

  return (
    <>
      <JsonLd data={[festivalLd, faqLd]} />

      {/* ───────── Hero ───────── */}
      <section className="relative -mt-16 flex min-h-[100svh] items-center overflow-hidden pt-16">
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_0%,#12456b_0%,#0b192c_55%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night" />
        </div>
        <div className="container-x relative flex flex-col items-center py-16 text-center md:py-24">
          <p className="eyebrow reveal">
            <time dateTime="2027-03-19">2027.03.19</time> — <time dateTime="2027-03-20">03.20</time>
            <span className="mx-2 text-dim">/</span>
            國立中興大學
          </p>

          <h1 className="reveal mt-5 font-serif font-bold" style={d(70)}>
            <span className="block text-lg tracking-[0.2em] text-mist md:text-2xl">2027 興大國際星空電影節</span>
            <span className="mt-3 flex items-end justify-center gap-4 md:gap-6">
              <span className="text-[104px] leading-[0.95] text-moon drop-shadow-[0_0_40px_rgba(56,189,248,0.45)] md:text-[168px]">
                {THEME_CHAR}
              </span>
              <span className="pb-3 text-5xl italic tracking-wide text-glow md:pb-6 md:text-[64px]">Ripple</span>
            </span>
          </h1>

          <p className="prose-poem reveal mt-6 text-xl text-moon md:text-2xl" style={d(140)}>
            {site.tagline}
          </p>

          {/* AEO：首段完整交代全名、主題、時間、地點、報名方式 */}
          <p className="reveal mx-auto mt-5 max-w-2xl text-mist/90" style={d(200)}>
            <strong className="font-bold text-moon">{site.fullName}</strong> 將於{" "}
            <strong className="font-bold text-moon">2027 年 3 月 19 日（五）至 20 日（六）</strong>在
            <strong className="font-bold text-moon">國立中興大學</strong>
            登場：兩晚星空下的草地放映、市集展覽、現場演出與映後講座。免費入場，透過 Luma 線上預先報名。
          </p>

          <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3" style={d(260)}>
            <LumaButton source="hero" className="!px-7 !text-base">
              立即報名（免費）
            </LumaButton>
            <AddToCalendar className="justify-center" />
          </div>

          <div className="reveal mt-12 flex justify-center" style={d(320)}>
            <Countdown />
          </div>
        </div>
      </section>

      {/* ───────── 關鍵資訊 ───────── */}
      <section aria-labelledby="facts-h" className="container-x -mt-4">
        <h2 id="facts-h" className="sr-only">
          活動資訊一覽
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: CalendarDays, k: "時間", v: "3/19（五）15:00–22:00", v2: "3/20（六）14:00–23:00" },
            { icon: MapPin, k: "地點", v: site.venue.name, v2: site.venue.address },
            { icon: Clapperboard, k: "放映", v: "《美國女孩》3/19 18:30", v2: "《琳達！琳達！》3/20 18:30" },
            { icon: Ticket, k: "報名", v: "免費入場", v2: "Luma 線上預先報名" },
          ].map((f, i) => (
            <div key={f.k} className="card reveal flex gap-4 p-5" style={d(i * 60)}>
              <f.icon aria-hidden className="mt-1 shrink-0 text-glow" size={22} />
              <div>
                <dt className="text-xs tracking-widest text-dim">{f.k}</dt>
                <dd className="mt-1 font-bold leading-snug">{f.v}</dd>
                <dd className="text-sm text-dim">{f.v2}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* ───────── 核心概念 ───────── */}
      <section aria-labelledby="concept-h" className="container-x mt-24 md:mt-32">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading id="concept-h" eyebrow="Concept" title={`「${THEME_CHAR}」——水滴落下，泛起微波`} />
            <p className="reveal mt-5 text-mist/90">
              主題「{THEME}」取台語「水泱 tsuí-iann」之意。電影是平靜的水面，因為觀者與創作者的情感交會，光影層疊出前行的路。水滴墜落、漣漪擴散，像人在異鄉與家鄉之間摸索方向、尋覓歸屬的流動歷程。
            </p>
            <Link href="/themes" className="reveal mt-6 inline-flex items-center gap-1.5 font-bold text-glow hover:underline">
              認識展區 <ArrowRight aria-hidden size={17} />
            </Link>
          </div>
          <blockquote className="card reveal prose-poem relative p-7 text-lg text-moon md:p-10 md:text-xl" style={d(100)}>
            <Waves aria-hidden className="absolute right-6 top-6 text-glow/40" size={28} />
            <p>願你在漂泊裡仍能晤見流光，</p>
            <p>在水紋最深層之處，</p>
            <p>緩慢形成抵達的眼角……</p>
            <p className="mt-4">以生命為定點，</p>
            <p>歪扭地繪出一圈圈沒有終點的尋途，</p>
            <p>落腳於一陣陣深淺互織的漣漪。</p>
          </blockquote>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {states.map((s, i) => (
            <li key={s.key} className="reveal" style={d(i * 80)}>
              <Link href={s.href} className="card card-hover group block h-full p-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-5xl font-bold text-glow">{s.key}</span>
                  <span className="eyebrow !text-dim">{s.en}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-mist/85">{s.text}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-glow">
                  {s.cta}
                  <ArrowRight aria-hidden size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── 放映片單 ───────── */}
      <section aria-labelledby="films-h" className="container-x mt-24 md:mt-32">
        <SectionHeading id="films-h" eyebrow="Screenings" title="星空下的兩個夜晚" more={{ href: "/program", label: "全部節目" }} />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {films.map((p, i) => (
            <article key={p.slug} className="card card-hover reveal relative flex flex-col overflow-hidden p-6 md:p-8" style={d(i * 90)}>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
                style={{ background: i === 0 ? "rgba(56,189,248,.22)" : "rgba(167,139,250,.2)" }}
              />
              <p className="relative font-mono text-sm text-glow">
                {p.facts[1].value}　{p.facts[2].value}
              </p>
              <h3 className="relative mt-3 font-serif text-3xl font-bold">
                <Link href={`/program/${p.slug}`} className="after:absolute after:inset-0 hover:text-glow">
                  《{p.title}》
                </Link>
              </h3>
              <p className="relative text-sm text-dim">
                {p.titleEn}．導演 {p.facts[0].value}
              </p>
              <p className="relative mt-4 flex-1 text-mist/90">{p.body[0]}</p>
              <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3">
                <LumaButton size="sm" source={`home-${p.slug}`}>
                  報名這一場
                </LumaButton>
                <Link href={`/program/${p.slug}`} className="btn btn-ghost btn-sm">
                  場次詳情
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── 時間表 ───────── */}
      <section id="schedule" aria-labelledby="schedule-h" className="container-x mt-24 md:mt-32">
        <SectionHeading id="schedule-h" eyebrow="Timetable" title="活動時間表" />
        <div className="reveal mt-8">
          <Schedule />
        </div>
      </section>

      {/* ───────── 前導短片 ───────── */}
      <section aria-labelledby="trailer-h" className="container-x mt-24 md:mt-32">
        <SectionHeading id="trailer-h" eyebrow="Trailer" title="前導短片" />
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
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(60%_70%_at_50%_50%,rgba(8,145,178,.25),transparent)] text-center">
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
      <section aria-labelledby="map-h" className="container-x mt-24 md:mt-32">
        <SectionHeading id="map-h" eyebrow="Venue" title="地圖與交通指引" more={{ href: "/guide", label: "完整現場指引" }} />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="reveal">
            <MapEmbed />
          </div>
          <div className="grid content-start gap-4">
            <div className="card reveal p-6" style={d(80)}>
              <MapPin aria-hidden className="text-glow" />
              <h3 className="mt-3 text-lg font-bold">{site.venue.name}</h3>
              <p className="text-sm text-dim">{site.venue.address}</p>
              <a href={site.venue.mapsUrl} target="_blank" rel="noopener" className="btn btn-ghost btn-sm mt-4">
                在 Google 地圖開啟
              </a>
            </div>
            <div className="card reveal p-6" style={d(140)}>
              <Bus aria-hidden className="text-glow" />
              <h3 className="mt-3 text-lg font-bold">怎麼來</h3>
              <ul className="mt-2 grid gap-1.5 text-sm text-mist/90">
                <li>公車：搭乘行經「中興大學」站的市區公車</li>
                <li>火車：臺中車站或大慶車站轉乘公車／計程車</li>
                <li>開車：校內車位有限，建議多利用大眾運輸</li>
              </ul>
              <Link href="/guide" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-glow hover:underline">
                交通、停車與無障礙資訊 <ArrowRight aria-hidden size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── 線上互動館 ───────── */}
      <section aria-labelledby="play-h" className="container-x mt-24 md:mt-32">
        <SectionHeading id="play-h" eyebrow="Online Pavilion" title="數位線上互動館" more={{ href: "/interactive", label: "全部互動" }} />
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Link href="/interactive/echoes" className="card card-hover reveal group relative block overflow-hidden p-7 md:p-10">
            <div aria-hidden className="absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 md:-right-10">
              <div className="h-full w-full animate-spin-slow rounded-full bg-[repeating-radial-gradient(circle,#0a0f18_0,#0a0f18_2px,#161f2e_3px,#0a0f18_4px)] shadow-[0_0_80px_rgba(56,189,248,.25)]">
                <div className="absolute inset-[34%] rounded-full bg-gradient-to-br from-glow to-tide" />
                <div className="absolute inset-[48%] rounded-full bg-night" />
              </div>
            </div>
            <div className="relative max-w-sm">
              <Disc3 aria-hidden className="text-glow" />
              <h3 className="mt-4 font-serif text-3xl font-bold">波紋的音像</h3>
              <p className="eyebrow mt-1 !text-dim">Echoes of Home</p>
              <p className="mt-4 text-mist/90">
                每位工作人員選了一首歌、寫了一篇故事，化成一張黑膠。轉動圓環，抽出屬於某個人的情感波紋。
              </p>
              <span className="mt-6 inline-flex items-center gap-1 font-bold text-glow">
                開始轉動 <ArrowRight aria-hidden size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
          <div className="grid gap-5">
            {[
              { href: "/interactive/drift", icon: Sparkles, t: "漂流詞幸運籤", s: "抽一句今天的漂流詞，存成限時動態分享圖。" },
              { href: "/interactive/quiz", icon: Clapperboard, t: "心理測驗", s: "你是《美國女孩》裡的誰？六題找到你的展區。" },
            ].map((c, i) => (
              <Link key={c.href} href={c.href} className="card card-hover reveal group block p-6" style={d(80 + i * 70)}>
                <c.icon aria-hidden className="text-glow" />
                <h3 className="mt-3 text-xl font-bold">{c.t}</h3>
                <p className="mt-1 text-sm text-mist/85">{c.s}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section aria-labelledby="faq-h" className="container-x mt-24 md:mt-32">
        <SectionHeading id="faq-h" eyebrow="FAQ" title="常見問題" />
        <div className="mt-8 max-w-3xl">
          <Faq />
        </div>
      </section>

      {/* ───────── 結尾 CTA ───────── */}
      <section aria-labelledby="cta-h" className="container-x mt-24 md:mt-32">
        <div className="card reveal relative overflow-hidden px-6 py-14 text-center md:py-20">
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
          <h2 id="cta-h" className="relative font-serif text-3xl font-bold md:text-4xl">
            把 3 月 19、20 日留給電影
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-mist/90">也留給一起看電影的人。報名免費，三十秒完成；報名後會收到 Email 提醒與入場 QR Code。</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <LumaButton source="home-bottom" className="!px-7 !text-base" />
            <Link href="/register" className="btn btn-ghost">
              報名流程說明
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
