/**
 * ADA Memory Helper Functions
 * 
 * Lightweight helper functions for working with ADA's Supabase memory layer.
 * These functions provide a clean interface for common memory operations.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  Workspace,
  WorkspaceInsert,
  Message,
  MessageInsert,
  Mission,
  MissionInsert,
  MissionUpdate,
  Artifact,
  ArtifactInsert,
  Json,
  Memory,
  MemoryUpdate,
} from './types';

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

const getArtifactMetadataStatus = (
  artifact: Artifact | null,
  key: 'qaStatus' | 'releaseGateStatus'
): DeliveryStatus | null => {
  if (!artifact || !artifact.metadata || typeof artifact.metadata !== 'object') {
    return null;
  }

  const metadata = artifact.metadata as Record<string, unknown>;

  return parseDeliveryStatus(metadata[key]);
};

const deriveLatestQaStatus = (qaArtifact: Artifact | null): DeliveryStatus =>
  getArtifactMetadataStatus(qaArtifact, 'qaStatus') ||
  (qaArtifact ? deriveArtifactStatusFromContent(qaArtifact.content) : 'PENDING');

const deriveLatestReleaseGateStatus = (
  releaseGateArtifact: Artifact | null
): DeliveryStatus =>
  getArtifactMetadataStatus(releaseGateArtifact, 'releaseGateStatus') ||
  (releaseGateArtifact
    ? deriveArtifactStatusFromContent(releaseGateArtifact.content)
    : 'PENDING');

const extractMissionConstraints = (mission: Mission | null): string[] => {
  if (!mission?.constraints) {
    return [];
  }

  if (Array.isArray(mission.constraints)) {
    return mission.constraints
      .map((item) => (typeof item === 'string' ? item : ''))
      .filter((item) => item !== '');
  }

  if (
    typeof mission.constraints === 'object' &&
    mission.constraints !== null &&
    'constraints' in mission.constraints &&
    Array.isArray((mission.constraints as { constraints?: unknown }).constraints)
  ) {
    return ((mission.constraints as { constraints?: unknown }).constraints as unknown[])
      .map((item) => (typeof item === 'string' ? item : ''))
      .filter((item) => item !== '');
  }

  return [];
};

interface LatestWorkspaceArtifacts {
  plan: Artifact | null;
  spec: Artifact | null;
  bobPrompt: Artifact | null;
  qaReport: Artifact | null;
  deliveryReport: Artifact | null;
  releaseGate: Artifact | null;
}

const hasDurableWorkspaceState = ({
  activeMission,
  latestArtifacts,
}: {
  activeMission: Mission | null;
  latestArtifacts: LatestWorkspaceArtifacts;
}): boolean =>
  !!activeMission ||
  Object.values(latestArtifacts).some((artifact) => artifact !== null);

const buildDerivedMemoryUpdate = ({
  activeMission,
  latestArtifacts,
}: {
  activeMission: Mission | null;
  latestArtifacts: LatestWorkspaceArtifacts;
}): MemoryUpdate => {
  const hasBobPrompt = !!latestArtifacts.bobPrompt;
  const qaStatus = deriveLatestQaStatus(latestArtifacts.qaReport);
  const evidenceExported = !!latestArtifacts.deliveryReport;
  const releaseGateStatus = deriveLatestReleaseGateStatus(latestArtifacts.releaseGate);
  const releaseGateRecorded =
    !!latestArtifacts.releaseGate && releaseGateStatus !== 'PENDING';
  const missionStatus = activeMission?.status || 'none recorded yet';
  const missionTitle = activeMission?.title || 'none recorded yet';
  const summaryParts = [
    `Mission "${missionTitle}" is ${missionStatus}.`,
    `Bob prompt generated: ${hasBobPrompt ? 'yes' : 'no'}.`,
    `QA status: ${qaStatus}.`,
    `Evidence exported: ${evidenceExported ? 'yes' : 'no'}.`,
    `Release gate recorded: ${releaseGateRecorded ? 'yes' : 'no'}.`,
    `Release gate status: ${releaseGateStatus}.`,
  ];

  if (releaseGateRecorded && releaseGateStatus === 'PASS') {
    summaryParts.push('The project is approved for release.');
  } else if (releaseGateRecorded && releaseGateStatus === 'CONDITIONAL_PASS') {
    summaryParts.push('The project is approved with conditions.');
  } else if (releaseGateRecorded && releaseGateStatus === 'FAIL') {
    summaryParts.push('The project is blocked from release.');
  } else {
    summaryParts.push('The project is not yet release-final.');
  }

  const decisions = {
    decisions: [
      activeMission
        ? {
            date: activeMission.updated_at,
            decision: `Current mission is ${activeMission.title} (${activeMission.status}).`,
          }
        : null,
      hasBobPrompt
        ? {
            date: latestArtifacts.bobPrompt?.created_at || new Date().toISOString(),
            decision: 'Bob prompt has been generated for this workspace.',
          }
        : null,
      qaStatus !== 'PENDING'
        ? {
            date: latestArtifacts.qaReport?.created_at || new Date().toISOString(),
            decision: `QA verdict is ${qaStatus}.`,
          }
        : null,
      evidenceExported
        ? {
            date: latestArtifacts.deliveryReport?.created_at || new Date().toISOString(),
            decision: 'Delivery evidence has been exported.',
          }
        : null,
      releaseGateRecorded
        ? {
            date: latestArtifacts.releaseGate?.created_at || new Date().toISOString(),
            decision: `Release gate is recorded as ${releaseGateStatus}.`,
          }
        : null,
    ].filter((decision): decision is NonNullable<typeof decision> => decision !== null),
  };

  const baseConstraints = extractMissionConstraints(activeMission);
  const constraints = {
    constraints: Array.from(
      new Set([
        ...baseConstraints,
        'Human lead approval is required before commit/push.',
        'Artifacts are the durable source of truth.',
      ])
    ),
  };

  const pendingItems = {
    items: [
      !hasBobPrompt
        ? {
            id: 'generate-bob-prompt',
            description: 'Generate a Bob prompt for the current mission.',
            priority: 'high' as const,
            created_at: new Date().toISOString(),
          }
        : null,
      qaStatus === 'PENDING'
        ? {
            id: 'prepare-qa-verdict',
            description: 'Prepare and record an ADA QA verdict.',
            priority: 'high' as const,
            created_at: new Date().toISOString(),
          }
        : null,
      !evidenceExported
        ? {
            id: 'export-delivery-evidence',
            description: 'Export the delivery report and evidence trail.',
            priority: 'high' as const,
            created_at: new Date().toISOString(),
          }
        : null,
      !releaseGateRecorded
        ? {
            id: 'record-release-gate',
            description: 'Record the final release gate decision after QA and evidence.',
            priority: 'high' as const,
            created_at: new Date().toISOString(),
          }
        : null,
      releaseGateRecorded && releaseGateStatus === 'CONDITIONAL_PASS'
        ? {
            id: 'review-conditions-before-push',
            description: 'Review documented conditions before commit/push.',
            priority: 'medium' as const,
            created_at: new Date().toISOString(),
          }
        : null,
      releaseGateRecorded && releaseGateStatus === 'PASS'
        ? {
            id: 'prepare-commit-push-handoff',
            description: 'Prepare commit/push handoff for the human lead.',
            priority: 'medium' as const,
            created_at: new Date().toISOString(),
          }
        : null,
    ].filter((item): item is NonNullable<typeof item> => item !== null),
  };

  return {
    summary: summaryParts.join(' '),
    decisions: decisions as Json,
    constraints: constraints as Json,
    pending_items: pendingItems as Json,
  };
};

const memoryMatchesDerivedState = (memory: Memory, derived: MemoryUpdate): boolean =>
  memory.summary === derived.summary &&
  JSON.stringify(memory.decisions) === JSON.stringify(derived.decisions) &&
  JSON.stringify(memory.constraints) === JSON.stringify(derived.constraints) &&
  JSON.stringify(memory.pending_items) === JSON.stringify(derived.pending_items);

export async function syncWorkspaceMemoryFromDurableState(
  client: SupabaseClient<Database>,
  workspaceId: string,
  input: {
    currentMemory: Memory | null;
    activeMission: Mission | null;
    latestArtifacts: LatestWorkspaceArtifacts;
  }
) {
  const { currentMemory, activeMission, latestArtifacts } = input;

  if (!hasDurableWorkspaceState({ activeMission, latestArtifacts })) {
    return currentMemory;
  }

  const derivedMemory = buildDerivedMemoryUpdate({
    activeMission,
    latestArtifacts,
  });

  if (currentMemory && memoryMatchesDerivedState(currentMemory, derivedMemory)) {
    return currentMemory;
  }

  return updateMemory(client, workspaceId, derivedMemory);
}

// ============================================================================
// Workspace Operations
// ============================================================================

export async function createWorkspace(
  client: SupabaseClient<Database>,
  data: WorkspaceInsert
) {
  const { data: workspace, error } = await client
    .from('ada_workspaces')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(data as any)
    .select()
    .single();

  if (error) throw error;
  return workspace as Workspace;
}

export async function getWorkspace(
  client: SupabaseClient<Database>,
  workspaceId: string
) {
  const { data: workspace, error } = await client
    .from('ada_workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (error) throw error;
  return workspace as Workspace;
}

export async function listWorkspaces(client: SupabaseClient<Database>) {
  const { data: workspaces, error } = await client
    .from('ada_workspaces')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return workspaces as Workspace[];
}

// ============================================================================
// Message Operations
// ============================================================================

export async function addMessage(
  client: SupabaseClient<Database>,
  data: MessageInsert
) {
  const { data: message, error } = await client
    .from('ada_messages')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(data as any)
    .select()
    .single();

  if (error) throw error;
  return message as Message;
}

export async function getRecentMessages(
  client: SupabaseClient<Database>,
  workspaceId: string,
  limit = 20
) {
  const { data: messages, error } = await client
    .from('ada_messages')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (messages as Message[]).reverse();
}

// ============================================================================
// Mission Operations
// ============================================================================

export async function createMission(
  client: SupabaseClient<Database>,
  data: MissionInsert
) {
  const { data: mission, error } = await client
    .from('ada_missions')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(data as any)
    .select()
    .single();

  if (error) throw error;
  return mission as Mission;
}

export async function updateMission(
  client: SupabaseClient<Database>,
  missionId: string,
  data: MissionUpdate
) {
  const { data: mission, error } = await client
    .from('ada_missions')
    // @ts-expect-error - Supabase type inference issue, will resolve with actual DB connection
    .update(data)
    .eq('id', missionId)
    .select()
    .single();

  if (error) throw error;
  return mission as Mission;
}

export async function getMission(
  client: SupabaseClient<Database>,
  missionId: string
) {
  const { data: mission, error } = await client
    .from('ada_missions')
    .select('*')
    .eq('id', missionId)
    .single();

  if (error) throw error;
  return mission as Mission;
}

export async function listMissions(
  client: SupabaseClient<Database>,
  workspaceId: string
) {
  const { data: missions, error } = await client
    .from('ada_missions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return missions as Mission[];
}

export async function getActiveMission(
  client: SupabaseClient<Database>,
  workspaceId: string
) {
  const { data: mission, error } = await client
    .from('ada_missions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .in('status', ['planning', 'ready', 'in_progress', 'review'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return mission as Mission | null;
}

// ============================================================================
// Artifact Operations
// ============================================================================

export async function createArtifact(
  client: SupabaseClient<Database>,
  data: ArtifactInsert
) {
  const { data: artifact, error } = await client
    .from('ada_artifacts')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(data as any)
    .select()
    .single();

  if (error) throw error;
  return artifact as Artifact;
}

export async function getLatestArtifact(
  client: SupabaseClient<Database>,
  workspaceId: string,
  type: Artifact['type']
) {
  const { data: artifact, error } = await client
    .from('ada_artifacts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return artifact as Artifact | null;
}

export async function listArtifacts(
  client: SupabaseClient<Database>,
  workspaceId: string,
  missionId?: string
) {
  let query = client
    .from('ada_artifacts')
    .select('*')
    .eq('workspace_id', workspaceId);

  if (missionId) {
    query = query.eq('mission_id', missionId);
  }

  const { data: artifacts, error } = await query.order('created_at', {
    ascending: false,
  });

  if (error) throw error;
  return artifacts as Artifact[];
}

// ============================================================================
// Memory Operations
// ============================================================================

export async function getMemory(
  client: SupabaseClient<Database>,
  workspaceId: string
) {
  const { data: memory, error } = await client
    .from('ada_memory')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return memory as Memory | null;
}

export async function updateMemory(
  client: SupabaseClient<Database>,
  workspaceId: string,
  data: MemoryUpdate
) {
  // First check if memory exists
  const existing = await getMemory(client, workspaceId);

  if (existing) {
    // Update existing memory
    const { data: memory, error } = await client
      .from('ada_memory')
      // @ts-expect-error - Supabase type inference issue, will resolve with actual DB connection
      .update(data)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (error) throw error;
    return memory as Memory;
  } else {
    // Create new memory
    const { data: memory, error } = await client
      .from('ada_memory')
      .insert({
        workspace_id: workspaceId,
        ...data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single();

    if (error) throw error;
    return memory as Memory;
  }
}

// ============================================================================
// Context Builder
// ============================================================================

/**
 * Build compact workspace context for ADA LLM requests
 * 
 * This function assembles the key memory components that ADA needs
 * to maintain context across conversations.
 */
