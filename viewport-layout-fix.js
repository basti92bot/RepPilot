(() => {
  const VERSION = "11.8.135";
  let pending = 0;
  let lastCorrection = 0;
  const standalone = () => window.navigator.standalone === true || window.matchMedia?.("(display-mode: standalone)")?.matches === true;
  const editing = () => {
    const el = document.activeElement;
    return !!el && (el.matches?.("input,textarea,select,[contenteditable='true']") || el.isContentEditable);
  };
  function visibleBottom() {
    const viewport = window.visualViewport;
    let bottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
    if (standalone() && !editing()) {
      const w = Number(window.screen?.width) || 0;
      const h = Number(window.screen?.height) || 0;
      const fullHeight = window.matchMedia?.("(orientation: landscape)")?.matches ? Math.min(w,h) : Math.max(w,h);
      const missing = fullHeight - bottom;
      if (missing > 100 && missing < Math.min(500, fullHeight * 0.55)) bottom = fullHeight;
    }
    return bottom;
  }
  function alignActions(nav, actions) {
    if (!actions || actions.hidden || getComputedStyle(actions).display === "none") return;
    // The nav and action bar can have different viewport offsets on iOS.
    // Measure their actual screen positions rather than copying the nav correction.
    const desiredBottom = nav.getBoundingClientRect().top - 8;
    const offset = desiredBottom - actions.getBoundingClientRect().bottom;
    if (Math.abs(offset) >= 1) {
      actions.style.transform = "translate3d(-50%," + offset + "px,0)";
    }
  }
  function refresh() {
    pending = 0;
    const nav = document.querySelector("body > nav");
    if (!nav) return 0;
    const actions = document.getElementById("rpWorkoutActions");
    nav.style.setProperty("transform", "none", "important");
    if (actions) actions.style.transform = "translateX(-50%)";
    const desired = visibleBottom();
    const actual = nav.getBoundingClientRect().bottom;
    const delta = Math.max(-500, Math.min(500, desired - actual));
    lastCorrection = Math.abs(delta) < 1 ? 0 : delta;
    if (lastCorrection) {
      nav.style.setProperty("transform", "translate3d(0," + lastCorrection + "px,0)", "important");
    }
    alignActions(nav, actions);
    return lastCorrection;
  }
  function schedule() { if (!pending) pending = requestAnimationFrame(refresh); }
  function init() {
    schedule();
    for (const event of ["resize","scroll","orientationchange","pageshow"]) window.addEventListener(event,schedule,{passive:true});
    document.addEventListener("focusin",schedule,{passive:true});
    document.addEventListener("focusout",()=>{
      schedule();
      setTimeout(schedule,150);
      setTimeout(schedule,450);
    },{passive:true});
    document.addEventListener("visibilitychange",schedule,{passive:true});
    window.visualViewport?.addEventListener("resize",schedule,{passive:true});
    window.visualViewport?.addEventListener("scroll",schedule,{passive:true});
  }
  window.RepPilotViewportFix = {version:VERSION,refresh,visibleBottom,get correction(){return lastCorrection;}};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();
