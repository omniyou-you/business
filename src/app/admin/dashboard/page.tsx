"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  DollarSign, FileCheck, Layers, Clock, RefreshCw, 
  TrendingUp, ArrowRight, ShieldCheck, Cpu, Settings, FileText
} from "lucide-react";

interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  completedJobs: number;
  activeJobs: number;
}

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      const data = await res.json();
      setStats(data.stats);
    } catch (err: any) {
      console.error("Fetch stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl relative overflow-hidden backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono font-medium mb-2">
              <TrendingUp className="w-3 h-3" />
              SYSTEM OVERVIEW & METRICS
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Printing Network Control Center</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Real-time telemetry, transaction volume, and operational nodes health.</p>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-2 border border-zinc-700/60 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross Sales Revenue */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2 backdrop-blur-sm hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Gross Sales Revenue</span>
              <div className="w-7 h-7 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center border border-zinc-700/50">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold tracking-tight text-white">${stats.totalRevenue.toFixed(2)}</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">+100% Paid</span>
            </div>
            <p className="text-xs text-zinc-400 pt-1">Total processed transactions</p>
          </div>

          {/* Total Print Orders */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2 backdrop-blur-sm hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Total Print Orders</span>
              <div className="w-7 h-7 rounded-lg bg-zinc-800 text-blue-400 flex items-center justify-center border border-zinc-700/50">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold tracking-tight text-white">{stats.totalOrders}</span>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">All Time</span>
            </div>
            <p className="text-xs text-zinc-400 pt-1">Total uploaded PDF documents</p>
          </div>

          {/* Active Paid Codes */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2 backdrop-blur-sm hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Active Paid Codes</span>
              <div className="w-7 h-7 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center border border-zinc-700/50">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold tracking-tight text-white">{stats.activeJobs}</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Kiosk Ready</span>
            </div>
            <p className="text-xs text-zinc-400 pt-1">Unclaimed codes ready for print release</p>
          </div>

          {/* Completed Prints */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2 backdrop-blur-sm hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">Completed Prints</span>
              <div className="w-7 h-7 rounded-lg bg-zinc-800 text-indigo-400 flex items-center justify-center border border-zinc-700/50">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-bold tracking-tight text-white">{stats.completedJobs}</span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">Purged R2</span>
            </div>
            <p className="text-xs text-zinc-400 pt-1">Printed & purged documents</p>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manage Print Jobs Link */}
        <Link 
          href="/admin/orders" 
          className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">Print Jobs Registry</h3>
                <p className="text-xs text-zinc-400">View orders table, search print codes, and inspect R2 files.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Manage Kiosk Hardware Link */}
        <Link 
          href="/admin/kiosks" 
          className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">Kiosk Network Manager</h3>
                <p className="text-xs text-zinc-400">Monitor physical kiosk pings, generate & revoke API Keys.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Revenue Analytics Link */}
        <Link 
          href="/admin/analytics" 
          className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">Revenue & Format Analytics</h3>
                <p className="text-xs text-zinc-400">Analyze paper sizes, color profile ratios, and sales velocity.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* System Settings Link */}
        <Link 
          href="/admin/settings" 
          className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">Pricing Rate & Infrastructure Config</h3>
                <p className="text-xs text-zinc-400">Configure base paper rates, color surcharges, and check DB status.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
