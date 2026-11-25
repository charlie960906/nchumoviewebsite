import { THEME, THEME_CHAR } from "./theme";

/**
 * 全站單一資料來源：電影節名稱、時間、地點、主辦與 Luma 設定。
 * 之後資訊有更動（例如講座確定、場地公布），只需要改這裡。
 */
const nchu = {
  role: "指導單位",
  name: "國立中興大學",
  nameEn: "National Chung Hsing University",
  url: "https://www.nchu.edu.tw/",
  logo: "/brand/nchu.png",
  logoW: 854,
  logoH: 201,
};

const oia = {
  role: "指導單位",
  name: "國立中興大學國際事務處",
  nameEn: "Office of International Affairs, NCHU",
  url: "https://www.oia.nchu.edu.tw/",
  logo: "/brand/oia.png",
  logoW: 900,
  logoH: 185,
};

const io = {
  role: "策劃執行",
  name: "興意點 Intuitive Observer",
  nameEn: "Intuitive Observer",
  url: "",
  logo: "/brand/intuitive-observer.png",
  logoW: 251,
  logoH: 235,
};

export const site = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nchufilmfestival.ripple.hyjdevelop.com").replace(/\/$/, ""),
  year: 2027,
  themeChar: THEME_CHAR,
  themeEn: "Ripple",
  name: "2027 中興星空電影節",
  nameEn: "NCHU Starlight Film Festival 2027",
  shortName: "中興星空電影節",
  get fullName() {
    return `${this.name}「${THEME}」`;
  },
  tagline: "願你在漂泊裡仍能晤見流光",
  description:
    `2027 中興星空電影節「${THEME}」將於 2027 年 3 月 19 日（五）至 3 月 20 日（六）在國立中興大學登場。兩晚星空下的草地放映、市集展覽、現場演出與映後講座，免費入場、不需報名，當天直接到場即可。`,
  keywords: [
    "興大電影節",
    "星空電影節",
    "中興星空電影節",
    "興大國際星空電影節",
    `${THEME}`,
    "中興大學電影",
    "中興星光電影節",
    "台中 戶外電影",
    "美國女孩 阮鳳儀",
  ],
  /** 活動起訖（Asia/Taipei, UTC+8） */
  start: "2027-03-19T15:00:00+08:00",
  end: "2027-03-20T23:00:00+08:00",
  venue: {
    name: "國立中興大學",
    nameEn: "National Chung Hsing University",
    address: "402 臺中市南區興大路 145 號",
    locality: "臺中市",
    region: "南區",
    postalCode: "402",
    country: "TW",
    lat: 24.1236,
    lng: 120.6752,
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=%E5%9C%8B%E7%AB%8B%E4%B8%AD%E8%88%88%E5%A4%A7%E5%AD%B8",
  },
  luma: {
    url: "https://luma.com/fzk0dc6n",
    eventId: "evt-p8d2JSATmaZcHdi",
    script: "https://embed.lu.ma/checkout-button.js",
  },
  /** 指導單位（關於頁、頁尾放在同一組顯示） */
  advisors: [nchu, oia],
  /** 執行單位 */
  producer: io,
  /** [0] 國際事務處（JSON-LD organizer）、[1] 執行單位；其他檔案依索引使用 */
  organizers: [oia, io],
  contact: {
    email: "",
    instagram: "https://www.instagram.com/nchu_intuitive_observer/?hl=zh-tw",
    threads: "https://www.threads.com/@nchu_intuitive_observer",
    facebook: "",
  },
  /** 《美國女孩》映後 QA 事前提問表單（例如 Google 表單）；留空時顯示即將開放。 */
  qaFormUrl: "",
  /** 前導短片（YouTube embed 網址）；留空時顯示預留區。 */
  trailerUrl: "",
} as const;

export type NavLink = { href: string; label: string };
export type NavItem = NavLink & { children?: readonly NavLink[] };

export type NavGroup = { title: string; titleEn: string; href: string; links: readonly NavLink[] };

/**
 * 網頁導覽分組：頁尾四欄與上方導覽列的下拉選單共用這一份，兩邊內容永遠一致。
 * href 是該組的代表頁，用來判斷導覽列哪一項是目前所在位置。
 */
export const footerNav: readonly NavGroup[] = [
  {
    title: "展區介紹",
    titleEn: "Exhibitions",
    href: "/themes",
    links: [
      { href: "/themes", label: "策展理念" },
      { href: "/themes/siu", label: "泅 Siû" },
      { href: "/themes/gia", label: "涯 Giâ" },
    ],
  },
  {
    title: "活動與市集",
    titleEn: "Program",
    href: "/program",
    links: [
      { href: "/program", label: "活動與市集" },
      { href: "/program/american-girl-talk", label: "映後講座" },
      { href: "/program/american-girl", label: "《美國女孩》" },
      // 《琳達！琳達！》未取得授權暫時下架（2026-11-25），新片確定後補上
    ],
  },
  {
    title: "參觀資訊",
    titleEn: "Visit",
    href: "/guide",
    links: [
      { href: "/guide", label: "現場指引" },
      { href: "/interactive", label: "線上互動館" },
    ],
  },
  {
    title: "關於",
    titleEn: "About",
    href: "/about",
    links: [
      { href: "/about", label: "關於電影節" },
      { href: "/team", label: "團隊成員" },
      { href: "/update", label: "網站更新紀錄" },
    ],
  },
];

/** 只放在頁尾、不出現在上方導覽列的頁面 */
const footerOnly = new Set(["/update"]);
/** 在上方導覽列的下拉選單中排到該組最前面的頁面（頁尾維持原順序） */
const navFirst = new Set(["/team"]);

/** 上方導覽列：首頁 + 頁尾各組（每組顯示為下拉選單，內容與頁尾相同，但排除 footerOnly、navFirst 排最前）。 */
export const nav: readonly NavItem[] = [
  { href: "/", label: "首頁" },
  ...footerNav.map((g) => ({
    href: g.href,
    label: g.title,
    children: g.links
      .filter((l) => !footerOnly.has(l.href))
      .sort((a, b) => Number(navFirst.has(b.href)) - Number(navFirst.has(a.href))),
  })),
];

export function abs(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
