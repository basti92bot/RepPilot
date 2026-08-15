(() => {
  const VERSION="11.8.43";
  const RULES={
    push:{title:"Push",meta:"Brust, Schulter, Trizeps · ca. 45–55 Min."},
    "pull-legs":{title:"Pull + Beine",meta:"Rücken, Beine, Bizeps · ca. 65–75 Min."},
    "upper-hypertrophy":{title:"Oberkörper",meta:"Brust, Rücken, Schulter, Arme · ca. 45–55 Min."}
  };

  function patchData(){
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
    window.RepPilotDayExercises?.refresh?.();
  }

  function init(){
    patchPlan();
    const plan=document.getElementById("plan");
    if(plan){
      const observer=new MutationObserver(()=>queueMicrotask(patchPlan));
      observer.observe(plan,{childList:true,subtree:false});
    }
  }

  window.RepPilotPlanTitleFix={version:VERSION,refresh:patchPlan};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
