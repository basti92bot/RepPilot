(() => {
  const VERSION="11.8.85";
  const SYNC_KEY="reppilot-apple-health-sync";
  let syncing=false;

  const fmt=n=>Number(n||0).toLocaleString("de-DE",{maximumFractionDigits:1});
  const pace=s=>{if(!Number.isFinite(Number(s))||Number(s)<=0)return"–";let m=Math.floor(Number(s)/60),sec=Math.round(Number(s)%60);if(sec===60){m++;sec=0}return`${m}:${String(sec).padStart(2,"0")} min/km`};
  const date=v=>v?new Date(v).toLocaleDateString("de-DE"):"–";

  function ensureStyles(){
    if(document.getElementById("appleHealthStyles"))return;
    const style=document.createElement("style");
    style.id="appleHealthStyles";
    style.textContent=`
      .apple-health-card{margin-top:16px}
      .apple-health-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
      .apple-health-title{display:flex;align-items:center;gap:11px}
      .apple-health-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:#111827;color:#fff;font-size:23px;font-weight:900}
      .apple-health-title h3{margin:2px 0 0;font-size:20px}
      .apple-health-title small{color:var(--muted);font-weight:900;letter-spacing:.06em}
      .apple-health-state{margin:14px 0;padding:12px 13px;border:1px solid var(--line);border-radius:14px;background:#f9fafb}
      .apple-health-state strong{display:block;font-size:15px}
      .apple-health-state span{display:block;margin-top:4px;color:var(--muted);font-size:13px;line-height:1.4}
      .apple-health-metrics{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}
      .apple-health-metric{padding:11px;border:1px solid var(--line);border-radius:13px;background:#fff}
      .apple-health-metric small{display:block;color:var(--muted);font-size:10px;font-weight:900}
      .apple-health-metric strong{display:block;margin-top:3px;font-size:16px}
      .apple-health-note{margin:10px 0 0;color:var(--muted);font-size:12px;line-height:1.45}
      .apple-health-details{margin-top:14px;border-top:1px solid var(--line)}
      .apple-health-details summary{list-style:none;cursor:pointer;padding:12px 0 2px;font-size:13px;font-weight:900;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:12px}
      .apple-health-details summary::-webkit-details-marker{display:none}
      .apple-health-details summary:after{content:"⌄";font-size:18px;color:var(--muted);transition:transform .18s ease}
      .apple-health-details[open] summary:after{transform:rotate(180deg)}
      .apple-health-details-content{padding-top:2px}
    `;
    document.head.appendChild(style);
  }

  function ensureUI(){
    const profile=document.getElementById("profile");
    const profileCard=profile?.querySelector(".profile-card");
    if(!profile||!profileCard)return null;
    ensureStyles();
    let card=document.getElementById("appleHealthCard");
    if(card)return card;
    card=document.createElement("article");
    card.id="appleHealthCard";
    card.className="card apple-health-card";
    card.innerHTML=`
      <div class="apple-health-head">
        <div class="apple-health-title"><div class="apple-health-icon"></div><div><small>APPLE FITNESS</small><h3>Apple Health</h3></div></div>
        <button id="appleHealthRefreshBtn" class="secondary" type="button">Aktualisieren</button>
      </div>
      <details id="appleHealthDetails" class="apple-health-details">
        <summary>Details anzeigen</summary>
        <div id="appleHealthDetailsContent" class="apple-health-details-content">
          <div class="apple-health-state" id="appleHealthState"><strong>HealthKit-Bridge bereit</strong><span>Noch keine Apple-Workouts importiert.</span></div>
          <div id="appleHealthMetrics" class="apple-health-metrics" hidden></div>
          <p class="apple-health-note">RepPilot liest HealthKit nicht direkt im Browser. Die iPhone-Bridge überträgt ausschließlich die von dir freigegebenen Workout-Daten in deinen eigenen RepPilot-Account.</p>
        </div>
      </details>`;
    profileCard.insertAdjacentElement("afterend",card);
    document.getElementById("appleHealthRefreshBtn").onclick=syncFromCloud;
    return card;
  }

  function toRun(row){
    const distance=Number(row.distance_km||0),duration=Number(row.duration_seconds||0);
    if(!distance||!duration)return null;
    return {
      type:"run",
      id:`healthkit-${row.healthkit_uuid}`,
      source:"apple_health",
      healthkitUuid:row.healthkit_uuid,
      title:"Apple Fitness Lauf",
      startedAt:row.started_at,
      finishedAt:row.finished_at,
      distanceKm:distance,
      durationSeconds:duration,
      paceSecondsPerKm:duration/distance,
      activeEnergyKcal:Number(row.active_energy_kcal)||null,
      avgHeartRateBpm:Number(row.avg_heart_rate_bpm)||null,
      maxHeartRateBpm:Number(row.max_heart_rate_bpm)||null,
      cadenceSpm:Number(row.cadence_spm)||null,
      runningPowerW:Number(row.running_power_w)||null,
      strideLengthM:Number(row.stride_length_m)||null,
      groundContactMs:Number(row.ground_contact_ms)||null,
      verticalOscillationCm:Number(row.vertical_oscillation_cm)||null,
      sourceName:row.source_name||"Apple Health"
    };
  }

  function mirrorIntoHistory(rows){
    if(typeof history!=="function"||typeof save!=="function")return 0;
    const appleRuns=rows.filter(r=>String(r.activity_type||"").toLowerCase().includes("run")).map(toRun).filter(Boolean);
    const local=history().filter(x=>x?.source!=="apple_health");
    const merged=[...local,...appleRuns].sort((a,b)=>new Date(a.finishedAt||a.startedAt||0)-new Date(b.finishedAt||b.startedAt||0));
    save(merged);
    try{if(typeof renderHistory==="function")renderHistory()}catch{}
    try{if(typeof renderHome==="function")renderHome()}catch{}
    return appleRuns.length;
  }

  function renderState(rows){
    ensureUI();
    const state=document.getElementById("appleHealthState"),metrics=document.getElementById("appleHealthMetrics");
    if(!state||!metrics)return;
    if(!rows.length){
      state.innerHTML=`<strong>Bereit für Apple Health</strong><span>Noch keine HealthKit-Workouts in der Cloud. Sobald die iPhone-Bridge verbunden ist, erscheinen sie hier automatisch.</span>`;
      metrics.hidden=true;
      return;
    }
    const sorted=[...rows].sort((a,b)=>new Date(b.started_at)-new Date(a.started_at));
    const latest=sorted[0];
    const runs=sorted.filter(r=>String(r.activity_type||"").toLowerCase().includes("run"));
    const km=runs.reduce((s,r)=>s+Number(r.distance_km||0),0);
    const duration=runs.reduce((s,r)=>s+Number(r.duration_seconds||0),0);
    const avg=km>0?duration/km:null;
    state.innerHTML=`<strong>Apple Health verbunden</strong><span>${rows.length} Workout${rows.length===1?"":"s"} importiert · zuletzt ${date(latest.started_at)}</span>`;
    metrics.innerHTML=`
      <div class="apple-health-metric"><small>APPLE-LÄUFE</small><strong>${runs.length}</strong></div>
      <div class="apple-health-metric"><small>DISTANZ</small><strong>${fmt(km)} km</strong></div>
      <div class="apple-health-metric"><small>Ø PACE</small><strong>${pace(avg)}</strong></div>
      <div class="apple-health-metric"><small>LETZTER IMPORT</small><strong>${date(latest.started_at)}</strong></div>`;
    metrics.hidden=false;
  }

  async function syncFromCloud(){
    if(syncing)return;
    const client=window.repPilotSupabase;
    if(!client)return;
    syncing=true;
    const btn=document.getElementById("appleHealthRefreshBtn");
    if(btn){btn.disabled=true;btn.textContent="Lade…"}
    try{
      const {data:userData}=await client.auth.getUser();
      const user=userData?.user;
      if(!user){renderState([]);return}
      const {data,error}=await client.from("apple_workouts").select("healthkit_uuid,activity_type,source_name,device_model,started_at,finished_at,duration_seconds,distance_km,active_energy_kcal,avg_heart_rate_bpm,max_heart_rate_bpm,step_count,cadence_spm,avg_speed_mps,running_power_w,stride_length_m,ground_contact_ms,vertical_oscillation_cm,elevation_gain_m,route_available").eq("user_id",user.id).order("started_at",{ascending:false}).limit(250);
      if(error)throw error;
      const rows=data||[];
      const mirrored=mirrorIntoHistory(rows);
      renderState(rows);
      localStorage.setItem(SYNC_KEY,JSON.stringify({at:new Date().toISOString(),count:rows.length,mirrored}));
    }catch(error){
      const state=document.getElementById("appleHealthState");
      if(state)state.innerHTML=`<strong>Apple Health konnte nicht geladen werden</strong><span>${error?.message||"Cloud-Verbindung prüfen."}</span>`;
    }finally{
      syncing=false;
      if(btn){btn.disabled=false;btn.textContent="Aktualisieren"}
    }
  }

  function init(){
    let tries=0;
    const timer=setInterval(()=>{tries++;if(ensureUI()||tries>=30)clearInterval(timer)},200);
    setTimeout(syncFromCloud,700);
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")syncFromCloud()});
    window.repPilotSupabase?.auth?.onAuthStateChange?.((_event,session)=>{if(session)setTimeout(syncFromCloud,250)});
  }

  window.RepPilotAppleHealth={version:VERSION,sync:syncFromCloud};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();