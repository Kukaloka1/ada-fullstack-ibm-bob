# Mission 11C — Fix QA Output Routing and Verdict Detection

## Goal

Stop ADA QA review output from being misrouted into Bob Prompt Preview.

## Implemented

- Hardened Bob prompt detection so QA-shaped output is excluded from prompt routing.
- Kept QA reviews in chat even when they contain structured headings.
- Restricted the Bob prompt confirmation message to real Bob-prompt generation only.
- Preserved live QA verdict detection from `QA Verdict:` lines so the ADA QA panel updates correctly.
- Prevented persisted QA review messages from being transformed into Bob prompt confirmation on load.

## Validation

- pnpm typecheck: PASS
- pnpm lint: PASS
- pnpm build: PASS

## Status

PASS
