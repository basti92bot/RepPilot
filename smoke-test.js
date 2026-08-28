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
  if (sizes.has("192x192")) {
    pass("Manifest enthaelt 192x192 Icon");
  } else {
    fail("Manifest enthaelt 192x192 Icon");
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
      if (d.width === 180 && d.height === 180) {
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

if (sw) {
  if (sw.includes("manifest.json") && sw.includes("apple-touch-icon.png") && sw.includes("reppilot-icon-192.png")) {
    pass("Service Worker cached Manifest und PWA-Icons");
  } else {
    fail("Service Worker cached Manifest und PWA-Icons");
  }
}

if (failures.length) {
  console.error("\nSmoke-Test fehlgeschlagen:", failures.length, "Fehler");
  process.exit(1);
}

console.log("\nSmoke-Test bestanden.");
