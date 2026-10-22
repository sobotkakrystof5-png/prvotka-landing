-- supabase/tests/rls_invoices.test.sql   (spouští: supabase test db)
-- Šablona pgTAP testů izolace tenantů pro tabulku public.invoices.
-- Předpoklad: schéma z vizeon-sec-supabase/references/rls-patterns.sql.

begin;
create extension if not exists pgtap with schema extensions;

select plan(16);

-- ---------- Fixtures (jako superuser, RLS se neuplatní) ----------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'owner-a@test.local'),
  ('00000000-0000-0000-0000-00000000000b', 'viewer-a@test.local'),
  ('00000000-0000-0000-0000-00000000000c', 'owner-b@test.local'),
  ('00000000-0000-0000-0000-00000000000d', 'disabled-a@test.local');

insert into public.organizations (id, name) values
  ('aaaaaaaa-0000-0000-0000-000000000000', 'Firma A'),
  ('bbbbbbbb-0000-0000-0000-000000000000', 'Firma B');

insert into public.memberships (org_id, user_id, role, status) values
  ('aaaaaaaa-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000000a', 'owner',  'active'),
  ('aaaaaaaa-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000000b', 'viewer', 'active'),
  ('bbbbbbbb-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000000c', 'owner',  'active'),
  ('aaaaaaaa-0000-0000-0000-000000000000', '00000000-0000-0000-0000-00000000000d', 'user',   'disabled');

insert into public.invoices (id, org_id, number, customer_id, amount_cents, created_by) values
  ('11111111-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000000', 'A-1',
   gen_random_uuid(), 10000, '00000000-0000-0000-0000-00000000000a');

-- Pomocná procedura pro přepnutí identity
create or replace function pg_temp.login(p_sub uuid, p_aal text default 'aal2') returns void
language plpgsql as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_sub, 'role', 'authenticated', 'aal', p_aal)::text, true);
end $$;

-- ---------- 1) anon ----------
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok($$ select count(*) from public.invoices $$, '42501', null, 'anon: nemá ani SELECT grant');
reset role;

-- ---------- 2) owner firmy A ----------
select pg_temp.login('00000000-0000-0000-0000-00000000000a');
select is((select count(*)::int from public.invoices), 1, 'owner A vidí fakturu A');
select lives_ok($$ update public.invoices set amount_cents = 20000 where id = '11111111-0000-0000-0000-000000000000' $$,
  'owner A smí upravit draft');
select throws_ok($$ update public.invoices set org_id = 'bbbbbbbb-0000-0000-0000-000000000000'
                    where id = '11111111-0000-0000-0000-000000000000' $$,
  '42501', null, 'org_id nelze změnit (grant po sloupcích / trigger)');
select throws_ok($$ update public.invoices set status = 'paid' where id = '11111111-0000-0000-0000-000000000000' $$,
  '42501', null, 'status=paid nesmí měnit klient');
reset role;

-- ---------- 3) uživatel cizí firmy B ----------
select pg_temp.login('00000000-0000-0000-0000-00000000000c');
select is((select count(*)::int from public.invoices), 0, 'owner B nevidí faktury A');
select is((select count(*)::int from public.invoices where id = '11111111-0000-0000-0000-000000000000'), 0,
  'owner B nevidí fakturu A ani přímo podle ID (IDOR)');
update public.invoices set amount_cents = 1 where id = '11111111-0000-0000-0000-000000000000';
delete from public.invoices where id = '11111111-0000-0000-0000-000000000000';
select throws_ok($$ insert into public.invoices (org_id, number, customer_id, amount_cents)
                    values ('aaaaaaaa-0000-0000-0000-000000000000', 'X-1', gen_random_uuid(), 1) $$,
  '42501', null, 'owner B nevloží fakturu do firmy A');
select throws_ok($$ select public.change_member_role('aaaaaaaa-0000-0000-0000-000000000000',
                    '00000000-0000-0000-0000-00000000000c', 'owner') $$,
  '42501', null, 'owner B si nedá roli ve firmě A');
reset role;

-- ověření jako superuser (vidí vše): pokusy firmy B nesměly mít efekt
select is((select count(*)::int from public.invoices where id = '11111111-0000-0000-0000-000000000000'), 1,
  'faktura A stále existuje po pokusu o smazání firmou B');
select is((select amount_cents from public.invoices where id = '11111111-0000-0000-0000-000000000000'), 20000::bigint,
  'částka faktury A nebyla firmou B změněna');

-- ---------- 4) viewer firmy A ----------
select pg_temp.login('00000000-0000-0000-0000-00000000000b');
select is((select count(*)::int from public.invoices), 1, 'viewer A čte');
select throws_ok($$ insert into public.invoices (org_id, number, customer_id, amount_cents, created_by)
                    values ('aaaaaaaa-0000-0000-0000-000000000000', 'A-2', gen_random_uuid(), 1,
                            '00000000-0000-0000-0000-00000000000b') $$,
  '42501', null, 'viewer nesmí vytvářet');
reset role;

-- ---------- 5) deaktivovaný člen ----------
select pg_temp.login('00000000-0000-0000-0000-00000000000d');
select is((select count(*)::int from public.invoices), 0, 'deaktivovaný člen nevidí nic');
reset role;

-- ---------- 6) AAL1 (bez MFA) ----------
select pg_temp.login('00000000-0000-0000-0000-00000000000a', 'aal1');
select is((select count(*)::int from public.invoices), 0, 'bez MFA (aal1) žádná data');
reset role;

-- ---------- 7) funkce nejsou volatelné anonymně ----------
select ok(not has_function_privilege('anon', 'public.change_member_role(uuid, uuid, public.org_role)', 'EXECUTE'),
  'anon nemá EXECUTE na change_member_role');

select * from finish();
rollback;
