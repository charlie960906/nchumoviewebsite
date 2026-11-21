import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { notFound } from "next/navigation";
import { drifts } from "@/lib/content";
import DriftView from "@/components/play/DriftView";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => drifts.map((d) => ({ id: d.id }));

/** 每支籤一個靜態頁：分享連結時，預覽圖與標題就是抽到的那一句。 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const d = drifts.find((x) => x.id === id);
  if (!d) return {};
  const title = `我抽到第 ${d.id} 籤｜漂流詞幸運籤`;
  const description = d.text.replace(/\n/g, "，");
  const images = [{ url: `/og/drift-${d.id}.png`, width: 1200, height: 630, alt: description }];
  // 內容與抽籤主頁相同，canonical 指回主頁避免重複索引
  return pageMeta({ title, ogTitle: title, description, images, path: `/interactive/drift/${d.id}`, canonical: "/interactive/drift" });
}

export default async function DriftResultPage({ params }: Props) {
  const { id } = await params;
  if (!drifts.some((d) => d.id === id)) notFound();
  return <DriftView initialId={id} />;
}
