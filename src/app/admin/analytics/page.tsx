"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, TrendingUp, PieChart, DollarSign, Layers, RefreshCw, FileText
} from "lucide-react";

interface PrintJobRecord {
  calculated_price: number;
  payment_status: string;
  paper_size: string;
  color_or_black_white: string;
  single_or_double_sided: string;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PrintJobRecord[]>([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalOrders = orders.length;

  const totalRevenue = orders
    .filter((o) => o.payment_status === "VERIFIED")
    .reduce((sum, o) => sum + o.calculated_price, 0);

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Real Paper Format Breakdown
  const paperCounts: Record<string, number> = {};
  orders.forEach((o) => {
    const size = o.paper_size || "A4";
    paperCounts[size] = (paperCounts[size] || 0) + 1;
  });

  const paperSizesList = Object.entries(paperCounts).map(([size, count]) => ({
    size,
    count,
    percentage: totalOrders > 0 ? Number(((count / totalOrders) * 100).toFixed(1)) : 0,
  }));

  // Real Color Mode Ratio
  let colorCount = 0;
  let bwCount = 0;
  orders.forEach((o) => {
    if ((o.color_or_black_white || "").toLowerCase() === "color") colorCount++;
    else bwCount++;
  });

  const colorProfileList = [
    { mode: "Full Color", count: colorCount, percentage: totalOrders > 0 ? Number(((colorCount / totalOrders) * 100).toFixed(1)) : 0 },
    { mode: "Black & White", count: bwCount, percentage: totalOrders > 0 ? Number(((bwCount / totalOrders) * 100).toFixed(1)) : 0 },
  ];

  // Real Duplex Ratio
  let duplexCount = 0;
  let singleCount = 0;
  orders.forEach((o) => {
    if ((o.single_or_double_sided || "").toLowerCase() === "double") duplexCount++;
    else singleCount++;
  });

  const duplexRatioList = [
    { type: "Duplex (2-Sided)", count: duplexCount, percentage: totalOrders > 0 ? Number(((duplexCount / totalOrders) * 100).toFixed(1)) : 0 },
    { type: "Simplex (1-Sided)", count: singleCount, percentage: totalOrders > 0 ? Number(((singleCount / totalOrders) * 100).toFixed(1)) : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header - Always 100% Visible on Frame 1 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Revenue & Paper Format Analytics</h2>
          <p className="text-xs text-zinc-400">Real database metrics computed live from Supabase PostgreSQL ({totalOrders} orders).</p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-2 border border-zinc-700/60 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Analytics
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3 animate-pulse">
              <div className="flex justify-between items-center"><div className="h-3.5 w-32 bg-zinc-800 rounded" /><div className="w-4 h-4 bg-zinc-800 rounded" /></div>
              <div className="h-8 w-24 bg-zinc-700/80 rounded-md" />
              <div className="h-3 w-36 bg-zinc-800/60 rounded" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Average Order Value (AOV)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white font-mono">${avgOrderValue.toFixed(2)}</div>
              <p className="text-[11px] text-emerald-400 font-mono">Live PostgreSQL database average</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Total Print Orders</span>
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white font-mono">{totalOrders} Orders</div>
              <p className="text-[11px] text-zinc-400">Aggregated database total</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-2 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">Total Net Sales Revenue</span>
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400 font-mono">${totalRevenue.toFixed(2)}</div>
              <p className="text-[11px] text-purple-400 font-mono">100% verified payments</p>
            </div>
          </>
        )}
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
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1 animate-pulse"><div className="h-4 bg-zinc-800/60 rounded" /><div className="h-2 bg-zinc-800/40 rounded" /></div>
              ))
            ) : paperSizesList.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No paper format records in database.</p>
            ) : (
              paperSizesList.map((item) => (
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
              ))
            )}
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
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-1 animate-pulse"><div className="h-4 bg-zinc-800/60 rounded" /><div className="h-2 bg-zinc-800/40 rounded" /></div>
              ))
            ) : (
              colorProfileList.map((item) => (
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
              ))
            )}
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
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-1 animate-pulse"><div className="h-4 bg-zinc-800/60 rounded" /><div className="h-2 bg-zinc-800/40 rounded" /></div>
              ))
            ) : (
              duplexRatioList.map((item) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
