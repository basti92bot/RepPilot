(() => {
  const VERSION = "11.8.44";

  function ensureStyles(){
    if(document.getElementById("rpDayExerciseStyles")) return;
    const s=document.createElement("style");
    s.id="rpDayExerciseStyles";
    s.textContent=`
      .plan-item.rp-with-exercises{flex-wrap:wrap}
      .rp-day-exercises{flex:0 0 100%;width:100%;margin-top:2px;border-top:1px solid var(--line);padding-top:4px}
      .rp-day-exercises summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 2px 6px;cursor:pointer;color:var(--text);font-size:13px;font-weight:900}
      .rp-day-exercises summary::-webkit-details-marker{display:none}
      .rp-day-exercises summary:after{content:"⌄";font-size:18px;color:var(--muted);transition:transform .18s ease}
      .rp-day-exercises[open] summary:after{transform:rotate(180deg)}
      .rp-day-exercises small{color:var(--muted);font-weight:800}
      .rp-day-exercise-list{list-style:none;margin:4px 0 6px;padding:0;border:1px solid var(--line);border-radius:13px;background:#f9fafb;overflow:hidden}
      .rp-day-exercise-list li{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 11px;border-bottom:1px solid var(--line);font-size:13px}
      .rp-day-exercise-list li:last-child{border-bottom:0}
      .rp-day-exercise-list strong{font-size:13px;line-height:1.25}
      .rp-day-exercise-list span{flex:0 0 auto;color:var(--muted);font-size:12px;font-weight:800;white-space:nowrap}
    `;
    document.head.appendChild(s);
  }

  function workoutById(id){
    try{return Array.isArray(WORKOUTS)?WORKOUTS.find(w=>w.id===id):null}catch{return null}
  }

  function getWorkoutId(card){
    const start=card?.querySelector("[data-selected-workout],[data-workout]");
    if(!start) return "";
    return start.dataset.selectedWorkout || start.dataset.workout || "";
  }

  function decorateCard(card){
    if(!card || card.querySelector(".rp-day-exercises")) return;
    const workoutId=getWorkoutId(card);
    if(!workoutId) return;
    const workout=workoutById(workoutId);
    if(!workout?.exercises?.length) return;

    card.classList.add("rp-with-exercises");
    const details=document.createElement("details");
    details.className="rp-day-exercises";
    const count=workout.exercises.length;
    details.innerHTML=`
      <summary><span>Übungen anzeigen</span><small>${count} ${count===1?"Übung":"Übungen"}</small></summary>
      <ul class="rp-day-exercise-list">
        ${workout.exercises.map(([name,sets])=>`<li><strong>${name}</strong><span>${sets} ${Number(sets)===1?"Satz":"Sätze"}</span></li>`).join("")}
      </ul>`;
    card.appendChild(details);
  }

  function decorate(){
    ensureStyles();
    const plan=document.getElementById("plan");
    if(!plan) return;
    plan.querySelectorAll(".plan-item").forEach(decorateCard);
  }

  function init(){
    decorate();
    const plan=document.getElementById("plan");
    if(!plan) return;
    const observer=new MutationObserver(()=>queueMicrotask(decorate));
    observer.observe(plan,{childList:true,subtree:false});
  }

  window.RepPilotDayExercises={version:VERSION,refresh:decorate};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
