(() => {
  function getWeight() {
    try {
      const p = JSON.parse(localStorage.getItem("reppilot-user-profile") || "{}");
      return Number(p?.weightKg || 0);
    } catch { return 0; }
  }
  function apply() {
    const name = document.getElementById("exerciseName")?.textContent?.trim();
    const input = document.getElementById("weightInput");
    const label = document.querySelector('label[for="weightInput"]');
    if (!input) return;
    if (name === "Hanging Leg Raises") {
      const bw = getWeight();
      if (!bw) return;
      input.value = Math.round(bw * 0.5 * 2) / 2;
      input.readOnly = true;
      input.dataset.bodyweightAuto = "true";
      if (label) label.textContent = "Effektives Körpergewicht (automatisch)";
    } else if (input.dataset.bodyweightAuto === "true") {
      input.readOnly = false;
      delete input.dataset.bodyweightAuto;
      if (label) label.textContent = "Gewicht";
    }
  }
  function start() {
    const node = document.getElementById("exerciseName");
    if (!node) return;
    new MutationObserver(apply).observe(node,{childList:true,subtree:true,characterData:true});
    apply();
  }
  document.addEventListener("DOMContentLoaded",start);
  if (document.readyState !== "loading") start();
})();