import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allPrograms, getProgram } from "@/lib/programs";
import ProgramPage from "@/components/ProgramPage";

/**
 * 開發者預覽：在節目網址後面加 /dev（例如 /program/linda-linda-linda/dev）即可看到頁面，
 * 包含 hidden（暫時下架）的節目。不收錄、不列入 sitemap，也沒有任何連結指向這裡。
 */
type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => allPrograms.filter((p) => p.kind !== "market").map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProgram((await params).slug);
  return {
    title: p ? `[DEV] ${p.title}` : "DEV",
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

export default async function ProgramDev({ params }: Props) {
  const p = getProgram((await params).slug);
  if (!p) notFound();
  return <ProgramPage p={p} dev />;
}
