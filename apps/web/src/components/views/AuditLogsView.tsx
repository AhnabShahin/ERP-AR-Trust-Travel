import React, { useState } from 'react';
import {
  ShieldCheck,
  Filter,
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  DollarSign,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SystemAuditLog } from '../../data/mockData';

export const AuditLogsView: React.FC = () => {
  const { systemLogs, rates, updateRates, language, t } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [editingRates, setEditingRates] = useState(false);
  const [tempUSD, setTempUSD] = useState(rates.USD);
  const [tempEUR, setTempEUR] = useState(rates.EUR);
  const [tempGBP, setTempGBP] = useState(rates.GBP);
  const [ratesSaved, setRatesSaved] = useState(false);

  const filtered = systemLogs.filter((l) => {
    const matchesCat = categoryFilter === 'ALL' || l.category === categoryFilter;
    const matchesSearch =
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateRates({
      USD: Number(tempUSD),
      EUR: Number(tempEUR),
      GBP: Number(tempGBP),
    });
    setEditingRates(false);
    setRatesSaved(true);
    setTimeout(() => setRatesSaved(false), 2500);
  };

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Super Admin Top Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Super Admin Executive Governance & System Audit
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full authority over foreign exchange rates, commission matrices, user permissions, and compliance logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingRates(!editingRates)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage QCB Exchange Rates</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* FX Rates Editor Drawer/Card (Super Admin Only) */}
      {editingRates && (
        <form onSubmit={handleSaveRates} className="p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>Official Qatar Central Bank (QCB) Peg & FX Override</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              Affects all Agent Desk POS conversions & multi-currency ledgers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <label className="text-slate-500 block mb-1">USD Peg (QAR per 1 USD)</label>
              <input
                type="number"
                step="0.01"
                value={tempUSD}
                onChange={(e) => setTempUSD(Number(e.target.value))}
                className="w-full font-bold text-base bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <label className="text-slate-500 block mb-1">EUR Peg (QAR per 1 EUR)</label>
              <input
                type="number"
                step="0.01"
                value={tempEUR}
                onChange={(e) => setTempEUR(Number(e.target.value))}
                className="w-full font-bold text-base bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <label className="text-slate-500 block mb-1">GBP Peg (QAR per 1 GBP)</label>
              <input
                type="number"
                step="0.01"
                value={tempGBP}
                onChange={(e) => setTempGBP(Number(e.target.value))}
                className="w-full font-bold text-base bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingRates(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
            >
              Apply Super Admin Peg
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          {['ALL', 'FINANCE', 'DISPATCH', 'POS', 'SECURITY', 'SYSTEM'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search audit events, actors, PNRs, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Event ID & Timestamp</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Audit Details & Context</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">{log.id}</span>
                    <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{log.actor}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.role}</div>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {log.action}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {log.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-[11px] max-w-md">
                    {log.details}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
