const CACHE="reppilot-v11-8-121";
const VERSION="11.8.121";
const EXERCISE_ASSET_FILES=[
  "abdominal-crunch-machine.webp",
  "bird-dog.webp",
  "bodyweight-calf-raise.webp",
  "bodyweight-squat.webp",
  "cable-chest-fly.webp",
  "cable-reverse-fly.webp",
  "chest-press.webp",
  "chest-supported-dumbbell-row.webp",
  "close-grip-pushup.webp",
  "dead-bug.webp",
  "dumbbell-lateral-raise.webp",
  "forearm-plank.webp",
  "glute-bridge.webp",
  "glute-bridge-march.webp",
  "hammer-curl.webp",
  "hanging-leg-raise.webp",
  "incline-dumbbell-curl.webp",
  "incline-dumbbell-press.webp",
  "kneeling-torso-rotation-machine.webp",
  "lateral-raise-machine.webp",
  "leg-curl.webp",
  "leg-extension.webp",
  "leg-press.webp",
  "machine-calf-raise.webp",
  "mountain-climber.webp",
  "neutral-grip-lat-pulldown.webp",
  "overhead-cable-triceps-extension.webp",
  "pike-pushup.webp",
  "preacher-curl.webp",
  "prone-back-extension.webp",
  "prone-snow-angel.webp",
  "prone-y-t-raise.webp",
  "pushup.webp",
  "reverse-lunge.webp",
  "rope-triceps-pushdown.webp",
  "shoulder-press-machine.webp",
  "side-plank.webp",
  "single-arm-cable-lateral-raise.webp",
  "single-arm-cross-body-triceps-extension.webp",
  "single-leg-glute-bridge.webp",
  "split-squat.webp",
  "supine-leg-raise.webp",
  "wide-lat-pulldown.webp"
];
const EXERCISE_ASSETS=EXERCISE_ASSET_FILES.map(file=>"./assets/exercises/v11.8.120/"+file);
const ASSETS=[
  "./install.html",
  "./index.html",
  "./styles.css?v=11.8.121",
  "./header-fix.css?v=11.8.121",
  "./manifest.json?v=11.8.121",
  "./icon-192.png?v=11.8.121",
  "./icon-512.png?v=11.8.121",
  "./reppilot-muscleman-logo-v11.8.26.png?v=11.8.121",
  "./reppilot-logo-old-stable.png?v=11.8.27",
  "./auth.js?v=11.8.121",
  "./storage-bridge.js?v=11.8.69",
  "./app.js?v=11.8.121",
  "./cloud-history-feature.js?v=11.8.64",
  "./workout-fix.js?v=11.8.70",
  "./run-feature.js?v=11.8.121",
  "./run-dashboard-feature.js?v=11.8.34",
  "./history-simple-feature.js?v=11.8.121",
  "./profile-feature.js?v=11.8.121",
  "./app-tour-feature.js?v=11.8.121",
  "./apple-health-feature.js?v=11.8.121",
  "./shortcut-health-feature.js?v=11.8.121",
  "./bodyweight-auto.js?v=11.8.58",
  "./training-plan-feature.js?v=11.8.121",
  "./home-plan-card-hide.js?v=11.8.121",
  "./personal-records-feature.js?v=11.8.71",
  "./home-workout-feature.js?v=11.8.58",
  "./training-hub-feature.js?v=11.8.121",
  "./onboarding-feature.js?v=11.8.58",
  "./progression-feature.js?v=11.8.58",
  "./stretch-routine-feature.js?v=11.8.121",
  "./timer-sound-feature.js?v=11.8.58",
  "./navigation-fix.js?v=11.8.58",
  "./workout-sticky-actions.js?v=11.8.121",
  "./day-exercise-overview.js?v=11.8.58",
  "./pushup-feature.js?v=11.8.58",
  "./plan-title-fix.js?v=11.8.58",
  "./strength-test-feature.js?v=11.8.121",
  "./reset-feature.js?v=11.8.121",
  "./training-plan-quality-feature.js?v=11.8.70",
  "./exercise-images-feature.js?v=11.8.121",
  "./update-feature.js?v=11.8.121"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.all(ASSETS.map(asset=>cache.add(asset)));
    for(let start=0;start<EXERCISE_ASSETS.length;start+=4){
      await Promise.all(EXERCISE_ASSETS.slice(start,start+4).map(asset=>cache.add(asset)));
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
  // Versioned image URLs are immutable; use their offline copy without re-downloading.
  if(event.request.url.startsWith(new URL("./assets/exercises/v11.8.120/",self.registration.scope).href)){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const cached=await cache.match(event.request,{ignoreSearch:true});
      if(cached)return cached;
      const fresh=await fetch(event.request);
      if(fresh.ok)await cache.put(event.request,fresh.clone());
      return fresh;
    })());
    return;
  }
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
