import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  Plus,
  QrCode,
  Send,
  Car,
  Plane,
  Download,
  CheckCircle2,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { DateFilterBar } from '../common/DateFilterBar';
import { matchesDateFilter } from '../../utils/dateFilter';

export const BookingsView: React.FC = () => {
  const {
    bookings,
    searchQuery,
    setSearchQuery,
    convertAmount,
    currency,
    openModal,
    updateBookingStatus,
    toggleVoucherSent,
    language,
    dateFilter,
    setDateFilter,
    t,
  } = useApp();

  const [packageFilter, setPackageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = bookings.filter((b) => {
    // Date & Year Filter
    if (!matchesDateFilter(b.createdAt, dateFilter)) return false;

    const matchesSearch =
      b.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.flightNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPkg = packageFilter === 'all' || b.packageId === packageFilter;
    const matchesStatus = statusFilter === 'all' || b.qrStatus === statusFilter;

    return matchesSearch && matchesPkg && matchesStatus;
  });

  return (
    <div className="space-y-5 pb-8">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            <span>{language === 'ar' ? 'سجل الحجوزات وجدول الرحلات' : 'Bookings & Operational Calendar'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ar'
              ? 'إدارة حجوزات المطار، الجولات السياحية، وقسائم الركاب المعتمدة'
              : 'Enterprise reservation ledger, flight linkings & guest voucher management'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openModal('new-booking')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Reservation</span>
          </button>
        </div>
      </div>

      {/* Date & Year Filter Bar */}
      <DateFilterBar
        filter={dateFilter}
        onChange={setDateFilter}
        totalCount={bookings.length}
        filteredCount={filtered.length}
        label={language === 'ar' ? 'تصفية الحجوزات بالسنة والتاريخ' : 'Bookings Date & Year Filter'}
      />

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          {['all', 'checked-in', 'in-transit', 'scheduled', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {st.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Search bookings by PNR, passenger, flight..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">PNR / Ref</th>
                <th className="py-3 px-4">Passenger Details</th>
                <th className="py-3 px-4">Service Package</th>
                <th className="py-3 px-4">Chauffeur</th>
                <th className="py-3 px-4 text-right rtl:text-left">Total Value</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  {/* PNR */}
                  <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {b.pnr}
                    <div className="text-[10px] text-slate-400 font-normal">{b.createdAt}</div>
                  </td>

                  {/* Passenger */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {b.passengerName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {b.passengerPhone} · {b.nationality}
                    </div>
                  </td>

                  {/* Package */}
                  <td className="py-3 px-4 max-w-[200px]">
                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {b.packageName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {b.paxCount} Travelers · {b.pickupBay}
                    </div>
                  </td>

                  {/* Driver */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.driverName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                      {b.driverVehicle}
                    </div>
                  </td>

                  {/* Value */}
                  <td className="py-3 px-4 text-right rtl:text-left font-mono tabular-nums">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {convertAmount(b.totalQAR).formatted}
                    </div>
                    <div className="text-[10px] text-slate-400">{b.paymentMethod}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                        b.qrStatus === 'checked-in'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : b.qrStatus === 'in-transit'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {b.qrStatus.replace('-', ' ')}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                      <button
                        onClick={() => openModal('qr-voucher', b)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                        title="View Boarding Pass"
                      >
                        <QrCode className="w-4 h-4 text-blue-500" />
                      </button>

                      <button
                        onClick={() => toggleVoucherSent(b.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 transition"
                        title="Resend WhatsApp Voucher"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
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
