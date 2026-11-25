import type { Session } from "./schedule";
import { THEME } from "./theme";

export type Program = {
  slug: string;
  kind: "film" | "talk" | "market";
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
  /** 暫時下架：公開網址 404、不出現在任何列表；開發者可用 /program/<slug>/dev 預覽 */
  hidden?: boolean;
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
    /** 劇照路徑（public 底下，可含中文；顯示時用 encodeURI 編碼，否則 priority 圖片的 Link preload header 含非 ASCII 字元會讓伺服器報錯） */
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

/** 所有節目（含暫時下架的）；對外列表請用下面的 programs */
export const allPrograms: Program[] = [
  {
    slug: "american-girl",
    kind: "film",
    kindLabel: "電影放映",
    title: "美國女孩",
    titleEn: "American Girl",
    summary:
      "《美國女孩》是阮鳳儀導演的首部劇情長片，將於 2027 年 3 月 19 日（五）18:30 在國立中興大學星空下放映。故事描寫 2003 年從洛杉磯返回台灣的少女，在母親罹病與 SARS 陰影之間，重新學習「家」是什麼。",
    body: [
      "移民美國五年的莉莉因罹患乳癌，在2003年抱病帶著兩個女兒芳儀、芳安從洛杉磯回到新店，與疏離多年的丈夫宗輝團聚。因為中文障礙在班上成績嚴重落後的芳儀，被同學戲稱為「美國女孩」。橫衝直撞的她面對母親生病深感無力，最渴望的就是回到美國。",
      "隨時擔心癌症惡化的莉莉不能諒解芳儀的各種叛逆行為，再加上在文化衝突、經濟、疾病等壓力之下，莉莉與芳儀的衝突節節升高，並在小女兒芳安於SARS期間被醫院隔離時達到高峰。莉莉原本即將分崩離析的家庭，因一場意外的疫情被迫面對彼此的心結，進而獲得重新開始的契機…",
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
    // 2026-11-25 未取得放映授權，暫時下架；新片討論中
    hidden: true,
    kind: "film",
    kindLabel: "電影放映",
    title: "琳達！琳達！",
    titleEn: "Linda Linda Linda",
    summary:
      "《琳達！琳達！》是山下敦弘導演的青春樂團電影，將於 2027 年 3 月 20 日（六）18:30 在國立中興大學星空下放映。2004 年芝崎高中校慶前夕，樂團吉他手受傷、主唱出走，轉任吉他手的小惠找來日語還說不好的韓國同學小宋擔任主唱，四人要在校慶當天唱出 The Blue Hearts 名曲〈琳達！琳達！〉。",
    body: [
      "2004 年，芝崎高中校慶即將開始，樂團吉他手卻因為打籃球手指骨折，只能無奈退出表演。團員發生爭執，主唱離開樂團，嫌隙在校園裡鬧得風風火火。校慶表演日在即，危機壓力下，轉任吉他手的小惠，賭氣找來連日語都還說不好的韓國同學小宋擔任主唱。時間壓力下，四名成員朝夕相處、密集訓練，決意要在校慶當天，賭上全力以赴的青春，表演 80 年代The Blue Hearts名曲〈琳達！琳達！〉。",
      "日本名導山下敦弘青春不敗經典，時逢20週年4K數位修復再度登上大銀幕。飾演韓國留學生的裴斗娜，與前田亞季、香椎由宇、關根史織攜手組成高校女子四人樂團，在跨文化結合下觸動友誼意外萌芽，也看見學園生活不只有酸甜愛情或熱血奮鬥，還有在瑣碎小事糾纏、尷尬懵懂下支持彼此的相依相伴。20 年後大銀幕重訪，伴隨措手不及的激昂大雨下，不僅是青春回憶的細膩見證，更多一分重燃舊夢的真摯悸動。",
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
    slug: "market",
    kind: "market",
    kindLabel: "星空市集",
    title: "星空市集",
    summary:
      "電影節兩天下午起開放星空市集：3/19（五）15:00、3/20（六）14:00 開始，至 20:30。現場 20 個攤位集合飲品、輕食、甜點、手作、選物、書籍與體驗，放映前可以先來逛一圈。",
    body: [],
    facts: [
      { label: "3/19（五）", value: "15:00 – 20:30" },
      { label: "3/20（六）", value: "14:00 – 20:30" },
      { label: "地點", value: "國立中興大學" },
      { label: "費用", value: "免費入場" },
    ],
    sessionIds: ["d1-market", "d2-market"],
  },
];

/** 對外顯示的節目（排除 hidden） */
export const programs: Program[] = allPrograms.filter((p) => !p.hidden);

/**
 * 片單還沒確定的放映場次，只在節目跑馬燈顯示「敬請期待」卡（不可點、沒有獨立頁面、不進 sitemap／JSON-LD）。
 * 新片確定後：在 allPrograms 新增該片並刪掉這裡對應的項目。
 */
export const comingSoonFilms: Program[] = [
  {
    slug: "film-0320-tbd",
    kind: "film",
    kindLabel: "電影放映",
    title: "敬請期待",
    titleEn: "Coming Soon",
    summary: "3/20（六）放映的電影正在研擬中，確定後公布。",
    body: [],
    facts: [{ label: "片單", value: "正在研擬中" }],
    sessionIds: ["d2-film"],
    tentative: true,
  },
];

/** 含 hidden 的節目，給 dev 預覽頁用；公開頁面拿到 hidden 要自己 notFound() */
export const getProgram = (slug: string) => allPrograms.find((p) => p.slug === slug);

/** 節目頁網址。星空市集沒有獨立頁面（攤商品牌牆在 /program 的「市集攤商」區塊），連到該區塊 */
export const programHref = (slug: string) => (slug === "market" ? "/program#market" : `/program/${slug}`);
