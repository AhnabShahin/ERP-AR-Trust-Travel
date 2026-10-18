import React, { useState } from 'react';
import { TopMetricCards } from '../widgets/TopMetricCards';
import { BookingTrendsWidget } from '../widgets/BookingTrendsWidget';
import { HotelBookingTrendsWidget } from '../widgets/HotelBookingTrendsWidget';
import { LiveAirportBookingsWidget } from '../widgets/LiveAirportBookingsWidget';
import { DailyEODShiftWidget } from '../widgets/DailyEODShiftWidget';
import { DateFilterBar } from '../common/DateFilterBar';
import { useApp } from '../../context/AppContext';
import { Compass, Building2, LayoutGrid } from 'lucide-react';
import { VendorDashboardView } from './VendorDashboardView';
import { CustomerDashboardView } from './CustomerDashboardView';
import { DriverPortalView } from './DriverPortalView';

export const DashboardView: React.FC = () => {
  const { dateFilter, setDateFilter, bookings, hotelBookings, language, currentRole } = useApp();
  const [trendsMode, setTrendsMode] = useState<'both' | 'services' | 'hotels'>('both');

  if (currentRole === 'customer') {
    return <CustomerDashboardView />;
  }

  if (currentRole === 'vendor-partner') {
    return <VendorDashboardView />;
  }

  if (currentRole === 'driver-guide') {
    return <DriverPortalView />;
  }

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Top Metric Cards (4 KPIs) */}
      <TopMetricCards />

      {/* Date & Year Filter Engine */}
      <DateFilterBar
        filter={dateFilter}
        onChange={setDateFilter}
        totalCount={bookings.length + hotelBookings.length}
        label={
          language === 'ar'
            ? 'تصفية مؤشرات المنظومة حسب التاريخ والسنة'
            : 'System Operations Date & Year Filter'
        }
      />

      {/* 2. Middle Main Analytics: Channel Trends (Service Tours & Hotel Bookings) */}
      <div className="space-y-3">
        {/* Analytics Switcher Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {language === 'ar' ? 'عرض مؤشرات القنوات:' : 'Channel Trends View:'}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Online vs. Agent Desk Analytics
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setTrendsMode('both')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                trendsMode === 'both'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'عرض مزدوج (الخدمات + الفنادق)' : 'Dual View (Services + Hotels)'}</span>
            </button>

            <button
              onClick={() => setTrendsMode('services')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                trendsMode === 'services'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'ar' ? 'حجوزات الخدمات' : 'Service Tours'}</span>
            </button>

            <button
              onClick={() => setTrendsMode('hotels')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                trendsMode === 'hotels'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-purple-500" />
              <span>{language === 'ar' ? 'حجوزات الفنادق' : 'Hotel Stays'}</span>
            </button>
          </div>
        </div>

        {/* Analytics Widgets Layout */}
        {trendsMode === 'both' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <BookingTrendsWidget />
            <HotelBookingTrendsWidget />
          </div>
        ) : trendsMode === 'services' ? (
          <BookingTrendsWidget />
        ) : (
          <HotelBookingTrendsWidget />
        )}
      </div>

      {/* 3. Bottom Section: Live Agent Desk Bookings (Left) & EOD Shift Reconciliation (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8">
          <LiveAirportBookingsWidget activeMode={trendsMode} />
        </div>
        <div className="xl:col-span-4">
          <DailyEODShiftWidget />
        </div>
      </div>
    </div>
  );
};
