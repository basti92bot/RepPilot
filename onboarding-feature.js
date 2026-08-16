(() => {
  const VERSION="11.8.52";
  const STRENGTH_KEY="reppilot-strength-tests-v1";
  const LEVELS={
    beginner:{label:"Einsteiger",factor:.60,copy:"Neu im Krafttraining oder noch unsicher bei Technik und Belastung."},
    advanced:{label:"Fortgeschritten",factor:.85,copy:"Du trainierst regelmäßig und kennst die Übungen und Geräte."},
    pro:{label:"Profi",factor:1.05,copy:"Mehrjährige Trainingserfahrung und sehr sichere Technik."}
  };
  const SEXES={male:{label:"Männlich"},female:{label:"Weiblich"}};
  const BODYWEIGHT=/liegestütz|liegestuetz|hanging leg raise|hängend.*bein|plank|dead bug|mountain climber|superman|bird dog|glute bridge|kniebeugen|lunges|split squat|pike push|crunches|leg raises|snow angels|y-t raises/i;
  const LOWER_BODY=/beinpresse|rumänisches kreuzheben|beinbeuger|beinstrecker|wadenheben|kniebeugen|lunges|split squat|glute bridge/i;

  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const fmt=v=>Number(v||0).toLocaleString("de-DE",{maximumFractionDigits:1});
  const isBodyweight=name=>BODYWEIGHT.test(String(name||""));
  const isLowerBody=name=>LOWER_BODY.test(String(name||""));

  const stepFor=name=>{
    const n=String(name||"").toLowerCase();
    if(/beinpresse|rumänisches kreuzheben|wadenheben/.test(n))return 5;
    if(/seitheben|curl|fly|kabel|extension|pushdown|reverse butterfly/.test(n))return 1;
    return 2.5;
  };

  function sexFactorFor(name,sex){
    if(sex==="male")return 1;
    if(sex==="female")return isLowerBody(name) ? .90 : .78;
    return 0;
  }

  function suggestWeight(name,baseWeight,profile){
    const base=Number(baseWeight||0),bw=Number(profile?.weightKg||0),level=LEVELS[profile?.trainingLevel],sexFactor=sexFactorFor(name,profile?.sex);
    if(!base||!bw||!level||!sexFactor||isBodyweight(name))return 0;
    const bodyFactor=clamp(Math.sqrt(bw/80),.82,1.18);
    const raw=base*level.factor*bodyFactor*sexFactor;
    const step=stepFor(name);
    return Math.max(step,Math.floor((raw+1e-9)/step)*step);
  }

  function ensureStyles(){
    if(document.getElementById("rpOnboardingStyles"))return;
    const s=document.createElement("style");s.id="rpOnboardingStyles";
    s.textContent=`
      #rpOnboarding{position:fixed;inset:0;z-index:9998;background:#0b1020;display:flex;align-items:flex-start;justify-content:center;box-sizing:border-box;min-height:100dvh;padding:calc(env(safe-area-inset-top,0px) + 28px) 18px calc(env(safe-area-inset-bottom,0px) + 28px);overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
      #rpOnboarding[hidden]{display:none!important}.rp-onboarding-card{width:min(100%,470px);flex:0 0 auto;background:#fff;border-radius:24px;padding:22px;box-sizing:border-box;box-shadow:0 24px 70px rgba(0,0,0,.38);color:#111827;margin:0 auto 8px}
      .rp-onboarding-card h2{margin:5px 0 7px;font-size:26px}.rp-onboarding-card>p{margin:0 0 17px;color:#64748b;line-height:1.45}
      .rp-onboarding-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.rp-onboarding-field label{display:block;margin:0 0 5px;font-size:12px;font-weight:900;color:#475569}
      .rp-onboarding-input{display:grid;grid-template-columns:1fr auto;align-items:center;border:2px solid #d1d5db;border-radius:14px;overflow:hidden}.rp-onboarding-input input{width:100%;box-sizing:border-box;border:0;outline:0;padding:14px;font:inherit;font-size:20px;font-weight:900}.rp-onboarding-input span{padding-right:13px;color:#64748b;font-weight:800}
      .rp-option-title{display:block;margin:18px 0 8px;font-size:12px;font-weight:900;color:#475569}.rp-options{display:grid;gap:8px}.rp-options.two{grid-template-columns:1fr 1fr}.rp-option{width:100%;text-align:left;background:#fff;color:#111827;border:2px solid #e2e8f0;border-radius:14px;padding:12px 13px}.rp-option strong,.rp-option small{display:block}.rp-option small{margin-top:3px;color:#64748b;line-height:1.3}.rp-option.selected{border-color:#111827;background:#f8fafc}.rp-option.selected strong:after{content:" ✓"}
      #rpOnboardingSave{width:100%;margin-top:16px;border:0;border-radius:14px;padding:14px;background:#111827;color:#fff;font:inherit;font-weight:900}.rp-onboarding-note{margin-top:10px!important;font-size:12px;color:#64748b!important}
      #rpStartWeightHint{margin:12px 0;padding:12px 13px;border:1px solid #dbe3ea;border-radius:14px;background:#f8fafc}#rpStartWeightHint[hidden]{display:none!important}#rpStartWeightHint small{display:block;color:#64748b;font-size:10px;font-weight:900;letter-spacing:.07em}#rpStartWeightHint strong{display:block;margin-top:4px;font-size:16px}#rpStartWeightHint span{display:block;margin-top:3px;color:#64748b;font-size:12px;line-height:1.35}
      @media(max-width:390px){#rpOnboarding{padding-left:12px;padding-right:12px}.rp-onboarding-card{padding:18px}.rp-onboarding-card h2{font-size:24px}.rp-onboarding-grid{gap:8px}}
    `;
    document.head.appendChild(s);
  }

  function selectOption(root,selector,datasetKey,value){
    root.querySelectorAll(selector).forEach(x=>x.classList.toggle("selected",x.dataset[datasetKey]===value));
  }

  function ensureOverlay(){
    let o=document.getElementById("rpOnboarding");if(o)return o;
    ensureStyles();
    o=document.createElement("div");o.id="rpOnboarding";o.hidden=true;
    o.innerHTML=`<div class="rp-onboarding-card"><small>REPPILOT START</small><h2 id="rpOnboardingTitle">Damit dein erstes Training passt 🏋️</h2><p id="rpOnboardingIntro">Gib kurz deine Körperdaten und Erfahrung an. RepPilot schlägt dir danach für jede neue Geräteübung ein vorsichtiges Startgewicht vor.</p><div class="rp-onboarding-grid"><div class="rp-onboarding-field"><label for="rpOnboardingHeight">Größe</label><div class="rp-onboarding-input"><input id="rpOnboardingHeight" type="number" min="100" max="250" step="1" inputmode="numeric"><span>cm</span></div></div><div class="rp-onboarding-field"><label for="rpOnboardingWeight">Gewicht</label><div class="rp-onboarding-input"><input id="rpOnboardingWeight" type="number" min="30" max="300" step="0.1" inputmode="decimal"><span>kg</span></div></div></div><span class="rp-option-title">Geschlecht</span><div class="rp-options two">${Object.entries(SEXES).map(([id,x])=>`<button type="button" class="rp-option" data-rp-sex="${id}"><strong>${x.label}</strong></button>`).join("")}</div><span class="rp-option-title">Wie erfahren bist du?</span><div class="rp-options">${Object.entries(LEVELS).map(([id,x])=>`<button type="button" class="rp-option" data-rp-level="${id}"><strong>${x.label}</strong><small>${x.copy}</small></button>`).join("")}</div><button id="rpOnboardingSave" type="button">Profil speichern & RepPilot starten</button><p class="rp-onboarding-note">Einsteiger starten mit einem vorsichtigen Gewichtsvorschlag und messen nach 28 Tagen. Fortgeschrittene und Profis bekommen die Kraftmessung bereits im ersten Training angeboten. Die Messung kann jederzeit übersprungen werden.</p></div>`;
    document.body.appendChild(o);

    o.querySelectorAll("[data-rp-sex]").forEach(b=>b.onclick=()=>{o.dataset.sex=b.dataset.rpSex;selectOption(o,"[data-rp-sex]","rpSex",b.dataset.rpSex);});
    o.querySelectorAll("[data-rp-level]").forEach(b=>b.onclick=()=>{o.dataset.level=b.dataset.rpLevel;selectOption(o,"[data-rp-level]","rpLevel",b.dataset.rpLevel);});
    document.getElementById("rpOnboardingSave").onclick=saveOnboarding;
    return o;
  }

  function strengthRecords(){try{const x=JSON.parse(localStorage.getItem(STRENGTH_KEY)||"[]");return Array.isArray(x)?x:[]}catch{return[]}}

  function seedStrengthCycle(profile,at){
    try{
      if(profile?.trainingLevel!=="beginner")return;
      const rows=strengthRecords(),existing=new Set(rows.filter(x=>x?.exercise).map(x=>x.exercise)),seen=new Set();
      (Array.isArray(WORKOUTS)?WORKOUTS:[]).forEach(w=>(w.exercises||[]).forEach(([name,,base])=>{
        if(!name||seen.has(name)||existing.has(name))return;seen.add(name);
        rows.push({date:at,exercise:name,mode:"onboarding",trainingWeight:suggestWeight(name,base,profile),formula:"Einsteiger-Onboarding-Startwert; erste Kraftmessung nach 28 Tagen"});
      }));
      localStorage.setItem(STRENGTH_KEY,JSON.stringify(rows));
    }catch(e){console.warn("Krafttest-Zyklus konnte nicht vorbereitet werden",e)}
  }

  async function saveOnboarding(){
    const o=ensureOverlay(),heightCm=Number(document.getElementById("rpOnboardingHeight")?.value||0),weightKg=Number(document.getElementById("rpOnboardingWeight")?.value||0),sex=o.dataset.sex,trainingLevel=o.dataset.level;
    if(heightCm<100||heightCm>250){document.getElementById("rpOnboardingHeight")?.focus();return;}
    if(weightKg<30||weightKg>300){document.getElementById("rpOnboardingWeight")?.focus();return;}
    if(!SEXES[sex]){o.querySelector("[data-rp-sex]")?.focus();return;}
    if(!LEVELS[trainingLevel]){o.querySelector("[data-rp-level]")?.focus();return;}
    const old=window.repPilotProfile?.get?.()||{},at=old.onboardingCompletedAt||new Date().toISOString(),profile={heightCm,weightKg,sex,trainingLevel,onboardingCompletedAt:at};
    const btn=document.getElementById("rpOnboardingSave");btn.disabled=true;btn.textContent="Wird gespeichert …";
    try{
      if(window.repPilotProfile?.save)await window.repPilotProfile.save(profile);else localStorage.setItem("reppilot-user-profile",JSON.stringify(profile));
      seedStrengthCycle(profile,at);
      o.hidden=true;
      window.RepPilotStrengthTest?.refresh?.();
    }finally{btn.disabled=false;btn.textContent="Profil speichern & RepPilot starten";}
  }

  async function maybeShow(){
    const o=ensureOverlay(),c=window.repPilotSupabase;if(!c)return;
    const{data}=await c.auth.getSession();if(!data?.session){o.hidden=true;return;}
    const p=window.repPilotProfile?.refresh?await window.repPilotProfile.refresh():window.repPilotProfile?.get?.()||{};
    if(p?.onboardingCompletedAt&&p?.sex){o.hidden=true;return;}

    document.getElementById("rpOnboardingHeight").value=p?.heightCm||"";
    document.getElementById("rpOnboardingWeight").value=p?.weightKg||"";
    if(SEXES[p?.sex]){o.dataset.sex=p.sex;selectOption(o,"[data-rp-sex]","rpSex",p.sex);}
    if(LEVELS[p?.trainingLevel]){o.dataset.level=p.trainingLevel;selectOption(o,"[data-rp-level]","rpLevel",p.trainingLevel);}

    const existing=!!p?.onboardingCompletedAt;
    document.getElementById("rpOnboardingTitle").textContent=existing?"Eine Angabe fehlt":"Damit dein erstes Training passt 🏋️";
    document.getElementById("rpOnboardingIntro").textContent=existing?"Deine bisherigen Daten sind schon eingetragen. Bitte ergänze noch Männlich oder Weiblich, damit RepPilot den ersten Gewichtsvorschlag passend berechnen kann.":"Gib kurz deine Körperdaten und Erfahrung an. RepPilot schlägt dir danach für jede neue Geräteübung ein vorsichtiges Startgewicht vor.";
    o.scrollTop=0;
    o.hidden=false;
  }

  function ensureHint(){
    let b=document.getElementById("rpStartWeightHint");if(b)return b;
    const anchor=document.getElementById("lastTraining");if(!anchor)return null;
    b=document.createElement("div");b.id="rpStartWeightHint";b.hidden=true;anchor.insertAdjacentElement("afterend",b);return b;
  }

  function renderHint(){
    const b=ensureHint();if(!b)return;
    let e=null;try{e=typeof current==="function"?current():null}catch{}
    const s=e?.onboardingSuggestion,p=window.repPilotProfile?.get?.()||{};
    b.hidden=!s;
    if(s)b.innerHTML=`<small>STARTGEWICHT-VORSCHLAG</small><strong>${fmt(s.weight)} kg</strong><span>Aus ${fmt(p.weightKg)} kg Körpergewicht + ${SEXES[p.sex]?.label||""} + Level ${LEVELS[p.trainingLevel]?.label||""}. Nur als Startpunkt – bei unsauberer Technik direkt leichter.</span>`;
  }

  function applySuggestions(){
    let a=null;try{a=typeof active!=="undefined"?active:null}catch{}
    const p=window.repPilotProfile?.get?.()||{};
    if(!a||!p.weightKg||!SEXES[p.sex]||!LEVELS[p.trainingLevel])return;
    for(const e of a.exercises||[]){
      if(e.lastTraining||isBodyweight(e.name))continue;
      const base=Number(e.sets?.[0]?.weight||0);if(!base)continue;
      const weight=suggestWeight(e.name,base,p);if(!weight)continue;
      e.onboardingSuggestion={weight,base,level:p.trainingLevel,sex:p.sex};
      (e.sets||[]).forEach(s=>{if(!s.done)s.weight=weight;});
    }
  }

  function installWorkoutHook(){
    if(window.__rpOnboardingWorkoutInstalled||typeof start!=="function")return;
    window.__rpOnboardingWorkoutInstalled=true;
    const baseStart=start;
    start=function(){const result=baseStart.apply(this,arguments);try{applySuggestions();if(typeof renderWorkout==="function")renderWorkout();}catch(e){console.warn("Startgewicht konnte nicht gesetzt werden",e)}return result;};
    if(typeof renderSet==="function"){
      const baseRenderSet=renderSet;
      renderSet=function(){const result=baseRenderSet.apply(this,arguments);try{renderHint();}catch{}return result;};
    }
  }

  function init(){
    ensureStyles();ensureOverlay();ensureHint();installWorkoutHook();
    window.repPilotSupabase?.auth?.onAuthStateChange?.((_event,session)=>{if(session)setTimeout(maybeShow,0);else ensureOverlay().hidden=true;});
    maybeShow();
  }

  window.RepPilotOnboarding={version:VERSION,levels:LEVELS,sexes:SEXES,suggestWeight,sexFactorFor,show:maybeShow};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();