(() => {
  const PROJECT_URL = "https://tpuufwcywwhrggfptzpi.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_79GQl0jJBeQ8FKBj2TfnRw_JDyZf1oS";
  const TEST_LOGIN_URL = PROJECT_URL + "/functions/v1/reppilot-test-login";

  localStorage.removeItem("reppilot-cloud-publishable-key");

  const style = document.createElement("style");
  style.textContent = `.auth-overlay{position:fixed;inset:0;z-index:9999;background:#0b1020;display:flex;align-items:center;justify-content:center;padding:20px;font-family:inherit}.auth-overlay[hidden]{display:none}.auth-card{width:min(100%,420px);background:#fff;border-radius:22px;padding:24px;box-shadow:0 24px 70px rgba(0,0,0,.35)}.auth-card h2{margin:4px 0 6px;color:#111827}.auth-card p{margin:0 0 18px;color:#64748b}.auth-card label{display:block;font-size:13px;font-weight:700;margin:12px 0 6px;color:#334155}.auth-card input{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:13px 14px;font:inherit;background:#fff;color:#111827}.auth-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.auth-actions button,.auth-logout{border:0;border-radius:12px;padding:12px 14px;font:inherit;font-weight:700;cursor:pointer}.auth-primary{background:#2563eb;color:#fff}.auth-secondary{background:#e2e8f0;color:#0f172a}.auth-message{min-height:20px;margin-top:12px!important;font-size:13px!important}.auth-message.error{color:#b91c1c}.auth-message.ok{color:#047857}.auth-test-note{margin:12px 0 0!important;padding:10px 12px;border-radius:12px;background:#f8fafc;color:#475569!important;font-size:12px!important;line-height:1.35}.auth-user{display:flex;align-items:center;gap:8px;margin-top:6px;font-size:12px;color:#cbd5e1}.auth-logout{padding:5px 9px;background:#334155;color:#fff;font-size:11px}`;
  document.head.appendChild(style);

  if (!window.supabase?.createClient) {
    console.error("Supabase Client konnte nicht geladen werden.");
    return;
  }

  const client = window.supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.repPilotSupabase = client;

  const overlay = document.createElement("div");
  overlay.className = "auth-overlay";
  overlay.innerHTML = `<div class="auth-card"><small>REPPILOT CLOUD</small><h2>Anmelden</h2><p>Dein Training bleibt deinem Account zugeordnet.</p><label for="authEmail">E-Mail oder Test</label><input id="authEmail" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="name@example.de oder Test"><label for="authPassword">Passwort</label><input id="authPassword" type="password" autocomplete="current-password" minlength="6" placeholder="Mindestens 6 Zeichen"><div class="auth-actions"><button id="authLogin" class="auth-primary">Anmelden</button><button id="authRegister" class="auth-secondary">Registrieren</button></div><p class="auth-test-note">Testzugang: <strong>Test</strong> eingeben, Passwort leer lassen.</p><p id="authMessage" class="auth-message"></p></div>`;
  document.body.appendChild(overlay);

  const email = overlay.querySelector("#authEmail");
  const password = overlay.querySelector("#authPassword");
  const message = overlay.querySelector("#authMessage");
  const loginBtn = overlay.querySelector("#authLogin");
  const registerBtn = overlay.querySelector("#authRegister");
  const setMessage = (text,type="") => { message.textContent=text; message.className=`auth-message ${type}`; };
  const busy = value => { loginBtn.disabled=value; registerBtn.disabled=value; };

  async function signIn(){
    const mail=email.value.trim(), pass=password.value;
    if(mail.toLowerCase()==="test"){
      busy(true); setMessage("Testzugang wird geöffnet …");
      try{
        const response=await fetch(TEST_LOGIN_URL,{
          method:"POST",
          headers:{"Content-Type":"application/json","apikey":PUBLISHABLE_KEY},
          body:JSON.stringify({code:"Test"})
        });
        const payload=await response.json().catch(()=>({}));
        if(!response.ok||!payload?.token_hash)throw new Error("Testzugang konnte nicht gestartet werden.");
        const {error}=await client.auth.verifyOtp({token_hash:payload.token_hash,type:"magiclink"});
        if(error)throw error;
        password.value="";
        setMessage("");
      }catch(error){
        setMessage(error?.message||"Testzugang fehlgeschlagen.","error");
      }finally{
        busy(false);
      }
      return;
    }
    if(!mail||!pass)return setMessage("E-Mail und Passwort eingeben.","error");
    busy(true); setMessage("Anmeldung läuft …");
    const {error}=await client.auth.signInWithPassword({email:mail,password:pass});
    busy(false); if(error)return setMessage(error.message,"error"); setMessage("");
  }

  async function signUp(){
    const mail=email.value.trim(), pass=password.value;
    if(!mail||pass.length<6)return setMessage("E-Mail eingeben und mindestens 6 Zeichen fürs Passwort verwenden.","error");
    busy(true); setMessage("Account wird erstellt …");
    const {data,error}=await client.auth.signUp({email:mail,password:pass});
    busy(false); if(error)return setMessage(error.message,"error");
    setMessage(data.session?"Account erstellt.":"Account erstellt. Bitte bestätige die E-Mail und melde dich danach an.","ok");
  }

  loginBtn.onclick=signIn;
  registerBtn.onclick=signUp;
  password.addEventListener("keydown",e=>{if(e.key==="Enter")signIn();});

  function renderUser(session){
    overlay.hidden=!!session;
    let bar=document.getElementById("authUserBar");
    if(!session){if(bar)bar.remove();return;}
    if(!bar){bar=document.createElement("div");bar.id="authUserBar";bar.className="auth-user";document.querySelector("header")?.appendChild(bar);}
    const isTest=session.user?.user_metadata?.reppilot_test===true;
    bar.innerHTML=`<span>${isTest?"🧪 Test":"☁️ "+(session.user?.email||"Cloud-User")}</span><button class="auth-logout" id="authLogout">Abmelden</button>`;
    bar.querySelector("#authLogout").onclick=()=>client.auth.signOut();
  }

  client.auth.getSession().then(({data})=>renderUser(data.session));
  client.auth.onAuthStateChange((_event,session)=>renderUser(session));

  async function saveWorkoutToCloud(workout){
    if(!workout)return false;
    const {data:sessionData}=await client.auth.getSession();
    const user=sessionData?.session?.user;
    if(!user)return false;

    const volume=(workout.exercises||[]).reduce((sum,e)=>sum+(e.sets||[]).reduce((s,x)=>x.done?s+(Number(x.weight)||0)*(Number(x.reps)||0):s,0),0);
    const {data:w,error:wErr}=await client.from("workouts").insert({user_id:user.id,title:workout.title||"Training",started_at:workout.startedAt,finished_at:workout.finishedAt,total_volume:volume}).select("id").single();
    if(wErr){console.error("Cloud Workout Fehler",wErr);return false;}

    for(let position=0;position<(workout.exercises||[]).length;position++){
      const e=workout.exercises[position];
      const done=(e.sets||[]).filter(s=>s.done);
      if(!done.length)continue;
      const {data:er,error:eErr}=await client.from("workout_exercises").insert({workout_id:w.id,exercise_name:e.name,position:position+1}).select("id").single();
      if(eErr){console.error("Cloud Übung Fehler",eErr);return false;}
      const rows=done.map((s,i)=>({workout_exercise_id:er.id,set_number:s.index||i+1,weight:Number(s.weight)||0,reps:Number(s.reps)||0}));
      const {error:sErr}=await client.from("workout_sets").insert(rows);
      if(sErr){console.error("Cloud Satz Fehler",sErr);return false;}
    }
    return true;
  }

  window.addEventListener("DOMContentLoaded",()=>{
    if(typeof finish!=="function")return;
    const localFinish=finish;
    finish=function(){
      if(!active)return localFinish();
      active.finishedAt=new Date().toISOString();
      const snapshot=JSON.parse(JSON.stringify(active));
      localFinish();
      saveWorkoutToCloud(snapshot).then(ok=>{
        localStorage.setItem("reppilot-last-cloud-sync",JSON.stringify({ok,at:new Date().toISOString()}));
        if(ok)console.info("RepPilot Cloud: Training gespeichert");
      }).catch(err=>{
        console.error("RepPilot Cloud Fehler",err);
        localStorage.setItem("reppilot-last-cloud-sync",JSON.stringify({ok:false,at:new Date().toISOString(),message:err?.message||String(err)}));
      });
    };
    const btn=document.getElementById("finishWorkoutBtn");
    if(btn)btn.onclick=finish;
  });
})();
