import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { notFound } from "next/navigation";
import { THEME } from "@/lib/theme";
import { breadcrumbLd } from "@/lib/jsonld";
import { getZone, zoneName, zonePath, zones } from "@/lib/zones";
import JsonLd from "@/components/JsonLd";
import ZoneBuilding from "@/components/ZoneBuilding";

/**
 * 展區頁目前還在施工：一般訪客看到「喀拉喀拉敲出來中」的畫面（ZoneBuilding）。
 * 完整內容請到 /themes/[zone]/dev 預覽；完工後把 <ZoneBuilding> 換成 <ZoneDetail z={z} /> 即可上線。
 */
type Props = { params: Promise<{ zone: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => zones.map((z) => ({ zone: z.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const z = getZone((await params).zone);
  if (!z) return {};
  const title = `展區「${zoneName(z)}」｜${z.subtitle}`;
  return pageMeta({ title, description: `「${THEME}」${z.summary}`, path: zonePath(z) });
}

export default async function ZonePage({ params }: Props) {
  const z = getZone((await params).zone);
  if (!z) notFound();
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "展區介紹", path: "/themes" },
          { name: zoneName(z), path: zonePath(z) },
        ])}
      />
      <ZoneBuilding z={z} />
    </>
  );
}
