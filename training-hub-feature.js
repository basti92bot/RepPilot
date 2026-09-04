(() => {
  const VERSION = "11.8.123";
  const RUNNER_EXERCISES = [
    {
      icon:"🦶",
      name:"Fußgewölbe aktivieren",
      dose:"2 × 10 je Seite",
      equipment:"Ohne Equipment",
      text:"Barfuß stehen. Großzehenballen, Kleinzehenballen und Ferse am Boden lassen. Das Fußgewölbe aktiv anheben, ohne die Zehen zu krallen."
    },
    {
      icon:"🦵",
      name:"Knie-zur-Wand Mobilität",
      dose:"2 × 10 je Seite",
      equipment:"Wand",
      text:"Fuß flach am Boden lassen und das Knie kontrolliert zur Wand führen. Ferse bleibt unten. Abstand langsam vergrößern."
    },
    {
      icon:"⬆️",
      name:"Tibialis Raises an der Wand",
      dose:"3 × 15",
      equipment:"Wand",
      text:"Mit dem Rücken an die Wand lehnen, Fersen am Boden lassen und die Fußspitzen kräftig anheben."
    },
    {
      icon:"🦶",
      name:"Einbeiniges Wadenheben",
      dose:"3 × 12 je Seite",
      equipment:"Wand nur für Balance",
      text:"Langsam hoch auf den Vorfuß, oben kurz halten und kontrolliert absenken. Volle Bewegungsamplitude nutzen."
    },
    {
      icon:"⚖️",
      name:"Einbeinstand mit Kniehub",
      dose:"2 × 30 Sek. je Seite",
      equipment:"Ohne Equipment",
      text:"Auf einem Bein stehen, anderes Knie auf Hüfthöhe anheben. Fußgewölbe und Knie stabil halten."
    },
    {
      icon:"↩️",
      name:"Rückwärts-Ausfallschritt mit Kniehub",
      dose:"3 × 8 je Seite",
      equipment:"Kettlebell optional",
      text:"Großen Schritt zurück, kontrolliert absenken und anschließend das hintere Knie kraftvoll nach vorne hochführen. Mit Kettlebell vor der Brust schwerer."
    },
    {
      icon:"🏋️",
      name:"Einbeiniges Kreuzheben",
      dose:"3 × 8 je Seite",
      equipment:"Kettlebell optional",
      text:"Standbein leicht gebeugt. Hüfte nach hinten schieben, Rücken neutral halten und kontrolliert wieder aufrichten. Kettlebell in der gegenüberliegenden Hand."
    },
    {
      icon:"🚶",
      name:"Suitcase March",
      dose:"3 × 30 Sek. je Seite",
      equipment:"Kettlebell optional",
      text:"Aufrecht marschieren und die Knie abwechselnd anheben. Mit Kettlebell einseitig tragen und den Oberkörper gerade halten. Ohne Kettlebell langsam und kontrolliert ausführen."
    }
  ];

  let runnerIndex = 0;

  const SKI_EXERCISES = [
    {
      icon:"🧱",
      name:"Wall Sit",
      dose:"3 × 45–60 Sek.",
      equipment:"Wand",
      text:"Rücken flach an die Wand, Knie ungefähr 90 Grad. Druck gleichmäßig über beide Füße verteilen und die Position sauber halten."
    },
    {
      icon:"🏋️",
      name:"Goblet Squats",
      dose:"3 × 12",
      equipment:"Kettlebell optional",
      text:"Kettlebell vor der Brust halten. Kontrolliert tief gehen, Knie folgen den Fußspitzen und der Oberkörper bleibt stabil. Ohne Kettlebell als langsame Kniebeuge."
    },
    {
      icon:"↩️",
      name:"Rückwärts-Ausfallschritte",
      dose:"3 × 10 je Seite",
      equipment:"Kettlebell optional",
      text:"Großen Schritt zurück und kontrolliert absenken. Über das vordere Bein hochdrücken. Mit Kettlebell vor der Brust schwerer."
    },
    {
      icon:"⬇️",
      name:"Langsame Step-Downs",
      dose:"3 × 8 je Seite",
      equipment:"Stabile Stufe oder niedriger Hocker",
      text:"Auf einer stabilen Erhöhung stehen und das freie Bein langsam Richtung Boden absenken. Das Standknie bleibt kontrolliert über dem Fuß. Drei Sekunden absenken."
    },
    {
      icon:"↔️",
      name:"Seitliche Ausfallschritte",
      dose:"3 × 10 je Seite",
      equipment:"Kettlebell optional",
      text:"Seitlich weit aussteigen, Hüfte nach hinten schieben und das andere Bein gestreckt lassen. Über das belastete Bein zurückdrücken."
    },
    {
      icon:"⛷️",
      name:"Skater Jumps",
      dose:"3 × 20 Sek.",
      equipment:"Ohne Equipment",
      text:"Seitlich von einem Bein auf das andere springen. Landung weich abfangen, Knie stabil halten und kurz kontrollieren, bevor du zurückspringst."
    },
    {
      icon:"🦶",
      name:"Einbeiniges Wadenheben",
      dose:"3 × 15 je Seite",
      equipment:"Wand nur für Balance",
      text:"Langsam auf den Vorfuß drücken, oben kurz halten und kontrolliert absenken. Volle Bewegungsamplitude nutzen."
    },
    {
      icon:"🛋️",
      name:"Bulgarian Split Squats",
      dose:"3 × 8 je Seite",
      equipment:"Sofa, Hocker oder Bettkante · Kettlebell optional",
      text:"Hinteren Fuß erhöht auf Sofa, Hocker oder Bettkante ablegen. Vorderes Bein trägt die Last. Hüfte kontrolliert nach unten absenken und über den vorderen Fuß wieder hochdrücken. Kettlebell vor der Brust macht die Übung schwerer."
    },
    {
      icon:"🛋️",
      name:"Seitstütz mit Füßen erhöht",
      dose:"2 × 30–45 Sek. je Seite",
      equipment:"Sofa oder Bettkante · Bodenmatte",
      text:"Beide Füße erhöht auf Sofa oder Bettkante ablegen und den Seitstütz halten. Hüfte aktiv oben lassen und den Körper in einer Linie stabilisieren. Wenn das zu schwer ist, die Füße normal auf dem Boden lassen."
    },
    {
      icon:"🏁",
      name:"Wall Sit Finish",
      dose:"1 × Maximum sauber",
      equipment:"Wand",
      text:"Zum Abschluss noch einmal Wall Sit. So lange halten, wie die Position technisch sauber bleibt."
    }
  ];

  let skiIndex = 0;

  function styles(){
    if(document.getElementById("trainingHubStyles")) return;
    const s=document.createElement("style");
    s.id="trainingHubStyles";
    s.textContent=`
      #trainingHub>div>.top{margin-bottom:16px}
      .training-hub-card{display:grid;grid-template-columns:58px 1fr auto;gap:14px;align-items:center;padding:16px}
      .training-hub-icon{width:58px;height:58px;border-radius:16px;background:#f9fafb;border:1px solid var(--line);display:grid;place-items:center;font-size:29px}
      .training-hub-card h3{margin:0 0 5px;font-size:20px}
      .training-hub-card p{margin:0;color:var(--muted);font-size:14px;line-height:1.4}
      .training-hub-actions{display:grid;gap:8px}
      .home-workout-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
      .home-workout-box{border:1px solid var(--line);border-radius:14px;background:#f9fafb;overflow:hidden}
      .home-workout-box>button{width:100%;border-radius:0}
      .home-workout-details{border-top:1px solid var(--line)}
      .home-workout-details summary{list-style:none;cursor:pointer;padding:11px 12px;font-size:13px;font-weight:900;display:flex;justify-content:space-between;align-items:center;gap:10px}
      .home-workout-details summary::-webkit-details-marker{display:none}
      .home-workout-details summary:after{content:"⌄";font-size:17px;color:var(--muted);transition:transform .18s ease}
      .home-workout-details[open] summary:after{transform:rotate(180deg)}
      .home-workout-exercises{list-style:none;margin:0;padding:0;border-top:1px solid var(--line);background:#fff}
      .home-workout-exercises li{display:block;padding:14px 12px;border-bottom:1px solid var(--line);font-size:14px}
      .home-workout-exercises li:last-child{border-bottom:0}
      .home-workout-exercises strong{display:block;font-size:16px}
      .home-workout-exercises span{display:block;color:var(--muted);font-weight:800}
      .runner-equipment{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0 16px}
      .runner-equipment span{padding:7px 9px;border-radius:999px;background:#f3f4f6;font-size:12px;font-weight:800}
      .runner-list{display:grid;gap:10px;margin-top:14px}
      .runner-list article{padding:14px;border:1px solid var(--line);border-radius:15px;background:#f9fafb}
      .runner-list h3{margin:0 0 4px}
      .runner-list p{margin:3px 0;color:#4b5563;font-size:14px;line-height:1.4}
      .runner-dose{font-weight:900;color:var(--text)!important}
      .runner-session-card{text-align:center}
      .runner-session-card h2{margin:5px 0 7px}
      .runner-session-card .note{text-align:left;margin:14px 0}
      .runner-session-actions{display:grid;grid-template-columns:1fr 1.4fr;gap:9px;margin-top:14px}
      @media(max-width:560px){
        .training-hub-card{grid-template-columns:52px 1fr}
        .training-hub-actions{grid-column:1/-1}
        .home-workout-grid{grid-template-columns:1fr}
        .runner-session-actions{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(s);
  }

  function showTrainingNav(){
    document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.view==="trainingHub"));
  }

  function openStretching(){
    try{
      if(typeof renderStretchPreview==="function") renderStretchPreview();
      if(typeof showStretchScreen==="function") showStretchScreen("overview");
      if(typeof show==="function") show("stretching");
      showTrainingNav();
    }catch(e){console.error(e)}
  }

  function startHome(id){
    if(typeof start==="function") start(id);
  }

  function homeWorkoutData(id){
    try{
      return Array.isArray(WORKOUTS)?WORKOUTS.find(w=>w.id===id)||null:null;
    }catch{return null}
  }

  const exerciseImage = (name, context = "", eager = false) => window.RepPilotTrainingImages?.markup(name, {context, eager}) || "";

  function homeWorkoutMarkup(id,label){
    const workout=homeWorkoutData(id);
    const exercises=Array.isArray(workout?.exercises)?workout.exercises:[];
    const list=exercises.length
      ? exercises.map(e=>`<li><strong>${e?.[0]||"Übung"}</strong>${exerciseImage(e?.[0]||"",id)}<span>${Number(e?.[1]||0)} ${Number(e?.[1]||0)===1?"Satz":"Sätze"}</span></li>`).join("")
      : '<li><strong>Übungen werden beim Start geladen</strong></li>';
    return `
      <div class="home-workout-box">
        <button data-home-workout="${id}">${label}</button>
        <details class="home-workout-details">
          <summary>Übungen anzeigen</summary>
          <ul class="home-workout-exercises">${list}</ul>
        </details>
      </div>`;
  }

  function renderHub(){
    const root=document.getElementById("trainingHubCards");
    if(!root)return;
    root.innerHTML=`
      <article class="card training-hub-card">
        <div class="training-hub-icon">🧘</div>
        <div><h3>Dehnen</h3><p>Geführte Routine für Rücken, Beine und Füße. 10 Übungen mit Seitenwechsel.</p></div>
        <div class="training-hub-actions"><button id="openStretchTraining">Öffnen</button></div>
      </article>
      <article class="card training-hub-card">
        <div class="training-hub-icon">🏃</div>
        <div>
          <h3>Läufer-Stabi zuhause</h3>
          <p>Sprunggelenke, Füße, Waden, Knie und Hüfte. Ca. 20 Minuten. Wand, Matte und optional Kettlebell.</p>
        </div>
        <div class="training-hub-actions"><button id="openRunnerStrength">Öffnen</button></div>
      </article>

      <article class="card training-hub-card">
        <div class="training-hub-icon">⛷️</div>
        <div>
          <h3>Ski-Workout zuhause</h3>
          <p>Oberschenkel, seitliche Stabilität, Einbein-Kontrolle, Waden und Core. Ca. 25 Minuten. Kettlebell optional.</p>
        </div>
        <div class="training-hub-actions"><button id="openSkiStrength">Öffnen</button></div>
      </article>
      <article class="card training-hub-card">
        <div class="training-hub-icon">🏠</div>
        <div>
          <h3>Home Workout</h3>
          <p>Ganzkörpertraining zuhause. Bodenmatte reicht. 30 Sekunden Pause.</p>
          <div class="home-workout-grid">
            ${homeWorkoutMarkup("home-a","Workout A")}
            ${homeWorkoutMarkup("home-b","Workout B")}
            ${homeWorkoutMarkup("home-c","Workout C")}
          </div>
        </div>
      </article>
      <article class="card training-hub-card">
        <div class="training-hub-icon">🏆</div>
        <div>
          <h3>Kraft-Duell</h3>
          <p>Fordere ein anderes Profil bei einer Übung heraus. Fairer Vergleich über e1RM und Körpergewicht.</p>
        </div>
        <div class="training-hub-actions"><button id="openStrengthBattle">Öffnen</button></div>
      </article>`;
    document.getElementById("openStretchTraining").onclick=openStretching;
    document.getElementById("openRunnerStrength").onclick=renderRunnerOverview;
    document.getElementById("openSkiStrength").onclick=renderSkiOverview;
    document.getElementById("openStrengthBattle").onclick=()=>window.RepPilotBattle?.open();
    root.querySelectorAll("[data-home-workout]").forEach(b=>b.onclick=()=>startHome(b.dataset.homeWorkout));
  }

  function renderRunnerOverview(){
    document.getElementById("trainingHubOverview").hidden=true;
    const session=document.getElementById("runnerStrengthSession");
    session.hidden=false;
    session.innerHTML=`
      <div class="top"><div><small>LAUFTRAINING ZUHAUSE</small><h2>Läufer-Stabi</h2></div><button id="closeRunnerTraining" class="secondary">Zurück</button></div>
      <article class="card">
        <p>Diese Einheit ergänzt deine Läufe. Sie stärkt die Strukturen, die beim Laufen viel Belastung abbekommen.</p>
        <div class="runner-equipment"><span>⏱ ca. 20 Min.</span><span>🏠 zuhause</span><span>🧱 Wand</span><span>🏋️ Kettlebell optional</span></div>
        <button id="startRunnerRoutine" class="wide">Routine starten</button>
      </article>
      <div class="runner-list">
        ${RUNNER_EXERCISES.map((x,i)=>`<article><h3>${i+1}. ${x.name}</h3>${exerciseImage(x.name)}<p class="runner-dose">${x.dose}</p><p>${x.text}</p><small>${x.equipment}</small></article>`).join("")}
      </div>`;
    document.getElementById("closeRunnerTraining").onclick=backToHub;
    document.getElementById("startRunnerRoutine").onclick=()=>{runnerIndex=0;renderRunnerStep()};
  }

  function renderRunnerStep(){
    const x=RUNNER_EXERCISES[runnerIndex];
    const session=document.getElementById("runnerStrengthSession");
    session.innerHTML=`
      <div class="top"><div><small>ÜBUNG ${runnerIndex+1} VON ${RUNNER_EXERCISES.length}</small><h2>Läufer-Stabi</h2></div><button id="endRunnerRoutine" class="secondary">Beenden</button></div>
      <div class="track"><div style="width:${((runnerIndex+1)/RUNNER_EXERCISES.length)*100}%"></div></div>
      <article class="card runner-session-card">
        <h2>${x.name}</h2>
        ${exerciseImage(x.name,"",true)}
        <p class="runner-dose">${x.dose}</p>
        <div class="note">${x.text}</div>
        <div class="runner-equipment"><span>${x.equipment}</span></div>
        <div class="runner-session-actions">
          <button id="runnerPrev" class="secondary" ${runnerIndex===0?"disabled":""}>Zurück</button>
          <button id="runnerNext">${runnerIndex===RUNNER_EXERCISES.length-1?"Routine abschließen":"Übung erledigt"}</button>
        </div>
      </article>`;
    document.getElementById("endRunnerRoutine").onclick=renderRunnerOverview;
    document.getElementById("runnerPrev").onclick=()=>{if(runnerIndex>0){runnerIndex--;renderRunnerStep()}};
    document.getElementById("runnerNext").onclick=()=>{
      if(runnerIndex>=RUNNER_EXERCISES.length-1) return renderRunnerComplete();
      runnerIndex++;renderRunnerStep();
    };
  }

  function renderRunnerComplete(){
    const session=document.getElementById("runnerStrengthSession");
    session.innerHTML=`
      <article class="card center">
        <div class="check">✓</div>
        <h2>Läufer-Stabi erledigt</h2>
        <p class="muted">Füße, Sprunggelenke, Waden, Knie und Hüfte sind durch.</p>
        <button id="runnerDone" class="wide">Zurück zu Training</button>
      </article>`;
    document.getElementById("runnerDone").onclick=backToHub;
  }


  function renderSkiOverview(){
    document.getElementById("trainingHubOverview").hidden=true;
    const session=document.getElementById("runnerStrengthSession");
    session.hidden=false;
    session.innerHTML=`
      <div class="top"><div><small>SKI-TRAINING ZUHAUSE</small><h2>Ski-Workout</h2></div><button id="closeSkiTraining" class="secondary">Zurück</button></div>
      <article class="card">
        <p>Diese Einheit bereitet Beine und Rumpf gezielt auf die Belastung beim Skifahren vor. Fokus auf Quadrizeps-Ausdauer, Bremskraft, seitliche Stabilität und Einbein-Kontrolle.</p>
        <div class="runner-equipment"><span>⏱ ca. 25 Min.</span><span>🏠 zuhause</span><span>🧱 Wand</span><span>🧘 Matte</span><span>🛋️ Sofa/Hocker</span><span>🏋️ Kettlebell optional</span></div>
        <button id="startSkiRoutine" class="wide">Routine starten</button>
      </article>
      <div class="runner-list">
        ${SKI_EXERCISES.map((x,i)=>`<article><h3>${i+1}. ${x.name}</h3>${exerciseImage(x.name)}<p class="runner-dose">${x.dose}</p><p>${x.text}</p><small>${x.equipment}</small></article>`).join("")}
      </div>`;
    document.getElementById("closeSkiTraining").onclick=backToHub;
    document.getElementById("startSkiRoutine").onclick=()=>{skiIndex=0;renderSkiStep()};
  }

  function renderSkiStep(){
    const x=SKI_EXERCISES[skiIndex];
    const session=document.getElementById("runnerStrengthSession");
    session.innerHTML=`
      <div class="top"><div><small>ÜBUNG ${skiIndex+1} VON ${SKI_EXERCISES.length}</small><h2>Ski-Workout</h2></div><button id="endSkiRoutine" class="secondary">Beenden</button></div>
      <div class="track"><div style="width:${((skiIndex+1)/SKI_EXERCISES.length)*100}%"></div></div>
      <article class="card runner-session-card">
        <h2>${x.name}</h2>
        ${exerciseImage(x.name,"",true)}
        <p class="runner-dose">${x.dose}</p>
        <div class="note">${x.text}</div>
        <div class="runner-equipment"><span>${x.equipment}</span></div>
        <div class="runner-session-actions">
          <button id="skiPrev" class="secondary" ${skiIndex===0?"disabled":""}>Zurück</button>
          <button id="skiNext">${skiIndex===SKI_EXERCISES.length-1?"Routine abschließen":"Übung erledigt"}</button>
        </div>
      </article>`;
    document.getElementById("endSkiRoutine").onclick=renderSkiOverview;
    document.getElementById("skiPrev").onclick=()=>{if(skiIndex>0){skiIndex--;renderSkiStep()}};
    document.getElementById("skiNext").onclick=()=>{
      if(skiIndex>=SKI_EXERCISES.length-1)return renderSkiComplete();
      skiIndex++;renderSkiStep();
    };
  }

  function renderSkiComplete(){
    const session=document.getElementById("runnerStrengthSession");
    session.innerHTML=`
      <article class="card center">
        <div class="check">✓</div>
        <h2>Ski-Workout erledigt</h2>
        <p class="muted">Oberschenkel, seitliche Stabilität, Waden und Core sind durch.</p>
        <button id="skiDone" class="wide">Zurück zu Training</button>
      </article>`;
    document.getElementById("skiDone").onclick=backToHub;
  }

  function backToHub(){
    document.getElementById("runnerStrengthSession").hidden=true;
    document.getElementById("trainingHubOverview").hidden=false;
    showTrainingNav();
    requestAnimationFrame(()=>scrollTo({top:0,left:0,behavior:"auto"}));
  }

  function init(){
    styles();
    renderHub();
    const nav=document.querySelector('nav button[data-view="trainingHub"]');
    if(nav) nav.addEventListener("click",()=>setTimeout(()=>{renderHub();backToHub()},0));
    window.RepPilotTrainingHub={version:VERSION,runnerExercises:RUNNER_EXERCISES,skiExercises:SKI_EXERCISES,refresh:renderHub};
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
