import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import JsonLd from "@/components/JsonLd";
import Labels from "@/components/play/Labels";

export const metadata: Metadata = pageMeta({
  title: "貼標籤小遊戲｜生成你們的關係名片",
  description: "中興星空電影節展區「佮」線上小遊戲：想一個人，為你們的關係貼上三張標籤，生成可分享的關係名片。",
  path: "/interactive/labels",
});

const crumbs = [
  { name: "線上互動館", path: "/interactive" },
  { name: "貼標籤", path: "/interactive/labels" },
];

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <PageHero eyebrow="Labels · 展區「佮」" title="貼標籤：關係名片" summary={`這是展區「佮」（kah，抵達）的線上小遊戲。
想著一個人，為你們的關係貼上三張標籤，就能生成一張關係名片，
存成圖片分享給對方。填寫的內容只留在你的瀏覽器裡，不會上傳。`} />
      <section aria-label="貼標籤" className="container-x">
        <Labels />
      </section>
    </>
  );
}
