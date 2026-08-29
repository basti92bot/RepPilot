(() => {
  if (window.RepPilotUpdate) return;

  const VERSION = "11.8.89-updatefix";
  const CHECK_INTERVAL = 5 * 60 * 1000;
  const STRENGTH_KEY = "reppilot-strength-tests-v1";
  const UPDATE_STRENGTH_BACKUP_KEY = "reppilot-strength-tests-update-backup-v1";
  let lastCheck = 0;
  let latestVersion = null;
  let updating = false;

  const readCurrentVersion = () => {
    const fromHtml = document.documentElement?.dataset?.appVersion;
    if (fromHtml) return fromHtml;
    const text = document.querySelector("header h1 span")?.textContent || "";
    return text.match(/\d+(?:\.\d+)+/)?.[0] || "0.0.0";
  };

  const compareVersions = (a, b) => {
    const aa = String(a).split(".").map(Number);
    const bb = String(b).split(".").map(Number);
    const len = Math.max(aa.length, bb.length);
    for (let i = 0; i < len; i++) {
      const av = aa[i] || 0;
      const bv = bb[i] || 0;
      if (av !== bv) return av > bv ? 1 : -1;
    }
    return 0;
  };

  const validStrengthRaw = raw => {
    if (!raw) return false;
    try {
      const rows = JSON.parse(raw);
      return Array.isArray(rows) && rows.length > 0;
    } catch {
      return false;
    }
  };

  const backupStrengthMeasurements = () => {
    try {
      window.RepPilotTrainingDataPersistence?.refreshBackup?.();
      const raw = localStorage.getItem(STRENGTH_KEY);
      if (validStrengthRaw(raw)) {
        localStorage.setItem(UPDATE_STRENGTH_BACKUP_KEY, raw);
        return true;
      }
    } catch (error) {
      console.warn("Kraftmessungen konnten vor dem Update nicht zusätzlich gesichert werden", error);
    }
    return false;
  };

  const restoreStrengthMeasurements = () => {
    try {
      const current = localStorage.getItem(STRENGTH_KEY);
      const backup = localStorage.getItem(UPDATE_STRENGTH_BACKUP_KEY);
      if (!validStrengthRaw(current) && validStrengthRaw(backup)) {
        localStorage.setItem(STRENGTH_KEY, backup);
      } else if (validStrengthRaw(current)) {
        localStorage.setItem(UPDATE_STRENGTH_BACKUP_KEY, current);
      }
      window.RepPilotTrainingDataPersistence?.refreshBackup?.();
    } catch (error) {
      console.warn("Kraftmessungen konnten nach dem Update nicht wiederhergestellt werden", error);
    }
  };

  const displayVersion = version => String(version || "").split(".").slice(0,3).join(".");
  const applyVisibleVersion = version => {
    const visible = displayVersion(version);
    if (!visible || visible === "0.0.0") return;
    const el = document.querySelector("header h1 span");
    if (el) el.textContent = `v${visible}`;
    document.title = `RepPilot v${visible}`;
  };

  const injectStyles = () => {
    if (document.getElementById("repPilotUpdateStyles")) return;
    const style = document.createElement("style");
    style.id = "repPilotUpdateStyles";
    style.textContent = `
      #repPilotUpdateBanner{position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:50;max-width:696px;margin:auto;display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid #d1d5db;border-radius:16px;background:rgba(255,255,255,.98);box-shadow:0 10px 28px rgba(17,24,39,.18);backdrop-filter:blur(12px)}
      #repPilotUpdateBanner[hidden]{display:none!important}
      #repPilotUpdateBanner .rp-update-copy{min-width:0;flex:1}
      #repPilotUpdateBanner strong{display:block;font-size:15px}
      #repPilotUpdateBanner small{display:block;margin-top:2px;color:#6b7280;font-size:12px}
      #repPilotUpdateBtn{flex:0 0 auto;padding:10px 12px;border-radius:12px}
    `;
    document.head.appendChild(style);
  };

  const ensureBanner = () => {
    let banner = document.getElementById("repPilotUpdateBanner");
    if (banner) return banner;
    injectStyles();
    banner = document.createElement("aside");
    banner.id = "repPilotUpdateBanner";
    banner.hidden = true;
    banner.innerHTML = `
      <div class="rp-update-copy">
        <strong>RepPilot-Update verfügbar</strong>
        <small id="repPilotUpdateText">Neue Version verfügbar.</small>
      </div>
      <button id="repPilotUpdateBtn" type="button">Aktualisieren</button>`;
    document.body.appendChild(banner);
    document.getElementById("repPilotUpdateBtn").addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      forceUpdate(latestVersion);
    });
    return banner;
  };

  const showUpdate = version => {
    latestVersion = version;
    const banner = ensureBanner();
    const text = document.getElementById("repPilotUpdateText");
    if (text) text.textContent = "Neue RepPilot-Aktualisierung ist bereit.";
    banner.hidden = false;
  };

  const hideUpdate = () => {
    const banner = document.getElementById("repPilotUpdateBanner");
    if (banner) banner.hidden = true;
  };

  const fetchLatestVersion = async () => {
    const response = await fetch(`./version.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return "";
    const data = await response.json();
    return String(data?.version || "").trim();
  };

  const checkForUpdate = async ({ force = false } = {}) => {
    const now = Date.now();
    if (!force && now - lastCheck < 30000) return;
    lastCheck = now;
    try {
      const remote = await fetchLatestVersion();
      const current = readCurrentVersion();
      if (!remote) return;
      if (compareVersions(remote, current) > 0) showUpdate(remote);
      else hideUpdate();
    } catch {}
  };

  const cleanRepPilotRuntime = async () => {
    try {
      const registration = await navigator.serviceWorker?.getRegistration?.();
      registration?.update?.().catch?.(()=>{});
    } catch {}
  };

  const networkReloadUrl = version => {
    const url = new URL(location.href);
    url.searchParams.set("rpv", version || String(Date.now()));
    url.searchParams.set("refresh", String(Date.now()));
    return url.toString();
  };

  async function forceUpdate(version) {
    if (updating) return;
    updating = true;

    const button = document.getElementById("repPilotUpdateBtn");
    const text = document.getElementById("repPilotUpdateText");
    if (button) {
      button.disabled = true;
      button.textContent = "Aktualisiere…";
    }
    if (text) text.textContent = "Daten werden gesichert und RepPilot neu geladen…";

    let target = String(version || latestVersion || "").trim();
    try {
      backupStrengthMeasurements();
      if (!target) target = await fetchLatestVersion();
      if (target) sessionStorage.setItem("reppilot-update-target", target);
      cleanRepPilotRuntime();
    } catch {}

    const next = networkReloadUrl(target);
    setTimeout(() => location.replace(next), 80);
    setTimeout(() => { location.href = next; }, 1200);
  }

  const init = () => {
    restoreStrengthMeasurements();
    const current = readCurrentVersion();
    applyVisibleVersion(current);
    ensureBanner();
    checkForUpdate({ force: true });
    setInterval(() => checkForUpdate(), CHECK_INTERVAL);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkForUpdate({ force: true });
    });
  };

  window.RepPilotUpdate = {
    version: VERSION,
    check: () => checkForUpdate({ force: true }),
    install: forceUpdate,
    current: readCurrentVersion,
    clean: cleanRepPilotRuntime,
    backupStrengthMeasurements,
    restoreStrengthMeasurements
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
