import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import { breadcrumbLd } from "@/lib/jsonld";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";

export const metadata: Metadata = pageMeta({
  title: "網站更新紀錄",
  description: `${site.fullName}網站更新紀錄。`,
  path: "/update",
});

const updates = [
  {
    date: "11/21",
    version: "Beta2026.11.21.01",
    summary: "更新網站整體視覺與互動體驗，完善主題、節目、展區、場地指引與線上互動內容，並補強 SEO 與網站資訊。",
  },
  {
    date: "11/16 20:21",
    version: "Beta2026.11.16.04",
    summary: "增加 Update 頁面紀錄網頁更新過程",
  },
  {
    date: "11/16 19:18",
    version: "Beta2026.11.16.03",
    summary: "更新版面配置（Hero 版內容置中）與首頁可愛魚魚漣漪呈現",
  },
  {
    date: "11/15 12:09",
    version: "Beta2026.11.15.02",
    summary: "使用 Gravatar 串接團隊成員頭像與自介",
  },
  {
    date: "11/14 23:45",
    version: "Beta2026.11.14.01",
    summary: "中興電影節網站上線",
  },
];

export default function UpdatePage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "網站更新紀錄", path: "/update" }])} />
      <PageHero eyebrow="Update" title="網站更新紀錄" summary="記錄中興電影節網站的版本更新與製作進程。" />

      <section aria-labelledby="updates-h" className="container-x">
        <SectionHeading id="updates-h" eyebrow="Changelog" title="更新紀錄" />
        <ol className="mt-8 grid gap-4">
          {updates.map((update) => (
            <li key={update.version} className="card grid gap-3 p-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <time className="font-mono text-sm text-glow">{update.date}</time>
              <div>
                <p className="font-mono text-xs tracking-wide text-dim">{update.version}</p>
                <p className="mt-1 text-mist">{update.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
