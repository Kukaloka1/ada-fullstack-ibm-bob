# Mission 15 — Add Mission Lifecycle: Close Current Mission and Open Next Mission

## Goal

Support repeated delivery cycles inside the same project by closing missions cleanly without losing project history.

## Implemented

- Added `Close Mission` action with confirmation modal.
- Mapped release outcomes to closed mission statuses:
  - `approved`
  - `approved_with_conditions`
  - `blocked`
  - `closed`
- Reset active-cycle UI state after close:
  - Bob Prompt Preview cleared
  - QA reset
  - Release Gate reset
  - evidence/checklist reset for the next mission
- Preserved workspace selection, chat history, artifacts, and memory.
- Added compact lifecycle state:
  - current mission active/none
  - closed missions count
- Added `Open New Mission` quick action behavior for active-versus-closed mission flow.

## Validation

- pnpm typecheck: PASS
- pnpm lint: PASS
- pnpm build: PASS
- API lifecycle validation for closed mission statuses: PASS

## Status

PASS
