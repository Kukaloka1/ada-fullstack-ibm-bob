-- ADA Hackathon MVP seed data
-- Safe to re-run during `supabase db reset`

insert into public.ada_workspaces (id, name)
values ('00000000-0000-4000-8000-000000000001', 'ADA Hackathon MVP')
on conflict (id) do nothing;
