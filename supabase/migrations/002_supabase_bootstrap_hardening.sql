-- ============================================================================
-- ADA Supabase Bootstrap Hardening
-- ============================================================================
--
-- Purpose:
-- - Make the ADA schema bootstrap safe and repeatable for fresh Supabase projects
-- - Patch gaps between the original MVP migration and the current app contract
-- - Preserve existing data and avoid destructive changes
--
-- Notes:
-- - Keeps server-side Supabase usage simple for the hackathon MVP
-- - Leaves RLS disabled for these tables to avoid blocking bootstrap and local testing
-- - Preserves ADA's broader mission lifecycle used by the current app
--
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.ada_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ada_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.ada_workspaces(id) on delete cascade,
  role text not null check (role in ('user', 'ada', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ada_missions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.ada_workspaces(id) on delete cascade,
  title text not null,
  objective text,
  context text,
  constraints jsonb not null default '[]'::jsonb,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'planning',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ada_artifacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.ada_workspaces(id) on delete cascade,
  mission_id uuid references public.ada_missions(id) on delete set null,
  type text not null check (
    type in (
      'plan',
      'spec',
      'bob_prompt',
      'qa_report',
      'delivery_report',
      'release_gate',
      'note'
    )
  ),
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ada_memory (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.ada_workspaces(id) on delete cascade,
  summary text not null default '',
  decisions jsonb not null default '[]'::jsonb,
  constraints jsonb not null default '[]'::jsonb,
  pending_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.ada_workspaces
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.ada_workspaces
set
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, created_at, now())
where created_at is null
   or updated_at is null;

alter table if exists public.ada_workspaces
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table if exists public.ada_messages
  add column if not exists created_at timestamptz default now();

update public.ada_messages
set created_at = coalesce(created_at, now())
where created_at is null;

alter table if exists public.ada_messages
  alter column created_at set default now();

alter table if exists public.ada_missions
  add column if not exists context text,
  add column if not exists constraints jsonb default '[]'::jsonb,
  add column if not exists acceptance_criteria jsonb default '[]'::jsonb,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.ada_missions
set
  constraints = coalesce(constraints, '[]'::jsonb),
  acceptance_criteria = coalesce(acceptance_criteria, '[]'::jsonb),
  metadata = coalesce(metadata, '{}'::jsonb),
  status = coalesce(status, 'planning'),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, created_at, now())
where constraints is null
   or acceptance_criteria is null
   or metadata is null
   or status is null
   or created_at is null
   or updated_at is null;

alter table if exists public.ada_missions
  alter column constraints set default '[]'::jsonb,
  alter column acceptance_criteria set default '[]'::jsonb,
  alter column metadata set default '{}'::jsonb,
  alter column status set default 'planning',
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table if exists public.ada_artifacts
  add column if not exists mission_id uuid,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.ada_artifacts
set
  metadata = coalesce(metadata, '{}'::jsonb),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, created_at, now())
where metadata is null
   or created_at is null
   or updated_at is null;

alter table if exists public.ada_artifacts
  alter column metadata set default '{}'::jsonb,
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table if exists public.ada_memory
  add column if not exists summary text default '',
  add column if not exists decisions jsonb default '[]'::jsonb,
  add column if not exists constraints jsonb default '[]'::jsonb,
  add column if not exists pending_items jsonb default '[]'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.ada_memory
set
  summary = coalesce(summary, ''),
  decisions = coalesce(decisions, '[]'::jsonb),
  constraints = coalesce(constraints, '[]'::jsonb),
  pending_items = coalesce(pending_items, '[]'::jsonb),
  created_at = coalesce(created_at, updated_at, now()),
  updated_at = coalesce(updated_at, created_at, now())
where summary is null
   or decisions is null
   or constraints is null
   or pending_items is null
   or created_at is null
   or updated_at is null;

alter table if exists public.ada_memory
  alter column summary set default '',
  alter column decisions set default '[]'::jsonb,
  alter column constraints set default '[]'::jsonb,
  alter column pending_items set default '[]'::jsonb,
  alter column created_at set default now(),
  alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ada_messages_role_check'
      and conrelid = 'public.ada_messages'::regclass
  ) then
    alter table public.ada_messages
      add constraint ada_messages_role_check
      check (role in ('user', 'ada', 'system')) not valid;
  end if;
end
$$;

do $$
declare
  constraint_def text;
begin
  select pg_get_constraintdef(oid)
  into constraint_def
  from pg_constraint
  where conname = 'ada_missions_status_check'
    and conrelid = 'public.ada_missions'::regclass;

  if constraint_def is null then
    alter table public.ada_missions
      add constraint ada_missions_status_check
      check (
        status in (
          'draft',
          'planning',
          'active',
          'ready',
          'in_progress',
          'review',
          'approved',
          'approved_with_conditions',
          'complete',
          'closed',
          'blocked'
        )
      ) not valid;
  elsif position('review' in constraint_def) = 0
     or position('complete' in constraint_def) = 0 then
    alter table public.ada_missions
      drop constraint ada_missions_status_check;

    alter table public.ada_missions
      add constraint ada_missions_status_check
      check (
        status in (
          'draft',
          'planning',
          'active',
          'ready',
          'in_progress',
          'review',
          'approved',
          'approved_with_conditions',
          'complete',
          'closed',
          'blocked'
        )
      ) not valid;
  end if;
