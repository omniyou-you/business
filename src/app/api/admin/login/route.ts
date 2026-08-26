import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/admin-auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password } = body;

    const identifier = (email || username || "").trim();
    const inputPass = (password || "").trim();

    if (!identifier || !inputPass) {
      return NextResponse.json(
        { error: "Email/Username and password are required" },
        { status: 400 }
      );
    }

    // 1. Try Supabase Auth authentication if identifier looks like an email or if anon key is configured
    if (identifier.includes("@")) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: inputPass,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      if (data.session) {
        setAdminCookie(data.user?.email || identifier);
        return NextResponse.json({
          success: true,
          message: "Authenticated via Supabase Auth",
          user: data.user,
        });
      }
    }

    // 2. Fallback check for static admin credentials
    const envUser = (process.env.ADMIN_USERNAME || "admin").trim().replace(/^["']|["']$/g, "");
    const envPass = (process.env.ADMIN_PASSWORD || "AdminSecret2026!").trim().replace(/^["']|["']$/g, "");

    if (identifier === envUser && inputPass === envPass) {
      setAdminCookie(identifier);
      return NextResponse.json({
        success: true,
        message: "Authenticated via Admin Credentials",
      });
    }

    return NextResponse.json(
      { error: "Invalid admin email/username or password" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
