import React from 'react';
import {
  CalendarCheck,
  Coins,
  Compass,
  Store,
  ArrowUpRight,
  Plane,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopMetricCards: React.FC = () => {
  const { convertAmount, currency, language, t, openModal, shiftDrawer } = useApp();

  const totalRevenueQAR = 184520;
  const convertedRevenue = convertAmount(totalRevenueQAR);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1: Total Daily Bookings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('kpiDailyBookings')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              142
            </span>
            <span className="text-xs text-slate-400 font-medium">pax / tours</span>
          </div>

          <div className="flex items-center text-xs font-semibold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
            <span>+18.4%</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Breakdown subtext */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span>68 Agent Desk</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>52 Web OTA</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>22 VIP</span>
        </div>
      </div>

      {/* Card 2: Multi-Currency Revenue */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('kpiDailyRevenue')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              {convertedRevenue.formatted}
            </span>
          </div>

          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {currency}
          </span>
        </div>

        {/* Currency breakdown */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span>$50.7k USD</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>€46.6k EUR</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>£40.1k GBP</span>
        </div>
      </div>

      {/* Card 3: Active Drivers/Guides Dispatched */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('kpiActiveDrivers')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              28 / 34
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              82% active
            </span>
          </div>

          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Fleet Allocation */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span>18 HIA Transfers</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>10 Desert 4x4</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>6 Standby</span>
        </div>
      </div>

      {/* Card 4: Pending Agent Desk Shifts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('kpiPendingShifts')}
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
              3 Active
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              1 to audit
            </span>
          </div>

          <button
            onClick={() => openModal('eod-audit', shiftDrawer)}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Review EOD
          </button>
        </div>

        {/* Counter breakdown */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">HIA C4 (Active)</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>HIA C7</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>Souq HQ</span>
        </div>
      </div>
    </div>
  );
};
