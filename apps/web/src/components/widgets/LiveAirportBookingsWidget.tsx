import React, { useState } from 'react';
import {
  QrCode,
  Send,
  CheckCircle2,
  Clock,
  Car,
  Filter,
  Search,
  ExternalLink,
  Share2,
  Edit3,
  X,
  Calendar,
  Building2,
  Compass,
  Copy,
  Check,
  BedDouble,
  Utensils,
  Globe,
  Award,
  BadgeCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking, HotelBooking } from '../../types';
import { matchesDateFilter } from '../../utils/dateFilter';

export interface LiveAirportBookingsWidgetProps {
  activeMode?: 'both' | 'services' | 'hotels';
}

export const LiveAirportBookingsWidget: React.FC<LiveAirportBookingsWidgetProps> = ({
  activeMode = 'both',
}) => {
  const {
    bookings,
    hotelBookings,
    hotelVendors,
    updateHotelBookingStatus,
    setActiveTab,
    searchQuery,
    convertAmount,
    currency,
    updateBookingStatus,
    updateBooking,
    drivers,
    tourGuides,
    toggleVoucherSent,
    openModal,
    language,
    dateFilter,
    t,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'services' | 'hotels'>(
    activeMode === 'hotels' ? 'hotels' : 'services'
  );

  React.useEffect(() => {
    if (activeMode === 'hotels') setActiveCategory('hotels');
    else if (activeMode === 'services') setActiveCategory('services');
  }, [activeMode]);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hotelStatusFilter, setHotelStatusFilter] = useState<string>('ALL');
  const [selectedHotelFilter, setSelectedHotelFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedHotelCode, setCopiedHotelCode] = useState<string | null>(null);
  const [copiedHotelWhatsAppId, setCopiedHotelWhatsAppId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Filter bookings based on date filter, global search & local filter
  const filteredBookings = bookings.filter((b) => {
    if (!matchesDateFilter(b.createdAt, dateFilter)) return false;

    const matchesSearch =
      b.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.packageName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return b.qrStatus === statusFilter;
  });

  // Filter hotel bookings synced with Hotel Booking Engine and Hotel Partner Console
  const filteredHotelBookings = hotelBookings.filter((b) => {
    if (!matchesDateFilter(b.createdAt, dateFilter)) return false;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.guestName.toLowerCase().includes(q) ||
      b.confirmationCode.toLowerCase().includes(q) ||
      b.hotelName.toLowerCase().includes(q) ||
      b.roomType.toLowerCase().includes(q) ||
      b.guestPhone.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedHotelFilter !== 'ALL' && b.hotelId !== selectedHotelFilter) return false;
    if (hotelStatusFilter === 'ALL') return true;
    return b.bookingStatus === hotelStatusFilter;
  });

  const handleCopyWhatsApp = (booking: Booking) => {
    const msg = `Marhaba ${booking.passengerName}! Your AR Trust Qatar booking (${booking.pnr}) for ${booking.packageName} is confirmed. Driver ${booking.driverName} (${booking.driverVehicle}) is awaiting you at Hamad Airport ${booking.pickupBay}. Track driver: https://artrust.qa/track/${booking.pnr}`;
    navigator.clipboard?.writeText(msg);
    setCopiedId(booking.id);
    toggleVoucherSent(booking.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCheckInHotel = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateHotelBookingStatus(id, 'Checked In');
  };

  const handleCompleteHotel = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    updateHotelBookingStatus(id, 'Completed');
  };

  const handleCopyHotelCode = (code: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(code);
    setCopiedHotelCode(code);
    setTimeout(() => setCopiedHotelCode(null), 2500);
  };

  const handleCopyHotelWhatsApp = (b: HotelBooking, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const msg = `Marhaba ${b.guestName}! Your luxury hotel reservation at ${b.hotelName} (${b.roomType}) is confirmed under Voucher Ref: ${b.confirmationCode}. Check-in: ${b.checkInDate}, Check-out: ${b.checkOutDate} (${b.nights} nights, ${b.mealPlan}). Hotel Concierge & Airport Desk are ready to assist. Track voucher: https://artrust.qa/hotel-voucher/${b.confirmationCode}`;
    navigator.clipboard?.writeText(msg);
    setCopiedHotelWhatsAppId(b.id);
    setTimeout(() => setCopiedHotelWhatsAppId(null), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors flex flex-col justify-between">
      {/* Header & Category Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold w-fit">
            <button
              onClick={() => setActiveCategory('services')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCategory === 'services'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'ar' ? 'طابور الجولات والترانزيت' : 'Tours & Transit Queue'}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeCategory === 'services'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {filteredBookings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveCategory('hotels')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeCategory === 'hotels'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'ar' ? 'حجوزات الفنادق والشركاء' : 'Hotel Partner Stays'}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                activeCategory === 'hotels'
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {filteredHotelBookings.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:block text-xs text-slate-400">|</div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeCategory === 'services'
              ? language === 'ar'
                ? 'تحقق فوري من التذاكر الإلكترونية، ركاب المطار ومكاتب الفنادق، وإرسال قسائم الواتساب'
                : 'Agent Desk & Airport counters queue, QR boarding passes & instant WhatsApp dispatch'
              : language === 'ar'
              ? 'مزامنة حية مع محرك حجز الفنادق ولوحة شركاء الضيافة مع تسجيل الوصول وإدارة القسائم'
              : 'Live sync with Hotel Booking Engine & Hotel Partner Console with instant check-in'}
          </p>
        </div>

        {/* Dynamic Filters depending on Category */}
        {activeCategory === 'services' ? (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs shrink-0">
            {['all', 'checked-in', 'in-transit', 'scheduled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {st === 'all'
                  ? language === 'ar'
                    ? 'الكل'
                    : 'All'
                  : st === 'checked-in'
                  ? language === 'ar'
                    ? 'تم التحقق'
                    : 'Checked In'
                  : st === 'in-transit'
                  ? language === 'ar'
                    ? 'في الطريق'
                    : 'In Transit'
                  : language === 'ar'
                  ? 'مجدول'
                  : 'Scheduled'}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Filter by Hotel */}
            <select
              value={selectedHotelFilter}
              onChange={(e) => setSelectedHotelFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 font-medium outline-none cursor-pointer"
            >
              <option value="ALL">All Hotel Properties ({hotelVendors.length})</option>
              {hotelVendors.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>

            {/* Status pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
              {[
                { id: 'ALL', label: 'All', labelAr: 'الكل' },
                { id: 'Checked In', label: 'In-House', labelAr: 'مقيم' },
                { id: 'Confirmed', label: 'Confirmed', labelAr: 'مؤكد' },
                { id: 'Completed', label: 'Completed', labelAr: 'مكتمل' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setHotelStatusFilter(st.id)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    hotelStatusFilter === st.id
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {language === 'ar' ? st.labelAr : st.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Tables */}
      {activeCategory === 'services' ? (
        /* 1. Tours & Airport Transit Table */
        <div className="overflow-x-auto mt-3">
        <table className="w-full text-left rtl:text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Lead Passenger</th>
              <th className="py-2.5 px-3">Package Tour</th>
              <th className="py-2.5 px-3 text-right rtl:text-left">Amount ({currency})</th>
              <th className="py-2.5 px-3">Driver</th>
              <th className="py-2.5 px-3 text-center">QR Status</th>
              <th className="py-2.5 px-3 text-right rtl:text-left">Voucher</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No agent desk bookings match the active query.
                </td>
              </tr>
            ) : (
              filteredBookings.slice(0, 6).map((booking) => {
                const converted = convertAmount(booking.totalQAR);
                return (
                  <tr
                    key={booking.id}
                    onClick={() => setEditingBooking({ ...booking })}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                    title="Click booking to view full details and edit status / info"
                  >
                    {/* Passenger Details */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{booking.passengerName}</span>
                        <span className="text-[10px] font-mono text-slate-400">({booking.paxCount} pax)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono mt-0.5">
                        <span>{booking.nationality}</span>
                        <span>·</span>
                        <span>{booking.passengerPhone}</span>
                      </div>
                    </td>

                    {/* Package */}
                    <td className="py-3 px-3 max-w-[190px]">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {language === 'ar' ? booking.packageNameAr : booking.packageName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        PNR: {booking.pnr}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-3 text-right rtl:text-left font-mono tabular-nums">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {converted.formatted}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {booking.paymentMethod}
                      </div>
                    </td>

                    {/* Driver & Vehicle */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                        <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{booking.driverName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]">
                        {booking.driverVehicle}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextStatus: Record<string, Booking['qrStatus']> = {
                            'scheduled': 'checked-in',
                            'checked-in': 'in-transit',
                            'in-transit': 'completed',
                            'completed': 'scheduled',
                          };
                          updateBookingStatus(booking.id, nextStatus[booking.qrStatus] || 'checked-in');
                        }}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-all hover:scale-105 ${
                          booking.qrStatus === 'checked-in'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : booking.qrStatus === 'in-transit'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : booking.qrStatus === 'completed'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        }`}
                        title="Click to advance status"
                      >
                        {booking.qrStatus === 'checked-in' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {booking.qrStatus === 'in-transit' && <Clock className="w-3 h-3 text-amber-600" />}
                        <span className="capitalize">{booking.qrStatus.replace('-', ' ')}</span>
                      </button>
                    </td>

                    {/* Actions: QR Pass & WhatsApp & Edit */}
                    <td className="py-3 px-3 text-right rtl:text-left">
                      <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                        {/* Edit Full Dossier */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBooking({ ...booking });
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="View Full Booking Details & Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        </button>

                        {/* Digital QR Boarding Pass Modal Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('qr-voucher', booking);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="View QR Voucher Pass"
                        >
                          <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </button>

                        {/* WhatsApp Instant Voucher Dispatch */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyWhatsApp(booking);
                          }}
                          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                            copiedId === booking.id
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          }`}
                          title="Dispatch Instant WhatsApp Voucher"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {copiedId === booking.id ? (
                            <span className="text-[10px] font-bold">Sent!</span>
                          ) : null}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      ) : (
        /* 2. Hotel Partner Console & Booking Engine Synced Table */
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Voucher Ref</th>
                <th className="py-2.5 px-3">Guest Details</th>
                <th className="py-2.5 px-3">Hotel Property</th>
                <th className="py-2.5 px-3">Room & Meal</th>
                <th className="py-2.5 px-3">Stay Dates</th>
                <th className="py-2.5 px-3 text-right rtl:text-left">Amount ({currency})</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right rtl:text-left">Console Sync Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
              {filteredHotelBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Building2 className="w-6 h-6 opacity-40 text-slate-400" />
                      <span className="font-semibold">No hotel partner bookings match the active query.</span>
                      <span className="text-[11px] text-slate-400">
                        Total {hotelBookings.length} hotel reservations in system.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHotelBookings.slice(0, 6).map((b) => {
                  const converted = convertAmount(b.totalQAR);
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Confirmation Code */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                          <span>{b.confirmationCode}</span>
                          <button
                            onClick={(e) => handleCopyHotelCode(b.confirmationCode, e)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                            title="Copy Voucher Ref"
                          >
                            {copiedHotelCode === b.confirmationCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          Booked: {b.createdAt}
                        </span>
                      </td>

                      {/* Guest Details */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {b.guestName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {b.guestNationality} · {b.guestPhone}
                        </div>
                      </td>

                      {/* Hotel Name */}
                      <td className="py-3 px-3 max-w-[170px]">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{b.hotelName}</span>
                        </div>
                        <div className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 mt-0.5">
                          <span>★★★★★ 5-Star Partner</span>
                        </div>
                      </td>

                      {/* Room & Meal Plan */}
                      <td className="py-3 px-3 max-w-[160px]">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {b.roomType}
                        </div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                          <Utensils className="w-2.5 h-2.5" />
                          <span>{b.mealPlan} ({b.paxAdults}A{b.paxChildren > 0 ? `, ${b.paxChildren}C` : ''})</span>
                        </div>
                      </td>

                      {/* Stay Dates */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{b.checkInDate}</span>
                          <span className="text-slate-400"> → </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{b.checkOutDate}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                          {b.nights} Nights · {b.roomsCount || 1} Room(s)
                        </div>
                      </td>

                      {/* Total Amount & Channel */}
                      <td className="py-3 px-3 text-right rtl:text-left font-mono tabular-nums">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {converted.formatted}
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans block mt-0.5">
                          ✓ {b.paymentStatus}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            b.bookingStatus === 'Checked In'
                              ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : b.bookingStatus === 'Confirmed'
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : b.bookingStatus === 'Completed'
                              ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              b.bookingStatus === 'Checked In'
                                ? 'bg-blue-500'
                                : b.bookingStatus === 'Confirmed'
                                ? 'bg-emerald-500'
                                : b.bookingStatus === 'Completed'
                                ? 'bg-purple-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span>{b.bookingStatus}</span>
                        </span>
                      </td>

                      {/* Synchronized Actions */}
                      <td className="py-3 px-3 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                          {/* 1-Click Status Sync */}
                          {b.bookingStatus === 'Confirmed' ? (
                            <button
                              onClick={(e) => handleCheckInHotel(b.id, e)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-2xs transition cursor-pointer active:scale-95 flex items-center gap-1"
                              title="Sync Check-In to Hotel Partner Console"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Check In</span>
                            </button>
                          ) : b.bookingStatus === 'Checked In' ? (
                            <button
                              onClick={(e) => handleCompleteHotel(b.id, e)}
                              className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] shadow-2xs transition cursor-pointer active:scale-95 flex items-center gap-1"
                              title="Sync Complete Stay to Hotel Partner Console"
                            >
                              <BadgeCheck className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                          ) : null}

                          {/* Digital QR Voucher Modal */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal('qr-voucher', { booking: b });
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            title="View Synced QR Voucher"
                          >
                            <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </button>

                          {/* Instant WhatsApp Dispatch */}
                          <button
                            onClick={(e) => handleCopyHotelWhatsApp(b, e)}
                            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                              copiedHotelWhatsAppId === b.id
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                            }`}
                            title="Dispatch Instant WhatsApp Hotel Voucher"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {copiedHotelWhatsAppId === b.id && (
                              <span className="text-[10px] font-bold">Sent!</span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <span className="font-mono">
          {activeCategory === 'services'
            ? `Showing ${Math.min(6, filteredBookings.length)} of ${bookings.length} reservations`
            : `Showing ${Math.min(6, filteredHotelBookings.length)} of ${hotelBookings.length} synced hotel reservations`}
        </span>

        <div className="flex items-center gap-3">
          {activeCategory === 'services' ? (
            <button
              onClick={() => openModal('new-booking')}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              + Add Agent Desk Walk-In
            </button>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('hotel-bookings')}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Open Full Hotel Booking Engine</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveTab('hotel-bookings')}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                + Book Hotel Room
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit Booking Details Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Booking Dossier & Admin Edit ({editingBooking.pnr})
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
              {/* Passenger & Origin */}
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

              {/* Booking Date & Time */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Booking Date</span>
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
                    <span>Booking / Pickup Time</span>
                  </label>
                  <input
                    type="time"
                    value={editingBooking.bookingTime || editingBooking.arrivalTime || '14:30'}
                    onChange={(e) => setEditingBooking({ ...editingBooking, bookingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Contact & PAX */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editingBooking.passengerPhone}
                    onChange={(e) => setEditingBooking({ ...editingBooking, passengerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
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

              {/* Status & PAX */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Booking Status
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
                    <option value="in-transit">In Transit</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PAX Count
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

              {/* Driver & Guide */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Driver
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

              {/* Financials */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Revenue (QAR)
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
                    <option value="Prepaid OTA">Prepaid OTA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editingBooking.notes || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Booking Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
