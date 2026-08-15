(() => {
  const VERSION="11.8.42";
  const PUSHUP_FACTOR=0.65;

  const isPushup=name=>/liegestütze/i.test(name||"");
  const isMaxPushup=name=>/liegestütze/i.test(name||"")&&/maximum/i.test(name||"");
  const isHomeWorkout=()=>{try{return !!active?.id?.startsWith("home-")}catch{return false}};
  const roundHalf=v=>Math.round(Number(v||0)*2)/2;

  function bodyWeight(){
    try{
      if(window.repPilotProfile?.get){
        const p=window.repPilotProfile.get();
        const w=Number(p?.weightKg||0);
        if(w)return w;
      }
      const p=JSON.parse(localStorage.getItem("reppilot-user-profile")||"{}");
      return Number(p?.weightKg||0);
    }catch{return 0}
  }

  function ensureStyles(){
    if(document.getElementById("rpPushupStyles"))return;
    const s=document.createElement("style");
    s.id="rpPushupStyles";
    s.textContent=`
      #rpPushupReps{margin:14px 0}
      #rpPushupReps label{display:block;margin:0 0 6px;font-size:13px;color:var(--muted);font-weight:800}
      #rpPushupReps .rp-reps-input{display:grid;grid-template-columns:1fr auto;align-items:center;border:2px solid #d1d5db;border-radius:16px;overflow:hidden;background:#fff}
      #rpPushupReps input{width:100%;border:0;outline:0;padding:16px;font-size:30px;font-weight:900;background:transparent}
      #rpPushupReps span{padding-right:18px;color:var(--muted);font-weight:900}
      #rpPushupWeightHint{display:block;margin:-8px 0 12px;color:var(--muted);font-size:12px;font-weight:700}
    `;
    document.head.appendChild(s);
  }

  function ensureRepsInput(){
    let box=document.getElementById("rpPushupReps");
    if(box)return box;
    const previous=document.getElementById("previousSet");
    box=document.createElement("div");
    box.id="rpPushupReps";
    box.hidden=true;
    box.innerHTML=`<label for="rpPushupRepsInput">Wiederholungen geschafft</label><div class="rp-reps-input"><input id="rpPushupRepsInput" type="number" min="1" step="1" inputmode="numeric" placeholder="0"><span>Wdh.</span></div>`;
    if(previous?.parentNode)previous.parentNode.insertBefore(box,previous);
    else document.getElementById("setPanel")?.appendChild(box);
    return box;
  }

  function restoreWeightField(input,label){
    if(input?.dataset.pushupAuto!=="true")return;
    delete input.dataset.pushupAuto;
    if(input.dataset.bodyweightAuto!=="true")input.readOnly=false;
    const hint=document.getElementById("rpPushupWeightHint");
    if(hint)hint.remove();
    if(label&&input.dataset.bodyweightAuto!=="true")label.textContent="Gewicht";
  }

  function applyPushupUi(){
    ensureStyles();
    const name=document.getElementById("exerciseName")?.textContent?.trim()||"";
    const input=document.getElementById("weightInput");
    const label=document.querySelector('label[for="weightInput"]');
    const repsBox=ensureRepsInput();
    const repsInput=document.getElementById("rpPushupRepsInput");
    const max=isMaxPushup(name);

    repsBox.hidden=!max;
    if(max&&repsInput){
      let currentReps=0;
      try{currentReps=Number(current()?.sets?.[si]?.reps||0)}catch{}
      repsInput.value=currentReps&&currentReps!==10?currentReps:"";
      const fixed=document.getElementById("fixedReps");
      if(fixed)fixed.textContent="Bis Maximum";
    }

    if(!isPushup(name)||isHomeWorkout()){
      restoreWeightField(input,label);
      return;
    }

    const bw=bodyWeight();
    if(!input||!bw)return;
    const effective=roundHalf(bw*PUSHUP_FACTOR);
    input.value=effective;
    input.readOnly=true;
    input.dataset.pushupAuto="true";
    if(label)label.textContent="Effektives Körpergewicht (automatisch)";
    let hint=document.getElementById("rpPushupWeightHint");
    if(!hint){
      hint=document.createElement("small");
      hint.id="rpPushupWeightHint";
      input.closest(".weight")?.insertAdjacentElement("afterend",hint);
    }
    if(hint)hint.textContent=`65 % von ${bw.toLocaleString("de-DE",{maximumFractionDigits:1})} kg Körpergewicht`;
  }

  const baseRenderSet=window.renderSet;
  if(typeof baseRenderSet==="function"){
    window.renderSet=function(){
      baseRenderSet();
      applyPushupUi();
    };
  }

  const baseRenderRest=window.renderRest;
  if(typeof baseRenderRest==="function"){
    window.renderRest=function(){
      baseRenderRest();
      if(lastSet?.reps&&isMaxPushup(lastSet?.name)){
        const summary=document.getElementById("restSetSummary");
        if(summary){
          if(isHomeWorkout())summary.textContent=`${lastSet.name}: Satz ${lastSet.no} erledigt · ${lastSet.reps} Wdh.`;
          else summary.textContent=`${lastSet.name}: Satz ${lastSet.no} erledigt · ${kg(lastSet.weight)} kg × ${lastSet.reps}`;
        }
      }
    };
  }

  const baseCompleteSet=window.completeSet;
  if(typeof baseCompleteSet==="function"){
    window.completeSet=function(){
      const e=current();
      if(!isMaxPushup(e?.name))return baseCompleteSet();

      const repsInput=document.getElementById("rpPushupRepsInput");
      const reps=Math.max(0,Math.floor(Number(repsInput?.value||0)));
      if(!reps){repsInput?.focus();return;}

      const s=e.sets[si];
      const effective=isHomeWorkout()?0:roundHalf(bodyWeight()*PUSHUP_FACTOR);
      s.weight=effective;
      s.reps=reps;
      s.done=true;
      lastSet={name:e.name,no:si+1,weight:effective,reps};
      if(si<e.sets.length-1){
        e.sets[si+1].weight=effective;
        beginRest({type:"set",index:si+1});
      }else beginRest({type:"complete"});
    };
    const complete=document.getElementById("completeSetBtn");
    if(complete)complete.onclick=window.completeSet;
  }

  function init(){
    ensureStyles();
    ensureRepsInput();
    applyPushupUi();
  }

  window.RepPilotPushups={version:VERSION,factor:PUSHUP_FACTOR,refresh:applyPushupUi};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
