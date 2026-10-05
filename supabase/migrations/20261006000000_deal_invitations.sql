-- =====================================================================================
-- Ahd — deal invitations
--
-- How to apply (once per Supabase project, after 20261003000000_init.sql):
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file -> Run.
-- The script is idempotent: running it again is safe.
--
-- Adds:
--   deal_rooms.initiator_role     who started the deal (mijoz / ijrochi / qarz_beruvchi / qarz_oluvchi)
--   deal_rooms.status             extra values: pending (waiting on invitee), rejected
--                                 existing values stay: draft | discussion | signing | completed
--                                 After accept, status becomes 'discussion' (the open chat).
--   deal_invitations              one invite per send; invitee is not a participant until they accept
--   respond_to_deal_invitation()  accept / reject (SECURITY DEFINER, so the invitee can join)
-- =====================================================================================

-- -------------------------------------------------------------------------------------
-- deal_rooms: role + extra statuses
-- -------------------------------------------------------------------------------------
alter table public.deal_rooms
  add column if not exists initiator_role text;

do $$
begin
  alter table public.deal_rooms drop constraint if exists deal_rooms_initiator_role_check;
  alter table public.deal_rooms
    add constraint deal_rooms_initiator_role_check
    check (initiator_role is null or initiator_role in ('mijoz', 'ijrochi', 'qarz_beruvchi', 'qarz_oluvchi'));
exception
  when duplicate_object then null;
end $$;

alter table public.deal_rooms drop constraint if exists deal_rooms_status_check;
alter table public.deal_rooms
  add constraint deal_rooms_status_check
  check (status in ('draft', 'discussion', 'signing', 'completed', 'pending', 'rejected'));

-- -------------------------------------------------------------------------------------
-- deal_invitations
-- -------------------------------------------------------------------------------------
create table if not exists public.deal_invitations (
  id               uuid primary key default gen_random_uuid(),
  deal_room_id     uuid not null references public.deal_rooms (id) on delete cascade,
  invited_email    text not null,
  invited_user_id  uuid references public.users (id) on delete set null,
  status           text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at       timestamptz not null default now(),
  responded_at     timestamptz
);
create index if not exists deal_invitations_deal_idx on public.deal_invitations (deal_room_id, created_at desc);
create index if not exists deal_invitations_user_idx on public.deal_invitations (invited_user_id);
create index if not exists deal_invitations_email_idx on public.deal_invitations (lower(invited_email));
-- One outstanding invite per room (a rejected invite can be followed by a new pending one).
create unique index if not exists deal_invitations_one_pending
  on public.deal_invitations (deal_room_id) where status = 'pending';

-- -------------------------------------------------------------------------------------
-- Helpers
-- -------------------------------------------------------------------------------------
create or replace function public.is_deal_invitee(p_deal uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.deal_invitations i
    join public.users u on u.id = auth.uid()
    where i.deal_room_id = p_deal
      and i.status = 'pending'
      and (
        i.invited_user_id = auth.uid()
        or (u.email is not null and lower(i.invited_email) = lower(u.email))
      )
  );
$$;

-- Invitees can see the room (title / kind) so the invitation card can render, but not its messages
-- until they accept (messages still require is_deal_member).
drop policy if exists "deal_rooms_select" on public.deal_rooms;
create policy "deal_rooms_select" on public.deal_rooms for select to authenticated
  using (public.is_deal_member(id) or public.is_deal_invitee(id));

-- -------------------------------------------------------------------------------------
-- Accept / reject. Invitees are not members yet, so this must run as SECURITY DEFINER.
-- -------------------------------------------------------------------------------------
create or replace function public.respond_to_deal_invitation(p_invite uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inv       public.deal_invitations;
  room      public.deal_rooms;
  me_id     uuid := auth.uid();
  me_email  text;
  me_name   text;
  other_role text;
begin
  if me_id is null then
    raise exception 'Avval tizimga kiring' using errcode = '42501';
  end if;

  select * into inv from public.deal_invitations where id = p_invite for update;
  if not found then
    raise exception 'Taklif topilmadi';
  end if;
  if inv.status <> 'pending' then
    raise exception 'Bu taklif allaqachon javoblangan';
  end if;

  select email, full_name into me_email, me_name from public.users where id = me_id;
  if inv.invited_user_id is distinct from me_id
     and (me_email is null or lower(inv.invited_email) is distinct from lower(me_email)) then
    raise exception 'Bu taklif sizga emas' using errcode = '42501';
  end if;

  select * into room from public.deal_rooms where id = inv.deal_room_id for update;
  if not found then
    raise exception 'Kelishuv topilmadi';
  end if;

  update public.deal_invitations
     set status = case when p_accept then 'accepted' else 'rejected' end,
         responded_at = now(),
         invited_user_id = coalesce(invited_user_id, me_id)
   where id = p_invite;

  if not p_accept then
    update public.deal_rooms set status = 'rejected' where id = room.id;
    return;
  end if;

  other_role := case room.initiator_role
    when 'mijoz' then 'Ijrochi'
    when 'ijrochi' then 'Mijoz'
    when 'qarz_beruvchi' then 'Qarz oluvchi'
    when 'qarz_oluvchi' then 'Qarz beruvchi'
    else 'Tomon B'
  end;

  if not exists (
    select 1 from public.deal_participants p where p.deal_id = room.id and p.user_id = me_id
  ) then
    insert into public.deal_participants (deal_id, user_id, name, role, position)
    values (
      room.id,
      me_id,
      coalesce(nullif(me_name, ''), split_part(coalesce(me_email, ''), '@', 1), 'Foydalanuvchi'),
      other_role,
      1
    );
  end if;

  update public.deal_rooms set status = 'discussion' where id = room.id;

  insert into public.messages (deal_id, sender_id, author_name, kind, body)
  values (
    room.id,
    null,
    'Tizim',
    'system',
    coalesce(nullif(me_name, ''), split_part(coalesce(me_email, ''), '@', 1), 'Ishtirokchi')
      || ' kelishuvni qabul qildi. Chat boshlandi! 🎉'
  );
end;
$$;

revoke all on function public.respond_to_deal_invitation(uuid, boolean) from public, anon;
grant execute on function public.respond_to_deal_invitation(uuid, boolean) to authenticated;

-- -------------------------------------------------------------------------------------
-- RLS
-- -------------------------------------------------------------------------------------
alter table public.deal_invitations enable row level security;

drop policy if exists "deal_invitations_select" on public.deal_invitations;
create policy "deal_invitations_select" on public.deal_invitations for select to authenticated
  using (
    public.is_deal_member(deal_room_id)
    or invited_user_id = auth.uid()
    or exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.email is not null and lower(u.email) = lower(invited_email)
    )
  );

drop policy if exists "deal_invitations_insert" on public.deal_invitations;
create policy "deal_invitations_insert" on public.deal_invitations for insert to authenticated
  with check (public.is_deal_member(deal_room_id) and status = 'pending');

-- Invitees accept/reject through respond_to_deal_invitation(), not a direct UPDATE.

grant select, insert on public.deal_invitations to authenticated;
revoke all on public.deal_invitations from anon;

-- -------------------------------------------------------------------------------------
-- Realtime
-- -------------------------------------------------------------------------------------
do $$
begin
  execute 'alter publication supabase_realtime add table public.deal_invitations';
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;
