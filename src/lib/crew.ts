import "server-only";
import { createHash } from "node:crypto";
import { accentOf, findSubmission } from "@/lib/echo-submissions";

/**
 * 工作人員名單（正式）。依部門分組，顯示於 /team。
 * 「波紋的音像」的黑膠繳交資料在 echo-submissions.ts，以成員姓名連動。
 *
 * - 分區以「組」為單位（公關組、影紀組…），不再用「部」。
 * - email：成員登入 Gravatar 的信箱。只在建置時於伺服器端雜湊成 SHA-256，
 *   不會出現在輸出的 HTML 或 JS 中。留空或該信箱沒有 Gravatar 時，顯示姓名縮寫方塊。
 * - nick：暱稱／英文名（選填），只顯示在詳細資料面板。
 * - role：職稱（選填，例如「行政部部長」）。結尾是「部長」的一律排在該組最前面，其餘依名單順序。
 * - team：成員自己的組（選填）。區塊是「部」時（例如行政部＝公關組＋市集組）用它標出組別；
 *   沒填就以區塊名稱當組別。
 * - also：兼任的其他組（選填）。成員只列在主要的組一次，姓名下方顯示「策展組&公關組」。
 * - duty：職責（選填，例如「策展顧問」），顯示在詳細資料面板。
 * - 「波紋的音像」黑膠：成員在 echo-submissions.ts 有繳交（member 填同一個姓名）就自動連動，
 *   點開成員的詳細資料最下方會出現他的黑膠與歌名，點擊跳轉到 /interactive/echoes/{id} 故事頁。
 * - 「關於我」取自成員 Gravatar 個人檔案的 About Me：伺服器端不抓（避免 40 多個請求拖慢換頁），
 *   頁面顯示後由瀏覽器在閒置時／點開成員時向 Gravatar 讀取。
 * - 資料來源：成員資料.xlsx（2026-11-25）。學號、手機、系級、詳細分類不放上網站。
 *
 * ⚠ 這個檔案只能由 Server Component 匯入（"server-only" 會擋下誤用），避免信箱進入前端 bundle。
 */
export type CrewMember = {
  name: string;
  nick?: string;
  role?: string;
  team?: string;
  also?: readonly string[];
  duty?: string;
  email?: string;
};
/** dept：分區名稱（組名） */
export type CrewGroup = { id: string; dept: string; en: string; desc: string; members: CrewMember[] };

const m = (name: string, extra: Omit<CrewMember, "name"> = {}): CrewMember => ({ name, ...extra });

const ADMIN_LEAD = "行政部部長";
const MARKETING_LEAD = "行銷部部長";

