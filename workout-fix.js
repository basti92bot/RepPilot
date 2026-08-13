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

  if (typeof renderHome === "function") renderHome();
})();
