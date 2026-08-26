"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, FileText, Cpu, BarChart3, Settings, 
  LogOut, Menu, X, ShieldCheck, UserCheck, Bell
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
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex overflow-x-hidden">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-white/10 glass-panel fixed inset-y-0 left-0 z-40 justify-between p-4">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
              🖨️
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white tracking-tight leading-none">KioskPrint</h2>
              <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Admin Suite V1</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (pathname === "/admin/dashboard" && item.href === "/admin/dashboard");
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Admin User Badge */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between glass-card p-3 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none">System Admin</p>
                <p className="text-[10px] text-emerald-400 font-medium mt-0.5">● Session Active</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs flex items-center justify-center gap-2 border border-red-500/20 active:scale-95 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out Admin
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
        />
      )}

      {/* MOBILE SIDEBAR DRAWER */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#0d1322] border-r border-white/10 z-50 p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-lg">🖨️</div>
              <h2 className="font-extrabold text-white text-base">KioskPrint Admin</h2>
            </div>
            <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10"
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
          className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold text-xs flex items-center justify-center gap-2 border border-red-500/30"
        >
          <LogOut className="w-4 h-4" />
          Sign Out Admin
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <header className="border-b border-white/10 glass-panel sticky top-0 z-30 py-3.5 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">Enterprise Management Console</h1>
              <p className="text-[11px] text-gray-400 hidden sm:block">Self-Service Printing Network Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync Active
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 text-gray-300 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
