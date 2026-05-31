# md2deck Studio

把幾乎任何檔案（Markdown、程式碼、Word、PPT、Excel、PDF、圖片影音…）拖進瀏覽器，挑個樣式，即時預覽，**下載成一份漂亮、自帶樣式、可離線開啟的 HTML 閱讀台**。

> 純前端、零後端。**檔案完全不上傳**，全部在你自己的瀏覽器裡轉。

🌐 線上版：<https://md2deck.snowrealm.pet>

---

## 為什麼有這個工具

每天用人眼盯著幾百幾千行的原始 Markdown、或一堆零散檔案，很傷眼也很難讀。把它們渲染成有排版、側邊選單、語法高亮、目錄、搜尋的 HTML，閱讀體驗天差地遠。md2deck Studio 讓你一次把整個資料夾的文件轉成一份這樣的「閱讀台」，不需要任何後端、帳號或安裝。

---

## 能轉什麼（輸入）

每種檔案都依它的特性「拆解」呈現，不是全部丟成一坨：

- **Markdown**（`.md`）— 表格、程式碼區塊、清單、引言卡片
  - **Mermaid 流程圖** — ` ```mermaid ` 區塊渲染成圖
  - **數學公式（KaTeX）** — `$…$` 行內、`$$…$$` 區塊
- **純文字**（`.txt`）— 智慧排版：自動偵測標題、項目／編號清單、段落，把網址變連結（不再是一坨單字）。`.log` 維持等寬呈現
- **程式碼與設定檔** — `.ts .tsx .js .py .go .rs .java .sql .css .scss …`，以及 `.json .xml .yml/.yaml .toml .ini .conf .env Dockerfile Makefile .gradle .vue .svelte …`，語法高亮 ＋ 一鍵複製
- **CSV / TSV** — 自動轉成表格
- **JSON** — 美化排版 ＋ 高亮
- **圖片 / 影片 / 音樂** — 直接內嵌成 `<img>` / `<video>` / `<audio>` 播放
- **Word**（`.docx`）— 以 mammoth 取出標題／段落／清單／粗體
- **PowerPoint**（`.pptx`）— 轉成「投影片卡片」：每頁標題 ＋ 條列 ＋ **內嵌原圖**，並濾掉重複頁尾
- **Excel**（`.xlsx / .xls`）— 每張工作表各轉成表格
- **PDF** — 兩種模式可切換：
  - **圖像模式（預設）**：每頁渲染成圖，**完整保留版面與圖片**
  - **文字模式**：擷取文字，可全文搜尋、檔案輕量（無圖）
  - pdf.js 已**內建自架**於 `public/vendor/pdf/`，部署後不依賴外部 CDN
- **Jupyter**（`.ipynb`）— markdown／程式碼／輸出（含圖片輸出）都會渲染
- **其他任何檔案** — zip、字型、二進位…做成可下載的「附件卡」，等於什麼都收得下

### 影音與圖片會一起包進去

Markdown 裡寫 `![](clip.mp4)`、`![](song.mp3)`、`![](logo.png)`，只要把檔案（或整個資料夾）一起拖進來，輸出時會自動內嵌：影片變播放器、音樂變播放條、圖片變 data URI。產出的 HTML **自帶媒體**，丟到哪都能播放／顯示。

> ⚠️ 影片與大型檔案以 data URI 內嵌會讓 HTML 變大，大量影音建議分批轉。

---

## 工具端功能（轉檔時）

- **5 種樣式**，可即時切換預覽：指揮艙（深色極光，預設）／雪境（淺色 GLACÉRA 風）／終端機（螢光綠駭客風）／朱墨（米紙雜誌文學風）／午夜霓虹（合成波）
- **自訂主題色** — 微調強調色（accent）配自己的 Logo
- **上傳 Logo** — 側邊欄與封面的品牌圖示
- **上傳 Favicon** — 輸出閱讀台的瀏覽器分頁圖示（不傳就沿用 Logo，再沒有用預設島圖）
- **一鍵範本** — 「交付包 / 課程講義 / 技術文件」一鍵套整組設定
- **內嵌編輯器** — 文字類（md / txt / 程式碼 / csv / json）可直接點開編輯，右邊即時更新
- **拖到畫面任何地方加檔**（含右邊預覽區）；也支援整個資料夾拖入自動依子資料夾分組
- 每個檔可**拖曳排序**（也保留上下箭頭）、改分組、隱藏、移除
- 即時預覽（含「轉換中…」提示與實際秒數）、桌機／手機預覽切換、可收合左欄
- **記住上次的樣式與設定**（存在你瀏覽器的 localStorage，不外傳）

## 閱讀台功能（產出的 HTML）

側邊選單（或捲動式）、封面索引、**每頁目錄**、**全文搜尋**、程式碼複製鈕、閱讀進度條、回頂端、每篇**字數／閱讀時間**、**讀者可切換淺／深色**、列印／存 PDF、自訂 favicon、響應式、可離線開啟。

## 輸出格式

- **單檔 HTML 閱讀台**（自帶樣式與媒體，離線可開）
- **一鍵 PDF**（帶出列印視窗選「另存為 PDF」；CJK 清晰、文字可選取）
- **EPUB 電子書**（合法 EPUB3，可丟進電子書 App / Readmoo / Apple Books）
- **合併 Markdown** — 把所有文件併成一份 `.md`
- **JSON** — 結構化輸出（標題／分組／HTML），方便再匯入或自動化
- **開新分頁** — 全螢幕開啟產出的閱讀台

**PWA**：部署後可在手機／桌機「加到主畫面」當 App 用；service worker 會快取資源，之後可離線使用。

---

## 專案結構

這是一個 monorepo：

```text
md2deck/
├─ package.json              # 根：代理到 md2deck-next 的 dev/build/start
├─ LICENSE                   # AGPL-3.0
├─ README.md
│
├─ md2deck-next/             # 👉 正式站（Next.js 15 App Router）
│  ├─ app/
│  │  ├─ page.tsx            # SEO 著陸頁（hero / 功能 / FAQ / JSON-LD）
│  │  ├─ studio/page.tsx     # /studio：全螢幕 iframe 載入工具
│  │  ├─ layout.tsx          # metadata / OG / manifest / SW 註冊
│  │  ├─ sitemap.ts robots.ts globals.css
│  ├─ components/StudioFrame.tsx
│  ├─ lib/site.ts            # SITE_URL / SITE_NAME / SITE_DESC
│  ├─ public/
│  │  ├─ studio.html         # ⭐ 工具本體（單檔，純前端）
│  │  ├─ vendor/pdf/         # 自架 pdf.js（pdf.min.js + worker）
│  │  ├─ icons/ manifest.webmanifest sw.js og-image.png
│  └─ next.config.mjs        # 安全標頭
│
└─ md2deck_deploy/           # 純靜態單檔版（給任何靜態主機）
   ├─ index.html             # = 工具本體
   ├─ Dockerfile             # Caddy 靜態伺服（給其他容器平台）
   ├─ _headers               # 安全標頭（Netlify/Caddy 語法）
   ├─ vendor/pdf/ icons/ manifest.webmanifest sw.js
   ├─ DEPLOY.md
   └─ aiisland-docs-integration/DocsViewer.tsx   # 接進 AI 島後台 /docs 的範例元件