export const crew: CrewGroup[] = [
  {
    id: "lead",
    dept: "召部",
    en: "Directors",
    desc: "統籌整個電影節的核心團隊，負責協調各組運作、制定方向。\n電影節的領航者，確保整體活動順利進行並達成目標。",
    members: [
      m("洪愛佳", { role: "總召", email: "aijia0603@gmail.com" }),
      m("林鈊渘", { role: "副召", email: "koala082700@gmail.com" }),
    ],
  },
  {
    id: "admin",
    dept: "行政部",
    en: "Administration",
    desc: "對外聯繫合作單位與贊助、處理經費與文書，\n也招募攤商、規劃攤位與動線，撐起星空下的市集。",
    members: [
      m("張碩貽", { team: "公關組", role: ADMIN_LEAD, also: ["會計組"], email: "zhangshuoyi897@gmail.com" }),
      m("陳昜安", { team: "公關組", email: "chenyoung1128@gmail.com" }),
      m("賴映儒", { team: "公關組", email: "laiyingju315@gmail.com" }),
      m("江佩諭", { team: "市集組", role: ADMIN_LEAD, email: "pinky940928@gmail.com" }),
      m("蘇家佳", { team: "市集組", email: "suchia22222@gmail.com" }),
      m("朱宇禎", { team: "市集組", email: "yujencheryl@gmail.com" }),
    ],
  },
  {
    id: "curation",
    dept: "策展部",
    en: "Curatorial",
    desc: "規劃展區、展品與活動內容，\n把主題化為可以看得見、摸得到的內容。",
    members: [
      m("邱婕", { role: "策展部部長", email: "julie0905852735@gmail.com" }),
      m("洪培恩", { role: "策展部部長", email: "a0909524151@gmail.com" }),
      m("黃意婷", { email: "tingx20931013@gmail.com" }),
      m("吳昱慧", { email: "eva20060117@gmail.com" }),
      m("魏子祐", { email: "luiex941104@gmail.com" }),
      m("何宜恩", { email: "yiiieleynx@gmail.com" }),
      m("高韻婷", { email: "lilykao50132@gmail.com" }),
      m("鄭予珊", { email: "950803sandy@gmail.com" }),
      m("郭靜怡", { email: "eva11851314@gmail.com" }),
      m("邱妤", { duty: "策展顧問", email: "mimi2005zd@gmail.com" }),
      m("劉姿伶", { duty: "現場手冊、電影分析", email: "liu19780923@gmail.com" }),
      m("洪乙玄", { also: ["市集組"], email: "950313anim@gmail.com" }),
      m("孫靖雯", { also: ["市集組"], email: "joycesun940305@gmail.com" }),
      m("毛芷婕", { also: ["公關組"], email: "wendy.536757@gmail.com" }),
      m("高丞歆", { also: ["公關組"], email: "gaochengxin142@gmail.com" }),
      m("黃宥鈞", { also: ["公關組"], email: "charlie960906@gmail.com" }),
      m("李宜潔", { also: ["公關組"], email: "0127janice@gmail.com" }),
    ],
  },
  {
    id: "marketing",
    dept: "行銷部",
    en: "Marketing",
    desc: "經營社群與宣傳，讓更多人知道這場星空下的電影節，\n也用鏡頭記錄籌備與活動的每個瞬間，拍下屬於這一屆的影像。",
    members: [
      m("張允昊", { role: MARKETING_LEAD, email: "haochang.yh@gmail.com" }),
      m("黃欣恬", { role: MARKETING_LEAD, email: "huangst2016@gmail.com" }),
      m("楊子詰", { team: "宣傳組", duty: "Threads 管理&發文總負責人", email: "benjaminyang96@gmail.com" }),
      m("洪千筑", { team: "宣傳組", duty: "IG Reels 管理&拍攝總負責人", email: "cherry242293@gmail.com" }),
      m("吳多恩", { team: "宣傳組", also: ["市集組"], email: "wu0821317@gmail.com" }),
      m("王靖茵", { team: "宣傳組", also: ["市集組"], email: "wendy.supernove@gmail.com" }),
      m("陳紹恩", { team: "影紀組", email: "shaoen0715@gmail.com" }),
      m("謝函蓉", { team: "影紀組", email: "kakakahsieh@gmail.com" }),
      m("葉芷瑜", { team: "影紀組", duty: "影像拍攝管理&劇組總負責人", email: "ginayeh1127@gmail.com" }),
    ],
  },
  {
    id: "design",
    dept: "設計部",
    en: "Design",
    desc: "從主視覺、貼文、海報以及周邊，替電影節定下它的樣子。",
    members: [
      m("王姿立", { email: "wangtzuli@smail.nchu.edu.tw" }),
      m("吳鈞涵", { email: "junhanwu514@gmail.com" }),
      m("陳芊伃", { email: "zoechen950723@gmail.com" }),
      m("蔡昀恩", { email: "tye07@smail.nchu.edu.tw" }),
    ],
  },
  {
    id: "host",
    dept: "主持人",
    en: "Host",
    desc: "在台上串起每一個段落，陪觀眾度過兩個夜晚。",
    members: [
      m("陳聖邦", { duty: "中英文主持人", email: "ben23367583@gmail.com" }),
      m("吳廷豐", { duty: "中英文主持人", also: ["市集組"], email: "maxmilliangladstoney@gmail.com" }),
    ],
  },
  {
    id: "onsite",
    dept: "現場",
    en: "On-site",
    desc: "活動當天的動線、器材與突發狀況，都由他們在第一線接住。",
    members: [
      m("謝宜倫", { email: "yuwan919@smail.nchu.edu.tw" }),
      m("連育弘", { email: "harry940422@gmail.com" }),
    ],
  },
];

