import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, Clapperboard, Disc3, Home, Sparkles, Tags } from "lucide-react";
import { staff } from "@/lib/staff";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = pageMeta({
  title: "數位線上互動館｜波紋的音像、漂流詞、心理測驗",
  description: "興大國際星空電影節線上互動館：在「波紋的音像」轉動黑膠圓環，抽出工作人員的歌與故事；抽一支漂流詞幸運籤；測驗你是《美國女孩》裡的誰；以及展區延伸的貼標籤與家的符號小遊戲。",
  path: "/interactive",
});

const others = [
  { href: "/interactive/drift", icon: Sparkles, zone: "氣 Gas", t: "漂流詞幸運籤", s: "往水裡丟一顆石頭，抽一句今天的漂流詞，存成限時動態分享圖。" },
  { href: "/interactive/quiz", icon: Clapperboard, zone: "展區「傍」", t: "心理測驗：你是電影中的誰？", s: "《美國女孩》篇。六題找到最像你的角色，以及適合你的展區。" },
  { href: "/interactive/labels", icon: Tags, zone: "展區「佮」", t: "貼標籤：關係名片", s: "為一段關係貼上三張標籤，生成屬於你們的關係名片。" },
  { href: "/interactive/home", icon: Home, zone: "展區「佗」", t: "拼湊家的符號", s: "從十二個符號裡挑四個，拼出你心裡「家」的樣子。" },
];

export default function InteractivePage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "線上互動館", path: "/interactive" }])} />
      <PageHero
        eyebrow="Online Pavilion"
        title="數位線上互動館"
        summary={`線上互動館是電影節的延伸展區，不必到現場也能參與。
核心體驗「波紋的音像」收錄每位工作人員的一首歌與一篇故事；
另有漂流詞幸運籤、心理測驗，以及呼應現場四個展區的小遊戲。`}
      />

      <section className="container-x">
        <Link href="/interactive/echoes" className="card card-hover reveal group relative block overflow-hidden p-7 md:p-12">
          <div aria-hidden className="absolute -right-44 top-1/2 h-80 w-80 -translate-y-1/2 opacity-35 sm:-right-28 sm:h-[420px] sm:w-[420px] sm:opacity-50 md:-right-40 md:opacity-90 lg:right-6">
            <div className="h-full w-full animate-spin-slow rounded-full bg-[repeating-radial-gradient(circle,#06080c_0,#06080c_2px,#161f2e_3px,#06080c_4px)]">
              <div className="absolute inset-[32%] rounded-full bg-gradient-to-br from-moon via-glow to-night" />
              <div className="absolute inset-[48.5%] rounded-full bg-night" />
            </div>
          </div>
          <div className="relative max-w-md md:max-w-sm lg:max-w-md">
            <span className="tag tag-glow">核心體驗</span>
            <Disc3 aria-hidden className="mt-5 text-glow" size={30} />
            <h2 className="mt-3 font-serif text-4xl font-bold md:text-5xl">波紋的音像</h2>
            <p className="eyebrow mt-2 !text-dim">Echoes of Home</p>
            <p className="mt-5 text-mist/90">
              {staff.length} 位工作人員，各自選了一首歌、寫了一篇關於家與漂泊的故事。它們化成一圈懸浮的黑膠——轉動圓環，抽出一張，聽見某個人的情感波紋。
            </p>
            <span className="btn btn-primary mt-7">
              開始轉動
              <ArrowRight aria-hidden size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </section>

      <section aria-labelledby="more-h" className="container-x mt-8">
        <h2 id="more-h" className="sr-only">
          其他互動
        </h2>
        <ul className="grid gap-5 md:grid-cols-2">
          {others.map((c, i) => (
            <li key={c.href} className="reveal" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
              <Link href={c.href} className="card card-hover group flex h-full flex-col p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <c.icon aria-hidden className="text-glow" />
                  <span className="tag">{c.zone}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold">{c.t}</h3>
                <p className="mt-2 flex-1 text-sm text-mist/85">{c.s}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-glow">
                  開始 <ArrowRight aria-hidden size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