```

> 工具本體就是一支自包含的 `studio.html`（＝ `md2deck_deploy/index.html`）。Next 專案只是把它包進去，外加 SEO 著陸頁、PWA 與自架的 pdf.js。

---

## 開發 / 執行

```bash
# 在 repo 根目錄
npm install        # 會自動 postinstall 安裝 md2deck-next 的相依
npm run dev        # 本機開發（Next dev server）
npm run build      # 正式建置
npm run start      # 啟動正式版
```

要單獨改工具本體，直接編輯 `md2deck-next/public/studio.html`（純 HTML/CSS/JS，無建置流程，存檔重整即可）。改完記得讓 `md2deck_deploy/index.html` 同步。

---

## 部署

### 正式站：md2deck-next（推薦）

1. 推上 GitHub。
2. Zeabur → New Project → Deploy from GitHub → 選此 repo。Zeabur 由 `package.json` 自動辨識為 Next.js。
3. 設定環境變數 `NEXT_PUBLIC_SITE_URL` 為你的正式網域，綁定 Domain。
4. 之後每次 `git push` 自動重新部署。

> PDF 用的 pdf.js 已自架在 `public/vendor/pdf/`，部署後**不依賴外部 CDN**。

### 純靜態版：md2deck_deploy（替代方案）

`index.html` 是自包含單檔，任何靜態主機都能放（Zeabur Static / GitHub Pages / Netlify / Vercel / Cloudflare Pages）。也附了 `Dockerfile`（Caddy）給其他容器平台。細節見 `md2deck_deploy/DEPLOY.md`。

> 工具第一次開啟時，部分轉換函式庫（marked / highlight.js / DOMPurify / mermaid / mammoth / SheetJS / JSZip / pdf.js）會從 CDN 載入；**你的檔案永遠不離開瀏覽器**，只有這些公開函式庫從網路取得。pdf.js 已自架，正式站不需外連。

---

## 接進 AI 島後台 `/docs`（選用）

`md2deck_deploy/aiisland-docs-integration/DocsViewer.tsx` 是一支即用的 client 元件，沿用站台既有相依（react-markdown + remark-gfm + rehype-highlight + rehype-raw），把 repo 裡的 `/docs/<群組>/<檔名>.md` 渲染成「指揮艙」深色閱讀台。把檔案放進 `src/app/admin/docs/`，同層加一個讀 markdown 的 server `page.tsx` 即可（檔頭註解有完整接法）。

---

## 隱私

所有解析與轉換都在瀏覽器端（client-side）完成。檔案不會上傳到任何伺服器，這個工具本身也沒有後端。設定只存在你自己的 localStorage。

---

## 技術

- 工具本體：純 HTML + CSS + 原生 JS，單檔，無建置流程。
- 著陸頁與 PWA：Next.js 15（App Router）。
- 轉換函式庫：[marked](https://marked.js.org/)、[highlight.js](https://highlightjs.org/)、[DOMPurify](https://github.com/cure53/DOMPurify)、[Mermaid](https://mermaid.js.org/)、[KaTeX](https://katex.org/)、[mammoth](https://github.com/mwilliamson/mammoth.js)、[SheetJS](https://sheetjs.com/)、[JSZip](https://stuk.github.io/jszip/)、[pdf.js](https://mozilla.github.io/pdf.js/)（自架）。
- 輸出 HTML 是**轉檔當下就渲染好的靜態內容**（程式碼、圖表、圖片、投影片、PDF 頁都已內嵌），下載後除 Google Fonts 外不依賴外部 script，可離線開。

---

## 授權

本工具的前端客戶端程式以 **GNU AGPL-3.0** 釋出（見 `LICENSE`）。歡迎檢視、修改、自架；若你以它對外提供服務，依授權須一併公開你的修改版原始碼。

© 2026 SnowRealm.
