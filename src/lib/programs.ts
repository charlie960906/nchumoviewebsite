import type { Session } from "./schedule";
import { THEME } from "./theme";

export type Program = {
  slug: string;
  kind: "film" | "talk" | "reading" | "market";
  kindLabel: string;
  title: string;
  titleEn?: string;
  /** 開頭 2–3 句可獨立回答「這是什麼」（AEO） */
  summary: string;
  body: string[];
  facts: { label: string; value: string }[];
  /** 對應時間表場次；空陣列代表時間待公布 */
  sessionIds: Session["id"][];
  tentative?: boolean;
  highlights?: string[];
  /** 電影票 Hero 用的片目資料（只有 kind: "film" 需要） */
  film?: {
    year: number;
    /** 片長（分鐘） */
    runtime: number;
    directorEn: string;
    countries: string[];
    color: "COLOR" | "B&W";
    /** 分級，例如「12+」；未確認就留空不顯示 */
    rating?: string;
    /** 劇照路徑（放在 public/photo/，建議 3:2）；未提供時顯示預留框 */
    still?: string;
    /** 放映格式與語言，例如「DCP / 華語、英語發音，繁體中文字幕」；未確認就留空 */
    format?: string;
    /** 得獎與入圍紀錄（由片商資料提供，依年份排列） */
    awards?: { year: number; title: string }[];
    /** 導演引言（顯示在劇情介紹旁） */
    quote?: { text: string; by: string };
    /** 條碼內容（Code 128，僅限英數與符號，建議 16 字內以免條碼太密） */
    code: string;
  };
};

