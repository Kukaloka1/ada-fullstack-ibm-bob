-- ============================================================================
-- ADA Memory Foundation Migration
-- ============================================================================
-- 
-- This migration creates the minimal Supabase schema for ADA's memory layer.
-- 
-- Tables:
-- - ada_workspaces: Top-level workspace container
-- - ada_messages: Chat message history
-- - ada_missions: Structured engineering missions
-- - ada_artifacts: Generated artifacts (plans, specs, prompts, reports)
-- - ada_memory: Long-term workspace memory summaries
--
-- MVP Constraints:
-- - No auth dependency
-- - No RLS complexity (can be added post-MVP)
-- - No pgvector (can be added post-MVP)
-- - Simple, focused schema
--
-- ============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "pgcrypto";

-- ============================================================================
-- ada_workspaces
-- ============================================================================

create table if not exists ada_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for common queries
create index if not exists idx_ada_workspaces_updated_at on ada_workspaces(updated_at desc);

-- ============================================================================
-- ada_messages
-- ============================================================================

create table if not exists ada_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references ada_workspaces(id) on delete cascade,
  role text not null check (role in ('user', 'ada', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists idx_ada_messages_workspace_id on ada_messages(workspace_id);
create index if not exists idx_ada_messages_created_at on ada_messages(workspace_id, created_at desc);

-- ============================================================================
-- ada_missions
-- ============================================================================

create table if not exists ada_missions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references ada_workspaces(id) on delete cascade,
  title text not null,
  objective text,
  context text,
  constraints jsonb not null default '[]'::jsonb,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists idx_ada_missions_workspace_id on ada_missions(workspace_id);
create index if not exists idx_ada_missions_status on ada_missions(workspace_id, status);
create index if not exists idx_ada_missions_updated_at on ada_missions(workspace_id, updated_at desc);

-- ============================================================================
-- ada_artifacts
-- ============================================================================

create table if not exists ada_artifacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references ada_workspaces(id) on delete cascade,
  mission_id uuid references ada_missions(id) on delete set null,
  type text not null check (
    type in ('plan', 'spec', 'bob_prompt', 'qa_report', 'delivery_report', 'release_gate')
  ),
  title text not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists idx_ada_artifacts_workspace_id on ada_artifacts(workspace_id);
create index if not exists idx_ada_artifacts_mission_id on ada_artifacts(mission_id);
create index if not exists idx_ada_artifacts_type on ada_artifacts(workspace_id, type, created_at desc);

-- ============================================================================
-- ada_memory
-- ============================================================================

create table if not exists ada_memory (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references ada_workspaces(id) on delete cascade unique,
  summary text not null default '',
  decisions jsonb not null default '[]'::jsonb,
  constraints jsonb not null default '[]'::jsonb,
  pending_items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Index for workspace lookup
create unique index if not exists idx_ada_memory_workspace_id on ada_memory(workspace_id);

-- ============================================================================
-- Updated_at Trigger Function
-- ============================================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_ada_workspaces_updated_at'
      and tgrelid = 'ada_workspaces'::regclass
  ) then
    create trigger update_ada_workspaces_updated_at
      before update on ada_workspaces
      for each row
      execute function update_updated_at_column();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_ada_missions_updated_at'
      and tgrelid = 'ada_missions'::regclass
  ) then
    create trigger update_ada_missions_updated_at
      before update on ada_missions
      for each row
      execute function update_updated_at_column();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_ada_artifacts_updated_at'
      and tgrelid = 'ada_artifacts'::regclass
  ) then
    create trigger update_ada_artifacts_updated_at
      before update on ada_artifacts
      for each row
      execute function update_updated_at_column();
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_ada_memory_updated_at'
      and tgrelid = 'ada_memory'::regclass
  ) then
    create trigger update_ada_memory_updated_at
      before update on ada_memory
      for each row
      execute function update_updated_at_column();
  end if;
end
$$;

-- ============================================================================
-- Comments
-- ============================================================================

comment on table ada_workspaces is 'Top-level workspace container for ADA projects';
comment on table ada_messages is 'Chat message history for ADA conversations';
comment on table ada_missions is 'Structured engineering missions with acceptance criteria';
comment on table ada_artifacts is 'Generated artifacts: plans, specs, prompts, QA reports, delivery reports';
comment on table ada_memory is 'Long-term workspace memory summaries for efficient LLM context';

-- ============================================================================
-- Post-MVP Considerations (Not Implemented)
-- ============================================================================
--
-- The following features are intentionally NOT included in the MVP:
--
-- 1. Row Level Security (RLS)
--    - Can be added when auth is implemented
--    - Would restrict access based on user/workspace ownership
--
-- 2. pgvector for semantic search
--    - Can be added for advanced memory retrieval
--    - Would enable similarity search on messages/artifacts
--
-- 3. Full-text search
--    - Can be added with tsvector columns
--    - Would enable fast text search across content
--
-- 4. Audit logging
--    - Can be added with separate audit tables
--    - Would track all changes for compliance
--
-- 5. Soft deletes
--    - Can be added with deleted_at columns
--    - Would enable recovery of deleted records
--
-- ============================================================================

-- ============================================================================
-- MVP Seed Workspace
-- ============================================================================

insert into ada_workspaces (id, name)
values ('00000000-0000-4000-8000-000000000001', 'ADA Hackathon MVP')
on conflict (id) do nothing;
