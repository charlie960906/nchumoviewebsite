import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { staff } from "@/lib/staff";
import { abs } from "@/lib/site";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import Echoes from "@/components/echoes/Echoes";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = pageMeta({
  title: "波紋的音像 Echoes of Home｜黑膠互動館",
  description: "「波紋的音像」是興大國際星空電影節的線上互動體驗：每位工作人員選定一首歌與一篇故事，化為一張黑膠。旋轉圓環、抽出唱片，聆聽音樂並閱讀屬於某個人的情感波紋。",
  path: "/interactive/echoes",
});

export default function EchoesPage() {
  const crumbs = [
    { name: "線上互動館", path: "/interactive" },
    { name: "波紋的音像", path: "/interactive/echoes" },
  ];
  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "波紋的音像 Echoes of Home",
    itemListElement: staff.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${s.storyTitle}（${s.name}）`,
      url: abs(`/interactive/echoes/${s.id}`),
    })),
  };

  return (
    <>
      <JsonLd data={[listLd, breadcrumbLd(crumbs)]} />
      <PageHero
        eyebrow="Echoes of Home"
        title="波紋的音像"
        summary={`每一位工作人員事先選定了一首歌與一篇故事，
化成一張黑膠。轉動這一圈 ${staff.length} 張的圓環，抽出一張——
音樂會開始播放，下方展開那個人關於家與漂泊的文字。`}
      />

      <section aria-label="黑膠圓環互動" className="container-x">
        <Echoes />
      </section>

      {/* 全部故事的文字索引：確保內容不只存在於 WebGL，鍵盤與螢幕閱讀器使用者也能直接進入 */}
      <section aria-labelledby="all-h" className="container-x mt-24">
        <SectionHeading id="all-h" eyebrow="All Records" title="全部黑膠" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {staff.map((s, i) => (
            <li key={s.id} className="reveal" style={{ "--d": `${(i % 4) * 60}ms` } as React.CSSProperties}>
              <Link href={`/interactive/echoes/${s.id}`} className="card card-hover group flex h-full items-center gap-4 p-4">
                <span
                  aria-hidden
                  className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[repeating-radial-gradient(circle,#06080c_0,#06080c_1px,#1a2434_2px,#06080c_3px)] transition-transform duration-700 group-hover:rotate-180"
                >
                  <span className="h-5 w-5 rounded-full" style={{ background: s.accentColor }} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-bold">{s.storyTitle}</span>
                  <span className="block truncate text-sm text-dim">
                    {s.name}・♪ {s.songTitle}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
