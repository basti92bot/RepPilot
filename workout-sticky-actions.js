(() => {
  const VERSION = "11.8.60";
  let bar = null;
  let observer = null;

  const visible = el => !!el && !el.hidden && getComputedStyle(el).display !== "none";
  const available = el => !!el && !el.hidden && el.style.display !== "none" && !el.closest("[hidden]");

  function styles(){
    if(document.getElementById("rpStickyWorkoutStyles")) return;
    const s = document.createElement("style");
    s.id = "rpStickyWorkoutStyles";
    s.textContent = `
      #rpWorkoutActions{
        position:fixed;left:50%;transform:translateX(-50%);z-index:20;
        width:min(calc(100% - 24px),688px);padding:9px;
        display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr);gap:8px;
        background:rgba(255,255,255,.96);border:1px solid var(--line);border-radius:18px;
        box-shadow:0 10px 28px rgba(17,24,39,.16);backdrop-filter:blur(14px);
      }
      #rpWorkoutActions.single{grid-template-columns:1fr}
      #rpWorkoutActions button{min-height:52px;padding:12px 10px;border-radius:13px;font-size:15px;line-height:1.15}
      #rpWorkoutActions[hidden]{display:none!important}
      #workout.rp-sticky-actions-active{padding-bottom:92px}
      body.rp-sticky-workout #completeSetBtn,
      body.rp-sticky-workout #deferExerciseBtn,
      body.rp-sticky-workout #restPanel .actions,
      body.rp-sticky-workout #startNextBtn,
      body.rp-sticky-workout #skipNextBtn,
      body.rp-sticky-workout #finishWorkoutBtn{display:none!important}
      @media(max-width:380px){#rpWorkoutActions button{font-size:14px;padding-left:7px;padding-right:7px}}
    `;
    document.head.appendChild(s);
  }

  function ensureBar(){
    if(bar) return bar;
    styles();
    bar = document.createElement("div");
    bar.id = "rpWorkoutActions";
    bar.hidden = true;
    document.body.appendChild(bar);
    positionBar();
    return bar;
  }

  function positionBar(){
    if(!bar) return;
    const nav = document.querySelector("nav");
    const h = nav ? Math.ceil(nav.getBoundingClientRect().height) : 72;
    bar.style.bottom = `${h + 8}px`;
  }

  const DIRECT_ACTIONS = {
    completeSetBtn:"completeSet",
    deferExerciseBtn:"deferCurrentExercise",
    addRestBtn:"addRest",
    skipRestBtn:"finishRest",
    startNextBtn:"nextExercise",
    skipNextBtn:"skipExercise",
    finishWorkoutBtn:"finish"
  };

  function runAction(original){
    if(!original || original.disabled) return;
    const fnName = DIRECT_ACTIONS[original.id];
    const fn = fnName ? window[fnName] : null;
    if(typeof fn === "function"){
      fn();
      return;
    }
    original.click();
  }

  function proxy(original, label, secondary=false){
    if(!available(original)) return null;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label || original.textContent.trim();
    if(secondary) btn.className = "secondary";
    btn.disabled = original.disabled;
    btn.dataset.proxyFor = original.id || "";
    btn.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      runAction(original);
      queueMicrotask(update);
    });
    return btn;
  }

  function currentActions(){
    const workout = document.getElementById("workout");
    if(!workout?.classList.contains("active")) return [];

    const setPanel = document.getElementById("setPanel");
    const restPanel = document.getElementById("restPanel");
    const completePanel = document.getElementById("completePanel");

    if(visible(setPanel)){
      const primary = proxy(document.getElementById("completeSetBtn"), "Satz abschließen");
      const secondary = proxy(document.getElementById("deferExerciseBtn"), "Später machen", true);
      return [secondary, primary].filter(Boolean);
    }

    if(visible(restPanel)){
      const secondary = proxy(document.getElementById("addRestBtn"), "+30 Sek.", true);
      const primary = proxy(document.getElementById("skipRestBtn"), "Pause überspringen");
      return [secondary, primary].filter(Boolean);
    }

    if(visible(completePanel)){
      const next = document.getElementById("nextExerciseBlock");
      const finishBlock = document.getElementById("finishWorkoutBlock");
      if(visible(next)){
        const secondary = proxy(document.getElementById("skipNextBtn"), "Überspringen", true);
        const primary = proxy(document.getElementById("startNextBtn"), "Nächste Übung");
        return [secondary, primary].filter(Boolean);
      }
      if(visible(finishBlock)){
        const primary = proxy(document.getElementById("finishWorkoutBtn"), "Training speichern");
        return [primary].filter(Boolean);
      }
    }
    return [];
  }

  function update(){
    const b = ensureBar();
    const workout = document.getElementById("workout");
    const actions = currentActions();
    b.replaceChildren(...actions);
    const on = actions.length > 0;
    b.hidden = !on;
    b.classList.toggle("single", actions.length === 1);
    document.body.classList.toggle("rp-sticky-workout", on);
    workout?.classList.toggle("rp-sticky-actions-active", on);
    if(on) positionBar();
  }

  function init(){
    ensureBar();
    const workout = document.getElementById("workout");
    const main = document.querySelector("main");
    if(workout){
      observer = new MutationObserver(() => queueMicrotask(update));
      observer.observe(workout,{subtree:true,childList:true,attributes:true,characterData:true,attributeFilter:["class","hidden","disabled","style"]});
    }
    if(main){
      const viewObserver = new MutationObserver(() => queueMicrotask(update));
      document.querySelectorAll(".view").forEach(v=>viewObserver.observe(v,{attributes:true,attributeFilter:["class"]}));
    }
    window.addEventListener("resize",positionBar,{passive:true});
    document.addEventListener("click",()=>setTimeout(update,0),true);
    update();
  }

  window.RepPilotStickyActions = {version:VERSION,refresh:update,runAction};
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
