# ADA — AI Delivery Architect

**Version:** 1.0.0  
**Status:** Hackathon MVP Source of Truth  
**Project:** IBM Bob Hackathon  
**Repository:** `ada-fullstack-ibm-bob`

---

## 1. Product Vision

ADA is a chat-first AI Delivery Architect for disciplined AI-assisted software delivery.

ADA productizes a real working method:

- the human lead defines intent, priorities, and approval,
- IBM Bob performs implementation work inside the repository,
- ADA provides orchestration, prompt discipline, independent QA, evidence control, and release readiness.

ADA is not a generic assistant.

ADA is the operational control layer that turns chaotic AI coding into structured software delivery.

**Core tagline:**

> Bob builds. Ada orchestrates and reviews. You lead.

**Core thesis:**

> Two AIs are better than one.

---

## 2. Hackathon Strategic Narrative

ADA is built from a real AI-native software delivery workflow.

This project is not a theoretical tool. It is a productized version of the way the project itself is being built:

1. The human lead defines the product direction.
2. ADA converts intent into scoped engineering missions.
3. IBM Bob executes implementation work inside the repository.
4. ADA reviews the actual repository state, not just the builder summary.
5. The human lead approves the release.
6. The work is committed, pushed, and evidenced.

The meta-story is important:

> We are using a disciplined AI software delivery method to build the product that productizes that same method.

This is the product.

---

## 3. Problem Statement

AI coding tools are powerful, but production software delivery requires more than raw code generation.

Common AI-assisted development failures:

- vague prompts,
- unclear objectives,
- blind coding,
- scope creep,
- unrelated repository changes,
- incomplete implementation,
- builder summaries that do not match the actual repo,
- missing tests,
- weak validation,
- poor traceability,
- missing evidence,
- unsafe handling of secrets,
- low confidence before release.

This is not only an AI problem.

It is a workflow problem.

ADA solves the workflow problem.

---

## 4. Three-Role Delivery Model

ADA formalizes a three-role delivery model.

### 4.1 Human Lead

The human remains in control.

Responsibilities:

- define business objective,
- define technical intent,
- define constraints,
- approve plans,
- approve release gates,
- decide whether work is committed and pushed.

The human leads.

---

### 4.2 IBM Bob — Builder AI

IBM Bob is the implementation engine.

Responsibilities:

- inspect repository context,
- implement scoped missions,
- modify files,
- generate or update code,
- generate documentation and tests when requested,
- provide task output,
- export task session reports for hackathon evidence.

Bob builds.

---

### 4.3 ADA — AI Delivery Architect

ADA is the orchestration and quality layer.

Responsibilities:

- turn messy intent into structured missions,
- create planning gates,
- generate Bob-ready prompts,
- control scope,
- review Bob output,
- validate the actual repository state,
- detect missing implementation,
- detect scope creep,
- generate correction prompts,
- produce QA verdicts,
- prepare delivery reports,
- generate commit messages,
- support commit/push handoff,
- track required hackathon evidence.

Ada orchestrates and reviews.

---

## 5. What ADA Is Not

ADA is not:

- a coding assistant,
- a Bob replacement,
- an IDE,
- a GitHub Copilot competitor,
- a generic chatbot wrapper,
- a deployment automation tool,
- a full enterprise SDLC platform.

---

## 6. What ADA Is

ADA is:

- a chat-first AI Delivery Architect,
- a delivery control cockpit for IBM Bob workflows,
- a mission intake system,
- a planning gate,
- a Bob prompt generator,
- an independent QA gate,
- an evidence tracker,
- a release readiness layer,
- a commit/push handoff assistant,
- a productized version of disciplined human + QA-AI + builder-AI software delivery.

---

## 7. MVP Scope

This is a 48-hour hackathon MVP.

The scope must stay narrow, useful, and demoable.

No enterprise fantasy.  
No unnecessary platform complexity.  
No overbuilt architecture.

The MVP must prove one core flow:

```txt
Human Lead
  → ADA Mission Intake
  → ADA Planning Gate
  → ADA Bob Prompt
  → IBM Bob Execution
  → ADA QA Review
  → ADA Release Gate
  → Commit/Push Handoff
```

---

## 8. Current MVP Reality

The current MVP starts as a single-route chat-first cockpit at:

/

The first UI proves the product shape:

