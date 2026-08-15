const CACHE="reppilot-v11-8-37";
const VERSION="11.8.37";
const LOGO="./reppilot-logo-old-stable.png?v=11.8.27";
const ASSETS=["./index.html","./styles.css?v=11.8.10","./header-fix.css?v=11.8.27","./auth.js?v=11.8.8","./storage-bridge.js?v=11.8.8","./app.js?v=11.8.8","./workout-fix.js?v=11.8.8","./run-feature.js?v=11.8.8","./run-dashboard-feature.js?v=11.8.34","./profile-feature.js?v=11.8.8","./apple-health-feature.js?v=11.8.35","./shortcut-health-feature.js?v=11.8.37","./timer-sound-feature.js?v=11.8.37","./bodyweight-auto.js?v=11.8.8","./training-plan-feature.js?v=11.8.23","./home-workout-feature.js?v=11.8.24","./progression-feature.js?v=11.8.33","./stretch-routine-feature.js?v=11.8.28","./reset-feature.js?v=11.8.32","./update-feature.js?v=11.8.32","./version.json","./stretch-images-v11.8.30.js?v=11.8.30","./stretch-lower-back-v11.8.29.svg?v=11.8.30","./manifest.json","./icon-192.png","./icon-512.png",LOGO,"./stretch-anatomy-v11.7.2.png?v=11.8.30"];

function upgradeHtml(text){
  let html=text.replace(/data-app-version="[^"]+"/,`data-app-version="${VERSION}"`).replace(/RepPilot v\d+\.\d+\.\d+/g,`RepPilot v${VERSION}`).replace(/<h1>RepPilot <span>v\d+\.\d+\.\d+<\/span><\/h1>/,`<h1>RepPilot <span>v${VERSION}</span></h1>`);
  let inject="";
  if(!html.includes("shortcut-health-feature.js"))inject+=`<script src="shortcut-health-feature.js?v=${VERSION}"></script>`;
  if(!html.includes("timer-sound-feature.js"))inject+=`<script src="timer-sound-feature.js?v=${VERSION}"></script>`;
  if(inject)html=html.replace("</body>",`${inject}<script>(()=>{document.documentElement.dataset.appVersion='${VERSION}';const v=document.querySelector('header h1 span');if(v)v.textContent='v${VERSION}';document.title='RepPilot v${VERSION}'})()</script></body>`);
  return html;
}
async function htmlResponse(response){
  if(!response||!response.ok)return response;
  const text=await response.text();
  return new Response(upgradeHtml(text),{status:response.status,statusText:response.statusText,headers:response.headers});
}

self.addEventListener("install",event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})());});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(event.request,{cache:"no-store"});
        if(fresh.ok){const cache=await caches.open(CACHE);await cache.put("./index.html",fresh.clone());}
        return await htmlResponse(fresh);
      }catch{
        const cached=await caches.match("./index.html");
        return cached?await htmlResponse(cached):Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    try{const fresh=await fetch(event.request,{cache:"no-store"});if(fresh.ok){const cache=await caches.open(CACHE);await cache.put(event.request,fresh.clone());}return fresh;}
    catch{return(await caches.match(event.request))||Response.error();}
  })());
});