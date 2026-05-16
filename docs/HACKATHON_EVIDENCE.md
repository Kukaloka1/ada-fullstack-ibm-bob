# ADA Hackathon Evidence Documentation

**Project:** ADA — AI Delivery Architect  
**Hackathon:** IBM Bob Hackathon  
**Repository:** `ada-fullstack-ibm-bob`  
**Status:** Hackathon Evidence Source of Truth  

---

## 1. Purpose

This document tracks the IBM Bob evidence required for the ADA hackathon submission.

ADA is being built with a disciplined workflow:

```txt
Human Lead → ADA → IBM Bob → ADA QA → Release Gate → Commit/Push
```

The goal is not only to show a working application, but to prove that IBM Bob was used as the builder inside a controlled AI-native delivery process.

---

## 2. Official Evidence Requirement

The IBM Bob Hackathon requires the final public GitHub repository to include exported IBM Bob task session reports for relevant project work.

For each relevant Bob task, the repository should include:

exported Bob task history as Markdown,
screenshot of the Bob task session consumption summary,
clear mapping between Bob task, repository change, validation, and commit,
no exposed credentials or secrets.

Evidence files are stored in:

bob_sessions/

The repository must remain public and reviewable for judges.

---

## 3. Evidence Doctrine

ADA’s evidence doctrine:

If it is not in the repository, it is not real.
If it is not validated, it is not accepted.
If it is not evidenced, it is not submission-ready.

Bob can generate summaries, but ADA validates the actual repository state.

For every mission, ADA checks:

git status --short
git diff --stat
pnpm typecheck
pnpm lint
pnpm build

For UI changes, ADA also validates the browser manually.

---

## 4. Bob Session Export Checklist

For every relevant Bob mission:

 Use a new Bob chat/task for the mission.
 Give the mission a clear title.
 Keep the mission scoped.
 Validate actual repository changes after Bob runs.
 Run pnpm typecheck.
 Run pnpm lint.
 Run pnpm build.
 Commit product changes only after PASS.
 Open Bob History.
 Select the correct task.
 Screenshot the task session consumption summary.
 Export the task history as Markdown.
 Save both files under bob_sessions/.
 Scan exported Markdown for secrets.
 Commit evidence separately from product changes.

---

## 5. Naming Convention

Use flat files inside bob_sessions/.

Do not use nested folders unless absolutely necessary.

### Standard format

mission-XX-short-name-task-history.md
mission-XX-short-name-consumption-summary-01.png

### Multiple screenshots

mission-XX-short-name-consumption-summary-01.png
mission-XX-short-name-consumption-summary-02.png

### Current convention

mission-01-scaffold-task-history.md
mission-01-scaffold-consumption-summary-01.png
mission-01-scaffold-consumption-summary-02.png

mission-02-source-of-truth-task-history.md
mission-02-source-of-truth-consumption-summary-01.png

---

## 6. Current Evidence Inventory

The following Bob session evidence has been collected and committed to the repository:

### Mission 01 — Scaffold / ADA Cockpit
**Status:** ✅ Complete
**Files:**
- `bob_sessions/mission-01-scaffold-task-history.md`
- `bob_sessions/mission-01-scaffold-consumption-summary-01.png`
- `bob_sessions/mission-01-scaffold-consumption-summary-02.png`

**Summary:** Initial Turborepo + Next.js scaffold. ADA cockpit was recovered after QA found default Next screen still present.

**Validation:** Typecheck ✅ | Lint ✅ | Build ✅ | Browser ✅

---

### Mission 02 — Source of Truth Documentation
**Status:** ✅ Complete
**Files:**
- `bob_sessions/mission-02-source-of-truth-task-history.md`
- `bob_sessions/mission-02-source-of-truth-consumption-summary-01.png`

**Summary:** ADA spec, delivery workflow, Bob project rules, and evidence documentation.

**Validation:** Typecheck ✅ | Lint ✅ | Build ✅

---

### Mission 02A — Markdown Formatting Cleanup
**Status:** ✅ Complete
**Files:**
- `bob_sessions/mission-02a-clean-markdown-formatting-task-history.md`
- `bob_sessions/mission-02a-clean-markdown-formatting-consumption-summary-01.png`

**Summary:** Fixed markdown formatting issues in documentation files.

**Validation:** Typecheck ✅ | Lint ✅ | Build ✅

---

