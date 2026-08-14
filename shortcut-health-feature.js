(() => {
  const VERSION="11.8.36";
  const TOKEN_KEY="reppilot-shortcut-health-token";
  const ENDPOINT="https://tpuufwcywwhrggfptzpi.supabase.co/functions/v1/shortcut-health-import";

  const bytesToHex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
  async function sha256(value){
    const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value));
    return bytesToHex(new Uint8Array(digest));
  }
  function makeToken(){
    const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);return bytesToHex(bytes);
  }
  async function user(){
    const c=window.repPilotSupabase;if(!c)return null;
    const {data}=await c.auth.getUser();return data?.user||null;
  }
  async function copy(text){
    try{await navigator.clipboard.writeText(text);return true}catch{
      const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();const ok=document.execCommand("copy");ta.remove();return ok;
    }
  }
  function ensureStyles(){
    if(document.getElementById("shortcutHealthStyles"))return;
    const s=document.createElement("style");s.id="shortcutHealthStyles";s.textContent=`
      .shortcut-health-box{margin-top:14px;padding-top:14px;border-top:1px solid var(--line)}
      .shortcut-health-box h4{margin:0 0 5px;font-size:17px}
      .shortcut-health-box p{margin:0 0 10px;color:var(--muted);font-size:12px;line-height:1.45}
      .shortcut-health-status{display:flex;align-items:center;gap:8px;margin:8px 0 12px;font-size:13px;font-weight:800}
      .shortcut-health-dot{width:9px;height:9px;border-radius:50%;background:#9ca3af}
      .shortcut-health-status.ready .shortcut-health-dot{background:#16a34a}
      .shortcut-health-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .shortcut-health-actions button{font-size:12px;padding:10px 9px}
      .shortcut-health-actions .full{grid-column:1/-1}
      .shortcut-health-feedback{min-height:18px;margin-top:8px!important;font-weight:700}
    `;document.head.appendChild(s);
  }
  function ensureUI(){
    const card=document.getElementById("appleHealthCard");if(!card)return false;
    if(document.getElementById("shortcutHealthBox"))return true;
    ensureStyles();
    const box=document.createElement("div");box.id="shortcutHealthBox";box.className="shortcut-health-box";
    box.innerHTML=`
      <h4>iPhone Kurzbefehle</h4>
      <p>Für die Windows-Variante: Dein iPhone sendet das beendete Apple-Watch-Training direkt an RepPilot. Der Schlüssel kann nur Health-Workouts in deinen Account importieren.</p>
      <div id="shortcutHealthStatus" class="shortcut-health-status"><span class="shortcut-health-dot"></span><span>Nicht eingerichtet</span></div>
      <div class="shortcut-health-actions">
        <button id="shortcutTokenBtn" type="button">Schlüssel erstellen</button>
        <button id="shortcutEndpointBtn" type="button" class="secondary">API-Adresse kopieren</button>
        <button id="shortcutRegenerateBtn" type="button" class="secondary full" hidden>Neuen Schlüssel erzeugen</button>
      </div>
      <p id="shortcutHealthFeedback" class="shortcut-health-feedback"></p>`;
    card.appendChild(box);
    document.getElementById("shortcutTokenBtn").onclick=createOrCopyToken;
    document.getElementById("shortcutEndpointBtn").onclick=async()=>feedback(await copy(ENDPOINT)?"API-Adresse kopiert ✓":"Kopieren nicht möglich");
    document.getElementById("shortcutRegenerateBtn").onclick=()=>createToken(true);
    refresh();
    return true;
  }
  function feedback(text){const el=document.getElementById("shortcutHealthFeedback");if(el)el.textContent=text;setTimeout(()=>{if(el&&el.textContent===text)el.textContent=""},3000)}
  async function createToken(force=false){
    const c=window.repPilotSupabase,u=await user();if(!c||!u){feedback("Bitte zuerst in RepPilot anmelden.");return null}
    const existing=localStorage.getItem(TOKEN_KEY);if(existing&&!force)return existing;
    const token=makeToken(),hash=await sha256(token);
    const {error}=await c.from("health_shortcut_tokens").upsert({user_id:u.id,token_hash:hash,label:"iPhone Kurzbefehle"},{onConflict:"user_id"});
    if(error){feedback(`Schlüssel konnte nicht erstellt werden: ${error.message}`);return null}
    localStorage.setItem(TOKEN_KEY,token);refresh();return token;
  }
  async function createOrCopyToken(){
    const token=await createToken(false);if(!token)return;
    feedback(await copy(token)?"Schlüssel kopiert ✓":"Schlüssel erstellt – Kopieren nicht möglich");
  }
  async function refresh(){
    const token=localStorage.getItem(TOKEN_KEY),status=document.getElementById("shortcutHealthStatus"),btn=document.getElementById("shortcutTokenBtn"),regen=document.getElementById("shortcutRegenerateBtn");
    if(!status||!btn||!regen)return;
    if(token){status.className="shortcut-health-status ready";status.querySelector("span:last-child").textContent="Bereit für Kurzbefehle";btn.textContent="Schlüssel kopieren";regen.hidden=false}
    else{status.className="shortcut-health-status";status.querySelector("span:last-child").textContent="Nicht eingerichtet";btn.textContent="Schlüssel erstellen";regen.hidden=true}
  }
  function init(){let tries=0;const t=setInterval(()=>{tries++;if(ensureUI()||tries>=40)clearInterval(t)},200)}
  window.RepPilotShortcutHealth={version:VERSION,endpoint:ENDPOINT};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
