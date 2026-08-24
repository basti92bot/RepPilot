(() => {
  const VERSION="11.8.67";
  const PLAN_KEY="reppilot-selected-training-plan";

  const DEFINITIONS={
    push:[["Schrägbankdrücken",3,60],["Brustpresse",3,50],["Schulterpresse",3,35],["Kabel-Flys",2,20],["Seitheben Maschine",3,20],["Überkopf-Trizepsstrecken am Kabelzug",2,20],["Trizepsdrücken am Seilzug",2,25],["Crunch-Maschine",3,30]],
    "pull-legs":[["Beinpresse",3,120],["Brustgestütztes Rudern",3,50],["Rumänisches Kreuzheben",3,60],["Latzug neutral",3,55],["Beinbeuger",2,40],["Reverse Butterfly am Kabelzug",2,10],["Schrägbank-Curls",2,12],["Wadenheben",3,60],["Hängendes Beinheben",2,0]],
    "upper-hypertrophy":[["Schrägbankdrücken leicht",3,50],["Brustgestütztes Rudern",3,45],["Latzug breit",3,50],["Liegestütze bis Maximum",2,0],["Seitheben",3,8],["Reverse Butterfly am Kabelzug",2,10],["Hammercurls",2,12],["Einarmiger Trizeps am Kabelzug",2,10],["Crunch-Maschine",2,30]],
    "loss-a":[["Beinpresse",3,80],["Brustpresse",3,40],["Latzug neutral",3,45],["Rumänisches Kreuzheben",3,50],["Schulterpresse",2,25],["Schrägbank-Curls",2,10],["Trizepsdrücken am Seilzug",2,20],["Crunch-Maschine",2,25]],
    "loss-b":[["Schrägbankdrücken leicht",3,40],["Brustgestütztes Rudern",3,40],["Beinpresse",3,80],["Beinbeuger",3,35],["Seitheben",2,6],["Hammercurls",2,10],["Einarmiger Trizeps am Kabelzug",2,8],["Wadenheben",3,50],["Crunch-Maschine",2,25]],
    "personal-upper-a":[["Schrägbankdrücken",3,60],["Brustgestütztes Rudern",3,50],["Latzug neutral",3,55],["Schulterpresse",3,35],["Seitheben am Kabelzug",2,7.5],["Trizepsdrücken am Seilzug",2,25],["Schrägbank-Curls",2,12],["Crunch-Maschine",2,30]],
    "personal-lower-a":[["Beinpresse",3,120],["Rumänisches Kreuzheben",3,60],["Beinstrecker",2,40],["Beinbeuger",2,40],["Wadenheben",3,60],["Hängendes Beinheben",2,0]],
    "personal-upper-b":[["Brustpresse",3,50],["Latzug breit",3,50],["Brustgestütztes Rudern",3,45],["Kabel-Flys",2,20],["Seitheben",2,8],["Reverse Butterfly am Kabelzug",2,10],["Einarmiger Trizeps am Kabelzug",2,10],["Scott-Curls",2,20],["Crunch-Maschine",2,30]],
    "personal-lower-b":[["Rumänisches Kreuzheben",3,50],["Beinpresse",3,100],["Beinbeuger",3,35],["Beinstrecker",2,35],["Wadenheben",3,55],["Hängendes Beinheben",2,0]],
    "personal-pull":[["Brustgestütztes Rudern",3,50],["Latzug neutral",3,55],["Reverse Butterfly am Kabelzug",3,12],["Hammercurls",3,12],["Scott-Curls",2,20],["Hängendes Beinheben",2,0]],
    "personal-legs":[["Beinpresse",3,120],["Rumänisches Kreuzheben",3,60],["Beinbeuger",3,40],["Beinstrecker",3,40],["Wadenheben",3,60],["Crunch-Maschine",2,30]],
    "home-a":[["Kniebeugen",3,0],["Liegestütze bis Maximum",3,0],["Hüftheben",3,0],["Rückenstrecker in Bauchlage",3,0],["Rückwärts-Ausfallschritte",3,0],["Schulter-Liegestütze",2,0],["Diagonales Arm-Bein-Strecken",3,0],["Unterarmstütz",3,0]],
    "home-b":[["Stationäre Ausfallschritte",3,0],["Enge Liegestütze",3,0],["Einbeiniges Hüftheben",3,0],["Schneeengel in Bauchlage",3,0],["Wadenheben",3,0],["Diagonales Arm-Bein-Strecken im Vierfüßlerstand",3,0],["Seitstütz",2,0],["Beinheben",3,0]],
    "home-c":[["Tempo-Kniebeugen",3,0],["Liegestütze bis Maximum",3,0],["Hüftheben mit Beinwechsel",3,0],["Y-T-Heben in Bauchlage",3,0],["Rückwärts-Ausfallschritte",3,0],["Schulter-Liegestütze",2,0],["Bergsteiger",3,0],["Unterarmstütz",3,0]]
  };

  const TITLES={push:"Push","pull-legs":"Pull + Beine","upper-hypertrophy":"Oberkörper","loss-a":"Ganzkörper A","loss-b":"Ganzkörper B","personal-upper-a":"Oberkörper A","personal-lower-a":"Unterkörper A","personal-upper-b":"Oberkörper B","personal-lower-b":"Unterkörper B","personal-pull":"Pull","personal-legs":"Beine","home-a":"Home Workout A","home-b":"Home Workout B","home-c":"Home Workout C"};
  const clone=rows=>rows.map(row=>[...row]);

  function apply(){
    if(typeof WORKOUTS==="undefined"||!Array.isArray(WORKOUTS))return false;
    Object.entries(DEFINITIONS).forEach(([id,rows])=>{
      const workout=WORKOUTS.find(w=>w.id===id);
      if(!workout)return;
      workout.title=TITLES[id]||workout.title;
      workout.exercises=clone(rows);
    });
    try{if(typeof TIPS!=="undefined")TIPS["Seitheben Maschine"]="Ellenbogen führen, Schultern unten lassen und kontrolliert bis etwa Schulterhöhe heben.";}catch{}
    return true;
  }

  function isMusclePlan(){
    const raw=localStorage.getItem(PLAN_KEY);
    return !raw||["muscle","push","pull-legs","upper-hypertrophy"].includes(raw);
  }

  function alignManualMuscleWeek(){
    if(!isMusclePlan())return false;
    const week=window.RepPilotTrainingPlan?.selectedWeek?.();
    if(!Array.isArray(week))return false;
    const patch=(day,data)=>{const row=week.find(x=>Number(x.day)===day);if(row)Object.assign(row,data);};
    patch(1,{title:"Push",type:"strength",workoutId:"push",meta:"Brust, Schulter, Trizeps · ca. 45–55 Min.",runId:undefined});
    patch(2,{title:"Intervalltraining",type:"run",runId:"interval",meta:"Schnelle Intervalle + lockere Pausen · ca. 37 Min.",workoutId:undefined});
    patch(3,{title:"Pull + Beine",type:"strength",workoutId:"pull-legs",meta:"Rücken, Beine, Bizeps · ca. 60–70 Min.",runId:undefined});
    patch(4,{title:"Lockerer Dauerlauf",type:"run",runId:"easy",meta:"Ruhiges Gesprächstempo · ca. 35–45 Min.",workoutId:undefined});
    patch(5,{title:"Oberkörper",type:"strength",workoutId:"upper-hypertrophy",meta:"Brust, Rücken, Schulter, Arme · ca. 45–55 Min.",runId:undefined});
    patch(6,{title:"Ruhetag",type:"rest",meta:"Erholung oder lockere Bewegung",workoutId:undefined,runId:undefined});
    patch(0,{title:"Ruhetag",type:"rest",meta:"Erholung",workoutId:undefined,runId:undefined});
    return true;
  }

  function audit(){
    const issues=[];
    const result={version:VERSION,ok:true,workouts:{},issues};
    if(typeof WORKOUTS==="undefined"||!Array.isArray(WORKOUTS))return{...result,ok:false,issues:["WORKOUTS nicht verfügbar"]};
    Object.entries(DEFINITIONS).forEach(([id,expected])=>{
      const workout=WORKOUTS.find(w=>w.id===id);
      if(!workout){issues.push(`${id}: fehlt`);return;}
      const names=workout.exercises.map(x=>x[0]);
      const duplicate=[...new Set(names.filter((n,i)=>names.indexOf(n)!==i))];
      if(duplicate.length)issues.push(`${id}: doppelt ${duplicate.join(", ")}`);
      if(workout.exercises.length!==expected.length)issues.push(`${id}: Übungszahl ${workout.exercises.length}/${expected.length}`);
      workout.exercises.forEach((row,i)=>{if(row[0]!==expected[i][0]||Number(row[1])!==Number(expected[i][1]))issues.push(`${id}: Reihenfolge/Sätze bei Position ${i+1}`);});
      const totalSets=workout.exercises.reduce((sum,row)=>sum+Number(row[1]||0),0);
      if(totalSets<13||totalSets>24)issues.push(`${id}: Satzvolumen ${totalSets} außerhalb Zielbereich 13–24`);
      result.workouts[id]={exercises:workout.exercises.length,sets:totalSets};
    });
    ["Kabel-Flys","Crunch-Maschine","Seitheben Maschine"].forEach(name=>{if(!WORKOUTS.some(w=>(w.exercises||[]).some(e=>e[0]===name)))issues.push(`${name}: bevorzugter Name fehlt`);});
    const push=WORKOUTS.find(w=>w.id==="push");
    if(push&&push.exercises.some(e=>e[0]==="Seitheben am Kabelzug"))issues.push("Push: falsche Seitheben-Variante");
    if(isMusclePlan()){
      const week=window.RepPilotTrainingPlan?.selectedWeek?.()||[];
      const sequence=[1,2,3,4,5].map(day=>week.find(x=>Number(x.day)===day)?.type+":"+(week.find(x=>Number(x.day)===day)?.workoutId||week.find(x=>Number(x.day)===day)?.runId||""));
      const expected=["strength:push","run:interval","strength:pull-legs","run:easy","strength:upper-hypertrophy"];
      if(JSON.stringify(sequence)!==JSON.stringify(expected))issues.push("Muskelaufbau-Woche: Reihenfolge stimmt nicht");
    }
    result.ok=issues.length===0;
    return result;
  }

  function refresh(){
    apply();
    alignManualMuscleWeek();
    try{if(typeof renderHome==="function")renderHome();}catch{}
    queueMicrotask(()=>{window.RepPilotDayExercises?.refresh?.();window.RepPilotPlanTitleFix?.refresh?.();window.RepPilotStrengthTest?.refresh?.();});
    const result=audit();
    if(!result.ok)console.warn("RepPilot Trainingsplan-Audit",result.issues);
    return result;
  }

  function init(){
    refresh();
    document.addEventListener("click",event=>{
      if(!event.target.closest?.("[data-plan-select]"))return;
      setTimeout(()=>{alignManualMuscleWeek();try{window.RepPilotTrainingPlan?.refresh?.();}catch{}window.RepPilotDayExercises?.refresh?.();},0);
    });
  }

  window.RepPilotPlanQuality={version:VERSION,refresh,audit,definitions:DEFINITIONS};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();