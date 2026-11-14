import type { Metadata } from "next";
import { BellRing, CalendarCheck, ExternalLink, MousePointerClick, QrCode } from "lucide-react";
import { site } from "@/lib/site";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import LumaButton from "@/components/LumaButton";
import AddToCalendar from "@/components/AddToCalendar";
import SuccessRipple from "@/components/SuccessRipple";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "即刻報名｜Luma 免費預先報名",
  description:
    "2027 興大國際星空電影節免費入場，透過 Luma 線上預先報名：點選報名、填寫姓名與 Email、收到確認信與個人 QR Code，活動當天出示即可入場。",
  alternates: { canonical: "/register" },
};

const steps = [
  { icon: MousePointerClick, t: "點選「立即報名」", s: "站內任何一顆報名按鈕都會直接開啟 Luma 報名視窗，不需要跳轉頁面。" },
  { icon: CalendarCheck, t: "填寫姓名與 Email", s: "約 30 秒完成。一次報名即可參加兩天所有場次。" },
  { icon: QrCode, t: "收到個人 QR Code", s: "報名成功後，Luma 會寄出確認信與票券 QR Code。" },
  { icon: BellRing, t: "活動前收到提醒", s: "Luma 會在活動前以 Email 提醒；也可以把活動加入自己的行事曆。" },
];

export default function RegisterPage() {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `如何報名${site.fullName}`,
    totalTime: "PT1M",
    step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.t, text: s.s })),
  };

  return (
    <>
      <JsonLd data={[howTo, breadcrumbLd([{ name: "即刻報名", path: "/register" }])]} />
      <PageHero
        eyebrow="RSVP"
        title="即刻報名"
        summary={`${site.fullName}免費入場，採 Luma 線上預先報名。報名後會收到確認信與個人 QR Code，2027 年 3 月 19、20 日到國立中興大學現場出示即可入場。`}
      >
        <LumaButton source="register" className="!px-7 !text-base">
          立即報名（免費）
        </LumaButton>
        <a href={site.luma.url} target="_blank" rel="noopener" className="btn btn-ghost">
          <ExternalLink aria-hidden size={17} />
          在 Luma 開啟活動頁
        </a>
      </PageHero>

      <section aria-labelledby="steps-h" className="container-x">
        <SectionHeading id="steps-h" eyebrow="How it works" title="報名流程" />
        <ol className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.t} className="card reveal p-6" style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
              <div className="flex items-center justify-between">
                <s.icon aria-hidden className="text-glow" />
                <span className="font-mono text-sm text-dim">STEP {i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
              <p className="mt-2 text-sm text-mist/90">{s.s}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="after-h" className="container-x mt-24">
        <div className="card reveal grid items-center gap-8 overflow-hidden p-6 md:grid-cols-[auto_1fr] md:p-10">
          <SuccessRipple />
          <div>
            <h2 id="after-h" className="font-serif text-2xl font-bold md:text-3xl">
              報名完成之後
            </h2>
            <p className="mt-3 text-mist/90">把活動存進行事曆，再揪一個想一起看電影的人。分享時附上報名連結，對方也能一鍵完成。</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <AddToCalendar />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="note-h" className="container-x mt-24">
        <SectionHeading id="note-h" eyebrow="Good to know" title="報名須知" />
        <ul className="reveal mt-6 grid max-w-3xl list-disc gap-2.5 pl-5 text-mist/90 marker:text-glow">
          <li>活動免費；報名是為了預估人流與座位安排，請確定能到場再報名。</li>
          <li>若臨時無法參加，請在 Luma 確認信中取消報名，把位置讓給其他人。</li>
          <li>「電影演講會」時段與內容仍待定，確定後會以 Email 通知已報名者。</li>
          <li>需要無障礙協助者，請於 Luma 報名表單中註記。</li>
        </ul>
      </section>
    </>
  );
}
