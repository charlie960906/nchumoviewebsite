import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { site } from "@/lib/site";
import { organizationLd, websiteLd } from "@/lib/jsonld";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import RevealObserver from "@/components/RevealObserver";
import ScrollToTop from "@/components/ScrollToTop";
import MotionProvider from "@/components/MotionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoSans = Noto_Sans_TC({ weight: ["400", "500", "700"], variable: "--font-noto-sans", display: "swap", preload: false });
const notoSerif = Noto_Serif_TC({ weight: ["500", "700"], variable: "--font-noto-serif", display: "swap", preload: false });
const jbMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-jb-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.fullName}｜3/19–3/20 國立中興大學`, template: `%s｜${site.fullName}` },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.shortName,
  // 暫時不放分頁圖示：明確給一個空白 icon，瀏覽器才不會繼續顯示快取的舊圖。
  icons: { icon: "data:," },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: site.fullName,
    title: site.fullName,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: site.fullName, description: site.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0B192C",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-Hant-TW"
      className={`${inter.variable} ${notoSans.variable} ${notoSerif.variable} ${jbMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "if (window.location.hostname === 'nchumoviefestival.hyjdevelop.com') window.location.replace('https://nchufilmfestival.ripple.hyjdevelop.com' + window.location.pathname + window.location.search + window.location.hash);",
          }}
        />
        {/* 僅在 JS 可用時啟用進場動畫的隱藏狀態，確保無 JS／爬蟲仍看得到全部內容 */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-glow focus:px-4 focus:py-2 focus:font-bold focus:text-night"
        >
          跳到主要內容
        </a>
        <MotionProvider>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </MotionProvider>
        <ScrollToTop />
        <RevealObserver />
        <JsonLd data={[organizationLd, websiteLd]} />
        {/* Luma Checkout：站內彈窗訂閱活動提醒，無需跳轉 */}
        <Script id="luma-checkout" src={site.luma.script} strategy="lazyOnload" />
      </body>
    </html>
  );
}
