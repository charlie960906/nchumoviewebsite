import { ImageResponse } from "next/og";
import { site } from "./site";
import { THEME_CHAR } from "./theme";

/**
 * 動態社群分享圖（next/og，即 @vercel/og）。
 * 中文字型以 Google Fonts 的 text 子集即時載入（只下載用到的字），失敗時退回預設字型而不讓請求出錯。
 */
async function loadFont(text: string, family: string, weight: number) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export type OgSpec = { kicker: string; lines: string[]; footnote?: string; accent?: string };

export async function ogImage({ kicker, lines, footnote, accent = "#8CC4EC" }: OgSpec) {
  const footer = `${site.name}　2027.03.19 – 03.20　國立中興大學`;
  const all = `${kicker}${lines.join("")}${footnote ?? ""}${footer}${THEME_CHAR}Ripple—`;
  const [serif, sans] = await Promise.all([loadFont(all, "Noto+Serif+TC", 700), loadFont(all, "Noto+Sans+TC", 500)]);
  const fonts = [
    ...(serif ? [{ name: "Serif", data: serif, weight: 700 as const, style: "normal" as const }] : []),
    ...(sans ? [{ name: "Sans", data: sans, weight: 500 as const, style: "normal" as const }] : []),
  ];
  const big = lines.join("").length <= 6;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(160deg, #001218 0%, #05212B 55%, #001218 100%)",
          color: "#EAF0F7",
          fontFamily: "Sans",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 860 - i * 95,
              top: 300 - i * 95,
              width: i * 190,
              height: i * 190,
              borderRadius: 9999,
              border: `2px solid rgba(140,196,236,${0.42 - i * 0.055})`,
            }}
          />
        ))}
        <div style={{ position: "absolute", left: 760, top: 150, display: "flex", fontFamily: "Serif", fontSize: 200, color: "rgba(248,250,252,0.16)" }}>
          {THEME_CHAR}
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: accent, letterSpacing: 6 }}>{kicker}</div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Serif", fontSize: big ? 132 : 68, lineHeight: 1.35, maxWidth: 900 }}>
            {lines.map((l) => (
              <div key={l} style={{ display: "flex" }}>
                {l}
              </div>
            ))}
            {footnote ? <div style={{ display: "flex", marginTop: 20, fontFamily: "Sans", fontSize: 26, color: "#8B95A7" }}>— {footnote}</div> : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: "#D5DEE9" }}>
            <div style={{ display: "flex", width: 56, height: 3, background: accent, marginRight: 20 }} />
            {footer}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: fonts.length ? fonts : undefined },
  );
}
