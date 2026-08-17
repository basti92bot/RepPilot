(() => {
  const VERSION = "11.8.56";
  const HISTORY_KEY = "reppilot-history";
  const PROFILE_KEY = "reppilot-user-profile";
  const WEIGHT_HISTORY_KEY = "reppilot-weight-history";
  const PLAN_KEY = "reppilot-selected-training-plan";
  const STRENGTH_TEST_KEY = "reppilot-strength-tests-v1";

  function injectStyles(){
    if(document.getElementById("resetFeatureStyles")) return;
    const style=document.createElement("style");
    style.id="resetFeatureStyles";
    style.textContent=`
      .reset-section{margin-top:28px}.reset-section>h2{margin:0 0 14px;font-size:28px}.reset-card{padding:0;overflow:hidden}.reset-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px;background:#fff;color:var(--text);border:0;border-radius:0;text-align:left}.reset-row+.reset-row{border-top:1px solid var(--line)}.reset-row strong{display:block;font-size:18px;color:#a13f33}.reset-row small{display:block;margin-top:5px;color:var(--muted);font-size:13px;line-height:1.35}.reset-arrow{font-size:28px;color:#b45345;font-weight:900;flex:0 0 auto}
    `;
    document.head.appendChild(style);
  }

  function removeHistoryLocal(){const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&key.startsWith("reppilot-history"))keys.push(key)}keys.forEach(key=>localStorage.removeItem(key));localStorage.removeItem(HISTORY_KEY);}
  async function currentUser(){try{const client=window.repPilotSupabase;if(!client)return null;const {data}=await client.auth.getUser();return data?.user||null}catch{return null}}
  async function clearCloudRuns(){try{const client=window.repPilotSupabase,user=await currentUser();if(!client||!user)return;await client.from("runs").delete().eq("user_id",user.id)}catch(error){console.warn("Cloud-Laufverlauf konnte nicht gelöscht werden",error)}}
  async function clearCloudProfile(){
    try{
      const client=window.repPilotSupabase,user=await currentUser();if(!client||!user)return;
      const {error}=await client.from("profiles").update({height_cm:null,weight_kg:null,training_level:null,sex:null,onboarding_completed_at:null,training_focus:null,training_days_per_week:null,training_days:null}).eq("id",user.id);
      if(error)throw error;
    }catch(error){console.warn("Cloud-Profil konnte nicht zurückgesetzt werden",error)}
  }
  function refreshScreens(){try{if(typeof renderHistory==="function")renderHistory()}catch{}try{if(typeof renderHome==="function")renderHome()}catch{}try{window.repPilotProfile?.refresh?.().then(p=>window.repPilotProfile?.render?.(p))}catch{}}
  async function resetHistory(){const ok=confirm("Verlauf wirklich zurücksetzen? Alle gespeicherten Kraft- und Lauftrainings werden gelöscht. Das kann nicht rückgängig gemacht werden.");if(!ok)return;removeHistoryLocal();await clearCloudRuns();refreshScreens();alert("Verlauf wurde zurückgesetzt.");}
  async function resetAll(){
    const ok=confirm("Alle App-Daten wirklich zurücksetzen? Verlauf, Körperdaten, Kraftmessungen, Trainingswünsche und Trainingsplan werden gelöscht. Dein Konto bleibt bestehen und die Einrichtung startet danach neu.");if(!ok)return;
    removeHistoryLocal();[PROFILE_KEY,WEIGHT_HISTORY_KEY,PLAN_KEY,STRENGTH_TEST_KEY].forEach(key=>localStorage.removeItem(key));await Promise.all([clearCloudRuns(),clearCloudProfile()]);alert("App-Daten wurden zurückgesetzt. Nach dem Neuladen startet die Einrichtung erneut.");location.reload();
  }
  function ensureUI(){
    const profile=document.getElementById("profile");if(!profile||document.getElementById("resetDataSection"))return false;injectStyles();const section=document.createElement("div");section.id="resetDataSection";section.className="reset-section";section.innerHTML=`<h2>Daten & Verlauf</h2><article class="card reset-card"><button type="button" class="reset-row" id="resetHistoryBtn"><span><strong>Verlauf zurücksetzen</strong><small>Kraft- und Lauftrainings sowie Rekorde löschen.</small></span><span class="reset-arrow">›</span></button><button type="button" class="reset-row" id="resetAllDataBtn"><span><strong>Alle App-Daten zurücksetzen</strong><small>Verlauf, Körperdaten, Kraftmessungen, Trainingswünsche und Plan löschen. Danach startet die Einrichtung erneut.</small></span><span class="reset-arrow">›</span></button></article>`;profile.appendChild(section);document.getElementById("resetHistoryBtn").onclick=resetHistory;document.getElementById("resetAllDataBtn").onclick=resetAll;return true;
  }
  function init(){if(ensureUI())return;let tries=0;const timer=setInterval(()=>{tries++;if(ensureUI()||tries>=20)clearInterval(timer)},250)}
  window.RepPilotReset={version:VERSION};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
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