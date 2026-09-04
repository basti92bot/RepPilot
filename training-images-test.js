#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const root = __dirname;
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const elements = new Map(), callbacks = [];
const element = id => {
  if (!elements.has(id)) elements.set(id,{id,hidden:false,innerHTML:"",querySelectorAll:()=>[]});
  return elements.get(id);
};
const document = {
  readyState:"loading",
  getElementById:id => id.endsWith("Styles") ? elements.get(id)||null : element(id),
  createElement:tag => ({tagName:tag}),
  head:{appendChild:el=>elements.set(el.id,el)},
  addEventListener:(_event,fn)=>callbacks.push(fn),
  querySelector:()=>null,
  querySelectorAll:()=>[]
};
const ctx = vm.createContext({window:{},document,console,setTimeout:()=>{},requestAnimationFrame:()=>{}});
vm.runInContext(read("training-plan-quality-feature.js"),ctx);
ctx.WORKOUTS = Object.entries(ctx.window.RepPilotPlanQuality.definitions).map(([id,exercises])=>({id,exercises}));
vm.runInContext(read("exercise-images-feature.js"),ctx);
vm.runInContext(read("training-images-feature.js"),ctx);
vm.runInContext(read("training-hub-feature.js"),ctx);
callbacks.at(-1)();
const api=ctx.window.RepPilotTrainingImages,hub=ctx.window.RepPilotTrainingHub;
const inventory=JSON.parse(read("training-image-manifest.json"));
assert.equal(api.version,JSON.parse(read("version.json")).version);
assert.equal(inventory.version,api.version);
assert.equal(hub.runnerExercises.length,8);
assert.equal(hub.skiExercises.length,10);
const audit=api.audit();
assert.equal(audit.ready,true);
assert.equal(audit.total,60);
assert.equal(audit.mapped,60);
assert.equal(audit.localFiles,58);
assert.equal(audit.missing.length,0);
assert.equal(audit.remoteUrls.length,0);
for(const id of ["home-a","home-b","home-c","runner"]) assert.equal(audit.workouts[id].mapped,8);
assert.equal(audit.workouts.ski.mapped,10);
assert.equal(api.resolve("Wall Sit Finish").id,api.resolve("Wall Sit").id);
assert.equal(api.resolve("Rückwärts-Ausfallschritte").id,"reverse-lunge");
assert.notEqual(api.resolve("Einbeiniges Wadenheben").id,api.resolve("Wadenheben","home-b").id);
assert.notEqual(api.resolve("Seitstütz mit Füßen erhöht").id,api.resolve("Seitstütz").id);
assert.notEqual(api.resolve("Rückwärts-Ausfallschritt mit Kniehub").id,api.resolve("Rückwärts-Ausfallschritte").id);
assert.equal(api.resolve("Unbekannt"),null);
assert.equal(api.markup("Unbekannt"),"");
assert.equal((element("trainingHubCards").innerHTML.match(/class="repPilotTrainingImage"/g)||[]).length,24);
for(const [open,start,next,previous,rows] of [
  ["openRunnerStrength","startRunnerRoutine","runnerNext","runnerPrev",hub.runnerExercises],
  ["openSkiStrength","startSkiRoutine","skiNext","skiPrev",hub.skiExercises]
]) {
  element(open).onclick();
  let html=element("runnerStrengthSession").innerHTML;
  assert.equal((html.match(/class="repPilotTrainingImage"/g)||[]).length,rows.length);
  assert.ok(!/<h3>[^<]*\p{Extended_Pictographic}/u.test(html));
  element(start).onclick();
  rows.forEach((x,i)=>{
    html=element("runnerStrengthSession").innerHTML;
    assert.ok(html.includes('<h2>'+x.name+'</h2>'));
    assert.ok(html.includes('data-asset-id="'+api.resolve(x.name).id+'"'));
    assert.equal((html.match(/class="repPilotTrainingImage"/g)||[]).length,1);
    assert.ok(html.indexOf('<h2>'+x.name+'</h2>')<html.indexOf('class="repPilotTrainingImage"'));
    assert.ok(html.indexOf('class="repPilotTrainingImage"')<html.indexOf('class="runner-dose"'));
    assert.ok(!html.includes("runner-session-icon"));
    assert.ok(html.includes('loading="eager"'));
    if(i>0){element(previous).onclick();assert.ok(element("runnerStrengthSession").innerHTML.includes('<h2>'+rows[i-1].name+'</h2>'));element(next).onclick();}
    element(next).onclick();
  });
  assert.ok(element("runnerStrengthSession").innerHTML.includes("erledigt"));
}
assert.equal(inventory.assets.length,15);
assert.deepEqual(Array.from(api.assetFiles()).sort(),inventory.assets.map(a=>"./"+a.file).sort());
for(const asset of inventory.assets){
  const bytes=fs.readFileSync(path.join(root,asset.file));
  assert.equal(bytes.toString("ascii",12,16),"VP8L");
  const bits=bytes.readUInt32LE(21),width=1+(bits&0x3fff),height=1+((bits>>>14)&0x3fff);
  assert.equal(width,1254);assert.equal(height,1254);
  assert.equal(bytes.length,asset.bytes);
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),asset.sha256);
  assert.equal(asset.losslessPixelComparison,"0 differing pixels");
}
const sw=read("sw.js"),index=read("index.html");
for(const asset of inventory.assets)assert.ok(sw.includes(path.basename(asset.file)));
assert.ok(index.includes('training-images-feature.js?v='+api.version));
assert.ok(sw.includes('training-images-feature.js?v='+api.version));
assert.ok(index.indexOf('training-images-feature.js')<index.indexOf('training-hub-feature.js'));
console.log("PASS: 60 Übungsnamen, 58 Motive und sämtliche Home-, Läufer- und Ski-Ansichten vollständig abgedeckt");
console.log("PASS: Alle 18 Routine-Schritte mit Bild ohne Übungs-Icon, inklusive Vor/Zurück und Abschluss");
console.log("PASS: Alle 24 Home-Übungseinträge mit Bild in der Übersicht");
console.log("PASS: 15 neue native Einzelbilder, Prüfsummen, eindeutige Varianten und Offline-Einbindung");
