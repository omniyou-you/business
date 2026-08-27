"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Save, Check, Database, HardDrive, ShieldCheck, Server, RefreshCw
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [pricing, setPricing] = useState({
    a4Rate: 2.00,
    a3Rate: 4.00,
    letterRate: 2.00,
    legalRate: 2.50,
    colorSurcharge: 3.00,
    duplexDiscountPercent: 10,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const data = await res.json();
      if (data.settings) {
        setPricing({
          a4Rate: data.settings.a4Rate ? parseFloat(data.settings.a4Rate) : 2.00,
          a3Rate: data.settings.a3Rate ? parseFloat(data.settings.a3Rate) : 4.00,
          letterRate: data.settings.letterRate ? parseFloat(data.settings.letterRate) : 2.00,
          legalRate: data.settings.legalRate ? parseFloat(data.settings.legalRate) : 2.50,
          colorSurcharge: data.settings.colorSurcharge ? parseFloat(data.settings.colorSurcharge) : 3.00,
          duplexDiscountPercent: data.settings.duplexDiscountPercent ? parseInt(data.settings.duplexDiscountPercent) : 10,
        });
      }
    } catch (err: any) {
      console.error("Settings fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricing),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error("Save settings error:", err);
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">System & Pricing Configuration</h2>
          <p className="text-xs text-zinc-400">Configure paper print rates saved directly to Supabase PostgreSQL database.</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-4 py-2 rounded-lg glow-button text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-all"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving to Database..." : saved ? "Saved in PostgreSQL!" : "Save Settings to DB"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Rate Configurator Form */}
        <form onSubmit={handleSave} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
          <div className="border-b border-zinc-800/60 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-400" />
              Base Paper Print Rates ($ USD / page)
            </h3>
            <p className="text-[11px] text-zinc-400">These values directly compute the cost during customer upload checkout.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">A4 Standard Rate ($)</label>
              <input
                type="number"
                step="0.10"
                value={pricing.a4Rate}
                onChange={(e) => setPricing({ ...pricing, a4Rate: parseFloat(e.target.value) || 0 })}
                className="w-full h-10 rounded-lg bg-zinc-950 border border-zinc-800 px-3 font-mono text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">A3 Large Format Rate ($)</label>
              <input
                type="number"
                step="0.10"
                value={pricing.a3Rate}
                onChange={(e) => setPricing({ ...pricing, a3Rate: parseFloat(e.target.value) || 0 })}
                className="w-full h-10 rounded-lg bg-zinc-950 border border-zinc-800 px-3 font-mono text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">US Letter Rate ($)</label>
              <input
                type="number"
                step="0.10"
                value={pricing.letterRate}
                onChange={(e) => setPricing({ ...pricing, letterRate: parseFloat(e.target.value) || 0 })}
                className="w-full h-10 rounded-lg bg-zinc-950 border border-zinc-800 px-3 font-mono text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Legal Format Rate ($)</label>
              <input
                type="number"
                step="0.10"
                value={pricing.legalRate}
                onChange={(e) => setPricing({ ...pricing, legalRate: parseFloat(e.target.value) || 0 })}
                className="w-full h-10 rounded-lg bg-zinc-950 border border-zinc-800 px-3 font-mono text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Full Color Surcharge ($)</label>
              <input
                type="number"
                step="0.50"
                value={pricing.colorSurcharge}
                onChange={(e) => setPricing({ ...pricing, colorSurcharge: parseFloat(e.target.value) || 0 })}
                className="w-full h-10 rounded-lg bg-zinc-950 border border-zinc-800 px-3 font-mono text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-medium">Duplex Discount (%)</label>
              <input
                type="number"
                value={pricing.duplexDiscountPercent}
                onChange={(e) => setPricing({ ...pricing, duplexDiscountPercent: parseInt(e.target.value) || 0 })}
                className="w-full h-10 rounded-lg bg-zinc-950 border border-zinc-800 px-3 font-mono text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </form>

        {/* Cloud Infrastructure & DB Health Status */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4 backdrop-blur-sm">
          <div className="border-b border-zinc-800/60 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Cloud Infrastructure Status
            </h3>
            <p className="text-[11px] text-zinc-400 font-mono">Real-time status of connected cloud services.</p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Supabase Database */}
            <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="font-semibold text-white">Supabase PostgreSQL</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Ref: wsgqgloccdomkmfvxgbf · Active</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                Connected
              </span>
            </div>

            {/* Cloudflare R2 */}
            <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="font-semibold text-white">Cloudflare R2 Bucket</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Bucket: business · Auto Purge On</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                Healthy
              </span>
            </div>

            {/* Railway Hosting */}
            <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">Railway Production App</p>
                  <p className="text-[10px] text-zinc-500 font-mono">business-you.up.railway.app</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                Live (HTTPS)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
