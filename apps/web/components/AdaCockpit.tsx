"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { ChatPanel } from "./ChatPanel";
import { ContextPanel } from "./ContextPanel";
import { WorkflowSidebar } from "./WorkflowSidebar";

interface ChatMessage {
  role: string;
  content: string;
  created_at?: string;
}

interface Workspace {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Mission {
  id: string;
  workspace_id: string;
  title: string;
  objective: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ArtifactMetadata {
  verdict?: "PENDING" | "PASS" | "CONDITIONAL_PASS" | "FAIL";
  status?: "PENDING" | "PASS" | "CONDITIONAL_PASS" | "FAIL";
  qaStatus?: "PENDING" | "PASS" | "CONDITIONAL_PASS" | "FAIL";
  releaseGateStatus?: "PENDING" | "PASS" | "CONDITIONAL_PASS" | "FAIL";
  signature?: string;
  workspaceId?: string;
  missionTitle?: string;
  timestamp?: string;
}

interface Artifact {
  id: string;
  workspace_id: string;
  type: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  metadata?: ArtifactMetadata;
}

interface DurableWorkspaceState {
  hasMessages: boolean;
  hasActiveMission: boolean;
  hasBobPrompt: boolean;
  hasQaReport: boolean;
  hasDeliveryReport: boolean;
  hasReleaseGate: boolean;
  qaStatus: "PENDING" | "PASS" | "CONDITIONAL_PASS" | "FAIL";
  releaseGateStatus: "PENDING" | "PASS" | "CONDITIONAL_PASS" | "FAIL";
}

type DeliveryStatus = "PENDING" | "PASS" | "CONDITIONAL_PASS" | "FAIL";

// MVP workspace ID - no auth for hackathon
const MVP_WORKSPACE_ID = "00000000-0000-4000-8000-000000000001";
const SELECTED_WORKSPACE_KEY = "ada_selected_workspace_id";
const FALLBACK_WORKSPACE_NAME = "ADA Hackathon MVP";

const defaultMission = {
  title: "ADA Hackathon MVP",
  description:
    "Chat-first delivery control cockpit connected to ADA memory, Bob prompt preview, readiness checklist, and release gate workflow.",
};

const FALLBACK_MISSION_TITLE = "Scoped ADA Mission";

const defaultDurableWorkspaceState: DurableWorkspaceState = {
  hasMessages: false,
  hasActiveMission: false,
  hasBobPrompt: false,
  hasQaReport: false,
  hasDeliveryReport: false,
  hasReleaseGate: false,
  qaStatus: "PENDING",
  releaseGateStatus: "PENDING",
};

const buildReadinessItems = (
  state: DurableWorkspaceState
): Array<[string, boolean]> => [
  ["Mission structured", state.hasActiveMission || state.hasMessages],
  ["Bob prompt ready", state.hasBobPrompt],
  ["QA review complete", state.hasQaReport],
  ["Release gate recorded", state.hasReleaseGate || state.releaseGateStatus !== "PENDING"],
  ["Evidence exported", state.hasDeliveryReport],
];

const formatDeliveryStatusLabel = (status: DeliveryStatus) =>
  status.replace("_", " ");

const parseDeliveryStatus = (value: string | undefined | null): DeliveryStatus | null => {
  if (
    value === "PENDING" ||
    value === "PASS" ||
    value === "CONDITIONAL_PASS" ||
    value === "FAIL"
  ) {
    return value;
  }

  if (!value) {
    return null;
  }

  const normalizedValue = value.toUpperCase();

  if (normalizedValue.includes("CONDITIONAL PASS")) {
    return "CONDITIONAL_PASS";
  }

  if (normalizedValue.includes("FAIL")) {
    return "FAIL";
  }

  if (normalizedValue.includes("PASS")) {
    return "PASS";
  }

  if (normalizedValue.includes("PENDING")) {
    return "PENDING";
  }

  return null;
};

const deriveArtifactStatusFromContent = (content: string): DeliveryStatus => {
  return parseDeliveryStatus(content) || "PENDING";
};

const deriveReleaseGateStatus = (
  artifacts: Artifact[]
): DeliveryStatus => {
  const releaseGateArtifact = artifacts.find((artifact) => artifact.type === "release_gate");

  if (!releaseGateArtifact) {
    return "PENDING";
  }

  const metadataVerdict =
    releaseGateArtifact.metadata?.releaseGateStatus ||
    releaseGateArtifact.metadata?.verdict ||
    releaseGateArtifact.metadata?.status;

  return parseDeliveryStatus(metadataVerdict) || deriveArtifactStatusFromContent(releaseGateArtifact.content);
};

const deriveQaStatus = (artifacts: Artifact[]): DeliveryStatus => {
  const qaArtifact = artifacts.find((artifact) => artifact.type === "qa_report");

  if (!qaArtifact) {
    return "PENDING";
  }

  return (
    parseDeliveryStatus(qaArtifact.metadata?.qaStatus || qaArtifact.metadata?.status) ||
    deriveArtifactStatusFromContent(qaArtifact.content)
  );
};

const headingLinePattern = /^[A-Za-z][A-Za-z0-9\s/_-]{1,40}:\s*/;

const extractPromptField = (prompt: string, labels: string[]): string | null => {
  const lines = prompt.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    for (const label of labels) {
      if (!line.toLowerCase().startsWith(`${label.toLowerCase()}:`)) {
        continue;
      }

      const inlineValue = line.slice(line.indexOf(":") + 1).trim();
      if (inlineValue) {
        return inlineValue;
      }

      const sectionLines: string[] = [];

      for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
        const nextLine = lines[nextIndex].trim();

        if (!nextLine) {
          if (sectionLines.length > 0) {
            break;
          }

          continue;
        }

        if (headingLinePattern.test(nextLine)) {
          break;
        }

        sectionLines.push(nextLine);
      }

      if (sectionLines.length > 0) {
        return sectionLines.join(" ").trim();
      }
    }
  }

