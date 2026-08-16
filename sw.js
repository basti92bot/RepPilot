const CACHE="reppilot-v11-8-52";
const VERSION="11.8.52";
const LOGO="./reppilot-logo-old-stable.png?v=11.8.27";
const APP_ICON="./reppilot-muscleman-logo-v11.8.26.png?v=11.8.52";
const APP_ICON_SVG="./reppilot-muscleman-v11.8.20.svg?v=11.8.52";
const ASSETS=[
  "./index.html","./styles.css?v=11.8.10","./header-fix.css?v=11.8.27",
  "./auth.js?v=11.8.8","./storage-bridge.js?v=11.8.8","./app.js?v=11.8.8","./workout-fix.js?v=11.8.8",
  "./run-feature.js?v=11.8.8","./run-dashboard-feature.js?v=11.8.34","./profile-feature.js?v=11.8.52","./apple-health-feature.js?v=11.8.35","./shortcut-health-feature.js?v=11.8.37",
  "./bodyweight-auto.js?v=11.8.8","./training-plan-feature.js?v=11.8.23","./home-workout-feature.js?v=11.8.24","./onboarding-feature.js?v=11.8.52","./progression-feature.js?v=11.8.33","./stretch-routine-feature.js?v=11.8.28",
  "./timer-sound-feature.js?v=11.8.52","./navigation-fix.js?v=11.8.52","./workout-sticky-actions.js?v=11.8.52","./day-exercise-overview.js?v=11.8.52","./pushup-feature.js?v=11.8.52","./plan-title-fix.js?v=11.8.52","./strength-test-feature.js?v=11.8.52",
  "./reset-feature.js?v=11.8.52","./update-feature.js?v=11.8.32","./version.json","./manifest.json?v=11.8.52",
  "./stretch-images-v11.8.30.js?v=11.8.30","./stretch-lower-back-v11.8.29.svg?v=11.8.30","./stretch-upper-back-v11.8.29.svg?v=11.8.30",
  LOGO,APP_ICON,APP_ICON_SVG,"./stretch-anatomy-v11.7.2.png?v=11.8.30"
];

function upgradeHtml(text){
  let html=text
    .replace(/data-app-version="[^"]+"/,`data-app-version="${VERSION}"`)
    .replace(/RepPilot v\d+\.\d+\.\d+/g,`RepPilot v${VERSION}`)
    .replace(/<h1>RepPilot <span>v\d+\.\d+\.\d+<\/span><\/h1>/,`<h1>RepPilot <span>v${VERSION}</span></h1>`)
    .replace(/manifest\.json(?:\?v=[^"']+)?/g,`manifest.json?v=${VERSION}`)
    .replace(/profile-feature\.js\?v=[^"']+/g,`profile-feature.js?v=${VERSION}`);
  ["onboarding-feature","timer-sound-feature","navigation-fix","workout-sticky-actions","day-exercise-overview","pushup-feature","plan-title-fix","strength-test-feature","reset-feature"].forEach(name=>{
    html=html.replace(new RegExp(`${name}\\.js\\?v=[^\"']+`,`g`),`${name}.js?v=${VERSION}`);
  });
  const required=["shortcut-health-feature","onboarding-feature","timer-sound-feature","navigation-fix","workout-sticky-actions","day-exercise-overview","pushup-feature","plan-title-fix","strength-test-feature","reset-feature"];
  let inject="";
  required.forEach(name=>{if(!html.includes(`${name}.js`))inject+=`<script src="${name}.js?v=${VERSION}"></script>`;});
  if(inject)html=html.replace("</body>",`${inject}<script>(()=>{document.documentElement.dataset.appVersion='${VERSION}';const v=document.querySelector('header h1 span');if(v)v.textContent='v${VERSION}';document.title='RepPilot v${VERSION}'})()</script></body>`);
  return html;
}

async function htmlResponse(response){
  if(!response||!response.ok)return response;
  const text=await response.text();
  return new Response(upgradeHtml(text),{status:response.status,statusText:response.statusText,headers:response.headers});
}

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
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
        return await htmlResponse(fresh);
      }catch{
        const cached=await caches.match("./index.html");
        return cached?await htmlResponse(cached):Response.error();
      }
    })());
    return;
  }
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(event.request,{cache:"no-store"});
      if(fresh.ok){const cache=await caches.open(CACHE);await cache.put(event.request,fresh.clone());}
      return fresh;
    }catch{
      return(await caches.match(event.request))||Response.error();
    }
  })());
});