"use client";

import { useState, useRef, useEffect } from "react";
import { parseMessageContent, formatInlineText } from "@/lib/ada/format-message";

interface Message {
  role: "user" | "ada";
  content: string;
}

interface ChatPanelProps {
  workspaceId: string;
  onBobPromptDetected?: (prompt: string) => void;
  onMessagesLoaded?: (messageCount: number) => void;
}

const BOB_PROMPT_CONFIRMATION =
  "✓ Bob-ready mission prompt prepared. Review it in the **Bob Prompt Preview** panel on the right.";

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

const quickActionTemplates: Record<string, string> = {
  "Turn this into a Bob mission":
    "Turn the following into a structured Bob mission:\n\n",
  "Generate Bob-ready prompt":
    "Generate a clean Bob-ready mission prompt. Do not include conversational preamble. Include mission, context, goal, scope, non-goals, constraints, required work, acceptance criteria, validation commands, Bob output requirements, and evidence requirements.\n\n",
  "Review Bob output":
    "Review this Bob output using ADA QA Gate. Do not trust the summary blindly. Ask for repo diff/status/validation if missing. Return PASS, CONDITIONAL PASS, or FAIL.\n\n",
  "Find scope creep": "Analyze the following for scope creep:\n\n",
  "Prepare QA verdict":
    "Prepare a QA verdict (PASS/CONDITIONAL PASS/FAIL) for:\n\n",
  "Create commit message":
    "Create a commit message from the provided actual changes. If changed files or validation are missing, say what is missing.\n\n",
  "Prepare push handoff": "Prepare push handoff documentation for:\n\n",
  "Generate delivery report":
    "Generate a delivery report for the current mission state. Do not claim execution unless changed files, validation, and evidence are available.",
};

const findBobPromptStartIndex = (content: string): number | null => {
  const markers = [
    /Mission Title:/i,
    /##+\s*Prompt para Bob/i,
    /Prompt para Bob/i,
    /Bob[-\s]Ready Mission Prompt/i,
    /Mission:/i,
    /Objective:/i,
    /Objetivo de la misión:/i,
  ];

  const indexes = markers
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

const detectBobPromptContent = (content: string): string | null => {
  const promptStartIndex = findBobPromptStartIndex(content);

  if (
    promptStartIndex !== null &&
    content.length > 300 &&
    (content.includes("Bob-ready mission prompt prepared") ||
      /Prompt para Bob/i.test(content) ||
      /Mission Title:/i.test(content))
  ) {
    return content.slice(promptStartIndex);
  }

  const strictMarkers = [
    /Mission Title:/i,
    /Context:/i,
    /Required work:/i,
    /Required Bob output:/i,
    /Evidence requirement:/i,
    /Confirm alignment|Alignment confirmation:/i,
  ];

  const strictCount = strictMarkers.filter((pattern) => pattern.test(content)).length;
  if (strictCount >= 5 && content.length > 500) {
    return content;
  }

  const hasPromptHeading =
    /Prompt para Bob/i.test(content) || /Bob[-\s]Ready Mission Prompt/i.test(content);

  const alternateMarkers = [
    /Mission:/i,
    /Objective:|Objetivo de la misión:/i,
    /Scope:|Alcance/i,
    /Deliverables:|Entregables/i,
    /Validation\s+(required|commands):|Validación requerida:/i,
    /Output\s+format:/i,
    /Acceptance\s+criteria:|Criterio de aceptación:/i,
    /Non-goals:|Fuera de alcance:/i,
    /Constraints:|Restricciones:/i,
  ];

  const alternateCount = alternateMarkers.filter((pattern) =>
    pattern.test(content)
  ).length;

  if (hasPromptHeading && alternateCount >= 4 && content.length > 500) {
    return content;
  }

  return null;
};

const normalizeAdaMessageForDisplay = (
  content: string
): { displayContent: string; bobPrompt: string | null } => {
  const bobPrompt = detectBobPromptContent(content);

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
  onBobPromptDetected,
  onMessagesLoaded,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const sendMessage = async (messageText: string) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isLoading) return;

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

      if (shouldRouteToBobPreview) {
        const cleanedPrompt = cleanBobPromptForPreview(data.message);
        onBobPromptDetected?.(cleanedPrompt);

        setMessages((prev) => [
          ...prev,
          {
            role: "ada",
            content: BOB_PROMPT_CONFIRMATION,
          },
        ]);
        return;
      }

      const normalized = normalizeAdaMessageForDisplay(data.message);

      if (normalized.bobPrompt) {
        onBobPromptDetected?.(normalized.bobPrompt);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ada",
          content: normalized.displayContent,
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
    setInput(quickActionTemplates[action] || action);
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

        {messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.role === "user"
                ? "ml-auto max-w-[85%] border border-blue-500 bg-blue-600/90"
                : "max-w-[85%] border border-neutral-700 bg-neutral-950"
            } p-4`}
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-100">
              {message.role === "user" ? "Human Lead" : "ADA"}
            </p>
            <div
              className={`mt-2 text-sm leading-relaxed ${
                message.role === "user" ? "text-white" : "text-neutral-300"
              }`}
            >
              {renderMessageContent(
                message.role === "ada"
                  ? normalizeAdaMessageForDisplay(message.content).displayContent
                  : message.content
              )}
            </div>
          </div>
        ))}

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
            placeholder="Ask ADA to structure a mission, generate a Bob prompt, review Bob output, prepare correction prompts, or export delivery evidence..."
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
