const CACHE="reppilot-v11-8-89-updatefix";
const VERSION="11.8.89";
const ASSETS=[
  "./index.html",
  "./styles.css?v=11.8.89",
  "./header-fix.css?v=11.8.89",
  "./manifest.json?v=11.8.89",
  "./reppilot-muscleman-logo-v11.8.26.png?v=11.8.89",
  "./reppilot-app-icon-v11.8.88.png",
  "./auth.js?v=11.8.8",
  "./storage-bridge.js?v=11.8.69",
  "./app.js?v=11.8.89",
  "./cloud-history-feature.js?v=11.8.64",
  "./workout-fix.js?v=11.8.70",
  "./run-feature.js?v=11.8.89",
  "./run-dashboard-feature.js?v=11.8.34",
  "./profile-feature.js?v=11.8.89",
  "./apple-health-feature.js?v=11.8.89",
  "./shortcut-health-feature.js?v=11.8.89",
  "./bodyweight-auto.js?v=11.8.58",
  "./training-plan-feature.js?v=11.8.89",
  "./home-plan-card-hide.js?v=11.8.89",
  "./personal-records-feature.js?v=11.8.71",
  "./home-workout-feature.js?v=11.8.58",
  "./training-hub-feature.js?v=11.8.89",
  "./onboarding-feature.js?v=11.8.58",
  "./progression-feature.js?v=11.8.58",
  "./stretch-routine-feature.js?v=11.8.28",
  "./timer-sound-feature.js?v=11.8.58",
  "./navigation-fix.js?v=11.8.58",
  "./workout-sticky-actions.js?v=11.8.89",
  "./day-exercise-overview.js?v=11.8.58",
  "./pushup-feature.js?v=11.8.58",
  "./plan-title-fix.js?v=11.8.58",
  "./strength-test-feature.js?v=11.8.89",
  "./reset-feature.js?v=11.8.89",
  "./training-plan-quality-feature.js?v=11.8.70",
  "./update-feature.js?v=11.8.89-updatefix"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(ASSETS.map(asset=>cache.add(asset)));
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