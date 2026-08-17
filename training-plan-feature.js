(() => {
const VERSION="11.8.57";
const KEY="reppilot-selected-training-plan";
const PROFILE_KEY="reppilot-user-profile";
const STRENGTH_KEY="reppilot-strength-tests-v1";
const DAY_ORDER=[1,2,3,4,5,6,0];
const DAY_NAMES={1:"Montag",2:"Dienstag",3:"Mittwoch",4:"Donnerstag",5:"Freitag",6:"Samstag",0:"Sonntag"};
const FOCUS_LABELS={strength:"Krafttraining",running:"Laufen",mixed:"Kraft + Laufen"};
const VALID_FREQUENCIES=[2,3,4,5];

const PLANS=[
{id:"personalized",title:"Mein Trainingsplan",subtitle:"Automatisch aus deinen Trainingstagen und Zielen erstellt",icon:"🎯"},
{id:"home",title:"Home Workout",subtitle:"Nur Körpergewicht und Bodenmatte",icon:"🏠"},
{id:"muscle",title:"Muskelaufbau Trainingsplan",subtitle:"Krafttraining im Studio mit Fokus auf Muskelaufbau",icon:"🏋️"},
{id:"weightloss",title:"Abnehmtrainingsplan",subtitle:"Kraft und Cardio mit Fokus auf höheren Kalorienverbrauch",icon:"🔥"}
];

const LEGACY={push:"muscle","pull-legs":"muscle","upper-hypertrophy":"muscle"};
const EXERCISE_NAME_MAP={
  "Reverse Lunges":"Rückwärts-Ausfallschritte","Superman":"Rückenstrecker in Bauchlage","Glute Bridge":"Hüftheben","Pike Push-ups":"Schulter-Liegestütze","Dead Bug":"Diagonales Arm-Bein-Strecken","Crunches":"Unterarmstütz","Plank":"Unterarmstütz","Split Squats":"Stationäre Ausfallschritte","Einbeinige Glute Bridge":"Einbeiniges Hüftheben","Reverse Snow Angels":"Schneeengel in Bauchlage","Bird Dog":"Diagonales Arm-Bein-Strecken im Vierfüßlerstand","Side Plank":"Seitstütz","Leg Raises":"Beinheben","Prone Y-T Raises":"Y-T-Heben in Bauchlage","Glute Bridge March":"Hüftheben mit Beinwechsel","Mountain Climbers":"Bergsteiger",
  "Overhead Cable Extension":"Überkopf-Trizepsstrecken am Kabelzug","Seil-Pushdown":"Trizepsdrücken am Seilzug","Incline Curls":"Schrägbank-Curls","Reverse Butterfly am Kabel":"Reverse Butterfly am Kabelzug","Preacher Curls":"Scott-Curls","Hanging Leg Raises":"Hängendes Beinheben","Cross Body Cable Extension":"Einarmiger Trizeps am Kabelzug","Seitheben Kabel":"Seitheben am Kabelzug",
  "Fliegende am Kabelzug":"Kabel-Flys","Bauchpresse an der Maschine":"Crunch-Maschine"
};

const MUSCLE_WEEK=[
{day:1,dayName:"Montag",title:"Push",type:"strength",workoutId:"push",meta:"Brust, Schulter, Trizeps · ca. 45–55 Min."},
{day:2,dayName:"Dienstag",title:"Intervalltraining Laufband",type:"run",runId:"interval",meta:"37 Minuten · 1 % Steigung"},
{day:3,dayName:"Mittwoch",title:"Ruhetag",type:"rest",meta:"Erholung, Spaziergang oder Mobilität"},
{day:4,dayName:"Donnerstag",title:"Pull + Beine",type:"strength",workoutId:"pull-legs",meta:"Rücken, Beine, Bizeps · ca. 65–75 Min."},
{day:5,dayName:"Freitag",title:"Oberkörper",type:"strength",workoutId:"upper-hypertrophy",meta:"Brust, Rücken, Schulter, Arme · ca. 45–55 Min."},
{day:6,dayName:"Samstag",title:"Lockerer Dauerlauf",type:"run",runId:"easy",meta:"Ruhiges Gesprächstempo"},
{day:0,dayName:"Sonntag",title:"Ruhetag",type:"rest",meta:"Erholung und Vorbereitung"}
];
const HOME_WEEK=[
{day:1,dayName:"Montag",title:"Home Workout A",type:"strength",workoutId:"home-a",meta:"Ganzkörper · nur Bodenmatte · ca. 35–45 Min."},{day:2,dayName:"Dienstag",title:"Dehnen: Rücken, Beine & Füße",type:"stretch",meta:"Geführte Mobilität · ca. 10–12 Min."},{day:3,dayName:"Mittwoch",title:"Home Workout B",type:"strength",workoutId:"home-b",meta:"Ganzkörper · nur Bodenmatte · ca. 35–45 Min."},{day:4,dayName:"Donnerstag",title:"Lockerer Dauerlauf",type:"run",runId:"easy",meta:"Ruhiges Gesprächstempo"},{day:5,dayName:"Freitag",title:"Home Workout C",type:"strength",workoutId:"home-c",meta:"Ganzkörper · nur Bodenmatte · ca. 35–45 Min."},{day:6,dayName:"Samstag",title:"Dehnen: Rücken, Beine & Füße",type:"stretch",meta:"Geführte Mobilität · ca. 10–12 Min."},{day:0,dayName:"Sonntag",title:"Erholung",type:"rest",meta:"Regeneration"}
];
const WEIGHTLOSS_WEEK=[
{day:1,dayName:"Montag",title:"Ganzkörper Kraft A",type:"strength",workoutId:"loss-a",meta:"Krafttraining · ca. 45–55 Min."},{day:2,dayName:"Dienstag",title:"Intervalltraining Laufband",type:"run",runId:"interval",meta:"37 Minuten · 1 % Steigung"},{day:3,dayName:"Mittwoch",title:"Aktive Erholung",type:"rest",meta:"Spaziergang oder Mobilität"},{day:4,dayName:"Donnerstag",title:"Lockerer Dauerlauf",type:"run",runId:"easy",meta:"Ruhiges Gesprächstempo"},{day:5,dayName:"Freitag",title:"Ganzkörper Kraft B",type:"strength",workoutId:"loss-b",meta:"Krafttraining · ca. 45–55 Min."},{day:6,dayName:"Samstag",title:"Aktive Erholung",type:"rest",meta:"Spaziergang"},{day:0,dayName:"Sonntag",title:"Erholung",type:"rest",meta:"Regeneration"}
];

function profileData(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}")||{}}catch{return{}}}
function normalizeDays(v){const xs=Array.isArray(v)?v.map(Number):[];return DAY_ORDER.filter(d=>xs.includes(d))}
function read(){const raw=localStorage.getItem(KEY);const id=LEGACY[raw]||raw||"muscle";return PLANS.some(p=>p.id===id)?id:"muscle"}
function save(id){if(PLANS.some(p=>p.id===id))localStorage.setItem(KEY,id)}
function personalizedDescriptor(){const p=profileData(),days=normalizeDays(p.trainingDays),count=Number(p.trainingDaysPerWeek)||days.length||0;return{id:"personalized",title:`Mein ${count||""}-Tage-Plan`.replace(" -"," "),subtitle:`${FOCUS_LABELS[p.trainingFocus]||"Persönliches Training"}${days.length?` · ${days.map(d=>DAY_NAMES[d].slice(0,2)).join(", ")}`:""}`,icon:"🎯"}}
function current(){return read()==="personalized"?personalizedDescriptor():(PLANS.find(p=>p.id===read())||PLANS[2])}
function translatedName(name){return EXERCISE_NAME_MAP[name]||name}

function migrateExerciseNames(){
  try{
    const keys=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&key.startsWith("reppilot-history"))keys.push(key)}
    keys.forEach(key=>{const raw=localStorage.getItem(key);if(!raw)return;const rows=JSON.parse(raw);let changed=false;if(Array.isArray(rows))rows.forEach(workout=>{(workout?.exercises||[]).forEach(exercise=>{const next=translatedName(exercise?.name);if(next&&next!==exercise?.name){exercise.name=next;changed=true}});if(typeof workout?.title==="string"&&/^Zuhause-Training/.test(workout.title)){workout.title=workout.title.replace(/^Zuhause-Training/,"Home Workout");changed=true}});if(changed)localStorage.setItem(key,JSON.stringify(rows))});
  }catch(e){console.warn("Alte Übungsnamen im Verlauf konnten nicht migriert werden",e)}
  try{
    const raw=localStorage.getItem(STRENGTH_KEY);if(!raw)return;const rows=JSON.parse(raw);let changed=false;if(Array.isArray(rows))rows.forEach(item=>{if(typeof item?.exercise!=="string")return;if(item.exercise.startsWith("home::")){const name=item.exercise.slice(6),next=translatedName(name);if(next!==name){item.exercise=`home::${next}`;changed=true}}else{const next=translatedName(item.exercise);if(next!==item.exercise){item.exercise=next;changed=true}}});if(changed)localStorage.setItem(STRENGTH_KEY,JSON.stringify(rows));
  }catch(e){console.warn("Alte Krafttest-Namen konnten nicht migriert werden",e)}
}

