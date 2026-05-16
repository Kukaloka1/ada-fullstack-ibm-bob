import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET /api/ada/messages
 * 
 * Load recent messages for a workspace from Supabase.
 * Server-side only - no client-side Supabase access.
 * 
 * Query params:
 * - workspaceId: UUID of the workspace
 * - limit: optional, default 50
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = createServerClient();

    // Fetch recent messages for this workspace
    const { data: messages, error } = await supabase
      .from("ada_messages")
      .select("id, role, content, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: messages || [],
      count: messages?.length || 0,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/ada/messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Made with Bob
