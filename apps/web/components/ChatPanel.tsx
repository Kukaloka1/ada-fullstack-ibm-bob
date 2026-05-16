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

// Quick action templates for better UX
const quickActionTemplates: Record<string, string> = {
  "Turn this into a Bob mission": "Turn the following into a structured Bob mission:\n\n",
  "Generate Bob-ready prompt": "Generate a complete Bob-ready mission prompt for:\n\n",
  "Review Bob output": "Review the following Bob implementation output:\n\n",
  "Find scope creep": "Analyze the following for scope creep:\n\n",
  "Prepare QA verdict": "Prepare a QA verdict (PASS/CONDITIONAL PASS/FAIL) for:\n\n",
  "Create commit message": "Create a commit message for:\n\n",
  "Prepare push handoff": "Prepare push handoff documentation for:\n\n",
  "Generate delivery report": "Generate a delivery report for the current mission state.",
};

// Strip assistant preamble from Bob prompts
const stripAssistantPreamble = (content: string): string => {
  // Remove common assistant preambles in multiple languages
  const preamblePatterns = [
    /^(Here is|Here's|Aquí tienes|Aquí está|I prepared|I've prepared|I have prepared|I created|I've created)[^\n]*\n+/i,
    /^(Below is|The following is)[^\n]*\n+/i,
  ];

  let cleaned = content;
  for (const pattern of preamblePatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  return cleaned.trim();
};

export function ChatPanel({ workspaceId, onBobPromptDetected, onMessagesLoaded }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load persisted messages on mount and when workspace changes
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
          // Convert database messages to UI format
          const loadedMessages: Message[] = (data.messages as Array<{ role: string; content: string }>).map((msg) => ({
            role: msg.role === "system" ? "ada" : (msg.role as "user" | "ada"),
            content: msg.content,
          }));
          setMessages(loadedMessages);
          onMessagesLoaded?.(loadedMessages.length);
        } else {
          // No history - show default intro
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
        // Fall back to default intro on error
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]); // Only depend on workspaceId, not callbacks or state

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isLoadingHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoadingHistory]);

  const detectBobPrompt = (content: string): string | null => {
    // Enhanced Bob prompt detection with more signals
    const bobIndicators = [
      /Mission:/i,
      /Objective:/i,
      /Goal:/i,
      /Constraints:/i,
      /Acceptance Criteria:/i,
      /Required work:/i,
      /Validation:/i,
      /Suggested commit message:/i,
      /Before changing files:/i,
      /After implementation:/i,
      /Confirm alignment/i,
      /Bob-ready/i,
    ];

    const hasMultipleIndicators = bobIndicators.filter((pattern) =>
      pattern.test(content)
    ).length >= 3;

    // Must be substantial content
    if (hasMultipleIndicators && content.length > 300) {
      return content;
    }

    return null;
  };

  const sendMessage = async (messageText: string) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Add user message to UI immediately
    const userMessage: Message = { role: "user", content: trimmedMessage };
    setMessages((prev) => [...prev, userMessage]);
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

      // Check if response contains a Bob prompt
      const bobPrompt = detectBobPrompt(data.message);
      if (bobPrompt && onBobPromptDetected) {
        // Strip assistant preamble before sending to preview
        const cleanedPrompt = stripAssistantPreamble(bobPrompt);
        onBobPromptDetected(cleanedPrompt);
        // Show a shorter confirmation in chat
        setMessages((prev) => [
          ...prev,
          {
            role: "ada",
            content:
              "✓ Bob-ready mission prompt prepared. Review it in the **Bob Prompt Preview** panel on the right.",
          },
        ]);
      } else {
        const adaMessage: Message = { role: "ada", content: data.message };
        setMessages((prev) => [...prev, adaMessage]);
      }
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
    // Populate textarea with template
    const template = quickActionTemplates[action] || action;
    setInput(template);
  };

  // Render formatted message content
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
        default:
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

      {/* Scrollable conversation area with fixed height */}
      <div
        ref={scrollContainerRef}
        className="flex-1 space-y-4 overflow-y-auto p-5"
        style={{ minHeight: 0 }}
      >
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
              {renderMessageContent(message.content)}
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

      {/* Input area - anchored at bottom */}
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
          Press <kbd className="rounded border border-neutral-700 bg-neutral-800 px-1">⌘</kbd> + <kbd className="rounded border border-neutral-700 bg-neutral-800 px-1">Enter</kbd> to send
        </p>
      </div>
    </section>
  );
}

