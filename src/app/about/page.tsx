import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import { site } from "@/lib/site";
import { THEME } from "@/lib/theme";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = pageMeta({
  title: "關於電影節｜主題理念與指導、執行單位",
  description: `關於 2027 中興星空電影節「${THEME}」：由國立中興大學、國立中興大學國際事務處指導，2027 年 3 月 19–20 日於國立中興大學舉行的戶外電影節。主題理念、指導與執行單位、官方社群。`,
  path: "/about",
});

export default function AboutPage() {
  const { email, instagram, threads } = site.contact;
  const handle = "nchu_intuitive_observer";
  const socials = [
    { label: "Instagram", href: instagram },
    { label: "Threads", href: threads },
  ].filter((s) => s.href);

  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "關於電影節", path: "/about" }])]} />
      <PageHero
        eyebrow="About"
        title={
          <>
            <span className="block">中興星空電影節</span>
            <span lang="en" className="mt-2 block font-sans text-[15px] font-semibold uppercase tracking-[0.25em] text-mist/80 md:text-xl">
              NCHU Film Festival
            </span>
          </>
        }
      />

      <section aria-label="電影節簡介" className="container-x">
        <div className="mx-auto grid max-w-3xl gap-5 text-[15px] leading-loose text-mist/90 sm:text-base md:text-[17px]">
          <p className="reveal">
            中興星空電影節由國立中興大學興意點團隊執行，致力於在校園中打造一個讓國際學生與在地學生相遇的場域。以戶外草地放映為核心，結合星空市集、概念展覽、現場演出與映後講座，舉辦四年來，每年參與人數皆超過兩千人。
          </p>
          <p className="reveal">
            我們相信電影是跨越語言與文化的共同語言。透過主題策展與免費放映，選映具議題意識、關照移動與認同經驗的作品，並邀請影視工作者與觀眾面對面交流，讓不同背景的人在同一部電影裡看見彼此，也看見自己。中興大學雖無影視科系，我們仍希望以學生的視角持續策展，讓在星空下看電影，成為屬於中興的校園傳統。
          </p>
        </div>
      </section>

      <section aria-labelledby="org-h" className="container-x mt-24">
        <SectionHeading id="org-h" eyebrow="Organizers" title="指導與執行單位" />
        <div className="mt-8 grid gap-5 lg:grid-cols-[2fr_1fr]">
          <div className="card reveal p-6 md:p-8">
            <h3 className="text-xs tracking-widest text-dim">指導單位</h3>
            <ul className="mt-5 grid gap-6 sm:grid-cols-2">
              {site.advisors.map((o) => (
                <li key={o.name} className="grid content-start gap-3">
                  <Image src={o.logo} alt={`${o.name} 標誌`} width={o.logoW} height={o.logoH} className="h-12 w-auto max-w-full object-contain object-left" />
                  <div>
                    <p className="text-lg font-bold">
                      <a href={o.url} target="_blank" rel="noopener" className="hover:text-glow">
                        {o.name}
                      </a>
                    </p>
                    <p className="text-sm text-dim">{o.nameEn}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card reveal p-6 md:p-8" style={{ "--d": "80ms" } as React.CSSProperties}>
            <h3 className="text-xs tracking-widest text-dim">執行單位</h3>
            <div className="mt-5 flex items-center gap-5">
              <Image src={site.producer.logo} alt={`${site.producer.name} 標誌`} width={site.producer.logoW} height={site.producer.logoH} className="h-14 w-auto object-contain" />
              <div>
                <p className="text-lg font-bold">
                  {site.producer.name.replace(site.producer.nameEn, "").trim()}{" "}
                  <span className="whitespace-nowrap">{site.producer.nameEn}</span>
                </p>
                <p className="text-sm text-dim">{site.producer.role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x mt-5">
        <div className="card reveal flex flex-wrap items-center justify-between gap-5 p-6">
          <div>
            <h3 className="text-lg font-bold">團隊成員</h3>
            <p className="mt-1 text-sm text-dim">認識讓這場電影節發生的每一個人。</p>
          </div>
          <Link href="/team" className="btn btn-ghost">
            看團隊成員 <ArrowRight aria-hidden size={16} />
          </Link>
        </div>
      </section>

      <section aria-labelledby="follow-h" className="container-x mt-24">
        <SectionHeading id="follow-h" eyebrow="Follow" title="追蹤我們" />
        <p className="reveal mt-4 text-mist/90">最新消息、片單與活動花絮，都會先發在興意點的社群帳號。</p>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {socials.map((s, i) => (
            <li key={s.label} className="reveal" style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener"
                className="card group flex items-center justify-between gap-4 p-6 transition-colors hover:border-glow/50"
              >
                <span>
                  <span className="block text-xs tracking-widest text-dim">{s.label}</span>
                  <span className="mt-1 block text-lg font-bold transition-colors group-hover:text-glow">@{handle}</span>
                </span>
                <ArrowUpRight aria-hidden size={20} className="shrink-0 text-dim transition-colors group-hover:text-glow" />
              </a>
            </li>
          ))}
        </ul>
        {email && (
          <p className="reveal mt-5 flex items-center gap-3 text-mist/90">
            <Mail aria-hidden className="text-glow" size={20} />
            <a href={`mailto:${email}`} className="hover:text-glow">
              {email}
            </a>
          </p>
        )}
      </section>
    </>
  );
}
