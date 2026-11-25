import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getZone, zoneName, zones } from "@/lib/zones";
import ZoneDetail from "@/components/ZoneDetail";

/**
 * 開發者預覽：在展區網址後面加 /dev（例如 /themes/siu/dev）即可看到完整內容。
 * 不收錄、不列入 sitemap，也沒有任何連結指向這裡。
 */
type Props = { params: Promise<{ zone: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => zones.map((z) => ({ zone: z.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const z = getZone((await params).zone);
  return {
    title: z ? `[DEV] 展區「${zoneName(z)}」` : "DEV",
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

export default async function ZoneDev({ params }: Props) {
  const z = getZone((await params).zone);
  if (!z) notFound();
  return <ZoneDetail z={z} dev />;
}
