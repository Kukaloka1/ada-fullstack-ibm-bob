Mission 04 — ADA Chat API + Context Builder

We are building ADA for the IBM Bob Hackathon.

Goal:
Implement the first server-side ADA chat API using the Supabase memory foundation.

ADA must be able to:
1. receive a user message,
2. save it to Supabase memory,
3. build compact workspace context,
4. call an OpenAI-compatible LLM server-side,
5. save ADA's response,
6. return the response to the frontend.

This mission is backend/API only plus minimal wiring if needed.
Do not redesign the UI.
Do not add auth.
Do not add billing.
Do not add GitHub OAuth.
Do not add pgvector.
Do not add vector search.
Do not expose Supabase service role to client.
Do not expose OpenAI key to client.
Do not create .env.
Do not commit secrets.

Current architecture:
Browser
→ Next.js UI
→ Next.js API Route
→ server-side Supabase client
→ Supabase Postgres

Allowed files:
- apps/web/app/api/ada/chat/route.ts
- apps/web/lib/ada/context-builder.ts
- apps/web/lib/ada/prompts.ts
- apps/web/lib/ada/memory.ts only if small helper additions are required
- apps/web/lib/ada/types.ts only if small types are required
- apps/web/package.json only if OpenAI dependency is needed
- .env.example only if OPENAI_API_KEY placeholder is missing

Required behavior:
- API route: POST /api/ada/chat
- Request body:
  {
    "workspaceId": string,
    "message": string
  }

- Validate input.
- Save user message to ada_messages.
- Load:
  - workspace memory summary
  - active mission if available
  - recent messages
  - latest artifacts if useful
- Build compact ADA context.
- Call OpenAI-compatible API server-side.
- Save ADA response to ada_messages with role "ada".
- Return:
  {
    "message": string
  }

System prompt must encode ADA doctrine:
- ADA is a strict AI Delivery Architect.
- Human Lead owns intent and approval.
- IBM Bob builds.
- ADA structures, reviews, validates, and controls delivery.
- ADA does not blindly trust builder summaries.
- Repo truth and evidence matter.
- ADA should be direct, scoped, and practical.

Implementation constraints:
- Server-side only.
- No client-side Supabase access.
- No auth.
- No RLS.
- No streaming yet unless trivial.
- No complex agent framework.
- No tools/function-calling yet.
- No unrelated changes.
- Keep files modular.
- Avoid files over 500 lines.
- TypeScript strict.

OpenAI:
- Use the official OpenAI package if needed.
- Use OPENAI_API_KEY from process.env.
- Model should be configurable with:
  OPENAI_MODEL=
- Default to a reasonable model string only in code if env var missing.
- Do not hardcode secrets.

Before changing files:
List exact files you will create or modify.

After implementation:
Provide:
- changed files
- validation commands
- known risks
- suggested commit message

Validation:
- pnpm install if dependency changed
- pnpm typecheck
- pnpm lint
- pnpm build

Also run:
- grep -R "OPENAI_API_KEY" apps/web --exclude-dir=node_modules --exclude-dir=.next || true
- grep -R "SUPABASE_SERVICE_ROLE_KEY" apps/web --exclude-dir=node_modules --exclude-dir=.next || true
- grep -R "NEXT_PUBLIC_SUPABASE_ANON_KEY" apps/web --exclude-dir=node_modules --exclude-dir=.next || true
- find . -name ".env*" -not -name ".env.example" -not -path "./node_modules/*" -not -path "./.git/*" -print

Expected:
- OPENAI_API_KEY only server-side
- SUPABASE_SERVICE_ROLE_KEY only server-side
- no NEXT_PUBLIC_SUPABASE_ANON_KEY
- no .env committed
- typecheck/lint/build pass

Suggested commit message:
feat: add ADA chat API and context builder

Confirm alignment with AGENTS.md, ADA_SPEC.md, and the IBM Bob Hackathon evidence workflow.

Context Length	
37.3k
200.0k

Task Id	
a2bdc8a8-cb9f-46f8-ba61-3fbbd371eb0b
Tokens	
↑ 695.8k
↓ 7.8k
Cache	
↑ 36.3k
↓ 659.4k
API Cost	1.76
Size	321 kB

