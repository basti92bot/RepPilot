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
const stripQuery = value => value.split("?")[0].replace(/^\/RepPilot\//, "").replace(/^\.\//, "").replace(/^\//, "");
const pngDimensions = rel => {
  const buf = fs.readFileSync(path.join(root, rel));
  if (buf.length < 24 || buf[0] !== 0x89 || buf.toString("ascii", 1, 4) !== "PNG") {
    throw new Error("kein gueltiges PNG");
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
};

let index = "";
let install = "";
let manifest = null;
let sw = "";
let styles = "";
let navFix = "";
let auth = "";
let tour = "";
let profileFeature = "";

try {
  index = read("index.html");
  pass("index.html vorhanden");
} catch (e) {
  fail("index.html vorhanden", e.message);
}

try {
  install = read("install.html");
  pass("install.html vorhanden");
} catch (e) {
  fail("install.html vorhanden", e.message);
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
  auth = read("auth.js");
  new Function(auth);
  pass("auth.js hat gueltige JavaScript-Syntax");
} catch (e) {
  fail("auth.js hat gueltige JavaScript-Syntax", e.message);
}

try {
  tour = read("app-tour-feature.js");
  new Function(tour);
  pass("app-tour-feature.js hat gueltige JavaScript-Syntax");
} catch (e) {
  fail("app-tour-feature.js hat gueltige JavaScript-Syntax", e.message);
}

try {
  profileFeature = read("profile-feature.js");
  new Function(profileFeature);
  pass("profile-feature.js hat gueltige JavaScript-Syntax");
} catch (e) {
  fail("profile-feature.js hat gueltige JavaScript-Syntax", e.message);
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
  if (sizes.has("192x192") && sizes.has("512x512")) {
    pass("Manifest enthaelt 192x192 und 512x512 App-Icons");
  } else {
    fail("Manifest enthaelt 192x192 und 512x512 App-Icons");
  }

  if (manifest.id === "/RepPilot/") {
    pass("Manifest nutzt stabile App-ID");
  } else {
    fail("Manifest nutzt stabile App-ID", manifest.id);
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
      if (d.width >= 180 && d.height >= 180 && d.width === d.height) {
        pass("Apple-Touch-Icon hat mindestens 180x180");
      } else {
        fail("Apple-Touch-Icon hat mindestens 180x180", d.width + "x" + d.height);
      }
    } catch (e) {
      fail("Apple-Touch-Icon hat mindestens 180x180", e.message);
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



if (install) {
  if (/rel=["']manifest["'][^>]+href=["'][^"']*manifest\.json/i.test(install)) {
    pass("Install-Seite bindet manifest.json ein");
  } else {
    fail("Install-Seite bindet manifest.json ein");
  }

  if (install.includes("RepPilot als App installieren") &&
      install.includes("Zum Home-Bildschirm") &&
      install.includes("Hinzufügen")) {
    pass("Install-Seite zeigt Home-Bildschirm-Anleitung");
  } else {
    fail("Install-Seite zeigt Home-Bildschirm-Anleitung");
  }

  if (!/auth\.js|onboarding-feature\.js|supabase-js/i.test(install)) {
    pass("Install-Seite laedt keine Login- oder App-Logik");
  } else {
    fail("Install-Seite laedt keine Login- oder App-Logik");
  }

  if (install.includes("Testzugang:") && install.includes("Kein Passwort nötig")) {
    pass("Install-Seite nennt den Testzugang");
  } else {
    fail("Install-Seite nennt den Testzugang");
  }

  if (/display-mode:\s*standalone/.test(install) &&
      /navigator\.standalone/.test(install) &&
      /location\.replace\(['"]\.\/\?launch=v11\.8\.110['"]\)/.test(install)) {
    pass("Installierte Install-Seite leitet zur RepPilot-App weiter");
  } else {
    fail("Installierte Install-Seite leitet zur RepPilot-App weiter");
  }

  if (/navigator\.serviceWorker\.register\(['"]\.\/sw\.js\?v=11\.8\.110['"]/.test(install)) {
    pass("Install-Seite registriert Service Worker");
  } else {
    fail("Install-Seite registriert Service Worker");
  }

  const installInlineScripts = [...install.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).filter(Boolean);
  installInlineScripts.forEach((code, i) => {
    try {
      new Function(code);
      pass("Install-Inline-Script " + (i + 1) + " hat gueltige Syntax");
    } catch (e) {
      fail("Install-Inline-Script " + (i + 1) + " hat gueltige Syntax", e.message);
    }
  });
}

if (auth) {
  if (auth.includes('mail.toLowerCase()==="test"') &&
      auth.includes("reppilot-test-login") &&
      auth.includes("verifyOtp") &&
      auth.includes('type:"magiclink"')) {
    pass("Passwortloser Testzugang ist verdrahtet");
  } else {
    fail("Passwortloser Testzugang ist verdrahtet");
  }

  if (auth.includes("Testzugang:") && auth.includes("Passwort leer lassen")) {
    pass("Login erklaert den Testzugang");
  } else {
    fail("Login erklaert den Testzugang");
  }

  if (/auth\.js\?v=11\.8\.110/.test(index) && /auth\.js\?v=11\.8\.110/.test(sw)) {
    pass("Aktuelle auth.js wird von App und Service Worker geladen");
  } else {
    fail("Aktuelle auth.js wird von App und Service Worker geladen");
  }
}

if (auth && index && sw) {
  const strength = read("strength-test-feature.js");
  try {
    new Function(strength);
    pass("strength-test-feature.js hat gueltige JavaScript-Syntax");
  } catch (e) {
    fail("strength-test-feature.js hat gueltige JavaScript-Syntax", e.message);
  }

  if (strength.includes('from("strength_measurements")') &&
      strength.includes("syncStrengthCloud") &&
      strength.includes("saveRecordCloud")) {
    pass("Kraftmessungen sind cloud-synchronisiert");
  } else {
    fail("Kraftmessungen sind cloud-synchronisiert");
  }

  if (strength.includes('CYCLE_EXERCISE="__strength_cycle__"') &&
      strength.includes('CYCLE_MODE="cycle"') &&
      strength.includes("cycleDue") &&
      strength.includes("markCycleComplete") &&
      strength.includes("__repPilotStrengthFinishInstalled")) {
    pass("Kraftmessung nutzt einen globalen 28-Tage-Zyklus");
  } else {
    fail("Kraftmessung nutzt einen globalen 28-Tage-Zyklus");
  }

  if (/strength-test-feature\.js\?v=11\.8\.110/.test(index) &&
      /strength-test-feature\.js\?v=11\.8\.110/.test(sw)) {
    pass("Aktuelle Kraftmessungslogik wird von App und Service Worker geladen");
  } else {
    fail("Aktuelle Kraftmessungslogik wird von App und Service Worker geladen");
  }
}

if (tour) {
  const menuTargets = ["home","trainingHub","history","profile"];
  if (menuTargets.every(view => tour.includes('data-view="' + view + '"'))) {
    pass("Erststart-Fuehrung deckt alle Hauptmenues ab");
  } else {
    fail("Erststart-Fuehrung deckt alle Hauptmenues ab");
  }

  if (tour.includes("display-mode: standalone") &&
      tour.includes("navigator.standalone") &&
      tour.includes("reppilot-app-tour-v1")) {
    pass("Erststart-Fuehrung startet nur einmal in der installierten App");
  } else {
    fail("Erststart-Fuehrung startet nur einmal in der installierten App");
  }

  if (tour.includes("App-Führung starten") && tour.includes("RepPilotAppTour")) {
    pass("App-Fuehrung kann im Profil erneut gestartet werden");
  } else {
    fail("App-Fuehrung kann im Profil erneut gestartet werden");
  }

  if (/app-tour-feature\.js\?v=11\.8\.110/.test(index) &&
      /app-tour-feature\.js\?v=11\.8\.110/.test(sw)) {
    pass("App-Fuehrung wird von App und Service Worker geladen");
  } else {
    fail("App-Fuehrung wird von App und Service Worker geladen");
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

  const profileNavInjected = /btn\.dataset\.view="profile"/.test(profileFeature) && /nav\.appendChild\(btn\)/.test(profileFeature);
  if (navButtons.length === 3 && profileNavInjected) {
    pass("Bottom-Navigation hat effektiv genau 4 Reiter");
  } else {
    fail("Bottom-Navigation hat effektiv genau 4 Reiter", "Basis=" + navButtons.length + ", Profil=" + profileNavInjected);
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

try {
  const simpleHistory = read("history-simple-feature.js");
  new Function(simpleHistory);
  pass("Einfacher Verlauf hat gueltige JavaScript-Syntax");

  const simpleTabs = (simpleHistory.match(/data-history-simple-mode=/g) || []).length;
  const simpleSelects = (simpleHistory.match(/id="historySimpleSelect"/g) || []).length;
  if (simpleTabs === 2 && simpleSelects === 0) {
    pass("Verlauf nutzt Kraft/Laufen ohne Dropdown");
  } else {
    fail("Verlauf nutzt Kraft/Laufen ohne Dropdown", "Reiter=" + simpleTabs + ", Dropdown=" + simpleSelects);
  }

  if (simpleHistory.includes("history-run-chart") &&
      simpleHistory.includes("history-run-bar") &&
      simpleHistory.includes("history-run-line") &&
      simpleHistory.includes("slice(0,8).reverse()") &&
      simpleHistory.includes("validChartRun")) {
    pass("Lauf-Verlauf zeigt Pace-Linie und Distanz-Balken");
  } else {
    fail("Lauf-Verlauf zeigt Pace-Linie und Distanz-Balken");
  }

  if (simpleHistory.includes('class="history-workout-dropdown"') &&
      simpleHistory.includes("history-workout-dropdown-title") &&
      simpleHistory.includes("history-workout-exercises") &&
      simpleHistory.includes("<span>Übungen</span>") &&
      !simpleHistory.includes("history-exercise-set") &&
      !simpleHistory.includes("Satz ${index+1}")) {
    pass("Kraft-Verlauf hat genau ein Uebungs-Dropdown pro Training");
  } else {
    fail("Kraft-Verlauf hat genau ein Uebungs-Dropdown pro Training");
  }

  if (index.includes('history-simple-feature.js?v=11.8.110') &&
      sw.includes('history-simple-feature.js?v=11.8.110')) {
    pass("PWA laedt den einfachen Verlauf");
  } else {
    fail("PWA laedt den einfachen Verlauf");
  }
} catch (e) {
  fail("Einfacher Verlauf hat gueltige JavaScript-Syntax", e.message);
}

if (sw) {
  if (sw.includes("manifest.json") && sw.includes("icon-192.png?v=11.8.110") && sw.includes("icon-512.png?v=11.8.110")) {
    pass("Service Worker cached Manifest und beide PWA-Icons");
  } else {
    fail("Service Worker cached Manifest und beide PWA-Icons");
  }
}

if (failures.length) {
  console.error("\nSmoke-Test fehlgeschlagen:", failures.length, "Fehler");
  process.exit(1);
}

console.log("\nSmoke-Test bestanden.");
