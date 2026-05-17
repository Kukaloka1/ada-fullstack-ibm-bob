"use client";

import { useState, useRef, useEffect } from "react";
import { parseMessageContent, formatInlineText } from "@/lib/ada/format-message";

interface Message {
  role: "user" | "ada";
  content: string;
}

interface ChatPanelProps {
  workspaceId: string;
  hasActiveMission: boolean;
  hasPendingOpenMissionDraft?: boolean;
  currentMissionTitle?: string;
  onRequestCloseMissionModal?: (language?: "en" | "es") => void;
  onRequestOpenMissionModal?: (draft?: {
    title?: string;
    description?: string;
    language?: "en" | "es";
  }) => void;
  onConfirmOpenMissionDraft?: () => Promise<boolean> | boolean;
  onBobPromptDetected?: (prompt: string) => void;
  onMessagesLoaded?: (messageCount: number) => void;
  onAdaMessageGenerated?: (message: string, userMessage: string) => void;
  missionCloseConfirmationNotice?: {
    id: number;
    language: "en" | "es";
  } | null;
}

function CopyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="h-3.5 w-3.5"
    >
      <path
        d="M7 7.5A1.5 1.5 0 0 1 8.5 6h6A1.5 1.5 0 0 1 16 7.5v7A1.5 1.5 0 0 1 14.5 16h-6A1.5 1.5 0 0 1 7 14.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 12.5V5.5A1.5 1.5 0 0 1 5.5 4h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VerdictChip({ verdict }: { verdict: string }) {
  const normalized = verdict.toUpperCase().replace(/\s+/g, "_");
  const verdictStyles: Record<string, string> = {
    PASS: "border-emerald-400/30 bg-emerald-500/12 text-emerald-200",
    CONDITIONAL_PASS:
      "border-amber-400/30 bg-amber-500/12 text-amber-200",
    FAIL: "border-rose-400/30 bg-rose-500/12 text-rose-200",
    PENDING: "border-sky-400/30 bg-sky-500/12 text-sky-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] ${verdictStyles[normalized] ?? "border-neutral-600 bg-neutral-800 text-neutral-200"}`}
    >
      {normalized.replace(/_/g, " ")}
    </span>
  );
}

const BOB_PROMPT_CONFIRMATION =
  "✓ Bob-ready mission prompt prepared. Review it in the **Bob Prompt Preview** panel on the right.";

