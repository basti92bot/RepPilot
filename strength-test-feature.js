(() => {
  const VERSION="11.8.45";
  const KEY="reppilot-strength-tests-v1";
  const INTERVAL_DAYS=28;
  const DAY=86400000;
  const EXERCISES=[
    "Schrägbankdrücken",
    "Beinpresse",
    "Schulterpresse",
    "Brustgestütztes Rudern",
    "Rumänisches Kreuzheben"
  ];

  const roundHalf=v=>Math.round(Number(v||0)*2)/2;
  const esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const fmt=v=>Number(v||0).toLocaleString("de-DE",{maximumFractionDigits:1});
  const estimate=(weight,reps)=>{
    const w=Number(weight||0),r=Math.max(1,Math.min(5,Math.floor(Number(reps||0))));
    if(!w||!r)return 0;
    return roundHalf(r===1?w:w*(1+r/30));
  };

  function read(){
    try{const x=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(x)?x:[]}catch{return []}
  }
  function write(tests){localStorage.setItem(KEY,JSON.stringify(tests));}
  function latest(){return read().slice().sort((a,b)=>new Date(b.date)-new Date(a.date))[0]||null;}
  function previousFor(name){const t=latest();return Number(t?.results?.[name]?.estimated1RM||0);}
  function dueInfo(){
    const last=latest();
    if(!last)return {due:true,days:0,date:new Date()};
    const next=new Date(new Date(last.date).getTime()+INTERVAL_DAYS*DAY);
    const diff=Math.ceil((next-Date.now())/DAY);
    return {due:diff<=0,days:Math.max(0,diff),date:next};
  }

  function ensureStyles(){
    if(document.getElementById("rpStrengthTestStyles"))return;
    const s=document.createElement("style");
    s.id="rpStrengthTestStyles";
    s.textContent=`
      .rp-strength-card{margin:16px 0}.rp-strength-card.due{border:2px solid var(--accent)}
      .rp-strength-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
      .rp-strength-head h2{margin:4px 0 6px}.rp-strength-head p{margin:0;color:var(--muted);font-size:14px;line-height:1.35}
      .rp-strength-badge{flex:0 0 auto;border-radius:999px;background:#eef2f7;padding:7px 10px;font-size:12px;font-weight:900;color:var(--text)}
      .rp-strength-card.due .rp-strength-badge{background:#111827;color:#fff}
      .rp-strength-actions{display:flex;gap:10px;margin-top:14px}.rp-strength-actions button{flex:1}
      #strengthTest .rp-strength-intro p{margin:8px 0 0;color:var(--muted);line-height:1.45}
      .rp-strength-list{display:grid;gap:12px;margin-top:14px}
      .rp-strength-exercise h3{margin:0 0 4px}.rp-strength-exercise .muted{font-size:12px}
      .rp-strength-inputs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
      .rp-strength-field label{display:block;font-size:12px;font-weight:900;color:var(--muted);margin-bottom:5px}
      .rp-strength-field input{width:100%;box-sizing:border-box;border:2px solid var(--line);border-radius:14px;padding:13px 12px;font-size:20px;font-weight:900;background:#fff;color:var(--text)}
      .rp-strength-result{display:flex;justify-content:space-between;gap:12px;align-items:end;margin-top:12px;padding-top:10px;border-top:1px solid var(--line)}
      .rp-strength-result small{display:block;color:var(--muted);font-weight:800}.rp-strength-result strong{font-size:22px}
      .rp-strength-delta{font-size:13px;font-weight:900;text-align:right}.rp-strength-delta.up{color:#15803d}.rp-strength-delta.down{color:#b91c1c}
      .rp-strength-history{margin-top:16px}.rp-strength-history-row{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--line)}
      .rp-strength-history-row:last-child{border-bottom:0}
    `;
    document.head.appendChild(s);
  }

  function ensureView(){
    if(document.getElementById("strengthTest"))return;
    const section=document.createElement("section");
    section.id="strengthTest";
    section.className="view";
    section.innerHTML=`
      <div class="top"><div><small>KRAFTMESSUNG</small><h2>4-Wochen-Krafttest</h2></div><button id="strengthBackBtn" class="secondary">Zurück</button></div>
      <article class="card rp-strength-intro"><strong>Geschätztes 1RM statt riskantem Maximalversuch</strong><p>Je Übung nach dem Aufwärmen einen technisch sauberen schweren Satz mit 1–5 Wiederholungen machen. RepPilot berechnet daraus dein geschätztes 1RM. Für vergleichbare Werte möglichst dieselbe Maschine, Einstellung und Technik verwenden.</p></article>
      <div id="strengthTestList" class="rp-strength-list"></div>
      <button id="saveStrengthTestBtn" class="wide" style="margin-top:14px">Krafttest speichern</button>
      <article id="strengthHistoryCard" class="card rp-strength-history"></article>`;
    document.querySelector("main")?.appendChild(section);
    document.getElementById("strengthBackBtn").onclick=()=>showView("home");
    document.getElementById("saveStrengthTestBtn").onclick=saveCurrent;
  }

  function showView(id){
    document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));
    document.querySelectorAll("nav button[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
    if(id==="strengthTest")renderTest();
    window.scrollTo({top:0,behavior:"smooth"});
  }

  function renderHomeCard(){
    ensureStyles();ensureView();
    const home=document.getElementById("home");if(!home)return;
    let card=document.getElementById("strengthTestHomeCard");
    if(!card){
      card=document.createElement("article");card.id="strengthTestHomeCard";card.className="card rp-strength-card";
      const anchor=document.getElementById("selectedTrainingPlanHome")||home.querySelector(".hero");
      anchor?.insertAdjacentElement("afterend",card);
    }
    const info=dueInfo(),last=latest();
    card.classList.toggle("due",info.due);
    const status=info.due?(last?"Jetzt fällig":"Baseline fällig"):`in ${info.days} ${info.days===1?"Tag":"Tagen"}`;
    card.innerHTML=`<div class="rp-strength-head"><div><small>KRAFTMESSUNG · ALLE 4 WOCHEN</small><h2>${info.due?"Krafttest fällig":"Nächster Krafttest"}</h2><p>${last?`Letzter Test: ${new Date(last.date).toLocaleDateString("de-DE")}`:"Noch kein Ausgangswert gespeichert."}</p></div><span class="rp-strength-badge">${status}</span></div><div class="rp-strength-actions"><button type="button" id="openStrengthTestBtn">${info.due?"Krafttest starten":"Krafttest öffnen"}</button></div>`;
    document.getElementById("openStrengthTestBtn").onclick=()=>showView("strengthTest");
  }

  function renderTest(){
    ensureStyles();ensureView();
    const list=document.getElementById("strengthTestList");if(!list)return;
    list.innerHTML=EXERCISES.map((name,i)=>{
      const prev=previousFor(name);
      return `<article class="card rp-strength-exercise" data-strength-row="${i}" data-name="${esc(name)}"><h3>${esc(name)}</h3><p class="muted">Schwerer Satz mit 1–5 sauberen Wiederholungen</p><div class="rp-strength-inputs"><div class="rp-strength-field"><label>Gewicht (kg)</label><input type="number" min="0" step="0.5" inputmode="decimal" data-strength-weight></div><div class="rp-strength-field"><label>Wiederholungen</label><input type="number" min="1" max="5" step="1" inputmode="numeric" data-strength-reps></div></div><div class="rp-strength-result"><div><small>Geschätztes 1RM</small><strong data-strength-estimate>–</strong></div><div class="rp-strength-delta" data-strength-delta>${prev?`Letzter Wert: ${fmt(prev)} kg`:"Baseline"}</div></div></article>`;
    }).join("");
    list.querySelectorAll("input").forEach(input=>input.addEventListener("input",updateRows));
    renderHistory();
  }

  function updateRows(){
    document.querySelectorAll("[data-strength-row]").forEach(row=>{
      const w=row.querySelector("[data-strength-weight]")?.value;
      const r=row.querySelector("[data-strength-reps]")?.value;
      const e=estimate(w,r);
      const out=row.querySelector("[data-strength-estimate]");
      const delta=row.querySelector("[data-strength-delta]");
      if(out)out.textContent=e?`${fmt(e)} kg`:"–";
      const prev=previousFor(row.dataset.name);
      if(delta){
        delta.classList.remove("up","down");
        if(e&&prev){const pct=((e-prev)/prev)*100;delta.textContent=`${pct>=0?"+":""}${pct.toFixed(1).replace(".",",")} % · ${pct>=0?"+":""}${fmt(e-prev)} kg`;delta.classList.add(pct>=0?"up":"down");}
        else delta.textContent=prev?`Letzter Wert: ${fmt(prev)} kg`:"Baseline";
      }
    });
  }

  function saveCurrent(){
    const results={};let complete=true;
    document.querySelectorAll("[data-strength-row]").forEach(row=>{
      const weight=Number(row.querySelector("[data-strength-weight]")?.value||0);
      const reps=Math.floor(Number(row.querySelector("[data-strength-reps]")?.value||0));
      const e=estimate(weight,reps);
      if(!weight||reps<1||reps>5||!e)complete=false;
      results[row.dataset.name]={weight,reps,estimated1RM:e};
    });
    if(!complete){alert("Bitte bei allen Übungen Gewicht und 1–5 Wiederholungen eintragen.");return;}
    const tests=read();tests.push({date:new Date().toISOString(),results});write(tests);
    renderTest();renderHomeCard();
    alert("Krafttest gespeichert. Der nächste Test ist in 4 Wochen fällig.");
  }

  function renderHistory(){
    const card=document.getElementById("strengthHistoryCard");if(!card)return;
    const tests=read().slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3);
    if(!tests.length){card.innerHTML="<small>VERLAUF</small><h3>Noch keine Kraftmessung gespeichert</h3>";return;}
    card.innerHTML=`<small>LETZTE KRAFTMESSUNGEN</small>${tests.map(t=>`<div class="rp-strength-history-row"><strong>${new Date(t.date).toLocaleDateString("de-DE")}</strong><span>${EXERCISES.map(n=>t.results?.[n]?.estimated1RM).filter(Boolean).length}/${EXERCISES.length} Werte</span></div>`).join("")}`;
  }

  function init(){
    ensureStyles();ensureView();renderHomeCard();
    const home=document.getElementById("home");
    if(home)new MutationObserver(()=>queueMicrotask(renderHomeCard)).observe(home,{childList:true,subtree:false});
  }

  window.RepPilotStrengthTest={version:VERSION,intervalDays:INTERVAL_DAYS,estimate,refresh:renderHomeCard};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();