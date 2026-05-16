# IBM Bob Session Evidence

**Project:** ADA — AI Delivery Architect  
**Repository:** `ada-fullstack-ibm-bob`  
**Purpose:** Store IBM Bob task session evidence for hackathon judging  
**Status:** Active Evidence Folder  

---

## 1. Purpose

This folder contains exported IBM Bob task evidence for the ADA project.

ADA is being built with a disciplined AI-native delivery workflow:

```txt
Human Lead → ADA → IBM Bob → ADA QA → Release Gate → Commit/Push
```

IBM Bob is the builder.
ADA validates the delivery.
The human lead approves the release.

This folder proves that IBM Bob was used as a core part of the project workflow.

---

## 2. What Belongs Here

For each relevant IBM Bob mission, this folder should include:

### Task history export
Markdown file exported from Bob History.
Contains the task prompt and session history.

### Consumption summary screenshot
PNG screenshot from Bob task session consumption summary.
Shows usage/consumption information for the task.

### Optional supporting screenshots
Only if useful.
Do not include screenshots with secrets or private credentials.

---

## 3. Naming Convention

Use flat files directly inside bob_sessions/.

Do not use nested folders unless absolutely necessary.

### Evidence Naming Flexibility

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

### Current naming examples

mission-01-scaffold-task-history.md
mission-01-scaffold-consumption-summary-01.png
mission-01-scaffold-consumption-summary-02.png

mission-02-source-of-truth-task-history.md
mission-02-source-of-truth-consumption-summary-01.png

mission-03-memory-foundation-task-history.md
mission-03-memory-foundation-consumption-summary-01.png

mission-07-harden-ada-doctrine-task-history.md
mission-07a-fix-intake-vs-bob-prompt-task-history.md
mission-07e-chat-preview-separation-manual-fix.md

---

## 4. Current Evidence Files

### Mission 01 — Scaffold / ADA Cockpit

Status: Complete

Expected files:

mission-01-scaffold-task-history.md
mission-01-scaffold-consumption-summary-01.png
mission-01-scaffold-consumption-summary-02.png

Summary:

IBM Bob was used for the initial scaffold mission.
The project was validated through ADA QA.
The final repo state includes a working Turborepo / Next.js / TypeScript / Tailwind app.
The ADA cockpit was recovered and validated after QA found the default Next.js screen still present.

Validation:

pnpm typecheck: PASS
pnpm lint: PASS
pnpm build: PASS
browser validation: PASS

Mission lesson:

Bob builds, but ADA verifies the actual repository state.

### Mission 02 — Source of Truth Documentation

Status: Pending evidence export / or Complete after export

Expected files:

mission-02-source-of-truth-task-history.md
mission-02-source-of-truth-consumption-summary-01.png

Summary:

ADA source-of-truth documentation.
Hackathon evidence rules.
Delivery workflow.
Bob project rules.
Evidence folder README.

Validation:

pnpm typecheck: PASS
pnpm lint: PASS
pnpm build: PASS

---

## 5. Evidence Export Process

For each mission:

Start a new IBM Bob chat/task.
Use a scoped mission prompt.
Let Bob execute the mission.
Validate actual repository state.
Commit product or documentation changes after PASS.
Open Bob History.
Select the correct task.
Screenshot the task session consumption summary.
Export task history as Markdown.
Save both files in this folder.
Scan evidence for secrets.
Commit evidence separately.

Recommended flow:

1 mission = 1 Bob chat/task
1 product commit
1 task-history markdown export
1+ consumption summary screenshot
1 evidence commit

Current pending evidence:

- Mission 08 / 08A structured persistence recovery and hardening
- Export the Bob task history markdown after the hardening pass is accepted
- Capture at least one consumption summary screenshot for the Mission 08A correction task

---

## 6. Validation Before Evidence Commit

Before committing evidence, run:

```bash
git status --short
find bob_sessions -maxdepth 1 -type f -print | sort
```

Scan Markdown exports:

```bash
grep -R -i "api_key\|apikey\|secret\|token\|OPENAI\|SUPABASE\|IBM_CLOUD\|password" bob_sessions/*.md || true
```

Words like the following are not secrets by themselves:

OpenAI-compatible API
Supabase-ready
token usage
do not commit secrets

If a real credential appears, redact it before committing.

---

## 7. Security Rules

Never include:

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
screenshots showing secrets

Safe to include:

mission prompts,
file paths,
public architecture decisions,
validation commands,
build/lint/typecheck output,
Bob consumption summary screenshots,
exported Bob task history without secrets.

---

## 8. Evidence Quality Standard

Good evidence is:

clearly named,
mapped to one mission,
stored in this folder,
free of secrets,
connected to a commit,
referenced in docs/HACKATHON_EVIDENCE.md,
easy for judges to inspect.

Bad evidence is:

unnamed screenshots,
mixed mission history,
missing Markdown export,
secrets in screenshots,
evidence that does not match repo changes,
files named as a feature that was not actually built.

---

## 9. Planned Evidence Roadmap

Current expected mission evidence:

Mission 01 — Scaffold / ADA Cockpit
Mission 02 — Source of Truth Documentation
Mission 03 — Supabase Memory Foundation
Mission 04 — ADA Chat API + Context Builder
Mission 05 — Mission Intake + Artifact Generation
Mission 06 — QA Gate
Mission 07 — Delivery Report + Release Gate

Do not add evidence entries for auth, billing, GitHub OAuth, vector search, or enterprise features unless the scope officially changes.

---

## 10. For Hackathon Judges

This folder exists to make IBM Bob’s role visible and reviewable.

ADA does not hide Bob.

ADA uses Bob as the implementation engine, then adds the discipline missing from raw AI coding workflows:

mission intake,
Bob-ready prompts,
independent QA,
validation against the actual repository,
evidence tracking,
release gates,
commit/push handoff.

The evidence in this folder supports the central thesis:

AI coding is powerful, but production delivery needs separation of duties.

---

## 11. Related Documents

See:

docs/ADA_SPEC.md
docs/HACKATHON_EVIDENCE.md
docs/DELIVERY_WORKFLOW.md
AGENTS.md

---

## 12. Final Rule

Do not accept a mission because Bob says it is complete.

A mission is accepted only when:

repo changes exist
validation passes
browser/demo works if applicable
human lead approves
evidence is exported

That is ADA.
