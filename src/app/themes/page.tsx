import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { THEME, THEME_CHAR } from "@/lib/theme";
import { breadcrumbLd } from "@/lib/jsonld";
import { zoneName, zonePath, zones } from "@/lib/zones";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import JsonLd from "@/components/JsonLd";
import StoryJourney from "@/components/StoryJourney";

export const metadata: Metadata = pageMeta({
  title: "策展理念",
  description: `「${THEME}」策展理念：展區「泅 Siû」談親情與友情（傍、佮），展區「涯 Giâ」談家與土地認同（佇、佗），以水的固、液、氣三態串起從提問到抵達的敘事。`,
  path: "/themes",
});

/** 主視覺（Truth 版）設計論述 */
const KV_POINTS = [
  {
    title: "雋刻流向",
    body: "水面流動的紋理轉化為線條與軌跡，縫合於具體圖像與後設概念之間，層層擴散、若隱若現；自此水跳脫自然元素的限制，得以承載時間、運送生命。水流經、停留與相遇時會孕育移動的刻痕，是人類向外侵蝕，也向內堆砌的證明。",
  },
  {
    title: "拼洄剪憶",
    body: "打碎後，重新組構錯落的時空影像，找尋歸屬的時間線被鋪展開來；燈塔、街景、聚落、行走的人群與飛鳥彼此對談。剝裂後漸融，讓現實與記憶揉搓在一起；拾掇又再造，浮泛出土地與故鄉的曖昧輪廓，人類則伏地前行。",
  },
  {
    title: "零彩主義",
    body: "黑、白、灰隱晦地勾勒模糊情感，試圖熬煉人類原始的質地與層次；當色彩被刻意收斂，水的藍韻成為視線的停滯點，漫流的念想便從碎影中熠熠湧光。或許追逐的狀態難以提取過多的鮮明，人類總在無光也無彩的路上孤注一擲。",
  },
];

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

      <section aria-labelledby="what-h" className="container-x">
        <div className="max-w-3xl">
          <SectionHeading id="what-h" index={1} eyebrow="What" title="一個讓異鄉人與在地人坐在同一片草地上的夜晚" />
          <div className="mt-5 grid gap-4 text-mist/90">
            <p className="reveal">
              中興星空電影節從校園裡的國際交流出發。在中興大學，來自不同國家的學生與在地學生共享同一座校園，卻不一定有機會坐下來，看同一部電影、聊同一件事。
            </p>
            <p className="reveal">
              2027 年的主題「{THEME}」取台語「水泱 tsuí-iann」之意——水面上的漣漪。我們相信每個人在離家與回家之間，都曾泛起過這樣的波紋；而電影，是讓這些波紋彼此遇見的水面。
            </p>
            <p className="reveal">
              兩天的活動包含兩部電影的星空放映、《美國女孩》導演阮鳳儀映後講座、「泅」與「涯」兩大概念展區、22 攤市集、現場演出與快閃遊戲。線上則有「波紋的音像」黑膠互動館，收錄工作人員的歌與故事。
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="idea-h" className="container-x mt-24 md:mt-28">
        <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
          <div aria-hidden className="reveal relative mx-auto grid h-56 w-56 place-items-center lg:mx-0">
            {[0, 1, 2].map((i) => (
              <span key={i} className="absolute inset-0 animate-ripple-out rounded-full border border-glow/40" style={{ animationDelay: `${i * 0.8}s` }} />
            ))}
            <span className="font-serif text-[120px] font-bold leading-none text-moon">{THEME_CHAR}</span>
          </div>
          <div>
            <SectionHeading id="idea-h" index={2} eyebrow="Core Idea" title="電影是平靜的水面" />
            <p className="reveal mt-5 text-mist/90">
              因為觀者與創作者的情感交會，光影層疊出前行的路。「{THEME_CHAR}」象徵水滴墜落水面泛起微波——人類在異鄉與家鄉之間摸索方向、尋覓歸屬的流動歷程。
            </p>
            <figure className="reveal mt-8 border-l-2 border-glow/50 pl-5">
              <figcaption className="text-sm tracking-[0.2em] text-glow">漣之形 · 願你在漂泊裡仍能晤見流光</figcaption>
              <blockquote className="prose-poem mt-4 space-y-5 text-lg text-moon">
                <p>
                  家鄉的熟悉將我們磨得平滑，瞥視藏在細縫裡的幼芽，
                  <br />便會用盡全力往未知的光點滾動，
                  <br />直到一切開始重塑、生長；
                </p>
                <p>
                  來自異地的陌生卻又為我們刻出粗糙的紋樣，
                  <br />潮濕的草、碎石與遠方的氣味會從身體之間流瀉，
                  <br />雨落而日曬，念遠而歸家。
                </p>
                <p>
                  從未記述的里程會將我們的足跡疊得厚重，
                  <br />停留時發覺自己仍在尋找的路途上――。
                </p>
              </blockquote>
            </figure>
          </div>
        </div>
      </section>

      <section aria-labelledby="kv-h" className="container-x mt-24 md:mt-28">
        <SectionHeading id="kv-h" index={3} eyebrow="Key Visual" title="主視覺：設計論述" />
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
          <figure className="reveal lg:sticky lg:top-28">
            <Image
              src="/photo/main-visual-truth.webp"
              alt={`${THEME} 主視覺海報：灰白紙紋上以水平細線構成的「${THEME_CHAR}」字，下方是一圈圈水紋，右側一塊藍色漣漪；標示 2027 年 3 月 19 日至 20 日於中興大學行政後草舉行。`}
              width={1132}
              height={1270}
              className="h-auto w-full rounded-2xl border border-white/10 shadow-2xl shadow-black/40"
            />
          </figure>
          <ol className="space-y-8">
            {KV_POINTS.map((p, i) => (
              <li key={p.title} className="reveal" style={{ "--d": `${i * 120}ms` } as React.CSSProperties}>
                <h3 className="font-serif text-2xl font-black tracking-wide text-moon">
                  <span aria-hidden className="mr-2 text-glow">≋</span>
                  {p.title}
                </h3>
                <p className="mt-3 leading-loose text-mist/90">{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="story-h" className="mt-24 md:mt-28">
        <div className="container-x">
          <SectionHeading id="story-h" index={4} eyebrow="Three States" title="沉浸式三態故事線：固 → 液 → 氣" />
          <p className="reveal mt-4 max-w-2xl text-mist/90">從一滴水「泱」開始，經過固、液、氣，最後落成「泅」與「涯」兩個展區。水有三種形態，歸屬也是。整個電影節——從網站到現場——都沿著這條線走。</p>
        </div>
        {/* 完整版：往下捲、鏡頭沿著水的旅程往右走（首頁 StatesScroll 為簡化版） */}
        <StoryJourney labelledBy="story-h" />
      </section>

    </>
  );
}
