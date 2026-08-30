#!/usr/bin/env node
const fs=require("fs");
const path=require("path");

const root=__dirname;
const failures=[];
const warnings=[];
const pass=msg=>console.log("PASS:",msg);
const fail=(msg,detail)=>{failures.push(msg);console.error("FAIL:",msg+(detail?" - "+detail:""));};
const warn=(msg,detail)=>{warnings.push(msg);console.warn("WARN:",msg+(detail?" - "+detail:""));};
const read=rel=>fs.readFileSync(path.join(root,rel),"utf8");
const exists=rel=>fs.existsSync(path.join(root,rel));
const stripQuery=value=>String(value||"").split("?")[0].replace(/^https?:\/\/[^/]+/,"").replace(/^\/RepPilot\//,"").replace(/^\.\//,"").replace(/^\//,"");
const normAsset=value=>"./"+String(value||"").replace(/^https?:\/\/[^/]+/,"").replace(/^\/RepPilot\//,"").replace(/^\.\//,"").replace(/^\//,"");
const pngDimensions=rel=>{
  const buf=fs.readFileSync(path.join(root,rel));
  if(buf.length<24||buf[0]!==0x89||buf.toString("ascii",1,4)!=="PNG")throw new Error("kein gueltiges PNG");
  return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)};
};

const version=JSON.parse(read("version.json")).version;
const index=read("index.html");
const install=read("install.html");
const manifest=JSON.parse(read("manifest.json"));
const sw=read("sw.js");

try{new Function(sw);pass("Service Worker hat gueltige JavaScript-Syntax");}
catch(e){fail("Service Worker hat gueltige JavaScript-Syntax",e.message);}

const versionChecks=[
  ["index data-app-version",index.includes(`data-app-version="${version}"`)],
  ["index Titel",index.includes(`RepPilot v${version}`)],
  ["install data-app-version",install.includes(`data-app-version="${version}"`)],
  ["manifest start_url",String(manifest.start_url||"").includes(version)],
  ["Service Worker VERSION",sw.includes(`const VERSION="${version}"`)],
  ["Service Worker Cache",sw.includes(`const CACHE="reppilot-v${version.replace(/\./g,"-")}"`)],
  ["versionierter Service Worker in index",index.includes(`./sw.js?v=${version}`)],
  ["versionierter Service Worker in install",install.includes(`./sw.js?v=${version}`)]
];
for(const [name,ok] of versionChecks) ok?pass("Version konsistent: "+name):fail("Version konsistent: "+name);

if(manifest.name&&manifest.short_name&&manifest.start_url&&manifest.scope&&manifest.display==="standalone"){
  pass("Manifest hat Pflichtfelder");
}else fail("Manifest hat Pflichtfelder");

if(String(manifest.start_url||"").startsWith(String(manifest.scope||""))){
  pass("Manifest start_url liegt im Scope");
}else fail("Manifest start_url liegt im Scope");

if(/[?&](?:app|id)=.*v\d/i.test(String(manifest.id||""))||/v\d+[.-]\d+/i.test(String(manifest.id||""))){
  warn("Manifest-ID ist versionsgebunden",String(manifest.id));
}else{
  pass("Manifest-ID ist stabil");
}

const icons=manifest.icons||[];
const iconSizes=new Set(icons.flatMap(icon=>String(icon.sizes||"").split(/\s+/)));
for(const size of ["192x192","512x512"]){
  if(iconSizes.has(size))pass("Manifest enthaelt "+size+" Icon");
  else fail("Manifest enthaelt "+size+" Icon");
}
for(const icon of icons){
  const file=stripQuery(icon.src);
  if(!file||!exists(file)){fail("Manifest-Icon existiert",file||icon.src);continue;}
  try{
    const d=pngDimensions(file);
    const declared=String(icon.sizes||"").match(/^(\d+)x(\d+)$/);
    if(declared&&(+declared[1]!==d.width||+declared[2]!==d.height)){
      fail("Manifest-Icon Abmessung stimmt",`${file}: deklariert ${icon.sizes}, Datei ${d.width}x${d.height}`);
    }else pass("Manifest-Icon Abmessung stimmt: "+file);
  }catch(e){fail("Manifest-Icon ist gueltiges PNG",e.message);}
}

