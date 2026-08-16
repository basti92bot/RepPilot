(() => {
  const VERSION="11.8.48";
  const STRENGTH_KEY="reppilot-strength-tests-v1";
  const LEVELS={
    beginner:{label:"Einsteiger",factor:.60,copy:"Neu im Krafttraining oder noch unsicher bei Technik und Belastung."},
    advanced:{label:"Fortgeschritten",factor:.85,copy:"Du trainierst regelmäßig und kennst die Übungen und Geräte."},
    pro:{label:"Profi",factor:1.05,copy:"Mehrjährige Trainingserfahrung und sehr sichere Technik."}
  };
  const BODYWEIGHT=/liegestütz|liegestuetz|hanging leg raise|hängend.*bein|plank|dead bug|mountain climber|superman|bird dog|glute bridge|kniebeugen|lunges|split squat|pike push|crunches|leg raises|snow angels|y-t raises/i;

  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  const fmt=v=>Number(v||0).toLocaleString("de-DE",{maximumFractionDigits:1});
  const isBodyweight=name=>BODYWEIGHT.test(String(name||""));
  const stepFor=name=>{
    const n=String(name||"").toLowerCase();
    if(/beinpresse|rumänisches kreuzheben|wadenheben/.test(n))return 5;
    if(/seitheben|curl|fly|kabel|extension|pushdown|reverse butterfly/.test(n))return 1;
    return 2.5;
  };

  function suggestWeight(name,baseWeight,profile){
    const base=Number(baseWeight||0),bw=Number(profile?.weightKg||0),level=LEVELS[profile?.trainingLevel];
    if(!base||!bw||!level||isBodyweight(name))return 0;
    const bodyFactor=clamp(Math.sqrt(bw/80),.82,1.18);
    const raw=base*level.factor*bodyFactor;
    const step=stepFor(name);
    return Math.max(step,Math.floor((raw+1e-9)/step)*step);
  }

  function ensureStyles(){
    if(document.getElementById("rpOnboardingStyles"))return;
    const s=document.createElement("style");s.id="rpOnboardingStyles";
    s.textContent=`
      #rpOnboarding{position:fixed;inset:0;z-index:9998;background:#0b1020;display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto}
      #rpOnboarding[hidden]{display:none!important}.rp-onboarding-card{width:min(100%,470px);background:#fff;border-radius:24px;padding:22px;box-shadow:0 24px 70px rgba(0,0,0,.38);color:#111827}
      .rp-onboarding-card h2{margin:5px 0 7px;font-size:26px}.rp-onboarding-card>p{margin:0 0 17px;color:#64748b;line-height:1.45}
      .rp-onboarding-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.rp-onboarding-field label{display:block;margin:0 0 5px;font-size:12px;font-weight:900;color:#475569}
      .rp-onboarding-input{display:grid;grid-template-columns:1fr auto;align-items:center;border:2px solid #d1d5db;border-radius:14px;overflow:hidden}.rp-onboarding-input input{width:100%;box-sizing:border-box;border:0;outline:0;padding:14px;font:inherit;font-size:20px;font-weight:900}.rp-onboarding-input span{padding-right:13px;color:#64748b;font-weight:800}
      .rp-level-title{display:block;margin:18px 0 8px;font-size:12px;font-weight:900;color:#475569}.rp-levels{display:grid;gap:8px}.rp-level{width:100%;text-align:left;background:#fff;color:#111827;border:2px solid #e2e8f0;border-radius:14px;padding:12px 13px}.rp-level strong,.rp-level small{display:block}.rp-level small{margin-top:3px;color:#64748b;line-height:1.3}.rp-level.selected{border-color:#111827;background:#f8fafc}.rp-level.selected strong:after{content:" ✓"}
      #rpOnboardingSave{width:100%;margin-top:16px;border:0;border-radius:14px;padding:14px;background:#111827;color:#fff;font:inherit;font-weight:900}.rp-onboarding-note{margin-top:10px!important;font-size:12px;color:#64748b!important}
      #rpStartWeightHint{margin:12px 0;padding:12px 13px;border:1px solid #dbe3ea;border-radius:14px;background:#f8fafc}#rpStartWeightHint[hidden]{display:none!important}#rpStartWeightHint small{display:block;color:#64748b;font-size:10px;font-weight:900;letter-spacing:.07em}#rpStartWeightHint strong{display:block;margin-top:4px;font-size:16px}#rpStartWeightHint span{display:block;margin-top:3px;color:#64748b;font-size:12px;line-height:1.35}
    `;
    document.head.appendChild(s);
  }

  function ensureOverlay(){
    let o=document.getElementById("rpOnboarding");if(o)return o;
    ensureStyles();
    o=document.createElement("div");o.id="rpOnboarding";o.hidden=true;
    o.innerHTML=`<div class="rp-onboarding-card"><small>REPPILOT START</small><h2>Damit dein erstes Training passt 🏋️</h2><p>Gib kurz deine Körperdaten und Erfahrung an. RepPilot schlägt dir danach für jede neue Geräteübung ein vorsichtiges Startgewicht vor.</p><div class="rp-onboarding-grid"><div class="rp-onboarding-field"><label for="rpOnboardingHeight">Größe</label><div class="rp-onboarding-input"><input id="rpOnboardingHeight" type="number" min="100" max="250" step="1" inputmode="numeric"><span>cm</span></div></div><div class="rp-onboarding-field"><label for="rpOnboardingWeight">Gewicht</label><div class="rp-onboarding-input"><input id="rpOnboardingWeight" type="number" min="30" max="300" step="0.1" inputmode="decimal"><span>kg</span></div></div></div><span class="rp-level-title">Wie erfahren bist du?</span><div class="rp-levels">${Object.entries(LEVELS).map(([id,x])=>`<button type="button" class="rp-level" data-rp-level="${id}"><strong>${x.label}</strong><small>${x.copy}</small></button>`).join("")}</div><button id="rpOnboardingSave" type="button">Profil speichern & RepPilot starten</button><p class="rp-onboarding-note">Das Startgewicht ist nur ein Anhaltspunkt. Wenn sich Technik oder Belastung nicht sauber anfühlen, Gewicht direkt reduzieren. Größe wird im Profil gespeichert; die Gewichtsberechnung nutzt bewusst Körpergewicht + Trainingslevel.</p></div>`;
    document.body.appendChild(o);
    o.querySelectorAll("[data-rp-level]").forEach(b=>b.onclick=()=>{o.querySelectorAll("[data-rp-level]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");o.dataset.level=b.dataset.rpLevel;});
    document.getElementById("rpOnboardingSave").onclick=saveOnboarding;
    return o;
  }

  function strengthRecords(){try{const x=JSON.parse(localStorage.getItem(STRENGTH_KEY)||"[]");return Array.isArray(x)?x:[]}catch{return[]}}
  function seedStrengthCycle(profile,at){
    try{
      const rows=strengthRecords(),existing=new Set(rows.filter(x=>x?.exercise).map(x=>x.exercise));
      const seen=new Set();
      (Array.isArray(WORKOUTS)?WORKOUTS:[]).forEach(w=>(w.exercises||[]).forEach(([name,,base])=>{
        if(!name||seen.has(name)||existing.has(name))return;seen.add(name);
        rows.push({date:at,exercise:name,mode:"onboarding",trainingWeight:suggestWeight(name,base,profile),formula:"Onboarding-Startwert; Krafttest nach 28 Tagen"});
      }));
      localStorage.setItem(STRENGTH_KEY,JSON.stringify(rows));
    }catch(e){console.warn("Krafttest-Zyklus konnte nicht vorbereitet werden",e)}
  }

  async function saveOnboarding(){
    const o=ensureOverlay(),heightCm=Number(document.getElementById("rpOnboardingHeight")?.value||0),weightKg=Number(document.getElementById("rpOnboardingWeight")?.value||0),trainingLevel=o.dataset.level;
    if(heightCm<100||heightCm>250){document.getElementById("rpOnboardingHeight")?.focus();return;}
    if(weightKg<30||weightKg>300){document.getElementById("rpOnboardingWeight")?.focus();return;}
    if(!LEVELS[trainingLevel]){o.querySelector("[data-rp-level]")?.focus();return;}
    const at=new Date().toISOString(),profile={heightCm,weightKg,trainingLevel,onboardingCompletedAt:at};
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
    if(p?.onboardingCompletedAt){o.hidden=true;return;}
    document.getElementById("rpOnboardingHeight").value=p?.heightCm||"";
    document.getElementById("rpOnboardingWeight").value=p?.weightKg||"";
    if(LEVELS[p?.trainingLevel]){o.dataset.level=p.trainingLevel;o.querySelector(`[data-rp-level="${p.trainingLevel}"]`)?.classList.add("selected");}
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
    if(s)b.innerHTML=`<small>STARTGEWICHT-VORSCHLAG</small><strong>${fmt(s.weight)} kg</strong><span>Aus Körpergewicht ${fmt(p.weightKg)} kg + Level ${LEVELS[p.trainingLevel]?.label||""}. Nur als Startpunkt – bei unsauberer Technik direkt leichter.</span>`;
  }

  function applySuggestions(){
    let a=null;try{a=typeof active!=="undefined"?active:null}catch{}
    const p=window.repPilotProfile?.get?.()||{};
    if(!a||!p.weightKg||!LEVELS[p.trainingLevel])return;
    for(const e of a.exercises||[]){
      if(e.lastTraining||isBodyweight(e.name))continue;
      const base=Number(e.sets?.[0]?.weight||0);if(!base)continue;
      const weight=suggestWeight(e.name,base,p);if(!weight)continue;
      e.onboardingSuggestion={weight,base,level:p.trainingLevel};
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

  window.RepPilotOnboarding={version:VERSION,levels:LEVELS,suggestWeight,show:maybeShow};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();