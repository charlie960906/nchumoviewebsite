import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AtSign, Mail } from "lucide-react";
import { site } from "@/lib/site";
import { THEME } from "@/lib/theme";
import { breadcrumbLd, faqLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import Faq from "@/components/Faq";
import LumaButton from "@/components/LumaButton";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "關於電影節｜主辦單位與常見問題",
  description: `關於 2027 興大國際星空電影節「${THEME}」：由國立中興大學國際事務處主辦，2027 年 3 月 19–20 日於國立中興大學舉行的戶外電影節。主題理念、主辦單位、聯絡方式與常見問題。`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const { email, instagram, facebook } = site.contact;
  const hasContact = email || instagram || facebook;

  return (
    <>
      <JsonLd data={[faqLd, breadcrumbLd([{ name: "關於電影節", path: "/about" }])]} />
      <PageHero
        eyebrow="About"
        title="關於電影節"
        summary={`${site.fullName}是由國立中興大學國際事務處主辦的戶外電影節，於 2027 年 3 月 19 日（五）至 20 日（六）在國立中興大學舉行。兩晚星空下的草地放映之外，還有市集、概念展覽、現場演出與映後講座，免費入場，透過 Luma 報名。`}
      >
        <LumaButton source="about" />
      </PageHero>

      <section aria-labelledby="what-h" className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div>
            <SectionHeading id="what-h" eyebrow="What" title="一個讓異鄉人與在地人坐在同一片草地上的夜晚" />
            <div className="mt-5 grid gap-4 text-mist/90">
              <p className="reveal">
                興大國際星空電影節從校園裡的國際交流出發。在中興大學，來自不同國家的學生與在地學生共享同一座校園，卻不一定有機會坐下來，看同一部電影、聊同一件事。
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
              ["報名方式", "Luma 線上預先報名"],
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
        <SectionHeading id="org-h" eyebrow="Organizers" title="主辦與執行單位" />
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {site.organizers.map((o, i) => (
            <li key={o.name} className="card reveal flex items-center gap-5 p-6" style={{ "--d": `${i * 80}ms` } as React.CSSProperties}>
              <Image src={o.logo} alt={`${o.name} 標誌`} width={o.logoW} height={o.logoH} className="h-14 w-auto max-w-[40%] object-contain" />
              <div>
                <p className="text-xs tracking-widest text-dim">{o.role}</p>
                <h3 className="mt-1 text-lg font-bold">
                  {o.url ? (
                    <a href={o.url} target="_blank" rel="noopener" className="hover:text-glow">
                      {o.name}
                    </a>
                  ) : (
                    o.name
                  )}
                </h3>
                <p className="text-sm text-dim">{o.nameEn}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="card reveal mt-5 flex flex-wrap items-center gap-5 p-6">
          <Image src="/brand/nchu.png" alt="國立中興大學 National Chung Hsing University" width={854} height={201} className="h-12 w-auto" />
          <p className="text-sm text-dim">活動地點與指導：國立中興大學</p>
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
              聯繫主辦單位。
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="faq-h" className="container-x mt-24">
        <SectionHeading id="faq-h" eyebrow="FAQ" title="常見問題" />
        <div className="mt-8 max-w-3xl">
          <Faq />
        </div>
      </section>
    </>
  );
}
