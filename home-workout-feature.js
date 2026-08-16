(() => {
  const VERSION = "11.8.54";
  const HOME_REST_SECONDS = 30;
  const isHomeWorkout = () => !!active?.id?.startsWith("home-");
  const isTimedCore = name => /plank|unterarmstütz|seitstütz/i.test(name || "");

  function tuneHomeExercises(){
    const homeA=WORKOUTS.find(w=>w.id==="home-a");
    if(homeA){
      homeA.exercises=homeA.exercises.map(x=>{
        if(["Crunches","Plank"].includes(x[0]))return ["Unterarmstütz",3,0];
        return x;
      });
      if(!homeA.exercises.some(x=>x[0]==="Unterarmstütz"))homeA.exercises.push(["Unterarmstütz",3,0]);
    }
  }

  function toggleHomeSetUi(){
    const home=isHomeWorkout();
    const weightLabel=document.querySelector('label[for="weightInput"]');
    const weightWrap=document.getElementById("weightInput")?.closest(".weight");
    const defer=document.getElementById("deferExerciseBtn");
    if(weightLabel)weightLabel.style.display=home?"none":"";
    if(weightWrap)weightWrap.style.display=home?"none":"";
    if(defer)defer.style.display=home?"none":"";
    if(home){
      const last=document.getElementById("lastTraining");
      const previous=document.getElementById("previousSet");
      if(last)last.hidden=true;
      if(previous)previous.hidden=true;
      const e=current();
      const reps=document.getElementById("fixedReps");
      if(reps)reps.textContent=isTimedCore(e?.name)?"30 Sekunden":"10 Wiederholungen";
    }
  }

  const baseRenderSet=renderSet;
  renderSet=function(){
    baseRenderSet();
    toggleHomeSetUi();
  };

  const baseBeginRest=beginRest;
  beginRest=function(next){
    if(!isHomeWorkout())return baseBeginRest(next);
    cancelRest();
    afterRest=next;
    restTotal=HOME_REST_SECONDS;
    restEnd=Date.now()+HOME_REST_SECONDS*1000;
    phase="rest";
    renderWorkout();
    timer=setInterval(updateRest,250);
  };

  const baseRenderRest=renderRest;
  renderRest=function(){
    if(!isHomeWorkout())return baseRenderRest();
    document.getElementById("restSetSummary").textContent=`${lastSet.name}: Satz ${lastSet.no} erledigt`;
    document.getElementById("restNext").textContent=afterRest.type==="set"?`Danach: Satz ${afterRest.index+1}`:ei<active.exercises.length-1?`Danach: ${active.exercises[ei+1].name}`:"Danach Training speichern.";
    updateRest();
  };

  const baseCompleteSet=completeSet;
  function completeHomeSet(){
    const e=current(),s=e.sets[si];
    s.weight=0;
    s.reps=isTimedCore(e.name)?30:REPS;
    s.done=true;
    lastSet={name:e.name,no:si+1,weight:0};
    if(si<e.sets.length-1)beginRest({type:"set",index:si+1});
    else beginRest({type:"complete"});
  }
  completeSet=function(){
    if(isHomeWorkout())return completeHomeSet();
    return baseCompleteSet();
  };

  const baseRenderComplete=renderComplete;
  renderComplete=function(){
    if(!isHomeWorkout()){
      const skip=document.getElementById("skipNextBtn");
      if(skip)skip.style.display="";
      return baseRenderComplete();
    }
    const e=current();
    document.getElementById("completedExerciseIcon").textContent=emo(e.name);
    document.getElementById("completedExercise").textContent=e.name;
    document.getElementById("exerciseSummary").textContent=`${e.sets.filter(x=>x.done).length} Sätze abgeschlossen`;
    const has=ei<active.exercises.length-1;
    document.getElementById("nextExerciseBlock").hidden=!has;
    document.getElementById("finishWorkoutBlock").hidden=has;
    const skip=document.getElementById("skipNextBtn");
    if(skip)skip.style.display="none";
    if(has){
      const x=active.exercises[ei+1];
      document.getElementById("nextExerciseName").textContent=x.name;
      document.getElementById("nextExerciseMeta").textContent=isTimedCore(x.name)?`${x.sets.length} Sätze · jeweils 30 Sekunden`:`${x.sets.length} Sätze · jeweils ${REPS} Wiederholungen`;
      document.getElementById("nextExerciseTip").textContent=TIPS[x.name]||"Ruhig und kontrolliert.";
    }else{
      document.getElementById("workoutVolumePreview").textContent="Home Workout abgeschlossen";
    }
  };

  const baseRenderHistory=renderHistory;
  renderHistory=function(){
    baseRenderHistory();
    const items=history().slice().reverse();
    document.querySelectorAll("#historyList .history-item").forEach((detail,i)=>{
      const w=items[i];
      if(!w?.id?.startsWith("home-"))return;
      const totalLabel=detail.querySelector("summary > strong");
      if(totalLabel)totalLabel.textContent="Körpergewicht";
      detail.querySelectorAll("li").forEach((li,j)=>{
        const e=w.exercises?.[j];
        const done=e?.sets?.filter(s=>s.done).length||0;
        const value=li.querySelector("strong");
        if(value)value.textContent=`${done} Sätze`;
      });
    });
  };

  function init(){
    tuneHomeExercises();
    const complete=document.getElementById("completeSetBtn");
    if(complete)complete.onclick=completeSet;
    window.RepPilotHomeWorkout={version:VERSION};
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();