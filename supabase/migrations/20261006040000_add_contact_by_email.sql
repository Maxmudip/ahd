-- =====================================================================================
-- Ahd — add a contact by email
--
-- How to apply (after 20261006030000_contacts.sql):
--   Supabase Dashboard -> SQL Editor -> paste this file -> Run.
-- Idempotent.
--
-- find_user_by_email: look up one profile by exact email without opening the user directory.
-- add_contact_pair:   caller must be one of the two people; writes both rows (user_id + reverse).
-- =====================================================================================

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
  -- Triggers also call this. The signed-in user must be one side of the pair.
  if auth.uid() is not null and auth.uid() is distinct from a and auth.uid() is distinct from b then
    raise exception 'Kontaktni faqat o''zingiz qo''sha olasiz' using errcode = '42501';
  end if;
  insert into public.contacts (user_id, contact_user_id) values (a, b)
  on conflict (user_id, contact_user_id) do nothing;
  insert into public.contacts (user_id, contact_user_id) values (b, a)
  on conflict (user_id, contact_user_id) do nothing;
end;
$$;

create or replace function public.find_user_by_email(p_email text)
returns table (id uuid, full_name text, email text, phone text)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  needle text := lower(trim(coalesce(p_email, '')));
begin
  if needle = '' then
    return;
  end if;
  return query
    select u.id, u.full_name, u.email, u.phone
      from public.users u
     where u.email is not null
       and lower(trim(u.email)) = needle
     limit 1;
end;
$$;

revoke all on function public.add_contact_pair(uuid, uuid) from public, anon;
grant execute on function public.add_contact_pair(uuid, uuid) to authenticated;

revoke all on function public.find_user_by_email(text) from public, anon;
grant execute on function public.find_user_by_email(text) to authenticated;
