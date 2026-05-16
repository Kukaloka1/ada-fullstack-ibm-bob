Mission 08 — Persist Structured ADA Artifacts and Mission State

We are building ADA — AI Delivery Architect for the IBM Bob Hackathon.

Goal:
Make ADA’s cockpit state durable and structured by wiring the existing Supabase foundation tables that are currently prepared but underused.

Current system state:
- Projects/workspaces persist through ada_workspaces.
- Chat messages persist through ada_messages.
- ADA chat API works server-side.
- Project switching works.
- Chat history restores after refresh.
- Bob Prompt Preview works in the UI.
- Bob prompt routing is fixed: long Bob prompts stay in Bob Prompt Preview, not the chat.
- Current active tables:
  - ada_workspaces
  - ada_messages
- Existing foundation tables not fully wired yet:
  - ada_missions
  - ada_artifacts
  - ada_memory

Problem:
The cockpit works, but important operational state still relies too much on chat text and local client state.

Examples:
- Bob Prompt Preview is reconstructed from chat history instead of a durable artifact.
- Current Mission is not fully persisted in ada_missions.
- Delivery Report export downloads locally but is not saved as an artifact.
- Readiness Checklist is mostly client-side heuristic state.
- QA reports / release gate artifacts are not yet durable records.

Goal of this mission:
Persist the structured operational objects that make ADA a real delivery cockpit:

- Current Mission → ada_missions
- Bob Prompt Preview → ada_artifacts with artifact_type = "bob_prompt"
- Delivery Report → ada_artifacts with artifact_type = "delivery_report"
- Optional lightweight workspace memory state → ada_memory, only if safely supported by existing schema

Important:
This is a controlled persistence mission.
Do not redesign the UI.
Do not add new product surfaces unless required.
Do not create a new database schema unless absolutely unavoidable.
Use the existing migration/schema as source of truth.

Required files to inspect:
- supabase/migrations/001_ada_memory_foundation.sql
- apps/web/lib/ada/types.ts
- apps/web/lib/ada/memory.ts
- apps/web/components/AdaCockpit.tsx
- apps/web/components/ChatPanel.tsx
- apps/web/components/ContextPanel.tsx
- apps/web/app/api/ada/messages/route.ts
- apps/web/app/api/ada/workspaces/route.ts

Allowed files to modify:
- apps/web/app/api/ada/artifacts/route.ts
- apps/web/app/api/ada/missions/route.ts
- apps/web/lib/ada/memory.ts
- apps/web/lib/ada/types.ts
- apps/web/components/AdaCockpit.tsx
- apps/web/components/ChatPanel.tsx
- apps/web/components/ContextPanel.tsx
- docs/ADA_SPEC.md
- docs/DELIVERY_WORKFLOW.md
- docs/HACKATHON_EVIDENCE.md
- AGENTS.md
- bob_sessions/README.md

Only modify Supabase migration if the existing schema is truly insufficient.
If migration/schema changes are needed, explain exactly why before making them.

Do not modify:
- auth
- billing
- GitHub OAuth
- pgvector
- vector DB
- RLS policy complexity
- package.json unless absolutely necessary
- env files
- unrelated UI/layout
- project/workspace creation behavior unless required

Required work:

1. Add server-side artifacts API

Create:
- GET /api/ada/artifacts
- POST /api/ada/artifacts

GET behavior:
- Accept workspaceId query param.
- Optional artifactType query param.
- Return artifacts for that workspace, ordered by updated_at or created_at descending.
- Limit default to latest 20.
- Server-side Supabase only.

POST behavior:
- Accept:
  {
    "workspaceId": string,
    "artifactType": string,
    "title": string,
    "content": string,
    "metadata"?: object
  }

- Validate all required fields.
- Do not accept empty content.
- Insert into ada_artifacts.
- Return created artifact.
- Server-side Supabase only.

Allowed artifact types for this mission:
- bob_prompt
- delivery_report
- qa_report
- release_gate
- note

If the database currently uses different column names or enum style, adapt to the existing schema. Do not invent names without inspecting migration/types first.

2. Add server-side missions API

Create:
- GET /api/ada/missions
- POST /api/ada/missions
- PATCH /api/ada/missions

GET behavior:
- Accept workspaceId query param.
- Return missions for that workspace.
- Support activeOnly=true if practical.

POST behavior:
- Accept:
  {
    "workspaceId": string,
    "title": string,
    "objective"?: string,
    "status"?: string
  }

- Create a mission in ada_missions.
- For MVP, status may default to "active" or whatever matches existing schema.

PATCH behavior:
- Accept:
  {
    "missionId": string,
    "status"?: string,
    "title"?: string,
    "objective"?: string
  }

- Update the mission.
- Return updated mission.

Use the existing schema exactly.

3. Persist Bob Prompt Preview

