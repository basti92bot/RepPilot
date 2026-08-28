(() => {
  const VERSION="11.8.86";
  const LOCAL_KEY="reppilot-user-profile";
  const WEIGHT_HISTORY_KEY="reppilot-weight-history";
  const LEVEL_LABELS={beginner:"Einsteiger",advanced:"Fortgeschritten",pro:"Profi"};
  const SEX_LABELS={male:"Männlich",female:"Weiblich"};
  const FOCUS_LABELS={strength:"Krafttraining",running:"Laufen",mixed:"Kraft + Laufen"};
  const DAY_LABELS={1:"Mo",2:"Di",3:"Mi",4:"Do",5:"Fr",6:"Sa",0:"So"};
  const DAY_ORDER=[1,2,3,4,5,6,0];
  const VALID_FREQUENCIES=[2,3,4,5];

  const readLocal=()=>{try{return JSON.parse(localStorage.getItem(LOCAL_KEY)||"{}")||{}}catch{return{}}};
  const writeLocal=p=>localStorage.setItem(LOCAL_KEY,JSON.stringify(p));
  const readWeightHistory=()=>{try{return JSON.parse(localStorage.getItem(WEIGHT_HISTORY_KEY)||"[]")||[]}catch{return[]}};
  const writeWeightHistory=r=>localStorage.setItem(WEIGHT_HISTORY_KEY,JSON.stringify(r));
  const normalizeDays=v=>Array.isArray(v)?DAY_ORDER.filter(d=>v.map(Number).includes(d)):[];

  async function getUser(){
    const c=window.repPilotSupabase;if(!c)return null;
    const{data}=await c.auth.getUser();return data?.user||null;
  }

  async function loadCloudProfile(){
    const local=readLocal(),c=window.repPilotSupabase,u=await getUser();
    if(!c||!u)return local;
    const{data,error}=await c.from("profiles").select("height_cm,weight_kg,training_level,sex,onboarding_completed_at,training_focus,training_days_per_week,training_days").eq("id",u.id).maybeSingle();
    if(error){console.warn("Cloud-Profil konnte nicht geladen werden",error);return local;}
    if(!data)return local;
    const p={
      ...local,
      heightCm:Number(data.height_cm)||Number(local.heightCm)||null,
      weightKg:Number(data.weight_kg)||Number(local.weightKg)||null,
      trainingLevel:data.training_level||local.trainingLevel||null,
      sex:data.sex||local.sex||null,
      onboardingCompletedAt:data.onboarding_completed_at||local.onboardingCompletedAt||null,
      trainingFocus:data.training_focus||local.trainingFocus||null,
      trainingDaysPerWeek:Number(data.training_days_per_week)||Number(local.trainingDaysPerWeek)||null,
      trainingDays:normalizeDays(data.training_days?.length?data.training_days:local.trainingDays)
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
      onboarding_completed_at:p.onboardingCompletedAt||null,
      training_focus:p.trainingFocus||null,
      training_days_per_week:Number(p.trainingDaysPerWeek)||null,
      training_days:normalizeDays(p.trainingDays)
    };
    const{error}=await c.from("profiles").upsert(payload,{onConflict:"id"});
    if(error){console.warn("Cloud-Profil konnte nicht gespeichert werden",error);return false;}
    return true;
  }

  async function saveProfile(p){
    const old=readLocal(),now=new Date().toISOString();
    const next={...old,...p,trainingDays:normalizeDays(p.trainingDays??old.trainingDays),updatedAt:now};
    writeLocal(next);
    if(Number(next.weightKg)>0&&Number(old.weightKg)!==Number(next.weightKg)){
      const rows=readWeightHistory();rows.push({weightKg:Number(next.weightKg),at:now});writeWeightHistory(rows);
    }
    await saveCloudProfile(next);
    renderProfile(next);
    window.dispatchEvent(new CustomEvent("reppilot:profile-updated",{detail:next}));
    return next;
  }

  function daysText(p){
    const days=normalizeDays(p.trainingDays);
    return days.length?days.map(d=>DAY_LABELS[d]).join(", "):"–";
  }

  function renderProfile(p=readLocal()){
    const s=document.getElementById("profileSummary"),h=document.getElementById("profileWeightHistory");if(!s||!h)return;
    if(p.heightCm&&p.weightKg){
      s.innerHTML=`<div class="profile-values"><div><strong>${Number(p.weightKg).toLocaleString("de-DE",{maximumFractionDigits:1})} kg</strong><small>Gewicht</small></div><div><strong>${Number(p.heightCm).toLocaleString("de-DE")} cm</strong><small>Größe</small></div><div><strong>${SEX_LABELS[p.sex]||"–"}</strong><small>Geschlecht</small></div><div><strong>${LEVEL_LABELS[p.trainingLevel]||"–"}</strong><small>Level</small></div><div><strong>${FOCUS_LABELS[p.trainingFocus]||"–"}</strong><small>Training</small></div><div><strong>${Number(p.trainingDaysPerWeek)||"–"}×</strong><small>pro Woche</small></div><div><strong>${daysText(p)}</strong><small>Trainingstage</small></div><div><strong>${(Number(p.weightKg)*.5).toLocaleString("de-DE",{maximumFractionDigits:1})} kg</strong><small>Hängendes Beinheben</small></div></div>`;
    }else{
      s.innerHTML=`<p class="muted">Trage Körperdaten, Trainingslevel und deine gewünschten Trainingstage ein. RepPilot erstellt daraus deinen persönlichen Wochenplan.</p>`;
    }
    const rows=readWeightHistory().slice(-6).reverse();
    h.innerHTML=rows.length>1?`<div class="weight-history"><small>GEWICHTSVERLAUF</small>${rows.map(r=>`<span><b>${Number(r.weightKg).toLocaleString("de-DE",{maximumFractionDigits:1})} kg</b><small>${new Date(r.at).toLocaleDateString("de-DE")}</small></span>`).join("")}</div>`:"";
  }

  function ensureStyles(){
    if(document.getElementById("rpProfileLevelStyles"))return;
    const s=document.createElement("style");s.id="rpProfileLevelStyles";
    s.textContent=`
      #profileLevel,#profileSex,#profileTrainingFocus,#profileTrainingDaysPerWeek{width:100%;box-sizing:border-box;border:2px solid #d1d5db;border-radius:16px;padding:15px 14px;background:#fff;color:var(--text);font:inherit;font-weight:800;margin-bottom:12px}
      .profile-day-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin:6px 0 14px}.profile-day-grid label{margin:0;text-align:center}.profile-day-grid input{position:absolute;opacity:0;pointer-events:none}.profile-day-grid span{display:block;padding:10px 2px;border:2px solid #d1d5db;border-radius:11px;font-size:12px;font-weight:900}.profile-day-grid input:checked+span{background:#111827;color:#fff;border-color:#111827}
      .profile-form-note{font-size:12px;color:var(--muted);margin:-4px 0 12px}
      .profile-details>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px}
      .profile-details>summary::-webkit-details-marker{display:none}
      .profile-details-toggle{font-size:20px;color:var(--muted);font-weight:900;transition:transform .18s ease}
      .profile-details[open] .profile-details-toggle{transform:rotate(180deg)}
      .profile-details-content{padding-top:12px}
      .profile-edit-row{display:flex;justify-content:flex-end;margin:0 0 10px}
    `;
    document.head.appendChild(s);
  }

  function profileDaysMarkup(){return DAY_ORDER.map(d=>`<label><input type="checkbox" data-profile-day="${d}"><span>${DAY_LABELS[d]}</span></label>`).join("")}
  function setProfileDays(days){const chosen=new Set(normalizeDays(days));document.querySelectorAll("[data-profile-day]").forEach(x=>x.checked=chosen.has(Number(x.dataset.profileDay)));}
  function readProfileDays(){return DAY_ORDER.filter(d=>document.querySelector(`[data-profile-day="${d}"]`)?.checked)}

  function ensureProfileUI(){
    ensureStyles();
    if(document.getElementById("profile"))return;
    const main=document.querySelector("main"),nav=document.querySelector("nav");if(!main||!nav)return;
    const section=document.createElement("section");section.id="profile";section.className="view";
    section.innerHTML=`<h2>Profil</h2><article class="card profile-card"><details id="profileDetails" class="profile-details"><summary class="profile-head"><div><small>DEIN PROFIL</small><h2>Körper & Training</h2></div><span class="profile-details-toggle">⌄</span></summary><div class="profile-details-content"><div class="profile-edit-row"><button id="editProfileBtn" class="secondary">Bearbeiten</button></div><div id="profileSummary"></div><div id="profileForm" hidden><label for="profileHeight">Größe</label><div class="weight"><input id="profileHeight" type="number" min="100" max="250" step="1" inputmode="numeric"><span>cm</span></div><label for="profileWeight">Körpergewicht</label><div class="weight"><input id="profileWeight" type="number" min="30" max="300" step="0.1" inputmode="decimal"><span>kg</span></div><label for="profileSex">Geschlecht</label><select id="profileSex"><option value="male">Männlich</option><option value="female">Weiblich</option></select><label for="profileLevel">Trainingslevel</label><select id="profileLevel"><option value="beginner">Einsteiger</option><option value="advanced">Fortgeschritten</option><option value="pro">Profi</option></select><label for="profileTrainingFocus">Was möchtest du trainieren?</label><select id="profileTrainingFocus"><option value="strength">Krafttraining</option><option value="running">Laufen</option><option value="mixed">Kraft + Laufen</option></select><label for="profileTrainingDaysPerWeek">Wie oft pro Woche?</label><select id="profileTrainingDaysPerWeek"><option value="2">2 Tage</option><option value="3">3 Tage</option><option value="4">4 Tage</option><option value="5">5 Tage</option></select><label>An welchen Tagen?</label><div class="profile-day-grid">${profileDaysMarkup()}</div><p id="profileDaysNote" class="profile-form-note"></p><button id="saveProfileBtn" class="wide">Profil speichern</button></div><div id="profileWeightHistory"></div></div></details></article>`;
    main.appendChild(section);

    const btn=document.createElement("button");btn.dataset.view="profile";btn.textContent="Profil";nav.appendChild(btn);nav.style.gridTemplateColumns="repeat(4,1fr)";
    btn.onclick=()=>{document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));document.querySelectorAll("nav button").forEach(b=>b.classList.remove("active"));section.classList.add("active");btn.classList.add("active");loadCloudProfile().then(renderProfile)};

    const updateDayNote=()=>{
      const wanted=Number(document.getElementById("profileTrainingDaysPerWeek")?.value||0),chosen=readProfileDays().length,note=document.getElementById("profileDaysNote");
      if(note)note.textContent=`${chosen} von ${wanted} Trainingstagen gewählt`;
    };
    document.querySelectorAll("[data-profile-day]").forEach(x=>x.onchange=updateDayNote);
    document.getElementById("profileTrainingDaysPerWeek").onchange=updateDayNote;

    document.getElementById("editProfileBtn").onclick=async()=>{
      const p=await loadCloudProfile();
      document.getElementById("profileHeight").value=p.heightCm||"";
      document.getElementById("profileWeight").value=p.weightKg||"";
      document.getElementById("profileSex").value=p.sex||"male";
      document.getElementById("profileLevel").value=p.trainingLevel||"advanced";
      document.getElementById("profileTrainingFocus").value=p.trainingFocus||"mixed";
      document.getElementById("profileTrainingDaysPerWeek").value=String(p.trainingDaysPerWeek||3);
      setProfileDays(p.trainingDays||[]);updateDayNote();
      document.getElementById("profileForm").hidden=false;
    };

    document.getElementById("saveProfileBtn").onclick=async()=>{
      const heightCm=Number(document.getElementById("profileHeight").value),weightKg=Number(document.getElementById("profileWeight").value),sex=document.getElementById("profileSex").value,trainingLevel=document.getElementById("profileLevel").value,trainingFocus=document.getElementById("profileTrainingFocus").value,trainingDaysPerWeek=Number(document.getElementById("profileTrainingDaysPerWeek").value),trainingDays=readProfileDays();
      if(heightCm<100||heightCm>250||weightKg<30||weightKg>300||!SEX_LABELS[sex]||!LEVEL_LABELS[trainingLevel]||!FOCUS_LABELS[trainingFocus]||!VALID_FREQUENCIES.includes(trainingDaysPerWeek))return;
      if(trainingDays.length!==trainingDaysPerWeek){document.getElementById("profileDaysNote").textContent=`Bitte genau ${trainingDaysPerWeek} Tage auswählen.`;return;}
      const old=readLocal();
      await saveProfile({heightCm,weightKg,sex,trainingLevel,trainingFocus,trainingDaysPerWeek,trainingDays,onboardingCompletedAt:old.onboardingCompletedAt||new Date().toISOString()});
      localStorage.setItem("reppilot-selected-training-plan","personalized");
      document.getElementById("profileForm").hidden=true;
      try{if(typeof renderHome==="function")renderHome()}catch{}
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
    render:renderProfile,
    bodyweightLoad:(factor=.5)=>Number(readLocal().weightKg||0)*factor,
    levelLabel:v=>LEVEL_LABELS[v]||"",
    sexLabel:v=>SEX_LABELS[v]||"",
    focusLabel:v=>FOCUS_LABELS[v]||"",
    dayLabel:v=>DAY_LABELS[v]||""
  };

  const init=()=>{ensureProfileUI();loadOnboardingFeature();};
  document.addEventListener("DOMContentLoaded",init);if(document.readyState!=="loading")init();
})();