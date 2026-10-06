-- =====================================================================================
-- Ahd — private contacts
--
-- How to apply (once per Supabase project, after 20261006020000_deal_archive.sql):
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file -> Run.
-- The script is idempotent: running it again is safe.
--
-- Stops the global user-directory leak:
--   users_select used to be `using (true)` so every signed-in user could list every profile.
-- Contacts are now an owned list (user_id = auth.uid()). Profiles are visible only for
-- yourself and people in that list. Rows are filled when you share a deal or a pool.
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- contacts: one row per owner → other person
-- -------------------------------------------------------------------------------------
create table if not exists public.contacts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  contact_user_id uuid not null references public.users (id) on delete cascade,
  created_at      timestamptz not null default now(),
  unique (user_id, contact_user_id),
  check (user_id <> contact_user_id)
);
create index if not exists contacts_owner_idx on public.contacts (user_id);
create index if not exists contacts_person_idx on public.contacts (contact_user_id);

alter table public.contacts enable row level security;

drop policy if exists "contacts_select_own" on public.contacts;
create policy "contacts_select_own" on public.contacts for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "contacts_insert_own" on public.contacts;
create policy "contacts_insert_own" on public.contacts for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "contacts_delete_own" on public.contacts;
create policy "contacts_delete_own" on public.contacts for delete to authenticated
  using (user_id = auth.uid());

grant select, insert, delete on public.contacts to authenticated;
revoke all on public.contacts from anon;

-- -------------------------------------------------------------------------------------
-- users: drop the public directory. You see yourself + people in your contacts list.
-- -------------------------------------------------------------------------------------
drop policy if exists "users_select" on public.users;
create policy "users_select" on public.users for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from public.contacts c
      where c.user_id = auth.uid() and c.contact_user_id = users.id
    )
  );

-- -------------------------------------------------------------------------------------
-- Keep both sides of a connection in sync (bypasses RLS so each owner gets a row).
-- -------------------------------------------------------------------------------------
create or replace function public.add_contact_pair(a uuid, b uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if a is null or b is null or a = b then
    return;
  end if;
  insert into public.contacts (user_id, contact_user_id) values (a, b)
  on conflict (user_id, contact_user_id) do nothing;
  insert into public.contacts (user_id, contact_user_id) values (b, a)
  on conflict (user_id, contact_user_id) do nothing;
end;
$$;

create or replace function public.sync_contacts_from_deal_participant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  other uuid;
begin
  if new.user_id is null then
    return new;
  end if;
  for other in
    select p.user_id
      from public.deal_participants p
     where p.deal_id = new.deal_id
       and p.user_id is not null
       and p.user_id <> new.user_id
  loop
    perform public.add_contact_pair(new.user_id, other);
  end loop;
  return new;
end;
$$;

drop trigger if exists contacts_after_deal_participant on public.deal_participants;
create trigger contacts_after_deal_participant
  after insert or update of user_id on public.deal_participants
  for each row execute function public.sync_contacts_from_deal_participant();

create or replace function public.sync_contacts_from_pool_contribution()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  borrower uuid;
begin
  select r.borrower_id into borrower
    from public.pool_qarz_requests r
   where r.id = new.request_id;
  perform public.add_contact_pair(new.contributor_id, borrower);
  return new;
end;
$$;

drop trigger if exists contacts_after_pool_contribution on public.pool_qarz_contributions;
create trigger contacts_after_pool_contribution
  after insert on public.pool_qarz_contributions
  for each row execute function public.sync_contacts_from_pool_contribution();

-- -------------------------------------------------------------------------------------
-- Backfill from deals and pools that already exist
-- -------------------------------------------------------------------------------------
insert into public.contacts (user_id, contact_user_id)
select distinct a.user_id, b.user_id
  from public.deal_participants a
  join public.deal_participants b on b.deal_id = a.deal_id
 where a.user_id is not null
   and b.user_id is not null
   and a.user_id <> b.user_id
on conflict (user_id, contact_user_id) do nothing;

insert into public.contacts (user_id, contact_user_id)
select distinct r.borrower_id, c.contributor_id
  from public.pool_qarz_contributions c
  join public.pool_qarz_requests r on r.id = c.request_id
 where r.borrower_id <> c.contributor_id
on conflict (user_id, contact_user_id) do nothing;

insert into public.contacts (user_id, contact_user_id)
select distinct c.contributor_id, r.borrower_id
  from public.pool_qarz_contributions c
  join public.pool_qarz_requests r on r.id = c.request_id
 where r.borrower_id <> c.contributor_id
on conflict (user_id, contact_user_id) do nothing;

insert into public.contacts (user_id, contact_user_id)
select distinct r.borrower_id, invited.id
  from public.pool_qarz_requests r
  cross join lateral unnest(r.invited_ids) as invited(id)
 where invited.id is not null and invited.id <> r.borrower_id
on conflict (user_id, contact_user_id) do nothing;

insert into public.contacts (user_id, contact_user_id)
select distinct invited.id, r.borrower_id
  from public.pool_qarz_requests r
  cross join lateral unnest(r.invited_ids) as invited(id)
 where invited.id is not null and invited.id <> r.borrower_id
on conflict (user_id, contact_user_id) do nothing;
