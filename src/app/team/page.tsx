import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/lib/site";
import { crew, crewCount, getCrewBoard } from "@/lib/crew";
import CrewBoard from "@/components/CrewBoard";
import { THEME } from "@/lib/theme";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "團隊成員｜電影節幕後團隊",
  description: `認識 2027 興大國際星空電影節「${THEME}」的幕後團隊，以及每一位成員在「波紋的音像」留下的歌與故事。`,
  alternates: { canonical: "/team" },
};

export default async function TeamPage() {
  const board = await getCrewBoard();
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "團隊成員", path: "/team" }])} />
      <PageHero
        eyebrow="Team"
        title="團隊成員"
        summary={`${site.fullName}由國立中興大學國際事務處主辦、興意點 Intuitive Observer 策劃執行。這裡是讓兩個夜晚發生的每一個人——點開任何一位成員，可以聽見他們在「波紋的音像」留下的一首歌與一段故事。`}
      >
        <Link href="/interactive/echoes" className="btn btn-ghost">
          進入「波紋的音像」
        </Link>
      </PageHero>

      <section aria-labelledby="crew-h" className="container-x">
        <SectionHeading id="crew-h" eyebrow="Credits" title="工作人員名單" />
        <p className="reveal mt-4 text-sm text-dim">共 {crewCount} 位工作人員，分屬 {crew.length} 個部門。</p>

        <CrewBoard groups={board} />
      </section>

      <section className="container-x mt-28">
        <div className="card reveal flex flex-wrap items-center justify-between gap-5 p-6 md:p-8">
          <div>
            <h2 className="font-serif text-2xl font-bold">想知道這個電影節從哪裡來？</h2>
            <p className="mt-1 text-sm text-dim">主題理念、主辦單位、聯絡方式與常見問題。</p>
          </div>
          <Link href="/about" className="btn btn-ghost">
            關於電影節 <ArrowRight aria-hidden size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
