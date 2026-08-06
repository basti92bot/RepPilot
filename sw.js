const CACHE="reppilot-v11-7-2";const ASSETS=["./","./index.html","./styles.css?v=11.7.2","./app.js?v=11.7.2","./manifest.json","./icon-192.png","./icon-512.png","./stretch-anatomy-v11.7.2.png?v=11.7.2"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))),self.clients.claim()])));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const x=r.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,x)))}return r}).catch(()=>caches.match(e.request).then(x=>x||caches.match("./index.html"))))});
