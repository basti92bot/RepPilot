(() => {
  const VERSION = "11.8.61";

  const plans = {
    push: {
      title: "Push",
      exercises: [
        ["Schrägbankdrücken",3,60],
        ["Brustpresse",3,50],
        ["Schulterpresse",3,35],
        ["Kabel-Flys",2,20],
        ["Seitheben am Kabelzug",3,7.5],
        ["Überkopf-Trizepsstrecken am Kabelzug",2,20],
        ["Trizepsdrücken am Seilzug",2,25],
        ["Crunch-Maschine",3,30]
      ]
    },
    "pull-legs": {
      title: "Pull + Beine",
      exercises: [
        ["Beinpresse",3,120],
        ["Brustgestütztes Rudern",3,50],
        ["Rumänisches Kreuzheben",3,60],
        ["Latzug neutral",3,55],
        ["Beinbeuger",3,40],
        ["Reverse Butterfly am Kabelzug",2,10],
        ["Beinstrecker",3,40],
        ["Schrägbank-Curls",2,12],
        ["Wadenheben",3,60],
        ["Hängendes Beinheben",2,0]
      ]
    },
    "upper-hypertrophy": {
      title: "Oberkörper",
      exercises: [
        ["Schrägbankdrücken leicht",3,50],
        ["Brustgestütztes Rudern",3,45],
        ["Latzug breit",3,50],
        ["Liegestütze bis Maximum",2,0],
        ["Seitheben",3,8],
        ["Reverse Butterfly am Kabelzug",2,10],
        ["Hammercurls",2,12],
        ["Einarmiger Trizeps am Kabelzug",2,10],
        ["Crunch-Maschine",2,30]
      ]
    },
    "loss-a": {
      title: "Ganzkörper A",
      exercises: [
        ["Beinpresse",3,80],
        ["Brustpresse",3,40],
        ["Latzug neutral",3,45],
        ["Rumänisches Kreuzheben",3,50],
        ["Schulterpresse",2,25],
        ["Schrägbank-Curls",2,10],
        ["Trizepsdrücken am Seilzug",2,20],
        ["Crunch-Maschine",2,25]
      ]
    },
    "loss-b": {
      title: "Ganzkörper B",
      exercises: [
        ["Schrägbankdrücken leicht",3,40],
        ["Brustgestütztes Rudern",3,40],
        ["Beinpresse",3,80],
        ["Beinbeuger",3,35],
        ["Seitheben",2,6],
        ["Hammercurls",2,10],
        ["Einarmiger Trizeps am Kabelzug",2,8],
        ["Wadenheben",3,50],
        ["Crunch-Maschine",2,25]
      ]
    },
    "personal-upper-a": {
      title: "Oberkörper A",
      exercises: [
        ["Schrägbankdrücken",3,60],
        ["Brustgestütztes Rudern",3,50],
        ["Latzug neutral",3,55],
        ["Schulterpresse",3,35],
        ["Seitheben am Kabelzug",2,7.5],
        ["Trizepsdrücken am Seilzug",2,25],
        ["Schrägbank-Curls",2,12],
        ["Crunch-Maschine",2,30]
      ]
    },
    "personal-lower-a": {
      title: "Unterkörper A",
      exercises: [
        ["Beinpresse",3,120],
        ["Rumänisches Kreuzheben",3,60],
        ["Beinstrecker",3,40],
        ["Beinbeuger",2,40],
        ["Wadenheben",3,60],
        ["Hängendes Beinheben",2,0]
      ]
    },
    "personal-upper-b": {
      title: "Oberkörper B",
      exercises: [
        ["Brustpresse",3,50],
        ["Latzug breit",3,50],
        ["Brustgestütztes Rudern",3,45],
        ["Kabel-Flys",2,20],
        ["Seitheben",2,8],
        ["Einarmiger Trizeps am Kabelzug",2,10],
        ["Scott-Curls",2,20],
        ["Crunch-Maschine",2,30]
      ]
    },
    "personal-lower-b": {
      title: "Unterkörper B",
      exercises: [
        ["Rumänisches Kreuzheben",3,50],
        ["Beinpresse",3,100],
        ["Beinbeuger",3,35],
        ["Beinstrecker",2,35],
        ["Wadenheben",3,55],
        ["Hängendes Beinheben",2,0]
      ]
    },
    "personal-pull": {
      title: "Pull",
      exercises: [
        ["Brustgestütztes Rudern",3,50],
        ["Latzug neutral",3,55],
        ["Reverse Butterfly am Kabelzug",3,12],
        ["Hammercurls",3,12],
        ["Scott-Curls",2,20],
        ["Hängendes Beinheben",2,0]
      ]
    },
    "personal-legs": {
      title: "Beine",
      exercises: [
        ["Beinpresse",3,120],
        ["Rumänisches Kreuzheben",3,60],
        ["Beinbeuger",3,40],
        ["Beinstrecker",3,40],
        ["Wadenheben",3,60],
        ["Crunch-Maschine",2,30]
      ]
    },
    "home-a": {
      title: "Home Workout A",
      exercises: [
        ["Kniebeugen",3,0],
        ["Liegestütze bis Maximum",3,0],
        ["Hüftheben",3,0],
        ["Rückenstrecker in Bauchlage",3,0],
        ["Rückwärts-Ausfallschritte",3,0],
        ["Schulter-Liegestütze",2,0],
        ["Diagonales Arm-Bein-Strecken",3,0],
        ["Unterarmstütz",3,0]
      ]
    },
    "home-b": {
      title: "Home Workout B",
      exercises: [
        ["Stationäre Ausfallschritte",3,0],
        ["Enge Liegestütze",3,0],
        ["Einbeiniges Hüftheben",3,0],
        ["Schneeengel in Bauchlage",3,0],
        ["Wadenheben",3,0],
        ["Diagonales Arm-Bein-Strecken im Vierfüßlerstand",3,0],
        ["Seitstütz",2,0],
        ["Beinheben",3,0]
      ]
    },
    "home-c": {
      title: "Home Workout C",
      exercises: [
        ["Tempo-Kniebeugen",3,0],
        ["Liegestütze bis Maximum",3,0],
        ["Hüftheben mit Beinwechsel",3,0],
        ["Y-T-Heben in Bauchlage",3,0],
        ["Rückwärts-Ausfallschritte",3,0],
        ["Schulter-Liegestütze",2,0],
        ["Bergsteiger",3,0],
        ["Unterarmstütz",3,0]
      ]
    }
  };

  const cloneExercises = rows => rows.map(([name,sets,weight]) => [name,sets,weight]);

  function applyWorkouts(){
    if(!Array.isArray(window.WORKOUTS) && typeof WORKOUTS === "undefined") return false;
    const workouts = typeof WORKOUTS !== "undefined" ? WORKOUTS : window.WORKOUTS;
    for(const [id,definition] of Object.entries(plans)){
      const workout = workouts.find(item => item.id === id);
      if(!workout) continue;
      workout.title = definition.title;
      workout.exercises = cloneExercises(definition.exercises);
    }
    return true;
  }

  function setWeekEntry(list,day,data){
    if(!Array.isArray(list)) return;
    const row = list.find(item => Number(item.day) === Number(day));
    if(row) Object.assign(row,data);
  }

  function alignWeeks(){
    try{
      if(typeof MUSCLE_WEEK !== "undefined"){
        setWeekEntry(MUSCLE_WEEK,1,{title:"Push",type:"strength",workoutId:"push",meta:"Brust, Schulter, Trizeps · ca. 45–55 Min."});
        setWeekEntry(MUSCLE_WEEK,2,{title:"Intervalltraining",type:"run",runId:"interval",meta:"Schnelle Intervalle + lockere Pausen"});
        setWeekEntry(MUSCLE_WEEK,3,{title:"Pull + Beine",type:"strength",workoutId:"pull-legs",meta:"Rücken, Beine, Bizeps · ca. 65–75 Min."});
        setWeekEntry(MUSCLE_WEEK,4,{title:"Lockerer Dauerlauf",type:"run",runId:"easy",meta:"Ruhiges Gesprächstempo"});
        setWeekEntry(MUSCLE_WEEK,5,{title:"Oberkörper",type:"strength",workoutId:"upper-hypertrophy",meta:"Brust, Rücken, Schulter, Arme · ca. 45–55 Min."});
        setWeekEntry(MUSCLE_WEEK,6,{title:"Ruhetag",type:"rest",workoutId:null,runId:null,meta:"Erholung oder lockere Bewegung"});
        setWeekEntry(MUSCLE_WEEK,0,{title:"Ruhetag",type:"rest",workoutId:null,runId:null,meta:"Erholung"});
      }
      if(typeof WEEK !== "undefined"){
        setWeekEntry(WEEK,1,{title:"Push",type:"strength",workoutId:"push",meta:"Brust, Schulter, Trizeps · ca. 45–55 Min."});
        setWeekEntry(WEEK,2,{title:"Intervalltraining",type:"run",runId:"interval",meta:"Schnelle Intervalle + lockere Pausen"});
        setWeekEntry(WEEK,3,{title:"Pull + Beine",type:"strength",workoutId:"pull-legs",meta:"Rücken, Beine, Bizeps · ca. 65–75 Min."});
        setWeekEntry(WEEK,4,{title:"Lockerer Dauerlauf",type:"run",runId:"easy",meta:"Ruhiges Gesprächstempo"});
        setWeekEntry(WEEK,5,{title:"Oberkörper",type:"strength",workoutId:"upper-hypertrophy",meta:"Brust, Rücken, Schulter, Arme · ca. 45–55 Min."});
        setWeekEntry(WEEK,6,{title:"Ruhetag",type:"rest",workoutId:null,runId:null,meta:"Erholung oder lockere Bewegung"});
        setWeekEntry(WEEK,0,{title:"Ruhetag",type:"rest",workoutId:null,runId:null,meta:"Erholung"});
      }
    }catch(error){console.warn("Wochenplan konnte nicht vollständig abgeglichen werden",error);}
  }

  function audit(){
    const result = {ok:true,issues:[],workouts:{}};
    let workouts=[];
    try{workouts = typeof WORKOUTS !== "undefined" ? WORKOUTS : (window.WORKOUTS || []);}catch{}
    for(const id of Object.keys(plans)){
      const workout = workouts.find(item => item.id === id);
      if(!workout){result.ok=false;result.issues.push(`Workout fehlt: ${id}`);continue;}
      const names = workout.exercises.map(item => item[0]);
      const duplicates = names.filter((name,index) => names.indexOf(name)!==index);
      const sets = workout.exercises.reduce((sum,item) => sum + Number(item[1]||0),0);
      if(duplicates.length){result.ok=false;result.issues.push(`${id}: doppelte Übungen ${[...new Set(duplicates)].join(", ")}`);}
      if(!workout.exercises.length){result.ok=false;result.issues.push(`${id}: keine Übungen`);}
      if(workout.exercises.some(item => !item[0] || Number(item[1])<1)){result.ok=false;result.issues.push(`${id}: ungültige Übung/Satzanzahl`);}
      result.workouts[id]={exerciseCount:workout.exercises.length,totalSets:sets};
    }
    return result;
  }

  function refresh(){
    applyWorkouts();
    alignWeeks();
    try{if(typeof renderHome === "function") renderHome();}catch{}
    window.RepPilotDayExercises?.refresh?.();
    window.RepPilotPlanTitleFix?.refresh?.();
    const check = audit();
    if(!check.ok) console.warn("RepPilot Plan-Audit",check.issues);
    return check;
  }

  const init = () => refresh();
  window.RepPilotPlanQuality = {version:VERSION,refresh,audit,plans};
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
