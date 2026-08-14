(() => {
  const VERSION = "11.8.33";
  const BODYWEIGHT = /liegestütz|hanging leg raise|plank|dead bug|mountain climber/i;

  const roundHalf = value => Math.round(value * 2) / 2;
  const fmt = value => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);

  const incrementFor = name => {
    const n = String(name || "").toLowerCase();
    if (/beinpresse|rumänisches kreuzheben|wadenheben/.test(n)) return 5;
    if (/seitheben|curl|fly|extension|pushdown|reverse butterfly/.test(n)) return 1;
    return 2.5;
  };

  const ensureUI = () => {
    const panel = document.getElementById("setPanel");
    const anchor = document.getElementById("lastTraining");
    if (!panel || !anchor) return null;

    if (!document.getElementById("progressionStyles")) {
      const style = document.createElement("style");
      style.id = "progressionStyles";
      style.textContent = `
        .progression-hint{display:flex;align-items:center;gap:12px;margin:12px 0;padding:12px 13px;border:1px solid #dbe3ea;border-radius:14px;background:#f8fafc;text-align:left}
        .progression-hint[hidden]{display:none!important}
        .progression-copy{min-width:0;flex:1}
        .progression-copy small{display:block;color:#6b7280;font-size:10px;font-weight:900;letter-spacing:.08em}
        .progression-copy strong{display:block;margin-top:3px;font-size:16px}
        .progression-copy span{display:block;margin-top:3px;color:#4b5563;font-size:12px;line-height:1.35}
        #progressionApplyBtn{flex:0 0 auto;padding:9px 11px;border-radius:11px;font-size:12px}
        .progression-up strong{color:#166534}
        .progression-hold strong{color:#92400e}
        .progression-down strong{color:#991b1b}
      `;
      document.head.appendChild(style);
    }

    let box = document.getElementById("progressionHint");
    if (!box) {
      box = document.createElement("div");
      box.id = "progressionHint";
      box.className = "progression-hint";
      box.hidden = true;
      box.innerHTML = `
        <div class="progression-copy">
          <small>AUTOMATISCHE PROGRESSION</small>
          <strong id="progressionTitle"></strong>
          <span id="progressionText"></span>
        </div>
        <button id="progressionApplyBtn" type="button">Übernehmen</button>`;
      anchor.insertAdjacentElement("afterend", box);
    }
    return box;
  };

  const previousPerformances = (name, plannedSets) => {
    if (typeof history !== "function") return [];
    const result = [];
    const items = history().slice().reverse();
    for (const workout of items) {
      const exercise = workout?.exercises?.find(x => x.name === name);
      if (!exercise) continue;
      const done = (exercise.sets || []).filter(x => x.done && Number(x.weight) > 0);
      if (!done.length) continue;
      const weights = done.map(x => Number(x.weight));
      const max = Math.max(...weights);
      const min = Math.min(...weights);
      result.push({
        weight: weights[weights.length - 1],
        max,
        min,
        stable: max - min <= 0.5,
        complete: done.length >= plannedSets,
        sets: done.length,
        date: workout.finishedAt || workout.startedAt
      });
      if (result.length >= 2) break;
    }
    return result;
  };

  const recommendationFor = exercise => {
    if (!exercise || BODYWEIGHT.test(exercise.name)) return null;
    const sessions = previousPerformances(exercise.name, exercise.sets.length);
    if (!sessions.length) return null;

    const latest = sessions[0];
    const previous = sessions[1];
    const inc = incrementFor(exercise.name);
    const latestWeight = roundHalf(latest.weight || latest.max);

    if (!latest.complete) {
      const target = roundHalf(Math.max(0.5, latestWeight - inc));
      return {
        type: "down",
        title: `↘ ${fmt(target)} kg versuchen`,
        text: `Letztes Mal waren nicht alle ${exercise.sets.length} Sätze komplett. Etwas leichter starten.`,
        target
      };
    }

    if (!latest.stable) {
      const target = roundHalf(latestWeight);
      return {
        type: "hold",
        title: `↔ ${fmt(target)} kg halten`,
        text: "Letztes Mal wurde das Gewicht innerhalb der Übung angepasst. Erst stabil über alle Sätze schaffen.",
        target
      };
    }

    const sameAsPrevious = previous && previous.complete && previous.stable && Math.abs(previous.weight - latest.weight) <= 0.5;
    if (sameAsPrevious) {
      const target = roundHalf(latestWeight + inc);
      return {
        type: "up",
        title: `↗ ${fmt(target)} kg probieren`,
        text: `${fmt(latestWeight)} kg wurden zweimal stabil geschafft. Nächste sinnvolle Stufe: +${fmt(inc)} kg.`,
        target
      };
    }

    return {
      type: "hold",
      title: `↔ ${fmt(latestWeight)} kg bestätigen`,
      text: "Dieses Gewicht noch einmal sauber über alle Sätze schaffen. Danach schlägt RepPilot die nächste Stufe vor.",
      target: latestWeight
    };
  };

  const renderProgression = () => {
    const box = ensureUI();
    if (!box) return;

    const isHome = typeof active !== "undefined" && active?.id?.startsWith("home-");
    if (isHome || typeof current !== "function" || typeof si === "undefined" || si !== 0) {
      box.hidden = true;
      return;
    }

    const exercise = current();
    const rec = recommendationFor(exercise);
    if (!rec) {
      box.hidden = true;
      return;
    }

    box.className = `progression-hint progression-${rec.type}`;
    document.getElementById("progressionTitle").textContent = rec.title;
    document.getElementById("progressionText").textContent = rec.text;

    const input = document.getElementById("weightInput");
    const btn = document.getElementById("progressionApplyBtn");
    const currentValue = Number(input?.value || 0);
    const needsChange = Math.abs(currentValue - rec.target) > 0.01;
    btn.hidden = !needsChange;
    btn.textContent = "Übernehmen";
    btn.onclick = () => {
      if (!input) return;
      input.value = rec.target;
      if (exercise?.sets?.[0]) {
        exercise.sets.forEach(set => { if (!set.done) set.weight = rec.target; });
      }
      btn.hidden = true;
      input.focus();
    };

    box.hidden = false;
  };

  const install = () => {
    if (typeof renderSet !== "function" || window.__repPilotProgressionInstalled) return;
    window.__repPilotProgressionInstalled = true;
    const baseRenderSet = renderSet;
    renderSet = function() {
      const result = baseRenderSet.apply(this, arguments);
      try { renderProgression(); } catch (error) { console.warn("Progression konnte nicht gerendert werden", error); }
      return result;
    };
    if (document.getElementById("setPanel") && typeof active !== "undefined" && active && typeof phase !== "undefined" && phase === "set") {
      try { renderProgression(); } catch {}
    }
  };

  window.RepPilotProgression = { version: VERSION, refresh: renderProgression };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
