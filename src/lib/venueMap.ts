/**
 * 場地互動地圖的單一資料來源：版面座標（3D 與 2D 共用）＋每個可點選項目的內容。
 * 座標系：x 向右、z 向下（俯視），單位約等於公尺。場地中心 (0, 0)。
 * 概念展區的文字直接取自 zones.ts，與「策展理念」頁保持一致。
 */
import { zones, zonePath, type Zone, type ZoneRoom } from "./zones";

export type Category = "market" | "stage" | "movie" | "exhibition";

export const CATEGORIES: { id: Category | "all"; label: string; color: string }[] = [
  { id: "all", label: "全部", color: "#EAF0F7" },
  { id: "market", label: "市集", color: "#F2C38B" },
  { id: "stage", label: "表演", color: "#C3A6F5" },
  { id: "movie", label: "放映", color: "#8CC4EC" },
  { id: "exhibition", label: "展覽與服務", color: "#7FD6C2" },
];

/** 市集攤位遮棚的四種顏色（3D 遮棚與 2D 號碼牌共用） */
export const STALL_COLORS = ["#8CC4EC", "#F2C38B", "#E8A1AB", "#9FD8BF"] as const;
export const stallColor = (id: number) => STALL_COLORS[(id - 1) % STALL_COLORS.length];

/* ───────── 內容 ───────── */

export type Stall = { id: number; name: string; owner: string; category: string; items: string; price: string };

export const STALLS: Stall[] = [
  { id: 1, name: "手作陶藝坊", owner: "陶心工作室", category: "文創手作", items: "手作茶杯、花器、陶藝裝飾品", price: "NT$ 250 - 1,200" },
  { id: 2, name: "皮藝工坊", owner: "革調革藝", category: "皮革配件", items: "手工皮夾、鑰匙圈、皮帶", price: "NT$ 350 - 2,500" },
  { id: 3, name: "植感生活", owner: "綠意小品", category: "多肉植栽", items: "多肉植物、微景觀苔療瓶", price: "NT$ 100 - 680" },
  { id: 4, name: "獨立冊店", owner: "紙墨獨立社", category: "獨立出版", items: "原創插畫Zine、明信片、貼紙", price: "NT$ 50 - 450" },
  { id: 5, name: "復古飾品特調", owner: "時光寶盒", category: "飾品配件", items: "黃銅首飾、復古耳環、耳夾", price: "NT$ 200 - 850" },
  { id: 6, name: "芳香療癒所", owner: "香氣美學", category: "香氛洗沐", items: "精油大豆蠟燭、手工香皂", price: "NT$ 180 - 750" },
  { id: 7, name: "木雕刻工坊", owner: "木心手作", category: "木雕工藝", items: "原木餐具、小木偶、木質杯墊", price: "NT$ 150 - 900" },
  { id: 8, name: "毛線編織小屋", owner: "織光工作室", category: "編織手作", items: "編織包、手作毛線花束", price: "NT$ 120 - 800" },
  { id: 9, name: "手作烘焙餅乾", owner: "甜心烘焙坊", category: "輕食甜點", items: "美式軟餅乾、手工曲奇", price: "NT$ 60 - 280" },
  { id: 10, name: "精品冷萃咖啡", owner: "角落咖啡館", category: "特色飲品", items: "單品冷萃咖啡、燕麥奶拿鐵", price: "NT$ 90 - 160" },
  { id: 11, name: "古著選品店", owner: "Vintage Market", category: "古著服飾", items: "美式古著T恤、復古夾克", price: "NT$ 450 - 1,800" },
  { id: 12, name: "布藝手作包", owner: "好布好飾", category: "布藝雜貨", items: "帆布袋、飲料提袋、零錢包", price: "NT$ 150 - 550" },
  { id: 13, name: "自然農法果乾", owner: "果香大地", category: "在地農特產", items: "無添加烘焙芒果乾、芭樂乾", price: "NT$ 120 - 350" },
  { id: 14, name: "印度 Henna 彩繪", owner: "印記藝術", category: "人體彩繪", items: "印度草本 Henna 身體彩繪", price: "NT$ 200 - 600" },
  { id: 15, name: "水晶能量礦石", owner: "晶采生活", category: "水晶礦石", items: "原礦水晶、手鍊、消磁石", price: "NT$ 300 - 2,200" },
  { id: 16, name: "寵物文創選品", owner: "毛孩趴趴走", category: "寵物用品", items: "寵物領巾、手作寵物零食", price: "NT$ 100 - 450" },
  { id: 17, name: "銀飾金工現場", owner: "金工流光", category: "金工銀飾", items: "925純銀戒指、刻字項鍊", price: "NT$ 680 - 2,800" },
  { id: 18, name: "日式精釀啤酒", owner: "微醺夏日", category: "精釀啤酒", items: "水果精釀啤酒、生啤酒", price: "NT$ 150 - 220" },
  { id: 19, name: "乾燥花藝設計", owner: "花語小築", category: "花藝設計", items: "乾燥花束、玻璃花罩、浮游花", price: "NT$ 250 - 1,200" },
  { id: 20, name: "原創貼紙紙膠帶", owner: "喵星人繪畫", category: "文具貼紙", items: "防水貼紙、手帳膠帶、明信片", price: "NT$ 40 - 250" },
  { id: 21, name: "現場似顏繪", owner: "畫筆漫遊", category: "現場繪畫", items: "個人/情侶/寵物 Q版似顏繪", price: "NT$ 300 - 800" },
  { id: 22, name: "有機草本花茶", owner: "草本養生", category: "養生茶飲", items: "洋甘菊薄荷茶、玫瑰果茶包", price: "NT$ 180 - 450" },
];

