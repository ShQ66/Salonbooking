const V="salon-v2";
const base=self.registration.scope;
const FILES=["","index.html","manifest.json","icon-192.png","icon-512.png"];
const key=u=>{const x=new URL(u);return x.origin+x.pathname};
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES.map(f=>new Request(base+f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
 const r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
 e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(ch=>ch.put(key(r.url),c))}return res}).catch(()=>caches.match(key(r.url)).then(m=>m||caches.match(base+"index.html"))));
});
