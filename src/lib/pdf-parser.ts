import pdfParse from "pdf-parse";
import { PDFDocument } from "pdf-lib";

export interface PDFMetadata {
  pageCount: number;
  orientation: "portrait" | "landscape";
  info?: {
    title?: string;
    author?: string;
  };
}

export async function parsePDFBuffer(buffer: Buffer): Promise<PDFMetadata> {
  try {
    // 1. Parse page count with pdf-parse
    const pdfData = await pdfParse(buffer);
    const pageCount = pdfData.numpages || 1;

    // 2. Check dimensions of first page with pdf-lib
    let orientation: "portrait" | "landscape" = "portrait";
    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      if (pages.length > 0) {
        const { width, height } = pages[0].getSize();
        orientation = width > height ? "landscape" : "portrait";
      }
    } catch (e) {
      console.warn("Could not determine page orientation via pdf-lib, defaulting to portrait:", e);
    }

    return {
      pageCount,
      orientation,
      info: {
        title: pdfData.info?.Title,
        author: pdfData.info?.Author,
      },
    };
  } catch (error) {
    console.error("PDF Parsing error:", error);
    throw new Error("Failed to parse PDF file. Ensure the uploaded file is a valid PDF document.");
  }
}
