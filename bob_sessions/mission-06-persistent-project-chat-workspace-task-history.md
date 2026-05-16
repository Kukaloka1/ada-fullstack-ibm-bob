Mission 06 — Persistent Projects, Chat History, and Professional Scroll Panels

We are building ADA for the IBM Bob Hackathon.

Goal:
Make the ADA cockpit behave like a real persistent delivery workspace instead of a temporary chat screen.

Current state:
- ADA chat UI works.
- POST /api/ada/chat works.
- Supabase memory tables exist.
- Messages are stored in ada_messages.
- The UI currently loses visible conversation state on browser refresh.
- The right Bob Prompt Preview panel exists but needs cleaner behavior.
- The workflow sidebar exists but does not yet expose projects/workspaces.

Critical product requirement:
ADA must feel closer to ChatGPT-style persistent workspaces:
- users can return to a project,
- chat history reloads,
- context is not lost on refresh,
- panels remain professional and scroll internally.

Do not redesign the visual system.
Do not make it generic SaaS.
Preserve the IBM-modern control-room aesthetic.

Required work:

1. Persistent workspace / project loading
- Use the existing MVP workspace ID:
  00000000-0000-4000-8000-000000000001
- On page load, fetch recent messages for that workspace from Supabase through a server-side API route.
- Do not query Supabase directly from client components.
- Browser must call Next.js API only.

Recommended new API route:
- GET /api/ada/messages?workspaceId=...
- Returns recent messages for the workspace.
- Uses server-side Supabase client.
- No auth.
- No Supabase client-side access.

2. Restore chat after refresh
- ChatPanel should load persisted messages on mount.
- If messages exist, show them instead of starting from default intro only.
- If no messages exist, show the default ADA intro.
- Preserve the existing send flow.

3. Projects / Workspaces section
- Add a small Projects section below the left Workflow area.
- Keep it simple for MVP.
- Display one project:
  ADA Hackathon MVP
- It should show active/selected state.
- Do not build full project creation yet unless trivial.
- Do not add auth.
- Do not add multi-user support.
- The purpose is to communicate persistent project/workspace memory.

4. Professional internal scroll behavior
Fix scroll behavior so the UI does not push the page down when messages grow.

Requirements:
- Central chat panel has fixed operational height based on viewport.
- Conversation area scrolls internally.
- Input + quick actions remain anchored at bottom.
- Right Bob Prompt Preview panel scrolls internally.
- Right checklist/release panels remain readable.
- Page itself should remain stable, like a cockpit.

5. Bob Prompt Preview behavior
Improve the Bob Prompt Preview panel:
- It should show only the clean Bob prompt.
- It should not include chat preamble like:
  "Aquí tienes..."
  "Here is..."
  "I prepared..."
- Strip obvious assistant preamble before storing preview if possible.
- Add a Copy button in the Bob Prompt Preview panel.
- Copy button copies only the clean prompt content.
- Show small copied state, e.g. "Copied".

6. Readiness Checklist state alignment
Make checklist better aligned with actual UI state:
- Mission structured: PASS once a user has sent at least one meaningful message.
- Planning gate created: PASS when ADA response includes planning/phase/criteria language.
- Bob prompt ready: PASS when Bob Prompt Preview contains a generated prompt.
- QA review complete: PASS when ADA response indicates PASS / CONDITIONAL PASS / FAIL review.
- Evidence exported: PASS when Export Markdown button has been used.

Keep this heuristic/client-side for MVP.
Do not add new tables.
Do not over-engineer.

7. Export Markdown
Export should include:
- project/workspace name
- recent chat messages
- current mission summary
- Bob Prompt Preview clean content
- readiness checklist statuses
- release gate status
- timestamp

8. Security constraints
- No service role in client components.
- No OpenAI key in client components.
- No Supabase client-side access.
- No NEXT_PUBLIC_SUPABASE_ANON_KEY.
- No secrets committed.
- Do not create .env files.

9. Technical constraints
- No auth.
- No billing.
- No GitHub OAuth.
- No pgvector.
- No vector DB.
- No complex project management system.
- No new heavy UI framework.
- No unrelated changes.
- Keep files modular.
- Avoid files over 500 lines.
- TypeScript strict.

Allowed files:
- apps/web/app/api/ada/messages/route.ts
- apps/web/components/AdaCockpit.tsx
- apps/web/components/ChatPanel.tsx
- apps/web/components/ContextPanel.tsx
- apps/web/components/WorkflowSidebar.tsx
- apps/web/lib/ada/format-message.ts only if needed
- apps/web/lib/ada/memory.ts only if a small helper is required
- apps/web/lib/ada/types.ts only if a small type is required

Do not modify:
- Supabase migration unless absolutely necessary
- Supabase server client unless absolutely necessary
- OpenAI chat route unless absolutely necessary
- package.json unless absolutely necessary
- docs
- bob_sessions
- env files

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
- conversation reloads after browser refresh
- project section appears in left sidebar
- chat scroll is internal and professional
- Bob Prompt Preview scroll is internal
- Bob Prompt Preview has copy button
- Bob Prompt Preview contains clean prompt only
- checklist reflects actual interaction state better
- no service role in client UI
- no OpenAI key in client UI
- no anon key
- typecheck/lint/build pass

Suggested commit message:
feat: add persistent ADA project chat workspace

Confirm alignment with AGENTS.md, ADA_SPEC.md, and the IBM Bob Hackathon evidence workflow.

Context Length	
53.8k
200.0k

Task Id	
96c93145-0885-42d6-a799-34af3fbd28b7
Tokens	
↑ 1.1m
↓ 14.1k
Cache	
↑ 52.8k
↓ 1.1m
API Cost	2.81
Size	1.97 MB