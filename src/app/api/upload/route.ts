import { NextRequest, NextResponse } from "next/server";
import { parsePDFBuffer } from "@/lib/pdf-parser";
import { savePDFToStorage } from "@/lib/storage";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Parse PDF metadata (page count & orientation)
    const metadata = await parsePDFBuffer(buffer);

    // 2. Save file to storage (Cloudflare R2 or local disk)
    const pdfFileId = `PDF-${crypto.randomBytes(8).toString("hex")}`;
    const storageResult = await savePDFToStorage(file.name, buffer, pdfFileId);

    return NextResponse.json({
      success: true,
      pdf_file_id: pdfFileId,
      file_name: file.name,
      file_size_bytes: file.size,
      page_count: metadata.pageCount,
      orientation: metadata.orientation,
      file_storage_location: storageResult.storageLocation,
      is_cloud_storage: storageResult.isCloudStorage,
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process uploaded file" },
      { status: 500 }
    );
  }
}