### Mission 03 — Supabase Memory Foundation
**Status:** ✅ Complete
**Files:**
- `bob_sessions/mission-03-memory-foundation-task-history.md`
- `bob_sessions/mission-03-memory-foundation-consumption-summary-01.png`

**Summary:** Minimal Supabase schema with `ada_workspaces`, `ada_messages`, `ada_missions`, `ada_artifacts`, and `ada_memory` tables.

**Validation:** Typecheck ✅ | Lint ✅ | Build ✅

---

### Mission 03A — Server-Side Supabase Architecture
**Status:** ✅ Complete
**Files:**
- `bob_sessions/mission-03a-server-side-supabase-task-history.md`
- `bob_sessions/mission-03a-server-side-supabase-consumption-summary-01.png`

**Summary:** Moved Supabase to server-side only. No client-side Supabase exposure.

**Validation:** Typecheck ✅ | Lint ✅ | Build ✅

---

### Mission 04 — ADA Chat API + Context Builder
**Status:** ✅ Complete
**Files:**
- `bob_sessions/mission-04-chat-api-context-builder-task-history.md`
- `bob_sessions/mission-04-chat-api-context-builder-consumption-summary-01.png`

**Summary:** Chat endpoint, OpenAI integration, workspace context builder, and memory injection.

**Validation:** Typecheck ✅ | Lint ✅ | Build ✅

---

### Mission 05 — Wire Chat UI
**Status:** ✅ Complete
**Files:**
- `bob_sessions/mission-05-wire-chat-ui-task-history.md`
- `bob_sessions/mission-05-wire-chat-ui-consumption-summary-01.png`

**Summary:** Connected chat UI to backend API with message persistence.

**Validation:** Typecheck ✅ | Lint ✅ | Build ✅ | Browser ✅

---

### Mission 05B — Polish Chat UX
**Status:** ✅ Complete
**Files:**
- `bob_sessions/mission-05b-polish-chat-ux-task-history.md`
- `bob_sessions/mission-05b-polish-chat-ux-consumption-summary-01.png`

**Summary:** Improved chat panel UX with better styling and interaction patterns.

**Validation:** Typecheck ✅ | Lint ✅ | Build ✅ | Browser ✅

---

### Mission 06 — Persistent Project Chat Workspace
**Status:** ✅ Complete
**Files:**
- `bob_sessions/mission-06-persistent-project-chat-workspace-task-history.md`
- `bob_sessions/mission-06-persistent-project-chat-workspace-consumption-summary-01.png`

**Summary:** Projects persist in Supabase with isolated chat history per workspace.

**Validation:** Typecheck ✅ | Lint ✅ | Build ✅ | Browser ✅

---

### Mission 06A — Persistent Project Fix
**Status:** ✅ Complete
**Files:**
- `bob_sessions/mission-06a-persistent-project-fix-task-history.md`
- `bob_sessions/mission-06a-persistent-project-fix-consumption-summary-01.png`

**Summary:** Fixed project state loop and improved project switching behavior.

**Validation:** Typecheck ✅ | Lint ✅ | Build ✅ | Browser ✅

---

### Mission 07 Series — Doctrine & Prompt Routing
**Status:** ✅ Complete
**Files:**
- `bob_sessions/mission-07-harden-ada-doctrine-task-history.md`
- `bob_sessions/mission-07-harden-ada-doctrine-consumption-summary-01.png`
- `bob_sessions/mission-07a-fix-intake-vs-bob-prompt-task-history.md`
- `bob_sessions/mission-07a-fix-intake-vs-bob-prompt-consumption-summary-01.png`
- `bob_sessions/mission-07b-clean-bob-prompt-history-task-history.md`
- `bob_sessions/mission-07b-clean-bob-prompt-history-consumption-summary-01.png`
- `bob_sessions/mission-07c-explicit-bob-prompt-routing-task-history.md`
- `bob_sessions/mission-07c-explicit-bob-prompt-routing-consumption-summary-01.png`
- `bob_sessions/mission-07d-isolate-project-prompt-state-task-history.md`
- `bob_sessions/mission-07d-isolate-project-prompt-state-consumption-summary-01.png`
- `bob_sessions/mission-07e-chat-preview-separation-manual-fix.md` (manual QA fix note)

**Summary:** Hardened ADA doctrine, separated Bob prompts from chat display, implemented Bob Prompt Preview routing, and isolated project prompt state.

