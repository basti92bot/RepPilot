(() => {
  const VERSION = "11.8.61";

  const replaceWorkout = (id,title,exercises) => {
    const workout = WORKOUTS.find(w => w.id === id);
    if(!workout) return;
    workout.title = title;
    workout.exercises = exercises.map(row => [...row]);
  };

  replaceWorkout("push","Push",[
    ["Schrägbankdrücken",3,60],
    ["Brustpresse",3,50],
    ["Schulterpresse",3,35],
    ["Kabel-Flys",2,20],
    ["Seitheben am Kabelzug",3,7.5],
    ["Überkopf-Trizepsstrecken am Kabelzug",2,20],
    ["Trizepsdrücken am Seilzug",2,25],
    ["Crunch-Maschine",3,30]
  ]);

  replaceWorkout("pull-legs","Pull + Beine",[
    ["Beinpresse",3,120],
    ["Brustgestütztes Rudern",3,50],
    ["Rumänisches Kreuzheben",3,60],
    ["Latzug neutral",3,55],
    ["Beinbeuger",2,40],
    ["Reverse Butterfly am Kabelzug",2,10],
    ["Schrägbank-Curls",2,12],
    ["Wadenheben",3,60],
    ["Hängendes Beinheben",2,0]
  ]);

  replaceWorkout("upper-hypertrophy","Oberkörper",[
    ["Schrägbankdrücken leicht",3,50],
    ["Brustgestütztes Rudern",3,45],
    ["Latzug breit",3,50],
    ["Liegestütze bis Maximum",2,0],
    ["Seitheben",3,8],
    ["Reverse Butterfly am Kabelzug",2,10],
    ["Hammercurls",2,12],
    ["Einarmiger Trizeps am Kabelzug",2,10],
    ["Crunch-Maschine",2,30]
  ]);

  const dayData = {
    1:["Push","Brust, Schulter, Trizeps · ca. 45–55 Min."],
    2:["Intervalltraining","Schnelle Intervalle + lockere Pausen · ca. 37 Min."],
    3:["Pull + Beine","Rücken, Beine, Bizeps · ca. 60–70 Min."],
    4:["Lockerer Dauerlauf","Ruhiges Gesprächstempo · ca. 35–45 Min."],
    5:["Oberkörper","Brust, Rücken, Schulter, Arme · ca. 45–55 Min."],
    6:["Ruhetag","Erholung oder lockere Bewegung"],
    0:["Ruhetag","Erholung · kein Training geplant"]
  };

  WEEK.forEach(w => {
    const data = dayData[w.day];
    if(!data) return;
    w.title = data[0];
    w.meta = data[1];
    if(w.day===1){w.type="strength";w.workoutId="push";delete w.runId;}
    if(w.day===2){w.type="run";w.runId="interval";delete w.workoutId;}
    if(w.day===3){w.type="strength";w.workoutId="pull-legs";delete w.runId;}
    if(w.day===4){w.type="run";w.runId="easy";delete w.workoutId;}
    if(w.day===5){w.type="strength";w.workoutId="upper-hypertrophy";delete w.runId;}
    if(w.day===6||w.day===0){w.type="rest";delete w.workoutId;delete w.runId;}
  });

  if (RUN_PLANS?.interval) {
    RUN_PLANS.interval.title = "Intervalltraining";
    RUN_PLANS.interval.meta = "37 Minuten · 1 % Steigung";
    RUN_PLANS.interval.steps = [
      ["Einlaufen","8 Minuten","7,0–7,5 km/h · Pace 8:34–8:00 min/km"],
      ["Schnelles Intervall","6 × 2 Minuten","10,5 km/h · Pace 5:43 min/km"],
      ["Lockere Pause","nach jedem Intervall 2 Minuten","7,0–7,5 km/h · Pace 8:34–8:00 min/km"],
      ["Auslaufen","5 Minuten","6,0–6,5 km/h · Pace 10:00–9:14 min/km"]
    ];
  }

  if (typeof renderHome === "function") renderHome();
  window.RepPilotWorkoutFix = {version:VERSION};
})();