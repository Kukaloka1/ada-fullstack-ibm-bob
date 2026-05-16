Mission 03 — Supabase Memory Foundation

We are building ADA for the IBM Bob Hackathon.

Goal:
Implement the minimal Supabase memory foundation for ADA.

Context:
ADA is a chat-first AI Delivery Architect for IBM Bob workflows.
ADA needs persistent structured memory so it can remember:
- workspace state
- chat messages
- missions
- generated artifacts
- memory summaries
- decisions
- constraints
- pending items

This mission is infrastructure only.
Do not implement real ADA chat yet.
Do not call the LLM yet.
Do not build auth.
Do not build billing.
Do not build GitHub OAuth.
Do not build vector search.
Do not build pgvector.
Do not build a complex backend.

Required work:
1. Add Supabase dependency to apps/web if needed.
2. Create Supabase server/client helper files.
3. Create SQL migration or schema file for the minimal ADA memory tables.
4. Create TypeScript types for ADA memory records.
5. Create lightweight memory helper functions if practical.
6. Update .env.example with required Supabase variables.
7. Update docs only if needed.

Required minimal schema:
- ada_workspaces
- ada_messages
- ada_missions
- ada_artifacts
- ada_memory

Schema requirements:
- uuid primary keys
- created_at timestamps
- updated_at timestamps where useful
- workspace_id relationships
- jsonb fields for constraints, decisions, pending_items, metadata
- no auth dependency for MVP
- no RLS complexity yet unless documented as future work

Expected files may include:
- apps/web/lib/supabase/server.ts
- apps/web/lib/supabase/client.ts
- apps/web/lib/ada/types.ts
- apps/web/lib/ada/memory.ts
- supabase/migrations/001_ada_memory_foundation.sql
- .env.example

Constraints:
- No real secrets.
- Do not create .env.
- Do not implement user login.
- Do not require Supabase Auth.
- No unrelated changes.
- Keep files modular.
- Avoid files over 500 lines.
- Preserve current UI.
- Preserve docs/evidence files.

Before changing files:
List exact files you will create or modify.

After implementation:
Provide:
- changed files
- validation steps
- known risks
- suggested commit message

Validation:
- pnpm install if dependencies changed
- pnpm typecheck
- pnpm lint
- pnpm build

Also confirm:
- no .env file created
- no secrets committed
- no auth added
- no pgvector added
- no unrelated app UI changes

Suggested commit message:
feat: add Supabase memory foundation for ADA

Confirm alignment with the official IBM Bob Hackathon guide and the ADA spec.

Context Length	
54.9k
200.0k

Task Id	
8b72b148-3fd6-4148-8392-b8af92bc6ddf
Tokens	
↑ 1.0m
↓ 14.9k
Cache	
↑ 54.0k
↓ 987.9k
API Cost	2.64
Size	467 kB