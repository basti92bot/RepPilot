(() => {
  "use strict";
  const VERSION="11.8.137";
  const DAYS=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
  const GROUPS={all:"Alle Muskeln",chest:"Brust",back:"Rücken",shoulders:"Schulter",arms:"Arme",legs:"Beine",core:"Bauch & Core"};
  const EQUIPMENT={all:"Alle Geräte",machine:"Maschinen",cable:"Kabelzug",free_weights:"Freie Gewichte",bodyweight:"Körpergewicht"};
  const TEMPLATES=[["push","Push"],["personal-pull","Pull"],["personal-legs","Beine + Ski"],["upper-hypertrophy","Oberkörper + Arme"],["personal-upper-a","Oberkörper A"],["personal-lower-a","Unterkörper A"]];
  const store=()=>window.RepPilotCustomPlans;
  const catalog=()=>window.RepPilotExerciseCatalog;
  const state={plans:[],draft:null,session:0,picker:false,search:"",group:"all",equipment:"all",busy:false,message:""};
  let root=null;
  const copy=o=>JSON.parse(JSON.stringify(o));
  const safe=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const attr=x=>safe(x);
  const newPlan=()=>({name:"Mein Trainingsplan",sessions:[{id:"session-1",title:"Trainingstag 1",weekday:null,exercises:[]}]});
  const currentSession=()=>state.draft?.sessions[state.session]||null;
  const setMessage=message=>{state.message=message;const el=root?.querySelector("#rpPlanStatus");if(el)el.textContent=message;};
  const groups=()=>Object.entries(GROUPS).map(([id,title])=>'<option value="'+id+'"'+(id===state.group?" selected":"")+'>'+title+'</option>').join("");
  const equipment=()=>Object.entries(EQUIPMENT).map(([id,title])=>'<option value="'+id+'"'+(id===state.equipment?" selected":"")+'>'+title+'</option>').join("");

  function pickerItems(){
    const items=catalog().list({
      group:state.group==="all"?null:state.group,
      equipment:state.equipment==="all"?null:state.equipment,
      search:state.search
    });
    if(!items.length)return '<p class="muted">Keine passenden Übungen.</p>';
    return items.map(item=>{
      const picture=catalog().imageFor(item.id,currentSession()?.id||"");
      const src=picture?'<img src="'+attr(picture.src)+'" alt="" loading="lazy" width="62" height="62">':'';
      return '<div class="rp-plan-choice">'+src+'<span>'+safe(item.name)+'</span><button type="button" data-rp-action="add-exercise" data-exercise-id="'+attr(item.id)+'" aria-label="'+attr(item.name)+' hinzufügen">+</button></div>';
    }).join("");
  }
  function renderPicker(){
    if(!state.picker)return "";
    return '<div class="rp-plan-picker"><div class="rp-plan-filters"><input id="rpCatalogSearch" type="search" placeholder="Übung suchen" aria-label="Übung suchen" value="'+attr(state.search)+'">'+
      '<select id="rpCatalogGroup" aria-label="Muskelgruppe">'+groups()+'</select>'+
      '<select id="rpCatalogEquipment" aria-label="Geräteart">'+equipment()+'</select></div>'+
      '<div id="rpCatalogResults" class="rp-plan-choices">'+pickerItems()+'</div></div>';
  }
  function renderEditor(){
    if(!state.draft)return "";
    const s=currentSession();
    const dayTabs=state.draft.sessions.map((day,i)=>'<button type="button" class="'+(i===state.session?"selected":"secondary")+'" data-rp-action="select-session" data-index="'+i+'">'+safe(day.title)+'</button>').join("");
    const exercises=s.exercises.map((row,i)=>{
      const exercise=catalog().byId(row.exerciseId);
      const image=catalog().imageFor(row.exerciseId,s.id);
      const picture=image?'<img src="'+attr(image.src)+'" alt="" width="56" height="56" loading="lazy">':'';
      const number=(label,field,value,min,max,step)=>'<label>'+label+'<input type="number" inputmode="decimal" min="'+min+'" max="'+max+'" step="'+step+'" data-rp-field="'+field+'" data-index="'+i+'" value="'+attr(value)+'"></label>';
      return '<div class="rp-plan-exercise">'+
        '<div class="rp-plan-row">'+picture+'<strong>'+safe(exercise?.name||"Unbekannte Übung")+'</strong>'+
        '<div class="rp-plan-moves"><button type="button" class="secondary" data-rp-action="move-up" data-index="'+i+'" aria-label="Übung nach oben" '+(i===0?"disabled":"")+'>↑</button>'+
        '<button type="button" class="secondary" data-rp-action="move-down" data-index="'+i+'" aria-label="Übung nach unten" '+(i===s.exercises.length-1?"disabled":"")+'>↓</button>'+
        '<button type="button" class="secondary" data-rp-action="remove-exercise" data-index="'+i+'" aria-label="Übung entfernen">×</button></div></div>'+
        '<div class="rp-plan-fields">'+number("Sätze","sets",row.sets,1,10,1)+number("Wdh.","reps",row.reps,1,100,1)+
        number("Pause (Sek.)","restSeconds",row.restSeconds,0,600,5)+number("Gewicht (kg)","weightKg",row.weightKg,0,1000,.5)+'</div></div>';
    }).join("");
    return '<div class="rp-plan-editor">'+
      '<label>Planname<input id="rpPlanName" maxlength="80" value="'+attr(state.draft.name)+'"></label>'+
      '<div class="rp-plan-tabs">'+dayTabs+
      (state.draft.sessions.length<7?'<button type="button" class="secondary" data-rp-action="add-session">+ Tag</button>':'')+'</div>'+
      '<div class="rp-plan-day-fields"><label>Trainingstag<input id="rpSessionTitle" maxlength="80" value="'+attr(s.title)+'"></label>'+
      '<label>Wochentag<select id="rpSessionWeekday"><option value="">Flexibel</option>'+
      DAYS.map((day,idx)=>'<option value="'+idx+'"'+(idx===s.weekday?" selected":"")+'>'+day+'</option>').join("")+'</select></label></div>'+
      (state.draft.sessions.length>1?'<button type="button" class="secondary" data-rp-action="remove-session">Trainingstag entfernen</button>':'')+
      '<div class="rp-plan-exercises">'+(exercises||'<p class="muted">Noch keine Übungen. Wähle unten deine Geräte oder Übungen aus.</p>')+'</div>'+
      '<button type="button" class="rp-plan-add" data-rp-action="toggle-picker">'+(state.picker?"Übungsauswahl schließen":"+ Übung hinzufügen")+'</button>'+
      renderPicker()+
      '<div class="rp-plan-editor-actions"><button type="button" data-rp-action="save-plan">Plan speichern</button>'+
      '<button type="button" class="secondary" data-rp-action="close-editor">Zurück zu meinen Plänen</button></div></div>';
  }
  function renderOverview(){
    const list=state.plans.map(p=>
      '<article class="rp-saved-plan"><div class="rp-plan-row"><div><strong>'+safe(p.name)+'</strong><small>'+p.sessions.length+' Trainingstage</small></div>'+
      '<button class="secondary" data-rp-action="edit-plan" data-id="'+attr(p.id)+'">Bearbeiten</button></div>'+
      p.sessions.filter(s=>s.exercises.length).map(s=>
        '<div class="rp-saved-session"><span>'+safe(s.title)+' · '+s.exercises.length+' Übungen</span>'+
        '<button type="button" data-rp-action="start-session" data-id="'+attr(p.id)+'" data-session-id="'+attr(s.id)+'">Starten</button></div>').join("")+
      '<button type="button" class="rp-plan-delete" data-rp-action="delete-plan" data-id="'+attr(p.id)+'">Plan löschen</button></article>'
    ).join("");
    return '<p class="muted">Stelle dir Geräte und Übungen selbst zusammen oder nutze eine Vorlage.</p>'+
      '<button type="button" data-rp-action="new-plan" class="rp-plan-add">+ Neuen Plan erstellen</button>'+
      '<div class="rp-plan-template"><select id="rpPlanTemplate" aria-label="Trainingsvorlage">'+TEMPLATES.map(([id,name])=>'<option value="'+id+'">'+safe(name)+'</option>').join("")+'</select>'+
      '<button type="button" class="secondary" data-rp-action="from-template">Vorlage übernehmen</button></div>'+
      (list||'<p class="muted">Noch keine eigenen Pläne gespeichert.</p>')+
      '<p class="rp-plan-hint">Deine bisherigen Trainingspläne bleiben erhalten. Eigene Pläne sind vorerst nur auf diesem Gerät gespeichert.</p>';
  }
  function render(){
    if(!root)return;
    root.innerHTML='<article class="card"><div class="rp-plan-header"><div><small>TRAININGSPLAN</small><h2>Meine Pläne</h2></div>'+
      (state.draft?'<span>Bearbeiten</span>':'')+'</div>'+
      (state.draft?renderEditor():renderOverview())+
      '<p id="rpPlanStatus" role="status" aria-live="polite">'+safe(state.message)+'</p></article>';
  }
  function markChanged(){setMessage("Änderungen noch nicht gespeichert.");}
  function fromTemplate(){
    const id=root.querySelector("#rpPlanTemplate")?.value;
    const rows=window.RepPilotPlanQuality?.definitions?.[id];
    if(!Array.isArray(rows))throw new Error("Die Vorlage ist nicht verfügbar.");
    const title=TEMPLATES.find(x=>x[0]===id)?.[1]||"Training";
    const exercises=rows.map(([name,sets,weight])=>{
      const entry=catalog().byName(name);
      if(!entry)throw new Error("Übung fehlt im Katalog: "+name);
      return {exerciseId:entry.id,sets,reps:10,restSeconds:120,weightKg:weight};
    });
    state.draft={name:"Mein "+title+"-Plan",sessions:[{id:"session-1",title,weekday:null,exercises}]};
    state.session=0;state.picker=false;state.message="Vorlage übernommen. Du kannst alles ändern.";
    render();
  }
  function sessionStart(plan,sessionId){
    if(typeof WORKOUTS==="undefined"||typeof start!=="function")throw new Error("Trainingsablauf derzeit nicht verfügbar.");
    const workout=store().toWorkout(plan,sessionId);
    const idx=WORKOUTS.findIndex(w=>w.id===workout.id);
    if(idx>=0)WORKOUTS[idx]=workout;else WORKOUTS.push(workout);
    start(workout.id);
  }
  async function doAction(button){
    const action=button.dataset.rpAction;
    const idx=Number(button.dataset.index);
    const s=currentSession();
    const rows=s?.exercises;
    if(action==="new-plan"){state.draft=newPlan();state.session=0;state.picker=false;state.message="";render();return;}
    if(action==="from-template"){fromTemplate();return;}
    if(action==="edit-plan"){
      const plan=state.plans.find(p=>p.id===button.dataset.id);
      if(!plan)throw new Error("Plan nicht gefunden.");
      state.draft=copy(plan);state.session=0;state.picker=false;state.message="";render();return;
    }
    if(action==="close-editor"){if(state.message.includes("noch nicht gespeichert")&&!confirm("Ungespeicherte Änderungen verwerfen?"))return;state.draft=null;state.message="";render();return;}
    if(action==="select-session"){state.session=idx;state.picker=false;render();return;}
    if(action==="add-session"){
      const n=state.draft.sessions.length+1;
      state.draft.sessions.push({id:"session-"+Date.now().toString(36)+"-"+n,title:"Trainingstag "+n,weekday:null,exercises:[]});
      state.session=n-1;state.picker=false;markChanged();render();return;
    }
    if(action==="remove-session"){
      if(state.draft.sessions.length<=1)return;
      if(!confirm("Diesen Trainingstag entfernen?"))return;
      state.draft.sessions.splice(state.session,1);state.session=Math.max(0,state.session-1);markChanged();render();return;
    }
    if(action==="toggle-picker"){state.picker=!state.picker;render();return;}
    if(action==="add-exercise"){
      if(rows.length>=30)throw new Error("Maximal 30 Übungen je Trainingstag.");
      const entry=catalog().byId(button.dataset.exerciseId);
      if(!entry)throw new Error("Übung nicht gefunden.");
      rows.push({exerciseId:entry.id,sets:3,reps:10,restSeconds:90,weightKg:0});
      state.picker=false;state.search="";markChanged();render();return;
    }
    if(action==="move-up"&&idx>0){[rows[idx-1],rows[idx]]=[rows[idx],rows[idx-1]];markChanged();render();return;}
    if(action==="move-down"&&idx<rows.length-1){[rows[idx+1],rows[idx]]=[rows[idx],rows[idx+1]];markChanged();render();return;}
    if(action==="remove-exercise"){rows.splice(idx,1);markChanged();render();return;}
    if(action==="save-plan"){
      if(state.busy)return;
      state.busy=true;
      try{
        const saved=await store().save(state.draft);
        state.plans=await store().list();
        state.draft=copy(saved);
        setMessage("Plan gespeichert. Du kannst ihn unter Meine Pläne starten.");
        render();
      }finally{state.busy=false;}
      return;
    }
    if(action==="delete-plan"){
      if(!confirm("Trainingsplan wirklich löschen? Deine Trainingshistorie bleibt erhalten."))return;
      await store().remove(button.dataset.id);
      state.plans=await store().list();state.message="Trainingsplan gelöscht.";render();return;
    }
    if(action==="start-session"){
      const plan=state.plans.find(p=>p.id===button.dataset.id);
      if(!plan)throw new Error("Plan nicht gefunden.");
      sessionStart(plan,button.dataset.sessionId);
    }
  }
  function updateField(target){
    if(!state.draft)return;
    if(target.id==="rpPlanName"){state.draft.name=target.value;markChanged();return;}
    const s=currentSession();
    if(target.id==="rpSessionTitle"){s.title=target.value;markChanged();return;}
    if(target.id==="rpSessionWeekday"){s.weekday=target.value===""?null:Number(target.value);markChanged();return;}
    const field=target.dataset.rpField;
    if(field){
      const idx=Number(target.dataset.index);
      if(!s.exercises[idx]||!["sets","reps","restSeconds","weightKg"].includes(field))return;
      s.exercises[idx][field]=target.value===""?NaN:Number(target.value);
      markChanged();
    }
  }
  function ensureStyles(){
    if(document.getElementById("rpPlanEditorStyles"))return;
    const style=document.createElement("style");style.id="rpPlanEditorStyles";
    style.textContent=String.raw`
      #rpPlanBuilder{margin-bottom:20px}#rpPlanBuilder h2{margin:4px 0 10px}
      #rpPlanBuilder p{line-height:1.45}#rpPlanBuilder button{font-size:14px;min-height:43px}
      #rpPlanBuilder label{display:flex;flex-direction:column;gap:5px;margin:6px 0;color:#374151}
      #rpPlanBuilder input,#rpPlanBuilder select{width:100%;min-width:0;border:1px solid #cbd5e1;border-radius:11px;padding:11px;background:#fff;color:#111827;font:inherit}
      #rpPlanBuilder .rp-plan-header{display:flex;align-items:center;justify-content:space-between;gap:10px}
      #rpPlanBuilder .rp-plan-header small{font-size:11px;color:#6b7280;font-weight:900}
      #rpPlanBuilder .rp-plan-add{width:100%;margin:9px 0}
      #rpPlanBuilder .rp-plan-template{display:grid;grid-template-columns:1fr auto;gap:7px;margin:10px 0}
      #rpPlanBuilder .rp-saved-plan{border:1px solid #e5e7eb;border-radius:14px;margin:10px 0;padding:12px;background:#f9fafb}
      #rpPlanBuilder .rp-plan-row{display:flex;align-items:center;gap:10px;justify-content:space-between}
      #rpPlanBuilder .rp-plan-row strong{flex:1;overflow-wrap:anywhere}
      #rpPlanBuilder .rp-plan-row small{display:block;color:#64748b;margin-top:4px}
      #rpPlanBuilder .rp-saved-session{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:10px;border-top:1px solid #e5e7eb;padding-top:10px}
      #rpPlanBuilder .rp-plan-delete{border:0;background:none;color:#9f1239;text-decoration:underline;padding:6px;margin-top:5px}
      #rpPlanBuilder .rp-plan-hint{font-size:12px;color:#64748b}
      #rpPlanBuilder .rp-plan-tabs{display:flex;gap:6px;overflow-x:auto;padding:6px 0}
      #rpPlanBuilder .rp-plan-tabs button{white-space:nowrap}
      #rpPlanBuilder .rp-plan-tabs .selected{background:#111827;color:white}
      #rpPlanBuilder .rp-plan-day-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
      #rpPlanBuilder .rp-plan-exercise{border:1px solid #e5e7eb;border-radius:14px;padding:10px;margin:12px 0}
      #rpPlanBuilder .rp-plan-exercise img{width:56px;height:56px;object-fit:cover;border-radius:9px;background:white}
      #rpPlanBuilder .rp-plan-moves{display:flex;gap:3px}
      #rpPlanBuilder .rp-plan-moves button{padding:6px 9px;min-height:36px}
      #rpPlanBuilder .rp-plan-fields{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
      #rpPlanBuilder .rp-plan-fields label{font-size:11px}
      #rpPlanBuilder .rp-plan-fields input{padding:9px 5px}
      #rpPlanBuilder .rp-plan-picker{border:1px solid #e5e7eb;border-radius:13px;padding:9px}
      #rpPlanBuilder .rp-plan-filters{display:grid;gap:7px}
      #rpPlanBuilder .rp-plan-choices{max-height:320px;overflow:auto}
      #rpPlanBuilder .rp-plan-choice{display:flex;gap:10px;align-items:center;padding:8px;border-bottom:1px solid #e5e7eb}
      #rpPlanBuilder .rp-plan-choice img{width:62px;height:62px;object-fit:cover;border-radius:9px;background:#fff}
      #rpPlanBuilder .rp-plan-choice span{flex:1}
      #rpPlanBuilder .rp-plan-choice button{min-width:44px}
      #rpPlanBuilder .rp-plan-editor-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px}
      #rpPlanStatus{font-size:13px;color:#374151;margin:10px 0 0}
      @media(max-width:400px){#rpPlanBuilder .rp-plan-day-fields{grid-template-columns:1fr}#rpPlanBuilder .rp-plan-template{grid-template-columns:1fr}#rpPlanBuilder .rp-plan-moves button{padding:5px}}
    `;
    document.head.appendChild(style);
  }
  async function reload(){
    try{state.plans=await store().list();if(!state.draft)state.message="";render();}
    catch(error){setMessage(error?.message||"Pläne konnten nicht geladen werden.");render();}
  }
  function init(){
    const overview=document.getElementById("trainingHubOverview");
    const cards=document.getElementById("trainingHubCards");
    if(!overview||!cards||!catalog()||!store())return;
    ensureStyles();
    root=document.createElement("div");root.id="rpPlanBuilder";
    overview.insertBefore(root,cards);
    root.addEventListener("click",async event=>{
      const button=event.target.closest?.("[data-rp-action]");
      if(!button||!root.contains(button))return;
      button.disabled=true;
      try{await doAction(button);}catch(error){setMessage(error?.message||"Aktion fehlgeschlagen.");}
      finally{if(button.isConnected)button.disabled=false;}
    });
    root.addEventListener("input",event=>{
      const input=event.target;
      if(input.id==="rpCatalogSearch"){
        state.search=input.value;
        const results=root.querySelector("#rpCatalogResults");
        if(results)results.innerHTML=pickerItems();
      }else if(input.id==="rpPlanName"||input.id==="rpSessionTitle"){updateField(input);}
    });
    root.addEventListener("change",event=>{
      const input=event.target;
      if(input.id==="rpCatalogGroup"||input.id==="rpCatalogEquipment"){
        if(input.id==="rpCatalogGroup")state.group=input.value;else state.equipment=input.value;
        const results=root.querySelector("#rpCatalogResults");if(results)results.innerHTML=pickerItems();
      }else if(input.id==="rpSessionWeekday"||input.dataset.rpField){updateField(input);}
    });
    window.repPilotSupabase?.auth?.onAuthStateChange?.((_event,session)=>{if(session)reload();else{state.plans=[];state.draft=null;render();}});
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&!state.draft)reload();});
    render();reload();
  }
  window.RepPilotPlanEditor={version:VERSION,refresh:reload};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
