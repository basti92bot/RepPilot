(() => {
  const monday = WORKOUTS.find(w => w.id === "push");
  if (monday) { monday.title = "Push"; monday.exercises = monday.exercises.filter(([name]) => name !== "Beinpresse"); }
  const wednesday = WORKOUTS.find(w => w.id === "pull-legs");
  if (wednesday) {
    wednesday.title = "Pull + Beine";
    wednesday.exercises = [
      ["Beinpresse",3,120],["Brustgestütztes Rudern",3,50],["Rumänisches Kreuzheben",3,60],
      ["Latzug neutral",3,55],["Beinstrecker",3,40],["Schrägbank-Curls",3,12],["Beinbeuger",3,40],
      ["Reverse Butterfly am Kabelzug",2,10],["Wadenheben",3,60],["Scott-Curls",2,20],["Hängendes Beinheben",2,0]
    ];
  }
  const friday = WORKOUTS.find(w => w.id === "upper-hypertrophy");
  if (friday) { friday.title = "Oberkörper"; friday.exercises = friday.exercises.filter(([name]) => !["Beinbeuger","Wadenheben"].includes(name)); }
  const dayData = {
    1:["Push","Brust, Schulter, Trizeps · ca. 45–55 Min."],
    2:["Intervalltraining Laufband","Intervalltraining · ca. 37 Min. · 1 % Steigung"],
    3:["Pull + Beine","Rücken, Beine, Bizeps · ca. 65–75 Min."],
    4:["Lockerer Dauerlauf","Ruhiges Gesprächstempo · ca. 35–45 Min."],
    5:["Oberkörper","Brust, Rücken, Schulter, Arme · ca. 45–55 Min."],
    6:["Ruhetag","Spaziergang oder Mobilität · ca. 20–30 Min."],
    0:["Ruhetag","Erholung · kein Training geplant"]
  };
  WEEK.forEach(w => { const d=dayData[w.day]; if(d){ w.title=d[0]; w.meta=d[1]; } });
  if (RUN_PLANS?.interval) {
    RUN_PLANS.interval.steps = [
      ["Einlaufen","8 Minuten","7,0–7,5 km/h · Pace 8:34–8:00 min/km"],
      ["Schnelles Intervall","6 × 2 Minuten","10,5 km/h · Pace 5:43 min/km"],
      ["Lockere Pause","nach jedem Intervall 2 Minuten","7,0–7,5 km/h · Pace 8:34–8:00 min/km"],
      ["Auslaufen","5 Minuten","6,0–6,5 km/h · Pace 10:00–9:14 min/km"]
    ];
  }
  if (typeof renderHome === "function") renderHome();
})();
