Mission 05B — Polish ADA Chat UX and Structured Panel Routing

We are building ADA for the IBM Bob Hackathon.

Goal:
Polish the existing ADA cockpit chat UI and make structured outputs route to the correct cockpit panels.

This is NOT a redesign.
This is NOT a new architecture mission.
This is a UX wiring and presentation polish mission.

Current state:
- ADA cockpit UI exists.
- POST /api/ada/chat works.
- Supabase memory works.
- OpenAI response works.
- Chat messages render in the center panel.
- Right panel includes Bob Prompt Preview, Readiness Checklist, and Release Gate.

Critical requirement:
Preserve the current IBM-modern control-room visual system.
Do not make it look like a generic SaaS chatbot.
Do not move the main layout.

Required work:

1. Chat message presentation
Improve how user and ADA messages render in the chat interface.

Requirements:
- User messages should remain visually distinct.
- ADA messages should look premium, readable, and professional.
- Support multiline content cleanly.
- Support basic markdown-like formatting:
  - paragraphs
  - bullet lists
  - numbered lists
  - bold text if simple to support
  - code blocks if simple to support
- Do not add a heavy markdown library unless already available or clearly justified.
- Keep it lightweight.

2. Internal chat scroll
Ensure the central conversation area scrolls internally.
The input area and quick action chips must remain anchored at the bottom of the chat panel.
The whole page should not jump when conversation grows.

3. Bob Prompt Preview routing
When ADA response contains a Bob-ready mission prompt, route the full prompt to the Bob Prompt Preview panel.

Do not dump giant Bob prompts inside the normal chat stream.

Detection should catch content with signals like:
- "Mission"
- "Goal:"
- "Required work:"
- "Validation:"
- "Suggested commit message:"
- "Before changing files:"
- "After implementation:"
- "Confirm alignment"

Behavior:
- Full Bob prompt appears in Bob Prompt Preview panel.
- Chat shows a short ADA confirmation:
  "I prepared a Bob-ready mission prompt. Review it in the Bob Prompt Preview panel."
- Readiness Checklist updates "Bob prompt ready" to PASS.

4. Structured panel state
Improve the right panel state using client-side state only.

Panel fields:
- Current Mission title
- Current Mission summary
- Bob Prompt Preview
- Readiness Checklist
- Release Gate status

Do not add new database tables.
Do not add server persistence for panel state in this mission.

5. Quick action behavior
Improve quick action chips.

Expected behavior:
- "Turn this into a Bob mission" should prepare a clear instruction in the textarea.
- "Generate Bob-ready prompt" should ask ADA to generate a complete Bob mission prompt.
- "Review Bob output" should prepare a review instruction.
- "Find scope creep" should prepare a scope-control instruction.
- "Prepare QA verdict" should prepare a PASS / CONDITIONAL PASS / FAIL instruction.
- "Create commit message" should prepare a commit handoff instruction.
- "Prepare push handoff" should prepare a push-readiness instruction.
- "Generate delivery report" should prepare a delivery report instruction.

Keep this simple:
Clicking a chip may populate the textarea.
Do not auto-submit unless the current behavior already does so cleanly.

6. Export Markdown
Improve the local Export Markdown output.

It should include:
- timestamp
- workspace id
- current mission
- readiness checklist
- release gate status
- Bob Prompt Preview if present
- recent chat messages summary

No server persistence required.

7. Error and loading states
Improve visible loading/error states:
- While ADA is responding, show a polished "ADA is reviewing..." state.
- If API fails, show a concise error message in the chat.
- Do not expose raw stack traces to users.

Technical constraints:
- No auth.
- No billing.
- No GitHub OAuth.
- No pgvector.
- No vector DB.
- No Supabase client-side access.
- No service role in client.
- No OpenAI key in client.
- No new heavy UI framework.
- No unrelated changes.
- Keep files modular.
- Avoid files over 500 lines.
- TypeScript strict.
- Preserve current app routes and API behavior.

Allowed files:
- apps/web/components/AdaCockpit.tsx
- apps/web/components/ChatPanel.tsx
- apps/web/components/ContextPanel.tsx
- apps/web/components/WorkflowSidebar.tsx only if needed
- apps/web/app/page.tsx only if needed
- apps/web/lib/ada/* only if absolutely needed for shared formatting helpers

Do not modify:
- Supabase migration
- Supabase server client
- API route unless absolutely necessary
- package.json unless absolutely necessary
- env files
- docs
- bob_sessions

Before changing files:
List exact files you will create or modify.

After implementation:
Provide:
- changed files
- behavior implemented
- validation commands
- known risks
- suggested commit message

Validation required:
- pnpm typecheck
- pnpm lint
- pnpm build

Also run:
- grep -R "SUPABASE_SERVICE_ROLE_KEY" apps/web/app apps/web/components --exclude-dir=node_modules --exclude-dir=.next || true
- grep -R "OPENAI_API_KEY" apps/web/app apps/web/components --exclude-dir=node_modules --exclude-dir=.next || true
- grep -R "NEXT_PUBLIC_SUPABASE_ANON_KEY" apps/web --exclude-dir=node_modules --exclude-dir=.next || true

Expected:
- no service role in client UI
- no OpenAI key in client UI
- no anon key
- chat messages look clean and professional
- Bob prompts route to Bob Prompt Preview panel
- internal chat scroll remains correct
- quick actions work predictably
- export markdown works
- typecheck/lint/build pass

Suggested commit message:
feat: polish ADA chat UX and structured panels

Confirm alignment with AGENTS.md, ADA_SPEC.md, and the IBM Bob Hackathon evidence workflow.

Context Length	
41.0k
200.0k

Task Id	
0cacac19-3659-4fb7-b7bc-a3cf2cde5546
Tokens	
↑ 602.7k
↓ 12.0k
Cache	
↑ 40.0k
↓ 562.7k
API Cost	1.54
Size	1.63 MB