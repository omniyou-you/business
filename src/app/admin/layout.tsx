"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, FileText, Cpu, BarChart3, Settings, 
  LogOut, Menu, X, ShieldCheck, User, Bell
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If on login page, render children without sidebar layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Print Jobs", href: "/admin/dashboard?tab=orders", icon: FileText },
    { label: "Kiosk Network", href: "/admin/dashboard?tab=kiosks", icon: Cpu },
    { label: "Analytics", href: "/admin/dashboard?tab=analytics", icon: BarChart3 },
    { label: "Settings", href: "/admin/dashboard?tab=settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex overflow-x-hidden">
      {/* DESKTOP SIDEBAR - LINEAR / VERCEL STYLE */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-zinc-800/80 bg-[#09090b] fixed inset-y-0 left-0 z-40 justify-between p-4">
        <div className="space-y-6">
          {/* Brand Identity Header */}
          <div className="flex items-center gap-3 px-3 py-2 border-b border-zinc-800/60 pb-4">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-white text-base shadow-sm">
              🖨️
            </div>
            <div>
              <h2 className="font-bold text-sm text-white tracking-tight leading-tight">KioskPrint Express</h2>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider">v1.0.0 · Production</span>
            </div>
          </div>

          {/* Navigation Links with Left Accent Indicator */}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (pathname === "/admin/dashboard" && item.href === "/admin/dashboard");
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? "text-white font-semibold bg-zinc-800/50"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                  }`}
                >
                  {/* Subtle Left Accent Line */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-500 rounded-r-full" />
                  )}
                  <Icon className={`w-4 h-4 ${active ? "text-blue-400" : "text-zinc-500"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Minimal Footer Profile Panel */}
        <div className="pt-4 border-t border-zinc-800/60 space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-300 text-xs font-mono">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white leading-none truncate">System Admin</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
        />
      )}

      {/* MOBILE SIDEBAR DRAWER */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#0c0c0e] border-r border-zinc-800 z-50 p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white text-base">🖨️</div>
              <h2 className="font-bold text-white text-sm">KioskPrint Express</h2>
            </div>
            <button onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs flex items-center justify-center gap-2 border border-red-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out Admin
        </button>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Minimal Header Navbar */}
        <header className="border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 py-3 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-semibold text-xs sm:text-sm text-white tracking-tight">Kiosk Network Console</h1>
              <p className="text-[11px] text-zinc-500 hidden sm:block">Self-Service Printing Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </div>
          </div>
        </header>

        {/* Page Content Container with Clean Padding */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
