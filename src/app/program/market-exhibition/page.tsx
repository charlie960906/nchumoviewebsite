import type { Metadata } from "next";
import Link from "next/link";

/**
 * 舊網址轉址：星空市集頁原本在 /program/market-exhibition，已併入活動與市集頁的「市集攤商」區塊（/program#market）。
 * 靜態匯出（output: "export"）沒有伺服器端轉址，改用 meta refresh 讓舊連結與搜尋結果仍能抵達新頁。
 */
export const metadata: Metadata = {
  title: "星空市集",
  robots: { index: false, follow: true },
  alternates: { canonical: "/program" },
};

export default function MarketExhibitionRedirect() {
  return (
    <div className="container-x py-24 text-center">
      {/* React 19 會把 <meta> 提升到 <head> */}
      <meta httpEquiv="refresh" content="0;url=/program#market" />
      <p>
        星空市集已移到：
        <Link href="/program#market" className="font-bold text-glow hover:underline">
          活動與市集・市集攤商
        </Link>
      </p>
    </div>
  );
}
