#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const root = __dirname;
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const spec = JSON.parse(read("exercise-image-spec.json"));
const manifest = JSON.parse(read("exercise-image-manifest.json"));
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const log = text => console.log("PASS:", text);

class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.dataset = {}; this.style = {}; this.textContent = ""; }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  replaceChildren(...children) { this.children.forEach(c => c.parent = null); this.children = []; children.forEach(c => this.appendChild(c)); }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); this.parent = null; }
  querySelector(selector) { return this.children.find(c => selector === "img" ? c.tagName === "img" : selector === ".exercise-title" && c.className === "exercise-title") || this.children.map(c => c.querySelector(selector)).find(Boolean) || null; }
  insertAdjacentElement(position, child) { assert.equal(position, "afterend"); const i = this.parent.children.indexOf(this); child.parent = this.parent; this.parent.children.splice(i + 1, 0, child); }
}
const callbacks = [], timers = [], observers = [];
const head = new Element("head"), body = new Element("body");
const byId = (node, id) => node.id === id ? node : node.children.map(c => byId(c, id)).find(Boolean);
const document = {readyState:"loading", head, body, createElement:tag => new Element(tag),
  getElementById:id => byId(head,id) || byId(body,id) || null,
  addEventListener:(event,callback) => callbacks.push(callback)};
const panel = body.appendChild(new Element("section")); panel.id = "setPanel";
const title = panel.appendChild(new Element("div")); title.className = "exercise-title";
const name = title.appendChild(new Element("h2")); name.id = "exerciseName";
const context = vm.createContext({window:{}, document, console, setTimeout:fn => timers.push(fn),
  MutationObserver:class {constructor(fn) {this.fn=fn; observers.push(this);} observe(target,options) {this.target=target; this.options=options;}}});
vm.runInContext("let active = null;", context);
vm.runInContext(read("training-plan-quality-feature.js"), context);
vm.runInContext(read("exercise-images-feature.js"), context);
const api = context.window.RepPilotExerciseImages;
assert.equal(api.version, spec.version);
assert.deepEqual(JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(api.map).map(([name,entry]) => [name,entry.id])))), spec.mappings);
const names = [...new Set(Object.values(context.window.RepPilotPlanQuality.definitions).flat().map(row=>row[0]))].sort();
assert.equal(names.length,44);
assert.deepEqual(names, Object.keys(spec.mappings).sort());
assert.equal(api.resolve("Bauch Rotation").id,"kneeling-torso-rotation-machine");
assert.equal(api.resolve("Wadenheben","home-b").id,"bodyweight-calf-raise");
assert.equal(api.resolve("Wadenheben","personal-legs").id,"machine-calf-raise");
assert.equal(api.resolve("Unbekannte Übung"),null);
for(const [a,b] of [["Diagonales Arm-Bein-Strecken","Diagonales Arm-Bein-Strecken im Vierfüßlerstand"],["Unterarmstütz","Seitstütz"],["Brustpresse","Kabel-Flys"],["Latzug breit","Latzug neutral"],["Seitheben","Seitheben Maschine"],["Seitheben Maschine","Seitheben am Kabelzug"],["Hammercurls","Scott-Curls"],["Scott-Curls","Schrägbank-Curls"],["Hüftheben","Hüftheben mit Beinwechsel"],["Hüftheben","Einbeiniges Hüftheben"]]) assert.notEqual(api.resolve(a).id,api.resolve(b).id);
const audit = api.audit();
assert.equal(audit.total,44); assert.equal(audit.mapped,44); assert.equal(audit.localFiles,43);
assert.equal(audit.missing.length,0); assert.equal(audit.missingContexts.length,0); assert.equal(audit.remoteUrls.length,0);
log("44 exakte Zuordnungen, kniende Rotation, Home-/Studio-Kontext und separate Übungsvarianten");

