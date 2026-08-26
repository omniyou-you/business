import { NextRequest, NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  clearAdminCookie();
  return NextResponse.json({
    success: true,
    message: "Admin logged out successfully",
  });
}