end
$$;

do $$
declare
  constraint_def text;
begin
  select pg_get_constraintdef(oid)
  into constraint_def
  from pg_constraint
  where conname = 'ada_artifacts_type_check'
    and conrelid = 'public.ada_artifacts'::regclass;

  if constraint_def is null then
    alter table public.ada_artifacts
      add constraint ada_artifacts_type_check
      check (
        type in (
          'plan',
          'spec',
          'bob_prompt',
          'qa_report',
          'delivery_report',
          'release_gate',
          'note'
        )
      ) not valid;
  elsif position('note' in constraint_def) = 0 then
    alter table public.ada_artifacts
      drop constraint ada_artifacts_type_check;

    alter table public.ada_artifacts
      add constraint ada_artifacts_type_check
      check (
        type in (
          'plan',
          'spec',
          'bob_prompt',
          'qa_report',
          'delivery_report',
          'release_gate',
          'note'
        )
      ) not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ada_messages_workspace_id_fkey'
      and conrelid = 'public.ada_messages'::regclass
  ) then
    alter table public.ada_messages
      add constraint ada_messages_workspace_id_fkey
      foreign key (workspace_id)
      references public.ada_workspaces(id)
      on delete cascade
      not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ada_missions_workspace_id_fkey'
      and conrelid = 'public.ada_missions'::regclass
  ) then
    alter table public.ada_missions
      add constraint ada_missions_workspace_id_fkey
      foreign key (workspace_id)
      references public.ada_workspaces(id)
      on delete cascade
      not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ada_artifacts_workspace_id_fkey'
      and conrelid = 'public.ada_artifacts'::regclass
  ) then
    alter table public.ada_artifacts
      add constraint ada_artifacts_workspace_id_fkey
      foreign key (workspace_id)
      references public.ada_workspaces(id)
      on delete cascade
      not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ada_artifacts_mission_id_fkey'
      and conrelid = 'public.ada_artifacts'::regclass
  ) then
    alter table public.ada_artifacts
      add constraint ada_artifacts_mission_id_fkey
      foreign key (mission_id)
      references public.ada_missions(id)
      on delete set null
      not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ada_memory_workspace_id_fkey'
      and conrelid = 'public.ada_memory'::regclass
  ) then
    alter table public.ada_memory
      add constraint ada_memory_workspace_id_fkey
      foreign key (workspace_id)
      references public.ada_workspaces(id)
      on delete cascade
      not valid;
  end if;
end
$$;

create index if not exists idx_ada_workspaces_updated_at
  on public.ada_workspaces(updated_at desc);

create index if not exists idx_ada_messages_workspace_id
  on public.ada_messages(workspace_id);

create index if not exists idx_ada_messages_created_at
  on public.ada_messages(workspace_id, created_at desc);

create index if not exists idx_ada_missions_workspace_id
  on public.ada_missions(workspace_id);

create index if not exists idx_ada_missions_status
  on public.ada_missions(workspace_id, status);

create index if not exists idx_ada_missions_updated_at
  on public.ada_missions(workspace_id, updated_at desc);

create index if not exists idx_ada_missions_created_at
  on public.ada_missions(workspace_id, created_at desc);

create index if not exists idx_ada_artifacts_workspace_id
  on public.ada_artifacts(workspace_id);

create index if not exists idx_ada_artifacts_mission_id
  on public.ada_artifacts(mission_id);

create index if not exists idx_ada_artifacts_type
  on public.ada_artifacts(workspace_id, type, created_at desc);

create unique index if not exists idx_ada_memory_workspace_id
  on public.ada_memory(workspace_id);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_ada_workspaces_updated_at'
      and tgrelid = 'public.ada_workspaces'::regclass
  ) then
    create trigger update_ada_workspaces_updated_at
      before update on public.ada_workspaces
      for each row
      execute function public.update_updated_at_column();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_ada_missions_updated_at'
      and tgrelid = 'public.ada_missions'::regclass
  ) then
    create trigger update_ada_missions_updated_at
      before update on public.ada_missions
      for each row
      execute function public.update_updated_at_column();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_ada_artifacts_updated_at'
      and tgrelid = 'public.ada_artifacts'::regclass
  ) then
    create trigger update_ada_artifacts_updated_at
      before update on public.ada_artifacts
      for each row
      execute function public.update_updated_at_column();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_ada_memory_updated_at'
      and tgrelid = 'public.ada_memory'::regclass
  ) then
    create trigger update_ada_memory_updated_at
      before update on public.ada_memory
      for each row
      execute function public.update_updated_at_column();
  end if;
end
$$;

alter table if exists public.ada_workspaces disable row level security;
alter table if exists public.ada_messages disable row level security;
alter table if exists public.ada_missions disable row level security;
alter table if exists public.ada_artifacts disable row level security;
alter table if exists public.ada_memory disable row level security;

insert into public.ada_workspaces (id, name)
values ('00000000-0000-4000-8000-000000000001', 'ADA Hackathon MVP')
on conflict (id) do nothing;
