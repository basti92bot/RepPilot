(() => {
  const VERSION = "11.8.37";
  let audioContext = null;
  let lastRestSecond = null;

  function getAudioContext(){
    if(audioContext)return audioContext;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if(!AudioCtx)return null;
    try{audioContext = new AudioCtx();}catch{return null;}
    return audioContext;
  }

  function unlockAudio(){
    const ctx = getAudioContext();
    if(ctx?.state === "suspended")ctx.resume().catch(()=>{});
  }

  function tone(frequency, duration = 0.1, volume = 0.12, delay = 0){
    const ctx = getAudioContext();
    if(!ctx)return;
    if(ctx.state === "suspended")ctx.resume().catch(()=>{});
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
    osc.stop(start + duration + 0.02);
  }

  function countdownBeep(){
    tone(920,0.09,0.13);
  }

  function finishSignal(){
    tone(720,0.14,0.15);
    tone(980,0.34,0.18,0.15);
    if("vibrate" in navigator)navigator.vibrate([220,90,260]);
  }

  function shortSignal(){
    tone(820,0.16,0.13);
    if("vibrate" in navigator)navigator.vibrate([160,70,160]);
  }

  document.addEventListener("pointerdown",unlockAudio,{passive:true});
  document.addEventListener("touchstart",unlockAudio,{passive:true});

  if(typeof window.signalStretch === "function"){
    window.signalStretch = shortSignal;
  }

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

  window.RepPilotTimerSound = {version:VERSION,unlock:unlockAudio,test:finishSignal};
})();