ADA header,
workflow sidebar,
central ADA chat,
quick action prompts,
Bob prompt preview,
readiness checklist,
release gate,
markdown export placeholder.

Additional routes are planned but not required for the first proof.

---

## 9. MVP Modules

### Module 1 — Mission Intake

Purpose:

Transform messy product intent into a structured engineering mission.

Inputs:

mission title,
business goal,
technical context,
constraints,
acceptance criteria,
implementation notes.

Output:

structured mission object,
clarified scope,
explicit non-goals.

### Module 2 — Planning Gate

Purpose:

Prevent blind coding before Bob executes.

Outputs:

implementation plan,
file impact assumptions,
dependencies,
risks,
recommended execution sequence,
validation expectations.

Rule:

No Bob implementation mission should run without a scoped plan.

### Module 3 — Spec Builder

Purpose:

Generate an implementation-grade spec.

Outputs:

problem statement,
implementation scope,
non-goals,
acceptance criteria,
engineering checklist,
testing expectations,
delivery notes.

### Module 4 — Bob Mission Generator

Purpose:

Convert ADA’s structured spec into a Bob-ready implementation prompt.

The Bob prompt must include:

mission title,
context,
allowed files,
constraints,
acceptance criteria,
validation commands,
evidence requirements,
warning against unrelated changes.

Bob prompts must be direct, scoped, and non-ambiguous.

### Module 5 — QA Gate

Purpose:

Independently validate Bob’s work.

ADA reviews:

Bob summary,
changed files,
actual repo diff,
validation command output,
scope alignment,
missing implementation,
security risks,
maintainability risks,
test/build/lint status.

Outputs:

PASS,
CONDITIONAL PASS,
FAIL,
correction prompt if needed.

Critical rule:

Builder summaries are not truth. The repository is truth.

### Module 6 — Delivery Report

Purpose:

Generate release-ready handoff.

Outputs:

implementation summary,
changed files,
validation results,
test evidence,
unresolved risks,
final recommendations,
suggested commit message,
release readiness status.

### Module 7 — Release Gate

Purpose:

Control the final transition from implementation to commit/push.

The Release Gate includes:

QA verdict,
evidence status,
build/lint/typecheck status,
human approval,
suggested commit message,
push readiness.

ADA treats commit and push preparation as part of delivery, not as an afterthought.

---

## 10. Release Gate Semantics

### PASS

Work can proceed to commit/push.

Required:

acceptance criteria met,
no critical issues,
validation passes,
no unrelated changes,
evidence ready or clearly tracked.

### CONDITIONAL PASS

Work is usable, but there are known non-blocking issues.

Required:

core mission complete,
risks documented,
human lead explicitly accepts conditions.

### FAIL

Work must not be committed as complete.

Reasons may include:

missing implementation,
wrong workspace,
default starter screen still present,
validation failure,
scope violation,
security concern,
missing required evidence,
builder summary does not match repo reality.

When FAIL occurs, ADA generates a correction prompt.

---

## 11. Routes

### Current Hackathon MVP
```
/  → ADA chat-first cockpit
```

### Planned MVP Routes If Time Allows
```
/missions/new
/planning
/spec
/bob
/qa
/delivery
```

### Post-MVP Routes
```
/missions
/missions/[id]
/evidence
/settings
```

Do not build post-MVP routes unless core flow is complete.

---

## 12. Technology Stack

### Current Repo
Turborepo
pnpm
Next.js App Router
React
TypeScript
Tailwind CSS
IBM Bob IDE

### ADA Reasoning Layer
OpenAI-compatible LLM API

### ADA Memory Layer
Supabase Postgres

### Optional Later
Supabase Storage for evidence assets
Markdown export
File upload support

---

## 13. MVP Constraints

For the hackathon MVP:

no auth,
no billing,
no GitHub OAuth,
no vector DB,
no pgvector,
no complex backend infrastructure,
no automatic push without human approval,
no multi-user collaboration,
no CI/CD integration,
no enterprise dashboard bloat.

The product must remain simple, direct, and demoable.

---

## 14. Supabase Memory Strategy

ADA needs real memory because it is not a disposable chatbot.

ADA must remember:

chat history,
current workspace,
active mission,
generated specs,
Bob prompts,
QA reports,
delivery reports,
release gate status,
long-term project decisions.

Use structured memory, not an infinite chat log.


### Persistence Implementation (Mission 08)

