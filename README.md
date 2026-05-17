# ADA — AI Delivery Architect

**AI delivery software for IBM Bob.**

ADA turns IBM Bob coding sessions into controlled software delivery: scoped missions, persistent project context, evidence-backed QA, and human-controlled release handoffs.

AI coding is powerful. Production delivery needs control.

ADA gives human leads a cockpit to define what should be built, generate clean Bob-ready prompts, preserve evidence, review what actually changed, and decide when work is safe to commit and push.

`Next.js 16.2.6` `React 19.2.4` `TypeScript ^5` `Tailwind CSS ^4` `Supabase JS ^2.105.4` `OpenAI ^4.77.3` `Turborepo latest` `pnpm 10.0.0` `IBM Bob Workflow`

## What ADA Is

ADA is not another code generator. It is a delivery cockpit for IBM Bob-led software delivery workflows.

The product organizes AI-assisted delivery into project context, mission prompts, durable artifacts, QA, and release control. The human lead remains in charge of product intent and approval. IBM Bob builds. ADA structures the work, reviews the delivery, and controls handoff quality.

This repository is the hackathon MVP for that workflow.

## Why ADA Exists

AI builders can move fast, but fast is not the same as ready.

In real software delivery, one actor should not define scope, implement code, review quality, approve release, and document evidence alone. That creates risk.

ADA introduces separation of duties for AI-assisted development:

- **Human Lead** defines intent, priorities, constraints, and final approval.
- **IBM Bob** implements inside the repository.
- **ADA** structures the mission, preserves context, reviews evidence, and controls release readiness.

QA is not release. QA asks whether the builder completed the scoped mission correctly. Release Gate asks whether the human lead allows the work to be committed and pushed.

## Built Through Its Own Workflow

ADA was built using the workflow it productizes.

The project started as a real IBM Bob Hackathon build. IBM Bob was not a peripheral assistant in this repository. Bob was the primary builder for ADA’s original MVP foundation and the reason the product exists in working form.

IBM Bob built the core of ADA:

- the original scaffold and application foundation,
- the source-of-truth product and workflow docs,
- the Supabase memory foundation,
- the chat API and context builder,
- the persistent project/workspace model,
- the first Bob Prompt Preview routing flow,
- the original chat-first cockpit shape that the later product iterations extended.

By documented mission count in this repository, IBM Bob accounts for **19 of 37 tracked mission records, or about 51%**. More importantly than raw count, those Bob missions represent the foundational product build: the first working ADA cockpit, the initial delivery workflow, and the durable architecture the rest of the MVP continued from.

The remaining **18 of 37 missions, or about 49%**, were completed later with Codex after IBM Bob budget exhaustion. That later work was primarily continuity, hardening, recovery, UX clarification, and workflow polish on top of the product core that Bob had already established.

As the system grew, ADA’s own doctrine became the operating model:

1. Define a narrow mission.
2. Generate a Bob-ready prompt.
3. Let Bob build inside the repository.
4. Export or preserve evidence.
5. Review the real repository state.
6. Fix scope or quality issues.
7. Commit only after validation and release approval.

When IBM Bob budget ran out, continuity and recovery work were completed outside IBM-provided services and preserved separately. That later Codex work did not replace Bob’s role in the project story; it extended and hardened a core product foundation that had already been built with IBM Bob. That reinforced the product thesis: AI builders need an independent delivery control layer.

## Problem

AI coding tools are excellent builders, but they are not delivery systems.

Without a control layer, AI-assisted development becomes messy:

- prompts are scattered across chats,
- scope expands without approval,
- summaries are treated as truth,
- evidence is missing,
- validation is inconsistent,
- release readiness is unclear.

That is not how production software should ship.

## Solution

ADA adds a delivery cockpit around IBM Bob.

It converts product intent into structured build missions, keeps project context persistent, routes long implementation prompts into a dedicated Bob Prompt Preview, tracks evidence, supports independent QA review, and gives the human lead a clear release gate.

Bob executes build work. ADA reviews the evidence, checks readiness, records durable state, and prepares the next delivery decision. The human lead remains the final authority on commit and push.

```txt
Human Lead
→ ADA Mission Intake
→ Bob-ready Prompt
→ IBM Bob Execution
→ Evidence Export
→ ADA QA Review
→ Release Gate
→ Commit / Push
```

## How ADA Works

### 1. Create or Select a Project

