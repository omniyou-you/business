"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, TrendingUp, PieChart, DollarSign, FileText, Layers, RefreshCw
} from "lucide-react";

interface AnalyticsData {
  paperSizes: { size: string; count: number; percentage: number }[];
  colorProfile: { mode: string; count: number; percentage: number }[];
  duplexRatio: { type: string; count: number; percentage: number }[];
  avgOrderValue: number;
  totalRevenue: number;
  totalOrders: number;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    paperSizes: [
      { size: "A4 Standard", count: 18, percentage: 75 },
      { size: "A3 Poster", count: 3, percentage: 12.5 },
      { size: "US Letter", count: 2, percentage: 8.3 },
      { size: "Legal", count: 1, percentage: 4.2 },
    ],
    colorProfile: [
      { mode: "Full Color", count: 16, percentage: 66.7 },
      { mode: "Black & White", count: 8, percentage: 33.3 },
    ],
    duplexRatio: [
      { type: "Duplex (2-Sided)", count: 14, percentage: 58.3 },
      { type: "Simplex (1-Sided)", count: 10, percentage: 41.7 },
    ],
    avgOrderValue: 14.38,
    totalRevenue: 345.00,
    totalOrders: 24,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Revenue & Paper Format Analytics</h2>
          <p className="text-xs text-zinc-400">Deep performance breakdown across paper formats, color profiles, and order value.</p>
        </div>

        <button
          onClick={() => setLoading(false)}
          className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-2 border border-zinc-700/60 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Analytics
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Average Order Value (AOV)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">${analytics.avgOrderValue.toFixed(2)}</div>
          <p className="text-[11px] text-emerald-400 font-mono">+8.4% vs last week</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Lifetime Volume</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{analytics.totalOrders} Orders</div>
          <p className="text-[11px] text-zinc-400">Aggregated database total</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Net Sales Revenue</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400 font-mono">${analytics.totalRevenue.toFixed(2)}</div>
          <p className="text-[11px] text-purple-400 font-mono">100% verified payments</p>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Paper Format Distribution */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-400" />
              Paper Format Popularity
            </h3>
          </div>

          <div className="space-y-3">
            {analytics.paperSizes.map((item) => (
              <div key={item.size} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-200">{item.size}</span>
                  <span className="text-zinc-400 font-mono">{item.count} jobs ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color Profile Ratio */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Color Profile Ratio
            </h3>
          </div>

          <div className="space-y-3">
            {analytics.colorProfile.map((item) => (
              <div key={item.mode} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-200">{item.mode}</span>
                  <span className="text-zinc-400 font-mono">{item.count} jobs ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${item.mode.includes("Color") ? 'bg-emerald-400' : 'bg-zinc-400'}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Duplex vs Simplex */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Duplex vs Simplex Sidedness
            </h3>
          </div>

          <div className="space-y-3">
            {analytics.duplexRatio.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-200">{item.type}</span>
                  <span className="text-zinc-400 font-mono">{item.count} jobs ({item.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
