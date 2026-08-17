(() => {
  const VERSION="11.8.58";
  const CARD_ID="selectedTrainingPlanHome";

  const removePlanCard=()=>{
    const card=document.getElementById(CARD_ID);
    if(card)card.remove();
  };

  function init(){
    removePlanCard();
    const home=document.getElementById("home");
    if(!home)return;
    const observer=new MutationObserver(removePlanCard);
    observer.observe(home,{childList:true,subtree:true});
    window.RepPilotHomePlanCard={version:VERSION,remove:removePlanCard};
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
