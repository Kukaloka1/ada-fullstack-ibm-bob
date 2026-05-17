# `apps/web` — ADA Cockpit

This package contains the main ADA cockpit application.

## What Lives Here

- chat-first ADA UI
- project and workspace controls
- Bob Prompt Preview
- QA Report and Release Gate panels
- mission lifecycle controls
- Next.js API routes under `app/api/ada`

## Product Role

This app is the operational cockpit around IBM Bob workflows.

The intended flow is:

```txt
Human Lead → ADA → IBM Bob → ADA QA → Release Gate → Commit/Push
```

## Key Directories

- `app/`
  Next.js app router entrypoints and API routes.
- `components/`
  Cockpit UI components.
- `lib/ada/`
  ADA prompt logic, context building, memory sync, and durable-state helpers.
- `lib/supabase/`
  Server-side Supabase client utilities.

## Development

From the repository root:

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
```

## Important Constraints

- Supabase remains server-side only.
- Bob prompts belong in Bob Prompt Preview, not normal chat.
- Durable artifacts are the source of truth for delivery state.
- `ada_memory` is a deterministic summary layer, not the authority over artifacts.