**Validation:** Typecheck ✅ | Lint ✅ | Build ✅ | Browser ✅


### Mission 08 / 08A / 08B / 09 — Structured Persistence Completion
**Status:** In repo; evidence export still pending for the latest mission pass
**Files:**
- Evidence will be exported after Mission 08A completion

**Summary:** Structured persistence now includes artifact and mission APIs, durable Bob prompt restoration, delivery report persistence, workspace-state reset on project switching, duplicate Bob prompt suppression during refresh/history reload, active mission persistence sourced from Bob prompt generation, and durable QA/release gate artifacts.

**Implementation:**
- GET/POST `/api/ada/artifacts`
- GET/POST/PATCH `/api/ada/missions`
- `bob_prompt`, `delivery_report`, `qa_report`, `release_gate`, `plan`, `spec`, and `note` validation in the artifact API
- explicit workspace reset before durable reload so prompts and missions do not leak across projects
- Bob Prompt Preview restores from the latest persisted artifact instead of fake default state
- persisting a new Bob prompt also creates or updates the active mission row for that workspace
- Current Mission restores from `ada_missions` after refresh and project return
- QA reports persist as `qa_report` artifacts
- Release gate decisions persist as `release_gate` artifacts
- latest QA and release gate state restore from durable artifacts after refresh/project switching
- delivery report export keeps download behavior and persists a workspace-scoped `delivery_report`
- readiness derives from durable artifacts plus active mission/message state

**Validation:** Pending latest Mission 09 run

---
---

## 7. Evidence Naming Flexibility

Evidence files are valid if they meet these requirements:

**Required:**
- Located in `bob_sessions/`
- Mission number clearly identifiable
- File purpose clear (task-history or consumption-summary)

**Accepted naming patterns:**
- Slug-based: `mission-XX-short-name-task-history.md`
- Bob-title-based: `mission-XX-Bob-Generated-Title-task-history.md`
- Manual fix notes: `mission-XXx-description-manual-fix.md`

**Do not force renaming existing evidence.** The current evidence inventory uses both patterns and all are valid.

---

## 7. Evidence Storage Structure

Expected final structure:

bob_sessions/
├── README.md
├── mission-01-scaffold-task-history.md
├── mission-01-scaffold-consumption-summary-01.png
├── mission-01-scaffold-consumption-summary-02.png
├── mission-02-source-of-truth-task-history.md
├── mission-02-source-of-truth-consumption-summary-01.png
├── mission-03-memory-foundation-task-history.md
├── mission-03-memory-foundation-consumption-summary-01.png
└── ...
```

---

## 8. Security Rules

### Never commit secrets

Never commit:

.env
.env.local
API keys
OpenAI keys
Supabase service role keys
IBM Cloud credentials
IBM Bob credentials
database passwords
private tokens
session tokens
user credentials

### Safe to include

Safe evidence may include:

task prompts,
task summaries,
file paths,
architecture decisions,
validation command output,
token or Bobcoin usage summary,
screenshots without secrets,
commit hashes,
public configuration.

---

## 9. Secret Scan Before Evidence Commit

Before committing Bob Markdown exports:

grep -R -i "api_key\|apikey\|secret\|token\|OPENAI\|SUPABASE\|IBM_CLOUD\|password" bob_sessions/*.md || true

If a real secret appears, remove or redact it before committing.

Words like "OpenAI-compatible API", "Supabase-ready", "token usage", or "do not commit secrets" are not secrets by themselves.

---

## 10. Validation Requirements

### Required after every product mission

pnpm typecheck
pnpm lint
pnpm build
```

### Required for UI missions

```bash
pnpm dev

```

Then manually confirm the browser output.

### Required for default Next.js removal

```bash
grep -R "To get started" apps/web/app/page.tsx apps/web/components 2>/dev/null || true
grep -R "Deploy Now" apps/web/app/page.tsx apps/web/components 2>/dev/null || true
grep -R "next.svg" apps/web/app/page.tsx apps/web/components 2>/dev/null || true
```

Expected output:

Empty output means the starter content was removed.

---

## 11. Mission 01 QA Note

Mission 01 exposed the exact problem ADA is designed to solve.

Bob was used to scaffold the project, but the first repository validation showed delivery issues:

Bob initially operated in the wrong workspace.
The official repository still showed the default Next.js screen.
The expected component files were not present in the official repo.
ADA QA caught the mismatch using git diff, grep, build validation, and browser validation.

