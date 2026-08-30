(() => {
  const VERSION = "11.8.105-history-simple-1";
  let mode = "strength";

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));

  const date = value => {
    const d = new Date(value || 0);
    return Number.isFinite(d.getTime()) ? d.toLocaleDateString("de-DE") : "–";
  };

  const duration = seconds => {
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
      : `${m}:${String(s).padStart(2,"0")}`;
  };

  const pace = seconds => {
    const value = Number(seconds);
    if (!Number.isFinite(value) || value <= 0) return "–";
    let m = Math.floor(value / 60);
    let s = Math.round(value % 60);
    if (s === 60) { m += 1; s = 0; }
    return `${m}:${String(s).padStart(2,"0")} min/km`;
  };

  const weight = value => Number(value || 0).toLocaleString("de-DE",{maximumFractionDigits:1});

  const rows = () => {
    if (typeof history !== "function") return [];
    const all = history().slice().reverse();
    return mode === "run"
      ? all.filter(x => x?.type === "run")
      : all.filter(x => x?.type !== "run" && Array.isArray(x?.exercises));
  };

  const keyOf = (row,index) =>
    String(row?.cloudId || row?.healthkitUuid || row?.id || row?.finishedAt || row?.startedAt || index);

  const totalVolume = workout => {
    try {
      if (typeof total === "function") return Number(total(workout) || 0);
    } catch {}
    return (workout?.exercises || []).reduce((sum,exercise) =>
      sum + (exercise?.sets || []).reduce((s,set) =>
        s + (set?.done === false ? 0 : (Number(set?.weight)||0) * (Number(set?.reps)||0)),0),0);
  };

  function ensureStyles() {
    if (document.getElementById("historySimpleStyles")) return;
    const style = document.createElement("style");
    style.id = "historySimpleStyles";
    style.textContent = `
      .history-simple-wrap{margin:-6px 0 24px}
      .history-simple-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:5px;background:#f3f4f6;border-radius:16px;margin-bottom:14px}
      .history-simple-tab{border:0;border-radius:12px;background:transparent;color:var(--muted);padding:12px 10px;font:inherit;font-weight:900}
      .history-simple-tab.active{background:#fff;color:var(--text);box-shadow:0 2px 8px rgba(17,24,39,.08)}
      .history-simple-detail{display:grid;gap:14px;margin-top:14px}
      .history-simple-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px;box-shadow:0 5px 16px rgba(17,24,39,.05)}
      .history-simple-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:14px}
      .history-simple-head h3{margin:3px 0 0;font-size:21px}
      .history-simple-head small{color:var(--muted);font-weight:800}
      .history-simple-total{font-size:16px;font-weight:900;white-space:nowrap}
      .history-simple-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
      .history-simple-list li{display:flex;justify-content:space-between;gap:12px;padding:13px 0;border-bottom:1px solid var(--line)}
      .history-simple-list li:last-child{border-bottom:0}
      .history-simple-list strong{text-align:right}
      .history-simple-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .history-simple-metric{padding:12px;border:1px solid var(--line);border-radius:14px;background:#f9fafb}
      .history-simple-metric small{display:block;color:var(--muted);font-size:10px;font-weight:900}
      .history-simple-metric strong{display:block;margin-top:4px;font-size:16px}
      @media(max-width:560px){.history-simple-metrics{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensureUi() {
    const root = document.getElementById("history");
    const title = root?.querySelector(":scope>h2");
    if (!root || !title) return null;
    ensureStyles();

    let wrap = document.getElementById("historySimple");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "historySimple";
      wrap.className = "history-simple-wrap";
      wrap.innerHTML = `
        <div class="history-simple-tabs" role="tablist" aria-label="Verlauf auswählen">
          <button type="button" class="history-simple-tab" data-history-simple-mode="strength">🏋️ Kraft</button>
          <button type="button" class="history-simple-tab" data-history-simple-mode="run">🏃 Laufen</button>
        </div>
        <div id="historySimpleDetail" class="history-simple-detail"></div>
      `;
      title.insertAdjacentElement("afterend",wrap);

      wrap.querySelectorAll("[data-history-simple-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
          mode = btn.dataset.historySimpleMode === "run" ? "run" : "strength";
          render();
        });
      });

    }

    return wrap;
  }

  function optionLabel(row) {
    const when = date(row.finishedAt || row.startedAt);
    if (mode === "run") {
      const km = Number(row.distanceKm || 0).toLocaleString("de-DE",{maximumFractionDigits:2});
      const p = Number(row.paceSecondsPerKm || 0) || (Number(row.durationSeconds || 0) / Number(row.distanceKm || 1));
      return `${when} · ${row.title || "Lauf"} · ${km} km · ${pace(p).replace(" min/km","")}`;
    }
    return `${when} · ${row.title || "Krafttraining"} · ${weight(totalVolume(row))} kg`;
  }

  function renderDetail() {
    const detail = document.getElementById("historySimpleDetail");
    if (!detail) return;

    const list = rows();
    if (!list.length) {
      detail.innerHTML = `<div class="card center muted">${mode === "run" ? "Noch keine Läufe gespeichert." : "Noch keine Krafttrainings gespeichert."}</div>`;
      return;
    }

    if (mode === "run") {
      detail.innerHTML = list.map(row => {
        const distanceKm = Number(row.distanceKm || 0);
        const paceSeconds = Number(row.paceSecondsPerKm || 0) || (Number(row.durationSeconds || 0) / Number(row.distanceKm || 1));
        return `
          <article class="history-simple-card">
            <div class="history-simple-head">
              <div><small>${esc(date(row.finishedAt || row.startedAt))}</small><h3>🏃 ${esc(row.title || "Lauftraining")}</h3></div>
            </div>
            <div class="history-simple-metrics">
              <div class="history-simple-metric"><small>DISTANZ</small><strong>${distanceKm.toLocaleString("de-DE",{maximumFractionDigits:2})} km</strong></div>
              <div class="history-simple-metric"><small>ZEIT</small><strong>${duration(row.durationSeconds)}</strong></div>
              <div class="history-simple-metric"><small>PACE</small><strong>${pace(paceSeconds)}</strong></div>
            </div>
          </article>`;
      }).join("");
      return;
    }

    detail.innerHTML = list.map(row => {
      const exercises = (row.exercises || []).map(exercise => {
        const exerciseVolume = (exercise.sets || []).reduce((sum,set) =>
          sum + (set?.done === false ? 0 : (Number(set?.weight)||0) * (Number(set?.reps)||0)), 0);
        if (exerciseVolume <= 0) return "";
        return `<li><span>${esc(exercise.name || "Übung")}</span><strong>${weight(exerciseVolume)} kg</strong></li>`;
      }).join("");

      return `
        <article class="history-simple-card">
          <div class="history-simple-head">
            <div><small>${esc(date(row.finishedAt || row.startedAt))}</small><h3>${esc(row.title || "Krafttraining")}</h3></div>
            <div class="history-simple-total">${weight(totalVolume(row))} kg</div>
          </div>
          <ul class="history-simple-list">${exercises}</ul>
        </article>`;
    }).join("");
  }

  function render() {
    const wrap = ensureUi();
    if (!wrap) return;

    document.getElementById("stats")?.setAttribute("hidden","");
    document.getElementById("historyList")?.setAttribute("hidden","");
    document.getElementById("runDashboard")?.setAttribute("hidden","");

    wrap.querySelectorAll("[data-history-simple-mode]").forEach(btn =>
      btn.classList.toggle("active", btn.dataset.historySimpleMode === mode)
    );

    renderDetail();
  }

  function install() {
    if (window.__repPilotHistorySimpleInstalled || typeof renderHistory !== "function") return;
    window.__repPilotHistorySimpleInstalled = true;

    const baseRenderHistory = renderHistory;
    renderHistory = function() {
      const result = baseRenderHistory.apply(this, arguments);
      try { render(); } catch (error) { console.warn("Einfacher Verlauf konnte nicht gerendert werden",error); }
      return result;
    };

    render();
  }

  window.RepPilotHistorySimple = { version:VERSION, render, setMode:value => { mode=value==="run"?"run":"strength"; render(); } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
})();
