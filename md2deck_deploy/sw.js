/* md2deck Studio service worker — app shell + CDN runtime cache (離線可用) */
const CACHE='md2deck-v1';
const CDN='md2deck-cdn-v1';
const SHELL=['./','index.html','manifest.webmanifest',
  'icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon-180.png','icons/favicon-32.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==CDN).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  // CDN 函式庫與字型：cache-first（第一次載入後即可離線）
  if(/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(url.host)){
    e.respondWith(caches.open(CDN).then(async c=>{
      const hit=await c.match(req); if(hit) return hit;
      try{const res=await fetch(req);if(res&&(res.ok||res.type==='opaque'))c.put(req,res.clone());return res;}
      catch(_){return hit||Response.error();}
    }));
    return;
  }
  // 同源：network-first，失敗回退快取（更新會反映、離線也能開）
  if(url.origin===location.origin){
    e.respondWith(fetch(req).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));return res;})
      .catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));
  }
});
