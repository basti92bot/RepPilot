(() => {
  if (window.RepPilotUpdate) return;
  const VERSION="11.8.118";
  const current=()=>document.documentElement?.dataset?.appVersion||"11.8.118";
  const check=async()=> {
    try {
      const r=await fetch("./version.json?ts="+Date.now(),{cache:"no-store"});
      if(!r.ok)return "";
      return String((await r.json())?.version||"");
    } catch { return ""; }
  };
  window.RepPilotUpdate={version:VERSION,current,check};
})();
