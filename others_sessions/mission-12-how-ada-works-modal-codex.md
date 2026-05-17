# Mission 12 — How ADA Works Onboarding Modal

## Goal

Add in-product onboarding so users and judges understand ADA’s workflow.

## Implemented

- Added How ADA Works button in the header.
- Added onboarding modal with close button, backdrop close, Escape close, and dialog aria attributes.
- Modal explains the full workflow:
  - Create project
  - Describe mission
  - Generate Bob prompt
  - Let Bob work
  - Paste builder output back into ADA
  - ADA produces QA verdict
  - Export delivery evidence
  - Approve release gate
- Modal clarifies:
  - QA is ADA’s technical review
  - Release Gate is the human delivery decision
  - Bob Prompt Preview is only for build prompts
  - IBM Bob reports belong in bob_sessions
- Updated source-of-truth docs.

## Validation

- pnpm typecheck: PASS
- pnpm lint: PASS
- pnpm build: PASS

## Status

PASS
