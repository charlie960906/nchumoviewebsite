import type { Vendor } from "@/lib/vendors";

/** 單一攤商卡片：輪播（VendorCarousel）與星空市集頁的攤商列表共用 */
export default function VendorCard({ vendor: v }: { vendor: Vendor }) {
  return (
    <article className="card card-hover flex h-full flex-col overflow-hidden">
      <div className="relative flex h-44 items-end md:h-52 justify-between bg-gradient-to-br from-tide/25 via-night-3 to-night p-5">
        <span aria-hidden className="font-serif text-6xl font-black text-moon/15">{v.name.slice(0, 1)}</span>
        <span className="font-mono text-xs tracking-[0.2em] text-glow">BOOTH {v.booth}</span>
      </div>
      <div className="flex min-h-48 flex-1 flex-col p-5 md:p-6">
        <span className="tag self-start">{v.category}</span>
        <h3 className="mt-3 font-serif text-xl font-black">{v.name}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-mist/90">{v.summary}</p>
      </div>
    </article>
  );
}