**Status:** Implemented, hardened in Mission 08A, and mission-linked in Mission 08B

ADA now persists operational artifacts and mission state to Supabase.

**Implemented APIs:**
- GET /api/ada/artifacts?workspaceId={id}&artifactType={type}
- POST /api/ada/artifacts
- GET /api/ada/missions?workspaceId={id}&activeOnly=true
- POST /api/ada/missions
- PATCH /api/ada/missions

**Artifact Types:**
- bob_prompt: Generated Bob implementation prompts
- delivery_report: Exported delivery state reports
- qa_report: QA review verdicts
- release_gate: Release gate decisions
- plan: Planning gate outputs
- spec: Implementation specifications
- note: General durable project notes

**Current behavior:**
- Supabase access remains server-side only through Next.js API routes
- Bob Prompt Preview restores from the latest persisted `bob_prompt` artifact
- Identical Bob prompts are not re-persisted during refresh or workspace switching
- Bob prompt persistence also upserts the active `ada_missions` row for that workspace
- Mission title derives from `Mission Title:` or `Mission:` in the Bob prompt, with `Scoped ADA Mission` as fallback
- Mission objective derives from `Goal:` or `Objective:` when present
- Workspace switching resets local prompt and mission UI before loading durable state
- Delivery report export still downloads Markdown and also persists a `delivery_report` artifact
- Readiness derives from durable artifacts and active mission/message state per workspace

**Still pending for future missions:**
- richer release-gate authoring and persistence UX
- first-class plan/spec creation flows in the cockpit
- deeper artifact browsing beyond latest-state restoration

**Behavior:**
- Bob prompts persist when generated
- Active mission records are created or updated when a new Bob prompt is persisted
- Delivery reports persist when exported
- Latest artifacts load on workspace switch
- Readiness checklist derives from artifact existence
- Active missions load on workspace selection
- All persistence scoped by workspace_id
- Persistence failures log warnings but don't block UI

**Security:**
- All Supabase operations server-side only
- No client-side Supabase access
- No NEXT_PUBLIC_SUPABASE_ANON_KEY
- OPENAI_API_KEY only in server routes

---

## 15. Memory Model

ADA uses three memory layers.

### 15.1 Short-Term Memory

Recent chat context.

Example:

last 10–20 messages

Used for immediate conversation continuity.

### 15.2 Project Memory

Current structured project state.

Includes:

active mission,
current spec,
latest Bob prompt,
latest QA report,
latest delivery report,
release readiness.

### 15.3 Long-Term Summary Memory

Compact persistent memory.

Includes:

what this project is,
what decisions were made,
permanent constraints,
what Bob already implemented,
what is pending,
known risks.

This keeps LLM context efficient.

---

## 16. Minimal Supabase Schema

Use a small schema for the MVP.

No over-modeling.

### ada_workspaces

```sql
create table ada_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### ada_messages

```sql
create table ada_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references ada_workspaces(id) on delete cascade,
  role text not null check (role in ('user', 'ada', 'system')),
  content text not null,
  created_at timestamptz default now()
);
```

### ada_missions

```sql
create table ada_missions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references ada_workspaces(id) on delete cascade,
  title text not null,
  objective text,
  context text,
  constraints jsonb default '[]'::jsonb,
  acceptance_criteria jsonb default '[]'::jsonb,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### ada_artifacts

```sql
create table ada_artifacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references ada_workspaces(id) on delete cascade,
  mission_id uuid references ada_missions(id) on delete set null,
  type text not null check (
    type in ('plan', 'spec', 'bob_prompt', 'qa_report', 'delivery_report', 'release_gate')
  ),
  title text not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### ada_memory

```sql
create table ada_memory (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references ada_workspaces(id) on delete cascade unique,
  summary text default '',
  decisions jsonb default '[]'::jsonb,
  constraints jsonb default '[]'::jsonb,
  pending_items jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);
```

This is enough for the hackathon MVP.

Do not add auth tables, team tables, billing tables, or vector search in the MVP.

---

## 17. ADA Context Builder

Every ADA LLM request should include compact workspace context.

Example:

```txt
SYSTEM:
You are ADA, AI Delivery Architect for IBM Bob workflows.

WORKSPACE MEMORY:
{ada_memory.summary}

PERMANENT CONSTRAINTS:
{ada_memory.constraints}

ACTIVE MISSION:
{current mission}

