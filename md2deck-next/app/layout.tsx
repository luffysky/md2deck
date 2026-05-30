import type { Metadata, Viewport } from "next";
import { SITE_URL, SITE_NAME, SITE_DESC } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — 把文件變成漂亮的 HTML 閱讀台`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: [
    "markdown 轉 html","文件轉 html","md2deck","線上 markdown 轉換","markdown to html",
    "文件轉換工具","程式碼高亮","Word 轉 HTML","PPT 轉 HTML","Excel 轉 HTML","PDF 轉 HTML",
    "文件閱讀器","技術文件產生器","SnowRealm","繁體中文 markdown 工具",
  ],
  authors: [{ name: "SnowRealm" }],
  creator: "SnowRealm",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon-180.png",
  },
  openGraph: {
    type: "website", siteName: SITE_NAME, title: SITE_NAME, description: SITE_DESC,
    url: SITE_URL, locale: "zh_TW",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESC, images: ["/og-image.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#080c16" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    description: SITE_DESC,
    offers: { "@type": "Offer", price: "0", priceCurrency: "TWD" },
    featureList: ["Markdown 轉 HTML","Word/PPT/Excel/PDF 轉換","程式碼語法高亮","Mermaid 圖","KaTeX 數學","全文搜尋","EPUB 匯出","離線 PWA"],
  };
  return (
    <html lang="zh-Hant">
      <body>
        <div className="bg" />
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <script dangerouslySetInnerHTML={{ __html:
          `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}` }} />
      </body>
    </html>
  );
}
