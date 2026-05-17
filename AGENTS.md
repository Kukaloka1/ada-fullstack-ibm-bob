# AGENTS.md — ADA Bob Project Rules

**Project:** ADA — AI Delivery Architect  
**Repository:** `ada-fullstack-ibm-bob`  
**Purpose:** Persistent project rules for disciplined IBM Bob delivery work  
**Status:** Hackathon MVP Source of Truth

---

## 1. Project Identity

ADA is a chat-first AI Delivery Architect for disciplined AI-assisted software delivery.

ADA productizes a real workflow:

```txt
Human Lead → ADA → IBM Bob → ADA QA → Release Gate → Commit/Push
```

**Core tagline:**

> Bob builds. ADA reviews. You lead.

ADA is not a generic chatbot, not a Bob replacement, and not an IDE.

ADA is the delivery control layer around IBM Bob workflows.

---

## 2. Role Separation

### Human Lead

Owns:

- product intent,
- priorities,
- constraints,
- final approval,
- commit/push decision.

### ADA

Owns:

- mission intake,
- planning discipline,
- Bob prompt generation,
- independent QA,
- evidence tracking,
- release gate evaluation,
- mission lifecycle control,
- delivery handoff.

### IBM Bob

Owns:

- repository implementation,
- scoped code changes,
- documentation updates when requested,
- evidence export through Bob History.

Bob does not own final release approval.

---

## 3. Current Stack

The current repository uses:

- Turborepo
- pnpm
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Postgres
- server-side Supabase API routes
- OpenAI-compatible API reasoning layer
- IBM Bob as the builder workflow

Do not assume auth, billing, GitHub OAuth, pgvector, or external enterprise infrastructure unless a mission explicitly asks for them.

---

## 4. MVP Constraints

For the hackathon MVP:

- no auth,
- no billing,
- no GitHub OAuth,
- no vector DB,
- no pgvector,
- no complex backend infrastructure,
- no automatic push without human approval,
- no unrelated changes,
- no enterprise dashboard bloat.

Keep the product narrow, useful, and demoable.

---

## 5. Repository Truth Rule

Builder summaries are not truth.

The repository is truth.

A task is not complete unless actual files changed and validation passes.

Required checks after every implementation mission:

```bash
git status --short
git diff --stat
pnpm typecheck
pnpm lint
pnpm build
```

For UI changes:

```bash
pnpm dev
```

Then manually confirm the browser output.

---

## 6. Workspace Rule

Before making changes, confirm the correct repository:

`/Users/bittechnetwork/Development/ada-fullstack-ibm-bob`

Correct branch:

`main`

If Bob is not operating inside the official repository, stop.

Do not write implementation to another workspace.

---

## 7. Mission Scope Rule

One mission should map to one scoped delivery objective.

Before changing files, list:

- files planned for creation,
- files planned for modification,
- files intentionally not touched,
- risks or assumptions.

Do not make unrelated changes.

If a separate issue is found, document it for a future mission.

---

## 8. File Size Rule

Keep files modular.

Avoid files over 500 lines when practical. If a file becomes too large, split it into focused modules unless the mission explicitly requires a single-file change.

---

## 9. Implementation Rules

When implementing:

- use TypeScript,
- preserve strict typing,
- avoid `any` unless unavoidable,
- keep UI serious and readable,
- prefer small modules,
- avoid unnecessary dependencies,
- avoid speculative architecture,
- do not introduce services that were not requested.

If ambiguity exists, surface it instead of inventing scope.

---

## 10. UI Rules

ADA must feel like a serious delivery cockpit.

Visual direction:

- IBM-modern,
- technical,
- clean,
- premium,
- control-room aesthetic,
- chat-first,
- no toy UI,
- no playful filler.

For starter-screen removal, verify:

```bash
grep -R "To get started" apps/web/app/page.tsx apps/web/components 2>/dev/null || true
grep -R "Deploy Now" apps/web/app/page.tsx apps/web/components 2>/dev/null || true
grep -R "next.svg" apps/web/app/page.tsx apps/web/components 2>/dev/null || true
```

