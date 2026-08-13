(() => {
  const STABLE_KEY = "reppilot-history";
  const PREFIX = "reppilot-history";
  const nativeGet = Storage.prototype.getItem;
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;

  try {
    const merged = [];
    const seen = new Set();
    const keys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) keys.push(key);
    }

    if (!keys.includes(STABLE_KEY)) keys.unshift(STABLE_KEY);

    for (const key of keys) {
      const raw = nativeGet.call(localStorage, key);
      if (!raw) continue;
      try {
        const entries = JSON.parse(raw);
        if (!Array.isArray(entries)) continue;
        for (const entry of entries) {
          const id = entry?.finishedAt || entry?.startedAt || JSON.stringify(entry);
          if (seen.has(id)) continue;
          seen.add(id);
          merged.push(entry);
        }
      } catch {}
    }

    merged.sort((a, b) => new Date(a?.startedAt || a?.finishedAt || 0) - new Date(b?.startedAt || b?.finishedAt || 0));
    if (merged.length) nativeSet.call(localStorage, STABLE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn("RepPilot Verlaufsmigration fehlgeschlagen", e);
  }

  const normalizeHistoryKey = key => typeof key === "string" && key.startsWith(PREFIX) ? STABLE_KEY : key;

  Storage.prototype.getItem = function(key) {
    return nativeGet.call(this, normalizeHistoryKey(key));
  };
  Storage.prototype.setItem = function(key, value) {
    return nativeSet.call(this, normalizeHistoryKey(key), value);
  };
  Storage.prototype.removeItem = function(key) {
    return nativeRemove.call(this, normalizeHistoryKey(key));
  };
})();
