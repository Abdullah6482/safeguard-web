-- SafeGuard production hardening. Apply after 20260930_manager_portal.sql.
-- Moves privileged workflow transitions behind validated, audited RPCs.

alter table public.incidents
  add column if not exists escalation_status text,
  add column if not exists escalated_at timestamptz;

alter table public.incidents enable row level security;
alter table public.safety_points enable row level security;

do $$ begin
  alter table public.incidents add constraint incidents_escalation_status_check
    check (escalation_status is null or escalation_status in ('open', 'resolved'));
exception when duplicate_object then null;
end $$;

create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;
revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

-- Remove legacy permissive policies so they cannot OR with hardened policies.
do $$ declare p record;
begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='incidents'
  loop execute format('drop policy %I on public.incidents', p.policyname); end loop;
  for p in select policyname from pg_policies where schemaname='public' and tablename='safety_points'
  loop execute format('drop policy %I on public.safety_points', p.policyname); end loop;
end $$;

create policy "Role-scoped incident visibility" on public.incidents
for select to authenticated using (
  reporter_id = auth.uid() or public.current_user_role() in ('investigator', 'manager')
);

create policy "Reporters create their own reports" on public.incidents
for insert to authenticated with check (
  public.current_user_role() = 'reporter'
  and reporter_id = auth.uid()
  and status = 'reported'
  and manager_id is null and manager_decision is null and closed_at is null
  and root_cause_category is null and root_cause_detail is null
  and capa_action is null and capa_status is null
  and overall_risk is null
);

create policy "Users read permitted safety points" on public.safety_points
for select to authenticated using (
  user_id = auth.uid() or public.current_user_role() = 'manager'
);

revoke update, delete on public.incidents from authenticated;
grant select, insert on public.incidents to authenticated;
revoke insert, update, delete on public.safety_points from authenticated;
grant select on public.safety_points to authenticated;

create or replace function public.claim_incident(
  p_incident_id uuid,
  p_expected_updated_at timestamptz
) returns public.incidents
language plpgsql security definer set search_path = public
as $$
declare v_actor public.profiles; v_before public.incidents; v_after public.incidents;
begin
  select * into v_actor from public.profiles where id=auth.uid();
  if v_actor.role is distinct from 'investigator' then raise exception 'Investigator role required' using errcode='42501'; end if;
  select * into v_before from public.incidents where id=p_incident_id for update;
  if v_before.id is null then raise exception 'Incident not found' using errcode='P0002'; end if;
  if v_before.updated_at is distinct from p_expected_updated_at then raise exception 'Incident changed; refresh and try again' using errcode='40001'; end if;
  if v_before.status = 'under_investigation' and v_before.investigator_id = auth.uid() then
    return v_before;
  end if;
  if v_before.status <> 'reported' or (v_before.investigator_id is not null and v_before.investigator_id <> auth.uid()) then
    raise exception 'Incident is not available to claim' using errcode='40001';
  end if;
  update public.incidents set investigator_id=auth.uid(), status='under_investigation', updated_at=now()
    where id=p_incident_id returning * into v_after;
  insert into public.audit_events(incident_id,actor_id,event_type,from_status,to_status,details)
    values(p_incident_id,auth.uid(),'investigation_claimed',v_before.status,v_after.status,'{}');
  return v_after;
end $$;

