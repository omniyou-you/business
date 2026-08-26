import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { file_id: string } }
) {
  try {
    const fileId = params.file_id;
    if (!fileId) {
      return NextResponse.json({ error: "Missing file_id" }, { status: 400 });
    }

    const job = await db.printJob.findFirst({
      where: { pdf_file_id: fileId },
    });

    if (!job || !fs.existsSync(job.file_storage_location)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(job.file_storage_location);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${job.file_name}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Download PDF error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download PDF" },
      { status: 500 }
    );
  }
}
