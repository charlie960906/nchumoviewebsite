import { code128B } from "./code128";
import { site } from "./site";
import { THEME } from "./theme";

/**
 * 撕下的電影票根：在瀏覽器端用 Canvas 畫成 1080×1350（4:5，IG 貼文尺寸）的 PNG。
 * 票根右側是撕開的鋸齒邊，上下兩角保留電影票的半圓缺口。
 */
export type StubSpec = {
  title: string;
  titleEn?: string;
  meta: string[];
  code: string;
  /** 例如「2027.03.19 FRI 18:30」 */
  when: string;
  /** 票根上實際使用的字型（從頁面元素的 computed style 取得，畫出來才會一致） */
  fontFamily: string;
};

const PAPER = "#f2f2f0";
const INK = "#3a3a3a";
const BAR = "#4e5d80";

export async function renderStub(s: StubSpec): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const f = s.fontFamily;
  const text = [s.title, s.titleEn ?? "", ...s.meta, THEME, site.name].join("");
  try {
    await Promise.all([
      document.fonts.load(`300 64px ${f}`, text),
      document.fonts.load(`italic 500 38px ${f}`, text),
      document.fonts.load(`700 40px ${f}`, text),
    ]);
  } catch {}

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const spacing = (px: number) => {
    if ("letterSpacing" in g) (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`;
  };

  // 夜空底＋漣漪
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1d3352");
  bg.addColorStop(0.6, "#0a2234");
  bg.addColorStop(1, "#001218");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  for (let i = 1; i <= 6; i++) {
    g.strokeStyle = `rgba(140,196,236,${0.22 - i * 0.03})`;
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(W / 2, 560, i * 130, i * 130, 0, 0, Math.PI * 2);
    g.stroke();
  }

  // 票根外形：左側圓角、右側撕開的鋸齒邊、右上右下半圓缺口
  const x = 180;
  const y = 140;
  const w = 720;
  const h = 860;
  const r = 28;
  const n = 46;
  g.beginPath();
  g.moveTo(x + r, y);
  g.lineTo(x + w - n, y);
  g.arc(x + w, y, n, Math.PI, Math.PI / 2, true);
  let yy = y + n;
  let out = true;
  while (yy < y + h - n) {
    yy = Math.min(yy + 12, y + h - n);
    g.lineTo(x + w - (out ? 0 : 9), yy);
    out = !out;
  }
  g.arc(x + w, y + h, n, (Math.PI * 3) / 2, Math.PI, true);
  g.lineTo(x + r, y + h);
  g.arcTo(x, y + h, x, y + h - r, r);
  g.lineTo(x, y + r);
  g.arcTo(x, y, x + r, y, r);
  g.closePath();
  g.save();
  g.shadowColor = "rgba(0,0,0,0.45)";
  g.shadowBlur = 50;
  g.shadowOffsetY = 20;
  g.fillStyle = PAPER;
  g.fill();
  g.restore();

  // 直式條碼
  const widths = code128B(s.code);
  const total = widths.reduce((a, b) => a + b, 0) + 20;
  const bx = x + 64;
  const by = y + 80;
  const bh = h - 160;
  const unit = bh / total;
  g.fillStyle = BAR;
  let at = by + 10 * unit;
  widths.forEach((m, i) => {
    if (i % 2 === 0) g.fillRect(bx, at, 92, m * unit);
    at += m * unit;
  });

  // 片名與片目
  const tx = x + 210;
  g.textBaseline = "alphabetic";
  g.textAlign = "left";
  g.fillStyle = INK;
  spacing(10);
  g.font = `300 64px ${f}`;
  g.fillText(s.title, tx, y + 150, x + w - 60 - tx);
  spacing(2);
  if (s.titleEn) {
    g.font = `italic 500 38px ${f}`;
    g.fillText(s.titleEn, tx, y + 220, x + w - 60 - tx);
  }
  g.font = `300 34px ${f}`;
  s.meta.forEach((m, i) => g.fillText(m, tx, y + 360 + i * 60, x + w - 60 - tx));
  spacing(4);
  g.fillStyle = BAR;
  g.font = `500 26px ${f}`;
  g.fillText(`ADMIT ONE · ${s.when}`, tx, y + h - 80, x + w - 60 - tx);

  // 下方電影節資訊
  spacing(2);
  g.textAlign = "center";
  g.fillStyle = "#EAF0F7";
  g.font = `700 40px ${f}`;
  g.fillText(`2027 中興星空電影節「${THEME}」`, W / 2, y + h + 120);
  g.fillStyle = "#8B95A7";
  g.font = `400 30px ${f}`;
  g.fillText(`${s.when}｜國立中興大學`, W / 2, y + h + 172);

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
}
