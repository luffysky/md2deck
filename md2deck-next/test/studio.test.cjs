/*
 * studio.html 引擎測試（node test/studio.test.cjs 或 npm test）
 *
 * studio.html 是單檔引擎、兩層 JS（控制端 + DECK runtime 模板字串）。
 * 這支測試做三件事：
 *   1. 對兩層 JS 各做語法檢查（控制端用 node --check；runtime 先中性化 ${...} 再 vm.Script）。
 *   2. 用正則把純函式從原始碼挖出來 eval，配 jsdom 提供 DOM，對行為做斷言。
 *   3. 任一失敗 → 非零退出碼（CI / 手動皆可用）。
 *
 * 為什麼用「挖原始碼 eval」而非 import：引擎是單一 HTML、函式掛在 <script> 裡，
 * 沒有模組匯出。這是對單檔引擎做單元測試的務實作法。
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');
const { JSDOM } = require('jsdom');

const STUDIO = path.join(__dirname, '..', 'public', 'studio.html');
const html = fs.readFileSync(STUDIO, 'utf8');

let fails = 0;
function ok(name, cond) { console.log((cond ? '  ✓ ' : '  ✗ ') + name); if (!cond) fails++; }
function section(t) { console.log('\n' + t); }

/* ---------- 1. 兩層 JS 語法檢查 ---------- */
section('語法檢查');
(function () {
  const lines = html.split('\n');
  const s = lines.findIndex(l => l.trim() === '<script>');
  const e = lines.findIndex((l, i) => i > s && l.trim() === '</script>');
  const ctrl = lines.slice(s + 1, e).join('\n');
  const tmp = path.join(__dirname, '_ctrl_tmp.js');
  fs.writeFileSync(tmp, ctrl, 'utf8');
  try { execSync('node --check "' + tmp + '"', { stdio: 'pipe' }); ok('控制端 JS 語法', true); }
  catch (err) { ok('控制端 JS 語法\n' + err.stderr.toString(), false); }
  fs.unlinkSync(tmp);

  const jsStart = html.indexOf('const js=`') + 10;
  const slice = html.slice(jsStart);
  const endRel = slice.search(/`;\r?\n\s{2}return\s+`/);
  const tpl = slice.slice(0, endRel);
  const neutral = tpl.replace(/\$\{(?:[^{}]|\{[^{}]*\})*\}/g, 'null');
  try { new vm.Script(neutral); ok('Runtime JS 語法', true); }
  catch (err) { ok('Runtime JS 語法: ' + err.message, false); }
})();

/* ---------- 2. 純函式行為斷言 ---------- */
const _win = new JSDOM('<!doctype html><body></body>').window;
global.document = _win.document;
global.NodeFilter = _win.NodeFilter;   // runtime（瀏覽器）這些是全域，node 要手動掛上
global.Node = _win.Node;
let uid = 0;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const linkifyEsc = esc;
const slug = s => String(s).toLowerCase().replace(/\s+/g, '-');
const isTextKind = k => ['md', 'csv', 'json', 'txt', 'code'].includes(k);

