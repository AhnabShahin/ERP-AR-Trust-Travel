import React, { useState } from 'react';
import {
  BadgePercent,
  Banknote,
  DollarSign,
  Plus,
  Sliders,
  CheckCircle2,
  Clock,
  Car,
  Users,
  Fuel,
  Receipt,
  Download,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DateFilterBar } from '../common/DateFilterBar';
import { matchesDateFilter } from '../../utils/dateFilter';

export const PayrollCommissionView: React.FC = () => {
  const {
    salaryRecords,
    commissionRules,
    expenses,
    addExpense,
    updateSalaryPayout,
    updateCommissionRule,
    convertAmount,
    language,
    dateFilter,
    setDateFilter,
    t,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'salaries' | 'commission-engine' | 'expenses'>('salaries');
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // New Expense form state
  const [expCategory, setExpCategory] = useState<any>('Fleet Fuel');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState<number>(350);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expDesc.trim()) return;
    addExpense({
      date: 'Just now',
      category: expCategory,
      description: expDesc,
      amountQAR: expAmount,
      approvedBy: 'Finance Lead',
      status: 'Paid',
      paymentMethod: 'Corporate Petty Cash',
    });
    setShowExpenseModal(false);
    setExpDesc('');
  };

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {language === 'ar' ? 'الرواتب الثابتة، محرك العمولات، ومصروفات التشغيل' : 'Staff Salary Ledger, Commission Engine & Expense Tracker'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fixed monthly wages, dynamic performance tiers (Agents, Drivers, Guides) and daily fleet expense journal
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs">
            <button
              onClick={() => setActiveSubTab('salaries')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeSubTab === 'salaries'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Monthly Salary Ledger
            </button>
            <button
              onClick={() => setActiveSubTab('commission-engine')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeSubTab === 'commission-engine'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Commission Engine
            </button>
            <button
              onClick={() => setActiveSubTab('expenses')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeSubTab === 'expenses'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Daily Expense Tracker
            </button>
          </div>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Expense</span>
          </button>
        </div>
      </div>

      {/* Date & Year Filter */}
      <DateFilterBar
        filter={dateFilter}
        onChange={setDateFilter}
        label={language === 'ar' ? 'تصفية الرواتب والمصروفات حسب السنة' : 'Payroll & Expenses Date Filter'}
      />

      {/* Sub-view 1: Monthly Salary Ledger */}
      {activeSubTab === 'salaries' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Banknote className="w-4 h-4 text-blue-500" />
              <span>Full Employee Roster: Fixed Wages & Performance Payouts</span>
            </h3>
            <span className="font-mono text-xs text-slate-400">Payroll Cycle: Monthly 30th (Direct QNB Transfer)</span>
          </div>

          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left rtl:text-right border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Role & Department</th>
                <th className="py-3 px-4 text-right rtl:text-left">Fixed Monthly Base</th>
                <th className="py-3 px-4 text-right rtl:text-left">Accrued Commission</th>
                <th className="py-3 px-4 text-right rtl:text-left">Net Payable This Month</th>
                <th className="py-3 px-4 text-center">Payout Status</th>
                <th className="py-3 px-4 text-right rtl:text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {salaryRecords.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">
                    {s.employeeName}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">
                    {s.roleTitle} · <span className="font-semibold text-slate-700 dark:text-slate-300">{s.department}</span>
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left font-semibold text-slate-800 dark:text-slate-200">
                    {convertAmount(s.fixedBaseMonthlyQAR).formatted}
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left font-bold text-emerald-600 dark:text-emerald-400">
                    +{convertAmount(s.accruedCommissionQAR).formatted}
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left font-black text-slate-900 dark:text-white">
                    {convertAmount(s.netPayableQAR).formatted}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.payoutStatus === 'Approved for Payroll'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : s.payoutStatus === 'Paid'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {s.payoutStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left">
                    <button
                      onClick={() =>
                        updateSalaryPayout(
                          s.id,
                          s.payoutStatus === 'Approved for Payroll' ? 'Paid' : 'Approved for Payroll'
                        )
                      }
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium"
                    >
                      {s.payoutStatus === 'Approved for Payroll' ? 'Mark Paid' : 'Authorize'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Sub-view 2: Commission Engine */}
      {activeSubTab === 'commission-engine' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            The Commission Engine calculates incentive allocations in real time upon booking completion. Super Admins and Finance Controllers can adjust these rate values to reflect seasonal bonuses and holiday peaks.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commissionRules.map((rule) => (
              <div
                key={rule.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{rule.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {rule.targetRole}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                  {rule.ruleDescription}
                </h4>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">Commission Rate:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={rule.rateValue}
                      onChange={(e) => updateCommissionRule(rule.id, Number(e.target.value))}
                      className="w-20 font-bold font-mono text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-emerald-600 dark:text-emerald-400"
                    />
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {rule.unit}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-mono">
                  Scope: {rule.appliesTo}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-view 3: Daily Expense Tracker */}
      {activeSubTab === 'expenses' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Fuel className="w-4 h-4 text-rose-500" />
              <span>Daily Operational Expense Journal (Fuel, Maintenance, Airport Fees)</span>
            </h3>
            <span className="font-mono text-xs text-rose-600 dark:text-rose-400 font-bold">
              Total Logged: {convertAmount(expenses.reduce((s, e) => s + e.amountQAR, 0)).formatted}
            </span>
          </div>

          <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left rtl:text-right border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Expense Category</th>
                <th className="py-3 px-4">Description & Merchant</th>
                <th className="py-3 px-4 text-right rtl:text-left">Amount (QAR)</th>
                <th className="py-3 px-4">Payment Source</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 text-slate-400">{e.date}</td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">
                    {e.category}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300 max-w-sm">
                    {e.description}
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left font-black text-rose-600 dark:text-rose-400">
                    {convertAmount(e.amountQAR).formatted}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">
                    {e.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* New Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Log Operational Expense
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Expense Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white"
                >
                  <option value="Fleet Fuel">Fleet Fuel (Woqod)</option>
                  <option value="Airport Apron Permits">Airport Apron Permits (HIA Access)</option>
                  <option value="Camp Maintenance">Camp Maintenance (Khor Al Adaid)</option>
                  <option value="Hospitality / Karak">Hospitality / Karak & Dates for Guests</option>
                  <option value="Chauffeur Per Diem">Chauffeur Per Diem</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4x4 Land Cruiser convoy refueling at Sealine"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Amount in QAR (ر.ق)</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
