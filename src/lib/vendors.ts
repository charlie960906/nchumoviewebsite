/**
 * 市集攤商名單（只放已確定的攤商）。
 * 品牌牆固定 5 × 4 格，攤商不足 20 攤時其餘格子顯示「敬請期待」。
 */
export type Vendor = {
  /** 識別用 id（英數），也用作 React key */
  id: string;
  /** 攤位編號，如 A01；尚未分配就不填，詳情不顯示 */
  booth?: string;
  name: string;
  category: "食物類" | "用品類" | "互動式" | "其他";
  /** 一句話小簡介 */
  summary: string;
  /** 詳情彈窗裡的較長介紹（選填，可多段） */
  description?: string[];
  /** 攤位照片（選填，放 public/ 底下的路徑，如 /photo/vendors/zhenpin.jpg）；沒有時顯示攤名 */
  image?: string;
  /** 社群連結（選填） */
  links?: { label: string; href: string }[];
};

export const vendors: Vendor[] = [
  {
    id: "zhenpin",
    name: "甄品手作",
    category: "用品類",
    summary: "天然藍染與植物種子飾品，藍白交織的手作溫度。",
    description: [
      "甄品手作以天然藍染工藝與種子飾品為主。藍染服飾與布料經過獨特的綁紮與染製，藍白交織出如水面光影、波浪暈染般的流動感。",
      "作品大量運用植物種子、果實等大自然最原始的素材，在觸摸手作溫度的同時，也感受返璞歸真的純粹。",
    ],
    links: [{ label: "Facebook", href: "https://www.facebook.com/share/1Lyo9yxVNY/" }],
  },
  {
    id: "bulu-farm",
    name: "Bulu Farm 自然農場",
    category: "食物類",
    summary: "自家栽種水果現打的鮮蔬果汁，天然在地。",
    description: [
      "Bulu Farm 自然農場主要販賣鮮蔬果汁，水果原料皆為自行栽種，天然、在地。",
      "一杯果汁，喝得到家鄉的風土與土地的味道。",
    ],
    links: [
      { label: "Facebook", href: "https://www.facebook.com/share/19p93bHA4Z/" },
      { label: "Instagram", href: "https://www.instagram.com/bulufarm" },
    ],
  },
];
