create table if not exists public.strength_battles (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  challenger_id uuid not null references auth.users(id) on delete cascade,
  opponent_id uuid references auth.users(id) on delete cascade,
  exercise text not null check (char_length(exercise) between 2 and 100),
  challenger_name text not null,
  opponent_name text,
  status text not null default 'pending' check (status in ('pending','active','completed','cancelled')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  deadline_at timestamptz not null,
  check (opponent_id is null or opponent_id <> challenger_id)
);

create table if not exists public.strength_battle_results (
  battle_id uuid not null references public.strength_battles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  estimated_1rm numeric(8,2) not null check (estimated_1rm > 0),
  relative_score numeric(8,3) not null check (relative_score > 0),
  reps integer not null check (reps between 1 and 5),
  test_weight numeric(8,2) not null check (test_weight > 0),
  measured_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (battle_id, user_id)
);

create index if not exists strength_battles_challenger_idx on public.strength_battles(challenger_id, created_at desc);
create index if not exists strength_battles_opponent_idx on public.strength_battles(opponent_id, created_at desc);
create index if not exists strength_battles_deadline_idx on public.strength_battles(deadline_at);
create index if not exists strength_battle_results_user_idx on public.strength_battle_results(user_id);

alter table public.strength_battles enable row level security;
alter table public.strength_battle_results enable row level security;

create policy "battle participants can read battles"
on public.strength_battles for select
to authenticated
using ((select auth.uid()) = challenger_id or (select auth.uid()) = opponent_id);

create policy "battle participants can read results"
on public.strength_battle_results for select
to authenticated
using (
  exists (
    select 1 from public.strength_battles b
    where b.id = battle_id
      and ((select auth.uid()) = b.challenger_id or (select auth.uid()) = b.opponent_id)
  )
);

revoke all on public.strength_battles from anon, authenticated;
revoke all on public.strength_battle_results from anon, authenticated;
grant select on public.strength_battles to authenticated;
grant select on public.strength_battle_results to authenticated;

create or replace function public.create_strength_battle(p_exercise text, p_days integer default 7)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_name text;
  v_code text;
  v_id uuid;
  v_days integer := greatest(1, least(coalesce(p_days, 7), 14));
begin
  if v_user is null then raise exception 'Anmeldung erforderlich'; end if;
  if char_length(trim(coalesce(p_exercise, ''))) not between 2 and 100 then
    raise exception 'Ungültige Übung';
  end if;
  if p_exercise like 'home::%' or p_exercise = '__strength_cycle__' then
    raise exception 'Diese Übung ist für gewichtete Duelle nicht verfügbar';
  end if;

  select nullif(trim(display_name), '') into v_name
  from public.profiles where id = v_user;
  v_name := coalesce(v_name, 'Sportler');

  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.strength_battles where invite_code = v_code);
  end loop;

  insert into public.strength_battles (
    invite_code, challenger_id, exercise, challenger_name, deadline_at
  ) values (
    v_code, v_user, trim(p_exercise), v_name, now() + make_interval(days => v_days)
  ) returning id into v_id;

  return jsonb_build_object('id', v_id, 'invite_code', v_code);
end;
$$;

