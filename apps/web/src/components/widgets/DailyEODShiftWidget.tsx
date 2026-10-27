import React from 'react';
import {
  Receipt,
  Scale,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Banknote,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DailyEODShiftWidget: React.FC = () => {
  const { shiftDrawer, openModal, convertAmount, activeDesk, activeDeskId, language, t } = useApp();

  const deskName = activeDesk ? `${activeDesk.deskCode} · ${activeDesk.deskName}` : shiftDrawer.counterName;
  const dutyAgent = activeDesk?.assignedEmployeeName || shiftDrawer.agentName;

  // All figures come straight from the live, persisted shift drawer. Each cash,
  // POS-card and payment-link booking updates this record (see addBooking /
  // addHotelBooking), so no re-summing of bookings here — that would double-count.
  const currentQAR = shiftDrawer.currentCashDrawer.QAR;
  const expectedQAR = shiftDrawer.systemExpected.QAR;
  const posCardQAR = shiftDrawer.posCardTotalQAR;
  const paymentLinkQAR = shiftDrawer.paymentLinkTotalQAR;

  // Real variance: counted drawer vs system-recorded expectation (0 until the
  // physical count at shift close introduces a genuine difference).
  const qarDiff = Math.round((currentQAR - expectedQAR) * 100) / 100;
  const isBalanced = Math.abs(qarDiff) < 0.005;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('eodReconTitle')}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
            <span>{deskName}</span>
            <span>· Cashier: {dutyAgent}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
          <Clock className="w-3 h-3 text-amber-500" />
          <span>Live POS Synced</span>
        </div>
      </div>

      {/* Cash Drawer Multi-Currency Comparison Grid */}
      <div className="my-3 space-y-2.5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>{language === 'ar' ? 'أرصدة الصندوق بالعملات الأجنبية' : 'Cash Drawer vs System Ledgers'}</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400">Physically Counted</span>
        </div>

        {/* Currency Rows: QAR, USD, EUR */}
        <div className="grid grid-cols-3 gap-2">
          {/* QAR */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-200">QAR (ر.ق)</span>
              <span className="text-emerald-500 font-mono">100%</span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-slate-900 dark:text-white tabular-nums">
              {currentQAR.toLocaleString()} QAR
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Sys: {expectedQAR.toLocaleString()} QAR
            </div>
          </div>

          {/* USD */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-200">USD ($)</span>
              <span className="text-blue-500 font-mono">Pegged</span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-slate-900 dark:text-white tabular-nums">
              ${shiftDrawer.currentCashDrawer.USD.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Sys: ${shiftDrawer.systemExpected.USD.toLocaleString()}
            </div>
          </div>

          {/* EUR */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-bold text-slate-700 dark:text-slate-200">EUR (€)</span>
              <span className="text-purple-500 font-mono">Eurozone</span>
            </div>
            <div className="mt-1 font-mono font-bold text-sm text-slate-900 dark:text-white tabular-nums">
              €{shiftDrawer.currentCashDrawer.EUR.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Sys: €{shiftDrawer.systemExpected.EUR.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Non-Cash Settled Channels (POS Card + Payment Link) */}
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <CreditCard className="w-3.5 h-3.5 text-blue-500" />
              <span>{t('cardPosTotal')} (QNB NAPS / Visa / MC)</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              {convertAmount(posCardQAR).formatted}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/50 dark:border-slate-700/40">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Banknote className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('paymentLinks')} (Apple Pay / WhatsApp Link)</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              {convertAmount(paymentLinkQAR).formatted}
            </span>
          </div>
        </div>

        {/* Variance Status Banner */}
        <div
          className={`p-2.5 rounded-xl flex items-center justify-between text-xs border ${
            isBalanced
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {isBalanced ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <div>
              <span className="font-bold">{t('variance')}: </span>
              <span className="font-mono font-bold">
                {isBalanced ? '+/- 0.00 QAR' : `${qarDiff > 0 ? '+' : ''}${qarDiff.toFixed(2)} QAR`}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold font-mono">
            {isBalanced ? t('balanced') : 'Discrepancy Detected'}
          </span>
        </div>
      </div>

      {/* Prominent Action Button: Close Shift & Audit */}
      <div className="pt-2">
        <button
          onClick={() =>
            openModal('eod-audit', {
              ...shiftDrawer,
              counterName: deskName,
              agentName: dutyAgent,
              deskId: activeDeskId,
              currentCashDrawer: {
                ...shiftDrawer.currentCashDrawer,
                QAR: currentQAR,
              },
              systemExpected: {
                ...shiftDrawer.systemExpected,
                QAR: expectedQAR,
              },
              posCardTotalQAR: posCardQAR,
            })
          }
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-xs shadow-md shadow-blue-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Scale className="w-4 h-4" />
          <span>{t('closeShiftBtn')}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};
