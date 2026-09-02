(() => {
  const VERSION="11.8.115";
  const SPRITE="./exercise-sprite-v11.8.114.webp?v=11.8.115";
  const COLS=7, ROWS=4;
  const MAP={
    "Bauch Rotation":15,"Beinbeuger":6,"Beinheben":16,"Beinpresse":4,"Beinstrecker":5,"Bergsteiger":27,
    "Brustgestütztes Rudern":2,"Brustpresse":0,"Crunch-Maschine":15,"Diagonales Arm-Bein-Strecken":25,
    "Diagonales Arm-Bein-Strecken im Vierfüßlerstand":25,"Einarmiger Trizeps am Kabelzug":9,"Einbeiniges Hüftheben":24,
    "Enge Liegestütze":20,"Hammercurls":8,"Hängendes Beinheben":16,"Hüftheben":24,"Hüftheben mit Beinwechsel":24,
    "Kabel-Flys":10,"Kniebeugen":22,"Latzug breit":1,"Latzug neutral":1,"Liegestütze bis Maximum":20,
    "Reverse Butterfly am Kabelzug":11,"Rückenstrecker in Bauchlage":19,"Rückwärts-Ausfallschritte":21,
    "Schneeengel in Bauchlage":11,"Schrägbank-Curls":8,"Schrägbankdrücken":13,"Schrägbankdrücken leicht":13,
    "Schulter-Liegestütze":20,"Schulterpresse":3,"Scott-Curls":8,"Seitheben":12,"Seitheben am Kabelzug":12,
    "Seitheben Maschine":12,"Seitstütz":23,"Stationäre Ausfallschritte":21,"Tempo-Kniebeugen":22,
    "Trizepsdrücken am Seilzug":9,"Überkopf-Trizepsstrecken am Kabelzug":9,"Unterarmstütz":23,"Wadenheben":7,
    "Y-T-Heben in Bauchlage":11,
    "Seitheben Kabel":12,"Overhead Cable Extension":9,"Seil-Pushdown":9,"Reverse Butterfly am Kabel":11,
    "Incline Curls":8,"Hanging Leg Raises":16,"Cross Body Cable Extension":9,"Kabelrudern":2,"Butterfly":10,
    "Reverse Butterfly":11,"Nackenheben":14,"Hüftabduktion":17,"Hüftadduktion":18,"Rückenstrecker":19
  };

  const position=index=>({
    col:index%COLS,
    row:Math.floor(index/COLS)
  });

  function ensureStyles(){
    if(document.getElementById("repPilotExerciseImageStyles"))return;
    const style=document.createElement("style");
    style.id="repPilotExerciseImageStyles";
    style.textContent=`
      #repPilotExerciseImageCard{max-width:270px;margin:12px auto 14px;border:1px solid var(--line,#e5e7eb);border-radius:18px;overflow:hidden;background:#f8fafc;box-shadow:0 4px 14px rgba(17,24,39,.05)}
      #repPilotExerciseImageViewport{width:100%;aspect-ratio:1/1;position:relative;overflow:hidden;background:#fff}
      #repPilotExerciseImageSprite{position:absolute;left:0;top:0;width:700%;height:400%;max-width:none;display:block;object-fit:fill;pointer-events:none;user-select:none}
      #repPilotExerciseImageLabel{display:block;padding:8px 10px 10px;text-align:center;color:var(--muted,#6b7280);font-size:11px;font-weight:800}
      @media(max-width:390px){#repPilotExerciseImageCard{max-width:238px}}
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
    card.innerHTML='<div id="repPilotExerciseImageViewport"><img id="repPilotExerciseImageSprite" src="'+SPRITE+'" alt="" decoding="async"></div><small id="repPilotExerciseImageLabel"></small>';
    title.insertAdjacentElement("afterend",card);
    return card;
  }

  function refresh(){
    const card=ensureCard();
    if(!card)return;
    const name=String(document.getElementById("exerciseName")?.textContent||"").trim();
    const index=MAP[name];
    if(index===undefined){card.hidden=true;return;}
    const sprite=document.getElementById("repPilotExerciseImageSprite");
    const viewport=document.getElementById("repPilotExerciseImageViewport");
    const pos=position(index);
    card.hidden=false;
    sprite.style.left=(-pos.col*100)+"%";
    sprite.style.top=(-pos.row*100)+"%";
    sprite.alt="Übungsbild "+name;
    viewport.setAttribute("role","img");
    viewport.setAttribute("aria-label","Übungsbild "+name);
    document.getElementById("repPilotExerciseImageLabel").textContent=name;
  }

  function audit(){
    const definitions=window.RepPilotPlanQuality?.definitions||{};
    const names=[...new Set(Object.values(definitions).flat().map(row=>row?.[0]).filter(Boolean))];
    const missing=names.filter(name=>MAP[name]===undefined);
    return {version:VERSION,total:names.length,mapped:names.length-missing.length,missing};
  }

  function init(){
    const name=document.getElementById("exerciseName");
    ensureCard();
    if(name)new MutationObserver(refresh).observe(name,{childList:true,subtree:true,characterData:true});
    refresh();
    setTimeout(()=>{const result=audit();if(result.missing.length)console.warn("RepPilot Übungsbilder fehlen",result.missing);},0);
  }

  window.RepPilotExerciseImages={version:VERSION,map:MAP,audit,refresh};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();