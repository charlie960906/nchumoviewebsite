/** 內頁共用頁首：單一 H1 + 可獨立回答「這是什麼」的摘要段落（AEO）。 */
export default function PageHero({
  eyebrow,
  title,
  summary,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  summary: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-tide/20 blur-3xl" />
      </div>
      <div className="container-x relative pb-12 pt-10 md:pb-16 md:pt-16">
        <p className="eyebrow reveal">{eyebrow}</p>
        <h1 className="reveal mt-3 font-serif text-[32px] font-bold tracking-wide md:text-[44px]" style={{ "--d": "60ms" } as React.CSSProperties}>
          {title}
        </h1>
        <p className="reveal mt-5 max-w-2xl text-[17px] text-mist/90" style={{ "--d": "120ms" } as React.CSSProperties}>
          {summary}
        </p>
        {children && (
          <div className="reveal mt-7 flex flex-wrap gap-3" style={{ "--d": "180ms" } as React.CSSProperties}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
