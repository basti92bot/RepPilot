import { chromium } from "playwright";

const BASE = process.env.REPPILOT_BASE_URL || "http://127.0.0.1:4173";
const VERSION = "11.8.111";
const failures = [];
const pass = label => console.log("PASS:", label);
const fail = (label, detail="") => {
  failures.push(label);
  console.error("FAIL:", label + (detail ? " - " + detail : ""));
};
const check = (condition, label, detail="") => condition ? pass(label) : fail(label, detail);

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({
  viewport: {width:390,height:844},
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: "de-DE"
});

await context.addInitScript(() => {
  const session = {user:{id:"e2e-user",email:"e2e@reppilot.test",user_metadata:{reppilot_test:true}}};
  const makeChain = () => {
    let proxy;
    const target = {
      select(){return proxy}, eq(){return proxy}, neq(){return proxy}, gt(){return proxy}, gte(){return proxy},
      lt(){return proxy}, lte(){return proxy}, in(){return proxy}, is(){return proxy}, order(){return proxy},
      limit(){return proxy}, insert(){return proxy}, update(){return proxy}, upsert(){return proxy}, delete(){return proxy},
      maybeSingle(){return Promise.resolve({data:null,error:null})},
      single(){return Promise.resolve({data:{id:"e2e-row"},error:null})},
      then(resolve,reject){return Promise.resolve({data:[],error:null}).then(resolve,reject)}
    };
    proxy = new Proxy(target,{get(obj,prop){
      if(prop in obj)return obj[prop];
      if(prop==="catch")return undefined;
      return (..._args)=>proxy;
    }});
    return proxy;
  };
  window.supabase = {
    createClient(){
      return {
        auth:{
          getSession:async()=>({data:{session}}),
          getUser:async()=>({data:{user:session.user}}),
          onAuthStateChange(cb){setTimeout(()=>cb("SIGNED_IN",session),0);return{data:{subscription:{unsubscribe(){}}}};},
          signOut:async()=>({error:null}),
          verifyOtp:async()=>({data:{session},error:null}),
          signInWithPassword:async()=>({data:{session},error:null}),
          signUp:async()=>({data:{session},error:null})
        },
        from(){return makeChain();}
      };
    }
  };
});

const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];
const local404s = [];
page.on("pageerror", err => pageErrors.push(err.message));
page.on("console", msg => { if(msg.type()==="error") consoleErrors.push(msg.text()); });
page.on("response", res => {
  if(res.url().startsWith(BASE) && res.status() >= 400) local404s.push(res.status()+" "+res.url());
});
page.on("dialog", d => d.accept());

await page.route("https://cdn.jsdelivr.net/**", route => route.fulfill({
  status:200, contentType:"application/javascript", body:"/* Supabase stubbed by E2E init script */"
}));
await page.route("https://tpuufwcywwhrggfptzpi.supabase.co/**", route => route.fulfill({
  status:200, contentType:"application/json", body:'{"data":[]}'
}));

async function activeView(){
  return page.locator(".view.active").getAttribute("id");
}

