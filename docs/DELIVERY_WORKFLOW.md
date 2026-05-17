# ADA Delivery Workflow

**Project:** ADA — AI Delivery Architect  
**Repository:** `ada-fullstack-ibm-bob`  
**Purpose:** Document the disciplined AI-assisted delivery workflow  
**Status:** Hackathon MVP Source of Truth  

---

## Overview

ADA implements a structured workflow for AI-assisted software delivery:

```txt
Human Lead → ADA → IBM Bob → ADA QA → Release Gate → Commit/Push
```

The workflow is the product.

The cockpit now also includes an in-product "How ADA Works" modal so new users and judges can read the workflow inside the application before using the panels.

---

## Current Real Workflow

As implemented through Mission 10A:

1. **Human Lead creates or selects project**
   - Projects persist in Supabase
   - Each project has isolated chat history
   - Project state remains separate between workspaces
   - Projects can be deleted with confirmation through the cockpit
   - Project deletion removes workspace-scoped messages, artifacts, missions, and memory rows server-side
   - If no valid workspace exists, ADA selects an existing workspace or creates a fallback one before chat is re-enabled

2. **ADA handles mission intake through chat**
   - Human describes intent
   - ADA clarifies scope and constraints
   - ADA structures the mission

3. **ADA generates Bob prompt**
   - Prompt appears in Bob Prompt Preview panel
   - Explicit Bob-prompt requests show confirmation in chat instead of dumping the full prompt into conversation history
   - Prompt restores from persisted artifact on project return
   - Identical prompts are not duplicated on refresh or workspace switch
   - Persisting a new Bob prompt also creates or updates the active mission for that workspace
   - Current Mission restores from `ada_missions` on refresh/project return
   - Human copies prompt to IBM Bob IDE
   - Bob prompts stay out of normal chat display
   - QA reviews and other delivery-control outputs stay in chat even when they contain structured headings

4. **IBM Bob implements in repository**
   - Bob works inside `/Users/bittechnetwork/Development/ada-fullstack-ibm-bob`
   - Bob modifies files as scoped
   - Bob provides implementation summary

5. **Human exports Bob evidence**
   - Export task history as Markdown
   - Screenshot consumption summary
   - Save to `bob_sessions/`

6. **ADA reviews Bob output**
   - Reviews Bob summary
   - Reviews actual `git status` and `git diff`
   - Reviews validation logs (typecheck, lint, build)
   - Reviews browser output for UI changes
   - Emits explicit `QA Verdict:` markers in review responses when asked for a QA verdict
   - Saves durable QA reports when the current verdict is ready

7. **ADA returns QA verdict**
   - PASS: proceed to commit
   - CONDITIONAL PASS: proceed with documented risks
   - FAIL: correction needed
   - QA answers whether the scoped mission was completed correctly

8. **Human lead records the release gate**
   - Release gate decisions can be recorded as durable workspace state
   - Release gate answers whether commit/push is allowed, blocked, or conditional
   - Release should follow QA review, evidence export, and human approval

9. **Human commits and pushes after approval**
   - Product commit after PASS
   - Evidence commit separately when practical

### Current Durable State Rules