LATEST ARTIFACTS:
- latest plan
- latest spec
- latest Bob prompt
- latest QA report
- latest delivery report

RECENT CHAT:
last 12 messages

USER:
{current user message}
```

After ADA responds, the system saves:

user message,
ADA response,
generated artifact if applicable,
updated memory summary if needed.

---

## 18. IBM Bob Integration Strategy

IBM Bob must be visibly central.

Bob is used for:

scaffolding,
implementation,
documentation,
refactors,
iterative fixes,
tests if time allows.

The repo must include exported Bob evidence.

Bob task evidence belongs in:

bob_sessions/

Each relevant mission should include:

mission-XX-name-consumption-summary-01.png
mission-XX-name-task-history.md

If multiple screenshots are needed:

mission-XX-name-consumption-summary-01.png
mission-XX-name-consumption-summary-02.png

One mission should ideally map to one Bob chat/task.

---

## 19. Evidence Rules

For every relevant Bob mission:

Open a new Bob chat/task.
Run one scoped mission.
Validate actual repo changes.
Commit product changes if PASS.
Export Bob task history as Markdown.
Screenshot Bob task session consumption summary.
Save both under bob_sessions/.
Scan for secrets.
Commit evidence.

Evidence commits should be separate from product commits.

---

## 20. Security Rules

Never commit:

.env,
.env.local,
API keys,
Supabase service role keys,
OpenAI keys,
IBM Cloud credentials,
Bob credentials,
private tokens,
passwords.

Before committing evidence:

grep -R -i "api_key\|apikey\|secret\|token\|OPENAI\|SUPABASE\|IBM_CLOUD\|password" bob_sessions/*.md || true

If real secrets appear, remove or redact before commit.

---

## 21. Validation Rules

Before accepting any mission:

git status --short
git diff --stat
pnpm typecheck
pnpm lint
pnpm build

For UI changes, also run:

pnpm dev

Then validate in browser.

For starter-screen removal, check:

grep -R "To get started" apps/web/app/page.tsx apps/web/components 2>/dev/null || true
grep -R "Deploy Now" apps/web/app/page.tsx apps/web/components 2>/dev/null || true
grep -R "next.svg" apps/web/app/page.tsx apps/web/components 2>/dev/null || true

Expected output: empty.

---

## 22. Commit/Push Handoff

ADA must support professional delivery handoff.

After PASS:

summarize implementation,
list changed files,
list validation results,
list unresolved risks,
suggest commit message,
confirm push readiness.

Commit examples:

feat: add ADA chat-first control cockpit
docs: add ADA source of truth and Bob project rules
fix: repair workspace package configuration
docs: add Bob evidence for scaffold mission

Human lead approves final commit and push.

---

## 23. Demo Flow

### Scene 1 — Problem

AI coding is fast, but delivery becomes chaotic without discipline.

### Scene 2 — ADA Chat

Human gives messy intent to ADA.

### Scene 3 — Mission Intake

ADA turns the intent into a structured mission.

### Scene 4 — Planning Gate

ADA generates implementation plan, constraints, and non-goals.

### Scene 5 — Bob Mission

ADA generates a Bob-ready prompt.

### Scene 6 — Bob Execution

IBM Bob implements inside the repository.

### Scene 7 — ADA QA

ADA reviews Bob output and validates actual repo state.

### Scene 8 — Release Gate

ADA returns PASS, CONDITIONAL PASS, or FAIL.

### Scene 9 — Commit/Push Handoff

ADA prepares delivery report and suggested commit message.

### Scene 10 — Evidence

The repo includes Bob task exports and screenshots in bob_sessions/.

---

## 24. Judging Fit

### Application of Technology

Strong.

IBM Bob is central and visible as the builder. ADA makes Bob workflows more disciplined, reviewable, and judge-ready.

### Presentation

Strong if the demo clearly shows the flow:

Human intent → ADA → Bob → ADA QA → Release Gate

### Business Value

Strong.

ADA solves a real developer productivity and quality problem: AI coding speed without delivery discipline creates risk.

### Originality

Strong.

ADA is not just another generated app. It is a separation-of-duties workflow for AI-native software delivery.

---

## 25. Success Criteria for Hackathon MVP

The MVP succeeds if it demonstrates:

chat-first ADA cockpit,
mission intake,
Bob prompt generation,
QA gate,
release gate,
commit/push handoff,
persistent memory foundation,
Bob evidence folder,
source-of-truth documentation,
clear demo story.

---

## 26. Current Non-Goals

Do not build unless all core MVP work is complete:

authentication,
billing,
team accounts,
GitHub OAuth,
automatic GitHub push,
vector search,
pgvector,
evidence browser,
multi-workspace UI,
analytics dashboard,
Slack/Discord integrations,
CI/CD automation.

---

## 27. Product Doctrine

ADA must behave like a strict senior technical partner.

ADA should be:

direct,
structured,
skeptical of scope creep,
evidence-driven,
practical under time pressure,
obsessed with validation,
commit/push aware,
focused on real repository truth.

ADA should not:

praise incomplete work,
trust builder summaries blindly,
accept missing files,
ignore failed validation,
allow unrelated changes,
expand scope without human approval.

---

## 28. Current Implemented State

As of Mission 07 series completion, the following components are implemented and operational:

### Working Features

**ADA Cockpit UI**
- Chat-first control interface
- Workflow sidebar with mission phases
- Context panel with readiness checklist
- Bob Prompt Preview panel
- Project/workspace selector

**Persistent Projects/Workspaces**
- Projects persist in Supabase (`ada_workspaces`)
- Project creation and selection
- Project switching with isolated state
- Project list restoration after refresh

**Persistent Chat History**
- Chat messages persist per workspace (`ada_messages`)
- Chat history restores after page refresh
- Project-isolated chat context
- User and ADA message roles

**ADA Chat API**
- Server-side chat endpoint (`/api/ada/chat`)
- OpenAI-compatible LLM integration
- Context builder with workspace memory
- Structured prompt system

**Bob Prompt Preview Routing**
- Explicit Bob prompt requests route to Bob Prompt Preview
- Bob prompts kept out of normal chat display
- Copy-to-clipboard functionality
- Prompt/chat separation maintained

**Supabase Memory Foundation**
- Server-side only Supabase architecture
- No client-side Supabase exposure
- Active tables: `ada_workspaces`, `ada_messages`
- Prepared tables: `ada_artifacts`, `ada_missions`, `ada_memory`

### Current MVP Constraints

Still in effect:
- no auth
- no billing
- no GitHub OAuth
- no pgvector
- no vector DB
- no automatic commit/push
- no multi-user collaboration

---

## 29. Remaining Product Work

### High Priority — Core Flow Completion

**Structured Mission State**
- Persist current mission into `ada_missions`
- Track mission status (draft, active, review, complete)
- Link artifacts to missions

**Artifact Persistence**
- Persist Bob prompts into `ada_artifacts` (type: `bob_prompt`)
- Persist QA reports into `ada_artifacts` (type: `qa_report`)
- Persist delivery reports into `ada_artifacts` (type: `delivery_report`)
- Persist release gate decisions into `ada_artifacts` (type: `release_gate`)

**Workspace Memory Summaries**
- Persist project summaries into `ada_memory`
- Track permanent decisions per workspace
- Track constraints per workspace
- Track pending items per workspace

**Readiness Checklist Enhancement**
- Move from client-side heuristics to durable project state
- Track validation status per mission
- Track evidence status per mission
- Track commit readiness per mission

### Medium Priority — Polish & Demo

**QA Gate Flow**
- Structured PASS/CONDITIONAL PASS/FAIL verdicts
- Correction prompt generation
- Validation evidence tracking

**Delivery Report Generation**
- Markdown delivery report format
- Changed files summary
- Validation results
- Suggested commit message

**Evidence Browser** (optional)
- View Bob session exports
- Link evidence to missions
- Evidence status tracking

### Post-MVP — Optional Future

**Authentication** (only after MVP/demo)
- User accounts
- Workspace ownership
- Team collaboration

**GitHub Integration** (only after core flow stable)
- Repository connection
- Automatic diff retrieval
- Optional commit/push assistance

**Advanced Memory** (only if needed)
- Vector search for long-term memory
- Semantic artifact retrieval
- Cross-project insights

---

## 30. Final Product Statement

ADA is a mission-control companion for IBM Bob that transforms chaotic AI coding into disciplined software delivery through structured missions, planning gates, independent QA review, evidence-based release workflows, and human-approved commit/push handoff.

Bob builds. Ada orchestrates and reviews. You lead.
