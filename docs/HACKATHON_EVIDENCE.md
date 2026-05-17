# ADA Hackathon Evidence Documentation

**Project:** ADA — AI Delivery Architect  
**Repository:** `ada-fullstack-ibm-bob`  
**Status:** Hackathon Evidence Source of Truth

---

## 1. Purpose

This document explains how evidence is preserved for ADA’s hackathon build and continuity work.

ADA was built with a disciplined workflow:

```txt
Human Lead → ADA → IBM Bob → ADA QA → Release Gate → Commit/Push
```

The point is not only to show a working application. It is to show that IBM Bob was used meaningfully inside a controlled AI-native delivery process, and that later continuity work was documented honestly.

---

## 2. Evidence Lanes

This repository intentionally preserves two evidence lanes.

### `bob_sessions/`

Official IBM Bob evidence for the public hackathon submission.

This folder contains:

- exported IBM Bob task histories,
- Bob consumption-summary screenshots,
- Bob-origin evidence that belongs directly to the official hackathon story.

`bob_sessions/` is preserved as Bob evidence and should not be repurposed to hide continuity work completed later with other tools.

### `others_sessions/`

Continuity and recovery evidence completed later with Codex after IBM Bob budget exhaustion.

This folder exists so the repository remains honest:

- IBM Bob remains the official builder in the hackathon narrative,
- continuity work completed later is still preserved,
- later recovery is not misrepresented as original Bob evidence.

---

## 3. Evidence Doctrine

ADA’s evidence doctrine is simple:

- If it is not in the repository, it is not real.
- If it is not validated, it is not accepted.
- If it is not evidenced, it is not submission-ready.

Bob can generate summaries, but ADA validates the actual repository state.

For every product mission, the expected checks remain:

```bash
git status --short
git diff --stat
pnpm typecheck
pnpm lint
pnpm build
```

For UI changes, manual browser validation is also required.

---

## 4. Current Product-Evidence Alignment

ADA’s current cockpit behavior is aligned with this doctrine:

- Bob prompts persist as durable artifacts,
- QA verdicts can auto-record durable `qa_report` artifacts,
- delivery reports persist before evidence-export state is marked PASS,
- release gate decisions persist as durable `release_gate` artifacts,
- mission lifecycle is preserved across repeated delivery cycles,
- `ada_memory` is derived deterministically from mission state and artifacts,
- artifacts remain the authoritative source of truth.

The product behavior and the evidence doctrine now describe the same workflow.

---

## 5. IBM Bob Evidence Requirements

For relevant IBM Bob missions, the public repository should include:

- exported Bob task history as Markdown,
- screenshot of the Bob task session consumption summary,
- clear mapping between Bob task, repository change, validation, and commit,
- no exposed credentials or secrets.

Those files belong in:

`bob_sessions/`

---

## 6. Continuity Evidence Requirements

For continuity and recovery missions completed later with Codex:

- preserve the recovery note or task summary,
- preserve validation results,
- preserve changed-file scope,
- preserve the rationale for why the work happened outside IBM-provided services.

Those files belong in:

`others_sessions/`

This keeps the public narrative honest instead of collapsing all evidence into one ambiguous folder.

---

## 7. Security Rules

Never commit:

- `.env`
- `.env.local`
- API keys
- OpenAI keys
- Supabase service role keys
- IBM Cloud credentials
- IBM Bob credentials
- private tokens
- database passwords
- session tokens
- user credentials

Before committing Bob Markdown exports, run:

```bash
grep -R -i "api_key\\|apikey\\|secret\\|token\\|OPENAI\\|SUPABASE\\|IBM_CLOUD\\|password" bob_sessions/*.md || true
```

If real secrets appear, remove or redact them before commit.

Words like `OpenAI-compatible API`, `Supabase-ready`, or `token usage` are not secrets by themselves.

---

## 8. Validation Requirements

Minimum product validation:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

For UI missions:

```bash
pnpm dev
```

Then validate the browser manually.

Evidence should reflect the real validated state of the repo, not only a tool summary.

---

## 9. Current Evidence Position

The repository is intentionally explicit about its current evidence model:

- IBM Bob evidence is preserved in `bob_sessions/`.
- Later continuity and recovery work is preserved in `others_sessions/`.
- ADA’s README and product docs describe that split openly.

That is the correct framing for judges:

- IBM Bob was used meaningfully,
- Bob is the central builder in the official hackathon story,
- later completion work is documented separately rather than being hidden.

---

## 10. Judge-Facing Summary

The strongest evidence narrative for ADA is:

1. IBM Bob was used as the builder inside a real software delivery workflow.
2. ADA productizes that workflow.
3. ADA separates builder output, QA, evidence, and release control.
4. When IBM Bob budget ran out, later continuity work was preserved honestly in a separate evidence lane.

That is consistent with the product itself:

- Bob builds.
- ADA reviews.
- The human lead approves release.
