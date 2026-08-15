(() => {
  const VERSION = "11.8.38";
  const SOUND_KEY = "reppilot-timer-sounds-enabled";
  let audioContext = null;
  let lastRestSecond = null;

  const isEnabled = () => localStorage.getItem(SOUND_KEY) !== "0";
  const setEnabled = value => {
    localStorage.setItem(SOUND_KEY,value ? "1" : "0");
    renderSettings();
  };

  function getAudioContext(){
    if(audioContext)return audioContext;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if(!AudioCtx)return null;
    try{audioContext = new AudioCtx();}catch{return null;}
    return audioContext;
  }

  function primeAudio(){
    const ctx = getAudioContext();
    if(!ctx)return Promise.resolve(false);
    const prime = () => {
      try{
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.02);
        return true;
      }catch{return false;}
    };
    if(ctx.state === "suspended")return ctx.resume().then(prime).catch(()=>false);
    return Promise.resolve(prime());
  }

  function tone(frequency, duration = 0.1, volume = 0.12, delay = 0, force = false){
    if(!force && !isEnabled())return;
    const ctx = getAudioContext();
    if(!ctx)return;
    const play = () => {
      try{
        const start = ctx.currentTime + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency,start);
        gain.gain.setValueAtTime(0.0001,start);
        gain.gain.exponentialRampToValueAtTime(volume,start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001,start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.03);
      }catch{}
    };
    if(ctx.state === "suspended")ctx.resume().then(play).catch(()=>{});
    else play();
  }

  function countdownBeep(){tone(920,0.10,0.18);}

  function finishSignal(force = false){
    tone(720,0.16,0.20,0,force);
    tone(980,0.42,0.24,0.17,force);
    if("vibrate" in navigator)navigator.vibrate([220,90,260]);
  }

  function shortSignal(){
    tone(820,0.18,0.17);
    if("vibrate" in navigator)navigator.vibrate([160,70,160]);
  }

  async function testSound(){
    const status = document.getElementById("timerSoundStatus");
    if(status)status.textContent = "Audio wird freigeschaltet …";
    const ok = await primeAudio();
    if(ok){
      finishSignal(true);
      if(status)status.textContent = "Testton abgespielt ✓";
    }else if(status)status.textContent = "Audio konnte nicht gestartet werden.";
    setTimeout(()=>{if(status)status.textContent="";},2500);
  }

  function renderSettings(){
    const toggle = document.getElementById("timerSoundToggleBtn");
    const state = document.getElementById("timerSoundState");
    if(toggle)toggle.textContent = isEnabled() ? "An" : "Aus";
    if(state)state.textContent = isEnabled() ? "Timer-Töne sind eingeschaltet" : "Timer-Töne sind ausgeschaltet";
  }

  function ensureSettingsUI(){
    if(document.getElementById("timerSoundCard"))return true;
    const profile = document.getElementById("profile");
    if(!profile)return false;
    const card = document.createElement("article");
    card.id = "timerSoundCard";
    card.className = "card";
    card.style.marginTop = "16px";
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div><small>TIMER</small><h3 style="margin:3px 0 0">Timer-Töne</h3></div>
        <button id="timerSoundToggleBtn" class="secondary" type="button">An</button>
      </div>
      <p id="timerSoundState" class="muted" style="margin:12px 0 10px">Timer-Töne sind eingeschaltet</p>
      <button id="timerSoundTestBtn" class="wide" type="button">Ton testen</button>
      <p id="timerSoundStatus" class="muted" style="min-height:18px;margin:8px 0 0"></p>`;
    profile.appendChild(card);
    document.getElementById("timerSoundToggleBtn").onclick = async () => {
      const next = !isEnabled();
      setEnabled(next);
      if(next)await primeAudio();
    };
    document.getElementById("timerSoundTestBtn").onclick = testSound;
    renderSettings();
    return true;
  }

  const unlockFromGesture = () => { if(isEnabled())primeAudio(); };
  document.addEventListener("pointerdown",unlockFromGesture,{passive:true});
  document.addEventListener("touchstart",unlockFromGesture,{passive:true});

  if(typeof window.signalStretch === "function")window.signalStretch = shortSignal;

  if(typeof window.updateRest === "function"){
    window.updateRest = function(){
      if(phase !== "rest")return;
      const r = Math.max(0,Math.ceil((restEnd-Date.now())/1000));
      const restTime = document.getElementById("restTime");
      const restClock = document.getElementById("restClock");
      if(restTime)restTime.textContent = `${String(Math.floor(r/60)).padStart(2,"0")}:${String(r%60).padStart(2,"0")}`;
      if(restClock){
        restClock.style.setProperty("--progress",`${Math.min(1,1-r/restTotal)*360}deg`);
        restClock.classList.toggle("ending",r>0&&r<=30);
      }
      if(r > 0 && r <= 3 && r !== lastRestSecond){
        lastRestSecond = r;
        countdownBeep();
      }else if(r > 3){
        lastRestSecond = null;
      }
      if(r === 0){
        lastRestSecond = null;
        finishSignal();
        finishRest();
      }
    };
  }

  function init(){
    let tries = 0;
    const timer = setInterval(()=>{
      tries++;
      if(ensureSettingsUI() || tries >= 30)clearInterval(timer);
    },200);
  }

  window.RepPilotTimerSound = {version:VERSION,enabled:isEnabled,setEnabled,test:testSound,unlock:primeAudio};
  if(document.readyState === "loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
