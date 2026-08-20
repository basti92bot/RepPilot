(() => {
  const VERSION = "11.8.64";
  const HISTORY_KEY = "reppilot-history-v11";
  const SYNC_KEY = "reppilot-cloud-history-sync-v1";
  let syncing = false;
  let lastSync = 0;

  const NAME_MAP = {
    "Cross Body Cable Extension":"Einarmiger Trizeps am Kabelzug",
    "Overhead Cable Extension":"Überkopf-Trizepsstrecken am Kabelzug",
    "Seil-Pushdown":"Trizepsdrücken am Seilzug",
    "Trizepsdrücken Seil":"Trizepsdrücken am Seilzug",
    "Incline Curls":"Schrägbank-Curls",
    "Reverse Butterfly am Kabel":"Reverse Butterfly am Kabelzug",
    "Preacher Curls":"Scott-Curls",
    "Hanging Leg Raises":"Hängendes Beinheben",
    "Seitheben Kabel":"Seitheben am Kabelzug",
    "Fliegende am Kabelzug":"Kabel-Flys",
    "Bauchpresse an der Maschine":"Crunch-Maschine"
  };
  const RUN_TITLES = {
    interval:"Intervalltraining",
    easy:"Lockerer Dauerlauf",
    tempo:"Tempolauf",
    long:"Langer Dauerlauf",
    recovery:"Regenerationslauf",
    running:"Lauftraining"
  };

  const readLocal = () => {
    try { const rows = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); return Array.isArray(rows) ? rows : []; }
    catch { return []; }
  };
  const writeLocal = rows => localStorage.setItem(HISTORY_KEY, JSON.stringify(rows));
  const normalizeName = name => NAME_MAP[String(name || "")] || String(name || "");
  const time = value => { const ms = Date.parse(value || ""); return Number.isFinite(ms) ? ms : 0; };
  const norm = value => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

  function logicalRun(row) {
    const km = Number(row?.distanceKm ?? row?.distance_km ?? 0);
    const sec = Number(row?.durationSeconds ?? row?.duration_seconds ?? 0);
    if (!(km > 0 && km <= 200 && sec >= 30 && sec <= 86400)) return false;
    const pace = sec / km;
    return pace >= 90 && pace <= 3600;
  }

  function logicalStrength(row) {
    if (!Array.isArray(row?.exercises) || !row.exercises.length) return false;
    return row.exercises.some(exercise => Array.isArray(exercise?.sets) && exercise.sets.some(set => set?.done !== false && Number(set?.reps || 0) > 0 && Number(set?.weight || 0) >= 0));
  }

  function cleanLocal(rows) {
    return rows.filter(row => {
      if (row?.type === "run") return logicalRun(row);
      if (Array.isArray(row?.exercises)) return logicalStrength(row);
      return true;
    });
  }

  function inferWorkoutId(title,cloudId) {
    const t = norm(title);
    if (t === "push") return "push";
    if (t.includes("pull") && t.includes("beine")) return "pull-legs";
    if (t === "oberkörper" || t.includes("oberkörper hypertroph")) return "upper-hypertrophy";
    if (t.includes("home workout a")) return "home-a";
    if (t.includes("home workout b")) return "home-b";
    if (t.includes("home workout c")) return "home-c";
    return `cloud-workout-${cloudId || "unknown"}`;
  }

  function workoutToHistory(workout, exercises, sets) {
    const exerciseRows = exercises
      .filter(e => e.workout_id === workout.id)
      .sort((a,b) => Number(a.position) - Number(b.position))
      .map(e => ({
        name: normalizeName(e.exercise_name),
        sets: sets
          .filter(s => s.workout_exercise_id === e.id)
          .sort((a,b) => Number(a.set_number) - Number(b.set_number))
          .map(s => ({
            weight: Number(s.weight || 0),
            reps: Number(s.reps || 0),
            done: true,
            completedAt: s.completed_at || workout.finished_at || null
          }))
      }))
      .filter(e => e.sets.length);

    const entry = {
      type:"strength",
      id: inferWorkoutId(workout.title,workout.id),
      source:"repilot_cloud",
      cloudId: workout.id,
      title: workout.title || "Krafttraining",
      startedAt: workout.started_at,
      finishedAt: workout.finished_at || workout.started_at,
      exercises: exerciseRows
    };
    return logicalStrength(entry) ? entry : null;
  }

  function runToHistory(row) {
    const entry = {
      type:"run",
      id:`cloud-run-${row.id}`,
      source:"repilot_cloud",
      cloudId:row.id,
      runType:row.run_type || "running",
      title:RUN_TITLES[row.run_type] || "Lauftraining",
      startedAt:row.started_at,
      finishedAt:row.finished_at || row.started_at,
      distanceKm:Number(row.distance_km || 0),
      durationSeconds:Number(row.duration_seconds || 0),
      paceSecondsPerKm:Number(row.pace_seconds_per_km || 0) || (Number(row.duration_seconds || 0) / Number(row.distance_km || 1))
    };
    return logicalRun(entry) ? entry : null;
  }

  function sameEntry(a,b) {
    if (a?.cloudId && b?.cloudId && a.cloudId === b.cloudId) return true;
    if (a?.healthkitUuid && b?.healthkitUuid && a.healthkitUuid === b.healthkitUuid) return true;
    const typeA = a?.type === "run" ? "run" : "strength";
    const typeB = b?.type === "run" ? "run" : "strength";
    if (typeA !== typeB) return false;
    const startA = time(a?.startedAt), startB = time(b?.startedAt);
    if (!startA || !startB || Math.abs(startA - startB) > 10000) return false;
    if (typeA === "run") {
      const kmA = Number(a?.distanceKm || 0), kmB = Number(b?.distanceKm || 0);
      return Math.abs(kmA - kmB) < 0.02;
    }
    return norm(a?.title) === norm(b?.title);
  }

  function mergeHistory(localRows, cloudRows) {
    const merged = cleanLocal(localRows).slice();
    for (const row of cloudRows) {
      if (!row) continue;
      if (!merged.some(existing => sameEntry(existing,row))) merged.push(row);
    }
    merged.sort((a,b) => time(a?.finishedAt || a?.startedAt) - time(b?.finishedAt || b?.startedAt));
    return merged;
  }

  async function fetchCloudRows(client,userId) {
    const [{data:workouts,error:workoutError},{data:runs,error:runError}] = await Promise.all([
      client.from("workouts").select("id,title,started_at,finished_at,total_volume").eq("user_id",userId).order("started_at",{ascending:true}).limit(500),
      client.from("runs").select("id,run_type,started_at,finished_at,distance_km,duration_seconds,pace_seconds_per_km").eq("user_id",userId).order("started_at",{ascending:true}).limit(500)
    ]);
    if (workoutError) throw workoutError;
    if (runError) throw runError;

    const workoutIds = (workouts || []).map(w => w.id);
    let exercises = [], sets = [];
    if (workoutIds.length) {
      const {data,error} = await client.from("workout_exercises").select("id,workout_id,exercise_name,position").in("workout_id",workoutIds).order("position",{ascending:true});
      if (error) throw error;
      exercises = data || [];
      const exerciseIds = exercises.map(e => e.id);
      if (exerciseIds.length) {
        const result = await client.from("workout_sets").select("id,workout_exercise_id,set_number,weight,reps,completed_at").in("workout_exercise_id",exerciseIds).order("set_number",{ascending:true});
        if (result.error) throw result.error;
        sets = result.data || [];
      }
    }

    const strength = (workouts || []).map(w => workoutToHistory(w,exercises,sets)).filter(Boolean);
    const validRuns = (runs || []).map(runToHistory).filter(Boolean);
    return [...strength,...validRuns];
  }

  async function sync({force=false}={}) {
    if (syncing) return null;
    if (!force && Date.now() - lastSync < 30000) return null;
    const client = window.repPilotSupabase;
    if (!client) return null;
    syncing = true;
    lastSync = Date.now();
    try {
      const {data,error} = await client.auth.getUser();
      if (error || !data?.user) return null;
      const cloudRows = await fetchCloudRows(client,data.user.id);
      const before = readLocal();
      const after = mergeHistory(before,cloudRows);
      writeLocal(after);
      localStorage.setItem(SYNC_KEY,JSON.stringify({at:new Date().toISOString(),cloud:cloudRows.length,before:before.length,after:after.length}));
      try { if (typeof renderHistory === "function") renderHistory(); } catch {}
      try { if (typeof renderHome === "function") renderHome(); } catch {}
      try { window.RepPilotPersonalRecords?.refresh?.(); } catch {}
      try { window.RepPilotPlanTitleFix?.refresh?.(); } catch {}
      return {cloud:cloudRows.length,before:before.length,after:after.length};
    } catch (error) {
      console.error("RepPilot Cloud-Verlauf konnte nicht geladen werden",error);
      return null;
    } finally {
      syncing = false;
    }
  }

  function init() {
    setTimeout(() => sync({force:true}),900);
    document.addEventListener("visibilitychange",() => { if (document.visibilityState === "visible") sync(); });
    window.repPilotSupabase?.auth?.onAuthStateChange?.((_event,session) => { if (session) setTimeout(() => sync({force:true}),300); });
  }

  window.RepPilotCloudHistory = {version:VERSION,sync,logicalRun,mergeHistory};
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();