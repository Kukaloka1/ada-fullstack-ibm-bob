Mission 01 — Scaffold ADA Turborepo Next.js App

We are building ADA — AI Delivery Architect for the IBM Bob Hackathon.

Current repository already exists and has a basic Turborepo folder structure, but Next.js is not installed yet.

Goal:
Create the initial working full-stack web app scaffold inside apps/web.

Product:
ADA is a chat-first software delivery control cockpit for disciplined AI-assisted engineering workflows using IBM Bob.

Core tagline:
Bob builds. Ada orchestrates and reviews. You lead.

Required stack:
- Turborepo
- pnpm
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready architecture
- OpenAI-compatible LLM API later
- IBM Bob IDE as required builder/evidence engine

Implement only the initial scaffold.

Required work:
1. Create a working Next.js App Router app in apps/web.
2. Configure TypeScript.
3. Configure Tailwind CSS.
4. Wire root scripts through Turborepo.
5. Connect packages/shared to apps/web if practical.
6. Create a simple ADA landing/dashboard shell at apps/web/app/page.tsx.
7. Use the visual direction:
   - IBM-modern
   - technical
   - clean
   - premium
   - control-room aesthetic
   - no playful toy UI
8. Include basic sections:
   - ADA header
   - workflow sidebar placeholder
   - central ADA chat placeholder
   - right context panel placeholder
9. Do not implement real LLM calls yet.
10. Do not implement Supabase yet.
11. Do not add auth.
12. Do not add database schema yet.
13. Do not add billing.
14. Do not add GitHub OAuth.
15. Do not add vector DB.
16. Do not add unrelated files.

Constraints:
- Keep files modular.
- Avoid any file over 500 lines.
- Do not commit secrets.
- Do not modify bob_sessions except preserving the folder.
- Update README only if needed for setup commands.
- Create .env.example only, never real .env values.

Before making changes:
List the exact files you plan to create or modify.

After implementation:
Provide:
- changed files
- install commands used
- validation commands
- known risks
- suggested commit message

Validation required:
- pnpm install
- pnpm lint if available
- pnpm typecheck if available
- pnpm build if available

Confirm alignment with the official IBM Bob Hackathon guide and the ADA spec.

Context Length	
63.4k
200.0k

Task Id	
d0ea30fe-3e34-43b6-804c-88c477d59ef3
Tokens	
↑ 1.5m
↓ 15.2k
Cache	
↑ 104.5k
↓ 1.4m
API Cost	3.77
Size	532 kB