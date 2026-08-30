const CACHE="reppilot-v11-8-112";
const VERSION="11.8.112";
const ASSETS=[
  "./install.html",
  "./index.html",
  "./styles.css?v=11.8.112",
  "./header-fix.css?v=11.8.112",
  "./manifest.json?v=11.8.112",
  "./icon-192.png?v=11.8.112",
  "./icon-512.png?v=11.8.112",
  "./reppilot-muscleman-logo-v11.8.26.png?v=11.8.112",
  "./reppilot-logo-old-stable.png?v=11.8.27",
  "./auth.js?v=11.8.112",
  "./storage-bridge.js?v=11.8.69",
  "./app.js?v=11.8.112",
  "./cloud-history-feature.js?v=11.8.64",
  "./workout-fix.js?v=11.8.70",
  "./run-feature.js?v=11.8.112",
  "./run-dashboard-feature.js?v=11.8.34",
  "./history-simple-feature.js?v=11.8.112",
  "./profile-feature.js?v=11.8.112",
  "./app-tour-feature.js?v=11.8.112",
  "./apple-health-feature.js?v=11.8.112",
  "./shortcut-health-feature.js?v=11.8.112",
  "./bodyweight-auto.js?v=11.8.58",
  "./training-plan-feature.js?v=11.8.112",
  "./home-plan-card-hide.js?v=11.8.112",
  "./personal-records-feature.js?v=11.8.71",
  "./home-workout-feature.js?v=11.8.58",
  "./training-hub-feature.js?v=11.8.112",
  "./onboarding-feature.js?v=11.8.58",
  "./progression-feature.js?v=11.8.58",
  "./stretch-routine-feature.js?v=11.8.112",
  "./timer-sound-feature.js?v=11.8.58",
  "./navigation-fix.js?v=11.8.58",
  "./workout-sticky-actions.js?v=11.8.112",
  "./day-exercise-overview.js?v=11.8.58",
  "./pushup-feature.js?v=11.8.58",
  "./plan-title-fix.js?v=11.8.58",
  "./strength-test-feature.js?v=11.8.112",
  "./reset-feature.js?v=11.8.112",
  "./training-plan-quality-feature.js?v=11.8.70",
  "./update-feature.js?v=11.8.112"
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