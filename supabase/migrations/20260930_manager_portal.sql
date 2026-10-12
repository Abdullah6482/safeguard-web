-- Manager portal backend guarantees. Apply after the mobile reliability migration.

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references public.incidents(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  event_type text not null,
  from_status public.incident_status,
  to_status public.incident_status,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_incident_created_idx
  on public.audit_events(incident_id, created_at desc);

alter table public.audit_events enable row level security;
drop policy if exists "Managers and investigators can read audit events" on public.audit_events;
create policy "Managers and investigators can read audit events"
  on public.audit_events for select to authenticated
  using (exists (
    select 1 from public.profiles p where p.id = auth.uid()
      and p.role in ('investigator'::public.user_role, 'manager'::public.user_role)
  ));
revoke all on table public.audit_events from anon;
grant select on table public.audit_events to authenticated;

-- Managers need portfolio visibility for the real leaderboard.
drop policy if exists "Managers can view all safety points" on public.safety_points;
create policy "Managers can view all safety points"
  on public.safety_points for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'manager'::public.user_role
  ));

create or replace function public.manager_decide_incident(
  p_incident_id uuid,
  p_decision text,
  p_notes text,
  p_expected_updated_at timestamptz
) returns public.incidents
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor public.profiles;
  v_before public.incidents;
  v_after public.incidents;
  v_status public.incident_status;
begin
  select * into v_actor from public.profiles where id = auth.uid();
  if v_actor.id is null or v_actor.role <> 'manager'::public.user_role then
    raise exception 'Manager role required' using errcode = '42501';
  end if;
  if p_decision not in ('approve', 'return', 'escalate') then
    raise exception 'Invalid manager decision' using errcode = '22023';
  end if;
  if p_decision in ('return', 'escalate') and length(trim(coalesce(p_notes, ''))) < 10 then
    raise exception 'A decision rationale of at least 10 characters is required' using errcode = '22023';
  end if;

  select * into v_before from public.incidents where id = p_incident_id for update;
  if v_before.id is null then raise exception 'Incident not found' using errcode = 'P0002'; end if;
  if v_before.status <> 'manager_review'::public.incident_status then
    raise exception 'Incident is no longer awaiting manager review' using errcode = '40001';
  end if;
  if v_before.updated_at is distinct from p_expected_updated_at then
    raise exception 'Incident changed after it was opened; refresh before deciding' using errcode = '40001';
  end if;

  v_status := case p_decision when 'approve' then 'closed'::public.incident_status when 'return' then 'under_investigation'::public.incident_status else 'manager_review'::public.incident_status end;
  update public.incidents set status=v_status, manager_id=auth.uid(), manager_decision=p_decision,
    manager_notes=nullif(trim(coalesce(p_notes,'')),''), closed_at=case when p_decision='approve' then now() else null end,
    updated_at=now() where id=p_incident_id returning * into v_after;

  insert into public.audit_events(incident_id,actor_id,event_type,from_status,to_status,details)
  values(p_incident_id,auth.uid(),'manager_decision',v_before.status,v_after.status,jsonb_build_object('decision',p_decision,'notes',coalesce(p_notes,'')));
  return v_after;
end;
$$;

revoke all on function public.manager_decide_incident(uuid,text,text,timestamptz) from public;
grant execute on function public.manager_decide_incident(uuid,text,text,timestamptz) to authenticated;

-- Enable live incident refresh if the table is not already published.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='incidents') then
    alter publication supabase_realtime add table public.incidents;
  end if;
end $$;
