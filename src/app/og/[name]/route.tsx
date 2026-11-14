import { ogImage } from "@/lib/og";
import { drifts, quiz, type QuizResultKey } from "@/lib/content";
import { getStaff, staff } from "@/lib/staff";

/**
 * 個人化分享卡片（1200×630），於建置時全部產生為靜態 PNG：
 * /og/drift-03.png、/og/quiz-fen.png、/og/vinyl-tide.png
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...drifts.map((d) => `drift-${d.id}`),
    ...Object.keys(quiz.results).map((k) => `quiz-${k}`),
    ...staff.map((s) => `vinyl-${s.id}`),
  ].map((n) => ({ name: `${n}.png` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const [kind, ...rest] = (await params).name.replace(/\.png$/, "").split("-");
  const id = rest.join("-");

  if (kind === "drift") {
    const d = drifts.find((x) => x.id === id);
    if (d) return ogImage({ kicker: `漂流詞幸運籤・第 ${d.id} 籤`, lines: d.text.split("\n"), footnote: d.source });
  }
  if (kind === "quiz" && id in quiz.results) {
    const r = quiz.results[id as QuizResultKey];
    return ogImage({ kicker: "你是《美國女孩》裡的誰？", lines: [r.name, r.tag], accent: r.color });
  }
  if (kind === "vinyl") {
    const s = getStaff(id);
    if (s) return ogImage({ kicker: `波紋的音像・${s.name}`, lines: [s.storyTitle], footnote: `♪ ${s.songTitle}`, accent: s.accentColor });
  }
  return new Response("Not found", { status: 404 });
}
