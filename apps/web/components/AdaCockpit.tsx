"use client";

import { useState, useEffect } from "react";
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

// MVP workspace ID - no auth for hackathon
const MVP_WORKSPACE_ID = "00000000-0000-4000-8000-000000000001";
const SELECTED_WORKSPACE_KEY = "ada_selected_workspace_id";

const defaultBobPrompt = `Inspect repository context.

Mission:
Implement ADA QA Gate.

Constraints:
- Next.js App Router
- TypeScript
- Tailwind
- No unrelated changes
- Provide changed files
- Provide validation evidence`;

const defaultReadinessItems: Array<[string, boolean]> = [
  ["Mission structured", false],
  ["Planning gate created", false],
  ["Bob prompt ready", false],
  ["QA review complete", false],
  ["Evidence exported", false],
];

export function AdaCockpit() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(MVP_WORKSPACE_ID);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);

  const [currentMission] = useState({
    title: "ADA Hackathon MVP",
    description:
      "Chat-first delivery control cockpit connected to ADA memory, Bob prompt preview, readiness checklist, and release gate workflow.",
  });

  const [bobPrompt, setBobPrompt] = useState(defaultBobPrompt);
  const [readinessItems, setReadinessItems] = useState(defaultReadinessItems);
  const [releaseGateStatus] = useState<"PENDING" | "PASS" | "CONDITIONAL_PASS" | "FAIL">("PENDING");

  // Load workspaces on mount
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        setIsLoadingWorkspaces(true);
        const response = await fetch("/api/ada/workspaces");
        
        if (!response.ok) {
          throw new Error("Failed to load workspaces");
        }

        const data = await response.json();
        setWorkspaces(data.workspaces || []);

        // Load saved workspace from localStorage
        const savedWorkspaceId = localStorage.getItem(SELECTED_WORKSPACE_KEY);
        
        if (savedWorkspaceId && data.workspaces?.some((w: Workspace) => w.id === savedWorkspaceId)) {
          setSelectedWorkspaceId(savedWorkspaceId);
        } else {
          // Default to MVP workspace
          setSelectedWorkspaceId(MVP_WORKSPACE_ID);
          localStorage.setItem(SELECTED_WORKSPACE_KEY, MVP_WORKSPACE_ID);
        }
      } catch (err) {
        console.error("Error loading workspaces:", err);
        // Fall back to MVP workspace
        setSelectedWorkspaceId(MVP_WORKSPACE_ID);
        localStorage.setItem(SELECTED_WORKSPACE_KEY, MVP_WORKSPACE_ID);
      } finally {
        setIsLoadingWorkspaces(false);
      }
    };

    loadWorkspaces();
  }, []);

  const handleWorkspaceSelect = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    localStorage.setItem(SELECTED_WORKSPACE_KEY, workspaceId);
  };

  const handleWorkspaceCreated = (workspace: Workspace) => {
    setWorkspaces((prev) => [workspace, ...prev]);
    setSelectedWorkspaceId(workspace.id);
    localStorage.setItem(SELECTED_WORKSPACE_KEY, workspace.id);
  };

  const handleMessagesLoaded = (count: number) => {
    // If messages exist, mark mission as structured
    if (count > 0) {
      setReadinessItems((prev) =>
        prev.map(([label, status]) =>
          label === "Mission structured" ? [label, true] : [label, status]
        )
      );
    }
  };

  const handleBobPromptDetected = (prompt: string) => {
    setBobPrompt(prompt);
    // Update readiness when Bob prompt is generated
    setReadinessItems((prev) =>
      prev.map(([label, status]) =>
        label === "Bob prompt ready" ? [label, true] : [label, status]
      )
    );
  };

  const handleExportMarkdown = async () => {
    // Fetch recent chat messages for export
    let chatHistory = "";
    try {
      const response = await fetch(`/api/ada/messages?workspaceId=${selectedWorkspaceId}&limit=20`);
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

    // Generate enhanced markdown export of current delivery state
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
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

${chatHistory || '_No chat history available._'}

---

## Bob Prompt Preview

${bobPrompt && !bobPrompt.includes("Inspect repository") ? `\`\`\`
${bobPrompt}
\`\`\`` : '_No Bob prompt generated yet._'}

---

## Readiness Checklist

${readinessItems
  .map(([label, status]) => `- [${status ? "x" : " "}] ${label}`)
  .join("\n")}

---

## Release Gate Status

**Current Status:** ${releaseGateStatus}

**Release Policy:**
Commit and push only after:
- QA acceptance (PASS or CONDITIONAL PASS)
- Evidence export complete
- Human lead approval

---

## Notes

This report captures the current state of the ADA delivery workflow.
Review all sections before proceeding to commit/push.

---

*Generated by ADA — AI Delivery Architect*
*IBM Bob Hackathon MVP*
`;

    // Create and download markdown file
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `ada-delivery-report-${currentMission.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Update readiness
    setReadinessItems((prev) =>
      prev.map(([label, status]) =>
        label === "Evidence exported" ? [label, true] : [label, status]
      )
    );
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-950/95 px-6 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-blue-400">
              IBM Bob Workflow Companion
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
              ADA — AI Delivery Architect
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-neutral-400">
              Bob builds. Ada orchestrates and reviews. You lead.
            </p>
          </div>
          <div className="hidden border border-blue-500 bg-blue-500/10 px-4 py-3 font-mono text-xs uppercase tracking-[0.2em] text-blue-300 md:block">
            Two AIs are better than one
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-6 lg:grid-cols-[260px_1fr_360px]">
        <WorkflowSidebar
          workspaces={workspaces}
          selectedWorkspaceId={selectedWorkspaceId}
          isLoadingWorkspaces={isLoadingWorkspaces}
          onWorkspaceSelect={handleWorkspaceSelect}
          onWorkspaceCreated={handleWorkspaceCreated}
        />

        <ChatPanel
          workspaceId={selectedWorkspaceId}
          onBobPromptDetected={handleBobPromptDetected}
          onMessagesLoaded={handleMessagesLoaded}
        />

        <ContextPanel
          currentMission={currentMission}
          bobPrompt={bobPrompt}
          readinessItems={readinessItems}
          releaseGateStatus={releaseGateStatus}
          onExportMarkdown={handleExportMarkdown}
        />
      </section>
    </main>
  );
}