function translateCurrentWorkouts(){try{(Array.isArray(WORKOUTS)?WORKOUTS:[]).forEach(workout=>{workout.exercises=(workout.exercises||[]).map(([name,sets,weight])=>[translatedName(name),sets,weight])})}catch(e){console.warn("Übungsnamen konnten nicht normalisiert werden",e)}}

function ensureCustomWorkouts(){
  try{
    const put=w=>{const existing=WORKOUTS.find(x=>x.id===w.id);if(existing)Object.assign(existing,w);else WORKOUTS.push(w)};
    put({id:"home-a",day:1,dayName:"Montag",title:"Home Workout A",exercises:[["Kniebeugen",3,0],["Liegestütze bis Maximum",3,0],["Rückwärts-Ausfallschritte",3,0],["Rückenstrecker in Bauchlage",3,0],["Hüftheben",3,0],["Schulter-Liegestütze",2,0],["Diagonales Arm-Bein-Strecken",3,0],["Unterarmstütz",3,0]]});
    put({id:"home-b",day:3,dayName:"Mittwoch",title:"Home Workout B",exercises:[["Stationäre Ausfallschritte",3,0],["Enge Liegestütze",3,0],["Einbeiniges Hüftheben",3,0],["Schneeengel in Bauchlage",3,0],["Diagonales Arm-Bein-Strecken im Vierfüßlerstand",3,0],["Wadenheben",3,0],["Seitstütz",2,0],["Beinheben",3,0]]});
    put({id:"home-c",day:5,dayName:"Freitag",title:"Home Workout C",exercises:[["Tempo-Kniebeugen",3,0],["Liegestütze bis Maximum",3,0],["Rückwärts-Ausfallschritte",3,0],["Y-T-Heben in Bauchlage",3,0],["Hüftheben mit Beinwechsel",3,0],["Schulter-Liegestütze",2,0],["Bergsteiger",3,0],["Unterarmstütz",3,0]]});
    put({id:"loss-a",day:1,dayName:"Montag",title:"Ganzkörper A",exercises:[["Beinpresse",3,80],["Brustpresse",3,40],["Latzug neutral",3,45],["Schulterpresse",2,25],["Rumänisches Kreuzheben",3,50],["Trizepsdrücken am Seilzug",2,20],["Schrägbank-Curls",2,10],["Crunch-Maschine",3,25]]});
    put({id:"loss-b",day:5,dayName:"Freitag",title:"Ganzkörper B",exercises:[["Beinbeuger",3,35],["Schrägbankdrücken leicht",3,40],["Brustgestütztes Rudern",3,40],["Beinstrecker",3,35],["Seitheben",2,6],["Hammercurls",2,10],["Einarmiger Trizeps am Kabelzug",2,8],["Wadenheben",3,50],["Crunch-Maschine",3,25]]});
    put({id:"personal-upper-a",day:1,dayName:"",title:"Oberkörper A",exercises:[["Schrägbankdrücken",3,60],["Brustgestütztes Rudern",3,50],["Schulterpresse",3,35],["Latzug neutral",3,55],["Seitheben am Kabelzug",2,7.5],["Trizepsdrücken am Seilzug",2,25],["Schrägbank-Curls",2,12],["Crunch-Maschine",2,30]]});
    put({id:"personal-lower-a",day:2,dayName:"",title:"Unterkörper A",exercises:[["Beinpresse",3,120],["Rumänisches Kreuzheben",3,60],["Beinstrecker",3,40],["Beinbeuger",3,40],["Wadenheben",3,60],["Hängendes Beinheben",2,0]]});
    put({id:"personal-upper-b",day:4,dayName:"",title:"Oberkörper B",exercises:[["Brustpresse",3,50],["Latzug breit",3,50],["Brustgestütztes Rudern",3,45],["Kabel-Flys",2,20],["Seitheben",2,8],["Einarmiger Trizeps am Kabelzug",2,10],["Scott-Curls",2,20],["Crunch-Maschine",2,30]]});
    put({id:"personal-lower-b",day:5,dayName:"",title:"Unterkörper B",exercises:[["Beinpresse",3,100],["Rumänisches Kreuzheben",3,50],["Beinbeuger",3,35],["Beinstrecker",3,35],["Wadenheben",3,55],["Hängendes Beinheben",2,0]]});
    put({id:"personal-pull",day:2,dayName:"",title:"Pull",exercises:[["Brustgestütztes Rudern",3,50],["Latzug neutral",3,55],["Reverse Butterfly am Kabelzug",3,12],["Scott-Curls",3,20],["Schrägbank-Curls",2,12],["Hängendes Beinheben",2,0]]});
    put({id:"personal-legs",day:3,dayName:"",title:"Beine",exercises:[["Beinpresse",3,120],["Rumänisches Kreuzheben",3,60],["Beinstrecker",3,40],["Beinbeuger",3,40],["Wadenheben",3,60],["Crunch-Maschine",2,30]]});
  }catch(e){console.error("Trainingsplan-Erweiterung fehlgeschlagen",e)}
}