const QA_EXCLUSION_PATTERNS = [
  /QA Verdict:/i,
  /^Evidence:/im,
  /Blocking caveats:/i,
  /Known risks:/i,
  /Suggested commit message:/i,
  /Validation results:/i,
];
const BOB_PROMPT_MARKERS = [
  /Mission Title:/i,
  /##+\s*Prompt para Bob/i,
  /Prompt para Bob/i,
  /Bob[-\s]Ready Mission Prompt/i,
  /Mission:/i,
  /Objective:/i,
  /Objetivo de la misión:/i,
];
const BOB_PROMPT_STRUCTURE_PATTERNS = [
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
const BOB_PROMPT_EXPLICIT_OUTPUT_PATTERNS = [
  /##+\s*Prompt para Bob/i,
  /Prompt para Bob/i,
  /Bob[-\s]Ready Mission Prompt/i,
  /Required Bob output:/i,
  /Evidence requirement:/i,
  /Alignment confirmation:|Confirm alignment/i,
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
  "Open New Mission",
];

const quickActionTemplates: Record<string, string> = {
  "Turn this into a Bob mission":
    "Turn the following into a structured Bob mission:\n\n",
  "Generate Bob-ready prompt":
    "Generate a clean Bob-ready mission prompt. Do not include conversational preamble. Include mission, context, goal, scope, non-goals, constraints, required work, acceptance criteria, validation commands, Bob output requirements, and evidence requirements.\n\n",
  "Review Bob output":
    "Review this Bob output using ADA QA Gate. Do not trust the summary blindly. Ask for repo diff/status/validation if missing. Return PASS, CONDITIONAL PASS, or FAIL.\n\n",
  "Find scope creep": "Analyze the following for scope creep:\n\n",
  "Prepare QA verdict":
    "Prepare a QA verdict for the builder output. Start with exactly one line: QA Verdict: PASS, QA Verdict: CONDITIONAL_PASS, QA Verdict: FAIL, or QA Verdict: PENDING. Then explain evidence, risks, and required next action.\n\n",
  "Create commit message":
    "Create a commit message from the provided actual changes. If changed files or validation are missing, say what is missing.\n\n",
  "Prepare push handoff": "Prepare push handoff documentation for:\n\n",
  "Generate delivery report":
    "Generate a delivery report for the current mission state. Do not claim execution unless changed files, validation, and evidence are available.",
  "Open New Mission":
    "Start a new mission in this project. Ask me for the mission objective, scope, constraints, and expected output. Keep project memory intact.",
};

const normalizeIntentInput = (input: string) =>
  input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[!?.,;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const detectInputLanguage = (input: string): "en" | "es" => {
  const normalized = normalizeIntentInput(input);

  const spanishSignals = [
    /\bcerrar\b/,
    /\bcierra\b/,
    /\bmision\b/,
    /\bcierrala\b/,
    /\bseguir\b/,
    /\bsigue\b/,
    /\bcontinuar\b/,
    /\bdime\b/,
    /\balcance\b/,
    /\brestricciones\b/,
    /\bobje?tivo\b/,
    /\besta\b/,
    /\bproyecto\b/,
    /\bsi\b/,
  ];
  const englishSignals = [
    /\bclose\b/,
    /\bmission\b/,
    /\bcontinue\b/,
    /\bkeep working\b/,
    /\bscope\b/,
    /\bconstraints\b/,
    /\bobjective\b/,
    /\bproject\b/,
    /\bthis\b/,
    /\byes\b/,
  ];

  const spanishScore = spanishSignals.filter((pattern) => pattern.test(normalized)).length;
  const englishScore = englishSignals.filter((pattern) => pattern.test(normalized)).length;

  return spanishScore > englishScore ? "es" : "en";
};

const isCloseMissionRequest = (input: string): boolean => {
  const normalized = normalizeIntentInput(input);
  const patterns = [
    /^close the mission$/,
    /^close current mission$/,
    /^close current mision$/,
    /^close this mission$/,
    /^close this mision$/,
    /^close mission$/,
    /^cerrar esta mision$/,
    /^cerrar la mision$/,
    /^cerrar mision$/,
    /^cerrar misión$/,
    /^cierra la mision$/,
    /^cierra esta mision$/,
    /^cierra mision$/,
  ];

  return patterns.some((pattern) => pattern.test(normalized));
};

const isPendingCloseAffirmation = (input: string): boolean => {
  const normalized = normalizeIntentInput(input);
  const patterns = [
    /^yes$/,
    /^yes close it$/,
    /^close it$/,
    /^close the mission$/,
    /^si$/,
    /^si cierrala$/,
    /^cierra$/,
    /^cerrar$/,
    /^cerrar mision$/,
    /^cierra la mision$/,
  ];

  return patterns.some((pattern) => pattern.test(normalized));
};

const isPendingCloseContinueReply = (input: string): boolean => {
  const normalized = normalizeIntentInput(input);
  const patterns = [
    /^no$/,
    /^continue$/,
    /^keep working$/,
    /^seguir$/,
    /^sigue$/,
    /^continuar$/,
  ];

  return patterns.some((pattern) => pattern.test(normalized));
};

const isNewMissionRequest = (input: string): boolean => {
  const normalized = normalizeIntentInput(input);
  const patterns = [
    /^new mission$/,
    /^open a new mission$/,
    /^open new mission$/,
    /^start a new mission$/,
    /^start next mission$/,
    /^lets open a new mission$/,
    /^let s open a new mission$/,
    /^let sopen a new mission$/,
    /^open mission$/,
    /^make this current mission$/,
    /^make this the next mission$/,
    /^turn this into a mission$/,
    /^turn this into the new mission$/,
    /^make this the new mission$/,
    /^this is the new mission$/,
    /^confirmed you know the new mission$/,
    /^lets transform this in a new mission$/,
    /^let s transform this in a new mission$/,
    /^lets transform this into a new mission$/,
    /^let s transform this into a new mission$/,
    /^nueva mision$/,
    /^abrir mision$/,
    /^abrir nueva mision$/,
    /^inicia nueva mision$/,
    /^inicia nueva misión$/,
    /^esta es la nueva mision$/,
    /^hagamos esto la nueva mision$/,
    /^convierte esto en la nueva mision$/,
    /^haz esta la mision actual$/,
    /^convierte esto en mision$/,
  ];

  return patterns.some((pattern) => pattern.test(normalized));
};

const isNewMissionDraftConfirmation = (input: string): boolean => {
  const normalized = normalizeIntentInput(input);
  const patterns = [/^confirmed$/, /^confirm$/, /^yes$/, /^si$/, /^ok$/];

  return patterns.some((pattern) => pattern.test(normalized));
};

const deriveNewMissionDraft = (
  input: string,
  language: "en" | "es"
): { title: string; description: string } => {
  const trimmed = input.trim();
  const rawLines = trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const stripped = trimmed
    .replace(
      /^(new mission|start next mission|open mission|make this current mission|make this the next mission|make this the new mission|turn this into a mission|turn this into the new mission|this is the new mission|confirmed you know the new mission|lets transform this in a new mission|let's transform this in a new mission|lets transform this into a new mission|let's transform this into a new mission)\s*[:\-]?\s*/i,
      ""
    )
    .replace(
      /^(nueva misi[oó]n|abrir misi[oó]n|inicia nueva misi[oó]n|esta es la nueva misi[oó]n|hagamos esto la nueva misi[oó]n|convierte esto en la nueva misi[oó]n|haz esta la misi[oó]n actual|convierte esto en misi[oó]n)\s*[:\-]?\s*/i,
      ""
    )
    .trim();

  const meaningfulLines = (stripped || trimmed)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const firstMeaningfulLine = meaningfulLines[0] || rawLines[0] || "";
  const normalizedFirstLine = firstMeaningfulLine.replace(/\s+/g, " ").trim();
  const titleCandidate =
    normalizedFirstLine.length >= 6 &&
    normalizedFirstLine.length <= 120 &&
    !isNewMissionRequest(normalizedFirstLine)
      ? normalizedFirstLine
      : "";

  const title =
    titleCandidate ||
    (language === "es"
      ? "Nueva misión de entrega"
      : "New scoped delivery mission");
  const description =
    stripped && stripped !== titleCandidate ? stripped.slice(0, 1200) : "";

  return {
    title,
    description,
  };
};

const findBobPromptStartIndex = (content: string): number | null => {
  const indexes = BOB_PROMPT_MARKERS
    .map((pattern) => content.search(pattern))
    .filter((index) => index >= 0);

  return indexes.length > 0 ? Math.min(...indexes) : null;
};

const cleanBobPromptForPreview = (content: string): string => {
  let cleaned = content.trim();

  const startIndex = findBobPromptStartIndex(cleaned);
  if (startIndex !== null && startIndex > 0) {
    cleaned = cleaned.slice(startIndex).trim();
  }

  cleaned = cleaned
    .replace(
      /^✓\s*Bob-ready mission prompt prepared[\s\S]*?(?=(Mission Title:|Mission:|##+\s*Prompt para Bob|Prompt para Bob|Objective:|Objetivo de la misión:))/i,
      ""
    )
    .trim();

  const preamblePatterns = [
    /^(Here is|Here's|Aquí tienes|Aquí está|I prepared|I've prepared|I have prepared|I created|I've created)[^\n]*\n+/i,
    /^(Below is|The following is)[^\n]*\n+/i,
    /^(Use this as|Copia y pega|Copy and paste)[^\n]*\n+/i,
  ];

  for (const pattern of preamblePatterns) {
    cleaned = cleaned.replace(pattern, "");
  }

  cleaned = cleaned.replace(/^---+\s*/i, "").trim();

  const lines = cleaned.split("\n");
  const cutoffPatterns = [
    /^#{1,6}\s*Versión corta/i,
    /^#{1,6}\s*Para que Bob trabaje mejor/i,
    /^#{1,6}\s*Opción\s+[A-Z]/i,
    /^#{1,6}\s*Option\s+[A-Z]/i,
    /^(Si quieres|If you want|Para que Bob trabaje mejor|I can also|También puedo|Let me know|Avísame|Dime)/i,
    /^(Opción A|Opción B|Opción C|Option A|Option B|Option C)/i,
  ];

  const cutoffIndex = lines.findIndex((line) =>
    cutoffPatterns.some((pattern) => pattern.test(line.trim()))
  );

  if (cutoffIndex >= 0) {
    cleaned = lines.slice(0, cutoffIndex).join("\n").trim();
  }

  return cleaned;
};

const isBobPromptRequest = (input: string): boolean => {
  const normalized = input
    .toLowerCase()
    .replace(/prpmnt|promnt|pormnt|promt|prmpt/g, "prompt")
    .replace(/pata/g, "para")
    .replace(/\ble\b/g, "el")
    .replace(/\s+/g, " ")
    .trim();

  const patterns = [
    /^bob prompt$/,
    /^give bob prompt$/,
    /^generate bob prompt$/,
    /^prepare bob prompt$/,
    /^create bob prompt$/,
    /^create ibm bob prompt$/,
    /^prompt para bob$/,
    /^dame prompt bob$/,
    /^genera prompt bob$/,
    /^prepara prompt bob$/,
    /give me .*bob.*prompt/,
    /give me .*prompt.*bob/,
    /give .*bob.*prompt/,
    /give .*prompt.*bob/,
    /dame .*prompt.*bob/,
    /dame .*prompt.*para.*bob/,
    /generate .*bob[- ]ready.*prompt/,
    /generate .*bob.*prompt/,
    /prepare .*bob.*prompt/,
    /prepare .*prompt.*bob/,
    /prepara .*prompt.*bob/,
    /create .*ibm bob.*prompt/,
    /create .*bob.*prompt/,
    /prompt .*bob/,
    /bob.*mission.*prompt/,
  ];

  return patterns.some((pattern) => pattern.test(normalized));
};

const hasQaReviewMarkers = (content: string): boolean => {
  if (QA_EXCLUSION_PATTERNS.some((pattern) => pattern.test(content))) {
    return true;
  }

  const hasQaContext =
    /(qa report|qa gate|review bob output|review builder output|builder output|scope creep|validation results|known risks|suggested commit message)/i.test(
      content
    );
  const hasVerdict =
    /(?:^|\n)\s*(?:QA Verdict:|Verdict:)?\s*(PASS|CONDITIONAL_PASS|CONDITIONAL PASS|FAIL|PENDING)\s*$/im.test(
      content
    );

  return hasQaContext && hasVerdict;
};

const countBobPromptStructureMarkers = (content: string): number =>
  BOB_PROMPT_STRUCTURE_PATTERNS.filter((pattern) => pattern.test(content)).length;

const hasStrongBobPromptStructure = (content: string): boolean =>
  countBobPromptStructureMarkers(content) >= 4 ||
  (/Mission Title:/i.test(content) &&
    /(Context:|Goal:|Scope:|Required work:|Required Bob output:)/i.test(content));

const isClearlyQaReport = (content: string): boolean => {
  const trimmed = content.trim();

  if (/^QA Verdict:/i.test(trimmed)) {
    return true;
  }

  return hasQaReviewMarkers(content) && !hasStrongBobPromptStructure(content);
};

const extractBobPromptForPreview = (
  content: string,
  { explicitIntent }: { explicitIntent: boolean }
): string | null => {
  if (explicitIntent) {
    if (isClearlyQaReport(content)) {
      return null;
    }

    const promptStartIndex = findBobPromptStartIndex(content);
    const candidate =
      promptStartIndex !== null ? content.slice(promptStartIndex) : content;
    const cleanedCandidate = cleanBobPromptForPreview(candidate);

    if (!hasStrongBobPromptStructure(cleanedCandidate)) {
      return null;
    }

    return cleanedCandidate;
  }

  if (hasQaReviewMarkers(content)) {
    return null;
  }

  const promptStartIndex = findBobPromptStartIndex(content);
  const hasExplicitPromptOutput = BOB_PROMPT_EXPLICIT_OUTPUT_PATTERNS.some(
    (pattern) => pattern.test(content)
  );

  if (
    promptStartIndex !== null &&
    content.length > 300 &&
    (content.includes("Bob-ready mission prompt prepared") || hasExplicitPromptOutput)
  ) {
    const cleanedCandidate = cleanBobPromptForPreview(content.slice(promptStartIndex));
    return hasStrongBobPromptStructure(cleanedCandidate) ? cleanedCandidate : null;
  }

  const strictCount = countBobPromptStructureMarkers(content);
  if (strictCount >= 7 && content.length > 500) {
    const cleanedCandidate = cleanBobPromptForPreview(content);
    return hasExplicitPromptOutput && hasStrongBobPromptStructure(cleanedCandidate)
      ? cleanedCandidate
      : null;
  }

  const alternateCount = BOB_PROMPT_STRUCTURE_PATTERNS.filter((pattern) =>
    pattern.test(content)
  ).length;

  if (hasExplicitPromptOutput && alternateCount >= 6 && content.length > 500) {
    const cleanedCandidate = cleanBobPromptForPreview(content);
    return hasStrongBobPromptStructure(cleanedCandidate) ? cleanedCandidate : null;
  }

  return null;
};

const normalizeAdaMessageForDisplay = (
  content: string
): { displayContent: string; bobPrompt: string | null } => {
  const bobPrompt = extractBobPromptForPreview(content, { explicitIntent: false });

  if (!bobPrompt) {
    return {
      displayContent: content,
      bobPrompt: null,
    };
  }

  return {
    displayContent: BOB_PROMPT_CONFIRMATION,
    bobPrompt: cleanBobPromptForPreview(bobPrompt),
  };
};

const headingClassByLevel = (level: number) => {
  switch (level) {
    case 1:
      return "mt-5 text-xl font-semibold tracking-tight text-white first:mt-0";
    case 2:
      return "mt-4 text-lg font-semibold tracking-tight text-white first:mt-0";
    default:
      return "mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-200 first:mt-0";
  }
};

export function ChatPanel({
  workspaceId,
  hasActiveMission,
  hasPendingOpenMissionDraft = false,
  currentMissionTitle,
  onRequestCloseMissionModal,
  onRequestOpenMissionModal,
  onConfirmOpenMissionDraft,
  onBobPromptDetected,
  onMessagesLoaded,
  onAdaMessageGenerated,
  missionCloseConfirmationNotice,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasPendingCloseMissionDecisionRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const loadMessages = async () => {
      try {
        setIsLoadingHistory(true);
        const response = await fetch(`/api/ada/messages?workspaceId=${workspaceId}`);

        if (!mounted) return;

        if (!response.ok) {
          throw new Error("Failed to load chat history");
        }

        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
          const loadedMessages: Message[] = [];
          let lastBobPromptDetected: string | null = null;

          for (const msg of data.messages as Array<{ role: string; content: string }>) {
            const role = msg.role === "system" ? "ada" : (msg.role as "user" | "ada");

            if (role === "ada") {
              const normalized = normalizeAdaMessageForDisplay(msg.content);

              if (
                normalized.bobPrompt &&
                normalized.bobPrompt !== lastBobPromptDetected &&
                onBobPromptDetected
              ) {
                onBobPromptDetected(normalized.bobPrompt);
                lastBobPromptDetected = normalized.bobPrompt;
              }

              loadedMessages.push({
                role: "ada",
                content: normalized.displayContent,
              });
              continue;
            }

            loadedMessages.push({
              role,
              content: msg.content,
            });
          }

          setMessages(loadedMessages);
          onMessagesLoaded?.(loadedMessages.length);
        } else {
          setMessages([
            {
              role: "ada",
              content:
                "Give me product intent, Bob output, diffs, or implementation notes. I will structure the mission, generate Bob prompts, review delivery quality, and prepare release evidence.",
            },
          ]);
          onMessagesLoaded?.(0);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Error loading chat history:", err);
        setMessages([
          {
            role: "ada",
            content:
              "Give me product intent, Bob output, diffs, or implementation notes. I will structure the mission, generate Bob prompts, review delivery quality, and prepare release evidence.",
          },
        ]);
        onMessagesLoaded?.(0);
      } finally {
        if (mounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadMessages();

    return () => {
      mounted = false;
    };
    // Intentionally only reload when workspace changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    if (!isLoadingHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoadingHistory]);

  useEffect(() => {
    hasPendingCloseMissionDecisionRef.current = false;
  }, [workspaceId, hasActiveMission]);

  const appendLocalMessages = (newMessages: Message[]) => {
    setMessages((prev) => [...prev, ...newMessages]);
  };

  useEffect(() => {
    if (!missionCloseConfirmationNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      appendLocalMessages([
        {
          role: "ada",
          content:
            missionCloseConfirmationNotice.language === "es"
              ? "Misión cerrada. El proyecto sigue activo y la memoria se preservó. Ya podemos abrir la siguiente misión. Dime el nuevo objetivo, alcance, restricciones y output esperado para continuar."
              : "Mission closed. The project remains active and memory was preserved. We can now open the next mission. Send the new objective, scope, constraints, and expected output to continue.",
        },
      ]);
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // Only append when a new close-confirmation notice is emitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionCloseConfirmationNotice?.id]);

  const sendMessage = async (messageText: string) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isLoading) return;

    if (hasPendingCloseMissionDecisionRef.current) {
      if (isPendingCloseAffirmation(trimmedMessage)) {
        hasPendingCloseMissionDecisionRef.current = false;

        appendLocalMessages([
          { role: "user", content: trimmedMessage },
          {
            role: "ada",
            content: detectInputLanguage(trimmedMessage) === "es"
              ? "ADA está lista para cerrar esta misión. Confirma la acción en el modal."
              : "ADA is ready to close this mission. Confirm the action in the modal.",
          },
        ]);
        setInput("");
        onRequestCloseMissionModal?.(detectInputLanguage(trimmedMessage));
        return;
      }

      if (isPendingCloseContinueReply(trimmedMessage)) {
        hasPendingCloseMissionDecisionRef.current = false;
        appendLocalMessages([
          { role: "user", content: trimmedMessage },
          {
            role: "ada",
            content: detectInputLanguage(trimmedMessage) === "es"
              ? "Entendido. Seguimos trabajando dentro de la misión activa."
              : "Understood. We will continue working inside the current active mission.",
          },
        ]);
        setInput("");
        return;
      }
    }

    if (hasPendingOpenMissionDraft && isNewMissionDraftConfirmation(trimmedMessage)) {
      appendLocalMessages([{ role: "user", content: trimmedMessage }]);
      setInput("");

      try {
        const created = (await onConfirmOpenMissionDraft?.()) ?? false;

        if (created) {
          appendLocalMessages([
            {
              role: "ada",
              content:
                detectInputLanguage(trimmedMessage) === "es"
                  ? "Misión abierta. Pide el prompt para Bob cuando estés lista."
                  : "Mission opened. Ask for the Bob prompt when you are ready.",
            },
          ]);
        }
      } catch (err) {
        console.warn("Failed to confirm pending mission draft:", err);
      }

      return;
    }

    if (isCloseMissionRequest(trimmedMessage)) {
      hasPendingCloseMissionDecisionRef.current = false;

      if (hasActiveMission) {
        appendLocalMessages([
          { role: "user", content: trimmedMessage },
          {
            role: "ada",
            content: detectInputLanguage(trimmedMessage) === "es"
              ? "ADA está lista para cerrar esta misión. Confirma la acción en el modal."
              : "ADA is ready to close this mission. Confirm the action in the modal.",
          },
        ]);
        setInput("");
        onRequestCloseMissionModal?.(detectInputLanguage(trimmedMessage));
        return;
      }

      appendLocalMessages([
        { role: "user", content: trimmedMessage },
        {
          role: "ada",
          content: detectInputLanguage(trimmedMessage) === "es"
            ? "No hay una misión activa para cerrar."
            : "There is no active mission to close.",
        },
      ]);
      setInput("");
      return;
    }

    if (isNewMissionRequest(trimmedMessage)) {
      const language = detectInputLanguage(trimmedMessage);
      const draft = deriveNewMissionDraft(trimmedMessage, language);

      if (hasActiveMission) {
        hasPendingCloseMissionDecisionRef.current = true;
        appendLocalMessages([
          { role: "user", content: trimmedMessage },
          {
            role: "ada",
            content:
              language === "es"
                ? `Ya existe una misión activa${currentMissionTitle ? `: ${currentMissionTitle}` : ""}. ¿Debo cerrar primero la misión actual o seguimos trabajando dentro de ella?`
                : `There is already an active mission${currentMissionTitle ? `: ${currentMissionTitle}` : ""}. Close it first or continue working inside it?`,
          },
        ]);
        setInput("");
        return;
      }

      appendLocalMessages([
        { role: "user", content: trimmedMessage },
        {
          role: "ada",
          content:
            language === "es"
              ? "Preparé un borrador de nueva misión. Confírmalo en el modal."
              : "I prepared a new mission draft. Confirm it in the modal.",
        },
      ]);
      setInput("");
      onRequestOpenMissionModal?.({
        title: draft.title,
        description: draft.description,
        language,
      });
      return;
    }

    setError(null);
    setIsLoading(true);

    const shouldRouteToBobPreview = isBobPromptRequest(trimmedMessage);

    setMessages((prev) => [...prev, { role: "user", content: trimmedMessage }]);
    setInput("");

    try {
      const response = await fetch("/api/ada/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId,
          message: trimmedMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      onAdaMessageGenerated?.(data.message, trimmedMessage);

      if (shouldRouteToBobPreview) {
        const detectedBobPrompt = extractBobPromptForPreview(data.message, {
          explicitIntent: true,
        });

        if (detectedBobPrompt) {
          onBobPromptDetected?.(detectedBobPrompt);

          setMessages((prev) => [
            ...prev,
            {
              role: "ada",
              content: BOB_PROMPT_CONFIRMATION,
            },
          ]);
          return;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ada",
          content: data.message,
        },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "ada",
          content: `⚠ Error: ${errorMessage}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (action: string) => {
    if (action === "Open New Mission") {
      if (hasActiveMission) {
        hasPendingCloseMissionDecisionRef.current = true;
        appendLocalMessages([
          {
            role: "ada",
            content: `There is already an active mission${currentMissionTitle ? `: ${currentMissionTitle}` : ""}. Should I close the current mission first, or continue working inside it?`,
          },
        ]);
        return;
      }

      onRequestOpenMissionModal?.({
        title: "",
        description: "",
        language: "en",
      });
      return;
    }

    setInput(quickActionTemplates[action] || action);
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      window.setTimeout(() => {
        setCopiedMessageId((currentId) =>
          currentId === messageId ? null : currentId
        );
      }, 2000);
    } catch (copyError) {
      console.error("Failed to copy message:", copyError);
    }
  };

  const renderMessageContent = (content: string) => {
    const blocks = parseMessageContent(content);

    return blocks.map((block, blockIndex) => {
      switch (block.type) {
        case "heading":
          return (
            <h3
              key={blockIndex}
              className={headingClassByLevel(block.level ?? 3)}
            >
              {block.content}
            </h3>
          );

        case "code":
          return (
            <pre
              key={blockIndex}
              className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/70 px-4 py-3 font-mono text-[12px] leading-6 text-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              {block.content}
            </pre>
          );

        case "list":
          return (
            <ul key={blockIndex} className="mt-3 space-y-2.5">
              {block.items?.map((item, itemIndex) => {
                const inlineParts = formatInlineText(item);
                return (
                  <li key={itemIndex} className="flex gap-3">
                    <span className="mt-[0.45rem] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-300" />
                    <span className="min-w-0 flex-1">
                      {inlineParts.map((part, partIndex) =>
                        part.code ? (
                          <code
                            key={partIndex}
                            className="rounded-md border border-white/10 bg-black/35 px-1.5 py-0.5 font-mono text-[0.92em] text-sky-100"
                          >
                            {part.text}
                          </code>
                        ) : part.bold ? (
                          <strong
                            key={partIndex}
                            className="font-semibold text-white"
                          >
                            {part.text}
                          </strong>
                        ) : (
                          <span key={partIndex}>{part.text}</span>
                        )
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          );

        case "paragraph":
        default: {
          const verdictOnlyMatch = block.content
            .trim()
            .match(/^(PASS|CONDITIONAL_PASS|CONDITIONAL PASS|FAIL|PENDING)$/i);

          if (verdictOnlyMatch) {
            return (
              <div key={blockIndex} className="mt-3 first:mt-0">
                <VerdictChip verdict={verdictOnlyMatch[1]} />
              </div>
            );
          }

          const verdictLabelMatch = block.content
            .trim()
            .match(/^(QA Verdict|Verdict|Delivery status|Release Gate|Release status):\s*(PASS|CONDITIONAL_PASS|CONDITIONAL PASS|FAIL|PENDING)$/i);

          if (verdictLabelMatch) {
            return (
              <div
                key={blockIndex}
                className="mt-3 flex flex-wrap items-center gap-2.5 first:mt-0"
              >
                <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-neutral-400">
                  {verdictLabelMatch[1]}
                </span>
                <VerdictChip verdict={verdictLabelMatch[2]} />
              </div>
            );
          }

          const inlineParts = formatInlineText(block.content);
          return (
            <p
              key={blockIndex}
              className="mt-3 text-[15px] leading-7 first:mt-0"
            >
              {inlineParts.map((part, partIndex) =>
                part.code ? (
                  <code
                    key={partIndex}
                    className="rounded-md border border-white/10 bg-black/35 px-1.5 py-0.5 font-mono text-[0.92em] text-sky-100"
                  >
                    {part.text}
                  </code>
                ) : part.bold ? (
                  <strong key={partIndex} className="font-semibold text-white">
                    {part.text}
                  </strong>
                ) : (
                  <span key={partIndex}>{part.text}</span>
                )
              )}
            </p>
          );
        }
      }
    });
  };

  return (
    <section className="flex h-[calc(100vh-200px)] max-h-[800px] min-h-[600px] flex-col border border-neutral-800 bg-neutral-900">
      <div className="flex-shrink-0 border-b border-neutral-800 bg-black px-5 py-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
          ADA Chat
        </p>
        <h2 className="mt-1 text-2xl font-bold">
          Talk to your AI Delivery Architect
        </h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ minHeight: 0 }}>
        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-neutral-400">
              <div className="flex gap-1">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-100">●</span>
                <span className="animate-pulse delay-200">●</span>
              </div>
              <span className="text-sm">Loading chat history...</span>
            </div>
          </div>
        ) : null}

        {messages.map((message, index) => {
          const messageId = `${message.role}-${index}-${message.content.length}`;

          return (
          <div
            key={messageId}
            className={`${
              message.role === "user"
                ? "ml-auto max-w-[85%] border border-blue-400/35 bg-[linear-gradient(180deg,rgba(43,112,255,0.98),rgba(25,84,214,0.95))] px-5 py-4 text-white shadow-[0_12px_30px_rgba(19,59,149,0.28)]"
                : "max-w-[88%] border border-white/8 bg-[linear-gradient(180deg,rgba(19,24,33,0.96),rgba(10,13,18,0.98))] px-5 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.28)]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p
                className={`font-mono text-[11px] uppercase tracking-[0.22em] ${
                  message.role === "user" ? "text-blue-100/90" : "text-blue-300"
                }`}
              >
                {message.role === "user" ? "Human Lead" : "ADA"}
              </p>
              <button
                type="button"
                onClick={() => handleCopyMessage(messageId, message.content)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                  message.role === "user"
                    ? "border-white/18 bg-white/8 text-blue-50 hover:border-white/35 hover:bg-white/14"
                    : "border-white/10 bg-black/25 text-neutral-300 hover:border-blue-400/45 hover:bg-white/5 hover:text-blue-200"
                }`}
                aria-label={`Copy ${message.role === "user" ? "Human Lead" : "ADA"} message`}
              >
                <CopyIcon />
                {copiedMessageId === messageId ? "Copied" : "Copy"}
              </button>
            </div>
            <div
              className={`mt-3 ${
                message.role === "user"
                  ? "text-[15px] leading-7 text-white"
                  : "text-[15px] leading-7 text-neutral-200"
              }`}
            >
              {renderMessageContent(
                message.content
              )}
            </div>
          </div>
        )})}

        {isLoading && (
          <div className="max-w-[88%] border border-white/8 bg-[linear-gradient(180deg,rgba(19,24,33,0.96),rgba(10,13,18,0.98))] px-5 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.28)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-blue-300">
              ADA
            </p>
            <div className="mt-3 flex items-center gap-2 text-[15px] leading-7 text-neutral-300">
              <div className="flex gap-1">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse delay-100">●</span>
                <span className="animate-pulse delay-200">●</span>
              </div>
              <span>ADA is reviewing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 border-t border-neutral-800 bg-neutral-950 p-5">
        {error && (
          <div className="mb-4 border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
            <strong className="font-semibold">Error:</strong> {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
              className="border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-300 transition-colors hover:border-blue-500 hover:bg-neutral-800 hover:text-blue-300 disabled:opacity-50 disabled:hover:border-neutral-700 disabled:hover:bg-neutral-900 disabled:hover:text-neutral-300"
            >
              {action}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="min-h-24 flex-1 resize-none border border-neutral-700 bg-black p-4 text-sm text-neutral-100 outline-none transition-colors focus:border-blue-500 disabled:opacity-50"
            placeholder="Ask ADA to structure a mission, generate a Bob prompt, review builder output, prepare QA, or record release evidence..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="border border-blue-500 bg-blue-600 px-5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            Send
          </button>
        </form>
        <p className="mt-2 text-xs text-neutral-500">
          Press{" "}
          <kbd className="rounded border border-neutral-700 bg-neutral-800 px-1">
            ⌘
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-neutral-700 bg-neutral-800 px-1">
            Enter
          </kbd>{" "}
          to send
        </p>
      </div>
    </section>
  );
}
