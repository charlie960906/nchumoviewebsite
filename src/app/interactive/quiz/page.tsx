import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import JsonLd from "@/components/JsonLd";
import Quiz from "@/components/play/Quiz";

export const metadata: Metadata = pageMeta({
  title: "心理測驗｜你是《美國女孩》裡的誰？",
  description: "興大國際星空電影節心理測驗《美國女孩》篇：六個關於家的問題，測出你最像芳儀、媽媽莉莉、爸爸還是妹妹芳安，並推薦適合你的現場展區。",
  path: "/interactive/quiz",
});

const crumbs = [
  { name: "線上互動館", path: "/interactive" },
  { name: "心理測驗", path: "/interactive/quiz" },
];

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <PageHero eyebrow="Quiz · 展區「傍」" title="心理測驗：你是電影中的哪個角色？" summary={`這是電影節展區「傍」的線上入口。
《美國女孩》篇共六題，約一分鐘完成，
結果會告訴你最像片中的哪個角色，並推薦現場適合你的展區。
其他電影篇章將陸續加入。`} />
      <section aria-label="心理測驗" className="container-x">
        <Quiz />
      </section>
    </>
  );
}
