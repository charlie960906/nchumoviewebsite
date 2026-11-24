import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Bike, Bus, Car, MapPin, TrainFront } from "lucide-react";
import { site } from "@/lib/site";
import { breadcrumbLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import MapEmbed from "@/components/MapEmbed";
import LumaButton from "@/components/LumaButton";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = pageMeta({
  title: "現場指引｜地圖、交通、停車與無障礙",
  description: "2027 中興星空電影節現場指引：國立中興大學（臺中市南區興大路 145 號）場地互動地圖、大眾運輸與停車資訊、無障礙服務、Water Bar 與 22 個市集攤位。",
  path: "/guide",
});

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
    items: ["臺鐵：於五權車站下車，步行或轉乘公車、計程車前往中興大學。", "高鐵：於高鐵臺中站下車，至新烏日站轉乘臺鐵至五權車站，或直接搭乘計程車。"],
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

export default function GuidePage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "現場指引", path: "/guide" }])} />
      <PageHero
        eyebrow="On-site Guide"
        title="現場指引"
        summary={`電影節在${site.venue.name}（${site.venue.address}）舉行。
這一頁整理了場地互動地圖、交通與停車方式、無障礙服務，
以及 Water Bar 和市集攤位資訊，出發前看一眼就夠。`}
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
    </>
  );
}
