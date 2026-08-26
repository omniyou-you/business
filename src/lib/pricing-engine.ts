export interface PricingInput {
  pageCount: number;
  copies: number;
  paperSize: string; // A4, A3, Letter, Legal
  colorMode: string; // color, bw
  duplexMode: string; // single, double
}

export interface PricingBreakdown {
  unitPricePerPage: number;
  baseTotal: number;
  colorSurcharge: number;
  duplexAdjustment: number;
  totalPrice: number;
  currency: string;
}

export function calculatePrintPrice(input: PricingInput): PricingBreakdown {
  const { pageCount, copies, paperSize, colorMode, duplexMode } = input;

  // Base rate per page
  let basePricePerPage = 2.00;
  switch (paperSize.toUpperCase()) {
    case "A3":
      basePricePerPage = 4.00;
      break;
    case "LEGAL":
      basePricePerPage = 2.50;
      break;
    case "LETTER":
      basePricePerPage = 2.00;
      break;
    case "A4":
    default:
      basePricePerPage = 2.00;
      break;
  }

  // Color Surcharge (+ $3.00 per page if color)
  const isColor = colorMode.toLowerCase() === "color";
  const colorPricePerPage = isColor ? 3.00 : 0.00;

  const costPerPage = basePricePerPage + colorPricePerPage;
  let rawTotal = pageCount * copies * costPerPage;

  // Duplex adjustment (10% discount when double-sided to encourage saving paper)
  const isDuplex = duplexMode.toLowerCase() === "double";
  const duplexDiscount = isDuplex ? 0.10 : 0.00;

  const discountAmount = rawTotal * duplexDiscount;
  const finalPrice = Math.max(1.00, Number((rawTotal - discountAmount).toFixed(2)));

  return {
    unitPricePerPage: Number(costPerPage.toFixed(2)),
    baseTotal: Number(rawTotal.toFixed(2)),
    colorSurcharge: Number((isColor ? pageCount * copies * 3.00 : 0).toFixed(2)),
    duplexAdjustment: Number(discountAmount.toFixed(2)),
    totalPrice: finalPrice,
    currency: "USD",
  };
}
