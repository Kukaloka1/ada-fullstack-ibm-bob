"use client";

import { useState } from "react";

type DeliveryStatus = "PENDING" | "PASS" | "CONDITIONAL_PASS" | "FAIL";

interface ContextPanelProps {
  currentMission: {
    title: string;
    description: string;
  };
  bobPrompt: string;
  readinessItems: Array<[string, boolean]>;
  qaStatus: DeliveryStatus;
  qaDraftStatus: DeliveryStatus;
  releaseGateDraftStatus: DeliveryStatus;
  releaseGateStatus: DeliveryStatus;
  onQaStatusChange: (status: DeliveryStatus) => void;
  onReleaseGateStatusChange: (status: DeliveryStatus) => void;
  onSaveQaReport: () => void;
  onSaveReleaseGate: () => void;
  isSavingQaReport: boolean;
  isSavingReleaseGate: boolean;
  qaReportFeedback: string | null;
  releaseGateFeedback: string | null;
  onExportMarkdown: () => void;
}

export function ContextPanel({
  currentMission,
  bobPrompt,
  readinessItems,
  qaStatus,
  qaDraftStatus,
  releaseGateDraftStatus,
  releaseGateStatus,
  onQaStatusChange,
  onReleaseGateStatusChange,
  onSaveQaReport,
  onSaveReleaseGate,
  isSavingQaReport,
  isSavingReleaseGate,
  qaReportFeedback,
  releaseGateFeedback,
  onExportMarkdown,
}: ContextPanelProps) {
  const [copied, setCopied] = useState(false);

  // Check if Bob prompt exists and is not empty
  const hasRealBobPrompt = bobPrompt.trim().length > 0;

  // Determine status color
  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case "PASS":
        return "text-green-400";
      case "CONDITIONAL_PASS":
        return "text-yellow-400";
      case "FAIL":
        return "text-red-400";
      default:
        return "text-neutral-400";
    }
  };

  const statusOptions: DeliveryStatus[] = [
    "PENDING",
    "PASS",
    "CONDITIONAL_PASS",
    "FAIL",
  ];

  const handleCopyPrompt = async () => {
    if (!hasRealBobPrompt) {
      return;
    }

    try {
      await navigator.clipboard.writeText(bobPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <aside className="flex h-[calc(100vh-200px)] max-h-[800px] min-h-[600px] flex-col space-y-4 overflow-y-auto">
      {/* Current Mission */}
      <div className="flex-shrink-0 border border-neutral-800 bg-neutral-900 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
          Current Mission
        </p>
        <h3 className="mt-3 text-lg font-bold">{currentMission.title}</h3>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          {currentMission.description}
        </p>
      </div>

      {/* Bob Prompt Preview */}
      <div className="flex flex-shrink-0 flex-col border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
            Bob Prompt Preview
          </p>
          <button
            onClick={handleCopyPrompt}
            disabled={!hasRealBobPrompt}
            className="border border-neutral-700 bg-neutral-800 px-3 py-1 font-mono text-xs text-neutral-300 transition-colors hover:border-blue-500 hover:bg-neutral-700 hover:text-blue-300 disabled:opacity-50 disabled:hover:border-neutral-700 disabled:hover:bg-neutral-800 disabled:hover:text-neutral-300"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {hasRealBobPrompt ? (
          <pre className="mt-3 max-h-64 overflow-auto border border-neutral-800 bg-black p-4 font-mono text-xs leading-relaxed text-blue-200">
            {bobPrompt}
          </pre>
        ) : (
          <div className="mt-3 flex items-center justify-center border border-neutral-800 bg-black p-8 text-center">
            <p className="text-sm text-neutral-500">
              No Bob prompt generated for this project yet.
            </p>
          </div>
        )}
      </div>

      {/* Readiness Checklist */}
      <div className="flex-shrink-0 border border-neutral-800 bg-neutral-900 p-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
          Readiness Checklist
        </p>
        <div className="mt-3 space-y-2">
          {readinessItems.map(([label, ok]) => (
            <div
              key={String(label)}
              className="flex items-center justify-between border border-neutral-800 bg-black p-3 text-sm"
            >
              <span className="text-neutral-300">{label}</span>
              <span
                className={`font-mono text-xs font-bold ${
                  ok ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {ok ? "PASS" : "PENDING"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* QA Report */}
      <div className="flex-shrink-0 border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
            QA Report
          </p>
          <span className={`font-mono text-xs font-bold ${getStatusColor(qaStatus)}`}>
            {qaStatus.replace("_", " ")}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          Persist the current ADA QA verdict as durable project state.
        </p>
        <label className="mt-4 block">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            Verdict To Save
          </span>
          <select
            value={qaDraftStatus}
            onChange={(event) => onQaStatusChange(event.target.value as DeliveryStatus)}
            className="mt-2 w-full border border-neutral-700 bg-black px-3 py-3 font-mono text-xs text-neutral-200 outline-none transition-colors focus:border-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={onSaveQaReport}
          disabled={isSavingQaReport}
          className="mt-4 w-full border border-neutral-700 bg-neutral-800 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-200 transition-colors hover:border-blue-500 hover:bg-neutral-700 hover:text-blue-300 disabled:opacity-50"
        >
          {isSavingQaReport ? "Saving QA Report..." : "Save QA Report"}
        </button>
        {qaReportFeedback ? (
          <p className="mt-2 font-mono text-xs text-neutral-500">{qaReportFeedback}</p>
        ) : null}
      </div>

      {/* Release Gate */}
      <div className="flex-shrink-0 border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
            Release Gate
          </p>
          <span
            className={`font-mono text-xs font-bold ${getStatusColor(
              releaseGateStatus
            )}`}
          >
            {releaseGateStatus.replace("_", " ")}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          Commit and push only after QA acceptance, evidence export, and human
          approval.
        </p>
        <label className="mt-4 block">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            Decision To Save
          </span>
          <select
            value={releaseGateDraftStatus}
            onChange={(event) =>
              onReleaseGateStatusChange(event.target.value as DeliveryStatus)
            }
            className="mt-2 w-full border border-neutral-700 bg-black px-3 py-3 font-mono text-xs text-neutral-200 outline-none transition-colors focus:border-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={onSaveReleaseGate}
          disabled={isSavingReleaseGate}
          className="mt-4 w-full border border-neutral-700 bg-neutral-800 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-200 transition-colors hover:border-blue-500 hover:bg-neutral-700 hover:text-blue-300 disabled:opacity-50"
        >
          {isSavingReleaseGate ? "Saving Release Gate..." : "Save Release Gate"}
        </button>
        {releaseGateFeedback ? (
          <p className="mt-2 font-mono text-xs text-neutral-500">
            {releaseGateFeedback}
          </p>
        ) : null}
        <button
          onClick={onExportMarkdown}
          className="mt-4 w-full border border-blue-500 bg-blue-600 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-blue-500"
        >
          Export Markdown
        </button>
      </div>
    </aside>
  );
}
