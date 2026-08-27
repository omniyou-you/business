import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kiosks = await db.kioskMachine.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, kiosks });
  } catch (error: any) {
    console.error("Fetch kiosks error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch kiosks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { machine_id, location } = await req.json();
    if (!machine_id || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const api_key = `kiosk_live_sec_${Math.random().toString(36).substring(2)}${Date.now()}`;

    const newKiosk = await db.kioskMachine.create({
      data: {
        machine_id: machine_id.toUpperCase(),
        location,
        api_key,
        status: "ONLINE",
      },
    });

    return NextResponse.json({ success: true, kiosk: newKiosk });
  } catch (error: any) {
    console.error("Create kiosk error:", error);
    return NextResponse.json({ error: error.message || "Failed to create kiosk" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const updated = await db.kioskMachine.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, kiosk: updated });
  } catch (error: any) {
    console.error("Update kiosk error:", error);
    return NextResponse.json({ error: error.message || "Failed to update kiosk" }, { status: 500 });
  }
}
