import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Self-Service Print Kiosk — Web Portal & Admin Console",
  description: "Upload your PDF, select printing options, pay, and manage kiosk operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#09090b] text-zinc-100 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
