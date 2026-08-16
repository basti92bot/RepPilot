(() => {
  const VERSION="11.8.55";
  const RULES={
    push:{title:"Push",meta:"Brust, Schulter, Trizeps · ca. 45–55 Min."},
    "pull-legs":{title:"Pull + Beine",meta:"Rücken, Beine, Bizeps · ca. 65–75 Min."},
    "upper-hypertrophy":{title:"Oberkörper",meta:"Brust, Rücken, Schulter, Arme · ca. 45–55 Min."}
  };
  const PREFERRED_NAMES={
    "Fliegende am Kabelzug":"Kabel-Flys",
    "Bauchpresse an der Maschine":"Crunch-Maschine"
  };
  const STRENGTH_KEY="reppilot-strength-tests-v1";

  const preferredName=name=>PREFERRED_NAMES[name]||name;

  function patchStoredNames(){
    try{
      const keys=[];
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);
        if(key&&key.startsWith("reppilot-history"))keys.push(key);
      }
      keys.forEach(key=>{
        const raw=localStorage.getItem(key);if(!raw)return;
        const rows=JSON.parse(raw);let changed=false;
        if(Array.isArray(rows))rows.forEach(workout=>{
          (workout?.exercises||[]).forEach(exercise=>{
            const next=preferredName(exercise?.name);
            if(next&&next!==exercise?.name){exercise.name=next;changed=true;}
          });
        });
        if(changed)localStorage.setItem(key,JSON.stringify(rows));
      });
    }catch(e){console.warn("Bevorzugte Übungsnamen konnten im Verlauf nicht migriert werden",e)}

    try{
      const raw=localStorage.getItem(STRENGTH_KEY);if(!raw)return;
      const rows=JSON.parse(raw);let changed=false;
      if(Array.isArray(rows))rows.forEach(item=>{
        if(typeof item?.exercise!=="string")return;
        if(item.exercise.startsWith("home::"))return;
        const next=preferredName(item.exercise);
        if(next!==item.exercise){item.exercise=next;changed=true;}
      });
      if(changed)localStorage.setItem(STRENGTH_KEY,JSON.stringify(rows));
    }catch(e){console.warn("Bevorzugte Übungsnamen konnten in Krafttests nicht migriert werden",e)}
  }

  function patchExerciseData(){
    try{
      if(!Array.isArray(WORKOUTS))return;
      WORKOUTS.forEach(workout=>{
        workout.exercises=(workout.exercises||[]).map(([name,sets,weight])=>[preferredName(name),sets,weight]);
      });
      if(typeof TIPS!=="undefined"){
        if(TIPS["Fliegende am Kabelzug"]&&!TIPS["Kabel-Flys"])TIPS["Kabel-Flys"]=TIPS["Fliegende am Kabelzug"];
        if(TIPS["Bauchpresse an der Maschine"]&&!TIPS["Crunch-Maschine"])TIPS["Crunch-Maschine"]=TIPS["Bauchpresse an der Maschine"];
      }
    }catch(e){console.warn("Bevorzugte Übungsnamen konnten nicht gesetzt werden",e)}
  }

  function patchData(){
    patchExerciseData();
    try{
      if(Array.isArray(WORKOUTS)){
        Object.entries(RULES).forEach(([id,rule])=>{
          const workout=WORKOUTS.find(w=>w.id===id);
          if(workout)workout.title=rule.title;
        });
      }
      if(Array.isArray(WEEK)){
        WEEK.forEach(day=>{
          const rule=RULES[day.workoutId];
          if(rule){day.title=rule.title;day.meta=rule.meta;}
        });
      }
    }catch{}
  }

  function workoutId(card){
    const button=card?.querySelector("[data-selected-workout],[data-workout]");
    return button?.dataset?.selectedWorkout||button?.dataset?.workout||"";
  }

  function patchPlanExerciseNames(){
    document.querySelectorAll(".rp-day-exercise-list li strong").forEach(strong=>{
      const raw=(strong.childNodes?.[0]?.nodeValue||strong.textContent||"").trim();
      const next=preferredName(raw);
      if(next===raw)return;
      if(strong.childNodes?.[0]?.nodeType===Node.TEXT_NODE)strong.childNodes[0].nodeValue=next;
      else strong.textContent=next;
      strong.closest("li")?.setAttribute("data-strength-name",next);
    });
  }

  function patchPlan(){
    patchData();
    const plan=document.getElementById("plan");
    if(!plan)return;
    plan.querySelectorAll(".plan-item").forEach(card=>{
      const rule=RULES[workoutId(card)];
      if(!rule)return;
      const title=card.querySelector(".plan-copy h3");
      const meta=card.querySelector(".plan-copy p");
      if(title)title.textContent=rule.title;
      if(meta)meta.textContent=rule.meta;
      if(card.classList.contains("today")){
        const heroTitle=document.getElementById("nextTitle");
        const heroMeta=document.getElementById("nextMeta");
        if(heroTitle)heroTitle.textContent=rule.title;
        if(heroMeta)heroMeta.textContent=rule.meta;
      }
    });
    patchPlanExerciseNames();
    window.RepPilotDayExercises?.refresh?.();
  }

  function init(){
    patchStoredNames();
    patchPlan();
    const plan=document.getElementById("plan");
    if(plan){
      const observer=new MutationObserver(()=>queueMicrotask(patchPlan));
      observer.observe(plan,{childList:true,subtree:false});
    }
  }

  window.RepPilotPlanTitleFix={version:VERSION,refresh:patchPlan,preferredNames:PREFERRED_NAMES};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();