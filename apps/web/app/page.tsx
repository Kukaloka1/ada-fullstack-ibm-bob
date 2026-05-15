const workflowSteps = [
  "Mission Intake",
  "Planning Gate",
  "Spec Builder",
  "Bob Mission Generator",
  "QA Gate",
  "Delivery Report",
  "Release Gate",
];

const quickActions = [
  "Turn this into a Bob mission",
  "Generate Bob-ready prompt",
  "Review Bob output",
  "Find scope creep",
  "Prepare QA verdict",
  "Create commit message",
  "Prepare push handoff",
  "Generate delivery report",
];

const readinessItems = [
  ["Mission structured", true],
  ["Planning gate created", true],
  ["Bob prompt ready", true],
  ["QA review complete", false],
  ["Evidence exported", false],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-950/95 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-blue-400">
              IBM Bob Workflow Companion
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
              ADA — AI Delivery Architect
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-neutral-400">
              Bob builds. Ada orchestrates and reviews. You lead.
            </p>
          </div>
          <div className="hidden border border-blue-500 bg-blue-500/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-blue-300 md:block">
            Two AIs are better than one
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-6 lg:grid-cols-[260px_1fr_360px]">
        <aside className="border border-neutral-800 bg-neutral-900 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
            Workflow
          </p>
          <div className="mt-4 space-y-2">
            {workflowSteps.map((step, index) => (
              <div
                key={step}
                className="border border-neutral-800 bg-neutral-950 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center border border-blue-500 bg-blue-500/10 font-mono text-xs text-blue-300">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold">{step}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 border border-neutral-800 bg-black p-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
              Doctrine
            </p>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              No blind coding. No scope creep. No release without QA, evidence,
              and human approval.
            </p>
          </div>
        </aside>

        <section className="flex min-h-[720px] flex-col border border-neutral-800 bg-neutral-900">
          <div className="border-b border-neutral-800 bg-black px-5 py-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
              ADA Chat
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              Talk to your AI Delivery Architect
            </h2>
          </div>

          <div className="flex-1 space-y-4 p-5">
            <div className="max-w-[82%] border border-neutral-700 bg-neutral-950 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
                ADA
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                Give me product intent, Bob output, diffs, or implementation
                notes. I will structure the mission, generate Bob prompts,
                review delivery quality, and prepare release evidence.
              </p>
            </div>

            <div className="ml-auto max-w-[82%] border border-blue-500 bg-blue-600 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-100">
                Human Lead
              </p>
              <p className="mt-2 text-sm leading-6">
                Build the QA Gate so I can paste Bob output and get PASS,
                CONDITIONAL PASS, or FAIL.
              </p>
            </div>

            <div className="max-w-[82%] border border-neutral-700 bg-neutral-950 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
                ADA
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-300">
                Mission detected. I will define scope, non-goals, acceptance
                criteria, a Bob-ready prompt, QA checklist, correction loop, and
                release gate.
              </p>
            </div>
          </div>

          <div className="border-t border-neutral-800 bg-neutral-950 p-5">
            <div className="mb-4 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  className="border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-300 hover:border-blue-500 hover:text-blue-300"
                >
                  {action}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <textarea
                className="min-h-24 flex-1 resize-none border border-neutral-700 bg-black p-4 text-sm text-neutral-100 outline-none focus:border-blue-500"
                placeholder="Ask ADA to structure a mission, generate a Bob prompt, review Bob output, prepare correction prompts, or export delivery evidence..."
              />
              <button className="border border-blue-500 bg-blue-600 px-5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-blue-500">
                Send
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="border border-neutral-800 bg-neutral-900 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
              Current Mission
            </p>
            <h3 className="mt-3 text-lg font-bold">QA Gate</h3>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Review Bob implementation output against mission scope,
              acceptance criteria, risks, and release readiness.
            </p>
          </div>

          <div className="border border-neutral-800 bg-neutral-900 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
              Bob Prompt Preview
            </p>
            <pre className="mt-3 overflow-auto border border-neutral-800 bg-black p-4 text-xs leading-6 text-blue-200">
{`Inspect repository context.

Mission:
Implement ADA QA Gate.

Constraints:
- Next.js App Router
- TypeScript
- Tailwind
- No unrelated changes
- Provide changed files
- Provide validation evidence`}
            </pre>
          </div>

          <div className="border border-neutral-800 bg-neutral-900 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
              Readiness Checklist
            </p>
            <div className="mt-3 space-y-2">
              {readinessItems.map(([label, ok]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between border border-neutral-800 bg-black p-3 text-sm"
                >
                  <span>{label}</span>
                  <span className={ok ? "text-blue-300" : "text-yellow-300"}>
                    {ok ? "PASS" : "PENDING"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-neutral-800 bg-neutral-900 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
              Release Gate
            </p>
            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Commit and push only after QA acceptance, evidence export, and
              human approval.
            </p>
            <button className="mt-4 w-full border border-blue-500 bg-blue-600 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-blue-500">
              Export Markdown
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
