// Only public app files are cached. Auth and database responses are never cached.
const CACHE='haruharu-app-v2.2.0';
const ASSETS=['./','./index.html','./config.js','./sync-core.js','./sync.js','./vendor/supabase.js','./fonts/PretendardVariable.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('haruharu-app-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=='GET'||u.origin!==location.origin)return;
 const allowed=ASSETS.map(p=>new URL(p,self.registration.scope).href);
 if(!allowed.includes(u.href))return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)));}return r;}).catch(()=>caches.match(e.request)));
});
