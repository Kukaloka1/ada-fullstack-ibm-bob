Mission 05 — Wire ADA Chat UI to API and Structured Panels

We are building ADA for the IBM Bob Hackathon.

Goal:
Wire the current ADA cockpit UI to the ADA chat API created in Mission 04, while preserving the existing visual layout and IBM-modern control-room design.

Current UI:
The home page already has:
- Header
- Left workflow sidebar
- Central ADA Chat panel
- Quick action chips
- Textarea + Send button
- Right context panel
- Current Mission card
- Bob Prompt Preview card
- Readiness Checklist
- Release Gate
- Export Markdown button

Critical UX rule:
Do not redesign the page.
Do not replace the visual system.
Do not move the main layout.
Do not make it look like a generic SaaS chatbot.
Only wire the existing cockpit behavior.

Required behavior:

1. Chat conversation panel
- The central ADA Chat area must become a real internal scrollable conversation area.
- The scroll must be inside the chat message area, not the whole page.
- The chat input and quick action chips should stay visible at the bottom of the chat panel.
- When messages grow, only the conversation area scrolls.
- Keep the current premium IBM/control-room aesthetic.

2. Send message to API
- Wire the textarea + Send button to POST /api/ada/chat.
- Send:
  {
    "workspaceId": string,
    "message": string
  }
- Use a stable MVP workspaceId for now.
- Do not add auth.
- Do not add workspace switcher.
- Do not add complex state management.

3. Chat state
- Display user messages in the central chat.
- Display ADA responses in the central chat.
- Show loading state while waiting.
- Show error state if API fails.
- Prevent empty messages.
- Clear textarea after successful send.

4. Bob Prompt Preview special behavior
- If ADA generates or returns content that is clearly a Bob mission prompt, display that content in the right-side "Bob Prompt Preview" panel.
- Do not dump long Bob prompts into the chat stream as normal conversation.
- The chat can show a short ADA confirmation like:
  "I prepared a Bob-ready mission prompt. Review it in the Bob Prompt Preview panel."
- The full prompt belongs in the Bob Prompt Preview section.

5. Panel state
Update the right panel with structured state when possible:
- Current Mission title/summary
- Bob Prompt Preview
- Readiness Checklist statuses
- Release Gate status

For this mission, simple client-side state is enough.
Do not persist panel state separately yet unless already supported by the API.
Do not add new database tables.

6. Quick action chips
Wire quick action chips to populate or submit useful prompts:
- Turn this into a Bob mission
- Generate Bob-ready prompt
- Review Bob output
- Find scope creep
- Prepare QA verdict
- Create commit message
- Prepare push handoff
- Generate delivery report

Behavior:
- Clicking a chip should either populate the textarea with a structured instruction or submit a message using the current textarea context.
- Keep it simple and predictable.

7. Export Markdown button
For now, implement a local client-side markdown export/download of the current visible delivery state:
- chat summary
- current mission
- Bob prompt preview
- readiness checklist
- release gate status

No server persistence required for export in this mission.

Technical constraints:
- Preserve current UI.
- No auth.
- No billing.
- No GitHub OAuth.
- No pgvector.
- No vector DB.
- No Supabase client-side access.
- No service role in client.
- No OpenAI key in client.
- No new external UI library.
- No unrelated changes.
- Keep files modular.
- Avoid files over 500 lines.
- TypeScript strict.

Implementation guidance:
- If needed, split the home page into components under apps/web/components/
- Recommended components:
  - AdaCockpit.tsx
  - ChatPanel.tsx
  - ContextPanel.tsx
  - WorkflowSidebar.tsx
- If splitting would take too long, keep changes minimal but avoid a giant unreadable file.
- Use client component only for UI state.
- API call must be from client to /api/ada/chat only.
- Supabase remains server-side behind API route.

Before changing files:
List exact files you will create or modify.

After implementation:
Provide:
- changed files
- behavior implemented
- validation commands
- known risks
- suggested commit message

Validation required:
- pnpm typecheck
- pnpm lint
- pnpm build

Also run:
- grep -R "SUPABASE_SERVICE_ROLE_KEY" apps/web/app apps/web/components --exclude-dir=node_modules --exclude-dir=.next || true
- grep -R "OPENAI_API_KEY" apps/web/app apps/web/components --exclude-dir=node_modules --exclude-dir=.next || true
- grep -R "NEXT_PUBLIC_SUPABASE_ANON_KEY" apps/web --exclude-dir=node_modules --exclude-dir=.next || true

Expected:
- no service role in client UI
- no OpenAI key in client UI
- no anon key
- chat UI wired to /api/ada/chat
- internal chat scroll works
- Bob prompts render in Bob Prompt Preview, not as giant normal chat messages
- typecheck/lint/build pass

Suggested commit message:
feat: wire ADA cockpit chat to API

Confirm alignment with AGENTS.md, ADA_SPEC.md, and the IBM Bob Hackathon evidence workflow.

Context Length	
40.4k
200.0k

Task Id	
17cf7a16-e5cd-47a2-a5d4-5014f8da7160
Tokens	
↑ 678.2k
↓ 8.5k
Cache	
↑ 39.9k
↓ 638.3k
API Cost	1.72
Size	1.43 MB