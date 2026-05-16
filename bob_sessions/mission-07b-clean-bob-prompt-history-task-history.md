Mission 07B — Keep Bob Prompts Out of Chat History Display

We are building ADA — AI Delivery Architect.

Goal:
Fix the UI/history behavior so Bob-ready prompts appear only in the Bob Prompt Preview panel, not as giant chat messages.

Current behavior:
When the user asks “dame el prompt para Bob”, ADA correctly generates a Bob-ready prompt and the Bob Prompt Preview panel updates.
However, the full Bob prompt can still appear in the chat stream, especially after persisted messages are reloaded from Supabase.

Why:
The API stores the full ADA response in ada_messages.
The client replaces the live response with a short confirmation, but when chat history reloads, the full stored prompt may be displayed as a normal ADA message.

Correct behavior:
- Bob Prompt Preview contains the full clean Bob prompt.
- Chat shows only a short confirmation:
  “✓ Bob-ready mission prompt prepared. Review it in the Bob Prompt Preview panel.”
- This must remain true after browser refresh and project switch.

Allowed files:
- apps/web/components/ChatPanel.tsx
- apps/web/lib/ada/format-message.ts only if helper extraction is useful
- apps/web/lib/ada/prompts.ts only if absolutely necessary

Do not modify:
- API routes
- Supabase schema
- DB migrations
- package.json
- docs
- bob_sessions
- env files
- layout design

Required fix:
1. When loading persisted messages in ChatPanel, inspect ADA messages.
2. If an ADA message is detected as a Bob-ready prompt:
   - strip assistant preamble if needed
   - send the clean prompt to onBobPromptDetected()
   - display only the short confirmation message in chat
3. When sending a new message, preserve the existing live behavior:
   - if response is Bob prompt, route full prompt to Bob Prompt Preview
   - display only confirmation in chat
4. Do not duplicate confirmations if several persisted Bob prompts exist.
   - It is acceptable to show one confirmation per detected Bob prompt, but avoid dumping full prompt text.
5. Keep Bob prompt detection strict:
   - require strong markers like Mission Title, Context, Goal, Scope, Non-goals, Required work, Acceptance criteria, Validation, Required Bob output, Evidence requirement, Confirm alignment.
6. Do not create new backend behavior unless absolutely required.

Validation:
- pnpm typecheck
- pnpm lint
- pnpm build

Manual tests:
Test 1:
Create fresh project.
Send: “quiero hacer una ia como claude o openai”
Expected:
- Intake response appears in chat.
- Bob Prompt Preview does NOT update.

Test 2:
Send: “dame el prompt para Bob”
Expected:
- Chat shows only short confirmation.
- Bob Prompt Preview shows full clean prompt.

Test 3:
Refresh browser.
Expected:
- Chat still shows only short confirmation.
- Full prompt remains only in Bob Prompt Preview.

Test 4:
Switch project and return.
Expected:
- Same behavior.
- No full Bob prompt dumped into chat.

Suggested commit message:
fix: keep Bob prompts out of chat history display

Confirm alignment with AGENTS.md, ADA_SPEC.md, and IBM Bob Hackathon evidence workflow.

Context Length	
29.9k
200.0k

Task Id	
36be93ce-46e0-4a5f-9f48-08f9752a740c
Tokens	
↑ 301.1k
↓ 4.1k
Cache	
↑ 24.6k
↓ 276.5k
API Cost	0.76
Size	2.18 MB