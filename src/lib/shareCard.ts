import { site } from "./site";
import { THEME } from "./theme";

/**
 * 在瀏覽器端以 Canvas 產生 IG 限時動態尺寸（1080×1920）的分享卡片。
 * 使用頁面已載入的網頁字型，離線也能產生；社群連結預覽用的 OG 圖另於建置時由 /og/[name] 產生。
 */
export type CardSpec = {
  kicker: string; // 上方小標，例如「漂流詞幸運籤」
  lines: string[]; // 主文（每個元素一行）
  sub?: string; // 主文下方說明
  footnote?: string; // 出處
  accent?: string;
  emoji?: string[]; // 可選：置於主文上方的大符號
};

const cssFont = (v: string, fb: string) => {
  const f = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return f ? `${f}, ${fb}` : fb;
};

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const out: string[] = [];
  let cur = "";
  for (const ch of text) {
    if (g.measureText(cur + ch).width > maxW && cur) {
      out.push(cur);
      cur = ch;
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

export async function renderCard(spec: CardSpec): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const accent = spec.accent ?? "#38BDF8";
  const serif = cssFont("--font-noto-serif", "serif");
  const sans = cssFont("--font-noto-sans", "sans-serif");
  const mono = cssFont("--font-jb-mono", "monospace");

  const all = [spec.kicker, ...spec.lines, spec.sub ?? "", spec.footnote ?? "", site.fullName].join("");
  try {
    await Promise.all([
      document.fonts.load(`700 80px ${serif}`, all),
      document.fonts.load(`400 36px ${sans}`, all),
    ]);
  } catch {}

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;

  // 夜空底
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0B192C");
  bg.addColorStop(0.55, "#0c2a44");
  bg.addColorStop(1, "#0B192C");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  const halo = g.createRadialGradient(W / 2, H * 0.44, 40, W / 2, H * 0.44, 760);
  halo.addColorStop(0, `${accent}55`);
  halo.addColorStop(1, `${accent}00`);
  g.fillStyle = halo;
  g.fillRect(0, 0, W, H);

  // 星點
  let seed = spec.lines.join("").length * 97 + 13;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(248,250,252,${0.15 + rnd() * 0.55})`;
    g.beginPath();
    g.arc(rnd() * W, rnd() * H, 0.8 + rnd() * 2.2, 0, Math.PI * 2);
    g.fill();
  }

  // 漣漪
  for (let i = 1; i <= 7; i++) {
    g.strokeStyle = `rgba(56,189,248,${0.34 - i * 0.04})`;
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(W / 2, H * 0.44, i * 118, i * 118, 0, 0, Math.PI * 2);
    g.stroke();
  }

  g.textAlign = "center";
  g.textBaseline = "middle";

  // 上方小標
  g.fillStyle = accent;
  g.font = `700 34px ${mono}`;
  g.fillText("R I P P L E", W / 2, 210);
  g.fillStyle = "#F8FAFC";
  g.font = `500 40px ${sans}`;
  g.fillText(spec.kicker, W / 2, 280);

  // 主文
  g.font = `700 84px ${serif}`;
  const lines = spec.lines.flatMap((l) => wrap(g, l, W - 200));
  const lh = 132;
  let y = H * 0.44 - ((lines.length - 1) * lh) / 2;
  if (spec.emoji?.length) {
    g.font = `120px ${sans}`;
    const gap = 170;
    const x0 = W / 2 - ((spec.emoji.length - 1) * gap) / 2;
    spec.emoji.forEach((e, i) => g.fillText(e, x0 + i * gap, y - 190));
    g.font = `700 84px ${serif}`;
  }
  g.shadowColor = "rgba(11,25,44,0.9)";
  g.shadowBlur = 30;
  g.fillStyle = "#F8FAFC";
  for (const l of lines) {
    g.fillText(l, W / 2, y);
    y += lh;
  }
  g.shadowBlur = 0;

  if (spec.footnote) {
    g.fillStyle = "#94A3B8";
    g.font = `400 34px ${sans}`;
    g.fillText(`— ${spec.footnote}`, W / 2, y + 10);
    y += 80;
  }
  if (spec.sub) {
    g.font = `500 42px ${sans}`;
    g.fillStyle = "#F1F5F9";
    const subs = wrap(g, spec.sub, W - 240);
    let sy = Math.max(y + 110, H * 0.7);
    for (const s of subs) {
      g.fillText(s, W / 2, sy);
      sy += 64;
    }
  }

  // 品牌與活動提醒連結
  g.fillStyle = "rgba(56,189,248,0.4)";
  g.fillRect(W / 2 - 60, H - 330, 120, 2);
  g.fillStyle = "#F8FAFC";
  g.font = `700 44px ${serif}`;
  g.fillText(`2027 興大國際星空電影節「${THEME}」`, W / 2, H - 260);
  g.fillStyle = "#94A3B8";
  g.font = `400 34px ${sans}`;
  g.fillText("2027.03.19 – 03.20｜國立中興大學", W / 2, H - 200);
  g.fillStyle = accent;
  g.font = `700 34px ${mono}`;
  g.fillText(site.luma.url.replace("https://", ""), W / 2, H - 140);

  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("toBlob failed"))), "image/png"));
}

/** 手機優先走系統分享（可直接分享到 IG 限動）；否則下載 PNG。回傳實際採用的方式。 */
export async function shareOrDownload(blob: Blob, filename: string, text: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "shared";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "downloaded";
}

export const shareText = `${site.fullName}｜2027/3/19–3/20 國立中興大學，免費入場、免報名 ${site.luma.url}`;