function ensureRunPlans(){
  try{
    if(!RUN_PLANS.easy)RUN_PLANS.easy={title:"Lockerer Dauerlauf",meta:"Ruhiges Gesprächstempo",intro:"Locker laufen. Das Tempo so wählen, dass du dich noch unterhalten kannst.",steps:[["Lockerer Lauf","frei","Ruhiges Gesprächstempo"]],note:"Gleichmäßig und entspannt bleiben."};
    RUN_PLANS.tempo={title:"Tempolauf",meta:"Zügig, aber kontrolliert",intro:"Nach dem Einlaufen folgt ein zusammenhängender zügiger Abschnitt. Du solltest noch kurze Sätze sprechen können.",steps:[["Einlaufen","10 Minuten","Locker"],["Tempolauf","15–20 Minuten","Zügig und gleichmäßig"],["Auslaufen","5–10 Minuten","Sehr locker"]],note:"Nicht sprinten. Ziel ist ein kontrolliertes, gleichmäßiges Tempo."};
    RUN_PLANS.long={title:"Langer Dauerlauf",meta:"45–60 Minuten locker",intro:"Ruhiger längerer Lauf für die Grundlagenausdauer. Das Tempo bleibt bewusst entspannt.",steps:[["Langer Lauf","45–60 Minuten","Ruhiges Gesprächstempo"]],note:"Lieber etwas langsamer laufen und die Zeit sauber durchziehen."};
    RUN_PLANS.recovery={title:"Regenerationslauf",meta:"20–30 Minuten sehr locker",intro:"Sehr lockerer Lauf zur aktiven Erholung. Tempo bewusst niedrig halten.",steps:[["Regenerationslauf","20–30 Minuten","Sehr locker"]],note:"Dieser Lauf soll sich leicht anfühlen – kein Tempotraining."};
  }catch(e){console.warn("Laufpläne konnten nicht ergänzt werden",e)}
}

