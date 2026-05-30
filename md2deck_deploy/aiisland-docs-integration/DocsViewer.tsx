"use client";
/**
 * DocsViewer — AI 島後台 /docs 閱讀器
 * --------------------------------------------------------------
 * 用站台「已經有」的相依：react-markdown + remark-gfm + rehype-highlight + rehype-raw + lucide-react。
 * 文件直接存在 repo（建議 /docs/<群組>/<檔名>.md），由 server 端讀進來傳給這個 client 元件。
 * 風格沿用 md2deck 的「指揮艙」深色閱讀台。
 *
 * ── 怎麼接（兩步）──────────────────────────────────────────────
 * 1) 放這支檔到 src/app/admin/docs/DocsViewer.tsx
 * 2) 同層建 page.tsx（server component，讀 repo 的 markdown）：
 *
 *    // src/app/admin/docs/page.tsx
 *    import fs from "node:fs";
 *    import path from "node:path";
 *    import matter from "gray-matter";
 *    import DocsViewer, { type DocItem } from "./DocsViewer";
 *
 *    export const dynamic = "force-static"; // 文件隨 build 進站，零 runtime 成本
 *
 *    function loadDocs(): DocItem[] {
 *      const root = path.join(process.cwd(), "docs");
 *      const out: DocItem[] = [];
 *      const walk = (dir: string, group: string) => {
 *        for (const name of fs.readdirSync(dir)) {
 *          const fp = path.join(dir, name);
 *          if (fs.statSync(fp).isDirectory()) walk(fp, name);
 *          else if (name.endsWith(".md")) {
 *            const { data, content } = matter(fs.readFileSync(fp, "utf8"));
 *            out.push({
 *              group: group || "總覽",
 *              slug: name.replace(/\.md$/, "").replace(/^\d+[_-]/, ""),
 *              title: data.title || (content.match(/^#\s+(.+)/m)?.[1] ?? name),
 *              content,
 *            });
 *          }
 *        }
 *      };
 *      if (fs.existsSync(root)) walk(root, "");
 *      return out;
 *    }
 *
 *    export default function Page() {
 *      return <DocsViewer docs={loadDocs()} brand="AI 島" tag="內部文件" />;
 *    }
 *
 * 後台權限沿用 src/app/admin/layout.tsx 的 gate，不必另外處理。
 * --------------------------------------------------------------
 */
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Search, FileText, ChevronRight } from "lucide-react";

export type DocItem = { group: string; slug: string; title: string; content: string };

