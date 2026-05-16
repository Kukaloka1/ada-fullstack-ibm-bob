"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "ada";
  content: string;
}

interface ChatPanelProps {
  workspaceId: string;
  onBobPromptDetected?: (prompt: string) => void;
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

export function ChatPanel({ workspaceId, onBobPromptDetected }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ada",
      content:
        "Give me product intent, Bob output, diffs, or implementation notes. I will structure the mission, generate Bob prompts, review delivery quality, and prepare release evidence.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const detectBobPrompt = (content: string): string | null => {
    // Detect if content looks like a Bob mission prompt
    const bobIndicators = [
      /Mission:/i,
      /Objective:/i,
      /Constraints:/i,
      /Acceptance Criteria:/i,
      /Bob-ready/i,
      /Implementation:/i,
    ];

    const hasMultipleIndicators = bobIndicators.filter((pattern) =>
      pattern.test(content)
    ).length >= 2;

    if (hasMultipleIndicators && content.length > 200) {
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
      const adaMessage: Message = { role: "ada", content: data.message };

      // Check if response contains a Bob prompt
      const bobPrompt = detectBobPrompt(data.message);
      if (bobPrompt && onBobPromptDetected) {
        onBobPromptDetected(bobPrompt);
        // Show a shorter confirmation in chat
        setMessages((prev) => [
          ...prev,
          {
            role: "ada",
            content:
              "I prepared a Bob-ready mission prompt. Review it in the Bob Prompt Preview panel.",
          },
        ]);
      } else {
        setMessages((prev) => [...prev, adaMessage]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "ada",
          content: `Error: ${errorMessage}. Please try again.`,
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
    // For quick actions, either populate textarea or send directly
    // For now, populate textarea so user can see and modify
    setInput(action);
  };

  return (
    <section className="flex min-h-[720px] flex-col border border-neutral-800 bg-neutral-900">
      <div className="border-b border-neutral-800 bg-black px-5 py-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
          ADA Chat
        </p>
        <h2 className="mt-1 text-2xl font-bold">
          Talk to your AI Delivery Architect
        </h2>
      </div>

      {/* Scrollable conversation area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 space-y-4 overflow-y-auto p-5"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.role === "user"
                ? "ml-auto max-w-[82%] border border-blue-500 bg-blue-600"
                : "max-w-[82%] border border-neutral-700 bg-neutral-950"
            } p-4`}
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-100">
              {message.role === "user" ? "Human Lead" : "ADA"}
            </p>
            <p
              className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${
                message.role === "user" ? "text-white" : "text-neutral-300"
              }`}
            >
              {message.content}
            </p>
          </div>
        ))}

        {isLoading && (
          <div className="max-w-[82%] border border-neutral-700 bg-neutral-950 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
              ADA
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-300">
              Thinking...
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-neutral-800 bg-neutral-950 p-5">
        {error && (
          <div className="mb-4 border border-red-500 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
              className="border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-300 hover:border-blue-500 hover:text-blue-300 disabled:opacity-50"
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
            className="min-h-24 flex-1 resize-none border border-neutral-700 bg-black p-4 text-sm text-neutral-100 outline-none focus:border-blue-500 disabled:opacity-50"
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
            className="border border-blue-500 bg-blue-600 px-5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}

// Made with Bob