  return null;
};

const deriveMissionFromPrompt = (
  prompt: string
): { title: string; objective: string | null } => {
  const title =
    extractPromptField(prompt, ["Mission Title"]) ||
    extractPromptField(prompt, ["Mission"]) ||
    FALLBACK_MISSION_TITLE;
  const objective =
    extractPromptField(prompt, ["Goal"]) ||
    extractPromptField(prompt, ["Objective"]);

  return {
    title,
    objective: objective || null,
  };
};

export function AdaCockpit() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState<string | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [currentMission, setCurrentMission] = useState(defaultMission);
  const [bobPrompt, setBobPrompt] = useState("");
  const [durableWorkspaceState, setDurableWorkspaceState] = useState(
    defaultDurableWorkspaceState
  );
  const [qaDraftStatus, setQaDraftStatus] = useState<DeliveryStatus>("PENDING");
  const [releaseGateDraftStatus, setReleaseGateDraftStatus] =
    useState<DeliveryStatus>("PENDING");
  const [isSavingQaReport, setIsSavingQaReport] = useState(false);
  const [isSavingReleaseGate, setIsSavingReleaseGate] = useState(false);
  const [qaReportFeedback, setQaReportFeedback] = useState<string | null>(null);
  const [releaseGateFeedback, setReleaseGateFeedback] = useState<string | null>(null);
  const [, setActiveMissionId] = useState<string | null>(null);

  const activeMissionIdRef = useRef<string | null>(null);
  const lastPersistedPromptRef = useRef("");
  const lastQaReportSignatureRef = useRef("");
  const lastReleaseGateSignatureRef = useRef("");
  const isWorkspaceHydratingRef = useRef(false);
  const pendingDetectedPromptRef = useRef("");
  const workspaceLoadSequenceRef = useRef(0);
  const isRecoveringWorkspaceRef = useRef(false);

  useEffect(() => {
    const createFallbackWorkspace = async (): Promise<Workspace> => {
      const response = await fetch("/api/ada/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: FALLBACK_WORKSPACE_NAME,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorData?.error || "Failed to create fallback workspace");
      }

      const data = (await response.json()) as { workspace: Workspace };
      return data.workspace;
    };

    const ensureWorkspaceAvailable = async (
      preferredWorkspaceId?: string | null
    ): Promise<{ workspaceList: Workspace[]; selectedId: string }> => {
      const response = await fetch("/api/ada/workspaces");

      if (!response.ok) {
        throw new Error("Failed to load workspaces");
      }

      const data = (await response.json()) as { workspaces?: Workspace[] };
      let workspaceList = data.workspaces || [];

      if (workspaceList.length === 0) {
        const fallbackWorkspace = await createFallbackWorkspace();
        workspaceList = [fallbackWorkspace];
      }

      const selectedWorkspace =
        (preferredWorkspaceId &&
          workspaceList.find((workspace) => workspace.id === preferredWorkspaceId)) ||
        workspaceList[0];

      if (!selectedWorkspace) {
        throw new Error("Failed to recover a valid workspace");
      }

      return {
        workspaceList,
        selectedId: selectedWorkspace.id,
      };
    };

    const recoverWorkspaceSelection = async (preferredWorkspaceId?: string | null) => {
      if (isRecoveringWorkspaceRef.current) {
        return;
      }

      try {
        isRecoveringWorkspaceRef.current = true;
        setIsLoadingWorkspaces(true);
        setSelectedWorkspaceId(null);

        const { workspaceList, selectedId } = await ensureWorkspaceAvailable(
          preferredWorkspaceId
        );

        setWorkspaces(workspaceList);
        setSelectedWorkspaceId(selectedId);
        localStorage.setItem(SELECTED_WORKSPACE_KEY, selectedId);
      } catch (err) {
        console.error("Error recovering workspaces:", err);
        setWorkspaces([]);
        setSelectedWorkspaceId(null);
        localStorage.removeItem(SELECTED_WORKSPACE_KEY);
      } finally {
        isRecoveringWorkspaceRef.current = false;
        setIsLoadingWorkspaces(false);
      }
    };

    const savedWorkspaceId = localStorage.getItem(SELECTED_WORKSPACE_KEY);
    void recoverWorkspaceSelection(savedWorkspaceId);
  }, []);

  const resetWorkspacePanels = () => {
    setBobPrompt("");
    setCurrentMission(defaultMission);
    setDurableWorkspaceState(defaultDurableWorkspaceState);
    setQaDraftStatus("PENDING");
    setReleaseGateDraftStatus("PENDING");
    setQaReportFeedback(null);
    setReleaseGateFeedback(null);
    setActiveMissionId(null);
    activeMissionIdRef.current = null;
    lastPersistedPromptRef.current = "";
    lastQaReportSignatureRef.current = "";
    lastReleaseGateSignatureRef.current = "";
    pendingDetectedPromptRef.current = "";
  };

  const buildChecklistMarkdown = useCallback(
    () =>
      buildReadinessItems(durableWorkspaceState)
        .map(([label, ok]) => `- [${ok ? "x" : " "}] ${label}`)
        .join("\n"),
    [durableWorkspaceState]
  );

  const buildKnownRisks = useCallback((status: DeliveryStatus): string[] => {
    switch (status) {
      case "PASS":
        return ["No blocking risks captured in durable QA state."];
      case "CONDITIONAL_PASS":
        return [
          "Non-blocking risks remain and require explicit human lead acceptance.",
        ];
      case "FAIL":
        return ["Blocking delivery issues remain. Do not proceed to commit or push."];
      case "PENDING":
      default:
        return [
          "QA verdict has not been finalized.",
          "Validation details are not yet persisted as structured mission state.",
        ];
    }
  }, []);

  const persistActiveMission = useCallback(async (prompt: string, workspaceId: string) => {
    const derivedMission = deriveMissionFromPrompt(prompt);
    const existingMissionId = activeMissionIdRef.current;
    const missionPayload = {
      title: derivedMission.title,
      objective: derivedMission.objective,
    };

    try {
      const response = await fetch("/api/ada/missions", {
        method: existingMissionId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          existingMissionId
            ? {
                missionId: existingMissionId,
                ...missionPayload,
              }
            : {
                workspaceId,
                ...missionPayload,
                status: "planning",
              }
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to persist active mission");
      }

      const data = (await response.json()) as { mission?: Mission };
      const persistedMission = data.mission;

      if (!persistedMission) {
        throw new Error("Mission response missing mission payload");
      }

      activeMissionIdRef.current = persistedMission.id;
      setActiveMissionId(persistedMission.id);
      setCurrentMission({
        title: persistedMission.title,
        description: persistedMission.objective || defaultMission.description,
      });
      setDurableWorkspaceState((prev) => ({
        ...prev,
        hasActiveMission: true,
      }));
    } catch (err) {
      console.warn("Failed to persist active mission:", err);
    }
  }, []);

  const persistBobPromptArtifact = useCallback(async (prompt: string, workspaceId: string) => {
    try {
      const response = await fetch("/api/ada/artifacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          artifactType: "bob_prompt",
          title: "Bob Prompt",
          content: prompt,
          metadata: {
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to persist Bob prompt artifact");
      }

      lastPersistedPromptRef.current = prompt;
      setDurableWorkspaceState((prev) => ({
        ...prev,
        hasBobPrompt: true,
      }));
      return true;
    } catch (err) {
      console.warn("Failed to persist Bob prompt artifact:", err);
      return false;
    }
  }, []);

  const persistPromptAndMission = useCallback(
    async (prompt: string, workspaceId: string) => {
      const didPersistPrompt = await persistBobPromptArtifact(prompt, workspaceId);

      if (!didPersistPrompt) {
        return;
      }

      await persistActiveMission(prompt, workspaceId);
    },
    [persistActiveMission, persistBobPromptArtifact]
  );

  const persistArtifactIfChanged = useCallback(
    async ({
      artifactType,
      title,
      content,
      metadata,
      signature,
      lastSignatureRef,
    }: {
      artifactType: "qa_report" | "release_gate";
      title: string;
      content: string;
      metadata: ArtifactMetadata;
      signature: string;
      lastSignatureRef: MutableRefObject<string>;
    }): Promise<"saved" | "unchanged" | "failed"> => {
      if (signature === lastSignatureRef.current) {
        return "unchanged";
      }

      try {
        const response = await fetch("/api/ada/artifacts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspaceId: selectedWorkspaceId,
            artifactType,
            title,
            content,
            metadata: {
              ...metadata,
              signature,
            },
            missionId: activeMissionIdRef.current,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to persist ${artifactType} artifact`);
        }

        lastSignatureRef.current = signature;
        return "saved";
      } catch (err) {
        console.warn(`Failed to persist ${artifactType} artifact:`, err);
        return "failed";
      }
    },
    [selectedWorkspaceId]
  );

  useEffect(() => {
    const loadWorkspaceState = async () => {
      if (!selectedWorkspaceId) {
        return;
      }

      const loadSequence = ++workspaceLoadSequenceRef.current;
      isWorkspaceHydratingRef.current = true;
      pendingDetectedPromptRef.current = "";

      try {
        const [artifactsResponse, missionResponse] = await Promise.all([
          fetch(`/api/ada/artifacts?workspaceId=${selectedWorkspaceId}&limit=20`),
          fetch(`/api/ada/missions?workspaceId=${selectedWorkspaceId}&activeOnly=true`),
        ]);

        if (workspaceLoadSequenceRef.current !== loadSequence) {
          return;
        }

        let artifacts: Artifact[] = [];
        if (artifactsResponse.ok) {
          const artifactsData = await artifactsResponse.json();
          artifacts = (artifactsData.artifacts as Artifact[]) || [];
        } else {
          console.warn("Failed to load artifacts for workspace:", selectedWorkspaceId);
        }

        const latestBobPromptArtifact = artifacts.find((artifact) => artifact.type === "bob_prompt");
        const latestQaReportArtifact = artifacts.find((artifact) => artifact.type === "qa_report");
        const latestReleaseGateArtifact = artifacts.find(
          (artifact) => artifact.type === "release_gate"
        );
        const loadedPrompt = latestBobPromptArtifact?.content?.trim() || "";
        const restoredQaStatus = deriveQaStatus(artifacts);
        const restoredReleaseGateStatus = deriveReleaseGateStatus(artifacts);

        setBobPrompt(loadedPrompt);
        setQaDraftStatus(restoredQaStatus);
        setReleaseGateDraftStatus(restoredReleaseGateStatus);
        lastPersistedPromptRef.current = loadedPrompt;
        lastQaReportSignatureRef.current =
          latestQaReportArtifact?.metadata?.signature || "";
        lastReleaseGateSignatureRef.current =
          latestReleaseGateArtifact?.metadata?.signature || "";
        setDurableWorkspaceState((prev) => ({
          ...prev,
          hasBobPrompt: Boolean(latestBobPromptArtifact),
          hasQaReport: Boolean(latestQaReportArtifact),
          hasDeliveryReport: artifacts.some(
            (artifact) => artifact.type === "delivery_report"
          ),
          hasReleaseGate: Boolean(latestReleaseGateArtifact),
          qaStatus: restoredQaStatus,
          releaseGateStatus: restoredReleaseGateStatus,
        }));

        if (missionResponse.ok) {
          const missionData = await missionResponse.json();

          if (missionData.missions && missionData.missions.length > 0) {
            const mission = missionData.missions[0] as Mission;

            activeMissionIdRef.current = mission.id;
            setActiveMissionId(mission.id);
            setCurrentMission({
              title: mission.title,
              description: mission.objective || defaultMission.description,
            });
            setDurableWorkspaceState((prev) => ({
              ...prev,
              hasActiveMission: true,
            }));
          } else {
            activeMissionIdRef.current = null;
            setActiveMissionId(null);
            setCurrentMission(defaultMission);
            setDurableWorkspaceState((prev) => ({
              ...prev,
              hasActiveMission: false,
            }));
          }
        } else {
          console.warn("Failed to load missions for workspace:", selectedWorkspaceId);
        }
      } catch (err) {
        console.error("Error loading workspace state:", err);
      } finally {
        if (workspaceLoadSequenceRef.current !== loadSequence) {
          return;
        }

        isWorkspaceHydratingRef.current = false;

        const pendingPrompt = pendingDetectedPromptRef.current.trim();
        pendingDetectedPromptRef.current = "";

        if (pendingPrompt && pendingPrompt !== lastPersistedPromptRef.current) {
          void persistPromptAndMission(pendingPrompt, selectedWorkspaceId);
        }
      }
    };

    loadWorkspaceState();
  }, [persistPromptAndMission, selectedWorkspaceId]);

  const handleWorkspaceSelect = (workspaceId: string) => {
    resetWorkspacePanels();
    setSelectedWorkspaceId(workspaceId);
    localStorage.setItem(SELECTED_WORKSPACE_KEY, workspaceId);
  };

  const handleWorkspaceCreated = (workspace: Workspace) => {
    setWorkspaces((prev) => [workspace, ...prev]);
    resetWorkspacePanels();
    setSelectedWorkspaceId(workspace.id);
    localStorage.setItem(SELECTED_WORKSPACE_KEY, workspace.id);
  };

  const handleWorkspaceDelete = useCallback(
    async (workspace: Workspace): Promise<string | null> => {
      if (workspace.id === MVP_WORKSPACE_ID) {
        return "Default workspace cannot be deleted.";
      }

      try {
        const response = await fetch("/api/ada/workspaces", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            workspaceId: workspace.id,
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(errorData?.error || "Failed to delete project");
        }

        const remainingWorkspaces = workspaces.filter(
          (existingWorkspace) => existingWorkspace.id !== workspace.id
        );

        setWorkspaces(remainingWorkspaces);

        if (selectedWorkspaceId !== workspace.id) {
          return null;
        }

        resetWorkspacePanels();

        if (remainingWorkspaces.length > 0) {
          setSelectedWorkspaceId(remainingWorkspaces[0].id);
          localStorage.setItem(SELECTED_WORKSPACE_KEY, remainingWorkspaces[0].id);
          return null;
        }

        setSelectedWorkspaceId(null);
        localStorage.removeItem(SELECTED_WORKSPACE_KEY);

        const fallbackResponse = await fetch("/api/ada/workspaces", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: FALLBACK_WORKSPACE_NAME,
          }),
        });

        if (!fallbackResponse.ok) {
          const errorData = (await fallbackResponse.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(
            errorData?.error || "Deleted project, but failed to create fallback workspace"
          );
        }

        const fallbackData = (await fallbackResponse.json()) as { workspace: Workspace };
        setWorkspaces([fallbackData.workspace]);
        setSelectedWorkspaceId(fallbackData.workspace.id);
        localStorage.setItem(SELECTED_WORKSPACE_KEY, fallbackData.workspace.id);

        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete project";
        console.warn("Failed to delete workspace:", err);
        return errorMessage;
      }
    },
    [selectedWorkspaceId, workspaces]
  );

  const handleMessagesLoaded = (count: number) => {
    setDurableWorkspaceState((prev) => ({
      ...prev,
      hasMessages: count > 0,
    }));
  };

  const handleBobPromptDetected = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    setBobPrompt(trimmedPrompt);

    if (!trimmedPrompt || !selectedWorkspaceId) {
      return;
    }

    if (isWorkspaceHydratingRef.current) {
      pendingDetectedPromptRef.current = trimmedPrompt;
      return;
    }

    if (trimmedPrompt === lastPersistedPromptRef.current) {
      setDurableWorkspaceState((prev) => ({
        ...prev,
        hasBobPrompt: true,
      }));
      return;
    }

    await persistPromptAndMission(trimmedPrompt, selectedWorkspaceId);
  };

  const readinessItems = buildReadinessItems(durableWorkspaceState);

  const handleSaveQaReport = useCallback(async () => {
    if (!selectedWorkspaceId) {
      return;
    }

    setIsSavingQaReport(true);
    setQaReportFeedback(null);

    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
    const knownRisks = buildKnownRisks(qaDraftStatus);
    const signature = [
      selectedWorkspaceId,
      currentMission.title,
      qaDraftStatus,
      durableWorkspaceState.hasBobPrompt ? "bob" : "no-bob",
      durableWorkspaceState.hasDeliveryReport ? "delivery" : "no-delivery",
      durableWorkspaceState.hasReleaseGate ? "release" : "no-release",
    ].join("|");
    const content = `# ADA QA Report

**Mission:** ${currentMission.title}
**Workspace ID:** ${selectedWorkspaceId}
**QA Status:** ${formatDeliveryStatusLabel(qaDraftStatus)}
**Generated:** ${formattedDate}
**Timestamp:** ${timestamp}

---

## Mission Summary

${currentMission.description}

---

## Validation Status

- Structured validation logs are not yet persisted in the MVP
- Release gate status at save time: ${formatDeliveryStatusLabel(
      durableWorkspaceState.releaseGateStatus
    )}

---

## Readiness Snapshot

${buildChecklistMarkdown()}

---

## Known Risks

${knownRisks.map((risk) => `- ${risk}`).join("\n")}

---

*Generated by ADA — AI Delivery Architect*
`;

    const result = await persistArtifactIfChanged({
      artifactType: "qa_report",
      title: "QA Report",
      content,
      metadata: {
        workspaceId: selectedWorkspaceId,
        missionTitle: currentMission.title,
        timestamp,
        qaStatus: qaDraftStatus,
      },
      signature,
      lastSignatureRef: lastQaReportSignatureRef,
    });

    if (result === "saved") {
      setDurableWorkspaceState((prev) => ({
        ...prev,
        hasQaReport: true,
        qaStatus: qaDraftStatus,
      }));
      setQaReportFeedback("Saved");
    } else if (result === "unchanged") {
      setQaReportFeedback("No changes");
    } else {
      setQaReportFeedback("Save failed");
    }

    setIsSavingQaReport(false);
  }, [
    buildChecklistMarkdown,
    buildKnownRisks,
    currentMission.description,
    currentMission.title,
    durableWorkspaceState.hasBobPrompt,
    durableWorkspaceState.hasDeliveryReport,
    durableWorkspaceState.hasReleaseGate,
    durableWorkspaceState.releaseGateStatus,
    persistArtifactIfChanged,
    qaDraftStatus,
    selectedWorkspaceId,
  ]);

  const handleSaveReleaseGate = useCallback(async () => {
    if (!selectedWorkspaceId) {
      return;
    }

    setIsSavingReleaseGate(true);
    setReleaseGateFeedback(null);

    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
    const signature = [
      selectedWorkspaceId,
      currentMission.title,
      releaseGateDraftStatus,
      durableWorkspaceState.hasQaReport ? "qa" : "no-qa",
      durableWorkspaceState.hasDeliveryReport ? "delivery" : "no-delivery",
    ].join("|");
    const content = `# ADA Release Gate Decision

**Mission:** ${currentMission.title}
**Workspace ID:** ${selectedWorkspaceId}
**Release Status:** ${formatDeliveryStatusLabel(releaseGateDraftStatus)}
**Generated:** ${formattedDate}
**Timestamp:** ${timestamp}

---

## Required Conditions

- QA acceptance recorded
- Evidence export complete
- Human lead approval

---

## Readiness Snapshot

${buildChecklistMarkdown()}

---

## Decision Notes

- Current QA status: ${formatDeliveryStatusLabel(durableWorkspaceState.qaStatus)}
- Current evidence exported state: ${
      durableWorkspaceState.hasDeliveryReport ? "PASS" : "PENDING"
    }
- Commit and push remain human-controlled actions

---

*Generated by ADA — AI Delivery Architect*
`;

    const result = await persistArtifactIfChanged({
      artifactType: "release_gate",
      title: "Release Gate Decision",
      content,
      metadata: {
        workspaceId: selectedWorkspaceId,
        missionTitle: currentMission.title,
        timestamp,
        releaseGateStatus: releaseGateDraftStatus,
      },
      signature,
      lastSignatureRef: lastReleaseGateSignatureRef,
    });

    if (result === "saved") {
      setDurableWorkspaceState((prev) => ({
        ...prev,
        hasReleaseGate: true,
        releaseGateStatus: releaseGateDraftStatus,
      }));
      setReleaseGateFeedback("Saved");
    } else if (result === "unchanged") {
      setReleaseGateFeedback("No changes");
    } else {
      setReleaseGateFeedback("Save failed");
    }

    setIsSavingReleaseGate(false);
  }, [
    buildChecklistMarkdown,
    currentMission.title,
    durableWorkspaceState.hasDeliveryReport,
    durableWorkspaceState.hasQaReport,
    durableWorkspaceState.qaStatus,
    persistArtifactIfChanged,
    releaseGateDraftStatus,
    selectedWorkspaceId,
  ]);

  const handleExportMarkdown = async () => {
    let chatHistory = "";

    try {
      const response = await fetch(
        `/api/ada/messages?workspaceId=${selectedWorkspaceId}&limit=20`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
          chatHistory = (data.messages as ChatMessage[])
            .map((msg) => {
              const role = msg.role === "user" ? "Human Lead" : "ADA";
              return `### ${role}\n\n${msg.content}\n`;
            })
            .join("\n---\n\n");
        }
      }
    } catch (err) {
      console.error("Failed to fetch chat history for export:", err);
    }

    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const markdown = `# ADA Delivery Report

**Project:** ${currentMission.title}
**Generated:** ${formattedDate}
**Workspace ID:** ${selectedWorkspaceId}
**Timestamp:** ${timestamp}

---

## Current Mission

**Title:** ${currentMission.title}

**Description:**
${currentMission.description}

---

## Recent Chat History

${chatHistory || "_No chat history available._"}

---

## Bob Prompt Preview

${
  bobPrompt
    ? `\`\`\`
${bobPrompt}
\`\`\``
    : "_No Bob prompt generated for this project yet._"
}

