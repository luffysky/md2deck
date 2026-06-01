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
global.document = new JSDOM('<!doctype html><body></body>').window.document;
let uid = 0;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const linkifyEsc = esc;
const slug = s => String(s).toLowerCase().replace(/\s+/g, '-');
const isTextKind = k => ['md', 'csv', 'json', 'txt', 'code'].includes(k);

function grab(name) {
  const re = new RegExp('function ' + name + '\\(', 'g');
  const m = re.exec(html);
  if (!m) throw new Error('找不到函式 ' + name);
  let i = html.indexOf('{', m.index), depth = 0, start = m.index;
  for (; i < html.length; i++) { if (html[i] === '{') depth++; else if (html[i] === '}') { depth--; if (depth === 0) return html.slice(start, i + 1); } }
  throw new Error('括號不平衡 ' + name);
}
const SERIES_UNIT_DECL = html.match(/const SERIES_UNIT=[^;]+;/)[0];
const FUNCS = ['parseNum', 'fmtNum', 'escSVG', 'pickChartType', 'tableToMatrix', 'buildChartSVG',
  'parseChartBlock', 'explicitChartHTML', 'decorateTables', 'sniffTableBlock', 'sniffSeriesBlock',
  'matrixToTable', 'textToHTML', 'pptSlideTables', 'hashStr'];
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

/* ---------- 結果 ---------- */
console.log('\n' + (fails ? ('❌ ' + fails + ' 項失敗') : '✅ 全部通過'));
process.exit(fails ? 1 : 0);
