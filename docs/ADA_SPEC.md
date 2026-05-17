# ADA Product Specification

**Project:** ADA — AI Delivery Architect  
**Repository:** `ada-fullstack-ibm-bob`  
**Status:** Hackathon MVP Source of Truth

---

## 1. Product Identity

ADA is AI delivery software for IBM Bob.

ADA is the delivery cockpit around IBM Bob-led software delivery workflows. It turns AI coding sessions into scoped missions, persistent project context, evidence-backed QA, and controlled release handoffs.

ADA is not:

- a generic chatbot,
- a Bob replacement,
- a coding assistant,
- an IDE,
- a deployment platform.

ADA is the delivery control layer.

**Core tagline:**

> Bob builds. ADA reviews. You lead.

---

## 2. Product Thesis

AI builders can generate code quickly, but software delivery requires more than generation.

ADA exists because delivery needs:

- scoped missions,
- durable project context,
- explicit evidence,
- independent QA,
- human-controlled release approval.

The product itself was built using that doctrine.

---

## 3. Three-Role Model

### Human Lead

Owns:

- product intent,
- priorities,
- constraints,
- final approval,
- commit/push decision.

### IBM Bob

Owns:

- implementation inside the repository,
- scoped code changes,
- documentation updates when requested,
- task-session evidence exports.

### ADA

Owns:

- mission intake,
- planning discipline,
- Bob prompt generation,
- durable project state,
- QA review,
- evidence tracking,
- release readiness,
- mission lifecycle handoff.

---

## 4. Current Product Scope

The current ADA MVP supports:

- persistent projects and workspaces,
- persistent chat history per workspace,
- explicit Bob Prompt Preview routing,
- durable artifacts in Supabase,
- active mission persistence,
- deterministic workspace memory,
- auto-recorded QA reports from ADA verdicts,
- durable release gate decisions,
- delivery report export,
- project deletion with scoped cleanup,
- workspace recovery when the selected workspace is missing,
- multiple missions inside the same project,
- close mission and open next mission controls,
- explicit new-mission intake modal that creates real mission rows,
- mission intake kept separate from explicit Bob prompt generation,
- onboarding copy inside the cockpit.

The MVP does not include:

- auth,
- billing,
- GitHub OAuth,
- vector DB,
- pgvector,
- automated push,
- multi-user collaboration,
- enterprise workflow sprawl.

---

## 5. Core Workflow

```txt
Human Lead
→ ADA Mission Intake
→ Bob-ready Prompt
→ IBM Bob Execution
→ ADA QA Review
→ Delivery Evidence
→ Release Gate
→ Commit / Push
```

### Delivery meaning

- **QA** answers: did the builder complete the scoped mission correctly?
- **Release Gate** answers: is commit/push allowed after QA, evidence, and human approval?

QA is not release. Release is not a QA dropdown.

---

## 6. Durable State Model

ADA relies on Supabase for durable workspace state.

### Tables

- `ada_workspaces`
  Project containers.
- `ada_messages`
  Persistent chat history.
- `ada_artifacts`
  Durable operational artifacts.
- `ada_missions`
  Mission rows for repeated delivery cycles.
- `ada_memory`
  Deterministic workspace summary derived from artifacts and mission state.

### Artifact types in active use

- `bob_prompt`
- `qa_report`
- `delivery_report`
- `release_gate`

Artifacts are the durable source of truth.

`ada_memory` is a derived summary layer used to keep ADA context compact. If artifacts and memory disagree, artifacts win.

For active cockpit state, artifacts must resolve to the active mission. Workspace-wide latest-artifact lookup is not sufficient once a project contains multiple missions.

---

## 7. Mission Model

A project can contain multiple missions.

Opening a new mission is a real lifecycle action, not chat-only intent. When no active mission exists, ADA opens a new mission intake flow that creates a fresh `ada_missions` row in `planning` state for the current workspace. Users can trigger that same flow from the UI or by explicit chat intent, and both paths use the same confirmation modal.

Lifecycle intent detection is deterministic and typo-tolerant for the supported English and Spanish phrases used in the cockpit. Close-mission intent never goes to the LLM first; it always routes into the lifecycle modal or returns a local no-active-mission response.

Explicit Bob prompt requests are also typo-tolerant for the supported shorthand forms used in the cockpit. When a supported Bob prompt intent is detected, ADA routes the generated prompt exclusively to Bob Prompt Preview and persists it as a `bob_prompt` artifact for the active mission.

### Active mission statuses

ADA treats these as active lifecycle states:

- `draft`
- `planning`
- `active`
- `ready`
- `in_progress`
- `review`

### Closed mission outcomes

ADA uses these as closed or terminal mission states:

