'use client';

// =====================================================================
// Reports Center — DB-driven business reporting over the existing tables
// (invoices, invoice payments, bookings, expenses, payroll, payment
// accounts). Fetches /api/reports/overview with a date range and renders
// KPIs, charts and breakdown tables across sub-tabs. CSV + print export.
// =====================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3, Loader2, Download, Printer, RefreshCw, TrendingUp, TrendingDown,
  FileText, CreditCard, Wallet, Receipt, Users, Compass, CalendarRange,
} from 'lucide-react';
import { api } from '../../../lib/api';
import type { ReportOverview } from '../../types';
import { GroupedBars, Donut, HBars, PALETTE } from '../reports/charts';

const money = (n: number | undefined) =>
  `QAR ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Preset = 'month' | 'year' | '30d' | 'all' | 'custom';
type Tab = 'overview' | 'sales' | 'receivables' | 'collections' | 'expenses' | 'bookings';

function rangeFor(preset: Preset, custom: { from: string; to: string }): { from?: string; to?: string } {
  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (preset === 'month') return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) };
  if (preset === 'year') return { from: `${now.getFullYear()}-01-01`, to: iso(now) };
  if (preset === '30d') return { from: iso(new Date(now.getTime() - 29 * 86400000)), to: iso(now) };
  if (preset === 'custom') return { from: custom.from || undefined, to: custom.to || undefined };
  return {};
}

export function ReportsCenterView() {
  const [preset, setPreset] = useState<Preset>('year');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [tab, setTab] = useState<Tab>('overview');
  const [data, setData] = useState<ReportOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const r = rangeFor(preset, custom);
      const qs = new URLSearchParams();
      if (r.from) qs.set('from', r.from);
      if (r.to) qs.set('to', r.to);
      const d = await api.get<ReportOverview>(`/api/reports/overview${qs.toString() ? `?${qs}` : ''}`);
      setData(d);
    } catch (e) {
      setErr(`Could not load reports: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [preset, custom]);

  useEffect(() => {
    // Custom only reloads when both dates set; presets reload immediately.
    if (preset === 'custom' && (!custom.from || !custom.to)) return;
    void load();
  }, [preset, custom, load]);

  const exportCsv = () => {
    if (!data) return;
    const rows: string[] = [];
    const push = (title: string, pairs: [string, string | number][]) => {
      rows.push(title);
      for (const [k, v] of pairs) rows.push(`"${k}","${v}"`);
      rows.push('');
    };
    const k = data.kpis;
    push('KPIs', [
      ['Invoiced total', k.invoicedTotal], ['Collected', k.collectedTotal], ['Outstanding', k.outstandingTotal],
      ['Invoices', k.invoiceCount], ['Bookings value', k.bookingTotal], ['Bookings', k.bookingCount],
      ['Expenses', k.expenseTotal], ['Payroll', k.payrollTotal], ['Gross revenue', k.grossRevenue], ['Net profit', k.netProfit],
    ]);
    rows.push('Monthly sales,Period,Invoiced,Bookings,Collected');
    for (const s of data.salesSeries) rows.push(`,"${s.period}",${s.invoiced},${s.bookings},${s.collected}`);
    rows.push('');
    push('Collections by account', data.collectionsByAccount.map((c) => [c.account, c.amount] as [string, number]));
    push('Expenses by category', data.expensesByCategory.map((c) => [c.label, c.amount] as [string, number]));
    push('Bookings by source', data.bookingsBySource.map((c) => [c.label, c.amount] as [string, number]));
    push('Top customers (invoiced / outstanding)', data.topCustomers.map((c) => [c.name, `${c.invoiced} / ${c.outstanding}`] as [string, string]));

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ar-trust-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const presets: { id: Preset; label: string }[] = [
    { id: 'month', label: 'This month' },
    { id: 'year', label: 'This year' },
    { id: '30d', label: 'Last 30 days' },
    { id: 'all', label: 'All time' },
    { id: 'custom', label: 'Custom' },
  ];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'sales', label: 'Sales & Revenue', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'receivables', label: 'Receivables', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'collections', label: 'Collections', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'expenses', label: 'Expenses', icon: <Receipt className="w-3.5 h-3.5" /> },
    { id: 'bookings', label: 'Bookings', icon: <Compass className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-500" /> Reports Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live business reporting from invoices, bookings, payments &amp; expenses.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void load()} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-teal-500" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={exportCsv} className="px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><Download className="w-4 h-4" /> CSV</button>
          <button onClick={() => window.print()} className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white flex items-center gap-1.5"><Printer className="w-4 h-4" /> Print</button>
        </div>
      </div>

      {/* Date range */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex flex-wrap items-center gap-2">
        <CalendarRange className="w-4 h-4 text-slate-400" />
        {presets.map((p) => (
          <button key={p.id} onClick={() => setPreset(p.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${preset === p.id ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
            {p.label}
          </button>
        ))}
        {preset === 'custom' && (
          <div className="flex items-center gap-2 ml-1">
            <input type="date" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
            <span className="text-slate-400 text-xs">to</span>
            <input type="date" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white" />
          </div>
        )}
      </div>

      {err && <div className="text-xs font-medium px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600">{err}</div>}

      {loading || !data ? (
        <div className="py-24 flex justify-center text-slate-400"><Loader2 className="w-7 h-7 animate-spin" /></div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi label="Gross revenue" value={money(data.kpis.grossRevenue)} tone="teal" icon={<TrendingUp className="w-4 h-4" />} sub={`${data.kpis.invoiceCount} invoices · ${data.kpis.bookingCount} bookings`} />
            <Kpi label="Collected" value={money(data.kpis.collectedTotal)} tone="green" icon={<CreditCard className="w-4 h-4" />} />
            <Kpi label="Outstanding" value={money(data.kpis.outstandingTotal)} tone="amber" icon={<Wallet className="w-4 h-4" />} sub="Across all open invoices" />
            <Kpi label="Net profit" value={money(data.kpis.netProfit)} tone={data.kpis.netProfit >= 0 ? 'green' : 'red'} icon={data.kpis.netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} sub={`Expenses ${money(data.kpis.expenseTotal)}`} />
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit max-w-full">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition ${tab === t.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && <OverviewTab data={data} />}
          {tab === 'sales' && (
            <Card title="Monthly sales & collections" icon={<TrendingUp className="w-4 h-4 text-teal-500" />}>
              <GroupedBars data={data.salesSeries as unknown as Array<Record<string, number | string>>} series={[
                { key: 'invoiced', label: 'Invoiced', color: PALETTE[0] },
                { key: 'bookings', label: 'Bookings', color: PALETTE[1] },
                { key: 'collected', label: 'Collected', color: PALETTE[2] },
              ]} />
              <SeriesTable data={data} />
            </Card>
          )}
          {tab === 'receivables' && <ReceivablesTab data={data} />}
          {tab === 'collections' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card title="Collections by account" icon={<Wallet className="w-4 h-4 text-teal-500" />}>
                <HBars items={data.collectionsByAccount.map((c) => ({ label: c.account, value: c.amount }))} format={money} />
              </Card>
              <Card title="Collections by method" icon={<CreditCard className="w-4 h-4 text-blue-500" />}>
                <HBars items={data.collectionsByMethod.map((c) => ({ label: c.method, value: c.amount }))} format={money} />
              </Card>
              <Card title="Payment account balances" icon={<Wallet className="w-4 h-4 text-emerald-500" />}>
                <SimpleTable rows={data.accountBalances.map((a) => [a.account, money(a.balance)])} head={['Account', 'Current balance']} />
              </Card>
            </div>
          )}
          {tab === 'expenses' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card title="Expenses by category" icon={<Receipt className="w-4 h-4 text-rose-500" />}>
                <HBars items={data.expensesByCategory.map((c) => ({ label: c.label, value: c.amount }))} format={money} />
              </Card>
              <Card title="Expenses by status" icon={<Receipt className="w-4 h-4 text-amber-500" />}>
                <HBars items={data.expensesByStatus.map((c) => ({ label: c.label, value: c.amount }))} format={money} />
              </Card>
            </div>
          )}
          {tab === 'bookings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card title="Bookings by source" icon={<Compass className="w-4 h-4 text-teal-500" />}>
                <HBars items={data.bookingsBySource.map((c) => ({ label: c.label, value: c.amount }))} format={money} />
              </Card>
              <Card title="Bookings by package" icon={<Compass className="w-4 h-4 text-blue-500" />}>
                <HBars items={data.bookingsByPackage.map((c) => ({ label: c.label, value: c.amount }))} format={money} />
              </Card>
              <Card title="Bookings by payment method" icon={<CreditCard className="w-4 h-4 text-amber-500" />}>
                <HBars items={data.bookingsByMethod.map((c) => ({ label: c.label, value: c.amount }))} format={money} />
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OverviewTab({ data }: { data: ReportOverview }) {
  return (
    <div className="space-y-4">
      <Card title="Monthly sales & collections" icon={<TrendingUp className="w-4 h-4 text-teal-500" />}>
        <GroupedBars data={data.salesSeries as unknown as Array<Record<string, number | string>>} series={[
          { key: 'invoiced', label: 'Invoiced', color: PALETTE[0] },
          { key: 'bookings', label: 'Bookings', color: PALETTE[1] },
          { key: 'collected', label: 'Collected', color: PALETTE[2] },
        ]} />
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Invoices by status" icon={<FileText className="w-4 h-4 text-teal-500" />}>
          <Donut
            centerValue={String(data.invoiceStatus.paid.count + data.invoiceStatus.partial.count + data.invoiceStatus.unpaid.count)}
            centerLabel="invoices"
            segments={[
              { label: 'Paid', value: data.invoiceStatus.paid.count, color: '#059669' },
              { label: 'Partial', value: data.invoiceStatus.partial.count, color: '#f59e0b' },
              { label: 'Unpaid', value: data.invoiceStatus.unpaid.count, color: '#dc2626' },
            ]}
          />
        </Card>
        <Card title="Collections by account" icon={<Wallet className="w-4 h-4 text-blue-500" />}>
          <HBars items={data.collectionsByAccount.map((c) => ({ label: c.account, value: c.amount }))} format={money} />
        </Card>
        <Card title="Expenses by category" icon={<Receipt className="w-4 h-4 text-rose-500" />}>
          <HBars items={data.expensesByCategory.map((c) => ({ label: c.label, value: c.amount }))} format={money} />
        </Card>
        <Card title="Top customers" icon={<Users className="w-4 h-4 text-teal-500" />}>
          <SimpleTable head={['Customer', 'Invoiced', 'Outstanding']} rows={data.topCustomers.map((c) => [c.name, money(c.invoiced), money(c.outstanding)])} />
        </Card>
      </div>
    </div>
  );
}

function ReceivablesTab({ data }: { data: ReportOverview }) {
  const a = data.receivablesAging;
  const buckets = [
    { label: '0–30 days (current)', value: a.current, color: '#059669' },
    { label: '31–60 days', value: a.d30, color: '#f59e0b' },
    { label: '61–90 days', value: a.d60, color: '#ea580c' },
    { label: '90+ days', value: a.d90plus, color: '#dc2626' },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Receivables aging (outstanding balance)" icon={<FileText className="w-4 h-4 text-amber-500" />}>
        <HBars items={buckets.map((b) => ({ label: b.label, value: b.value }))} format={money} />
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
          <span>Total outstanding</span><span>{money(data.kpis.outstandingTotal)}</span>
        </div>
      </Card>
      <Card title="Top customers by outstanding" icon={<Users className="w-4 h-4 text-rose-500" />}>
        <SimpleTable head={['Customer', 'Invoiced', 'Outstanding']} rows={[...data.topCustomers].sort((x, y) => y.outstanding - x.outstanding).map((c) => [c.name, money(c.invoiced), money(c.outstanding)])} />
      </Card>
    </div>
  );
}

function SeriesTable({ data }: { data: ReportOverview }) {
  return (
    <div className="mt-4">
      <SimpleTable head={['Month', 'Invoiced', 'Bookings', 'Collected']} rows={data.salesSeries.map((s) => [s.period, money(s.invoiced), money(s.bookings), money(s.collected)])} />
    </div>
  );
}

function Kpi({ label, value, sub, tone, icon }: { label: string; value: string; sub?: string; tone: 'teal' | 'green' | 'amber' | 'red'; icon: React.ReactNode }) {
  const tones = {
    teal: 'text-teal-600 dark:text-teal-400 bg-teal-500/10',
    green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
    red: 'text-red-600 dark:text-red-400 bg-red-500/10',
  }[tone];
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones}`}>{icon}</span>
      </div>
      <p className="text-lg font-black text-slate-900 dark:text-white mt-2 tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-slate-700 dark:text-slate-300">
      <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">{icon} {title}</h3>
      {children}
    </div>
  );
}

function SimpleTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  if (!rows.length) return <div className="py-6 text-center text-xs text-slate-400">No data for this period.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
            {head.map((h, i) => <th key={h} className={`py-2 font-semibold ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b border-slate-50 dark:border-slate-800/50 text-slate-700 dark:text-slate-200">
              {r.map((c, ci) => <td key={ci} className={`py-2 ${ci === 0 ? 'text-left font-medium text-slate-900 dark:text-white' : 'text-right tabular-nums'}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
