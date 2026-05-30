# 部署指南（DEPLOY）

這是純靜態單檔工具，任何靜態主機都能放。以下以 Zeabur 為主。

---

## 方案 A — Zeabur 自動靜態（最簡單，推薦）

Zeabur 規則：**專案裡沒有 `package.json` 等語言特徵時，會自動以「靜態模式」部署。** 所以你什麼設定都不用寫，把 `index.html` 推上去就好。

1. 建一個 Git repo，把這包的內容放進去（至少要有 `index.html`）。
   ```
   git init
   git add index.html README.md _headers .gitignore
   git commit -m "md2deck studio"
   git branch -M main
   git remote add origin <你的-repo-URL>
   git push -u origin main
   ```
2. Zeabur → New Project → Deploy from GitHub → 選這個 repo。
3. Zeabur 偵測為靜態網站，幾秒就部署完成。
4. 在服務的 Networking／Domains 綁上網域（或用 Zeabur 給的 `*.zeabur.app`）。

> 之後每次 `git push`，Zeabur 會自動重新部署（CI/CD）。

### `_headers`（已附）
Zeabur 底層用 Caddy，會套用 repo 根目錄的 `_headers`（Netlify 語法）。已幫你設好基本安全標頭（nosniff、Referrer-Policy、X-Frame-Options、Permissions-Policy）。
裡面附了一段**註解掉的 CSP**，要更嚴可自行打開——但記得它必須放行 cdnjs、Google Fonts、`data:`、`blob:`，否則工具會載不到函式庫、影音內嵌也會被擋。

### 注意
- Zeabur 會封鎖 `.git`、`node_modules`、`.venv`、`vendor` 等路徑，正常不影響本工具。
- Zeabur 有安全掃描，repo 內若含像 API key／憑證的內容可能被擋。本工具沒有任何密鑰，正常不會觸發；別把 `.env` 之類推上去（`.gitignore` 已幫你擋）。

---

## 方案 B — Dockerfile（任何容器平台 / 想自己掌控）

已附 `Dockerfile`（用 Caddy 提供靜態檔，監聽 Zeabur 注入的 `$PORT`）。
Zeabur 若偵測到 `Dockerfile` 會優先用它。若你「有 Dockerfile 但想讓 Zeabur 自動判斷」，在 `zbpack.json` 放：
```json
{ "ignore_dockerfile": true }
```
（範例見 `zbpack.ignore-dockerfile.json.example`，改名成 `zbpack.json` 即可。）

本機測試：
```
docker build -t md2deck .
docker run -p 8080:8080 -e PORT=8080 md2deck
# 開 http://localhost:8080
```

---

## 方案 C — 其他靜態主機

`index.html` 丟上去即可，Build command 留空，發佈目錄選含 `index.html` 的那層：
- **GitHub Pages**：repo → Settings → Pages → Branch = main / root。
- **Netlify / Vercel / Cloudflare Pages**：拖資料夾或連 repo，輸出目錄選根目錄。

---

## 完全離線 / 內網版

預設從 CDN 載 marked / highlight.js / DOMPurify / mermaid / KaTeX / pdf.js / mammoth。
要完全離線：把這些 `.min.js`（和 KaTeX 的 css）下載到 `/vendor`，把 `index.html` 裡的 `https://cdnjs...` 換成 `vendor/...`，Google Fonts 也自架。檔案本身的轉換一直都在本機，不受影響。
