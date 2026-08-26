import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatePrintCode } from "@/lib/code-generator";
import { savePDFToStorage } from "@/lib/storage";
import QRCode from "qrcode";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const existingJob = await db.printJob.findUnique({
      where: { order_id },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 1. Generate unique 6-digit Print Code
    let finalPrintCode = generatePrintCode();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const existing = await db.printJob.findUnique({
        where: { print_code: finalPrintCode },
      });
      if (!existing) {
        isUnique = true;
      } else {
        finalPrintCode = generatePrintCode();
        attempts++;
      }
    }

    // 2. Save PDF file to Cloudflare R2 named as [filename]_[code].pdf & get Public URL
    let publicFileLocation = existingJob.file_storage_location;
    if (fs.existsSync(existingJob.file_storage_location)) {
      const fileBuffer = fs.readFileSync(existingJob.file_storage_location);
      const storageResult = await savePDFToStorage(existingJob.file_name, fileBuffer, finalPrintCode);
      publicFileLocation = storageResult.storageLocation;
    }

    // 3. Generate QR Code Data URL
    const qrDataUrl = await QRCode.toDataURL(finalPrintCode, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours validity

    // 4. Update database record with verified status & public Cloudflare R2 URL
    const updatedJob = await db.printJob.update({
      where: { order_id },
      data: {
        print_code: finalPrintCode,
        file_storage_location: publicFileLocation,
        payment_status: "VERIFIED",
        payment_method: "TEST_SIMULATED",
        payment_transaction_id: `TX-MOCK-${Date.now()}`,
        paid_at: now,
        expires_at: expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      order_id: updatedJob.order_id,
      print_code: updatedJob.print_code,
      qr_code_url: qrDataUrl,
      public_file_url: updatedJob.file_storage_location,
      payment_status: updatedJob.payment_status,
      paid_at: updatedJob.paid_at,
      expires_at: updatedJob.expires_at,
      calculated_price: updatedJob.calculated_price,
    });
  } catch (error: any) {
    console.error("Pay simulate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to simulate payment" },
      { status: 500 }
    );
  }
}
