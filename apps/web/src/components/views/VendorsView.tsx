import React, { useState, useMemo } from 'react';
import {
  Building2,
  Star,
  MapPin,
  Phone,
  Mail,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Coins,
  Store,
  Layers,
  BedDouble,
  ExternalLink,
  Edit3,
  Trash2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  X,
  FileText,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Award,
  Globe,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HotelVendor, HotelRoomOption, HotelVendorDesk } from '../../types';
import { MoneyInput } from '../common/MoneyInput';

export const VendorsView: React.FC = () => {
  const {
    hotelVendors,
    addHotelVendor,
    updateHotelVendor,
    deleteHotelVendor,
    addRoomOptionToVendor,
    addDeskToVendor,
    hotelBookings,
    setActiveTab,
    openModal,
    language,
    currency,
    convertAmount,
  } = useApp();

  const isRtl = language === 'ar';

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectingVendor, setInspectingVendor] = useState<HotelVendor | null>(null);
  const [editingVendor, setEditingVendor] = useState<HotelVendor | null>(null);
  const [showAddRoomModal, setShowAddRoomModal] = useState<string | null>(null);
  const [showAddDeskModal, setShowAddDeskModal] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Vendor Form State
  const [formName, setFormName] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formZone, setFormZone] = useState('West Bay Lagoon, Doha');
  const [formStarRating, setFormStarRating] = useState<4 | 5>(5);
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('+974 ');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCommissionRate, setFormCommissionRate] = useState<number>(15);
  const [formContractStatus, setFormContractStatus] = useState<'Active Partner' | 'Exclusive Partner' | 'Pending Renewal'>('Active Partner');
  const [formNotes, setFormNotes] = useState('');
  const [formAmenities, setFormAmenities] = useState<string[]>(['Private Sea View', 'Luxury Concierge', 'Valet Limousine']);

  // Room Option Form State
  const [roomTypeInput, setRoomTypeInput] = useState('');
  const [roomRateInput, setRoomRateInput] = useState<number>(1500);
  const [roomPaxInput, setRoomPaxInput] = useState<number>(2);
  const [roomDescInput, setRoomDescInput] = useState('');

  // Desk Form State
  const [deskCodeInput, setDeskCodeInput] = useState('');
  const [deskNameInput, setDeskNameInput] = useState('');
  const [deskLocInput, setDeskLocInput] = useState('Main Hotel Lobby');
  const [deskStaffInput, setDeskStaffInput] = useState('');
  const [deskPhoneInput, setDeskPhoneInput] = useState('+974 ');

  // Filter Zones available
  const availableZones = useMemo(() => {
    const set = new Set<string>();
    hotelVendors.forEach((v) => {
      if (v.locationZone) set.add(v.locationZone);
    });
    return Array.from(set);
  }, [hotelVendors]);

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return hotelVendors.filter((vendor) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        vendor.name.toLowerCase().includes(q) ||
        (vendor.nameAr && vendor.nameAr.toLowerCase().includes(q)) ||
        vendor.locationZone.toLowerCase().includes(q) ||
        vendor.contactPerson.toLowerCase().includes(q) ||
        vendor.contactEmail.toLowerCase().includes(q);

      const matchesZone = selectedZone === 'ALL' || vendor.locationZone === selectedZone;
      const matchesStatus = selectedStatus === 'ALL' || vendor.contractStatus === selectedStatus;

      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [hotelVendors, searchQuery, selectedZone, selectedStatus]);

  // Summary KPIs
  const totalVendorsCount = hotelVendors.length;
  const totalStationedDesks = hotelVendors.reduce((acc, v) => acc + (v.desks?.length || 0), 0);
  const totalHotelBookingsCount = hotelBookings.length;
  const totalHotelRevenueQAR = hotelBookings.reduce((acc, b) => acc + (b.totalQAR || 0), 0);
  const avgCommissionRate =
    hotelVendors.length > 0
      ? (hotelVendors.reduce((acc, v) => acc + v.commissionRate, 0) / hotelVendors.length).toFixed(1)
      : '0.0';

  const triggerFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Submit New Vendor
  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      triggerFeedback('Please enter the hotel vendor name.', 'error');
      return;
    }

    const defaultDeskCode = `${formName.substring(0, 2).toUpperCase()}-DK-01`;
    const newVendorData = {
      name: formName.trim(),
      nameAr: formNameAr.trim() || undefined,
      locationZone: formZone,
      starRating: formStarRating,
      contactPerson: formContactPerson || 'Director of Concierge',
      contactPhone: formContactPhone,
      contactEmail: formContactEmail || `concierge@${formName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.qa`,
      address: formAddress || `${formZone}, Doha, State of Qatar`,
      commissionRate: Number(formCommissionRate) || 15,
      contractStatus: formContractStatus,
      notes: formNotes,
      amenities: formAmenities,
      desks: [
        {
          deskCode: defaultDeskCode,
          deskName: `${formName} Lobby Tour Desk`,
          locationInHotel: 'Main Hotel Reception & Concierge',
          assignedStaff: 'Stationed Agent on Duty',
          phone: formContactPhone,
          status: 'Active' as const,
        },
      ],
      roomOptions: [
        {
          roomType: 'Deluxe Sea View Room',
          ratePerNightQAR: 1400,
          maxPax: 2,
          description: 'Spacious luxury room overlooking the Arabian Gulf with 5-star amenities.',
        },
        {
          roomType: 'Executive Suite',
          ratePerNightQAR: 2600,
          maxPax: 3,
          description: 'High-floor executive suite with private lounge access and luxury amenities.',
        },
      ],
    };

    const res = addHotelVendor(newVendorData);
    if (res.success) {
      triggerFeedback(`Successfully added ${formName} to Qatar Hotel Vendors Directory!`, 'success');
      setShowAddModal(false);
      // Reset form
      setFormName('');
      setFormNameAr('');
      setFormAddress('');
      setFormContactPerson('');
      setFormContactEmail('');
      setFormNotes('');
    } else {
      triggerFeedback(res.error || 'Failed to add hotel vendor.', 'error');
    }
  };

  // Update Vendor
  const handleUpdateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;

    const res = updateHotelVendor(editingVendor.id, editingVendor);
    if (res.success) {
      triggerFeedback(`Updated profile for ${editingVendor.name}.`, 'success');
      setEditingVendor(null);
    } else {
      triggerFeedback(res.error || 'Failed to update vendor.', 'error');
    }
  };

  // Delete Vendor
  const handleDeleteVendor = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from partner hotel vendors?`)) {
      const res = deleteHotelVendor(id);
      if (res.success) {
        triggerFeedback(`Removed ${name} from vendors.`, 'success');
        if (inspectingVendor?.id === id) setInspectingVendor(null);
      }
    }
  };

  // Add Room Option
  const handleAddRoomSubmit = (vendorId: string) => {
    if (!roomTypeInput.trim()) {
      triggerFeedback('Please provide a room type title.', 'error');
      return;
    }
    const newRoom: HotelRoomOption = {
      roomType: roomTypeInput.trim(),
      ratePerNightQAR: Number(roomRateInput) || 1200,
      maxPax: Number(roomPaxInput) || 2,
      description: roomDescInput.trim() || 'Luxury Qatar hospitality accommodation.',
    };
    addRoomOptionToVendor(vendorId, newRoom);
    triggerFeedback(`Added room category "${newRoom.roomType}" to hotel inventory!`, 'success');
    setShowAddRoomModal(null);
    setRoomTypeInput('');
    setRoomDescInput('');
  };

  // Add Desk
  const handleAddDeskSubmit = (vendorId: string) => {
    if (!deskNameInput.trim()) {
      triggerFeedback('Please provide a desk name.', 'error');
      return;
    }
    const newDesk: HotelVendorDesk = {
      deskCode: deskCodeInput.trim() || `HTL-DK-${Math.floor(10 + Math.random() * 90)}`,
      deskName: deskNameInput.trim(),
      locationInHotel: deskLocInput.trim() || 'Lobby Concierge',
      assignedStaff: deskStaffInput.trim() || 'Agent on Duty',
      phone: deskPhoneInput.trim() || '+974 4400 0000',
      status: 'Active',
    };
    addDeskToVendor(vendorId, newDesk);
    triggerFeedback(`Commissioned new Agent Desk "${newDesk.deskCode}" inside hotel!`, 'success');
    setShowAddDeskModal(null);
    setDeskNameInput('');
    setDeskCodeInput('');
    setDeskStaffInput('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {isRtl ? 'فنادق وشركاء قطر (Vendor Partners)' : 'Qatar Hotel Vendors & Partners'}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                  {totalVendorsCount} Properties
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRtl
                  ? 'إدارة عقود الفنادق الشريكة، كاونترات Agent Desk POS المتواجدة داخل اللوبي، وحجوزات الغرف المباشرة.'
                  : 'Manage luxury Qatar hotel contracts, stationed Agent Desk POS counters in hotel lobbies, and room booking inventories.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('hotel-bookings')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <BedDouble className="w-4 h-4 text-emerald-500" />
            <span>{isRtl ? 'منظومة حجز الفنادق' : 'Hotel Booking System'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 transition-colors border border-blue-200 dark:border-blue-800"
          >
            <Store className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{isRtl ? 'كاونترات Agent Desk POS' : 'Agent Desk POS Stations'}</span>
          </button>

          <button
            onClick={() => openModal('add-hotel-room')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 transition-colors border border-amber-300 dark:border-amber-700/60 shadow-xs cursor-pointer active:scale-95"
            title="Add a new room category and rate to a hotel vendor"
          >
            <BedDouble className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{isRtl ? '+ إضافة غرفة فندقية' : '+ Add Hotel Room'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{isRtl ? '+ إضافة فندق شريك جديد' : '+ Add Hotel Vendor'}</span>
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
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{isRtl ? 'الفنادق الشريكة' : 'Partner Hotels'}</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalVendorsCount}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-bold">100%</span> Qatar 5-Star Luxury
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{isRtl ? 'كاونترات اللوبي' : 'Lobby Agent Desks'}</span>
            <Store className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalStationedDesks}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Stationed inside hotels</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{isRtl ? 'حجوزات الفنادق' : 'Hotel Bookings'}</span>
            <BedDouble className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalHotelBookingsCount}</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Active reservations</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{isRtl ? 'إجمالي إيراد الفنادق' : 'Hotel Revenue'}</span>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {convertAmount(totalHotelRevenueQAR).formatted}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Direct hotel room sales</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">{isRtl ? 'متوسط العمولة' : 'Avg. Commission'}</span>
            <Award className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{avgCommissionRate}%</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Guaranteed agency take</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'ابحث باسم الفندق، المنطقة، الممثل، البريد...' : 'Search hotel name, location zone, concierge...'}
            className="w-full pl-9 pr-3 rtl:pl-3 rtl:pr-9 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
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
          {/* Zone Filter */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="ALL">{isRtl ? 'جميع مناطق قطر' : 'All Qatar Zones'}</option>
            {availableZones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-hidden"
          >
            <option value="ALL">{isRtl ? 'جميع حالات العقود' : 'All Contract Statuses'}</option>
            <option value="Exclusive Partner">Exclusive Partner</option>
            <option value="Active Partner">Active Partner</option>
            <option value="Pending Renewal">Pending Renewal</option>
          </select>

          {/* Grid / Table Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* 4. Hotel Vendors Display (Grid or Table) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVendors.map((vendor) => {
            const bookingsForThisVendor = hotelBookings.filter((b) => b.hotelId === vendor.id);
            const liveRevenue = bookingsForThisVendor.reduce((sum, b) => sum + (b.totalQAR || 0), 0);

            return (
              <div
                key={vendor.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header & Brand Accent */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center text-amber-500">
                          {Array.from({ length: vendor.starRating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {vendor.starRating}-Star Luxury
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {vendor.name}
                      </h3>
                      {vendor.nameAr && (
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans" dir="rtl">
                          {vendor.nameAr}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 border ${
                        vendor.contractStatus === 'Exclusive Partner'
                          ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800'
                          : vendor.contractStatus === 'Active Partner'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {vendor.contractStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{vendor.locationZone}</span>
                  </div>
                </div>

                {/* Card Middle: Agent Desks & Room Preview */}
                <div className="p-5 space-y-4 text-xs flex-1">
                  {/* Stationed Agent Desks Banner */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-blue-500" />
                        <span>Stationed Agent Desks POS ({vendor.desks?.length || 0})</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        IN-HOTEL
                      </span>
                    </div>

                    {vendor.desks && vendor.desks.length > 0 ? (
                      <div className="space-y-1.5">
                        {vendor.desks.map((d) => (
                          <div
                            key={d.deskCode}
                            className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50"
                          >
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{d.deskCode}</span>
                            <span className="text-slate-500 truncate max-w-[140px]">{d.deskName}</span>
                            <span className="text-emerald-500 font-semibold text-[10px]">Active</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">No agent desks stationed yet.</p>
                    )}
                  </div>

                  {/* Room Inventory & Pricing Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px] font-semibold">
                      <span>Room Categories ({vendor.roomOptions?.length || 0})</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">Commission: {vendor.commissionRate}%</span>
                    </div>

                    <div className="space-y-1.5">
                      {vendor.roomOptions?.slice(0, 2).map((room, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 text-[11px]"
                        >
                          <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[160px]">
                            {room.roomType}
                          </span>
                          <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                            {convertAmount(room.ratePerNightQAR).formatted} <span className="text-[9px] font-normal text-slate-400">/nt</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  {vendor.amenities && vendor.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {vendor.amenities.slice(0, 3).map((a, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          {a}
                        </span>
                      ))}
                      {vendor.amenities.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-400 font-mono">
                          +{vendor.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metrics Row */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total Bookings</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {bookingsForThisVendor.length > 0 ? bookingsForThisVendor.length : vendor.totalBookings || 0} res
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Gross Sales</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {convertAmount(liveRevenue > 0 ? liveRevenue : vendor.totalRevenueQAR || 0).formatted}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Action Buttons */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setInspectingVendor(vendor)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors text-center"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => openModal('add-hotel-room', { vendorId: vendor.id })}
                    className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                    title="Add Room Category to this Hotel"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Room</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('hotel-bookings')}
                    className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    title="Book room in this hotel"
                  >
                    <BedDouble className="w-3.5 h-3.5" />
                    <span>Book Room</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingVendor(vendor)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Edit Vendor"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id, vendor.name)}
                      className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left rtl:text-right">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[11px] font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Hotel Property</th>
                  <th className="py-3 px-4">Location Zone</th>
                  <th className="py-3 px-4">Stationed Desks</th>
                  <th className="py-3 px-4">Rooms Available</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Contact Concierge</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white">{vendor.name}</div>
                      <div className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> {vendor.starRating}-Star Luxury
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{vendor.locationZone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {vendor.desks?.map((d) => (
                          <span
                            key={d.deskCode}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          >
                            {d.deskCode}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {vendor.roomOptions?.length || 0} room types
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">
                      {vendor.commissionRate}%
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{vendor.contactPerson}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{vendor.contactPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          vendor.contractStatus === 'Exclusive Partner'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300'
                        }`}
                      >
                        {vendor.contractStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setInspectingVendor(vendor)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => openModal('add-hotel-room', { vendorId: vendor.id })}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                          title="Add Room Category"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Room</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('hotel-bookings')}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          Book
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL: ADD NEW HOTEL VENDOR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isRtl ? 'إضافة فندق شريك جديد بقطر' : 'Add New Qatar Hotel Vendor Partner'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Provision partner profile, agent desk station, and commission contract.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hotel Property Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Waldorf Astoria Lusail Doha"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Arabic Name (اسم الفندق بالعربية)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="مثال: والدورف أستوريا لوسيل الدوحة"
                    value={formNameAr}
                    onChange={(e) => setFormNameAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location Zone *</label>
                  <select
                    value={formZone}
                    onChange={(e) => setFormZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="West Bay Lagoon, Doha">West Bay Lagoon, Doha</option>
                    <option value="Lusail Marina, Lusail City">Lusail Marina, Lusail City</option>
                    <option value="The Pearl-Qatar, Doha">The Pearl-Qatar, Doha</option>
                    <option value="Msheireb Downtown, Doha">Msheireb Downtown, Doha</option>
                    <option value="The Corniche, West Bay, Doha">The Corniche, West Bay, Doha</option>
                    <option value="Katara Cultural Village, Doha">Katara Cultural Village, Doha</option>
                    <option value="Souq Waqif & Old Town">Souq Waqif & Old Town</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Star Rating</label>
                  <select
                    value={formStarRating}
                    onChange={(e) => setFormStarRating(Number(e.target.value) as 4 | 5)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={5}>5-Star Luxury Resort</option>
                    <option value={4}>4-Star Premium Hotel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contract Status</label>
                  <select
                    value={formContractStatus}
                    onChange={(e) => setFormContractStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Active Partner">Active Partner</option>
                    <option value="Exclusive Partner">Exclusive Partner</option>
                    <option value="Pending Renewal">Pending Renewal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Agency Commission (%) *</label>
                  <input
                    type="number"
                    min="5"
                    max="35"
                    required
                    value={formCommissionRate}
                    onChange={(e) => setFormCommissionRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Concierge Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Bader Al-Husseini"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Direct Phone (Qatar)</label>
                  <input
                    type="text"
                    value={formContactPhone}
                    onChange={(e) => setFormContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hotel Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. Marina Promenade, District Lusail, Doha, Qatar"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notes & Partnership Scope</label>
                <textarea
                  rows={2}
                  placeholder="e.g. VIP transit guest layovers, yacht charters, and direct chauffeur pickups..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Automatic Agent Desk Provisioning</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Saving this hotel vendor will automatically create an in-hotel Agent Desk POS station in the main lobby and populate initial room rates in QAR.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
                >
                  Confirm & Add Hotel Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: VENDOR DETAILS DRAWER / INSPECTION */}
      {inspectingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{inspectingVendor.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                      {inspectingVendor.starRating}-Star
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{inspectingVendor.locationZone}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingVendor(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Hotel Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contract Commission</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                    {inspectingVendor.commissionRate}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Applied on all room bookings</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Partner Status</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-1">
                    {inspectingVendor.contractStatus}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">Active Agreement</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Concierge Contact</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate mt-1">
                    {inspectingVendor.contactPerson}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{inspectingVendor.contactPhone}</span>
                </div>
              </div>

              {/* Stationed Agent Desks POS Inside Hotel */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-500" />
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Stationed Agent Desk Stations Inside Hotel ({inspectingVendor.desks?.length || 0})
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowAddDeskModal(inspectingVendor.id)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Station Another Desk
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {inspectingVendor.desks?.map((desk) => (
                    <div
                      key={desk.deskCode}
                      className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-800/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-blue-700 dark:text-blue-300 text-xs">
                          {desk.deskCode}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                          {desk.status}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">{desk.deskName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{desk.locationInHotel}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-blue-100 dark:border-blue-900/40">
                        <span className="text-slate-500">Staff: {desk.assignedStaff}</span>
                        <span className="font-mono text-slate-600 dark:text-slate-400">{desk.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Categories & Nightly Pricing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Room Categories & Live Nightly Inventory ({inspectingVendor.roomOptions?.length || 0})
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowAddRoomModal(inspectingVendor.id)}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Room Option
                  </button>
                </div>

                <div className="space-y-2">
                  {inspectingVendor.roomOptions?.map((room, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">{room.roomType}</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{room.description}</p>
                        <span className="text-[10px] text-slate-400 font-medium">Max Occupancy: {room.maxPax} Guests</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-black text-sm text-slate-900 dark:text-white">
                          {convertAmount(room.ratePerNightQAR).formatted} <span className="text-[10px] font-normal text-slate-400">/night</span>
                        </div>
                        <button
                          onClick={() => {
                            setInspectingVendor(null);
                            setActiveTab('hotel-bookings');
                          }}
                          className="mt-1 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px]"
                        >
                          Book Category
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {inspectingVendor.amenities && inspectingVendor.amenities.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs">Hotel Amenities & Features</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingVendor.amenities.map((a, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                      >
                        ✓ {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setInspectingVendor(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = inspectingVendor;
                    setInspectingVendor(null);
                    setEditingVendor(target);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setInspectingVendor(null);
                    setActiveTab('hotel-bookings');
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5"
                >
                  <BedDouble className="w-4 h-4" />
                  <span>Reserve Room at {inspectingVendor.name}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: EDIT HOTEL VENDOR */}
      {editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Edit Hotel Vendor: {editingVendor.name}
              </h3>
              <button
                onClick={() => setEditingVendor(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVendor} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hotel Property Name</label>
                <input
                  type="text"
                  required
                  value={editingVendor.name}
                  onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location Zone</label>
                  <input
                    type="text"
                    value={editingVendor.locationZone}
                    onChange={(e) => setEditingVendor({ ...editingVendor, locationZone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    value={editingVendor.commissionRate}
                    onChange={(e) => setEditingVendor({ ...editingVendor, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editingVendor.contactPerson}
                    onChange={(e) => setEditingVendor({ ...editingVendor, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingVendor.contactPhone}
                    onChange={(e) => setEditingVendor({ ...editingVendor, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contract Status</label>
                <select
                  value={editingVendor.contractStatus}
                  onChange={(e) => setEditingVendor({ ...editingVendor, contractStatus: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Active Partner">Active Partner</option>
                  <option value="Exclusive Partner">Exclusive Partner</option>
                  <option value="Pending Renewal">Pending Renewal</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVendor(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: ADD ROOM OPTION */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Add New Room Option</h4>
              <button onClick={() => setShowAddRoomModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Room Category Name *</label>
              <input
                type="text"
                placeholder="e.g. Royal Pearl Penthouse Suite"
                value={roomTypeInput}
                onChange={(e) => setRoomTypeInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Rate / Night ({currency}) *</label>
                <MoneyInput
                  valueQAR={roomRateInput}
                  onChangeQAR={setRoomRateInput}
                  min={0}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Max Occupancy (Pax)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={roomPaxInput}
                  onChange={(e) => setRoomPaxInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Short Description</label>
              <input
                type="text"
                placeholder="e.g. 90 sqm luxury suite with private terrace"
                value={roomDescInput}
                onChange={(e) => setRoomDescInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddRoomModal(null)}
                className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddRoomSubmit(showAddRoomModal)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Add Room to Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL: ADD AGENT DESK TO HOTEL */}
      {showAddDeskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Station New Agent Desk Inside Hotel</h4>
              <button onClick={() => setShowAddDeskModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Desk Station Code *</label>
                <input
                  type="text"
                  placeholder="e.g. HTL-DK-02"
                  value={deskCodeInput}
                  onChange={(e) => setDeskCodeInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Desk Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Marina Pavilion Counter"
                  value={deskNameInput}
                  onChange={(e) => setDeskNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location Inside Hotel</label>
              <input
                type="text"
                placeholder="e.g. Private Marina Pier Promenade"
                value={deskLocInput}
                onChange={(e) => setDeskLocInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Agent</label>
                <input
                  type="text"
                  placeholder="e.g. Mariam Al-Subaie"
                  value={deskStaffInput}
                  onChange={(e) => setDeskStaffInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Extension Phone</label>
                <input
                  type="text"
                  value={deskPhoneInput}
                  onChange={(e) => setDeskPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddDeskModal(null)}
                className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddDeskSubmit(showAddDeskModal)}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Station Desk in Hotel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
