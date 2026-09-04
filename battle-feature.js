(() => {
  const VERSION="11.8.123";
  const BODYWEIGHT=/liegestütz|liegestuetz|hanging leg raise|hängend.*bein|unterarmstütz|seitstütz|beinheben|bergsteiger|hüftheben|ausfallschritt|kniebeugen|rückenstrecker|schneeengel|arm-bein-strecken|y-t-heben/i;
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const fmt=value=>Number(value||0).toLocaleString("de-DE",{maximumFractionDigits:2});
  const date=value=>new Date(value).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});
  let busy=false;

  function client(){return window.repPilotSupabase||null}
  async function currentUser(){
    const db=client();
    if(!db)return null;
    const {data}=await db.auth.getUser();
    return data?.user||null;
  }
  function exercises(){
    const names=[...(window.RepPilotStrengthTest?.trackedNames?.()||[])];
    return names.filter(name=>name&&!name.startsWith("home::")&&!BODYWEIGHT.test(name)).sort((a,b)=>a.localeCompare(b,"de"));
  }
  function setMessage(message,type=""){
    const box=$("battleMessage");
    if(!box)return;
    box.hidden=!message;
    box.className=`battle-message ${type}`.trim();
    box.textContent=message||"";
  }
  function setBusy(value){
    busy=value;
    document.querySelectorAll("[data-battle-action]").forEach(button=>button.disabled=value);
  }
  function showTrainingNav(){
    document.querySelectorAll("nav button").forEach(button=>button.classList.toggle("active",button.dataset.view==="trainingHub"));
  }
  function back(){
    const overview=$("trainingHubOverview"),session=$("runnerStrengthSession");
    if(overview)overview.hidden=false;
    if(session){session.hidden=true;session.innerHTML=""}
    showTrainingNav();
    requestAnimationFrame(()=>scrollTo({top:0,left:0,behavior:"auto"}));
  }
  function resultMarkup(battle,results,userId){
    const own=results.find(row=>row.user_id===userId);
    const other=results.find(row=>row.user_id!==userId);
    const completed=results.length===2;
    let verdict="";
    if(completed){
      const diff=Number(own?.relative_score||0)-Number(other?.relative_score||0);
      verdict=Math.abs(diff)<.0005?"Unentschieden":diff>0?"Du führst 🏆":"Dein Gegner führt";
    }
    const score=row=>row?`<div class="battle-score"><strong>${esc(row.display_name)}</strong><span>${fmt(row.estimated_1rm)} kg e1RM</span><span>${fmt(row.relative_score)} × Körpergewicht</span></div>`:`<div class="battle-score waiting"><strong>Ergebnis offen</strong><span>Neue Kraftmessung erforderlich</span></div>`;
    const canSubmit=battle.status!=="pending"&&new Date(battle.deadline_at)>new Date();
    return `
      <article class="card battle-card">
        <div class="battle-card-head"><div><small>${battle.status==="pending"?"EINLADUNG OFFEN":completed?"DUELL BEENDET":"DUELL LÄUFT"}</small><h3>${esc(battle.exercise)}</h3></div><span class="battle-deadline">bis ${date(battle.deadline_at)}</span></div>
        <div class="battle-versus">${score(own)}<b>VS</b>${score(other)}</div>
        ${verdict?`<p class="battle-verdict">${verdict}</p>`:""}
        ${battle.status==="pending"?`<div class="battle-code"><span>Code <strong>${esc(battle.invite_code)}</strong></span><button class="secondary" data-copy-code="${esc(battle.invite_code)}" data-battle-action>Kopieren</button></div><p class="muted">Teile den Code mit genau einer Person.</p>`:""}
        ${canSubmit&&!own?`<button class="wide" data-submit-battle="${esc(battle.id)}" data-battle-action>Ergebnis prüfen & übernehmen</button><p class="muted">Der Krafttest für diese Übung ist im nächsten Training vorgemerkt. Es zählt nur eine Messung nach Annahme des Duells.</p>`:""}
      </article>`;
  }
  async function loadBattles(){
    const db=client(),user=await currentUser();
    if(!db||!user)return [];
    const {data:battles,error}=await db.from("strength_battles").select("*").order("created_at",{ascending:false});
    if(error)throw error;
    const ids=(battles||[]).map(row=>row.id);
    if(!ids.length)return [];
    const {data:results,error:resultError}=await db.from("strength_battle_results").select("*").in("battle_id",ids);
    if(resultError)throw resultError;
    return (battles||[]).map(battle=>({battle,results:(results||[]).filter(row=>row.battle_id===battle.id),userId:user.id}));
  }
  async function refresh(){
    const list=$("battleList");
    if(!list)return;
    list.innerHTML='<article class="card center muted">Duelle werden geladen …</article>';
    try{
      const rows=await loadBattles();
      rows.forEach(({battle,results,userId})=>{
        if(battle.status==="active"&&!results.some(row=>row.user_id===userId))window.RepPilotStrengthTest?.requestBattleTest?.(battle.exercise);
      });
      list.innerHTML=rows.length?rows.map(row=>resultMarkup(row.battle,row.results,row.userId)).join(""):'<article class="card center muted">Noch kein Duell vorhanden.</article>';
      bindDynamic();
    }catch(error){
      list.innerHTML='<article class="card center muted">Duelle konnten nicht geladen werden.</article>';
      setMessage(error?.message||"Unbekannter Fehler","error");
    }
  }
  async function createBattle(){
    if(busy)return;
    const exercise=$("battleExercise")?.value;
    if(!exercise)return setMessage("Bitte zuerst eine Übung wählen.","error");
    setBusy(true);setMessage("");
    try{
      const {data,error}=await client().rpc("create_strength_battle",{p_exercise:exercise,p_days:7});
      if(error)throw error;
      setMessage(`Duell erstellt. Einladungscode: ${data.invite_code}`,"success");
      await refresh();
    }catch(error){setMessage(error?.message||"Duell konnte nicht erstellt werden.","error")}
    finally{setBusy(false)}
  }
  async function acceptBattle(){
    if(busy)return;
    const code=$("battleInviteCode")?.value.trim().toUpperCase();
    if(!/^[A-Z0-9]{8}$/.test(code||""))return setMessage("Bitte den achtstelligen Einladungscode eingeben.","error");
    setBusy(true);setMessage("");
    try{
      const {data,error}=await client().rpc("accept_strength_battle",{p_code:code});
      if(error)throw error;
      $("battleInviteCode").value="";
      setMessage(`Duell für ${data.exercise} angenommen.`,"success");
      await refresh();
    }catch(error){setMessage(error?.message||"Einladung konnte nicht angenommen werden.","error")}
    finally{setBusy(false)}
  }
  async function submitResult(id){
    if(busy)return;
    setBusy(true);setMessage("");
    try{
      await window.RepPilotStrengthTest?.syncCloud?.();
      const {error}=await client().rpc("submit_strength_battle_result",{p_battle_id:id});
      if(error)throw error;
      setMessage("Deine Kraftmessung wurde für das Duell übernommen.","success");
      await refresh();
    }catch(error){setMessage(error?.message||"Ergebnis konnte nicht übernommen werden.","error")}
    finally{setBusy(false)}
  }
  function bindDynamic(){
    document.querySelectorAll("[data-copy-code]").forEach(button=>button.onclick=async()=>{
      try{await navigator.clipboard.writeText(button.dataset.copyCode);setMessage("Einladungscode kopiert.","success")}
      catch{setMessage(`Code: ${button.dataset.copyCode}`)}
    });
    document.querySelectorAll("[data-submit-battle]").forEach(button=>button.onclick=()=>submitResult(button.dataset.submitBattle));
  }
  async function open(){
    const overview=$("trainingHubOverview"),session=$("runnerStrengthSession");
    if(!session)return;
    if(overview)overview.hidden=true;
    session.hidden=false;
    session.innerHTML=`
      <div class="top"><div><small>1 GEGEN 1</small><h2>Kraft-Duell</h2></div><button id="closeBattle" class="secondary">Zurück</button></div>
      <article class="card battle-intro"><h3>Fairer Kraftvergleich</h3><p>Ihr habt sieben Tage. Es zählen absolutes e1RM und das e1RM im Verhältnis zum Körpergewicht. Das Körpergewicht selbst wird nicht angezeigt.</p></article>
      <div id="battleMessage" class="battle-message" hidden></div>
      <article class="card"><h3>Neues Duell</h3><label for="battleExercise">Übung</label><select id="battleExercise">${exercises().map(name=>`<option>${esc(name)}</option>`).join("")}</select><button id="createBattle" class="wide" data-battle-action>Einladung erstellen</button></article>
      <article class="card"><h3>Einladung annehmen</h3><label for="battleInviteCode">Einladungscode</label><input id="battleInviteCode" maxlength="8" autocapitalize="characters" autocomplete="off" placeholder="AB12CD34"><button id="acceptBattle" class="wide" data-battle-action>Duell annehmen</button></article>
      <h2>Meine Duelle</h2><div id="battleList" class="stack"></div>`;
    $("closeBattle").onclick=back;
    $("createBattle").onclick=createBattle;
    $("acceptBattle").onclick=acceptBattle;
    showTrainingNav();
    requestAnimationFrame(()=>scrollTo({top:0,left:0,behavior:"auto"}));
    await refresh();
  }
  function styles(){
    if($("battleFeatureStyles"))return;
    const style=document.createElement("style");style.id="battleFeatureStyles";
    style.textContent=`.battle-intro{border-color:#c7d2fe}.battle-message{padding:14px 16px;border-radius:14px;margin:12px 0;background:#eef2ff;color:#3730a3;font-weight:800}.battle-message.error{background:#fff1f2;color:#9f1239}.battle-message.success{background:#ecfdf5;color:#065f46}.battle-card-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.battle-card-head h3{margin:.2rem 0}.battle-deadline{white-space:nowrap;color:#6b7280;font-size:.82rem}.battle-versus{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;margin:16px 0}.battle-versus>b{font-size:.78rem;color:#6b7280}.battle-score{display:flex;flex-direction:column;gap:3px;padding:12px;border-radius:14px;background:#f3f4f6}.battle-score span{font-size:.82rem;color:#4b5563}.battle-score.waiting{opacity:.7}.battle-verdict{text-align:center;font-weight:900;color:#111827}.battle-code{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0}.battle-code strong{letter-spacing:.12em}.battle-card button.wide{margin-top:10px}#battleExercise,#battleInviteCode{width:100%;box-sizing:border-box;margin:6px 0 14px;padding:14px;border:1px solid #d1d5db;border-radius:13px;background:#fff;color:#111827;font:inherit}@media(max-width:430px){.battle-versus{grid-template-columns:1fr}.battle-versus>b{text-align:center}.battle-card-head{display:block}.battle-deadline{display:block;margin-top:4px}}`;
    document.head.appendChild(style);
  }
  function init(){styles();window.RepPilotBattle={version:VERSION,open,refresh};}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
