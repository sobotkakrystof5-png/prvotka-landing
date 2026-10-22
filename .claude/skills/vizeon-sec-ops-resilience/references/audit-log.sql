-- =====================================================================
-- VIZEON – append-only audit log s hash řetězcem
-- Schéma "audit" NESMÍ být v Exposed schemas.
-- =====================================================================
create extension if not exists pgcrypto with schema extensions;

create schema if not exists audit;
revoke all on schema audit from public, anon, authenticated;

create table audit.events (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  org_id      uuid,
  actor_id    uuid,                 -- auth.uid() nebo null pro systém
  actor_type  text not null default 'user' check (actor_type in ('user','system','agent','webhook','admin')),
  action      text not null,        -- např. 'invoice.void', 'authz.denied'
  target_type text,
  target_id   text,
  ip          inet,
  user_agent  text,
  details     jsonb not null default '{}'::jsonb,   -- BEZ hesel, tokenů, obsahu dokumentů
  prev_hash   bytea,
  hash        bytea
);
create index on audit.events (org_id, at desc);
create index on audit.events (action, at desc);
create index on audit.events (actor_id, at desc);

revoke all on audit.events from public, anon, authenticated;

-- Hash řetězec: každý záznam obsahuje hash předchozího → smazání/úprava je detekovatelná
create or replace function audit.chain_hash()
returns trigger
language plpgsql
set search_path = ''
as $$
declare v_prev bytea;
begin
  perform pg_advisory_xact_lock(hashtext('audit.events'));
  select e.hash into v_prev from audit.events e order by e.id desc limit 1;
  new.prev_hash := v_prev;
  new.hash := extensions.digest(
    coalesce(encode(v_prev, 'hex'), '') || '|' || new.at::text || '|' || coalesce(new.org_id::text, '') || '|' ||
    coalesce(new.actor_id::text, '') || '|' || new.action || '|' || coalesce(new.target_id, '') || '|' || new.details::text,
    'sha256');
  return new;
end;
$$;

create trigger events_chain before insert on audit.events
  for each row execute function audit.chain_hash();

-- Zákaz UPDATE/DELETE/TRUNCATE (platí i pro vlastníka, dokud trigger někdo vědomě nevypne – to je samo o sobě alert)
create or replace function audit.deny_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit.events is append-only' using errcode = '42501';
end;
$$;

create trigger events_no_update before update or delete on audit.events
  for each row execute function audit.deny_change();
create trigger events_no_truncate before truncate on audit.events
  for each statement execute function audit.deny_change();

-- Zápis z aplikace: kontrolovaná funkce (actor = volající, org musí být jeho)
create or replace function public.log_event(p_org uuid, p_action text, p_target_type text, p_target_id text, p_details jsonb default '{}')
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'unauthenticated' using errcode = '42501';
  end if;
  if p_org is not null and not app.is_member(p_org) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if length(p_action) > 100 or pg_column_size(p_details) > 8192 then
    raise exception 'invalid audit payload';
  end if;
  insert into audit.events (org_id, actor_id, action, target_type, target_id, details)
  values (p_org, (select auth.uid()), p_action, p_target_type, p_target_id, coalesce(p_details, '{}'));
end;
$$;
revoke all on function public.log_event(uuid, text, text, text, jsonb) from public, anon;
grant execute on function public.log_event(uuid, text, text, text, jsonb) to authenticated;
-- Pozn.: uživatel tak může přidávat jen záznamy o sobě. Bezpečnostně důležité události
-- (authz.denied, role, export) zapisuj ze serveru/DB triggerů, ne z klienta.

-- Čtení pro ownera firmy
create or replace function public.get_audit_events(p_org uuid, p_limit int default 100, p_before bigint default null)
returns setof audit.events
language sql stable security definer
set search_path = ''
as $$
  select e.* from audit.events e
  where e.org_id = p_org
    and app.has_role(p_org, 'owner')
    and (p_before is null or e.id < p_before)
  order by e.id desc
  limit least(greatest(p_limit, 1), 500);
$$;
revoke all on function public.get_audit_events(uuid, int, bigint) from public, anon;
grant execute on function public.get_audit_events(uuid, int, bigint) to authenticated;

-- Obecný trigger pro auditování změn citlivých tabulek (bez obsahu citlivých polí)
create or replace function audit.row_change()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into audit.events (org_id, actor_id, actor_type, action, target_type, target_id, details)
  values (
    coalesce(new.org_id, old.org_id),
    (select auth.uid()),
    case when (select auth.uid()) is null then 'system' else 'user' end,
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    coalesce(new.id, old.id)::text,
    jsonb_build_object('changed_columns',
      case when tg_op = 'UPDATE' then
        (select coalesce(jsonb_agg(n.key), '[]'::jsonb) from jsonb_each(to_jsonb(new)) n
          where n.value is distinct from (to_jsonb(old) -> n.key))
      else '[]'::jsonb end)
  );
  return coalesce(new, old);
end;
$$;
revoke all on function audit.row_change() from public, anon, authenticated;
-- create trigger invoices_audit after insert or update or delete on public.invoices
--   for each row execute function audit.row_change();

-- Ověření integrity řetězce (spouštěj v monitoringu; vrací první porušený záznam)
create or replace function audit.verify_chain()
returns table (broken_id bigint)
language sql stable
set search_path = ''
as $$
  select e.id from audit.events e
  left join audit.events p on p.id = (select max(x.id) from audit.events x where x.id < e.id)
  where e.prev_hash is distinct from p.hash
  order by e.id
  limit 1;
$$;
revoke all on function audit.verify_chain() from public, anon, authenticated;