When a Bob prompt is generated/detected in ChatPanel and sent to onBobPromptDetected:
- AdaCockpit should persist it as an artifact:
  artifact_type = "bob_prompt"
  title = meaningful title, e.g. "Bob Prompt"
  content = clean prompt
  workspace_id = selected workspace

Behavior:
- Bob Prompt Preview should still update immediately in UI.
- Persisting failure should not crash the chat.
- Show/record console warning only; no giant user-facing failure unless necessary.
- On workspace load/switch, AdaCockpit should load the latest bob_prompt artifact for that workspace first.
- If no artifact exists, it can still allow ChatPanel to reconstruct from history as fallback.

4. Persist Delivery Report

When Export Markdown is clicked:
- Generate current markdown as now.
- Save it as artifact_type = "delivery_report".
- Include title like "Delivery Report".
- Include metadata such as timestamp and workspaceId if schema supports JSON metadata.
- Then download the markdown as currently implemented.

Behavior:
- Download remains.
- Artifact persists in Supabase.
- Failure to persist should not block download, but should be logged.

5. Current Mission persistence

Replace or complement the hardcoded current mission state with durable mission loading:
- On workspace selection, load active mission from ada_missions if it exists.
- If no mission exists, keep default visible state.
- Provide a minimal helper to create/update mission if current UI needs it.
- Do not build a large mission editor UI in this mission.
- The goal is foundation wiring, not a full mission management dashboard.

6. Readiness checklist alignment

Keep readiness checklist simple, but make it derive from durable state where possible:
- Bob prompt ready = PASS if a latest bob_prompt artifact exists for selected workspace.
- Evidence exported = PASS if a delivery_report artifact exists for selected workspace.
- Mission structured = PASS if active mission exists OR messages exist.
- QA review complete = PASS if qa_report artifact exists.
- Release gate can remain PENDING unless release_gate artifact exists.

Do not over-engineer.
Do not add new tables.
Do not add complex state machines.

7. Preserve project isolation

All artifact and mission operations must be scoped by workspaceId.
Switching projects must not show another project’s artifacts.
New projects should start with empty/default artifacts.

8. Security rules

- No Supabase client-side access.
- No service role in client components.
- No OpenAI key in client components.
- No NEXT_PUBLIC_SUPABASE_ANON_KEY.
- No secrets committed.
- Browser talks only to Next.js API routes.

9. UI behavior

Minimal UI changes only:
- Bob Prompt Preview should load from latest bob_prompt artifact when available.
- Export Markdown should persist delivery_report.
- Readiness Checklist should reflect loaded artifacts/missions.
- Do not redesign layout.
- Do not add new large panels.

10. Validation required

Run:
- pnpm typecheck
- pnpm lint
- pnpm build

Also run:
- grep -R "SUPABASE_SERVICE_ROLE_KEY" apps/web/app apps/web/components --exclude-dir=node_modules --exclude-dir=.next || true
- grep -R "OPENAI_API_KEY" apps/web/app apps/web/components --exclude-dir=node_modules --exclude-dir=.next || true
- grep -R "NEXT_PUBLIC_SUPABASE_ANON_KEY" apps/web --exclude-dir=node_modules --exclude-dir=.next || true

Expected:
- SUPABASE_SERVICE_ROLE_KEY only server-side
- OPENAI_API_KEY only server-side
- no NEXT_PUBLIC_SUPABASE_ANON_KEY

Manual browser validation:
1. Create/select Project A.
2. Ask ADA for a Bob prompt.
3. Confirm Bob Prompt Preview updates.
4. Refresh browser.
5. Confirm Bob Prompt Preview restores from durable artifact.
6. Create/select Project B.
7. Confirm Project B does not show Project A prompt.
8. Export Markdown in Project A.
9. Confirm a delivery_report artifact is created.
10. Confirm readiness checklist updates from artifacts.
11. Confirm chat still works normally.

Before changing files:
List exact files you will create or modify.

After implementation:
Provide:
- changed files
- APIs created
- persistence behavior implemented
- how artifacts are scoped by workspace
- how mission state is loaded/persisted
- validation commands and results
- manual test results or expected test steps
- known risks
- suggested commit message

Suggested commit message:
feat: persist ADA artifacts and mission state

At the end, update the relevant source-of-truth specs/docs to reflect what was completed, what changed, and what remains pending.

Confirm alignment with AGENTS.md, ADA_SPEC.md, DELIVERY_WORKFLOW.md, HACKATHON_EVIDENCE.md, and the IBM Bob Hackathon evidence workflow.

Context Length	
114.5k
200.0k

Task Id	
6e4ef635-6eb9-46c5-907d-81fc26f44030
Tokens	
↑ 4.6m
↓ 18.7k
Cache	
↑ 268.3k
↓ 4.3m
API Cost	11.50
Size	3.9 MB