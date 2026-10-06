-- =====================================================================================
-- Ahd — initial schema
--
-- How to apply (once per Supabase project):
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file -> Run.
-- The script is idempotent: running it again is safe.
--
-- Tables
--   users                     profile row per auth user (created automatically on sign-up)
--   deal_rooms                one chat per deal (kelishuv / qarz)
--   deal_participants         people (or external parties) in a deal room + their signature
--   messages                  chat messages of a deal room (text, ai, file, agreement, signature, system)
--   agreements                the AI-generated agreement document of a deal room
--
-- Security: row level security is ON for every table. A user only sees deal rooms they take part in.
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- users (profiles)
-- -------------------------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, phone)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles for accounts that were created before this migration.
insert into public.users (id, full_name, email, phone)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(u.email, ''), '@', 1)),
  u.email,
  nullif(u.raw_user_meta_data ->> 'phone', '')
from auth.users u
on conflict (id) do nothing;

-- -------------------------------------------------------------------------------------
-- deal_rooms
-- -------------------------------------------------------------------------------------
create table if not exists public.deal_rooms (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  counterparty  text not null default '',
  kind          text not null default 'kelishuv' check (kind in ('kelishuv', 'qarz')),
  status        text not null default 'discussion' check (status in ('draft', 'discussion', 'signing', 'completed')),
  created_by    uuid not null default auth.uid() references public.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists deal_rooms_created_by_idx on public.deal_rooms (created_by);
create index if not exists deal_rooms_updated_at_idx on public.deal_rooms (updated_at desc);

-- -------------------------------------------------------------------------------------
-- deal_participants
-- user_id is NULL for external parties (a company or a phone number without an Ahd account).
-- -------------------------------------------------------------------------------------
create table if not exists public.deal_participants (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.deal_rooms (id) on delete cascade,
  user_id     uuid references public.users (id) on delete set null,
  name        text not null,
  role        text not null default '',
  position    integer not null default 0,
  signed_at   timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists deal_participants_deal_idx on public.deal_participants (deal_id, position);
create index if not exists deal_participants_user_idx on public.deal_participants (user_id);
create unique index if not exists deal_participants_deal_user_uniq
  on public.deal_participants (deal_id, user_id) where user_id is not null;

-- -------------------------------------------------------------------------------------
-- messages
-- -------------------------------------------------------------------------------------
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  deal_id      uuid not null references public.deal_rooms (id) on delete cascade,
  sender_id    uuid references public.users (id) on delete set null,
  author_name  text not null default '',
  kind         text not null default 'text' check (kind in ('text', 'ai', 'file', 'agreement', 'signature', 'system')),
  body         text not null default '',
  created_at   timestamptz not null default now()
);
create index if not exists messages_deal_created_idx on public.messages (deal_id, created_at);

-- -------------------------------------------------------------------------------------
-- agreements (one per deal room)
-- -------------------------------------------------------------------------------------
create table if not exists public.agreements (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null unique references public.deal_rooms (id) on delete cascade,
  doc_number    text not null,
  title         text not null default 'KELISHUV SHARTNOMASI',
  subject       text not null default '',
  clauses       jsonb not null default '[]'::jsonb,
  parties       jsonb not null default '[]'::jsonb,
  issued_at     date not null default current_date,
  generated_at  timestamptz not null default now(),
  created_by    uuid default auth.uid() references public.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

-- -------------------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so policies do not recurse into each other)
-- -------------------------------------------------------------------------------------
create or replace function public.is_deal_member(p_deal uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.deal_rooms r where r.id = p_deal and r.created_by = auth.uid())
      or exists (select 1 from public.deal_participants p where p.deal_id = p_deal and p.user_id = auth.uid());
$$;

-- -------------------------------------------------------------------------------------
-- Triggers
-- -------------------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists deal_rooms_touch on public.deal_rooms;
create trigger deal_rooms_touch before update on public.deal_rooms
  for each row execute function public.touch_updated_at();

-- A new message moves its deal room to the top of everybody's list.
create or replace function public.bump_deal_room()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.deal_rooms set updated_at = greatest(updated_at, new.created_at) where id = new.deal_id;
  return new;
end;
$$;

drop trigger if exists messages_bump_room on public.messages;
create trigger messages_bump_room after insert on public.messages
  for each row execute function public.bump_deal_room();

-- You can only sign for yourself. Parties without an Ahd account (user_id is null) are signed by a
-- member of the room on their behalf.
create or replace function public.guard_signature()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.signed_at is distinct from old.signed_at
     and old.user_id is not null
     and old.user_id is distinct from auth.uid() then
    raise exception 'Bu imzoni faqat % qo''ya oladi', old.name using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists deal_participants_guard on public.deal_participants;
create trigger deal_participants_guard before update on public.deal_participants
  for each row execute function public.guard_signature();

-- -------------------------------------------------------------------------------------
-- Row level security
-- -------------------------------------------------------------------------------------
alter table public.users                    enable row level security;
alter table public.deal_rooms               enable row level security;
alter table public.deal_participants        enable row level security;
alter table public.messages                 enable row level security;
alter table public.agreements               enable row level security;

-- users: every signed-in user can see profiles (contacts list); you can only change your own.
drop policy if exists "users_select" on public.users;
create policy "users_select" on public.users for select to authenticated using (true);
drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self" on public.users for insert to authenticated with check (id = auth.uid());
drop policy if exists "users_update_self" on public.users;
create policy "users_update_self" on public.users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- deal_rooms
drop policy if exists "deal_rooms_select" on public.deal_rooms;
create policy "deal_rooms_select" on public.deal_rooms for select to authenticated
  using (public.is_deal_member(id));
drop policy if exists "deal_rooms_insert" on public.deal_rooms;
create policy "deal_rooms_insert" on public.deal_rooms for insert to authenticated
  with check (created_by = auth.uid());
drop policy if exists "deal_rooms_update" on public.deal_rooms;
create policy "deal_rooms_update" on public.deal_rooms for update to authenticated
  using (public.is_deal_member(id)) with check (public.is_deal_member(id));
drop policy if exists "deal_rooms_delete" on public.deal_rooms;
create policy "deal_rooms_delete" on public.deal_rooms for delete to authenticated
  using (created_by = auth.uid());

-- deal_participants
drop policy if exists "deal_participants_select" on public.deal_participants;
create policy "deal_participants_select" on public.deal_participants for select to authenticated
  using (public.is_deal_member(deal_id));
drop policy if exists "deal_participants_insert" on public.deal_participants;
create policy "deal_participants_insert" on public.deal_participants for insert to authenticated
  with check (public.is_deal_member(deal_id));
drop policy if exists "deal_participants_update" on public.deal_participants;
create policy "deal_participants_update" on public.deal_participants for update to authenticated
  using (public.is_deal_member(deal_id)) with check (public.is_deal_member(deal_id));
drop policy if exists "deal_participants_delete" on public.deal_participants;
create policy "deal_participants_delete" on public.deal_participants for delete to authenticated
  using (public.is_deal_member(deal_id));

-- messages
drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select to authenticated
  using (public.is_deal_member(deal_id));
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert to authenticated
  with check (public.is_deal_member(deal_id) and (sender_id is null or sender_id = auth.uid()));
drop policy if exists "messages_delete" on public.messages;
create policy "messages_delete" on public.messages for delete to authenticated
  using (public.is_deal_member(deal_id));

-- agreements
drop policy if exists "agreements_select" on public.agreements;
create policy "agreements_select" on public.agreements for select to authenticated
  using (public.is_deal_member(deal_id));
drop policy if exists "agreements_insert" on public.agreements;
create policy "agreements_insert" on public.agreements for insert to authenticated
  with check (public.is_deal_member(deal_id));
drop policy if exists "agreements_update" on public.agreements;
create policy "agreements_update" on public.agreements for update to authenticated
  using (public.is_deal_member(deal_id)) with check (public.is_deal_member(deal_id));

-- -------------------------------------------------------------------------------------
-- Privileges: signed-in users only (anonymous visitors get nothing).
-- -------------------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
  public.users, public.deal_rooms, public.deal_participants, public.messages, public.agreements
to authenticated;
revoke all on
  public.users, public.deal_rooms, public.deal_participants, public.messages, public.agreements
from anon;

-- -------------------------------------------------------------------------------------
-- Realtime: live chat for every participant.
-- -------------------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'messages', 'deal_rooms', 'deal_participants', 'agreements'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception
      when duplicate_object then null;   -- already in the publication
      when undefined_object then null;   -- publication does not exist (not on Supabase)
    end;
  end loop;
end;
$$;
