import { abs, site } from "./site";
import { THEME } from "./theme";
import { faqs } from "./content";
import { programHref, programs } from "./programs";
import { days, sessions } from "./schedule";
import { zoneName, zonePath, zones } from "./zones";

/**
 * llms.txt（https://llmstxt.org）：給大型語言模型／AI 搜尋讀的精簡站點說明。
 * 全部從站內資料模組產生，資訊更新時不必另外維護。
 */

const facts = () => [
  `- 活動名稱：${site.fullName}（英文：${site.nameEn}；簡稱：${site.shortName}）`,
  `- 日期：2027 年 3 月 19 日（五）15:00–22:00、3 月 20 日（六）14:00–23:00（台灣時間 UTC+8）`,
  `- 地點：${site.venue.name}（${site.venue.address}）`,
  `- 費用：免費入場、不需報名，當天直接到場即可`,
  `- 指導：國立中興大學、${site.organizers[0].name}；策劃執行：${site.organizers[1].name}`,
  `- 活動提醒（Luma）：${site.luma.url}`,
  `- Instagram：${site.contact.instagram}`,
  `- 官方網站：${abs("/")}`,
];

export function llmsTxt() {
  const lines = [
    `# ${site.fullName}`,
    "",
    `> ${site.description}`,
    "",
    "## 重點資訊",
    ...facts(),
    "",
    "## 主要頁面",
    `- [首頁](${abs("/")})：活動總覽、放映片單、時間表與常見問題`,
    `- [活動與市集](${abs("/program")})：兩天完整時間表`,
    ...programs.map((p) => `- [${p.kind === "film" ? `《${p.title}》星空放映` : p.title}](${abs(programHref(p.slug))})：${p.summary}`),
    `- [策展理念](${abs("/themes")})：主題「${THEME}」與兩大展區`,
    ...zones.map((z) => `- [展區「${zoneName(z)}」](${abs(zonePath(z))})：${z.summary}`),
    `- [現場指引](${abs("/guide")})：場地地圖、交通、停車與無障礙`,
    `- [關於電影節](${abs("/about")})：指導與執行單位、聯絡方式`,
    `- [團隊成員](${abs("/team")})`,
    "",
    "## Optional",
    `- [線上互動館](${abs("/interactive")})：波紋的音像、漂流詞幸運籤、心理測驗`,
    `- [完整內容（llms-full.txt）](${abs("/llms-full.txt")})`,
    "",
  ];
  return lines.join("\n");
}

export function llmsFullTxt() {
  const lines = [
    `# ${site.fullName}`,
    "",
    `> ${site.description}`,
    "",
    "## 重點資訊",
    ...facts(),
    "",
    "## 活動時間表",
  ];
  for (const d of days) {
    lines.push("", `### ${d.full}`);
    for (const s of sessions.filter((x) => x.day === d.key)) {
      lines.push(`- ${s.start}–${s.end}　${s.title}${s.tentative ? "（待定）" : ""}`);
    }
  }
  lines.push("", "## 節目介紹");
  for (const p of programs) {
    lines.push("", `### ${p.kind === "film" ? `《${p.title}》` : p.title}`, `網址：${abs(programHref(p.slug))}`, "", p.summary, "");
    lines.push(...p.body.map((b) => b), "");
    lines.push(...p.facts.map((f) => `- ${f.label}：${f.value}`));
  }
  lines.push("", "## 策展理念與展區");
  for (const z of zones) {
    lines.push("", `### 展區「${zoneName(z)}」：${z.subtitle}`, `網址：${abs(zonePath(z))}`, "", z.summary, "");
    lines.push(...z.rooms.map((r) => `- 「${r.char} ${r.roman}」（${r.phase}）：${r.desc}`));
  }
  lines.push("", "## 常見問題");
  for (const f of faqs) lines.push("", `### ${f.q}`, "", f.a);
  lines.push("");
  return lines.join("\n");
}
