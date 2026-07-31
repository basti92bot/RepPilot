const WORKOUTS=[
{id:"push",day:1,dayName:"Montag",title:"Push – Brust Fokus",exercises:[
["Schrägbankdrücken",4,60],
["Brustpresse",3,50],
["Kabel-Flys",3,20],
["Schulterpresse",3,35],
["Seitheben Kabel",3,7.5],
["Trizepsdrücken Seil",3,25],
["Overhead Trizeps Kabel",3,20],
["Crunch-Maschine",3,30]
]},
{id:"pull-legs",day:3,dayName:"Mittwoch",title:"Pull + Beine",exercises:[
["Beinpresse",4,120],
["Rumänisches Kreuzheben",3,60],
["Brustgestütztes Rudern",4,50],
["Latzug neutral",3,55],
["Kabelrudern",3,45],
["Reverse Butterfly am Kabel",3,10],
["Shrugs",3,60],
["Kabelcurls",3,20],
["Wadenheben",3,60],
["Hanging Leg Raises",3,0]
]},
{id:"upper-hypertrophy",day:5,dayName:"Freitag",title:"Oberkörper Hypertrophie",exercises:[
["Schrägbankdrücken leicht",3,50],
["Kabel-Flys",3,20],
["Latzug breit",3,50],
["Brustgestütztes Rudern",3,45],
["Seitheben",3,8],
["Hammercurls",3,12],
["Trizepsdrücken Seil",3,25],
["Liegestütze bis Maximum",2,0],
["Crunch-Maschine",3,30]
]}
];
const WEEK=[
{day:1,dayName:"Montag",title:"Push – Brust Fokus",type:"strength",workoutId:"push",meta:"Brust, Schulter, Trizeps · ca. 60–70 Min."},
{day:2,dayName:"Dienstag",title:"Intervalltraining Laufband",type:"run",runId:"interval",meta:"37 Minuten · 1 % Steigung"},
{day:3,dayName:"Mittwoch",title:"Pull + Beine",type:"strength",workoutId:"pull-legs",meta:"Rücken, Beine, Bizeps · ca. 65–75 Min."},
{day:4,dayName:"Donnerstag",title:"Lockerer Dauerlauf",type:"run",meta:"Ruhiges Gesprächstempo"},
{day:5,dayName:"Freitag",title:"Oberkörper Hypertrophie",type:"strength",workoutId:"upper-hypertrophy",meta:"Brust, Rücken, Arme · ca. 60–70 Min."},
{day:6,dayName:"Samstag",title:"Rest Day",type:"rest",meta:"Spaziergang oder Mobility"},
{day:0,dayName:"Sonntag",title:"Rest Day",type:"rest",meta:"Erholung und Vorbereitung"}];
const RUN_PLANS={interval:{title:"Intervalltraining Laufband",meta:"37 Minuten · 1 % Steigung",intro:"Die schnellen Abschnitte liegen knapp über dem Zieltempo für 6 km unter 35 Minuten.",steps:[
["Einlaufen","8 Minuten","7,0–7,5 km/h"],["Schnelles Intervall","6 × 2 Minuten","10,5 km/h"],["Lockere Pause","nach jedem Intervall 2 Minuten","7,0–7,5 km/h"],["Auslaufen","5 Minuten","6,0–6,5 km/h"]],note:"Wenn alle sechs Intervalle sauber gehen, beim nächsten Mal auf 10,7 km/h erhöhen."}};
const TIPS={"Schrägbankdrücken leicht":"Kontrolliert absenken und mit 1–2 Wiederholungen Reserve trainieren.",
"Schrägbankdrücken":"Schulterblätter hinten lassen und Brust stolz halten.","Brustgestütztes Rudern":"Mit den Ellenbogen ziehen, nicht mit den Händen.","Brustpresse":"Nicht komplett durchdrücken, Spannung halten.","Latzug neutral":"Zur oberen Brust ziehen.","Schulterpresse":"Bauch fest und kein Hohlkreuz.","Seitheben Kabel":"Ellenbogen führen und Schulter unten lassen.","Face Pulls":"Zum Gesicht ziehen und Hände nach außen führen.","Shrugs":"Schultern gerade hochziehen, nicht kreisen.","Trizepsdrücken Seil":"Oberarme ruhig am Körper lassen.","Kabelcurls":"Ellenbogen am Körper lassen.","Hanging Leg Raises":"Langsam absenken und nicht schwingen.","Beinpresse":"Knie folgen den Fußspitzen.","Rumänisches Kreuzheben":"Rücken neutral, Hüfte nach hinten.","Beinstrecker":"Kontrolliert bewegen, oben nicht einrasten.","Wadenheben":"Oben halten, unten vollständig dehnen.","Adduktoren":"Langsam schließen und kontrolliert öffnen.","Abduktoren":"Ohne Schwung nach außen drücken.","Crunch-Maschine":"Aus dem Bauch einrollen.","Kabel-Flys":"Ellenbogen leicht gebeugt, kontrolliert schließen.","Latzug breit":"Zur oberen Brust ziehen.","Kabelrudern":"Brust raus, Schulterblätter zusammen.","Reverse Butterfly am Kabel":"Kabel über Kreuz greifen und aus der hinteren Schulter öffnen.","Seitheben":"Ellenbogen führen, nicht über Schulterhöhe.","Overhead Trizeps Kabel":"Ellenbogen eng neben dem Kopf.","Hammercurls":"Handgelenke gerade, nicht schwingen.","Liegestütze bis Maximum":"Saubere Technik vor Wiederholungszahl."};