// 會跳過字串／樣板／正則／註解的括號配對器：
// 既能處理一行式函式（occOf），也不會被正則裡的 { }（rtfToHTML）騙到。
function grab(name) {
  const m = new RegExp('(^|\\n)function ' + name + '\\(').exec(html);
  if (!m) throw new Error('找不到函式 ' + name);
  const start = m.index + (m[1] ? 1 : 0);
  let i = html.indexOf('{', start), depth = 0, st = null, prev = '';
  for (; i < html.length; i++) {
    const c = html[i], n = html[i + 1];
    if (st) {
      if (st === '/*') { if (c === '*' && n === '/') { st = null; i++; } continue; }
      if (st === '//') { if (c === '\n') st = null; continue; }
      if (st === 're') { if (c === '\\') { i++; continue; } if (c === '/') st = null; continue; }
      if (c === '\\') { i++; continue; }
      if (c === st) st = null;
      continue;
    }
    if (c === '/' && n === '*') { st = '/*'; i++; continue; }
    if (c === '/' && n === '/') { st = '//'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { st = c; continue; }
    if (c === '/' && (/[=(,:!&|?{;[]/.test(prev) || prev === '')) { st = 're'; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return html.slice(start, i + 1); }
    if (!/\s/.test(c)) prev = c;
  }
  throw new Error('括號不平衡 ' + name);
}
global.DOMParser = _win.DOMParser;
const SERIES_UNIT_DECL = html.match(/const SERIES_UNIT=[^;]+;/)[0];
const FUNCS = ['parseNum', 'fmtNum', 'escSVG', 'isAxisLabel', 'pickChartType', 'tableToMatrix', 'buildChartSVG',
  'parseChartBlock', 'explicitChartHTML', 'alignNumericCols', 'decorateTables', 'sniffTableBlock', 'sniffSeriesBlock',
  'matrixToTable', 'textToHTML', 'pptSlideTables', 'hashStr',
  'odfInline', 'odfList', 'odfTable', 'odfFlow', 'odfSheets', 'odfSlides', 'rtfToHTML', 'epubResolve'];
eval(SERIES_UNIT_DECL + '\n' + FUNCS.map(grab).join('\n'));

section('parseNum（含單位 / 會計負數 / 拒絕散文）');
ok('120mm = 120', parseNum('120mm') === 120);
ok('15°C = 15', parseNum('15°C') === 15);
ok('85% = 85', parseNum('85%') === 85);
ok('NT$1,200 = 1200', parseNum('NT$1,200') === 1200);
ok('(123) = -123', parseNum('(123)') === -123);
ok('蘋果 = NaN', isNaN(parseNum('蘋果')));
ok('Q1 = NaN（非數值開頭）', isNaN(parseNum('Q1')));

section('數字表格 → 圖表（含 Excel 帶單位重現）');
const numTable = '<table><tr><td>月份</td><td>雨量</td><td>氣溫</td></tr>' +
  '<tr><td>1月</td><td>120mm</td><td>15°C</td></tr>' +
  '<tr><td>2月</td><td>95mm</td><td>17°C</td></tr>' +
  '<tr><td>3月</td><td>80mm</td><td>20°C</td></tr></table>';
const decd = decorateTables(numTable);
ok('帶單位表格掛圖表鈕 + SVG', decd.includes('chart-toggle') && decd.includes('<svg'));
const textTable = '<table><tr><td>姓名</td><td>部門</td></tr>' +
  '<tr><td>小明</td><td>工程</td></tr><tr><td>小華</td><td>設計</td></tr></table>';
ok('純文字表格不掛圖表', !decorateTables(textTable).includes('chart-toggle'));

section('表格方向偵測 / 矩陣（含 Excel 合併標題 bug 重現）');
function tableEl(htmlStr) { const d = document.createElement('div'); d.innerHTML = htmlStr; return d.querySelector('table'); }
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
(function () {
  // isAxisLabel
  ok('isAxisLabel 1月', isAxisLabel('1月'));
  ok('isAxisLabel Q1', isAxisLabel('Q1'));
  ok('isAxisLabel 28 → false', !isAxisLabel('28'));
  ok('isAxisLabel 台北市 → false', !isAxisLabel('台北市'));

  // 重現使用者的 Excel：合併標題列 + 城市在列 + 月份在「最後一列」
  const cities = [['台北市', 28, 28, 29, 30, 33, 35, 40, 40, 36, 32, 28, 25], ['台中市', 30, 30, 31, 32, 35, 38, 42, 43, 38, 36, 32, 30], ['台南市', 31, 32, 33, 33, 36, 40, 42, 44, 40, 36, 34, 32]];
  let badHtml = '<table><tr><td colspan="13">三市平均月氣溫</td></tr>';
  cities.forEach(r => { badHtml += '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>'; });
  badHtml += '<tr><td></td>' + months.map(m => `<td>${m}</td>`).join('') + '</tr></table>';
  const mBad = tableToMatrix(tableEl(badHtml));
  ok('合併標題表：偵測成功（不再 null）', !!mBad);
  ok('合併標題表：3 系列（三市）', mBad && mBad.series.length === 3);
  ok('合併標題表：X=12 個月', mBad && mBad.labels.length === 12 && mBad.labels[0] === '1月');
  ok('合併標題表：系列名=城市', mBad && mBad.series[0].name === '台北市' && mBad.series[0].values.length === 12);
  ok('合併標題表：decorateTables 出圖', decorateTables(badHtml).includes('chart-toggle'));

  // 寬矩陣（月份在頂列）→ 每列一系列
  let wide = '<table><tr><td></td>' + months.map(m => `<th>${m}</th>`).join('') + '</tr>';
  cities.forEach(r => { wide += '<tr>' + r.map((c, i) => i === 0 ? `<td>${c}</td>` : `<td>${c}</td>`).join('') + '</tr>'; });
  wide += '</table>';
  const mWide = tableToMatrix(tableEl(wide));
  ok('寬矩陣 → 3 系列 × 12 月', mWide && mWide.series.length === 3 && mWide.labels.length === 12);

  // 高表格（月份在列、指標在欄）→ 每欄一系列
  let tall = '<table><tr><th>月份</th><th>雨量</th><th>氣溫</th></tr>';
  for (let i = 0; i < 12; i++) tall += `<tr><td>${months[i]}</td><td>${100 + i}</td><td>${15 + i}</td></tr>`;
  tall += '</table>';
  const mTall = tableToMatrix(tableEl(tall));
  ok('高表格 → 2 系列（雨量/氣溫）', mTall && mTall.series.length === 2 && mTall.labels.length === 12);

  // 兩欄 月|值 → 1 系列
  let two = '<table><tr><th>月份</th><th>雨量</th></tr>';
  for (let i = 0; i < 12; i++) two += `<tr><td>${months[i]}</td><td>${100 + i}</td></tr>`;
  two += '</table>';
  const mTwo = tableToMatrix(tableEl(two));
  ok('兩欄 → 1 系列', mTwo && mTwo.series.length === 1 && mTwo.labels.length === 12);

  // 數字欄右對齊
  const at = tableEl(tall); alignNumericCols(at);
  ok('alignNumericCols：數字欄加 .tnum', at.querySelectorAll('td.tnum').length > 0);
  ok('alignNumericCols：文字欄不加', [...at.tBodies[0].rows].every(r => !r.cells[0].classList.contains('tnum')));
})();

section('圖表自動選型');
ok('月份 → 折線', pickChartType({ labels: ['1月', '2月', '3月'], series: [{ name: 'x', values: [1, 2, 3] }] }) === 'line');
ok('類別 → 長條', pickChartType({ labels: ['蘋果', '香蕉', '芭樂'], series: [{ name: 'x', values: [1, 2, 3] }] }) === 'bar');
ok('多系列 → 折線', pickChartType({ labels: ['a', 'b'], series: [{ name: 'p', values: [1, 2] }, { name: 'q', values: [3, 4] }] }) === 'line');
ok('長條圖含 <rect>', buildChartSVG({ labels: ['蘋果', '香蕉'], series: [{ name: 'x', values: [10, 20] }] }, 'bar').includes('<rect'));
ok('折線圖含 <polyline>', buildChartSVG({ labels: ['1月', '2月', '3月'], series: [{ name: 'x', values: [1, 2, 3] }] }, 'line').includes('<polyline'));

section('```chart 區塊');
const pc = parseChartBlock('type: line\nx: 一月,二月,三月\n雨量: 120,95,80\n氣溫: 15,17,20');
ok('解析 type/x/系列', pc && pc.type === 'line' && pc.labels.length === 3 && pc.series.length === 2);
ok('explicitChartHTML 出 SVG', explicitChartHTML(pc).includes('<svg'));
ok('壞輸入 → null', parseChartBlock('hello world') === null);

section('假表格 / 沒表格的數據');
ok('Tab 假表格', !!sniffTableBlock(['月\t量', 'A\t1', 'B\t2'], 0));
ok('多空格假表格', !!sniffTableBlock(['品名   數量', '蘋果   10', '香蕉   20'], 0));
ok('散文不誤判（table）', !sniffTableBlock(['這是一句話。', '這是另一句。'], 0));
ok('冒號數據清單 → 表格', !!sniffSeriesBlock(['一月: 120mm', '二月: 95mm', '三月: 80mm'], 0));
ok('bullet kv → 表格', !!sniffSeriesBlock(['- 台北: 120', '- 台中: 95', '- 高雄: 80'], 0));
ok('單空格+單位 → 表格', !!sniffSeriesBlock(['一月 120mm', '二月 95mm', '三月 80mm'], 0));
ok('散文不誤判（series）', !sniffSeriesBlock(['這是第一句話', '這是第二句話', '還有第三句'], 0));
ok('一般清單不誤判', !sniffSeriesBlock(['買牛奶', '買雞蛋', '買麵包'], 0));

section('textToHTML 整合');
const t = textToHTML('各月雨量\n\n一月: 120mm\n二月: 95mm\n三月: 80mm\n\n結語在這。');
ok('數據清單 → <table>', t.includes('<table>'));
ok('表格可被 decorateTables 出圖', decorateTables(t).includes('chart-toggle'));
ok('結語成段落', t.includes('結語在這'));

section('PPT 投影片表格');
const slideXml = '<a:tbl><a:tr><a:tc><a:txBody><a:p><a:r><a:t>項目</a:t></a:r></a:p></a:txBody></a:tc>' +
  '<a:tc><a:txBody><a:p><a:r><a:t>值</a:t></a:r></a:p></a:txBody></a:tc></a:tr>' +
  '<a:tr><a:tc><a:txBody><a:p><a:r><a:t>A</a:t></a:r></a:p></a:txBody></a:tc>' +
  '<a:tc><a:txBody><a:p><a:r><a:t>10</a:t></a:r></a:p></a:txBody></a:tc></a:tr></a:tbl>';
const tbls = pptSlideTables(slideXml);
ok('解析出 1 個表格 2x2', tbls.length === 1 && tbls[0].length === 2 && tbls[0][0].length === 2);

section('hashStr');
ok('同字串同雜湊', hashStr('abc') === hashStr('abc'));
ok('不同字串不同雜湊', hashStr('abc') !== hashStr('abd'));

section('閱讀台螢光標記（runtime occOf / wrapOcc）');
// 這兩個函式定義在 DECK runtime 模板字串內，挖出來配 jsdom 驗 DOM 行為
eval(grab('occOf') + '\n' + grab('wrapOcc'));
(function () {
  const mk = () => { const d = document.createElement('div'); d.innerHTML = '<div class="doc-body"><p>ab cd ab cd ab</p></div>'; return d.querySelector('.doc-body'); };
  const b1 = mk();
  const m = wrapOcc(b1, 'ab', 1, '');
  ok('wrapOcc 包住第 2 個 ab', !!m && m.textContent === 'ab' && b1.querySelectorAll('mark.uhl').length === 1);
  ok('wrapOcc 帶筆記加 has-note', (function () { const b = mk(); const mm = wrapOcc(b, 'ab', 0, '我的筆記'); return mm.classList.contains('has-note') && mm.getAttribute('data-note') === '我的筆記'; })());
  const b2 = mk();
  const tn = b2.querySelector('p').firstChild;       // 文字節點 "ab cd ab cd ab"（ab 在 0/6/12）
  const r = document.createRange(); r.setStart(tn, 12); r.setEnd(tn, 14);
  ok('occOf 第 3 個 ab → 2', occOf(b2, r, 'ab') === 2);
  // round-trip：occOf 算出的序號，wrapOcc 必須包到同一個位置
  const b3 = mk(); const tn3 = b3.querySelector('p').firstChild;
  const r3 = document.createRange(); r3.setStart(tn3, 6); r3.setEnd(tn3, 8);
  const occ = occOf(b3, r3, 'ab'); const wm = wrapOcc(b3, 'ab', occ, '');
  ok('occOf↔wrapOcc round-trip', occ === 1 && wm.previousSibling && /cd $/.test(wm.previousSibling.nodeValue));
})();

section('OpenDocument（ODT / ODS / ODP）');
const ODF_NS = 'xmlns:text="urn:t" xmlns:table="urn:tb" xmlns:office="urn:o" xmlns:draw="urn:d" xmlns:presentation="urn:p"';
(function () {
  // ODT flow：標題 + 段落 + 清單 + 表格
  const odtXml = `<office:document-content ${ODF_NS}><office:body><office:text>` +
    '<text:h text:outline-level="1">章節標題</text:h>' +
    '<text:p>一段內文。</text:p>' +
    '<text:list><text:list-item><text:p>項目甲</text:p></text:list-item><text:list-item><text:p>項目乙</text:p></text:list-item></text:list>' +
    '<table:table><table:table-row><table:table-cell><text:p>月份</text:p></table:table-cell><table:table-cell><text:p>雨量</text:p></table:table-cell></table:table-row>' +
    '<table:table-row><table:table-cell><text:p>1月</text:p></table:table-cell><table:table-cell><text:p>120</text:p></table:table-cell></table:table-row>' +
    '<table:table-row><table:table-cell><text:p>2月</text:p></table:table-cell><table:table-cell><text:p>95</text:p></table:table-cell></table:table-row></table:table>' +
    '</office:text></office:body></office:document-content>';
  const odoc = new DOMParser().parseFromString(odtXml, 'application/xml');
  const oh = odfFlow(odoc.documentElement);
  ok('ODT 標題 → <h1>', /<h1[^>]*>章節標題<\/h1>/.test(oh));
  ok('ODT 段落 → <p>', oh.includes('<p>一段內文。</p>'));
  ok('ODT 清單 → <ul><li>', oh.includes('<li>項目甲</li>') && oh.includes('<ul>'));
  ok('ODT 表格 → <table>', oh.includes('<table>') && oh.includes('<th>月份</th>'));
  ok('ODT 數字表格可被 decorateTables 出圖', decorateTables(oh).includes('chart-toggle'));

  // ODS sheets
  const odsXml = `<office:document-content ${ODF_NS}><office:body><office:spreadsheet>` +
    '<table:table table:name="Q1"><table:table-row><table:table-cell><text:p>項目</text:p></table:table-cell><table:table-cell><text:p>值</text:p></table:table-cell></table:table-row>' +
    '<table:table-row><table:table-cell><text:p>A</text:p></table:table-cell><table:table-cell><text:p>10</text:p></table:table-cell></table:table-row></table:table>' +
    '</office:spreadsheet></office:body></office:document-content>';
  const sdoc = new DOMParser().parseFromString(odsXml, 'application/xml');
  const sh = odfSheets(sdoc);
  ok('ODS 工作表名 → <h2>', sh.includes('<h2') && sh.includes('Q1'));
  ok('ODS 內容 → <table>', sh.includes('<table>') && sh.includes('<th>項目</th>'));

  // ODP slides
  const odpXml = `<office:document-content ${ODF_NS}><office:body><office:presentation>` +
    '<draw:page draw:name="第一頁"><text:p>投影片標題</text:p><text:p>要點一</text:p><text:p>要點二</text:p></draw:page>' +
    '</office:presentation></office:body></office:document-content>';
  const pdoc = new DOMParser().parseFromString(odpXml, 'application/xml');
  const ph = odfSlides(pdoc);
  ok('ODP → slide-card', ph.includes('slide-card') && ph.includes('投影片標題'));
  ok('ODP 要點 → slide-body li', ph.includes('<li>要點一</li>'));
})();

section('RTF');
const rh = rtfToHTML('{\\rtf1\\ansi {\\fonttbl\\f0 Arial;}\\f0\\fs24 第一段。\\par 第二段。\\par}');
ok('RTF → 兩段 <p>', (rh.match(/<p>/g) || []).length >= 2 && rh.includes('第一段') && rh.includes('第二段'));
ok('RTF 去除字型表', !rh.includes('fonttbl') && !rh.includes('Arial'));
const runi = rtfToHTML('\\u26085?\\u26412? text');
ok('RTF unicode \\uN', runi.includes('日') && runi.includes('本'));

section('EPUB 路徑解析');
ok('epubResolve 同層', epubResolve('OEBPS/', 'ch1.xhtml') === 'OEBPS/ch1.xhtml');
ok('epubResolve ../', epubResolve('OEBPS/text/', '../images/a.png') === 'OEBPS/images/a.png');
ok('epubResolve ./', epubResolve('OEBPS/', './ch2.xhtml') === 'OEBPS/ch2.xhtml');

/* ---------- 結果 ---------- */
console.log('\n' + (fails ? ('❌ ' + fails + ' 項失敗') : '✅ 全部通過'));
process.exit(fails ? 1 : 0);