create or replace function public.submit_investigation(
  p_incident_id uuid, p_expected_updated_at timestamptz,
  p_pillar_people text, p_pillar_asset text, p_pillar_environment text, p_pillar_reputation text,
  p_overall_risk text, p_root_cause_category text, p_root_cause_detail text,
  p_capa_action text, p_capa_owner uuid, p_capa_due_date date,
  p_forwarded_to_hospital text, p_impact_working_days integer, p_investigator_notes text
) returns public.incidents
language plpgsql security definer set search_path = public
as $$
declare v_actor public.profiles; v_before public.incidents; v_after public.incidents; v_points integer;
begin
  select * into v_actor from public.profiles where id=auth.uid();
  if v_actor.role is distinct from 'investigator' then raise exception 'Investigator role required' using errcode='42501'; end if;
  if p_overall_risk not in ('Low','Medium','High') then raise exception 'Invalid overall risk' using errcode='22023'; end if;
  if length(trim(coalesce(p_root_cause_detail,''))) < 15 or length(trim(coalesce(p_capa_action,''))) < 15 then
    raise exception 'Root cause and CAPA require at least 15 characters' using errcode='22023';
  end if;
  if p_capa_due_date < current_date then raise exception 'CAPA due date cannot be in the past' using errcode='22023'; end if;
  if not exists(select 1 from public.profiles where id=p_capa_owner and role in ('investigator','manager')) then
    raise exception 'Invalid CAPA owner' using errcode='22023';
  end if;
  select * into v_before from public.incidents where id=p_incident_id for update;
  if v_before.id is null then raise exception 'Incident not found' using errcode='P0002'; end if;
  if v_before.status <> 'under_investigation' or v_before.investigator_id <> auth.uid() then
    raise exception 'Only the assigned investigator can submit this investigation' using errcode='42501';
  end if;
  if v_before.updated_at is distinct from p_expected_updated_at then raise exception 'Incident changed; refresh and try again' using errcode='40001'; end if;

  update public.incidents set
    pillar_people=p_pillar_people, pillar_asset=p_pillar_asset,
    pillar_environment=p_pillar_environment, pillar_reputation=p_pillar_reputation,
    overall_risk=p_overall_risk, root_cause_category=trim(p_root_cause_category),
    root_cause_detail=trim(p_root_cause_detail), capa_action=trim(p_capa_action),
    capa_owner=p_capa_owner, capa_due_date=p_capa_due_date, capa_status='pending',
    forwarded_to_hospital=p_forwarded_to_hospital, impact_working_days=coalesce(p_impact_working_days,0),
    investigator_notes=nullif(trim(coalesce(p_investigator_notes,'')),''),
    status='manager_review', updated_at=now()
  where id=p_incident_id returning * into v_after;

  v_points := case p_overall_risk when 'High' then 50 when 'Medium' then 25 else 10 end;
  if v_before.reporter_id is not null then
    insert into public.safety_points(user_id,incident_id,points,reason)
      values(v_before.reporter_id,p_incident_id,v_points,'Report Verified ('||p_overall_risk||' Risk)')
      on conflict (incident_id) where incident_id is not null do nothing;
  end if;
  insert into public.audit_events(incident_id,actor_id,event_type,from_status,to_status,details)
    values(p_incident_id,auth.uid(),'investigation_submitted',v_before.status,v_after.status,
      jsonb_build_object('overall_risk',p_overall_risk,'capa_owner',p_capa_owner,'capa_due_date',p_capa_due_date));
  return v_after;
end $$;

create or replace function public.transition_capa(
  p_incident_id uuid, p_status text, p_expected_updated_at timestamptz
) returns public.incidents
language plpgsql security definer set search_path = public
as $$
declare v_actor public.profiles; v_before public.incidents; v_after public.incidents;
begin
  select * into v_actor from public.profiles where id=auth.uid();
  if v_actor.role is distinct from 'manager' then raise exception 'Manager role required' using errcode='42501'; end if;
  if p_status not in ('pending','in_progress','completed') then raise exception 'Invalid CAPA status' using errcode='22023'; end if;
  select * into v_before from public.incidents where id=p_incident_id for update;
  if v_before.id is null or v_before.capa_action is null then raise exception 'CAPA not found' using errcode='P0002'; end if;
  if v_before.updated_at is distinct from p_expected_updated_at then raise exception 'CAPA changed; refresh and try again' using errcode='40001'; end if;
  if v_before.capa_status='completed' and p_status <> 'completed' then raise exception 'Completed CAPA cannot be reopened here' using errcode='22023'; end if;
  update public.incidents set capa_status=p_status, updated_at=now() where id=p_incident_id returning * into v_after;
  insert into public.audit_events(incident_id,actor_id,event_type,from_status,to_status,details)
    values(p_incident_id,auth.uid(),'capa_status_changed',v_before.status,v_after.status,
      jsonb_build_object('from',v_before.capa_status,'to',p_status));
  return v_after;
end $$;

