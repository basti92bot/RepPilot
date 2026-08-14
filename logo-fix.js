(() => {
  async function applyRepPilotLogo() {
    const img = document.querySelector('.brand-logo');
    if (!img) return;
    try {
      const response = await fetch('./reppilot-muscleman-v11.8.20.svg?v=11.8.22', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Logo HTTP ${response.status}`);
      const svgText = await response.text();
      const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
      const image = doc.querySelector('image');
      const href = image?.getAttribute('href') || image?.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
      if (!href || !href.startsWith('data:image/')) throw new Error('Kein eingebettetes Bild im Logo gefunden');
      img.src = href;
      img.style.visibility = 'visible';
    } catch (error) {
      console.error('RepPilot Logo konnte nicht geladen werden', error);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyRepPilotLogo, { once: true });
  } else {
    applyRepPilotLogo();
  }
})();