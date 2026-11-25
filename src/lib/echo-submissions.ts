/**
 * 波紋的音像（Echoes of Home）— 工作人員繳交的黑膠資料庫。
 *
 * 一位成員一筆，用 member（crew.ts 裡的姓名，一字不差）連動團隊名單：
 * - 黑膠上顯示的名字：nickname → crew 的 nick → 姓名。
 * - 組別：crew 的組別（含兼任）自動帶入，不用重填。
 * - /team 點開該成員時，最下方會自動出現他的黑膠。
 *
 * 繳交表對應：
 *   成員姓名 → member　　網址代號 → id（英數小寫與連字號，之後不要改，會變成 /interactive/echoes/{id}）
 *   暱稱 → nickname（選填）　一句話介紹 → bio（選填）
 *   歌曲名稱 → songTitle　歌手 → songArtist　Spotify 連結 → spotify（直接貼分享連結）
 *   故事標題 → storyTitle　故事內容 → storyContent（空行分段、**粗體**；還沒寫可先留空）
 *   代表色 → accentColor（選填）　封面圖 → vinylCover（選填，放 /public/vinyl/）
 *
 * 這個檔案不含 email，前端可以安全匯入。
 */
export type EchoSubmission = {
  member: string;
  id: string;
  nickname?: string;
  bio?: string;
  songTitle: string;
  songArtist: string;
  spotify?: string;
  audioUrl?: string;
  externalUrl?: string;
  storyTitle?: string;
  storyContent?: string;
  storyCover?: string;
  vinylCover?: string;
  accentColor?: string;
};

export const echoSubmissions: EchoSubmission[] = [
  {
    member: "黃宥鈞",
    id: "hyj",
    songTitle: "安九",
    songArtist: "老王樂隊",
    spotify: "https://open.spotify.com/track/0wRgHtaLt0CbQMt78EBALr",
  },
];

/** 沒填代表色時依繳交順序輪流配色 */
const PALETTE = ["#8CC4EC", "#5A9FD4", "#A78BFA", "#F59E0B", "#10B981", "#F472B6", "#22D3EE", "#FDE68A", "#FB7185", "#93C5FD"];
export const accentOf = (sub: EchoSubmission, i: number) => sub.accentColor ?? PALETTE[i % PALETTE.length];

/** 依成員姓名找繳交資料（含索引，用來決定預設配色） */
export function findSubmission(member: string) {
  const i = echoSubmissions.findIndex((s) => s.member === member);
  return i < 0 ? undefined : { sub: echoSubmissions[i], index: i };
}

/** 從 Spotify 連結、spotify:track:URI 或純 ID 取出 22 碼 track ID；無效時回傳 null */
export function spotifyTrackId(s: { spotify?: string }): string | null {
  const v = s.spotify?.trim();
  if (!v) return null;
  const m = v.match(/(?:track[/:])([A-Za-z0-9]{22})/) ?? v.match(/^([A-Za-z0-9]{22})$/);
  return m ? m[1] : null;
}
