(() => {
  function applyMuscleSchedule(){
    try{
      const pullWorkout=WORKOUTS.find(w=>w.id==="pull-legs");
      if(pullWorkout){pullWorkout.day=4;pullWorkout.dayName="Donnerstag";}

      const monday=WEEK.find(x=>x.day===1);
      const tuesday=WEEK.find(x=>x.day===2);
      const wednesday=WEEK.find(x=>x.day===3);
      const thursday=WEEK.find(x=>x.day===4);
      const friday=WEEK.find(x=>x.day===5);
      const saturday=WEEK.find(x=>x.day===6);
      const sunday=WEEK.find(x=>x.day===0);

      if(monday) Object.assign(monday,{dayName:"Montag",title:"Push + Beine",type:"strength",workoutId:"push",meta:"Brust, Schulter, Trizeps, Quadrizeps · ca. 55–65 Min."});
      if(tuesday) Object.assign(tuesday,{dayName:"Dienstag",title:"Intervalltraining Laufband",type:"run",runId:"interval",meta:"37 Minuten · 1 % Steigung"});
      if(wednesday){Object.keys(wednesday).forEach(k=>{if(!["day","dayName"].includes(k))delete wednesday[k]});Object.assign(wednesday,{day:3,dayName:"Mittwoch",title:"Rest Day",type:"rest",meta:"Erholung oder Mobility"});}
      if(thursday){Object.keys(thursday).forEach(k=>{if(!["day","dayName"].includes(k))delete thursday[k]});Object.assign(thursday,{day:4,dayName:"Donnerstag",title:"Pull + Beine",type:"strength",workoutId:"pull-legs",meta:"Rücken, Beine, Bizeps · ca. 55–65 Min."});}
      if(friday) Object.assign(friday,{dayName:"Freitag",title:"Oberkörper + Beine",type:"strength",workoutId:"upper-hypertrophy",meta:"Oberkörper, Beinbeuger, Waden · ca. 55–65 Min."});
      if(saturday){Object.keys(saturday).forEach(k=>{if(!["day","dayName"].includes(k))delete saturday[k]});Object.assign(saturday,{day:6,dayName:"Samstag",title:"Lockerer Dauerlauf",type:"run",runId:"easy",meta:"Lockerer Dauerlauf · Gesprächstempo"});}
      if(sunday){Object.keys(sunday).forEach(k=>{if(!["day","dayName"].includes(k))delete sunday[k]});Object.assign(sunday,{day:0,dayName:"Sonntag",title:"Rest Day",type:"rest",meta:"Erholung und Vorbereitung"});}
    }catch(e){console.error("Muskelplan-Zeitplan konnte nicht aktualisiert werden",e)}
  }

  function refresh(){
    applyMuscleSchedule();
    if(localStorage.getItem("reppilot-selected-training-plan")==="muscle" || !localStorage.getItem("reppilot-selected-training-plan")){
      try{renderHome();}catch{}
    }
    const v=document.querySelector("header h1 span");
    if(v)v.textContent="v11.8.20 CLOUD TEST";
    document.title="RepPilot v11.8.20";
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",refresh,{once:true});else refresh();
})();