(() => {
  const VERSION = "11.8.115";
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
  const runPaceSeconds = row => {
    const distance = Number(row?.distanceKm || 0);
    const durationSeconds = Number(row?.durationSeconds || 0);
    const stored = Number(row?.paceSecondsPerKm || 0);
    return stored > 0 ? stored : (distance > 0 && durationSeconds > 0 ? durationSeconds / distance : NaN);
  };

  const validChartRun = row => {
    const distance = Number(row?.distanceKm || 0);
    const durationSeconds = Number(row?.durationSeconds || 0);
    const paceSeconds = runPaceSeconds(row);
    return distance > 0 && distance <= 200 &&
      durationSeconds >= 30 && durationSeconds <= 86400 &&
      Number.isFinite(paceSeconds) && paceSeconds >= 90 && paceSeconds <= 3600;
  };

  const chartDate = row => {
    const d = new Date(row?.finishedAt || row?.startedAt || 0);
    return Number.isFinite(d.getTime())
      ? d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})
      : "–";
  };

  const runChart = list => {
    const runs = list.filter(validChartRun).slice(0,8).reverse();
    if (!runs.length) return "";

    const W=360,H=220,left=34,right=46,top=28,bottom=42;
    const plotW=W-left-right,plotH=H-top-bottom;
    const kmValues=runs.map(row=>Number(row.distanceKm||0));
    const paceValues=runs.map(runPaceSeconds);
    const kmMax=Math.max(2,Math.ceil(Math.max(...kmValues)/2)*2);
    let paceMin=Math.min(...paceValues),paceMax=Math.max(...paceValues);
    if(paceMax-paceMin<30){paceMin-=15;paceMax+=15}else{paceMin-=10;paceMax+=10}
    paceMin=Math.max(60,paceMin);
    const step=plotW/runs.length;
    const barW=Math.min(28,Math.max(12,step*.46));
    const x=i=>left+step*(i+.5);
    const yKm=value=>top+plotH-(value/kmMax)*plotH;
    const yPace=value=>top+((value-paceMin)/(paceMax-paceMin||1))*plotH;

    const gridLevels=[0,.5,1];
    const grid=gridLevels.map(f=>{
      const y=top+plotH-(f*plotH);
      const km=(kmMax*f).toLocaleString("de-DE",{maximumFractionDigits:1});
      return `<line class="history-run-grid" x1="${left}" x2="${W-right}" y1="${y}" y2="${y}"/><text class="history-run-axis" x="2" y="${y+4}">${km}</text>`;
    }).join("");

    const paceAxis=[paceMin,(paceMin+paceMax)/2,paceMax].map(value=>{
      const y=yPace(value);
      return `<text class="history-run-axis" text-anchor="start" x="${W-right+7}" y="${y+4}">${esc(pace(value).replace(" min/km",""))}</text>`;
    }).join("");

    const bars=runs.map((row,i)=>{
      const km=Number(row.distanceKm||0);
      const y=yKm(km),height=top+plotH-y;
      return `<rect class="history-run-bar" x="${(x(i)-barW/2).toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(2,height).toFixed(1)}" rx="5"/><text class="history-run-value" text-anchor="middle" x="${x(i).toFixed(1)}" y="${Math.max(top+10,y-7).toFixed(1)}">${esc(km.toLocaleString("de-DE",{maximumFractionDigits:1}))}</text>`;
    }).join("");

    const points=runs.map((row,i)=>`${x(i).toFixed(1)},${yPace(runPaceSeconds(row)).toFixed(1)}`).join(" ");
    const line=runs.length>1?`<polyline class="history-run-line" points="${points}"/>`:"";
    const dots=runs.map((row,i)=>`<circle class="history-run-dot" cx="${x(i).toFixed(1)}" cy="${yPace(runPaceSeconds(row)).toFixed(1)}" r="4"/>`).join("");
    const labels=runs.map((row,i)=>{
      if(runs.length>6 && i%2===1 && i!==runs.length-1)return "";
      return `<text class="history-run-axis" text-anchor="middle" x="${x(i).toFixed(1)}" y="${H-10}">${esc(chartDate(row))}</text>`;
    }).join("");

    return `
      <article class="history-run-chart-card">
        <div class="history-run-chart-head">
          <div><small>LETZTE LÄUFE</small><h3>Pace & Distanz</h3></div>
          <div class="history-run-chart-count">${runs.length} Läufe</div>
        </div>
        <svg class="history-run-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diagramm für Laufdistanz und Pace">
          <text class="history-run-axis-title" x="2" y="16">km</text>
          <text class="history-run-axis-title" text-anchor="end" x="${W-2}" y="16">Pace</text>
          ${grid}${paceAxis}${bars}${line}${dots}${labels}
        </svg>
        <div class="history-run-legend">
          <span><i class="history-run-legend-bar"></i>Distanz (km)</span>
          <span><i class="history-run-legend-line"></i>Pace (min/km)</span>
        </div>
      </article>`;
  };

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
      .history-workout-dropdown{border-top:1px solid var(--line)}
      .history-workout-dropdown summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 0;cursor:pointer;font-weight:900}
      .history-workout-dropdown summary::-webkit-details-marker{display:none}
      .history-workout-dropdown summary:after{content:"⌄";color:var(--muted);font-size:18px;line-height:1;transition:transform .18s ease}
      .history-workout-dropdown[open] summary:after{transform:rotate(180deg)}
      .history-workout-dropdown-title{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0;flex:1}
      .history-workout-dropdown-title span{color:#374151}
      .history-workout-dropdown-title small{color:var(--muted);font-size:12px;font-weight:800}
      .history-workout-exercises{list-style:none;margin:0;padding:0 0 4px;border-top:1px solid var(--line)}
      .history-workout-exercises li{display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}
      .history-workout-exercises li:last-child{border-bottom:0}
      .history-workout-exercises strong{white-space:nowrap;text-align:right}
      .history-simple-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .history-simple-metric{padding:12px;border:1px solid var(--line);border-radius:14px;background:#f9fafb}
      .history-simple-metric small{display:block;color:var(--muted);font-size:10px;font-weight:900}
      .history-simple-metric strong{display:block;margin-top:4px;font-size:16px}
      .history-run-chart-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:16px;box-shadow:0 5px 16px rgba(17,24,39,.05);overflow:hidden}
      .history-run-chart-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:4px}
      .history-run-chart-head small{display:block;color:var(--muted);font-size:10px;font-weight:900;letter-spacing:.05em}
      .history-run-chart-head h3{margin:3px 0 0;font-size:20px}
      .history-run-chart-count{color:var(--muted);font-size:12px;font-weight:800;padding-top:3px}
      .history-run-chart{display:block;width:100%;height:auto;overflow:visible}
      .history-run-grid{stroke:#e5e7eb;stroke-width:1}
      .history-run-axis{fill:#6b7280;font-size:10px;font-weight:700}
      .history-run-axis-title{fill:#2563eb;font-size:11px;font-weight:900}
      .history-run-bar{fill:#93c5fd}
      .history-run-value{fill:#2563eb;font-size:10px;font-weight:900}
      .history-run-line{fill:none;stroke:#2563eb;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
      .history-run-dot{fill:#fff;stroke:#2563eb;stroke-width:3}
      .history-run-legend{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;color:#4b5563;font-size:12px;font-weight:700;margin-top:-2px}
      .history-run-legend span{display:flex;align-items:center;gap:6px}
      .history-run-legend-bar{display:inline-block;width:14px;height:10px;border-radius:3px;background:#93c5fd}
      .history-run-legend-line{display:inline-block;width:18px;height:3px;border-radius:999px;background:#2563eb;position:relative}
      .history-run-legend-line:after{content:"";position:absolute;width:7px;height:7px;border-radius:50%;background:#2563eb;left:6px;top:-2px}
      @media(max-width:560px){.history-simple-metrics{grid-template-columns:1fr}.history-run-chart-card{padding:14px 10px}.history-run-legend{gap:12px;font-size:11px}}
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
      detail.innerHTML = runChart(list) + list.map(row => {

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
      const exerciseRows = (row.exercises || []).map(exercise => {
        const doneSets = (exercise.sets || []).filter(set =>
          set?.done !== false && (Number(set?.weight || 0) > 0 || Number(set?.reps || 0) > 0)
        );
        const exerciseVolume = doneSets.reduce((sum,set) =>
          sum + (Number(set?.weight)||0) * (Number(set?.reps)||0), 0);
        if (exerciseVolume <= 0 && !doneSets.length) return "";
        return `<li><span>${esc(exercise.name || "Übung")}</span><strong>${weight(exerciseVolume)} kg</strong></li>`;
      }).filter(Boolean);

      return `
        <article class="history-simple-card">
          <div class="history-simple-head">
            <div><small>${esc(date(row.finishedAt || row.startedAt))}</small><h3>${esc(row.title || "Krafttraining")}</h3></div>
            <div class="history-simple-total">${weight(totalVolume(row))} kg</div>
          </div>
          <details class="history-workout-dropdown">
            <summary>
              <div class="history-workout-dropdown-title">
                <span>Übungen</span>
                <small>${exerciseRows.length} ${exerciseRows.length===1?"Übung":"Übungen"}</small>
              </div>
            </summary>
            <ul class="history-workout-exercises">${exerciseRows.join("")}</ul>
          </details>
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
