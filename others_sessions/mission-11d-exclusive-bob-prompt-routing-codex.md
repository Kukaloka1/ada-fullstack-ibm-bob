# Mission 11D — Enforce Exclusive Bob Prompt Routing

## Goal

Make Bob Prompt Preview exclusive to real Bob implementation prompts and keep those prompts out of normal chat.

## Implemented

- Added explicit Bob-intent routing so Bob prompt requests always route to Bob Prompt Preview.
- Prevented full Bob prompts from rendering in chat for explicit Bob prompt requests.
- Added prompt extraction cleanup so preview content strips preamble and trailing conversational text.
- Hardened persisted prompt restoration so invalid QA-looking `bob_prompt` artifacts are ignored by the UI.
- Kept QA reviews, delivery reports, commit suggestions, and release decisions in chat.

## Validation

- pnpm typecheck: PASS
- pnpm lint: PASS
- pnpm build: PASS

## Status

PASS
