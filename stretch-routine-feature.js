(() => {
  const SIDE = 30;
  const MOVE = 5;
  const baseArt = typeof stretchArt === "function" ? stretchArt : (() => "");
  let phase = "left";

  const backSvg = (label, mode) => `<svg viewBox="0 0 220 180" role="img" aria-hidden="true">
    <rect width="220" height="180" rx="18" fill="#f8fafc"/>
    <circle cx="92" cy="48" r="13" fill="#d9a07b"/>
    <path d="M80 60 Q92 56 104 61 L115 92 Q103 102 84 98 L72 69 Z" fill="#1f2937"/>
    <path d="M76 70 L38 83" stroke="#d9a07b" stroke-width="10" stroke-linecap="round"/>
    <path d="M38 83 L64 106" stroke="#d9a07b" stroke-width="10" stroke-linecap="round"/>
    <path d="M103 73 L129 90" stroke="#d9a07b" stroke-width="10" stroke-linecap="round"/>
    <path d="M88 96 L57 145" stroke="#94a3b8" stroke-width="14" stroke-linecap="round"/>
    <path d="M108 94 L142 143" stroke="#94a3b8" stroke-width="14" stroke-linecap="round"/>
    ${mode === "upper" ? '<path d="M52 103 L103 89" stroke="#f59e0b" stroke-width="12" stroke-linecap="round" opacity=".8"/>' : '<path d="M94 101 C112 111 131 118 149 118" fill="none" stroke="#f59e0b" stroke-width="12" stroke-linecap="round" opacity=".8"/>'}
    <text x="18" y="24" font-size="15" font-weight="800" fill="#475569">${label}</text>
  </svg>`;

  stretchArt = type => {
    if (type === "upper-back") return backSvg("Oberer Rücken", "upper");
    if (type === "lower-back") return backSvg("Unterer Rücken", "lower");
    return baseArt(type);
  };

  const setData = () => {
    if (typeof STRETCHES === "undefined") return;

    const glute = STRETCHES.find(x => x.id === "glute");
    if (glute) Object.assign(glute, {
      name: "Gesäß",
      sideA: "Linke Seite",
      sideB: "Rechte Seite",
      instruction: "In Rückenlage einen Knöchel auf das andere Knie legen. Das Bein sanft zur Brust ziehen und das Gesäß entspannen.",
      art: "glute"
    });

    const chest = STRETCHES.find(x => x.id === "chest");
    if (chest) Object.assign(chest, {
      name: "Brust und Schulter",
      sideA: "Linke Seite",
      sideB: "Rechte Seite",
      instruction: "Arm an einer Wand ablegen und den Oberkörper langsam von der Wand wegdrehen.",
      art: "chest"
    });

    const ham = STRETCHES.find(x => x.id === "hamstring");
    if (ham) ham.name = "Beinrückseite";
    const plant = STRETCHES.find(x => x.id === "plantar");
    if (plant) plant.name = "Fußsohle & Zehen";

    if (!STRETCHES.some(x => x.id === "upper-back")) {
      STRETCHES.push({
        id: "upper-back",
        name: "Oberer Rücken",
        seconds: SIDE,
        bilateral: true,
        sideA: "Linke Seite",
        sideB: "Rechte Seite",
        instruction: "Im Vierfüßlerstand einen Arm unter dem Körper durchführen, Schulter und Kopf ablegen und den oberen Rücken öffnen.",
        art: "upper-back"
      });
    }

    if (!STRETCHES.some(x => x.id === "lower-back")) {
      STRETCHES.push({
        id: "lower-back",
        name: "Unterer Rücken",
        seconds: SIDE,
        bilateral: true,
        sideA: "Linke Seite",
        sideB: "Rechte Seite",
        instruction: "In Rückenlage beide Knie anziehen und kontrolliert zur Seite sinken lassen. Schultern bleiben am Boden.",
        art: "lower-back"
      });
    }

    STRETCHES.forEach(x => {
      x.seconds = SIDE;
      x.bilateral = true;
    });
  };

  const setClock = () => {
    const total = phase === "left" || phase === "right" ? SIDE : MOVE;
    const m = String(Math.floor(stretchRemaining / 60)).padStart(2, "0");
    const s = String(stretchRemaining % 60).padStart(2, "0");
    $("stretchTime").textContent = `${m}:${s}`;
    $("stretchClock").style.setProperty("--progress", `${(1 - stretchRemaining / total) * 360}deg`);
  };

  const setControls = move => {
    $("pauseStretchBtn").hidden = false;
    $("skipStretchBtn").hidden = !!move;
    $("startStretchNowBtn").hidden = !move;
  };

  const render = () => {
    const item = STRETCHES[stretchIndex];
    const next = STRETCHES[stretchIndex + 1];
    $("stretchProgressLabel").textContent = `Übung ${stretchIndex + 1} von ${STRETCHES.length}`;
    $("stretchProgressBar").style.width = `${((stretchIndex + (phase === "next" ? 1 : 0)) / STRETCHES.length) * 100}%`;
    $("stretchArt").innerHTML = stretchArt(item.art);
    $("stretchClockLabel").textContent = "Sekunden";
    $("stretchNextBox").hidden = true;

    if (phase === "left") {
      $("stretchPhaseTitle").textContent = "Dehnen";
      $("stretchPhaseLabel").textContent = "LINKE SEITE";
      $("stretchName").textContent = item.name;
      $("stretchInstruction").textContent = item.instruction;
      $("stretchSide").textContent = item.sideA;
      setControls(false);
    } else if (phase === "switch") {
      $("stretchPhaseTitle").textContent = "Umpositionieren";
      $("stretchPhaseLabel").textContent = "SEITENWECHSEL";
      $("stretchName").textContent = item.name;
      $("stretchInstruction").textContent = `Wechsle jetzt auf ${item.sideB}.`;
      $("stretchSide").textContent = "";
      $("stretchNextBox").hidden = false;
      $("stretchNextName").textContent = item.sideB;
      setControls(true);
    } else if (phase === "right") {
      $("stretchPhaseTitle").textContent = "Dehnen";
      $("stretchPhaseLabel").textContent = "RECHTE SEITE";
      $("stretchName").textContent = item.name;
      $("stretchInstruction").textContent = item.instruction;
      $("stretchSide").textContent = item.sideB;
      setControls(false);
    } else {
      $("stretchPhaseTitle").textContent = "Umpositionieren";
      $("stretchPhaseLabel").textContent = "NÄCHSTE ÜBUNG";
      $("stretchName").textContent = "Umpositionieren";
      $("stretchInstruction").textContent = next ? `Bereite dich auf „${next.name}“ vor.` : "Fast geschafft.";
      $("stretchSide").textContent = "";
      if (next) {
        $("stretchNextBox").hidden = false;
        $("stretchNextName").textContent = next.name;
      }
      setControls(true);
    }
    setClock();
  };

  const startPhase = p => {
    stopStretchTimer();
    stretchPaused = false;
    phase = p;
    stretchMode = p === "left" || p === "right" ? "work" : "transition";
    stretchRemaining = stretchMode === "work" ? SIDE : MOVE;
    $("pauseStretchBtn").textContent = "Pause";
    render();
    run();
  };

  const nextPhase = () => {
    if (phase === "left") startPhase("switch");
    else if (phase === "switch") startPhase("right");
    else if (phase === "right") {
      if (stretchIndex >= STRETCHES.length - 1) completeStretchRoutine();
      else startPhase("next");
    } else {
      stretchIndex++;
      startPhase("left");
    }
  };

  const run = () => {
    stopStretchTimer();
    stretchTimer = setInterval(() => {
      if (stretchPaused) return;
      stretchRemaining--;
      setClock();
      if (stretchRemaining <= 0) {
        signalStretch();
        stopStretchTimer();
        nextPhase();
      }
    }, 1000);
  };

  const renderPreview = () => {
    const facts = document.querySelector(".routine-facts");
    if (facts) facts.innerHTML = "<span>⏱ 30 Sek. je Seite</span><span>🔄 5 Sek. Wechselzeit</span>";
    const title = document.querySelector(".stretch-intro h3");
    if (title) title.textContent = `${STRETCHES.length} Dehnübungen`;
    $("stretchPreview").innerHTML = STRETCHES.map((x, i) => `
      <article class="card stretch-preview-card">
        <div class="stretch-preview-number">${i + 1}</div>
        <div class="stretch-preview-art">${stretchArt(x.art)}</div>
        <div><h3>${x.name}</h3><p>${x.instruction}</p><small>30 Sek. pro Seite, 5 Sek. Wechselzeit</small></div>
      </article>`).join("");
  };

  startStretchRoutine = () => {
    stopStretchTimer();
    stretchIndex = 0;
    stretchPaused = false;
    showStretchScreen("routine");
    startPhase("left");
  };
  renderStretchPreview = renderPreview;
  renderStretchSession = render;
  runStretchTimer = run;
  skipStretchPhase = () => { stopStretchTimer(); nextPhase(); };
  startNextStretchNow = () => { stopStretchTimer(); nextPhase(); };
  completeStretchRoutine = () => {
    stopStretchTimer();
    stretchMode = "complete";
    phase = "done";
    const text = document.querySelector("#stretchComplete .muted");
    if (text) text.textContent = `Alle ${STRETCHES.length} Übungen sind erledigt.`;
    showStretchScreen("complete");
    signalStretch();
  };
  endStretchRoutine = () => { stopStretchTimer(); stretchMode = "idle"; phase = "idle"; stretchPaused = false; $("pauseStretchBtn").textContent = "Pause"; showStretchScreen("overview"); };

  const bind = () => {
    $("startStretchRoutineBtn").onclick = startStretchRoutine;
    $("pauseStretchBtn").onclick = toggleStretchPause;
    $("skipStretchBtn").onclick = skipStretchPhase;
    $("startStretchNowBtn").onclick = startNextStretchNow;
    $("endStretchBtn").onclick = () => confirm("Dehnroutine wirklich beenden?") && endStretchRoutine();
    $("restartStretchBtn").onclick = startStretchRoutine;
  };

  const init = () => {
    setData();
    renderPreview();
    bind();
    const completeText = document.querySelector("#stretchComplete .muted");
    if (completeText) completeText.textContent = `Alle ${STRETCHES.length} Übungen sind erledigt.`;
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
