import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const envUser = process.env.ADMIN_USERNAME || "admin";
    const envPass = process.env.ADMIN_PASSWORD || "AdminSecret2026!";

    if (username !== envUser || password !== envPass) {
      return NextResponse.json(
        { error: "Invalid admin username or password" },
        { status: 401 }
      );
    }

    // Set secure HTTP-only cookie
    setAdminCookie(username);

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful",
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
