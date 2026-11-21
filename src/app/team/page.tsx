import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCrewBoard } from "@/lib/crew";
import CrewBoard from "@/components/CrewBoard";
import { THEME } from "@/lib/theme";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = pageMeta({
  title: "團隊成員｜電影節幕後團隊",
  description: `認識 2027 興大國際星空電影節「${THEME}」的幕後團隊，以及每一位成員在「波紋的音像」留下的歌與故事。`,
  path: "/team",
});

export default function TeamPage() {
  const board = getCrewBoard();
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "團隊成員", path: "/team" }])} />
      <PageHero
        eyebrow="Team"
        title="團隊成員"
        summary={[
          "興大國際星空電影節每年皆是許多志工奉獻時間與精神所舉辦",
          "沒有大家的付出就不可能會有如此內容豐富且高品質的電影節",
          "希望大家在參加之餘也不要忘記背後工作人員的付出。"
        ].join("\n")}
      >
      </PageHero>

      <section aria-label="工作人員名單" className="container-x">
        <CrewBoard groups={board} />
      </section>

      <section className="container-x mt-28">
        <div className="card reveal flex flex-wrap items-center justify-between gap-5 p-6 md:p-8">
          <div>
            <h2 className="font-serif text-2xl font-bold">想知道這個電影節從哪裡來？</h2>
            <p className="mt-1 text-sm text-dim">主題理念、主辦單位與聯絡方式。</p>
          </div>
          <Link href="/about" className="btn btn-ghost">
            關於電影節 <ArrowRight aria-hidden size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
