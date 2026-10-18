import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  Crown,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Plane,
  Car,
  QrCode,
  CreditCard,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Compass,
  LayoutGrid,
  List,
  Percent,
  Settings,
  Tag,
  Trash2,
  Edit2,
  Check,
  Ticket,
  ShieldCheck,
  Award,
  BedDouble,
  Building2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking, Guest, GuestTier } from '../../types';
import { DateFilterBar } from '../common/DateFilterBar';
import { matchesDateFilter } from '../../utils/dateFilter';

export const GuestsView: React.FC = () => {
  const {
    guests,
    addGuest,
    updateGuest,
    deleteGuest,
    guestTiers,
    addGuestTier,
    updateGuestTier,
    deleteGuestTier,
    bookings,
    openModal,
    convertAmount,
    language,
    dateFilter,
    setDateFilter,
    t,
    currentRole,
    setRole,
    setActiveTab,
    currency,
  } = useApp();

  const [activeViewMode, setActiveViewMode] = useState<'crm' | 'customer-portal'>(
    currentRole === 'customer' ? 'customer-portal' : 'crm'
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(guests[0]?.id || '');
  const activeCustomer = guests.find((g) => g.id === selectedCustomerId) || guests[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [nationalityFilter, setNationalityFilter] = useState('ALL');
  const [layoutMode, setLayoutMode] = useState<'card' | 'list'>('card');

  // Modals state
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showTiersModal, setShowTiersModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Tier management form state
  const [newTierName, setNewTierName] = useState('');
  const [newTierDiscount, setNewTierDiscount] = useState<number>(10);
  const [newTierColor, setNewTierColor] = useState('purple');
  const [newTierMinSpend, setNewTierMinSpend] = useState<number>(0);
  const [newTierDesc, setNewTierDesc] = useState('');
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editingTierDiscount, setEditingTierDiscount] = useState<number>(0);

  // Notifications
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // New Guest Form State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestNationality, setNewGuestNationality] = useState('United States');
  const [newGuestPhone, setNewGuestPhone] = useState('+1 ');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestTier, setNewGuestTier] = useState<Guest['vipTier']>('VIP Gold');
  const [newGuestPassport, setNewGuestPassport] = useState('');
  const [newGuestPreferences, setNewGuestPreferences] = useState('');
  const [newGuestAirport, setNewGuestAirport] = useState('Hamad Int’l Airport (DOH)');
  const [newGuestFlight, setNewGuestFlight] = useState('QR 138');

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setFeedbackError(msg);
      setTimeout(() => setFeedbackError(null), 3500);
    } else {
      setFeedbackSuccess(msg);
      setTimeout(() => setFeedbackSuccess(null), 3000);
    }
  };

  // Filter Guests
  const filteredGuests = guests.filter((g) => {
    // Date & Year Filter on lastTripDate
    if (!matchesDateFilter(g.lastTripDate, dateFilter)) return false;

    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.includes(searchQuery) ||
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.passportNo && g.passportNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTier = tierFilter === 'ALL' || g.vipTier === tierFilter;
    const matchesNationality = nationalityFilter === 'ALL' || g.nationality === nationalityFilter;
    return matchesSearch && matchesTier && matchesNationality;
  });

  // Calculate High Level Metrics
  const totalGuests = guests.length;
  const vipCount = guests.filter((g) => g.vipTier.includes('VIP')).length;
  const totalLifetimeRevenueQAR = guests.reduce((acc, g) => acc + g.totalSpentQAR, 0);
  const repeatGuestsCount = guests.filter((g) => g.totalBookings > 1).length;
  const repeatRate = totalGuests > 0 ? Math.round((repeatGuestsCount / totalGuests) * 100) : 0;

  // Handle Add Guest
  const handleCreateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) {
      showNotification('Guest name is required', true);
      return;
    }
    const res = addGuest({
      name: newGuestName.trim(),
      nationality: newGuestNationality.trim(),
      phone: newGuestPhone.trim(),
      email: newGuestEmail.trim() || `${newGuestName.toLowerCase().replace(/\s+/g, '.')}@traveler.com`,
      vipTier: newGuestTier,
      passportNo: newGuestPassport.trim() || undefined,
      totalBookings: 1,
      totalSpentQAR: 1200,
      lastArrivalAirport: newGuestAirport,
      lastFlight: newGuestFlight,
      lastTripDate: 'Today, Just Now',
      specialPreferences: newGuestPreferences.trim() || 'No special requirements specified.',
      bookingIds: [],
      pnrList: [],
    } as any);

    if (res.success) {
      showNotification(`Guest "${newGuestName}" registered successfully!`);
      setShowAddGuestModal(false);
      setNewGuestName('');
      setNewGuestPhone('+1 ');
      setNewGuestEmail('');
      setNewGuestPassport('');
      setNewGuestPreferences('');
    } else {
      showNotification(res.error || 'Failed to add guest', true);
    }
  };

  // Handle Edit Guest
  const handleUpdateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    const res = updateGuest(editingGuest.id, editingGuest);
    if (res.success) {
      showNotification(`Guest "${editingGuest.name}" updated!`);
      if (selectedGuest?.id === editingGuest.id) {
        setSelectedGuest({ ...editingGuest });
      }
      setEditingGuest(null);
    } else {
      showNotification(res.error || 'Failed to update guest', true);
    }
  };

  // Handle Add Tier
  const handleCreateTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTierName.trim()) {
      showNotification('Tier name is required', true);
      return;
    }
    const res = addGuestTier({
      name: newTierName.trim(),
      discountPercentage: Number(newTierDiscount) || 0,
      badgeColor: newTierColor,
      minSpendQAR: Number(newTierMinSpend) || 0,
      description: newTierDesc.trim() || `VIP tier with ${newTierDiscount}% discount on all tours & services.`,
    });
    if (res.success) {
      showNotification(`Tier "${newTierName}" added with ${newTierDiscount}% discount!`);
      setNewTierName('');
      setNewTierDiscount(10);
      setNewTierMinSpend(0);
      setNewTierDesc('');
    } else {
      showNotification(res.error || 'Failed to create tier', true);
    }
  };

  const handleUpdateTierDiscount = (tierId: string, discount: number) => {
    const res = updateGuestTier(tierId, { discountPercentage: discount });
    if (res.success) {
      showNotification(`Tier discount updated to ${discount}%!`);
      setEditingTierId(null);
    } else {
      showNotification(res.error || 'Failed to update discount', true);
    }
  };

  const handleDeleteTier = (tierId: string, tierName: string) => {
    deleteGuestTier(tierId);
    showNotification(`Tier "${tierName}" removed.`);
  };

  // Get Bookings for a Guest
  const getGuestBookings = (guest: Guest): Booking[] => {
    return bookings.filter(
      (b) =>
        b.passengerName.toLowerCase().includes(guest.name.toLowerCase()) ||
        guest.name.toLowerCase().includes(b.passengerName.toLowerCase()) ||
        b.passengerPhone === guest.phone ||
        guest.bookingIds.includes(b.id)
    );
  };

  // Customer Portal computations
  const customerBookings = activeCustomer ? getGuestBookings(activeCustomer) : [];
  const displayBookings = customerBookings.length > 0 ? customerBookings : bookings.slice(0, 3);
  const customerTierObj = guestTiers.find((t) => t.name.toLowerCase() === activeCustomer?.vipTier?.toLowerCase());
  const tierDiscount = customerTierObj ? customerTierObj.discountPercentage : (activeCustomer?.vipTier?.includes('Platinum') ? 15 : activeCustomer?.vipTier?.includes('Gold') ? 10 : 5);
  const uniqueNationalities: string[] = Array.from(new Set(guests.map((g) => g.nationality)));

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Toast Feedback */}
      {feedbackSuccess && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 font-medium text-xs animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}
      {feedbackError && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-rose-600 text-white shadow-xl shadow-rose-600/30 font-medium text-xs animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                {language === 'ar' ? 'لوحة تحكم العملاء والضيوف المسافرين' : 'Customer & Guest Dashboard'}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {totalGuests} TRAVELERS
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  CRM & Portal
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'بوابة المسافر الذاتية وسجل إدارة العملاء مع متابعة التذاكر الرقمية وفئات VIP'
                  : 'Customer self-service portal, passenger dossiers, active digital QR vouchers, and VIP loyalty tiers'}
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Action Buttons */}
        <div className="flex items-center gap-2.5 self-start xl:self-auto flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setActiveViewMode('crm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'crm'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'سجل الضيوف (CRM)' : 'CRM Roster'}</span>
            </button>

            <button
              onClick={() => setActiveViewMode('customer-portal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'customer-portal'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'ar' ? 'بوابة المسافر (Customer)' : 'Customer Portal'}</span>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1 rounded-sm">
                PORTAL
              </span>
            </button>
          </div>

          <button
            onClick={() => openModal('qr-verification')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Scan & verify QR code voucher"
          >
            <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{language === 'ar' ? 'فحص الرمز QR' : 'Verify QR'}</span>
          </button>

          <button
            onClick={() => setShowTiersModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-300 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'ar' ? 'فئات الخصم' : 'VIP Tiers'}</span>
          </button>

          <button
            onClick={() => setShowAddGuestModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm shadow-purple-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? '+ إضافة مسافر' : '+ Add Guest'}</span>
          </button>
        </div>
      </div>

      {/* VIEW CONTENT: CRM ROSTER VS CUSTOMER PORTAL */}
      {activeViewMode === 'crm' ? (
        <>
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Travelers */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Total Registered Guests</span>
            <UserCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{totalGuests}</span>
            <span className="text-[10px] text-purple-600 font-bold">100% Verified</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Across 7 countries</p>
        </div>

        {/* VIP Club Members */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>VIP Status Members</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">{vipCount}</span>
            <span className="text-[10px] text-slate-400 font-bold">Platinum & Gold</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Curbside limousine escorts</p>
        </div>

        {/* Lifetime Revenue */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Lifetime Guest Spend</span>
            <CreditCard className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {totalLifetimeRevenueQAR.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">QAR</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">
            ≈ ${(totalLifetimeRevenueQAR / 3.64).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD equivalent
          </p>
        </div>

        {/* Repeat Guest Rate */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Repeat Traveler Rate</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">{repeatRate}%</span>
            <span className="text-[10px] text-emerald-600 font-bold">{repeatGuestsCount} multi-tour</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">High retention luxury clientele</p>
        </div>
      </div>

      {/* Date & Year Filter Engine */}
      <DateFilterBar
        filter={dateFilter}
        onChange={setDateFilter}
        totalCount={guests.length}
        filteredCount={filteredGuests.length}
        label={language === 'ar' ? 'تصفية سجل الضيوف والمسافرين بالسنة' : 'Guests Date & Year Filter'}
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث باسم الضيف، رقم الجواز، الهاتف...' : 'Search guest name, phone, email, nationality, passport...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All VIP Tiers</option>
            {guestTiers.map((tier) => (
              <option key={tier.id} value={tier.name}>
                {tier.name} ({tier.discountPercentage}% Off)
              </option>
            ))}
          </select>

          <select
            value={nationalityFilter}
            onChange={(e) => setNationalityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Nationalities</option>
            {uniqueNationalities.map((nat) => (
              <option key={nat} value={nat}>
                {nat}
              </option>
            ))}
          </select>

          {/* Card / List Layout Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => setLayoutMode('card')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === 'card'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="List Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guests Grid or List Table */}
      {layoutMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGuests.map((guest) => {
          const guestBookings = getGuestBookings(guest);

          return (
            <div
              key={guest.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-purple-400 dark:hover:border-purple-600 transition flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name, VIP Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-800 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                      {guest.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {guest.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-500 font-medium">{guest.nationality}</span>
                        {guest.passportNo && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-mono text-slate-400">{guest.passportNo}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                      guest.vipTier === 'VIP Platinum'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300/40'
                        : guest.vipTier === 'VIP Gold'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40'
                        : guest.vipTier === 'VIP Silver'
                        ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {guest.vipTier.includes('VIP') && <Crown className="w-3 h-3 text-amber-500" />}
                    {guest.vipTier}
                  </span>
                </div>

                {/* Contact Pill */}
                <div className="mt-3.5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px]">{guest.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] truncate">{guest.email}</span>
                  </div>
                </div>

                {/* Lifetime Stats Box */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Completed Tours</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm tabular-nums">
                      {guest.totalBookings} Bookings
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono uppercase">Total Spend</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm tabular-nums font-mono">
                      {guest.totalSpentQAR.toLocaleString()} QAR
                    </span>
                  </div>
                </div>

                {/* Last Flight / Arrival */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5 truncate">
                    <Plane className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{guest.lastFlight}</span>
                    <span className="truncate">({guest.lastArrivalAirport.split('(')[0].trim()})</span>
                  </span>
                  <span className="text-[10px] font-mono shrink-0">{guest.lastTripDate}</span>
                </div>

                {/* Special Preferences snippet */}
                {guest.specialPreferences && (
                  <div className="mt-2.5 p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-900 dark:text-purple-300 line-clamp-2">
                    <span className="font-bold">Preferences: </span>
                    {guest.specialPreferences}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setSelectedGuest(guest)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
                >
                  <span>View Guest Dossier</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setEditingGuest({ ...guest })}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition"
                  title="Edit Guest"
                >
                  <FileText className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Remove guest profile for ${guest.name}?`)) {
                      deleteGuest(guest.id);
                      showNotification(`Guest ${guest.name} removed`);
                    }
                  }}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 transition"
                  title="Delete Guest"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        /* Guests List / Table View ("list view te dekha jay ei option ta add koro") */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-4">Guest & Nationality</th>
                  <th className="py-3.5 px-4">VIP Tier</th>
                  <th className="py-3.5 px-4">Contact Phone & Email</th>
                  <th className="py-3.5 px-4 text-center">Total Trips</th>
                  <th className="py-3.5 px-4 text-right">Lifetime Spent</th>
                  <th className="py-3.5 px-4">Last Flight & Arrival</th>
                  <th className="py-3.5 px-4">Special Preferences</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredGuests.map((guest) => {
                  return (
                    <tr
                      key={guest.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {guest.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {guest.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {guest.nationality} {guest.passportNo ? `• ${guest.passportNo}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                            guest.vipTier === 'VIP Platinum'
                              ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : guest.vipTier === 'VIP Gold'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : guest.vipTier === 'VIP Silver'
                              ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {guest.vipTier.includes('VIP') && <Crown className="w-3 h-3 text-amber-500" />}
                          {guest.vipTier}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        <div>{guest.phone}</div>
                        <div className="text-[10px] text-slate-400">{guest.email}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {guest.totalBookings}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {guest.totalSpentQAR.toLocaleString()} QAR
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        <div>{guest.lastFlight} • {guest.lastArrivalAirport}</div>
                        <div className="text-[10px] text-slate-400">{guest.lastTripDate}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {guest.specialPreferences || 'Standard concierge service'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedGuest(guest)}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1 transition"
                            title="View Dossier"
                          >
                            <span>Dossier</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => setEditingGuest({ ...guest })}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            title="Edit Guest"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remove guest profile for ${guest.name}?`)) {
                                deleteGuest(guest.id);
                                showNotification(`Guest ${guest.name} removed`);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition"
                            title="Delete Guest"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  ) : (
        /* CUSTOMER SELF-SERVICE DASHBOARD PORTAL */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Customer Profile & Concierge Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-8 text-white border border-indigo-900/50 shadow-xl">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Profile Info */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shadow-amber-500/30 border-2 border-amber-300">
                  {activeCustomer?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'VIP'}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      {activeCustomer?.name || 'VIP Traveler'}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 flex items-center gap-1 shadow-xs">
                      <Crown className="w-3.5 h-3.5" />
                      <span>{activeCustomer?.vipTier || 'VIP Platinum'}</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-purple-200 border border-white/10">
                      {tierDiscount}% Tier Discount
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-3 flex-wrap">
                    <span>Nationality: <strong className="text-white">{activeCustomer?.nationality || 'Qatar'}</strong></span>
                    <span>•</span>
                    <span>Passport: <strong className="font-mono text-amber-300">{activeCustomer?.passportNo || 'QAT-998231'}</strong></span>
                    <span>•</span>
                    <span>Phone: <strong className="font-mono text-slate-200">{activeCustomer?.phone || '+974 5512 8899'}</strong></span>
                  </p>

                  <div className="flex items-center gap-2 mt-3 text-[11px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Verified Qatar Tourism Traveler • License #QTA-QA-8819 • 24/7 VIP Concierge Escort Active</span>
                  </div>
                </div>
              </div>

              {/* Right Controls: Customer Switcher & Quick Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
                {/* Customer Selector Dropdown */}
                <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/15 flex items-center gap-2 text-xs">
                  <span className="text-[11px] text-purple-200 font-bold whitespace-nowrap">Simulate Traveler:</span>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="bg-transparent text-white font-bold text-xs focus:outline-hidden cursor-pointer"
                  >
                    {guests.map((g) => (
                      <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                        {g.name} ({g.vipTier})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal('qr-verification')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-bold transition shadow-md shadow-blue-500/25 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Verify QR Voucher</span>
                  </button>

                  <button
                    onClick={() => openModal('new-booking')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/25 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Book VIP Tour</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Key Customer Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Active Bookings & Passes</span>
                <Ticket className="w-4 h-4 text-purple-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {displayBookings.length}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">100% Confirmed</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Ready for Hamad Airport & Hotel desks</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>VIP Tier Discount</span>
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                  {tierDiscount}% OFF
                </span>
                <span className="text-[10px] text-purple-600 font-bold">{activeCustomer?.vipTier}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Applies automatically to all reservations</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Lifetime Travel Spend</span>
                <CreditCard className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                  {(activeCustomer?.totalSpentQAR || 4800).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">QAR</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">VIP Priority Concierge Status</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
                <span>Airport Fast-Track</span>
                <Plane className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-base font-black text-blue-600 dark:text-blue-400">Hamad Int’l DOH</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">VIP Curbside Chauffeur & Al Maha Meet</p>
            </div>
          </div>

          {/* Active Bookings & Digital QR Boarding Passes */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>My Active Reservations & Digital Boarding Passes</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Present these passes at Hamad Airport Terminal pickup bays, hotel check-ins, or to your designated chauffeur.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal('qr-verification')}
                  className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scanner Tool</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-5 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800/80 transition shadow-xs group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        PNR: {b.pnr}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmed</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {b.packageName || 'VIP Airport Limousine Transfer'}
                    </h4>

                    <div className="space-y-1.5 mt-3 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{b.bookingDate || 'Scheduled Today'} • {b.arrivalTime || '14:30 AST'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{b.arrivalAirport} ({b.terminalGate || 'Gate A2'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{b.driverVehicle || 'Audi A8 L / Mercedes S-Class'} • {b.driverName || 'VIP Chauffeur'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => openModal('qr-voucher', b)}
                      className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-purple-600/20 cursor-pointer"
                      title="Show Digital QR Boarding Pass"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR Pass</span>
                    </button>

                    <button
                      onClick={() => openModal('qr-verification', { code: b.pnr })}
                      className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Verify this voucher"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verify</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Digital QR Hospitality Vouchers Wallet */}
          <div className="bg-gradient-to-r from-purple-900/90 to-indigo-950 p-6 rounded-3xl border border-purple-800/60 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <span>VIP Hospitality & Partner Hotel Vouchers</span>
                    <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                      #QTA-QA-8819
                    </span>
                  </h4>
                  <p className="text-xs text-purple-200 mt-0.5">
                    Authorized vouchers usable directly at partner hotel receptions and desert excursion camps.
                  </p>
                </div>
              </div>

              <button
                onClick={() => openModal('qr-verification')}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-400/20 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Open QR Scanner</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-amber-300 font-bold">VOUCHER: HTL-QA-8819</div>
                  <div className="text-xs font-extrabold text-white mt-1">The Ritz-Carlton Executive Lounge</div>
                  <div className="text-[11px] text-purple-200">Complimentary High Tea & Fast Check-In</div>
                </div>
                <button
                  onClick={() => openModal('qr-verification', { code: 'HTL-QA-8819' })}
                  className="px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition cursor-pointer"
                >
                  Verify
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-amber-300 font-bold">VOUCHER: QA-29311</div>
                  <div className="text-xs font-extrabold text-white mt-1">Hamad VIP Chauffeur Transfer</div>
                  <div className="text-[11px] text-purple-200">Audi A8 L Limousine Escort (Terminal Bay 4)</div>
                </div>
                <button
                  onClick={() => openModal('qr-verification', { code: 'QA-29311' })}
                  className="px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition cursor-pointer"
                >
                  Verify
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-amber-300 font-bold">VOUCHER: SAF-QA-1044</div>
                  <div className="text-xs font-extrabold text-white mt-1">Khor Al Adaid Luxury Safari</div>
                  <div className="text-[11px] text-purple-200">Private Dune Camp Dinner & Sunset Tour</div>
                </div>
                <button
                  onClick={() => openModal('qr-verification', { code: 'SAF-QA-1044' })}
                  className="px-2.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>

          {/* Curated Qatar VIP Experiences */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Curated Doha Experiences For You</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Exclusive member rates with your {tierDiscount}% VIP discount included.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('tours-inventory')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All 8 Packages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-amber-600 dark:text-amber-400">{tierDiscount}% VIP Saving</span>
                    <span className="font-mono text-[11px] text-slate-400">4 Hours</span>
                  </div>
                  <h5 className="font-black text-sm text-slate-900 dark:text-white">Doha Modern Pearl & Katara Excursion</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Private limousine tour through Pearl Island, Katara Cultural Village, and Lusail Marina.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">650 QAR</span>
                  <button
                    onClick={() => openModal('new-booking')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-amber-600 dark:text-amber-400">{tierDiscount}% VIP Saving</span>
                    <span className="font-mono text-[11px] text-slate-400">6 Hours</span>
                  </div>
                  <h5 className="font-black text-sm text-slate-900 dark:text-white">Inland Sea Desert Sunset Safari</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    4x4 dune bashing, camel riding, and private Bedouin camp dinner at UNESCO Khor Al Adaid.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">850 QAR</span>
                  <button
                    onClick={() => openModal('new-booking')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-amber-600 dark:text-amber-400">{tierDiscount}% VIP Saving</span>
                    <span className="font-mono text-[11px] text-slate-400">3 Hours</span>
                  </div>
                  <h5 className="font-black text-sm text-slate-900 dark:text-white">Private Arabian Dhow Dinner Cruise</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Panoramic Doha Corniche skyline views aboard a traditional illuminated wooden yacht.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">750 QAR</span>
                  <button
                    onClick={() => openModal('new-booking')}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODALS SECTION ================= */}

      {/* 1. GUEST DOSSIER MODAL */}
      {selectedGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-800 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  {selectedGuest.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedGuest.name}
                    </h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {selectedGuest.vipTier}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedGuest.nationality}</span>
                    <span>•</span>
                    <span className="font-mono">{selectedGuest.passportNo || 'No Passport On File'}</span>
                    <span>•</span>
                    <span className="font-mono">{selectedGuest.phone}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedGuest(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Financial & Travel Overview Card */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Lifetime Spend</span>
                  <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {selectedGuest.totalSpentQAR.toLocaleString()} QAR
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    ≈ ${(selectedGuest.totalSpentQAR / 3.64).toFixed(0)} USD
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Completed Tours</span>
                  <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                    {selectedGuest.totalBookings}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    DMC Excursions
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Last Arrival Flight</span>
                  <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                    {selectedGuest.lastFlight}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                    {selectedGuest.lastArrivalAirport}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">VIP Loyalty Tier</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {selectedGuest.vipTier}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Fast-Track & Chauffeur
                  </span>
                </div>
              </div>

              {/* Special Concierge Preferences Box */}
              <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                <h4 className="text-xs font-extrabold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Special Guest Instructions & Concierge Notes
                </h4>
                <p className="mt-1.5 text-xs text-purple-950 dark:text-purple-200 leading-relaxed">
                  {selectedGuest.specialPreferences || 'No specific preferences recorded.'}
                </p>
              </div>

              {/* Passenger Booking History */}
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Past & Scheduled Excursions for {selectedGuest.name}
                </h4>

                <div className="space-y-3">
                  {getGuestBookings(selectedGuest).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      No matching historical bookings found in current system cache.
                    </div>
                  ) : (
                    getGuestBookings(selectedGuest).map((bkg) => (
                      <div
                        key={bkg.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{bkg.pnr}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-extrabold text-slate-900 dark:text-white">{bkg.packageName}</span>
                          </div>

                          <div className="mt-1 text-slate-500 flex flex-wrap items-center gap-2 text-[11px]">
                            <span>Flight: <strong className="font-mono text-slate-700 dark:text-slate-300">{bkg.flightNumber}</strong></span>
                            <span>•</span>
                            <span>Pickup: {bkg.pickupBay}</span>
                            <span>•</span>
                            <span>Chauffeur: {bkg.driverName}</span>
                            <span>•</span>
                            <span>Date: {bkg.createdAt}</span>
                          </div>
                        </div>

                        <div className="text-right sm:shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1">
                          <span className="font-extrabold font-mono text-sm text-slate-900 dark:text-white">
                            {bkg.totalQAR.toLocaleString()} QAR
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {bkg.qrStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                AR Trust Travel DMC • VIP Concierge Guest Record
              </span>
              <button
                onClick={() => setSelectedGuest(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REGISTER NEW GUEST MODAL */}
      {showAddGuestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Register New Guest / Passenger
                </h3>
              </div>
              <button onClick={() => setShowAddGuestModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Miller"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nationality *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United Kingdom"
                    value={newGuestNationality}
                    onChange={(e) => setNewGuestNationality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 212 555 8920"
                    value={newGuestPhone}
                    onChange={(e) => setNewGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="passenger@traveler.com"
                    value={newGuestEmail}
                    onChange={(e) => setNewGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">VIP Tier & Discount</label>
                  <select
                    value={newGuestTier}
                    onChange={(e) => setNewGuestTier(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    {guestTiers.map((tier) => (
                      <option key={tier.id} value={tier.name}>
                        {tier.name} ({tier.discountPercentage}% Discount)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Passport / National ID</label>
                  <input
                    type="text"
                    placeholder="e.g. USA-7782910"
                    value={newGuestPassport}
                    onChange={(e) => setNewGuestPassport(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Special Preferences / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Needs child booster seat, vegetarian snacks, airport meet & assist"
                  value={newGuestPreferences}
                  onChange={(e) => setNewGuestPreferences(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGuestModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm"
                >
                  Save Guest Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT GUEST MODAL */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Edit Guest Dossier: {editingGuest.name}
              </h3>
              <button onClick={() => setEditingGuest(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateGuest} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editingGuest.name}
                    onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Nationality</label>
                  <input
                    type="text"
                    required
                    value={editingGuest.nationality}
                    onChange={(e) => setEditingGuest({ ...editingGuest, nationality: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">VIP Tier & Discount</label>
                  <select
                    value={editingGuest.vipTier}
                    onChange={(e) => setEditingGuest({ ...editingGuest, vipTier: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    {guestTiers.map((tier) => (
                      <option key={tier.id} value={tier.name}>
                        {tier.name} ({tier.discountPercentage}% Discount)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Passport No</label>
                  <input
                    type="text"
                    value={editingGuest.passportNo || ''}
                    onChange={(e) => setEditingGuest({ ...editingGuest, passportNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Special Preferences</label>
                <textarea
                  rows={2}
                  value={editingGuest.specialPreferences}
                  onChange={(e) => setEditingGuest({ ...editingGuest, specialPreferences: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. GUEST TIERS & DISCOUNTS MANAGEMENT MODAL */}
      {showTiersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Guest Membership Tiers & Discounts</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      ADMIN CONFIG
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add VIP membership tiers and configure tier-wise discount percentages applied during bookings.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTiersModal(false);
                  setEditingTierId(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* 1. Add New Tier Form */}
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-3">
                  <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Create New Guest Tier</span>
                </h4>

                <form onSubmit={handleCreateTier} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tier Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Royal VIP or Corporate Club"
                        value={newTierName}
                        onChange={(e) => setNewTierName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Discount Rate (%) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          required
                          value={newTierDiscount}
                          onChange={(e) => setNewTierDiscount(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Badge Accent Color
                      </label>
                      <select
                        value={newTierColor}
                        onChange={(e) => setNewTierColor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      >
                        <option value="purple">Purple (Royal)</option>
                        <option value="amber">Amber (Gold)</option>
                        <option value="blue">Blue (Executive)</option>
                        <option value="emerald">Emerald (Platinum)</option>
                        <option value="rose">Rose (Celebrity)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Min Spend Required (QAR)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={newTierMinSpend}
                        onChange={(e) => setNewTierMinSpend(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tier Perks & Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Complimentary airport chauffeur & 15% tour discount"
                        value={newTierDesc}
                        onChange={(e) => setNewTierDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Tier to Registry</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. Active Guest Tiers List with Inline Discount Editing */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>Configured Tiers & Tier-Wise Discount Matrix ({guestTiers.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Live rates synced with POS & Booking Engine
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  {guestTiers.map((tier) => {
                    const isEditing = editingTierId === tier.id;

                    return (
                      <div
                        key={tier.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                            tier.badgeColor === 'purple'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : tier.badgeColor === 'amber'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : tier.badgeColor === 'emerald'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            <Crown className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                {tier.name}
                              </span>
                              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {tier.discountPercentage}% OFF
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm">
                              {tier.description || 'Standard loyalty perks'}
                            </p>
                            {tier.minSpendQAR !== undefined && tier.minSpendQAR > 0 && (
                              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 block mt-0.5">
                                Min Spend: {tier.minSpendQAR.toLocaleString()} QAR
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Discount Adjustment Controls */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <div className="relative w-20">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={editingTierDiscount}
                                  onChange={(e) => setEditingTierDiscount(Number(e.target.value))}
                                  className="w-full px-2 py-1 rounded-lg border border-purple-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs"
                                  autoFocus
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                  %
                                </span>
                              </div>
                              <button
                                onClick={() => handleUpdateTierDiscount(tier.id, editingTierDiscount)}
                                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                                title="Save Discount"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingTierId(null)}
                                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingTierId(tier.id);
                                setEditingTierDiscount(tier.discountPercentage);
                              }}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                              <span>Set Discount</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteTier(tier.id, tier.name)}
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-400 transition cursor-pointer"
                            title="Delete Tier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/50">
              <button
                onClick={() => {
                  setShowTiersModal(false);
                  setEditingTierId(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
              >
                Close & Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
