# Mission 15C — Route Close Mission Chat Intent To Lifecycle Modal

## Goal

Make chat-based mission-closure intent trigger the real Close Mission confirmation modal instead of a conversational-only response.

## Implemented

- Added deterministic close-intent detection for English and Spanish mission-close requests.
- Intercepted close-mission intent before the LLM call so ADA does not hallucinate that the mission was already closed.
- Reused the existing Close Mission confirmation modal for:
  - manual button clicks
  - chat close-intent requests
  - follow-up confirmations after ADA asks whether to close first
- Added handling for short replies like `yes`, `sí`, `close it`, `cierra`, and continue replies like `no`, `continue`, `seguir`.
- Kept mission close execution behind explicit modal confirmation only.

## Validation

- pnpm typecheck: PASS
- pnpm lint: PASS
- pnpm build: PASS

## Status

PASS
