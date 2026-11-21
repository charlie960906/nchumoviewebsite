import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { site } from "@/lib/site";
import { llmsAlternate } from "@/lib/seo";
import { organizationLd, producerLd, websiteLd } from "@/lib/jsonld";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import RevealObserver from "@/components/RevealObserver";
import ScrollToTop from "@/components/ScrollToTop";
import MotionProvider from "@/components/MotionProvider";

const GTM_ID = "GTM-TB3CFNB2";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const notoSans = Noto_Sans_TC({ weight: ["400", "500", "700"], variable: "--font-noto-sans", display: "swap", preload: false });
const notoSerif = Noto_Serif_TC({ weight: ["500", "700", "900"], variable: "--font-noto-serif", display: "swap", preload: false });
const jbMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-jb-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.fullName}｜3/19–3/20 國立中興大學`, template: `%s｜${site.fullName}` },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.shortName,
  authors: [{ name: site.organizers[1].name, url: site.contact.instagram }],
  creator: site.organizers[1].name,
  publisher: site.organizers[0].name,
  category: "event",
  // 暫時不放分頁圖示：明確給一個空白 icon，瀏覽器才不會繼續顯示快取的舊圖。
  icons: { icon: "data:," },
  alternates: {
    canonical: "/",
    // GEO：讓 AI 爬蟲從任一頁都能找到給 LLM 讀的精簡說明
    types: llmsAlternate,
  },
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: site.fullName,
    title: site.fullName,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: site.fullName, description: site.description },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#001218",
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
        {/* Google Tag Manager（GTM-TB3CFNB2）：先推 gtm.js 事件，容器的「所有網頁」觸發條件才會啟動 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});`,
          }}
        />
        <script async src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`} />
      </head>
      <body className="min-h-dvh flex flex-col">
        {/* GTM noscript 備援 */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
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
        <JsonLd data={[organizationLd, producerLd, websiteLd]} />
        {/* Luma Checkout：站內彈窗訂閱活動提醒，無需跳轉 */}
        <Script id="luma-checkout" src={site.luma.script} strategy="lazyOnload" />
      </body>
    </html>
  );
}
