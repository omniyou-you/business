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
      <body className="antialiased min-height-screen flex flex-col justify-between">
        <header className="border-b border-white/10 glass-panel py-4 px-6 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                🖨️
              </div>
              <div>
                <h1 className="font-bold text-lg text-white tracking-tight">KioskPrint Express</h1>
                <p className="text-xs text-blue-400 font-medium">Self-Service Printing System V1</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Network Online
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
          {children}
        </main>

        <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-400 glass-panel mt-12">
          <p>© 2026 KioskPrint Network V1 — Authorized Self-Service Printing Platform</p>
        </footer>
      </body>
    </html>
  );
}