const apple=index.match(/rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i);
if(!apple){fail("Apple-Touch-Icon ist eingebunden");}
else{
  const file=stripQuery(apple[1]);
  if(!exists(file))fail("Apple-Touch-Icon existiert",file);
  else{
    const d=pngDimensions(file);
    if(d.width>=180&&d.height>=180&&d.width===d.height)pass("Apple-Touch-Icon ist mindestens 180x180");
    else fail("Apple-Touch-Icon ist mindestens 180x180",`${d.width}x${d.height}`);
  }
}

const swAssetsMatch=sw.match(/const ASSETS=\[([\s\S]*?)\];/);
const swAssets=swAssetsMatch?[...swAssetsMatch[1].matchAll(/["']([^"']+)["']/g)].map(m=>m[1]):[];
if(swAssets.length)pass("Service Worker hat explizite Asset-Liste");
else fail("Service Worker hat explizite Asset-Liste");

for(const asset of swAssets){
  const file=stripQuery(asset);
  if(file&&exists(file))pass("Cache-Asset existiert: "+file);
  else fail("Cache-Asset existiert",asset);
}

const localIndexAssets=[];
for(const m of index.matchAll(/<(?:script|link|img)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)){
  const src=m[1];
  if(/^https?:\/\//i.test(src)||/^data:/i.test(src)||/^#/.test(src))continue;
  localIndexAssets.push(src);
}
const cacheSet=new Set(swAssets.map(normAsset));
for(const asset of localIndexAssets){
  const file=stripQuery(asset);
  if(!file||!exists(file))continue;
  const normalized=normAsset(asset);
  if(cacheSet.has(normalized))pass("Index-Asset exakt im PWA-Cache: "+asset);
  else fail("Index-Asset exakt im PWA-Cache",asset);
}

const externalJsFiles=[...index.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)]
  .map(m=>m[1]).filter(src=>!/^https?:\/\//i.test(src)).map(stripQuery);
let externalSwRegistrations=0;
for(const file of externalJsFiles){
  if(!exists(file))continue;
  externalSwRegistrations+=(read(file).match(/serviceWorker\.register/g)||[]).length;
}
if(externalSwRegistrations===0)pass("Keine zweite Service-Worker-Registrierung in externen Scripts");
else fail("Keine zweite Service-Worker-Registrierung in externen Scripts","gefunden: "+externalSwRegistrations);

if(sw.includes('caches.match("./index.html")'))pass("Offline-Navigation hat index.html Fallback");
else fail("Offline-Navigation hat index.html Fallback");

if(sw.includes("keys.filter(key=>key!==CACHE)")&&sw.includes("caches.delete(key)"))pass("Alte App-Caches werden geloescht");
else fail("Alte App-Caches werden geloescht");

if(sw.includes("Promise.allSettled(ASSETS.map(asset=>cache.add(asset)))")){
  warn("Service Worker kann trotz fehlender Cache-Dateien aktivieren","Promise.allSettled");
}else if(sw.includes("Promise.all(ASSETS.map(asset=>cache.add(asset)))")){
  pass("Service-Worker-Install bricht bei fehlendem Asset ab");
}else{
  warn("Cache-Installationsstrategie konnte nicht eindeutig erkannt werden");
}

const localJs=[...new Set([...externalJsFiles,"sw.js"])];
for(const file of localJs){
  try{new Function(read(file));pass("JavaScript Syntax: "+file);}
  catch(e){fail("JavaScript Syntax: "+file,e.message);}
}

console.log("\nPWA Reliability Summary");
console.log("Version:",version);
console.log("Fehler:",failures.length,"Warnungen:",warnings.length);
if(warnings.length)console.log("Warnungen:",warnings.join(" | "));
if(failures.length){
  console.error("PWA-Zuverlaessigkeitstest fehlgeschlagen.");
  process.exit(1);
}
console.log("PWA-Zuverlaessigkeitstest bestanden.");
