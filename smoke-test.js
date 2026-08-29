#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = __dirname;
const failures = [];
const pass = label => console.log("PASS:", label);
const fail = (label, detail) => {
  failures.push(label);
  console.error("FAIL:", label + (detail ? " - " + detail : ""));
};
const exists = rel => fs.existsSync(path.join(root, rel));
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");
const stripQuery = value => value.split("?")[0].replace(/^\.\//, "");
const pngDimensions = rel => {
  const buf = fs.readFileSync(path.join(root, rel));
  if (buf.length < 24 || buf[0] !== 0x89 || buf.toString("ascii", 1, 4) !== "PNG") {
    throw new Error("kein gueltiges PNG");
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};

let index = "";
let manifest = null;
let sw = "";
let styles = "";
let navFix = "";

try {
  index = read("index.html");
  pass("index.html vorhanden");
} catch (e) {
  fail("index.html vorhanden", e.message);
}

try {
  manifest = JSON.parse(read("manifest.json"));
  pass("manifest.json ist gueltiges JSON");
} catch (e) {
  fail("manifest.json ist gueltiges JSON", e.message);
}


try {
  styles = read("styles.css");
  pass("styles.css vorhanden");
} catch (e) {
  fail("styles.css vorhanden", e.message);
}

try {
  navFix = read("home-plan-card-hide.js");
  new Function(navFix);
  pass("home-plan-card-hide.js hat gueltige JavaScript-Syntax");
} catch (e) {
  fail("home-plan-card-hide.js hat gueltige JavaScript-Syntax", e.message);
}

try {
  sw = read("sw.js");
  new Function(sw);
  pass("sw.js hat gueltige JavaScript-Syntax");
} catch (e) {
  fail("sw.js hat gueltige JavaScript-Syntax", e.message);
}

if (manifest) {
  if (manifest.name && manifest.short_name && manifest.start_url && manifest.scope && manifest.display === "standalone") {
    pass("Manifest hat PWA-Pflichtfelder");
  } else {
    fail("Manifest hat PWA-Pflichtfelder");
  }

  const sizes = new Set((manifest.icons || []).map(i => i.sizes));
  if (sizes.has("128x128")) {
    pass("Manifest enthaelt stabiles 128x128 App-Icon");
  } else {
    fail("Manifest enthaelt stabiles 128x128 App-Icon");
  }

  for (const icon of manifest.icons || []) {
    const file = stripQuery(icon.src || "");
    if (file && exists(file)) pass("Icon vorhanden: " + file);
    else fail("Icon vorhanden: " + file);
  }
}

if (index) {
  if (/rel=["']manifest["'][^>]+href=["'][^"']*manifest\.json/i.test(index)) {
    pass("index.html bindet manifest.json ein");
  } else {
    fail("index.html bindet manifest.json ein");
  }

  const appleIcon = index.match(/rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i);
  if (appleIcon && exists(stripQuery(appleIcon[1]))) {
    pass("Apple-Touch-Icon vorhanden");
    try {
      const d = pngDimensions(stripQuery(appleIcon[1]));
      if (d.width >= 128 && d.height >= 128 && d.width === d.height) {
        pass("Apple-Touch-Icon hat brauchbare Abmessungen");
      } else {
        fail("Apple-Touch-Icon hat brauchbare Abmessungen", d.width + "x" + d.height);
      }
    } catch (e) {
      fail("Apple-Touch-Icon hat brauchbare Abmessungen", e.message);
    }
  } else {
    fail("Apple-Touch-Icon vorhanden");
  }

  if (/navigator\.serviceWorker\.register\(["']\.\/sw\.js\?v=[^"']+["']/.test(index)) {
    pass("Service Worker wird registriert");
  } else {
    fail("Service Worker wird registriert");
  }

  const inlineScripts = [...index.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).filter(Boolean);
  inlineScripts.forEach((code, i) => {
    try {
      new Function(code);
      pass("Inline-Script " + (i + 1) + " hat gueltige Syntax");
    } catch (e) {
      fail("Inline-Script " + (i + 1) + " hat gueltige Syntax", e.message);
    }
  });

  const localScripts = [...index.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)]
    .map(m => m[1])
    .filter(src => !/^https?:\/\//i.test(src));
  for (const src of localScripts) {
    const file = stripQuery(src);
    if (exists(file)) pass("Lokales Script vorhanden: " + file);
    else fail("Lokales Script vorhanden: " + file);
  }
}


if (styles) {
  if (/\.home-dashboard \.stat,#history \.stat\{[^}]*padding-left:60px/.test(styles) || /@media\(max-width:560px\)\{[\s\S]*?\.home-dashboard \.stat,#history \.stat\{[^}]*padding-left:60px/.test(styles)) {
    pass("KPI-Zahlen haben auf iPhone genug Platz");
  } else {
    fail("KPI-Zahlen haben auf iPhone genug Platz");
  }
  if (/\.home-dashboard \.stat strong,#history \.stat strong\{[^}]*white-space:nowrap[^}]*overflow-wrap:normal[^}]*font-variant-numeric:tabular-nums/.test(styles)) {
    pass("KPI-Zahlen bleiben einzeilig");
  } else {
    fail("KPI-Zahlen bleiben einzeilig");
  }
  if (/\.home-dashboard \.stat small,#history \.stat small\{[^}]*overflow-wrap:anywhere/.test(styles)) {
    pass("KPI-Beschriftungen duerfen umbrechen");
  } else {
    fail("KPI-Beschriftungen duerfen umbrechen");
  }
}

if (styles && navFix && index) {
  const navButtons = [...index.matchAll(/<nav[^>]*>([\s\S]*?)<\/nav>/gi)]
    .flatMap(m => [...m[1].matchAll(/<button\b/gi)]);

  if (navButtons.length === 4) {
    pass("Bottom-Navigation hat genau 4 Reiter");
  } else {
    fail("Bottom-Navigation hat genau 4 Reiter", String(navButtons.length));
  }

  if (/nav\{[^}]*position:fixed[^}]*bottom:0[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/.test(styles)) {
    pass("Bottom-Navigation ist fest unten und 4-spaltig");
  } else {
    fail("Bottom-Navigation ist fest unten und 4-spaltig");
  }

  if (/body>nav\{[\s\S]*?position:fixed!important;[\s\S]*?bottom:0!important;[\s\S]*?grid-template-columns:repeat\(4,minmax\(0,1fr\)\)!important;/.test(navFix)) {
    pass("iPhone-Nav-Fix erzwingt feste Bottom-Navigation");
  } else {
    fail("iPhone-Nav-Fix erzwingt feste Bottom-Navigation");
  }

  if (/body>nav\{[\s\S]*?max-height:calc\(64px \+ env\(safe-area-inset-bottom,0px\)\)!important;/.test(navFix)) {
    pass("Bottom-Navigation bleibt kompakt inkl. Safe-Area");
  } else {
    fail("Bottom-Navigation bleibt kompakt inkl. Safe-Area");
  }

  if (/html\{[^}]*overflow-x:hidden/.test(styles) || /body\{[^}]*overflow-x:hidden/.test(styles)) {
    fail("Root-Scrollcontainer darf fixed Navigation nicht beeinflussen", "overflow-x:hidden auf html/body gefunden");
  } else {
    pass("Root-Scrollcontainer beeinflusst fixed Navigation nicht");
  }

  if (/main\{[^}]*overflow-x:clip/.test(styles)) {
    pass("Horizontaler Overflow wird im Inhalt statt am Root begrenzt");
  } else {
    fail("Horizontaler Overflow wird im Inhalt statt am Root begrenzt");
  }
}

if (sw) {
  if (sw.includes("manifest.json") && sw.includes("reppilot-muscleman-logo-v11.8.26.png")) {
    pass("Service Worker cached Manifest und stabiles App-Icon");
  } else {
    fail("Service Worker cached Manifest und stabiles App-Icon");
  }
}

if (failures.length) {
  console.error("\nSmoke-Test fehlgeschlagen:", failures.length, "Fehler");
  process.exit(1);
}

console.log("\nSmoke-Test bestanden.");
