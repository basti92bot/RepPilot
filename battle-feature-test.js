#!/usr/bin/env node
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=__dirname;
const feature=fs.readFileSync(path.join(root,"battle-feature.js"),"utf8");
const strength=fs.readFileSync(path.join(root,"strength-test-feature.js"),"utf8");
const hub=fs.readFileSync(path.join(root,"training-hub-feature.js"),"utf8");
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
const sw=fs.readFileSync(path.join(root,"sw.js"),"utf8");
const sql=fs.readFileSync(path.join(root,"supabase/migrations/20260904_add_strength_battles.sql"),"utf8");

new Function(feature);
assert.ok(hub.includes("Kraft-Duell")&&hub.includes("openStrengthBattle"),"Duellkarte fehlt im Trainingsbereich");
assert.ok(index.includes("battle-feature.js?v=11.8.123"),"Duell-Feature fehlt in index.html");
assert.ok(sw.includes("battle-feature.js?v=11.8.123"),"Duell-Feature fehlt im Offline-Cache");
assert.ok(feature.includes('rpc("create_strength_battle"')&&feature.includes('rpc("accept_strength_battle"')&&feature.includes('rpc("submit_strength_battle_result"'),"Duell-RPCs fehlen");
assert.ok(feature.includes("relative_score")&&feature.includes("estimated_1rm"),"Beide Vergleichswerte müssen angezeigt werden");
assert.ok(feature.includes("requestBattleTest")&&strength.includes("BATTLE_TEST_KEY")&&strength.includes("requestBattleTest"),"Aktive Duelle müssen eine neue Kraftmessung außerhalb des 28-Tage-Zyklus vormerken");
assert.ok(!feature.includes("bodyweight_kg")&&!feature.includes("weight_kg"),"Körpergewicht darf nicht in der Duellansicht übertragen werden");
assert.ok(/alter table public\.strength_battles enable row level security/i.test(sql),"RLS für Duelle fehlt");
assert.ok(/alter table public\.strength_battle_results enable row level security/i.test(sql),"RLS für Ergebnisse fehlt");
assert.ok(/revoke all on function public\.create_strength_battle\(text, integer\) from public, anon/i.test(sql),"Privilegierte RPC muss für PUBLIC und anon gesperrt sein");
assert.ok(/auth\.uid\(\)/.test(sql)&&/set search_path = ''/.test(sql),"RPCs müssen Authentifizierung prüfen und search_path festsetzen");
assert.ok(!/bodyweight|weight_kg/.test(sql.match(/create table if not exists public\.strength_battle_results[\s\S]*?\);/i)?.[0]||""),"Ergebnistabelle darf kein Körpergewicht enthalten");
assert.ok(/measured_at >= coalesce\(v_battle\.accepted_at, v_battle\.created_at\)/.test(sql),"Nur Kraftmessungen nach Duellannahme dürfen zählen");
console.log("PASS: Kraft-Duell, Datenschutz, RLS und Ergebnisprüfung");
