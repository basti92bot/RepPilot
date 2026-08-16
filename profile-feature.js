(() => {
  const VERSION="11.8.52";
  const LOCAL_KEY="reppilot-user-profile";
  const WEIGHT_HISTORY_KEY="reppilot-weight-history";
  const LEVEL_LABELS={beginner:"Einsteiger",advanced:"Fortgeschritten",pro:"Profi"};
  const SEX_LABELS={male:"Männlich",female:"Weiblich"};

  const readLocal=()=>{try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||"{}")||{}}catch{return{}}};
  const writeLocal=p=>localStorage.setItem(LOCAL_KEY,JSON.stringify(p));
  const readWeightHistory=()=>{try{return JSON.parse(localStorage.getItem(WEIGHT_HISTORY_KEY)||"[]")||[]}catch{return[]}};
  const writeWeightHistory=r=>localStorage.setItem(WEIGHT_HISTORY_KEY,JSON.stringify(r));

  async function getUser(){
    const c=window.repPilotSupabase;if(!c)return null;
    const{data}=await c.auth.getUser();return data?.user||null;
  }

  async function loadCloudProfile(){
    const local=readLocal(),c=window.repPilotSupabase,u=await getUser();
    if(!c||!u)return local;
    const{data,error}=await c.from("profiles").select("height_cm,weight_kg,training_level,sex,onboarding_completed_at").eq("id",u.id).maybeSingle();
    if(error){console.warn("Cloud-Profil konnte nicht geladen werden",error);return local;}
    if(!data)return local;
    const p={
      ...local,
      heightCm:Number(data.height_cm)||Number(local.heightCm)||null,
      weightKg:Number(data.weight_kg)||Number(local.weightKg)||null,
      trainingLevel:data.training_level||local.trainingLevel||null,
      sex:data.sex||local.sex||null,
      onboardingCompletedAt:data.onboarding_completed_at||local.onboardingCompletedAt||null
    };
    writeLocal(p);
    return p;
  }

  async function saveCloudProfile(p){
    const c=window.repPilotSupabase,u=await getUser();if(!c||!u)return false;
    const payload={
      id:u.id,
      height_cm:p.heightCm||null,
      weight_kg:p.weightKg||null,
      training_level:p.trainingLevel||null,
      sex:p.sex||null,
      onboarding_completed_at:p.onboardingCompletedAt||null
    };
    const{error}=await c.from("profiles").upsert(payload,{onConflict:"id"});
    if(error){console.warn("Cloud-Profil konnte nicht gespeichert werden",error);return false;}
    return true;
  }

  async function saveProfile(p){
    const old=readLocal(),now=new Date().toISOString();
    const next={...old,...p,updatedAt:now};
    writeLocal(next);
    if(Number(next.weightKg)>0&&Number(old.weightKg)!==Number(next.weightKg)){
      const rows=readWeightHistory();rows.push({weightKg:Number(next.weightKg),at:now});writeWeightHistory(rows);
    }
    await saveCloudProfile(next);
    renderProfile(next);
    return next;
  }

  function renderProfile(p=readLocal()){
    const s=document.getElementById("profileSummary"),h=document.getElementById("profileWeightHistory");if(!s||!h)return;
    if(p.heightCm&&p.weightKg){
      s.innerHTML=`<div class="profile-values"><div><strong>${Number(p.weightKg).toLocaleString("de-DE",{maximumFractionDigits:1})} kg</strong><small>Gewicht</small></div><div><strong>${Number(p.heightCm).toLocaleString("de-DE")} cm</strong><small>Größe</small></div><div><strong>${SEX_LABELS[p.sex]||"–"}</strong><small>Geschlecht</small></div><div><strong>${LEVEL_LABELS[p.trainingLevel]||"–"}</strong><small>Level</small></div><div><strong>${(Number(p.weightKg)*.5).toLocaleString("de-DE",{maximumFractionDigits:1})} kg</strong><small>Hanging Leg Raises</small></div></div>`;
    }else{
      s.innerHTML=`<p class="muted">Trage Größe, Körpergewicht, Geschlecht und Trainingslevel ein. RepPilot kann damit Startgewichte und Körpergewichtsübungen besser anpassen.</p>`;
    }
    const rows=readWeightHistory().slice(-6).reverse();
    h.innerHTML=rows.length>1?`<div class="weight-history"><small>GEWICHTSVERLAUF</small>${rows.map(r=>`<span><b>${Number(r.weightKg).toLocaleString("de-DE",{maximumFractionDigits:1})} kg</b><small>${new Date(r.at).toLocaleDateString("de-DE")}</small></span>`).join("")}</div>`:"";
  }

  function ensureStyles(){
    if(document.getElementById("rpProfileLevelStyles"))return;
    const s=document.createElement("style");s.id="rpProfileLevelStyles";
    s.textContent=`#profileLevel,#profileSex{width:100%;box-sizing:border-box;border:2px solid #d1d5db;border-radius:16px;padding:15px 14px;background:#fff;color:var(--text);font:inherit;font-weight:800;margin-bottom:12px}`;
    document.head.appendChild(s);
  }

  function ensureProfileUI(){
    ensureStyles();
    if(document.getElementById("profile"))return;
    const main=document.querySelector("main"),nav=document.querySelector("nav");if(!main||!nav)return;
    const section=document.createElement("section");section.id="profile";section.className="view";
    section.innerHTML=`<h2>Profil</h2><article class="card profile-card"><div class="profile-head"><div><small>DEIN PROFIL</small><h2>Körperdaten</h2></div><button id="editProfileBtn" class="secondary">Bearbeiten</button></div><div id="profileSummary"></div><div id="profileForm" hidden><label for="profileHeight">Größe</label><div class="weight"><input id="profileHeight" type="number" min="100" max="250" step="1" inputmode="numeric"><span>cm</span></div><label for="profileWeight">Körpergewicht</label><div class="weight"><input id="profileWeight" type="number" min="30" max="300" step="0.1" inputmode="decimal"><span>kg</span></div><label for="profileSex">Geschlecht</label><select id="profileSex"><option value="male">Männlich</option><option value="female">Weiblich</option></select><label for="profileLevel">Trainingslevel</label><select id="profileLevel"><option value="beginner">Einsteiger</option><option value="advanced">Fortgeschritten</option><option value="pro">Profi</option></select><button id="saveProfileBtn" class="wide">Profil speichern</button></div><div id="profileWeightHistory"></div></article>`;
    main.appendChild(section);

    const btn=document.createElement("button");btn.dataset.view="profile";btn.textContent="Profil";nav.appendChild(btn);nav.style.gridTemplateColumns="repeat(4,1fr)";
    btn.onclick=()=>{document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));document.querySelectorAll("nav button").forEach(b=>b.classList.remove("active"));section.classList.add("active");btn.classList.add("active");loadCloudProfile().then(renderProfile)};

    document.getElementById("editProfileBtn").onclick=async()=>{
      const p=await loadCloudProfile();
      document.getElementById("profileHeight").value=p.heightCm||"";
      document.getElementById("profileWeight").value=p.weightKg||"";
      document.getElementById("profileSex").value=p.sex||"male";
      document.getElementById("profileLevel").value=p.trainingLevel||"advanced";
      document.getElementById("profileForm").hidden=false;
    };

    document.getElementById("saveProfileBtn").onclick=async()=>{
      const heightCm=Number(document.getElementById("profileHeight").value),weightKg=Number(document.getElementById("profileWeight").value),sex=document.getElementById("profileSex").value,trainingLevel=document.getElementById("profileLevel").value;
      if(heightCm<100||heightCm>250||weightKg<30||weightKg>300||!SEX_LABELS[sex]||!LEVEL_LABELS[trainingLevel])return;
      const old=readLocal();
      await saveProfile({heightCm,weightKg,sex,trainingLevel,onboardingCompletedAt:old.onboardingCompletedAt||new Date().toISOString()});
      document.getElementById("profileForm").hidden=true;
    };
    loadCloudProfile().then(renderProfile);
  }

  function loadOnboardingFeature(){
    if(document.getElementById("rpOnboardingFeatureScript")||window.RepPilotOnboarding)return;
    const s=document.createElement("script");s.id="rpOnboardingFeatureScript";s.src=`onboarding-feature.js?v=${VERSION}`;s.async=true;document.body.appendChild(s);
  }

  window.repPilotProfile={
    version:VERSION,
    get:readLocal,
    refresh:loadCloudProfile,
    save:saveProfile,
    bodyweightLoad:(factor=.5)=>Number(readLocal().weightKg||0)*factor,
    levelLabel:v=>LEVEL_LABELS[v]||"",
    sexLabel:v=>SEX_LABELS[v]||""
  };

  const init=()=>{ensureProfileUI();loadOnboardingFeature();};
  document.addEventListener("DOMContentLoaded",init);if(document.readyState!=="loading")init();
})();