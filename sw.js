const CACHE="reppilot-v11-8-118";
const VERSION="11.8.118";
const EXERCISE_ASSET_FILES=[
  "bird-dog-peak.webp",
  "bird-dog-start.webp",
  "bodyweight-squat-peak.webp",
  "bodyweight-squat-start.webp",
  "cable-fly-peak.webp",
  "cable-fly-start.webp",
  "cable-lateral-raise-peak.webp",
  "cable-lateral-raise-start.webp",
  "cable-overhead-triceps.svg",
  "cable-reverse-fly.svg",
  "chest-press-machine-peak.webp",
  "chest-press-machine-start.webp",
  "chest-supported-db-row-peak.webp",
  "chest-supported-db-row-start.webp",
  "close-grip-push-ups-peak.webp",
  "close-grip-push-ups-start.webp",
  "dead-bug-peak.webp",
  "dead-bug-start.webp",
  "glute-bridge-peak.webp",
  "glute-bridge-start.webp",
  "hammer-curl-peak.webp",
  "hammer-curl-start.webp",
  "hanging-leg-raise-peak.webp",
  "hanging-leg-raise-start.webp",
  "incline-bench-press-peak.webp",
  "incline-bench-press-start.webp",
  "incline-db-curl-peak.webp",
  "incline-db-curl-start.webp",
  "lat-pulldown-peak.webp",
  "lat-pulldown-start.webp",
  "lateral-raise-peak.webp",
  "lateral-raise-start.webp",
  "leg-curl-peak.webp",
  "leg-curl-start.webp",
  "leg-extension-peak.webp",
  "leg-extension-start.webp",
  "leg-press-peak.webp",
  "leg-press-start.webp",
  "lying-leg-raise-peak.webp",
  "lying-leg-raise-start.webp",
  "machine-calf-raise-peak.webp",
  "machine-calf-raise-start.webp",
  "machine-seated-crunch-peak.webp",
  "machine-seated-crunch-start.webp",
  "machine-shoulder-press-peak.webp",
  "machine-shoulder-press-start.webp",
  "mountain-climbers-peak.webp",
  "mountain-climbers-start.webp",
  "pike-push-ups-peak.webp",
  "pike-push-ups-start.webp",
  "plank-main.webp",
  "plate-loaded-lateral-raise-peak.webp",
  "plate-loaded-lateral-raise-start.webp",
  "preacher-curl-peak.webp",
  "preacher-curl-start.webp",
  "prone-snow-angel.svg",
  "prone-y-t-raise.svg",
  "push-up-peak.webp",
  "push-up-start.webp",
  "reverse-lunge-peak.webp",
  "reverse-lunge-start.webp",
  "russian-twist-peak.webp",
  "russian-twist-start.webp",
  "side-plank-main.webp",
  "single-arm-tricep-pushdown-peak.webp",
  "single-arm-tricep-pushdown-start.webp",
  "single-leg-glute-bridge-peak.webp",
  "single-leg-glute-bridge-start.webp",
  "split-squat-peak.webp",
  "split-squat-start.webp",
  "superman-peak.webp",
  "superman-start.webp",
  "tricep-pushdown-peak.webp",
  "tricep-pushdown-start.webp",
  "v-bar-lat-pulldown-peak.webp",
  "v-bar-lat-pulldown-start.webp"
];
const EXERCISE_ASSETS=EXERCISE_ASSET_FILES.map(file=>"./assets/exercises/v11.8.118/"+file);
const ASSETS=[
  "./install.html",
  "./index.html",
  "./styles.css?v=11.8.118",
  "./header-fix.css?v=11.8.118",
  "./manifest.json?v=11.8.118",
  "./icon-192.png?v=11.8.118",
  "./icon-512.png?v=11.8.118",
  "./reppilot-muscleman-logo-v11.8.26.png?v=11.8.118",
  "./reppilot-logo-old-stable.png?v=11.8.27",
  "./auth.js?v=11.8.118",
  "./storage-bridge.js?v=11.8.69",
  "./app.js?v=11.8.118",
  "./cloud-history-feature.js?v=11.8.64",
  "./workout-fix.js?v=11.8.70",
  "./run-feature.js?v=11.8.118",
  "./run-dashboard-feature.js?v=11.8.34",
  "./history-simple-feature.js?v=11.8.118",
  "./profile-feature.js?v=11.8.118",
  "./app-tour-feature.js?v=11.8.118",
  "./apple-health-feature.js?v=11.8.118",
  "./shortcut-health-feature.js?v=11.8.118",
  "./bodyweight-auto.js?v=11.8.58",
  "./training-plan-feature.js?v=11.8.118",
  "./home-plan-card-hide.js?v=11.8.118",
  "./personal-records-feature.js?v=11.8.71",
  "./home-workout-feature.js?v=11.8.58",
  "./training-hub-feature.js?v=11.8.118",
  "./onboarding-feature.js?v=11.8.58",
  "./progression-feature.js?v=11.8.58",
  "./stretch-routine-feature.js?v=11.8.118",
  "./timer-sound-feature.js?v=11.8.58",
  "./navigation-fix.js?v=11.8.58",
  "./workout-sticky-actions.js?v=11.8.118",
  "./day-exercise-overview.js?v=11.8.58",
  "./pushup-feature.js?v=11.8.58",
  "./plan-title-fix.js?v=11.8.58",
  "./strength-test-feature.js?v=11.8.118",
  "./reset-feature.js?v=11.8.118",
  "./training-plan-quality-feature.js?v=11.8.70",
  "./exercise-images-feature.js?v=11.8.118",
  "./update-feature.js?v=11.8.118"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.all(ASSETS.map(asset=>cache.add(asset)));
    for(let start=0;start<EXERCISE_ASSETS.length;start+=12){
      await Promise.all(EXERCISE_ASSETS.slice(start,start+12).map(asset=>cache.add(asset)));
    }
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
