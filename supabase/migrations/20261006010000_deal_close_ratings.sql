-- =====================================================================================
-- Ahd — deal completion, disputes, ratings
--
-- How to apply (once per Supabase project, after 20261006000000_deal_invitations.sql):
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file -> Run.
-- The script is idempotent: running it again is safe.
--
-- Adds:
--   deal_rooms.status             extra value: disputed
--   deal_rooms.completion_*       current close request + timestamps
--   messages.kind                 extra values: completion, mojaro
--   ratings                       one review per rater per deal
--   users.avg_rating / totals     denormalized profile stats (kept by triggers)
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- users: public rating stats
-- -------------------------------------------------------------------------------------
alter table public.users add column if not exists avg_rating numeric(3,1);
alter table public.users add column if not exists total_deals integer not null default 0;
alter table public.users add column if not exists total_ratings integer not null default 0;

-- -------------------------------------------------------------------------------------
-- deal_rooms: close request + timestamps + disputed status
-- -------------------------------------------------------------------------------------
alter table public.deal_rooms add column if not exists completion_reason text;
alter table public.deal_rooms add column if not exists completion_requested_by uuid references public.users (id) on delete set null;
alter table public.deal_rooms add column if not exists completion_status text;
alter table public.deal_rooms add column if not exists completed_at timestamptz;
alter table public.deal_rooms add column if not exists disputed_at timestamptz;

do $$
begin
  alter table public.deal_rooms drop constraint if exists deal_rooms_completion_reason_check;
  alter table public.deal_rooms
    add constraint deal_rooms_completion_reason_check
    check (completion_reason is null or completion_reason in ('success', 'mutual', 'dispute'));
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.deal_rooms drop constraint if exists deal_rooms_completion_status_check;
  alter table public.deal_rooms
    add constraint deal_rooms_completion_status_check
    check (completion_status is null or completion_status in ('pending', 'accepted', 'rejected'));
exception
  when duplicate_object then null;
end $$;

alter table public.deal_rooms drop constraint if exists deal_rooms_status_check;
alter table public.deal_rooms
  add constraint deal_rooms_status_check
  check (status in ('draft', 'discussion', 'signing', 'completed', 'pending', 'rejected', 'disputed'));

-- -------------------------------------------------------------------------------------
-- messages: completion card + dispute position
-- -------------------------------------------------------------------------------------
alter table public.messages drop constraint if exists messages_kind_check;
alter table public.messages
  add constraint messages_kind_check
  check (kind in ('text', 'ai', 'file', 'agreement', 'signature', 'system', 'completion', 'mojaro'));

-- -------------------------------------------------------------------------------------
-- ratings
-- -------------------------------------------------------------------------------------
create table if not exists public.ratings (
  id            uuid primary key default gen_random_uuid(),
  deal_room_id  uuid not null references public.deal_rooms (id) on delete cascade,
  rater_id      uuid not null references public.users (id) on delete cascade,
  rated_id      uuid not null references public.users (id) on delete cascade,
  rating        integer not null check (rating >= 1 and rating <= 5),
  comment       text not null default '',
  created_at    timestamptz not null default now(),
  unique (deal_room_id, rater_id)
);
create index if not exists ratings_rated_idx on public.ratings (rated_id, created_at desc);
create index if not exists ratings_deal_idx on public.ratings (deal_room_id);

alter table public.ratings enable row level security;

drop policy if exists "ratings_select" on public.ratings;
create policy "ratings_select" on public.ratings for select to authenticated
  using (
    rater_id = auth.uid()
    or rated_id = auth.uid()
    or public.is_deal_member(deal_room_id)
  );

drop policy if exists "ratings_insert" on public.ratings;
create policy "ratings_insert" on public.ratings for insert to authenticated
  with check (
    rater_id = auth.uid()
    and rater_id <> rated_id
    and public.is_deal_member(deal_room_id)
    and exists (
      select 1 from public.deal_rooms r
      where r.id = deal_room_id and r.status = 'completed'
    )
  );

grant select, insert on public.ratings to authenticated;
revoke all on public.ratings from anon;

-- -------------------------------------------------------------------------------------
-- Keep users.avg_rating / total_ratings in sync
-- -------------------------------------------------------------------------------------
create or replace function public.refresh_user_rating_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users u
     set avg_rating = stats.avg,
         total_ratings = stats.n
    from (
      select
        rated_id,
        round(avg(rating)::numeric, 1) as avg,
        count(*)::integer as n
      from public.ratings
      where rated_id = new.rated_id
      group by rated_id
    ) stats
   where u.id = stats.rated_id;
  return new;
end;
$$;

drop trigger if exists ratings_refresh_stats on public.ratings;
create trigger ratings_refresh_stats
  after insert on public.ratings
  for each row execute function public.refresh_user_rating_stats();

-- Count a completed deal once, for every participant with an account.
create or replace function public.bump_user_total_deals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    update public.users
       set total_deals = total_deals + 1
     where id in (
       select user_id from public.deal_participants
       where deal_id = new.id and user_id is not null
     );
  end if;
  return new;
end;
$$;

drop trigger if exists deal_rooms_bump_total_deals on public.deal_rooms;
create trigger deal_rooms_bump_total_deals
  after update of status on public.deal_rooms
  for each row execute function public.bump_user_total_deals();

-- -------------------------------------------------------------------------------------
-- Realtime
-- -------------------------------------------------------------------------------------
do $$
begin
  execute 'alter publication supabase_realtime add table public.ratings';
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