- Browser clients talk only to Next.js API routes; Supabase remains server-side only
- `bob_prompt`, `delivery_report`, `qa_report`, and `release_gate` persist as workspace-scoped artifacts
- active mission state persists through `ada_missions`, sourced from Bob prompt generation
- readiness derives from durable artifacts plus workspace-scoped mission/message state
- live ADA QA status derives from persisted QA reports first, then explicit QA verdict lines in ADA review messages when no QA artifact exists yet
- live non-PENDING ADA QA verdicts auto-record durable QA reports for the active workspace
- manual QA record is fallback-only when automatic QA persistence is missed
- saved release gate artifacts win in the Release Gate panel display for that workspace
- when no saved release gate exists yet, ADA derives a recommendation from QA verdict plus evidence-export state
- once a non-PENDING release gate is recorded, the cockpit settles into a recorded state instead of keeping an active approval action visible
- latest QA verdict and release gate decision restore from persisted artifacts on workspace load
- Bob Prompt Preview only updates for explicit Bob-prompt intent plus real Bob-prompt content; QA-shaped output must never replace chat with prompt confirmation
- invalid QA-looking `bob_prompt` artifacts are ignored by the UI instead of rendered into Bob Prompt Preview
- switching projects resets transient UI state before loading the selected workspace's durable records
- delivery report export updates evidence-export state only after successful artifact persistence, then downloads the markdown report
- deleting a project removes its durable workspace state and reassigns the selected workspace safely
- missing or deleted default workspace ids do not remain active in the client; ADA recovers to a real workspace id

---

## Phase 1: Mission Intake

The human lead provides intent to ADA.

ADA transforms messy intent into a structured engineering mission.

### Inputs

- mission title
- business goal
- technical context
- constraints
- acceptance criteria
- implementation notes

### Output

- structured mission object
- clarified scope
- explicit non-goals

---

## Phase 2: Planning Discipline

ADA generates an implementation plan before Bob executes.

### Outputs

- implementation plan
- file impact assumptions
- dependencies
- risks
- recommended execution sequence
- validation expectations

**Rule:** No Bob implementation mission should run without a scoped plan.

---

## Phase 3: Spec Builder

ADA generates an implementation-grade spec.

### Outputs

- problem statement
- implementation scope
- non-goals
- acceptance criteria
- engineering checklist
- testing expectations
- delivery notes

---

## Phase 4: Bob Prompt Generation

ADA converts the structured spec into a Bob-ready implementation prompt.

### Bob Prompt Must Include

- mission title
- context
- allowed files
- constraints
- acceptance criteria
- validation commands
- evidence requirements
- warning against unrelated changes

Bob prompts must be direct, scoped, and non-ambiguous.

---

## Phase 5: QA Review

After Bob completes a mission, ADA performs independent delivery validation.

ADA does not accept Bob's summary as truth.

### ADA Validates

#### 1. Repository Reality

```bash
git status --short
git diff --stat
```

- changed files match the mission
- no unrelated files changed

#### 2. Technical Validation

```bash
pnpm typecheck
pnpm lint
pnpm build
```

#### 3. UI Validation (if applicable)

```bash
pnpm dev
```

- open the browser
- confirm the expected UI exists
- confirm default starter content is removed when relevant

#### 4. Scope Validation

- acceptance criteria met
- non-goals respected
- no scope creep
- no unauthorized architecture expansion

#### 5. Security Validation

- no `.env` files committed
- no API keys
- no Supabase service role keys
- no IBM Cloud/Bob credentials
- no private tokens in Bob evidence exports

#### 6. Evidence Validation

- Bob task history markdown exported
- consumption summary screenshot captured
- evidence stored in `bob_sessions/`
- evidence scanned for secrets

---

## Phase 6: QA Verdict

ADA returns one of three verdicts:

QA is not release. QA determines whether the builder completed the scoped mission correctly based on repository state, validation output, evidence, and documented risks.
In the MVP cockpit, QA should appear as ADA-derived review state, not a manual human-picked dropdown.

### PASS

Work can proceed to commit/push.

**Required:**
- acceptance criteria met
- validation passes
- no unrelated changes
- no critical risks

### CONDITIONAL PASS

Work is usable with documented non-blocking risks.

**Required:**
- core mission complete
- risks documented
- human lead accepts conditions

### FAIL

Do not commit as complete.

**Reasons:**
- missing implementation
- wrong workspace
- validation failure
- default starter screen still present
- scope creep
- unrelated changes
- security risk
- evidence missing

---

## Phase 7: Release Gate

Release Gate is the final human-controlled delivery decision.

