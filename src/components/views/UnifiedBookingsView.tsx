import React, { useState } from 'react';
import {
  CalendarCheck2,
  Globe,
  Store,
  CheckCircle2,
  Clock,
  Car,
  Compass,
  Sparkles,
  QrCode,
  Send,
  Plus,
  Filter,
  Search,
  Printer,
  ChevronRight,
  ArrowRight,
  UserCheck,
  Trash2,
  Edit3,
  X,
  Calendar,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking, HotelBooking } from '../../types';
import { DateFilterBar } from '../common/DateFilterBar';
import { matchesDateFilter } from '../../utils/dateFilter';

export const UnifiedBookingsView: React.FC = () => {
  const {
    bookings,
    hotelBookings,
    cancelHotelBooking,
    drivers,
    tourGuides,
    assignDriverAndGuide,
    approveBooking,
    updateBooking,
    deleteBooking,
    openModal,
    convertAmount,
    language,
    dateFilter,
    setDateFilter,
    t,
  } = useApp();

  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [webLeadTypeFilter, setWebLeadTypeFilter] = useState<'all' | 'tour' | 'package' | 'fleet'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Selected booking for assigning driver/guide modal
  const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || 'drv-01');
  const [selectedGuideId, setSelectedGuideId] = useState(tourGuides[0]?.id || 'tg-01');

  const isWebBooking = (source?: string) =>
    source === 'Website Direct Lead' ||
    source === 'Web Integration API' ||
    source === 'Online Web' ||
    source === 'Website Online Lead' ||
    source === 'Website Online Gateway';

  const getBookingLeadType = (b: Booking): 'tour' | 'package' | 'fleet' | 'service' => {
    if (b.leadType) return b.leadType;
    const notes = (b.notes || '').toLowerCase();
    const pkgName = (b.packageName || '').toLowerCase();
    if (
      notes.includes('fleet') ||
      notes.includes('chauffeur') ||
      pkgName.includes('mercedes') ||
      pkgName.includes('land cruiser') ||
      pkgName.includes('chauffeur') ||
      pkgName.includes('vip transit')
    ) {
      return 'fleet';
    }
    if (
      notes.includes('package') ||
      notes.includes('holiday') ||
      pkgName.includes('package') ||
      pkgName.includes('holiday') ||
      pkgName.includes('stopover')
    ) {
      return 'package';
    }
    if (notes.includes('concierge') || pkgName.includes('visa') || pkgName.includes('meet & assist')) {
      return 'service';
    }
    return 'tour';
  };

  const filteredBookings = bookings.filter((b) => {
    // Date & Year Filter
    if (!matchesDateFilter(b.createdAt, dateFilter)) return false;

    const matchesSource =
      sourceFilter === 'all'
        ? true
        : sourceFilter === 'web'
        ? isWebBooking(b.source)
        : sourceFilter === 'airport'
        ? b.source === 'Airport Desk' || b.source === 'Agent Desk'
        : sourceFilter === 'vip'
        ? b.source === 'VIP Concierge'
        : true;

    if (!matchesSource) return false;

    // Sub-classification for Website Leads (Direct Service vs Package vs Fleet)
    if (sourceFilter === 'web' && webLeadTypeFilter !== 'all') {
      const lType = getBookingLeadType(b);
      if (webLeadTypeFilter === 'tour' && lType !== 'tour' && lType !== 'service') return false;
      if (webLeadTypeFilter === 'package' && lType !== 'package') return false;
      if (webLeadTypeFilter === 'fleet' && lType !== 'fleet') return false;
    }

    const matchesStatus = statusFilter === 'all' || b.qrStatus === statusFilter;

    const matchesSearch =
      b.passengerName.toLowerCase().includes(search.toLowerCase()) ||
      b.pnr.toLowerCase().includes(search.toLowerCase()) ||
      b.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.packageName.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const filteredHotelBookings = hotelBookings.filter((hb) => {
    if (!matchesDateFilter(hb.createdAt, dateFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const mGuest = hb.guestName.toLowerCase().includes(q);
      const mCode = hb.confirmationCode.toLowerCase().includes(q);
      const mHotel = hb.hotelName.toLowerCase().includes(q);
      if (!mGuest && !mCode && !mHotel) return false;
    }
    return true;
  });

  const webBookings = bookings.filter((b) => isWebBooking(b.source));
  const webCount = webBookings.length;
  const webPendingCount = webBookings.filter((b) => b.qrStatus === 'pending').length;
  const webTourCount = webBookings.filter((b) => {
    const t = getBookingLeadType(b);
    return t === 'tour' || t === 'service';
  }).length;
  const webPkgCount = webBookings.filter((b) => getBookingLeadType(b) === 'package').length;
  const webFleetCount = webBookings.filter((b) => getBookingLeadType(b) === 'fleet').length;
  const airportCount = bookings.filter((b) => b.source === 'Airport Desk' || b.source === 'Agent Desk').length;
  const hotelCount = hotelBookings.length;
  const pendingCount = bookings.filter((b) => b.qrStatus === 'pending').length;

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningBooking) return;
    assignDriverAndGuide(assigningBooking.id, selectedDriverId, selectedGuideId);
    setAssigningBooking(null);
  };

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Unified Inventory Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              {language === 'ar' ? 'منظومة الحجوزات الموحدة (موقع الويب المباشر + مكاتب الوكلاء + الفنادق)' : 'Unified Central Booking Engine (Website Direct Leads + Agent Desk + Hotels)'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Single live stream merging direct artrusttravel.com bookings (Services, Packages & Fleet), Agent Desk POS counters, and luxury hotel reservations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Channel stats badges */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
              {webCount} Website Direct Leads
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
              {airportCount} Agent Desk
            </span>
            <span className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
              {hotelCount} Hotel Bookings
            </span>
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>

          <button
            onClick={() => openModal('new-booking')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Reservation</span>
          </button>
        </div>
      </div>

      {/* Date & Year Filter */}
      <DateFilterBar
        filter={dateFilter}
        onChange={setDateFilter}
        totalCount={bookings.length}
        filteredCount={filteredBookings.length}
        label={language === 'ar' ? 'تصفية حجوزات الموقع والمكاتب' : 'Bookings Date & Year Filter'}
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
          <button
            onClick={() => {
              setSourceFilter('all');
              setWebLeadTypeFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              sourceFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Inventory ({bookings.length})
          </button>
          <button
            onClick={() => {
              setSourceFilter('web');
              setWebLeadTypeFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              sourceFilter === 'web'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Website Direct Leads ({webCount})</span>
            {webPendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-extrabold animate-pulse">
                {webPendingCount} Pending
              </span>
            )}
          </button>
          <button
            onClick={() => setSourceFilter('airport')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              sourceFilter === 'airport'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Agent Desk POS ({airportCount})
          </button>
          <button
            onClick={() => setSourceFilter('hotel')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              sourceFilter === 'hotel'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Hotel Bookings ({hotelCount})
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search PNR, passenger, package, hotel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Website Direct Leads Classification & Approval Banner */}
      {sourceFilter === 'web' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-900/40 border border-blue-200 dark:border-blue-900/60 space-y-3 shadow-xs animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>Website Direct Leads Stream (artrusttravel.com)</span>
                  {webPendingCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold animate-pulse">
                      {webPendingCount} Awaiting Operations Approval
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      All Approved
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Direct bookings submitted by visitors on the public website. Categorized into Direct Services, Holiday Packages, and Fleet Chauffeur transfers.
                </p>
              </div>
            </div>

            {webPendingCount > 0 && (
              <button
                onClick={() => {
                  webBookings
                    .filter((b) => b.qrStatus === 'pending')
                    .forEach((b) => approveBooking(b.id));
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve All ({webPendingCount}) Leads</span>
              </button>
            )}
          </div>

          {/* Sub-Classification Tabs for Website Leads */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-blue-200/60 dark:border-blue-900/40 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Lead Category:
            </span>
            <button
              type="button"
              onClick={() => setWebLeadTypeFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                webLeadTypeFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              All Direct Leads ({webCount})
            </button>
            <button
              type="button"
              onClick={() => setWebLeadTypeFilter('tour')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                webLeadTypeFilter === 'tour'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              <span>Direct Tour Services ({webTourCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setWebLeadTypeFilter('package')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                webLeadTypeFilter === 'package'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Holiday Packages ({webPkgCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setWebLeadTypeFilter('fleet')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                webLeadTypeFilter === 'fleet'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-emerald-500" />
              <span>Fleet & Chauffeur ({webFleetCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Unified Bookings Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {sourceFilter === 'hotel' ? (
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">
                  <th className="py-3 px-4">Confirmation & Channel</th>
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Stay Dates</th>
                  <th className="py-3 px-4">Hotel & Room Category</th>
                  <th className="py-3 px-4">Desk Origin</th>
                  <th className="py-3 px-4 text-right rtl:text-left">Total Value</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHotelBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No hotel reservations found matching date and search filters.
                    </td>
                  </tr>
                ) : (
                  filteredHotelBookings.map((hb) => (
                    <tr key={hb.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition">
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-bold text-slate-900 dark:text-white">{hb.confirmationCode}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Hotel Partner Desk</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {hb.guestName}
                        <span className="block text-[10px] text-slate-400 font-normal">{hb.guestPhone || hb.guestEmail}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {hb.checkInDate} → {hb.checkOutDate}
                        <span className="block text-[10px] text-slate-400">{hb.nights} Nights · {hb.paxAdults} Adults</span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        <span className="font-semibold">{hb.hotelName}</span>
                        <span className="block text-[10px] text-slate-400">{hb.roomType}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold">
                          {hb.deskCode || 'Hotel Desk'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right rtl:text-left font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {convertAmount(hb.totalQAR).formatted}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          hb.bookingStatus === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : hb.bookingStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {hb.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right rtl:text-left">
                        {hb.bookingStatus !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              if (confirm(`Cancel reservation ${hb.confirmationCode} for ${hb.guestName}?`)) {
                                cancelHotelBooking(hb.id, 'Cancelled via Central Inventory');
                              }
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 text-[11px]"
                            title="Cancel Reservation"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">
                <th className="py-3 px-4">Channel & PNR</th>
                <th className="py-3 px-4">Lead Guest</th>
                <th className="py-3 px-4">Booking Date & Time</th>
                <th className="py-3 px-4">Package Service</th>
                <th className="py-3 px-4">Chauffeur & Guide</th>
                <th className="py-3 px-4 text-right rtl:text-left">Revenue Total</th>
                <th className="py-3 px-4 text-center">Lifecycle Flow</th>
                <th className="py-3 px-4 text-right rtl:text-left">Operational Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.map((b) => {
                const isWeb = isWebBooking(b.source);
                const leadType = getBookingLeadType(b);

                return (
                  <tr
                    key={b.id}
                    onClick={() => setEditingBooking({ ...b })}
                    className={`transition cursor-pointer group ${
                      b.qrStatus === 'pending'
                        ? 'bg-amber-50/70 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 border-l-4 border-l-amber-500'
                        : 'hover:bg-blue-50/40 dark:hover:bg-slate-800/60'
                    }`}
                    title="Click booking row to view and edit full dossier details"
                  >
                    {/* Channel & PNR */}
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        {isWeb ? (
                          <span title="artrusttravel.com Direct Website Booking Lead">
                            <Globe className="w-3.5 h-3.5 text-blue-500" />
                          </span>
                        ) : (
                          <span title="Agent Desk Walk-In">
                            <Store className="w-3.5 h-3.5 text-emerald-500" />
                          </span>
                        )}
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {b.pnr}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-sans">
                          {isWeb ? 'Website Direct' : b.source}
                        </span>
                        {isWeb && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md font-sans ${
                              leadType === 'fleet'
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60'
                                : leadType === 'package'
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200/60'
                                : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60'
                            }`}
                          >
                            {leadType === 'fleet' ? '🚗 Fleet' : leadType === 'package' ? '🏖️ Package' : '🧭 Service'}
                          </span>
                        )}
                      </div>
                    </td>

                  {/* Lead Guest */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{b.passengerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {b.paxCount} PAX · {b.nationality}
                    </div>
                  </td>

                  {/* Booking Date & Time */}
                  <td className="py-3 px-4 font-mono">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-500" />
                      <span>{b.bookingDate || '2026-10-15'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{b.bookingTime || b.arrivalTime || '14:30'}</span>
                    </div>
                  </td>

                  {/* Package */}
                  <td className="py-3 px-4 max-w-[190px]">
                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{b.packageName}</div>
                    <span className="text-[10px] text-slate-400 font-mono">Meeting: {b.pickupBay}</span>
                  </td>

                  {/* Chauffeur & Guide */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[120px]">{b.driverName || 'Unassigned'}</span>
                    </div>
                    {b.guideName && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        <Compass className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{b.guideName}</span>
                      </div>
                    )}
                  </td>

                  {/* Revenue */}
                  <td className="py-3 px-4 text-right rtl:text-left font-mono tabular-nums">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {convertAmount(b.totalQAR).formatted}
                    </div>
                    <div className="text-[10px] text-slate-400">{b.paymentMethod}</div>
                  </td>

                  {/* Lifecycle Flow Status */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono capitalize ${
                        b.qrStatus === 'pending'
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse font-extrabold'
                          : b.qrStatus === 'confirmed'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : b.qrStatus === 'driver-assigned'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : b.qrStatus === 'checked-in'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {b.qrStatus === 'pending' ? 'Pending Approval (قيد الموافقة)' : b.qrStatus.replace('-', ' ')}
                    </span>
                  </td>

                  {/* Operational Action */}
                  <td className="py-3 px-4 text-right rtl:text-left">
                    <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                      {b.qrStatus === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            approveBooking(b.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition active:scale-95"
                          title="Approve Web Booking Lead & Authorize Voucher"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Lead</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssigningBooking(b);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-semibold"
                        title="Schedule Chauffeur & Guide"
                      >
                        Schedule
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('qr-voucher', b);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-600"
                        title="Passenger Information Sheet & QR Voucher"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBooking({ ...b });
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600"
                        title="Edit Full Booking Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to cancel/delete booking ${b.pnr} for ${b.passengerName}?`)) {
                            deleteBooking(b.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600"
                        title="Delete / Cancel Booking"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* Schedule Driver & Guide Modal */}
      {assigningBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-500" />
                <span>Assign Fleet Personnel ({assigningBooking.pnr})</span>
              </h3>
              <button onClick={() => setAssigningBooking(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guest: <span className="font-bold text-slate-800 dark:text-slate-200">{assigningBooking.passengerName}</span> · {assigningBooking.packageName}
              </p>

              <form onSubmit={handleConfirmAssignment} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Select Chauffeur & 4x4 / Van</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.vehicle} ({d.plateNumber}) · {d.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Select Licensed Multilingual Guide</label>
                  <select
                    value={selectedGuideId}
                    onChange={(e) => setSelectedGuideId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                  >
                    {tourGuides.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.languages.join('/')}) — {g.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAssigningBooking(null)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                  >
                    Confirm Assignment & Dispatch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Edit Booking Dossier ({editingBooking.pnr})
                </h3>
              </div>
              <button onClick={() => setEditingBooking(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateBooking(editingBooking.id, editingBooking);
                setEditingBooking(null);
              }}
              className="p-6 space-y-4 text-xs overflow-y-auto flex-1"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Passenger Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBooking.passengerName}
                    onChange={(e) => setEditingBooking({ ...editingBooking, passengerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={editingBooking.nationality}
                    onChange={(e) => setEditingBooking({ ...editingBooking, nationality: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Customer Booking Date & Time */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Customer Booking Date</span>
                  </label>
                  <input
                    type="date"
                    value={editingBooking.bookingDate || '2026-10-15'}
                    onChange={(e) => setEditingBooking({ ...editingBooking, bookingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Customer Booking Time</span>
                  </label>
                  <input
                    type="time"
                    value={editingBooking.bookingTime || editingBooking.arrivalTime || '14:30'}
                    onChange={(e) => setEditingBooking({ ...editingBooking, bookingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editingBooking.passengerPhone}
                    onChange={(e) => setEditingBooking({ ...editingBooking, passengerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Passenger Count (PAX)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingBooking.paxCount}
                    onChange={(e) => setEditingBooking({ ...editingBooking, paxCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={editingBooking.qrStatus}
                    onChange={(e) => setEditingBooking({ ...editingBooking, qrStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="pending">Pending Approval</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="driver-assigned">Driver Assigned</option>
                    <option value="checked-in">Checked In / On Board</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Passenger Count (PAX)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingBooking.paxCount}
                    onChange={(e) => setEditingBooking({ ...editingBooking, paxCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Booking Date (Tour Date)</span>
                  </label>
                  <input
                    type="date"
                    value={editingBooking.bookingDate || '2026-10-15'}
                    onChange={(e) => setEditingBooking({ ...editingBooking, bookingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Booking Time (Pickup Time)</span>
                  </label>
                  <input
                    type="time"
                    value={editingBooking.bookingTime || editingBooking.arrivalTime || '14:30'}
                    onChange={(e) => setEditingBooking({ ...editingBooking, bookingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Chauffeur
                  </label>
                  <select
                    value={editingBooking.driverId || ''}
                    onChange={(e) => {
                      const d = drivers.find((drv) => drv.id === e.target.value);
                      setEditingBooking({
                        ...editingBooking,
                        driverId: e.target.value,
                        driverName: d ? d.name : 'Unassigned',
                        driverVehicle: d ? `${d.vehicle} (${d.plateNumber})` : editingBooking.driverVehicle,
                        driverPhone: d ? d.phone : editingBooking.driverPhone,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.vehicle}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tour Guide
                  </label>
                  <select
                    value={editingBooking.guideId || ''}
                    onChange={(e) => {
                      const g = tourGuides.find((gd) => gd.id === e.target.value);
                      setEditingBooking({
                        ...editingBooking,
                        guideId: e.target.value,
                        guideName: g ? g.name : '',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="">No Guide</option>
                    {tourGuides.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.languages.join('/')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Amount (QAR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingBooking.totalQAR}
                    onChange={(e) => setEditingBooking({ ...editingBooking, totalQAR: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={editingBooking.paymentMethod}
                    onChange={(e) => setEditingBooking({ ...editingBooking, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="POS Card">POS Card</option>
                    <option value="Cash">Cash Drawer</option>
                    <option value="Payment Link">Payment Link</option>
                    <option value="Website Online Gateway">Website Online Gateway</option>
                    <option value="Prepaid OTA">Prepaid OTA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Operational Notes & Dispatch Instructions
                </label>
                <textarea
                  rows={2}
                  value={editingBooking.notes || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  {editingBooking.qrStatus === 'pending' && (
                    <button
                      type="button"
                      onClick={() => {
                        approveBooking(editingBooking.id);
                        setEditingBooking({ ...editingBooking, qrStatus: 'confirmed' });
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Booking Lead Now</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingBooking(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs"
                  >
                    Save Booking Updates
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
