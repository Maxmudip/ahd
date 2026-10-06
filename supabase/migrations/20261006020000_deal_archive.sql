-- =====================================================================================
-- Ahd — deal archive
--
-- How to apply (once, after previous migrations):
--   Supabase Dashboard -> SQL Editor -> paste this file -> Run.
-- Idempotent: safe to run again.
--
-- Adds deal_rooms.archived (boolean). Archived rooms stay in the database and
-- appear only in the app's "Arxiv" tab. This is not a status — discussion /
-- signing / completed / disputed stay as they are.
-- =====================================================================================

alter table public.deal_rooms
  add column if not exists archived boolean not null default false;

create index if not exists deal_rooms_archived_idx
  on public.deal_rooms (archived, updated_at desc);