create or replace function public.accept_strength_battle(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_name text;
  v_battle public.strength_battles%rowtype;
begin
  if v_user is null then raise exception 'Anmeldung erforderlich'; end if;
  select nullif(trim(display_name), '') into v_name
  from public.profiles where id = v_user;
  v_name := coalesce(v_name, 'Sportler');

  select * into v_battle
  from public.strength_battles
  where invite_code = upper(trim(coalesce(p_code, '')))
  for update;

  if not found then raise exception 'Einladungscode nicht gefunden'; end if;
  if v_battle.challenger_id = v_user then raise exception 'Das ist dein eigenes Duell'; end if;
  if v_battle.opponent_id is not null then raise exception 'Dieses Duell ist bereits besetzt'; end if;
  if v_battle.deadline_at <= now() then raise exception 'Dieses Duell ist abgelaufen'; end if;

  update public.strength_battles
  set opponent_id = v_user,
      opponent_name = v_name,
      accepted_at = now(),
      status = 'active'
  where id = v_battle.id;

  return jsonb_build_object('id', v_battle.id, 'exercise', v_battle.exercise);
end;
$$;

create or replace function public.submit_strength_battle_result(p_battle_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_battle public.strength_battles%rowtype;
  v_measurement public.strength_measurements%rowtype;
  v_name text;
  v_bodyweight numeric;
  v_relative numeric;
  v_result_count integer;
begin
  if v_user is null then raise exception 'Anmeldung erforderlich'; end if;

  select * into v_battle from public.strength_battles where id = p_battle_id for update;
  if not found or (v_battle.challenger_id <> v_user and v_battle.opponent_id <> v_user) then
    raise exception 'Duell nicht gefunden';
  end if;
  if v_battle.status not in ('active', 'completed') or v_battle.opponent_id is null then
    raise exception 'Das Duell wurde noch nicht angenommen';
  end if;
  if v_battle.deadline_at <= now() then raise exception 'Das Duell ist abgelaufen'; end if;

  select nullif(trim(display_name), ''), weight_kg
  into v_name, v_bodyweight
  from public.profiles where id = v_user;
  if v_bodyweight is null or v_bodyweight < 30 or v_bodyweight > 300 then
    raise exception 'Bitte zuerst ein gültiges Körpergewicht im Profil speichern';
  end if;
  v_name := coalesce(v_name, case when v_user = v_battle.challenger_id then v_battle.challenger_name else v_battle.opponent_name end, 'Sportler');

  select * into v_measurement
  from public.strength_measurements
  where user_id = v_user
    and exercise = v_battle.exercise
    and mode = 'weight'
    and estimated_1rm > 0
    and measured_at >= coalesce(v_battle.accepted_at, v_battle.created_at)
    and measured_at <= v_battle.deadline_at
  order by measured_at desc
  limit 1;
  if not found then raise exception 'Noch keine passende Kraftmessung seit Duellstart vorhanden'; end if;

  v_relative := round((v_measurement.estimated_1rm / v_bodyweight)::numeric, 3);
  insert into public.strength_battle_results (
    battle_id, user_id, display_name, estimated_1rm, relative_score,
    reps, test_weight, measured_at
  ) values (
    v_battle.id, v_user, v_name, v_measurement.estimated_1rm, v_relative,
    v_measurement.reps, v_measurement.test_weight, v_measurement.measured_at
  )
  on conflict (battle_id, user_id) do update set
    display_name = excluded.display_name,
    estimated_1rm = excluded.estimated_1rm,
    relative_score = excluded.relative_score,
    reps = excluded.reps,
    test_weight = excluded.test_weight,
    measured_at = excluded.measured_at,
    created_at = now();

  select count(*) into v_result_count from public.strength_battle_results where battle_id = v_battle.id;
  update public.strength_battles
  set status = case when v_result_count >= 2 then 'completed' else 'active' end
  where id = v_battle.id;

  return jsonb_build_object(
    'battle_id', v_battle.id,
    'estimated_1rm', v_measurement.estimated_1rm,
    'relative_score', v_relative,
    'complete', v_result_count >= 2
  );
end;
$$;

revoke all on function public.create_strength_battle(text, integer) from public, anon;
revoke all on function public.accept_strength_battle(text) from public, anon;
revoke all on function public.submit_strength_battle_result(uuid) from public, anon;
grant execute on function public.create_strength_battle(text, integer) to authenticated;
grant execute on function public.accept_strength_battle(text) to authenticated;
grant execute on function public.submit_strength_battle_result(uuid) to authenticated;

comment on table public.strength_battles is 'Private 1v1 strength challenges visible only to both participants.';
comment on table public.strength_battle_results is 'Sanitized battle scores; bodyweight is deliberately never stored here.';
