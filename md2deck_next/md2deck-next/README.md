# md2deck Studio (Next.js)

把任何文件轉成漂亮、可離線的 HTML 閱讀台。這是 **Next.js 15（App Router）** 版本，把 SEO 行銷頁、PWA 與未來的後端能力（帳號、Z 幣、AI、託管）都放進同一個可擴充的底座。

## 架構
- `app/page.tsx` — **SEO 著陸頁**（SSG，內含 features / FAQ / JSON-LD）。這是行銷與搜尋的主入口。
- `app/studio/` — 轉檔工具。目前以 `/studio.html` 掛載「已驗證的轉換引擎」，確保 day-1 就能用。
- `public/studio.html` — 完整的純前端轉換工具（之前那版，已測過）。
- `app/sitemap.ts` / `app/robots.ts` — 自動產生 sitemap 與 robots。
- `app/layout.tsx` — 全站 metadata、Open Graph、Twitter card、JSON-LD、PWA manifest、SW 註冊。
- `public/manifest.webmanifest` / `public/sw.js` — PWA（可安裝、可離線）。

## 開發
```bash
npm install
npm run dev      # http://localhost:3000
```

## 部署（Zeabur）
有 `package.json`，Zeabur 會自動辨識為 Next.js 並 build。
1. 推到 GitHub → Zeabur New Project → 選 repo。
2. 環境變數設 `NEXT_PUBLIC_SITE_URL=https://你的網域`（給 sitemap / canonical / OG 用）。
3. 綁網域。

## 之後的擴充（這就是改用 Next 的理由）
- `app/api/*` — 後端路由：帳號、Z 幣計費、AI 摘要/翻譯、雲端託管轉出的 deck。
- 把 `/studio.html` 的 UI 逐步重寫成原生 React 元件（引擎函式可抽到 `lib/`，函式庫改用 npm：marked / highlight.js / dompurify / mermaid / katex / pdfjs-dist / mammoth / xlsx / jszip），拿掉 CDN 依賴、打包進站。
- `app/blog/*` — 用文章做 SEO 內容行銷（教學、範例、案例）。
- 白標 / 自訂網域 / 閱讀分析（商業化 hook）。

> 引擎本身是純前端、client-side；改成 Next 不是為了「轉得更好」，而是為了 **SEO + 帳號/金流/AI/託管等伺服器端擴充**。