Expected output: empty.

---

## 11. Documentation Rules

Documentation must stay aligned with the actual repo and MVP scope.

Do not claim features that are not implemented.

Do not claim:

- auth exists,
- evidence browser exists,
- GitHub integration exists,
- automated commit/push exists,
- vector search exists,
- multi-user workspace exists.

Allowed language:

- planned,
- future,
- optional,
- post-MVP.

Documentation should be judge-friendly, concrete, and honest.

---

## 12. Evidence Rules

The repository now preserves two evidence lanes:

- `bob_sessions/`
  Official IBM Bob evidence for the public hackathon submission.
- `others_sessions/`
  Continuity and recovery evidence completed later with Codex after IBM Bob budget exhaustion.

Do not blur those two lanes.

IBM Bob evidence belongs in `bob_sessions/`. Later continuity evidence belongs in `others_sessions/`.

Use flat files in both evidence lanes.

---

## 13. Security Rules

Never commit:

- `.env`
- `.env.local`
- API keys
- OpenAI keys
- Supabase service role keys
- IBM Cloud credentials
- IBM Bob credentials
- database passwords
- private tokens
- session tokens
- user credentials

Before committing Bob Markdown exports, run:

```bash
grep -R -i "api_key\\|apikey\\|secret\\|token\\|OPENAI\\|SUPABASE\\|IBM_CLOUD\\|password" bob_sessions/*.md || true
```

If real secrets appear, remove or redact before commit.

---

## 14. Validation Expectations

Every product mission must report:

- changed files
- validation commands
- validation result
- known risks
- suggested commit message

Minimum validation:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Do not claim tests exist unless they actually exist.

---

## 15. QA Verdict Semantics

ADA uses:

- `PASS`
- `CONDITIONAL_PASS`
- `FAIL`
- `PENDING`

### PASS

Work can proceed to commit/push.

### CONDITIONAL_PASS

Work is usable with documented non-blocking risks.

### FAIL

Do not commit as complete.

### PENDING

Evidence is not yet sufficient for a final QA conclusion.

QA determines whether the scoped mission was completed correctly. Release Gate determines whether commit/push is allowed.

---

## 16. Commit/Push Handoff

Bob may suggest a commit message, but the Human Lead approves final commit and push.

Recommended commit format:

```txt
type: concise result

- key change 1
- key change 2
- validation result
- known risks if any

IBM Bob evidence: bob_sessions/<mission-file>.md
```

Do not add fake `Co-authored-by` metadata unless explicitly approved.

---

## 17. Current Product Rules

### Server-Side Supabase Only

- Supabase access must remain server-side only.
- Browser clients talk only to Next.js API routes.

### Bob Prompt Preview Routing

- Bob Prompt Preview is only for real Bob implementation prompts.
- QA reviews, release decisions, and delivery reports stay in chat.

### Project State Isolation

- Each workspace has isolated messages, missions, artifacts, and memory.
- Project switching must not leak state.

### Artifact Persistence

- `bob_prompt`, `qa_report`, `delivery_report`, and `release_gate` persist as durable artifacts.
- Artifacts are the operational source of truth.

### Mission Persistence

- Active mission state persists in `ada_missions`.
- Projects may contain multiple missions.
- Closing a mission preserves history and prepares the workspace for the next mission.

### Memory Rules

- `ada_memory` is deterministic workspace memory.
- It is derived from mission state plus latest artifacts.
- If memory and artifacts disagree, artifacts win.

### Delivery Status Rule

- Mission record status and delivery status are different concepts.
- Delivery status is authoritative for release readiness.

---

## 18. Success Criteria

A mission is complete only when:

- actual repo changes exist,
- changed files match the mission,
- validation passes,
- browser check passes if UI changed,
- no secrets are committed,
- human lead approves,
- evidence is tracked honestly.

---

## 19. Final Rule

When in doubt:

- do not assume,
- do not expand scope,
- do not claim completion,
- ask or document the blocker.

ADA values disciplined delivery over fast-looking but unverified output.