const STRETCHES=[
{id:"calf",name:"Wade an der Wand",seconds:60,bilateral:true,sideA:"Linke Wade",sideB:"Rechte Wade",instruction:"Hinteres Bein strecken, Ferse fest am Boden lassen und den Oberkörper langsam nach vorne bewegen.",art:"calf"},
{id:"quad",name:"Oberschenkel vorne",seconds:60,bilateral:true,sideA:"Linkes Bein",sideB:"Rechtes Bein",instruction:"Fuß zum Gesäß ziehen, Knie nebeneinander halten und das Becken leicht nach vorne kippen.",art:"quad"},
{id:"hamstring",name:"Oberschenkel hinten",seconds:60,bilateral:true,sideA:"Linkes Bein",sideB:"Rechtes Bein",instruction:"Ein Bein nach vorne stellen, Hüfte nach hinten schieben und den Rücken lang halten.",art:"hamstring"},
{id:"hip",name:"Hüftbeuger",seconds:60,bilateral:true,sideA:"Linke Hüfte",sideB:"Rechte Hüfte",instruction:"Im Ausfallschritt das hintere Knie ablegen, Gesäß anspannen und das Becken leicht nach vorne schieben.",art:"hip"},
{id:"glute",name:"Gesäß",seconds:60,bilateral:true,sideA:"Linke Seite",sideB:"Rechte Seite",instruction:"Knöchel auf das andere Knie legen und mit geradem Rücken langsam nach vorne lehnen.",art:"glute"},
{id:"chest",name:"Brust und Schulter",seconds:60,bilateral:true,sideA:"Linke Seite",sideB:"Rechte Seite",instruction:"Arm an einer Wand ablegen und den Oberkörper langsam von der Wand wegdrehen.",art:"chest"},
{id:"plantar",name:"Plantarfaszie und Zehen",seconds:60,bilateral:true,sideA:"Linker Fuß",sideB:"Rechter Fuß",instruction:"Zehen an einer Wand aufstellen, Ferse am Boden lassen und das Knie langsam nach vorne schieben.",art:"plantar"},
{id:"ankle",name:"Sprunggelenk",seconds:60,bilateral:true,sideA:"Linkes Sprunggelenk",sideB:"Rechtes Sprunggelenk",instruction:"Fuß flach aufstellen und das Knie kontrolliert über die Zehen nach vorne führen. Ferse bleibt unten.",art:"ankle"}
];

const STRETCH_WORK_SECONDS=60;
const STRETCH_TRANSITION_SECONDS=30;
let stretchIndex=0;
let stretchMode="idle";
let stretchRemaining=0;
let stretchTimer=null;
let stretchPaused=false;
let stretchSideSwitched=false;

