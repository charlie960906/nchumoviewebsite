import type { Metadata } from "next";
import { Accessibility, Bike, Bus, Car, GlassWater, Info, MapPin, Store, TrainFront, Umbrella } from "lucide-react";
import { site } from "@/lib/site";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import MapEmbed from "@/components/MapEmbed";
import LumaButton from "@/components/LumaButton";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "現場指引｜地圖、交通、停車與無障礙",
  description:
    "2027 興大國際星空電影節現場指引：國立中興大學（臺中市南區興大路 145 號）場地互動地圖、大眾運輸與停車資訊、無障礙服務、Water Bar 與 22 個市集攤位。",
  alternates: { canonical: "/guide" },
};

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

const transport = [
  {
    icon: Bus,
    title: "公車",
    items: ["搭乘行經「中興大學」站的臺中市區公車，下車後步行進入校園。", "班次與即時動態請以「台中公車」App 或各客運公告為準。"],
  },
  {
    icon: TrainFront,
    title: "火車／高鐵",
    items: ["臺鐵：於臺中車站或大慶車站下車，轉乘公車或計程車。", "高鐵：於高鐵臺中站下車，轉乘臺鐵至大慶或臺中車站，或直接搭乘計程車。"],
  },
  {
    icon: Bike,
    title: "YouBike／步行",
    items: ["校園周邊設有 YouBike 站點，建議短程接駁使用。", "校內為人車共道，夜間請留意照明與行人。"],
  },
  {
    icon: Car,
    title: "開車／機車",
    items: ["校內汽車停車位有限且依學校規定收費，活動期間建議多利用大眾運輸。", "機車請停放於校門周邊機車停車場，勿駛入活動草地。"],
  },
];

const onsite = [
  {
    icon: Accessibility,
    title: "無障礙",
    text: "活動場地為平面草地。如需輪椅動線引導、保留席或其他協助，請於報名時在 Luma 表單註記，或到場後洽服務台。",
  },
  {
    icon: GlassWater,
    title: "Water Bar",
    text: "現場設有 Water Bar 提供飲水補給，歡迎自備環保杯。",
  },
  {
    icon: Store,
    title: "市集攤位",
    text: "22 個攤位涵蓋手作、選物、飲食與體驗。各攤位位置與介紹可在互動地圖上點選查看。",
  },
  {
    icon: Info,
    title: "服務台",
    text: "提供地圖手冊、遺失物招領、醫護諮詢與廣播服務。國際處與國際志工（IPC）攤位提供多語協助。",
  },
  {
    icon: Umbrella,
    title: "天候與攜帶物品",
    text: "放映為戶外席地而坐，建議攜帶野餐墊、薄外套與防蚊用品。雨天應變方式將於活動前公告。",
  },
];

const zones = [
  { name: "電影放映區", desc: "大豆袋沙發與草地席，星空下的主放映區。" },
  { name: "舞台", desc: "現場音樂、舞蹈表演與快閃遊戲。" },
  { name: "概念展區（左帳篷）", desc: "「泅」：展區「傍」與「佮」。" },
  { name: "概念展區（右帳篷）", desc: "「涯」：展區「佇」與「佗」。" },
  { name: "市集", desc: "攤位 1–22，沿場地外圍排列。" },
  { name: "服務台／國際處／IPC", desc: "諮詢、報到協助與多語服務。" },
];

export default function GuidePage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "現場指引", path: "/guide" }])} />
      <PageHero
        eyebrow="On-site Guide"
        title="現場指引"
        summary={`電影節在${site.venue.name}（${site.venue.address}）舉行。這一頁整理了場地互動地圖、交通與停車方式、無障礙服務，以及 Water Bar 和市集攤位資訊，出發前看一眼就夠。`}
      >
        <a href={site.venue.mapsUrl} target="_blank" rel="noopener" className="btn btn-primary">
          <MapPin aria-hidden size={18} />
          Google 地圖導航
        </a>
        <LumaButton variant="ghost" source="guide" />
      </PageHero>

      <section id="map" aria-labelledby="map-h" className="container-x">
        <SectionHeading id="map-h" eyebrow="Venue Map" title="場地互動地圖" />
        <div className="reveal mt-8">
          <MapEmbed tall />
        </div>
        {/* 地圖內容的文字版：確保關鍵資訊不只存在於 WebGL 中 */}
        <h3 className="reveal mt-10 text-lg font-bold">場內分區</h3>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((z, i) => (
            <div key={z.name} className="card reveal p-4" style={d(i * 40)}>
              <dt className="font-bold">{z.name}</dt>
              <dd className="mt-1 text-sm text-dim">{z.desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="tr-h" className="container-x mt-24">
        <SectionHeading id="tr-h" eyebrow="Getting Here" title="交通與停車" />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {transport.map((t, i) => (
            <article key={t.title} className="card reveal p-6" style={d(i * 60)}>
              <t.icon aria-hidden className="text-glow" />
              <h3 className="mt-3 text-xl font-bold">{t.title}</h3>
              <ul className="mt-3 grid list-disc gap-2 pl-5 text-mist/90 marker:text-glow">
                {t.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="os-h" className="container-x mt-24">
        <SectionHeading id="os-h" eyebrow="On Site" title="現場服務" />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {onsite.map((t, i) => (
            <article key={t.title} className="card reveal p-6" style={d(i * 60)}>
              <t.icon aria-hidden className="text-glow" />
              <h3 className="mt-3 text-lg font-bold">{t.title}</h3>
              <p className="mt-2 text-sm text-mist/90">{t.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="flow-h" className="container-x mt-24">
        <SectionHeading id="flow-h" eyebrow="Suggested Route" title="建議參觀動線" />
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ["報到", "抵達後於服務台出示 Luma QR Code 完成報到。"],
            ["逛市集與展區", "先走左帳篷「泅」，再到右帳篷「涯」，順路逛市集。"],
            ["舞台與遊戲", "下午時段有快閃遊戲與表演演出，可以邊看邊補水。"],
            ["星空放映", "18:30 前到放映區找位置，鋪好野餐墊等天黑。"],
          ].map(([t, s], i) => (
            <li key={t} className="card reveal p-5" style={d(i * 70)}>
              <span className="font-mono text-3xl font-bold text-glow">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 font-bold">{t}</h3>
              <p className="mt-1 text-sm text-mist/85">{s}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
