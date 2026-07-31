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
{id:"plantar-wall",category:"Füße",icon:"🦶",name:"Plantarfaszie an der Wand",duration:"30–45 Sek. je Seite",instruction:"Zehen an die Wand stellen, Ferse am Boden lassen und das Knie langsam nach vorne schieben.",mistake:"Ferse nicht anheben."},
{id:"toe-stretch",category:"Füße",icon:"🦶",name:"Zehen und Fußrücken",duration:"30 Sek. je Seite",instruction:"Im Kniestand die Zehen aufstellen, das Gewicht langsam nach hinten verlagern. Danach den Fußrücken ablegen.",mistake:"Nur bis zu einem deutlichen, nicht stechenden Zug gehen."},
{id:"ankle-knee-wall",category:"Füße",icon:"🦶",name:"Sprunggelenk Knie-zur-Wand",duration:"10 langsame Wiederholungen",instruction:"Fuß flach aufstellen und das Knie kontrolliert Richtung Wand schieben.",mistake:"Knie folgt der Richtung der Zehen."},
{id:"calf-straight",category:"Beine",icon:"🦵",name:"Wade mit gestrecktem Knie",duration:"45 Sek. je Seite",instruction:"Hinteres Bein strecken, Ferse fest in den Boden drücken und Oberkörper leicht nach vorne bringen.",mistake:"Fußspitze gerade nach vorne halten."},
{id:"calf-bent",category:"Beine",icon:"🦵",name:"Tiefe Wade mit gebeugtem Knie",duration:"45 Sek. je Seite",instruction:"Hinteres Knie leicht beugen und die Ferse weiterhin am Boden lassen.",mistake:"Nicht auf die Fußaußenkante kippen."},
{id:"hamstring",category:"Beine",icon:"🦵",name:"Oberschenkelrückseite",duration:"45 Sek. je Seite",instruction:"Ein Bein nach vorne stellen, Hüfte nach hinten schieben und den Rücken lang halten.",mistake:"Nicht rund nach unten ziehen."},
{id:"quad",category:"Beine",icon:"🦵",name:"Oberschenkelvorderseite",duration:"45 Sek. je Seite",instruction:"Fuß zum Gesäß ziehen, Knie nebeneinander halten und das Becken leicht nach vorne kippen.",mistake:"Nicht ins Hohlkreuz gehen."},
{id:"hip-flexor",category:"Beine",icon:"🦵",name:"Hüftbeuger im Ausfallschritt",duration:"45 Sek. je Seite",instruction:"Hinteres Knie ablegen, Gesäß anspannen und das Becken leicht nach vorne schieben.",mistake:"Der Zug kommt aus der Hüfte, nicht aus dem unteren Rücken."},
{id:"run-swings",category:"Vor dem Laufen",icon:"🏃",name:"Beinschwünge",duration:"10–15 je Richtung",instruction:"Seitlich festhalten und das Bein locker vor und zurück sowie seitlich schwingen.",mistake:"Kontrolliert starten, nicht sofort maximal schwingen."},
{id:"run-calf",category:"Vor dem Laufen",icon:"🏃",name:"Dynamische Wadenmobilisation",duration:"12 Wiederholungen je Seite",instruction:"Im Ausfallschritt das vordere Knie mehrfach kontrolliert über den Fuß schieben.",mistake:"Ferse bleibt unten."},
{id:"post-glute",category:"Nach dem Krafttraining",icon:"🏋️",name:"Gesäß im Sitzen",duration:"45 Sek. je Seite",instruction:"Knöchel auf das andere Knie legen und mit geradem Rücken nach vorne lehnen.",mistake:"Nicht am Knie nach unten drücken."},
{id:"post-chest",category:"Nach dem Krafttraining",icon:"🏋️",name:"Brust an der Wand",duration:"30–45 Sek. je Seite",instruction:"Arm an die Wand legen und den Oberkörper langsam wegdrehen.",mistake:"Schulter unten lassen."}
];
const STRETCH_FAVORITES_KEY="reppilot-stretch-favorites-v1";
let activeStretchFilter="Alle";
function stretchFavorites(){try{return JSON.parse(localStorage.getItem(STRETCH_FAVORITES_KEY)||"[]")}catch{return[]}}
function saveStretchFavorites(items){localStorage.setItem(STRETCH_FAVORITES_KEY,JSON.stringify(items))}
function toggleStretchFavorite(id){const items=stretchFavorites();const next=items.includes(id)?items.filter(x=>x!==id):[...items,id];saveStretchFavorites(next);renderStretching()}
function renderStretching(){
 const categories=["Alle","Favoriten","Füße","Beine","Vor dem Laufen","Nach dem Krafttraining"];
 $("stretchFilters").innerHTML=categories.map(x=>`<button class="stretch-filter ${activeStretchFilter===x?"active":""}" data-stretch-filter="${x}">${x}</button>`).join("");
 document.querySelectorAll("[data-stretch-filter]").forEach(b=>b.onclick=()=>{activeStretchFilter=b.dataset.stretchFilter;renderStretching()});
 const favorites=stretchFavorites();
 const items=STRETCHES.filter(x=>activeStretchFilter==="Alle"||(activeStretchFilter==="Favoriten"?favorites.includes(x.id):x.category===activeStretchFilter));
 $("stretchList").innerHTML=items.length?items.map(x=>`<article class="card stretch-card"><div class="stretch-head"><div class="stretch-icon">${x.icon}</div><div><small>${x.category}</small><h3>${x.name}</h3></div><button class="favorite-button ${favorites.includes(x.id)?"active":""}" data-favorite="${x.id}" aria-label="Favorit umschalten">${favorites.includes(x.id)?"★":"☆"}</button></div><div class="stretch-duration">⏱ ${x.duration}</div><p>${x.instruction}</p><p class="stretch-mistake"><strong>Achte darauf:</strong> ${x.mistake}</p></article>`).join(""):`<div class="card center muted">Noch keine Favoriten gespeichert.</div>`;
 document.querySelectorAll("[data-favorite]").forEach(b=>b.onclick=()=>toggleStretchFavorite(b.dataset.favorite));
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
$("completeSetBtn").onclick=completeSet;$("weightInput").addEventListener("keydown",e=>{if(e.key==="Enter")completeSet()});$("addRestBtn").onclick=addRest;$("skipRestBtn").onclick=finishRest;$("startNextBtn").onclick=nextExercise;$("skipNextBtn").onclick=skipExercise;$("finishWorkoutBtn").onclick=finish;$("closeRunBtn").onclick=()=>{renderHome();show("home")};$("cancelBtn").onclick=()=>{if(confirm("Training wirklich abbrechen?")){cancelRest();active=null;show("home")}};document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{if(active&&b.dataset.view!=="workout"&&!confirm("Das laufende Training wird abgebrochen. Fortfahren?"))return;if(active&&b.dataset.view!=="workout"){cancelRest();active=null}if(b.dataset.view==="home")renderHome();if(b.dataset.view==="history")renderHistory();if(b.dataset.view==="stretching")renderStretching();show(b.dataset.view)});
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));renderHome();renderHistory();renderStretching();