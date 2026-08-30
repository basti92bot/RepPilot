(() => {
  const VERSION = "11.8.86";
  const HISTORY_KEY = "reppilot-history";
  const PROFILE_KEY = "reppilot-user-profile";
  const WEIGHT_HISTORY_KEY = "reppilot-weight-history";
  const PLAN_KEY = "reppilot-selected-training-plan";
  const STRENGTH_TEST_KEY = "reppilot-strength-tests-v1";
  const STRENGTH_STATE_KEY = "reppilot-strength-test-state-v2";
  const BACKUP_KEY = "reppilot-training-data-backup-v1";

  function injectStyles(){
    if(document.getElementById("resetFeatureStyles")) return;
    const style=document.createElement("style");
    style.id="resetFeatureStyles";
    style.textContent=`
      .reset-section{margin-top:28px}.reset-section>h2{margin:0 0 14px;font-size:28px}.reset-card{padding:0;overflow:hidden}.reset-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px;background:#fff;color:var(--text);border:0;border-radius:0;text-align:left}.reset-row+.reset-row{border-top:1px solid var(--line)}.reset-row strong{display:block;font-size:18px;color:#a13f33}.reset-row small{display:block;margin-top:5px;color:var(--muted);font-size:13px;line-height:1.35}.reset-arrow{font-size:28px;color:#b45345;font-weight:900;flex:0 0 auto}
    `;
    document.head.appendChild(style);
  }

  async function currentUser(){
    try{
      const client=window.repPilotSupabase;
      if(!client)return null;
      const {data}=await client.auth.getUser();
      return data?.user||null;
    }catch{return null}
  }

  async function clearCloudTrainingData(){
    const client=window.repPilotSupabase;
    const user=await currentUser();
    if(!client||!user)return {ok:true,cloud:false};

    const operations=[
      ["workouts",client.from("workouts").delete().eq("user_id",user.id)],
      ["runs",client.from("runs").delete().eq("user_id",user.id)],
      ["apple_workouts",client.from("apple_workouts").delete().eq("user_id",user.id)],
      ["strength_measurements",client.from("strength_measurements").delete().eq("user_id",user.id)]
    ];

    for(const [name,promise] of operations){
      const {error}=await promise;
      if(error)throw new Error(`${name}: ${error.message||error}`);
    }
    return {ok:true,cloud:true};
  }

  async function clearCloudProfile(){
    try{
      const client=window.repPilotSupabase,user=await currentUser();if(!client||!user)return;
      const {error}=await client.from("profiles").update({height_cm:null,weight_kg:null,training_level:null,sex:null,onboarding_completed_at:null,training_focus:null,training_days_per_week:null,training_days:null}).eq("id",user.id);
      if(error)throw error;
    }catch(error){
      console.warn("Cloud-Profil konnte nicht zurückgesetzt werden",error);
      throw error;
    }
  }

  function removeTrainingLocal(){
    if(window.RepPilotTrainingDataPersistence?.resetLocalTrainingData){
      window.RepPilotTrainingDataPersistence.resetLocalTrainingData();
      return;
    }
    const keys=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key&&key.startsWith("reppilot-history"))keys.push(key);
    }
    keys.forEach(key=>localStorage.removeItem(key));
    [HISTORY_KEY,STRENGTH_TEST_KEY,STRENGTH_STATE_KEY,BACKUP_KEY,"reppilot-last-cloud-sync","reppilot-cloud-history-sync-v1","reppilot-apple-health-sync"].forEach(key=>localStorage.removeItem(key));
  }

  function refreshScreens(){
    try{if(typeof renderHistory==="function")renderHistory()}catch{}
    try{if(typeof renderHome==="function")renderHome()}catch{}
    try{window.RepPilotPersonalRecords?.refresh?.()}catch{}
    try{window.repPilotProfile?.refresh?.().then(p=>window.repPilotProfile?.render?.(p))}catch{}
  }

  async function resetTrainingData(){
    const ok=confirm("Trainingsdaten wirklich zurücksetzen? Kraft- und Lauftrainings, Sätze, Gewichte, Wiederholungen, Rekorde, Kraftmessungen und importierte Apple-Workouts werden dauerhaft gelöscht. Das kann nicht rückgängig gemacht werden.");
    if(!ok)return;

    const button=document.getElementById("resetTrainingDataBtn");
    if(button){button.disabled=true;button.querySelector("strong").textContent="Trainingsdaten werden gelöscht …";}
    try{
      await clearCloudTrainingData();
      removeTrainingLocal();
      refreshScreens();
      alert("Trainingsdaten wurden vollständig zurückgesetzt.");
      location.reload();
    }catch(error){
      console.error("Trainingsdaten konnten nicht vollständig zurückgesetzt werden",error);
      alert("Trainingsdaten wurden NICHT gelöscht, weil die Cloud nicht vollständig zurückgesetzt werden konnte. Bitte Verbindung prüfen und erneut versuchen.");
      if(button){button.disabled=false;button.querySelector("strong").textContent="Trainingsdaten zurücksetzen";}
    }
  }

  async function resetProfileSettings(){
    const ok=confirm("Profil und Einstellungen wirklich zurücksetzen? Körperdaten, Trainingswünsche und ausgewählter Plan werden gelöscht. Deine gespeicherten Trainings, Läufe, Gewichte, Kraftmessungen und Rekorde bleiben erhalten.");
    if(!ok)return;
    try{
      [PROFILE_KEY,WEIGHT_HISTORY_KEY,PLAN_KEY].forEach(key=>localStorage.removeItem(key));
      await clearCloudProfile();
      alert("Profil und Einstellungen wurden zurückgesetzt. Deine Trainingsdaten bleiben erhalten.");
      location.reload();
    }catch(error){
      alert("Profil konnte nicht vollständig zurückgesetzt werden. Deine Trainingsdaten wurden nicht verändert.");
    }
  }

  function ensureUI(){
    const profile=document.getElementById("profile");
    if(!profile)return false;
    const existing=document.getElementById("resetDataSection");
    if(existing){if(existing!==profile.lastElementChild)profile.appendChild(existing);return true;}
    injectStyles();
    const section=document.createElement("div");
    section.id="resetDataSection";
    section.className="reset-section";
    section.innerHTML=`<h2>Daten & Verlauf</h2><article class="card reset-card"><button type="button" class="reset-row" id="resetTrainingDataBtn"><span><strong>Trainingsdaten zurücksetzen</strong><small>Alle Kraft- und Lauftrainings, Sätze, Gewichte, Wiederholungen, Rekorde, Kraftmessungen und Apple-Workouts löschen. Nur diese Aktion darf Trainingsdaten löschen.</small></span><span class="reset-arrow">›</span></button><button type="button" class="reset-row" id="resetProfileSettingsBtn"><span><strong>Profil & Einstellungen zurücksetzen</strong><small>Körperdaten, Trainingswünsche und Plan zurücksetzen. Gespeicherte Trainingsdaten bleiben vollständig erhalten.</small></span><span class="reset-arrow">›</span></button></article>`;
    profile.appendChild(section);
    document.getElementById("resetTrainingDataBtn").onclick=resetTrainingData;
    document.getElementById("resetProfileSettingsBtn").onclick=resetProfileSettings;
    const observer=new MutationObserver(()=>{if(section!==profile.lastElementChild)requestAnimationFrame(()=>profile.appendChild(section));});
    observer.observe(profile,{childList:true});
    return true;
  }

  function init(){
    if(ensureUI())return;
    let tries=0;
    const timer=setInterval(()=>{tries++;if(ensureUI()||tries>=20)clearInterval(timer)},250);
  }

  window.RepPilotReset={version:VERSION,resetTrainingData};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

(() => {
  if (typeof stretchArt !== "function") return;
  const baseStretchArt = stretchArt;
  const image = (src, alt) => `<img src="${src}" alt="${alt}" style="display:block;width:100%;height:auto;border-radius:18px">`;
  stretchArt = type => {if (type === "upper-back") return image("./stretch-upper-back-v11.8.29.svg?v=11.8.29", "Oberer Rücken Dehnübung");if (type === "lower-back") return image("./stretch-lower-back-v11.8.29.svg?v=11.8.29", "Unterer Rücken Dehnübung");return baseStretchArt(type);};
  const refreshStretchImages = () => {try{if(typeof renderStretchPreview === "function") renderStretchPreview()}catch{}};
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", refreshStretchImages, {once:true});else refreshStretchImages();
})();

(() => {
  const loadStretchImages = () => {if(document.getElementById("stretchImagesV11830")) return;const s=document.createElement("script");s.id="stretchImagesV11830";s.src="./stretch-images-v11.8.30.js?v=11.8.30";s.async=false;document.body.appendChild(s);};
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",loadStretchImages,{once:true});else loadStretchImages();
})();