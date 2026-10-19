(() => {
  "use strict";
  const SCHEMA_VERSION=1;
  // Stable IDs are deliberately explicit. Do not derive persisted IDs from display names.
  // Append new exercises instead of renaming or recycling IDs.
  const DATA=[
  [
    "ex-abduktoren",
    "Abduktoren",
    "legs",
    "machine"
  ],
  [
    "ex-adduktoren",
    "Adduktoren",
    "legs",
    "machine"
  ],
  [
    "ex-beinbeuger",
    "Beinbeuger",
    "legs",
    "machine"
  ],
  [
    "ex-beinpresse",
    "Beinpresse",
    "legs",
    "machine"
  ],
  [
    "ex-beinstrecker",
    "Beinstrecker",
    "legs",
    "machine"
  ],
  [
    "ex-bulgarian-split-squats",
    "Bulgarian Split Squats",
    "legs",
    "bodyweight"
  ],
  [
    "ex-einbeiniges-huftheben",
    "Einbeiniges Hüftheben",
    "legs",
    "bodyweight"
  ],
  [
    "ex-hack-squat",
    "Hack Squat",
    "legs",
    "machine"
  ],
  [
    "ex-huftheben",
    "Hüftheben",
    "legs",
    "bodyweight"
  ],
  [
    "ex-huftheben-mit-beinwechsel",
    "Hüftheben mit Beinwechsel",
    "legs",
    "bodyweight"
  ],
  [
    "ex-kniebeugen",
    "Kniebeugen",
    "legs",
    "bodyweight"
  ],
  [
    "ex-ruckwarts-ausfallschritte",
    "Rückwärts-Ausfallschritte",
    "legs",
    "bodyweight"
  ],
  [
    "ex-stationare-ausfallschritte",
    "Stationäre Ausfallschritte",
    "legs",
    "bodyweight"
  ],
  [
    "ex-tempo-kniebeugen",
    "Tempo-Kniebeugen",
    "legs",
    "bodyweight"
  ],
  [
    "ex-wadenheben",
    "Wadenheben",
    "legs",
    "free_weights"
  ],
  [
    "ex-brustpresse",
    "Brustpresse",
    "chest",
    "machine"
  ],
  [
    "ex-enge-liegestutze",
    "Enge Liegestütze",
    "chest",
    "bodyweight"
  ],
  [
    "ex-kabel-flys",
    "Kabel-Flys",
    "chest",
    "cable"
  ],
  [
    "ex-liegestutze-bis-maximum",
    "Liegestütze bis Maximum",
    "chest",
    "bodyweight"
  ],
  [
    "ex-schragbankdrucken",
    "Schrägbankdrücken",
    "chest",
    "free_weights"
  ],
  [
    "ex-schragbankdrucken-leicht",
    "Schrägbankdrücken leicht",
    "chest",
    "free_weights"
  ],
  [
    "ex-brustgestutztes-rudern",
    "Brustgestütztes Rudern",
    "back",
    "free_weights"
  ],
  [
    "ex-diagonales-arm-bein-strecken-im-vierfusslerstand",
    "Diagonales Arm-Bein-Strecken im Vierfüßlerstand",
    "back",
    "bodyweight"
  ],
  [
    "ex-latzug-breit",
    "Latzug breit",
    "back",
    "machine"
  ],
  [
    "ex-latzug-neutral",
    "Latzug neutral",
    "back",
    "machine"
  ],
  [
    "ex-reverse-butterfly-am-kabelzug",
    "Reverse Butterfly am Kabelzug",
    "back",
    "cable"
  ],
  [
    "ex-ruckenstrecker-in-bauchlage",
    "Rückenstrecker in Bauchlage",
    "back",
    "bodyweight"
  ],
  [
    "ex-schneeengel-in-bauchlage",
    "Schneeengel in Bauchlage",
    "back",
    "bodyweight"
  ],
  [
    "ex-y-t-heben-in-bauchlage",
    "Y-T-Heben in Bauchlage",
    "back",
    "bodyweight"
  ],
  [
    "ex-schulter-liegestutze",
    "Schulter-Liegestütze",
    "shoulders",
    "bodyweight"
  ],
  [
    "ex-schulterpresse",
    "Schulterpresse",
    "shoulders",
    "machine"
  ],
  [
    "ex-seitheben",
    "Seitheben",
    "shoulders",
    "free_weights"
  ],
  [
    "ex-seitheben-am-kabelzug",
    "Seitheben am Kabelzug",
    "shoulders",
    "cable"
  ],
  [
    "ex-seitheben-maschine",
    "Seitheben Maschine",
    "shoulders",
    "machine"
  ],
  [
    "ex-einarmiger-trizeps-am-kabelzug",
    "Einarmiger Trizeps am Kabelzug",
    "arms",
    "cable"
  ],
  [
    "ex-hammercurls",
    "Hammercurls",
    "arms",
    "free_weights"
  ],
  [
    "ex-schragbank-curls",
    "Schrägbank-Curls",
    "arms",
    "free_weights"
  ],
  [
    "ex-scott-curls",
    "Scott-Curls",
    "arms",
    "free_weights"
  ],
  [
    "ex-trizepsdrucken-am-seilzug",
    "Trizepsdrücken am Seilzug",
    "arms",
    "cable"
  ],
  [
    "ex-uberkopf-trizepsstrecken-am-kabelzug",
    "Überkopf-Trizepsstrecken am Kabelzug",
    "arms",
    "cable"
  ],
  [
    "ex-beinheben",
    "Beinheben",
    "core",
    "bodyweight"
  ],
  [
    "ex-bergsteiger",
    "Bergsteiger",
    "core",
    "bodyweight"
  ],
  [
    "ex-crunch-maschine",
    "Crunch-Maschine",
    "core",
    "machine"
  ],
  [
    "ex-diagonales-arm-bein-strecken",
    "Diagonales Arm-Bein-Strecken",
    "core",
    "bodyweight"
  ],
  [
    "ex-hangendes-beinheben",
    "Hängendes Beinheben",
    "core",
    "bodyweight"
  ],
  [
    "ex-seitstutz",
    "Seitstütz",
    "core",
    "bodyweight"
  ],
  [
    "ex-unterarmstutz",
    "Unterarmstütz",
    "core",
    "bodyweight"
  ]
];
  const entries=Object.freeze(DATA.map(([id,name,group,equipment])=>Object.freeze({
    id,name,group,equipment,source:"built-in"
  })));
  const names=new Map(entries.map(exercise=>[exercise.name,exercise]));
  const ids=new Map(entries.map(exercise=>[exercise.id,exercise]));
  if(ids.size!==entries.length||names.size!==entries.length)throw new Error("RepPilot: duplicate exercise IDs or names");

  function list({group=null,equipment=null,search=""}={}){
    const term=String(search||"").trim().toLocaleLowerCase("de-DE");
    return entries.filter(exercise=>(!group||exercise.group===group)&&
      (!equipment||exercise.equipment===equipment)&&
      (!term||exercise.name.toLocaleLowerCase("de-DE").includes(term)));
  }

  function byId(id){return ids.get(String(id||""))||null;}
  function byName(name){return names.get(String(name||""))||null;}

  function imageFor(id,context=""){
    const item=byId(id);
    if(!item)return null;
    const images=window.RepPilotExerciseImages;
    const entry=images?.resolve?.(item.name,context);
    if(!entry)return null;
    return {src:images.assetUrl(entry),assetId:entry.id,width:entry.width,height:entry.height,cropBottom:entry.cropBottom};
  }

  function audit(){
    const definitions=window.RepPilotPlanQuality?.definitions||{};
    const used=[...new Set(Object.values(definitions).flat().map(row=>row[0]))];
    const missingNames=used.filter(name=>!byName(name));
    const missingImages=used.filter(name=>!window.RepPilotExerciseImages?.resolve?.(name));
    return {schemaVersion:SCHEMA_VERSION,total:entries.length,used:used.length,missingNames,missingImages,
      valid:missingNames.length===0&&missingImages.length===0};
  }

  window.RepPilotExerciseCatalog=Object.freeze({
    schemaVersion:SCHEMA_VERSION,groups:Object.freeze(["chest","back","shoulders","arms","legs","core"]),
    equipment:Object.freeze(["machine","cable","free_weights","bodyweight"]),
    list,byId,byName,imageFor,audit
  });
})();