export const SCREENINGS = [
  { time: "3/19 18:30 – 20:30", name: "美國女孩" },
  { time: "3/20 18:30 – 20:30", name: "敬請期待（片單研擬中）" },
];

export const PERFORMANCES = [
  { time: "3/19 17:10 – 17:30", name: "表演演出" },
  { time: "3/19 17:30 – 17:50", name: "表演演出" },
  { time: "3/20 16:00 – 17:30", name: "表演演出" },
];

const SERVICES = {
  movie_view: { name: "電影觀展", group: "展覽主題區", desc: "歷年國際電影節得獎作品海報展與微電影體驗區。" },
  pr: { name: "公關", group: "行政服務", desc: "媒體接待、貴賓簽到與品牌合作洽談專區。" },
  service: { name: "服務台", group: "行政服務", desc: "提供大會地圖手冊、遺失物招領、醫護諮詢與廣播服務。" },
  global: { name: "國際處", group: "國際交流", desc: "全球姐妹校交流成果展示與海外留學諮詢服務。" },
  ipc: { name: "國際志工／IPC", group: "國際交流", desc: "國際志工服務經驗分享、多國語言導覽服務與文創互動體驗。" },
  truss: { name: "主視覺 Truss", group: "品牌展示", desc: "大型金屬 Truss 燈架搭建的品牌贊助廠商牆與主視覺打卡牆。" },
} as const;

/* ───────── 版面 ───────── */

export const VENUE = { w: 48, d: 36 };
/** 草地表演區：沒有架高舞台，表演就在場地中央的圓形草皮上 */
export const LAWN_STAGE = { x: 0, z: 1, r: 4.2 };
export const SCREEN = { x: 0, z: -11, w: 11.6 };
export const PROJECTOR = { x: 0, z: -7.5 };
export const TENT_HALF = { w: 3.6, d: 3.0 };
export const BOOTH_X = 17;
export const TRUSS = { x: 17, z: 8.5 };

/** 市集：1–8 沿左側一列（面向場內），9–22 沿底部一排（面向中央草地） */
export const STALL_POS = STALLS.map((s) =>
  s.id <= 8
    ? { id: s.id, x: -17, z: -10.5 + (s.id - 1) * 3.1, ry: Math.PI / 2 }
    : { id: s.id, x: -13.5 + (s.id - 9) * 2.25, z: 12, ry: Math.PI },
);

/** 兩座概念帳篷，各分 A｜B 兩半，整座轉向中央草地 */
export const TENTS = [
  { zone: zones[0], x: -11, z: -10.5 },
  { zone: zones[1], x: 11, z: -10.5 },
].map((t) => ({ ...t, ry: Math.atan2(LAWN_STAGE.x - t.x, LAWN_STAGE.z - t.z) }));

export const BOOTHS: { id: keyof typeof SERVICES; z: number }[] = [
  { id: "movie_view", z: -7.5 },
  { id: "pr", z: -4.5 },
  { id: "service", z: -1.5 },
  { id: "global", z: 1.5 },
  { id: "ipc", z: 4.5 },
];

/** 帳篷半邊在世界座標中的中心（A 在左側 lx = -w/2，B 在右側） */
export function tentHalfCenter(t: (typeof TENTS)[number], half: 0 | 1) {
  const lx = (half === 0 ? -1 : 1) * (TENT_HALF.w / 2);
  return { x: t.x + lx * Math.cos(t.ry), z: t.z - lx * Math.sin(t.ry) };
}

/* ───────── 可點選項目 ───────── */

type Base = {
  id: string;
  cat: Category;
  title: string;
  /** 小字分類 */
  kicker: string;
  /** 標籤錨點（世界座標，y 為高度） */
  anchor: [number, number, number];
  /** 地面選取光圈 */
  foot: { x: number; z: number; r: number };
  /** 相機從哪個方向看它（xz 單位向量） */
  view: [number, number];
  search: string;
};

