Mission 07D — Reset Project Panel State and Clean Bob Prompt Output

We are building ADA — AI Delivery Architect.

Goal:
Fix two critical product bugs in ADA’s project/prompt workflow:

1. Bob Prompt Preview keeps old prompt state when creating or switching projects.
2. Bob Prompt Preview includes conversational follow-up text that should not be sent to IBM Bob.

This is a correction mission for Mission 07.

Current bugs observed:
- When creating a new project, Bob Prompt Preview can still show a prompt from the previous project.
- When ADA generates a Bob prompt, the preview can include user-facing text such as:
  - “Si me dices qué stack usa tu repo…”
  - “Para que Bob trabaje mejor…”
  - “Opción A / Opción B / Opción C”
  - “If you want…”
  - follow-up questions for the Human Lead

Correct behavior:
- Each project/workspace must have isolated panel state.
- New projects must not inherit Bob Prompt Preview from another project.
- Bob Prompt Preview must contain only the clean, executable Bob prompt.
- The normal chat may contain short confirmations, but the preview must be clean and copy-ready.

Allowed files:
- apps/web/components/AdaCockpit.tsx
- apps/web/components/ChatPanel.tsx
- apps/web/components/ContextPanel.tsx only if needed
- apps/web/lib/ada/prompts.ts
- apps/web/lib/ada/format-message.ts only if useful

Do not modify:
- API routes unless absolutely necessary
- Supabase schema
- DB migrations
- package.json
- docs
- bob_sessions
- env files
- layout design
- project persistence logic except selected workspace state reset behavior

Required fix 1 — reset panel state on workspace change:
In AdaCockpit:
- When selectedWorkspaceId changes:
  - reset Bob Prompt Preview to an empty/default state
  - reset readiness checklist to default for that workspace
  - reset release gate state if currently local-only
- Then allow ChatPanel history loading to re-detect any persisted Bob prompt for that selected workspace.
- If the selected workspace has no prior Bob prompt, preview must stay empty/default.
- Do not show a previous project’s prompt in a newly created project.

Required fix 2 — better empty Bob Prompt Preview:
In ContextPanel:
- If no real Bob prompt exists, show a clean empty state, not an old placeholder prompt.
Example:
  “No Bob prompt generated for this project yet.”
- Copy button should be disabled when there is no real prompt.
- Copy button should copy only the clean prompt.

Required fix 3 — clean Bob prompt content:
In ChatPanel or a helper:
- Add a function such as cleanBobPromptForPreview(content: string): string.
- It must:
  - strip assistant preambles:
    “Here is…”
    “Aquí tienes…”
    “Use this as…”
    “Copia y pega…”
  - strip trailing human-facing follow-up sections:
    “Si quieres…”
    “If you want…”
    “Para que Bob trabaje mejor…”
    “Opción A…”
    “Opción B…”
    “Opción C…”
    “I can also…”
    “También puedo…”
- The preview should keep only the actual Bob mission prompt.

Required fix 4 — harden ADA prompt-mode instructions:
In apps/web/lib/ada/prompts.ts, strengthen Bob Prompt Mode:
- When user asks for a Bob prompt, ADA must output only the Bob prompt.
- No conversational preamble.
- No follow-up questions.
- No optional variants after the prompt.
- No “If you want…”
- No “Para que Bob trabaje mejor…”
- No “Opción A/B/C…”
- The output must be copy-ready for IBM Bob.

Required Bob prompt structure:
- Mission Title:
- Context:
- Goal:
- Scope:
- Non-goals:
- Constraints:
- Required work:
- Acceptance criteria:
- Validation:
- Required Bob output:
- Evidence requirement:
- Alignment confirmation:

Required fix 5 — readiness checklist isolation:
- “Bob prompt ready” should reset to PENDING when switching to a project with no Bob prompt.
- It should become PASS only when that project has a real prompt detected/generated.
- “Evidence exported” should not stay PASS across projects unless export happened in the current project session.

Validation required:
- pnpm typecheck
- pnpm lint
- pnpm build

Manual tests:
Test 1 — New project state isolation:
1. In Project A, generate a Bob prompt.
2. Create Project B.
3. Select Project B.
Expected:
- Bob Prompt Preview does NOT show Project A prompt.
- Copy button disabled or inactive.
- Bob prompt ready = PENDING.

Test 2 — Existing project prompt restoration:
1. Return to Project A.
Expected:
- Project A prompt appears again if it exists in chat history.
- Chat does not dump full prompt.
- Preview shows clean prompt.

Test 3 — Clean prompt:
User asks:
“dame el prompt para Bob”
Expected:
- Chat shows only short confirmation.
- Bob Prompt Preview contains only the Bob mission prompt.
- Preview does NOT include:
  “Si quieres…”
  “If you want…”
  “Para que Bob trabaje mejor…”
  “Opción A/B/C”
  extra user-facing questions.

Test 4 — Broad idea stays intake:
User says:
“quiero hacer una ia como claude o openai”
Expected:
- Intake response stays in chat.
- Bob Prompt Preview does not update.

Before changing files:
List exact files you will modify.

After implementation:
Provide:
- changed files
- how workspace panel state reset was implemented
- how prompt cleanup was implemented
- validation commands and results
- known risks
- suggested commit message

Suggested commit message:
fix: isolate project prompt state and clean Bob prompt previews

Confirm alignment with AGENTS.md, ADA_SPEC.md, and IBM Bob Hackathon evidence workflow.

Context Length	
41.7k
200.0k

Task Id	
45d50e01-9017-4eee-930f-dc7b25b4d5d4
Tokens	
↑ 511.4k
↓ 5.7k
Cache	
↑ 35.2k
↓ 476.2k
API Cost	1.29
Size	2.23 MB