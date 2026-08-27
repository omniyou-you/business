"use client";

import { useState, useEffect } from "react";
import { 
  Cpu, Plus, Key, Check, Copy, RefreshCw, X
} from "lucide-react";

interface KioskNode {
  id: string;
  machine_id: string;
  location: string;
  api_key: string;
  status: string;
  created_at: string;
}

export default function AdminKiosksPage() {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<KioskNode[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [newMachineId, setNewMachineId] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchKiosks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kiosks");
      if (!res.ok) throw new Error("Failed to fetch kiosks");
      const data = await res.json();
      setNodes(data.kiosks || []);
    } catch (err: any) {
      console.error("Fetch kiosks error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKiosks();
  }, []);

  const handleAddKiosk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachineId || !newLocation) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/kiosks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machine_id: newMachineId,
          location: newLocation,
        }),
      });

      if (!res.ok) throw new Error("Failed to create kiosk");
      const data = await res.json();
      if (data.kiosk) {
        setNodes([data.kiosk, ...nodes]);
      }
      setNewMachineId("");
      setNewLocation("");
      setModalOpen(false);
    } catch (err: any) {
      console.error("Create kiosk error:", err);
      alert(err.message || "Failed to create kiosk");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRevoke = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "REVOKED" ? "ONLINE" : "REVOKED";
    try {
      const res = await fetch("/api/admin/kiosks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setNodes(
        nodes.map((n) => (n.id === id ? { ...n, status: nextStatus } : n))
      );
    } catch (err: any) {
      console.error("Revoke kiosk error:", err);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Kiosk Network Manager</h2>
          <p className="text-xs text-zinc-400">Real hardware node records stored in Supabase PostgreSQL ({nodes.length} registered nodes).</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchKiosks}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center gap-2 border border-zinc-700/60 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg glow-button text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Register New Kiosk Node
          </button>
        </div>
      </div>

      {/* Hardware Network Overview Panel */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <h3 className="font-bold text-white text-sm">PostgreSQL Kiosk Records ({nodes.length})</h3>
          <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
            ● {nodes.filter((n) => n.status === "ONLINE").length} Nodes Active
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-800/80 bg-zinc-950/40">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/60 font-semibold text-[11px] text-zinc-400 border-b border-zinc-800 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Machine ID</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Hardware API Key</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {nodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-zinc-500">
                    {loading ? "Loading database records..." : "No kiosk nodes registered yet in database. Click 'Register New Kiosk Node' above to add one!"}
                  </td>
                </tr>
              ) : (
                nodes.map((node) => (
                  <tr key={node.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-blue-400" />
                        {node.machine_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-200 font-medium">
                      {node.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 font-mono text-[11px]">
                        <Key className="w-3 h-3 text-zinc-500" />
                        <span className="text-zinc-400">
                          {node.api_key.slice(0, 14)}...
                        </span>
                        <button
                          onClick={() => copyKey(node.api_key)}
                          className="text-zinc-500 hover:text-white transition-colors"
                          title="Copy Secret API Key"
                        >
                          {copiedKey === node.api_key ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          node.status === "ONLINE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${node.status === 'ONLINE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                        {node.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleRevoke(node.id, node.status)}
                        className={`px-3 py-1 rounded-lg font-medium text-[11px] transition-colors border ${
                          node.status === "REVOKED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                        }`}
                      >
                        {node.status === "REVOKED" ? "Re-activate Node" : "Revoke API Key"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER NEW KIOSK MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl max-w-md w-full space-y-5 relative shadow-2xl">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-400 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Register Hardware Node</h3>
                <p className="text-[11px] text-zinc-500">Save new kiosk machine ID directly to PostgreSQL database.</p>
              </div>
            </div>

            <form onSubmit={handleAddKiosk} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Machine ID (e.g. KIOSK-MALL-01)</label>
                <input
                  type="text"
                  value={newMachineId}
                  onChange={(e) => setNewMachineId(e.target.value)}
                  placeholder="KIOSK-MALL-01"
                  className="w-full h-10 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Location Name & Address</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Downtown Mall, Level 2"
                  className="w-full h-10 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-medium text-xs border border-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg glow-button text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  {submitting ? "Saving to Database..." : "Save Node to PostgreSQL"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
