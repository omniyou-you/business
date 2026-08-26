"use client";

import { useState } from "react";
import { 
  FileText, UploadCloud, CheckCircle2, ShieldCheck, 
  QrCode, Copy, RefreshCw, AlertCircle, Sparkles, Printer, Layers
} from "lucide-react";

export default function KioskWebPortal() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Upload Data
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<{
    pdf_file_id: string;
    file_name: string;
    page_count: number;
    orientation: string;
    file_storage_location: string;
  } | null>(null);

  // Step 2: Print Options
  const [copies, setCopies] = useState(1);
  const [paperSize, setPaperSize] = useState("A4");
  const [colorMode, setColorMode] = useState("bw"); // bw or color
  const [duplexMode, setDuplexMode] = useState("single"); // single or double
  const [orientation, setOrientation] = useState("portrait");
  const [scaling, setScaling] = useState("fit_to_page");
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Step 3: Order & Payment
  const [orderData, setOrderData] = useState<{
    order_id: string;
    calculated_price: number;
  } | null>(null);
  const [paying, setPaying] = useState(false);

  // Step 4: Final Success Payload
  const [successData, setSuccessData] = useState<{
    order_id: string;
    print_code: string;
    qr_code_url: string;
    expires_at: string;
    calculated_price: number;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // Handle PDF Upload
  const handleFileUpload = async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Please select a valid PDF file.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload PDF");

      setPdfData(data);
      setOrientation(data.orientation || "portrait");
      setStep(2);
    } catch (err: any) {
      setUploadError(err.message || "An error occurred while parsing PDF.");
    } finally {
      setUploading(false);
    }
  };

  // Calculate live dynamic price estimated locally for responsiveness
  const calculateLivePrice = () => {
    if (!pdfData) return 0;
    let baseRate = 2.0;
    if (paperSize === "A3") baseRate = 4.0;
    if (paperSize === "LEGAL") baseRate = 2.5;

    const colorRate = colorMode === "color" ? 3.0 : 0.0;
    let total = pdfData.page_count * copies * (baseRate + colorRate);
    if (duplexMode === "double") {
      total = total * 0.9; // 10% duplex discount
    }
    return Math.max(1.0, Number(total.toFixed(2)));
  };

  // Submit Order Options
  const handleCreateOrder = async () => {
    if (!pdfData) return;
    setCreatingOrder(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdf_file_id: pdfData.pdf_file_id,
          file_name: pdfData.file_name,
          file_storage_location: pdfData.file_storage_location,
          page_count: pdfData.page_count,
          copies,
          paper_size: paperSize,
          color_or_black_white: colorMode,
          single_or_double_sided: duplexMode,
          orientation,
          scaling,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      setOrderData(data);
      setStep(3);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreatingOrder(false);
    }
  };

  // Process Test Payment
  const handleSimulatePayment = async () => {
    if (!orderData) return;
    setPaying(true);
    try {
      const res = await fetch("/api/pay-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderData.order_id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment simulation failed");

      setSuccessData(data);
      setStep(4);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPaying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAll = () => {
    setStep(1);
    setPdfData(null);
    setOrderData(null);
    setSuccessData(null);
    setCopies(1);
    setPaperSize("A4");
    setColorMode("bw");
    setDuplexMode("single");
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-full">
      {/* Wizard Progress Bar - Fully Mobile Optimized */}
      <div className="glass-panel p-3 sm:p-4 rounded-2xl overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-[280px] max-w-3xl mx-auto text-xs sm:text-sm font-medium">
          <div className={`flex items-center gap-1.5 sm:gap-2 ${step >= 1 ? 'text-blue-400 font-semibold' : 'text-gray-500'}`}>
            <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>1</span>
            <span className="truncate max-w-[70px] sm:max-w-none">Upload</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 sm:mx-3 min-w-[12px] ${step >= 2 ? 'bg-blue-500' : 'bg-gray-800'}`}></div>
          
          <div className={`flex items-center gap-1.5 sm:gap-2 ${step >= 2 ? 'text-blue-400 font-semibold' : 'text-gray-500'}`}>
            <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>2</span>
            <span className="truncate max-w-[70px] sm:max-w-none">Options</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 sm:mx-3 min-w-[12px] ${step >= 3 ? 'bg-blue-500' : 'bg-gray-800'}`}></div>

          <div className={`flex items-center gap-1.5 sm:gap-2 ${step >= 3 ? 'text-blue-400 font-semibold' : 'text-gray-500'}`}>
            <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>3</span>
            <span className="truncate max-w-[70px] sm:max-w-none">Payment</span>
          </div>
          <div className={`h-0.5 flex-1 mx-1.5 sm:mx-3 min-w-[12px] ${step >= 4 ? 'bg-emerald-500' : 'bg-gray-800'}`}></div>

          <div className={`flex items-center gap-1.5 sm:gap-2 ${step === 4 ? 'text-emerald-400 font-semibold' : 'text-gray-500'}`}>
            <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs ${step === 4 ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'}`}>4</span>
            <span className="truncate max-w-[70px] sm:max-w-none">Code</span>
          </div>
        </div>
      </div>

      {/* STEP 1: PDF UPLOAD */}
      {step === 1 && (
        <div className="glass-panel p-5 sm:p-8 rounded-3xl space-y-5 sm:space-y-6 max-w-2xl mx-auto text-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Upload Document</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Select or drop your PDF file to start self-service printing.</p>
          </div>

          <label 
            htmlFor="pdf-upload-input"
            className="border-2 border-dashed border-blue-500/30 hover:border-blue-500/80 bg-blue-950/10 hover:bg-blue-900/20 p-6 sm:p-12 rounded-3xl flex flex-col items-center justify-center gap-3 sm:gap-4 cursor-pointer transition-all duration-300 group"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-semibold text-white">Tap to select or drop PDF file here</p>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">Supports standard PDF documents up to 50MB</p>
            </div>
            <input 
              id="pdf-upload-input" 
              type="file" 
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
          </label>

          {uploading && (
            <div className="flex items-center justify-center gap-3 py-3 sm:py-4 text-blue-400 font-medium text-xs sm:text-sm">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              Parsing PDF pages and checking orientation...
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center gap-2.5 justify-center">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PRINT OPTIONS & LIVE PRICING */}
      {step === 2 && pdfData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Options Panel */}
          <div className="lg:col-span-2 glass-panel p-4 sm:p-6 rounded-3xl space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Printing Customization</h2>
                <p className="text-[11px] sm:text-xs text-gray-400">Configure your print format and layout settings.</p>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="text-xs text-blue-400 hover:underline font-medium"
              >
                Change PDF
              </button>
            </div>

            {/* Document Info Card */}
            <div className="glass-card p-3.5 sm:p-4 rounded-2xl flex items-center justify-between border border-blue-500/20 gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs sm:text-sm text-white truncate max-w-[140px] xs:max-w-[200px] sm:max-w-[300px]">{pdfData.file_name}</p>
                  <p className="text-[11px] text-gray-400">Detected: {pdfData.orientation.toUpperCase()}</p>
                </div>
              </div>
              <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
                {pdfData.page_count} {pdfData.page_count === 1 ? 'Page' : 'Pages'}
              </div>
            </div>

            {/* Controls Grid - Optimized for Mobile Touch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Copies */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Number of Copies</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 text-lg flex items-center justify-center active:scale-95 transition-transform"
                  >
                    -
                  </button>
                  <input 
                    type="number"
                    min="1"
                    max="99"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-11 sm:h-10 rounded-xl bg-white/5 border border-white/10 text-center font-bold text-white text-base sm:text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button 
                    onClick={() => setCopies(copies + 1)}
                    className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 text-lg flex items-center justify-center active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Paper Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Paper Size</label>
                <select 
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="w-full h-11 sm:h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="A4" className="bg-gray-900">A4 Standard ($2.00/pg)</option>
                  <option value="A3" className="bg-gray-900">A3 Large ($4.00/pg)</option>
                  <option value="LETTER" className="bg-gray-900">Letter ($2.00/pg)</option>
                  <option value="LEGAL" className="bg-gray-900">Legal ($2.50/pg)</option>
                </select>
              </div>

              {/* Color Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Color Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setColorMode("bw")}
                    className={`h-11 sm:h-10 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center active:scale-95 ${colorMode === 'bw' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    Black & White
                  </button>
                  <button 
                    onClick={() => setColorMode("color")}
                    className={`h-11 sm:h-10 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center active:scale-95 ${colorMode === 'color' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    Color (+ $3.00/pg)
                  </button>
                </div>
              </div>

              {/* Duplex / Sidedness */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Print Sides (Duplex)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setDuplexMode("single")}
                    className={`h-11 sm:h-10 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center active:scale-95 ${duplexMode === 'single' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    Single-Sided
                  </button>
                  <button 
                    onClick={() => setDuplexMode("double")}
                    className={`h-11 sm:h-10 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center active:scale-95 ${duplexMode === 'double' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    Double-Sided (10% Off)
                  </button>
                </div>
              </div>

              {/* Orientation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Orientation</label>
                <select 
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full h-11 sm:h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="portrait" className="bg-gray-900">Portrait</option>
                  <option value="landscape" className="bg-gray-900">Landscape</option>
                </select>
              </div>

              {/* Scaling */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Page Scaling</label>
                <select 
                  value={scaling}
                  onChange={(e) => setScaling(e.target.value)}
                  className="w-full h-11 sm:h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="fit_to_page" className="bg-gray-900">Fit to Printable Area</option>
                  <option value="actual_size" className="bg-gray-900">Actual Size (100%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Estimation Card */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl flex flex-col justify-between space-y-6 border-l-2 border-l-blue-500">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-base">Cost Calculation</h3>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-semibold">Live Quote</span>
              </div>

              <div className="space-y-2.5 mt-4 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Document Pages</span>
                  <span className="font-semibold text-white">{pdfData.page_count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Copies</span>
                  <span className="font-semibold text-white">{copies}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paper Format</span>
                  <span className="font-semibold text-white">{paperSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Color Mode</span>
                  <span className="font-semibold text-white">{colorMode === 'color' ? 'Full Color' : 'B&W'}</span>
                </div>
                {duplexMode === 'double' && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Duplex Discount</span>
                    <span>-10%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-baseline justify-between">
                <span className="text-xs sm:text-sm font-semibold text-gray-300">Total Price</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  ${calculateLivePrice().toFixed(2)}
                </span>
              </div>

              <button 
                onClick={handleCreateOrder}
                disabled={creatingOrder}
                className="w-full py-3.5 rounded-2xl glow-button text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-transform"
              >
                {creatingOrder ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Proceed to Payment
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: FAKE PAYMENT */}
      {step === 3 && orderData && (
        <div className="glass-panel p-5 sm:p-8 rounded-3xl max-w-xl mx-auto space-y-5 sm:space-y-6 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Simulated Payment Gateway</h2>
            <p className="text-xs text-gray-400 mt-1">Development Phase: Click below to verify test payment for this print job.</p>
          </div>

          <div className="glass-card p-4 sm:p-6 rounded-2xl text-left space-y-3 text-xs border border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Order ID:</span>
              <span className="font-mono font-bold text-white text-xs sm:text-sm">{orderData.order_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Payment Status:</span>
              <span className="text-amber-400 font-semibold uppercase text-[11px] sm:text-xs">Pending Verification</span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base pt-2 border-t border-white/10 font-bold">
              <span className="text-white">Amount Due:</span>
              <span className="text-blue-400">${orderData.calculated_price.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleSimulatePayment}
            disabled={paying}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            {paying ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Complete Test Payment ($0.00 Charge)
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 4: PRINT CODE & QR DISPLAY */}
      {step === 4 && successData && (
        <div className="glass-panel p-5 sm:p-8 rounded-3xl max-w-2xl mx-auto space-y-6 sm:space-y-8 text-center border border-emerald-500/30">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            PAYMENT VERIFIED & PRINT JOB AUTHORIZED
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Your Kiosk Print Code</h2>
            <p className="text-xs text-gray-400 mt-1.5 max-w-md mx-auto">Enter this 6-digit code or scan the QR code at any Mini-PC Print Kiosk to release your document.</p>
          </div>

          {/* Code Card - Wrapped & Scaled for Mobile 320px screens */}
          <div className="glass-card p-4 sm:p-6 rounded-3xl space-y-3 sm:space-y-4 border-2 border-blue-500/40 relative">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">6-Digit Verification Code</p>
            <div className="text-4xl xs:text-5xl sm:text-6xl font-extrabold text-blue-400 code-badge tracking-widest py-2.5 px-4 sm:px-8 bg-black/50 rounded-2xl border border-white/10 inline-block max-w-full overflow-x-auto select-all">
              {successData.print_code}
            </div>

            <div>
              <button 
                onClick={() => copyToClipboard(successData.print_code)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl active:scale-95 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied Code!" : "Copy Code"}
              </button>
            </div>
          </div>

          {/* QR Code Card - Responsive Mobile Column / Desktop Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 glass-card p-4 sm:p-6 rounded-3xl">
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl flex-shrink-0">
              <img 
                src={successData.qr_code_url} 
                alt="Print Job QR Code" 
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
              />
            </div>
            <div className="text-center sm:text-left space-y-1.5 sm:space-y-2 text-xs max-w-xs">
              <p className="font-bold text-sm text-white flex items-center justify-center sm:justify-start gap-2">
                <QrCode className="w-4 h-4 text-blue-400" />
                Kiosk Scanner Ready
              </p>
              <p className="text-gray-300 leading-relaxed text-[11px] sm:text-xs">
                Scan this QR code directly with the Mini-PC camera/scanner for instant 1-second document verification.
              </p>
              <div className="pt-1 text-[11px] text-amber-400 font-medium">
                ⏱ Valid until: {new Date(successData.expires_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Receipt & Action Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-center sm:text-left text-xs text-gray-400">
              <p className="font-semibold text-white">Order: {successData.order_id}</p>
              <p>Amount Paid: ${successData.calculated_price.toFixed(2)}</p>
            </div>

            <button 
              onClick={resetAll}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print Another Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
