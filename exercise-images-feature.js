(() => {
  const VERSION = "11.8.118";
  const BASE = "./assets/exercises/v11.8.118/";
  const SOURCE_COMMIT = "8f25d055e243b882aa05acaa66c2c51b1a9fc2d1";

  const repdb = (id, mode = "pair") => ({
    id,
    source: "RepDB",
    files: mode === "main" ? [`${id}-main.webp`] : [`${id}-start.webp`, `${id}-peak.webp`]
  });
  const custom = id => ({ id, source: "RepPilot", files: [`${id}.svg`], wide: true });

  const MAP = Object.freeze({
    "Bauch Rotation": repdb("russian-twist"),
    "Beinbeuger": repdb("leg-curl"),
    "Beinheben": repdb("lying-leg-raise"),
    "Beinpresse": repdb("leg-press"),
    "Beinstrecker": repdb("leg-extension"),
    "Bergsteiger": repdb("mountain-climbers"),
    "Brustgestütztes Rudern": repdb("chest-supported-db-row"),
    "Brustpresse": repdb("chest-press-machine"),
    "Crunch-Maschine": repdb("machine-seated-crunch"),
    "Diagonales Arm-Bein-Strecken": repdb("dead-bug"),
    "Diagonales Arm-Bein-Strecken im Vierfüßlerstand": repdb("bird-dog"),
    "Einarmiger Trizeps am Kabelzug": repdb("single-arm-tricep-pushdown"),
    "Einbeiniges Hüftheben": repdb("single-leg-glute-bridge"),
    "Enge Liegestütze": repdb("close-grip-push-ups"),
    "Hammercurls": repdb("hammer-curl"),
    "Hängendes Beinheben": repdb("hanging-leg-raise"),
    "Hüftheben": repdb("glute-bridge"),
    "Hüftheben mit Beinwechsel": repdb("single-leg-glute-bridge"),
    "Kabel-Flys": repdb("cable-fly"),
    "Kniebeugen": repdb("bodyweight-squat"),
    "Latzug breit": repdb("lat-pulldown"),
    "Latzug neutral": repdb("v-bar-lat-pulldown"),
    "Liegestütze bis Maximum": repdb("push-up"),
    "Reverse Butterfly am Kabelzug": custom("cable-reverse-fly"),
    "Rückenstrecker in Bauchlage": repdb("superman"),
    "Rückwärts-Ausfallschritte": repdb("reverse-lunge"),
    "Schneeengel in Bauchlage": custom("prone-snow-angel"),
    "Schrägbank-Curls": repdb("incline-db-curl"),
    "Schrägbankdrücken": repdb("incline-bench-press"),
    "Schrägbankdrücken leicht": repdb("incline-bench-press"),
    "Schulter-Liegestütze": repdb("pike-push-ups"),
    "Schulterpresse": repdb("machine-shoulder-press"),
    "Scott-Curls": repdb("preacher-curl"),
    "Seitheben": repdb("lateral-raise"),
    "Seitheben am Kabelzug": repdb("cable-lateral-raise"),
    "Seitheben Maschine": repdb("plate-loaded-lateral-raise"),
    "Seitstütz": repdb("side-plank", "main"),
    "Stationäre Ausfallschritte": repdb("split-squat"),
    "Tempo-Kniebeugen": repdb("bodyweight-squat"),
    "Trizepsdrücken am Seilzug": repdb("tricep-pushdown"),
    "Überkopf-Trizepsstrecken am Kabelzug": custom("cable-overhead-triceps"),
    "Unterarmstütz": repdb("plank", "main"),
    "Wadenheben": repdb("machine-calf-raise"),
    "Y-T-Heben in Bauchlage": custom("prone-y-t-raise")
  });

  let renderToken = 0;

  function ensureStyles() {
    if (document.getElementById("repPilotExerciseImageStyles")) return;
    const style = document.createElement("style");
    style.id = "repPilotExerciseImageStyles";
    style.textContent = `
      #repPilotExerciseImageCard{max-width:360px;margin:12px auto 14px;border:1px solid var(--line,#e5e7eb);border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 4px 14px rgba(17,24,39,.05)}
      #repPilotExerciseImageViewport{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line,#e5e7eb)}
      #repPilotExerciseImageViewport.single{grid-template-columns:1fr}
      .repPilotExercisePose{display:block;width:100%;height:auto;aspect-ratio:1/1;object-fit:contain;background:#eaf7fb;image-rendering:auto}
      .repPilotExercisePose.wide{aspect-ratio:2/1}
      #repPilotExerciseImageLabel{display:block;padding:8px 10px 10px;text-align:center;color:var(--muted,#6b7280);font-size:11px;font-weight:800}
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
    card.innerHTML = '<div id="repPilotExerciseImageViewport"></div><small id="repPilotExerciseImageLabel"></small>';
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
    img.height = isWide ? 512 : 1024;
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
    const label = document.getElementById("repPilotExerciseImageLabel");
    viewport.replaceChildren();
    viewport.classList.toggle("single", !entry || entry.files.length === 1);
    card.hidden = true;

    if (!entry) return;

    card.dataset.exercise = name;
    card.dataset.assetId = entry.id;
    card.dataset.assetSource = entry.source;
    label.textContent = name;
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
