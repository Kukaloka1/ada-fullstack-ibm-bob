"use client";

import { useState } from "react";

type DeliveryStatus = "PENDING" | "PASS" | "CONDITIONAL_PASS" | "FAIL";

interface ContextPanelProps {
  currentMission: {
    title: string;
    description: string;
  };
  hasActiveMission: boolean;
  closedMissionCount: number;
  bobPrompt: string;
  readinessItems: Array<[string, boolean]>;
  qaStatus: DeliveryStatus;
  releaseGateStatus: DeliveryStatus;
  hasReleaseGateArtifact: boolean;
  onSaveQaReport: () => void;
  onSaveReleaseGate: () => void;
  isSavingQaReport: boolean;
  isSavingReleaseGate: boolean;
  hasQaReportArtifact: boolean;
  canManuallyRecordQaReport: boolean;
  qaReportFeedback: string | null;
  releaseGateFeedback: string | null;
  isCloseMissionConfirmOpen: boolean;
  onOpenCloseMissionModal: () => void;
  onDismissCloseMissionModal: () => void;
  onCloseMission: () => void;
  isClosingMission: boolean;
  onOpenNewMissionModal: () => void;
  onExportMarkdown: () => void;
}

export function ContextPanel({
  currentMission,
  hasActiveMission,
  closedMissionCount,
  bobPrompt,
  readinessItems,
  qaStatus,
  releaseGateStatus,
  hasReleaseGateArtifact,
  onSaveQaReport,
  onSaveReleaseGate,
  isSavingQaReport,
  isSavingReleaseGate,
  hasQaReportArtifact,
  canManuallyRecordQaReport,
  qaReportFeedback,
  releaseGateFeedback,
  isCloseMissionConfirmOpen,
  onOpenCloseMissionModal,
  onDismissCloseMissionModal,
  onCloseMission,
  isClosingMission,
  onOpenNewMissionModal,
  onExportMarkdown,
}: ContextPanelProps) {
  const [copied, setCopied] = useState(false);
  const readinessOrder = [
    "Mission structured",
    "Bob prompt ready",
    "QA review complete",
    "Evidence exported",
    "Release gate recorded",
  ];

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

  const orderedReadinessItems = [...readinessItems].sort(([left], [right]) => {
    const leftIndex = readinessOrder.indexOf(left);
    const rightIndex = readinessOrder.indexOf(right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
  const qaReportStatusLabel = isSavingQaReport
    ? "ADA verdict detected — recording..."
    : qaReportFeedback === "Recording failed"
      ? canManuallyRecordQaReport
        ? "Recording failed — manual record available"
        : "Recording failed"
      : canManuallyRecordQaReport
        ? "Automatic QA recording missed"
      : hasQaReportArtifact
        ? "QA Report recorded"
        : "Waiting for ADA verdict";
  const releaseActionLabel =
    releaseGateStatus === "PASS"
      ? "Approve Commit / Push"
      : releaseGateStatus === "CONDITIONAL_PASS"
        ? "Approve With Conditions"
        : releaseGateStatus === "FAIL"
          ? "Record Blocked Release"
          : "Release Not Ready";
  const releaseGateLabel = hasReleaseGateArtifact
    ? "Recorded Release Gate"
    : "Recommended Release Gate";
  const showRecordedReleaseDecision =
    hasReleaseGateArtifact && releaseGateStatus !== "PENDING";
  const closeMissionResultLabel =
    releaseGateStatus === "PASS"
      ? "approved"
      : releaseGateStatus === "CONDITIONAL_PASS"
        ? "approved with conditions"
        : releaseGateStatus === "FAIL"
          ? "blocked"
          : "closed";
  const isStrongCloseMissionState =
    qaStatus === "PASS" &&
    readinessItems.some(
      ([label, ok]) =>
        label === "Evidence exported" && ok
    ) &&
    readinessItems.some(
      ([label, ok]) =>
        label === "Release gate recorded" && ok
    ) &&
    releaseGateStatus === "PASS";

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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
              Current Mission
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="border border-neutral-800 bg-black px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                Current mission: {hasActiveMission ? "active" : "none"}
              </span>
              <span className="border border-neutral-800 bg-black px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                Closed missions: {closedMissionCount}
              </span>
            </div>
          </div>
          {hasActiveMission ? (
            <button
              type="button"
              onClick={onOpenCloseMissionModal}
              disabled={isClosingMission}
              className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors disabled:opacity-50 ${
                isStrongCloseMissionState
                  ? "border-green-500 bg-green-500/10 text-green-300 hover:bg-green-500/20"
                  : "border-neutral-700 bg-neutral-800 text-neutral-200 hover:border-blue-500 hover:text-blue-300"
              }`}
            >
              {isClosingMission ? "Closing..." : "Close Mission"}
            </button>
          ) : null}
        </div>
        <h3 className="mt-3 text-lg font-bold">{currentMission.title}</h3>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          {currentMission.description}
        </p>
        {hasActiveMission ? (
          <p className="mt-3 text-xs leading-5 text-neutral-500">
            Closing a mission preserves project history, artifacts, and memory,
            then prepares this project for the next delivery cycle.
          </p>
        ) : (
          <button
            type="button"
            onClick={onOpenNewMissionModal}
            className="mt-4 border border-blue-500 bg-blue-600 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-blue-500"
          >
            Open New Mission
          </button>
        )}
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
          {orderedReadinessItems.map(([label, ok]) => (
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
          ADA&apos;s review of builder output against mission scope, repository
          changes, validation logs, and known risks.
        </p>
        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Paste Bob output, git status, diff, and validation results. ADA
          will produce a QA verdict.
        </p>
        <div className="mt-4 border border-neutral-800 bg-black p-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            ADA QA Verdict
          </p>
          <p className={`mt-2 font-mono text-sm font-bold ${getStatusColor(qaStatus)}`}>
            {qaStatus.replace("_", " ")}
          </p>
        </div>
        <p className="mt-4 font-mono text-xs text-neutral-500">{qaReportStatusLabel}</p>
        {canManuallyRecordQaReport ? (
          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Automatic QA recording did not complete. Use manual record only as a
            fallback.
          </p>
        ) : null}
        {canManuallyRecordQaReport ? (
          <button
            onClick={onSaveQaReport}
            disabled={isSavingQaReport}
            className="mt-3 w-full border border-neutral-700 bg-neutral-800 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-200 transition-colors hover:border-blue-500 hover:bg-neutral-700 hover:text-blue-300 disabled:opacity-50"
          >
            Record QA Report Manually
          </button>
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
          Final delivery decision derived from QA, evidence export, and human
          approval.
        </p>
        <p className="mt-2 text-xs leading-5 text-neutral-500">
          Release should not pass until QA and evidence are complete. Human
          approval is required before commit/push.
        </p>
        <div className="mt-4 border border-neutral-800 bg-black p-3">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            {releaseGateLabel}
          </p>
          <p
            className={`mt-2 font-mono text-sm font-bold ${getStatusColor(
              releaseGateStatus
            )}`}
          >
            {releaseGateStatus.replace("_", " ")}
          </p>
        </div>
        {!showRecordedReleaseDecision ? (
          <button
            onClick={onSaveReleaseGate}
            disabled={isSavingReleaseGate || releaseGateStatus === "PENDING"}
            className="mt-4 w-full border border-neutral-700 bg-neutral-800 px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-200 transition-colors hover:border-blue-500 hover:bg-neutral-700 hover:text-blue-300 disabled:opacity-50"
          >
            {isSavingReleaseGate ? "Recording Release Decision..." : releaseActionLabel}
          </button>
        ) : null}
        {showRecordedReleaseDecision ? (
          <p className="mt-4 font-mono text-xs text-neutral-500">
            Release decision recorded
          </p>
        ) : null}
        {releaseGateFeedback && !showRecordedReleaseDecision ? (
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

      {isCloseMissionConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md border border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
              ADA wants to close this mission
            </p>
            <p className="mt-4 text-sm leading-6 text-neutral-300">
              This mission is{" "}
              <span className="font-semibold text-white">{closeMissionResultLabel}</span>.
              Closing it will preserve the project history, artifacts, and memory,
              then prepare this project for the next mission.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isClosingMission) {
                    return;
                  }

                  onDismissCloseMissionModal();
                }}
                className="flex-1 border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-300 transition-colors hover:bg-neutral-800"
              >
                No, keep working
              </button>
              <button
                type="button"
                onClick={() => {
                  void onCloseMission();
                }}
                disabled={isClosingMission}
                className="flex-1 border border-blue-500 bg-blue-600 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
              >
                {isClosingMission ? "Closing..." : "Yes, close mission"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
