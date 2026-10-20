import React, { useState, useMemo } from 'react';
import {
  Building2,
  CalendarCheck2,
  BedDouble,
  Calendar,
  Users,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  Sparkles,
  Download,
  X,
  Store,
  DollarSign,
  ChevronRight,
  Filter,
  AlertCircle,
  FileText,
  BadgePercent,
  Check,
  Copy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HotelBooking, HotelVendor, HotelRoomOption } from '../../types';

export const HotelBookingView: React.FC = () => {
  const {
    hotelVendors,
    hotelBookings,
    addHotelBooking,
    updateHotelBooking,
    cancelHotelBooking,
    updateHotelBookingStatus,
    guests,
    guestTiers,
    airportDesks,
    setActiveTab,
    openModal,
    language,
    currency,
    convertAmount,
  } = useApp();

  const isRtl = language === 'ar';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHotelFilter, setSelectedHotelFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals & Active Voucher State
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [activeVoucherBooking, setActiveVoucherBooking] = useState<HotelBooking | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Booking Wizard Form State
  const [selectedVendorId, setSelectedVendorId] = useState<string>(hotelVendors[0]?.id || '');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [paxAdults, setPaxAdults] = useState<number>(2);
  const [paxChildren, setPaxChildren] = useState<number>(0);
  const [mealPlan, setMealPlan] = useState<HotelBooking['mealPlan']>('Bed & Breakfast');

  // Guest Details Form State
  const [selectedExistingGuestId, setSelectedExistingGuestId] = useState<string>('new');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('+974 ');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestNationality, setGuestNationality] = useState<string>('Qatar');
  const [guestVipTier, setGuestVipTier] = useState<string>('Standard');

  // Channel & Payment
  const [bookingSource, setBookingSource] = useState<HotelBooking['bookingSource']>('Agent Desk (Hotel Lobby)');
  const [deskCode, setDeskCode] = useState<string>('RC-DK-01');
  const [agentName, setAgentName] = useState<string>('Aisha Al-Kuwari');
  const [paymentMethod, setPaymentMethod] = useState<HotelBooking['paymentMethod']>('POS Card');
  const [paymentStatus, setPaymentStatus] = useState<HotelBooking['paymentStatus']>('Paid & Verified');
  const [specialRequests, setSpecialRequests] = useState<string>('High floor sea view requested, VIP greeting amenities upon arrival.');

  // Current selected vendor object
  const activeVendor = useMemo(() => {
    return hotelVendors.find((v) => v.id === selectedVendorId) || hotelVendors[0];
  }, [hotelVendors, selectedVendorId]);

  // Available room options for active vendor
  const availableRooms = useMemo(() => {
    return activeVendor?.roomOptions || [];
  }, [activeVendor]);

  // Current selected room option
  const activeRoomOption = useMemo(() => {
    if (!availableRooms.length) return null;
    return availableRooms.find((r) => r.roomType === selectedRoomType) || availableRooms[0];
  }, [availableRooms, selectedRoomType]);

  // Calculate nights
  const calculatedNights = useMemo(() => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  // VIP Tier discount calculation
  const vipDiscountPercentage = useMemo(() => {
    if (!guestVipTier || guestVipTier === 'Standard') return 0;
    const tier = guestTiers.find((t) => t.name.toLowerCase() === guestVipTier.toLowerCase());
    return tier?.discountPercentage || 0;
  }, [guestTiers, guestVipTier]);

  // Live total calculation
  const nightlyRate = activeRoomOption?.ratePerNightQAR || 1500;
  const baseSubtotalQAR = nightlyRate * calculatedNights * roomsCount;
  const discountAmountQAR = Math.round((baseSubtotalQAR * vipDiscountPercentage) / 100);
  const totalPayableQAR = baseSubtotalQAR - discountAmountQAR;
  const commissionPercentage = activeVendor?.commissionRate || 15;
  const commissionEarnedQAR = Math.round((totalPayableQAR * commissionPercentage) / 100);

  // Trigger feedback
  const triggerFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Handle Existing Guest Selection
  const handleGuestSelectChange = (guestId: string) => {
    setSelectedExistingGuestId(guestId);
    if (guestId === 'new') {
      setGuestName('');
      setGuestPhone('+974 ');
      setGuestEmail('');
      setGuestNationality('Qatar');
      setGuestVipTier('Standard');
    } else {
      const g = guests.find((x) => x.id === guestId);
      if (g) {
        setGuestName(g.name);
        setGuestPhone(g.phone);
        setGuestEmail(g.email);
        setGuestNationality(g.nationality);
        setGuestVipTier(g.vipTier || 'Standard');
      }
    }
  };

  // Submit Hotel Booking
  const handleCreateHotelBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      triggerFeedback('Please provide the lead guest name.', 'error');
      return;
    }
    if (!activeVendor) {
      triggerFeedback('Please select a valid partner hotel.', 'error');
      return;
    }

    const roomTypeToSave = activeRoomOption?.roomType || availableRooms[0]?.roomType || 'Deluxe Room';

    const newBookingData = {
      hotelId: activeVendor.id,
      hotelName: activeVendor.name,
      hotelLocation: activeVendor.locationZone,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim(),
      guestNationality: guestNationality.trim(),
      roomType: roomTypeToSave,
      roomsCount: Number(roomsCount) || 1,
      paxAdults: Number(paxAdults) || 2,
      paxChildren: Number(paxChildren) || 0,
      checkInDate,
      checkOutDate,
      nights: calculatedNights,
      mealPlan,
      ratePerNightQAR: nightlyRate,
      totalQAR: totalPayableQAR,
      commissionRate: commissionPercentage,
      commissionEarnedQAR,
      bookingSource,
      deskCode,
      agentName,
      paymentMethod,
      paymentStatus,
      bookingStatus: 'Confirmed' as const,
      specialRequests: specialRequests.trim(),
      voucherSent: true,
    };

    const res = addHotelBooking(newBookingData);
    if (res.success && res.booking) {
      triggerFeedback(`Hotel reservation ${res.booking.confirmationCode} confirmed at ${activeVendor.name}!`, 'success');
      setShowNewBookingModal(false);
      setActiveVoucherBooking(res.booking);
    } else {
      triggerFeedback(res.error || 'Failed to create hotel booking.', 'error');
    }
  };

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return hotelBookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.confirmationCode.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q) ||
        b.hotelName.toLowerCase().includes(q) ||
        b.roomType.toLowerCase().includes(q) ||
        (b.deskCode && b.deskCode.toLowerCase().includes(q));

      const matchesHotel = selectedHotelFilter === 'ALL' || b.hotelId === selectedHotelFilter;
      const matchesStatus = selectedStatusFilter === 'ALL' || b.bookingStatus === selectedStatusFilter;

      return matchesSearch && matchesHotel && matchesStatus;
    });
  }, [hotelBookings, searchQuery, selectedHotelFilter, selectedStatusFilter]);

  // Overall KPIs
  const totalBookingsCount = hotelBookings.length;
  const confirmedCount = hotelBookings.filter((b) => b.bookingStatus === 'Confirmed').length;
  const checkedInCount = hotelBookings.filter((b) => b.bookingStatus === 'Checked In').length;
  const totalHotelRevenueQAR = hotelBookings.reduce((sum, b) => sum + (b.totalQAR || 0), 0);
  const totalCommissionEarnedQAR = hotelBookings.reduce((sum, b) => sum + (b.commissionEarnedQAR || 0), 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <BedDouble className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {isRtl ? 'منظومة حجز الفنادق الشريكة بقطر' : 'Qatar Hotel Booking System'}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50">
                  {totalBookingsCount} Reservations
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRtl
                  ? 'حجوزات مباشرة للغرف والأجنحة الفاخرة، احتساب العمولات، إصدار قسائم الفنادق الفورية بالرمز QR.'
                  : 'Direct room reservations, suite allocations, VIP amenities, and instant QR guest voucher issuance across Qatar luxury hotels.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openModal('add-hotel-room')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 transition-colors border border-amber-300 dark:border-amber-700/60 shadow-xs cursor-pointer active:scale-95"
            title="Add a new room category and rate to a hotel vendor"
          >
            <BedDouble className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{isRtl ? '+ إضافة غرفة فندقية' : '+ Add Hotel Room'}</span>
          </button>

          <button
            onClick={() => openModal('qr-verification')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 hover:bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/40 hover:border-[#D4AF37] transition-colors shadow-xs cursor-pointer active:scale-95"
            title="Verify customer QR voucher or hotel confirmation code"
          >
            <QrCode className="w-4 h-4 text-[#D4AF37]" />
            <span>{isRtl ? 'مسح رمز QR' : 'Verify QR Voucher'}</span>
          </button>

          <button
            onClick={() => setActiveTab('vendors')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>{isRtl ? 'دليل الفنادق والشركاء' : 'Hotel Vendors Directory'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 transition-colors border border-blue-200 dark:border-blue-800 cursor-pointer"
          >
            <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{isRtl ? 'Agent Desk POS' : 'Agent Desk POS'}</span>
          </button>

          <button
            onClick={() => {
              if (hotelVendors.length > 0) {
                setSelectedVendorId(hotelVendors[0].id);
                if (hotelVendors[0].roomOptions.length > 0) {
                  setSelectedRoomType(hotelVendors[0].roomOptions[0].roomType);
                }
              }
              setShowNewBookingModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? '+ حجز فندقي جديد' : '+ New Hotel Booking'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{isRtl ? 'إجمالي الحجوزات' : 'Total Bookings'}</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalBookingsCount}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            <span className="text-emerald-500 font-bold">{confirmedCount}</span> Confirmed · <span className="text-blue-500 font-bold">{checkedInCount}</span> In-House
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{isRtl ? 'إجمالي الإيرادات' : 'Gross Revenue'}</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {convertAmount(totalHotelRevenueQAR).formatted}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Direct hotel room sales</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{isRtl ? 'عمولة الشركة' : 'Agency Commission'}</span>
            <BadgePercent className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {convertAmount(totalCommissionEarnedQAR).formatted}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Accrued agency profit</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{isRtl ? 'الفنادق النشطة' : 'Partner Hotels'}</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{hotelVendors.length}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Qatar luxury properties</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{isRtl ? 'مكاتب الوكلاء' : 'Lobby Agent Desks'}</span>
            <Store className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {hotelVendors.reduce((acc, v) => acc + (v.desks?.length || 0), 0)}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">On-site Concierge Desks</div>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'ابحث برقم الحجز، اسم الضيف، الفندق، نوع الغرفة...' : 'Search confirmation code, guest name, hotel, room type...'}
            className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Hotel Filter */}
          <select
            value={selectedHotelFilter}
            onChange={(e) => setSelectedHotelFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="ALL">{isRtl ? 'جميع الفنادق' : 'All Partner Hotels'}</option>
            {hotelVendors.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="ALL">{isRtl ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked In">Checked In</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* 4. Hotel Bookings Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Conf. Code</th>
                <th className="py-3 px-4">Hotel & Room Category</th>
                <th className="py-3 px-4">Lead Guest & Pax</th>
                <th className="py-3 px-4">Dates & Nights</th>
                <th className="py-3 px-4">Meal Plan</th>
                <th className="py-3 px-4">Total & Commission</th>
                <th className="py-3 px-4">Agent Desk Station</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Confirmation Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-900 dark:text-white">
                          {booking.confirmationCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(booking.confirmationCode)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                          title="Copy confirmation code"
                        >
                          {copiedCode === booking.confirmationCode ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">{booking.createdAt}</span>
                    </td>

                    {/* Hotel & Room Category */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{booking.hotelName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pl-4.5 rtl:pl-0 rtl:pr-4.5">
                        {booking.roomType} ({booking.roomsCount || 1} room)
                      </div>
                    </td>

                    {/* Guest & Pax */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-800 dark:text-slate-200">{booking.guestName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span>{booking.guestNationality}</span>
                        <span>·</span>
                        <span>
                          {booking.paxAdults} Adults{booking.paxChildren ? `, ${booking.paxChildren} Ch.` : ''}
                        </span>
                      </div>
                    </td>

                    {/* Dates & Nights */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-medium text-slate-800 dark:text-slate-200 text-[11px]">
                        {booking.checkInDate} <span className="text-slate-400">→</span> {booking.checkOutDate}
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono">
                        {booking.nights} Nights
                      </span>
                    </td>

                    {/* Meal Plan */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                        {booking.mealPlan}
                      </span>
                    </td>

                    {/* Total & Commission */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-extrabold text-slate-900 dark:text-white">
                        {convertAmount(booking.totalQAR).formatted}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        Comm: +{convertAmount(booking.commissionEarnedQAR).formatted} ({booking.commissionRate}%)
                      </div>
                    </td>

                    {/* Agent Desk Station */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        <Store className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate max-w-[130px]">{booking.deskCode || 'Hotel Lobby Desk'}</span>
                      </div>
                      {booking.agentName && (
                        <div className="text-[10px] text-slate-400 pl-4.5 rtl:pl-0 rtl:pr-4.5">{booking.agentName}</div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          booking.bookingStatus === 'Confirmed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800'
                            : booking.bookingStatus === 'Checked In'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800'
                            : booking.bookingStatus === 'Completed'
                            ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveVoucherBooking(booking)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 flex items-center gap-1"
                          title="View and print luxury hotel voucher"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Voucher</span>
                        </button>

                        {booking.bookingStatus === 'Confirmed' && (
                          <button
                            onClick={() => updateHotelBookingStatus(booking.id, 'Checked In')}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                            title="Guest arrived at hotel"
                          >
                            Check In
                          </button>
                        )}

                        {booking.bookingStatus === 'Checked In' && (
                          <button
                            onClick={() => updateHotelBookingStatus(booking.id, 'Completed')}
                            className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            title="Check out completed"
                          >
                            Complete
                          </button>
                        )}

                        {booking.bookingStatus !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Cancel hotel reservation ${booking.confirmationCode}?`)) {
                                cancelHotelBooking(booking.id, 'Cancelled by concierge desk request');
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Cancel Reservation"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No hotel bookings found matching the current query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: NEW HOTEL BOOKING WIZARD */}
      {showNewBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isRtl ? 'حجز فندق جديد (Qatar Luxury Hotel Reservation)' : 'New Qatar Hotel Reservation'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct booking engine synced with partner hotels and stationed Agent Desk POS.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewBookingModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHotelBooking} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              {/* Hotel & Room Selection */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-500" />
                  <span>1. Select Partner Hotel Property & Room Category</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Partner Hotel Property (Qatar) *
                    </label>
                    <select
                      value={selectedVendorId}
                      onChange={(e) => {
                        setSelectedVendorId(e.target.value);
                        const v = hotelVendors.find((x) => x.id === e.target.value);
                        if (v && v.roomOptions.length > 0) {
                          setSelectedRoomType(v.roomOptions[0].roomType);
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
                    >
                      {hotelVendors.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} — {h.locationZone} ({h.starRating}★)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Room Category / Suite *
                    </label>
                    <select
                      value={selectedRoomType || activeRoomOption?.roomType || ''}
                      onChange={(e) => setSelectedRoomType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500"
                    >
                      {availableRooms.map((r, i) => (
                        <option key={i} value={r.roomType}>
                          {r.roomType} — {convertAmount(r.ratePerNightQAR).formatted}/nt (Max {r.maxPax} Pax)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeRoomOption && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Room Details: </span>
                    {activeRoomOption.description} · Base Rate: <strong className="text-slate-900 dark:text-white font-mono">{convertAmount(activeRoomOption.ratePerNightQAR).formatted}</strong> per night.
                  </div>
                )}
              </div>

              {/* Dates & Occupancy */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>2. Dates, Duration & Occupancy</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Check-in Date *</label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Check-out Date *</label>
                    <input
                      type="date"
                      required
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                    <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {calculatedNights} Nights
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Meal Plan</label>
                    <select
                      value={mealPlan}
                      onChange={(e) => setMealPlan(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="Room Only">Room Only</option>
                      <option value="Bed & Breakfast">Bed & Breakfast</option>
                      <option value="Half Board">Half Board</option>
                      <option value="Full Board">Full Board</option>
                      <option value="All Inclusive">All Inclusive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rooms Count</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={roomsCount}
                      onChange={(e) => setRoomsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Adults (Pax)</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={paxAdults}
                      onChange={(e) => setPaxAdults(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Children</label>
                    <input
                      type="number"
                      min="0"
                      max="6"
                      value={paxChildren}
                      onChange={(e) => setPaxChildren(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Guest Profile & VIP Tier */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-500" />
                    <span>3. Lead Guest Information & VIP Tier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Registered Guests:</span>
                    <select
                      value={selectedExistingGuestId}
                      onChange={(e) => handleGuestSelectChange(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs"
                    >
                      <option value="new">+ Enter New Guest Details</option>
                      {guests.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.nationality}) · {g.vipTier}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lead Guest Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sheikh Nayef Al-Thani"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={guestNationality}
                      onChange={(e) => setGuestNationality(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. guest@vip.qa"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Guest VIP Tier ({vipDiscountPercentage}% discount)
                    </label>
                    <select
                      value={guestVipTier}
                      onChange={(e) => setGuestVipTier(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="Standard">Standard (0% discount)</option>
                      {guestTiers.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.discountPercentage}% Discount)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Stationed Agent Desk & Payment */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-500" />
                  <span>4. Agent Desk POS Channel & Payment Settlement</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Booking Channel</label>
                    <select
                      value={bookingSource}
                      onChange={(e) => setBookingSource(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="Agent Desk (Hotel Lobby)">Agent Desk (Hotel Lobby)</option>
                      <option value="Airport Desk Counter">Agent Desk (Airport Station)</option>
                      <option value="VIP Concierge Direct">VIP Concierge Direct</option>
                      <option value="Online Web Portal">Online Web Portal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Stationed Agent Desk Code</label>
                    <select
                      value={deskCode}
                      onChange={(e) => setDeskCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    >
                      <option value="RC-DK-01">RC-DK-01 (Ritz-Carlton Lobby Desk)</option>
                      <option value="FR-DK-01">FR-DK-01 (Katara Towers Raffles Desk)</option>
                      <option value="MO-DK-01">MO-DK-01 (Mandarin Oriental Msheireb)</option>
                      <option value="FS-DK-01">FS-DK-01 (Four Seasons Corniche Desk)</option>
                      <option value="SR-DK-01">SR-DK-01 (St. Regis Al Gassar Desk)</option>
                      <option value="MM-DK-01">MM-DK-01 (Marsa Malaz Kempinski Desk)</option>
                      <option value="HIA-CTR-04">HIA-CTR-04 (Airport Arrivals Concourse)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Settlement Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="POS Card">POS Card Terminal (QNB / Visa / MC)</option>
                      <option value="Cash">Cash (Multi-Currency Drawer)</option>
                      <option value="Payment Link Online">Payment Link Online (WhatsApp / SMS)</option>
                      <option value="Bill to Room">Bill to Room (Direct Hotel Charge)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Special Requests / VIP Amenities</label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Airport limousine transfer, high floor sea view, private yacht charter..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Price Breakdown Banner */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
                    Calculated Reservation Total
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                      {convertAmount(totalPayableQAR).formatted}
                    </span>
                    {vipDiscountPercentage > 0 && (
                      <span className="text-xs text-rose-500 line-through font-mono">
                        {convertAmount(baseSubtotalQAR).formatted}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {convertAmount(nightlyRate).formatted}/nt × {calculatedNights} nights × {roomsCount} room(s)
                    {vipDiscountPercentage > 0 ? ` · ${vipDiscountPercentage}% VIP discount (-${convertAmount(discountAmountQAR).formatted})` : ''}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block font-semibold">Agency Accrued Commission</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    +{convertAmount(commissionEarnedQAR).formatted}
                  </span>
                  <span className="text-[10px] text-slate-500 block">({commissionPercentage}% contract rate)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Hotel Reservation & Issue Voucher</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: LUXURY QATAR HOTEL VOUCHER */}
      {activeVoucherBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            {/* Voucher Header Bar */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 p-6 text-white relative">
              <button
                onClick={() => setActiveVoucherBooking(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Official Qatar Hotel Reservation Voucher</span>
                  </div>
                  <h3 className="text-xl font-black">{activeVoucherBooking.hotelName}</h3>
                  <p className="text-xs text-amber-100 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>{activeVoucherBooking.hotelLocation}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase text-amber-200 font-mono block">Confirmation Code</span>
                  <span className="text-base font-black font-mono tracking-wider bg-white/20 px-2.5 py-1 rounded-lg inline-block">
                    {activeVoucherBooking.confirmationCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Voucher Content */}
            <div className="p-6 space-y-5 text-xs">
              {/* Guest & Room Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Lead Guest Name</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white block mt-0.5">
                    {activeVoucherBooking.guestName}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{activeVoucherBooking.guestPhone}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Room Category</span>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white block mt-0.5">
                    {activeVoucherBooking.roomType}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {activeVoucherBooking.mealPlan}
                  </span>
                </div>
              </div>

              {/* Check-in & Check-out Timeline */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Check-In</span>
                  <div className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {activeVoucherBooking.checkInDate}
                  </div>
                  <span className="text-[10px] text-slate-400">From 15:00 PM</span>
                </div>

                <div className="text-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-mono font-bold text-xs">
                  {activeVoucherBooking.nights} Nights Stay
                </div>

                <div className="text-right space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Check-Out</span>
                  <div className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {activeVoucherBooking.checkOutDate}
                  </div>
                  <span className="text-[10px] text-slate-400">Until 12:00 PM</span>
                </div>
              </div>

              {/* QR Verification Code & Instructions */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <QrCode className="w-4 h-4 text-emerald-500" />
                    <span>Front Desk QR Check-In</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Present this voucher or QR code upon arrival at the hotel front desk along with your passport / QID.
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Stationed Agent Desk: {activeVoucherBooking.deskCode || 'Hotel Lobby Desk'}
                  </div>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 text-center shadow-xs">
                  <QrCode className="w-16 h-16 text-slate-900 dark:text-white" />
                  <span className="text-[9px] font-mono font-bold text-slate-400 block mt-1">VERIFIED</span>
                </div>
              </div>

              {/* Special Requests */}
              {activeVoucherBooking.specialRequests && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                  <span className="font-bold">Special Notes: </span>
                  {activeVoucherBooking.specialRequests}
                </div>
              )}

              {/* Price Settlement */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Paid & Verified</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                    {convertAmount(activeVoucherBooking.totalQAR).formatted}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment Method</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{activeVoucherBooking.paymentMethod}</div>
                </div>
              </div>
            </div>

            {/* Voucher Footer Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveVoucherBooking(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
              >
                Close
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Hotel Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
