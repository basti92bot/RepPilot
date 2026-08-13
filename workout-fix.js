(() => {
  const monday = WORKOUTS.find(w => w.id === "push");
  if (monday) {
    monday.title = "Push";
    monday.exercises = monday.exercises.filter(([name]) => name !== "Beinpresse");
  }

  const wednesday = WORKOUTS.find(w => w.id === "pull-legs");
  if (wednesday) {
    wednesday.title = "Pull + Beine";
    const remove = new Set(["Beinpresse", "Rumänisches Kreuzheben", "Beinstrecker", "Beinbeuger", "Wadenheben"]);
    const upper = wednesday.exercises.filter(([name]) => !remove.has(name));
    wednesday.exercises = [
      ["Beinpresse",3,120],
      ["Brustgestütztes Rudern",3,50],
      ["Rumänisches Kreuzheben",3,60],
      ["Latzug neutral",3,55],
      ["Beinstrecker",3,40],
      ["Incline Curls",3,12],
      ["Beinbeuger",3,40],
      ["Reverse Butterfly am Kabel",2,10],
      ["Wadenheben",3,60],
      ["Preacher Curls",2,20],
      ["Hanging Leg Raises",2,0]
    ];
  }

  const friday = WORKOUTS.find(w => w.id === "upper-hypertrophy");
  if (friday) {
    friday.title = "Oberkörper";
    friday.exercises = friday.exercises.filter(([name]) => !["Beinbeuger", "Wadenheben"].includes(name));
  }

  const mondayWeek = WEEK.find(w => w.day === 1);
  if (mondayWeek) {
    mondayWeek.title = "Push";
    mondayWeek.meta = "Brust, Schulter, Trizeps · ca. 45–55 Min.";
  }

  const wednesdayWeek = WEEK.find(w => w.day === 3);
  if (wednesdayWeek) {
    wednesdayWeek.title = "Pull + Beine";
    wednesdayWeek.meta = "Rücken, Beine, Bizeps · ca. 65–75 Min.";
  }

  const fridayWeek = WEEK.find(w => w.day === 5);
  if (fridayWeek) {
    fridayWeek.title = "Oberkörper";
    fridayWeek.meta = "Brust, Rücken, Schulter, Arme · ca. 45–55 Min.";
  }

  if (RUN_PLANS?.interval) {
    RUN_PLANS.interval.steps = [
      ["Einlaufen", "8 Minuten", "7,0–7,5 km/h · Pace 8:34–8:00 min/km"],
      ["Schnelles Intervall", "6 × 2 Minuten", "10,5 km/h · Pace 5:43 min/km"],
      ["Lockere Pause", "nach jedem Intervall 2 Minuten", "7,0–7,5 km/h · Pace 8:34–8:00 min/km"],
      ["Auslaufen", "5 Minuten", "6,0–6,5 km/h · Pace 10:00–9:14 min/km"]
    ];
  }

  if (typeof renderHome === "function") renderHome();
})();
