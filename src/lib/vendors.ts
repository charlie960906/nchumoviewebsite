/**
 * 市集攤商名單。
 * 目前為版面示意用的假資料（20 攤），正式名單確定後直接替換此陣列即可；
 * `sample` 為 true 時頁面會標示「示意資料」。
 */
export type Vendor = {
  /** 攤位編號，如 A01 */
  booth: string;
  name: string;
  category: "飲品" | "輕食" | "甜點" | "手作" | "選物" | "書籍" | "體驗";
  summary: string;
  /** 社群連結（選填） */
  link?: string;
};

export const vendorsAreSample = true;

export const vendors: Vendor[] = [
  { booth: "A01", name: "夜行咖啡", category: "飲品", summary: "手沖單品與冷萃，夜場限定「星空拿鐵」。" },
  { booth: "A02", name: "小島茶事", category: "飲品", summary: "台灣在地烏龍與果茶，可自備杯享折扣。" },
  { booth: "A03", name: "月光烤物", category: "輕食", summary: "炭烤玉米、杏鮑菇串，邊看電影邊吃剛好。" },
  { booth: "A04", name: "飯糰研究室", category: "輕食", summary: "手捏飯糰與味噌湯，素食選項齊全。" },
  { booth: "A05", name: "興大農場直送", category: "選物", summary: "校內農場的季節蔬果與果醬。" },
  { booth: "B01", name: "甜在水面", category: "甜點", summary: "手工布丁、檸檬塔，每日限量。" },
  { booth: "B02", name: "雲朵棉花糖", category: "甜點", summary: "現做造型棉花糖，小朋友最愛。" },
  { booth: "B03", name: "片尾彩蛋烘焙", category: "甜點", summary: "電影主題餅乾與司康，包裝可當紀念。" },
  { booth: "B04", name: "膠卷手作所", category: "手作", summary: "回收底片做成的書籤與吊飾。" },
  { booth: "B05", name: "藍染小日子", category: "手作", summary: "藍染手帕、托特包，現場可預約體驗。" },
  { booth: "C01", name: "舊書與貓", category: "書籍", summary: "二手電影書、劇本集與文學小說。" },
  { booth: "C02", name: "獨立誌交換站", category: "書籍", summary: "學生自製 zine，帶一本換一本。" },
  { booth: "C03", name: "選片人的抽屜", category: "選物", summary: "經典電影海報復刻與明信片。" },
  { booth: "C04", name: "星砂飾品", category: "手作", summary: "樹脂與星砂做成的耳環、項鍊。" },
  { booth: "C05", name: "復古相機舖", category: "選物", summary: "二手底片相機、即可拍與底片。" },
  { booth: "D01", name: "拍立得肖像", category: "體驗", summary: "現場拍一張，帶走今晚的紀念。" },
  { booth: "D02", name: "塔羅與電影", category: "體驗", summary: "抽一張牌，推薦一部適合你的電影。" },
  { booth: "D03", name: "植物交換角", category: "體驗", summary: "多肉與小盆栽，以物易物。" },
  { booth: "D04", name: "熱壓吐司號", category: "輕食", summary: "起司、肉桂蘋果熱壓吐司，晚場暖胃。" },
  { booth: "D05", name: "夜市氣泡飲", category: "飲品", summary: "自製氣泡果飲與無酒精調飲。" },
];
