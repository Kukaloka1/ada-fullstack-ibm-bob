# ADA — AI Delivery Architect

AI delivery software for IBM Bob.

ADA turns AI coding sessions into scoped build missions, evidence-backed QA, and controlled release handoffs.

## What ADA Is

ADA is not another code generator. It is a delivery cockpit around IBM Bob workflows.

The product organizes AI-assisted software delivery into project context, mission prompts, evidence, QA, and release control. The human lead remains in charge of product intent and approval. IBM Bob builds. ADA structures the work, reviews the delivery, and controls handoff quality.

This repository is the hackathon MVP for that workflow.

## Problem

AI coding is powerful, but it becomes chaotic when delivery control is missing. Builder agents can over-scope work, skip evidence, provide incomplete summaries, or leave the release state unclear.

Shipping software needs separation of duties. Someone has to define scope, someone has to implement, and someone has to verify what actually happened in the repository before a release moves forward.

## Solution

ADA productizes that control loop:

`Human Lead → ADA Mission Intake → Bob-ready Prompt → IBM Bob Execution → Evidence Export → ADA QA Review → Release Gate → Commit/Push`

The product itself was built using that workflow during the IBM Bob Hackathon.

## Current Features

- Persistent projects and workspaces
- Persistent project chat history
- ADA chat API for server-side reasoning
- Bob Prompt Preview panel
- Prompt and chat separation
- Structured artifacts persisted in Supabase
- Active mission persistence tied to Bob prompt generation
- Readiness checklist derived from durable state
- Delivery report export
- Evidence workflow in `bob_sessions/`
- Server-side Supabase architecture
- Source-of-truth docs for scope, workflow, and evidence
- Favicon and product identity assets

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Postgres
- Server-side Supabase client
- OpenAI-compatible API layer
- Turborepo / pnpm monorepo
- IBM Bob workflow evidence
- GitHub repo workflow

## Repository Structure

- `apps/web`
  The main ADA cockpit application.
- `apps/web/components`
  UI building blocks including the cockpit, chat, workflow sidebar, and context panel.
- `apps/web/app/api/ada`
  Server-side API routes for chat, workspaces, messages, artifacts, and missions.
- `apps/web/lib/ada`
  ADA-specific types, prompt logic, context building, and durable state helpers.
- `supabase/migrations`
  The current MVP schema foundation.
- `docs`
  Source-of-truth product, workflow, and evidence documentation.
- `bob_sessions`
  IBM Bob task histories, recovery notes, and consumption evidence for the hackathon.
- `packages/shared`
  Shared package surface for reusable types and constants.

## Data Model

ADA currently uses these tables:

- `ada_workspaces`
  Project containers for isolating mission and chat state.
- `ada_messages`
  Persistent project chat history.
- `ada_artifacts`
  Durable Bob prompts, QA artifacts, delivery reports, and release artifacts.
- `ada_missions`
  Active mission state for the current scoped work.
- `ada_memory`
  Foundation for future durable workspace memory summaries.

## Evidence and Hackathon Workflow

IBM Bob evidence is preserved in `bob_sessions/`. Evidence files include task history exports, recovery notes, and consumption screenshots tied to the build process.

This repository is intentionally honest about how the product was completed:

> IBM Bob was used meaningfully across the build, and Bob evidence is preserved. After Bob budget was exhausted, recovery fixes were completed outside IBM-provided services.

That evidence model is part of the product itself. ADA is designed to treat AI build output as something that must be reviewed, validated, and documented before release.

## Local Development

### Prerequisites

- Node.js compatible with the current workspace
- `pnpm`
- Supabase project credentials
- OpenAI-compatible model credentials

### Setup

```bash
pnpm install
cp .env.example .env.local
```

Configure these server-side variables in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_API_BASE_URL` if using a non-default compatible endpoint
- `OPENAI_MODEL` if overriding the default model

Do not commit real secrets.

### Run

```bash
pnpm dev
```

### Validation

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Validation Gate

ADA’s expected validation gate for a product mission is:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- manual browser validation for UI changes
- secret scanning where relevant before evidence or release handoff

Typical repository checks also include:

- `git status --short`
- `git diff --stat`

## Current MVP Constraints

This hackathon MVP intentionally excludes:

- auth
- billing
- GitHub OAuth
- vector DB
- pgvector
- client-side Supabase access
- secrets in the repository

The current product is narrow by design: a delivery control cockpit for IBM Bob workflows, not a full enterprise platform.

## Roadmap

- durable memory summaries in `ada_memory`
- structured QA reports
- release gate persistence improvements
- final demo polish
- optional auth later
- optional GitHub integration later

## Source of Truth

For detailed product and workflow rules, see:

- [docs/ADA_SPEC.md](docs/ADA_SPEC.md)
- [docs/DELIVERY_WORKFLOW.md](docs/DELIVERY_WORKFLOW.md)
- [docs/HACKATHON_EVIDENCE.md](docs/HACKATHON_EVIDENCE.md)
- [AGENTS.md](AGENTS.md)

## ADA Identity

![ADA — AI Delivery Architect](apps/web/public/ada_logo1.png)
