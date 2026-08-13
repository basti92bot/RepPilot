(() => {
  const LOCAL_KEY = "reppilot-user-profile";
  const WEIGHT_HISTORY_KEY = "reppilot-weight-history";

  const readLocal = () => {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}") || {}; }
    catch { return {}; }
  };
  const writeLocal = profile => localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
  const readWeightHistory = () => {
    try { return JSON.parse(localStorage.getItem(WEIGHT_HISTORY_KEY) || "[]") || []; }
    catch { return []; }
  };
  const writeWeightHistory = rows => localStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify(rows));

  async function getUser() {
    const client = window.repPilotSupabase;
    if (!client) return null;
    const { data } = await client.auth.getUser();
    return data?.user || null;
  }

  async function loadCloudProfile() {
    const client = window.repPilotSupabase;
    const user = await getUser();
    if (!client || !user) return readLocal();
    const { data, error } = await client.from("user_profiles").select("height_cm,weight_kg,updated_at").eq("user_id", user.id).maybeSingle();
    if (error) {
      console.error("Profil laden fehlgeschlagen", error);
      return readLocal();
    }
    if (data) {
      const profile = { heightCm: Number(data.height_cm) || null, weightKg: Number(data.weight_kg) || null, updatedAt: data.updated_at || null };
      writeLocal(profile);
      return profile;
    }
    return readLocal();
  }

  async function saveCloudProfile(profile) {
    const client = window.repPilotSupabase;
    const user = await getUser();
    if (!client || !user) return false;
    const { error } = await client.from("user_profiles").upsert({ user_id: user.id, height_cm: profile.heightCm, weight_kg: profile.weightKg, updated_at: new Date().toISOString() });
    if (error) {
      console.error("Profil speichern fehlgeschlagen", error);
      return false;
    }
    return true;
  }

  function renderProfile(profile = readLocal()) {
    const summary = document.getElementById("profileSummary");
    const historyBox = document.getElementById("profileWeightHistory");
    if (!summary || !historyBox) return;

    if (profile.heightCm && profile.weightKg) {
      const legRaiseKg = Number(profile.weightKg) * 0.5;
      summary.innerHTML = `<div class="profile-values"><div><strong>${Number(profile.weightKg).toLocaleString("de-DE",{maximumFractionDigits:1})} kg</strong><small>Gewicht</small></div><div><strong>${Number(profile.heightCm).toLocaleString("de-DE",{maximumFractionDigits:0})} cm</strong><small>Größe</small></div><div><strong>${legRaiseKg.toLocaleString("de-DE",{maximumFractionDigits:1})} kg</strong><small>Hanging Leg Raises</small></div></div>`;
    } else {
      summary.innerHTML = `<p class="muted">Trage Größe und Körpergewicht ein. Körpergewichtsübungen werden dann automatisch berechnet.</p>`;
    }

    const rows = readWeightHistory().slice(-6).reverse();
    historyBox.innerHTML = rows.length > 1 ? `<div class="weight-history"><small>GEWICHTSVERLAUF</small>${rows.map(row => `<span><b>${Number(row.weightKg).toLocaleString("de-DE",{maximumFractionDigits:1})} kg</b><small>${new Date(row.at).toLocaleDateString("de-DE")}</small></span>`).join("")}</div>` : "";
  }

  function ensureProfileUI() {
    const home = document.getElementById("home");
    if (!home || document.getElementById("profileCard")) return;

    const card = document.createElement("article");
    card.id = "profileCard";
    card.className = "card profile-card";
    card.innerHTML = `<div class="profile-head"><div><small>DEIN PROFIL</small><h2>Körperdaten</h2></div><button id="editProfileBtn" class="secondary">Bearbeiten</button></div><div id="profileSummary"></div><div id="profileForm" hidden><label for="profileHeight">Größe</label><div class="weight"><input id="profileHeight" type="number" min="100" max="250" step="1" inputmode="numeric"><span>cm</span></div><label for="profileWeight">Körpergewicht</label><div class="weight"><input id="profileWeight" type="number" min="30" max="300" step="0.1" inputmode="decimal"><span>kg</span></div><button id="saveProfileBtn" class="wide">Profil speichern</button></div><div id="profileWeightHistory"></div>`;

    const dashboard = home.querySelector(".home-dashboard");
    if (dashboard) dashboard.insertAdjacentElement("afterend", card);
    else home.prepend(card);

    document.getElementById("editProfileBtn").onclick = async () => {
      const profile = await loadCloudProfile();
      document.getElementById("profileHeight").value = profile.heightCm || "";
      document.getElementById("profileWeight").value = profile.weightKg || "";
      document.getElementById("profileForm").hidden = false;
    };

    document.getElementById("saveProfileBtn").onclick = async () => {
      const heightCm = Number(document.getElementById("profileHeight").value);
      const weightKg = Number(document.getElementById("profileWeight").value);
      if (!heightCm || !weightKg) return;

      const now = new Date().toISOString();
      const profile = { heightCm, weightKg, updatedAt: now };
      writeLocal(profile);

      const rows = readWeightHistory();
      if (!rows.length || Number(rows[rows.length - 1].weightKg) !== weightKg) {
        rows.push({ weightKg, at: now });
        writeWeightHistory(rows);
      }

      await saveCloudProfile(profile);
      document.getElementById("profileForm").hidden = true;
      renderProfile(profile);
    };

    loadCloudProfile().then(renderProfile);
  }

  window.repPilotProfile = {
    get: readLocal,
    refresh: loadCloudProfile,
    bodyweightLoad: (factor = 0.5) => Number(readLocal().weightKg || 0) * factor
  };

  document.addEventListener("DOMContentLoaded", ensureProfileUI);
  if (document.readyState !== "loading") ensureProfileUI();
})();