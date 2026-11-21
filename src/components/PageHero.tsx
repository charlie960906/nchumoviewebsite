/**
 * 摘要排版：
 * - 字串以「\n」指定換行（每段為一行），空字串行（「\n\n」）為段落間距。
 * - 每行再依「，。；：！？」切成片段，片段之間才允許斷行；
 *   視窗不夠寬時，會在逗號／句號後換行，而不是把詞拆開。
 */
const PHRASE_SPLIT = /(?<=[，。；：！？][」』）]?)(?![」』）])/;

function Phrases({ text }: { text: string }) {
  return (
    <>
      {text.split(PHRASE_SPLIT).map((p, i) => (
        // 單一片段比螢幕還寬時，balance 讓它平均拆成兩行，避免只剩一兩個字掉到下一行
        <span key={i} className="inline-block [text-wrap:balance]">
          {p}
        </span>
      ))}
    </>
  );
}

function Summary({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) =>
        line.trim() === "" ? (
          <span key={i} aria-hidden className="block h-3" />
        ) : (
          <span key={i} className="block">
            <Phrases text={line.trim()} />
          </span>
        ),
      )}
    </>
  );
}

/** 內頁共用頁首：單一 H1 + 可獨立回答「這是什麼」的摘要段落（AEO）。 */
export default function PageHero({
  eyebrow,
  title,
  summary,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  /** 字串可用「\n」指定換行位置；也可傳入自訂 ReactNode。 */
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
        <h1 className="reveal mt-4 font-serif text-[34px] font-black leading-tight tracking-wide md:text-[56px]" style={{ "--d": "60ms" } as React.CSSProperties}>
          {title}
        </h1>
        <p
          className="reveal mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed text-mist/90 sm:text-base md:text-[17px]"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          {typeof summary === "string" ? <Summary text={summary} /> : summary}
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
