(() => {
  const VERSION="11.8.132";

  const patchArmFocusDefinitions=()=>{
    const quality=window.RepPilotPlanQuality;
    const defs=quality?.definitions;
    if(!defs)return false;

    defs.push=[
      ["Schrägbankdrücken",3,60],
      ["Brustpresse",3,50],
      ["Schulterpresse",3,35],
      ["Überkopf-Trizepsstrecken am Kabelzug",3,20],
      ["Trizepsdrücken am Seilzug",3,25],
      ["Kabel-Flys",2,20],
      ["Seitheben Maschine",2,20],
      ["Crunch-Maschine",2,30]
    ];

    defs["pull-legs"]=[
      ["Hack Squat",2,60],
      ["Brustgestütztes Rudern",3,50],
      ["Beinstrecker",2,40],
      ["Latzug neutral",3,55],
      ["Schrägbank-Curls",3,12],
      ["Scott-Curls",3,20],
      ["Beinbeuger",2,40],
      ["Reverse Butterfly am Kabelzug",2,10],
      ["Wadenheben",2,60],
      ["Hängendes Beinheben",2,0]
    ];

    defs["personal-pull"]=[
      ["Brustgestütztes Rudern",3,50],
      ["Latzug neutral",3,55],
      ["Reverse Butterfly am Kabelzug",2,10],
      ["Schrägbank-Curls",3,12],
      ["Scott-Curls",3,20],
      ["Hammercurls",2,12],
      ["Hängendes Beinheben",2,0]
    ];

    defs["personal-legs"]=[
      ["Hack Squat",3,60],
      ["Bulgarian Split Squats",3,0],
      ["Beinbeuger",3,40],
      ["Beinstrecker",3,40],
      ["Abduktoren",2,30],
      ["Adduktoren",2,30],
      ["Wadenheben",3,60],
      ["Crunch-Maschine",2,30]
    ];

    defs["upper-hypertrophy"]=[
      ["Schrägbankdrücken leicht",3,50],
      ["Brustgestütztes Rudern",3,45],
      ["Latzug breit",2,50],
      ["Hammercurls",3,12],
      ["Einarmiger Trizeps am Kabelzug",3,10],
      ["Liegestütze bis Maximum",2,0],
      ["Seitheben",2,8],
      ["Crunch-Maschine",2,30]
    ];
    return true;
  };

  const refreshArmFocus=()=>{
    if(!patchArmFocusDefinitions())return false;
    try{window.RepPilotPlanQuality?.refresh?.();}catch(e){console.warn("Arm-Fokus konnte nicht angewendet werden",e);}
    try{
      const week=window.RepPilotTrainingPlan?.selectedWeek?.();
      if(Array.isArray(week)){
        const patch=(day,meta)=>{const row=week.find(x=>Number(x.day)===day);if(row)row.meta=meta;};
        patch(1,"Brust, Schulter, Trizeps-Fokus · ca. 50–60 Min.");
        patch(3,"Rücken, hintere Schulter, Bizeps-Fokus · ca. 50–60 Min.");
        patch(4,"Beine + Ski-Fokus · ca. 50–60 Min.");
        patch(0,"Oberkörper, Arme, Core · ca. 50–60 Min.");
      }
      if(typeof renderHome==="function")renderHome();
      window.RepPilotDayExercises?.refresh?.();
    }catch{}
    return true;
  };

  patchArmFocusDefinitions();

  const current=()=>document.documentElement?.dataset?.appVersion||VERSION;
  const check=async()=> {
    try {
      const r=await fetch("./version.json?ts="+Date.now(),{cache:"no-store"});
      if(!r.ok)return "";
      return String((await r.json())?.version||"");
    } catch { return ""; }
  };
  window.RepPilotUpdate={version:VERSION,current,check};
  window.RepPilotArmFocus={version:VERSION,refresh:refreshArmFocus};

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refreshArmFocus,{once:true});
  else refreshArmFocus();
})();