function ensureExerciseTips(){
  try{
    if(typeof TIPS==="undefined")return;
    Object.assign(TIPS,{"Kniebeugen":"Füße etwa schulterbreit. Knie folgen den Fußspitzen und der Rücken bleibt stabil.","Rückwärts-Ausfallschritte":"Einen großen Schritt nach hinten machen. Vorderes Knie stabil über dem Fuß halten.","Rückenstrecker in Bauchlage":"Bauch und Gesäß anspannen. Kontrolliert anheben.","Hüftheben":"Fersen in den Boden drücken und das Becken aus dem Gesäß anheben.","Schulter-Liegestütze":"Hüfte hoch, Kopf kontrolliert zwischen den Händen Richtung Matte absenken.","Diagonales Arm-Bein-Strecken":"Unteren Rücken auf der Matte halten und langsam strecken.","Unterarmstütz":"Körper in einer Linie halten und den Rumpf fest anspannen.","Stationäre Ausfallschritte":"Senkrecht absenken und über das vordere Bein hochdrücken.","Enge Liegestütze":"Ellenbogen nah am Körper führen.","Einbeiniges Hüftheben":"Becken gerade halten und über die Ferse hochdrücken.","Schneeengel in Bauchlage":"Arme knapp über der Matte in einem großen Bogen führen.","Diagonales Arm-Bein-Strecken im Vierfüßlerstand":"Hüfte stabil halten und diagonal strecken.","Seitstütz":"Körper in einer Linie halten und Hüfte aktiv oben lassen.","Beinheben":"Unteren Rücken auf der Matte halten.","Tempo-Kniebeugen":"Drei Sekunden absenken, kurz halten und kontrolliert hochkommen.","Y-T-Heben in Bauchlage":"Schulterblätter nach hinten unten ziehen.","Hüftheben mit Beinwechsel":"Becken oben und stabil halten.","Bergsteiger":"Rumpf fest halten und Knie kontrolliert nach vorne führen.","Überkopf-Trizepsstrecken am Kabelzug":"Ellenbogen eng neben dem Kopf halten.","Trizepsdrücken am Seilzug":"Oberarme ruhig am Körper lassen.","Schrägbank-Curls":"Oberarme hinter dem Körper lassen und ohne Schwung beugen.","Reverse Butterfly am Kabelzug":"Kontrolliert aus der hinteren Schulter öffnen.","Scott-Curls":"Oberarme fest auflegen und kontrolliert absenken.","Hängendes Beinheben":"Langsam absenken und nicht schwingen.","Einarmiger Trizeps am Kabelzug":"Oberarm ruhig halten und Unterarm kontrolliert strecken.","Kabel-Flys":"Ellenbogen leicht gebeugt halten und kontrolliert schließen.","Seitheben am Kabelzug":"Ellenbogen führen und Schulter unten lassen.","Crunch-Maschine":"Aus dem Bauch einrollen und ohne Schwung zurückführen."});
    Object.entries(EXERCISE_NAME_MAP).forEach(([oldName,newName])=>{if(TIPS[newName])TIPS[oldName]=TIPS[newName];else if(TIPS[oldName]&&!TIPS[newName])TIPS[newName]=TIPS[oldName]});
  }catch(e){console.error("Übungstipps konnten nicht aktualisiert werden",e)}
}

