import React, { useState, useMemo } from 'react';
import {
  Building2,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Search,
  Scan,
  Camera,
  Calendar,
  Users,
  BedDouble,
  DollarSign,
  Clock,
  Sparkles,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Printer,
  ChevronRight,
  Filter,
  Check,
  X,
  CreditCard,
  Utensils,
  Eye,
  RefreshCw,
  Sliders,
  BadgeCheck,
  Copy,
  Globe,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HotelBooking, HotelVendor } from '../../types';

export const VendorDashboardView: React.FC = () => {
  const {
    hotelVendors,
    hotelBookings,
    updateHotelBookingStatus,
    currentUser,
    currentRole,
    language,
    convertAmount,
    openModal,
    addAuditLog,
    t,
  } = useApp();

  const isRtl = language === 'ar';

  // Determine active hotel: if user is vendor-partner with vendorId, lock to that hotel.
  // Otherwise default to first hotel, but allow switching for Admins/Managers.
  const effectiveVendorId = useMemo(() => {
    if (currentUser?.vendorId) {
      if (currentUser.vendorId === 'h-marsa') return 'h-marsamalaz';
      return currentUser.vendorId;
    }
    return undefined;
  }, [currentUser]);

  const [selectedHotelId, setSelectedHotelId] = useState<string>(() => {
    if (currentUser?.vendorId) {
      if (currentUser.vendorId === 'h-marsa') return 'h-marsamalaz';
      return currentUser.vendorId;
    }
    return hotelVendors[0]?.id || 'h-ritz';
  });

  const activeHotel: HotelVendor | undefined = useMemo(() => {
    const targetId = currentRole === 'vendor-partner' && effectiveVendorId ? effectiveVendorId : selectedHotelId;
    if (targetId === 'ALL') {
      return {
        id: 'ALL',
        name: 'All Qatar Luxury Partner Hotels',
        nameAr: 'جميع فنادق قطر الشريكة',
        locationZone: 'State of Qatar',
        locationZoneAr: 'دولة قطر',
        starRating: 5,
        contactPerson: 'Director of Hotel Alliances',
        contactEmail: 'partners@artrusttravel.com',
        contactPhone: '+974 4499 8800',
        address: 'West Bay & Doha Waterfront Hospitality Network',
        commissionRate: 15,
        roomOptions: [],
        desks: [],
        amenities: ['Concierge Desk', 'VIP Transfers', 'Airport POS Integration'],
        contractStatus: 'Active Partner',
        totalBookings: hotelBookings.length,
        totalRevenueQAR: hotelBookings.reduce((sum, b) => sum + (b.totalQAR || 0), 0),
        createdAt: '2026-01-01',
      };
    }
    return (
      hotelVendors.find((h) => h.id === targetId) ||
      hotelVendors.find((h) => h.id === effectiveVendorId) ||
      hotelVendors[0]
    );
  }, [hotelVendors, selectedHotelId, effectiveVendorId, currentRole, hotelBookings]);

  // Sub-tab: 'bookings' | 'verify' | 'rooms' | 'desks'
  const [activeSubTab, setActiveSubTab] = useState<'verify' | 'bookings' | 'rooms' | 'desks'>('bookings');

  // Bookings list search & filter
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // QR & Voucher Verification State
  const [verifyInput, setVerifyInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<HotelBooking | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    type: 'success' | 'error' | 'already-checked-in';
    message: string;
  } | null>(null);

  // Filter hotel bookings for active hotel (or all hotels if ALL is selected)
  const hotelBookingsList = useMemo(() => {
    if (selectedHotelId === 'ALL') {
      return hotelBookings;
    }
    if (!activeHotel) return [];
    return hotelBookings.filter(
      (b) =>
        b.hotelId === activeHotel.id ||
        (activeHotel.id === 'h-marsamalaz' && (b.hotelId === 'h-marsa' || b.hotelId === 'h-marsamalaz')) ||
        b.hotelName.toLowerCase().includes(activeHotel.name.toLowerCase().split(',')[0])
    );
  }, [hotelBookings, activeHotel, selectedHotelId]);

  // KPI Calculations
  const metrics = useMemo(() => {
    const total = hotelBookingsList.length;
    const checkedIn = hotelBookingsList.filter((b) => b.bookingStatus === 'Checked In').length;
    const confirmed = hotelBookingsList.filter((b) => b.bookingStatus === 'Confirmed').length;
    const completed = hotelBookingsList.filter((b) => b.bookingStatus === 'Completed').length;
    const cancelled = hotelBookingsList.filter((b) => b.bookingStatus === 'Cancelled').length;
    const revenue = hotelBookingsList.reduce((sum, b) => sum + (b.totalQAR || 0), 0);
    const commission = hotelBookingsList.reduce((sum, b) => sum + (b.commissionEarnedQAR || 0), 0);
    const netPayout = revenue - commission;

    return { total, checkedIn, confirmed, completed, cancelled, revenue, commission, netPayout };
  }, [hotelBookingsList]);

  // Filtered Bookings Table
  const filteredBookings = useMemo(() => {
    return hotelBookingsList.filter((b) => {
      const matchSearch =
        b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.confirmationCode.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.roomType.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.guestNationality.toLowerCase().includes(bookingSearch.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;
    });
  }, [hotelBookingsList, bookingSearch, statusFilter]);

  // Voucher Verification by Code / Input
  const handleVerifyCode = (codeToTest?: string) => {
    const query = (codeToTest || verifyInput).trim().toLowerCase();
    if (!query) return;

    setVerificationFeedback(null);
    setScannedResult(null);

    // Search in current hotel's bookings first, then across all hotel bookings
    const match =
      hotelBookingsList.find(
        (b) =>
          b.confirmationCode.toLowerCase() === query ||
          b.id.toLowerCase() === query ||
          b.guestName.toLowerCase().includes(query) ||
          b.guestPhone.includes(query)
      ) ||
      hotelBookings.find(
        (b) =>
          b.confirmationCode.toLowerCase() === query ||
          b.id.toLowerCase() === query ||
          b.guestName.toLowerCase().includes(query)
      );

    if (!match) {
      setVerificationFeedback({
        type: 'error',
        message: isRtl
          ? `لم يتم العثور على حجز أو قسيمة برقم "${query}". يرجى التحقق من الرمز.`
          : `No booking or voucher found matching code "${query}". Please verify code with guest.`,
      });
      return;
    }

    setScannedResult(match);

    if (match.bookingStatus === 'Checked In') {
      setVerificationFeedback({
        type: 'already-checked-in',
        message: isRtl
          ? `النزيل مسجل وصوله بالفعل (Checked In) لهذا الحجز.`
          : `Guest has already been checked-in for this voucher reservation.`,
      });
    } else {
      setVerificationFeedback({
        type: 'success',
        message: isRtl
          ? `تم التحقق بنجاح! القسيمة معتمدة وصالحة لتسجيل الوصول.`
          : `Voucher successfully verified! Reservation is confirmed and ready for guest check-in.`,
      });
    }
  };

  // Simulate Live Camera QR Scanner
  const handleTriggerSimulatedQRScan = () => {
    setIsScanning(true);
    setVerificationFeedback(null);
    setScannedResult(null);

    // Pick a sample booking to simulate scanned QR code
    const sample =
      hotelBookingsList.find((b) => b.bookingStatus === 'Confirmed') ||
      hotelBookingsList[0] ||
      hotelBookings[0];

    setTimeout(() => {
      setIsScanning(false);
      if (sample) {
        setVerifyInput(sample.confirmationCode);
        handleVerifyCode(sample.confirmationCode);
      }
    }, 1200);
  };

  // Check In Guest & Redeem Voucher Action
  const handleCheckInGuest = (bookingId: string) => {
    const res = updateHotelBookingStatus(bookingId, 'Checked In');
    if (res.success) {
      if (scannedResult && scannedResult.id === bookingId) {
        setScannedResult({ ...scannedResult, bookingStatus: 'Checked In' });
      }
      setVerificationFeedback({
        type: 'already-checked-in',
        message: isRtl
          ? `تم تسجيل وصول النزيل وتفعيل القسيمة بنجاح في نظام الفندق!`
          : `Guest check-in confirmed and voucher redeemed successfully in hotel records!`,
      });
      addAuditLog(
        'Vendor Check-In',
        'POS',
        `Vendor (${activeHotel?.name}) checked in guest for booking #${bookingId}.`
      );
    }
  };

  if (!activeHotel) {
    return (
      <div className="p-8 text-center text-slate-500">
        No hotel vendor associated with this account.
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* 1. Header Card with Active Hotel Info & Property Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-amber-500/20 shrink-0">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isRtl && activeHotel.nameAr ? activeHotel.nameAr : activeHotel.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1">
                  <span>★ {activeHotel.starRating} Stars Luxury</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                  {activeHotel.contractStatus}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeHotel.locationZone}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{activeHotel.contactPhone}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{activeHotel.contactEmail}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Hotel Property Switcher (For Admins or Multi-hotel Partners) */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                {isRtl ? 'الفندق المعتمد:' : 'Active Property:'}
              </span>
              {currentRole === 'vendor-partner' && effectiveVendorId ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{activeHotel.name} (Partner Hotel)</span>
                </div>
              ) : (
                <select
                  value={selectedHotelId}
                  onChange={(e) => {
                    setSelectedHotelId(e.target.value);
                    setScannedResult(null);
                    setVerificationFeedback(null);
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value="ALL">All Hotel Partners (Consolidated - {hotelBookings.length} Stays)</option>
                  {hotelVendors.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Top 4 KPI Metrics - Specifically highlighting hotel bookings count */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Card 1: Total Hotel Bookings */}
          <div
            onClick={() => {
              setActiveSubTab('bookings');
              setStatusFilter('ALL');
            }}
            className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/60 hover:border-blue-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-blue-700 dark:text-blue-300 text-[10px] font-mono uppercase font-bold block">
                {isRtl ? 'إجمالي حجوزات فندقي' : 'My Hotel Bookings'}
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-blue-700 dark:text-blue-200 font-mono group-hover:scale-105 transition-transform">
                {metrics.total}
              </span>
              <span className="text-[11px] text-blue-600/80 font-semibold">Active Bookings</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 font-medium">
              {activeHotel.totalBookings} Lifetime Qatar Stays
            </span>
          </div>

          {/* Card 2: In-House Checked In Guests */}
          <div
            onClick={() => {
              setActiveSubTab('bookings');
              setStatusFilter('Checked In');
            }}
            className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 hover:border-emerald-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 dark:text-emerald-300 text-[10px] font-mono uppercase font-bold block">
                {isRtl ? 'النزلاء المقيمون حالياً' : 'In-House (Checked In)'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono group-hover:scale-105 transition-transform">
                {metrics.checkedIn}
              </span>
              <span className="text-[11px] text-emerald-600/80 font-semibold">Occupied Rooms</span>
            </div>
            <span className="text-[10px] text-emerald-600/80 block mt-1 font-medium">
              Guests currently on property
            </span>
          </div>

          {/* Card 3: Confirmed Upcoming Arrivals */}
          <div
            onClick={() => {
              setActiveSubTab('bookings');
              setStatusFilter('Confirmed');
            }}
            className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60 hover:border-amber-400 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-amber-700 dark:text-amber-300 text-[10px] font-mono uppercase font-bold block">
                {isRtl ? 'حجوزات قادمة مؤكدة' : 'Confirmed Arrivals'}
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono group-hover:scale-105 transition-transform">
                {metrics.confirmed}
              </span>
              <span className="text-[11px] text-amber-600/80 font-semibold">Awaiting Arrival</span>
            </div>
            <span className="text-[10px] text-amber-600/80 block mt-1 font-medium">
              Vouchers issued & verified
            </span>
          </div>

          {/* Card 4: Gross Hotel Revenue & Net Payout */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/60">
            <span className="text-purple-700 dark:text-purple-300 text-[10px] font-mono uppercase font-bold block">
              {isRtl ? 'إجمالي دخل الفندق' : 'Total Hotel Revenue'}
            </span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono">
                {convertAmount(metrics.revenue).formatted}
              </span>
            </div>
            <span className="text-[10px] text-purple-600/80 block mt-1 font-mono font-medium">
              Net Payout: {convertAmount(metrics.netPayout).formatted}
            </span>
          </div>
        </div>
      </div>

      {/* Hotel Partner Quick Status Notification Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/10 via-amber-900/10 to-emerald-900/10 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isRtl ? 'لوحة تحكم الفندق الشريك:' : 'Hotel Partner Dashboard:'}</span>
              <span className="text-blue-600 dark:text-blue-400 font-extrabold">{activeHotel.name}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isRtl
                ? `لديك حالياً ${metrics.total} حجز مسجل (${metrics.checkedIn} مقيم حالياً، ${metrics.confirmed} حجز مؤكد قادم، ${metrics.completed} مكتمل)`
                : `You currently have ${metrics.total} bookings on file (${metrics.checkedIn} currently in-house, ${metrics.confirmed} confirmed upcoming arrivals, ${metrics.completed} completed stays)`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setActiveSubTab('bookings');
              setStatusFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'bookings'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{isRtl ? 'عرض سجل الحجوزات' : 'View All Bookings'} ({metrics.total})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('verify')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'verify'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isRtl ? 'مسح رمز QR' : 'Scan Guest QR'}</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Tab Switcher Banner */}
      <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit shadow-2xs text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeSubTab === 'bookings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>
            {isRtl ? 'سجل حجوزات الفندق' : 'Hotel Bookings & Guests'} ({hotelBookingsList.length})
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('verify')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeSubTab === 'verify'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>{isRtl ? 'التحقق من القسائم ومسح QR' : 'Voucher Verification & QR Scanner'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rooms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeSubTab === 'rooms'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BedDouble className="w-4 h-4 text-amber-400" />
          <span>{isRtl ? 'فئات الغرف والأسعار' : 'Room Categories & Rates'} ({activeHotel.roomOptions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('desks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeSubTab === 'desks'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-400" />
          <span>{isRtl ? 'كاونترات الاستقبال بالفندق' : 'Lobby Desks & Staff'} ({activeHotel.desks.length})</span>
        </button>
      </div>

      {/* ======================= TAB 1: VOUCHER & QR CODE VERIFICATION ======================= */}
      {activeSubTab === 'verify' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Input + Simulated QR Scanner (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>QTA Verified Hospitality Gateway</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  {isRtl ? 'التحقق من قسيمة النزيل (QR Code / Voucher Code)' : 'Guest Voucher Verification Engine'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRtl
                    ? 'امسح رمز الاستجابة السريعة (QR) أو أدخل رقم الحجز للتأكد من صحة الدفع والحجز قبل تسليم الغرفة.'
                    : 'Scan customer digital QR voucher or enter confirmation code to verify booking & payment before room check-in.'}
                </p>
              </div>

              {/* Input Form */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'رقم القسيمة أو رمز التأكيد (Confirmation Code / PNR)' : 'Voucher Code / Confirmation Ref'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                      placeholder="e.g. HTL-QA-9042 or guest name"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 pl-9 rtl:pl-3 rtl:pr-9 text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-blue-500 uppercase transition"
                    />
                  </div>

                  <button
                    onClick={() => handleVerifyCode()}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer active:scale-95 shrink-0"
                  >
                    {isRtl ? 'تحقق الآن' : 'Verify Code'}
                  </button>
                </div>
              </div>

              {/* Simulated QR Camera Viewfinder */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center relative overflow-hidden">
                <div className="relative max-w-xs mx-auto aspect-square rounded-2xl border-2 border-dashed border-emerald-500/40 bg-slate-900/60 flex flex-col items-center justify-center p-4">
                  {/* Viewfinder Target Corners */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                  {/* Laser Scan Animation Line */}
                  <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce opacity-80" />

                  {/* Center Icon & Instruction */}
                  <Camera className="w-10 h-10 text-emerald-400/80 mb-2 animate-pulse" />
                  <span className="text-xs font-bold text-white">
                    {isScanning
                      ? isRtl
                        ? 'جارٍ مسح الرمز ضوئياً...'
                        : 'Scanning customer QR code...'
                      : isRtl
                      ? 'كاميرا مسح رمز QR المباشر'
                      : 'Live Camera QR Viewfinder'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">
                    Point guest digital screen to camera
                  </span>

                  <button
                    onClick={handleTriggerSimulatedQRScan}
                    disabled={isScanning}
                    className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{isScanning ? 'Decoding...' : 'Simulate Scan Customer QR'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Sample Test Chips */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
                  {isRtl ? 'نماذج جاهزة للاختبار الفوري:' : 'Click to Test Real Vouchers for this Hotel:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {hotelBookingsList.slice(0, 4).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setVerifyInput(b.confirmationCode);
                        handleVerifyCode(b.confirmationCode);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 text-[11px] font-mono transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="font-bold text-blue-600 dark:text-blue-400">{b.confirmationCode}</span>
                      <span className="text-slate-400">({b.guestName.split(' ')[0]})</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700">
                        {b.bookingStatus}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Verification Result Card (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-4">
            {verificationFeedback && (
              <div
                className={`p-4 rounded-2xl text-xs flex items-center gap-3 animate-in fade-in ${
                  verificationFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : verificationFeedback.type === 'already-checked-in'
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                {verificationFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                ) : verificationFeedback.type === 'already-checked-in' ? (
                  <BadgeCheck className="w-5 h-5 shrink-0 text-blue-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                )}
                <div className="font-medium">{verificationFeedback.message}</div>
              </div>
            )}

            {scannedResult ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 relative overflow-hidden animate-in fade-in zoom-in-95">
                {/* Security Verification Watermark */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                        Official Verified Qatar Voucher
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white font-mono">
                        {scannedResult.confirmationCode}
                      </h4>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      scannedResult.bookingStatus === 'Checked In'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : scannedResult.bookingStatus === 'Confirmed'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {scannedResult.bookingStatus === 'Checked In'
                      ? '✓ Checked-In (In House)'
                      : '✓ Verified & Confirmed'}
                  </span>
                </div>

                {/* Guest Profile Grid */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Primary Guest</span>
                    <span className="font-extrabold text-slate-900 dark:text-white block mt-0.5">
                      {scannedResult.guestName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {scannedResult.guestNationality} · {scannedResult.paxAdults} Adults
                      {scannedResult.paxChildren > 0 ? `, ${scannedResult.paxChildren} Kids` : ''}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Contact Phone</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 block mt-0.5">
                      {scannedResult.guestPhone}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      {scannedResult.guestEmail}
                    </span>
                  </div>
                </div>

                {/* Stay Details */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-start justify-between p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <div>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase font-mono block">
                        Reserved Room Type
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm block mt-0.5">
                        {scannedResult.roomType}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Utensils className="w-3 h-3 text-amber-500" />
                        <span>Meal Plan: {scannedResult.mealPlan}</span>
                      </span>
                    </div>

                    <div className="text-right rtl:text-left">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Nights</span>
                      <span className="font-black text-slate-900 dark:text-white text-base font-mono">
                        {scannedResult.nights} Nights
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block">Check-In</span>
                      <span className="font-bold text-slate-900 dark:text-white">{scannedResult.checkInDate}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block">Check-Out</span>
                      <span className="font-bold text-slate-900 dark:text-white">{scannedResult.checkOutDate}</span>
                    </div>
                  </div>
                </div>

                {/* Payment & Voucher Status Card */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-300 font-bold block">
                      Billing & Settlement
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-base font-mono">
                      {convertAmount(scannedResult.totalQAR).formatted}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      ✓ {scannedResult.paymentStatus} ({scannedResult.paymentMethod})
                    </span>
                  </div>

                  <div className="text-right rtl:text-left">
                    <span className="text-[10px] text-slate-500 block">Booked Via:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      {scannedResult.bookingSource}
                    </span>
                  </div>
                </div>

                {/* Special Requests */}
                {scannedResult.specialRequests && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Guest Notes:</span>
                    <span>{scannedResult.specialRequests}</span>
                  </div>
                )}

                {/* Main Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  {scannedResult.bookingStatus !== 'Checked In' ? (
                    <button
                      onClick={() => handleCheckInGuest(scannedResult.id)}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isRtl ? 'تأكيد وصول النزيل واستلام الغرفة' : 'Check In Guest & Redeem Voucher'}</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-2.5 px-4 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-blue-500" />
                      <span>{isRtl ? 'النزيل مقيم حالياً بالفندق' : 'Guest Currently In-House'}</span>
                    </div>
                  )}

                  <button
                    onClick={() => openModal('qr-voucher', { booking: scannedResult })}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer shrink-0"
                    title="View & Print Full Customer Voucher"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Empty state before scanning */
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-xs text-center flex flex-col items-center justify-center h-full min-h-[360px]">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4 border border-slate-200 dark:border-slate-700">
                  <QrCode className="w-8 h-8 opacity-60" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isRtl ? 'في انتظار مسح أو إدخال القسيمة' : 'Waiting for Voucher QR Scan or Code'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                  {isRtl
                    ? 'وجه كاميرا الماسح نحو رمز الـ QR الخاص بالنزيل، أو اختر أحد الحجوزات النموذجية للتحقق الفوري.'
                    : 'Use the QR scanner on the left or enter a confirmation reference to instantly load verified guest details.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: HOTEL BOOKINGS TABLE ======================= */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4">
          {/* Quick Status Filter Tabs Banner */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{isRtl ? 'جميع الحجوزات' : 'All Reservations'}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${statusFilter === 'ALL' ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {metrics.total}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('Checked In')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                statusFilter === 'Checked In'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{isRtl ? 'النزلاء المقيمون' : 'In-House'}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${statusFilter === 'Checked In' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'}`}>
                {metrics.checkedIn}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('Confirmed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                statusFilter === 'Confirmed'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{isRtl ? 'مؤكد قادم' : 'Confirmed Upcoming'}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${statusFilter === 'Confirmed' ? 'bg-amber-700 text-white' : 'bg-amber-50 dark:bg-amber-950 text-amber-600'}`}>
                {metrics.confirmed}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('Completed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                statusFilter === 'Completed'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{isRtl ? 'مكتمل' : 'Completed'}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${statusFilter === 'Completed' ? 'bg-purple-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {metrics.completed}
              </span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder={isRtl ? 'بحث باسم النزيل، رقم الحجز، فئة الغرفة...' : 'Search guest name, voucher code, room...'}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 pl-9 rtl:pl-3 rtl:pr-9 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {isRtl ? `عرض ${filteredBookings.length} من أصل ${hotelBookingsList.length}` : `Showing ${filteredBookings.length} of ${hotelBookingsList.length} Stays`}
              </span>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">{isRtl ? 'رمز القسيمة' : 'Voucher Code'}</th>
                    <th className="py-3 px-4">{isRtl ? 'اسم النزيل' : 'Guest Details'}</th>
                    <th className="py-3 px-4">{isRtl ? 'قناة الحجز' : 'Channel'}</th>
                    <th className="py-3 px-4">{isRtl ? 'فئة الغرفة والوجبات' : 'Room & Meal Plan'}</th>
                    <th className="py-3 px-4">{isRtl ? 'تواريخ الإقامة' : 'Stay Dates'}</th>
                    <th className="py-3 px-4">{isRtl ? 'المبلغ الإجمالي' : 'Total (QAR)'}</th>
                    <th className="py-3 px-4">{isRtl ? 'حالة الحجز' : 'Status'}</th>
                    <th className="py-3 px-4 text-center">{isRtl ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Building2 className="w-8 h-8 opacity-40 text-slate-400" />
                          <span className="font-bold">
                            {isRtl ? 'لا توجد حجوزات تطابق البحث أو التصفية الحالية' : 'No hotel bookings found matching this filter.'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {isRtl ? `إجمالي حجوزات ${activeHotel.name} هي ${hotelBookingsList.length} حجز` : `Total bookings for ${activeHotel.name}: ${hotelBookingsList.length}`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Confirmation Code */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                              {b.confirmationCode}
                            </span>
                            <button
                              onClick={() => handleCopyCode(b.confirmationCode)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                              title="Copy code"
                            >
                              {copiedCode === b.confirmationCode ? (
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
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {b.guestName}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                            {b.guestNationality} · {b.guestPhone}
                          </span>
                        </td>

                        {/* Channel Source */}
                        <td className="py-3 px-4">
                          {b.bookingSource?.includes('Online') || b.bookingSource?.includes('Web') ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                              <Globe className="w-3 h-3" />
                              <span>Online Web</span>
                            </span>
                          ) : b.bookingSource?.includes('Airport') ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold text-[10px] border border-sky-200 dark:border-sky-800">
                              <Building2 className="w-3 h-3" />
                              <span>Airport POS</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800">
                              <Award className="w-3 h-3" />
                              <span>Concierge</span>
                            </span>
                          )}
                        </td>

                        {/* Room Type */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {b.roomType}
                          </span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                            <Utensils className="w-2.5 h-2.5" />
                            <span>{b.mealPlan} ({b.paxAdults} Adults{b.paxChildren > 0 ? `, ${b.paxChildren} Kids` : ''})</span>
                          </span>
                        </td>

                        {/* Stay Dates */}
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{b.checkInDate}</span>
                            <span className="text-slate-400"> → </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{b.checkOutDate}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                            {b.nights} Nights · {b.roomsCount || 1} Room(s)
                          </span>
                        </td>

                        {/* Total QAR & Payment */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          <div>{convertAmount(b.totalQAR).formatted}</div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium block mt-0.5">
                            ✓ {b.paymentStatus}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              b.bookingStatus === 'Checked In'
                                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : b.bookingStatus === 'Confirmed'
                                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                b.bookingStatus === 'Checked In'
                                  ? 'bg-blue-500'
                                  : b.bookingStatus === 'Confirmed'
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            <span>{b.bookingStatus}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* 1-Click Check-In for Confirmed */}
                            {b.bookingStatus === 'Confirmed' && (
                              <button
                                onClick={() => handleCheckInGuest(b.id)}
                                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow-xs transition cursor-pointer active:scale-95"
                                title="Check In Guest Immediately"
                              >
                                {isRtl ? 'تسجيل دخول' : 'Check In'}
                              </button>
                            )}

                            {/* Verify Button in QR Engine */}
                            <button
                              onClick={() => {
                                setVerifyInput(b.confirmationCode);
                                setActiveSubTab('verify');
                                handleVerifyCode(b.confirmationCode);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                              title="Verify Voucher in QR Engine"
                            >
                              Verify
                            </button>

                            {/* View Voucher Modal */}
                            <button
                              onClick={() => openModal('qr-voucher', { booking: b })}
                              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                              title="Print / View Voucher"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 3: ROOM CATEGORIES ======================= */}
      {activeSubTab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeHotel.roomOptions.map((room, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <BedDouble className="w-4 h-4" />
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                  {convertAmount(room.ratePerNightQAR).formatted} <span className="text-xs text-slate-400 font-normal">/ night</span>
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {room.roomType}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {room.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Capacity: Max {room.maxPax} Guests</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {hotelBookingsList.filter((b) => b.roomType === room.roomType).length} Booked
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================= TAB 4: LOBBY DESKS ======================= */}
      {activeSubTab === 'desks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeHotel.desks.map((desk) => (
            <div
              key={desk.deskCode}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                  {desk.deskCode}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  {desk.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {desk.deskName}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{desk.locationInHotel}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>Staff: {desk.assignedStaff}</span>
                <span className="font-mono">{desk.phone}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
