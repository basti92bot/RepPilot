(() => {
  const VERSION = "11.8.34";

  const formatPaceShort = seconds => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "–";
    let m = Math.floor(seconds / 60);
    let s = Math.round(seconds % 60);
    if (s === 60) { m += 1; s = 0; }
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const formatDurationShort = seconds => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "–";
    const total = Math.round(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
  };

  const paceOf = run => {
    const stored = Number(run?.paceSecondsPerKm);
    if (Number.isFinite(stored) && stored > 0) return stored;
    const distance = Number(run?.distanceKm);
    const duration = Number(run?.durationSeconds);
    return distance > 0 && duration > 0 ? duration / distance : NaN;
  };

  const runItems = () => {
    if (typeof history !== "function") return [];
    return history()
      .filter(x => x?.type === "run" && Number(x.distanceKm) > 0 && Number(x.durationSeconds) > 0)
      .map(x => ({ ...x, pace: paceOf(x), date: new Date(x.finishedAt || x.startedAt || Date.now()) }))
      .filter(x => Number.isFinite(x.pace) && x.pace > 0)
      .sort((a,b) => a.date - b.date);
  };

  const ensureStyles = () => {
    if (document.getElementById("runDashboardStyles")) return;
    const style = document.createElement("style");
    style.id = "runDashboardStyles";
    style.textContent = `
      #runDashboard{margin:0 0 28px}
      #runDashboard[hidden]{display:none!important}
      .run-dashboard-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:0 0 12px}
      .run-dashboard-head h2{margin:0;font-size:24px}
      .run-dashboard-head small{color:var(--muted);font-weight:800}
      .run-dashboard-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:10px}
      .run-metric{padding:14px;border:1px solid var(--line);border-radius:16px;background:#fff}
      .run-metric small{display:block;color:var(--muted);font-size:11px;font-weight:900;letter-spacing:.04em}
      .run-metric strong{display:block;margin-top:4px;font-size:22px}
      .run-chart-card{padding:14px;border:1px solid var(--line);border-radius:18px;background:#fff;overflow:hidden}
      .run-chart-title{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px}
      .run-chart-title strong{font-size:15px}
      .run-chart-title span{font-size:12px;color:var(--muted)}
      .run-pace-chart{display:block;width:100%;height:auto;overflow:visible}
      .run-chart-grid{stroke:#e5e7eb;stroke-width:1}
      .run-chart-line{fill:none;stroke:#111827;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
      .run-chart-dot{fill:#fff;stroke:#111827;stroke-width:3}
      .run-chart-label{fill:#6b7280;font-size:10px;font-weight:700}
      .run-records{display:grid;gap:8px;margin-top:10px}
      .run-record{display:flex;justify-content:space-between;gap:12px;padding:11px 12px;border-radius:13px;background:#f9fafb;border:1px solid var(--line)}
      .run-record span{color:#4b5563;font-size:13px}
      .run-record strong{font-size:13px;text-align:right}
      .run-trend{margin-top:10px;padding:11px 12px;border-radius:13px;background:#f9fafb;border:1px solid var(--line);font-size:13px;color:#374151}
      @media(min-width:620px){.run-dashboard-stats{grid-template-columns:repeat(4,1fr)}}
    `;
    document.head.appendChild(style);
  };

  const ensureDashboard = () => {
    const historyView = document.getElementById("history");
    const historyList = document.getElementById("historyList");
    if (!historyView || !historyList) return null;
    ensureStyles();
    let dashboard = document.getElementById("runDashboard");
    if (!dashboard) {
      dashboard = document.createElement("section");
      dashboard.id = "runDashboard";
      dashboard.hidden = true;
      historyList.insertAdjacentElement("beforebegin", dashboard);
    }
    return dashboard;
  };

  const weekKm = (runs, olderDaysAgo, newerDaysAgo) => {
    const now = Date.now();
    const day = 86400000;
    const from = now - olderDaysAgo * day;
    const to = now - newerDaysAgo * day;
    return runs.reduce((sum, run) => {
      const t = run.date.getTime();
      return t >= from && t < to ? sum + Number(run.distanceKm || 0) : sum;
    }, 0);
  };

  const exactDistanceRecord = (runs, target) => {
    const matches = runs.filter(r => Math.abs(Number(r.distanceKm) - target) < 0.11);
    if (!matches.length) return null;
    return matches.reduce((best, run) => run.pace < best.pace ? run : best, matches[0]);
  };

  const chartSvg = runs => {
    const recent = runs.slice(-8);
    if (recent.length < 2) return `<div class="muted" style="padding:12px 0">Nach dem zweiten gespeicherten Lauf erscheint hier dein Pace-Trend.</div>`;

    const W = 340, H = 150, left = 34, right = 10, top = 14, bottom = 28;
    const plotW = W - left - right, plotH = H - top - bottom;
    const values = recent.map(r => r.pace);
    let min = Math.min(...values), max = Math.max(...values);
    if (max - min < 20) { min -= 10; max += 10; }
    else { min -= 8; max += 8; }
    const x = i => left + (recent.length === 1 ? plotW / 2 : i * plotW / (recent.length - 1));
    const y = value => top + ((value - min) / (max - min)) * plotH;
    const points = recent.map((r,i) => `${x(i).toFixed(1)},${y(r.pace).toFixed(1)}`).join(" ");
    const grid = [0, .5, 1].map(f => {
      const yy = top + f * plotH;
      const pace = min + f * (max - min);
      return `<line class="run-chart-grid" x1="${left}" x2="${W-right}" y1="${yy}" y2="${yy}"/><text class="run-chart-label" x="2" y="${yy+3}">${formatPaceShort(pace)}</text>`;
    }).join("");
    const dots = recent.map((r,i) => `<circle class="run-chart-dot" cx="${x(i)}" cy="${y(r.pace)}" r="4"/>`).join("");
    const labels = recent.map((r,i) => {
      if (recent.length > 5 && i % 2 === 1 && i !== recent.length - 1) return "";
      const label = r.date.toLocaleDateString("de-DE", { day:"2-digit", month:"2-digit" });
      return `<text class="run-chart-label" text-anchor="middle" x="${x(i)}" y="${H-7}">${label}</text>`;
    }).join("");
    return `<svg class="run-pace-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Pace-Trend der letzten Läufe">${grid}<polyline class="run-chart-line" points="${points}"/>${dots}${labels}</svg>`;
  };

  const renderRunDashboard = () => {
    const dashboard = ensureDashboard();
    if (!dashboard) return;
    const runs = runItems();
    if (!runs.length) {
      dashboard.hidden = true;
      return;
    }

    const totalKm = runs.reduce((sum,r) => sum + Number(r.distanceKm || 0), 0);
    const totalDuration = runs.reduce((sum,r) => sum + Number(r.durationSeconds || 0), 0);
    const avgPace = totalKm > 0 ? totalDuration / totalKm : NaN;
    const best = runs.reduce((a,b) => b.pace < a.pace ? b : a, runs[0]);
    const longest = runs.reduce((a,b) => Number(b.distanceKm) > Number(a.distanceKm) ? b : a, runs[0]);
    const five = exactDistanceRecord(runs, 5);
    const six = exactDistanceRecord(runs, 6);

    const currentWeek = weekKm(runs, 7, 0);
    const previousWeek = weekKm(runs, 14, 7);
    const delta = previousWeek > 0 ? ((currentWeek - previousWeek) / previousWeek) * 100 : null;
    const trend = delta === null
      ? `Diese Woche: ${currentWeek.toLocaleString("de-DE",{maximumFractionDigits:1})} km`
      : `Diese Woche: ${currentWeek.toLocaleString("de-DE",{maximumFractionDigits:1})} km · ${delta >= 0 ? "+" : ""}${Math.round(delta)} % zur Vorwoche`;

    dashboard.innerHTML = `
      <div class="run-dashboard-head"><h2>Laufentwicklung</h2><small>${runs.length} ${runs.length===1?"Lauf":"Läufe"}</small></div>
      <div class="run-dashboard-stats">
        <div class="run-metric"><small>GESAMT</small><strong>${totalKm.toLocaleString("de-DE",{maximumFractionDigits:1})} km</strong></div>
        <div class="run-metric"><small>Ø PACE</small><strong>${formatPaceShort(avgPace)}</strong></div>
        <div class="run-metric"><small>BESTE PACE</small><strong>${formatPaceShort(best.pace)}</strong></div>
        <div class="run-metric"><small>LÄNGSTER LAUF</small><strong>${Number(longest.distanceKm).toLocaleString("de-DE",{maximumFractionDigits:1})} km</strong></div>
      </div>
      <div class="run-chart-card">
        <div class="run-chart-title"><strong>Pace-Trend</strong><span>letzte ${Math.min(8,runs.length)} Läufe · min/km</span></div>
        ${chartSvg(runs)}
        <div class="run-records">
          ${five ? `<div class="run-record"><span>🏆 Schnellste 5 km</span><strong>${formatDurationShort(Number(five.durationSeconds))} · ${formatPaceShort(five.pace)} /km</strong></div>` : ""}
          ${six ? `<div class="run-record"><span>🏆 Schnellste 6 km</span><strong>${formatDurationShort(Number(six.durationSeconds))} · ${formatPaceShort(six.pace)} /km</strong></div>` : ""}
          <div class="run-record"><span>🏆 Beste Pace</span><strong>${formatPaceShort(best.pace)} /km · ${Number(best.distanceKm).toLocaleString("de-DE",{maximumFractionDigits:1})} km</strong></div>
        </div>
        <div class="run-trend">${trend}</div>
      </div>`;
    dashboard.hidden = false;
  };

  const install = () => {
    if (window.__repPilotRunDashboardInstalled || typeof renderHistory !== "function") return;
    window.__repPilotRunDashboardInstalled = true;
    const baseRenderHistory = renderHistory;
    renderHistory = function() {
      const result = baseRenderHistory.apply(this, arguments);
      try { renderRunDashboard(); } catch (error) { console.warn("Lauf-Dashboard konnte nicht gerendert werden", error); }
      return result;
    };
    renderRunDashboard();
  };

  window.RepPilotRunDashboard = { version: VERSION, refresh: renderRunDashboard };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
