import fs from "node:fs";

const BASE=process.env.REPPILOT_LIVE_URL||"https://basti92bot.github.io/RepPilot/";
const expected=JSON.parse(fs.readFileSync("version.json","utf8")).version;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function get(path){
  const url=new URL(path+(path.includes("?")?"&":"?")+"ci="+Date.now(),BASE);
  const r=await fetch(url,{cache:"no-store",redirect:"follow"});
  return {status:r.status,text:await r.text(),url:r.url,headers:Object.fromEntries(r.headers)};
}

async function getBytes(path){
  const url=new URL(path+(path.includes("?")?"&":"?")+"ci="+Date.now(),BASE);
  const r=await fetch(url,{cache:"no-store",redirect:"follow"});
  const bytes=new Uint8Array(await r.arrayBuffer());
  return {status:r.status,size:bytes.byteLength,url:r.url,headers:Object.fromEntries(r.headers)};
}

let last="";
for(let attempt=1;attempt<=12;attempt++){
  try{
    const version=await get("version.json");
    if(version.status===200){
      const json=JSON.parse(version.text);
      if(json.version===expected){
        console.log("PASS: Live version.json liefert",expected);
        const [index,manifestRes,sw,icon192,icon512,exerciseFeature,oldSprite114,oldSprite116,oldAssetSprite]=await Promise.all([
          get("index.html"),get("manifest.json"),get("sw.js"),get("icon-192.png"),get("icon-512.png"),
          get("exercise-images-feature.js"),get("exercise-sprite-v11.8.114.webp"),
          get("exercise-sprite-v11.8.116.webp"),get("assets/exercises/exercise-sprite-v11.8.116.webp")
        ]);
        const manifest=JSON.parse(manifestRes.text);
        const failures=[];
        const check=(ok,label,detail="")=>ok?console.log("PASS:",label):failures.push(label+(detail?" - "+detail:""));
        const swAssetMatch=sw.text.match(/const EXERCISE_ASSET_FILES=(\[[\s\S]*?\]);/);
        const exerciseFiles=swAssetMatch?JSON.parse(swAssetMatch[1]):[];
        const exerciseAssets=await Promise.all(exerciseFiles.map(file=>getBytes("assets/exercises/v11.8.119/"+file)));
        check(index.status===200,"Live index.html erreichbar",String(index.status));
        check(index.text.includes(`data-app-version="${expected}"`),"Live index.html hat aktuelle Version");
        check(manifestRes.status===200,"Live manifest.json erreichbar",String(manifestRes.status));
        check(manifest.id==="/RepPilot/","Live Manifest-ID stabil",String(manifest.id));
        check(String(manifest.start_url||"").includes(expected),"Live Manifest start_url aktuell",String(manifest.start_url));
        check((manifest.icons||[]).some(x=>x.sizes==="192x192"),"Live Manifest hat 192x192 Icon");
        check((manifest.icons||[]).some(x=>x.sizes==="512x512"),"Live Manifest hat 512x512 Icon");
        check(sw.status===200,"Live Service Worker erreichbar",String(sw.status));
        check(sw.text.includes(`const VERSION="${expected}"`),"Live Service Worker hat aktuelle Version");
        check(sw.text.includes(`reppilot-v${expected.replace(/\./g,"-")}`),"Live Service Worker hat aktuellen Cache");
        check(icon192.status===200,"Live 192er Icon erreichbar",String(icon192.status));
        check(icon512.status===200,"Live 512er Icon erreichbar",String(icon512.status));
        check(/^image\/png/i.test(icon192.headers["content-type"]||""),"Live 192er Icon hat PNG Content-Type",icon192.headers["content-type"]||"");
        check(/^image\/png/i.test(icon512.headers["content-type"]||""),"Live 512er Icon hat PNG Content-Type",icon512.headers["content-type"]||"");
        check(exerciseFeature.status===200,"Live Übungsbild-Feature erreichbar",String(exerciseFeature.status));
        check(/const VERSION\s*=\s*"11\.8\.119"/.test(exerciseFeature.text),"Live Übungsbild-Feature hat aktuelle Version");
        check(/const BASE\s*=\s*"\.\/assets\/exercises\/v11\.8\.119\/"/.test(exerciseFeature.text) &&
          exerciseFeature.text.includes("img.width = 1024") && !/https?:\/\//.test(exerciseFeature.text),
          "Live Übungsbild-Feature nutzt lokale 1024px-Dateien");
        check([...exerciseFeature.text.matchAll(/^\s+"([^"]+)":\s*approved\(/gm)].length===44,
          "Live Übungsbild-Feature enthält alle 44 Zuordnungen");
        check(/"Reverse Butterfly am Kabelzug":\s*approved\("reverse-butterfly"\)/.test(exerciseFeature.text) &&
          !exerciseFeature.text.includes("repPilotExerciseImageLabel"),
          "Live ist Reverse Butterfly korrekt und ohne Doppelbenennung zugeordnet");
        check(exerciseFiles.length===28 && exerciseAssets.every(asset=>asset.status===200&&asset.size>1000&&/^image\/webp/i.test(asset.headers["content-type"]||"")),
          "Live sind alle 28 bestätigten Übungsmotive vollständig erreichbar",
          exerciseAssets.filter(asset=>asset.status!==200||asset.size<=1000).map(asset=>asset.status+" "+asset.url).join(", "));
        check(!exerciseFeature.text.includes("exercise-sprite") && oldSprite114.status===404 && oldSprite116.status===404 && oldAssetSprite.status===404,
          "Live werden keine alten Low-Res-Sprites mehr ausgeliefert",
          [oldSprite114,oldSprite116,oldAssetSprite].map(asset=>asset.status+" "+asset.url).join(", "));
        if(failures.length){
          console.error("Live-Deployment-Test fehlgeschlagen:\n"+failures.join("\n"));
          process.exit(1);
        }
        console.log("Live-Deployment-Test bestanden.");
        process.exit(0);
      }
      last=`Version live=${json.version}, erwartet=${expected}`;
    }else last=`HTTP ${version.status}`;
  }catch(e){last=e?.message||String(e);}
  console.log(`INFO: Live Deployment Versuch ${attempt}/12 noch nicht aktuell: ${last}`);
  if(attempt<12)await sleep(10000);
}
console.error("FAIL: GitHub Pages wurde nicht rechtzeitig aktuell - "+last);
process.exit(1);
