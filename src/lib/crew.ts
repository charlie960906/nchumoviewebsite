import "server-only";
import { createHash } from "node:crypto";
import { getStaff } from "@/lib/staff";

/**
 * 工作人員名單（正式）。依部門分組，顯示於 /team。
 * 與 staff.ts（「波紋的音像」黑膠資料）分開維護。
 *
 * - email：成員登入 Gravatar 的信箱。只在建置時於伺服器端雜湊成 SHA-256，
 *   不會出現在輸出的 HTML 或 JS 中。留空或該信箱沒有 Gravatar 時，顯示姓名縮寫方塊。
 * - nick：暱稱／英文名（選填），顯示在姓名下方。
 * - role：職稱（選填，例如「部長」），顯示在姓名下方。
 * - team：部門底下的組別（選填，例如「宣傳組」）。同組成員會在部門內以小標題分組，
 *   沒有 team 的成員（例如部長）排在最前面。
 * - echo：對應 staff.ts 中「波紋的音像」黑膠的 id（選填）。填了之後，點開成員的詳細資料
 *   最下方會出現他的黑膠與歌名，點擊跳轉到 /interactive/echoes/{echo} 故事頁。
 * - 「關於我」取自成員 Gravatar 個人檔案的 About Me：建置時先抓一份寫進頁面，
 *   訪客點開成員時，瀏覽器會再向 Gravatar 讀取最新內容替換（失敗時保留建置時的版本）。
 *
 * ⚠ 這個檔案只能由 Server Component 匯入（"server-only" 會擋下誤用），避免信箱進入前端 bundle。
 */
export type CrewMember = { name: string; nick?: string; role?: string; team?: string; email?: string; echo?: string };
export type CrewGroup = { id: string; dept: string; en: string; desc: string; members: CrewMember[] };

const m = (name: string, extra: Omit<CrewMember, "name"> = {}): CrewMember => ({ name, ...extra });