export async function buildWorkspaceContext(
  client: SupabaseClient<Database>,
  workspaceId: string
) {
  const [workspace, currentMemory, activeMission, recentMessages, latestArtifacts] =
    await Promise.all([
      getWorkspace(client, workspaceId),
      getMemory(client, workspaceId),
      getActiveMission(client, workspaceId),
      getRecentMessages(client, workspaceId, 12),
      Promise.all([
        getLatestArtifact(client, workspaceId, 'plan'),
        getLatestArtifact(client, workspaceId, 'spec'),
        getLatestArtifact(client, workspaceId, 'bob_prompt'),
        getLatestArtifact(client, workspaceId, 'qa_report'),
        getLatestArtifact(client, workspaceId, 'delivery_report'),
        getLatestArtifact(client, workspaceId, 'release_gate'),
      ]),
    ]);

  const latestArtifactMap = {
    plan: latestArtifacts[0],
    spec: latestArtifacts[1],
    bobPrompt: latestArtifacts[2],
    qaReport: latestArtifacts[3],
    deliveryReport: latestArtifacts[4],
    releaseGate: latestArtifacts[5],
  };
  const memory = await syncWorkspaceMemoryFromDurableState(client, workspaceId, {
    currentMemory,
    activeMission,
    latestArtifacts: latestArtifactMap,
  });

  return {
    workspace,
    memory,
    activeMission,
    recentMessages,
    latestArtifacts: latestArtifactMap,
  };
}
