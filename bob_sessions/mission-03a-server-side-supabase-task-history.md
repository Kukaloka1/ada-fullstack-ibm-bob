Mission 03A — Make Supabase Memory Server-Side Only

We are building ADA for the IBM Bob Hackathon.

Goal:
Fix the Supabase memory foundation so ADA uses Supabase server-side only for the MVP.

Critical architecture rule:
The browser must not talk directly to Supabase in this MVP.
ADA UI should later talk to Next.js API routes/server code.
Next.js server code talks to Supabase.

Correct architecture:
Browser
→ Next.js UI
→ Next.js API Route / Server Action
→ Server-side Supabase client
→ Supabase Postgres

Do not implement the API route yet.
Do not implement ADA chat yet.
Do not implement OpenAI calls.
Do not implement auth.
Do not implement RLS.
Do not implement pgvector.
Do not modify UI.
Do not touch docs/evidence unless required.
Do not create .env.
Do not add new features.

Allowed files:
- apps/web/lib/supabase/server.ts
- apps/web/lib/supabase/client.ts
- .env.example
- supabase/migrations/001_ada_memory_foundation.sql
- apps/web/lib/ada/memory.ts only if imports need adjustment

Required changes:
1. Remove the client-side Supabase helper:
   - delete apps/web/lib/supabase/client.ts
   - no browser Supabase client for MVP

2. Keep only a server-side Supabase helper:
   - apps/web/lib/supabase/server.ts
   - it may use NEXT_PUBLIC_SUPABASE_URL
   - it must use SUPABASE_SERVICE_ROLE_KEY
   - it must be clearly server-only
   - it must not be imported by client components

3. Clean .env.example:
   Use only:
   NEXT_PUBLIC_SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   # OPENAI_API_KEY=
   # OPENAI_API_BASE_URL=

   Remove:
   NEXT_PUBLIC_SUPABASE_ANON_KEY

4. Fix migration extension:
   The migration uses gen_random_uuid().
   Therefore use:
   create extension if not exists "pgcrypto";

   Do not use uuid-ossp unless uuid_generate_v4() is used.

5. Preserve the existing ADA memory schema:
   - ada_workspaces
   - ada_messages
   - ada_missions
   - ada_artifacts
   - ada_memory

6. Do not spend time refactoring every `as any` in memory.ts.
   Only change memory.ts if required because of imports or server helper naming.
   Type cleanup can be future work.

Acceptable:
- Existing Made with Bob comments may remain.
- Existing limited Supabase type assertions may remain if validation passes.

Before changing files:
List exact files you will modify.

After changes:
Provide:
- changed files
- exact architecture correction made
- validation commands
- known risks
- suggested commit message

Validation required:
- pnpm typecheck
- pnpm lint
- pnpm build

Also run:
- find apps/web/lib/supabase -maxdepth 1 -type f -print | sort
- grep -R "NEXT_PUBLIC_SUPABASE_ANON_KEY" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next || true
- grep -R "uuid-ossp" supabase/migrations || true
- find . -name ".env*" -not -name ".env.example" -not -path "./node_modules/*" -not -path "./.git/*" -print

Expected:
- only apps/web/lib/supabase/server.ts exists under apps/web/lib/supabase
- no NEXT_PUBLIC_SUPABASE_ANON_KEY
- no uuid-ossp
- no .env or .env.local created
- typecheck/lint/build pass

Suggested commit message:
fix: make Supabase memory foundation server-side only

Confirm alignment with AGENTS.md, ADA_SPEC.md, and the IBM Bob Hackathon evidence workflow.

Context Length	
27.5k
200.0k

Task Id	
8d8553a3-c6f1-4410-b211-5bf04dd44013
Tokens	
↑ 374.3k
↓ 2.4k
Cache	
↑ 46.2k
↓ 328.0k
API Cost	0.94
Size	233 kB