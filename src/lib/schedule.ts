export type Category = "market" | "game" | "show" | "talk" | "film" | "closing";

export const categories: Record<Category, { label: string; dot: string }> = {
  market: { label: "星空市集", dot: "#8CC4EC" },
  game: { label: "快閃遊戲", dot: "#F59E0B" },
  show: { label: "表演演出", dot: "#A78BFA" },
  talk: { label: "電影演講會", dot: "#10B981" },
  film: { label: "電影放映", dot: "#EAF0F7" },
  closing: { label: "收尾", dot: "#8B95A7" },
};

export type Session = {
  id: string;
  day: "0319" | "0320";
  start: string; // HH:mm
  end: string;
  title: string;
  category: Category;
  note?: string;
  /** 待定場次：畫面、行事曆與 JSON-LD 皆會標示 */
  tentative?: boolean;
  /** 連到 /program/[slug] */
  program?: string;
};

export const days = [
  { key: "0319", date: "2027-03-19", label: "3/19", weekday: "五", full: "2027 年 3 月 19 日（五）" },
  { key: "0320", date: "2027-03-20", label: "3/20", weekday: "六", full: "2027 年 3 月 20 日（六）" },
] as const;

export const sessions: Session[] = [
  { id: "d1-market", day: "0319", start: "15:00", end: "20:30", title: "星空市集開始", category: "market", program: "market" },
  { id: "d1-game-1", day: "0319", start: "15:30", end: "16:00", title: "快閃遊戲", category: "game" },
  { id: "d1-game-2", day: "0319", start: "16:30", end: "17:00", title: "快閃遊戲", category: "game" },
  { id: "d1-show-1", day: "0319", start: "17:10", end: "17:30", title: "表演演出", category: "show" },
  { id: "d1-show-2", day: "0319", start: "17:30", end: "17:50", title: "表演演出", category: "show" },
  { id: "d1-talk", day: "0319", start: "18:00", end: "18:30", title: "電影演講會", category: "talk", tentative: true, note: "內容與講者待定", program: "american-girl-talk" },
  { id: "d1-film", day: "0319", start: "18:30", end: "20:30", title: "電影放映《美國女孩》", category: "film", program: "american-girl" },
  { id: "d1-close", day: "0319", start: "20:30", end: "22:00", title: "活動結束收尾", category: "closing" },

  { id: "d2-market", day: "0320", start: "14:00", end: "20:30", title: "星空市集開始", category: "market", program: "market" },
  { id: "d2-show-1", day: "0320", start: "14:00", end: "15:30", title: "表演演出", category: "show" },
  { id: "d2-game-1", day: "0320", start: "15:30", end: "16:00", title: "快閃遊戲", category: "game" },
  { id: "d2-show-2", day: "0320", start: "16:00", end: "17:30", title: "表演演出", category: "show" },
  { id: "d2-game-2", day: "0320", start: "17:30", end: "18:00", title: "快閃遊戲", category: "game" },
  { id: "d2-talk", day: "0320", start: "18:00", end: "18:30", title: "電影演講會", category: "talk", tentative: true, note: "內容與講者待定" },
  { id: "d2-film", day: "0320", start: "18:30", end: "20:30", title: "電影放映《琳達！琳達！》", category: "film", program: "linda-linda-linda" },
  { id: "d2-close", day: "0320", start: "20:30", end: "23:00", title: "活動結束收尾", category: "closing" },
];

export function dayOf(key: Session["day"]) {
  return days.find((d) => d.key === key)!;
}

/** 轉成帶時區的 ISO 字串（Asia/Taipei） */
export function iso(day: Session["day"], time: string) {
  return `${dayOf(day).date}T${time}:00+08:00`;
}
