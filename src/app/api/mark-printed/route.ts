import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deletePDFFromStorage } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, machine_id, status = "COMPLETED" } = body;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const job = await db.printJob.findUnique({
      where: { order_id },
    });

    if (!job) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const now = new Date();
    const isCompleted = status.toUpperCase() === "COMPLETED";

    // 1. Update order status in PostgreSQL (Order metadata is PERMANENTLY SAVED!)
    const updated = await db.printJob.update({
      where: { order_id },
      data: {
        print_status: isCompleted ? "COMPLETED" : status.toUpperCase(),
        printed_at: now,
        machine_id: machine_id || job.machine_id,
      },
    });

    // 2. Cleanup Rule: Delete PDF document file from Cloudflare R2 / Storage
    let fileDeleted = false;
    if (isCompleted && job.file_storage_location) {
      console.log(`[Order Completed] Purging PDF storage for Order ${order_id}...`);
      fileDeleted = await deletePDFFromStorage(job.file_storage_location);
    }

    return NextResponse.json({
      success: true,
      order_id: updated.order_id,
      print_status: updated.print_status,
      printed_at: updated.printed_at,
      file_deleted_from_storage: fileDeleted,
      message: "Order marked completed. PDF document deleted from Cloudflare R2. Order record preserved in PostgreSQL.",
    });
  } catch (error: any) {
    console.error("Mark printed error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark order as printed" },
      { status: 500 }
    );
  }
}
