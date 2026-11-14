import type { Metadata } from "next";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import JsonLd from "@/components/JsonLd";
import HomeSymbols from "@/components/play/HomeSymbols";

export const metadata: Metadata = {
  title: "拼湊家的符號｜展區「佗」互動小遊戲",
  description: "興大國際星空電影節展區「佗」線上小遊戲：從十二個符號中挑選四個，拼湊出你心中「家」的樣子，並生成可分享的圖片。",
  alternates: { canonical: "/interactive/home" },
};

const crumbs = [
  { name: "線上互動館", path: "/interactive" },
  { name: "拼湊家的符號", path: "/interactive/home" },
];

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <PageHero eyebrow="Home · 展區「佗」" title="拼湊家的符號" summary="這是展區「佗」（tó，抵達）的線上小遊戲。從十二個符號裡挑四個最能代表「家」的，拼成一枚屬於你的家徽，再存成圖片帶走。" />
      <section aria-label="拼湊家的符號" className="container-x">
        <HomeSymbols />
      </section>
    </>
  );
}
