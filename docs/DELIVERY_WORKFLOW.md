# ADA Delivery Workflow

**Project:** ADA — AI Delivery Architect  
**Repository:** `ada-fullstack-ibm-bob`  
**Status:** Hackathon MVP Source of Truth

---

## Overview

ADA implements a structured delivery workflow around IBM Bob:

```txt
Human Lead → ADA → IBM Bob → ADA QA → Release Gate → Commit/Push
```

The workflow is the product.

The cockpit also includes an in-product **How ADA Works** modal so judges and new users can understand the flow inside the application itself.

---

## The Real Workflow Today

### 1. Create or Select a Project

- Projects persist in Supabase.
- Each project is an isolated workspace.
- Each workspace keeps its own chat, artifacts, missions, and memory.
- Projects can be deleted with confirmation.
- If the selected workspace no longer exists, ADA recovers by selecting a valid workspace or creating a fallback workspace before chat is re-enabled.

### 2. Describe the Mission

- The human lead describes the objective.
- ADA clarifies scope, constraints, and expected output.
- ADA keeps the discussion in chat instead of immediately dumping implementation prompts.

### 3. Generate a Bob Prompt

- Explicit Bob-prompt requests route the full implementation prompt to Bob Prompt Preview.
- Chat shows only a short confirmation, not the full prompt.
- The prompt persists as a `bob_prompt` artifact.
- Persisting a Bob prompt creates or updates the active mission for that workspace.

### 4. Let Bob Build

- The human lead copies the prompt into IBM Bob.
- Bob works inside the repository.
- Bob returns implementation output and task evidence.

### 5. Export or Preserve Builder Evidence

- IBM Bob task evidence belongs in `bob_sessions/`.
- Continuity and recovery evidence completed later with Codex belongs in `others_sessions/`.
- ADA’s product doctrine remains the same across both evidence lanes: repository truth first, evidence preserved honestly.

### 6. Review Builder Output in ADA

ADA reviews:

- builder summary,
- actual `git status`,
- actual `git diff`,
- validation results,
- known risks,
- scope alignment.

ADA does not accept the builder summary as truth.

### 7. ADA Produces QA

- ADA can emit explicit `QA Verdict:` lines.
- Non-pending verdicts auto-record durable `qa_report` artifacts.
- QA determines whether the scoped mission was completed correctly.

### 8. Export Delivery Evidence

- Exporting Markdown persists a `delivery_report` artifact first.
- Only after successful persistence does ADA mark evidence exported as PASS.
- If persistence fails, the report can still download, but evidence state remains PENDING.

### 9. Record Release Gate

- Release Gate is the final human-controlled delivery decision.
- If a saved `release_gate` artifact exists, it is the displayed truth.
- If no saved release gate exists, ADA derives a recommendation from QA plus evidence state.

### 10. Close Mission and Open the Next One

- A project can contain multiple missions.
- Closing a mission preserves history, artifacts, and memory.
- The cockpit resets active delivery UI state for the next mission.
- If no active mission exists, `Open New Mission` opens a real intake modal and creates a new `ada_missions` row in `planning` state.
- Mission intake structures the next delivery cycle in chat first. It does not automatically generate a Bob prompt or `bob_prompt` artifact.
- Bob Prompt generation is a separate explicit action and only happens when the user directly asks for a Bob prompt, including the supported shorthand and typo variants handled by the cockpit.
- Chat intent to close a mission routes into the same confirmation modal as the manual Close Mission button.
- Chat intent to open a new mission is intercepted locally so ADA can route the user into the same Open New Mission confirmation modal used by the UI button.
- If no active mission exists, ADA reports that the project is ready for the next scoped mission instead of describing workspace status as plain `PENDING`.

---

## Current Durable State Rules

- Browser clients talk only to Next.js API routes.
- Supabase remains server-side only.
- `ada_artifacts` is the durable source of truth for operational delivery state.
- `ada_memory` is a deterministic summary derived from mission state and latest artifacts.
- If artifacts and memory disagree, artifacts win.
- `qa_report`, `delivery_report`, and `release_gate` are workspace-scoped durable delivery records.
- Active cockpit artifacts resolve against the active mission instead of the latest artifact anywhere in the workspace.
- `ada_missions` stores the mission lifecycle for repeated delivery cycles inside one project.

---

## Workflow Semantics

### QA is not release

QA asks:

> Did the builder complete the scoped mission correctly?

Release Gate asks:

> Does the human lead allow commit/push after QA, evidence, and approval?

Those are different decisions and must remain separate in product language and state.

### Mission record status is not delivery status

- **Mission record status** comes from `ada_missions`.
- **Delivery status** comes from durable artifacts.

If a release gate has been recorded, delivery status is authoritative for release readiness even if the mission record is still marked with an internal lifecycle state such as `planning`.

---

## Bob Prompt Preview Rules

Bob Prompt Preview is exclusively for real Bob implementation prompts.

### Bob Prompt Preview should contain

- mission title,
- implementation context,
- scope,
- constraints,
- validation requirements,
- evidence expectations.

### Bob Prompt Preview should not contain

- QA verdicts,
- release decisions,
- delivery reports,
- general conversation,
- commit suggestions.

QA-like content must remain in chat and must not overwrite Bob Prompt Preview.

---

## QA Workflow

### Normal path

1. ADA reviews builder output.
2. ADA emits a `QA Verdict: ...` line.
3. Non-pending verdicts auto-record a `qa_report`.
4. The cockpit shows `QA Report recorded`.

### Fallback path

If auto-record is missed, a manual recovery action can appear:

- `Record QA Report Manually`

That is fallback-only, not the normal UX.

---

## Release Gate Workflow

### If no recorded release gate exists

ADA shows a **Recommended Release Gate** based on:

- latest QA status,
- evidence exported state.

### If a recorded release gate exists

ADA shows a **Recorded Release Gate**.

The saved artifact wins over the recommendation.

Once a non-pending release gate is recorded, the cockpit should no longer look like approval is still pending.

---

## Mission Lifecycle

Projects can run repeated delivery cycles.

### Active mission loading

Active mission states include:

- `draft`
- `planning`
- `active`
- `ready`
- `in_progress`
- `review`

### Closed mission outcomes

Closed outcomes include:

- `approved`
- `approved_with_conditions`
- `blocked`
- `closed`
- `complete`

Closing a mission:

- preserves chat,
- preserves artifacts,
- preserves project memory,
- increments closed mission count,
- clears active-cycle UI state,
- prepares the project for the next mission.

---

## Validation Doctrine

Before work is accepted, ADA expects:

```bash
git status --short
git diff --stat
pnpm typecheck
pnpm lint
pnpm build
```

For UI work:

```bash
pnpm dev
```

Then validate the browser manually.

---

## Delivery Summary

The workflow is intentionally strict:

- Bob builds.
- ADA reviews.
- The human lead approves release.

That is the value of the product. It turns AI coding into a repeatable, evidence-backed delivery loop instead of a loose chat experience.
