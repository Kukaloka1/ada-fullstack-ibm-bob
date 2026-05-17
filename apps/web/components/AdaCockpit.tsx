"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { ChatPanel } from "./ChatPanel";
import { ContextPanel } from "./ContextPanel";
import { HowAdaWorksModal } from "./HowAdaWorksModal";
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
  missionId?: string;
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
type MissionCloseStatus =
  | "approved"
  | "approved_with_conditions"
  | "blocked"
  | "closed";

// MVP workspace ID - no auth for hackathon
const MVP_WORKSPACE_ID = "00000000-0000-4000-8000-000000000001";
const SELECTED_WORKSPACE_KEY = "ada_selected_workspace_id";
const FALLBACK_WORKSPACE_NAME = "ADA Hackathon MVP";

const defaultMission = {
  title: "ADA Hackathon MVP",
  description:
    "Chat-first delivery control cockpit connected to ADA memory, Bob prompt preview, readiness checklist, and release gate workflow.",
};
const inactiveMission = {
  title: "No active mission",
  description:
    "This project is ready for the next scoped delivery cycle. Start a new mission when you have a new objective, scope, constraints, and expected output.",
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
const activeMissionStatuses = [
  "draft",
  "planning",
  "active",
  "ready",
  "in_progress",
  "review",
];
const closedMissionStatuses = [
  "approved",
  "approved_with_conditions",
  "blocked",
  "closed",
  "complete",
];

const buildReadinessItems = (
  state: DurableWorkspaceState
): Array<[string, boolean]> => [
  ["Mission structured", state.hasActiveMission || state.hasMessages],
  ["Bob prompt ready", state.hasBobPrompt],
  ["QA review complete", state.hasQaReport && state.qaStatus !== "PENDING"],
  ["Evidence exported", state.hasDeliveryReport],
  [
    "Release gate recorded",
    state.hasReleaseGate && state.releaseGateStatus !== "PENDING",
  ],
];

const formatDeliveryStatusLabel = (status: DeliveryStatus) =>
  status.replace("_", " ");
const BOB_PROMPT_ARTIFACT_INVALID_PATTERNS = [
  /QA Verdict:/i,
  /^Evidence:/im,
  /Blocking caveats:/i,
  /Suggested commit message:/i,
  /Validation results:/i,
];
const BOB_PROMPT_ARTIFACT_STRUCTURE_PATTERNS = [
  /Mission Title:/i,
  /Context:/i,
  /Goal:/i,
  /Scope:/i,
  /Non-goals:/i,
  /Constraints:/i,
  /Required work:/i,
  /Acceptance criteria:/i,
  /Validation(?::|\s+(?:required|commands))/i,
  /Required Bob output:/i,
  /Evidence requirement:/i,
  /Alignment confirmation:|Confirm alignment/i,
];

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

const isValidBobPromptArtifactContent = (content: string): boolean => {
  const trimmed = content.trim();

  if (!trimmed) {
    return false;
  }

  const structureCount = BOB_PROMPT_ARTIFACT_STRUCTURE_PATTERNS.filter((pattern) =>
    pattern.test(trimmed)
  ).length;
  const hasStrongStructure =
    structureCount >= 4 ||
    (/Mission Title:/i.test(trimmed) &&
      /(Context:|Goal:|Scope:|Required work:|Required Bob output:)/i.test(trimmed));

  if (!hasStrongStructure) {
    return false;
  }

  if (BOB_PROMPT_ARTIFACT_INVALID_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return false;
  }

  return true;
};

const derivePersistedReleaseGateStatus = (
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

const derivePersistedQaStatus = (artifacts: Artifact[]): DeliveryStatus => {
  const qaArtifact = artifacts.find((artifact) => artifact.type === "qa_report");

  if (!qaArtifact) {
    return "PENDING";
  }

  return (
    parseDeliveryStatus(qaArtifact.metadata?.qaStatus || qaArtifact.metadata?.status) ||
    deriveArtifactStatusFromContent(qaArtifact.content)
  );
};

const qaVerdictLinePattern =
  /^QA Verdict:\s*(PASS|CONDITIONAL_PASS|CONDITIONAL PASS|FAIL|PENDING)\s*$/im;
const genericVerdictLinePattern =
  /^(?:QA Verdict:|Verdict:)?\s*(PASS|CONDITIONAL_PASS|CONDITIONAL PASS|FAIL|PENDING)\s*$/im;
const qaContextPattern =
  /(qa verdict|qa report|qa gate|review (?:bob|builder) output|builder output|mission scope|repository changes|validation logs|known risks|scope creep|required next action|evidence)/i;

const deriveQaStatusFromMessageContent = (content: string): DeliveryStatus | null => {
  const explicitVerdict = content.match(qaVerdictLinePattern);

  if (explicitVerdict) {
    return parseDeliveryStatus(explicitVerdict[1]);
  }

  if (!qaContextPattern.test(content)) {
    return null;
  }

  const genericVerdict = content.match(genericVerdictLinePattern);
  return parseDeliveryStatus(genericVerdict?.[1]);
};

const deriveLatestQaStatusFromMessages = (messages: ChatMessage[]): DeliveryStatus => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "user") {
      continue;
    }

    const derivedStatus = deriveQaStatusFromMessageContent(message.content);

    if (derivedStatus) {
      return derivedStatus;
    }
  }

  return "PENDING";
};

