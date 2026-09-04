(() => {
  const VERSION = "11.8.122";
  const BASE = "./assets/exercises/v11.8.122/";
  const MAP = Object.freeze({
  "Fußgewölbe aktivieren": "short-foot",
  "Knie-zur-Wand Mobilität": "knee-to-wall",
  "Tibialis Raises an der Wand": "wall-tibialis-raise",
  "Einbeiniges Wadenheben": "single-leg-calf-raise",
  "Einbeinstand mit Kniehub": "single-leg-knee-drive",
  "Rückwärts-Ausfallschritt mit Kniehub": "reverse-lunge-knee-drive",
  "Einbeiniges Kreuzheben": "single-leg-deadlift",
  "Suitcase March": "suitcase-march",
  "Wall Sit": "wall-sit",
  "Goblet Squats": "goblet-squat",
  "Langsame Step-Downs": "slow-step-down",
  "Seitliche Ausfallschritte": "lateral-lunge",
  "Skater Jumps": "skater-jump",
  "Bulgarian Split Squats": "bulgarian-split-squat",
  "Seitstütz mit Füßen erhöht": "feet-elevated-side-plank",
  "Wall Sit Finish": "wall-sit"
});
  const escape = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

  function resolve(name, context = "") {
    const id = MAP[name];
    if (id) return {id, src:BASE + id + ".webp", width:1254, height:1254, cropBottom:0};
    const entry = window.RepPilotExerciseImages?.resolve(name, context);
    if (!entry) return null;
    return {...entry, src:window.RepPilotExerciseImages.base + entry.files[0]};
  }

  function ensureStyles() {
    if (document.getElementById("repPilotTrainingImageStyles")) return;
    const style = document.createElement("style");
    style.id = "repPilotTrainingImageStyles";
    style.textContent = `
      .repPilotTrainingImage{width:100%;max-width:400px;margin:12px auto 14px;border:1px solid var(--line,#e5e7eb);border-radius:18px;overflow:hidden;background:#fff;box-sizing:border-box;box-shadow:0 4px 14px rgba(17,24,39,.05)}
      .repPilotTrainingImageViewport{position:relative;overflow:hidden;background:#fff;aspect-ratio:1}
      .repPilotTrainingImage img{position:absolute;inset:0 auto auto 0;display:block;width:100%;max-width:none;height:auto;object-fit:contain;background:#fff;image-rendering:auto}
    `;
    document.head.appendChild(style);
  }

  function markup(name, {context = "", eager = false} = {}) {
    const entry = resolve(name, context);
    if (!entry) return "";
    ensureStyles();
    return `<div class="repPilotTrainingImage" data-exercise="${escape(name)}" data-asset-id="${escape(entry.id)}"><div class="repPilotTrainingImageViewport" style="aspect-ratio:${entry.width}/${entry.height-entry.cropBottom}"><img src="${escape(entry.src)}" alt="${escape(name)}: Ausführung" width="${entry.width}" height="${entry.height}" loading="${eager ? "eager" : "lazy"}" decoding="async"></div></div>`;
  }

  function assetFiles() {
    return [...new Set(Object.values(MAP))].map(id => BASE + id + ".webp");
  }

  function audit() {
    const definitions = window.RepPilotPlanQuality?.definitions || {};
    const hub = window.RepPilotTrainingHub;
    const groups = {...definitions,
      "runner":(hub?.runnerExercises || []).map(x => [x.name]),
      "ski":(hub?.skiExercises || []).map(x => [x.name])};
    const missing = [];
    const workouts = {};
    const names = new Set();
    for (const [id, rows] of Object.entries(groups)) {
      const unmapped = rows.filter(row => !resolve(row[0], id)).map(row => row[0]);
      rows.forEach(row => names.add(row[0]));
      unmapped.forEach(name => missing.push({workoutId:id, name}));
      workouts[id] = {total:rows.length, mapped:rows.length-unmapped.length};
    }
    const files = [...new Set([...(window.RepPilotExerciseImages?.assetFiles() || []), ...assetFiles()])];
    return {version:VERSION,total:names.size,mapped:names.size-new Set(missing.map(x=>x.name)).size,
      missing,workouts,localFiles:files.length,
      ready:!!hub && Object.keys(definitions).length>0,
      remoteUrls:files.filter(file=>/^https?:/i.test(file))};
  }

  window.RepPilotTrainingImages = {version:VERSION, map:MAP, resolve, markup, assetFiles, audit};
})();
