import crypto from "crypto";

/**
 * Generates a random 6-digit numeric Print Code (e.g., "583921")
 */
export function generatePrintCode(): string {
  // Generate random integer between 100000 and 999999
  const randomNum = crypto.randomInt(100000, 1000000);
  return randomNum.toString();
}

/**
 * Generates a unique Order ID (e.g., "ORD-2026-894210")
 */
export function generateOrderId(): string {
  const year = new Date().getFullYear();
  const randomSuffix = crypto.randomInt(100000, 999999);
  return `ORD-${year}-${randomSuffix}`;
}