Each project is a persistent workspace. It keeps its own chat history, current mission, Bob prompt, QA reports, delivery evidence, release decisions, and memory summary.

### 2. Describe the Mission

The human lead tells ADA what needs to be built. ADA turns rough intent into a scoped mission with constraints, non-goals, and delivery expectations.

If the project has no active mission, ADA now treats the next mission as an explicit lifecycle action. `Open New Mission` creates a real `ada_missions` row in `planning` state instead of behaving like chat-only intake. Users can start that same lifecycle either from the UI button or by explicit chat intent, and both paths go through the same confirmation modal.

Mission intake and Bob prompt generation are separate steps. During intake, ADA keeps the briefing in chat and structures the mission with title, objective, scope, non-goals, acceptance criteria, evidence, validation, and next step.

When no active mission exists, ADA reports that state directly instead of saying the project is merely `PENDING`. It names the latest closed mission if one exists, describes the latest closed outcome, and says the project is ready for the next scoped mission.

### 3. Generate a Bob Prompt

Only when the user explicitly asks for a Bob prompt does ADA route the full implementation prompt to the Bob Prompt Preview panel instead of dumping it into chat. This includes supported shorthand and typo variants such as `bob promnt`, `give bob promt`, or `dame el promnt para Bob`. Mission briefings, rough notes, and intake confirmations do not create `bob_prompt` artifacts. The prompt is also persisted as a durable artifact when it is explicitly generated.

### 4. Let Bob Build

The Bob prompt is pasted into IBM Bob. Bob works inside the repository, makes scoped changes, and returns implementation output.

### 5. Bring Builder Output Back Into ADA

The human lead brings back changed files, `git status`, `git diff`, validation results, known risks, and the task summary. ADA reviews repository reality, not just the builder summary.

### 6. ADA Produces QA

ADA derives a QA verdict from review output. Non-pending verdicts auto-record a durable `qa_report` artifact. QA determines whether the scoped mission was completed correctly.

### 7. Export Delivery Evidence

ADA exports a delivery report as Markdown and persists a `delivery_report` artifact. Evidence export marks readiness only after persistence succeeds, so durable state stays honest.

### 8. Human Lead Records Release Gate

Release Gate is the final commit/push decision. ADA can recommend the release state from durable QA and evidence, but the human lead records the final outcome.

### 9. Close the Mission and Start the Next One

A project can contain multiple missions. Closing a mission preserves history, artifacts, and memory, then resets the active delivery UI so the next mission can start cleanly in the same workspace.

When the active mission is closed, ADA can open the next mission through an explicit intake modal. That new mission becomes the active durable mission row for the workspace immediately.

## Current Product State

The current MVP includes:

- Persistent projects and workspaces
- Persistent project chat history
- ADA chat API for server-side reasoning
- Bob Prompt Preview with explicit prompt routing
- Prompt and chat separation
- Durable artifacts in Supabase
- Active mission persistence in `ada_missions`
- Deterministic workspace memory in `ada_memory`
- Readiness checklist derived from durable state
- Auto-recorded QA reports for non-pending ADA verdicts
- Durable release gate decisions
- Delivery report export
- Close Mission and Open New Mission lifecycle controls
- Explicit new-mission intake modal with real `ada_missions` creation
- Project deletion with scoped cleanup
- Workspace recovery when the selected or default workspace is missing
- In-product “How ADA Works” onboarding modal

## Delivery Truth Model

ADA distinguishes between internal mission state and delivery state.

- **Mission record status** comes from `ada_missions` and describes the internal mission row.
- **Delivery status** comes from durable artifacts, especially `qa_report`, `delivery_report`, and `release_gate`.

If they differ, delivery status is authoritative for release readiness.

Artifacts are the durable source of truth. `ada_memory` is a deterministic workspace summary derived from those artifacts and mission state. Recent chat is context, not authority.

Within the cockpit, active operational artifacts now resolve against the active mission instead of the latest artifact anywhere in the workspace. That prevents old QA, release, and delivery state from leaking into the next mission.

## Repository Structure

- `apps/web`
  Main ADA cockpit application.
- `apps/web/components`
  UI modules for chat, workflow sidebar, context panel, and mission controls.
- `apps/web/app/api/ada`
  Server-side API routes for chat, workspaces, messages, artifacts, and missions.
- `apps/web/lib/ada`
  ADA-specific prompt logic, context building, memory sync, and types.
