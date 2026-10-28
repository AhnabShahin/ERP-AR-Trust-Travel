import React, { useMemo } from 'react';
import {
  CalendarCheck,
  Coins,
  Compass,
  Store,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { matchesDateFilter } from '../../utils/dateFilter';

// Channel classification shared across the dashboard analytics.
const DESK_SERVICE_SOURCES = ['Airport Desk', 'Agent Desk'];
const WEB_SERVICE_SOURCES = [
  'Online Web',
  'Website Direct Lead',
  'Web Integration API',
  'Website Online Gateway',
  'Website Online Lead',
  'OTA Partner',
];

export const TopMetricCards: React.FC = () => {
  const {
    convertAmount,
    currency,
    language,
    t,
    openModal,
    shiftDrawer,
    bookings,
    hotelBookings,
    drivers,
    airportDesks,
    dateFilter,
  } = useApp();

  // All KPI numbers are derived live from the hydrated AppContext records,
  // filtered by the dashboard's active Date & Year filter.
  const metrics = useMemo(() => {
    const svc = bookings.filter((b) => matchesDateFilter(b.bookingDate || b.createdAt, dateFilter));
    const htl = hotelBookings.filter((b) => matchesDateFilter(b.checkInDate || b.createdAt, dateFilter));

    // ---- Card 1: bookings & pax -------------------------------------
    const totalBookings = svc.length + htl.length;
    const pax =
      svc.reduce((s, b) => s + (b.paxCount || 0), 0) +
      htl.reduce((s, b) => s + (b.paxAdults || 0) + (b.paxChildren || 0), 0);

    const deskCount =
      svc.filter((b) => DESK_SERVICE_SOURCES.includes(b.source)).length +
      htl.filter((b) =>
        ['Agent Desk (Hotel Lobby)', 'Airport Desk Counter'].includes(b.bookingSource)
      ).length;
    const webCount =
      svc.filter((b) => WEB_SERVICE_SOURCES.includes(b.source)).length +
      htl.filter((b) => b.bookingSource === 'Online Web Portal').length;
    const vipCount =
      svc.filter((b) => b.source === 'VIP Concierge').length +
      htl.filter((b) => b.bookingSource === 'VIP Concierge Direct').length;

    // ---- Card 2: revenue --------------------------------------------
    const svcRevQAR = svc.reduce((s, b) => s + (b.totalQAR || 0), 0);
    const htlRevQAR = htl.reduce((s, b) => s + (b.totalQAR || 0), 0);
    const totalRevQAR = svcRevQAR + htlRevQAR;

    // ---- Card 3: fleet / drivers ------------------------------------
    const onMission = drivers.filter((d) =>
      ['On Trip', 'Dispatched', 'En Route', 'At Airport Bay'].includes(d.status)
    ).length;
    const standby = drivers.filter((d) => d.status === 'Standby' || d.status === 'Available').length;
    const offDuty = drivers.filter((d) => ['Off Duty', 'Maintenance'].includes(d.status)).length;
    const totalDrivers = drivers.length;
    const activeDrivers = onMission + standby;
    const activePct = totalDrivers > 0 ? Math.round((activeDrivers / totalDrivers) * 100) : 0;

    // ---- Card 4: desk shifts ----------------------------------------
    const activeDesks = airportDesks.filter((d) => d.status === 'Active').length;
    const closingDesks = airportDesks.filter((d) => d.status === 'Closing Soon').length;
    const pendingVouchers = svc.filter((b) => !b.voucherSent).length;

    return {
      totalBookings,
      pax,
      deskCount,
      webCount,
      vipCount,
      svcRevQAR,
      htlRevQAR,
      totalRevQAR,
      onMission,
      standby,
      offDuty,
      totalDrivers,
      activeDrivers,
      activePct,
      activeDesks,
      closingDesks,
      pendingVouchers,
    };
  }, [bookings, hotelBookings, drivers, airportDesks, dateFilter]);

  const convertedRevenue = convertAmount(metrics.totalRevQAR);
  const topDesk = airportDesks.find((d) => d.status === 'Active') || airportDesks[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1: Total Bookings (services + hotel stays) */}
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
              {metrics.totalBookings}
            </span>
            <span className="text-xs text-slate-400 font-medium">{metrics.pax} pax</span>
          </div>

          <div className="flex items-center text-xs font-semibold font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            <span>{language === 'ar' ? 'حجوزات' : 'bookings'}</span>
          </div>
        </div>

        {/* Channel breakdown */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span>{metrics.deskCount} Agent Desk</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>{metrics.webCount} Web OTA</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>{metrics.vipCount} VIP</span>
        </div>
      </div>

      {/* Card 2: Total Revenue (multi-currency) */}
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

        {/* Services vs hotels split */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span>{convertAmount(metrics.svcRevQAR).formatted} Tours</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>{convertAmount(metrics.htlRevQAR).formatted} Hotels</span>
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
              {metrics.activeDrivers} / {metrics.totalDrivers}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              {metrics.activePct}% active
            </span>
          </div>

          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Fleet Allocation */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span>{metrics.onMission} On Trip</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>{metrics.standby} Available</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span>{metrics.offDuty} Off Duty</span>
        </div>
      </div>

      {/* Card 4: Agent Desk Shifts */}
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
              {metrics.activeDesks} Active
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {metrics.pendingVouchers} to audit
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
          {airportDesks.length === 0 ? (
            <span>No active desks configured</span>
          ) : (
            airportDesks.slice(0, 3).map((d, i) => (
              <React.Fragment key={d.id}>
                {i > 0 && <span className="text-slate-300 dark:text-slate-700">·</span>}
                <span
                  className={
                    d.status === 'Active'
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : ''
                  }
                >
                  {d.deskCode}
                  {d.id === topDesk?.id ? ' (Active)' : ''}
                </span>
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
