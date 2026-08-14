import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" }
});

const finiteOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const intOrNull = (value: unknown) => {
  const n = finiteOrNull(value);
  return n === null ? null : Math.round(n);
};

Deno.serve(async (req: Request) => {
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return json({ error: "missing_authorization" }, 401);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const token = authHeader.replace(/^Bearer\s+/i, "");
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user) return json({ error: "invalid_token" }, 401);

  if (req.method === "GET") {
    const { data, error, count } = await admin
      .from("apple_workouts")
      .select("id,healthkit_uuid,activity_type,started_at,finished_at,duration_seconds,distance_km,active_energy_kcal,avg_heart_rate_bpm,max_heart_rate_bpm,step_count,cadence_spm,avg_speed_mps,running_power_w,stride_length_m,ground_contact_ms,vertical_oscillation_cm,elevation_gain_m,route_available,source_name,device_model", { count: "exact" })
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(100);
    if (error) return json({ error: "read_failed", message: error.message }, 500);
    return json({ count: count || 0, workouts: data || [] });
  }

  let payload: any;
  try { payload = await req.json(); }
  catch { return json({ error: "invalid_json" }, 400); }

  const workouts = Array.isArray(payload?.workouts) ? payload.workouts : [];
  if (!workouts.length) return json({ error: "no_workouts" }, 400);
  if (workouts.length > 100) return json({ error: "too_many_workouts", max: 100 }, 413);

  const rows = [];
  for (const item of workouts) {
    const uuid = String(item?.healthkit_uuid || "").trim();
    const startedAt = String(item?.started_at || "").trim();
    const finishedAt = String(item?.finished_at || "").trim();
    const duration = intOrNull(item?.duration_seconds);
    if (!uuid || uuid.length > 200 || !startedAt || !finishedAt || !duration || duration <= 0) {
      return json({ error: "invalid_workout", healthkit_uuid: uuid || null }, 400);
    }
    const startMs = Date.parse(startedAt), finishMs = Date.parse(finishedAt);
    if (!Number.isFinite(startMs) || !Number.isFinite(finishMs) || finishMs <= startMs) {
      return json({ error: "invalid_dates", healthkit_uuid: uuid }, 400);
    }

    rows.push({
      user_id: user.id,
      healthkit_uuid: uuid,
      activity_type: String(item?.activity_type || "running").slice(0, 50),
      source_name: item?.source_name ? String(item.source_name).slice(0, 200) : null,
      source_bundle_id: item?.source_bundle_id ? String(item.source_bundle_id).slice(0, 250) : null,
      device_model: item?.device_model ? String(item.device_model).slice(0, 200) : null,
      started_at: new Date(startMs).toISOString(),
      finished_at: new Date(finishMs).toISOString(),
      duration_seconds: duration,
      distance_km: finiteOrNull(item?.distance_km),
      active_energy_kcal: finiteOrNull(item?.active_energy_kcal),
      avg_heart_rate_bpm: finiteOrNull(item?.avg_heart_rate_bpm),
      max_heart_rate_bpm: finiteOrNull(item?.max_heart_rate_bpm),
      step_count: intOrNull(item?.step_count),
      cadence_spm: finiteOrNull(item?.cadence_spm),
      avg_speed_mps: finiteOrNull(item?.avg_speed_mps),
      running_power_w: finiteOrNull(item?.running_power_w),
      stride_length_m: finiteOrNull(item?.stride_length_m),
      ground_contact_ms: finiteOrNull(item?.ground_contact_ms),
      vertical_oscillation_cm: finiteOrNull(item?.vertical_oscillation_cm),
      elevation_gain_m: finiteOrNull(item?.elevation_gain_m),
      route_available: Boolean(item?.route_available),
      metadata: item?.metadata && typeof item.metadata === "object" && !Array.isArray(item.metadata) ? item.metadata : {}
    });
  }

  const { data, error } = await admin
    .from("apple_workouts")
    .upsert(rows, { onConflict: "user_id,healthkit_uuid" })
    .select("id,healthkit_uuid,started_at");

  if (error) return json({ error: "import_failed", message: error.message }, 500);
  return json({ imported: data?.length || 0, workouts: data || [] });
});
