(() => {
  const VERSION = "11.8.109";

  function hasActiveWorkout(){
    try{return typeof active !== "undefined" && !!active;}catch{return false;}
  }

  function markNav(view){
    document.querySelectorAll("nav button").forEach(btn=>btn.classList.toggle("active",btn.dataset.view===view));
  }

  function safeShow(view){
    try{
      if(typeof show==="function")show(view);
      else{
        document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
        document.getElementById(view)?.classList.add("active");
        markNav(view);
      }
      return true;
    }catch(error){
      console.error("Navigation konnte Ansicht nicht öffnen",view,error);
      return false;
    }
  }

  function openHome(){
    if(hasActiveWorkout()){
      try{if(typeof renderWorkout==="function")renderWorkout();}catch{}
      safeShow("workout");
      markNav("home");
      return;
    }
    safeShow("home");
    try{if(typeof renderHome==="function")renderHome();}catch(error){console.error("Heute konnte nicht gerendert werden",error);}
    markNav("home");
  }

  function openHistory(){
    // Wichtig: Ansicht zuerst öffnen. Ein Renderfehler darf den Haupt-Tab nie blockieren.
    safeShow("history");
    markNav("history");
    try{if(typeof renderHistory==="function")renderHistory();}catch(error){console.error("Verlauf konnte nicht gerendert werden",error);}
  }

  function openTraining(){
    safeShow("trainingHub");
    markNav("trainingHub");
    try{window.RepPilotTrainingHub?.refresh?.();}catch(error){console.error("Training konnte nicht gerendert werden",error);}
  }

  document.addEventListener("click",event=>{
    const btn=event.target.closest?.("nav button[data-view]");
    if(!btn)return;
    const view=btn.dataset.view;
    if(!["home","history","trainingHub"].includes(view))return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if(view==="home")openHome();
    else if(view==="history")openHistory();
    else if(view==="trainingHub")openTraining();
  },true);

  window.RepPilotNavigationFix={
    version:VERSION,
    openHome,
    openHistory,
    openTraining
  };
})();