function stretchArt(type){
  const figures={
    calf:`<svg viewBox="0 0 320 190" role="img" aria-label="Wadendehnung an der Wand"><path class="wall" d="M270 20v150"/><circle cx="155" cy="38" r="15"/><path d="M155 53l8 53M163 72l44 25M160 73l-32 34M163 106l-47 54M163 106l70 54"/><path class="focus-line" d="M225 125l15 35"/></svg>`,
    quad:`<svg viewBox="0 0 320 190" role="img" aria-label="Dehnung Oberschenkelvorderseite"><circle cx="160" cy="35" r="15"/><path d="M160 50v58M160 70l-35 30M160 70l35 24M160 108l-28 60M160 108l38 35 20-42"/><path class="focus-line" d="M194 117l22-18"/></svg>`,
    hamstring:`<svg viewBox="0 0 320 190" role="img" aria-label="Dehnung Oberschenkelrückseite"><circle cx="145" cy="40" r="15"/><path d="M145 55l30 48M158 72l46 25M149 75l-37 30M175 103l-65 55M175 103l78 55"/><path class="ground" d="M55 160h220"/><path class="focus-line" d="M118 144l45-36"/></svg>`,
    hip:`<svg viewBox="0 0 320 190" role="img" aria-label="Hüftbeugerdehnung"><circle cx="160" cy="35" r="15"/><path d="M160 50v57M160 73l-38 28M160 73l38 26M160 107l-55 45M160 107l65 48"/><path class="ground" d="M65 158h205"/><path class="focus-line" d="M153 108l-32 32"/></svg>`,
    glute:`<svg viewBox="0 0 320 190" role="img" aria-label="Gesäßdehnung im Sitzen"><circle cx="155" cy="35" r="15"/><path d="M155 50l18 58M165 72l40 28M160 73l-35 32M173 108l-65 38M173 108l65 38M125 120l52 25"/><path class="seat" d="M80 148h175"/><path class="focus-line" d="M142 113l35 29"/></svg>`,
    chest:`<svg viewBox="0 0 320 190" role="img" aria-label="Brust- und Schulterdehnung an der Wand"><path class="wall" d="M255 20v150"/><circle cx="160" cy="38" r="15"/><path d="M160 53v60M160 72l-45 34M160 72l78 8M160 113l-35 52M160 113l40 52"/><path class="focus-line" d="M188 73l45 7"/></svg>`,
    plantar:`<svg viewBox="0 0 320 190" role="img" aria-label="Plantarfasziendehnung an der Wand"><path class="wall" d="M255 20v150"/><circle cx="145" cy="35" r="15"/><path d="M145 50v60M145 72l-35 32M145 72l36 30M145 110l-45 50M145 110l75 48"/><path class="focus-line" d="M218 156l25-20"/></svg>`,
    ankle:`<svg viewBox="0 0 320 190" role="img" aria-label="Sprunggelenkmobilisation Knie zur Wand"><path class="wall" d="M255 20v150"/><circle cx="150" cy="36" r="15"/><path d="M150 51l25 57M160 72l52 24M153 74l-35 31M175 108l-58 51M175 108l65 50"/><path class="focus-line" d="M230 142l13 17"/></svg>`
  };
  return figures[type]||figures.calf;
}

function renderStretchPreview(){
  $("stretchPreview").innerHTML=STRETCHES.map((x,i)=>`<article class="card stretch-preview-card"><div class="stretch-preview-number">${i+1}</div><div class="stretch-preview-art">${stretchArt(x.art)}</div><div><h3>${x.name}</h3><p>${x.instruction}</p><small>30 Sek. je Seite</small></div></article>`).join("");
}

function showStretchScreen(screen){
  $("stretchOverview").hidden=screen!=="overview";
  $("stretchRoutine").hidden=screen!=="routine";
  $("stretchComplete").hidden=screen!=="complete";
}

function startStretchRoutine(){
  stopStretchTimer();
  stretchIndex=0;
  stretchPaused=false;
  showStretchScreen("routine");
  startStretchExercise();
}

function startStretchExercise(){
  stretchMode="work";
  stretchRemaining=STRETCHES[stretchIndex].seconds;
  stretchSideSwitched=false;
  $("stretchNextBox").hidden=true;
  $("startStretchNowBtn").hidden=true;
  $("pauseStretchBtn").hidden=false;
  $("skipStretchBtn").hidden=false;
  renderStretchSession();
  runStretchTimer();
}