assert.equal(manifest.version,spec.version); assert.equal(manifest.assets.length,43);
const files = Array.from(api.assetFiles(),p=>p.replace(/^\.\//,"")).sort();
assert.deepEqual(files,manifest.assets.map(a=>a.file).sort());
const dir = "assets/exercises/v"+spec.version;
assert.deepEqual(fs.readdirSync(path.join(root,dir)).sort(),files.map(f=>path.basename(f)).sort());
const sw = read("sw.js");
const swFiles = JSON.parse(sw.match(/const EXERCISE_ASSET_FILES=(\[[\s\S]*?\]);/)[1]);
assert.deepEqual(swFiles.sort(),files.map(f=>path.basename(f)).sort());
for(const asset of manifest.assets) {
  const bytes=fs.readFileSync(path.join(root,asset.file));
  assert.equal(bytes.toString("ascii",0,4),"RIFF"); assert.equal(bytes.toString("ascii",8,12),"WEBP");
  // Native lossless VP8L header; no low-resolution thumbnail or resized source.
  assert.equal(bytes.toString("ascii",12,16),"VP8L"); assert.equal(bytes[20],0x2f);
  const bits=bytes.readUInt32LE(21), width=1+(bits&0x3fff), height=1+((bits>>>14)&0x3fff);
  assert.equal(width,1254); assert.equal(height,1254); assert.equal(bytes.length,asset.bytes);
  assert.equal(sha(bytes),asset.sha256); assert.match(asset.sourcePngSha256,/^[a-f0-9]{64}$/);
  assert.equal(asset.losslessPixelComparison,"0 differing pixels");
  assert.equal(asset.cropBottom,spec.cropBottom[asset.id]||0);
}
assert.equal(manifest.assets.filter(a=>a.origin==="original").length,19);
log("43 native 1254×1254-Dateien: verlustfreies Format, Prüfsummen und Offline-Dateiliste stimmen");

// Focused DOM simulation: real browser coverage remains in browser-e2e-test.mjs.
callbacks.at(-1)();
assert.equal(observers.length,1); assert.equal(observers[0].target,name);
const card=document.getElementById("repPilotExerciseImageCard");
const viewport=document.getElementById("repPilotExerciseImageViewport");
assert.equal(card.hidden,true);
const select=(exercise,id="push")=>{name.textContent=exercise;vm.runInContext("active = "+JSON.stringify({id}),context); observers[0].fn();return viewport.querySelector("img");};
let img=select("Brustpresse");
assert.equal(img.src,"./"+dir+"/chest-press.webp");
assert.equal(img.width,1254); assert.equal(img.height,1254); assert.equal(card.hidden,true);
img.onload(); assert.equal(card.hidden,false); assert.equal(viewport.style.aspectRatio,"1254 / 1057");
assert.equal(card.textContent,""); assert.equal(viewport.children.length,1); assert.equal(panel.children.filter(c=>c.id===card.id).length,1);
api.refresh(); assert.equal(viewport.querySelector("img"),img);
const stale=img;
img=select("Bauch Rotation"); assert.equal(viewport.dataset.cropBottom,"0");
stale.onload(); assert.equal(card.hidden,true);
img.onload(); assert.equal(card.hidden,false); stale.onerror(); assert.equal(card.hidden,false);
assert.equal(card.dataset.assetId,"kneeling-torso-rotation-machine");
img=select("Wadenheben","home-b"); assert.match(img.src,/bodyweight-calf-raise\.webp$/);
img=select("Wadenheben","personal-legs"); assert.match(img.src,/machine-calf-raise\.webp$/);
img.onerror(); assert.equal(card.hidden,true); assert.equal(viewport.children.length,0);
api.refresh(); assert.ok(viewport.querySelector("img"));
select("Nicht zugeordnet"); assert.equal(card.hidden,true); assert.equal(viewport.children.length,0);
log("Bildwechsel, Ladefehler, veraltete Callbacks, doppelte Überschriften und Beschriftungs-Ausschnitte geprüft");

(async()=>{
  const handlers={}, cached=new Map(); let fetches=0;
  const scope="https://example.test/RepPilot/";
  const key=value=>new URL(typeof value==="string"?value:value.url,scope).href.split("?")[0];
  const cache={add:async value=>cached.set(key(value),{ok:true,cached:true}),match:async value=>cached.get(key(value)),put:async(value,response)=>cached.set(key(value),response)};
  const swContext=vm.createContext({URL,Response,console,self:{registration:{scope},skipWaiting:()=>{},clients:{claim:async()=>{}},addEventListener:(event,fn)=>handlers[event]=fn},caches:{open:async()=>cache,keys:async()=>[],match:cache.match,delete:async()=>true},fetch:async()=>{fetches++;return {ok:true,clone:()=>({ok:true})};}});
  vm.runInContext(sw,swContext);
  let install; handlers.install({waitUntil:promise=>install=promise}); await install;
  assert.equal([...cached.keys()].filter(url=>url.includes("/assets/exercises/v"+spec.version+"/")).length,43);
  let response; handlers.fetch({request:{method:"GET",url:scope+files[0]},respondWith:promise=>response=promise});
  assert.equal((await response).cached,true); assert.equal(fetches,0);
  log("Service Worker speichert alle 43 Bilder und nutzt vorhandene Bilder ohne erneuten Download");
  console.log("Übungsbilder-Test bestanden.");
})().catch(error=>{console.error(error);process.exitCode=1;});
