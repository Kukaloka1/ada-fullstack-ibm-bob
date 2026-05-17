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
  currentMissionTitle?: string;
  onRequestCloseMissionModal?: () => void;
  onBobPromptDetected?: (prompt: string) => void;
  onMessagesLoaded?: (messageCount: number) => void;
  onAdaMessageGenerated?: (message: string) => void;
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

const isSpanishInput = (input: string) =>
  /(cerrar|cierra|mision|si|seguir|sigue|continuar)/i.test(input);

const isCloseMissionRequest = (input: string): boolean => {
  const normalized = normalizeIntentInput(input);
  const patterns = [
    /^close the mission$/,
    /^close current mission$/,
    /^close this mission$/,
    /^close mission$/,
    /^cerrar la mision$/,
    /^cierra la mision$/,
    /^cierra esta mision$/,
    /^cerrar mision$/,
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
    /give me .*bob.*prompt/,
    /give me .*prompt.*bob/,
    /dame .*prompt.*bob/,
    /dame .*prompt.*para.*bob/,
    /generate .*bob[- ]ready.*prompt/,
    /generate .*bob.*prompt/,
    /turn this into .*bob.*mission/,
    /convert this into .*bob.*mission/,
    /prompt .*bob/,
    /bob.*mission.*prompt/,
    /create .*bob.*prompt/,
    /prepare .*bob.*prompt/,
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

  if (
    promptStartIndex !== null &&
    content.length > 300 &&
    (content.includes("Bob-ready mission prompt prepared") ||
      /Prompt para Bob/i.test(content) ||
      /Mission Title:/i.test(content))
  ) {
    return cleanBobPromptForPreview(content.slice(promptStartIndex));
  }

  const strictCount = countBobPromptStructureMarkers(content);
  if (strictCount >= 7 && content.length > 500) {
    return cleanBobPromptForPreview(content);
  }

  const hasPromptHeading =
    /Prompt para Bob/i.test(content) || /Bob[-\s]Ready Mission Prompt/i.test(content);

  const alternateCount = BOB_PROMPT_STRUCTURE_PATTERNS.filter((pattern) =>
    pattern.test(content)
  ).length;

  if (hasPromptHeading && alternateCount >= 6 && content.length > 500) {
    return cleanBobPromptForPreview(content);
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

export function ChatPanel({
  workspaceId,
  hasActiveMission,
  currentMissionTitle,
  onRequestCloseMissionModal,
  onBobPromptDetected,
  onMessagesLoaded,
  onAdaMessageGenerated,
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
            content: isSpanishInput(trimmedMessage)
              ? "ADA está lista para cerrar esta misión. Confirma la acción en el modal."
              : "ADA is ready to close this mission. Confirm the action in the modal.",
          },
        ]);
        setInput("");
        onRequestCloseMissionModal?.();
        return;
      }

      if (isPendingCloseContinueReply(trimmedMessage)) {
        hasPendingCloseMissionDecisionRef.current = false;
        appendLocalMessages([
          { role: "user", content: trimmedMessage },
          {
            role: "ada",
            content: isSpanishInput(trimmedMessage)
              ? "Entendido. Seguimos trabajando dentro de la misión activa."
              : "Understood. We will continue working inside the current active mission.",
          },
        ]);
        setInput("");
        return;
      }
    }

    if (isCloseMissionRequest(trimmedMessage)) {
      hasPendingCloseMissionDecisionRef.current = false;

      if (hasActiveMission) {
        appendLocalMessages([
          { role: "user", content: trimmedMessage },
          {
            role: "ada",
            content: isSpanishInput(trimmedMessage)
              ? "ADA está lista para cerrar esta misión. Confirma la acción en el modal."
              : "ADA is ready to close this mission. Confirm the action in the modal.",
          },
        ]);
        setInput("");
        onRequestCloseMissionModal?.();
        return;
      }

      appendLocalMessages([
        { role: "user", content: trimmedMessage },
        {
          role: "ada",
          content: isSpanishInput(trimmedMessage)
            ? "No hay una misión activa para cerrar."
            : "There is no active mission to close.",
        },
      ]);
      setInput("");
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
      onAdaMessageGenerated?.(data.message);

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

      void sendMessage(quickActionTemplates[action] || action);
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
        case "code":
          return (
            <pre
              key={blockIndex}
              className="mt-3 overflow-x-auto border border-neutral-700 bg-black p-3 font-mono text-xs leading-relaxed text-blue-200"
            >
              {block.content}
            </pre>
          );

        case "list":
          return (
            <ul key={blockIndex} className="mt-2 space-y-1 pl-4">
              {block.items?.map((item, itemIndex) => {
                const inlineParts = formatInlineText(item);
                return (
                  <li key={itemIndex} className="flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>
                      {inlineParts.map((part, partIndex) =>
                        part.bold ? (
                          <strong key={partIndex} className="font-semibold text-white">
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
          const inlineParts = formatInlineText(block.content);
          return (
            <p key={blockIndex} className="mt-2 first:mt-0">
              {inlineParts.map((part, partIndex) =>
                part.bold ? (
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
                ? "ml-auto max-w-[85%] border border-blue-500 bg-blue-600/90"
                : "max-w-[85%] border border-neutral-700 bg-neutral-950"
            } p-4`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-100">
                {message.role === "user" ? "Human Lead" : "ADA"}
              </p>
              <button
                type="button"
                onClick={() => handleCopyMessage(messageId, message.content)}
                className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                  message.role === "user"
                    ? "border-blue-200/40 bg-blue-700/40 text-blue-100 hover:border-white/60 hover:bg-blue-700/60"
                    : "border-neutral-700 bg-black text-neutral-300 hover:border-blue-500 hover:text-blue-300"
                }`}
                aria-label={`Copy ${message.role === "user" ? "Human Lead" : "ADA"} message`}
              >
                <CopyIcon />
                {copiedMessageId === messageId ? "Copied" : "Copy"}
              </button>
            </div>
            <div
              className={`mt-2 text-sm leading-relaxed ${
                message.role === "user" ? "text-white" : "text-neutral-300"
              }`}
            >
              {renderMessageContent(
                message.content
              )}
            </div>
          </div>
        )})}

        {isLoading && (
          <div className="max-w-[85%] border border-neutral-700 bg-neutral-950 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
              ADA
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm leading-relaxed text-neutral-300">
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
