Mission 07A — Fix ADA Intake vs Bob Prompt Mode

We are building ADA — AI Delivery Architect.

Goal:
Fix ADA behavior so broad product ideas do not automatically generate Bob-ready prompts.

Current bug:
In a fresh project, when the user says a broad idea like:
"I want to build an AI agent like Claude"
ADA immediately generated a Bob-ready prompt and routed it to Bob Prompt Preview.

That is wrong.

Correct behavior:
Broad ideas must trigger Mission Intake Mode, not Bob Prompt Mode.

Mission Intake Mode:
Trigger examples:
- "I want to build..."
- "I want to create..."
- "I want an app like..."
- broad product concepts

Expected behavior:
- explain the idea is too broad for one Bob mission
- decompose it into MVP slices
- recommend the first safe slice
- state that no implementation evidence exists yet in a fresh project
- ask for confirmation before generating a Bob prompt
- do not fill Bob Prompt Preview
- do not say "Bob-ready mission prompt prepared"

Bob Prompt Mode:
Only trigger when user explicitly asks:
- "give me the prompt for Bob"
- "generate Bob-ready prompt"
- "turn this into a Bob mission"
- quick action "Generate Bob-ready prompt"
- quick action "Turn this into a Bob mission"

Expected behavior:
- return a clean Bob-ready prompt
- no conversational preamble
- route full prompt to Bob Prompt Preview
- chat shows short confirmation only

Required changes:
1. Update apps/web/lib/ada/prompts.ts to make the distinction explicit:
   - broad ideas = intake only
   - Bob prompt generation = only explicit request
2. Update apps/web/components/ChatPanel.tsx if necessary:
   - Bob prompt detection must not route normal planning/intake responses into Bob Prompt Preview
   - Detection should require strong Bob-prompt markers such as:
     "Mission Title"
     "Context"
     "Goal"
     "Scope"
     "Non-goals"
     "Required work"
     "Acceptance criteria"
     "Validation"
     "Required Bob output"
     "Evidence requirement"
   - Do not route ordinary planning responses that only contain Objective/Scope.
3. Do not modify layout.
4. Do not modify DB.
5. Do not modify API routes unless absolutely necessary.
6. Do not modify docs, bob_sessions, env files, package.json.

Validation:
- pnpm typecheck
- pnpm lint
- pnpm build

Manual tests:
Test 1:
User: "quiero hacer una ia como claude o openai"
Expected:
ADA performs intake, narrows scope, recommends first MVP slice, says no evidence yet.
Bob Prompt Preview must NOT update.

Test 2:
User: "dame el prompt para Bob"
Expected:
ADA generates a clean Bob prompt.
Bob Prompt Preview updates.
Chat shows short confirmation.

Test 3:
User: "Generate a delivery report for the current mission state."
Expected:
If no Bob output or repo evidence exists, ADA says PLANNED / NOT EXECUTED and does not invent changed files.

Suggested commit message:
fix: separate ADA intake mode from Bob prompt mode

Confirm alignment with AGENTS.md, ADA_SPEC.md, and IBM Bob Hackathon evidence workflow.

Context Length	
29.7k
200.0k

Task Id	
2050c6a2-a058-44ee-8af8-964f9e3dd5e2
Tokens	
↑ 318.6k
↓ 3.7k
Cache	
↑ 29.0k
↓ 289.6k
API Cost	0.81
Size	2.15 MB