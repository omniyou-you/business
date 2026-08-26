import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Self-Service Print Kiosk — Web Portal",
  description: "Upload your PDF, select printing options, pay, and receive your print verification code for any kiosk location.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col justify-between overflow-x-hidden">
        <header className="border-b border-white/10 glass-panel py-3.5 px-4 sm:px-6 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg shadow-blue-500/30">
                🖨️
              </div>
              <div>
                <h1 className="font-bold text-base sm:text-lg text-white tracking-tight leading-none">KioskPrint Express</h1>
                <p className="text-[11px] sm:text-xs text-blue-400 font-medium mt-0.5">Self-Service Printing System V1</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] sm:text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">Network Online</span>
              <span className="sm:hidden">Online</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-3 py-4 sm:px-6 sm:py-8">
          {children}
        </main>

        <footer className="border-t border-white/10 py-4 sm:py-6 text-center text-[11px] sm:text-xs text-gray-400 glass-panel mt-8 sm:mt-12">
          <p>© 2026 KioskPrint Network V1 — Authorized Self-Service Printing Platform</p>
        </footer>
      </body>
    </html>
  );
}
