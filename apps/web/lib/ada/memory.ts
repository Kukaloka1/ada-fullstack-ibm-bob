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
  Memory,
  MemoryUpdate,
} from './types';

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
  const [workspace, memory, activeMission, recentMessages, latestArtifacts] =
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
      ]),
    ]);

  return {
    workspace,
    memory,
    activeMission,
    recentMessages,
    latestArtifacts: {
      plan: latestArtifacts[0],
      spec: latestArtifacts[1],
      bobPrompt: latestArtifacts[2],
      qaReport: latestArtifacts[3],
      deliveryReport: latestArtifacts[4],
    },
  };
}

