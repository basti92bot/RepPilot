(() => {
  const VERSION="11.8.58";
  const CARD_ID="selectedTrainingPlanHome";
  const FALLBACK_CLASS="rp-nav-visual-fallback";
  let raf=0;

  const removePlanCard=()=>{
    const card=document.getElementById(CARD_ID);
    if(card)card.remove();
  };

  function ensureStyles(){
    if(document.getElementById("rpBottomNavFixStyles"))return;
    const s=document.createElement("style");
    s.id="rpBottomNavFixStyles";
    s.textContent=`
      body{padding-bottom:0!important;min-height:100dvh}
      main{padding-bottom:calc(116px + env(safe-area-inset-bottom,0px))!important}
      body>nav{
        position:fixed!important;
        left:0!important;right:0!important;top:auto!important;bottom:0!important;
        width:100%!important;z-index:10000!important;
        transform:translateZ(0);-webkit-transform:translateZ(0);
        padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))!important;
      }
      body>nav.${FALLBACK_CLASS}{
        position:absolute!important;
        top:var(--rp-nav-fallback-top)!important;
        bottom:auto!important;
        transform:none!important;-webkit-transform:none!important;
      }
      body.rp-nav-visual-fallback #rpWorkoutActions{
        position:absolute!important;
        top:var(--rp-sticky-fallback-top)!important;
        bottom:auto!important;
      }
    `;
    document.head.appendChild(s);
  }

  function visualViewportData(){
    const vv=window.visualViewport;
    if(!vv)return null;
    return {
      expectedBottom:vv.offsetTop+vv.height,
      pageTop:Number.isFinite(vv.pageTop)?vv.pageTop:(window.scrollY+vv.offsetTop),
      height:vv.height
    };
  }

  function syncStickyFallback(navTop){
    const bar=document.getElementById("rpWorkoutActions");
    if(!bar)return;
    const top=Math.max(0,navTop-bar.offsetHeight-8);
    bar.style.setProperty("--rp-sticky-fallback-top",`${top}px`);
  }

  function applyFallback(nav,data){
    const top=Math.max(0,data.pageTop+data.height-nav.offsetHeight);
    nav.style.setProperty("--rp-nav-fallback-top",`${top}px`);
    nav.classList.add(FALLBACK_CLASS);
    document.body.classList.add(FALLBACK_CLASS);
    syncStickyFallback(top);
  }

  function clearFallback(nav){
    nav.classList.remove(FALLBACK_CLASS);
    nav.style.removeProperty("--rp-nav-fallback-top");
    document.body.classList.remove(FALLBACK_CLASS);
    document.getElementById("rpWorkoutActions")?.style.removeProperty("--rp-sticky-fallback-top");
  }

  function verifyNav(forceFixedCheck=false){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      const nav=document.querySelector("body>nav");
      if(!nav)return;
      const data=visualViewportData();
      if(!data)return;

      if(nav.classList.contains(FALLBACK_CLASS)&&!forceFixedCheck){
        applyFallback(nav,data);
        return;
      }

      clearFallback(nav);
      requestAnimationFrame(()=>{
        const rect=nav.getBoundingClientRect();
        const delta=Math.abs(rect.bottom-data.expectedBottom);
        if(delta>32)applyFallback(nav,data);
      });
    });
  }

  function init(){
    ensureStyles();
    removePlanCard();

    const home=document.getElementById("home");
    if(home){
      const observer=new MutationObserver(removePlanCard);
      observer.observe(home,{childList:true,subtree:true});
    }

    const bodyObserver=new MutationObserver(()=>verifyNav(false));
    bodyObserver.observe(document.body,{childList:true});

    window.addEventListener("scroll",()=>verifyNav(false),{passive:true});
    window.addEventListener("resize",()=>verifyNav(true),{passive:true});
    window.addEventListener("orientationchange",()=>setTimeout(()=>verifyNav(true),120),{passive:true});
    window.visualViewport?.addEventListener("scroll",()=>verifyNav(false),{passive:true});
    window.visualViewport?.addEventListener("resize",()=>verifyNav(true),{passive:true});

    verifyNav(true);
    setTimeout(()=>verifyNav(true),250);
    window.RepPilotHomePlanCard={version:VERSION,remove:removePlanCard,refreshNavigation:()=>verifyNav(true)};
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
