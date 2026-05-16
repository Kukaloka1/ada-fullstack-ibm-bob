Mission 07F — Update Source-of-Truth Docs With Current System State

We are building ADA — AI Delivery Architect for the IBM Bob Hackathon.

Goal:
Update the project source-of-truth documentation to reflect the current implemented system state and the remaining work, without rewriting or destabilizing the existing specs.

This is a documentation-only mission.

Current implemented system state:
- ADA cockpit UI exists.
- Projects/workspaces exist and persist in Supabase.
- Chat messages persist per workspace.
- Project switching works.
- Chat history restores after refresh.
- ADA chat API works server-side.
- Supabase is server-side only.
- Bob Prompt Preview exists.
- Explicit Bob prompt requests route to Bob Prompt Preview.
- Bob prompts are kept out of normal chat display.
- Bob Prompt Preview copy button exists.
- Current active DB usage:
  - ada_workspaces is active
  - ada_messages is active
- Existing but not fully wired yet:
  - ada_artifacts
  - ada_missions
  - ada_memory

Important:
Do not rewrite the docs from scratch.
Do not delete existing doctrine.
Do not change the product direction.
Do not create a new architecture.
Only update the docs to reflect the real current state and the remaining roadmap.

Files to inspect:
- docs/ADA_SPEC.md
- docs/DELIVERY_WORKFLOW.md
- docs/HACKATHON_EVIDENCE.md
- AGENTS.md
- bob_sessions/README.md

Allowed files to modify:
- docs/ADA_SPEC.md
- docs/DELIVERY_WORKFLOW.md
- docs/HACKATHON_EVIDENCE.md
- AGENTS.md
- bob_sessions/README.md

Do not modify:
- app code
- Supabase migrations
- package.json
- env files
- bob_sessions mission evidence files
- README unless absolutely necessary

Required work:

1. Update ADA_SPEC.md
Add or update a clearly labeled section:
“Current Implemented State”

It should state:
- cockpit UI implemented
- persistent projects implemented
- persistent chat history implemented
- Supabase memory foundation exists
- active tables currently used:
  - ada_workspaces
  - ada_messages
- tables prepared but not fully wired:
  - ada_artifacts
  - ada_missions
  - ada_memory
- Bob Prompt Preview routing implemented
- prompt/chat separation implemented
- current MVP still has no auth, billing, GitHub OAuth, pgvector, or vector DB

Also add or update:
“Remaining Product Work”

Include:
- persist structured Bob prompts into ada_artifacts
- persist current mission state into ada_missions
- persist delivery reports / QA reports into ada_artifacts
- persist workspace memory summaries into ada_memory
- improve readiness checklist from client heuristics to durable project state
- optional future auth only after MVP/demo
- optional GitHub integration only after core flow is stable

2. Update DELIVERY_WORKFLOW.md
Reflect the real delivery workflow now:
- Human Lead creates/selects project
- ADA keeps chat history per project
- ADA handles mission intake
- ADA generates Bob prompt into Bob Prompt Preview
- Human copies prompt to IBM Bob
- Bob implements
- Human exports Bob evidence
- ADA reviews Bob output, repo diff/status, validation logs
- ADA returns PASS / CONDITIONAL PASS / FAIL
- Human commits/pushes after approval
- Evidence commit remains separate when practical

Add a checklist:
“Operational Checklist Before Commit”
Include:
- git status reviewed
- changed files reviewed
- pnpm typecheck
- pnpm lint
- pnpm build
- no secrets
- Bob evidence exported
- ADA QA verdict
- human approval

3. Update HACKATHON_EVIDENCE.md
Add a current evidence inventory section:
- Mission 01 scaffold
- Mission 02 source of truth docs
- Mission 02A markdown cleanup
- Mission 03 Supabase memory foundation
- Mission 03A server-side Supabase
- Mission 04 chat API/context builder
- Mission 05 chat UI wiring
- Mission 05B chat UX/panel polish
- Mission 06 persistent project chat workspace
- Mission 06A loop/project fix
- Mission 07 doctrine/prompt routing series
- Mission 07E manual QA fix if present

Do not require exact filename perfection.
State that evidence files must live in bob_sessions/ and clearly identify mission number, task history, and consumption summary screenshot.

4. Update AGENTS.md
Add current implementation rules:
- server-side Supabase only
- no client-side Supabase
- Bob Prompt Preview is the only place for long Bob prompts
- chat should show confirmations, decisions, and discussion, not giant prompt dumps
- project state must stay isolated between workspaces
- no generic consultant drift; ADA doctrine is global across projects

5. Update bob_sessions/README.md
Add naming guidance that accepts both:
- slug-based evidence filenames
- Bob-title-based evidence filenames

Requirement:
Do not force renaming existing evidence.
State that evidence is valid if:
- it is inside bob_sessions/
- mission number is clear
- file purpose is clear:
  - task-history
  - consumption-summary
  - manual-fix note if applicable

6. Add a final checklist section somewhere appropriate:
“Completed vs Remaining”

Completed:
- Turborepo/Next scaffold
- ADA cockpit UI
- Supabase memory schema
- server-side Supabase architecture
- ADA chat API
- persistent workspace/projects
- persistent chat history
- Bob prompt preview routing
- prompt/chat separation
- evidence workflow

Remaining:
- durable mission state in ada_missions
- durable artifacts in ada_artifacts
- durable memory summaries in ada_memory
- real release gate persistence
- structured QA report persistence
- delivery report persistence
- final demo polish
- deployment/submission packaging

Validation:
- pnpm typecheck
- pnpm lint
- pnpm build

Even though this is documentation-only, run validation to ensure nothing broke.

Security:
- Do not add secrets.
- Do not include real keys, tokens, passwords, URLs with credentials, or private env values.

Before changing files:
List exact files you will modify.

After implementation:
Provide:
- changed files
- documentation sections updated
- completed vs remaining summary
- validation commands and results
- known risks
- suggested commit message

Suggested commit message:
docs: update ADA source of truth with current system state

Confirm alignment with AGENTS.md, ADA_SPEC.md, and IBM Bob Hackathon evidence workflow.

Context Length	
56.5k
200.0k

Task Id	
0695ec8d-b00e-4be6-b1f6-1ff9288c6b95
Tokens	
↑ 790.3k
↓ 9.0k
Cache	
↑ 100.2k
↓ 690.0k
API Cost	2.00
Size	3.3 MB