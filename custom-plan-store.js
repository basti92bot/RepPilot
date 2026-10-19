(() => {
  "use strict";
  const SCHEMA_VERSION=1;
  const KEY_PREFIX="reppilot-custom-plans-v1:";
  const LIMIT=30;
  const MAX_SESSIONS=7;
  const MAX_EXERCISES=30;
  const clone=value=>JSON.parse(JSON.stringify(value));

  async function userId(){
    const client=window.repPilotSupabase;
    if(!client?.auth?.getUser)throw new Error("Bitte zuerst bei RepPilot anmelden.");
    const result=await client.auth.getUser();
    const id=String(result?.data?.user?.id||"");
    if(result?.error||!id||!/^[a-zA-Z0-9_-]{3,128}$/.test(id))throw new Error("Kein gültiger RepPilot-Benutzer angemeldet.");
    return id;
  }

  function read(key){
    const raw=localStorage.getItem(key);
    if(!raw)return [];
    let data;
    try{data=JSON.parse(raw);}catch{throw new Error("Gespeicherte Planentwürfe sind beschädigt und werden nicht überschrieben.");}
    if(!data||data.schemaVersion!==SCHEMA_VERSION||!Array.isArray(data.plans))
      throw new Error("Nicht unterstützte Trainingsplan-Version. Bestehende Daten bleiben erhalten.");
    return data.plans;
  }
  function write(key,plans){
    localStorage.setItem(key,JSON.stringify({schemaVersion:SCHEMA_VERSION,plans}));
  }

  const string=(value,max,label)=>{
    const s=String(value||"").trim();
    if(!s||s.length>max)throw new Error(label+" muss zwischen 1 und "+max+" Zeichen enthalten.");
    return s;
  };
  const integer=(value,min,max,label)=>{
    const number=Number(value);
    if(!Number.isInteger(number)||number<min||number>max)
      throw new Error(label+" muss zwischen "+min+" und "+max+" liegen.");
    return number;
  };
  const weight=value=>{
    const n=Number(value??0);
    if(!Number.isFinite(n)||n<0||n>1000)throw new Error("Ungültiges Trainingsgewicht.");
    return n;
  };

  function validate(draft){
    const catalog=window.RepPilotExerciseCatalog;
    if(!catalog)throw new Error("Übungskatalog nicht verfügbar.");
    if(!draft||typeof draft!=="object")throw new Error("Ungültiger Trainingsplan.");
    const name=string(draft.name,80,"Planname");
    if(!Array.isArray(draft.sessions)||draft.sessions.length<1||draft.sessions.length>MAX_SESSIONS)
      throw new Error("Ein Trainingsplan braucht 1 bis 7 Trainingseinheiten.");
    const seen=new Set();
    const sessions=draft.sessions.map((session,index)=>{
      const id=String(session?.id||"session-"+(index+1));
      if(!/^[a-zA-Z0-9_-]{1,64}$/.test(id)||seen.has(id))throw new Error("Ungültige oder doppelte Trainingseinheit-ID.");
      seen.add(id);
      const title=string(session.title,80,"Name der Trainingseinheit");
      const weekday=session.weekday==null?null:integer(session.weekday,0,6,"Wochentag");
      if(!Array.isArray(session.exercises)||session.exercises.length>MAX_EXERCISES)
        throw new Error("Maximal 30 Übungen pro Trainingseinheit.");
      const exercises=session.exercises.map(row=>{
        const exerciseId=String(row?.exerciseId||"");
        if(!catalog.byId(exerciseId))throw new Error("Unbekannte Übung: "+exerciseId);
        return {
          exerciseId,
          sets:integer(row.sets??3,1,10,"Sätze"),
          reps:integer(row.reps??10,1,100,"Wiederholungen"),
          restSeconds:integer(row.restSeconds??90,0,600,"Pause"),
          weightKg:weight(row.weightKg)
        };
      });
      return {id,title,weekday,exercises};
    });
    return {schemaVersion:SCHEMA_VERSION,name,sessions};
  }

  function freshId(){
    if(typeof crypto!=="undefined"&&typeof crypto.randomUUID==="function")return "plan-"+crypto.randomUUID();
    return "plan-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,12);
  }

  async function list(){
    const key=KEY_PREFIX+await userId();
    return clone(read(key));
  }
  async function get(id){
    return (await list()).find(plan=>plan.id===id)||null;
  }
  async function save(draft){
    const clean=validate(draft);
    const key=KEY_PREFIX+await userId();
    const all=read(key);
    const requestedId=typeof draft?.id==="string"?draft.id:"";
    if(requestedId&&!/^plan-[a-zA-Z0-9_-]{4,64}$/.test(requestedId))
      throw new Error("Ungültige Plan-ID.");
    const index=requestedId?all.findIndex(plan=>plan.id===requestedId):-1;
    if(requestedId&&index<0)throw new Error("Trainingsplan nicht gefunden. Kein Überschreiben fremder Einträge.");
    if(index<0&&all.length>=LIMIT)throw new Error("Maximal 30 eigene Trainingspläne.");
    const now=new Date().toISOString();
    const previous=index>=0?all[index]:null;
    const plan={id:previous?.id||freshId(),...clean,createdAt:previous?.createdAt||now,updatedAt:now};
    if(index>=0)all[index]=plan;
    else all.push(plan);
    write(key,all);
    return clone(plan);
  }
  async function remove(id){
    const key=KEY_PREFIX+await userId();
    const all=read(key);
    const kept=all.filter(plan=>plan.id!==id);
    if(kept.length===all.length)return false;
    write(key,kept);
    return true;
  }
  // Pure conversion for a future plan editor. Does not register or start a workout.
  function toWorkout(plan,sessionId){
    const clean=validate(plan);
    const session=clean.sessions.find(row=>row.id===sessionId);
    if(!session)throw new Error("Trainingseinheit nicht gefunden.");
    if(!session.exercises.length)throw new Error("Leere Trainingseinheiten lassen sich nicht starten.");
    const catalog=window.RepPilotExerciseCatalog;
    return {
      id:"custom-"+String(plan.id||"draft")+"-"+session.id,
      title:session.title,day:session.weekday,
      exercises:session.exercises.map(row=>[catalog.byId(row.exerciseId).name,row.sets,row.weightKg]),
      details:clone(session.exercises)
    };
  }
  window.RepPilotCustomPlans=Object.freeze({
    schemaVersion:SCHEMA_VERSION,keyPrefix:KEY_PREFIX,validate,list,get,save,remove,toWorkout
  });
})();
