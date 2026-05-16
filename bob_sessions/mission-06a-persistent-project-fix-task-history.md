Mission 06A — Fix Chat History Loop and Add Persistent Project Creation

We are building ADA for the IBM Bob Hackathon.

Goal:
Fix the incomplete Mission 06 implementation.

Current uncommitted work already added:
- GET /api/ada/messages
- persistent chat loading
- Projects section
- professional scroll panels

Critical bugs to fix:
1. /api/ada/messages is being called in an infinite loop.
2. Projects section only shows a static project.
3. Users need to create/select persistent projects/workspaces.
4. Browser refresh should preserve selected project and chat history.

Do not redesign the UI.
Do not add auth.
Do not add billing.
Do not add GitHub OAuth.
Do not add pgvector.
Do not add vector DB.
Do not add Supabase client-side access.
Do not expose service role or OpenAI key to client.
Do not create .env files.
Do not modify docs or bob_sessions.

Allowed files:
- apps/web/app/api/ada/messages/route.ts
- apps/web/app/api/ada/workspaces/route.ts
- apps/web/components/AdaCockpit.tsx
- apps/web/components/ChatPanel.tsx
- apps/web/components/WorkflowSidebar.tsx
- apps/web/components/ContextPanel.tsx only if needed
- apps/web/lib/ada/memory.ts only if small helpers are needed
- apps/web/lib/ada/types.ts only if small types are needed

Required fix 1 — stop infinite messages loop:
- Chat history must load once on mount and whenever workspaceId changes.
- Do not re-fetch messages when messages state changes.
- Do not include messages, readinessItems, or unstable callback references in fetch effect dependencies.
- Use AbortController or mounted flag.
- In React dev mode, one or two initial calls are acceptable, but no continuous polling.

Required fix 2 — persistent projects:
- Add server-side API route:
  GET /api/ada/workspaces
  POST /api/ada/workspaces

GET:
- Return workspaces ordered by updated_at desc.
- Server-side Supabase only.

POST:
- Accept { "name": string }
- Validate name.
- Create workspace in ada_workspaces.
- Return created workspace.
- Server-side Supabase only.

Required fix 3 — Projects UI:
- Show projects in WorkflowSidebar.
- Show selected workspace as ACTIVE.
- Add simple New Project button/input.
- User can create a project.
- User can select a project.
- Keep IBM/control-room style.

Required fix 4 — selected workspace:
- AdaCockpit owns selectedWorkspaceId.
- Load workspaces on mount.
- Select saved workspace from localStorage if valid.
- Otherwise select ADA Hackathon MVP workspace:
  00000000-0000-4000-8000-000000000001
- Persist selected workspace id to localStorage.
- When workspace changes, ChatPanel reloads messages for that workspace.

Required fix 5 — preserve current behavior:
- POST /api/ada/chat still uses selected workspaceId.
- If workspace has no messages, show default ADA intro.
- Bob Prompt Preview behavior remains.
- Export Markdown uses selected project/workspace.

Validation required:
- pnpm typecheck
- pnpm lint
- pnpm build

Also run:
- grep -R "SUPABASE_SERVICE_ROLE_KEY" apps/web/app apps/web/components --exclude-dir=node_modules --exclude-dir=.next || true
- grep -R "OPENAI_API_KEY" apps/web/app apps/web/components --exclude-dir=node_modules --exclude-dir=.next || true
- grep -R "NEXT_PUBLIC_SUPABASE_ANON_KEY" apps/web --exclude-dir=node_modules --exclude-dir=.next || true

Manual browser validation:
1. Load page.
2. Confirm /api/ada/messages does not loop forever.
3. Create a new project.
4. Select the new project.
5. Send a message.
6. Refresh browser.
7. Confirm selected project and chat history persist.
8. Switch back to ADA Hackathon MVP.
9. Confirm previous history loads.
10. Confirm chat and Bob Prompt Preview have internal scroll only.

After implementation:
Provide changed files, loop fix explanation, persistent projects explanation, validation commands, known risks, and suggested commit message.

Suggested commit message:
feat: add persistent ADA project chat workspace

Confirm alignment with AGENTS.md, ADA_SPEC.md, and IBM Bob Hackathon evidence workflow.

Context Length	
54.0k
200.0k

Task Id	
6f7e334a-05e6-4e4b-bf68-453c1401041b
Tokens	
↑ 1.1m
↓ 10.6k
Cache	
↑ 39.3k
↓ 1.1m
API Cost	2.78
Size	1.92 MB

