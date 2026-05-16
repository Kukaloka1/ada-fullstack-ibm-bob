import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { MissionStatus } from "@/lib/ada/types";

const activeMissionStatuses: MissionStatus[] = [
  "draft",
  "planning",
  "ready",
  "in_progress",
  "review",
];

const validMissionStatuses: MissionStatus[] = [
  "draft",
  "planning",
  "ready",
  "in_progress",
  "review",
  "complete",
  "blocked",
];

/**
 * GET /api/ada/missions
 * 
 * Load missions for a workspace from Supabase.
 * Server-side only - no client-side Supabase access.
 * 
 * Query params:
 * - workspaceId: UUID of the workspace (required)
 * - activeOnly: boolean, default false
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const activeOnly = searchParams.get("activeOnly") === "true";

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    let query = supabase
      .from("ada_missions")
      .select("*")
      .eq("workspace_id", workspaceId);

    if (activeOnly) {
      query = query.in("status", activeMissionStatuses);
    }

    const { data: missions, error } = await query.order("updated_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error fetching missions:", error);
      return NextResponse.json(
        { error: "Failed to fetch missions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      missions: missions || [],
      count: missions?.length || 0,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/ada/missions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ada/missions
 * 
 * Create a new mission.
 * Server-side only - no client-side Supabase access.
 * 
 * Body:
 * - workspaceId: string (required)
 * - title: string (required)
 * - objective: string (optional)
 * - context: string (optional)
 * - status: string (optional, defaults to 'planning')
 * - constraints: array (optional)
 * - acceptance_criteria: array (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workspaceId,
      title,
      objective,
      context,
      status,
      constraints,
      acceptance_criteria,
    } = body;

    // Validate required fields
    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json(
        { error: "workspaceId is required and must be a string" },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const missionStatus = typeof status === "string" ? status : "planning";

    if (!validMissionStatuses.includes(missionStatus as MissionStatus)) {
      return NextResponse.json(
        {
          error: `status must be one of: ${validMissionStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const missionData: {
      workspace_id: string;
      title: string;
      objective?: string;
      context?: string;
      status?: string;
      constraints?: unknown;
      acceptance_criteria?: unknown;
    } = {
      workspace_id: workspaceId,
      title: title.trim(),
      status: missionStatus,
    };

    if (objective && typeof objective === "string") {
      missionData.objective = objective.trim();
    }

    if (context && typeof context === "string") {
      missionData.context = context.trim();
    }

    if (constraints && Array.isArray(constraints)) {
      missionData.constraints = constraints;
    }

    if (acceptance_criteria && Array.isArray(acceptance_criteria)) {
      missionData.acceptance_criteria = acceptance_criteria;
    }

    const { data: mission, error } = await supabase
      .from("ada_missions")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(missionData as any)
      .select()
      .single();

    if (error) {
      console.error("Error creating mission:", error);
      return NextResponse.json(
        { error: "Failed to create mission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mission,
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/ada/missions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ada/missions
 * 
 * Update an existing mission.
 * Server-side only - no client-side Supabase access.
 * 
 * Body:
 * - missionId: string (required)
 * - title: string (optional)
 * - objective: string (optional)
 * - context: string (optional)
 * - status: string (optional)
 * - constraints: array (optional)
 * - acceptance_criteria: array (optional)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      missionId,
      title,
      objective,
      context,
      status,
      constraints,
      acceptance_criteria,
    } = body;

    // Validate required fields
    if (!missionId || typeof missionId !== "string") {
      return NextResponse.json(
        { error: "missionId is required and must be a string" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const updateData: {
      title?: string;
      objective?: string | null;
      context?: string | null;
      status?: string;
      constraints?: unknown;
      acceptance_criteria?: unknown;
    } = {};

    if (title && typeof title === "string") {
      updateData.title = title.trim();
    }

    if (objective !== undefined) {
      updateData.objective = typeof objective === "string" ? objective.trim() : null;
    }

    if (context !== undefined) {
      updateData.context = typeof context === "string" ? context.trim() : null;
    }

    if (status && typeof status === "string") {
      if (!validMissionStatuses.includes(status as MissionStatus)) {
        return NextResponse.json(
          {
            error: `status must be one of: ${validMissionStatuses.join(", ")}`,
          },
          { status: 400 }
        );
      }

      updateData.status = status;
    }

    if (constraints !== undefined) {
      updateData.constraints = Array.isArray(constraints) ? constraints : [];
    }

    if (acceptance_criteria !== undefined) {
      updateData.acceptance_criteria = Array.isArray(acceptance_criteria)
        ? acceptance_criteria
        : [];
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: mission, error } = await supabase
      .from("ada_missions")
      // @ts-expect-error - Supabase type inference issue with partial updates
      .update(updateData)
      .eq("id", missionId)
      .select()
      .single();

    if (error) {
      console.error("Error updating mission:", error);
      return NextResponse.json(
        { error: "Failed to update mission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mission,
    });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/ada/missions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Made with Bob
