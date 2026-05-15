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

## 6. Evidence Table

| Mission | Bob Task | Screenshot Path | Markdown Export | Commit Hash | Validation | Status |
|---------|----------|-----------------|-----------------|-------------|------------|--------|
| Mission 01: Scaffold / ADA Cockpit | Initial Turborepo + Next.js scaffold. ADA cockpit was later recovered after QA found default Next screen still present. | `bob_sessions/mission-01-scaffold-consumption-summary-01.png`<br>`bob_sessions/mission-01-scaffold-consumption-summary-02.png` | `bob_sessions/mission-01-scaffold-task-history.md` | TBD | ✅ Typecheck passing<br>✅ Lint passing<br>✅ Build passing<br>✅ ADA cockpit visible after recovery | ✅ Complete |
| Mission 02: Source of Truth Documentation | ADA spec, delivery workflow, Bob project rules, and evidence documentation. | `bob_sessions/mission-02-source-of-truth-consumption-summary-01.png` | `bob_sessions/mission-02-source-of-truth-task-history.md` | TBD | ✅ Documentation created<br>✅ Typecheck passing<br>✅ Lint passing<br>✅ Build passing | ✅ Complete after evidence export |
| Mission 03: Supabase Memory Foundation | Minimal Supabase schema and ADA memory types. | TBD | TBD | TBD | Pending | ⏳ Planned |
| Mission 04: ADA Chat API + Context Builder | Chat endpoint, LLM call, workspace context builder, and memory injection. | TBD | TBD | TBD | Pending | ⏳ Planned |
| Mission 05: Mission Intake + Artifact Generation | Structured mission creation and artifact persistence. | TBD | TBD | TBD | Pending | ⏳ Planned |
| Mission 06: QA Gate | PASS / CONDITIONAL PASS / FAIL review flow and correction prompt generation. | TBD | TBD | TBD | Pending | ⏳ Planned |
| Mission 07: Delivery Report + Release Gate | Markdown delivery report, commit message suggestion, and push readiness checklist. | TBD | TBD | TBD | Pending | ⏳ Planned |

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