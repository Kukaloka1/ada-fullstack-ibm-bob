/**
 * ADA Memory Foundation Types
 * 
 * This file defines TypeScript types for ADA's Supabase memory layer.
 * These types align with the minimal schema defined in docs/ADA_SPEC.md.
 */

// ============================================================================
// Database Schema Types
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      ada_workspaces: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ada_messages: {
        Row: {
          id: string;
          workspace_id: string;
          role: 'user' | 'ada' | 'system';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          role: 'user' | 'ada' | 'system';
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          role?: 'user' | 'ada' | 'system';
          content?: string;
          created_at?: string;
        };
      };
      ada_missions: {
        Row: {
          id: string;
          workspace_id: string;
          title: string;
          objective: string | null;
          context: string | null;
          constraints: Json;
          acceptance_criteria: Json;
          metadata: Json;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          title: string;
          objective?: string | null;
          context?: string | null;
          constraints?: Json;
          acceptance_criteria?: Json;
          metadata?: Json;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          title?: string;
          objective?: string | null;
          context?: string | null;
          constraints?: Json;
          acceptance_criteria?: Json;
          metadata?: Json;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ada_artifacts: {
        Row: {
          id: string;
          workspace_id: string;
          mission_id: string | null;
          type: 'plan' | 'spec' | 'bob_prompt' | 'qa_report' | 'delivery_report' | 'release_gate' | 'note';
          title: string;
          content: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          mission_id?: string | null;
          type: 'plan' | 'spec' | 'bob_prompt' | 'qa_report' | 'delivery_report' | 'release_gate' | 'note';
          title: string;
          content: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          mission_id?: string | null;
          type?: 'plan' | 'spec' | 'bob_prompt' | 'qa_report' | 'delivery_report' | 'release_gate' | 'note';
          title?: string;
          content?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      ada_memory: {
        Row: {
          id: string;
          workspace_id: string;
          summary: string;
          decisions: Json;
          constraints: Json;
          pending_items: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          summary?: string;
          decisions?: Json;
          constraints?: Json;
          pending_items?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          summary?: string;
          decisions?: Json;
          constraints?: Json;
          pending_items?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ============================================================================
// Domain Types
// ============================================================================

export type Workspace = Database['public']['Tables']['ada_workspaces']['Row'];
export type WorkspaceInsert = Database['public']['Tables']['ada_workspaces']['Insert'];
export type WorkspaceUpdate = Database['public']['Tables']['ada_workspaces']['Update'];

export type Message = Database['public']['Tables']['ada_messages']['Row'];
export type MessageInsert = Database['public']['Tables']['ada_messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['ada_messages']['Update'];

export type Mission = Database['public']['Tables']['ada_missions']['Row'];
export type MissionInsert = Database['public']['Tables']['ada_missions']['Insert'];
export type MissionUpdate = Database['public']['Tables']['ada_missions']['Update'];

export type Artifact = Database['public']['Tables']['ada_artifacts']['Row'];
export type ArtifactInsert = Database['public']['Tables']['ada_artifacts']['Insert'];
export type ArtifactUpdate = Database['public']['Tables']['ada_artifacts']['Update'];

export type Memory = Database['public']['Tables']['ada_memory']['Row'];
export type MemoryInsert = Database['public']['Tables']['ada_memory']['Insert'];
export type MemoryUpdate = Database['public']['Tables']['ada_memory']['Update'];

// ============================================================================
// Structured Domain Types
// ============================================================================

export interface MissionConstraints {
  constraints: string[];
}

export interface MissionAcceptanceCriteria {
  criteria: string[];
}

export interface MemoryDecisions {
  decisions: Array<{
    date: string;
    decision: string;
    rationale?: string;
  }>;
}

export interface MemoryConstraints {
  constraints: string[];
}

export interface MemoryPendingItems {
  items: Array<{
    id: string;
    description: string;
    priority?: 'low' | 'medium' | 'high';
    created_at: string;
  }>;
}

export interface ArtifactMetadata {
  [key: string]: Json;
}

// ============================================================================
// Message Role Type
// ============================================================================

export type MessageRole = 'user' | 'ada' | 'system';

// ============================================================================
// Artifact Type
// ============================================================================

export type ArtifactType = 
  | 'plan' 
  | 'spec' 
  | 'bob_prompt' 
  | 'qa_report' 
  | 'delivery_report' 
  | 'release_gate'
  | 'note';

// ============================================================================
// Mission Status Type
// ============================================================================

export type MissionStatus = 
  | 'draft' 
  | 'planning' 
  | 'active'
  | 'ready' 
  | 'in_progress' 
  | 'review' 
  | 'approved'
  | 'approved_with_conditions'
  | 'complete' 
  | 'closed'
  | 'blocked';
