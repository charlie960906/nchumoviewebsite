import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AtSign, Mail } from "lucide-react";
import { site } from "@/lib/site";
import { THEME } from "@/lib/theme";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import LumaButton from "@/components/LumaButton";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = pageMeta({
  title: "關於電影節｜主題理念與指導、執行單位",
  description: `關於 2027 中興星空電影節「${THEME}」：由國立中興大學、國立中興大學國際事務處指導，2027 年 3 月 19–20 日於國立中興大學舉行的戶外電影節。主題理念、指導與執行單位、聯絡方式。`,
  path: "/about",
});

export default function AboutPage() {
  const { email, instagram, facebook } = site.contact;
  const hasContact = email || instagram || facebook;

  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "關於電影節", path: "/about" }])]} />
      <PageHero
        eyebrow="About"
        title="關於電影節"
        summary={`${site.fullName}是由國立中興大學、國立中興大學國際事務處指導的戶外電影節，
於 2027 年 3 月 19 日（五）至 20 日（六）在國立中興大學舉行。
兩晚星空下的草地放映之外，還有市集、概念展覽、現場演出與映後講座，
免費入場，不需報名，當天直接到場即可。`}
      >
        <LumaButton source="about" />
      </PageHero>

      <section aria-labelledby="what-h" className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div>
            <SectionHeading id="what-h" eyebrow="What" title="一個讓異鄉人與在地人坐在同一片草地上的夜晚" />
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

          <dl className="card reveal grid content-start gap-4 p-6 md:p-8">
            {[
              ["活動全名", site.fullName],
              ["英文名稱", site.nameEn],
              ["主題", `${THEME}（水泱 tsuí-iann）`],
              ["日期", "2027 年 3 月 19 日（五）– 20 日（六）"],
              ["地點", `${site.venue.name}｜${site.venue.address}`],
              ["費用", "免費入場"],
              ["報名方式", "免報名，直接到場（可在 Luma 訂閱活動提醒）"],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                <dt className="text-xs tracking-widest text-dim">{k}</dt>
                <dd className="mt-1 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
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
                <p className="text-lg font-bold">{site.producer.name}</p>
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
            <p className="mt-1 text-sm text-dim">認識讓這兩個夜晚發生的每一個人。</p>
          </div>
          <Link href="/team" className="btn btn-ghost">
            看團隊成員 <ArrowRight aria-hidden size={16} />
          </Link>
        </div>
      </section>

      <section aria-labelledby="contact-h" className="container-x mt-24">
        <SectionHeading id="contact-h" eyebrow="Contact" title="聯絡我們" />
        <div className="card reveal mt-8 p-6 md:p-8">
          {hasContact ? (
            <ul className="grid gap-3">
              {email && (
                <li className="flex items-center gap-3">
                  <Mail aria-hidden className="text-glow" size={20} />
                  <a href={`mailto:${email}`} className="hover:text-glow">
                    {email}
                  </a>
                </li>
              )}
              {instagram && (
                <li className="flex items-center gap-3">
                  <AtSign aria-hidden className="text-glow" size={20} />
                  <a href={instagram} target="_blank" rel="noopener" className="hover:text-glow">
                    Instagram
                  </a>
                </li>
              )}
              {facebook && (
                <li className="flex items-center gap-3">
                  <AtSign aria-hidden className="text-glow" size={20} />
                  <a href={facebook} target="_blank" rel="noopener" className="hover:text-glow">
                    Facebook
                  </a>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-mist/90">
              官方聯絡信箱與社群帳號即將公布。活動相關問題，目前可透過{" "}
              <a href={site.luma.url} target="_blank" rel="noopener" className="font-bold text-glow hover:underline">
                Luma 活動頁
              </a>{" "}
              聯繫我們。
            </p>
          )}
        </div>
      </section>
    </>
  );
}