export default function DocsViewer({
  docs,
  brand = "AI 島",
  tag = "內部文件",
}: {
  docs: DocItem[];
  brand?: string;
  tag?: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const m = new Map<string, { idx: number; doc: DocItem }[]>();
    docs.forEach((doc, idx) => {
      if (!m.has(doc.group)) m.set(doc.group, []);
      m.get(doc.group)!.push({ idx, doc });
    });
    return [...m.entries()];
  }, [docs]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return docs
      .map((d, idx) => ({ idx, d }))
      .filter(({ d }) => d.title.toLowerCase().includes(t) || d.content.toLowerCase().includes(t))
      .slice(0, 12);
  }, [q, docs]);

  const active = docs[activeIdx];

  return (
    <div className="dv-root">
      <style>{CSS}</style>
      <aside className="dv-side">
        <div className="dv-brand">
          <div className="dv-glyph">島</div>
          <div>
            <div className="dv-name">{brand}</div>
            <div className="dv-tag">{tag}</div>
          </div>
        </div>

        <div className="dv-search">
          <Search size={15} className="dv-si" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜尋全部文件…" />
          {results.length > 0 && (
            <div className="dv-results">
              {results.map(({ idx, d }) => (
                <button key={idx} onClick={() => { setActiveIdx(idx); setQ(""); }}>
                  <span className="dv-rt">{d.title}</span>
                  <span className="dv-rg">{d.group}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="dv-nav">
          {groups.map(([g, items]) => (
            <div className="dv-group" key={g}>
              <div className="dv-glabel">{g}</div>
              {items.map(({ idx, doc }) => (
                <button
                  key={idx}
                  className={"dv-item" + (idx === activeIdx ? " active" : "")}
                  onClick={() => setActiveIdx(idx)}
                >
                  <FileText size={15} />
                  <span>{doc.title}</span>
                  {idx === activeIdx && <ChevronRight size={14} className="dv-caret" />}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="dv-main">
        {active ? (
          <article className="dv-body" key={activeIdx}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
            >
              {active.content}
            </ReactMarkdown>
          </article>
        ) : (
          <div className="dv-empty">尚無文件。把 .md 放進 repo 的 /docs 資料夾。</div>
        )}
      </main>
    </div>
  );
}

const CSS = `
.dv-root{--ink:#080c16;--panel:rgba(13,20,35,.78);--line:rgba(120,160,200,.14);--line2:rgba(120,160,200,.28);
  --ice:#5fe3c7;--sky:#46b8f0;--aurora:#7ad7ff;--em:#f6c177;--tx:#e8eef7;--tx2:#aab8cc;--tx3:#6f8197;
  display:grid;grid-template-columns:300px 1fr;min-height:100vh;background:
   radial-gradient(1100px 640px at 10% -10%,rgba(70,184,240,.14),transparent 60%),
   linear-gradient(180deg,#070b14,#0a1020 60%,#070a12);
  color:var(--tx);font-family:"Noto Sans TC",system-ui,sans-serif}
.dv-side{position:sticky;top:0;align-self:start;height:100vh;overflow-y:auto;background:var(--panel);
  backdrop-filter:blur(20px);border-right:1px solid var(--line);padding:0 0 30px}
.dv-brand{display:flex;align-items:center;gap:12px;padding:24px 22px;border-bottom:1px solid var(--line)}
.dv-glyph{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;font-weight:700;color:#06121a;
  font-family:"Noto Serif TC",serif;background:linear-gradient(145deg,var(--ice),var(--sky))}
.dv-name{font-family:"Noto Serif TC",serif;font-weight:900;font-size:18px}
.dv-tag{font-size:11px;color:var(--tx3);letter-spacing:.18em;text-transform:uppercase;margin-top:3px}
.dv-search{position:relative;padding:14px 16px 4px}
.dv-si{position:absolute;left:27px;top:23px;color:var(--tx3)}
.dv-search input{width:100%;padding:9px 12px 9px 34px;border-radius:10px;border:1px solid var(--line2);
  background:rgba(8,12,22,.6);color:var(--tx);font-size:13.5px;font-family:inherit}
.dv-search input:focus{outline:0;border-color:var(--ice)}
.dv-results{position:absolute;left:16px;right:16px;margin-top:6px;background:#0c1322;border:1px solid var(--line2);
  border-radius:12px;overflow:hidden;z-index:5;box-shadow:0 18px 40px rgba(0,0,0,.5)}
.dv-results button{display:flex;flex-direction:column;width:100%;text-align:left;padding:9px 12px;background:none;
  border:0;border-bottom:1px solid var(--line);cursor:pointer;color:var(--tx2)}
.dv-results button:hover{background:rgba(127,170,210,.08)}
.dv-rt{font-size:13px;color:var(--aurora);font-weight:600}.dv-rg{font-size:11px;color:var(--tx3)}
.dv-nav{padding:14px 12px}
.dv-group{margin-bottom:18px}
.dv-glabel{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--tx3);font-weight:700;padding:0 12px 8px}
.dv-item{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 12px;border-radius:11px;
  border:1px solid transparent;background:none;color:var(--tx2);cursor:pointer;font-size:14px;font-family:inherit;transition:.18s}
.dv-item:hover{background:rgba(127,170,210,.07);color:var(--tx)}
.dv-item.active{background:linear-gradient(100deg,rgba(95,227,199,.14),transparent);color:#fff;border-color:var(--line2)}
.dv-item span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dv-caret{color:var(--ice);flex:none}
.dv-main{padding:48px 56px 120px;max-width:1000px}
.dv-empty{color:var(--tx3);padding:60px}
.dv-body{font-size:16px;line-height:1.8;animation:dvr .5s ease}
@keyframes dvr{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.dv-body h1,.dv-body h2,.dv-body h3{font-family:"Noto Serif TC",serif;color:#fff;line-height:1.3}
.dv-body h1{font-size:30px;font-weight:900;margin:0 0 18px;padding-bottom:14px;border-bottom:1px solid var(--line2)}
.dv-body h2{font-size:22px;font-weight:700;margin:40px 0 12px;display:flex;align-items:center;gap:10px}
.dv-body h2::before{content:"";width:8px;height:8px;border-radius:2px;transform:rotate(45deg);background:linear-gradient(135deg,var(--ice),var(--sky))}
.dv-body h3{font-size:18px;color:var(--aurora);margin:26px 0 8px}
.dv-body p{margin:13px 0}.dv-body strong{color:#fff}.dv-body em{color:var(--em);font-style:normal}
.dv-body a{color:var(--aurora);border-bottom:1px solid rgba(122,215,255,.3);text-decoration:none}
.dv-body ul,.dv-body ol{padding-left:24px;margin:13px 0}.dv-body li{margin:6px 0}
.dv-body blockquote{margin:20px 0;padding:16px 22px;border-radius:13px;border:1px solid var(--line2);
  border-left:3px solid var(--ice);background:rgba(95,227,199,.08)}
.dv-body table{width:100%;border-collapse:separate;border-spacing:0;margin:20px 0;border:1px solid var(--line2);
  border-radius:12px;overflow:hidden;font-size:14px;display:block;overflow-x:auto}
.dv-body th{background:rgba(70,184,240,.14);color:#fff;text-align:left;padding:12px 15px;font-family:"Noto Serif TC",serif}
.dv-body td{padding:11px 15px;border-top:1px solid var(--line);color:var(--tx2)}
.dv-body code{font-family:"JetBrains Mono",monospace;font-size:.86em;background:rgba(120,170,210,.12);
  color:var(--em);padding:2px 6px;border-radius:5px}
.dv-body pre{margin:18px 0;background:#0a1120;border:1px solid var(--line2);border-radius:12px;overflow-x:auto}
.dv-body pre code{display:block;padding:18px;color:#cdd9e8;background:none;font-size:13.5px;line-height:1.7}
@media(max-width:860px){.dv-root{grid-template-columns:1fr}.dv-side{position:static;height:auto;border-right:0;border-bottom:1px solid var(--line)}.dv-main{padding:30px 20px 90px}}
`;
