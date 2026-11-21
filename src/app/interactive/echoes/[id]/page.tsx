import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Disc3, ExternalLink } from "lucide-react";
import { getStaff, staff } from "@/lib/staff";
import { breadcrumbLd, staffLd } from "@/lib/jsonld";
import PageHero from "@/components/PageHero";
import StoryBody from "@/components/echoes/StoryBody";
import LumaButton from "@/components/LumaButton";
import JsonLd from "@/components/JsonLd";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => staff.map((s) => ({ id: s.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = getStaff((await params).id);
  if (!s) return {};
  const description = `${s.role}・${s.name}的黑膠：歌曲〈${s.songTitle}〉與故事〈${s.storyTitle}〉。${s.storyContent.replace(/\*\*/g, "").replace(/\s+/g, " ").slice(0, 70)}…`;
  return pageMeta({
    title: `${s.storyTitle}｜${s.name}・波紋的音像`,
    ogTitle: `${s.storyTitle}｜波紋的音像`,
    description,
    path: `/interactive/echoes/${s.id}`,
    type: "article",
    images: [{ url: `/og/vinyl-${s.id}.png`, width: 1200, height: 630, alt: `${s.name}的黑膠：${s.storyTitle}` }],
  });
}

/** 故事獨立頁：可被索引的長尾內容（Article + MusicRecording 結構化資料）。 */
export default async function StoryPage({ params }: Props) {
  const s = getStaff((await params).id);
  if (!s) notFound();
  const i = staff.indexOf(s);
  const prev = staff[(i - 1 + staff.length) % staff.length];
  const next = staff[(i + 1) % staff.length];
  const crumbs = [
    { name: "線上互動館", path: "/interactive" },
    { name: "波紋的音像", path: "/interactive/echoes" },
    { name: s.storyTitle, path: `/interactive/echoes/${s.id}` },
  ];

  return (
    <>
      <JsonLd data={[...staffLd(s), breadcrumbLd(crumbs)]} />
      <PageHero
        eyebrow={`${s.role}・${s.name}`}
        title={s.storyTitle}
        summary={`這是「波紋的音像」中屬於${s.name}的黑膠。${s.bio}`}
      >
        <Link href="/interactive/echoes" className="btn btn-primary">
          <Disc3 aria-hidden size={18} />
          到圓環聆聽這張黑膠
        </Link>
      </PageHero>

      <div className="container-x grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
        <article className="reveal">
          <StoryBody text={s.storyContent} className="max-w-2xl text-[17px] leading-[1.95] text-mist/90" />
        </article>

        <aside className="grid content-start gap-5">
          <div className="card reveal p-6 text-center" style={{ borderColor: `${s.accentColor}66` }}>
            <span
              aria-hidden
              className="relative mx-auto grid h-44 w-44 animate-spin-slow place-items-center rounded-full bg-[repeating-radial-gradient(circle,#06080c_0,#06080c_2px,#1a2434_3px,#06080c_4px)]"
              style={{ boxShadow: `0 0 60px -10px ${s.accentColor}` }}
            >
              <span className="h-16 w-16 rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, #fff, ${s.accentColor} 35%, #001218 120%)` }} />
              <span className="absolute h-2 w-2 rounded-full bg-night" />
            </span>
            <p className="eyebrow mt-6" style={{ color: s.accentColor }}>
              Now spinning
            </p>
            <p className="mt-2 text-lg font-bold">{s.songTitle}</p>
            <p className="text-sm text-dim">{s.songArtist}</p>
            {s.externalUrl && (
              <a href={s.externalUrl} target="_blank" rel="noopener" className="btn btn-ghost btn-sm mt-4">
                <ExternalLink aria-hidden size={14} />
                聆聽完整歌曲
              </a>
            )}
          </div>
          <div className="card reveal p-6">
            <p className="text-sm text-mist/90">喜歡這個故事嗎？3 月 19、20 日，到現場的星空下找我們。</p>
            <LumaButton source={`story-${s.id}`} className="mt-4 w-full" />
          </div>
        </aside>
      </div>

      <nav aria-label="其他黑膠" className="container-x mt-16 grid gap-4 sm:grid-cols-2">
        <Link href={`/interactive/echoes/${prev.id}`} className="card card-hover flex items-center gap-3 p-5">
          <ArrowLeft aria-hidden className="shrink-0 text-glow" />
          <span className="min-w-0">
            <span className="block text-xs text-dim">上一張・{prev.name}</span>
            <span className="block truncate font-bold">{prev.storyTitle}</span>
          </span>
        </Link>
        <Link href={`/interactive/echoes/${next.id}`} className="card card-hover flex items-center justify-end gap-3 p-5 text-right">
          <span className="min-w-0">
            <span className="block text-xs text-dim">下一張・{next.name}</span>
            <span className="block truncate font-bold">{next.storyTitle}</span>
          </span>
          <ArrowRight aria-hidden className="shrink-0 text-glow" />
        </Link>
      </nav>
    </>
  );
}
