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
    // 與首頁一致：-mt-16 / pt-16 抵銷 sticky Header 高度，讓 Hero 佔滿整個視窗並垂直置中
    <section className="relative -mt-16 mb-12 flex min-h-[100svh] items-center overflow-hidden pt-16 md:mb-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tide/20 blur-3xl" />
      </div>
      <div className="container-x relative w-full py-10 text-center">
        <p className="eyebrow reveal">{eyebrow}</p>
        <h1 className="reveal mt-3 font-serif text-[32px] font-bold tracking-wide md:text-[44px]" style={{ "--d": "60ms" } as React.CSSProperties}>
          {title}
        </h1>
        <p className="reveal mx-auto mt-5 max-w-2xl text-[17px] text-mist/90" style={{ "--d": "120ms" } as React.CSSProperties}>
          {summary}
        </p>
        {children && (
          <div className="reveal mx-auto mt-7 flex max-w-sm flex-col justify-center gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3" style={{ "--d": "180ms" } as React.CSSProperties}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