- `approved`
- `approved_with_conditions`
- `blocked`
- `closed`
- `complete`

Closing a mission:

- preserves project history,
- preserves artifacts,
- preserves project memory,
- keeps the workspace selected,
- resets the active delivery UI for the next mission.

---

## 8. Bob Prompt Preview Rules

Bob Prompt Preview is only for real Bob implementation prompts.

### What routes there

- explicit Bob prompt requests,
- real Bob mission content.

### What stays in chat

- mission discussion,
- QA reviews,
- delivery reports,
- commit suggestions,
- release decisions,
- general conversation.

QA-like output must never overwrite Bob Prompt Preview.

Invalid QA-looking `bob_prompt` artifacts are ignored by the UI.

---

## 9. QA Model

ADA derives QA verdicts from workflow state.

### Verdicts

- `PASS`
- `CONDITIONAL_PASS`
- `FAIL`
- `PENDING`

### Current behavior

- live ADA review output with `QA Verdict:` markers updates the current verdict,
- non-pending live verdicts auto-record a `qa_report`,
- `PENDING` does not auto-record,
- manual QA record is fallback-only if automatic persistence is missed.

`QA review complete` becomes PASS when a non-pending `qa_report` exists as a durable artifact.

---

## 10. Release Gate Model

Release Gate is the final human-controlled delivery decision.

### Current behavior

- if a recorded `release_gate` artifact exists, it is the displayed truth,
- if no recorded release gate exists, ADA derives a recommendation from QA plus evidence state,
- once a non-pending release gate is recorded, the cockpit settles into a recorded state rather than continuing to look like approval is still pending.

### Release meanings

- `PASS`
  Commit/push allowed.
- `CONDITIONAL_PASS`
  Commit/push allowed with documented conditions.
- `FAIL`
  Release blocked.
- `PENDING`
  Not ready for release.

---

## 11. Delivery Status Versus Mission Record Status

ADA separates two different statuses:

- **Mission record status**
  Internal lifecycle state from `ada_missions`.
- **Delivery status**
  Artifact-derived release state from `qa_report`, `delivery_report`, and `release_gate`.

If they differ, delivery status is authoritative for release readiness.

That avoids the common confusion where the mission row may still say `planning` while durable artifacts already show the project is approved with conditions.

---

## 12. ADA Memory

`ada_memory` is implemented as a deterministic per-workspace summary.

It stores:

- `summary`
- `decisions`
- `constraints`
- `pending_items`

Memory is derived from:

- latest active or closed mission,
- latest `bob_prompt`,
- latest `qa_report`,
- latest `delivery_report`,
- latest `release_gate`.

If memory is missing or stale, ADA backfills it before building chat context.

---

## 13. Chat Context Hydration

Before ADA responds, chat context is hydrated from durable workspace state.

The compact context includes:

- current mission title,
- mission record status,
- delivery status,
- Bob prompt available: yes/no,
- latest QA status,
- evidence exported: yes/no,
- release gate recorded: yes/no,
- latest release gate status,
- project memory summary,
- latest decisions,
- constraints,
- pending items.

Artifacts remain the authority. Memory helps ADA respond concisely.

---

## 14. Project Lifecycle Controls

The cockpit currently supports:

- create/select project,
- delete project with confirmation,
- recover when the selected/default workspace is missing,
- close active mission,
- open next mission in the same project.

Closing a mission must always be treated as a real workflow action, not a conversational claim.

That is why close intent from chat routes into the same confirmation modal as the UI control.

---

## 15. Evidence Model

The repository preserves two evidence lanes:

- `bob_sessions/`
  Official IBM Bob evidence for the public hackathon submission.
- `others_sessions/`
  Continuity and recovery evidence completed with Codex after IBM Bob budget exhaustion.

This split is intentional.

IBM Bob remains the central builder in the official hackathon narrative. Continuity work completed later is documented separately rather than being misrepresented as Bob evidence.

---

## 16. Validation Expectations

Every product mission must report:

- changed files,
- validation commands,
- validation result,
- known risks,
- suggested commit message.

Minimum validation:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

For UI missions:

```bash
pnpm dev
```

Then confirm the browser output manually.

---

## 17. Current Constraints

For the hackathon MVP:

- no auth,
- no billing,
- no GitHub OAuth,
- no vector DB,
- no pgvector,
- no client-side Supabase,
- no secrets in repo,
- no automatic push without human approval.

---

## 18. Product Summary

ADA is a serious, narrow MVP:

- Bob builds,
- ADA structures and reviews,
- the human lead decides.

The product is valuable because it turns AI coding into a controlled delivery loop with durable state, QA, evidence, and release discipline.
