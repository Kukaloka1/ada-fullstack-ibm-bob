"use client";

interface ContextPanelProps {
  currentMission: {
    title: string;
    description: string;
  };
  bobPrompt: string;
  readinessItems: Array<[string, boolean]>;
  onExportMarkdown: () => void;
}

export function ContextPanel({
  currentMission,
  bobPrompt,
  readinessItems,
  onExportMarkdown,
}: ContextPanelProps) {
  return (
    <aside className="space-y-4">
      {/* Current Mission */}
      <div className="border border-neutral-800 bg-neutral-900 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
          Current Mission
        </p>
        <h3 className="mt-3 text-lg font-bold">{currentMission.title}</h3>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          {currentMission.description}
        </p>
      </div>

      {/* Bob Prompt Preview */}
      <div className="border border-neutral-800 bg-neutral-900 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
          Bob Prompt Preview
        </p>
        <pre className="mt-3 max-h-96 overflow-auto border border-neutral-800 bg-black p-4 text-xs leading-6 text-blue-200">
          {bobPrompt}
        </pre>
      </div>

      {/* Readiness Checklist */}
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

      {/* Release Gate */}
      <div className="border border-neutral-800 bg-neutral-900 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
          Release Gate
        </p>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          Commit and push only after QA acceptance, evidence export, and human
          approval.
        </p>
        <button
          onClick={onExportMarkdown}
          className="mt-4 w-full border border-blue-500 bg-blue-600 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-blue-500"
        >
          Export Markdown
        </button>
      </div>
    </aside>
  );
}

// Made with Bob
