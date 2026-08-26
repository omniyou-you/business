"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  DollarSign, FileCheck, Layers, Clock, Search, RefreshCw, 
  LogOut, ShieldCheck, Printer, CheckCircle2, AlertCircle, Copy, FileText
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<PrintJobRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load dashboard data");

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

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter orders based on search string and status filter
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
    <div className="space-y-6 sm:space-y-8">
      {/* Dashboard Top Navigation */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Kiosk Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Live order metrics, sales analytics, and PostgreSQL database manager.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs flex items-center justify-center gap-2 border border-red-500/20 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Revenue */}
          <div className="glass-panel p-5 rounded-3xl space-y-3 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
              <span>Total Sales Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">${stats.totalRevenue.toFixed(2)}</p>
            <p className="text-[11px] text-emerald-400 font-medium">Verified Paid Revenue</p>
          </div>

          {/* Total Orders */}
          <div className="glass-panel p-5 rounded-3xl space-y-3 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
              <span>Total Orders Created</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{stats.totalOrders}</p>
            <p className="text-[11px] text-blue-400 font-medium">All System Print Requests</p>
          </div>

          {/* Active Paid Jobs */}
          <div className="glass-panel p-5 rounded-3xl space-y-3 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
              <span>Active Paid Codes</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{stats.activeJobs}</p>
            <p className="text-[11px] text-amber-400 font-medium">Unclaimed Kiosk Codes</p>
          </div>

          {/* Completed Prints */}
          <div className="glass-panel p-5 rounded-3xl space-y-3 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold">
              <span>Completed Kiosk Prints</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight">{stats.completedJobs}</p>
            <p className="text-[11px] text-indigo-400 font-medium">Printed Documents</p>
          </div>
        </div>
      )}

      {/* Orders Filter & Search Control */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, Print Code (e.g. 583921), or Filename..."
              className="w-full h-11 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {["ALL", "VERIFIED", "COMPLETED", "PENDING"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Database Orders Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-white/5 uppercase font-semibold text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Print Code</th>
                <th className="p-3.5">File Name</th>
                <th className="p-3.5">Pages</th>
                <th className="p-3.5">Specs</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Print Status</th>
                <th className="p-3.5">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-8 text-gray-500">
                    No print jobs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-white whitespace-nowrap">
                      {order.order_id}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                          {order.print_code}
                        </span>
                        <button
                          onClick={() => copyCode(order.print_code)}
                          title="Copy Code"
                          className="p-1 hover:text-white text-gray-400"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-white max-w-[150px] truncate" title={order.file_name}>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="truncate">{order.file_name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-semibold text-white whitespace-nowrap">
                      {order.page_count} pg × {order.copies}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="bg-white/5 px-2 py-0.5 rounded text-[11px] font-mono text-gray-300">
                        {order.paper_size} | {order.color_or_black_white === "color" ? "COLOR" : "B&W"} | {order.single_or_double_sided === "double" ? "DUPLEX" : "SINGLE"}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-400 whitespace-nowrap">
                      ${order.calculated_price.toFixed(2)}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          order.payment_status === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          order.print_status === "COMPLETED" || order.print_status === "PRINTED"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : order.print_status === "AUTHORIZED"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-gray-800 text-gray-400"
                        }`}
                      >
                        {order.print_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-400 whitespace-nowrap text-[11px]">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
