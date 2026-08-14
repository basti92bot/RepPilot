(() => {
  const HISTORY_KEY = "reppilot-history";
  const PROFILE_KEY = "reppilot-user-profile";
  const WEIGHT_HISTORY_KEY = "reppilot-weight-history";
  const PLAN_KEY = "reppilot-selected-training-plan";

  function injectStyles(){
    if(document.getElementById("resetFeatureStyles")) return;
    const style=document.createElement("style");
    style.id="resetFeatureStyles";
    style.textContent=`
      .reset-section{margin-top:28px}
      .reset-section>h2{margin:0 0 14px;font-size:28px}
      .reset-card{padding:0;overflow:hidden}
      .reset-row{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px;background:#fff;color:var(--text);border:0;border-radius:0;text-align:left}
      .reset-row+.reset-row{border-top:1px solid var(--line)}
      .reset-row strong{display:block;font-size:18px;color:#a13f33}
      .reset-row small{display:block;margin-top:5px;color:var(--muted);font-size:13px;line-height:1.35}
      .reset-arrow{font-size:28px;color:#b45345;font-weight:900;flex:0 0 auto}
    `;
    document.head.appendChild(style);
  }

  function removeHistoryLocal(){
    const keys=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key && key.startsWith("reppilot-history")) keys.push(key);
    }
    keys.forEach(key=>localStorage.removeItem(key));
    localStorage.removeItem(HISTORY_KEY);
  }

  async function currentUser(){
    try{
      const client=window.repPilotSupabase;
      if(!client) return null;
      const {data}=await client.auth.getUser();
      return data?.user||null;
    }catch{return null}
  }

  async function clearCloudRuns(){
    try{
      const client=window.repPilotSupabase;
      const user=await currentUser();
      if(!client||!user) return;
      await client.from("runs").delete().eq("user_id",user.id);
    }catch(error){console.warn("Cloud-Laufverlauf konnte nicht gelöscht werden",error)}
  }

  async function clearCloudProfile(){
    try{
      const client=window.repPilotSupabase;
      const user=await currentUser();
      if(!client||!user) return;
      await client.from("user_profiles").delete().eq("user_id",user.id);
    }catch(error){console.warn("Cloud-Profil konnte nicht gelöscht werden",error)}
  }

  function refreshScreens(){
    try{if(typeof renderHistory==="function") renderHistory()}catch{}
    try{if(typeof renderHome==="function") renderHome()}catch{}
    try{window.repPilotProfile?.refresh?.().then(p=>{try{const fn=window.repPilotProfile?.render;if(fn)fn(p)}catch{}})}catch{}
  }

  async function resetHistory(){
    const ok=confirm("Verlauf wirklich zurücksetzen? Alle gespeicherten Kraft- und Lauftrainings werden gelöscht. Das kann nicht rückgängig gemacht werden.");
    if(!ok) return;
    removeHistoryLocal();
    await clearCloudRuns();
    refreshScreens();
    alert("Verlauf wurde zurückgesetzt.");
  }

  async function resetAll(){
    const ok=confirm("Alle App-Daten wirklich zurücksetzen? Verlauf, Körperdaten, Gewichtsverlauf und Trainingsplan-Auswahl werden gelöscht. Dein Konto bleibt bestehen.");
    if(!ok) return;
    removeHistoryLocal();
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(WEIGHT_HISTORY_KEY);
    localStorage.removeItem(PLAN_KEY);
    await Promise.all([clearCloudRuns(),clearCloudProfile()]);
    alert("App-Daten wurden zurückgesetzt. Die App wird neu geladen.");
    location.reload();
  }

  function ensureUI(){
    const profile=document.getElementById("profile");
    if(!profile || document.getElementById("resetDataSection")) return false;
    injectStyles();
    const section=document.createElement("div");
    section.id="resetDataSection";
    section.className="reset-section";
    section.innerHTML=`
      <h2>Daten & Verlauf</h2>
      <article class="card reset-card">
        <button type="button" class="reset-row" id="resetHistoryBtn">
          <span><strong>Verlauf zurücksetzen</strong><small>Kraft- und Lauftrainings sowie Rekorde löschen.</small></span>
          <span class="reset-arrow">›</span>
        </button>
        <button type="button" class="reset-row" id="resetAllDataBtn">
          <span><strong>Alle App-Daten zurücksetzen</strong><small>Verlauf, Körperdaten, Gewicht und Trainingsplan-Auswahl löschen. Dein Konto bleibt bestehen.</small></span>
          <span class="reset-arrow">›</span>
        </button>
      </article>`;
    profile.appendChild(section);
    document.getElementById("resetHistoryBtn").onclick=resetHistory;
    document.getElementById("resetAllDataBtn").onclick=resetAll;
    return true;
  }

  function init(){
    if(ensureUI()) return;
    let tries=0;
    const timer=setInterval(()=>{tries++;if(ensureUI()||tries>=20)clearInterval(timer)},250);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();

(() => {
  if (typeof stretchArt !== "function") return;
  const baseStretchArt = stretchArt;
  const image = (src, alt) => `<img src="${src}" alt="${alt}" style="display:block;width:100%;height:auto;border-radius:18px">`;

  stretchArt = type => {
    if (type === "upper-back") return image("./stretch-upper-back-v11.8.29.svg?v=11.8.29", "Oberer Rücken Dehnübung");
    if (type === "lower-back") return image("./stretch-lower-back-v11.8.29.svg?v=11.8.29", "Unterer Rücken Dehnübung");
    return baseStretchArt(type);
  };

  const refreshStretchImages = () => {
    try{if(typeof renderStretchPreview === "function") renderStretchPreview()}catch{}
  };

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", refreshStretchImages, {once:true});
  else refreshStretchImages();
})();

(() => {
  const loadStretchImages = () => {
    if(document.getElementById("stretchImagesV11830")) return;
    const s=document.createElement("script");
    s.id="stretchImagesV11830";
    s.src="./stretch-images-v11.8.30.js?v=11.8.30";
    s.async=false;
    document.body.appendChild(s);
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",loadStretchImages,{once:true});
  else loadStretchImages();
})();