const deriveRecommendedReleaseGateStatus = ({
  persistedStatus,
  hasPersistedReleaseGate,
  qaStatus,
  hasDeliveryReport,
}: {
  persistedStatus: DeliveryStatus;
  hasPersistedReleaseGate: boolean;
  qaStatus: DeliveryStatus;
  hasDeliveryReport: boolean;
}): DeliveryStatus => {
  if (hasPersistedReleaseGate) {
    return persistedStatus;
  }

  if (qaStatus === "FAIL") {
    return "FAIL";
  }

  if (qaStatus === "PASS" && hasDeliveryReport) {
    return "PASS";
  }

  if (qaStatus === "CONDITIONAL_PASS" && hasDeliveryReport) {
    return "CONDITIONAL_PASS";
  }

  return "PENDING";
};

const buildReadinessMarkdown = (state: DurableWorkspaceState) =>
  buildReadinessItems(state)
    .map(([label, ok]) => `- [${ok ? "x" : " "}] ${label}`)
    .join("\n");

const buildQaReportSignature = ({
  workspaceId,
  missionId,
  qaStatus,
}: {
  workspaceId: string;
  missionId: string;
  qaStatus: DeliveryStatus;
}) =>
  [workspaceId, missionId, qaStatus].join("|");

const buildReleaseGateSignature = ({
  workspaceId,
  missionId,
  releaseGateStatus,
  hasQaReport,
  hasDeliveryReport,
}: {
  workspaceId: string;
  missionId: string;
  releaseGateStatus: DeliveryStatus;
  hasQaReport: boolean;
  hasDeliveryReport: boolean;
}) =>
  [
    workspaceId,
    missionId,
    releaseGateStatus,
    hasQaReport ? "qa" : "no-qa",
    hasDeliveryReport ? "delivery" : "no-delivery",
  ].join("|");

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

const deriveMissionBriefingFromMessage = (
  message: string
): { title: string; objective: string | null } | null => {
  if (
    /(Required Bob output:|Evidence requirement:|Alignment confirmation:|Prompt para Bob|Bob[-\s]Ready Mission Prompt)/i.test(
      message
    )
  ) {
    return null;
  }

  const sectionChecks = [
    /^(Mission Title|Mission):/im.test(message),
    /^(Objective|Goal):/im.test(message),
    /^Scope:/im.test(message),
    /^Non-goals:/im.test(message),
    /^Acceptance Criteria:/im.test(message),
    /^Required Evidence:/im.test(message),
    /^Validation:/im.test(message),
    /^Next Step:/im.test(message),
  ];
  const sectionCount = sectionChecks.filter(Boolean).length;

  if (sectionCount < 6 || !/^Next Step:/im.test(message)) {
    return null;
  }

  const title =
    extractPromptField(message, ["Mission Title"]) ||
    extractPromptField(message, ["Mission"]);
  const objective =
    extractPromptField(message, ["Objective"]) ||
    extractPromptField(message, ["Goal"]);

  if (!title) {
    return null;
  }

  return {
    title,
    objective: objective || null,
  };
};

const deriveMissionCloseStatus = (
  releaseGateStatus: DeliveryStatus
): MissionCloseStatus => {
  if (releaseGateStatus === "PASS") {
    return "approved";
  }

  if (releaseGateStatus === "CONDITIONAL_PASS") {
    return "approved_with_conditions";
  }

  if (releaseGateStatus === "FAIL") {
    return "blocked";
  }

  return "closed";
};