try {
  // Install page basics
  await page.goto(BASE+"/install.html",{waitUntil:"domcontentloaded"});
  check(await page.locator("text=RepPilot als App installieren").count()===1,"Install-Seite sichtbar");
  check(await page.locator(".auth-overlay").count()===0,"Install-Seite ohne Login-Overlay");
  check((await page.locator('link[rel="manifest"]').getAttribute("href")||"").includes("manifest.json"),"Install-Seite bindet Manifest ein");

  // Main app
  await page.goto(BASE+"/",{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>document.querySelectorAll("nav button").length===4,{timeout:10000});
  await page.waitForTimeout(250);

  check((await page.locator("html").getAttribute("data-app-version"))===VERSION,"Runtime-Version ist "+VERSION);
  check(await page.locator(".auth-overlay[hidden]").count()===1,"Test-Session blendet Login aus");

  await page.waitForSelector("#rpOnboarding:not([hidden])",{timeout:10000});
  check(await page.locator("#rpOnboarding").isVisible(),"Erst-Onboarding erscheint für neuen Account");
  await page.locator("#rpOnboardingHeight").fill("183");
  await page.locator("#rpOnboardingWeight").fill("90");
  await page.locator('[data-rp-sex="male"]').click();
  await page.locator('[data-rp-level="advanced"]').click();
  await page.locator('[data-rp-focus="mixed"]').click();
  await page.locator('[data-rp-frequency="3"]').click();
  await page.locator('[data-rp-day="1"]').click();
  await page.locator('[data-rp-day="3"]').click();
  await page.locator('[data-rp-day="5"]').click();
  await page.locator("#rpOnboardingSave").click();
  await page.locator("#rpOnboarding").waitFor({state:"hidden",timeout:10000});
  check(!(await page.locator("#rpOnboarding").isVisible()),"Onboarding lässt sich vollständig abschließen");
  const onboardingState=await page.evaluate(()=>({
    profile:JSON.parse(localStorage.getItem("reppilot-user-profile")||"{}"),
    plan:localStorage.getItem("reppilot-selected-training-plan")
  }));
  check(!!onboardingState.profile.onboardingCompletedAt,"Onboarding speichert Abschlusszeitpunkt");
  check(onboardingState.profile.trainingDaysPerWeek===3&&onboardingState.profile.trainingDays?.length===3,"Onboarding speichert Trainingshäufigkeit und Tage");
  check(onboardingState.plan==="personalized","Onboarding aktiviert personalisierten Plan");

  check(await page.locator("nav button").count()===4,"Vier Bottom-Navigation-Reiter vorhanden");

  const navLabels = await page.locator("nav button").allTextContents();
  check(["Heute","Training","Verlauf","Profil"].every(x=>navLabels.includes(x)),"Alle vier Navigationstitel vorhanden",navLabels.join(", "));

  for(const [label,view] of [["Heute","home"],["Training","trainingHub"],["Verlauf","history"],["Profil","profile"]]){
    await page.getByRole("button",{name:label,exact:true}).click();
    await page.waitForTimeout(50);
    check((await activeView())===view,"Navigation öffnet "+label,await activeView());
  }

  // Mobile layout / fixed nav / no horizontal overflow
  const layout = await page.evaluate(() => {
    const nav=document.querySelector("nav");
    const r=nav.getBoundingClientRect();
    const buttons=[...nav.querySelectorAll("button")].map(b=>b.getBoundingClientRect());
    return {
      innerWidth, innerHeight,
      scrollWidth:document.documentElement.scrollWidth,
      navBottom:Math.abs(innerHeight-r.bottom),
      navWidth:r.width,
      minButtonH:Math.min(...buttons.map(x=>x.height)),
      buttonsInside:buttons.every(x=>x.left>=-1&&x.right<=innerWidth+1)
    };
  });
  check(layout.scrollWidth<=layout.innerWidth+1,"Kein horizontaler Overflow auf 390px",JSON.stringify(layout));
  check(layout.navBottom<=2,"Bottom-Navigation sitzt am unteren Rand",JSON.stringify(layout));
  check(layout.buttonsInside,"Alle Bottom-Navigation-Buttons liegen im Viewport");
  check(layout.minButtonH>=40,"Bottom-Navigation hat brauchbare Touch-Ziele",String(layout.minButtonH));

  // Seed deterministic history
  const seed = [
    {
      id:"strength-1",title:"Oberkörper + Beine",startedAt:"2026-08-28T17:00:00Z",finishedAt:"2026-08-28T18:00:00Z",
      exercises:[
        {name:"Schrägbankdrücken",sets:[{weight:60,reps:10,done:true},{weight:60,reps:10,done:true},{weight:60,reps:10,done:true}]},
        {name:"Latzug breit",sets:[{weight:55,reps:10,done:true},{weight:55,reps:10,done:true},{weight:55,reps:10,done:true}]}
      ]
    },
    {
      id:"strength-2",title:"Push + Beine",startedAt:"2026-08-26T17:00:00Z",finishedAt:"2026-08-26T18:00:00Z",
      exercises:[{name:"Beinpresse",sets:[{weight:120,reps:10,done:true},{weight:120,reps:10,done:true}]}]
    },
    ...Array.from({length:8},(_,i)=>({
      id:"run-"+i,type:"run",title:"Lauftraining",
      startedAt:new Date(Date.UTC(2026,7,20+i,17,0,0)).toISOString(),
      finishedAt:new Date(Date.UTC(2026,7,20+i,17,35,0)).toISOString(),
      distanceKm:5+i*.15,
      durationSeconds:1800+i*20,
      paceSecondsPerKm:(1800+i*20)/(5+i*.15)
    })),
    {
      id:"bad-run",type:"run",title:"Fehlerlauf",startedAt:"2026-08-29T17:00:00Z",finishedAt:"2026-08-29T17:08:22Z",
      distanceKm:.051,durationSeconds:502,paceSecondsPerKm:9843
    }
  ];
  await page.evaluate(rows=>{
    localStorage.setItem("reppilot-history-v11",JSON.stringify(rows));
    if(typeof renderHistory==="function")renderHistory();
  },seed);

  await page.getByRole("button",{name:"Verlauf",exact:true}).click();
  await page.waitForTimeout(100);
  check(await page.locator('[data-history-simple-mode="strength"]').count()===1,"Kraft-Reiter vorhanden");
  check(await page.locator('[data-history-simple-mode="run"]').count()===1,"Laufen-Reiter vorhanden");

  // Strength history accordion level
  await page.locator('[data-history-simple-mode="strength"]').click();
  await page.waitForTimeout(50);
  check(await page.locator(".history-workout-dropdown").count()>=2,"Krafttrainings haben je ein Trainings-Dropdown");
  check(await page.locator(".history-exercise-dropdown").count()===0,"Keine zu tiefe Übungs-Dropdown-Ebene vorhanden");
  const firstDrop = page.locator(".history-workout-dropdown").first();
  check(!(await firstDrop.getAttribute("open")),"Kraft-Dropdown initial geschlossen");
  await firstDrop.locator("summary").click();
  check((await firstDrop.getAttribute("open"))!==null,"Kraft-Dropdown lässt sich öffnen");
  const exerciseText=(await firstDrop.locator(".history-workout-exercises").innerText()).replace(/\s+/g," ");
  check(exerciseText.includes("Schrägbankdrücken")&&exerciseText.includes("1.800 kg"),"Übungen zeigen jeweiliges Gesamtgewicht",exerciseText);
  check(!exerciseText.includes("Satz 1"),"Keine Satzdetails im Kraft-Dropdown");

  // Run chart and invalid outlier filtering
  await page.locator('[data-history-simple-mode="run"]').click();
  await page.waitForTimeout(50);
  check(await page.locator(".history-run-chart").count()===1,"Laufdiagramm wird gerendert");
  check(await page.locator(".history-run-bar").count()===8,"Diagramm zeigt 8 gültige Distanz-Balken");
  check(await page.locator(".history-run-line").count()===1,"Diagramm zeigt Pace-Linie");
  check((await page.locator(".history-run-chart-count").innerText()).includes("8 Läufe"),"Ungültiger Lauf wird aus Diagramm gefiltert");
  check(await page.locator(".history-simple-card").count()>=9,"Laufkarten bleiben unter Diagramm sichtbar");

  // Workout runtime and navigation while workout active
  await page.getByRole("button",{name:"Heute",exact:true}).click();
  const workoutStart = page.locator("[data-selected-workout],[data-workout]").first();
  check(await workoutStart.count()===1,"Mindestens ein Krafttraining ist im Wochenplan startbar");
  await workoutStart.click();
  check((await activeView())==="workout","Krafttraining startet");

  const strengthInline = page.locator("#strengthInlineTest");
  if (await strengthInline.isVisible().catch(()=>false)) {
    pass("Fällige Kraftmessung erscheint vor den Arbeitssätzen");
    check(await page.locator("#strengthInlineWeight").isVisible(),"Kraftmessung zeigt Testgewicht");
    check(await page.locator("#strengthInlineReps").isVisible(),"Kraftmessung zeigt Wiederholungen");
    await page.locator("#strengthInlineWeight").fill("70");
    await page.locator("#strengthInlineReps").fill("3");
    await page.waitForTimeout(30);
    const oneRm=await page.locator("#strengthInline1RM").innerText();
    const workWeight=await page.locator("#strengthInlineTraining").innerText();
    check(oneRm!=="–"&&oneRm.includes("kg"),"Kraftmessung berechnet e1RM",oneRm);
    check(workWeight!=="–"&&workWeight.includes("kg"),"Kraftmessung berechnet neues Arbeitsgewicht",workWeight);
    await page.locator("#strengthInlineSkip").click();
    await page.waitForTimeout(30);
    check(await page.locator("#setPanel").isVisible(),"Kraftmessung kann übersprungen werden");
  }

  check(await page.locator("#weightInput").isVisible(),"Gewichtseingabe nach Kraftmessung sichtbar");
  await page.locator("#weightInput").fill("61");
  await page.waitForTimeout(80);
  const completeProxy=page.locator('[data-proxy-for="completeSetBtn"]');
  const completeOriginal=page.locator("#completeSetBtn");
  const completeProxyVisible=await completeProxy.isVisible().catch(()=>false);
  const completeOriginalVisible=await completeOriginal.isVisible().catch(()=>false);
  const stickyState=await page.evaluate(()=>{
    const bar=document.getElementById("rpWorkoutActions");
    const original=document.getElementById("completeSetBtn");
    const proxy=document.querySelector('[data-proxy-for="completeSetBtn"]');
    const info=el=>el?({
      hidden:!!el.hidden,
      display:getComputedStyle(el).display,
      visibility:getComputedStyle(el).visibility,
      rect:{width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}
    }):null;
    return {bodyClass:document.body.className,bar:info(bar),original:info(original),proxy:info(proxy)};
  });
  check(completeProxyVisible||completeOriginalVisible,"Satzabschluss hat eine sichtbare Aktion",JSON.stringify(stickyState));
  if(completeProxyVisible) await completeProxy.click();
  else if(completeOriginalVisible) await completeOriginal.click();
  else await page.evaluate(()=>{ if(typeof completeSet==="function") completeSet(); });
  await page.waitForTimeout(50);
  check(await page.locator("#restPanel").isVisible(),"Pausenansicht nach Satz");

  const skipRestProxy=page.locator('[data-proxy-for="skipRestBtn"]');
  const skipRestOriginal=page.locator("#skipRestBtn");
  const skipProxyVisible=await skipRestProxy.isVisible().catch(()=>false);
  const skipOriginalVisible=await skipRestOriginal.isVisible().catch(()=>false);
  check(skipProxyVisible||skipOriginalVisible,"Pause hat eine sichtbare Überspringen-Aktion");
  if(skipProxyVisible) await skipRestProxy.click();
  else if(skipOriginalVisible) await skipRestOriginal.click();
  else await page.evaluate(()=>{ if(typeof finishRest==="function") finishRest(); });
  await page.waitForTimeout(50);
  check(await page.locator("#setPanel").isVisible(),"Pause überspringen kehrt zum Satz zurück");

  await page.getByRole("button",{name:"Verlauf",exact:true}).click();
  check((await activeView())==="history","Verlauf während aktivem Training erreichbar");
  check(await page.evaluate(()=>typeof active!=="undefined"&&!!active),"Aktives Training bleibt beim Verlauf erhalten");

  await page.getByRole("button",{name:"Training",exact:true}).click();
  check((await activeView())==="trainingHub","Training-Hub während aktivem Training erreichbar");
  check(await page.evaluate(()=>typeof active!=="undefined"&&!!active),"Aktives Training bleibt im Training-Hub erhalten");

  await page.getByRole("button",{name:"Profil",exact:true}).click();
  check((await activeView())==="profile","Profil während aktivem Training erreichbar");
  check(await page.evaluate(()=>typeof active!=="undefined"&&!!active),"Aktives Training bleibt im Profil erhalten");

  await page.getByRole("button",{name:"Heute",exact:true}).click();
  check((await activeView())==="workout","Heute setzt aktives Training fort");
  await page.locator("#cancelBtn").click();
  await page.waitForTimeout(50);
  check((await activeView())==="home","Training lässt sich sauber abbrechen");

  // Service worker and caches
  const swState = await page.evaluate(async()=>{
    if(!("serviceWorker" in navigator))return {supported:false};
    const reg=await navigator.serviceWorker.ready;
    const regs=await navigator.serviceWorker.getRegistrations();
    const keys=await caches.keys();
    const current=await caches.open("reppilot-v11-8-111");
    const requests=(await current.keys()).map(r=>r.url);
    return {supported:true,script:reg.active?.scriptURL||"",registrations:regs.length,keys,requests};
  });
  check(swState.supported,"Service Worker API verfügbar");
  check(swState.registrations===1,"Genau eine Service-Worker-Registrierung aktiv",JSON.stringify(swState));
  check(swState.script.includes("sw.js?v=11.8.111"),"Aktiver Service Worker hat aktuelle Version",swState.script);
  check(swState.keys.includes("reppilot-v11-8-111"),"Aktueller PWA-Cache vorhanden",swState.keys.join(","));
  check(swState.requests.some(x=>x.includes("icon-192.png?v=11.8.111")),"192er Icon im Runtime-Cache");
  check(swState.requests.some(x=>x.includes("icon-512.png?v=11.8.111")),"512er Icon im Runtime-Cache");

  // Manifest runtime fetch
  const manifestRuntime=await page.evaluate(async()=>{
    const r=await fetch("./manifest.json?v=11.8.111",{cache:"no-store"});
    return {status:r.status,json:await r.json()};
  });
  check(manifestRuntime.status===200,"Manifest wird zur Laufzeit ausgeliefert");
  check(manifestRuntime.json.id==="/RepPilot/","Manifest-ID zur Laufzeit stabil");
  check((manifestRuntime.json.icons||[]).some(x=>x.sizes==="192x192"),"Runtime-Manifest enthält 192er Icon");
  check((manifestRuntime.json.icons||[]).some(x=>x.sizes==="512x512"),"Runtime-Manifest enthält 512er Icon");

  // Offline reload from service worker
  await context.setOffline(true);
  await page.reload({waitUntil:"domcontentloaded",timeout:15000});
  await page.waitForFunction(()=>document.querySelectorAll("nav button").length===4,{timeout:10000});
  check(await page.locator("nav button").count()===4,"App startet offline mit Navigation");
  check((await page.locator("html").getAttribute("data-app-version"))===VERSION,"Offline-Reload liefert aktuelle App-Version");
  await page.getByRole("button",{name:"Verlauf",exact:true}).click();
  check((await activeView())==="history","Navigation funktioniert offline");
  await context.setOffline(false);

  // Cache cleanup on fresh SW activation
  await page.evaluate(async()=>{
    await caches.open("reppilot-old-test-cache");
    const regs=await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r=>r.unregister()));
    const reg=await navigator.serviceWorker.register("./sw.js?v=11.8.111&reinstall=1",{updateViaCache:"none"});
    const worker=reg.installing||reg.waiting||reg.active;
    if(worker&&worker.state!=="activated"){
      await Promise.race([
        new Promise(resolve=>worker.addEventListener("statechange",()=>{if(worker.state==="activated")resolve();})),
        new Promise((_,reject)=>setTimeout(()=>reject(new Error("Service Worker activation timeout")),8000))
      ]);
    }
  });
  const cacheKeysAfter=await page.evaluate(()=>caches.keys());
  check(!cacheKeysAfter.includes("reppilot-old-test-cache"),"Aktivierung löscht alte PWA-Caches",cacheKeysAfter.join(","));
  check(cacheKeysAfter.includes("reppilot-v11-8-111"),"Aktueller Cache bleibt nach Bereinigung erhalten");

  // General browser errors
  check(pageErrors.length===0,"Keine unbehandelten JavaScript-Fehler",pageErrors.join(" | "));
  check(local404s.length===0,"Keine lokalen 4xx/5xx Ressourcen",local404s.join(" | "));
  const unexpectedConsole=consoleErrors.filter(x=>!x.includes("Failed to load resource")&&!x.includes("Supabase Client"));
  check(unexpectedConsole.length===0,"Keine unerwarteten Console-Errors",unexpectedConsole.join(" | "));
} catch (error) {
  fail("E2E-Test konnte vollständig ausgeführt werden",error?.stack||String(error));
} finally {
  await browser.close();
}

console.log("\nBrowser E2E Summary");
console.log("Fehler:",failures.length);
if(failures.length)process.exit(1);
console.log("Browser-E2E bestanden.");