export const programs: Program[] = [
  {
    slug: "american-girl",
    kind: "film",
    kindLabel: "電影放映",
    title: "美國女孩",
    titleEn: "American Girl",
    summary:
      "《美國女孩》是阮鳳儀導演的首部劇情長片，將於 2027 年 3 月 19 日（五）18:30 在國立中興大學星空下放映。故事描寫 2003 年從洛杉磯返回台灣的少女，在母親罹病與 SARS 陰影之間，重新學習「家」是什麼。",
    body: [
      "十三歲的芳儀被迫離開熟悉的美國，回到一個她以為早已不屬於自己的地方。語言、課業、母親的病——每一件事都像水面下的暗流，把一家人推向彼此，也推離彼此。",
      `這部片呼應本屆主題「${THEME}」：人在異鄉與家鄉之間來回擺盪，每一次衝撞都泛起漣漪，而漣漪最終會抵達某個可以落腳的岸。`,
    ],
    facts: [
      { label: "導演", value: "阮鳳儀" },
      { label: "放映日期", value: "2027/3/19（五）" },
      { label: "放映時間", value: "18:30 – 20:30" },
      { label: "地點", value: "國立中興大學" },
      { label: "費用", value: "免費，免報名" },
    ],
    sessionIds: ["d1-film"],
    film: {
      year: 2021,
      runtime: 101,
      directorEn: "Fiona ROAN Feng-I",
      countries: ["Taiwan"],
      color: "COLOR",
      still: "/photo/美國女孩劇照.jpg",
      format: "DCP / 華語、英語發音，繁體中文字幕",
      awards: [
        { year: 2020, title: "第42屆優良電影劇本獎 特優" },
        { year: 2021, title: "第58屆金馬獎 最佳新導演" },
        { year: 2021, title: "第58屆金馬獎 最佳新演員" },
        { year: 2021, title: "第58屆金馬獎 最佳攝影" },
        { year: 2021, title: "第58屆金馬獎 觀眾票選最佳影片" },
        { year: 2021, title: "第58屆金馬獎 國際影評人費比西獎" },
        { year: 2022, title: "第24屆台北電影獎 最佳劇情長片" },
        { year: 2022, title: "第24屆台北電影獎 最佳新演員" },
      ],
      quote: {
        text: "《美國女孩》的故事以母女情感為核心，闡述成長中的陣痛；當年害怕失去病中母親，她以最惡劣、叛逆的方式與母親爭執不休，以為只要『拒絕長大』，就能『挽留』母親，讓她陪伴久一點。",
        by: "阮鳳儀，《Marie Claire 美麗佳人》專訪，2021",
      },
      code: "NCHUSFF27-AG",
    },
    highlights: ["阮鳳儀導演映後講座", "展區「泅」親情與友情"],
  },
  {
    slug: "american-girl-talk",
    kind: "talk",
    kindLabel: "映後講座",
    title: "《美國女孩》映後講座｜阮鳳儀導演",
    summary:
      "《美國女孩》導演阮鳳儀將親臨中興星空電影節，與觀眾聊電影裡的母女、返鄉與成長。講座確切時段仍在安排中，確定後會同步更新於本頁與 Luma 活動頁。",
    body: [
      "從自身的成長經驗出發，阮鳳儀導演把「回家」拍成一件既親密又陌生的事。講座將從創作起點談起，並開放現場 QA。",
      "想問導演的問題可以事先提交，現場將優先挑選回應。",
    ],
    facts: [
      { label: "講者", value: "阮鳳儀（《美國女孩》導演）" },
      { label: "日期", value: "2027/3/19（五）" },
      { label: "時間", value: "待定（時間表暫列 18:00 – 18:30）" },
      { label: "形式", value: "講座 + 現場 QA" },
    ],
    sessionIds: ["d1-talk"],
    tentative: true,
  },
  {
    slug: "linda-linda-linda",
    kind: "film",
    kindLabel: "電影放映",
    title: "琳達！琳達！",
    titleEn: "Linda Linda Linda",
    summary:
      "《琳達！琳達！》是山下敦弘導演的青春樂團電影，將於 2027 年 3 月 20 日（六）18:30 在國立中興大學星空下放映。校慶前三天，四個女孩臨時組團，其中主唱是一位日文還說不好的韓國交換學生。",
    body: [
      "沒有熱血的勝負，也沒有戲劇化的和解。只有練團室的燈、深夜的便利商店，以及一首反覆練到天亮的歌。語言不通的人，靠著同一段旋律站到了同一個舞台上。",
      `在「${THEME}」的脈絡裡，這是一部關於友情如何成為異鄉人落腳處的電影——漣漪不必很大，夠讓彼此聽見就好。`,
    ],
    facts: [
      { label: "導演", value: "山下敦弘" },
      { label: "放映日期", value: "2027/3/20（六）" },
      { label: "放映時間", value: "18:30 – 20:30" },
      { label: "地點", value: "國立中興大學" },
      { label: "費用", value: "免費，免報名" },
    ],
    sessionIds: ["d2-film"],
    film: {
      year: 2005,
      runtime: 114,
      directorEn: "YAMASHITA Nobuhiro",
      countries: ["Japan"],
      color: "COLOR",
      still: "/photo/Linda_Linda劇照.jpg",
      format: "DCP（4K 修復版）/ 日語發音，繁體中文字幕",
      awards: [
        { year: 2006, title: "電影旬報 年度十大影片 第六名" },
        { year: 2006, title: "日本電影專業大獎 最佳導演" },
        { year: 2006, title: "山路ふみ子映画賞 最佳新人女優獎（香椎由宇）" },
      ],
      quote: {
        text: "這部片裡有當年二十八歲的我身上閃亮的部分，當時讓我覺得害羞；但二十年後回望，我想稱讚當時的自己：能拍出這樣一部電影，做得很好。",
        by: "山下敦弘，韓國《每日經濟》（Maeil Business Newspaper）專訪，2025",
      },
      code: "NCHUSFF27-LL",
    },
    highlights: ["展區「泅」親情與友情", "現場表演演出"],
  },
  {
    slug: "reading-club",
    kind: "reading",
    kindLabel: "讀書會",
    title: "《反正你也不睡覺》讀書會",
    summary:
      "《反正你也不睡覺》讀書會是電影節的延伸活動，邀請參與者在放映之外，用文字繼續聊漂泊、失眠與歸屬。場次時間與參加方式將於確定後公布。",
    body: [
      "有些話適合在電影散場後說，有些則需要一本書的時間。讀書會將以小組形式進行，不需事先讀完全書。",
      "場次時間、地點與帶領人確認後，會更新於本頁並同步至 Luma 活動頁。",
    ],
    facts: [
      { label: "形式", value: "小組讀書會" },
      { label: "時間", value: "待公布" },
      { label: "地點", value: "待公布" },
    ],
    sessionIds: [],
    tentative: true,
  },
  {
    slug: "market-exhibition",
    kind: "market",
    kindLabel: "市集／展覽",
    title: "星空市集與「泅／涯」概念展",
    summary:
      "電影節兩天下午起開放市集與概念展覽：3/19（五）15:00、3/20（六）14:00 開始，至 20:30。現場有 22 個攤位、Water Bar，以及「傍、佮、佇、佗」四個概念展區。",
    body: [
      "市集集合手作、選物、飲食與體驗攤位；概念展則以兩座帳篷呈現「泅」與「涯」兩大主題，從提問走到抵達。",
      "下午另有快閃遊戲與草地表演穿插進行，放映前可以先來逛一圈。",
    ],
    facts: [
      { label: "3/19（五）", value: "15:00 – 20:30" },
      { label: "3/20（六）", value: "14:00 – 20:30" },
      { label: "地點", value: "國立中興大學" },
      { label: "費用", value: "免費入場" },
    ],
    sessionIds: ["d1-market", "d2-market"],
  },
];

export const getProgram = (slug: string) => programs.find((p) => p.slug === slug);
