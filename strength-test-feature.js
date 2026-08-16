(() => {
  const VERSION="11.8.47";
  const KEY="reppilot-strength-tests-v1";
  const INTERVAL_DAYS=28;
  const DAY=86400000;
  const BODYWEIGHT=/liegestütz|liegestuetz|hanging leg raise|hängend.*bein/i;

  const fmt=v=>Number(v||0).toLocaleString("de-DE",{maximumFractionDigits:1});
  const roundHalf=v=>Math.round(Number(v||0)*2)/2;
  const estimate1RM=(weight,reps)=>{
    const w=Number(weight||0),r=Math.floor(Number(reps||0));
    if(!w||r<1||r>5)return 0;
    return roundHalf(r===1?w:w*(1+r/30));
  };
  const stepFor=name=>{
    const n=String(name||"").toLowerCase();
    if(/beinpresse|rumänisches kreuzheben|wadenheben/.test(n))return 5;
    if(/seitheben|curl|fly|kabel|extension|pushdown|reverse butterfly/.test(n))return 1;
    return 2.5;
  };
  const trainingWeight=(oneRM,targetReps,name)=>{
    const reps=Math.max(1,Math.floor(Number(targetReps||10)));
    const raw=Number(oneRM||0)/(1+(reps+2)/30);
    const step=stepFor(name);
    return Math.max(step,Math.floor((raw+1e-9)/step)*step);
  };
  const isBodyweight=name=>BODYWEIGHT.test(String(name||""));

  function trackedNames(){
    try{
      const names=new Set();
      (Array.isArray(WORKOUTS)?WORKOUTS:[]).forEach(w=>(w.exercises||[]).forEach(e=>{if(e?.[0])names.add(e[0]);}));
      return names;
    }catch{return new Set()}
  }
  function tracked(name){return trackedNames().has(name);}
  function read(){try{const data=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(data)?data:[]}catch{return []}}
  function write(data){localStorage.setItem(KEY,JSON.stringify(data));}
  function normalizedRecords(){
    const out=[];
    for(const item of read()){
      if(item?.exercise){out.push(item);continue;}
      if(item?.results&&item?.date){
        for(const [exercise,result] of Object.entries(item.results)){
          if(result?.estimated1RM)out.push({date:item.date,exercise,mode:"weight",testWeight:result.weight,reps:result.reps,estimated1RM:result.estimated1RM,trainingWeight:result.trainingWeight||0,targetReps:result.targetReps||10});
        }
      }
    }
    return out.sort((a,b)=>new Date(a.date)-new Date(b.date));
  }
  function latestFor(name){return normalizedRecords().filter(x=>x.exercise===name).slice(-1)[0]||null;}
  function due(name){
    if(!tracked(name))return false;
    const last=latestFor(name);
    if(!last)return true;
    return Date.now()-new Date(last.date).getTime()>=INTERVAL_DAYS*DAY;
  }
  function nextDue(name){const last=latestFor(name);return last?new Date(new Date(last.date).getTime()+INTERVAL_DAYS*DAY):null;}

  function ensureStyles(){
    if(document.getElementById("rpInlineStrengthStyles"))return;
    const s=document.createElement("style");
    s.id="rpInlineStrengthStyles";
    s.textContent=`
      #strengthInlineTest[hidden]{display:none!important}#strengthInlineTest{border:2px solid var(--accent);margin-bottom:14px}
      .rp-test-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.rp-test-head h2{margin:4px 0 5px}.rp-test-head p{margin:0;color:var(--muted);font-size:13px;line-height:1.4}
      .rp-test-badge{flex:0 0 auto;border-radius:999px;background:#111827;color:#fff;padding:7px 10px;font-size:11px;font-weight:900}
      .rp-test-note{margin:14px 0;padding:11px 12px;border-radius:13px;background:#f8fafc;border:1px solid var(--line);font-size:13px;line-height:1.4}
      .rp-test-inputs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.rp-test-inputs.rp-reps-only{grid-template-columns:1fr}
      .rp-test-field label{display:block;margin:0 0 5px;color:var(--muted);font-size:12px;font-weight:900}.rp-test-field input{width:100%;box-sizing:border-box;border:2px solid var(--line);border-radius:14px;background:#fff;padding:13px 12px;font-size:22px;font-weight:900;color:var(--text)}
      .rp-test-result{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:13px 0}.rp-test-result.rp-single{grid-template-columns:1fr}.rp-test-value{padding:11px;border:1px solid var(--line);border-radius:13px;background:#f9fafb}.rp-test-value small{display:block;color:var(--muted);font-size:10px;font-weight:900;letter-spacing:.05em}.rp-test-value strong{display:block;margin-top:4px;font-size:20px}
      .rp-test-actions{display:grid;gap:8px}#strengthAppliedHint{margin:12px 0;padding:12px 13px;border:1px solid #dbe3ea;border-radius:14px;background:#f8fafc}#strengthAppliedHint[hidden]{display:none!important}#strengthAppliedHint small{display:block;color:var(--muted);font-size:10px;font-weight:900;letter-spacing:.07em}#strengthAppliedHint strong{display:block;margin-top:4px;font-size:16px}#strengthAppliedHint span{display:block;margin-top:3px;color:var(--muted);font-size:12px}
      .rp-strength-due{display:inline-flex;margin-left:6px;padding:3px 6px;border-radius:999px;background:#111827;color:#fff;font-size:9px!important;font-weight:900;vertical-align:middle}
    `;
    document.head.appendChild(s);
  }

  function ensureInlinePanel(){
    let panel=document.getElementById("strengthInlineTest");
    if(panel)return panel;
    const setPanel=document.getElementById("setPanel");if(!setPanel)return null;
    panel=document.createElement("article");panel.id="strengthInlineTest";panel.className="card";panel.hidden=true;
    panel.innerHTML=`
      <div class="rp-test-head"><div><small>4-WOCHEN-KRAFTMESSUNG</small><h2 id="strengthInlineName"></h2><p id="strengthInlineSubtitle">Vor den normalen Arbeitssätzen einmal neu kalibrieren.</p></div><span class="rp-test-badge">TEST</span></div>
      <div id="strengthInlineNote" class="rp-test-note"></div><p id="strengthInlinePrevious" class="muted"></p>
      <div id="strengthInlineInputs" class="rp-test-inputs"><div id="strengthWeightField" class="rp-test-field"><label for="strengthInlineWeight">Testgewicht (kg)</label><input id="strengthInlineWeight" type="number" min="0" step="0.5" inputmode="decimal"></div><div class="rp-test-field"><label id="strengthRepsLabel" for="strengthInlineReps">Saubere Wiederholungen</label><input id="strengthInlineReps" type="number" min="1" max="5" step="1" inputmode="numeric"></div></div>
      <div id="strengthInlineResult" class="rp-test-result"><div id="strengthOneRmBox" class="rp-test-value"><small>GESCHÄTZTES 1RM</small><strong id="strengthInline1RM">–</strong></div><div class="rp-test-value"><small id="strengthTrainingLabel">NEUES ARBEITSGEWICHT</small><strong id="strengthInlineTraining">–</strong></div></div>
      <div class="rp-test-actions"><button id="strengthInlineSave" type="button" class="wide">Messung übernehmen & Training starten</button><button id="strengthInlineSkip" type="button" class="secondary wide">Heute überspringen</button><button id="strengthInlineDefer" type="button" class="secondary wide">Gerät besetzt – später machen</button></div>`;
    setPanel.insertAdjacentElement("beforebegin",panel);
    panel.querySelectorAll("input").forEach(x=>x.addEventListener("input",previewInline));
    document.getElementById("strengthInlineSave").onclick=saveInline;
    document.getElementById("strengthInlineSkip").onclick=skipInline;
    document.getElementById("strengthInlineDefer").onclick=()=>{resetPanelState();if(typeof deferCurrentExercise==="function")deferCurrentExercise();};
    return panel;
  }

  function ensureAppliedHint(){
    let box=document.getElementById("strengthAppliedHint");if(box)return box;
    const anchor=document.getElementById("lastTraining");if(!anchor)return null;
    box=document.createElement("div");box.id="strengthAppliedHint";box.hidden=true;anchor.insertAdjacentElement("afterend",box);return box;
  }
  function currentExercise(){try{return typeof current==="function"?current():null}catch{return null}}
  function currentTargetReps(){const e=currentExercise();return Number(e?.sets?.[0]?.reps||10)||10;}
  function currentPreview(){
    const name=currentExercise()?.name||"",body=isBodyweight(name);
    const weight=Number(document.getElementById("strengthInlineWeight")?.value||0),reps=Math.floor(Number(document.getElementById("strengthInlineReps")?.value||0));
    if(body)return {name,body,reps,weight:0,one:0,work:Number(currentExercise()?.sets?.[0]?.weight||0),targetReps:currentTargetReps()};
    const one=estimate1RM(weight,reps),work=one?trainingWeight(one,currentTargetReps(),name):0;
    return {name,body,reps,weight,one,work,targetReps:currentTargetReps()};
  }
  function previewInline(){
    const x=currentPreview(),one=document.getElementById("strengthInline1RM"),work=document.getElementById("strengthInlineTraining");
    if(x.body){if(one)one.textContent=x.reps?`${x.reps} Wdh.`:"–";if(work)work.textContent="unverändert";return;}
    if(one)one.textContent=x.one?`${fmt(x.one)} kg`:"–";if(work)work.textContent=x.work?`${fmt(x.work)} kg`:"–";
  }

  function resetPanelState(){
    const panel=document.getElementById("strengthInlineTest");if(panel)delete panel.dataset.exercise;
    const w=document.getElementById("strengthInlineWeight"),r=document.getElementById("strengthInlineReps");if(w)w.value="";if(r)r.value="";
  }
  function showInline(e){
    const panel=ensureInlinePanel();if(!panel)return;const body=isBodyweight(e.name),setPanel=document.getElementById("setPanel");
    panel.hidden=false;if(setPanel)setPanel.hidden=true;document.getElementById("strengthInlineName").textContent=e.name;
    document.getElementById("strengthInlineSubtitle").textContent=body?"Maximale saubere Wiederholungen als 4-Wochen-Benchmark.":"Vor den normalen Arbeitssätzen einmal neu kalibrieren.";
    document.getElementById("strengthInlineNote").innerHTML=body?"Nach dem Aufwärmen einen technisch sauberen Satz bis kurz vor Technikverlust. RepPilot speichert die <strong>maximalen sauberen Wiederholungen</strong>. Das Körpergewichts-/Effektivgewicht bleibt unverändert.":"Nach deinen Aufwärmsätzen einen schweren, technisch sauberen Satz mit <strong>1–5 Wiederholungen</strong>. Keine erzwungene Wiederholung. RepPilot berechnet daraus das geschätzte 1RM und dein neues Arbeitsgewicht.";
    document.getElementById("strengthWeightField").hidden=body;document.getElementById("strengthInlineInputs").classList.toggle("rp-reps-only",body);document.getElementById("strengthOneRmBox").querySelector("small").textContent=body?"MAX. WIEDERHOLUNGEN":"GESCHÄTZTES 1RM";document.getElementById("strengthTrainingLabel").textContent=body?"BELASTUNG":"NEUES ARBEITSGEWICHT";
    const repsInput=document.getElementById("strengthInlineReps");repsInput.max=body?"200":"5";document.getElementById("strengthRepsLabel").textContent=body?"Maximale saubere Wiederholungen":"Saubere Wiederholungen";
    const prev=latestFor(e.name),p=document.getElementById("strengthInlinePrevious");
    if(p)p.textContent=prev?(prev.mode==="reps"?`Letzte Messung: ${new Date(prev.date).toLocaleDateString("de-DE")} · ${prev.reps} Wdh.`:`Letzte Messung: ${new Date(prev.date).toLocaleDateString("de-DE")} · e1RM ${fmt(prev.estimated1RM)} kg · Arbeitsgewicht ${fmt(prev.trainingWeight||0)} kg`):"Erste Messung: Dieser Wert wird deine Baseline.";
    const testInput=document.getElementById("strengthInlineWeight");
    if(panel.dataset.exercise!==e.name){panel.dataset.exercise=e.name;if(testInput)testInput.value="";if(repsInput)repsInput.value="";}
    if(!body&&testInput&&!testInput.value){const cw=Number(e?.sets?.[0]?.weight||0);if(cw)testInput.value=roundHalf(cw*1.15);}
    if(!repsInput.value)repsInput.value=body?"":"5";
    previewInline();const progression=document.getElementById("progressionHint");if(progression)progression.hidden=true;window.RepPilotStickyActions?.refresh?.();
  }

  function showApplied(e){
    const box=ensureAppliedHint();if(!box)return;const data=e?.strengthTestApplied;box.hidden=!data;if(!data)return;
    box.innerHTML=data.mode==="reps"?`<small>KRAFTMESSUNG ÜBERNOMMEN</small><strong>${data.reps} saubere Wiederholungen</strong><span>Körpergewichtsübung · Belastung bleibt unverändert · nächster Test in 28 Tagen</span>`:`<small>KRAFTMESSUNG ÜBERNOMMEN</small><strong>e1RM ${fmt(data.estimated1RM)} kg → ${fmt(data.trainingWeight)} kg Arbeitsgewicht</strong><span>${data.targetReps} Ziel-Wdh. + ca. 2 Wiederholungen Reserve · automatisch auf sinnvollen Gewichtsschritt gerundet</span>`;
    const progression=document.getElementById("progressionHint");if(progression)progression.hidden=true;
  }
  function hideInline(){const panel=document.getElementById("strengthInlineTest");if(panel)panel.hidden=true;}

  function saveInline(){
    const e=currentExercise(),x=currentPreview();if(!e||!tracked(e.name))return;
    const records=read();
    if(x.body){
      if(x.reps<1){document.getElementById("strengthInlineReps")?.focus();return;}
      records.push({date:new Date().toISOString(),exercise:e.name,mode:"reps",reps:x.reps,formula:"Maximale saubere Wiederholungen"});
      e.strengthTestApplied={mode:"reps",reps:x.reps};
    }else{
      if(!x.weight){document.getElementById("strengthInlineWeight")?.focus();return;}if(x.reps<1||x.reps>5){document.getElementById("strengthInlineReps")?.focus();return;}if(!x.one||!x.work)return;
      records.push({date:new Date().toISOString(),exercise:e.name,mode:"weight",testWeight:x.weight,reps:x.reps,estimated1RM:x.one,trainingWeight:x.work,targetReps:x.targetReps,formula:"Epley + Zielwiederholungen mit 2 RIR"});
      e.strengthTestApplied={mode:"weight",estimated1RM:x.one,trainingWeight:x.work,targetReps:x.targetReps};e.sets.forEach(set=>{if(!set.done)set.weight=x.work;});
    }
    write(records);resetPanelState();hideInline();markPlanDue();if(typeof renderSet==="function")renderSet();window.RepPilotStickyActions?.refresh?.();
  }

  function skipInline(){
    const e=currentExercise();if(!e)return;
    e.strengthTestSkipped=true;
    resetPanelState();hideInline();
    if(typeof renderSet==="function")renderSet();
    window.RepPilotStickyActions?.refresh?.();
  }

  function applyInline(){
    ensureStyles();ensureInlinePanel();ensureAppliedHint();const e=currentExercise(),inSet=typeof phase!=="undefined"&&phase==="set",firstSet=typeof si!=="undefined"&&si===0;
    if(!e||!inSet){hideInline();return;}
    if(firstSet&&due(e.name)&&!e.strengthTestApplied&&!e.strengthTestSkipped){showInline(e);return;}
    hideInline();const setPanel=document.getElementById("setPanel");if(setPanel)setPanel.hidden=false;showApplied(e);
  }

  function markPlanDue(){
    document.querySelectorAll(".rp-day-exercise-list li").forEach(li=>{
      const strong=li.querySelector("strong"),name=(li.dataset.strengthName||strong?.childNodes?.[0]?.nodeValue||strong?.textContent||"").trim();if(!name)return;li.dataset.strengthName=name;
      const existing=li.querySelector(".rp-strength-due"),shouldShow=tracked(name)&&due(name);
      if(shouldShow&&!existing){const badge=document.createElement("small");badge.className="rp-strength-due";badge.textContent=isBodyweight(name)?"Benchmark fällig":"Krafttest fällig";strong?.appendChild(badge);}else if(!shouldShow&&existing)existing.remove();
    });
  }
  function removeStandalone(){document.getElementById("strengthTestHomeCard")?.remove();document.getElementById("strengthTest")?.remove();}
  function install(){
    ensureStyles();removeStandalone();ensureInlinePanel();ensureAppliedHint();
    if(typeof renderSet==="function"&&!window.__repPilotInlineStrengthInstalled){window.__repPilotInlineStrengthInstalled=true;const baseRenderSet=renderSet;renderSet=function(){const result=baseRenderSet.apply(this,arguments);try{applyInline();}catch(error){console.warn("Kraftmessung konnte nicht gerendert werden",error)}return result;};}
    const plan=document.getElementById("plan");if(plan)new MutationObserver(()=>queueMicrotask(markPlanDue)).observe(plan,{childList:true,subtree:true});markPlanDue();try{if(typeof active!=="undefined"&&active&&typeof phase!=="undefined"&&phase==="set")applyInline();}catch{}
  }

  window.RepPilotStrengthTest={version:VERSION,intervalDays:INTERVAL_DAYS,estimate1RM,trainingWeight,due,nextDue,trackedNames,refresh:()=>{applyInline();markPlanDue();}};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
})();