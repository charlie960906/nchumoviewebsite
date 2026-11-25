import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getProgram, programs } from "@/lib/programs";
import ProgramPage from "@/components/ProgramPage";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
// programs 已排除 hidden（暫時下架）的節目，所以下架節目的公開網址會是 404
export const generateStaticParams = () => programs.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProgram((await params).slug);
  if (!p || p.hidden) return {};
  // 星空市集已無獨立頁面，這個網址只留轉址，不讓搜尋引擎收錄
  if (p.kind === "market") return { title: p.title, robots: { index: false, follow: true }, alternates: { canonical: "/program" } };
  const title = p.kind === "film" ? `《${p.title}》星空放映` : p.title;
  return pageMeta({ title, description: p.summary, path: `/program/${p.slug}` });
}

export default async function ProgramDetail({ params }: Props) {
  const p = getProgram((await params).slug);
  if (!p || p.hidden) notFound();
  return <ProgramPage p={p} />;
}