---

## Readiness Checklist

${readinessItems
  .map(([label, status]) => `- [${status ? "x" : " "}] ${label}`)
  .join("\n")}

---

## Release Gate Status

**Current Status:** ${durableWorkspaceState.releaseGateStatus}
**QA Status:** ${durableWorkspaceState.qaStatus}

**Release Policy:**
Commit and push only after:
- QA acceptance (PASS or CONDITIONAL PASS)
- Evidence export complete
- Human lead approval

---

## Notes

This report captures the current durable state of the ADA delivery workflow.
Review all sections before proceeding to commit/push.

---

*Generated by ADA — AI Delivery Architect*
*IBM Bob Hackathon MVP*
`;

    try {
      const response = await fetch("/api/ada/artifacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspaceId,
          artifactType: "delivery_report",
          title: "Delivery Report",
          content: markdown,
          metadata: {
            timestamp,
            formattedDate,
            workspaceName: currentMission.title,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to persist delivery report artifact");
      }

      setDurableWorkspaceState((prev) => ({
        ...prev,
        hasDeliveryReport: true,
      }));
    } catch (err) {
      console.warn("Failed to persist delivery report artifact:", err);
    }

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `ada-delivery-report-${currentMission.title
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}.md`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-950/95 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-5">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-blue-400">
                IBM Bob Workflow Companion
              </p>

              <div className="mt-2 flex items-center gap-4">
                <Image
                  src="/ada_logo1.png"
                  alt="ADA face logo"
                  width={76}
                  height={76}
                  priority
                  className="hidden h-16 w-16 shrink-0 rounded-full object-contain md:block"
                />

                <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                  ADA — AI Delivery Architect
                </h1>

                <Image
                  src="/ada_logo.png"
                  alt="ADA logo"
                  width={72}
                  height={72}
                  priority
                  className="hidden h-14 w-14 shrink-0 rounded-full object-contain md:block"
                />
              </div>

              <p className="mt-2 max-w-2xl text-sm text-neutral-400">
                Bob builds. Ada orchestrates and reviews. You lead.
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 border border-blue-500 bg-blue-500/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-blue-300 md:block">
            Two AIs are better than one
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-6 lg:grid-cols-[260px_1fr_360px]">
        <WorkflowSidebar
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          defaultWorkspaceId={MVP_WORKSPACE_ID}
          isLoadingWorkspaces={isLoadingWorkspaces}
          onWorkspaceSelect={handleWorkspaceSelect}
          onWorkspaceCreated={handleWorkspaceCreated}
          onWorkspaceDelete={handleWorkspaceDelete}
        />

        {selectedWorkspaceId ? (
          <ChatPanel
            workspaceId={selectedWorkspaceId}
            onBobPromptDetected={handleBobPromptDetected}
            onMessagesLoaded={handleMessagesLoaded}
          />
        ) : (
          <section className="flex h-[calc(100vh-200px)] max-h-[800px] min-h-[600px] items-center justify-center border border-neutral-800 bg-neutral-900 p-6">
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
                Workspace Recovery
              </p>
              <p className="mt-3 text-sm text-neutral-400">
                Recovering a valid project workspace before chat becomes active.
              </p>
            </div>
          </section>
        )}

        <ContextPanel
          currentMission={currentMission}
          bobPrompt={bobPrompt}
          readinessItems={readinessItems}
          qaStatus={durableWorkspaceState.qaStatus}
          qaDraftStatus={qaDraftStatus}
          releaseGateDraftStatus={releaseGateDraftStatus}
          releaseGateStatus={durableWorkspaceState.releaseGateStatus}
          onQaStatusChange={setQaDraftStatus}
          onReleaseGateStatusChange={setReleaseGateDraftStatus}
          onSaveQaReport={handleSaveQaReport}
          onSaveReleaseGate={handleSaveReleaseGate}
          isSavingQaReport={isSavingQaReport}
          isSavingReleaseGate={isSavingReleaseGate}
          qaReportFeedback={qaReportFeedback}
          releaseGateFeedback={releaseGateFeedback}
          onExportMarkdown={handleExportMarkdown}
        />
      </section>
    </main>
  );
}
