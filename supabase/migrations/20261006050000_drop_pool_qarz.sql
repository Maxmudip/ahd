-- =====================================================================================
-- Ahd — drop Pool Qarz
--
-- How to apply (after 20261006040000_add_contact_by_email.sql):
--   Supabase Dashboard -> SQL Editor -> paste this file -> Run.
-- Idempotent. Safe if the tables were never created.
-- =====================================================================================

drop trigger if exists contacts_after_pool_contribution on public.pool_qarz_contributions;
drop trigger if exists pool_contributions_after on public.pool_qarz_contributions;
drop trigger if exists pool_contributions_validate on public.pool_qarz_contributions;
drop trigger if exists pool_requests_touch on public.pool_qarz_requests;

drop function if exists public.sync_contacts_from_pool_contribution();
drop function if exists public.after_contribution();
drop function if exists public.validate_contribution();
drop function if exists public.can_view_pool(uuid);

do $$
begin
  begin
    execute 'alter publication supabase_realtime drop table public.pool_qarz_contributions';
  exception
    when undefined_object then null;
    when undefined_table then null;
  end;
  begin
    execute 'alter publication supabase_realtime drop table public.pool_qarz_requests';
  exception
    when undefined_object then null;
    when undefined_table then null;
  end;
end;
$$;

drop table if exists public.pool_qarz_contributions;
drop table if exists public.pool_qarz_requests;
