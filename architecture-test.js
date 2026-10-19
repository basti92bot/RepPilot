#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const read=file=>fs.readFileSync(require("node:path").join(__dirname,file),"utf8");
const values=new Map();
let currentUser="test-user-A";
const storage={
  getItem:key=>values.get(key)??null,
  setItem:(key,value)=>values.set(key,String(value)),
  removeItem:key=>values.delete(key)
};
const window={
  repPilotSupabase:{auth:{getUser:async()=>({data:{user:{id:currentUser}},error:null})}}
};
const document={readyState:"loading",addEventListener(){}};
const context=vm.createContext({window,document,localStorage:storage,console,Date,Math,
  queueMicrotask:()=>{},setTimeout:()=>{}});
for(const file of ["training-plan-quality-feature.js","exercise-images-feature.js",
  "exercise-catalog.js","custom-plan-store.js"]){
  vm.runInContext(read(file),context,{filename:file});
}
const catalog=window.RepPilotExerciseCatalog;
const plans=window.RepPilotCustomPlans;
const names=[...new Set(Object.values(window.RepPilotPlanQuality.definitions).flat().map(row=>row[0]))];
assert.equal(catalog.list().length,47);
assert.equal(new Set(catalog.list().map(row=>row.id)).size,47);
assert.equal(catalog.audit().valid,true);
assert.deepEqual(names.filter(name=>!catalog.byName(name)),[]);
assert.equal(catalog.imageFor(catalog.byName("Hack Squat").id).src,"./assets/exercises/v11.8.134/hack-squat.svg");
assert.equal(catalog.imageFor(catalog.byName("Wadenheben").id,"home-a").assetId,"bodyweight-calf-raise");
assert.equal(catalog.imageFor(catalog.byName("Wadenheben").id,"personal-legs").assetId,"machine-calf-raise");
assert.ok(catalog.list({group:"legs"}).some(row=>row.name==="Hack Squat"));
assert.ok(catalog.list({search:"schrägbank"}).length>=2);

(async()=>{
  const squat=catalog.byName("Hack Squat").id;
  const draft={name:"Beine + Ski",sessions:[
    {title:"Donnerstag",weekday:4,exercises:[{exerciseId:squat,sets:3,reps:10,restSeconds:120,weightKg:60}]}
  ]};
  assert.equal((await plans.list()).length,0);
  const saved=await plans.save(draft);
  assert.equal(saved.schemaVersion,1);
  assert.equal((await plans.list()).length,1);
  assert.equal((await plans.get(saved.id)).name,"Beine + Ski");
  assert.deepEqual(Array.from(plans.toWorkout(saved,"session-1").exercises[0]),["Hack Squat",3,60]);
  assert.equal(plans.toWorkout(saved,"session-1").details[0].restSeconds,120);
  saved.name="Geändert";
  assert.equal((await plans.get(saved.id)).name,"Beine + Ski");
  const edit=await plans.save({...saved,name:"Neuer Name"});
  assert.equal(edit.id,saved.id);
  assert.equal((await plans.list()).length,1);
  currentUser="test-user-B";
  assert.equal((await plans.list()).length,0,"Pläne dürfen nicht zwischen Konten sichtbar sein");
  currentUser="test-user-A";
  await assert.rejects(()=>plans.save({...draft,sessions:[{...draft.sessions[0],exercises:[{exerciseId:"nicht-da",sets:3,reps:10}]}]}),/Unbekannte Übung/);
  assert.equal((await plans.list()).length,1,"Fehler dürfen keine Daten überschreiben");
  assert.equal(await plans.remove(saved.id),true);
  assert.equal((await plans.list()).length,0);
  values.set(plans.keyPrefix+currentUser,"{unvollständig");
  await assert.rejects(()=>plans.list(),/beschädigt/);
  await assert.rejects(()=>plans.save(draft),/beschädigt/);
  assert.equal(values.get(plans.keyPrefix+currentUser),"{unvollständig");
  console.log("PASS: Katalog 47/47, Bildzuordnungen, Planentwürfe, Konto-Trennung, Validierung und Datenintegrität");
})().catch(error=>{console.error(error);process.exitCode=1;});