export type MapEntry =
  | (Base & { kind: "stall"; stall: Stall })
  | (Base & { kind: "stage" })
  | (Base & { kind: "movie" })
  | (Base & { kind: "room"; zone: Zone; room: ZoneRoom; zoneHref: string })
  | (Base & { kind: "service"; desc: string });

const entries: MapEntry[] = [];

for (const p of STALL_POS) {
  const s = STALLS[p.id - 1];
  entries.push({
    id: `stall-${s.id}`,
    kind: "stall",
    cat: "market",
    title: s.name,
    kicker: `市集 ${String(s.id).padStart(2, "0")} · ${s.category}`,
    anchor: [p.x, 3.2, p.z],
    foot: { x: p.x, z: p.z, r: 1.5 },
    // 從攤位正面看：左列朝場內（+x），底排朝中央草地（-z）
    view: p.id <= 8 ? [1, 0] : [0, -1],
    stall: s,
    search: [s.id, `攤位${s.id}`, s.name, s.owner, s.category, s.items].join(" "),
  });
}

entries.push({
  id: "stage",
  kind: "stage",
  cat: "stage",
  title: "草地表演區",
  kicker: "表演",
  anchor: [LAWN_STAGE.x, 2.6, LAWN_STAGE.z - 0.5],
  foot: { x: LAWN_STAGE.x, z: LAWN_STAGE.z, r: LAWN_STAGE.r + 0.6 },
  view: [0, 1],
  search: ["草地", "草皮", "表演", "舞台", "音樂", "舞蹈", ...PERFORMANCES.map((p) => p.time + p.name)].join(" "),
});

entries.push({
  id: "movie",
  kind: "movie",
  cat: "movie",
  title: "星空放映區",
  kicker: "電影放映",
  anchor: [SCREEN.x, 6.8, SCREEN.z],
  foot: { x: SCREEN.x, z: SCREEN.z + 2.6, r: 6.2 },
  view: [0, 1],
  search: ["電影", "放映", "銀幕", "野餐墊", "草地", ...SCREENINGS.map((m) => m.time + m.name)].join(" "),
});

for (const t of TENTS) {
  t.zone.rooms.forEach((room, i) => {
    const c = tentHalfCenter(t, i as 0 | 1);
    entries.push({
      id: `room-${room.id}`,
      kind: "room",
      cat: "exhibition",
      title: `展區「${room.char}」`,
      kicker: `概念展區 · ${t.zone.char} ${t.zone.roman}`,
      anchor: [c.x, 4.7, c.z],
      foot: { x: c.x, z: c.z, r: 2.3 },
      view: [Math.sin(t.ry), Math.cos(t.ry)],
      zone: t.zone,
      room,
      zoneHref: zonePath(t.zone),
      search: ["展區", "概念", "帳篷", room.char, room.roman, room.phase, room.desc, t.zone.char, t.zone.subtitle].join(" "),
    });
  });
}

for (const b of BOOTHS) {
  const s = SERVICES[b.id];
  entries.push({
    id: b.id,
    kind: "service",
    cat: "exhibition",
    title: s.name,
    kicker: s.group,
    anchor: [BOOTH_X, 3.4, b.z],
    foot: { x: BOOTH_X, z: b.z, r: 1.6 },
    view: [-1, 0],
    desc: s.desc,
    search: [s.name, s.group, s.desc].join(" "),
  });
}

entries.push({
  id: "truss",
  kind: "service",
  cat: "exhibition",
  title: SERVICES.truss.name,
  kicker: SERVICES.truss.group,
  anchor: [TRUSS.x, 4.6, TRUSS.z],
  foot: { x: TRUSS.x, z: TRUSS.z, r: 2 },
  view: [-1, 0],
  desc: SERVICES.truss.desc,
  search: ["truss", "打卡", "主視覺", SERVICES.truss.name, SERVICES.truss.desc].join(" "),
});

export const ENTRIES: readonly MapEntry[] = entries;
export const ENTRY_BY_ID = new Map(ENTRIES.map((e) => [e.id, e]));

/* ───────── 搜尋 ───────── */

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
const searchIndex = new Map(ENTRIES.map((e) => [e.id, norm(e.title + e.kicker + e.search)]));

export function matches(e: MapEntry, cat: Category | "all", q: string) {
  if (cat !== "all" && e.cat !== cat) return false;
  const n = norm(q);
  if (!n) return true;
  const num = n.match(/^(?:攤位|#|no\.?)?(\d+)$/);
  if (num) return e.kind === "stall" && String(e.stall.id).startsWith(num[1]);
  return searchIndex.get(e.id)!.includes(n);
}
