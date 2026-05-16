# AGENTS.md — ADA Bob Project Rules

**Project:** ADA — AI Delivery Architect  
**Repository:** `ada-fullstack-ibm-bob`  
**Purpose:** Persistent project rules for IBM Bob  
**Status:** Hackathon MVP Source of Truth  

---

## 1. Project Identity

ADA is a chat-first AI Delivery Architect for disciplined AI-assisted software delivery.

ADA productizes a real workflow:

```txt
Human Lead → ADA → IBM Bob → ADA QA → Release Gate → Commit/Push
```

**Core tagline:**

> Bob builds. Ada orchestrates and reviews. You lead.

ADA is not a generic chatbot, not a coding assistant, not a Bob replacement, and not an IDE.

ADA is the delivery control layer around IBM Bob workflows.

---

## 2. Role Separation

### Human Lead

The human lead owns:

product intent,
priorities,
constraints,
final approval,
commit/push decision.

### ADA

ADA owns:

mission intake,
planning discipline,
Bob prompt generation,
independent QA,
evidence tracking,
release gate evaluation,
delivery handoff.

### IBM Bob

Bob owns:

implementation inside the repository,
documentation updates when requested,
code changes when requested,
scoped refactors when requested,
evidence export through Bob History.

Bob does not own final release approval.

---

## 3. Current Stack

The current repository uses:

Turborepo
pnpm
Next.js App Router
React
TypeScript
Tailwind CSS
IBM Bob IDE

Planned MVP layers:

OpenAI-compatible LLM API for ADA reasoning
Supabase Postgres for structured ADA memory

Do not assume Supabase Auth, billing, GitHub OAuth, pgvector, or external services unless a mission explicitly asks for them.

---

## 4. MVP Constraints

For the hackathon MVP:

no auth,
no billing,
no GitHub OAuth,
no vector DB,
no pgvector,
no complex backend infrastructure,
no automatic push without human approval,
no unrelated changes,
no enterprise dashboard bloat.

Keep the product narrow, useful, and demoable.

---

## 5. Repository Truth Rule

Bob summaries are not truth.

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

/Users/bittechnetwork/Development/ada-fullstack-ibm-bob

Correct branch:

main

If Bob is not operating inside the official repository, stop.

Do not write implementation to another workspace.

---

## 7. Mission Scope Rule

One mission should map to one Bob chat/task.

Each mission must be scoped.

Before changing files, Bob must list:

files planned for creation,
files planned for modification,
files intentionally not touched,
risks or assumptions.

Do not make unrelated changes.

If a separate issue is found, document it for a future mission.

---

## 8. File Size Rule

Keep files modular.

Avoid files over 500 lines when practical.

If a file is becoming too large, split it into focused modules.

Do not create large monoliths unless explicitly approved.

---

## 9. Implementation Rules

When implementing:

use TypeScript,
preserve strict typing,
avoid any unless unavoidable,
keep UI simple and readable,
prefer small modules,
avoid unnecessary dependencies,
avoid speculative architecture,
do not introduce services not requested by the mission.

If implementation ambiguity exists, stop and surface the ambiguity instead of inventing scope.

---

## 10. UI Rules

ADA must feel like a serious delivery cockpit.

Visual direction:

IBM-modern,
technical,
clean,
premium,
control-room aesthetic,
chat-first,
no toy UI,
no playful filler.

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

auth exists,
evidence browser exists,
GitHub integration exists,
automated commit/push exists,
vector search exists,
multi-user workspace exists.

Allowed language:

planned,
future,
optional,
post-MVP.

Documentation should be judge-friendly and honest.

---

## 12. Evidence Rules

The IBM Bob Hackathon requires Bob task evidence in the public repository.

Evidence belongs in:

bob_sessions/

Use flat files.

Naming convention:

mission-XX-short-name-task-history.md
mission-XX-short-name-consumption-summary-01.png
mission-XX-short-name-consumption-summary-02.png

Examples:

mission-01-scaffold-task-history.md
mission-01-scaffold-consumption-summary-01.png
mission-02-source-of-truth-task-history.md
mission-02-source-of-truth-consumption-summary-01.png

Product commits and evidence commits should be separate.

---

## 13. Security Rules

Never commit:

.env,
.env.local,
API keys,
OpenAI keys,
Supabase service role keys,
IBM Cloud credentials,
IBM Bob credentials,
database passwords,
private tokens,
session tokens,
user credentials.

Before committing Bob Markdown exports, run:

```bash
grep -R -i "api_key\|apikey\|secret\|token\|OPENAI\|SUPABASE\|IBM_CLOUD\|password" bob_sessions/*.md || true
```

If real secrets appear, remove or redact before commit.

Words like "OpenAI-compatible API", "Supabase-ready", "token usage", or "do not commit secrets" are not secrets by themselves.

---

## 14. Validation Expectations

Every product mission must report:

changed files
validation commands
validation result
known risks
suggested commit message

Minimum validation:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Tests are encouraged when useful, but the hackathon MVP does not require full enterprise test coverage for every file.

Do not claim tests exist unless they actually exist.

---

## 15. QA Verdict Semantics

ADA uses three verdicts.

