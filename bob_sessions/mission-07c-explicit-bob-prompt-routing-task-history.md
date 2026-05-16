Mission 07C — Explicit Bob Prompt Intent Routing

We are building ADA — AI Delivery Architect.

Goal:
Fix Bob prompt routing so explicit user requests for a Bob prompt always route the full prompt to the Bob Prompt Preview panel and never dump the full prompt into the normal chat.

Current bug:
When the user says:
"give me bob prpmnt"
ADA generates a Bob prompt, but the full prompt appears inside the chat stream instead of only in Bob Prompt Preview.

Why:
The current Bob prompt detector is too strict and only detects prompts with markers like:
- Mission Title
- Context
- Required Bob output
- Evidence requirement
- Confirm alignment

But ADA sometimes generates Bob prompts with equivalent structure:
- Mission
- Objective
- Scope
- Deliverables
- Validation required
- Output format

Correct behavior:
If the user explicitly asks for a Bob prompt, the response must be routed to Bob Prompt Preview regardless of exact marker wording.

Allowed files:
- apps/web/components/ChatPanel.tsx
- apps/web/lib/ada/prompts.ts only if needed to standardize Bob Prompt Mode wording

Do not modify:
- API routes
- Supabase schema
- DB migrations
- package.json
- docs
- bob_sessions
- env files
- layout design
- project/workspace persistence logic

Required fix 1 — explicit intent detection:
Add a function in ChatPanel.tsx like:

isBobPromptRequest(input: string): boolean

It should detect user requests such as:
- "give me bob prompt"
- "give me bob prpmnt"
- "dame el prompt para Bob"
- "dame el pormnt para Bob"
- "generate Bob-ready prompt"
- "turn this into a Bob mission"
- "convert this into a Bob mission"
- "prompt for IBM Bob"
- "Bob mission prompt"

Be tolerant of common typos:
- prompt / promnt / pormnt / prpmnt
- bob / Bob / IBM Bob

Required fix 2 — route response by user intent:
In sendMessage():
- before clearing input, compute:
  const shouldRouteToBobPreview = isBobPromptRequest(trimmedMessage)
- after receiving ADA response:
  - if shouldRouteToBobPreview is true:
    - strip assistant preamble
    - send full cleaned response to onBobPromptDetected()
    - display only short confirmation in chat:
      "✓ Bob-ready mission prompt prepared. Review it in the **Bob Prompt Preview** panel on the right."
  - else:
    - use strict detectBobPrompt() as fallback only for obvious Bob prompts
    - normal intake/planning responses stay in chat

Required fix 3 — persisted history behavior:
When loading persisted messages:
- still prevent full Bob prompts from displaying in chat
- detect persisted Bob prompts using BOTH:
  1. strict markers, OR
  2. prompt-like structure with multiple sections such as Mission/Objectives/Scope/Validation/Output
- route detected prompt to Bob Prompt Preview
- show only short confirmation in chat
- do not duplicate confirmations unnecessarily

Required fix 4 — standardize Bob Prompt Mode prompt output if needed:
If editing prompts.ts, make Bob Prompt Mode always use this exact structure:
- Mission Title:
- Context:
- Goal:
- Scope:
- Non-goals:
- Constraints:
- Required work:
- Acceptance criteria:
- Validation:
- Required Bob output:
- Evidence requirement:
- Alignment confirmation:

But do not rely only on LLM compliance. The frontend must still route by explicit user intent.

Required fix 5 — broad ideas still remain intake:
If the user says:
"I want to build..."
"quiero hacer..."
"make an app like..."
without explicitly asking for Bob prompt,
then ADA should respond in chat with intake/planning.
Bob Prompt Preview must NOT update.

Validation required:
- pnpm typecheck
- pnpm lint
- pnpm build

Manual tests:
Test 1:
Fresh project.
User: "quiero hacer una ia como claude o openai"
Expected:
- Intake response appears in chat.
- Bob Prompt Preview does NOT update.
- No "Bob-ready mission prompt prepared" confirmation.

Test 2:
Then user: "give me bob prpmnt"
Expected:
- Chat shows only:
  "✓ Bob-ready mission prompt prepared. Review it in the Bob Prompt Preview panel on the right."
- Bob Prompt Preview shows full prompt.
- Full prompt does NOT appear in chat.

Test 3:
Refresh browser.
Expected:
- Full Bob prompt still does NOT appear in chat.
- Bob Prompt Preview still shows prompt.

Test 4:
Switch projects and return.
Expected:
- Same clean behavior.
- No full prompt dumped into chat.

Test 5:
Click quick action "Generate Bob-ready prompt".
Expected:
- Full response routes to Bob Prompt Preview.
- Chat only shows short confirmation.

Before changing files:
List exact files you will modify.

After implementation:
Provide:
- changed files
- exact routing logic implemented
- manual test results expected
- validation commands and results
- known risks
- suggested commit message

Suggested commit message:
fix: route explicit Bob prompt requests to preview panel

Confirm alignment with AGENTS.md, ADA_SPEC.md, and IBM Bob Hackathon evidence workflow.

Context Length	
27.2k
200.0k

Task Id	
46931d11-50e7-4693-a8de-48c9790b9d1c
Tokens	
↑ 252.4k
↓ 3.8k
Cache	
↑ 13.2k
↓ 239.1k
API Cost	0.64
Size	2.15 MB