function strengthSession(workoutId,title,meta){return{type:"strength",workoutId,title,meta}}
function runSession(runId,title,meta){return{type:"run",runId,title,meta}}
function sessionsFor(focus,count){
  if(focus==="strength"){
    if(count===2)return[strengthSession("loss-a","Ganzkörper A","Ganzkörper · ca. 50–60 Min."),strengthSession("loss-b","Ganzkörper B","Ganzkörper · ca. 50–60 Min.")];
    if(count===3)return[strengthSession("push","Push","Brust, Schulter, Trizeps"),strengthSession("pull-legs","Pull + Beine","Rücken, Beine, Bizeps"),strengthSession("upper-hypertrophy","Oberkörper","Brust, Rücken, Schulter, Arme")];
    if(count===4)return[strengthSession("personal-upper-a","Oberkörper A","Brust, Rücken, Schulter, Arme"),strengthSession("personal-lower-a","Unterkörper A","Beine, Gesäß, Core"),strengthSession("personal-upper-b","Oberkörper B","Brust, Rücken, Schulter, Arme"),strengthSession("personal-lower-b","Unterkörper B","Beine, Gesäß, Core")];
    return[strengthSession("push","Push","Brust, Schulter, Trizeps"),strengthSession("personal-pull","Pull","Rücken, hintere Schulter, Bizeps"),strengthSession("personal-legs","Beine","Beine, Gesäß, Core"),strengthSession("personal-upper-a","Oberkörper","Brust, Rücken, Schulter, Arme"),strengthSession("personal-lower-b","Unterkörper","Beine, Gesäß, Core")];
  }
  if(focus==="running"){
    if(count===2)return[runSession("interval","Intervalltraining","Schnelle Intervalle + lockere Pausen"),runSession("easy","Lockerer Dauerlauf","Ruhiges Gesprächstempo")];
    if(count===3)return[runSession("interval","Intervalltraining","Schnelle Intervalle + lockere Pausen"),runSession("easy","Lockerer Dauerlauf","Ruhiges Gesprächstempo"),runSession("tempo","Tempolauf","Zügig, aber kontrolliert")];
    if(count===4)return[runSession("interval","Intervalltraining","Schnelle Intervalle + lockere Pausen"),runSession("easy","Lockerer Dauerlauf","Ruhiges Gesprächstempo"),runSession("tempo","Tempolauf","Zügig, aber kontrolliert"),runSession("long","Langer Dauerlauf","45–60 Minuten locker")];
    return[runSession("interval","Intervalltraining","Schnelle Intervalle + lockere Pausen"),runSession("recovery","Regenerationslauf","20–30 Minuten sehr locker"),runSession("tempo","Tempolauf","Zügig, aber kontrolliert"),runSession("easy","Lockerer Dauerlauf","Ruhiges Gesprächstempo"),runSession("long","Langer Dauerlauf","45–60 Minuten locker")];
  }
  if(count===2)return[strengthSession("loss-a","Ganzkörper Kraft","Ganzkörper · ca. 50–60 Min."),runSession("easy","Lockerer Dauerlauf","Ruhiges Gesprächstempo")];
  if(count===3)return[strengthSession("loss-a","Ganzkörper A","Ganzkörper · ca. 50–60 Min."),runSession("interval","Intervalltraining","Schnelle Intervalle + lockere Pausen"),strengthSession("loss-b","Ganzkörper B","Ganzkörper · ca. 50–60 Min.")];
  if(count===4)return[strengthSession("loss-a","Ganzkörper A","Ganzkörper · ca. 50–60 Min."),runSession("interval","Intervalltraining","Schnelle Intervalle + lockere Pausen"),strengthSession("loss-b","Ganzkörper B","Ganzkörper · ca. 50–60 Min."),runSession("easy","Lockerer Dauerlauf","Ruhiges Gesprächstempo")];
  return[strengthSession("push","Push","Brust, Schulter, Trizeps"),runSession("interval","Intervalltraining","Schnelle Intervalle + lockere Pausen"),strengthSession("pull-legs","Pull + Beine","Rücken, Beine, Bizeps"),runSession("easy","Lockerer Dauerlauf","Ruhiges Gesprächstempo"),strengthSession("upper-hypertrophy","Oberkörper","Brust, Rücken, Schulter, Arme")];
}