### PASS

Work can proceed to commit/push.

Required:

acceptance criteria met,
validation passes,
no unrelated changes,
no critical risks.

### CONDITIONAL PASS

Work is usable with documented non-blocking risks.

Required:

core mission complete,
risks documented,
human lead accepts conditions.

### FAIL

Do not commit as complete.

Reasons:

missing implementation,
wrong workspace,
validation failure,
default starter screen still present,
scope creep,
unrelated changes,
security risk,
evidence missing.

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

Do not add fake Co-authored-by metadata unless explicitly approved.

---

## 17. Current Mission Discipline

From Mission 02 onward:

1 mission = 1 Bob chat/task
1 product commit
1 exported Bob task history markdown
1 consumption summary screenshot
1 evidence commit

Mission 01 produced an important lesson:

Bob can report completion, but ADA must validate the actual repo.

This is central to the product.

---

## 18. Success Criteria

A mission is complete only when:

actual repo changes exist,
changed files match the mission,
validation passes,
browser check passes if UI changed,
no secrets are committed,
human lead approves,
evidence is tracked.

---

## 19. Final Rule

When in doubt:

do not assume,
do not expand scope,
do not claim completion,
ask or document the blocker.

ADA values disciplined delivery over fast-looking but unverified output.

---

## 20. Current Implementation Rules

### Server-Side Supabase Only

**Rule:** Supabase must remain server-side only.

**Implementation:**
- Supabase client created in `apps/web/lib/supabase/server.ts`
- All Supabase operations through API routes
- No client-side Supabase imports
- No `@supabase/supabase-js` in client components

**Validation:**
```bash
grep -r "createClient" apps/web/app apps/web/components 2>/dev/null || echo "No client-side Supabase found"
```

Expected: No matches in client components.

---

### Bob Prompt Preview Routing

**Rule:** Bob Prompt Preview is the only place for long Bob prompts.

**Implementation:**
- Explicit Bob prompt requests route to Bob Prompt Preview panel
- Bob prompts kept out of normal chat display
- Chat shows confirmations, decisions, and discussion
- No giant prompt dumps in chat history

**User patterns that trigger Bob Prompt Preview:**
- "generate bob prompt"
- "create bob prompt"
- "bob prompt for"
- "give me a bob prompt"

**Chat should show:**
- Mission intake discussion
- Clarifications
- Decisions
- Confirmations
- QA verdicts
- Delivery reports

**Chat should NOT show:**
- Full Bob implementation prompts
- Long technical specifications meant for Bob
- Repetitive prompt templates

---

### Project State Isolation

**Rule:** Project state must stay isolated between workspaces.

**Implementation:**
- Each workspace has its own chat history
- Chat messages filtered by `workspace_id`
- Project switching clears previous project state
- No cross-project data leakage

**Validation:**
- Switch between projects
- Confirm chat history changes
- Confirm no messages from other projects appear

---

### ADA Doctrine is Global

**Rule:** ADA doctrine applies globally across all projects.

**What is global:**
- ADA's role as delivery architect
- Three-role model (Human Lead, ADA, Bob)
- QA verdict semantics (PASS/CONDITIONAL PASS/FAIL)
- Evidence requirements
- Validation expectations
- Security rules
- Commit/push handoff discipline

**What is project-specific:**
- Chat history
- Mission state
- Artifacts
- Memory summaries
- Pending items
- Project constraints

**Do not:**
- Let ADA become a generic consultant
- Let ADA forget its delivery architect role
- Let ADA ignore validation requirements
- Let ADA accept incomplete work
- Let ADA trust builder summaries blindly

### Artifact Persistence

**Rule:** All operational artifacts must persist to Supabase.

**Implementation:**
- Bob prompts persist as `artifact_type = "bob_prompt"`
- Delivery reports persist as `artifact_type = "delivery_report"`
- QA reports persist as `artifact_type = "qa_report"`
- Release gate decisions persist as `artifact_type = "release_gate"`

**Behavior:**
- Artifacts persist before UI updates
- Persistence failures log warnings but don't block UI
- Latest artifacts load on workspace switch
- Artifacts scope by workspace_id

**APIs:**
- GET /api/ada/artifacts?workspaceId={id}&artifactType={type}
- POST /api/ada/artifacts

---

### Mission State Persistence

**Rule:** Active missions persist to ada_missions table.

**Implementation:**
- Missions load on workspace selection
- Active missions filter by status: planning, ready, in_progress, review
- Mission updates through PATCH endpoint

**APIs:**
- GET /api/ada/missions?workspaceId={id}&activeOnly=true
- POST /api/ada/missions
- PATCH /api/ada/missions

---

### Readiness Checklist Derivation

**Rule:** Readiness checklist derives from durable artifacts.

**Implementation:**
- "Bob prompt ready" = PASS if bob_prompt artifact exists
- "Evidence exported" = PASS if delivery_report artifact exists
- "QA review complete" = PASS if qa_report artifact exists
- "Mission structured" = PASS if messages exist OR mission exists

**Do not:**
- Rely solely on client-side state
- Trust checklist without artifact verification
- Mark items complete without durable evidence

---

---