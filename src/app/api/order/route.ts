import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculatePrintPrice } from "@/lib/pricing-engine";
import { generateOrderId, generatePrintCode } from "@/lib/code-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pdf_file_id,
      file_name,
      file_storage_location,
      page_count,
      copies = 1,
      paper_size = "A4",
      color_or_black_white = "bw",
      single_or_double_sided = "single",
      orientation = "portrait",
      scaling = "fit_to_page",
    } = body;

    if (!pdf_file_id || !file_name || !page_count) {
      return NextResponse.json(
        { error: "Missing required fields: pdf_file_id, file_name, page_count" },
        { status: 400 }
      );
    }

    // Calculate price
    const pricing = calculatePrintPrice({
      pageCount: Number(page_count),
      copies: Number(copies),
      paperSize: paper_size,
      colorMode: color_or_black_white,
      duplexMode: single_or_double_sided,
    });

    const orderId = generateOrderId();
    // Temporary print code until paid (or generate placeholder)
    const tempPrintCode = `TEMP-${generatePrintCode()}`;
    const defaultStorageLocation = file_storage_location || `./storage/pdfs/${pdf_file_id}.pdf`;

    const printJob = await db.printJob.create({
      data: {
        order_id: orderId,
        print_code: tempPrintCode,
        pdf_file_id,
        file_name,
        file_storage_location: defaultStorageLocation,
        page_count: Number(page_count),
        copies: Number(copies),
        paper_size,
        color_or_black_white,
        single_or_double_sided,
        orientation,
        scaling,
        calculated_price: pricing.totalPrice,
        payment_status: "PENDING",
        print_status: "PENDING",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours default
      },
    });

    return NextResponse.json({
      success: true,
      order_id: printJob.order_id,
      calculated_price: printJob.calculated_price,
      pricing_breakdown: pricing,
      payment_status: printJob.payment_status,
      print_status: printJob.print_status,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
