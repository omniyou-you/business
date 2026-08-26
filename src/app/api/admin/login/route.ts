import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const envUser = (process.env.ADMIN_USERNAME || "admin").trim().replace(/^["']|["']$/g, '');
    const envPass = (process.env.ADMIN_PASSWORD || "AdminSecret2026!").trim().replace(/^["']|["']$/g, '');

    const inputUser = (username || "").trim();
    const inputPass = (password || "").trim();

    if (inputUser !== envUser || inputPass !== envPass) {
      return NextResponse.json(
        { error: "Invalid admin username or password" },
        { status: 401 }
      );
    }

    // Set secure HTTP-only cookie
    setAdminCookie(inputUser);

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
