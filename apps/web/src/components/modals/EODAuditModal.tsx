import React, { useState } from 'react';
import {
  X,
  Scale,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  CreditCard,
  Building2,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EODAuditModal: React.FC = () => {
  const { modalData, closeModal, closeShiftAndAudit, shiftDrawer, rates, language, t } = useApp();

  const currentDrawer = modalData || shiftDrawer;

  const [qarCount, setQarCount] = useState<number>(currentDrawer.currentCashDrawer.QAR);
  const [usdCount, setUsdCount] = useState<number>(currentDrawer.currentCashDrawer.USD);
  const [eurCount, setEurCount] = useState<number>(currentDrawer.currentCashDrawer.EUR);
  const [gbpCount, setGbpCount] = useState<number>(currentDrawer.currentCashDrawer.GBP);
  const [supervisorNotes, setSupervisorNotes] = useState('All passenger vouchers verified. NAPS POS batch settled.');
  const [isFinalized, setIsFinalized] = useState(false);

  const diffQAR = qarCount - currentDrawer.systemExpected.QAR;
  const diffUSD = usdCount - currentDrawer.systemExpected.USD;
  const diffEUR = eurCount - currentDrawer.systemExpected.EUR;
  const diffGBP = gbpCount - currentDrawer.systemExpected.GBP;

  const totalDiscrepancyQAR =
    diffQAR +
    diffUSD * rates.USD +
    diffEUR * rates.EUR +
    diffGBP * rates.GBP;

  const isBalanced = Math.abs(totalDiscrepancyQAR) < 0.01;

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    closeShiftAndAudit(
      {
        QAR: qarCount,
        USD: usdCount,
        EUR: eurCount,
        GBP: gbpCount,
      },
      supervisorNotes
    );
    if (modalData && typeof modalData.onAudited === 'function') {
      try {
        modalData.onAudited();
      } catch {}
    }
    setIsFinalized(true);
    setTimeout(() => {
      closeModal();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'مطابقة وإغلاق الوردية (Z-Report Audit)' : 'EOD Shift Audit & Reconciliation (Z-Report)'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {currentDrawer.counterName} · Shift ID {currentDrawer.shiftId || '#HIA-S2-884'}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isFinalized ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Shift Successfully Audited & Locked
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Z-Report #{currentDrawer.shiftId ? `Z-${currentDrawer.shiftId.replace(/#/g, '')}` : 'Z-20261013-884'} generated. Bank drop voucher transmitted to Qatar National Bank (QNB) vault.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCloseShift} className="p-6 space-y-4 overflow-y-auto max-h-[80vh] text-xs">
            {/* Shift Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">DUTY CASHIER</span>
                <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">
                  {currentDrawer.agentName}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Shift: 06:00 AM – 14:30 PM (or Active Roster)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">TOTAL TRANSACTIONS</span>
                <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5 font-mono">
                  {currentDrawer.transactionsCount} Bookings Settled
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  POS Slips: QAR {currentDrawer.posCardTotalQAR.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Currency Note Drawer Count inputs */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Physical Cash Count by Currency</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">Input Actual Drawer Balance</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* QAR */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200">QAR (ر.ق)</label>
                    <span className="text-[10px] font-mono text-slate-400">
                      Sys: {currentDrawer.systemExpected.QAR}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={qarCount}
                    onChange={(e) => setQarCount(Number(e.target.value))}
                    className="w-full mt-1.5 font-mono font-bold text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                  />
                  <div className="mt-1 text-[10px] font-mono text-right">
                    Diff: <span className={diffQAR === 0 ? 'text-emerald-500' : 'text-amber-500'}>{diffQAR > 0 ? `+${diffQAR}` : diffQAR} QAR</span>
                  </div>
                </div>

                {/* USD */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200">USD ($)</label>
                    <span className="text-[10px] font-mono text-slate-400">
                      Sys: ${currentDrawer.systemExpected.USD}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={usdCount}
                    onChange={(e) => setUsdCount(Number(e.target.value))}
                    className="w-full mt-1.5 font-mono font-bold text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                  />
                  <div className="mt-1 text-[10px] font-mono text-right">
                    Diff: <span className={diffUSD === 0 ? 'text-emerald-500' : 'text-amber-500'}>{diffUSD > 0 ? `+$${diffUSD}` : `$${diffUSD}`}</span>
                  </div>
                </div>

                {/* EUR */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200">EUR (€)</label>
                    <span className="text-[10px] font-mono text-slate-400">
                      Sys: €{currentDrawer.systemExpected.EUR}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={eurCount}
                    onChange={(e) => setEurCount(Number(e.target.value))}
                    className="w-full mt-1.5 font-mono font-bold text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                  />
                  <div className="mt-1 text-[10px] font-mono text-right">
                    Diff: <span className={diffEUR === 0 ? 'text-emerald-500' : 'text-amber-500'}>{diffEUR > 0 ? `+€${diffEUR}` : `€${diffEUR}`}</span>
                  </div>
                </div>

                {/* GBP */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200">GBP (£)</label>
                    <span className="text-[10px] font-mono text-slate-400">
                      Sys: £{currentDrawer.systemExpected.GBP}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={gbpCount}
                    onChange={(e) => setGbpCount(Number(e.target.value))}
                    className="w-full mt-1.5 font-mono font-bold text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white"
                  />
                  <div className="mt-1 text-[10px] font-mono text-right">
                    Diff: <span className={diffGBP === 0 ? 'text-emerald-500' : 'text-amber-500'}>{diffGBP > 0 ? `+£${diffGBP}` : `£${diffGBP}`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reconciliation Variance Outcome */}
            <div
              className={`p-3 rounded-xl flex items-center justify-between border ${
                isBalanced
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold text-xs">
                    {isBalanced ? 'Shift Perfectly Balanced' : 'Variance Detected'}
                  </span>
                  <div className="text-[11px] font-mono">
                    Net Discrepancy: {totalDiscrepancyQAR >= 0 ? `+${totalDiscrepancyQAR.toFixed(2)}` : totalDiscrepancyQAR.toFixed(2)} QAR
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80">
                {isBalanced ? 'AUDIT PASS' : 'FLAGGED FOR REVIEW'}
              </span>
            </div>

            {/* Supervisor Notes */}
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Duty Supervisor Sign-off Notes & Vault Drop Reference
              </label>
              <textarea
                rows={2}
                value={supervisorNotes}
                onChange={(e) => setSupervisorNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/25 active:scale-95 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm Audit & Close Shift</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
