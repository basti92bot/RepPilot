(() => {
  const VERSION="11.8.117";
  const SOURCE_COMMIT="8f25d055e243b882aa05acaa66c2c51b1a9fc2d1";
  const BASE="https://raw.githubusercontent.com/RepDB/exercise-dataset/"+SOURCE_COMMIT+"/images/flat/";

  const MAP={
    "Bauch Rotation":{id:"russian-twist"},
    "Beinbeuger":{id:"leg-curl"},
    "Beinheben":{id:"lying-leg-raise"},
    "Beinpresse":{id:"leg-press"},
    "Beinstrecker":{id:"leg-extension"},
    "Bergsteiger":{id:"mountain-climbers"},
    "Brustgestütztes Rudern":{id:"chest-supported-db-row"},
    "Brustpresse":{id:"chest-press-machine"},
    "Crunch-Maschine":{id:"machine-seated-crunch"},
    "Diagonales Arm-Bein-Strecken":{id:"bird-dog"},
    "Diagonales Arm-Bein-Strecken im Vierfüßlerstand":{id:"bird-dog"},
    "Einarmiger Trizeps am Kabelzug":{id:"single-arm-tricep-pushdown"},
    "Einbeiniges Hüftheben":{id:"single-leg-glute-bridge"},
    "Enge Liegestütze":{id:"close-grip-push-ups"},
    "Hammercurls":{id:"hammer-curl"},
    "Hängendes Beinheben":{id:"hanging-leg-raise"},
    "Hüftheben":{id:"glute-bridge"},
    "Hüftheben mit Beinwechsel":{id:"single-leg-glute-bridge"},
    "Kabel-Flys":{id:"cable-fly"},
    "Kniebeugen":{id:"bodyweight-squat"},
    "Latzug breit":{id:"lat-pulldown"},
    "Latzug neutral":{id:"v-bar-lat-pulldown"},
    "Liegestütze bis Maximum":{id:"push-up"},
    "Rückenstrecker in Bauchlage":{id:"superman"},
    "Rückwärts-Ausfallschritte":{id:"reverse-lunge"},
    "Schrägbank-Curls":{id:"incline-db-curl"},
    "Schrägbankdrücken":{id:"incline-bench-press"},
    "Schrägbankdrücken leicht":{id:"incline-bench-press"},
    "Schulter-Liegestütze":{id:"pike-push-ups"},
    "Schulterpresse":{id:"machine-shoulder-press"},
    "Scott-Curls":{id:"preacher-curl"},
    "Seitheben":{id:"lateral-raise"},
    "Seitheben Maschine":{id:"plate-loaded-lateral-raise"},
    "Seitheben am Kabelzug":{id:"cable-lateral-raise"},
    "Seitstütz":{id:"side-plank",main:true},
    "Stationäre Ausfallschritte":{id:"split-squat"},
    "Tempo-Kniebeugen":{id:"bodyweight-squat"},
    "Trizepsdrücken am Seilzug":{id:"tricep-pushdown"},
    "Unterarmstütz":{id:"plank",main:true},
    "Wadenheben":{id:"machine-calf-raise"}
  };

  const INTENTIONAL_MISSING=new Set([
    "Reverse Butterfly am Kabelzug",
    "Schneeengel in Bauchlage",
    "Y-T-Heben in Bauchlage",
    "Überkopf-Trizepsstrecken am Kabelzug"
  ]);

  function ensureStyles(){
    if(document.getElementById("repPilotExerciseImageStyles"))return;
    const style=document.createElement("style");
    style.id="repPilotExerciseImageStyles";
    style.textContent=`
      #repPilotExerciseImageCard{max-width:360px;margin:12px auto 14px;border:1px solid var(--line,#e5e7eb);border-radius:18px;overflow:hidden;background:#f8fafc;box-shadow:0 4px 14px rgba(17,24,39,.05)}
      #repPilotExerciseImageViewport{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line,#e5e7eb)}
      #repPilotExerciseImageViewport.single{grid-template-columns:1fr}
      .repPilotExercisePose{width:100%;aspect-ratio:1/1;display:block;object-fit:contain;background:#fff}
      #repPilotExerciseImageLabel{display:block;padding:8px 10px 10px;text-align:center;color:var(--muted,#6b7280);font-size:11px;font-weight:800}
      @media(max-width:390px){#repPilotExerciseImageCard{max-width:330px}}
    `;
    document.head.appendChild(style);
  }

  function ensureCard(){
    const panel=document.getElementById("setPanel");
    const title=panel?.querySelector(".exercise-title");
    if(!panel||!title)return null;
    ensureStyles();
    let card=document.getElementById("repPilotExerciseImageCard");
    if(card)return card;
    card=document.createElement("div");
    card.id="repPilotExerciseImageCard";
    card.hidden=true;
    card.innerHTML='<div id="repPilotExerciseImageViewport"></div><small id="repPilotExerciseImageLabel"></small>';
    title.insertAdjacentElement("afterend",card);
    return card;
  }

  function imageUrl(id,pose){
    return BASE+id+"-"+pose+".webp";
  }

  function renderImage(viewport,name,id,pose){
    const img=document.createElement("img");
    img.className="repPilotExercisePose";
    img.src=imageUrl(id,pose);
    img.alt=name+" "+(pose==="start"?"Startposition":pose==="peak"?"Endposition":"Ausführung");
    img.decoding="async";
    img.loading="eager";
    img.width=512;
    img.height=512;
    img.onerror=()=>{
      img.hidden=true;
      const visible=[...viewport.querySelectorAll("img")].some(x=>!x.hidden);
      if(!visible)viewport.closest("#repPilotExerciseImageCard").hidden=true;
    };
    viewport.appendChild(img);
  }

  function refresh(){
    const card=ensureCard();
    if(!card)return;
    const name=String(document.getElementById("exerciseName")?.textContent||"").trim();
    const entry=MAP[name];
    const viewport=document.getElementById("repPilotExerciseImageViewport");
    const label=document.getElementById("repPilotExerciseImageLabel");
    viewport.innerHTML="";
    viewport.classList.remove("single");

    if(!entry){
      card.hidden=true;
      return;
    }

    card.hidden=false;
    card.dataset.exercise=name;
    card.dataset.assetId=entry.id;
    label.textContent=name;

    if(entry.main){
      viewport.classList.add("single");
      renderImage(viewport,name,entry.id,"main");
    }else{
      renderImage(viewport,name,entry.id,"start");
      renderImage(viewport,name,entry.id,"peak");
    }
  }

  function audit(){
    const definitions=window.RepPilotPlanQuality?.definitions||{};
    const names=[...new Set(Object.values(definitions).flat().map(row=>row?.[0]).filter(Boolean))];
    const mapped=names.filter(name=>MAP[name]);
    const intentional=names.filter(name=>INTENTIONAL_MISSING.has(name));
    const unexpected=names.filter(name=>!MAP[name]&&!INTENTIONAL_MISSING.has(name));
    return {version:VERSION,total:names.length,mapped:mapped.length,intentionalMissing:intentional,unexpectedMissing:unexpected};
  }

  function init(){
    const name=document.getElementById("exerciseName");
    ensureCard();
    if(name)new MutationObserver(refresh).observe(name,{childList:true,subtree:true,characterData:true});
    refresh();
    setTimeout(()=>{
      const result=audit();
      if(result.unexpectedMissing.length)console.warn("RepPilot Übungsbilder fehlen unerwartet",result.unexpectedMissing);
    },0);
  }

  window.RepPilotExerciseImages={
    version:VERSION,
    source:"RepDB",
    sourceCommit:SOURCE_COMMIT,
    map:MAP,
    intentionalMissing:[...INTENTIONAL_MISSING],
    audit,
    refresh
  };

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();