function personalizedWeek(){
  const p=profileData(),count=Number(p.trainingDaysPerWeek),days=normalizeDays(p.trainingDays),focus=p.trainingFocus;
  if(!FOCUS_LABELS[focus]||!VALID_FREQUENCIES.includes(count)||days.length!==count)return MUSCLE_WEEK;
  const sessions=sessionsFor(focus,count),byDay=new Map(days.map((day,i)=>[day,sessions[i]]));
  return DAY_ORDER.map(day=>{const s=byDay.get(day);return s?{day,dayName:DAY_NAMES[day],...s}:{day,dayName:DAY_NAMES[day],title:"Ruhetag",type:"rest",meta:"Erholung oder lockere Bewegung"}});
}

function styles(){if(document.getElementById("trainingPlanFeatureStyles"))return;const s=document.createElement("style");s.id="trainingPlanFeatureStyles";s.textContent='.training-plan-card{margin-top:16px}.training-plan-card>h2{margin:4px 0 6px}.training-plan-card>p{margin:0;color:var(--muted)}.training-plan-options{display:grid;gap:10px;margin-top:16px}.training-plan-option{width:100%;text-align:left;background:#fff;color:var(--text);border:2px solid var(--line);padding:14px 16px;border-radius:16px;display:grid;grid-template-columns:42px 1fr;gap:10px;align-items:center}.training-plan-option .plan-icon{font-size:26px}.training-plan-option strong,.training-plan-option small{display:block}.training-plan-option small{color:var(--muted);margin-top:4px;line-height:1.3}.training-plan-option.selected{border-color:var(--accent);background:#f9fafb}.training-plan-option.selected .plan-copy:after{content:"✓ Ausgewählt";display:block;margin-top:8px;font-size:12px;font-weight:900;color:var(--accent)}.selected-plan-home{margin:0 0 24px;display:flex;align-items:center;gap:14px}.selected-plan-home .selected-plan-icon{display:grid;place-items:center;width:55px;height:55px;flex:0 0 55px;border-radius:16px;background:#f9fafb;border:1px solid var(--line);font-size:28px}.selected-plan-home h2{margin:3px 0 4px;font-size:23px}.selected-plan-home p{margin:0;color:var(--muted);font-size:14px;line-height:1.35}';document.head.appendChild(s)}

