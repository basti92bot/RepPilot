(() => {
  const baseStretchArt = typeof stretchArt === "function" ? stretchArt : (() => "");
  const image = (src, alt) => `<img src="${src}" alt="${alt}" style="display:block;width:100%;height:auto;border-radius:18px">`;

  stretchArt = type => {
    if (type === "upper-back") return image("./stretch-upper-back-v11.8.29.svg?v=11.8.29", "Oberer Rücken Dehnübung");
    if (type === "lower-back") return image("./stretch-lower-back-v11.8.29.svg?v=11.8.29", "Unterer Rücken Dehnübung");
    return baseStretchArt(type);
  };

  const init = () => {
    if (typeof renderStretchPreview === "function") renderStretchPreview();
    const version = document.querySelector("header h1 span");
    if (version) version.textContent = "v11.8.29";
    document.title = "RepPilot v11.8.29";
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