- `supabase/migrations`
  MVP schema foundation.
- `docs`
  Source-of-truth product, workflow, and evidence documentation.
- `bob_sessions`
  Official IBM Bob evidence preserved for the hackathon.
- `others_sessions`
  Continuity and recovery evidence completed later with Codex after IBM Bob budget exhaustion.
- `packages/shared`
  Shared package surface for reusable types and constants.

## Data Model

ADA currently uses these tables:

- `ada_workspaces`
  Project containers for isolating mission and chat state.
- `ada_messages`
  Persistent project chat history.
- `ada_artifacts`
  Durable Bob prompts, QA reports, delivery reports, release gate decisions, and related artifacts.
- `ada_missions`
  Mission rows for repeated delivery cycles inside the same project.
- `ada_memory`
  Deterministic project memory summary derived from durable artifacts and mission state.

## Tech Stack

| Layer | Technology | Version Source |
| --- | --- | --- |
| Framework | Next.js App Router | `next` `16.2.6` from `apps/web/package.json` |
| UI | React | `react` / `react-dom` `19.2.4` from `apps/web/package.json` |
| Language | TypeScript | `typescript` `^5` in `apps/web/package.json`; `latest` in root and `packages/shared` |
| Styling | Tailwind CSS | `tailwindcss` `^4` from `apps/web/package.json` |
| Database client | Supabase JS | `@supabase/supabase-js` `^2.105.4` from `apps/web/package.json` |
| Server state | Next.js API routes | implemented in `apps/web/app/api/ada` |
| LLM layer | OpenAI-compatible API | `openai` `^4.77.3` from `apps/web/package.json` |
| Monorepo | Turborepo + pnpm | `turbo` `latest` and `pnpm@10.0.0` from root `package.json` |
| Shared package | `@ada/shared` | workspace package `0.1.0` |
| Evidence workflow | IBM Bob + continuity evidence | `bob_sessions/` and `others_sessions/` |

For exact package versions, see `package.json`, `apps/web/package.json`, `packages/shared/package.json`, and `pnpm-lock.yaml`.

## Evidence Model

This repository preserves two evidence lanes:

- `bob_sessions/`
  Official IBM Bob task evidence for the public hackathon repository. This folder is intentionally preserved as Bob evidence.
- `others_sessions/`
  Continuity and recovery evidence completed later with Codex after IBM Bob budget exhaustion.

The product documentation is intentionally explicit about that split:

> IBM Bob was used meaningfully across the build, and Bob evidence is preserved in `bob_sessions/`. After Bob budget was exhausted, continuity and recovery fixes were completed outside IBM-provided services and preserved separately in `others_sessions/`.

## Product Screenshots

### ADA Cockpit

Persistent project context, chat history, workflow state, Bob Prompt Preview, readiness checklist, and release gate in one screen.

![ADA Main Cockpit](apps/web/public/ADA_MAIN.png)

### Structured Delivery Context

ADA separates conversation from execution prompts so Bob receives clean build missions while the human lead keeps control of evidence and release readiness.

![ADA Main Cockpit Detail](apps/web/public/ADA_MAIN1.png)

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

Configure these variables in `.env.local`:

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
- repository checks such as `git status --short` and `git diff --stat`
- secret scanning where relevant before evidence or release handoff

## Current MVP Constraints

This hackathon MVP intentionally excludes:

- auth
- billing
- GitHub OAuth
- vector DB
- pgvector
- client-side Supabase access
- automatic push without human approval
- secrets in the repository

The product is narrow by design: a delivery control cockpit for IBM Bob workflows, not a full enterprise platform.

## Roadmap

- richer mission-aware memory summaries in `ada_memory`
- richer structured QA reports
- more polished release-gate and evidence timelines
- final demo polish
- optional auth later
- optional GitHub integration later
- optional use has a control remote for ai builders (e.g. for AIs to build AIs)

## Source of Truth

For detailed product and workflow rules, see:

- [docs/ADA_SPEC.md](docs/ADA_SPEC.md)
- [docs/DELIVERY_WORKFLOW.md](docs/DELIVERY_WORKFLOW.md)
- [docs/HACKATHON_EVIDENCE.md](docs/HACKATHON_EVIDENCE.md)
- [AGENTS.md](AGENTS.md)

## ADA Identity

![ADA — AI Delivery Architect](apps/web/public/ada_logo1.png)
