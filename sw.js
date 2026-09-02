const CACHE="reppilot-v11-8-115";
const VERSION="11.8.115";
const ASSETS=[
  "./install.html",
  "./index.html",
  "./styles.css?v=11.8.115",
  "./header-fix.css?v=11.8.115",
  "./manifest.json?v=11.8.115",
  "./icon-192.png?v=11.8.115",
  "./icon-512.png?v=11.8.115",
  "./reppilot-muscleman-logo-v11.8.26.png?v=11.8.115",
  "./reppilot-logo-old-stable.png?v=11.8.27",
  "./auth.js?v=11.8.115",
  "./storage-bridge.js?v=11.8.69",
  "./app.js?v=11.8.115",
  "./cloud-history-feature.js?v=11.8.64",
  "./workout-fix.js?v=11.8.70",
  "./run-feature.js?v=11.8.115",
  "./run-dashboard-feature.js?v=11.8.34",
  "./history-simple-feature.js?v=11.8.115",
  "./profile-feature.js?v=11.8.115",
  "./app-tour-feature.js?v=11.8.115",
  "./apple-health-feature.js?v=11.8.115",
  "./shortcut-health-feature.js?v=11.8.115",
  "./bodyweight-auto.js?v=11.8.58",
  "./training-plan-feature.js?v=11.8.115",
  "./home-plan-card-hide.js?v=11.8.115",
  "./personal-records-feature.js?v=11.8.71",
  "./home-workout-feature.js?v=11.8.58",
  "./training-hub-feature.js?v=11.8.115",
  "./onboarding-feature.js?v=11.8.58",
  "./progression-feature.js?v=11.8.58",
  "./stretch-routine-feature.js?v=11.8.115",
  "./timer-sound-feature.js?v=11.8.58",
  "./navigation-fix.js?v=11.8.58",
  "./workout-sticky-actions.js?v=11.8.115",
  "./day-exercise-overview.js?v=11.8.58",
  "./pushup-feature.js?v=11.8.58",
  "./plan-title-fix.js?v=11.8.58",
  "./strength-test-feature.js?v=11.8.115",
  "./reset-feature.js?v=11.8.115",
  "./training-plan-quality-feature.js?v=11.8.70",
  "./exercise-images-feature.js?v=11.8.115",
  "./exercise-sprite-v11.8.115.webp?v=11.8.115",
  "./update-feature.js?v=11.8.115"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.all(ASSETS.map(asset=>cache.add(asset)));
  })());
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(event.request,{cache:"no-store"});
        if(fresh.ok){const cache=await caches.open(CACHE);await cache.put("./index.html",fresh.clone());}
        return fresh;
      }catch{return(await caches.match("./index.html"))||Response.error();}
    })());
    return;
  }
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(event.request,{cache:"no-store"});
      if(fresh.ok){const cache=await caches.open(CACHE);await cache.put(event.request,fresh.clone());}
      return fresh;
    }catch{return(await caches.match(event.request))||Response.error();}
  })());
});