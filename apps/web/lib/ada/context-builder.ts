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

type DeliveryStatus = 'PENDING' | 'PASS' | 'CONDITIONAL_PASS' | 'FAIL';

const parseDeliveryStatus = (value: unknown): DeliveryStatus | null => {
  if (
    value === 'PENDING' ||
    value === 'PASS' ||
    value === 'CONDITIONAL_PASS' ||
    value === 'FAIL'
  ) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.toUpperCase();

  if (normalizedValue.includes('CONDITIONAL PASS')) {
    return 'CONDITIONAL_PASS';
  }

  if (normalizedValue.includes('FAIL')) {
    return 'FAIL';
  }

  if (normalizedValue.includes('PASS')) {
    return 'PASS';
  }

  if (normalizedValue.includes('PENDING')) {
    return 'PENDING';
  }

  return null;
};

const deriveArtifactStatusFromContent = (content: string): DeliveryStatus =>
  parseDeliveryStatus(content) || 'PENDING';

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
    latestQaStatus: DeliveryStatus;
    evidenceExported: boolean;
    latestReleaseGateStatus: DeliveryStatus;
    releaseGateRecorded: boolean;
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
  const activeMissionStatus = context.activeMission?.status || undefined;
  const latestClosedMissionTitle = context.latestClosedMission?.title || undefined;
  const latestClosedMissionStatus = context.latestClosedMission?.status || undefined;

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

  let pendingItems: string[] | undefined;
  if (
    context.memory?.pending_items &&
    typeof context.memory.pending_items === 'object' &&
    'items' in context.memory.pending_items &&
    Array.isArray(context.memory.pending_items.items)
  ) {
    pendingItems = context.memory.pending_items.items
      .slice(0, 5)
      .map((item) => {
        if (typeof item === 'object' && item !== null && 'description' in item) {
          return String(item.description);
        }
        return '';
      })
      .filter((item) => item !== '');
  }

  const latestQaArtifact = context.latestArtifacts.qaReport;
  const latestReleaseGateArtifact = context.latestArtifacts.releaseGate;
  const latestQaStatus =
    parseDeliveryStatus(
      latestQaArtifact &&
        typeof latestQaArtifact.metadata === 'object' &&
        latestQaArtifact.metadata !== null &&
        'qaStatus' in latestQaArtifact.metadata
        ? latestQaArtifact.metadata.qaStatus
        : undefined
    ) || (latestQaArtifact ? deriveArtifactStatusFromContent(latestQaArtifact.content) : 'PENDING');
  const latestReleaseGateStatus =
    parseDeliveryStatus(
      latestReleaseGateArtifact &&
        typeof latestReleaseGateArtifact.metadata === 'object' &&
        latestReleaseGateArtifact.metadata !== null &&
        'releaseGateStatus' in latestReleaseGateArtifact.metadata
        ? latestReleaseGateArtifact.metadata.releaseGateStatus
        : undefined
    ) ||
    (latestReleaseGateArtifact
      ? deriveArtifactStatusFromContent(latestReleaseGateArtifact.content)
      : 'PENDING');
  const evidenceExported = !!context.latestArtifacts.deliveryReport;
  const releaseGateRecorded =
    !!latestReleaseGateArtifact && latestReleaseGateStatus !== 'PENDING';
  const hasBobPrompt = !!context.latestArtifacts.bobPrompt;

  // Build system message with context
  const systemMessage = buildSystemMessage({
    workspaceName: context.workspace.name,
    memorySummary,
    activeMissionTitle,
    activeMissionObjective,
    activeMissionStatus,
    latestClosedMissionTitle,
    latestClosedMissionStatus,
    hasBobPrompt,
    latestQaStatus,
    evidenceExported,
    latestReleaseGateStatus,
    releaseGateRecorded,
    recentDecisions,
    constraints,
    pendingItems,
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
      latestQaStatus,
      evidenceExported,
      latestReleaseGateStatus,
      releaseGateRecorded,
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