Release Gate does not repeat QA. It records whether commit/push is allowed after QA review, evidence export, and human approval.
In the MVP cockpit, the recommended release gate is derived from persisted release state when present, or from QA plus evidence when no release gate artifact has been saved yet.

---

## Phase 7: Correction Loop

If ADA returns FAIL, ADA generates a correction prompt for Bob.

The correction prompt includes:
- what is missing
- what is wrong
- what needs to change
- validation requirements

---

## Phase 8: Commit/Push Handoff

ADA prepares the final delivery handoff, but the Human Lead approves the commit and push.

### Commit Message Format

```txt
type: concise mission result

- key change 1
- key change 2
- validation evidence
- known risks if any

IBM Bob evidence: bob_sessions/<mission-file>.md
```

### Example

```txt
feat: add ADA chat-first control cockpit

- Replace default Next.js starter page with ADA cockpit
- Add workflow sidebar, ADA chat panel, Bob prompt preview, and release gate
- Validate with typecheck, lint, build, and browser review

IBM Bob evidence: bob_sessions/mission-01-scaffold-task-history.md
```

---

## Phase 9: Final Delivery Report

ADA generates a practical delivery report.

### Report Structure

```md
# Mission XX — Mission Title

## Status
PASS / CONDITIONAL PASS / FAIL

## Summary
What changed and why.

## Changed Files
- file 1
- file 2

## Validation
- pnpm typecheck: PASS/FAIL
- pnpm lint: PASS/FAIL
- pnpm build: PASS/FAIL
- browser validation: PASS/FAIL/N/A

## Evidence
- Bob task history: bob_sessions/...
- Consumption screenshot: bob_sessions/...

## Risks
- unresolved risk 1
- unresolved risk 2

## Suggested Commit
commit message here

## Release Recommendation
Proceed / proceed with conditions / do not proceed
```

---

## Human Decision Authority

The human lead has final authority over:

- product intent
- priorities
- constraints
- plan approval
- release gate approval
- commit/push decision

ADA provides discipline, validation, and recommendations.

The human lead makes the final call.

---

## Operational Checklist Before Commit

Before committing any mission as complete, verify:

### Repository State
- [ ] `git status --short` reviewed
- [ ] Changed files match mission scope
- [ ] No unrelated files changed
- [ ] Correct repository: `/Users/bittechnetwork/Development/ada-fullstack-ibm-bob`
- [ ] Correct branch: `main`

### Technical Validation
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` passes
- [ ] `pnpm dev` tested (if UI changes)
- [ ] Browser validation complete (if UI changes)

### Security
- [ ] No `.env` or `.env.local` files committed
- [ ] No API keys in code or evidence
- [ ] No Supabase service role keys
- [ ] No IBM Cloud/Bob credentials
- [ ] No private tokens
- [ ] Evidence scanned for secrets: `grep -R -i "api_key\|apikey\|secret\|token\|OPENAI\|SUPABASE\|IBM_CLOUD\|password" bob_sessions/*.md || true`

### Evidence
- [ ] Bob task history exported as Markdown
- [ ] Consumption summary screenshot captured
- [ ] Evidence files saved in `bob_sessions/`
- [ ] Evidence files clearly named with mission number
- [ ] Evidence scanned for secrets

### QA Verdict
- [ ] ADA QA verdict received (PASS/CONDITIONAL PASS/FAIL)
- [ ] Acceptance criteria met
- [ ] Known risks documented if CONDITIONAL PASS
- [ ] Correction applied if FAIL

### Human Approval
- [ ] Human lead reviewed changes
- [ ] Human lead approved commit
- [ ] Commit message prepared
- [ ] Push decision made

---

## Conclusion

The workflow is the product.

ADA transforms chaotic AI coding into disciplined software delivery through:

- mission intake
- planning discipline
- Bob prompt generation
- independent QA
- evidence tracking
- release gates
- commit/push handoff

**Bob builds. Ada orchestrates and reviews. You lead.**
