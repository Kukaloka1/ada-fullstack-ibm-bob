<div align="center">

<img src="apps/web/public/ada_logo1.png" alt="ADA Logo" width="120" />

# ADA — AI Delivery Architect

**Controlled software delivery for IBM Bob.**

AI coding is powerful. Production delivery needs control.  
ADA gives human leads a cockpit to scope missions, generate clean Bob-ready prompts, preserve evidence, review what actually changed, and decide when work is ready to ship.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.105.4-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![pnpm](https://img.shields.io/badge/pnpm-10.0.0-F69220?style=flat-square&logo=pnpm)](https://pnpm.io)

</div>

---

## The Problem

AI coding tools are excellent builders — but they are not delivery systems.

Without a control layer, AI-assisted development falls apart fast:

- Prompts scattered across chats with no record
- Scope expands without approval
- Builder summaries treated as ground truth
- Evidence disappears
- Release readiness is anyone's guess

That is not how production software ships.

---

## The Solution

ADA wraps IBM Bob inside a delivery cockpit.

```
Human Lead → ADA Mission Intake → Bob-ready Prompt → IBM Bob Execution
    → Evidence Export → ADA QA Review → Release Gate → Commit / Push
```

**Human Lead** defines intent, priorities, and constraints — and holds final approval.  
**IBM Bob** builds inside the repository.  
**ADA** structures the mission, preserves evidence, runs QA, and controls the release gate.

QA is not release. QA asks whether Bob completed the scoped mission. Release Gate asks whether the human lead approves it to be committed and pushed.

---

## Cockpit Overview

<img src="apps/web/public/1.png" alt="ADA Main Cockpit — persistent project context, chat history, Bob Prompt Preview, readiness checklist, and release gate in one view" width="100%" />

*Persistent project context, chat history, workflow state, Bob Prompt Preview, readiness checklist, and release gate — all in one screen.*

---

## Delivery in Detail

<img src="apps/web/public/3.png" alt="ADA delivery context — conversation separated from execution prompts, human lead retains control of evidence and release readiness" width="100%" />

*ADA separates conversation from execution prompts. Bob receives a clean, scoped build mission. The human lead keeps full control of evidence and release decisions.*

<img src="apps/web/public/4.png" alt="ADA Mission Intake — structured mission definition with title, objective, scope, non-goals, and acceptance criteria" width="100%" />

*Mission Intake turns rough product intent into a structured mission with scope, non-goals, acceptance criteria, and evidence requirements.*

<img src="apps/web/public/5.png" alt="Bob Prompt Preview — long implementation prompts routed to a dedicated panel, not dumped into chat" width="100%" />

*Bob Prompt Preview routes the full implementation prompt to a dedicated panel — not the chat — so nothing gets lost and nothing pollutes the conversation.*

<img src="apps/web/public/6.png" alt="ADA QA Review — independent verdict derived from repository evidence, not builder summary" width="100%" />

*ADA derives QA verdicts from real repository output, not just the builder summary. Non-pending verdicts auto-record a durable QA artifact.*

<img src="apps/web/public/7.png" alt="Durable artifact persistence — QA reports, delivery reports, and release gate decisions saved to Supabase" width="100%" />

*Every QA report, delivery report, and release gate decision is persisted as a durable artifact. Chat is context. Artifacts are the source of truth.*

<img src="apps/web/public/8.png" alt="Release Gate — human lead records the final commit/push decision after ADA QA and evidence export" width="100%" />

*Release Gate is the final step. ADA recommends readiness from durable state, but the human lead records the outcome and approves the push.*

<img src="apps/web/public/9.png" alt="Mission lifecycle — close mission, preserve history and artifacts, open next mission cleanly in the same workspace" width="100%" />

*Missions close cleanly. History, artifacts, and memory are preserved. The next mission starts fresh in the same workspace.*

<img src="apps/web/public/10.png" alt="Workspace memory — deterministic project summary derived from durable artifacts and mission state" width="100%" />

*Workspace memory is deterministic — derived from durable artifacts and mission state, not from chat history or builder summaries.*

<img src="apps/web/public/11.png" alt="ADA onboarding — in-product How ADA Works modal explaining the full delivery workflow" width="100%" />

*Built-in onboarding explains the full delivery workflow without leaving the product.*

---

## How ADA Works

### 1 — Create or Select a Project

Each project is a persistent workspace with its own chat history, active mission, Bob prompt, QA reports, delivery evidence, release decisions, and memory summary.

### 2 — Describe the Mission

The human lead tells ADA what needs to be built. ADA turns rough intent into a scoped mission: title, objective, scope, non-goals, acceptance criteria, evidence requirements, and validation plan.

When no active mission exists, ADA names the latest closed mission and outcome, then signals readiness for the next scoped mission.

### 3 — Generate a Bob Prompt

Only on explicit request does ADA route the full implementation prompt to the Bob Prompt Preview panel. Mission briefings and intake confirmations do not generate `bob_prompt` artifacts. The prompt is persisted as a durable artifact when generated.

### 4 — Let Bob Build

The Bob prompt is pasted into IBM Bob. Bob works inside the repository, makes scoped changes, and returns implementation output.

### 5 — Bring Evidence Back

The human lead returns changed files, `git status`, `git diff`, validation results, known risks, and the builder summary. ADA reviews repository reality — not just the builder's account of it.

### 6 — ADA Produces QA

ADA derives a verdict from review output. Non-pending verdicts auto-record a durable `qa_report` artifact.

### 7 — Export Delivery Evidence

ADA exports a delivery report as Markdown and persists a `delivery_report` artifact. Readiness is only marked after persistence succeeds.

### 8 — Human Lead Records Release Gate

ADA recommends a release state from durable QA and evidence. The human lead records the final outcome.

### 9 — Close the Mission

Closing a mission preserves history, artifacts, and memory, then resets the active delivery UI for the next mission in the same workspace.

---

## Built Using Its Own Workflow

ADA was built using the delivery workflow it productizes.

IBM Bob was not a peripheral assistant in this repository. Bob was the primary builder for ADA's MVP foundation.

| Builder | Missions | Role |
|---|---|---|
| IBM Bob | 19 of 37 (~51%) | Core product build — scaffold, Supabase memory, chat API, context builder, workspace model, Bob Prompt Preview routing, original cockpit |
| Codex (continuity) | 18 of 37 (~49%) | Hardening, recovery, UX clarification, and workflow polish on top of Bob's foundation |

When IBM Bob budget ran out, continuity work was completed outside IBM-provided services and preserved separately. That reinforced the product thesis: AI builders need an independent delivery control layer.

---

## Data Model

| Table | Purpose |
|---|---|
| `ada_workspaces` | Project containers for isolating mission and chat state |
| `ada_messages` | Persistent project chat history |
| `ada_artifacts` | Bob prompts, QA reports, delivery reports, release gate decisions |
| `ada_missions` | Mission rows for repeated delivery cycles inside the same project |
| `ada_memory` | Deterministic project memory derived from artifacts and mission state |

**Delivery Truth Model:** If mission record status and delivery artifact status differ, delivery artifact status is authoritative for release readiness.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.6 |
| UI | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Database client | Supabase JS | ^2.105.4 |
| LLM layer | OpenAI-compatible API | ^4.77.3 |
| Monorepo | Turborepo + pnpm | latest / 10.0.0 |
| Evidence workflow | IBM Bob + Codex continuity | `bob_sessions/` / `others_sessions/` |

---

## Repository Structure

```
apps/web/                   Main ADA cockpit application
apps/web/components/        Chat, workflow sidebar, context panel, mission controls
apps/web/app/api/ada/       Server-side routes — chat, workspaces, messages, artifacts, missions
apps/web/lib/ada/           Prompt logic, context building, memory sync, types
supabase/migrations/        MVP schema foundation
docs/                       Source-of-truth product, workflow, and evidence docs
bob_sessions/               Official IBM Bob evidence for the hackathon
others_sessions/            Continuity and recovery evidence completed with Codex
packages/shared/            Shared types and constants
```

---

## Local Development

**Prerequisites:** Node.js, pnpm, Supabase project credentials, OpenAI-compatible model credentials.

```bash
pnpm install
cp .env.example .env.local
```

Configure in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
OPENAI_API_BASE_URL     # if using a non-default compatible endpoint
OPENAI_MODEL            # if overriding the default model
```

```bash
pnpm dev
```

**Validation gate:**

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Plus manual browser validation for UI changes and `git status --short` / `git diff --stat` before any release handoff.

---

## Current MVP Scope

This hackathon MVP intentionally excludes auth, billing, GitHub OAuth, vector DB, pgvector, client-side Supabase access, automatic push without human approval, and secrets in the repository.

The product is narrow by design: a delivery control cockpit for IBM Bob workflows, not a full enterprise platform.

---

## Roadmap

- Richer mission-aware memory summaries in `ada_memory`
- Richer structured QA reports
- Polished release-gate and evidence timelines
- Optional auth
- Optional GitHub integration
- Optional: use ADA as a control remote for AI builders building AI

---

## Source of Truth

- [`docs/ADA_SPEC.md`](docs/ADA_SPEC.md)
- [`docs/DELIVERY_WORKFLOW.md`](docs/DELIVERY_WORKFLOW.md)
- [`docs/HACKATHON_EVIDENCE.md`](docs/HACKATHON_EVIDENCE.md)
- [`AGENTS.md`](AGENTS.md)

---

<div align="center">

<img src="apps/web/public/ada_logo1.png" alt="ADA" width="48" />

**ADA — AI Delivery Architect**  
*AI coding is powerful. Production delivery needs control.*

</div>