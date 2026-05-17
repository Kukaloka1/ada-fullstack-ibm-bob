"use client";

import { useEffect } from "react";

interface HowAdaWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const workflowSteps = [
  {
    title: "Create a Project",
    description:
      "Each project keeps its own chat, mission, Bob prompt, QA reports, delivery evidence, and release decisions.",
  },
  {
    title: "Describe the Mission",
    description:
      "Tell ADA what you want to build. ADA turns rough intent into a scoped delivery mission.",
  },
  {
    title: "Generate a Bob Prompt",
    description:
      "Ask for a Bob-ready prompt. The full build prompt goes only to Bob Prompt Preview, not the chat.",
  },
  {
    title: "Let Bob Work",
    description:
      "Paste the prompt into IBM Bob. Bob works inside the repository, makes scoped changes, and returns implementation output.",
  },
  {
    title: "Paste Builder Output Back Into ADA",
    description:
      "Give ADA the changed files, git diff/status, validation results, known risks, and task summary.",
  },
  {
    title: "ADA Produces QA Verdict",
    description:
      "ADA reviews builder output against mission scope, validation, evidence, and risk. It produces PASS, CONDITIONAL_PASS, FAIL, or PENDING.",
  },
  {
    title: "Export Delivery Evidence",
    description:
      "Export Markdown to preserve the delivery report and evidence trail. IBM Bob task session reports belong in bob_sessions.",
  },
  {
    title: "Approve Release Gate",
    description:
      "After QA and evidence, the human lead makes the final commit/push decision: approve, approve with conditions, or block.",
  },
];

export function HowAdaWorksModal({
  isOpen,
  onClose,
}: HowAdaWorksModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-ada-works-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-neutral-700 bg-neutral-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-neutral-800 px-6 py-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
              ADA Onboarding
            </p>
            <h2
              id="how-ada-works-title"
              className="mt-2 text-2xl font-black tracking-tight text-neutral-100"
            >
              How ADA Works
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
              ADA is the delivery cockpit for IBM Bob-led software delivery
              workflows. Human leads. Bob builds. ADA reviews and controls
              release readiness.
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
              Two AIs are better than one. Bob builds. ADA reviews. You lead.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:border-blue-500 hover:text-blue-300"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {workflowSteps.map((step, index) => (
            <div
              key={step.title}
              className="border border-neutral-800 bg-black/70 p-4"
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-bold text-neutral-100">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                {step.description}
              </p>
            </div>
          ))}

          <div className="border border-blue-500/40 bg-blue-500/10 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-300">
              Final Callout
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-200">
              QA is ADA&apos;s technical review. Release Gate is the human
              delivery decision.
            </p>
          </div>
        </div>

        <div className="border-t border-neutral-800 px-6 py-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            Bob builds. ADA reviews. You lead.
          </p>
        </div>
      </div>
    </div>
  );
}