-- Replace the manager function to make escalation a distinct, queryable workflow.
create or replace function public.manager_decide_incident(
  p_incident_id uuid, p_decision text, p_notes text, p_expected_updated_at timestamptz
) returns public.incidents
language plpgsql security definer set search_path = public
as $$
declare v_actor public.profiles; v_before public.incidents; v_after public.incidents; v_status public.incident_status;
begin
  select * into v_actor from public.profiles where id=auth.uid();
  if v_actor.role is distinct from 'manager' then raise exception 'Manager role required' using errcode='42501'; end if;
  if p_decision not in ('approve','return','escalate') then raise exception 'Invalid manager decision' using errcode='22023'; end if;
  if p_decision in ('return','escalate') and length(trim(coalesce(p_notes,''))) < 10 then raise exception 'A rationale of at least 10 characters is required' using errcode='22023'; end if;
  select * into v_before from public.incidents where id=p_incident_id for update;
  if v_before.id is null then raise exception 'Incident not found' using errcode='P0002'; end if;
  if v_before.status <> 'manager_review' or v_before.escalation_status='open' then raise exception 'Incident is no longer awaiting a standard manager decision' using errcode='40001'; end if;
  if v_before.updated_at is distinct from p_expected_updated_at then raise exception 'Incident changed; refresh before deciding' using errcode='40001'; end if;
  v_status := case p_decision when 'approve' then 'closed' when 'return' then 'under_investigation' else 'manager_review' end;
  update public.incidents set status=v_status, manager_id=auth.uid(), manager_decision=p_decision,
    manager_notes=nullif(trim(coalesce(p_notes,'')),''),
    closed_at=case when p_decision='approve' then now() else null end,
    escalation_status=case when p_decision='escalate' then 'open' else null end,
    escalated_at=case when p_decision='escalate' then now() else null end,
    updated_at=now() where id=p_incident_id returning * into v_after;
  insert into public.audit_events(incident_id,actor_id,event_type,from_status,to_status,details)
    values(p_incident_id,auth.uid(),case when p_decision='escalate' then 'incident_escalated' else 'manager_decision' end,
      v_before.status,v_after.status,jsonb_build_object('decision',p_decision,'notes',coalesce(p_notes,'')));
  return v_after;
end $$;

create or replace function public.resolve_escalation(
  p_incident_id uuid, p_resolution text, p_notes text, p_expected_updated_at timestamptz
) returns public.incidents
language plpgsql security definer set search_path = public
as $$
declare v_actor public.profiles; v_before public.incidents; v_after public.incidents; v_status public.incident_status;
begin
  select * into v_actor from public.profiles where id=auth.uid();
  if v_actor.role is distinct from 'manager' then raise exception 'Manager role required' using errcode='42501'; end if;
  if p_resolution not in ('approve','return') then raise exception 'Invalid escalation resolution' using errcode='22023'; end if;
  if length(trim(coalesce(p_notes,''))) < 10 then raise exception 'A resolution rationale of at least 10 characters is required' using errcode='22023'; end if;
  select * into v_before from public.incidents where id=p_incident_id for update;
  if v_before.id is null then raise exception 'Incident not found' using errcode='P0002'; end if;
  if v_before.escalation_status is distinct from 'open' then raise exception 'Escalation is not open' using errcode='40001'; end if;
  if v_before.updated_at is distinct from p_expected_updated_at then raise exception 'Incident changed; refresh before resolving' using errcode='40001'; end if;
  v_status := case p_resolution when 'approve' then 'closed' else 'under_investigation' end;
  update public.incidents set status=v_status, manager_id=auth.uid(), manager_decision=p_resolution,
    manager_notes=trim(p_notes), closed_at=case when p_resolution='approve' then now() else null end,
    escalation_status='resolved', updated_at=now() where id=p_incident_id returning * into v_after;
  insert into public.audit_events(incident_id,actor_id,event_type,from_status,to_status,details)
    values(p_incident_id,auth.uid(),'escalation_resolved',v_before.status,v_after.status,
      jsonb_build_object('resolution',p_resolution,'notes',p_notes));
  return v_after;
end $$;

revoke all on function public.claim_incident(uuid,timestamptz) from public;
revoke all on function public.submit_investigation(uuid,timestamptz,text,text,text,text,text,text,text,text,uuid,date,text,integer,text) from public;
revoke all on function public.transition_capa(uuid,text,timestamptz) from public;
revoke all on function public.manager_decide_incident(uuid,text,text,timestamptz) from public;
revoke all on function public.resolve_escalation(uuid,text,text,timestamptz) from public;
grant execute on function public.claim_incident(uuid,timestamptz) to authenticated;
grant execute on function public.submit_investigation(uuid,timestamptz,text,text,text,text,text,text,text,text,uuid,date,text,integer,text) to authenticated;
grant execute on function public.transition_capa(uuid,text,timestamptz) to authenticated;
grant execute on function public.manager_decide_incident(uuid,text,text,timestamptz) to authenticated;
grant execute on function public.resolve_escalation(uuid,text,text,timestamptz) to authenticated;
