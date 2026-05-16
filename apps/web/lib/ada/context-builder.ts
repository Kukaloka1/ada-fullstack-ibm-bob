/**
 * ADA Context Builder
 * 
 * Builds compact workspace context for ADA LLM requests.
 * Assembles memory, missions, messages, and artifacts into a structured format.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Message } from './types';
import { buildWorkspaceContext } from './memory';
import { buildSystemMessage } from './prompts';

/**
 * Workspace context for LLM requests
 */
export interface WorkspaceContext {
  systemMessage: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  metadata: {
    workspaceId: string;
    workspaceName: string;
    hasActiveMission: boolean;
    activeMissionTitle?: string;
    messageCount: number;
  };
}

/**
 * Build complete context for ADA LLM request
 * 
 * This function:
 * 1. Loads workspace memory, missions, messages, and artifacts
 * 2. Builds a context-aware system message
 * 3. Formats recent conversation history
 * 4. Returns structured context ready for LLM API call
 */
export async function buildAdaContext(
  client: SupabaseClient<Database>,
  workspaceId: string
): Promise<WorkspaceContext> {
  // Load all workspace context
  const context = await buildWorkspaceContext(client, workspaceId);

  // Extract memory summary
  const memorySummary = context.memory?.summary || undefined;

  // Extract active mission details
  const activeMissionTitle = context.activeMission?.title;
  const activeMissionObjective = context.activeMission?.objective || undefined;

  // Extract recent decisions from memory
  let recentDecisions: string[] | undefined;
  if (
    context.memory?.decisions &&
    typeof context.memory.decisions === 'object' &&
    'decisions' in context.memory.decisions &&
    Array.isArray(context.memory.decisions.decisions)
  ) {
    recentDecisions = context.memory.decisions.decisions
      .slice(-3)
      .map((d) => {
        if (typeof d === 'object' && d !== null && 'decision' in d) {
          return String(d.decision);
        }
        return '';
      })
      .filter((d) => d !== '');
  }

  // Extract constraints from memory
  let constraints: string[] | undefined;
  if (
    context.memory?.constraints &&
    typeof context.memory.constraints === 'object' &&
    'constraints' in context.memory.constraints &&
    Array.isArray(context.memory.constraints.constraints)
  ) {
    constraints = context.memory.constraints.constraints
      .map((c) => (typeof c === 'string' ? c : ''))
      .filter((c) => c !== '');
  }

  // Build system message with context
  const systemMessage = buildSystemMessage({
    workspaceName: context.workspace.name,
    memorySummary,
    activeMissionTitle,
    activeMissionObjective,
    recentDecisions,
    constraints,
  });

  // Format conversation history
  // Convert ADA message roles to OpenAI format
  const conversationHistory = context.recentMessages.map((msg: Message) => ({
    role: msg.role === 'ada' ? ('assistant' as const) : (msg.role as 'user' | 'system'),
    content: msg.content,
  }));

  return {
    systemMessage,
    conversationHistory,
    metadata: {
      workspaceId,
      workspaceName: context.workspace.name,
      hasActiveMission: !!context.activeMission,
      activeMissionTitle: context.activeMission?.title,
      messageCount: context.recentMessages.length,
    },
  };
}

/**
 * Format context for debugging or logging
 */
export function formatContextSummary(context: WorkspaceContext): string {
  const parts: string[] = [];

  parts.push(`Workspace: ${context.metadata.workspaceName}`);
  parts.push(`Messages: ${context.metadata.messageCount}`);

  if (context.metadata.hasActiveMission) {
    parts.push(`Active Mission: ${context.metadata.activeMissionTitle}`);
  }

  parts.push(`System Message Length: ${context.systemMessage.length} chars`);
  parts.push(`Conversation History: ${context.conversationHistory.length} messages`);

  return parts.join('\n');
}