/** 組別標籤：主要的組 + 兼任的組，例如「策展組&公關組」 */
const teamsLabel = (g: { dept: string }, p: CrewMember) => [p.team ?? g.dept, ...(p.also ?? [])].join("&");

/** 依姓名查成員（含部門），給 staff.ts 合併黑膠資料用；不回傳 email */
export function crewMember(name: string) {
  for (const g of crew) {
    const p = g.members.find((x) => x.name === name);
    if (p) return { name: p.name, nick: p.nick, role: p.role, team: teamsLabel(g, p) };
  }
  return undefined;
}

/** Gravatar 頭像網址；d=blank 讓沒有 Gravatar 的信箱回傳透明圖，露出底下的縮寫方塊。 */
export function gravatarUrl(email: string | undefined, size = 320): string | undefined {
  const e = email?.trim().toLowerCase();
  if (!e) return undefined;
  const hash = createHash("sha256").update(e).digest("hex");
  return `https://gravatar.com/avatar/${hash}?s=${size}&d=blank`;
}

const emailHash = (email: string) => createHash("sha256").update(email.trim().toLowerCase()).digest("hex");

/** 傳給前端的成員資料：不含 email。 */
export type CrewCard = {
  key: string;
  name: string;
  sub?: string;
  nick?: string;
  title: string;
  /** 職責（例如「策展顧問」） */
  duty?: string;
  avatar?: string;
  /** Gravatar 的 email SHA-256（頭像網址本來就公開含有它），供前端即時讀取個人檔案 */
  hash?: string;
  echo?: { id: string; songTitle: string; songArtist: string; accentColor: string; vinylCover?: string };
};
export type CrewBoardGroup = Omit<CrewGroup, "members"> & { members: CrewCard[] };

export function getCrewBoard(): CrewBoardGroup[] {
  return crew.map(({ members, ...g }) => ({
      ...g,
      members: sortLeadsFirst(members).map((p, i): CrewCard => {
          const found = findSubmission(p.name);
          return {
            key: `${g.id}-${i}`,
            name: p.name,
            // 頭像下方：部長顯示職稱，其餘顯示組別（兼任時為「策展組&公關組」）
            sub: p.role ?? teamsLabel(g, p),
            nick: p.nick,
            // 沒有分組的部長（例如行銷部部長）只顯示職稱，避免「行銷部 · 行銷部部長」重複
            title: p.role && !p.team && !p.also ? p.role : [teamsLabel(g, p), p.role].filter(Boolean).join(" · "),
            duty: p.duty,
            avatar: gravatarUrl(p.email),
            hash: p.email?.trim() ? emailHash(p.email) : undefined,
            echo: found && {
              id: found.sub.id,
              songTitle: found.sub.songTitle,
              songArtist: found.sub.songArtist,
              accentColor: accentOf(found.sub, found.index),
              vinylCover: found.sub.vinylCover,
            },
          };
        }),
    }));
}

/** 部長（職稱結尾為「部長」）排最前面，其餘維持名單順序。 */
function sortLeadsFirst(members: CrewMember[]): CrewMember[] {
  const isLead = (p: CrewMember) => !!p.role?.endsWith("部長");
  return [...members.filter(isLead), ...members.filter((p) => !isLead(p))];
}