const inferMissionDraftTitle = (input: string): string => {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  const stripped = trimmed
    .replace(
      /^(new mission|start next mission|open mission|make this current mission|make this the next mission|turn this into a mission)\s*[:\-]?\s*/i,
      ""
    )
    .replace(
      /^(nueva misi[oó]n|abrir misi[oó]n|inicia nueva misi[oó]n|esta es la nueva misi[oó]n|haz esta la misi[oó]n actual|convierte esto en misi[oó]n)\s*[:\-]?\s*/i,
      ""
    )
    .trim();

  const candidate = stripped || trimmed;
  if (candidate.length <= 3 || candidate.toLowerCase() === trimmed.toLowerCase()) {
    return "";
  }

  return candidate.slice(0, 120);
};

export function AdaCockpit() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState<string | null>(null);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [currentMission, setCurrentMission] = useState(inactiveMission);
  const [bobPrompt, setBobPrompt] = useState("");
  const [durableWorkspaceState, setDurableWorkspaceState] = useState(
    defaultDurableWorkspaceState
  );
  const [historyQaStatus, setHistoryQaStatus] = useState<DeliveryStatus>("PENDING");
  const [latestChatQaStatus, setLatestChatQaStatus] =
    useState<DeliveryStatus>("PENDING");
  const [recordedQaReportSignature, setRecordedQaReportSignature] = useState("");
  const [isSavingQaReport, setIsSavingQaReport] = useState(false);
  const [isSavingReleaseGate, setIsSavingReleaseGate] = useState(false);
  const [qaReportFeedback, setQaReportFeedback] = useState<string | null>(null);
  const [releaseGateFeedback, setReleaseGateFeedback] = useState<string | null>(null);
  const [isHowAdaWorksOpen, setIsHowAdaWorksOpen] = useState(false);
  const [closedMissionCount, setClosedMissionCount] = useState(0);
  const [isClosingMission, setIsClosingMission] = useState(false);
  const [isCloseMissionConfirmOpen, setIsCloseMissionConfirmOpen] = useState(false);
  const [isOpenMissionModalOpen, setIsOpenMissionModalOpen] = useState(false);
  const [isCreatingMission, setIsCreatingMission] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState("");
  const [newMissionDescription, setNewMissionDescription] = useState("");
  const [newMissionError, setNewMissionError] = useState<string | null>(null);
  const [closeMissionPromptLanguage, setCloseMissionPromptLanguage] = useState<"en" | "es">(
    "en"
  );
  const [missionCloseConfirmationNotice, setMissionCloseConfirmationNotice] = useState<{
    id: number;
    language: "en" | "es";
  } | null>(null);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);

  const activeMissionIdRef = useRef<string | null>(null);
  const lastPersistedPromptRef = useRef("");
  const lastQaReportSignatureRef = useRef("");
  const lastReleaseGateSignatureRef = useRef("");
  const isWorkspaceHydratingRef = useRef(false);
  const pendingDetectedPromptRef = useRef("");
  const workspaceLoadSequenceRef = useRef(0);
  const isRecoveringWorkspaceRef = useRef(false);
  const messageCountRef = useRef(0);

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
    setCurrentMission(inactiveMission);
    setDurableWorkspaceState(defaultDurableWorkspaceState);
    setHistoryQaStatus("PENDING");
    setLatestChatQaStatus("PENDING");
    setQaReportFeedback(null);
    setReleaseGateFeedback(null);
    setClosedMissionCount(0);
    setIsClosingMission(false);
    setIsCloseMissionConfirmOpen(false);
    setIsOpenMissionModalOpen(false);
    setIsCreatingMission(false);
    setNewMissionTitle("");
    setNewMissionDescription("");
    setNewMissionError(null);
    setCloseMissionPromptLanguage("en");
    setMissionCloseConfirmationNotice(null);
    setActiveMissionId(null);
    activeMissionIdRef.current = null;
    setRecordedQaReportSignature("");
    lastPersistedPromptRef.current = "";
    lastQaReportSignatureRef.current = "";
    lastReleaseGateSignatureRef.current = "";
    pendingDetectedPromptRef.current = "";
  };

  const buildChecklistMarkdown = useCallback(
    () => buildReadinessMarkdown(durableWorkspaceState),
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
          "Evidence is currently insufficient for a final ADA QA verdict.",
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
      return persistedMission.id;
    } catch (err) {
      console.warn("Failed to persist active mission:", err);
      return null;
    }
  }, []);

  const persistBobPromptArtifact = useCallback(async (
    prompt: string,
    workspaceId: string,
    missionId: string | null
  ) => {
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
          missionId,
          metadata: {
            timestamp: new Date().toISOString(),
            missionId,
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
      const existingMissionId = activeMissionIdRef.current;

      if (existingMissionId) {
        await persistBobPromptArtifact(prompt, workspaceId, existingMissionId);
        return;
      }

      const createdMissionId = await persistActiveMission(prompt, workspaceId);

      if (!createdMissionId) {
        return;
      }

      await persistBobPromptArtifact(prompt, workspaceId, createdMissionId);
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
        const [missionResponse, messagesResponse] = await Promise.all([
          fetch(`/api/ada/missions?workspaceId=${selectedWorkspaceId}`),
          fetch(`/api/ada/messages?workspaceId=${selectedWorkspaceId}&limit=50`),
        ]);

        if (workspaceLoadSequenceRef.current !== loadSequence) {
          return;
        }

        let messages: ChatMessage[] = [];
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          messages = (messagesData.messages as ChatMessage[]) || [];
        } else {
          console.warn("Failed to load messages for workspace:", selectedWorkspaceId);
        }

        let allMissions: Mission[] = [];
        if (missionResponse.ok) {
          const missionData = await missionResponse.json();
          allMissions = (missionData.missions as Mission[]) || [];
        } else {
          console.warn("Failed to load missions for workspace:", selectedWorkspaceId);
        }

        const activeMission =
          allMissions.find((mission) =>
            activeMissionStatuses.includes(mission.status)
          ) || null;
        const closedMissions = allMissions.filter((mission) =>
          closedMissionStatuses.includes(mission.status)
        );
        let artifacts: Artifact[] = [];

        if (activeMission) {
          const artifactsResponse = await fetch(
            `/api/ada/artifacts?workspaceId=${selectedWorkspaceId}&missionId=${activeMission.id}&limit=20`
          );

          if (workspaceLoadSequenceRef.current !== loadSequence) {
            return;
          }

          if (artifactsResponse.ok) {
            const artifactsData = await artifactsResponse.json();
            artifacts = (artifactsData.artifacts as Artifact[]) || [];
          } else {
            console.warn(
              "Failed to load mission-scoped artifacts for workspace:",
              selectedWorkspaceId
            );
          }
        }

        const latestBobPromptArtifact = artifacts.find((artifact) => artifact.type === "bob_prompt");
        const latestQaReportArtifact = artifacts.find((artifact) => artifact.type === "qa_report");
        const latestReleaseGateArtifact = artifacts.find(
          (artifact) => artifact.type === "release_gate"
        );
        const restoredQaStatus = derivePersistedQaStatus(artifacts);
        const restoredReleaseGateStatus = derivePersistedReleaseGateStatus(artifacts);
        const restoredChatQaStatus = deriveLatestQaStatusFromMessages(messages);
        const loadedPrompt =
          activeMission &&
          isValidBobPromptArtifactContent(latestBobPromptArtifact?.content || "")
            ? latestBobPromptArtifact?.content?.trim() || ""
            : "";

        setClosedMissionCount(closedMissions.length);
        setBobPrompt(loadedPrompt);
        setHistoryQaStatus(activeMission ? restoredChatQaStatus : "PENDING");
        setLatestChatQaStatus("PENDING");
        lastPersistedPromptRef.current = loadedPrompt;
        lastQaReportSignatureRef.current =
          activeMission ? latestQaReportArtifact?.metadata?.signature || "" : "";
        setRecordedQaReportSignature(
          activeMission ? latestQaReportArtifact?.metadata?.signature || "" : ""
        );
        lastReleaseGateSignatureRef.current =
          activeMission ? latestReleaseGateArtifact?.metadata?.signature || "" : "";

        if (activeMission) {
          activeMissionIdRef.current = activeMission.id;
          setActiveMissionId(activeMission.id);
          setCurrentMission({
            title: activeMission.title,
            description: activeMission.objective || defaultMission.description,
          });
          setDurableWorkspaceState({
            hasMessages: messages.length > 0,
            hasActiveMission: true,
            hasBobPrompt: Boolean(loadedPrompt),
            hasQaReport: Boolean(latestQaReportArtifact),
            hasDeliveryReport: artifacts.some(
              (artifact) => artifact.type === "delivery_report"
            ),
            hasReleaseGate: Boolean(latestReleaseGateArtifact),
            qaStatus: restoredQaStatus,
            releaseGateStatus: restoredReleaseGateStatus,
          });
        } else {
          activeMissionIdRef.current = null;
          setActiveMissionId(null);
          setCurrentMission(inactiveMission);
          setDurableWorkspaceState(defaultDurableWorkspaceState);
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

  const openNewMissionModal = useCallback(
    (draft?: { title?: string; description?: string }) => {
      setNewMissionTitle(inferMissionDraftTitle(draft?.title || ""));
      setNewMissionDescription(draft?.description?.trim() || "");
      setNewMissionError(null);
      setIsOpenMissionModalOpen(true);
    },
    []
  );

  const handleCreateMission = useCallback(async (): Promise<boolean> => {
    if (!selectedWorkspaceId) {
      return false;
    }

    const title = newMissionTitle.trim();
    const description = newMissionDescription.trim();

    if (!title) {
      setNewMissionError("Mission title is required.");
      return false;
    }

    setIsCreatingMission(true);
    setNewMissionError(null);

    try {
      const response = await fetch("/api/ada/missions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspaceId,
          title,
          description,
          status: "planning",
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorData?.error || "Failed to open mission");
      }

      const data = (await response.json()) as { mission?: Mission };
      const mission = data.mission;

      if (!mission) {
        throw new Error("Mission response missing payload");
      }

      activeMissionIdRef.current = mission.id;
      setActiveMissionId(mission.id);
      setCurrentMission({
        title: mission.title,
        description: mission.objective || defaultMission.description,
      });
      setBobPrompt("");
      setHistoryQaStatus("PENDING");
      setLatestChatQaStatus("PENDING");
      setRecordedQaReportSignature("");
      lastPersistedPromptRef.current = "";
      lastQaReportSignatureRef.current = "";
      lastReleaseGateSignatureRef.current = "";
      pendingDetectedPromptRef.current = "";
      setDurableWorkspaceState({
        hasMessages: messageCountRef.current > 0,
        hasActiveMission: true,
        hasBobPrompt: false,
        hasQaReport: false,
        hasDeliveryReport: false,
        hasReleaseGate: false,
        qaStatus: "PENDING",
        releaseGateStatus: "PENDING",
      });
      setIsCloseMissionConfirmOpen(false);
      setIsOpenMissionModalOpen(false);
      setNewMissionTitle("");
      setNewMissionDescription("");
      return true;
    } catch (err) {
      console.warn("Failed to create mission:", err);
      setNewMissionError(
        err instanceof Error ? err.message : "Failed to open mission"
      );
      return false;
    } finally {
      setIsCreatingMission(false);
    }
  }, [newMissionDescription, newMissionTitle, selectedWorkspaceId]);

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
    messageCountRef.current = count;
    setDurableWorkspaceState((prev) => ({
      ...prev,
      hasMessages: count > 0 && activeMissionIdRef.current !== null,
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

  const currentQaVerdict =
    latestChatQaStatus !== "PENDING"
      ? latestChatQaStatus
      : durableWorkspaceState.qaStatus !== "PENDING"
        ? durableWorkspaceState.qaStatus
        : historyQaStatus;
  const currentReleaseGateStatus = deriveRecommendedReleaseGateStatus({
    persistedStatus: durableWorkspaceState.releaseGateStatus,
    hasPersistedReleaseGate: durableWorkspaceState.hasReleaseGate,
    qaStatus: currentQaVerdict,
    hasDeliveryReport: durableWorkspaceState.hasDeliveryReport,
  });
  const readinessItems = buildReadinessItems(durableWorkspaceState);

  const recordQaReport = useCallback(
    async (
      qaStatus: DeliveryStatus,
      { automatic }: { automatic: boolean }
    ): Promise<"saved" | "unchanged" | "failed" | "skipped"> => {
      if (!selectedWorkspaceId || !activeMissionIdRef.current) {
        return "skipped";
      }

      if (automatic && qaStatus === "PENDING") {
        return "skipped";
      }

      setIsSavingQaReport(true);
      setQaReportFeedback(
        automatic ? "ADA verdict detected — recording..." : "Recording latest QA report..."
      );

      const timestamp = new Date().toISOString();
      const formattedDate = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
      const releaseGateStatusAtSave = deriveRecommendedReleaseGateStatus({
        persistedStatus: durableWorkspaceState.releaseGateStatus,
        hasPersistedReleaseGate: durableWorkspaceState.hasReleaseGate,
        qaStatus,
        hasDeliveryReport: durableWorkspaceState.hasDeliveryReport,
      });
      const knownRisks = buildKnownRisks(qaStatus);
      const signature = buildQaReportSignature({
        workspaceId: selectedWorkspaceId,
        missionId: activeMissionIdRef.current,
        qaStatus,
      });
      const content = `# ADA QA Report

**Mission:** ${currentMission.title}
**Workspace ID:** ${selectedWorkspaceId}
**ADA QA Verdict:** ${formatDeliveryStatusLabel(qaStatus)}
**Generated:** ${formattedDate}
**Timestamp:** ${timestamp}

---

## Mission Summary

${currentMission.description}

---

## Validation Status

- Structured validation logs are not yet persisted in the MVP
- Evidence sufficiency: ${
        qaStatus === "PENDING"
          ? "Insufficient evidence captured for a final QA verdict."
          : "Sufficient evidence captured to persist the current QA verdict."
      }
- Release gate status at save time: ${formatDeliveryStatusLabel(
        releaseGateStatusAtSave
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
          missionId: activeMissionIdRef.current,
          timestamp,
          qaStatus,
        },
        signature,
        lastSignatureRef: lastQaReportSignatureRef,
      });

      if (result === "saved" || result === "unchanged") {
        setDurableWorkspaceState((prev) => ({
          ...prev,
          hasQaReport: true,
          qaStatus,
        }));
        setRecordedQaReportSignature(signature);
        setQaReportFeedback("QA Report recorded");
      } else {
        setQaReportFeedback("Recording failed");
      }

      setIsSavingQaReport(false);
      return result;
    },
    [
      buildChecklistMarkdown,
      buildKnownRisks,
      currentMission.description,
      currentMission.title,
      durableWorkspaceState.hasDeliveryReport,
      durableWorkspaceState.hasReleaseGate,
      durableWorkspaceState.releaseGateStatus,
      persistArtifactIfChanged,
      selectedWorkspaceId,
    ]
  );

  const syncActiveMissionFromBriefing = useCallback(
    async (message: string) => {
      if (!activeMissionIdRef.current) {
        return;
      }

      const briefing = deriveMissionBriefingFromMessage(message);

      if (!briefing) {
        return;
      }

      const nextDescription = briefing.objective || defaultMission.description;
      const titleChanged = briefing.title !== currentMission.title;
      const objectiveChanged = nextDescription !== currentMission.description;

      if (!titleChanged && !objectiveChanged) {
        return;
      }

      setCurrentMission({
        title: briefing.title,
        description: nextDescription,
      });

      try {
        await fetch("/api/ada/missions", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            missionId: activeMissionIdRef.current,
            title: briefing.title,
            objective: briefing.objective,
          }),
        });
      } catch (err) {
        console.warn("Failed to sync active mission briefing:", err);
      }
    },
    [currentMission.description, currentMission.title]
  );

  const handleAdaMessageGenerated = useCallback(
    (message: string) => {
      void syncActiveMissionFromBriefing(message);

      const derivedQaStatus = deriveQaStatusFromMessageContent(message);

      if (!derivedQaStatus) {
        return;
      }

      setLatestChatQaStatus(derivedQaStatus);

      if (derivedQaStatus === "PENDING") {
        if (!durableWorkspaceState.hasQaReport) {
          setQaReportFeedback("Waiting for ADA verdict");
        }
        return;
      }

      void recordQaReport(derivedQaStatus, { automatic: true });
    },
    [durableWorkspaceState.hasQaReport, recordQaReport, syncActiveMissionFromBriefing]
  );

  const hasCurrentQaReportRecorded =
    currentQaVerdict !== "PENDING" &&
    selectedWorkspaceId !== null &&
    activeMissionId !== null &&
    buildQaReportSignature({
      workspaceId: selectedWorkspaceId,
      missionId: activeMissionId,
      qaStatus: currentQaVerdict,
    }) === recordedQaReportSignature;
  const canManuallyRecordQaReport =
    currentQaVerdict !== "PENDING" &&
    !hasCurrentQaReportRecorded &&
    !isSavingQaReport;

  const handleSaveQaReport = useCallback(async () => {
    await recordQaReport(currentQaVerdict, { automatic: false });
  }, [currentQaVerdict, recordQaReport]);

  const handleCloseMission = useCallback(async () => {
    if (!selectedWorkspaceId || !activeMissionIdRef.current) {
      return;
    }

    setIsClosingMission(true);

    try {
      const nextMissionStatus = deriveMissionCloseStatus(currentReleaseGateStatus);
      const response = await fetch("/api/ada/missions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          missionId: activeMissionIdRef.current,
          status: nextMissionStatus,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(errorData?.error || "Failed to close mission");
      }

      const nextClosedMissionCount = closedMissionCount + 1;
      const confirmationLanguage = closeMissionPromptLanguage;
      resetWorkspacePanels();
      setClosedMissionCount(nextClosedMissionCount);
      setMissionCloseConfirmationNotice({
        id: Date.now(),
        language: confirmationLanguage,
      });
    } catch (err) {
      console.warn("Failed to close mission:", err);
    } finally {
      setIsCloseMissionConfirmOpen(false);
      setIsClosingMission(false);
    }
  }, [
    closeMissionPromptLanguage,
    closedMissionCount,
    currentReleaseGateStatus,
    selectedWorkspaceId,
  ]);

  const handleSaveReleaseGate = useCallback(async () => {
    if (!selectedWorkspaceId || !activeMissionIdRef.current) {
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
    const signature = buildReleaseGateSignature({
      workspaceId: selectedWorkspaceId,
      missionId: activeMissionIdRef.current,
      releaseGateStatus: currentReleaseGateStatus,
      hasQaReport: durableWorkspaceState.hasQaReport,
      hasDeliveryReport: durableWorkspaceState.hasDeliveryReport,
    });
    const content = `# ADA Release Gate Decision

**Mission:** ${currentMission.title}
**Workspace ID:** ${selectedWorkspaceId}
**Release Status:** ${formatDeliveryStatusLabel(currentReleaseGateStatus)}
**Generated:** ${formattedDate}
**Timestamp:** ${timestamp}

---

## Required Conditions

- QA review complete
- Evidence export complete
- Human lead approval

---

## Readiness Snapshot

${buildChecklistMarkdown()}

---

## Decision Notes

- Current QA status: ${formatDeliveryStatusLabel(currentQaVerdict)}
- Current evidence exported state: ${
      durableWorkspaceState.hasDeliveryReport ? "PASS" : "PENDING"
    }
- Human approval note: commit and push remain human-controlled actions outside the MVP UI
- This saved release gate reflects the current ADA workflow state at save time

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
        missionId: activeMissionIdRef.current,
        timestamp,
        releaseGateStatus: currentReleaseGateStatus,
      },
      signature,
      lastSignatureRef: lastReleaseGateSignatureRef,
    });

    if (result === "saved") {
      setDurableWorkspaceState((prev) => ({
        ...prev,
        hasReleaseGate: true,
        releaseGateStatus: currentReleaseGateStatus,
      }));
      setReleaseGateFeedback("Release decision recorded");
    } else if (result === "unchanged") {
      setReleaseGateFeedback("No changes");
    } else {
      setReleaseGateFeedback("Recording failed");
    }

    setIsSavingReleaseGate(false);
  }, [
    buildChecklistMarkdown,
    currentMission.title,
    currentQaVerdict,
    currentReleaseGateStatus,
    durableWorkspaceState.hasDeliveryReport,
    durableWorkspaceState.hasQaReport,
    persistArtifactIfChanged,
    selectedWorkspaceId,
  ]);

  const handleExportMarkdown = async () => {
    if (!selectedWorkspaceId) {
      return;
    }

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
    const currentExportState: DurableWorkspaceState = durableWorkspaceState;
    const persistedExportState: DurableWorkspaceState = {
      ...durableWorkspaceState,
      hasDeliveryReport: true,
    };
    const persistedReleaseGateStatus = deriveRecommendedReleaseGateStatus({
      persistedStatus: persistedExportState.releaseGateStatus,
      hasPersistedReleaseGate: persistedExportState.hasReleaseGate,
      qaStatus: currentQaVerdict,
      hasDeliveryReport: persistedExportState.hasDeliveryReport,
    });
    const buildDeliveryReportMarkdown = ({
      durableState,
      releaseGateStatus,
    }: {
      durableState: DurableWorkspaceState;
      releaseGateStatus: DeliveryStatus;
    }) => `# ADA Delivery Report

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

${buildReadinessMarkdown(durableState)}

---

## Release Gate Status

**Current Status:** ${releaseGateStatus}
**QA Status:** ${currentQaVerdict}

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
    const persistedMarkdown = buildDeliveryReportMarkdown({
      durableState: persistedExportState,
      releaseGateStatus: persistedReleaseGateStatus,
    });
    const fallbackMarkdown = buildDeliveryReportMarkdown({
      durableState: currentExportState,
      releaseGateStatus: currentReleaseGateStatus,
    });
    let markdownToDownload = fallbackMarkdown;

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
          content: persistedMarkdown,
          missionId: activeMissionIdRef.current,
          metadata: {
            timestamp,
            formattedDate,
            workspaceName: currentMission.title,
            missionId: activeMissionIdRef.current,
            qaStatus: currentQaVerdict,
            releaseGateStatus: persistedReleaseGateStatus,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to persist delivery report artifact");
      }

      setDurableWorkspaceState(persistedExportState);
      markdownToDownload = persistedMarkdown;
    } catch (err) {
      console.warn("Failed to persist delivery report artifact:", err);
    }

    const blob = new Blob([markdownToDownload], { type: "text/markdown" });
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

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsHowAdaWorksOpen(true)}
              className="border border-neutral-700 bg-neutral-900 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-neutral-200 transition-colors hover:border-blue-500 hover:bg-neutral-800 hover:text-blue-300"
            >
              How ADA Works
            </button>
            <div className="hidden border border-blue-500 bg-blue-500/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-blue-300 md:block">
              Two AIs are better than one
            </div>
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
            hasActiveMission={durableWorkspaceState.hasActiveMission}
            hasPendingOpenMissionDraft={isOpenMissionModalOpen}
            currentMissionTitle={currentMission.title}
            onRequestCloseMissionModal={(language) => {
              setCloseMissionPromptLanguage(language ?? "en");
              setIsCloseMissionConfirmOpen(true);
            }}
            onRequestOpenMissionModal={(draft) => {
              openNewMissionModal({
                title: draft?.title,
                description: draft?.description,
              });
            }}
            onConfirmOpenMissionDraft={handleCreateMission}
            onBobPromptDetected={handleBobPromptDetected}
            onMessagesLoaded={handleMessagesLoaded}
            onAdaMessageGenerated={handleAdaMessageGenerated}
            missionCloseConfirmationNotice={missionCloseConfirmationNotice}
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
          hasActiveMission={durableWorkspaceState.hasActiveMission}
          closedMissionCount={closedMissionCount}
          bobPrompt={bobPrompt}
          readinessItems={readinessItems}
          qaStatus={currentQaVerdict}
          releaseGateStatus={currentReleaseGateStatus}
          hasReleaseGateArtifact={durableWorkspaceState.hasReleaseGate}
          onSaveQaReport={handleSaveQaReport}
          onSaveReleaseGate={handleSaveReleaseGate}
          isSavingQaReport={isSavingQaReport}
          isSavingReleaseGate={isSavingReleaseGate}
          hasQaReportArtifact={durableWorkspaceState.hasQaReport}
          canManuallyRecordQaReport={canManuallyRecordQaReport}
          qaReportFeedback={qaReportFeedback}
          releaseGateFeedback={releaseGateFeedback}
          isCloseMissionConfirmOpen={isCloseMissionConfirmOpen}
          onOpenCloseMissionModal={() => {
            setCloseMissionPromptLanguage("en");
            setIsCloseMissionConfirmOpen(true);
          }}
          onDismissCloseMissionModal={() => setIsCloseMissionConfirmOpen(false)}
          onCloseMission={handleCloseMission}
          isClosingMission={isClosingMission}
          onOpenNewMissionModal={() => openNewMissionModal()}
          onExportMarkdown={handleExportMarkdown}
        />
      </section>

      <HowAdaWorksModal
        isOpen={isHowAdaWorksOpen}
        onClose={() => setIsHowAdaWorksOpen(false)}
      />

      {isOpenMissionModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg border border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
              Open New Mission
            </p>
            <p className="mt-4 text-sm leading-6 text-neutral-300">
              Open a new scoped mission for this project. Project memory, chat
              history, and closed missions will remain intact.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                  Title
                </label>
                <input
                  type="text"
                  value={newMissionTitle}
                  onChange={(event) => setNewMissionTitle(event.target.value)}
                  placeholder="Polish ADA chat message rendering"
                  className="mt-2 w-full border border-neutral-700 bg-black px-3 py-3 text-sm text-neutral-100 outline-none transition-colors focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                  Optional description
                </label>
                <textarea
                  value={newMissionDescription}
                  onChange={(event) =>
                    setNewMissionDescription(event.target.value)
                  }
                  placeholder="Objective, scope, constraints, and expected output for the next delivery cycle."
                  className="mt-2 min-h-28 w-full resize-none border border-neutral-700 bg-black px-3 py-3 text-sm text-neutral-100 outline-none transition-colors focus:border-blue-500"
                />
              </div>

              {newMissionError ? (
                <p className="text-sm text-red-300">{newMissionError}</p>
              ) : null}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isCreatingMission) {
                    return;
                  }

                  setIsOpenMissionModalOpen(false);
                  setNewMissionError(null);
                }}
                className="flex-1 border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-300 transition-colors hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleCreateMission();
                }}
                disabled={isCreatingMission}
                className="flex-1 border border-blue-500 bg-blue-600 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
              >
                {isCreatingMission ? "Opening..." : "Open mission"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
