(() => {
  const KEY = "reppilot-selected-training-plan";
  const PLANS = [
    {id:"push",title:"Push + Beine",subtitle:"Brust, Schulter, Trizeps, Quadrizeps",day:"Montag"},
    {id:"pull-legs",title:"Pull + Beine",subtitle:"Rücken, Beine, Bizeps",day:"Mittwoch"},
    {id:"upper-hypertrophy",title:"Oberkörper + Beine",subtitle:"Oberkörper, Beinbeuger, Waden",day:"Freitag"}
  ];

  const read = () => localStorage.getItem(KEY) || "push";
  const save = id => localStorage.setItem(KEY,id);
  const current = () => PLANS.find(p=>p.id===read()) || PLANS[0];

  function injectStyles(){
    if(document.getElementById("trainingPlanFeatureStyles")) return;
    const style=document.createElement("style");
    style.id="trainingPlanFeatureStyles";
    style.textContent=`
      .training-plan-card{margin-top:16px}
      .training-plan-card h2{margin:4px 0 6px}
      .training-plan-card p{margin:0;color:var(--muted)}
      .training-plan-options{display:grid;gap:10px;margin-top:16px}
      .training-plan-option{width:100%;text-align:left;background:#fff;color:var(--text);border:2px solid var(--line);padding:14px 16px;border-radius:16px}
      .training-plan-option strong,.training-plan-option small{display:block}
      .training-plan-option small{color:var(--muted);margin-top:4px;font-weight:700}
      .training-plan-option.selected{border-color:var(--accent);background:#f9fafb}
      .training-plan-option.selected:after{content:"✓ Ausgewählt";display:block;margin-top:8px;font-size:12px;font-weight:900;color:var(--accent)}
      .selected-plan-home{margin:0 0 24px;display:flex;align-items:center;gap:14px}
      .selected-plan-home .plan-select-icon{display:grid;place-items:center;width:55px;height:55px;flex:0 0 55px;border-radius:16px;background:#f9fafb;border:1px solid var(--line);font-size:28px}
      .selected-plan-home h2{margin:3px 0 4px;font-size:24px}
      .selected-plan-home p{margin:0;color:var(--muted);font-size:14px}
      .selected-plan-home button{margin-left:auto;white-space:nowrap}
      @media(max-width:560px){.selected-plan-home{display:grid;grid-template-columns:auto 1fr}.selected-plan-home button{grid-column:1/-1;width:100%;margin:0}}
    `;
    document.head.appendChild(style);
  }

  function renderProfileSelector(){
    const profile=document.getElementById("profile");
    if(!profile || document.getElementById("trainingPlanSelector")) return;
    const card=document.createElement("article");
    card.id="trainingPlanSelector";
    card.className="card training-plan-card";
    card.innerHTML=`<small>DEIN TRAININGSPLAN</small><h2>Trainingsplan wählen</h2><p>Du kannst den Plan jederzeit ändern.</p><div class="training-plan-options"></div>`;
    profile.appendChild(card);
    const box=card.querySelector(".training-plan-options");
    const render=()=>{
      const selected=read();
      box.innerHTML=PLANS.map(p=>`<button class="training-plan-option ${p.id===selected?"selected":""}" data-plan-select="${p.id}"><strong>${p.title}</strong><small>${p.day} · ${p.subtitle}</small></button>`).join("");
      box.querySelectorAll("[data-plan-select]").forEach(btn=>btn.onclick=()=>{save(btn.dataset.planSelect);render();renderHomeCard()});
    };
    render();
  }

  function startSelected(id){
    const existing=document.querySelector(`[data-workout="${id}"]`);
    if(existing){existing.click();return;}
    const homeBtn=document.getElementById("startBtn");
    const oldDay=new Date().getDay();
    if(homeBtn && current().id===id && [1,3,5].includes(oldDay)){homeBtn.click();return;}
    alert("Bitte öffne kurz die Heute-Seite neu und starte den Plan dann erneut.");
  }

  function renderHomeCard(){
    const home=document.getElementById("home");
    if(!home) return;
    let card=document.getElementById("selectedTrainingPlanHome");
    if(!card){
      card=document.createElement("article");
      card.id="selectedTrainingPlanHome";
      card.className="card selected-plan-home";
      const dashboard=home.querySelector(".home-dashboard");
      if(dashboard) dashboard.insertAdjacentElement("afterend",card); else home.prepend(card);
    }
    const p=current();
    card.innerHTML=`<div class="plan-select-icon">🏋️</div><div class="grow"><small>DEIN TRAININGSPLAN</small><h2>${p.title}</h2><p>${p.day} · ${p.subtitle}</p></div><button id="startSelectedTrainingPlan">Starten</button>`;
    card.querySelector("#startSelectedTrainingPlan").onclick=()=>startSelected(p.id);
  }

  function ensure(){
    injectStyles();
    renderProfileSelector();
    renderHomeCard();
  }

  const observer=new MutationObserver(()=>ensure());
  document.addEventListener("DOMContentLoaded",()=>{ensure();observer.observe(document.body,{childList:true,subtree:true})});
  if(document.readyState!=="loading"){ensure();observer.observe(document.body,{childList:true,subtree:true})}
})();