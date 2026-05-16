import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET /api/ada/workspaces
 * 
 * Load all workspaces ordered by most recently updated.
 * Server-side only - no client-side Supabase access.
 */
export async function GET() {
  try {
    const supabase = createServerClient();

    const { data: workspaces, error } = await supabase
      .from("ada_workspaces")
      .select("id, name, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching workspaces:", error);
      return NextResponse.json(
        { error: "Failed to fetch workspaces" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      workspaces: workspaces || [],
      count: workspaces?.length || 0,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/ada/workspaces:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ada/workspaces
 * 
 * Create a new workspace.
 * Server-side only - no client-side Supabase access.
 * 
 * Body:
 * - name: string (required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 100) {
      return NextResponse.json(
        { error: "name must be 100 characters or less" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: workspace, error } = await supabase
      .from("ada_workspaces")
      .insert({
        name: trimmedName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single();

    if (error) {
      console.error("Error creating workspace:", error);
      return NextResponse.json(
        { error: "Failed to create workspace" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      workspace,
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/ada/workspaces:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Made with Bob