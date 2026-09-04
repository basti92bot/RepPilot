(() => {
  const VERSION = "11.8.120";
  const BASE = "./assets/exercises/v11.8.120/";
  const SOURCE_SERIES = "RepPilot originals 2026-09-02 + matching additions 2026-09-04";
  const WIDTH = 1254;
  const HEIGHT = 1254;

  // Original pixels are preserved. Only the caption area is clipped by the viewport.
  const art = (id, origin, cropBottom = 0) => Object.freeze({
    id, origin, source: SOURCE_SERIES, files: Object.freeze([id + ".webp"]),
    width: WIDTH, height: HEIGHT, cropBottom
  });

  const MAP = Object.freeze({
    "Bauch Rotation": art("kneeling-torso-rotation-machine", "generated"),
    "Beinbeuger": art("leg-curl", "original", 173),
    "Beinheben": art("supine-leg-raise", "generated"),
    "Beinpresse": art("leg-press", "original", 175),
    "Beinstrecker": art("leg-extension", "original", 189),
    "Bergsteiger": art("mountain-climber", "original"),
    "Brustgestütztes Rudern": art("chest-supported-dumbbell-row", "generated"),
    "Brustpresse": art("chest-press", "original", 197),
    "Crunch-Maschine": art("abdominal-crunch-machine", "original", 204),
    "Diagonales Arm-Bein-Strecken": art("dead-bug", "original"),
    "Diagonales Arm-Bein-Strecken im Vierfüßlerstand": art("bird-dog", "original"),
    "Einarmiger Trizeps am Kabelzug": art("single-arm-cross-body-triceps-extension", "generated"),
    "Einbeiniges Hüftheben": art("single-leg-glute-bridge", "generated"),
    "Enge Liegestütze": art("close-grip-pushup", "generated"),
    "Hammercurls": art("hammer-curl", "generated"),
    "Hängendes Beinheben": art("hanging-leg-raise", "original", 196),
    "Hüftheben": art("glute-bridge", "original"),
    "Hüftheben mit Beinwechsel": art("glute-bridge-march", "generated"),
    "Kabel-Flys": art("cable-chest-fly", "generated"),
    "Kniebeugen": art("bodyweight-squat", "original"),
    "Latzug breit": art("wide-lat-pulldown", "original", 171),
    "Latzug neutral": art("neutral-grip-lat-pulldown", "generated"),
    "Liegestütze bis Maximum": art("pushup", "original"),
    "Reverse Butterfly am Kabelzug": art("cable-reverse-fly", "generated"),
    "Rückenstrecker in Bauchlage": art("prone-back-extension", "generated"),
    "Rückwärts-Ausfallschritte": art("reverse-lunge", "generated"),
    "Schneeengel in Bauchlage": art("prone-snow-angel", "generated"),
    "Schrägbank-Curls": art("incline-dumbbell-curl", "generated"),
    "Schrägbankdrücken": art("incline-dumbbell-press", "original", 199),
    "Schrägbankdrücken leicht": art("incline-dumbbell-press", "original", 199),
    "Schulter-Liegestütze": art("pike-pushup", "generated"),
    "Schulterpresse": art("shoulder-press-machine", "original", 161),
    "Scott-Curls": art("preacher-curl", "generated"),
    "Seitheben": art("dumbbell-lateral-raise", "original", 198),
    "Seitheben am Kabelzug": art("single-arm-cable-lateral-raise", "generated"),
    "Seitheben Maschine": art("lateral-raise-machine", "generated"),
    "Seitstütz": art("side-plank", "generated"),
    "Stationäre Ausfallschritte": art("split-squat", "original"),
    "Tempo-Kniebeugen": art("bodyweight-squat", "original"),
    "Trizepsdrücken am Seilzug": art("rope-triceps-pushdown", "generated"),
    "Überkopf-Trizepsstrecken am Kabelzug": art("overhead-cable-triceps-extension", "generated"),
    "Unterarmstütz": art("forearm-plank", "original"),
    "Wadenheben": art("machine-calf-raise", "original", 171),
    "Y-T-Heben in Bauchlage": art("prone-y-t-raise", "generated")
  });
  const HOME_CALF = art("bodyweight-calf-raise", "generated");
  let renderToken = 0;

  function workoutId() {
    try { return typeof active !== "undefined" ? active?.id || "" : ""; }
    catch { return ""; }
  }

  function resolve(name, context = workoutId()) {
    if (name === "Wadenheben" && String(context).startsWith("home-")) return HOME_CALF;
    return MAP[name] || null;
  }

  function ensureStyles() {
    if (document.getElementById("repPilotExerciseImageStyles")) return;
    const style = document.createElement("style");
    style.id = "repPilotExerciseImageStyles";
    style.textContent = `
      #repPilotExerciseImageCard{width:100%;max-width:400px;margin:12px auto 14px;border:1px solid var(--line,#e5e7eb);border-radius:18px;overflow:hidden;background:#fff;box-sizing:border-box;box-shadow:0 4px 14px rgba(17,24,39,.05)}
      #repPilotExerciseImageViewport{position:relative;overflow:hidden;background:#fff;aspect-ratio:1}
      .repPilotExercisePose{position:absolute;top:0;left:0;display:block;width:100%;max-width:none;height:auto;object-fit:contain;background:#fff;image-rendering:auto}
    `;
    document.head.appendChild(style);
  }

  function ensureCard() {
    const panel = document.getElementById("setPanel");
    const title = panel?.querySelector(".exercise-title");
    if (!panel || !title) return null;
    ensureStyles();
    let card = document.getElementById("repPilotExerciseImageCard");
    if (card) return card;
    card = document.createElement("div");
    card.id = "repPilotExerciseImageCard";
    card.hidden = true;
    const viewport = document.createElement("div");
    viewport.id = "repPilotExerciseImageViewport";
    card.appendChild(viewport);
    title.insertAdjacentElement("afterend", card);
    return card;
  }

  function refresh() {
    const card = ensureCard();
    if (!card) return;
    const name = String(document.getElementById("exerciseName")?.textContent || "").trim();
    const context = workoutId();
    const entry = resolve(name, context);
    const viewport = document.getElementById("repPilotExerciseImageViewport");
    const key = [name, context, entry?.id || ""].join("|");
    if (card.dataset.renderKey === key && viewport.querySelector("img")) return;
    const token = ++renderToken;
    viewport.replaceChildren();
    card.hidden = true;
    card.dataset.renderKey = key;
    if (!entry) return;

    card.dataset.exercise = name;
    card.dataset.workoutId = context;
    card.dataset.assetId = entry.id;
    card.dataset.assetSource = entry.origin;
    viewport.style.aspectRatio = entry.width + " / " + (entry.height - entry.cropBottom);
    viewport.dataset.cropBottom = String(entry.cropBottom);

    const img = document.createElement("img");
    img.className = "repPilotExercisePose";
    img.alt = name + " – Ausführung";
    img.width = entry.width;
    img.height = entry.height;
    img.decoding = "async";
    img.loading = "eager";
    img.fetchPriority = "high";
    img.onload = () => {
      if (token !== renderToken) return;
      img.dataset.loaded = "true";
      card.hidden = false;
    };
    img.onerror = () => {
      if (token !== renderToken) return;
      img.remove();
      card.hidden = true;
    };
    viewport.appendChild(img);
    img.src = BASE + entry.files[0];
  }

  function exerciseNames() {
    const definitions = window.RepPilotPlanQuality?.definitions || {};
    return [...new Set(Object.values(definitions).flat().map(row => row?.[0]).filter(Boolean))];
  }

  function assetFiles() {
    return [...new Set([...Object.values(MAP), HOME_CALF].flatMap(entry => entry.files.map(file => BASE + file)))];
  }

  function audit() {
    const definitions = window.RepPilotPlanQuality?.definitions || {};
    const names = exerciseNames();
    const missing = names.filter(name => !resolve(name));
    const missingContexts = Object.entries(definitions).flatMap(([id, rows]) =>
      rows.filter(row => !resolve(row[0], id)).map(row => ({ workoutId: id, name: row[0] }))
    );
    return {
      version: VERSION, total: names.length, mapped: names.length - missing.length,
      missing, missingContexts, localFiles: assetFiles().length, contextVariants: 1,
      nativeWidth: WIDTH, nativeHeight: HEIGHT,
      remoteUrls: assetFiles().filter(file => /^https?:/i.test(file))
    };
  }

  function init() {
    ensureCard();
    const name = document.getElementById("exerciseName");
    if (name) new MutationObserver(refresh).observe(name, { childList: true, subtree: true, characterData: true });
    refresh();
    setTimeout(() => {
      const result = audit();
      if (result.missing.length || result.missingContexts.length) console.warn("RepPilot Übungsbilder fehlen", result);
    }, 0);
  }

  window.RepPilotExerciseImages = {
    version: VERSION, source: "local", sourceSeries: SOURCE_SERIES,
    base: BASE, map: MAP, resolve, assetFiles, audit, refresh
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
