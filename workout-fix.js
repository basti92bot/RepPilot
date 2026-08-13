(() => {
  const monday = WORKOUTS.find(w => w.id === "push");
  if (monday) {
    monday.title = "Push";
    monday.exercises = monday.exercises.filter(([name]) => name !== "Beinpresse");
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
