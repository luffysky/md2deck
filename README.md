# md2deck Studio

把一堆文件（Markdown、程式碼、CSV、JSON、圖片、Word）拖進瀏覽器，挑個樣式，即時預覽，**下載成一份漂亮、自帶樣式、可離線開啟的 HTML 閱讀台**。

> 純前端、零後端。**檔案完全不上傳**，全部在你自己的瀏覽器裡轉。

---

## 為什麼有這個工具

每天用人眼看幾百幾千行的原始 Markdown 很傷眼。把它渲染成有排版、側邊選單、語法高亮、目錄的 HTML，閱讀體驗天差地遠。md2deck Studio 讓你一次把整個資料夾的文件轉成一份這樣的「閱讀台」，而且不需要任何後端或帳號。
網址 :http://md2deck.snowrealm.pet/
---

## 功能

**能轉什麼（輸入）**
- **Markdown**（`.md`）— 含表格、程式碼區塊、清單、引言卡片
- **Mermaid 流程圖** — Markdown 裡的 ` ```mermaid ` 區塊會渲染成圖
- **數學公式（KaTeX）** — `$...$` 行內、`$$...$$` 區塊
- **程式碼檔** — `.ts .tsx .js .py .sql .css .go .rs .java .json` 等，語法高亮
- **CSV / TSV** — 自動轉成漂亮表格
- **JSON** — 自動排版美化
- **TXT / LOG** — 純文字
- **圖片** — `.png .jpg .gif .webp .svg .avif`
- **影片** — `.mp4 .webm .mov .m4v .ogv`，內嵌成 `<video>` 播放器
- **音樂** — `.mp3 .wav .ogg .m4a .flac .aac`，內嵌成 `<audio>` 播放條
- **Word `.docx`** — 用 mammoth 轉換內文
- **PowerPoint `.pptx`** — 逐頁擷取文字（標題＋條列）
- **Excel `.xlsx / .xls`** — 每張工作表轉成表格
- **PDF** — 用 pdf.js 擷取文字（掃描檔無文字層會提示）
- **Jupyter `.ipynb`** — markdown／程式碼／輸出（含圖片輸出）都會渲染
- **其他任何檔案** — zip、字型、二進位…會做成可下載的「附件卡」，等於什麼都能轉

**影音與圖片會一起包進去**
Markdown 裡寫 `![](clip.mp4)`、`![](song.mp3)`、`![](logo.png)`，只要把檔案（或整個資料夾）一起拖進來，輸出時會自動內嵌：影片變播放器、音樂變播放條、圖片變 data URI。產出的 HTML **自帶媒體**，丟到哪都能播放／顯示。被引用的媒體預設不另外成頁，只當內嵌素材（可手動切換）。

> ⚠️ 影片與大型檔案以 data URI 內嵌會讓 HTML 變大，大量影音建議分批轉。

**樣式**（5 種，可即時切換預覽）
- 指揮艙（深色極光，預設）／雪境（淺色 GLACÉRA 風）／終端機（螢光綠駭客風）／朱墨（米紙雜誌文學風）／午夜霓虹（合成波）

**輸出格式**
- **單檔 HTML 閱讀台**（側邊選單、每頁目錄、**全文搜尋**、語法高亮、響應式、可列印）
- **一鍵 PDF**（自動帶出列印視窗，選「另存為 PDF」即可；CJK 最清晰、文字可選取）
- **EPUB 電子書**（合法 EPUB3，可丟進電子書 App / Readmoo / Apple Books）
- **合併 Markdown** — 把所有文件併成一份 `.md`
- **JSON** — 結構化輸出（標題／分組／HTML），方便再匯入或自動化
- **開新分頁** — 全螢幕開啟產出的閱讀台

**PWA**：部署後可在手機／桌機「加到主畫面」當 App 用；第一次開過後，連轉換用的函式庫都會被 service worker 快取，之後可離線使用。

**其他**
- 拖整個資料夾 → 自動依子資料夾分組
- 每個檔可改分組、排序、隱藏、移除
- 桌機 / 手機預覽切換、可改品牌名與副標
- **記住上次用的樣式與設定**（存在你瀏覽器的 localStorage，不外傳）

---

## 怎麼用

1. 用瀏覽器開 `index.html`（或部署後的網址）。
2. 把檔案或整個資料夾拖進左邊，或按「選擇檔案 / 選擇資料夾」。
3. 挑一個樣式、填品牌名。
4. 右邊即時預覽，確認沒問題。
5. 按「下載 HTML」。完成。

> 第一次開啟需要連網，因為會從 CDN 載入轉換用的函式庫（marked / highlight.js / DOMPurify / mermaid / mammoth）。**你的檔案本身永遠不離開瀏覽器**，只有這幾支公開函式庫從網路載。

---

## 部署（靜態網站，選一個）

它就是一支靜態 `index.html`，任何靜態主機都能放。

**Zeabur**
1. 把 `index.html` 放進一個 Git repo（或直接拖資料夾）。
2. Zeabur 新增服務 → 選該 repo → 框架選 **Static**。
3. 設根目錄為含 `index.html` 的資料夾，部署完成。

**GitHub Pages**
1. 推到 repo，把 `index.html` 放根目錄。
2. Settings → Pages → Branch 選 `main` / root → 存檔。

**Netlify / Vercel / Cloudflare Pages**
- 直接把資料夾拖進去，或連 repo。Build command 留空，Publish/Output 目錄選含 `index.html` 的那層。

部署後把網址分享出去，大家開網頁就能用，檔案一樣只在各自的瀏覽器裡轉。

---

## 完全離線 / 內網版（選用）

預設從 CDN 載函式庫。若要在沒有外網的環境用：
1. 下載這幾支函式庫的 `.min.js` 放進 `/vendor`：marked、highlight.js、dompurify、mermaid、mammoth。
2. 把 `index.html` 裡的 `<script src="https://cdnjs...">` 改成 `<script src="vendor/xxx.min.js">`。
3. 連 Google Fonts 也想離線的話，把字體下載自架、改 `@font-face`。

---

## 技術

- 純 HTML + CSS + 原生 JS，單檔，無建置流程。
- 轉換函式庫（CDN）：[marked](https://marked.js.org/)、[highlight.js](https://highlightjs.org/)、[DOMPurify](https://github.com/cure53/DOMPurify)、[Mermaid](https://mermaid.js.org/)、[mammoth](https://github.com/mwilliamson/mammoth.js)。
- 輸出 HTML 內容是**轉檔當下就渲染好的靜態內容**（程式碼、圖表、圖片都已內嵌），所以下載的檔案除了 Google Fonts 外不依賴任何外部 script，可離線開。

---

## 隱私

所有解析與轉換都在瀏覽器端（client-side）完成。檔案不會上傳到任何伺服器，這個工具本身也沒有後端。

---

## 之後可加（Roadmap）

已完成：PDF / ipynb 匯入、KaTeX 數學、全文搜尋、記住設定、一鍵 PDF。接下來可考慮：

- **整合進站台後台 `/docs`**（用既有 react-markdown，文件存 repo、線上即時看）— 已附 `DocsViewer.tsx` 範例元件
- 拖曳排序（目前是上移／下移）、每份文件閱讀時間／字數
- 程式碼區塊「複製」鈕、閱讀進度條、章節可收合
- 匯出投影片（reveal.js）或 EPUB
- PlantUML / Graphviz 圖、PDF 頁面以圖片嵌入（掃描檔）
- 一鍵發佈到站台（產生固定網址分享）
- 多國語系 UI、淺色／深色跟隨系統
- 手機掃 QR 開啟同一份 deck

---

## 授權

Private. © 2026 SnowRealm.
