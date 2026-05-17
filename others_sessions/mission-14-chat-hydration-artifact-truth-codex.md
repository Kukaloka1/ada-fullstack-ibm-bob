# Mission 14 — Hydrate ADA Chat From Durable Workspace Truth

## Goal

Make ADA chat responses aware of the selected workspace's durable state before responding.

## Implemented

- Hydrated chat context from latest workspace-scoped artifacts:
  - `bob_prompt`
  - `qa_report`
  - `delivery_report`
  - `release_gate`
- Included compact durable truth in ADA context:
  - mission title
  - mission record status
  - Bob prompt available
  - QA status
  - evidence exported
  - release gate recorded
  - release gate status
- Added `ada_memory` summary hydration into chat context.
- Enforced artifact truth over memory and recent chat when status questions are asked.

## Validation

- pnpm typecheck: PASS
- pnpm lint: PASS
- pnpm build: PASS
- Live chat status query against real workspace state: PASS

## Status

PASS
