(() => {
  const VERSION="11.8.79";
  const CARD_ID="selectedTrainingPlanHome";
  const KEYBOARD_CLASS="rp-keyboard-open";
  let keyboardTimer=0;

  const removePlanCard=()=>{
    const card=document.getElementById(CARD_ID);
    if(card)card.remove();
  };

  function loadPersonalRecords(){
    if(document.getElementById("rpPersonalRecordsScript")||window.RepPilotPersonalRecords)return;
    const s=document.createElement("script");
    s.id="rpPersonalRecordsScript";
    s.src="personal-records-feature.js?v=11.8.71";
    s.async=false;
    document.body.appendChild(s);
  }

  function ensureStyles(){
    if(document.getElementById("rpBottomNavFixStyles"))return;
    const s=document.createElement("style");
    s.id="rpBottomNavFixStyles";
    s.textContent=`
      body{min-height:100%;padding-bottom:0!important}
      main{padding-bottom:calc(76px + env(safe-area-inset-bottom,0px))!important}
      body>nav{
        position:fixed!important;
        left:0!important;
        right:0!important;
        top:auto!important;
        bottom:0!important;
        width:100%!important;
        z-index:10000!important;
        transform:none!important;
        -webkit-transform:none!important;
        padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))!important
      }
      body.${KEYBOARD_CLASS}>nav,
      body.${KEYBOARD_CLASS} #rpWorkoutActions{display:none!important}
    `;
    document.head.appendChild(s);
  }

  function isTextInput(el){
    if(!el)return false;
    if(el.matches?.("textarea,[contenteditable='true']"))return true;
    if(!el.matches?.("input"))return false;
    const type=String(el.type||"text").toLowerCase();
    return !["button","submit","reset","checkbox","radio","range","color","file","hidden"].includes(type);
  }

  function syncKeyboardState(){
    clearTimeout(keyboardTimer);
    document.body.classList.toggle(KEYBOARD_CLASS,isTextInput(document.activeElement));
  }

  function scheduleKeyboardCloseCheck(){
    clearTimeout(keyboardTimer);
    keyboardTimer=setTimeout(syncKeyboardState,250);
  }

  function resetScroll(){
    requestAnimationFrame(()=>{
      window.scrollTo({top:0,left:0,behavior:"auto"});
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
    });
  }

  function init(){
    ensureStyles();
    removePlanCard();
    loadPersonalRecords();

    const home=document.getElementById("home");
    if(home){
      const observer=new MutationObserver(removePlanCard);
      observer.observe(home,{childList:true,subtree:true});
    }

    document.addEventListener("focusin",event=>{
      if(isTextInput(event.target))syncKeyboardState();
    },true);
    document.addEventListener("focusout",event=>{
      if(isTextInput(event.target))scheduleKeyboardCloseCheck();
    },true);

    document.addEventListener("click",event=>{
      if(event.target.closest?.("nav button[data-view]"))resetScroll();
    },true);

    syncKeyboardState();
    window.RepPilotHomePlanCard={
      version:VERSION,
      remove:removePlanCard,
      refreshNavigation:()=>{},
      resetWorkoutViewport:resetScroll
    };
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();