/* md2deck (Next) service worker — app shell + CDN runtime cache */
const CACHE='md2deck-next-v2', CDN='md2deck-cdn-v2';
const SHELL=['/','/studio','/studio.html','/manifest.webmanifest',
  '/icons/icon-192.png','/icons/icon-512.png','/icons/apple-touch-icon-180.png','/icons/favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()).catch(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==CDN).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com/.test(url.host)){
    e.respondWith(caches.open(CDN).then(async c=>{const hit=await c.match(req);if(hit)return hit;try{const r=await fetch(req);if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r;}catch(_){return hit||Response.error();}}));
    return;
  }
  if(url.origin===location.origin){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r;}).catch(()=>caches.match(req)));
  }
});
