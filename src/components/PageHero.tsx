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
  ticket,
}: {
  eyebrow: string;
  title: React.ReactNode;
  /** 傳入時取代標題區（內含自己的 H1），例如電影介紹頁的電影票 */
  ticket?: React.ReactNode;
  /** 字串可用「\n」指定換行位置；也可傳入自訂 ReactNode。 */
  summary?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    // 與首頁一致：-mt-16 / pt-16 抵銷 sticky Header 高度，讓 Hero 佔滿整個視窗並垂直置中
    <section className="relative -mt-16 mb-12 flex min-h-[100svh] items-center overflow-hidden pt-16 md:mb-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* 與首頁 Hero 相同：上方海軍藍 #1d3352，整片往下慢慢過渡到頁面的深藍黑 */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#1d3352_0%,#172b46_30%,#10213a_50%,#071a26_75%,#001218_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-night" />
      </div>
      <div className={`container-x relative w-full py-10 text-center ${ticket ? "short:py-4" : ""}`}>
        <p className="eyebrow reveal-now">{eyebrow}</p>
        {ticket ? (
          <div className="mt-6 short:mt-3">{ticket}</div>
        ) : (
        <h1 className="reveal-now mt-4 font-serif text-[34px] font-black leading-tight tracking-wide md:text-[56px]" style={{ "--d": "60ms" } as React.CSSProperties}>
          {title}
        </h1>
        )}
        {summary && (
        <p
          className="reveal-now mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed text-mist/90 sm:text-base md:text-[17px]"
          style={{ "--d": "120ms" } as React.CSSProperties}
        >
          {typeof summary === "string" ? <Summary text={summary} /> : summary}
        </p>
        )}
        {children && (
          <div className="reveal-now mx-auto mt-7 flex max-w-sm flex-col justify-center gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3" style={{ "--d": "180ms" } as React.CSSProperties}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
