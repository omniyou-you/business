import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

/**
 * Storage Abstraction Layer for PDF Files
 * Native Cloudflare R2 Object Storage integration via AWS S3 SDK
 */

export interface StorageSaveResult {
  fileId: string;
  fileNameInStorage: string;
  storageLocation: string; // Public R2 URL or local file path saved in PostgreSQL
  isCloudStorage: boolean;
}

function getR2Client(): { s3Client: S3Client; bucketName: string; publicDomain: string } | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME || "business";
  const publicDomain = process.env.R2_PUBLIC_DOMAIN || "https://pub-aea563072f504bbbbc54e48333dcf450.r2.dev";

  if (!accountId || !accessKeyId || !secretAccessKey || accessKeyId.includes("your_")) {
    return null;
  }

  const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { s3Client, bucketName, publicDomain };
}

export async function savePDFToStorage(
  rawFileName: string,
  buffer: Buffer,
  printCode: string = "TEMP"
): Promise<StorageSaveResult> {
  const cleanName = path.parse(rawFileName).name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileNameInStorage = `${cleanName}_${printCode}.pdf`;

  const r2Config = getR2Client();

  if (r2Config) {
    try {
      console.log(`[Storage] Uploading to Cloudflare R2 Bucket (${r2Config.bucketName}): ${fileNameInStorage}`);

      const command = new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: fileNameInStorage,
        Body: buffer,
        ContentType: "application/pdf",
      });

      await r2Config.s3Client.send(command);

      const publicUrl = `${r2Config.publicDomain.replace(/\/$/, "")}/${fileNameInStorage}`;
      console.log(`[Storage] Cloudflare R2 Upload Success! Public URL: ${publicUrl}`);

      return {
        fileId: fileNameInStorage,
        fileNameInStorage,
        storageLocation: publicUrl,
        isCloudStorage: true,
      };
    } catch (err) {
      console.error("[Storage] Cloudflare R2 upload error, falling back to local storage:", err);
    }
  }

  // Local Storage Fallback
  const storageDir = path.join(process.cwd(), "storage", "pdfs");
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const filePath = path.join(storageDir, fileNameInStorage);
  fs.writeFileSync(filePath, buffer);

  return {
    fileId: fileNameInStorage,
    fileNameInStorage,
    storageLocation: filePath,
    isCloudStorage: false,
  };
}

/**
 * Deletes the PDF file from Cloudflare R2 or local disk storage after printing completion
 */
export async function deletePDFFromStorage(storageLocation: string): Promise<boolean> {
  try {
    const r2Config = getR2Client();

    if (r2Config && storageLocation.startsWith("http")) {
      const urlParts = storageLocation.split("/");
      const key = urlParts[urlParts.length - 1];

      console.log(`[Storage Cleanup] Deleting object '${key}' from Cloudflare R2 Bucket '${r2Config.bucketName}'...`);

      const command = new DeleteObjectCommand({
        Bucket: r2Config.bucketName,
        Key: key,
      });

      await r2Config.s3Client.send(command);
      console.log(`[Storage Cleanup] Cloudflare R2 Object '${key}' successfully deleted!`);
      return true;
    } else {
      if (fs.existsSync(storageLocation)) {
        fs.unlinkSync(storageLocation);
        console.log(`[Storage Cleanup] Deleted local file: ${storageLocation}`);
      }
      return true;
    }
  } catch (err) {
    console.error("[Storage Cleanup] Failed to delete file:", err);
    return false;
  }
}
