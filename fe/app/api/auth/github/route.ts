import { NextResponse } from "next/server";

// Placeholder for GitHub OAuth integration
// This should be connected to your backend OAuth service
export async function GET() {
  // In production, this should redirect to your backend OAuth endpoint
  // For now, it's a placeholder
  return NextResponse.json(
    { message: "GitHub OAuth endpoint - connect to backend" },
    { status: 200 }
  );
}

