import type { Metadata } from "next";
import { site } from "./site";

type OgImage = { url: string; width?: number; height?: number; alt?: string };

/** 子頁設定 openGraph 時不會繼承 app/opengraph-image，因此明確帶上主視覺 */
const defaultImages: OgImage[] = [{ url: "/opengraph-image", width: 1200, height: 630, alt: site.fullName }];

/** GEO：每頁都附上給 LLM 讀的 llms.txt 連結（子頁的 alternates 會整個取代 layout 的設定） */
export const llmsAlternate = { "text/plain": [{ url: "/llms.txt", title: "llms.txt" }] };

/**
 * 子頁共用的 metadata：canonical、Open Graph、Twitter 一次補齊。
 * Next 的 openGraph 在子頁設定時會整個取代 layout 的設定，
 * 所以 siteName／locale／url 必須每頁都帶，否則分享預覽會顯示首頁網址。
 * 未指定 images 時使用 app/opengraph-image 的主視覺。
 */
export function pageMeta({
  title,
  description,
  path,
  ogTitle,
  type = "website",
  images,
  canonical,
}: {
  title: string;
  description: string;
  path: string;
  /** 分享卡片標題；預設為「頁面標題｜電影節名稱」 */
  ogTitle?: string;
  type?: "website" | "article";
  images?: OgImage[];
  /** 內容與其他頁重複時，canonical 可指向主頁面 */
  canonical?: string;
}): Metadata {
  const shareTitle = ogTitle ?? `${title}｜${site.shortName}`;
  const img = images ?? defaultImages;
  return {
    title,
    description,
    alternates: { canonical: canonical ?? path, types: llmsAlternate },
    openGraph: {
      type,
      locale: "zh_TW",
      siteName: site.fullName,
      title: shareTitle,
      description,
      url: path,
      images: img,
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: img },
  };
}