function startStretchTransition(){
  if(stretchIndex>=STRETCHES.length-1){completeStretchRoutine();return}
  stretchMode="transition";
  stretchRemaining=STRETCH_TRANSITION_SECONDS;
  $("stretchNextBox").hidden=false;
  $("stretchNextName").textContent=STRETCHES[stretchIndex+1].name;
  $("startStretchNowBtn").hidden=false;
  $("pauseStretchBtn").hidden=false;
  $("skipStretchBtn").hidden=true;
  renderStretchSession();
  runStretchTimer();
}

function renderStretchSession(){
  const item=STRETCHES[stretchIndex];
  $("stretchProgressLabel").textContent=`Übung ${stretchIndex+1} von ${STRETCHES.length}`;
  $("stretchProgressBar").style.width=`${((stretchIndex+(stretchMode==="transition"?1:0))/STRETCHES.length)*100}%`;
  $("stretchArt").innerHTML=stretchArt(item.art);
  $("stretchName").textContent=stretchMode==="transition"?"Umpositionieren":item.name;
  $("stretchInstruction").textContent=stretchMode==="transition"?`Bereite dich auf „${STRETCHES[stretchIndex+1]?.name||""}“ vor.`:item.instruction;
  $("stretchPhaseTitle").textContent=stretchMode==="transition"?"Wechselzeit":"Dehnen";
  $("stretchPhaseLabel").textContent=stretchMode==="transition"?"NÄCHSTE ÜBUNG VORBEREITEN":"DEHNEN";
  $("stretchClockLabel").textContent=stretchMode==="transition"?"Wechselzeit":"Sekunden";
  updateStretchSide();
  updateStretchClock();
}

function updateStretchSide(){
  if(stretchMode==="transition"){$("stretchSide").textContent="";return}
  const item=STRETCHES[stretchIndex];
  const secondHalf=stretchRemaining<=item.seconds/2;
  $("stretchSide").textContent=secondHalf?item.sideB:item.sideA;
  if(secondHalf&&!stretchSideSwitched){
    stretchSideSwitched=true;
    signalStretch();
  }
}

function updateStretchClock(){
  const m=Math.floor(stretchRemaining/60);
  const s=stretchRemaining%60;
  $("stretchTime").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  const total=stretchMode==="work"?STRETCHES[stretchIndex].seconds:STRETCH_TRANSITION_SECONDS;
  $("stretchClock").style.setProperty("--progress",`${Math.min(1,1-stretchRemaining/total)*360}deg`);
}

function runStretchTimer(){
  stopStretchTimer();
  stretchTimer=setInterval(()=>{
    if(stretchPaused)return;
    stretchRemaining--;
    updateStretchSide();
    updateStretchClock();
    if(stretchRemaining<=0){
      signalStretch();
      stopStretchTimer();
      if(stretchMode==="work")startStretchTransition();
      else{stretchIndex++;startStretchExercise()}
    }
  },1000);
}

function toggleStretchPause(){
  stretchPaused=!stretchPaused;
  $("pauseStretchBtn").textContent=stretchPaused?"Fortsetzen":"Pause";
}

function skipStretchPhase(){
  stopStretchTimer();
  if(stretchMode==="work")startStretchTransition();
  else{stretchIndex++;startStretchExercise()}
}

function startNextStretchNow(){
  stopStretchTimer();
  stretchIndex++;
  startStretchExercise();
}

function completeStretchRoutine(){
  stopStretchTimer();
  stretchMode="complete";
  showStretchScreen("complete");
  signalStretch();
}

function endStretchRoutine(){
  stopStretchTimer();
  stretchMode="idle";
  stretchPaused=false;
  $("pauseStretchBtn").textContent="Pause";
  showStretchScreen("overview");
}

function stopStretchTimer(){
  if(stretchTimer!==null)clearInterval(stretchTimer);
  stretchTimer=null;
}

function signalStretch(){
  if("vibrate" in navigator)navigator.vibrate([180,80,180]);
  try{
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)return;
    const ctx=new C(),osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.frequency.value=740;gain.gain.value=.08;osc.connect(gain);gain.connect(ctx.destination);
    osc.start();osc.stop(ctx.currentTime+.16);
  }catch{}
}

