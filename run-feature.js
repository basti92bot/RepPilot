(() => {
  let activeRun = null;
  let runTimer = null;
  const easyDay = WEEK.find(x => x.day === 4);
  if (easyDay) { easyDay.runId = "easy"; easyDay.meta = "Lockerer Dauerlauf · Gesprächstempo"; }
  RUN_PLANS.easy = {title:"Lockerer Dauerlauf",meta:"Ruhiges Gesprächstempo",intro:"Locker laufen. Das Tempo so wählen, dass du dich noch unterhalten könntest.",steps:[["Lockerer Lauf","frei","Ruhiges Gesprächstempo"]],note:"Nach dem Lauf Kilometer auswählen. Die App berechnet daraus deine durchschnittliche Pace."};
  const formatDuration = seconds => { const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=seconds%60; return h>0?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`; };
  const formatPace = paceSeconds => { if(!Number.isFinite(paceSeconds)||paceSeconds<=0)return"–";let m=Math.floor(paceSeconds/60),s=Math.round(paceSeconds%60);if(s===60){m+=1;s=0;}return`${m}:${String(s).padStart(2,"0")} min/km`; };
  const runHistoryEntry=(plan,distanceKm,durationSeconds)=>({type:"run",id:`run-${Date.now()}`,title:plan.title,startedAt:activeRun.startedAt,finishedAt:new Date().toISOString(),distanceKm,durationSeconds,paceSecondsPerKm:durationSeconds/distanceKm});
  const HISTORY_VIEW_KEY="reppilot-history-view-v1";
  const historyView=()=>localStorage.getItem(HISTORY_VIEW_KEY)==="run"?"run":"strength";
  function ensureHistoryTabs(){
    const root=document.getElementById("history"),title=root?.querySelector(":scope>h2");
    if(!root||!title)return null;
    let tabs=document.getElementById("historyTabs");
    if(!tabs){
      const style=document.createElement("style");
      style.id="historyTabsStyles";
      style.textContent=`
        .history-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:-8px 0 20px;padding:5px;background:#f3f4f6;border-radius:16px}
        .history-tab{border:0;border-radius:12px;background:transparent;color:var(--muted);padding:12px 10px;font-weight:900}
        .history-tab.active{background:#fff;color:var(--text);box-shadow:0 2px 8px rgba(17,24,39,.08)}
      `;
      document.head.appendChild(style);
      tabs=document.createElement("div");
      tabs.id="historyTabs";
      tabs.className="history-tabs";
      tabs.innerHTML='<button type="button" class="history-tab" data-history-view="strength">🏋️ Kraft</button><button type="button" class="history-tab" data-history-view="run">🏃 Laufen</button>';
      title.insertAdjacentElement("afterend",tabs);
      tabs.querySelectorAll("[data-history-view]").forEach(btn=>btn.onclick=()=>{
        localStorage.setItem(HISTORY_VIEW_KEY,btn.dataset.historyView);
        renderHistory();
      });
    }
    const view=historyView();
    tabs.querySelectorAll("[data-history-view]").forEach(btn=>btn.classList.toggle("active",btn.dataset.historyView===view));
    return view;
  }
  async function saveRunToCloud(entry){try{const client=window.repPilotSupabase;if(!client)return;const{data:authData,error:authError}=await client.auth.getUser();if(authError||!authData?.user)return;const{error}=await client.from("runs").insert({user_id:authData.user.id,run_type:activeRun?.id||"easy",started_at:entry.startedAt,finished_at:entry.finishedAt,distance_km:Number(entry.distanceKm),duration_seconds:Math.round(Number(entry.durationSeconds))});if(error)console.error("Run Cloud Sync fehlgeschlagen",error);}catch(error){console.error("Run Cloud Sync fehlgeschlagen",error);}}
  function ensureRunControls(){const runSection=document.getElementById("run"),card=runSection?.querySelector("article.card");if(!card||document.getElementById("runTracking"))return;const box=document.createElement("div");box.id="runTracking";box.innerHTML=`<div id="runReady" style="margin-top:18px"><button id="startRunBtn" class="wide">Lauf starten</button></div><div id="runActive" class="center" hidden style="margin-top:18px"><small>LAUF LÄUFT</small><div class="clock" style="margin:12px auto"><strong id="runElapsed">00:00</strong><span>Zeit</span></div><button id="stopRunBtn" class="wide">Lauf beenden</button></div><div id="runFinish" hidden style="margin-top:18px"><h3>Lauf speichern</h3><label for="runDistance">Gelaufene Kilometer</label><div class="weight"><select id="runDistance" style="width:100%;font:inherit;padding:14px;border-radius:12px"></select><span>km</span></div><div class="last-training" style="margin-top:12px"><div><small>ZEIT</small><strong id="runFinalTime">00:00</strong></div><div><small>PACE</small><strong id="runPacePreview">–</strong></div></div><button id="confirmRunBtn" class="wide" style="margin-top:12px">Kilometer bestätigen & speichern</button><button id="cancelRunSaveBtn" class="secondary wide">Nicht speichern</button></div>`;card.appendChild(box);const select=document.getElementById("runDistance");for(let km=1;km<=20.0001;km+=.5){const option=document.createElement("option");option.value=km.toFixed(1);option.textContent=km.toLocaleString("de-DE",{minimumFractionDigits:1,maximumFractionDigits:1});if(Math.abs(km-6)<.01)option.selected=true;select.appendChild(option);}document.getElementById("startRunBtn").onclick=startRunTracking;document.getElementById("stopRunBtn").onclick=stopRunTracking;document.getElementById("confirmRunBtn").onclick=saveRunTracking;document.getElementById("cancelRunSaveBtn").onclick=resetRunTracking;select.onchange=updateRunPacePreview;}
  function startRunTracking(){if(!activeRun)return;activeRun.startedAt=new Date().toISOString();activeRun.startedMs=Date.now();activeRun.durationSeconds=0;document.getElementById("runReady").hidden=true;document.getElementById("runActive").hidden=false;document.getElementById("runFinish").hidden=true;updateRunClock();clearInterval(runTimer);runTimer=setInterval(updateRunClock,1000);}
  function updateRunClock(){if(!activeRun?.startedMs)return;activeRun.durationSeconds=Math.max(1,Math.floor((Date.now()-activeRun.startedMs)/1000));document.getElementById("runElapsed").textContent=formatDuration(activeRun.durationSeconds);}
  function stopRunTracking(){updateRunClock();clearInterval(runTimer);runTimer=null;document.getElementById("runActive").hidden=true;document.getElementById("runFinish").hidden=false;document.getElementById("runFinalTime").textContent=formatDuration(activeRun.durationSeconds);updateRunPacePreview();}
  function updateRunPacePreview(){if(!activeRun?.durationSeconds)return;const distance=Number(document.getElementById("runDistance").value);document.getElementById("runPacePreview").textContent=formatPace(activeRun.durationSeconds/distance);}
  function saveRunTracking(){const distanceKm=Number(document.getElementById("runDistance").value);if(!activeRun||!distanceKm||!activeRun.durationSeconds)return;const entry=runHistoryEntry(activeRun.plan,distanceKm,activeRun.durationSeconds),h=history();h.push(entry);save(h);saveRunToCloud(entry);resetRunTracking();renderHistory();renderHome();show("history");}
  function resetRunTracking(){clearInterval(runTimer);runTimer=null;activeRun=null;const ready=document.getElementById("runReady"),running=document.getElementById("runActive"),finishBox=document.getElementById("runFinish");if(ready)ready.hidden=false;if(running)running.hidden=true;if(finishBox)finishBox.hidden=true;}
  const baseOpenRun=openRun;openRun=function(id){baseOpenRun(id);ensureRunControls();activeRun={id,plan:RUN_PLANS[id],startedAt:null,startedMs:null,durationSeconds:0};document.getElementById("runReady").hidden=false;document.getElementById("runActive").hidden=true;document.getElementById("runFinish").hidden=true;};
  renderHistory=function(){
    const h=history();
    const strength=h.filter(w=>w?.type!=="run"&&Array.isArray(w?.exercises));
    const runs=h.filter(w=>w?.type==="run");
    const view=ensureHistoryTabs()||historyView();
    const bests={};
    for(const w of strength)for(const e of w.exercises||[])for(const s of e.sets||[])if(s.done)bests[e.name]=Math.max(bests[e.name]||0,n(s.weight));

    const setCount=strength.reduce((a,w)=>a+(w.exercises||[]).reduce((b,e)=>b+(e.sets||[]).filter(s=>s.done).length,0),0);
    const volume=strength.reduce((a,w)=>a+total(w),0);
    const maxWorkoutVolume=strength.length?Math.max(...strength.map(w=>total(w))):0;
    const runKm=runs.reduce((a,w)=>a+Number(w.distanceKm||0),0);
    const runSeconds=runs.reduce((a,w)=>a+Number(w.durationSeconds||0),0);
    const avgRunPace=runKm>0?runSeconds/runKm:NaN;
    const fiveKmRuns=runs.filter(w=>Math.abs(Number(w.distanceKm||0)-5)<=.15&&Number(w.durationSeconds||0)>0);
    const bestFivePace=fiveKmRuns.length?Math.min(...fiveKmRuns.map(w=>Number(w.durationSeconds||0)/Number(w.distanceKm||1))):NaN;

    const strengthStats=`<div class="stat"><strong>${strength.length}</strong><small>Krafttrainings</small></div><div class="stat"><strong>${setCount}</strong><small>Sätze</small></div><div class="stat"><strong>${kg(volume)}</strong><small>kg bewegt</small></div><div class="stat"><strong>${kg(maxWorkoutVolume)}</strong><small>kg Bestes Training</small></div>`;
    const runStats=`<div class="stat"><strong>${runs.length}</strong><small>Läufe</small></div><div class="stat"><strong>${runKm.toLocaleString("de-DE",{maximumFractionDigits:1})}</strong><small>km gelaufen</small></div><div class="stat"><strong>${Number.isFinite(avgRunPace)?formatPace(avgRunPace).replace(" min/km",""):"–"}</strong><small>Ø Pace</small></div><div class="stat"><strong>${Number.isFinite(bestFivePace)?formatPace(bestFivePace).replace(" min/km",""):"–"}</strong><small>Beste 5-km-Pace</small></div>`;
    $("stats").innerHTML=view==="run"?runStats:strengthStats;

    const homeStats=document.getElementById("homeStats");
    if(homeStats)homeStats.innerHTML=`<div class="stat"><strong>${Number.isFinite(bestFivePace)?formatPace(bestFivePace).replace(" min/km",""):"–"}</strong><small>Beste 5-km-Pace</small></div><div class="stat"><strong>${kg(maxWorkoutVolume)}</strong><small>kg in 1 Training</small></div><div class="stat"><strong>${kg(volume)}</strong><small>kg bewegt</small></div><div class="stat"><strong>${runKm.toLocaleString("de-DE",{maximumFractionDigits:1})}</strong><small>km gelaufen</small></div>`;

    const items=(view==="run"?runs:strength).slice().reverse();
    $("historyList").innerHTML=items.length?items.map((w,i)=>{
      if(view==="run"){
        const kmText=Number(w.distanceKm||0).toLocaleString("de-DE",{minimumFractionDigits:1,maximumFractionDigits:1});
        return`<details class="history-item" ${i===0?"open":""}><summary><div><h3>🏃 ${w.title||"Lauftraining"}</h3><p>${d(w.finishedAt||w.startedAt)}</p></div><strong>${kmText} km</strong></summary><ul><li><span>Distanz</span><strong>${kmText} km</strong></li><li><span>Zeit</span><strong>${formatDuration(Number(w.durationSeconds||0))}</strong></li><li><span>Pace</span><strong>${formatPace(Number(w.paceSecondsPerKm||0))}</strong></li></ul></details>`;
      }
      return`<details class="history-item" ${i===0?"open":""}><summary><div><h3>${w.title}</h3><p>${d(w.finishedAt||w.startedAt)}</p></div><strong>${kg(total(w))} kg</strong></summary><ul>${(w.exercises||[]).map(e=>{const done=(e.sets||[]).filter(s=>s.done);if(!done.length)return"";const m=Math.max(...done.map(s=>n(s.weight)));return`<li><span>${emo(e.name)} ${e.name}${m===bests[e.name]&&m>0?' <span class="record">🏆</span>':""}</span><strong>${kg(vol(e))} kg</strong></li>`}).join("")}</ul></details>`;
    }).join(""):`<div class="card center muted">${view==="run"?"Noch keine Läufe gespeichert.":"Noch keine Krafttrainings gespeichert."}</div>`;
  };
  const originalCloseRun=document.getElementById("closeRunBtn");if(originalCloseRun)originalCloseRun.onclick=()=>{if(activeRun?.startedMs&&!confirm("Lauf läuft noch. Wirklich abbrechen?"))return;resetRunTracking();renderHome();show("home");};renderHome();renderHistory();
})();