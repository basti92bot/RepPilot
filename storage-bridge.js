(() => {
  const VERSION = "11.8.69";
  const STABLE_HISTORY_KEY = "reppilot-history";
  const HISTORY_PREFIX = "reppilot-history";
  const STRENGTH_KEY = "reppilot-strength-tests-v1";
  const STRENGTH_STATE_KEY = "reppilot-strength-test-state-v2";
  const BACKUP_KEY = "reppilot-training-data-backup-v1";
  const RESET_AT_KEY = "reppilot-training-reset-at";
  const SYNC_META_KEYS = [
    "reppilot-last-cloud-sync",
    "reppilot-cloud-history-sync-v1",
    "reppilot-apple-health-sync"
  ];

  const nativeGet = Storage.prototype.getItem;
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;
  const nativeClear = Storage.prototype.clear;
  let destructiveWriteAllowed = false;

  const parseArray = raw => {
    if (!raw) return [];
    try {
      const value = JSON.parse(raw);
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  const parseObject = raw => {
    if (!raw) return {};
    try {
      const value = JSON.parse(raw);
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch {
      return {};
    }
  };

  const normalizeExerciseName = name => {
    const map = {
      "Cross Body Cable Extension":"Einarmiger Trizeps am Kabelzug",
      "Overhead Cable Extension":"Überkopf-Trizepsstrecken am Kabelzug",
      "Seil-Pushdown":"Trizepsdrücken am Seilzug",
      "Trizepsdrücken Seil":"Trizepsdrücken am Seilzug",
      "Incline Curls":"Schrägbank-Curls",
      "Reverse Butterfly am Kabel":"Reverse Butterfly am Kabelzug",
      "Preacher Curls":"Scott-Curls",
      "Hanging Leg Raises":"Hängendes Beinheben",
      "Seitheben Kabel":"Seitheben am Kabelzug",
      "Fliegende am Kabelzug":"Kabel-Flys",
      "Bauchpresse an der Maschine":"Crunch-Maschine"
    };
    return map[String(name || "")] || String(name || "");
  };

  const historyIdentity = entry => {
    if (entry?.healthkitUuid) return `health:${entry.healthkitUuid}`;
    if (entry?.cloudId) return `cloud:${entry.cloudId}`;
    const type = entry?.type === "run" ? "run" : "strength";
    const started = entry?.startedAt || entry?.finishedAt || "";
    if (type === "run") {
      return `run:${started}:${Number(entry?.distanceKm || 0).toFixed(3)}:${Math.round(Number(entry?.durationSeconds || 0))}`;
    }
    return `strength:${started}:${String(entry?.title || entry?.id || "")}`;
  };

  const mergeHistory = (older, newer) => {
    const map = new Map();
    for (const entry of Array.isArray(older) ? older : []) {
      map.set(historyIdentity(entry), entry);
    }
    for (const entry of Array.isArray(newer) ? newer : []) {
      const id = historyIdentity(entry);
      const previous = map.get(id);
      map.set(id, previous && entry && typeof previous === "object" && typeof entry === "object"
        ? { ...previous, ...entry }
        : entry);
    }
    return [...map.values()].sort((a,b) => {
      const ta = Date.parse(a?.finishedAt || a?.startedAt || "") || 0;
      const tb = Date.parse(b?.finishedAt || b?.startedAt || "") || 0;
      return ta - tb;
    });
  };

  const strengthIdentity = row => {
    const exercise = normalizeExerciseName(row?.exercise);
    return `${row?.date || ""}|${exercise}|${row?.mode || ""}`;
  };

  const mergeStrength = (older, newer) => {
    const map = new Map();
    for (const row of Array.isArray(older) ? older : []) map.set(strengthIdentity(row), row);
    for (const row of Array.isArray(newer) ? newer : []) {
      const normalized = row && typeof row === "object" && row.exercise
        ? { ...row, exercise: normalizeExerciseName(row.exercise) }
        : row;
      map.set(strengthIdentity(normalized), normalized);
    }
    return [...map.values()].sort((a,b) => {
      const ta = Date.parse(a?.date || "") || 0;
      const tb = Date.parse(b?.date || "") || 0;
      return ta - tb;
    });
  };

  const normalizeHistoryKey = key =>
    typeof key === "string" && key.startsWith(HISTORY_PREFIX)
      ? STABLE_HISTORY_KEY
      : key;

  const rawHistoryKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(HISTORY_PREFIX)) keys.push(key);
    }
    if (!keys.includes(STABLE_HISTORY_KEY)) keys.unshift(STABLE_HISTORY_KEY);
    return keys;
  };

  const readBackup = () => {
    try {
      const value = JSON.parse(nativeGet.call(localStorage, BACKUP_KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  };

  const writeBackup = () => {
    if (destructiveWriteAllowed) return;
    const historyRows = parseArray(nativeGet.call(localStorage, STABLE_HISTORY_KEY));
    const strengthRows = parseArray(nativeGet.call(localStorage, STRENGTH_KEY));
    const strengthState = parseObject(nativeGet.call(localStorage, STRENGTH_STATE_KEY));
    const existing = readBackup();
    const mergedHistory = mergeHistory(existing.history || [], historyRows);
    const mergedStrength = mergeStrength(existing.strengthTests || [], strengthRows);
    const mergedStrengthState = { ...(existing.strengthState || {}), ...strengthState };
    if (!mergedHistory.length && !mergedStrength.length && !existing.updatedAt) return;
    nativeSet.call(localStorage, BACKUP_KEY, JSON.stringify({
      schema: 1,
      version: VERSION,
      updatedAt: new Date().toISOString(),
      history: mergedHistory,
      strengthTests: mergedStrength,
      strengthState: mergedStrengthState
    }));
  };

  const restoreAndMigrate = () => {
    try {
      const backup = readBackup();
      let mergedHistory = Array.isArray(backup.history) ? backup.history : [];
      for (const key of rawHistoryKeys()) {
        mergedHistory = mergeHistory(mergedHistory, parseArray(nativeGet.call(localStorage, key)));
      }
      if (mergedHistory.length) {
        nativeSet.call(localStorage, STABLE_HISTORY_KEY, JSON.stringify(mergedHistory));
      }

      const currentStrength = parseArray(nativeGet.call(localStorage, STRENGTH_KEY));
      const mergedStrength = mergeStrength(backup.strengthTests || [], currentStrength);
      if (mergedStrength.length) {
        nativeSet.call(localStorage, STRENGTH_KEY, JSON.stringify(mergedStrength));
      }
      const currentStrengthState = parseObject(nativeGet.call(localStorage, STRENGTH_STATE_KEY));
      const mergedStrengthState = { ...(backup.strengthState || {}), ...currentStrengthState };
      if (Object.keys(mergedStrengthState).length) {
        nativeSet.call(localStorage, STRENGTH_STATE_KEY, JSON.stringify(mergedStrengthState));
      }
      writeBackup();
    } catch (error) {
      console.warn("RepPilot Trainingsdaten-Migration fehlgeschlagen", error);
    }
  };

  restoreAndMigrate();

  Storage.prototype.getItem = function(key) {
    return nativeGet.call(this, normalizeHistoryKey(key));
  };

  Storage.prototype.setItem = function(key, value) {
    const normalizedKey = normalizeHistoryKey(key);
    if (this !== localStorage || destructiveWriteAllowed) {
      return nativeSet.call(this, normalizedKey, value);
    }

    if (normalizedKey === STABLE_HISTORY_KEY) {
      const existing = parseArray(nativeGet.call(localStorage, STABLE_HISTORY_KEY));
      const incoming = parseArray(value);
      if (existing.length || incoming.length) {
        const merged = mergeHistory(existing, incoming);
        const result = nativeSet.call(localStorage, STABLE_HISTORY_KEY, JSON.stringify(merged));
        writeBackup();
        return result;
      }
    }

    if (normalizedKey === STRENGTH_KEY) {
      const existing = parseArray(nativeGet.call(localStorage, STRENGTH_KEY));
      const incoming = parseArray(value);
      if (existing.length || incoming.length) {
        const merged = mergeStrength(existing, incoming);
        const result = nativeSet.call(localStorage, STRENGTH_KEY, JSON.stringify(merged));
        writeBackup();
        return result;
      }
    }

    if (normalizedKey === STRENGTH_STATE_KEY) {
      const existing = parseObject(nativeGet.call(localStorage, STRENGTH_STATE_KEY));
      const incoming = parseObject(value);
      const result = nativeSet.call(localStorage, STRENGTH_STATE_KEY, JSON.stringify({ ...existing, ...incoming }));
      writeBackup();
      return result;
    }

    return nativeSet.call(this, normalizedKey, value);
  };

  Storage.prototype.removeItem = function(key) {
    const normalizedKey = normalizeHistoryKey(key);
    if (this === localStorage && !destructiveWriteAllowed &&
        (normalizedKey === STABLE_HISTORY_KEY || normalizedKey === STRENGTH_KEY || normalizedKey === STRENGTH_STATE_KEY || normalizedKey === BACKUP_KEY)) {
      console.warn(`RepPilot schützt Trainingsdaten vor automatischem Löschen: ${normalizedKey}`);
      return;
    }
    return nativeRemove.call(this, normalizedKey);
  };

  Storage.prototype.clear = function() {
    if (this !== localStorage || destructiveWriteAllowed) {
      return nativeClear.call(this);
    }
    const historyRaw = nativeGet.call(localStorage, STABLE_HISTORY_KEY);
    const strengthRaw = nativeGet.call(localStorage, STRENGTH_KEY);
    const strengthStateRaw = nativeGet.call(localStorage, STRENGTH_STATE_KEY);
    const backupRaw = nativeGet.call(localStorage, BACKUP_KEY);
    const result = nativeClear.call(localStorage);
    if (historyRaw) nativeSet.call(localStorage, STABLE_HISTORY_KEY, historyRaw);
    if (strengthRaw) nativeSet.call(localStorage, STRENGTH_KEY, strengthRaw);
    if (strengthStateRaw) nativeSet.call(localStorage, STRENGTH_STATE_KEY, strengthStateRaw);
    if (backupRaw) nativeSet.call(localStorage, BACKUP_KEY, backupRaw);
    console.warn("RepPilot hat Trainingsdaten bei localStorage.clear() automatisch erhalten.");
    return result;
  };

  function resetLocalTrainingData() {
    destructiveWriteAllowed = true;
    try {
      for (const key of rawHistoryKeys()) nativeRemove.call(localStorage, key);
      nativeRemove.call(localStorage, STABLE_HISTORY_KEY);
      nativeRemove.call(localStorage, STRENGTH_KEY);
      nativeRemove.call(localStorage, STRENGTH_STATE_KEY);
      nativeRemove.call(localStorage, BACKUP_KEY);
      SYNC_META_KEYS.forEach(key => nativeRemove.call(localStorage, key));
      nativeSet.call(localStorage, RESET_AT_KEY, new Date().toISOString());
    } finally {
      destructiveWriteAllowed = false;
    }
    return true;
  }

  function snapshot() {
    return {
      history: parseArray(nativeGet.call(localStorage, STABLE_HISTORY_KEY)),
      strengthTests: parseArray(nativeGet.call(localStorage, STRENGTH_KEY)),
      strengthState: parseObject(nativeGet.call(localStorage, STRENGTH_STATE_KEY)),
      backup: readBackup()
    };
  }

  window.RepPilotTrainingDataPersistence = {
    version: VERSION,
    historyKey: STABLE_HISTORY_KEY,
    strengthKey: STRENGTH_KEY,
    strengthStateKey: STRENGTH_STATE_KEY,
    backupKey: BACKUP_KEY,
    resetLocalTrainingData,
    snapshot,
    refreshBackup: writeBackup
  };
})();