(() => {
  const VERSION = "11.8.119";
  const BASE = "./assets/exercises/v11.8.119/";
  const SOURCE_COMMIT = "75f6ae7";

  const approved = id => ({
    id,
    source: "RepPilot approved series",
    files: [`${id}.webp`],
    wide: true
  });

  const MAP = Object.freeze({
    "Bauch Rotation": approved("ab-machine"),
    "Beinbeuger": approved("lying-leg-curl"),
    "Beinheben": approved("leg-raise"),
    "Beinpresse": approved("leg-press"),
    "Beinstrecker": approved("leg-extension"),
    "Bergsteiger": approved("mountain-climber"),
    "Brustgestütztes Rudern": approved("seated-row"),
    "Brustpresse": approved("chest-press"),
    "Crunch-Maschine": approved("ab-machine"),
    "Diagonales Arm-Bein-Strecken": approved("bird-dog"),
    "Diagonales Arm-Bein-Strecken im Vierfüßlerstand": approved("bird-dog"),
    "Einarmiger Trizeps am Kabelzug": approved("cable-triceps-pushdown"),
    "Einbeiniges Hüftheben": approved("bridge"),
    "Enge Liegestütze": approved("push-up"),
    "Hammercurls": approved("cable-biceps-curl"),
    "Hängendes Beinheben": approved("hanging-leg-raise"),
    "Hüftheben": approved("bridge"),
    "Hüftheben mit Beinwechsel": approved("bridge"),
    "Kabel-Flys": approved("butterfly"),
    "Kniebeugen": approved("squat"),
    "Latzug breit": approved("lat-pulldown"),
    "Latzug neutral": approved("lat-pulldown"),
    "Liegestütze bis Maximum": approved("push-up"),
    "Reverse Butterfly am Kabelzug": approved("reverse-butterfly"),
    "Rückenstrecker in Bauchlage": approved("back-extension"),
    "Rückwärts-Ausfallschritte": approved("lunge"),
    "Schneeengel in Bauchlage": approved("reverse-butterfly"),
    "Schrägbank-Curls": approved("cable-biceps-curl"),
    "Schrägbankdrücken": approved("incline-bench-press"),
    "Schrägbankdrücken leicht": approved("incline-bench-press"),
    "Schulter-Liegestütze": approved("push-up"),
    "Schulterpresse": approved("shoulder-press"),
    "Scott-Curls": approved("cable-biceps-curl"),
    "Seitheben": approved("lateral-raise"),
    "Seitheben am Kabelzug": approved("lateral-raise"),
    "Seitheben Maschine": approved("lateral-raise"),
    "Seitstütz": approved("plank"),
    "Stationäre Ausfallschritte": approved("lunge"),
    "Tempo-Kniebeugen": approved("squat"),
    "Trizepsdrücken am Seilzug": approved("cable-triceps-pushdown"),
    "Überkopf-Trizepsstrecken am Kabelzug": approved("cable-triceps-pushdown"),
    "Unterarmstütz": approved("plank"),
    "Wadenheben": approved("calf-raise"),
    "Y-T-Heben in Bauchlage": approved("reverse-butterfly")
  });

  let renderToken = 0;

  function ensureStyles() {
    if (document.getElementById("repPilotExerciseImageStyles")) return;
    const style = document.createElement("style");
    style.id = "repPilotExerciseImageStyles";
    style.textContent = `
      #repPilotExerciseImageCard{max-width:360px;margin:12px auto 14px;border:1px solid var(--line,#e5e7eb);border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 4px 14px rgba(17,24,39,.05)}
      #repPilotExerciseImageViewport{display:grid;grid-template-columns:1fr;background:#fff}
      .repPilotExercisePose{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:contain;background:#fff;image-rendering:auto}
      @media(max-width:390px){#repPilotExerciseImageCard{max-width:330px}}
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
    card.innerHTML = '<div id="repPilotExerciseImageViewport"></div>';
    title.insertAdjacentElement("afterend", card);
    return card;
  }

  function imageUrl(file) {
    return BASE + file;
  }

  function renderImage(viewport, card, name, entry, file, index, token) {
    const img = document.createElement("img");
    const isWide = entry.wide && entry.files.length === 1;
    img.className = "repPilotExercisePose" + (isWide ? " wide" : "");
    img.src = imageUrl(file);
    img.alt = entry.files.length === 1
      ? `${name} Ausführung`
      : `${name} ${index === 0 ? "Startposition" : "Endposition"}`;
    img.decoding = "async";
    img.loading = "eager";
    img.fetchPriority = "high";
    img.width = 1024;
    img.height = isWide ? 768 : 1024;
    img.onload = () => {
      if (token !== renderToken) return;
      img.dataset.loaded = "true";
      card.hidden = false;
    };
    img.onerror = () => {
      if (token !== renderToken) return;
      img.remove();
      if (!viewport.querySelector("img")) card.hidden = true;
    };
    viewport.appendChild(img);
  }

  function refresh() {
    const card = ensureCard();
    if (!card) return;
    const token = ++renderToken;
    const name = String(document.getElementById("exerciseName")?.textContent || "").trim();
    const entry = MAP[name];
    const viewport = document.getElementById("repPilotExerciseImageViewport");
    viewport.replaceChildren();
    card.hidden = true;

    if (!entry) return;

    card.dataset.exercise = name;
    card.dataset.assetId = entry.id;
    card.dataset.assetSource = entry.source;
    entry.files.forEach((file, index) => renderImage(viewport, card, name, entry, file, index, token));
  }

  function exerciseNames() {
    const definitions = window.RepPilotPlanQuality?.definitions || {};
    return [...new Set(Object.values(definitions).flat().map(row => row?.[0]).filter(Boolean))];
  }

  function assetFiles() {
    return [...new Set(Object.values(MAP).flatMap(entry => entry.files.map(file => BASE + file)))];
  }

  function audit() {
    const names = exerciseNames();
    const missing = names.filter(name => !MAP[name]);
    return {
      version: VERSION,
      total: names.length,
      mapped: names.length - missing.length,
      missing,
      localFiles: assetFiles().length,
      remoteUrls: assetFiles().filter(file => /^https?:/i.test(file))
    };
  }

  function init() {
    const name = document.getElementById("exerciseName");
    ensureCard();
    if (name) new MutationObserver(refresh).observe(name, { childList: true, subtree: true, characterData: true });
    refresh();
    setTimeout(() => {
      const result = audit();
      if (result.missing.length) console.warn("RepPilot Übungsbilder fehlen", result.missing);
    }, 0);
  }

  window.RepPilotExerciseImages = {
    version: VERSION,
    source: "local",
    sourceCommit: SOURCE_COMMIT,
    base: BASE,
    map: MAP,
    assetFiles,
    audit,
    refresh
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