export const crew: CrewGroup[] = [
  {
    id: "lead",
    dept: "召部",
    en: "Directors",
    desc: "統籌整個電影節的核心團隊，負責協調各組運作、制定方向。\n電影節的領航者，確保整體活動順利進行並達成目標。",
    members: [
      m("洪愛佳", { email: "aijia0603@gmail.com" }),
      m("林鈊渘", { email: "koala082700@gmail.com" }),
    ],
  },
  {
    id: "admin",
    dept: "行政部",
    en: "Administration",
    desc: "處理經費、場地、文書與各單位聯繫，是一切得以運轉的後盾。",
    members: [
      m("張碩貽", { email: "zhangshuoyi897@gmail.com" }),
      m("江佩諭", { email: "pinky940928@gmail.com" }),
      m("蘇家佳", { email: "suchia22222@gmail.com" }),
      m("朱宇禎", { email: "yujencheryl@gmail.com" }),
      m("吳廷豐", { nick: "Max", email: "maxmilliangladstoney@gmail.com" }),
      m("陳昜安", { email: "chenyoung1128@gmail.com" }),
      m("賴映儒", { email: "laiyingju315@gmail.com" }),
    ],
  },
  {
    id: "curation",
    dept: "策展部",
    en: "Curatorial",
    desc: "規劃展區、展品與活動內容，\n把主題化為可以看得見、摸得到的內容。",
    members: [
      m("邱婕", { email: "julie0905852735@gmail.com" }),
      m("洪培恩", { email: "a0909524151@gmail.com" }),
      m("黃意婷", { email: "tingx20931013@gmail.com" }),
      m("吳昱慧", { email: "eva20060117@gmail.com" }),
      m("魏子祐", { email: "luiex941104@gmail.com" }),
      m("何宜恩", { email: "yiiieleynx@gmail.com" }),
      m("高韻婷", { email: "lilykao50132@gmail.com" }),
      m("鄭予珊", { email: "950803sandy@gmail.com" }),
      m("郭靜怡", { email: "eva11851314@gmail.com" }),
      m("劉姿伶", { email: "liu19780923@gmail.com" }),
      m("洪乙玄", { email: "950313anim@gmail.com" }),
      m("孫靖雯", { email: "joycesun940305@gmail.com" }),
      m("毛芷婕", { email: "wendy.536757@gmail.com" }),
      m("高丞歆", { email: "gaochengxin142@gmail.com" }),
      m("黃宥鈞", { email: "charlie960906@gmail.com" }),
      m("李宜潔", { email: "0127janice@gmail.com" }),
    ],
  },
  {
    id: "marketing",
    dept: "行銷部",
    en: "Marketing",
    desc: "經營社群與宣傳、聯繫合作夥伴，讓更多人知道這場星空下的電影節。",
    members: [
      m("張允昊", { role: "部長", email: "haochang.yh@gmail.com" }),
      m("黃欣恬", { role: "部長", email: "huangst2016@gmail.com" }),
      m("楊子詰", { team: "宣傳組", email: "benjaminyang96@gmail.com" }),
      m("洪千筑", { team: "宣傳組", email: "cherry242293@gmail.com" }),
      m("吳多恩", { team: "宣傳組", email: "wu0821317@gmail.com" }),
      m("王靖茵", { team: "宣傳組", email: "wendy.supernove@gmail.com" }),
      m("陳紹恩", { team: "影紀組", email: "shaoen0715@gmail.com" }),
      m("謝函蓉", { team: "影紀組", email: "kakakahsieh@gmail.com" }),
      m("葉芷瑜", { team: "影紀組", email: "ginayeh1127@gmail.com" }),
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
      m("陳聖邦", { email: "ben23367583@gmail.com" }),
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

/** Gravatar 頭像網址；d=blank 讓沒有 Gravatar 的信箱回傳透明圖，露出底下的縮寫方塊。 */
export function gravatarUrl(email: string | undefined, size = 320): string | undefined {
  const e = email?.trim().toLowerCase();
  if (!e) return undefined;
  const hash = createHash("sha256").update(e).digest("hex");
  return `https://gravatar.com/avatar/${hash}?s=${size}&d=blank`;
}

const emailHash = (email: string) => createHash("sha256").update(email.trim().toLowerCase()).digest("hex");

/** 建置時讀取 Gravatar 公開個人檔案的 About Me；沒有檔案或失敗時回傳 undefined。 */
async function gravatarAbout(email: string | undefined): Promise<string | undefined> {
  if (!email?.trim()) return undefined;
  try {
    const res = await fetch(`https://api.gravatar.com/v3/profiles/${emailHash(email)}`, {
      cache: "force-cache",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { description?: string };
    return data.description?.trim() || undefined;
  } catch {
    return undefined;
  }
}

/** 傳給前端的成員資料：不含 email。 */
export type CrewCard = {
  key: string;
  name: string;
  sub?: string;
  team?: string;
  title: string;
  avatar?: string;
  /** Gravatar 的 email SHA-256（頭像網址本來就公開含有它），供前端即時讀取個人檔案 */
  hash?: string;
  about?: string;
  echo?: { id: string; songTitle: string; songArtist: string; accentColor: string; vinylCover?: string };
};
export type CrewBoardGroup = Omit<CrewGroup, "members"> & { members: CrewCard[] };

export async function getCrewBoard(): Promise<CrewBoardGroup[]> {
  return Promise.all(
    crew.map(async ({ members, ...g }) => ({
      ...g,
      members: await Promise.all(
        members.map(async (p, i): Promise<CrewCard> => {
          const s = p.echo ? getStaff(p.echo) : undefined;
          return {
            key: `${g.id}-${i}`,
            name: p.name,
            sub: [p.role, p.nick].filter(Boolean).join(" · ") || undefined,
            team: p.team,
            title: [g.dept, p.team, p.role].filter(Boolean).join(" · "),
            avatar: gravatarUrl(p.email),
            hash: p.email?.trim() ? emailHash(p.email) : undefined,
            about: await gravatarAbout(p.email),
            echo: s && {
              id: s.id,
              songTitle: s.songTitle,
              songArtist: s.songArtist,
              accentColor: s.accentColor,
              vinylCover: s.vinylCover,
            },
          };
        }),
      ),
    })),
  );
}