const KEY="reppilot-history-v11",REST=120,REPS=10,$=id=>document.getElementById(id);
let active=null,ei=0,si=0,phase="set",timer=null,restEnd=0,restTotal=REST,afterRest=null,lastSet=null;
const history=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}};
const save=v=>localStorage.setItem(KEY,JSON.stringify(v));
const n=v=>{const x=Number(String(v).replace(",","."));return Number.isFinite(x)?x:0};
const kg=v=>new Intl.NumberFormat("de-DE",{maximumFractionDigits:1}).format(v);
const d=v=>new Date(v).toLocaleDateString("de-DE");
function emo(name=""){name=name.toLowerCase();if(name.includes("bein")||name.includes("waden"))return"🦵";if(name.includes("rudern")||name.includes("lat")||name.includes("reverse")||name.includes("shrug"))return"🔙";if(name.includes("curl"))return"💪";if(name.includes("trizeps"))return"🔱";if(name.includes("hanging")||name.includes("crunch"))return"🔥";return"🏋️"}
function vol(e){return e.sets.reduce((s,x)=>x.done?s+n(x.weight)*(x.reps||REPS):s,0)}
function total(w){return w.exercises.reduce((s,e)=>s+vol(e),0)}
function last(name,fallback){for(const w of history().slice().reverse()){const e=w.exercises?.find(x=>x.name===name),s=e?.sets?.slice().reverse().find(x=>x.done);if(s)return{weight:n(s.weight),date:w.finishedAt||w.startedAt}}return{weight:fallback,date:null}}
function best(name){let b=0;for(const w of history())for(const e of w.exercises||[])if(e.name===name)for(const s of e.sets||[])if(s.done)b=Math.max(b,n(s.weight));return b}
function today(){return WEEK.find(x=>x.day===new Date().getDay())||WEEK[0]}
function nextStrength(){const x=new Date().getDay();return WORKOUTS.map(w=>({...w,delta:(w.day-x+7)%7||7})).sort((a,b)=>a.delta-b.delta)[0]}
function show(id){document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));$(id).classList.add("active");document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===id))}
function renderHome(){const t=today();$("todayIcon").textContent=t.type==="run"?"🏃":t.type==="rest"?"😴":"🏋️";$("todayLabel").textContent=`Heute ist ${t.dayName}`;$("nextTitle").textContent=t.title;$("nextMeta").textContent=t.meta;const b=$("startBtn");
if(t.workoutId){b.hidden=false;b.textContent="Training starten";b.onclick=()=>start(t.workoutId);$("todayHint").textContent=""}else if(t.runId){b.hidden=false;b.textContent="Laufplan anzeigen";b.onclick=()=>openRun(t.runId);$("todayHint").textContent="Geschwindigkeiten direkt fürs Laufband."}else{b.hidden=true;$("todayHint").textContent=t.type==="run"?"Locker laufen, sodass du dich noch unterhalten könntest.":`Nächstes Krafttraining: ${nextStrength().dayName}`}
$("plan").innerHTML=WEEK.slice().sort((a,b)=>((a.day+6)%7)-((b.day+6)%7)).map(x=>`<article class="plan-item ${x.day===new Date().getDay()?"today":""}"><div class="plan-icon">${x.type==="run"?"🏃":x.type==="rest"?"😴":"🏋️"}</div><div class="plan-copy"><div class="day">${x.dayName}</div><h3>${x.title}</h3><p>${x.meta}</p></div>${x.workoutId?`<button data-workout="${x.workoutId}">Starten</button>`:x.runId?`<button data-run="${x.runId}">Plan</button>`:`<span class="badge">${x.type==="run"?"Laufen":"Erholung"}</span>`}</article>`).join("");
document.querySelectorAll("[data-workout]").forEach(b=>b.onclick=()=>start(b.dataset.workout));document.querySelectorAll("[data-run]").forEach(b=>b.onclick=()=>openRun(b.dataset.run))}
function start(id){const w=WORKOUTS.find(x=>x.id===id);active={id:w.id,title:w.title,startedAt:new Date().toISOString(),exercises:w.exercises.map(([name,c,def])=>{const p=last(name,def);return{name,lastTraining:p.date?p:null,sets:Array.from({length:c},(_,i)=>({index:i+1,weight:p.weight,reps:REPS,done:false}))}})};ei=0;si=0;phase="set";cancelRest();renderWorkout();show("workout")}
function current(){return active.exercises[ei]}
function renderWorkout(){$("workoutTitle").textContent=active.title;$("counter").textContent=`Übung ${ei+1} von ${active.exercises.length}`;$("bar").style.width=`${((ei+(phase==="complete"?1:0))/active.exercises.length)*100}%`;$("setPanel").hidden=phase!=="set";$("restPanel").hidden=phase!=="rest";$("completePanel").hidden=phase!=="complete";phase==="set"?renderSet():phase==="rest"?renderRest():renderComplete()}
function renderSet(){const e=current(),s=e.sets[si];$("exerciseName").textContent=e.name;$("exerciseIcon").textContent=emo(e.name);$("exerciseTip").textContent=TIPS[e.name]||"Ruhig und kontrolliert ausführen.";$("setCounter").textContent=`Satz ${si+1} von ${e.sets.length}`;$("fixedReps").textContent=e.name.includes("Maximum")?"Saubere Wiederholungen":"10 Wiederholungen";$("lastTraining").hidden=!e.lastTraining;if(e.lastTraining){$("lastWeightValue").textContent=`${kg(e.lastTraining.weight)} kg`;$("lastWeightDate").textContent=`vom ${d(e.lastTraining.date)}`}$("weightInput").value=s.weight;$("previousSet").hidden=si===0;if(si>0){const p=e.sets[si-1];$("previousSet").textContent=`Letzter Satz: ${kg(p.weight)} kg × ${p.reps}`}$("completeSetBtn").textContent=si===e.sets.length-1?"Letzten Satz abschließen":"Satz abschließen"}
function completeSet(){const e=current(),s=e.sets[si];if($("weightInput").value.trim()==="")return $("weightInput").focus();s.weight=n($("weightInput").value);s.done=true;lastSet={name:e.name,no:si+1,weight:s.weight};if(si<e.sets.length-1){e.sets[si+1].weight=s.weight;beginRest({type:"set",index:si+1})}else beginRest({type:"complete"})}
function beginRest(next){cancelRest();afterRest=next;restTotal=REST;restEnd=Date.now()+REST*1000;phase="rest";renderWorkout();timer=setInterval(updateRest,250)}
function renderRest(){$("restSetSummary").textContent=`${lastSet.name}: Satz ${lastSet.no} erledigt · ${kg(lastSet.weight)} kg × ${REPS}`;$("restNext").textContent=afterRest.type==="set"?`Danach: Satz ${afterRest.index+1}`:ei<active.exercises.length-1?`Danach: ${active.exercises[ei+1].name}`:"Danach Training speichern.";updateRest()}
function updateRest(){if(phase!=="rest")return;const r=Math.max(0,Math.ceil((restEnd-Date.now())/1000));$("restTime").textContent=`${String(Math.floor(r/60)).padStart(2,"0")}:${String(r%60).padStart(2,"0")}`;$("restClock").style.setProperty("--progress",`${Math.min(1,1-r/restTotal)*360}deg`);if(r===0)finishRest()}
function addRest(){restEnd+=30000;restTotal+=30;updateRest()}function cancelRest(){if(timer)clearInterval(timer);timer=null}function finishRest(){const x=afterRest;cancelRest();if(x?.type==="set"){si=x.index;phase="set"}else phase="complete";renderWorkout();scrollTo({top:0,behavior:"smooth"})}
function renderComplete(){const e=current(),before=best(e.name),session=Math.max(...e.sets.filter(x=>x.done).map(x=>n(x.weight)),0),record=session>before;$("completedExerciseIcon").textContent=emo(e.name);$("completedExercise").innerHTML=`${e.name}${record?' <span class="record">🏆 NEUER REKORD</span>':""}`;$("exerciseSummary").textContent=`${e.sets.filter(x=>x.done).length} Sätze · ${kg(vol(e))} kg bewegt${record?` · ${kg(session)} kg Bestleistung`:""}`;const has=ei<active.exercises.length-1;$("nextExerciseBlock").hidden=!has;$("finishWorkoutBlock").hidden=has;if(has){const x=active.exercises[ei+1];$("nextExerciseName").textContent=x.name;$("nextExerciseMeta").textContent=`${x.sets.length} Sätze · jeweils ${REPS} Wiederholungen`;$("nextExerciseTip").textContent=TIPS[x.name]||"Ruhig und kontrolliert.";$("skipNextBtn").disabled=ei+2>=active.exercises.length}else $("workoutVolumePreview").textContent=`${kg(total(active))} kg Gesamtgewicht`}
function nextExercise(){ei++;si=0;phase="set";renderWorkout();scrollTo({top:0,behavior:"smooth"})}function skipExercise(){const i=ei+1;if(i+1>=active.exercises.length)return;[active.exercises[i],active.exercises[i+1]]=[active.exercises[i+1],active.exercises[i]];renderComplete()}
function finish(){active.finishedAt=new Date().toISOString();const h=history();h.push(active);save(h);active=null;renderHistory();renderHome();show("history")}
function renderHistory(){const h=history(),items=h.slice().reverse(),bests={};for(const w of h)for(const e of w.exercises||[])for(const s of e.sets||[])if(s.done)bests[e.name]=Math.max(bests[e.name]||0,n(s.weight));const setCount=h.reduce((a,w)=>a+w.exercises.reduce((b,e)=>b+e.sets.filter(s=>s.done).length,0),0),volume=h.reduce((a,w)=>a+total(w),0);$("stats").innerHTML=`<div class="stat"><strong>${h.length}</strong><small>Trainings</small></div><div class="stat"><strong>${setCount}</strong><small>Sätze</small></div><div class="stat"><strong>${kg(volume)}</strong><small>kg bewegt</small></div>`;$("historyList").innerHTML=items.length?items.map((w,i)=>`<details class="history-item" ${i===0?"open":""}><summary><div><h3>${w.title}</h3><p>${d(w.finishedAt||w.startedAt)}</p></div><strong>${kg(total(w))} kg</strong></summary><ul>${w.exercises.map(e=>{const done=e.sets.filter(s=>s.done);if(!done.length)return"";const m=Math.max(...done.map(s=>n(s.weight)));return`<li><span>${emo(e.name)} ${e.name}${m===bests[e.name]&&m>0?' <span class="record">🏆</span>':""}</span><strong>${kg(vol(e))} kg</strong></li>`}).join("")}</ul></details>`).join(""):`<div class="card center muted">Noch keine Trainings gespeichert.</div>`}
function openRun(id){const p=RUN_PLANS[id];$("runTitle").textContent=p.title;$("runMeta").textContent=p.meta;$("runIntro").textContent=p.intro;$("runSteps").innerHTML=p.steps.map((s,i)=>`<article class="run-step"><span class="step-no">${i+1}</span><div><h3>${s[0]}</h3><p>${s[1]}</p></div><div class="speed">${s[2]}</div></article>`).join("");$("runNote").textContent=p.note;show("run")}
$("completeSetBtn").onclick=completeSet;$("weightInput").addEventListener("keydown",e=>{if(e.key==="Enter")completeSet()});$("addRestBtn").onclick=addRest;$("skipRestBtn").onclick=finishRest;$("startNextBtn").onclick=nextExercise;$("skipNextBtn").onclick=skipExercise;$("finishWorkoutBtn").onclick=finish;$("closeRunBtn").onclick=()=>{renderHome();show("home")};$("cancelBtn").onclick=()=>{if(confirm("Training wirklich abbrechen?")){cancelRest();active=null;show("home")}};document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{if(active&&b.dataset.view!=="workout"&&!confirm("Das laufende Training wird abgebrochen. Fortfahren?"))return;if(active&&b.dataset.view!=="workout"){cancelRest();active=null}if(b.dataset.view==="home")renderHome();if(b.dataset.view==="history")renderHistory();if(b.dataset.view==="stretching"){renderStretchPreview();showStretchScreen("overview")}show(b.dataset.view)});
$("startStretchRoutineBtn").onclick=startStretchRoutine;
$("pauseStretchBtn").onclick=toggleStretchPause;
$("skipStretchBtn").onclick=skipStretchPhase;
$("startStretchNowBtn").onclick=startNextStretchNow;
$("endStretchBtn").onclick=()=>{if(confirm("Dehnroutine wirklich beenden?"))endStretchRoutine()};
$("restartStretchBtn").onclick=startStretchRoutine;
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
renderHome();renderHistory();renderStretchPreview();showStretchScreen("overview");