function profile(){
  const root=document.getElementById("profile");if(!root)return false;let c=document.getElementById("trainingPlanSelector");if(!c){c=document.createElement("article");c.id="trainingPlanSelector";c.className="card training-plan-card";c.innerHTML='<small>DEIN TRAININGSPLAN</small><h2>Trainingsplan wählen</h2><p>„Mein Trainingsplan“ nutzt deine Angaben aus dem Profil. Die anderen Pläne bleiben als Alternativen erhalten.</p><div class="training-plan-options"></div>';root.appendChild(c)}
  const box=c.querySelector('.training-plan-options'),sel=read();
  box.innerHTML=PLANS.map(base=>{const p=base.id==="personalized"?personalizedDescriptor():base;return'<button type="button" class="training-plan-option '+(base.id===sel?'selected':'')+'" data-plan-select="'+base.id+'"><span class="plan-icon">'+p.icon+'</span><span class="plan-copy"><strong>'+p.title+'</strong><small>'+p.subtitle+'</small></span></button>'}).join('');
  box.querySelectorAll('[data-plan-select]').forEach(b=>b.onclick=()=>{save(b.dataset.planSelect);profile();renderSelectedHome()});return true;
}

function selectedWeek(){const id=read();return id==="personalized"?personalizedWeek():id==="home"?HOME_WEEK:id==="weightloss"?WEIGHTLOSS_WEEK:MUSCLE_WEEK}
function dayIcon(x){return x.type==="run"?"🏃":x.type==="stretch"?"🧘":x.type==="rest"?"😴":"🏋️"}
function openStretching(){const b=document.querySelector('nav button[data-view="stretching"]');if(b)b.click()}
function renderCustomWeek(week){
  const t=week.find(x=>x.day===new Date().getDay())||week[0],icon=document.getElementById("todayIcon"),label=document.getElementById("todayLabel"),title=document.getElementById("nextTitle"),meta=document.getElementById("nextMeta"),hint=document.getElementById("todayHint"),btn=document.getElementById("startBtn"),plan=document.getElementById("plan");
  if(icon)icon.textContent=dayIcon(t);if(label)label.textContent=`Heute ist ${t.dayName}`;if(title)title.textContent=t.title;if(meta)meta.textContent=t.meta;if(hint)hint.textContent=t.type==="run"?"Dein Lauftraining für heute.":t.type==="stretch"?"Mobilität für Rücken, Beine und Füße.":t.type==="rest"?"Heute ist Regeneration eingeplant.":"Dein Krafttraining für heute.";
  if(btn){if(t.workoutId){btn.hidden=false;btn.textContent="Training starten";btn.onclick=()=>start(t.workoutId)}else if(t.runId){btn.hidden=false;btn.textContent="Laufplan anzeigen";btn.onclick=()=>openRun(t.runId)}else if(t.type==="stretch"){btn.hidden=false;btn.textContent="Dehnen starten";btn.onclick=openStretching}else btn.hidden=true}
  if(plan){plan.innerHTML=week.map(x=>`<article class="plan-item ${x.day===new Date().getDay()?"today":""}"><div class="plan-icon">${dayIcon(x)}</div><div class="plan-copy"><div class="day">${x.dayName}</div><h3>${x.title}</h3><p>${x.meta}</p></div>${x.workoutId?`<button data-selected-workout="${x.workoutId}">Starten</button>`:x.runId?`<button data-selected-run="${x.runId}">Plan</button>`:x.type==="stretch"?'<button data-selected-stretch="1">Dehnen</button>':'<span class="badge">Erholung</span>'}</article>`).join('');plan.querySelectorAll('[data-selected-workout]').forEach(b=>b.onclick=()=>start(b.dataset.selectedWorkout));plan.querySelectorAll('[data-selected-run]').forEach(b=>b.onclick=()=>openRun(b.dataset.selectedRun));plan.querySelectorAll('[data-selected-stretch]').forEach(b=>b.onclick=openStretching)}
}

