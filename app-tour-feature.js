(() => {
  const VERSION = "11.8.103";
  const SEEN_KEY = "reppilot-app-tour-v1";
  const ROOT_ID = "rpAppTour";
  let index = 0;
  let active = false;
  let retryTimer = 0;

  const steps = [
    {
      title: "Willkommen bei RepPilot 👋",
      text: "In weniger als einer Minute zeigen wir dir die wichtigsten Bereiche der App.",
      target: null,
      view: null
    },
    {
      title: "Heute",
      text: "Hier siehst du deinen aktuellen Wochenplan, deine wichtigsten Kennzahlen und startest dein geplantes Training.",
      target: 'nav button[data-view="home"]',
      view: "home"
    },
    {
      title: "Training",
      text: "Hier findest du deine Trainingsbereiche: Studio, Home Workout, Dehnen, Läufer-Stabi und Ski-Workout.",
      target: 'nav button[data-view="trainingHub"]',
      view: "trainingHub"
    },
    {
      title: "Verlauf",
      text: "Hier landen deine abgeschlossenen Trainings und Läufe. Außerdem siehst du Rekorde und deine Entwicklung.",
      target: 'nav button[data-view="history"]',
      view: "history"
    },
    {
      title: "Profil",
      text: "Hier pflegst du Körperdaten und Trainingsplan. Außerdem findest du Apple Health, Einstellungen und weitere persönliche Daten.",
      target: 'nav button[data-view="profile"]',
      view: "profile"
    },
    {
      title: "Los geht’s 🚀",
      text: "Das war’s. Die Führung kannst du später jederzeit im Profil erneut starten.",
      target: null,
      view: "home"
    }
  ];

  const isStandalone = () =>
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true;

  function ensureStyles() {
    if (document.getElementById("rpAppTourStyles")) return;
    const s = document.createElement("style");
    s.id = "rpAppTourStyles";
    s.textContent = `
      #${ROOT_ID}{position:fixed;inset:0;z-index:30000;pointer-events:none;font-family:inherit}
      #${ROOT_ID}[hidden]{display:none!important}
      .rp-tour-backdrop{position:absolute;inset:0;background:rgba(2,6,23,.74);pointer-events:auto}
      .rp-tour-spotlight{position:fixed;border:3px solid #fff;border-radius:16px;box-shadow:0 0 0 9999px rgba(2,6,23,.74);z-index:30001;pointer-events:none;transition:all .18s ease}
      .rp-tour-card{position:fixed;left:16px;right:16px;z-index:30002;max-width:430px;margin:auto;background:#fff;color:#111827;border-radius:22px;padding:18px;box-shadow:0 24px 70px rgba(0,0,0,.35);pointer-events:auto;display:block!important;min-width:0!important;width:auto!important}
      .rp-tour-card.rp-tour-card-top{top:max(78px,calc(env(safe-area-inset-top,0px) + 48px))}
      .rp-tour-card.rp-tour-card-bottom{bottom:max(92px,calc(env(safe-area-inset-bottom,0px) + 78px))}
      .rp-tour-progress{font-size:11px;font-weight:900;letter-spacing:.08em;color:#64748b;text-transform:uppercase}
      .rp-tour-card h2{margin:6px 0 7px;font-size:22px;display:block!important;min-width:0;white-space:normal}
      .rp-tour-card p{margin:0;color:#64748b;line-height:1.45;display:block!important;min-width:0;white-space:normal;overflow-wrap:normal;word-break:normal}
      .rp-tour-actions{display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;gap:10px;margin-top:16px;width:100%}
      .rp-tour-actions button{border:0;border-radius:13px;padding:12px 14px;font:inherit;font-weight:800;min-width:0;max-width:100%}
      .rp-tour-skip{background:#e2e8f0;color:#0f172a}
      .rp-tour-next{background:#111827;color:#fff}
      #rpTourReplayBtn{margin-top:14px}
    `;
    document.head.appendChild(s);
  }

  function ensureRoot() {
    ensureStyles();
    let root = document.getElementById(ROOT_ID);
    if (root) return root;
    root = document.createElement("div");
    root.id = ROOT_ID;
    root.hidden = true;
    root.innerHTML = `
      <div class="rp-tour-backdrop"></div>
      <div class="rp-tour-spotlight"></div>
      <div class="rp-tour-card rp-tour-card-bottom">
        <div class="rp-tour-progress"></div>
        <h2></h2>
        <p></p>
        <div class="rp-tour-actions">
          <button class="rp-tour-skip">Überspringen</button>
          <button class="rp-tour-next">Weiter</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    root.querySelector(".rp-tour-skip").onclick = finish;
    root.querySelector(".rp-tour-next").onclick = next;
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return root;
  }

  function clickView(view) {
    if (!view) return;
    const btn = document.querySelector(`nav button[data-view="${view}"]`);
    if (btn && !btn.classList.contains("active")) btn.click();
  }

  function getTarget(step) {
    return step?.target ? document.querySelector(step.target) : null;
  }

  function position() {
    if (!active) return;
    const root = ensureRoot();
    const step = steps[index];
    const spot = root.querySelector(".rp-tour-spotlight");
    const card = root.querySelector(".rp-tour-card");
    const backdrop = root.querySelector(".rp-tour-backdrop");
    const target = getTarget(step);

    if (!target) {
      spot.style.display = "none";
      backdrop.style.display = "block";
      card.classList.remove("rp-tour-card-top");
      card.classList.add("rp-tour-card-bottom");
      return;
    }

    const r = target.getBoundingClientRect();
    const pad = 6;
    spot.style.display = "block";
    backdrop.style.display = "none";
    spot.style.left = Math.max(6, r.left - pad) + "px";
    spot.style.top = Math.max(6, r.top - pad) + "px";
    spot.style.width = Math.min(window.innerWidth - 12, r.width + pad * 2) + "px";
    spot.style.height = Math.max(44, r.height + pad * 2) + "px";
    card.classList.toggle("rp-tour-card-top", r.top + r.height / 2 > window.innerHeight / 2);
    card.classList.toggle("rp-tour-card-bottom", !(r.top + r.height / 2 > window.innerHeight / 2));
  }

  function render() {
    if (!active) return;
    const root = ensureRoot();
    const step = steps[index];
    clickView(step.view);

    setTimeout(() => {
      root.querySelector(".rp-tour-progress").textContent = `${index + 1} von ${steps.length}`;
      root.querySelector("h2").textContent = step.title;
      root.querySelector("p").textContent = step.text;
      root.querySelector(".rp-tour-next").textContent = index === steps.length - 1 ? "Fertig" : "Weiter";
      position();
    }, 90);
  }

  function start(force = false) {
    if (active) return;
    if (!force && localStorage.getItem(SEEN_KEY) === "1") return;
    active = true;
    index = 0;
    const root = ensureRoot();
    root.hidden = false;
    render();
  }

  function finish() {
    localStorage.setItem(SEEN_KEY, "1");
    active = false;
    const root = ensureRoot();
    root.hidden = true;
    clickView("home");
  }

  function next() {
    if (index >= steps.length - 1) return finish();
    index += 1;
    render();
  }

  function injectReplayButton() {
    const profile = document.getElementById("profile");
    if (!profile || document.getElementById("rpTourReplayBtn")) return;
    const btn = document.createElement("button");
    btn.id = "rpTourReplayBtn";
    btn.className = "secondary wide";
    btn.textContent = "App-Führung starten";
    btn.onclick = () => start(true);
    const card = profile.querySelector(".profile-card");
    if (card) card.appendChild(btn);
  }

  function appReadyForTour() {
    const auth = document.querySelector(".auth-overlay");
    if (auth && !auth.hidden) return false;
    const onboarding = document.getElementById("rpOnboarding");
    if (onboarding && !onboarding.hidden) return false;
    if (!document.querySelector('nav button[data-view="profile"]')) return false;
    return true;
  }

  function scheduleAutoStart() {
    if (!isStandalone() || localStorage.getItem(SEEN_KEY) === "1") return;
    clearInterval(retryTimer);
    retryTimer = setInterval(() => {
      injectReplayButton();
      if (!appReadyForTour()) return;
      clearInterval(retryTimer);
      retryTimer = 0;
      setTimeout(() => start(false), 650);
    }, 350);
    setTimeout(() => {
      if (retryTimer) {
        clearInterval(retryTimer);
        retryTimer = 0;
      }
    }, 30000);
  }

  function init() {
    injectReplayButton();
    const observer = new MutationObserver(injectReplayButton);
    observer.observe(document.body, { childList: true, subtree: true });
    scheduleAutoStart();

    window.RepPilotAppTour = {
      version: VERSION,
      start: () => start(true),
      reset: () => localStorage.removeItem(SEEN_KEY)
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();