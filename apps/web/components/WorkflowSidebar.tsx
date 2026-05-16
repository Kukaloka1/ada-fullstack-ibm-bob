const workflowSteps = [
  "Mission Intake",
  "Planning Gate",
  "Spec Builder",
  "Bob Mission Generator",
  "QA Gate",
  "Delivery Report",
  "Release Gate",
];

export function WorkflowSidebar() {
  return (
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
          No blind coding. No scope creep. No release without QA, evidence, and
          human approval.
        </p>
      </div>
    </aside>
  );
}

// Made with Bob
