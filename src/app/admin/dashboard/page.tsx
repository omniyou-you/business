"use client";

import { useState, useEffect } from "react";
import { 
  DollarSign, FileCheck, Layers, Clock, Search, RefreshCw, 
  Copy, FileText, ExternalLink, X, Eye, TrendingUp, CheckCircle2, AlertCircle, QrCode
} from "lucide-react";

interface PrintJobRecord {
  order_id: string;
  print_code: string;
  pdf_file_id: string;
  file_name: string;
  file_storage_location: string;
  page_count: number;
  copies: number;
  paper_size: string;
  color_or_black_white: string;
  single_or_double_sided: string;
  orientation: string;
  scaling: string;
  calculated_price: number;
  payment_status: string;
  print_status: string;
  created_at: string;
  printed_at: string | null;
  machine_id: string | null;
}

interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  completedJobs: number;
  activeJobs: number;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<PrintJobRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<PrintJobRecord | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load dashboard stats");
      const data = await res.json();
      setStats(data.stats);
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_id.toLowerCase().includes(search.toLowerCase()) ||
      order.print_code.toLowerCase().includes(search.toLowerCase()) ||
      order.file_name.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "VERIFIED") return matchesSearch && order.payment_status === "VERIFIED";
    if (statusFilter === "COMPLETED") return matchesSearch && (order.print_status === "COMPLETED" || order.print_status === "PRINTED");
    if (statusFilter === "PENDING") return matchesSearch && order.payment_status === "PENDING";
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden border border-blue-500/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              SYSTEM PERFORMANCE OPTIMAL
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Printing Network Overview</h2>
            <p className="text-xs text-gray-400 mt-1">Real-time statistics, revenue tracking, and order verification history.</p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl glow-button text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Statistics
          </button>
        </div>
      </div>

      {/* 4 Professional Metric Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Revenue */}
          <div className="glass-panel p-5 rounded-3xl space-y-3 relative overflow-hidden border-t-2 border-t-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gross Sales Revenue</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">${stats.totalRevenue.toFixed(2)}</span>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+100% Paid</span>
            </div>
            <p className="text-[11px] text-gray-400">Total processed print transactions</p>
          </div>

          {/* Card 2: Total Orders */}
          <div className="glass-panel p-5 rounded-3xl space-y-3 relative overflow-hidden border-t-2 border-t-blue-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Print Orders</span>
              <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{stats.totalOrders}</span>
              <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">All Time</span>
            </div>
            <p className="text-[11px] text-gray-400">Total uploaded PDF documents</p>
          </div>

          {/* Card 3: Active Paid Codes */}
          <div className="glass-panel p-5 rounded-3xl space-y-3 relative overflow-hidden border-t-2 border-t-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Paid Codes</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{stats.activeJobs}</span>
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Kiosk Ready</span>
            </div>
            <p className="text-[11px] text-gray-400">Unclaimed codes ready for print release</p>
          </div>

          {/* Card 4: Completed Jobs */}
          <div className="glass-panel p-5 rounded-3xl space-y-3 relative overflow-hidden border-t-2 border-t-indigo-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed Prints</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <FileCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{stats.completedJobs}</span>
              <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">Purged R2</span>
            </div>
            <p className="text-[11px] text-gray-400">Successfully printed & purged documents</p>
          </div>
        </div>
      )}

      {/* Orders Filter & Search Control */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Database Order Registry</h3>
            <p className="text-xs text-gray-400">Search and manage print records across PostgreSQL database.</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {["ALL", "VERIFIED", "COMPLETED", "PENDING"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-blue-400/30"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID (e.g. ORD-2026-873062), 6-Digit Code (e.g. 661388), or File Name..."
            className="w-full h-11 rounded-2xl bg-white/5 border border-white/10 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Professional Orders Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 glass-card">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-white/5 uppercase font-bold text-[11px] text-gray-400 border-b border-white/10 tracking-wider">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Print Code</th>
                <th className="p-4">File Document</th>
                <th className="p-4">Pages/Copies</th>
                <th className="p-4">Specs</th>
                <th className="p-4">Price</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Print Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-12 text-gray-500">
                    No print jobs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="p-4 font-mono font-bold text-white whitespace-nowrap">
                      {order.order_id}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
                        <span className="font-mono font-extrabold text-blue-400 tracking-wider">
                          {order.print_code}
                        </span>
                        <button
                          onClick={() => copyCode(order.print_code)}
                          title="Copy Code"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-white max-w-[180px] truncate">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{order.file_name}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-white whitespace-nowrap">
                      {order.page_count} pg × {order.copies} copy
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="bg-white/5 px-2.5 py-1 rounded-lg text-[11px] font-mono text-gray-300 border border-white/5">
                        {order.paper_size} · {order.color_or_black_white === "color" ? "COLOR" : "B&W"} · {order.single_or_double_sided === "double" ? "DUPLEX" : "SINGLE"}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-emerald-400 whitespace-nowrap text-sm">
                      ${order.calculated_price.toFixed(2)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.payment_status === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${order.payment_status === 'VERIFIED' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.print_status === "COMPLETED" || order.print_status === "PRINTED"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                            : order.print_status === "AUTHORIZED"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {order.print_status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white text-gray-300 font-semibold text-[11px] transition-all border border-white/10"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INTERACTIVE ORDER INSPECTION MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-6 border border-blue-500/40 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">Order Details</h3>
                <p className="text-xs text-gray-400">PostgreSQL ID: {selectedOrder.order_id}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Print Code Card */}
              <div className="glass-card p-4 rounded-2xl text-center space-y-2 border border-blue-500/30">
                <span className="text-[11px] font-semibold text-gray-400 uppercase">Kiosk Verification Code</span>
                <div className="text-4xl font-extrabold text-blue-400 code-badge tracking-widest font-mono">
                  {selectedOrder.print_code}
                </div>
              </div>

              {/* Specs Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-[10px] text-gray-400">File Name</p>
                  <p className="font-semibold text-white truncate" title={selectedOrder.file_name}>{selectedOrder.file_name}</p>
                </div>
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-[10px] text-gray-400">Pages & Copies</p>
                  <p className="font-semibold text-white">{selectedOrder.page_count} pg × {selectedOrder.copies} copies</p>
                </div>
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-[10px] text-gray-400">Paper Format</p>
                  <p className="font-semibold text-white">{selectedOrder.paper_size}</p>
                </div>
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-[10px] text-gray-400">Color & Sidedness</p>
                  <p className="font-semibold text-white">
                    {selectedOrder.color_or_black_white.toUpperCase()} · {selectedOrder.single_or_double_sided.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Price & Storage Location */}
              <div className="glass-card p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Paid Price:</span>
                  <span className="font-extrabold text-emerald-400 text-base">${selectedOrder.calculated_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">Cloudflare R2 Link:</span>
                  {selectedOrder.file_storage_location.startsWith("http") ? (
                    <a
                      href={selectedOrder.file_storage_location}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 font-mono font-medium truncate max-w-[200px]"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      View R2 File
                    </a>
                  ) : (
                    <span className="text-gray-400 font-mono">Local Disk</span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-gray-400 text-center pt-2">
                Created At: {new Date(selectedOrder.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
