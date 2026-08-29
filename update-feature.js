(() => {
  if (window.RepPilotUpdate) return;
  const VERSION = "11.8.89.2";
  const STRENGTH_KEY = "reppilot-strength-tests-v1";
  const UPDATE_STRENGTH_BACKUP_KEY = "reppilot-strength-tests-update-backup-v1";
  let updating = false;

  const readCurrentVersion = () => document.documentElement?.dataset?.appVersion || "0.0.0";
  const compareVersions = (a,b) => {
    const aa=String(a).split(".").map(Number),bb=String(b).split(".").map(Number),len=Math.max(aa.length,bb.length);
    for(let i=0;i<len;i++){const av=aa[i]||0,bv=bb[i]||0;if(av!==bv)return av>bv?1:-1}
    return 0;
  };
  const validStrengthRaw = raw => {
    if(!raw)return false;
    try{const rows=JSON.parse(raw);return Array.isArray(rows)&&rows.length>0}catch{return false}
  };
  const backupStrengthMeasurements = () => {
    try{
      window.RepPilotTrainingDataPersistence?.refreshBackup?.();
      const raw=localStorage.getItem(STRENGTH_KEY);
      if(validStrengthRaw(raw)){localStorage.setItem(UPDATE_STRENGTH_BACKUP_KEY,raw);return true}
    }catch{}
    return false;
  };
  const restoreStrengthMeasurements = () => {
    try{
      const current=localStorage.getItem(STRENGTH_KEY),backup=localStorage.getItem(UPDATE_STRENGTH_BACKUP_KEY);
      if(!validStrengthRaw(current)&&validStrengthRaw(backup))localStorage.setItem(STRENGTH_KEY,backup);
      else if(validStrengthRaw(current))localStorage.setItem(UPDATE_STRENGTH_BACKUP_KEY,current);
      window.RepPilotTrainingDataPersistence?.refreshBackup?.();
    }catch{}
  };
  const fetchLatestVersion = async () => {
    const r=await fetch("./version.json?ts="+Date.now(),{cache:"no-store"});
    if(!r.ok)return "";
    const v=await r.json();
    return String(v?.version||"").trim();
  };
  const reloadTo = version => {
    if(updating)return;
    updating=true;
    backupStrengthMeasurements();
    const u=new URL(location.href);
    u.searchParams.set("rpv",version||String(Date.now()));
    u.searchParams.set("refresh",String(Date.now()));
    location.replace(u.toString());
  };
  const check = async () => {
    try{
      const remote=await fetchLatestVersion(),current=readCurrentVersion();
      if(remote&&compareVersions(remote,current)>0)reloadTo(remote);
    }catch{}
  };
  const init=()=>{
    restoreStrengthMeasurements();
    document.querySelector("#repPilotUpdateBanner")?.remove();
    check();
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")check()});
  };
  window.RepPilotUpdate={version:VERSION,check,install:reloadTo,current:readCurrentVersion,backupStrengthMeasurements,restoreStrengthMeasurements};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();