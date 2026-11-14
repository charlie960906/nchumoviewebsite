/**
 * 兩大展區「泅」「涯」的單一資料來源：
 * 策展理念（/themes）與各展區獨立頁（/themes/siu、/themes/gia）共用。
 */

export type ZoneRoom = {
  id: string;
  char: string;
  roman: string;
  phase: "探索" | "抵達";
  desc: string;
  action: { label: string; href: string };
};

export type Zone = {
  slug: "siu" | "gia";
  char: string;
  roman: string;
  subtitle: string;
  color: string;
  intro: string;
  /** 獨立頁頁首摘要：要能單獨回答「這個展區是什麼」 */
  summary: string;
  rooms: readonly [ZoneRoom, ZoneRoom];
};

export const zones: readonly Zone[] = [
  {
    slug: "siu",
    char: "泅",
    roman: "Siû",
    subtitle: "親情與友情",
    color: "#38BDF8",
    intro: "「泅」是游泳。在關係的水裡，我們都還在學怎麼換氣——有時被推著走，有時用力划向某個人。",
    summary:
      "展區「泅 Siû」談親情與友情。「泅」是台語的游泳——在關係的水裡，我們都還在學怎麼換氣。展區分為「傍」與「佮」兩個空間，從還在找尋定位的提問，走到能說出「我佮你」的抵達。",
    rooms: [
      {
        id: "png",
        char: "傍",
        roman: "pn̄g",
        phase: "探索",
        desc: "找尋自己的定位。背負著理想與期待，在人與人之間的拉扯裡，還在找尋的過程——像一個問號的開頭。",
        action: { label: "心理測驗：你是電影中的誰？", href: "/interactive/quiz" },
      },
      {
        id: "kah",
        char: "佮",
        roman: "kah",
        phase: "抵達",
        desc: "已經找到結果，知道自己的定位。「佮」是「和、與」——是終於能說出「我佮你」的那個時刻。",
        action: { label: "貼標籤小遊戲：生成關係名片", href: "/interactive/labels" },
      },
    ],
  },
  {
    slug: "gia",
    char: "涯",
    roman: "Giâ",
    subtitle: "家與土地認同",
    color: "#10B981",
    intro: "「涯」是水的邊界，也是天涯。離開之後，才開始問自己從哪裡來；走得夠遠，才看得清岸的形狀。",
    summary:
      "展區「涯 Giâ」談家與土地認同。「涯」是水的邊界，也是天涯——離開之後，才開始問自己從哪裡來。展區分為「佇」與「佗」兩個空間，從「你佇佗位？」的提問，走到指得出歸屬的抵達。",
    rooms: [
      {
        id: "ti",
        char: "佇",
        roman: "tī",
        phase: "探索",
        desc: "偏向提問。開始找尋自己與土地的連結，找尋自己的由來——「你佇佗位？」（你在哪裡？）",
        action: { label: "地圖探索：從場地地圖開始走", href: "/guide#map" },
      },
      {
        id: "to",
        char: "佗",
        roman: "tó",
        phase: "抵達",
        desc: "這是結果。已經找到自己的歸屬，理解自己和土地的連結——「佗」不再是疑問，而是一個可以指出來的地方。",
        action: { label: "互動小遊戲：拼湊家的符號", href: "/interactive/home" },
      },
    ],
  },
];

export const getZone = (slug: string) => zones.find((z) => z.slug === slug);
export const zonePath = (z: Pick<Zone, "slug">) => `/themes/${z.slug}`;
export const zoneName = (z: Pick<Zone, "char" | "roman">) => `${z.char} ${z.roman}`;
