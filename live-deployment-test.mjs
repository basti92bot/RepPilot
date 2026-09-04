import fs from "node:fs";
import crypto from "node:crypto";

const BASE=process.env.REPPILOT_LIVE_URL||"https://basti92bot.github.io/RepPilot/";
const expected=JSON.parse(fs.readFileSync("version.json","utf8")).version;
const inventory={assets:[...JSON.parse(fs.readFileSync("exercise-image-manifest.json","utf8")).assets,...JSON.parse(fs.readFileSync("training-image-manifest.json","utf8")).assets]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sha=bytes=>crypto.createHash("sha256").update(bytes).digest("hex");

async function get(path){
  const url=new URL(path+(path.includes("?")?"&":"?")+"ci="+Date.now(),BASE);
  const response=await fetch(url,{cache:"no-store",redirect:"follow",signal:AbortSignal.timeout(30000)});
  const bytes=Buffer.from(await response.arrayBuffer());
  return {status:response.status,bytes,text:bytes.toString("utf8"),url:response.url,headers:Object.fromEntries(response.headers)};
}
async function verify(){
  const version=await get("version.json");
  if(version.status!==200||JSON.parse(version.text).version!==expected)throw new Error("Live-Version noch nicht "+expected);
  const failures=[];
  const check=(ok,label)=>{if(ok)console.log("PASS:",label);else failures.push(label);};
  const core=["battle-feature.js","training-images-feature.js","training-hub-feature.js","training-image-manifest.json","app.js","styles.css","update-feature.js","index.html","install.html","manifest.json","sw.js","exercise-images-feature.js","exercise-image-spec.json","exercise-image-manifest.json"];
  for(const path of core){
    const response=await get(path);
    check(response.status===200&&sha(response.bytes)===sha(fs.readFileSync(path)),"Live-Datei exakt aktuell: "+path);
  }
  for(const icon of ["icon-192.png","icon-512.png"]){
    const response=await get(icon);
    check(response.status===200&&/^image\/png/i.test(response.headers["content-type"]||"")&&sha(response.bytes)===sha(fs.readFileSync(icon)),"Live-App-Icon korrekt: "+icon);
  }
  let position=0;
  await Promise.all(Array.from({length:4},async()=>{
    while(position<inventory.assets.length){
      const asset=inventory.assets[position++];
      const response=await get(asset.file);
      const bytes=response.bytes;
      let width=0,height=0;
      if(bytes.length>=25&&bytes.toString("ascii",12,16)==="VP8L"){
        const bits=bytes.readUInt32LE(21);width=1+(bits&0x3fff);height=1+((bits>>>14)&0x3fff);
      }
      check(response.status===200&&/^image\/webp/i.test(response.headers["content-type"]||"")&&bytes.length===asset.bytes&&sha(bytes)===asset.sha256&&width===1254&&height===1254,"Live-Bild vollständig und nativ 1254×1254: "+asset.id);
    }
  }));
  if(inventory.assets.length!==58)failures.push("Erwartet: 58 aktive Bilddateien");
  if(failures.length)throw new Error(failures.join("; "));
}
let last="";
for(let attempt=1;attempt<=12;attempt++){
  try{await verify();console.log("Live-Deployment-Test bestanden: "+expected+", alle 58 Bilder mit exakter Prüfsumme.");process.exit(0);}
  catch(error){last=error.message;console.log("INFO: Live-Deployment Versuch "+attempt+"/12: "+last);}
  if(attempt<12)await sleep(10000);
}
console.error("FAIL: Live-Deployment nicht vollständig bestätigt - "+last);
process.exit(1);
