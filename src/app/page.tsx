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
    <div className="space-y-8">
      {/* Wizard Progress Bar */}
      <div className="glass-panel p-4 rounded-2xl">
        <div className="flex items-center justify-between max-w-3xl mx-auto text-xs md:text-sm font-medium">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-400 font-semibold' : 'text-gray-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>1</span>
            Upload PDF
          </div>
          <div className={`h-0.5 flex-1 mx-3 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-800'}`}></div>
          
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-400 font-semibold' : 'text-gray-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>2</span>
            Print Options
          </div>
          <div className={`h-0.5 flex-1 mx-3 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-800'}`}></div>

          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-400 font-semibold' : 'text-gray-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>3</span>
            Payment
          </div>
          <div className={`h-0.5 flex-1 mx-3 ${step >= 4 ? 'bg-emerald-500' : 'bg-gray-800'}`}></div>

          <div className={`flex items-center gap-2 ${step === 4 ? 'text-emerald-400 font-semibold' : 'text-gray-500'}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${step === 4 ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'}`}>4</span>
            Print Code
          </div>
        </div>
      </div>

      {/* STEP 1: PDF UPLOAD */}
      {step === 1 && (
        <div className="glass-panel p-8 rounded-3xl space-y-6 max-w-2xl mx-auto text-center">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Upload Document</h2>
            <p className="text-sm text-gray-400 mt-1">Select or drop your PDF file to start self-service printing.</p>
          </div>

          <label 
            htmlFor="pdf-upload-input"
            className="border-2 border-dashed border-blue-500/30 hover:border-blue-500/80 bg-blue-950/10 hover:bg-blue-900/20 p-12 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-semibold text-white">Click to browse or drag PDF file here</p>
              <p className="text-xs text-gray-400 mt-1">Supports standard PDF documents up to 50MB</p>
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
            <div className="flex items-center justify-center gap-3 py-4 text-blue-400 font-medium">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Parsing PDF pages and checking orientation...
            </div>
          )}

          {uploadError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3 justify-center">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PRINT OPTIONS & LIVE PRICING */}
      {step === 2 && pdfData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Options Panel */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Printing Customization</h2>
                <p className="text-xs text-gray-400">Configure your print format and layout settings.</p>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="text-xs text-blue-400 hover:underline"
              >
                Change PDF
              </button>
            </div>

            {/* Document Info Card */}
            <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-blue-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white truncate max-w-[200px] md:max-w-[300px]">{pdfData.file_name}</p>
                  <p className="text-xs text-gray-400">Detected: {pdfData.orientation.toUpperCase()}</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-sm">
                {pdfData.page_count} {pdfData.page_count === 1 ? 'Page' : 'Pages'}
              </div>
            </div>

            {/* Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Copies */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Number of Copies</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCopies(Math.max(1, copies - 1))}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10"
                  >
                    -
                  </button>
                  <input 
                    type="number"
                    min="1"
                    max="99"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-10 rounded-xl bg-white/5 border border-white/10 text-center font-bold text-white focus:outline-none focus:border-blue-500"
                  />
                  <button 
                    onClick={() => setCopies(copies + 1)}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Paper Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Paper Size</label>
                <select 
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="A4" className="bg-gray-900">A4 Standard ($2.00/pg)</option>
                  <option value="A3" className="bg-gray-900">A3 Large ($4.00/pg)</option>
                  <option value="LETTER" className="bg-gray-900">Letter ($2.00/pg)</option>
                  <option value="LEGAL" className="bg-gray-900">Legal ($2.50/pg)</option>
                </select>
              </div>

              {/* Color Mode */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Color Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setColorMode("bw")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${colorMode === 'bw' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    Black & White
                  </button>
                  <button 
                    onClick={() => setColorMode("color")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${colorMode === 'color' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    Color (+ $3.00/pg)
                  </button>
                </div>
              </div>

              {/* Duplex / Sidedness */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Print Sides (Duplex)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setDuplexMode("single")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${duplexMode === 'single' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    Single-Sided
                  </button>
                  <button 
                    onClick={() => setDuplexMode("double")}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${duplexMode === 'double' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    Double-Sided (10% Off)
                  </button>
                </div>
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Orientation</label>
                <select 
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="portrait" className="bg-gray-900">Portrait</option>
                  <option value="landscape" className="bg-gray-900">Landscape</option>
                </select>
              </div>

              {/* Scaling */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Page Scaling</label>
                <select 
                  value={scaling}
                  onChange={(e) => setScaling(e.target.value)}
                  className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="fit_to_page" className="bg-gray-900">Fit to Printable Area</option>
                  <option value="actual_size" className="bg-gray-900">Actual Size (100%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Estimation Card */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-6 border-l-2 border-l-blue-500">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="font-bold text-white text-base">Cost Calculation</h3>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-semibold">Live Quote</span>
              </div>

              <div className="space-y-3 mt-4 text-xs text-gray-300">
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
                <span className="text-sm font-semibold text-gray-300">Total Price</span>
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  ${calculateLivePrice().toFixed(2)}
                </span>
              </div>

              <button 
                onClick={handleCreateOrder}
                disabled={creatingOrder}
                className="w-full py-3.5 rounded-2xl glow-button text-white font-bold text-sm flex items-center justify-center gap-2"
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
        <div className="glass-panel p-8 rounded-3xl max-w-xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Simulated Payment Gateway</h2>
            <p className="text-xs text-gray-400 mt-1">Development Phase: Click below to verify test payment for this print job.</p>
          </div>

          <div className="glass-card p-6 rounded-2xl text-left space-y-3 text-xs border border-white/10">
            <div className="flex justify-between">
              <span className="text-gray-400">Order ID:</span>
              <span className="font-mono font-bold text-white">{orderData.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Status:</span>
              <span className="text-amber-400 font-semibold uppercase">Pending Verification</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-white/10 font-bold">
              <span className="text-white">Amount Due:</span>
              <span className="text-blue-400">${orderData.calculated_price.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleSimulatePayment}
            disabled={paying}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all"
          >
            {paying ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Complete Test Payment (Simulate $0.00 Charge)
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 4: PRINT CODE & QR DISPLAY */}
      {step === 4 && successData && (
        <div className="glass-panel p-8 rounded-3xl max-w-2xl mx-auto space-y-8 text-center border border-emerald-500/30">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            PAYMENT VERIFIED & PRINT JOB AUTHORIZED
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Your Kiosk Print Code</h2>
            <p className="text-xs text-gray-400 mt-2">Enter this 6-digit code or scan the QR code at any Mini-PC Print Kiosk to release your document.</p>
          </div>

          {/* Code Card */}
          <div className="glass-card p-6 rounded-3xl space-y-4 border-2 border-blue-500/40 relative">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">6-Digit Verification Code</p>
            <div className="text-5xl md:text-6xl font-extrabold text-blue-400 code-badge tracking-widest py-2 bg-black/40 rounded-2xl border border-white/10 inline-block px-8 select-all">
              {successData.print_code}
            </div>

            <button 
              onClick={() => copyToClipboard(successData.print_code)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied Code!" : "Copy Code"}
            </button>
          </div>

          {/* QR Code Card */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 glass-card p-6 rounded-3xl">
            <div className="bg-white p-3 rounded-2xl shadow-xl">
              <img 
                src={successData.qr_code_url} 
                alt="Print Job QR Code" 
                className="w-44 h-44 object-contain"
              />
            </div>
            <div className="text-left space-y-2 text-xs max-w-xs">
              <p className="font-bold text-sm text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-400" />
                Kiosk Scanner Ready
              </p>
              <p className="text-gray-300 leading-relaxed">
                Scan this QR code directly with the Mini-PC camera/scanner for instant 1-second document verification.
              </p>
              <div className="pt-2 text-[11px] text-amber-400 font-medium">
                ⏱ Valid until: {new Date(successData.expires_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-left text-xs text-gray-400">
              <p className="font-semibold text-white">Order: {successData.order_id}</p>
              <p>Amount Paid: ${successData.calculated_price.toFixed(2)}</p>
            </div>

            <button 
              onClick={resetAll}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2"
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
