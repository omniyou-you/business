"use client";

import { useState, useEffect } from "react";
import { 
  Search, RefreshCw, Copy, FileText, ExternalLink, X, Eye
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

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<PrintJobRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<PrintJobRecord | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Print Jobs Registry</h2>
          <p className="text-xs text-zinc-400">Search and manage print records across Supabase PostgreSQL database.</p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-2 border border-zinc-700/60 active:scale-95 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Orders
        </button>
      </div>

      {/* Database Order Registry Panel */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 border-b border-zinc-800/60 pb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID (e.g. ORD-2026-873062), 6-Digit Code (e.g. 661388), or File Name..."
              className="w-full h-10 rounded-lg bg-zinc-950/80 border border-zinc-800 pl-10 pr-4 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {["ALL", "VERIFIED", "COMPLETED", "PENDING"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-zinc-800 text-white font-semibold border border-zinc-700"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Table Layout */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800/80 bg-zinc-950/40">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/60 font-semibold text-[11px] text-zinc-400 border-b border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Print Code</th>
                <th className="px-6 py-3.5">Document File</th>
                <th className="px-6 py-3.5">Pages & Copies</th>
                <th className="px-6 py-3.5">Specs</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Payment</th>
                <th className="px-6 py-3.5">Print Status</th>
                <th className="px-6 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-zinc-500">
                    No print jobs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.order_id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-white whitespace-nowrap">
                      {order.order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                        <span className="font-mono font-bold text-blue-400 tracking-wider text-xs">
                          {order.print_code}
                        </span>
                        <button
                          onClick={() => copyCode(order.print_code)}
                          title="Copy Code"
                          className="text-zinc-500 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white max-w-[180px] truncate">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        <span className="truncate">{order.file_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-300 whitespace-nowrap">
                      {order.page_count} pg × {order.copies} copy
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-zinc-900 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 border border-zinc-800">
                        {order.paper_size} · {order.color_or_black_white === "color" ? "COLOR" : "B&W"} · {order.single_or_double_sided === "double" ? "DUPLEX" : "SINGLE"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400 whitespace-nowrap">
                      ${order.calculated_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          order.payment_status === "VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${order.payment_status === 'VERIFIED' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          order.print_status === "COMPLETED" || order.print_status === "PRINTED"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                            : order.print_status === "AUTHORIZED"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {order.print_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-[11px] transition-colors border border-zinc-800"
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

      {/* SLEEK DARK ZINC ORDER INSPECTOR MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl max-w-lg w-full space-y-5 relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Order Details</h3>
                <p className="text-[11px] text-zinc-500 font-mono">ID: {selectedOrder.order_id}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Verification Code</span>
                <div className="text-3xl font-bold text-blue-400 font-mono tracking-widest">
                  {selectedOrder.print_code}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-zinc-900/40 border border-zinc-800/60 p-3 rounded-lg">
                  <p className="text-[10px] text-zinc-500">File Document</p>
                  <p className="font-semibold text-white truncate" title={selectedOrder.file_name}>{selectedOrder.file_name}</p>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/60 p-3 rounded-lg">
                  <p className="text-[10px] text-zinc-500">Pages & Copies</p>
                  <p className="font-semibold text-white">{selectedOrder.page_count} pg × {selectedOrder.copies} copies</p>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/60 p-3 rounded-lg">
                  <p className="text-[10px] text-zinc-500">Paper Format</p>
                  <p className="font-semibold text-white">{selectedOrder.paper_size}</p>
                </div>
                <div className="bg-zinc-900/40 border border-zinc-800/60 p-3 rounded-lg">
                  <p className="text-[10px] text-zinc-500">Color & Sidedness</p>
                  <p className="font-semibold text-white">
                    {selectedOrder.color_or_black_white.toUpperCase()} · {selectedOrder.single_or_double_sided.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/60 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Total Price:</span>
                  <span className="font-bold text-emerald-400 text-base">${selectedOrder.calculated_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400">Cloudflare R2 Link:</span>
                  {selectedOrder.file_storage_location.startsWith("http") ? (
                    <a
                      href={selectedOrder.file_storage_location}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 font-mono font-medium truncate max-w-[200px]"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      View File
                    </a>
                  ) : (
                    <span className="text-zinc-500 font-mono">Local Storage</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
