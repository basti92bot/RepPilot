(() => {
  const VERSION="11.8.59";
  const CARD_ID="selectedTrainingPlanHome";
  const FALLBACK_CLASS="rp-nav-visual-fallback";
  const APP_ICON="reppilot-muscleman-logo-v11.8.26.png";
  let raf=0;

  const removePlanCard=()=>{
    const card=document.getElementById(CARD_ID);
    if(card)card.remove();
  };

  function ensurePwaMeta(){
    const head=document.head;
    if(!head)return;
    document.documentElement.dataset.appVersion=VERSION;
    const versionLabel=document.querySelector("header h1 span");
    if(versionLabel)versionLabel.textContent=`v${VERSION}`;
    document.title=`RepPilot v${VERSION}`;

    const setMeta=(name,content)=>{
      let el=head.querySelector(`meta[name="${name}"]`);
      if(!el){el=document.createElement("meta");el.name=name;head.appendChild(el)}
      el.content=content;
    };
    setMeta("mobile-web-app-capable","yes");
    setMeta("apple-mobile-web-app-capable","yes");
    setMeta("apple-mobile-web-app-title","RepPilot");
    setMeta("apple-mobile-web-app-status-bar-style","default");

    let manifest=head.querySelector('link[rel="manifest"]');
    if(!manifest){manifest=document.createElement("link");manifest.rel="manifest";head.appendChild(manifest)}
    manifest.href=`manifest.json?v=${VERSION}`;

    let touch=head.querySelector('link[rel="apple-touch-icon"]');
    if(!touch){touch=document.createElement("link");touch.rel="apple-touch-icon";head.appendChild(touch)}
    touch.href=APP_ICON;
    touch.setAttribute("sizes","128x128");
    touch.setAttribute("type","image/png");

    let icon=head.querySelector('link[rel="icon"]');
    if(!icon){icon=document.createElement("link");icon.rel="icon";head.appendChild(icon)}
    icon.href=APP_ICON;
    icon.setAttribute("sizes","128x128");
    icon.setAttribute("type","image/png");
  }

  function loadPersonalRecords(){
    if(document.getElementById("rpPersonalRecordsScript")||window.RepPilotPersonalRecords)return;
    const s=document.createElement("script");
    s.id="rpPersonalRecordsScript";
    s.src=`personal-records-feature.js?v=${VERSION}`;
    s.async=false;
    document.body.appendChild(s);
  }

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
    ensurePwaMeta();
    ensureStyles();
    removePlanCard();
    loadPersonalRecords();

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
    window.RepPilotHomePlanCard={version:VERSION,remove:removePlanCard,refreshNavigation:()=>verifyNav(true),refreshPwa:ensurePwaMeta};
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
