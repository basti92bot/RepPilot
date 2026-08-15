(() => {
  const VERSION = "11.8.39";

  function hasActiveWorkout(){
    try{return typeof active !== "undefined" && !!active;}catch{return false;}
  }

  function markNav(view){
    document.querySelectorAll("nav button").forEach(btn=>btn.classList.toggle("active",btn.dataset.view===view));
  }

  function resumeWorkout(){
    if(!hasActiveWorkout())return false;
    try{if(typeof renderWorkout === "function")renderWorkout();}catch{}
    try{if(typeof show === "function")show("workout");}catch{return false;}
    markNav("home");
    return true;
  }

  function openHistoryWithoutStopping(){
    if(!hasActiveWorkout())return false;
    try{if(typeof renderHistory === "function")renderHistory();}catch{}
    try{if(typeof show === "function")show("history");}catch{return false;}
    markNav("history");
    return true;
  }

  function openStretchingWithoutStopping(){
    if(!hasActiveWorkout())return false;
    try{if(typeof renderStretchPreview === "function")renderStretchPreview();}catch{}
    try{if(typeof showStretchScreen === "function")showStretchScreen("overview");}catch{}
    try{if(typeof show === "function")show("stretching");}catch{return false;}
    markNav("stretching");
    return true;
  }

  document.addEventListener("click",event=>{
    const btn=event.target.closest?.("nav button[data-view]");
    if(!btn||!hasActiveWorkout())return;
    const view=btn.dataset.view;
    let handled=false;
    if(view==="home")handled=resumeWorkout();
    else if(view==="history")handled=openHistoryWithoutStopping();
    else if(view==="stretching")handled=openStretchingWithoutStopping();
    if(handled){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);

  window.RepPilotNavigationFix={version:VERSION,resumeWorkout};
})();
