(() => {
  if (window.RepPilotUpdate) return;
  const VERSION="11.8.110";
  const current=()=>document.documentElement?.dataset?.appVersion||"";
  const check=async()=>{
    try{
      const r=await fetch("./version.json?ts="+Date.now(),{cache:"no-store"});
      if(!r.ok)return"";
      return String((await r.json())?.version||"");
    }catch{return""}
  };
  let updating=false;
  const applyIfNeeded=async()=>{
    if(updating)return false;
    const latest=await check(),now=current();
    if(!latest||!now||latest===now)return false;
    updating=true;
    try{
      const reg=await navigator.serviceWorker?.getRegistration?.();
      await reg?.update?.();
    }catch{}
    const target=new URL("./",location.href);
    target.searchParams.set("launch","v"+latest);
    target.searchParams.set("refresh",String(Date.now()));
    location.replace(target.href);
    return true;
  };
  setTimeout(applyIfNeeded,1200);
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")applyIfNeeded()});
  window.RepPilotUpdate={version:VERSION,current,check,applyIfNeeded};
})();