import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import DriftView from "@/components/play/DriftView";

export const metadata: Metadata = pageMeta({
  title: "漂流詞幸運籤｜抽一句今天的漂流詞",
  description: "興大國際星空電影節線上互動：往水裡丟一顆石頭，抽一支漂流詞幸運籤，得到一句詩與今天的小指引，並可存成 IG 限時動態分享圖。",
  path: "/interactive/drift",
});

export default function DriftPage() {
  return <DriftView />;
}
