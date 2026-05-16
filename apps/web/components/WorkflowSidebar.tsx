"use client";

import { useState } from "react";

interface Workspace {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowSidebarProps {
  workspaces: Workspace[];
  selectedWorkspaceId: string | null;
  defaultWorkspaceId: string;
  isLoadingWorkspaces: boolean;
  onWorkspaceSelect: (workspaceId: string) => void;
  onWorkspaceCreated: (workspace: Workspace) => void;
  onWorkspaceDelete: (workspace: Workspace) => Promise<string | null>;
}

const workflowSteps = [
  "Mission Intake",
  "Planning Gate",
  "Spec Builder",
  "Bob Mission Generator",
  "QA Gate",
  "Delivery Report",
  "Release Gate",
];

export function WorkflowSidebar({
  workspaces,
  selectedWorkspaceId,
  defaultWorkspaceId,
  isLoadingWorkspaces,
  onWorkspaceSelect,
  onWorkspaceCreated,
  onWorkspaceDelete,
}: WorkflowSidebarProps) {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [workspacePendingDelete, setWorkspacePendingDelete] =
    useState<Workspace | null>(null);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCreateProject = async () => {
    const trimmedName = newProjectName.trim();
    if (!trimmedName) {
      setCreateError("Project name is required");
      return;
    }

    try {
      setCreateError(null);
      const response = await fetch("/api/ada/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const data = await response.json();
      onWorkspaceCreated(data.workspace);
      setNewProjectName("");
      setIsCreatingProject(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setCreateError(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (!workspacePendingDelete) {
      return;
    }

    setIsDeletingWorkspace(true);
    setDeleteError(null);

    const errorMessage = await onWorkspaceDelete(workspacePendingDelete);

    if (errorMessage) {
      setDeleteError(errorMessage);
      setIsDeletingWorkspace(false);
      return;
    }

    setWorkspacePendingDelete(null);
    setIsDeletingWorkspace(false);
  };

  return (
    <aside className="flex h-[calc(100vh-200px)] max-h-[800px] min-h-[600px] flex-col space-y-4 overflow-y-auto border border-neutral-800 bg-neutral-900 p-4">
      {/* Projects Section */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
            Projects
          </p>
          {!isCreatingProject && (
            <button
              onClick={() => setIsCreatingProject(true)}
              className="border border-blue-500 bg-blue-500/10 px-2 py-1 font-mono text-xs text-blue-300 transition-colors hover:bg-blue-500/20"
            >
              + New
            </button>
          )}
        </div>

        {isCreatingProject && (
          <div className="mt-3 border border-neutral-700 bg-neutral-950 p-3">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name..."
              className="w-full border border-neutral-700 bg-black px-2 py-1 text-sm text-neutral-100 outline-none focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateProject();
                } else if (e.key === "Escape") {
                  setIsCreatingProject(false);
                  setNewProjectName("");
                  setCreateError(null);
                }
              }}
              autoFocus
            />
            {createError && (
              <p className="mt-2 text-xs text-red-400">{createError}</p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleCreateProject}
                className="flex-1 border border-blue-500 bg-blue-600 px-2 py-1 font-mono text-xs text-white transition-colors hover:bg-blue-500"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingProject(false);
                  setNewProjectName("");
                  setCreateError(null);
                }}
                className="flex-1 border border-neutral-700 bg-neutral-800 px-2 py-1 font-mono text-xs text-neutral-300 transition-colors hover:bg-neutral-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {isLoadingWorkspaces ? (
            <div className="border border-neutral-700 bg-neutral-950 p-3 text-center text-xs text-neutral-500">
              Loading projects...
            </div>
          ) : workspaces.length === 0 ? (
            <div className="border border-neutral-700 bg-neutral-950 p-3 text-center text-xs text-neutral-500">
              No projects yet
            </div>
          ) : (
            workspaces.map((workspace) => {
              const isActive = workspace.id === selectedWorkspaceId;
              const isDefaultWorkspace = workspace.id === defaultWorkspaceId;
              return (
                <div
                  key={workspace.id}
                  onClick={() => onWorkspaceSelect(workspace.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onWorkspaceSelect(workspace.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`w-full text-left transition-colors ${
                    isActive
                      ? "border-l-4 border-blue-500 bg-neutral-950"
                      : "border-l-4 border-transparent bg-neutral-950 hover:border-neutral-600"
                  } p-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate pr-2 text-sm font-semibold">
                      {workspace.name}
                    </span>
                    <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                      {isActive && (
                        <span className="font-mono text-xs text-green-400">ACTIVE</span>
                      )}
                      {!isDefaultWorkspace ? (
                        <button
                          type="button"
                          aria-label={`Delete project ${workspace.name}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteError(null);
                            setWorkspacePendingDelete(workspace);
                          }}
                          className="flex h-6 w-6 items-center justify-center border border-neutral-700 bg-black font-mono text-xs text-neutral-500 transition-colors hover:border-red-500 hover:text-red-400"
                        >
                          X
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(workspace.updated_at).toLocaleDateString()}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="flex-shrink-0">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
          Workflow
        </p>
        <div className="mt-4 space-y-2">
          {workflowSteps.map((step, index) => (
            <div
              key={step}
              className="border border-neutral-800 bg-neutral-950 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-blue-500 bg-blue-500/10 font-mono text-xs text-blue-300">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold">{step}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Doctrine */}
      <div className="flex-shrink-0 border border-neutral-800 bg-black p-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-400">
          Doctrine
        </p>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          No blind coding. No scope creep. No release without QA, evidence, and
          human approval.
        </p>
      </div>

      {workspacePendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm border border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-red-400">
              Delete Project
            </p>
            <p className="mt-4 text-sm leading-6 text-neutral-300">
              Do you really want to delete project{" "}
              <span className="font-semibold text-white">
                {workspacePendingDelete.name}
              </span>
              ?
            </p>
            {deleteError ? (
              <p className="mt-3 text-xs text-red-400">{deleteError}</p>
            ) : null}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isDeletingWorkspace) {
                    return;
                  }

                  setWorkspacePendingDelete(null);
                  setDeleteError(null);
                }}
                className="flex-1 border border-neutral-700 bg-neutral-900 px-3 py-2 font-mono text-xs text-neutral-300 transition-colors hover:bg-neutral-800"
              >
                No, cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingWorkspace}
                className="flex-1 border border-red-500 bg-red-600 px-3 py-2 font-mono text-xs text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {isDeletingWorkspace ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

// Made with Bob
