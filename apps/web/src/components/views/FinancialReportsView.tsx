import React, { useState } from 'react';
import {
  TrendingUp,
  FileText,
  DollarSign,
  Download,
  Calendar,
  CreditCard,
  Banknote,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Users,
  Car,
  PieChart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DateFilterBar } from '../common/DateFilterBar';
import { matchesDateFilter } from '../../utils/dateFilter';

export const FinancialReportsView: React.FC = () => {
  const {
    convertAmount,
    currency,
    rates,
    salaryRecords,
    expenses,
    bookings,
    language,
    dateFilter,
    setDateFilter,
    t,
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'sales' | 'agents' | 'driver-earnings'>('pnl');

  // Filter Bookings & Expenses by Date Filter
  const filteredBookings = bookings.filter((b) => matchesDateFilter(b.createdAt, dateFilter));
  const filteredExpenses = expenses.filter((e) => matchesDateFilter(e.date, dateFilter));

  // P&L Metrics
  const grossRevenueQAR = filteredBookings.reduce((sum, b) => sum + b.totalQAR, 0);
  const totalSalariesQAR = salaryRecords.reduce((sum, s) => sum + s.fixedBaseMonthlyQAR / 30, 0); // daily pro-rated
  const totalCommissionsQAR = salaryRecords.reduce((sum, s) => sum + s.accruedCommissionQAR, 0);
  const totalExpensesQAR = filteredExpenses.reduce((sum, e) => sum + e.amountQAR, 0);
  const netProfitQAR = grossRevenueQAR - totalSalariesQAR - totalCommissionsQAR - totalExpensesQAR;
  const profitMargin = grossRevenueQAR > 0 ? ((netProfitQAR / grossRevenueQAR) * 100).toFixed(1) : '0.0';

  // Sales split
  const onlineWebSalesQAR = filteredBookings
    .filter(
      (b) =>
        b.source === 'Website Direct Lead' ||
        b.source === 'Web Integration API' ||
        b.source === 'Online Web' ||
        b.source === 'Website Online Gateway' ||
        b.source === 'Website Online Lead'
    )
    .reduce((sum, b) => sum + b.totalQAR, 0);
  const cashDeskSalesQAR = filteredBookings
    .filter((b) => b.paymentMethod === 'Cash')
    .reduce((sum, b) => sum + b.totalQAR, 0);
  const posCardSalesQAR = filteredBookings
    .filter((b) => b.paymentMethod === 'POS Card')
    .reduce((sum, b) => sum + b.totalQAR, 0);

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {language === 'ar' ? 'التقارير المالية والأرباح التشغيلية (P&L Insights)' : 'Reporting, Financial Insights & P&L Statement'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time gross bookings, multi-currency collections, staff payroll deductions & net operational margin
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs">
            <button
              onClick={() => setActiveReportTab('pnl')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeReportTab === 'pnl'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Profitability & P&L
            </button>
            <button
              onClick={() => setActiveReportTab('sales')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeReportTab === 'sales'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Daily Sales & Channels
            </button>
            <button
              onClick={() => setActiveReportTab('agents')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeReportTab === 'agents'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Agent Performance
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* Date & Year Filter Engine */}
      <DateFilterBar
        filter={dateFilter}
        onChange={setDateFilter}
        totalCount={bookings.length}
        filteredCount={filteredBookings.length}
        label={language === 'ar' ? 'تصفية التقارير المالية والأرباح بالسنة' : 'Financial Reports Date & Year Filter'}
      />

      {/* View 1: Profitability & P&L Overview */}
      {activeReportTab === 'pnl' && (
        <div className="space-y-4">
          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">GROSS BOOKINGS INCOME</span>
              <div className="mt-2 text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {convertAmount(grossRevenueQAR).formatted}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                {bookings.length} reservations unified
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">DAILY STAFF PAYROLL & COMM.</span>
              <div className="mt-2 text-2xl font-black font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                {convertAmount(totalSalariesQAR + totalCommissionsQAR).formatted}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                5 Active Staff on Roster
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">OPERATIONAL EXPENSES</span>
              <div className="mt-2 text-2xl font-black font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                {convertAmount(totalExpensesQAR).formatted}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Fuel, HIA Permits, Camp Refreshments
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 text-white shadow-md">
              <span className="text-[11px] font-bold text-emerald-100 uppercase font-mono">NET OPERATIONAL PROFIT</span>
              <div className="mt-2 text-2xl font-black font-mono tabular-nums">
                {convertAmount(netProfitQAR).formatted}
              </div>
              <span className="text-[10px] text-emerald-100 font-mono mt-1 block font-bold">
                ★ {profitMargin}% Net Margin
              </span>
            </div>
          </div>

          {/* Formal P&L Statement Grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>Executive Profit & Loss Statement (P&L)</span>
              </h3>
              <span className="font-mono text-xs text-slate-400">
                Period: Current Operating Cycle (QAR Pegged)
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Income */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                  <span>1. Gross Operating Revenue</span>
                  <span>{convertAmount(grossRevenueQAR).formatted}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] pl-4">
                  <span>Direct Website Online Gateway (artrusttravel.com API)</span>
                  <span>{convertAmount(onlineWebSalesQAR).formatted}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] pl-4">
                  <span>Agent Desk POS Card Terminals (HIA & Hotel Stations)</span>
                  <span>{convertAmount(posCardSalesQAR).formatted}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] pl-4">
                  <span>Agent Desk Cash Drawer Collections</span>
                  <span>{convertAmount(cashDeskSalesQAR).formatted}</span>
                </div>
              </div>

              {/* Cost of Operations */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400 text-sm">
                  <span>2. Operating Costs & Direct Staff Compensation</span>
                  <span>- {convertAmount(totalSalariesQAR + totalCommissionsQAR + totalExpensesQAR).formatted}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] pl-4">
                  <span>Field Chauffeur & Tour Guide Performance Commissions</span>
                  <span>- {convertAmount(totalCommissionsQAR).formatted}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] pl-4">
                  <span>Employee Monthly Fixed Salaries (Pro-rated Daily)</span>
                  <span>- {convertAmount(totalSalariesQAR).formatted}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px] pl-4">
                  <span>Fleet Fuel (Woqod), HIA Gate Access, Camp Maintenance</span>
                  <span>- {convertAmount(totalExpensesQAR).formatted}</span>
                </div>
              </div>

              {/* Net Profit Bar */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/50 flex justify-between items-baseline font-black text-base text-emerald-800 dark:text-emerald-300">
                <span>Net Operational Profit (EBITDA Equivalent):</span>
                <span>{convertAmount(netProfitQAR).formatted}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Daily Sales & Collections Breakdown */}
      {activeReportTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Payment Method Split */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>Revenue by Payment Instrument</span>
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2 font-sans font-bold text-slate-800 dark:text-slate-200">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Website Online Gateway (Visa/MC/Stripe)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {convertAmount(onlineWebSalesQAR).formatted}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2 font-sans font-bold text-slate-800 dark:text-slate-200">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Airport POS Card Terminals (QNB NAPS)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {convertAmount(posCardSalesQAR).formatted}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2 font-sans font-bold text-slate-800 dark:text-slate-200">
                  <Banknote className="w-4 h-4 text-amber-500" />
                  <span>Physical Cash Drawer Tender (Multi-Currency)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {convertAmount(cashDeskSalesQAR).formatted}
                </span>
              </div>
            </div>
          </div>

          {/* Currency Split */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-500" />
              <span>Multi-Currency Cash Breakdown (Pegged Equivalents)</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between">
                <span>Qatari Riyal (QAR Base)</span>
                <span className="font-bold text-slate-900 dark:text-white">56.4% of volume</span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between">
                <span>US Dollar ($ USD · Peg: 3.64)</span>
                <span className="font-bold text-slate-900 dark:text-white">26.0% of volume</span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between">
                <span>Euro (€ EUR · Peg: 3.96)</span>
                <span className="font-bold text-slate-900 dark:text-white">11.8% of volume</span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between">
                <span>British Pound (£ GBP · Peg: 4.74)</span>
                <span className="font-bold text-slate-900 dark:text-white">5.8% of volume</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Agent Performance & Commission Statements */}
      {activeReportTab === 'agents' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Airport Transit Desk Agent Production & Commission Statements
            </h3>
            <span className="font-mono text-xs text-slate-400">
              Rule: {convertAmount(25).formatted} Incentive per Walk-In Transit Booking
            </span>
          </div>

          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left rtl:text-right border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Assigned Station</th>
                <th className="py-3 px-4 text-center">Bookings Created</th>
                <th className="py-3 px-4 text-right rtl:text-left">Gross Sales Volume</th>
                <th className="py-3 px-4 text-right rtl:text-left">Accrued Commission</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">Zaid Qasim</td>
                <td className="py-3 px-4 text-slate-500 font-sans">HIA Counter 4 Arrivals</td>
                <td className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400">75 Bookings</td>
                <td className="py-3 px-4 text-right rtl:text-left">{convertAmount(48900).formatted}</td>
                <td className="py-3 px-4 text-right rtl:text-left font-black text-emerald-600 dark:text-emerald-400">
                  +{convertAmount(1875).formatted}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    Approved for Payroll
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">Maryam Al-Kuwari</td>
                <td className="py-3 px-4 text-slate-500 font-sans">HIA Counter 7 VIP Lounge</td>
                <td className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400">42 Bookings</td>
                <td className="py-3 px-4 text-right rtl:text-left">{convertAmount(34200).formatted}</td>
                <td className="py-3 px-4 text-right rtl:text-left font-black text-emerald-600 dark:text-emerald-400">
                  +{convertAmount(1050).formatted}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    Approved for Payroll
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};
