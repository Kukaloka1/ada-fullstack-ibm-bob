import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { ArtifactType } from "@/lib/ada/types";

const validArtifactTypes: ArtifactType[] = [
  "plan",
  "spec",
  "bob_prompt",
  "qa_report",
  "delivery_report",
  "release_gate",
  "note",
];

/**
 * GET /api/ada/artifacts
 * 
 * Load artifacts for a workspace from Supabase.
 * Server-side only - no client-side Supabase access.
 * 
 * Query params:
 * - workspaceId: UUID of the workspace (required)
 * - artifactType: optional filter by type
 * - missionId: optional filter by mission
 * - limit: optional, default 20
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const artifactType = searchParams.get("artifactType");
    const missionId = searchParams.get("missionId");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    let query = supabase
      .from("ada_artifacts")
      .select("*")
      .eq("workspace_id", workspaceId);

    if (artifactType) {
      query = query.eq("type", artifactType);
    }

    if (missionId) {
      query = query.eq("mission_id", missionId);
    }

    const { data: artifacts, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching artifacts:", error);
      return NextResponse.json(
        { error: "Failed to fetch artifacts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      artifacts: artifacts || [],
      count: artifacts?.length || 0,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/ada/artifacts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ada/artifacts
 * 
 * Create a new artifact.
 * Server-side only - no client-side Supabase access.
 * 
 * Body:
 * - workspaceId: string (required)
 * - artifactType: string (required)
 * - title: string (required)
 * - content: string (required)
 * - metadata: object (optional)
 * - missionId: string (optional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, artifactType, title, content, metadata, missionId } = body;

    // Validate required fields
    if (!workspaceId || typeof workspaceId !== "string") {
      return NextResponse.json(
        { error: "workspaceId is required and must be a string" },
        { status: 400 }
      );
    }

    if (!artifactType || typeof artifactType !== "string") {
      return NextResponse.json(
        { error: "artifactType is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate artifact type
    if (!validArtifactTypes.includes(artifactType as ArtifactType)) {
      return NextResponse.json(
        {
          error: `artifactType must be one of: ${validArtifactTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "content is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const artifactData: {
      workspace_id: string;
      type: string;
      title: string;
      content: string;
      metadata?: object;
      mission_id?: string;
    } = {
      workspace_id: workspaceId,
      type: artifactType,
      title: title.trim(),
      content: content.trim(),
    };

    if (metadata && typeof metadata === "object") {
      artifactData.metadata = metadata;
    }

    if (missionId && typeof missionId === "string") {
      artifactData.mission_id = missionId;
    }

    const { data: artifact, error } = await supabase
      .from("ada_artifacts")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(artifactData as any)
      .select()
      .single();

    if (error) {
      console.error("Error creating artifact:", error);
      return NextResponse.json(
        { error: "Failed to create artifact" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      artifact,
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/ada/artifacts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Made with Bob
