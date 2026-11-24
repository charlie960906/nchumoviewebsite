"use client";

import { useState } from "react";
import { Check, Download } from "lucide-react";
import { renderCard, shareOrDownload, shareText, type CardSpec } from "@/lib/shareCard";
import { track } from "@/lib/track";

export default function ShareCardButton({
  spec,
  filename,
  game,
  label = "存成限時動態圖",
}: {
  spec: CardSpec;
  filename: string;
  /** GA4 interactive_play 的 game 參數 */
  game: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  const run = async () => {
    track("interactive_play", { game, action: "share_card", item: filename });
    setState("busy");
    try {
      const blob = await renderCard(spec);
      await shareOrDownload(blob, filename, shareText);
      setState("done");
      setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("error");
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={run} disabled={state === "busy"} className="btn btn-primary">
        {state === "busy" ? <span className="ripple-spinner" aria-hidden /> : state === "done" ? <Check aria-hidden size={18} /> : <Download aria-hidden size={18} />}
        {state === "busy" ? "產生中…" : state === "done" ? "完成" : label}
      </button>
      <span role="status" className="text-xs text-err">
        {state === "error" ? "圖片產生失敗，請再試一次。" : ""}
      </span>
    </span>
  );
}
