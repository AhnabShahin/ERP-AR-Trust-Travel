import React, { useState, useMemo } from 'react';
import {
  Compass,
  Calendar,
  Building2,
  QrCode,
  Sparkles,
  Award,
  Clock,
  MapPin,
  Users,
  Printer,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Car,
  Utensils,
  Search,
  Check,
  Copy,
  User,
  ArrowRight,
  Ticket,
  Mail,
  Phone,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { imgSrc } from '../../../lib/uploads';
import { Booking, HotelBooking } from '../../types';

export const CustomerDashboardView: React.FC = () => {
  const {
    bookings,
    hotelBookings,
    currentUser,
    convertAmount,
    language,
    openModal,
    setActiveTab,
  } = useApp();

  const isRtl = language === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<'tours' | 'hotels' | 'explore'>('tours');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter tour bookings for current customer (or matching email/name, or fallback to customer-relevant sample bookings)
  const myTourBookings = useMemo(() => {
    if (!currentUser) return bookings.slice(0, 4);
    const emailLower = (currentUser.email || '').toLowerCase().trim();
    const nameLower = (currentUser.name || '').toLowerCase().trim();

    const matches = bookings.filter((b) => {
      const bEmail = (b.passengerEmail || '').toLowerCase();
      const bName = (b.passengerName || '').toLowerCase();
      return (
        (emailLower && bEmail.includes(emailLower)) ||
        (nameLower && bName.includes(nameLower.split(' ')[0])) ||
        b.passengerName.toLowerCase().includes('alexander') ||
        b.passengerName.toLowerCase().includes('wright')
      );
    });

    return matches.length > 0 ? matches : bookings.slice(0, 4);
  }, [bookings, currentUser]);

  // Filter hotel bookings for current customer
  const myHotelBookings = useMemo(() => {
    if (!currentUser) return hotelBookings.slice(0, 3);
    const emailLower = (currentUser.email || '').toLowerCase().trim();
    const nameLower = (currentUser.name || '').toLowerCase().trim();

    const matches = hotelBookings.filter((b) => {
      const bEmail = (b.guestEmail || '').toLowerCase();
      const bName = (b.guestName || '').toLowerCase();
      return (
        (emailLower && bEmail.includes(emailLower)) ||
        (nameLower && bName.includes(nameLower.split(' ')[0])) ||
        b.guestName.toLowerCase().includes('alexander') ||
        b.guestName.toLowerCase().includes('wright') ||
        b.guestName.toLowerCase().includes('sterling')
      );
    });

    return matches.length > 0 ? matches : hotelBookings.slice(0, 3);
  }, [hotelBookings, currentUser]);

  // Overall Customer Stats
  const totalTourSpend = useMemo(() => {
    return myTourBookings.reduce((sum, b) => sum + (b.totalQAR || 0), 0);
  }, [myTourBookings]);

  const totalHotelSpend = useMemo(() => {
    return myHotelBookings.reduce((sum, b) => sum + (b.totalQAR || 0), 0);
  }, [myHotelBookings]);

  const totalSpendQAR = totalTourSpend + totalHotelSpend;

  // Filtered lists by search
  const filteredTours = useMemo(() => {
    if (!searchQuery.trim()) return myTourBookings;
    const q = searchQuery.toLowerCase();
    return myTourBookings.filter(
      (b) =>
        b.passengerName.toLowerCase().includes(q) ||
        b.pnr.toLowerCase().includes(q) ||
        b.packageName.toLowerCase().includes(q)
    );
  }, [myTourBookings, searchQuery]);

  const filteredHotels = useMemo(() => {
    if (!searchQuery.trim()) return myHotelBookings;
    const q = searchQuery.toLowerCase();
    return myHotelBookings.filter(
      (b) =>
        b.guestName.toLowerCase().includes(q) ||
        b.confirmationCode.toLowerCase().includes(q) ||
        b.hotelName.toLowerCase().includes(q) ||
        b.roomType.toLowerCase().includes(q)
    );
  }, [myHotelBookings, searchQuery]);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. Hero Welcome Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#05161D] via-[#092834] to-[#0A3D4D] text-white p-6 sm:p-8 border border-[#C0AB6F]/30 shadow-xl">
        {/* Background decorative watermark */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#C0AB6F]/5 pointer-events-none blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-[#D4AF37]/5 pointer-events-none blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] p-0.5 shadow-lg shadow-[#D4AF37]/20 shrink-0">
              <img
                src={imgSrc(currentUser?.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'Customer'}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E7CF8A] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#D4AF37]" />
                  <span>VIP Leisure Traveler</span>
                </span>
                {currentUser?.isEmailVerified ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Verified Account</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                    Email Pending Verification
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
                {isRtl ? `مرحباً بك مجدداً، ${currentUser?.name || 'العميل العزيز'}` : `Welcome back, ${currentUser?.name || 'Valued Traveler'}!`}
              </h1>

              <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                {isRtl
                  ? 'لوحة تحكم المسافر الخاصة بك: استعرض قسائم رحلاتك الصحراوية، حجوزات الفنادق الفاخرة، ومواعيد الاستقبال بمطار حمد الدولي.'
                  : 'Your personal traveler hub. Review your upcoming desert safaris, 5-star hotel stays, QR vouchers, and VIP airport driver schedules.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('my-account')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isRtl ? 'إدارة حسابي' : 'Edit My Profile'}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('explore')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs shadow-lg shadow-[#D4AF37]/30 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRtl ? 'استكشف جولات قطر' : 'Book New Adventure'}</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#C0AB6F]/20 text-xs">
          {/* Card 1: Tour Bookings */}
          <div
            onClick={() => setActiveSubTab('tours')}
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[#E7CF8A] text-[10px] uppercase font-mono font-bold">
              <span>{isRtl ? 'رحلاتي وباقاتي' : 'My Tour Bookings'}</span>
              <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black font-mono text-white group-hover:scale-105 transition-transform">
                {myTourBookings.length}
              </span>
              <span className="text-[11px] text-slate-400">Adventures</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Active Safari & Transit Tours
            </span>
          </div>

          {/* Card 2: Hotel Stays */}
          <div
            onClick={() => setActiveSubTab('hotels')}
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[#E7CF8A] text-[10px] uppercase font-mono font-bold">
              <span>{isRtl ? 'حجوزات فنادقي' : 'My Hotel Stays'}</span>
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black font-mono text-white group-hover:scale-105 transition-transform">
                {myHotelBookings.length}
              </span>
              <span className="text-[11px] text-slate-400">Reservations</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              5★ Qatar Partner Resorts
            </span>
          </div>

          {/* Card 3: Ready QR Vouchers */}
          <div
            onClick={() => setActiveSubTab('tours')}
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/40 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between text-emerald-400 text-[10px] uppercase font-mono font-bold">
              <span>{isRtl ? 'القسائم المعتمدة' : 'Verified QR Vouchers'}</span>
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black font-mono text-white group-hover:scale-105 transition-transform">
                {myTourBookings.length + myHotelBookings.length}
              </span>
              <span className="text-[11px] text-emerald-400/80">Active</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Instant scan & redeem ready
            </span>
          </div>

          {/* Card 4: Total Travel Spend */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-[#E7CF8A] text-[10px] uppercase font-mono font-bold">
              <span>{isRtl ? 'إجمالي قيمة الرحلات' : 'Total Travel Value'}</span>
              <Ticket className="w-3.5 h-3.5 text-[#D4AF37]" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-black font-mono text-[#E7CF8A]">
                {convertAmount(totalSpendQAR).formatted}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">
              Tour: {convertAmount(totalTourSpend).formatted} | Hotel: {convertAmount(totalHotelSpend).formatted}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit shadow-2xs text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('tours')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeSubTab === 'tours'
              ? 'bg-[#092834] dark:bg-[#D4AF37] text-white dark:text-[#05161D] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4 text-[#D4AF37]" />
          <span>{isRtl ? 'رحلاتي وجولاتي' : 'My Tours & Safaris'} ({myTourBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hotels')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeSubTab === 'hotels'
              ? 'bg-[#092834] dark:bg-[#D4AF37] text-white dark:text-[#05161D] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-purple-400" />
          <span>{isRtl ? 'حجوزات الفنادق' : 'My Hotel Bookings'} ({myHotelBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('explore')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            activeSubTab === 'explore'
              ? 'bg-[#092834] dark:bg-[#D4AF37] text-white dark:text-[#05161D] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isRtl ? 'استكشاف وتجارب قطر' : 'Explore Qatar Experiences'}</span>
        </button>
      </div>

      {/* 3. Sub-Tab Content: Tours */}
      {activeSubTab === 'tours' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث في رحلاتي بالاسم أو رقم الحجز...' : 'Search my tours by name, reference code...'}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pl-9 rtl:pl-3 rtl:pr-9 text-slate-900 dark:text-white text-xs outline-none focus:border-[#D4AF37] transition"
              />
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {filteredTours.length} {isRtl ? 'رحلة مسجلة' : 'Bookings Listed'}
            </span>
          </div>

          {/* Tours Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTours.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#0D3A48] dark:text-[#E7CF8A] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                          {b.pnr}
                        </span>
                        <button
                          onClick={() => handleCopyCode(b.pnr)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                          title="Copy voucher code"
                        >
                          {copiedCode === b.pnr ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                        {b.packageName}
                      </h3>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        b.qrStatus === 'completed' || b.qrStatus === 'scheduled'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : b.qrStatus === 'in-transit'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      ✓ {b.qrStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold">{b.bookingDate || b.arrivalTime || '2026-10-15'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{b.bookingTime || b.arrivalTime || '14:00'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{b.paxCount} Guests</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{b.driverVehicle || '4x4 Driver'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Amount Paid</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                      {convertAmount(b.totalQAR).formatted}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal('qr-voucher', { booking: b })}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0D3A48] to-[#124E60] hover:brightness-110 text-[#E7CF8A] font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer active:scale-95"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'عرض القسيمة' : 'View QR Voucher'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Sub-Tab Content: Hotels */}
      {activeSubTab === 'hotels' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHotels.map((h) => (
              <div
                key={h.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                        {h.confirmationCode}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5">
                        {h.hotelName}
                      </h4>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                      {h.bookingStatus}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 font-medium">
                      <span className="font-bold text-slate-900 dark:text-white block">{h.roomType}</span>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                        <Utensils className="w-3 h-3" />
                        <span>{h.mealPlan} · {h.nights} Nights</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono p-1">
                      <span>In: {h.checkInDate}</span>
                      <span>Out: {h.checkOutDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Total Rate</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white">
                      {convertAmount(h.totalQAR).formatted}
                    </span>
                  </div>

                  <button
                    onClick={() => openModal('qr-voucher', { booking: h })}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Voucher</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Sub-Tab Content: Explore Qatar Experiences */}
      {activeSubTab === 'explore' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {isRtl
                ? 'جميع الباقات تشمل سيارات لاند كروزر خاصة، مرشدين سياحيين قطريين مرخصين، وتأمين سياحي شامل معتمد من قطر للسياحة.'
                : 'All Qatar adventures feature private Land Cruiser transfers, licensed QTA guides, and Qatar Tourism insured standards.'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition">
              <img
                src="https://images.unsplash.com/photo-1547234935-80c7145ec969?w=600&auto=format&fit=crop&q=80"
                alt="Desert Safari"
                className="w-full h-44 object-cover"
              />
              <div className="p-5 space-y-3">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                  Bestseller Safari
                </span>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Khor Al Udaid Inland Sea Desert Safari
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Dune bashing, camel riding, Arabian coastal sunset tea, and Inland Sea panoramic border view.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                    {convertAmount(450).formatted} <span className="text-xs text-slate-400 font-normal">/ person</span>
                  </span>
                  <button
                    onClick={() => {
                      if (window.location.pathname !== '/tours') {
                        window.history.pushState(null, '', '/tours');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#092834] dark:bg-[#D4AF37] text-white dark:text-[#05161D] font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition">
              <img
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80"
                alt="Doha City Tour"
                className="w-full h-44 object-cover"
              />
              <div className="p-5 space-y-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  Cultural Heritage
                </span>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Souq Waqif & National Museum Transit Tour
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Falcon Souq, spice alleys, Jean Nouvel Desert Rose National Museum, and Katara Cultural Village.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                    {convertAmount(280).formatted} <span className="text-xs text-slate-400 font-normal">/ person</span>
                  </span>
                  <button
                    onClick={() => {
                      if (window.location.pathname !== '/tours') {
                        window.history.pushState(null, '', '/tours');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#092834] dark:bg-[#D4AF37] text-white dark:text-[#05161D] font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition">
              <img
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80"
                alt="VIP Fleet"
                className="w-full h-44 object-cover"
              />
              <div className="p-5 space-y-3">
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                  VIP Fleet
                </span>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Hamad Airport (HIA) VIP Mercedes Driver
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  Airside/arrival terminal personal greeting, luggage assistance, and luxury Mercedes V-Class transfer.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                    {convertAmount(350).formatted} <span className="text-xs text-slate-400 font-normal">/ transfer</span>
                  </span>
                  <button
                    onClick={() => {
                      if (window.location.pathname !== '/fleet') {
                        window.history.pushState(null, '', '/fleet');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#092834] dark:bg-[#D4AF37] text-white dark:text-[#05161D] font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Fleet</span>
                    <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