Final result:

repository was corrected,
ADA cockpit became visible,
typecheck/lint/build passed,
evidence was preserved honestly.

This strengthens the product narrative:

Bob builds, but ADA verifies the actual delivery state.

---

## 12. Evidence Review Process

### Before committing product work
Confirm correct repository path.
Confirm correct branch.
Run git status --short.
Run git diff --stat.
Run validation commands.
Confirm no unrelated changes.
Commit only after PASS.

### Before committing evidence
Export Bob task history as Markdown.
Screenshot task session consumption summary.
Save files under bob_sessions/.
Run secret scan.
Confirm file names match convention.
Commit evidence separately.

---

## 13. Commit Strategy

Product commits and evidence commits should be separate.

### Product commit examples

feat: add ADA chat-first control cockpit
docs: add ADA source of truth and Bob project rules
feat: add Supabase memory foundation
feat: add ADA chat API and context builder
```

### Evidence commit examples

```
docs: add Bob evidence for scaffold mission
docs: add Bob evidence for source of truth mission
docs: add Bob evidence for memory foundation mission
```

---

## 14. Submission Package

Final submission should include:

public GitHub repository,
working application URL,
README,
docs/ADA_SPEC.md,
docs/DELIVERY_WORKFLOW.md,
docs/HACKATHON_EVIDENCE.md,
AGENTS.md,
bob_sessions/ folder with exported Bob reports,
demo video or live demo,
clear explanation of Bob's role.

---

## 15. Notes for Judges

ADA is designed to orchestrate IBM Bob, not replace it.

The three-role model is:

Human Lead — defines intent and approves releases.
IBM Bob — executes implementation work inside the repository.
ADA — plans, validates, controls delivery, and tracks evidence.

ADA adds:

mission discipline,
Bob-ready prompt generation,
independent QA,
release gates,
evidence tracking,
commit/push handoff.

The product demonstrates how AI-assisted development becomes safer and more professional when implementation and review are separated.

---

## 16. Mission Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Complete | Mission finished, validated, and evidence collected |
| 🔄 In Progress | Mission currently being worked on |
| ⏳ Planned | Scheduled for future execution |
| ⚠️ Needs Review | Completed but not fully validated |
| ❌ Blocked | Cannot proceed until issue is resolved |

---

## 17. Current Evidence Status
Mission 01: evidence collected
Mission 02: pending evidence export after commit
Mission 03: planned
Mission 04: planned
Mission 05: planned
Mission 06: planned
Mission 07: planned

---

## 18. Final Rule

No mission is accepted because Bob says it is done.

A mission is accepted only when:

repo changes exist
validation passes
browser/demo works if applicable
human lead approves
evidence is tracked

That is ADA.

---

## 17. Completed vs Remaining

### ✅ Completed

**Infrastructure & Foundation**
- Turborepo/Next.js scaffold
- ADA cockpit UI
- Supabase memory schema (5 tables)
- Server-side Supabase architecture
- No client-side Supabase exposure

**Core Features**
- ADA chat API with OpenAI integration
- Context builder with workspace memory
- Persistent workspace/projects
- Persistent chat history per workspace
- Project switching with isolated state
- Bob Prompt Preview routing
- Prompt/chat separation
- Copy-to-clipboard for Bob prompts

**Evidence Workflow**
- 15+ Bob session exports collected
- Task history markdown exports
- Consumption summary screenshots
- Evidence stored in `bob_sessions/`
- Evidence scanned for secrets

### 🔄 Remaining

**High Priority — Core Flow**
- Durable mission state in `ada_missions`
- Durable artifacts in `ada_artifacts`
- Durable memory summaries in `ada_memory`
- Real release gate persistence
- Structured QA report persistence
- Delivery report persistence

**Medium Priority — Polish**
- Readiness checklist from durable state (not client heuristics)
- Evidence browser UI (optional)
- Final demo polish
- Deployment/submission packaging

**Post-MVP — Optional Future**
- Authentication (only after MVP/demo)
- GitHub integration (only after core flow stable)
- Vector search/pgvector (only if needed)
- Multi-user collaboration
- CI/CD integration

---

## 18. Final Rule

No mission is accepted because Bob says it is done.

A mission is accepted only when:

repo changes exist
validation passes
browser/demo works if applicable
human lead approves
evidence is tracked

That is ADA.
