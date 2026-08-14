create table if not exists public.apple_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  healthkit_uuid text not null,
  activity_type text not null default 'running',
  source_name text,
  source_bundle_id text,
  device_model text,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  duration_seconds integer not null check (duration_seconds > 0),
  distance_km numeric(10,3) check (distance_km is null or distance_km >= 0),
  active_energy_kcal numeric(10,2) check (active_energy_kcal is null or active_energy_kcal >= 0),
  avg_heart_rate_bpm numeric(8,2) check (avg_heart_rate_bpm is null or avg_heart_rate_bpm > 0),
  max_heart_rate_bpm numeric(8,2) check (max_heart_rate_bpm is null or max_heart_rate_bpm > 0),
  step_count integer check (step_count is null or step_count >= 0),
  cadence_spm numeric(8,2) check (cadence_spm is null or cadence_spm >= 0),
  avg_speed_mps numeric(8,3) check (avg_speed_mps is null or avg_speed_mps >= 0),
  running_power_w numeric(8,2) check (running_power_w is null or running_power_w >= 0),
  stride_length_m numeric(8,3) check (stride_length_m is null or stride_length_m >= 0),
  ground_contact_ms numeric(8,2) check (ground_contact_ms is null or ground_contact_ms >= 0),
  vertical_oscillation_cm numeric(8,2) check (vertical_oscillation_cm is null or vertical_oscillation_cm >= 0),
  elevation_gain_m numeric(10,2),
  route_available boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, healthkit_uuid)
);

create index if not exists apple_workouts_user_started_idx on public.apple_workouts(user_id, started_at desc);
create index if not exists apple_workouts_activity_idx on public.apple_workouts(user_id, activity_type, started_at desc);

alter table public.apple_workouts enable row level security;

drop policy if exists "apple_workouts_select_own" on public.apple_workouts;
create policy "apple_workouts_select_own" on public.apple_workouts
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "apple_workouts_insert_own" on public.apple_workouts;
create policy "apple_workouts_insert_own" on public.apple_workouts
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "apple_workouts_update_own" on public.apple_workouts;
create policy "apple_workouts_update_own" on public.apple_workouts
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "apple_workouts_delete_own" on public.apple_workouts;
create policy "apple_workouts_delete_own" on public.apple_workouts
for delete to authenticated using (auth.uid() = user_id);

create or replace function public.set_apple_workouts_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_apple_workouts_updated_at on public.apple_workouts;
create trigger trg_apple_workouts_updated_at
before update on public.apple_workouts
for each row execute function public.set_apple_workouts_updated_at();
