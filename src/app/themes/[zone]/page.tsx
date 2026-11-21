import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { THEME } from "@/lib/theme";
import { breadcrumbLd } from "@/lib/jsonld";
import { getZone, zoneName, zonePath, zones } from "@/lib/zones";
import SectionHeading from "@/components/SectionHeading";
import LumaButton from "@/components/LumaButton";
import JsonLd from "@/components/JsonLd";

type Props = { params: Promise<{ zone: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => zones.map((z) => ({ zone: z.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const z = getZone((await params).zone);
  if (!z) return {};
  const title = `展區「${zoneName(z)}」｜${z.subtitle}`;
  return pageMeta({ title, description: `「${THEME}」${z.summary}`, path: zonePath(z) });
}

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default async function ZonePage({ params }: Props) {
  const z = getZone((await params).zone);
  if (!z) notFound();
  const other = zones.find((x) => x.slug !== z.slug)!;

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "展區介紹", path: "/themes" },
          { name: zoneName(z), path: zonePath(z) },
        ])}
      />

      {/* 頁首：以展區代表色取代共用 PageHero 的藍色波紋 */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
            style={{ background: z.color }}
          />
        </div>
        <div className="container-x relative pb-12 pt-10 md:pb-16 md:pt-16">
          <Link href="/themes" className="reveal inline-flex items-center gap-1.5 text-sm text-dim hover:text-glow">
            <ArrowLeft aria-hidden size={15} /> 展區介紹
          </Link>
          <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3">
            <span
              aria-hidden
              className="reveal font-serif text-[120px] font-bold leading-[0.9] md:text-[176px]"
              style={{ color: z.color, textShadow: `0 0 40px ${z.color}66`, ...d(60) }}
            >
              {z.char}
            </span>
            <div className="pb-2 md:pb-4">
              <p className="eyebrow reveal" style={{ color: z.color, ...d(60) }}>
                Zone · {z.roman}
              </p>
              <h1 className="reveal mt-2 font-serif text-[32px] font-bold tracking-wide md:text-[44px]" style={d(120)}>
                展區「{zoneName(z)}」
                <span className="mt-1 block text-xl font-normal text-mist md:text-2xl">{z.subtitle}</span>
              </h1>
            </div>
          </div>
          <p className="reveal mt-7 max-w-2xl text-[17px] text-mist/90" style={d(180)}>
            {z.summary}
          </p>
          <div className="reveal mt-7 flex flex-wrap gap-3" style={d(240)}>
            <LumaButton source={`themes-${z.slug}`} />
            <Link href="/guide#map" className="btn btn-ghost">
              看場地地圖
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="idea-h" className="container-x">
        <SectionHeading id="idea-h" eyebrow="Concept" title={`為什麼是「${z.char}」`} />
        <blockquote className="prose-poem reveal mt-6 max-w-2xl border-l-2 pl-5 text-lg text-moon" style={{ borderColor: `${z.color}80` }}>
          {z.intro}
        </blockquote>
      </section>

      <section aria-labelledby="rooms-h" className="container-x mt-24 md:mt-28">
        <SectionHeading id="rooms-h" eyebrow="Explore → Arrive" title={`兩個空間：${z.rooms[0].char} → ${z.rooms[1].char}`} />
        <p className="reveal mt-4 max-w-2xl text-mist/90">
          展區「{z.char}」由兩個空間組成。先走進「{z.rooms[0].char}」的提問，再抵達「{z.rooms[1].char}」的答案。
        </p>
        <ol className="mt-10 grid gap-6">
          {z.rooms.map((r, i) => (
            <li key={r.id} id={r.id} className="reveal scroll-mt-24" style={d(i * 100)}>
              <article className="card grid gap-6 p-6 md:grid-cols-[auto_1fr] md:gap-10 md:p-10">
                <div className="flex items-center gap-5 md:w-44 md:flex-col md:items-start md:gap-3">
                  <span aria-hidden className="font-serif text-[96px] font-bold leading-none md:text-[128px]" style={{ color: z.color }}>
                    {r.char}
                  </span>
                  <span className="font-mono text-sm text-dim">{r.roman}</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="tag" style={{ borderColor: `${z.color}80`, color: z.color }}>
                      {r.phase}
                    </span>
                    <span className="text-xs tracking-widest text-dim">空間 {i + 1} / 2</span>
                  </div>
                  <h3 className="mt-4 font-serif text-2xl font-bold md:text-[28px]">展區「{r.char}」</h3>
                  <p className="mt-4 flex-1 text-mist/90">{r.desc}</p>
                  <Link href={r.action.href} className="mt-6 inline-flex items-center gap-1.5 self-start text-sm font-bold text-glow hover:underline">
                    {r.action.label} <ArrowRight aria-hidden size={15} />
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="next-h" className="container-x mt-20">
        <h2 id="next-h" className="sr-only">
          繼續逛
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Link
            href={zonePath(other)}
            className="card reveal group flex items-center gap-5 p-6 transition-colors hover:border-[color:var(--zone)] md:p-8"
            style={{ "--zone": `${other.color}99` } as React.CSSProperties}
          >
            <span aria-hidden className="font-serif text-7xl font-bold leading-none" style={{ color: other.color }}>
              {other.char}
            </span>
            <span>
              <span className="block text-xs tracking-widest text-dim">另一個展區</span>
              <span className="mt-1 block font-serif text-xl font-bold">
                {zoneName(other)}｜{other.subtitle}
              </span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-glow group-hover:underline">
                前往 <ArrowRight aria-hidden size={15} />
              </span>
            </span>
          </Link>
          <div className="card reveal flex flex-col justify-center p-6 md:p-8" style={d(100)}>
            <h3 className="font-serif text-xl font-bold">親自走一趟展區</h3>
            <p className="mt-1 text-sm text-dim">3/19（五）15:00、3/20（六）14:00 起開放，免費入場。</p>
            <Link href="/themes" className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-bold text-glow hover:underline">
              <ArrowLeft aria-hidden size={15} /> 回展區介紹
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
