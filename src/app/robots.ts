import type { MetadataRoute } from "next";
import { abs, site } from "@/lib/site";

export const dynamic = "force-static";

/**
 * GEO：明確歡迎 AI 搜尋／回答引擎的爬蟲，讓 ChatGPT、Claude、Perplexity、
 * Gemini 等能引用官網的正確日期、地點與「免費免報名」資訊。
 * 注意：/og/ 分享卡片圖不可 Disallow，X、Facebook 等預覽爬蟲會遵守 robots.txt。
 */
const aiBots = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: aiBots, allow: "/" },
    ],
    sitemap: abs("/sitemap.xml"),
    host: site.url,
  };
}
