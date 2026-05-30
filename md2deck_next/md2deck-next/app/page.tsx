import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

const FEATURES = [
  { ic: "🗂️", h: "幾乎什麼都能轉", p: "Markdown、程式碼、Word、PPT、Excel、PDF、Jupyter、CSV/JSON、圖片影音，連不認得的檔都做成可下載附件卡。" },
  { ic: "🎨", h: "5 種精緻樣式", p: "指揮艙、雪境、終端機、朱墨、午夜霓虹，轉檔前即時預覽，挑到滿意再下載。" },
  { ic: "🔒", h: "全在本機、零上傳", p: "所有解析與轉換都在你的瀏覽器完成，檔案不會上傳到任何伺服器。" },
  { ic: "🔎", h: "閱讀台內全文搜尋", p: "輸出的 HTML 自帶側邊選單、每頁目錄與跨文件全文搜尋。" },
  { ic: "📲", h: "可安裝、可離線", p: "PWA：加到主畫面當 App 用，第一次開過後可離線使用。" },
  { ic: "📤", h: "多種輸出", p: "單檔 HTML、一鍵 PDF、EPUB 電子書、合併 Markdown、JSON。" },
];
const FORMATS = ["Markdown","程式碼","Word","PowerPoint","Excel","PDF","Jupyter .ipynb","CSV / JSON","圖片 (png/jpg/gif/svg/webp/apng)","影片 (mp4/webm)","音樂 (mp3/wav)","Mermaid 圖","KaTeX 數學","＋任何檔案"];
const FAQS = [
  { q: "我的檔案會被上傳嗎？", a: "不會。所有轉換都在你的瀏覽器本機完成，沒有後端、不收集檔案。" },
  { q: "可以轉 Word / PPT / Excel 嗎？", a: "可以。Word 取內文、PowerPoint 逐頁取文字、Excel 每張工作表變表格。" },
  { q: "輸出的 HTML 可以離線開嗎？", a: "可以。內容（程式碼、圖表、圖片、影音）在轉檔時就已內嵌，下載的單檔除了字型外不依賴外部資源。" },
  { q: "免費嗎？", a: "目前免費。它是 SnowRealm 生態的一部分。" },
];

export default function Home() {
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <main className="wrap">
      <nav className="nav">
        <span className="brand"><img src="/icons/favicon-48.png" alt="" />{SITE_NAME}</span>
        <Link href="/studio" className="btn btn-ghost">開啟工具</Link>
      </nav>

      <header className="hero">
        <span className="eyebrow">文件 → 漂亮 HTML · 全在本機</span>
        <h1>把任何文件，<br /><span className="grad">一鍵變成漂亮的閱讀台</span></h1>
        <p>拖進 Markdown、程式碼、Word、PPT、Excel、PDF、圖片影音⋯⋯挑個樣式，即時預覽，下載成單一份可離線開啟的 HTML。檔案完全在你的瀏覽器裡轉，不上傳。</p>
        <div className="cta">
          <Link href="/studio" className="btn btn-primary">免費開始轉檔 →</Link>
          <a href="#features" className="btn btn-ghost">看功能</a>
        </div>
        <div className="trust">🔒 零上傳 · 📲 可安裝離線 · 🆓 免費</div>
        <div className="pills">{FORMATS.map((f) => <span className="pill" key={f}>{f}</span>)}</div>
      </header>

      <section className="section" id="features">
        <h2>為什麼好用</h2>
        <p className="sub">一個工具，搞定整包文件的閱讀體驗</p>
        <div className="grid">
          {FEATURES.map((f) => (
            <div className="card" key={f.h}><div className="ic">{f.ic}</div><h3>{f.h}</h3><p>{f.p}</p></div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>常見問題</h2>
        <p className="sub">關於隱私、格式與使用</p>
        <div className="faq">
          {FAQS.map((f) => (
            <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>
      </section>

      <section className="section" style={{ textAlign: "center" }}>
        <h2>準備好了嗎？</h2>
        <p className="sub">不用註冊、不用安裝，打開就能用</p>
        <Link href="/studio" className="btn btn-primary">開啟 md2deck Studio →</Link>
      </section>

      <footer className="foot">
        <p>{SITE_NAME} · 由 <a href="https://snowrealm.pet" rel="noopener">SnowRealm</a> 打造</p>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
    </main>
  );
}