const baseRenderHome=typeof renderHome==="function"?renderHome:null;
function activePlanCard(){const root=document.getElementById("home");if(!root)return;let c=document.getElementById("selectedTrainingPlanHome");if(!c){c=document.createElement("article");c.id="selectedTrainingPlanHome";c.className="card selected-plan-home";const d=root.querySelector('.home-dashboard');d?d.insertAdjacentElement('afterend',c):root.prepend(c)}const p=current();c.innerHTML='<div class="selected-plan-icon">'+p.icon+'</div><div class="grow"><small>AKTIVER TRAININGSPLAN</small><h2>'+p.title+'</h2><p>'+p.subtitle+'</p></div>'}
function renderSelectedHome(){if(baseRenderHome)baseRenderHome();activePlanCard();renderCustomWeek(selectedWeek())}
if(baseRenderHome)renderHome=function(){renderSelectedHome()};

function tuneStretchRoutine(){try{if(typeof STRETCHES==="undefined")return;const glute=STRETCHES.find(x=>x.id==="glute");if(glute){glute.name="Gesäß & unterer Rücken";glute.instruction="In Rückenlage einen Knöchel auf das andere Knie legen. Das Bein sanft zur Brust ziehen und den unteren Rücken entspannt auf der Matte lassen."}const hamstring=STRETCHES.find(x=>x.id==="hamstring");if(hamstring)hamstring.name="Beinrückseite";const plantar=STRETCHES.find(x=>x.id==="plantar");if(plantar)plantar.name="Fußsohle & Zehen"}catch(e){console.error("Dehnroutine-Anpassung fehlgeschlagen",e)}}

function init(){styles();migrateExerciseNames();translateCurrentWorkouts();ensureCustomWorkouts();ensureRunPlans();ensureExerciseTips();tuneStretchRoutine();renderSelectedHome();profile();let n=0;const timer=setInterval(()=>{n++;if(profile()||n>20)clearInterval(timer)},250);window.addEventListener("reppilot:profile-updated",()=>{profile();renderSelectedHome()});window.RepPilotTrainingPlan={version:VERSION,current,selectedWeek,personalizedWeek,exerciseNameMap:EXERCISE_NAME_MAP,refresh:renderSelectedHome};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();