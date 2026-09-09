(() => {
  const VERSION="11.8.126";

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
      ["Seitheben Maschine",3,20],
      ["Crunch-Maschine",3,30]
    ];

    defs["pull-legs"]=[
      ["Beinpresse",2,120],
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

    defs["upper-hypertrophy"]=[
      ["Schrägbankdrücken leicht",3,50],
      ["Brustgestütztes Rudern",3,45],
      ["Latzug breit",3,50],
      ["Hammercurls",3,12],
      ["Einarmiger Trizeps am Kabelzug",3,10],
      ["Liegestütze bis Maximum",2,0],
      ["Seitheben",3,8],
      ["Crunch-Maschine",2,30],
      ["Bauch Rotation",2,20]
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
        patch(3,"Rücken, Beine, Bizeps-Fokus · ca. 65–75 Min.");
        patch(5,"Oberkörper, Arme, Core · ca. 50–60 Min.");
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
