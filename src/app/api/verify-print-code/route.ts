import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, machine_id = "UNKNOWN_KIOSK" } = body;

    if (!code) {
      return NextResponse.json(
        { authorized: false, reason: "MISSING_CODE", message: "Print Code is required." },
        { status: 400 }
      );
    }

    // 1. Check code in PostgreSQL
    const job = await db.printJob.findUnique({
      where: { print_code: String(code).trim() },
    });

    if (!job) {
      return NextResponse.json(
        { authorized: false, reason: "INVALID_CODE", message: "Print code does not exist." },
        { status: 404 }
      );
    }

    // 2. Check payment status
    if (job.payment_status !== "VERIFIED") {
      return NextResponse.json(
        { authorized: false, reason: "UNPAID", message: "Payment is not verified for this order." },
        { status: 400 }
      );
    }

    // 3. Check expiration
    const now = new Date();
    if (job.expires_at && job.expires_at < now) {
      return NextResponse.json(
        { authorized: false, reason: "EXPIRED", message: "This print code has expired." },
        { status: 400 }
      );
    }

    // 4. Double-print protection check
    if (job.print_status === "COMPLETED" || job.print_status === "PRINTED") {
      return NextResponse.json(
        { authorized: false, reason: "ALREADY_PRINTED", message: "This order has already been printed." },
        { status: 400 }
      );
    }

    // 5. Update status to AUTHORIZED in PostgreSQL and log machine_id
    await db.printJob.update({
      where: { order_id: job.order_id },
      data: {
        print_status: "AUTHORIZED",
        machine_id: machine_id,
      },
    });

    // 6. Return authorized job details with Cloudflare R2 Public Download URL directly from PostgreSQL!
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const downloadUrl = job.file_storage_location.startsWith("http")
      ? job.file_storage_location
      : `${appUrl}/api/download/${job.pdf_file_id}`;

    return NextResponse.json({
      authorized: true,
      order_id: job.order_id,
      file: {
        download_url: downloadUrl, // Public Cloudflare R2 URL saved in PostgreSQL!
        filename: job.file_name,
        page_count: job.page_count,
      },
      print_settings: {
        copies: job.copies,
        paper_size: job.paper_size,
        color: job.color_or_black_white === "color",
        duplex: job.single_or_double_sided === "double",
        orientation: job.orientation,
        scaling: job.scaling,
      },
      expires_at: job.expires_at,
    });
  } catch (error: any) {
    console.error("Verify print code error:", error);
    return NextResponse.json(
      { authorized: false, reason: "SERVER_ERROR", message: error.message || "Server verification error" },
      { status: 500 }
    );
  }
}
