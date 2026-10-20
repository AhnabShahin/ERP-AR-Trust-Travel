import React, { useState, useMemo } from 'react';
import {
  Store,
  CreditCard,
  Banknote,
  QrCode,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  User,
  Plane,
  Car,
  Receipt,
  RotateCcw,
  Building2,
  Users,
  Edit3,
  Eye,
  Clock,
  Target,
  Coins,
  Phone,
  Search,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Layers,
  LayoutGrid,
  List,
  Calendar,
  History,
  UserCheck,
  ShieldCheck,
  BedDouble,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Currency, TourPackage, AirportDesk, Employee, DeskAssignmentRecord, ServiceMainType } from '../../types';
import { getServiceTypeForCategory } from '../../data/mockData';
import { DateFilterBar } from '../common/DateFilterBar';
import { matchesDateFilter } from '../../utils/dateFilter';

export const AirportDeskPOSView: React.FC = () => {
  const {
    packages,
    packageCategories,
    categoryServiceMap,
    addBooking,
    convertAmount,
    rates,
    drivers,
    flights,
    airportDesks,
    activeDeskId,
    setActiveDeskId,
    activeDesk,
    addAirportDesk,
    updateAirportDesk,
    deleteAirportDesk,
    deskAssignmentHistory,
    assignEmployeeToDesk,
    addDeskAssignmentRecord,
    deleteDeskAssignmentRecord,
    employees,
    bookings,
    hotelVendors,
    setActiveTab,
    openModal,
    language,
    dateFilter,
    setDateFilter,
    t,
  } = useApp();

  // View Mode: 'all-desks' (All Desks Overview), 'assignment-history' (Date-by-date Desk Assignment History), or 'terminal' (Live POS checkout)
  const [activeViewMode, setActiveViewMode] = useState<'all-desks' | 'assignment-history' | 'terminal'>('all-desks');

  // Display layout mode: 'card' (Grid Cards) or 'list' (Table / List view)
  const [deskDisplayLayout, setDeskDisplayLayout] = useState<'card' | 'list'>('card');

  // Assignment History State ("kon date date kauke airport er desk a assign kora hoicilo oitar ekta history dekha jabe")
  const [assignmentSearchQuery, setAssignmentSearchQuery] = useState('');
  const [assignmentDeskFilter, setAssignmentDeskFilter] = useState('ALL');
  const [assignmentStaffFilter, setAssignmentStaffFilter] = useState('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetDeskId, setAssignTargetDeskId] = useState<string>('desk-hia-01');
  const [assignTargetStaffId, setAssignTargetStaffId] = useState<string>('');
  const [assignShiftTiming, setAssignShiftTiming] = useState('06:00 AM - 14:30 PM (Morning Shift)');
  const [assignDateInput, setAssignDateInput] = useState('Oct 09, 2026, 06:00 AM');
  const [assignNotes, setAssignNotes] = useState('');

  // Desk management modals
  const [showAddDeskModal, setShowAddDeskModal] = useState(false);
  const [inspectingDesk, setInspectingDesk] = useState<AirportDesk | null>(null);
  const [editingDesk, setEditingDesk] = useState<AirportDesk | null>(null);
  const [deskSearchQuery, setDeskSearchQuery] = useState('');
  const [selectedAirportFilter, setSelectedAirportFilter] = useState<string>('ALL');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Desk Form State
  const [newAirportCode, setNewAirportCode] = useState('HIA');
  const [newAirportName, setNewAirportName] = useState('Hamad International Airport');
  const [newDeskCode, setNewDeskCode] = useState(`HIA-CTR-0${airportDesks.length + 1}`);
  const [newDeskName, setNewDeskName] = useState('Arrivals Concierge Counter');
  const [newDeskNameAr] = useState('كاونتر استقبال وتسهيلات الترانزيت');
  const [newTerminal, setNewTerminal] = useState('Terminal 1');
  const [newZone, setNewZone] = useState('South Concourse / Bay 4');
  const [newAssignedEmployeeId, setNewAssignedEmployeeId] = useState('');
  const [newShiftTiming, setNewShiftTiming] = useState('Morning (06:00 - 15:00)');
  const [newOperatingHours, setNewOperatingHours] = useState('24/7');
  const [newPhoneExt, setNewPhoneExt] = useState('+974 4010 4480');
  const [newDailyTargetQAR, setNewDailyTargetQAR] = useState<number>(15000);
  const [newDrawerCashQAR, setNewDrawerCashQAR] = useState<number>(3500);

  // POS State
  const [posServiceType, setPosServiceType] = useState<ServiceMainType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const posCategories = useMemo(() => {
    if (posServiceType === 'ALL') return packageCategories;
    return packageCategories.filter((cat) => {
      const sType = categoryServiceMap[cat] || getServiceTypeForCategory(cat);
      return sType === posServiceType;
    });
  }, [packageCategories, posServiceType, categoryServiceMap]);

  const filteredPosPackages = useMemo(() => {
    return packages.filter((p) => {
      const pType = p.serviceType || categoryServiceMap[p.category] || getServiceTypeForCategory(p.category, p.isMultiDay);
      const matchType = posServiceType === 'ALL' || pType === posServiceType;
      const matchCat = selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchType && matchCat;
    });
  }, [packages, posServiceType, selectedCategory, categoryServiceMap]);
  const [selectedPkg, setSelectedPkg] = useState<TourPackage>(
    packages[0] || {
      id: 'pkg-default',
      name: 'Desert Safari & Inland Sea',
      nameAr: 'رحلة سفاري خور العديد',
      category: 'Desert Safari',
      duration: '4 Hours',
      priceQAR: 480,
      description: '4x4 dune bashing',
      descriptionAr: 'تطعيس بالكثبان الرملية',
      pickupLocation: 'HIA Bay 4',
      includes: ['4x4 Land Cruiser'],
    }
  );
  const [paxCount, setPaxCount] = useState(2);
  const [passengerName, setPassengerName] = useState('Captain Oliver Smith');
  const [passengerPhone, setPassengerPhone] = useState('+44 7921 554321');
  const [flightNumber, setFlightNumber] = useState('QR 138');
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0]?.id || 'drv-01');
  const [bookingDate, setBookingDate] = useState('2026-10-15');
  const [bookingTime, setBookingTime] = useState('14:30');

  // Cash Tender Calculator
  const [tenderCurrency, setTenderCurrency] = useState<Currency>('USD');
  const [tenderedAmount, setTenderedAmount] = useState<number>(300);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'POS Card'>('Cash');
  const [lastIssuedPNR, setLastIssuedPNR] = useState<string | null>(null);

  const totalQAR = (selectedPkg?.priceQAR || 450) * paxCount;
  const rateToQAR =
    tenderCurrency === 'USD'
      ? rates.USD
      : tenderCurrency === 'EUR'
      ? rates.EUR
      : tenderCurrency === 'GBP'
      ? rates.GBP
      : 1;

  const totalDueInTenderCurrency = totalQAR / rateToQAR;
  const tenderedValueInQAR = tenderedAmount * rateToQAR;
  const changeDueQAR = tenderedValueInQAR - totalQAR;

  // Filtered agent desks (Airport Counters + Hotel Partner Desks)
  const filteredDesks = useMemo(() => {
    return airportDesks.filter((desk) => {
      if (selectedAirportFilter === 'HOTELS') {
        if (desk.deskType !== 'Hotel Vendor Desk' && !desk.hotelVendorId && desk.airportCode !== 'DOH-HOTEL') return false;
      } else if (selectedAirportFilter === 'AIRPORTS') {
        if (desk.deskType === 'Hotel Vendor Desk' || desk.airportCode === 'DOH-HOTEL') return false;
      } else if (selectedAirportFilter !== 'ALL' && desk.airportCode !== selectedAirportFilter) {
        return false;
      }
      if (deskSearchQuery.trim()) {
        const query = deskSearchQuery.toLowerCase();
        const matchesName = (desk.deskName || '').toLowerCase().includes(query);
        const matchesCode = (desk.deskCode || '').toLowerCase().includes(query);
        const matchesStaff = (desk.assignedEmployeeName || '').toLowerCase().includes(query);
        const matchesAirport = (desk.airportName || '').toLowerCase().includes(query);
        const matchesTerminal = (desk.terminal || '').toLowerCase().includes(query);
        const matchesHotel = (desk.hotelName || '').toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesStaff && !matchesAirport && !matchesTerminal && !matchesHotel) {
          return false;
        }
      }
      return true;
    });
  }, [airportDesks, selectedAirportFilter, deskSearchQuery]);

  // Filtered Desk Staff Assignment History (Date-by-date roster)
  const filteredAssignments = useMemo(() => {
    return deskAssignmentHistory.filter((rec) => {
      // 1. Date & Year Filter
      if (!matchesDateFilter(rec.assignedDate, dateFilter)) return false;
      // 2. Desk filter
      if (assignmentDeskFilter !== 'ALL' && rec.deskId !== assignmentDeskFilter && rec.deskCode !== assignmentDeskFilter) return false;
      // 3. Staff filter
      if (assignmentStaffFilter !== 'ALL' && rec.employeeId !== assignmentStaffFilter) return false;
      // 4. Search query
      if (assignmentSearchQuery.trim()) {
        const q = assignmentSearchQuery.toLowerCase();
        const matchStaff = rec.employeeName.toLowerCase().includes(q) || rec.employeeRole.toLowerCase().includes(q);
        const matchDesk = rec.deskCode.toLowerCase().includes(q) || rec.deskName.toLowerCase().includes(q) || rec.airportCode.toLowerCase().includes(q);
        const matchDate = rec.assignedDate.toLowerCase().includes(q);
        const matchNotes = (rec.notes || '').toLowerCase().includes(q);
        if (!matchStaff && !matchDesk && !matchDate && !matchNotes) return false;
      }
      return true;
    });
  }, [deskAssignmentHistory, dateFilter, assignmentDeskFilter, assignmentStaffFilter, assignmentSearchQuery]);

  // Aggregate desk metrics
  const totalDesksCount = airportDesks.length;
  const activeDesksCount = airportDesks.filter((d) => d.status === 'Active').length;
  const totalDrawerCashSum = airportDesks.reduce((acc, d) => acc + (d.currentDrawerCashQAR || 0), 0);
  const totalDailyTargetSum = airportDesks.reduce((acc, d) => acc + (d.dailyTargetQAR || 0), 0);

  // Handle Log / Station Staff to Desk
  const handleAssignStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTargetDeskId || !assignTargetStaffId) {
      setFeedbackMessage({ text: 'Please select both an Agent Desk and Staff Member.', type: 'error' });
      return;
    }
    const res = assignEmployeeToDesk(assignTargetDeskId, assignTargetStaffId, assignShiftTiming, assignNotes);
    if (res.success) {
      setShowAssignModal(false);
      setAssignNotes('');
      setFeedbackMessage({ text: 'Staff member successfully stationed and recorded in assignment history!', type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3500);
    } else {
      setFeedbackMessage({ text: res.error || 'Failed to station staff', type: 'error' });
    }
  };

  // Handle Create Airport Desk
  const handleCreateDesk = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedEmp = employees.find((emp) => emp.id === newAssignedEmployeeId);

    const res = addAirportDesk({
      airportCode: newAirportCode,
      airportName: newAirportName,
      deskCode: newDeskCode,
      deskName: newDeskName,
      deskNameAr: newDeskNameAr,
      terminal: newTerminal,
      zone: newZone,
      assignedEmployeeId: assignedEmp ? assignedEmp.id : '',
      assignedEmployeeName: assignedEmp ? assignedEmp.name : 'Unassigned',
      assignedEmployeeRole: assignedEmp ? assignedEmp.role : 'Transit Desk Agent',
      status: 'Active',
      shiftTiming: newShiftTiming,
      phoneExt: newPhoneExt,
      operatingHours: newOperatingHours,
      dailyTargetQAR: Number(newDailyTargetQAR),
      currentDrawerCashQAR: Number(newDrawerCashQAR),
      notes: 'Provisioned counter via Agent Desk POS Management.',
    });

    if (res.success) {
      setShowAddDeskModal(false);
      setFeedbackMessage({ text: `Desk ${newDeskCode} successfully added!`, type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3500);
    } else {
      setFeedbackMessage({ text: res.error || 'Failed to add desk', type: 'error' });
    }
  };

  // Handle Update Airport Desk
  const handleSaveEditDesk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesk) return;

    const assignedEmp = employees.find((emp) => emp.id === editingDesk.assignedEmployeeId);

    const updatedData: Partial<AirportDesk> = {
      ...editingDesk,
      assignedEmployeeName: assignedEmp ? assignedEmp.name : (editingDesk.assignedEmployeeId ? editingDesk.assignedEmployeeName : 'Unassigned'),
      assignedEmployeeRole: assignedEmp ? assignedEmp.role : editingDesk.assignedEmployeeRole,
    };

    const res = updateAirportDesk(editingDesk.id, updatedData);
    if (res.success) {
      setEditingDesk(null);
      if (inspectingDesk && inspectingDesk.id === editingDesk.id) {
        setInspectingDesk({ ...inspectingDesk, ...updatedData });
      }
      setFeedbackMessage({ text: `Desk ${editingDesk.deskCode} updated successfully!`, type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3500);
    } else {
      setFeedbackMessage({ text: res.error || 'Failed to update desk', type: 'error' });
    }
  };

  // Handle Delete Desk
  const handleDeleteDesk = (id: string, code: string) => {
    if (confirm(`Are you sure you want to remove Agent Desk ${code}?`)) {
      const res = deleteAirportDesk(id);
      if (res.success) {
        if (inspectingDesk?.id === id) setInspectingDesk(null);
        if (editingDesk?.id === id) setEditingDesk(null);
        setFeedbackMessage({ text: `Desk ${code} has been removed.`, type: 'success' });
        setTimeout(() => setFeedbackMessage(null), 3500);
      } else {
        setFeedbackMessage({ text: res.error || 'Cannot remove desk', type: 'error' });
      }
    }
  };

  // Handle POS Checkout Process
  const handleProcessOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const pnr = `ART-QA-${Math.floor(2000 + Math.random() * 8000)}`;
    const driver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
    const flight = flights.find((f) => f.flightNumber === flightNumber) || flights[0];

    const newBooking = addBooking({
      pnr,
      passengerName,
      passengerPhone,
      passengerEmail: 'passenger@hia.terminal',
      nationality: 'United Kingdom',
      flightNumber,
      arrivalAirport: activeDesk?.airportName || 'Hamad Int’l Airport (DOH)',
      arrivalTime: flight?.estimatedArrival || '14:20',
      terminalGate: `Gate ${flight?.gate || 'B12'}`,
      pickupBay: 'Pickup Bay 3',
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      packageNameAr: selectedPkg.nameAr,
      paxCount,
      totalQAR,
      paymentCurrency: tenderCurrency,
      paymentMethod,
      driverId: driver?.id || 'drv-01',
      driverName: driver?.name || 'Hamad Al-Kuwari',
      driverVehicle: driver ? `${driver.vehicle} (${driver.plateNumber})` : 'Land Cruiser 2026',
      driverPhone: driver?.phone || '+974 5512 3456',
      qrStatus: 'checked-in',
      qrCodeUrl: `https://artrust.qa/voucher/${pnr}`,
      voucherSent: true,
      bookingDate,
      bookingTime,
      deskId: activeDesk?.id,
      deskCode: activeDesk?.deskCode,
      notes: `POS Cash Drawer Tendered ${tenderedAmount} ${tenderCurrency}. Desk: ${activeDesk?.deskCode || 'CTR-04'}. Staff: ${activeDesk?.assignedEmployeeName || 'Agent'}. Change given: ${changeDueQAR.toFixed(2)} QAR.`,
      source: 'Agent Desk',
    });

    setLastIssuedPNR(pnr);
    openModal('qr-voucher', newBooking);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* POS Top Header Banner with Mode Toggle */}
      <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{activeDesk ? activeDesk.deskName : 'Agent Desk POS'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                  {activeDesk ? activeDesk.deskCode : 'RC-DK-01'}
                </span>
              </h2>

              {/* Stationed Employee Sitting at Desk Pill */}
              {activeDesk && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/50 text-[11px] text-blue-800 dark:text-blue-300 font-semibold">
                  <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Stationed Staff:</span>
                  <strong className="font-extrabold text-slate-900 dark:text-white">
                    {activeDesk.assignedEmployeeName || 'Unassigned'}
                  </strong>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>{activeDesk?.airportName || 'Hotel Vendor Desk / Airport Station'} · {activeDesk?.terminal || 'Lobby Concierge'}</span>
              <span>• Phone: {activeDesk?.phoneExt || '+974 4484 8120'}</span>
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Shortcuts to Hotel Booking & Vendors */}
          <button
            onClick={() => setActiveTab('hotel-bookings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-colors"
            title="Book rooms in partner hotels"
          >
            <BedDouble className="w-3.5 h-3.5 text-amber-500" />
            <span>Hotel Booking</span>
          </button>

          <button
            onClick={() => setActiveTab('vendors')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Manage Qatar Hotel Vendors"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Hotel Vendors</span>
          </button>

          {/* Mode Switch Tabs: All Desks & Details is FIRST and active by default */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
            <button
              onClick={() => setActiveViewMode('all-desks')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'all-desks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>All Desks & Details ({airportDesks.length})</span>
            </button>

            <button
              onClick={() => setActiveViewMode('assignment-history')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'assignment-history'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View on which dates staff was stationed/assigned to agent desks"
            >
              <History className="w-3.5 h-3.5" />
              <span>Assignment History ({deskAssignmentHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveViewMode('terminal')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeViewMode === 'terminal'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>POS Terminal & Checkout</span>
            </button>
          </div>

          {/* Inspect Active Desk Button */}
          {activeDesk && (
            <button
              onClick={() => setInspectingDesk(activeDesk)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>Active Desk Details</span>
            </button>
          )}

          {/* Quick Counter Selector dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 font-mono">
              Switch:
            </span>
            <select
              value={activeDeskId}
              onChange={(e) => setActiveDeskId(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
            >
              {airportDesks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.airportCode}: {d.deskCode} - {d.deskName} ({d.assignedEmployeeName || 'Unassigned'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: ALL AIRPORT DESKS & DETAILS OVERVIEW ("sob desk details dekha jabe") */}
      {/* ========================================================================= */}
      {activeViewMode === 'all-desks' && (
        <div className="space-y-5">
          {/* Summary KPI Cards for Airport Desks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Total Agent Desks</span>
                <Building2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalDesksCount}</span>
                <span className="text-xs font-bold text-emerald-600">({activeDesksCount} Active)</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                {airportDesks.filter((d) => d.deskType === 'Hotel Vendor Desk').length} Qatar Hotel Desks · {airportDesks.filter((d) => d.deskType !== 'Hotel Vendor Desk').length} Airport Terminals
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Stationed Personnel</span>
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {airportDesks.filter((d) => d.assignedEmployeeId).length}
                </span>
                <span className="text-xs text-slate-400">staff sitting at counters</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                Assigned from staff roster
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Total Drawer Cash Available</span>
                <Coins className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {totalDrawerCashSum.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">QAR</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                Petty cash across all drawers
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Daily Sales Target</span>
                <Target className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {totalDailyTargetSum.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">QAR / Day</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                Aggregate target across counters
              </div>
            </div>
          </div>

          {/* Date & Year Filter */}
          <DateFilterBar
            filter={dateFilter}
            onChange={setDateFilter}
            totalCount={airportDesks.length}
            label={language === 'ar' ? 'تصفية بيانات مكاتب الوكلاء والفنادق بالسنة' : 'Agent Desks Date & Year Filter'}
          />

          {/* Search, Filter Bar and Add Button */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={deskSearchQuery}
                  onChange={(e) => setDeskSearchQuery(e.target.value)}
                  placeholder="Search desk name, code, stationed staff, terminal..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Desk Location Type Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'All Desks' },
                  { id: 'HOTELS', label: '🏨 Qatar Hotels' },
                  { id: 'HIA', label: '✈️ HIA Airport' },
                  { id: 'DIA', label: '✈️ DIA Airport' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedAirportFilter(item.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedAirportFilter === item.id
                        ? 'bg-slate-900 text-white dark:bg-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Card / List Layout Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setDeskDisplayLayout('card')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    deskDisplayLayout === 'card'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeskDisplayLayout('list')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    deskDisplayLayout === 'list'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="List Table View"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">List</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAddDeskModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Agent Desk</span>
            </button>
          </div>

          {/* Conditional Display: Card Grid View vs List / Table View */}
          {deskDisplayLayout === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDesks.map((desk) => {
              const isCurrentActive = activeDeskId === desk.id;
              const assignedEmp = employees.find((emp) => emp.id === desk.assignedEmployeeId);

              return (
                <div
                  key={desk.id}
                  className={`p-5 rounded-3xl border transition-all relative ${
                    isCurrentActive
                      ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  {/* Top Badge Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 dark:text-white">
                          {desk.deskCode}
                        </span>
                        {desk.deskType === 'Hotel Vendor Desk' || desk.hotelName ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            🏨 {desk.hotelName || 'Qatar Hotel Partner'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            ✈️ {desk.airportCode}
                          </span>
                        )}
                        {isCurrentActive && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white animate-pulse">
                            ACTIVE POS
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5">
                        {desk.deskName}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {desk.airportName} • {desk.terminal} ({desk.zone})
                      </p>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        desk.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : desk.status === 'Closing Soon'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {desk.status}
                    </span>
                  </div>

                  {/* Stationed Staff Card within Desk */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">
                        Stationed Employee:
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold">
                        {desk.shiftTiming}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mt-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {desk.assignedEmployeeName.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {desk.assignedEmployeeName || 'Unassigned'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {desk.assignedEmployeeRole || (assignedEmp ? assignedEmp.role : 'Transit Concierge')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Operational Stats */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">Drawer Cash:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {(desk.currentDrawerCashQAR || 0).toLocaleString()} QAR
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-mono">Daily Target:</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {(desk.dailyTargetQAR || 0).toLocaleString()} QAR
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveDeskId(desk.id);
                        setActiveViewMode('terminal');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all text-center"
                    >
                      Open in POS
                    </button>

                    <button
                      onClick={() => {
                        setAssignmentDeskFilter(desk.id);
                        setActiveViewMode('assignment-history');
                      }}
                      className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                      title="View Date-by-Date Staff Assignment History"
                    >
                      <History className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setInspectingDesk(desk)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="View Full Individual Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setEditingDesk(desk)}
                      className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                      title="Edit Individual Desk Information"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteDesk(desk.id, desk.deskCode)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                      title="Delete Desk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desks List / Table View ("list view te dekha jay ei option ta add koro") */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    <th className="py-3.5 px-4">Desk & Airport</th>
                    <th className="py-3.5 px-4">Counter & Zone</th>
                    <th className="py-3.5 px-4">Stationed Personnel</th>
                    <th className="py-3.5 px-4 text-right">Drawer Cash</th>
                    <th className="py-3.5 px-4 text-right">Daily Target</th>
                    <th className="py-3.5 px-4">Hours & Phone</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredDesks.map((desk) => {
                    const isCurrentActive = activeDeskId === desk.id;
                    const assignedEmp = employees.find((emp) => emp.id === desk.assignedEmployeeId);

                    return (
                      <tr
                        key={desk.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                          isCurrentActive ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 dark:text-white">
                              {desk.deskCode}
                            </span>
                            {desk.deskType === 'Hotel Vendor Desk' || desk.hotelName ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                🏨 {desk.hotelName || 'Hotel Desk'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                ✈️ {desk.airportCode}
                              </span>
                            )}
                            {isCurrentActive && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {desk.airportName}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {desk.deskName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {desk.terminal} • {desk.zone}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {desk.assignedEmployeeName.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {desk.assignedEmployeeName || 'Unassigned'}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {desk.shiftTiming} {assignedEmp ? `• ${assignedEmp.phone}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {(desk.currentDrawerCashQAR || 0).toLocaleString()} QAR
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {(desk.dailyTargetQAR || 0).toLocaleString()} QAR
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          <div>{desk.operatingHours}</div>
                          <div className="text-[10px] text-slate-400">{desk.phoneExt}</div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block ${
                              desk.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : desk.status === 'Closing Soon'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {desk.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActiveDeskId(desk.id);
                                setActiveViewMode('terminal');
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                isCurrentActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300'
                              }`}
                              title="Open in Live Checkout POS"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>{isCurrentActive ? 'POS' : 'Activate'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setAssignmentDeskFilter(desk.id);
                                setActiveViewMode('assignment-history');
                              }}
                              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                              title="View Assignment Date History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setInspectingDesk(desk)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setEditingDesk(desk)}
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                              title="Edit Desk"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteDesk(desk.id, desk.deskCode)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                              title="Delete Desk"
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
            </div>
          </div>
        )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: AIRPORT DESK STAFF ASSIGNMENT HISTORY                             */}
      {/* "kon date date kauke airport er desk a assign kora hoicilo oitar history"  */}
      {/* ========================================================================= */}
      {activeViewMode === 'assignment-history' && (
        <div className="space-y-5">
          {/* Summary KPI Cards for Desk Staff Assignments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Total Recorded Assignments</span>
                <History className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {deskAssignmentHistory.length}
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Across 2024–2026
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                Historical staff rosters logged
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Currently Active Stations</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {deskAssignmentHistory.filter((a) => a.status === 'Active').length}
                </span>
                <span className="text-xs text-slate-400">Staff On Active Duty</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                Currently stationed at counters
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Past Shift Rotations</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {deskAssignmentHistory.filter((a) => a.status === 'Completed' || a.status === 'Reassigned').length}
                </span>
                <span className="text-xs font-bold text-slate-400">Archived Duties</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                Successfully relieved / rotated
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Agent Desk Coverage</span>
                <Building2 className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  100%
                </span>
                <span className="text-xs font-bold text-emerald-600">All Stations Manned</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                HIA, DIA & Luxury Qatar Hotel Desks
              </div>
            </div>
          </div>

          {/* Date & Year Filter Bar for Assignment History */}
          <DateFilterBar
            filter={dateFilter}
            onChange={setDateFilter}
            totalCount={filteredAssignments.length}
            label={language === 'ar' ? 'تصفية سجل تعيينات الكاونترات بالسنة والتاريخ' : 'Desk Staff Assignment Date & Year History Filter'}
          />

          {/* Search, Desk Filter and Log Assignment CTA */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={assignmentSearchQuery}
                  onChange={(e) => setAssignmentSearchQuery(e.target.value)}
                  placeholder="Search staff name, counter code, date, notes..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Desk Filter Dropdown */}
              <select
                value={assignmentDeskFilter}
                onChange={(e) => setAssignmentDeskFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="ALL">All Agent Desks</option>
                {airportDesks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.airportCode}: {d.deskCode} - {d.deskName}
                  </option>
                ))}
              </select>

              {/* Staff Member Filter Dropdown */}
              <select
                value={assignmentStaffFilter}
                onChange={(e) => setAssignmentStaffFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
              >
                <option value="ALL">All Stationed Staff</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Log / Station Staff Button */}
            <button
              onClick={() => {
                setAssignTargetDeskId(activeDeskId || 'desk-hia-01');
                setAssignTargetStaffId(employees[0]?.id || '');
                setShowAssignModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer self-start md:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Station / Assign Staff to Desk</span>
            </button>
          </div>

          {/* Assignment History Table ("kon date date kauke airport er desk a assign kora hoicilo oitar ekta history dekha jabe") */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    <th className="py-3.5 px-4">Assigned Date & Time</th>
                    <th className="py-3.5 px-4">Airport & Counter</th>
                    <th className="py-3.5 px-4">Stationed Personnel</th>
                    <th className="py-3.5 px-4">Shift Timing</th>
                    <th className="py-3.5 px-4">Assigned By</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Operational Remarks</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="font-semibold text-sm">No desk staff assignment records found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting your date or desk filter, or click "+ Station / Assign Staff to Desk" to record a shift.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((record) => {
                      const isActive = record.status === 'Active';
                      const desk = airportDesks.find((d) => d.id === record.deskId || d.deskCode === record.deskCode);

                      return (
                        <tr
                          key={record.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                            isActive ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          {/* 1. Assigned Date */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                              <div>
                                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                                  {record.assignedDate}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Record #{record.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Airport & Desk */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-slate-900 text-white dark:bg-slate-800 dark:text-white">
                                {record.deskCode}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                {record.airportCode}
                              </span>
                            </div>
                            <div className="font-bold text-slate-900 dark:text-white mt-1">
                              {record.deskName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {record.terminal}
                            </div>
                          </td>

                          {/* 3. Stationed Staff */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                                {record.employeeName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 dark:text-white">
                                  {record.employeeName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {record.employeeRole}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 4. Shift Timing */}
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{record.shiftTiming}</span>
                            </div>
                          </td>

                          {/* 5. Assigned By */}
                          <td className="py-3.5 px-4 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span>{record.assignedBy}</span>
                            </div>
                          </td>

                          {/* 6. Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                                record.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : record.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {record.status === 'Active' && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              )}
                              {record.status}
                            </span>
                          </td>

                          {/* 7. Notes */}
                          <td className="py-3.5 px-4 max-w-xs text-[11px] text-slate-500 dark:text-slate-400">
                            <p className="line-clamp-2">{record.notes || 'Routine counter duty schedule.'}</p>
                          </td>

                          {/* 8. Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {desk && (
                                <button
                                  onClick={() => {
                                    setInspectingDesk(desk);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                  title="View Desk Details & Full History"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (confirm(`Remove assignment record for ${record.employeeName} on ${record.assignedDate}?`)) {
                                    deleteDeskAssignmentRecord(record.id);
                                    setFeedbackMessage({ text: 'Assignment history record removed.', type: 'success' });
                                    setTimeout(() => setFeedbackMessage(null), 3000);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition"
                                title="Remove Assignment Log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: ACTIVE DESK POS CHECKOUT TERMINAL                                 */}
      {/* ========================================================================= */}
      {activeViewMode === 'terminal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Package Quick Catalog (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Select Tour Package / Airport Service</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">All prices in QAR</span>
            </div>

            {/* Level 1: Primary Service Type Quick Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setPosServiceType('ALL');
                  setSelectedCategory('ALL');
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  posServiceType === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({packages.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setPosServiceType('Tour Service');
                  setSelectedCategory('ALL');
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  posServiceType === 'Tour Service'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                🧭 Tours
              </button>
              <button
                type="button"
                onClick={() => {
                  setPosServiceType('Tour Package');
                  setSelectedCategory('ALL');
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  posServiceType === 'Tour Package'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
              >
                🏖️ Packages
              </button>
              <button
                type="button"
                onClick={() => {
                  setPosServiceType('Transfer Service');
                  setSelectedCategory('ALL');
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                  posServiceType === 'Transfer Service'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                🚗 Transfers
              </button>
            </div>

            {/* Level 2: Sub-Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Categories ({filteredPosPackages.length})
              </button>
              {posCategories.map((cat) => {
                const count = packages.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Package Cards List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredPosPackages.map((pkg) => {
                  const isSelected = selectedPkg.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-sm shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {pkg.category}
                        </span>
                        <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                          {pkg.priceQAR} QAR
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                        {pkg.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {pkg.description}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Duration: {pkg.duration}</span>
                        <span>Pickup: {pkg.pickupLocation}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right: Order Details, Passenger Info & Tender Calculator (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Counter Checkout & Boarding Pass
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                {activeDesk?.deskCode || 'HIA-CTR-04'}
              </span>
            </div>

            {/* Selected Service Preview */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">{selectedPkg.name}</span>
                <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  {selectedPkg.priceQAR} QAR / Pax
                </span>
              </div>

              {/* Number of Pax stepper */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                <span className="text-slate-500 font-medium">Passenger Count:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaxCount(Math.max(1, paxCount - 1))}
                    className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200"
                  >
                    -
                  </button>
                  <span className="font-mono font-bold w-6 text-center">{paxCount}</span>
                  <button
                    onClick={() => setPaxCount(paxCount + 1)}
                    className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Passenger & Flight Inputs */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Passenger Full Name:</label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Passenger Phone / WhatsApp:</label>
                  <input
                    type="text"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Arrival Flight Number:</label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1 font-semibold">Tour Booking Date:</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[11px] mb-1 font-semibold">Scheduled Tour Time:</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[11px] mb-1">Assign Chauffeur / Guide:</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.vehicle} ({d.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Multi-Currency Cash Tender Input */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Payment Currency Tender:
                </span>
                <div className="flex items-center gap-1">
                  {(['USD', 'EUR', 'GBP', 'QAR'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setTenderCurrency(c)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                        tenderCurrency === c
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-mono mb-1">
                    Total Due ({tenderCurrency}):
                  </label>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white">
                    {totalDueInTenderCurrency.toFixed(2)} {tenderCurrency}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-mono mb-1">
                    Cash Handed by Guest:
                  </label>
                  <input
                    type="number"
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Change calculation */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-emerald-800 dark:text-emerald-400 font-bold block">
                    Change Due in QAR (ر.ق):
                  </span>
                  <div className="font-mono text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    {changeDueQAR >= 0 ? `${changeDueQAR.toFixed(2)} QAR` : 'Underpaid'}
                  </div>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-500">
                  Peg: 1 {tenderCurrency} = {rateToQAR} QAR
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                onClick={handleProcessOrder}
                disabled={changeDueQAR < 0}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  changeDueQAR < 0
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>Issue Booking & Print QR Boarding Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW INDIVIDUAL DESK DETAILS ("desk duke sob info dekha jabe")      */}
      {/* ========================================================================= */}
      {inspectingDesk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {inspectingDesk.deskCode}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {inspectingDesk.status}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {inspectingDesk.deskName}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setEditingDesk({ ...inspectingDesk });
                    setInspectingDesk(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Desk Info</span>
                </button>
                <button
                  onClick={() => setInspectingDesk(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stationed Staff Detailed Highlight */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  {inspectingDesk.assignedEmployeeName.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Stationed Staff Member
                  </span>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {inspectingDesk.assignedEmployeeName || 'Unassigned Counter'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {inspectingDesk.assignedEmployeeRole || 'Transit Desk Agent'} • Shift: {inspectingDesk.shiftTiming}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setActiveTab('employees')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Staff Profile & Salary</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Key Value Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] block">Airport Location:</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {inspectingDesk.airportName} ({inspectingDesk.airportCode})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] block">Terminal & Concourse:</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {inspectingDesk.terminal} • {inspectingDesk.zone}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] block">Current Drawer Cash:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">
                  {(inspectingDesk.currentDrawerCashQAR || 0).toLocaleString()} QAR
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] block">Daily Sales Target:</span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm mt-0.5 block">
                  {(inspectingDesk.dailyTargetQAR || 0).toLocaleString()} QAR
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] block">Operating Hours:</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {inspectingDesk.operatingHours || '24 Hours / 7 Days'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800">
                <span className="text-slate-400 font-mono text-[10px] block">Direct Phone Extension:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {inspectingDesk.phoneExt || '+974 4010 4480'}
                </span>
              </div>
            </div>

            {inspectingDesk.notes && (
              <div>
                <span className="text-slate-400 text-[10px] font-mono uppercase block mb-1">
                  Counter Operational Notes:
                </span>
                <p className="text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  {inspectingDesk.notes}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveDeskId(inspectingDesk.id);
                  setActiveViewMode('terminal');
                  setInspectingDesk(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Switch Active POS to This Desk
              </button>

              <button
                onClick={() => setInspectingDesk(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT INDIVIDUAL AIRPORT DESK INFORMATION ("individual edit kora jabe") */}
      {/* ========================================================================= */}
      {editingDesk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Edit Desk ({editingDesk.deskCode})
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Modify desk details & stationed employee</p>
                </div>
              </div>
              <button
                onClick={() => setEditingDesk(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDesk} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Desk Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingDesk.deskCode}
                    onChange={(e) => setEditingDesk({ ...editingDesk, deskCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Airport Code
                  </label>
                  <select
                    value={editingDesk.airportCode}
                    onChange={(e) =>
                      setEditingDesk({
                        ...editingDesk,
                        airportCode: e.target.value,
                        airportName:
                          e.target.value === 'HIA'
                            ? 'Hamad International Airport'
                            : 'Doha International Airport',
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="HIA">HIA (Hamad International)</option>
                    <option value="DIA">DIA (Doha International)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Desk Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingDesk.deskName}
                  onChange={(e) => setEditingDesk({ ...editingDesk, deskName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Stationed Employee Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Stationed Employee (sitting at counter):
                </label>
                <select
                  value={editingDesk.assignedEmployeeId}
                  onChange={(e) => {
                    const emp = employees.find((x) => x.id === e.target.value);
                    setEditingDesk({
                      ...editingDesk,
                      assignedEmployeeId: e.target.value,
                      assignedEmployeeName: emp ? emp.name : 'Unassigned',
                      assignedEmployeeRole: emp ? emp.role : 'Transit Desk Agent',
                    });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value="">-- No Staff Assigned / Counter Closed --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role}) - Base Salary: {emp.baseSalaryMonthlyQAR} QAR
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Terminal
                  </label>
                  <input
                    type="text"
                    value={editingDesk.terminal}
                    onChange={(e) => setEditingDesk({ ...editingDesk, terminal: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Concourse / Zone
                  </label>
                  <input
                    type="text"
                    value={editingDesk.zone}
                    onChange={(e) => setEditingDesk({ ...editingDesk, zone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Daily Sales Target (QAR)
                  </label>
                  <input
                    type="number"
                    value={editingDesk.dailyTargetQAR || 0}
                    onChange={(e) => setEditingDesk({ ...editingDesk, dailyTargetQAR: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Drawer Cash (QAR)
                  </label>
                  <input
                    type="number"
                    value={editingDesk.currentDrawerCashQAR || 0}
                    onChange={(e) => setEditingDesk({ ...editingDesk, currentDrawerCashQAR: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={editingDesk.status}
                    onChange={(e) => setEditingDesk({ ...editingDesk, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Closing Soon">Closing Soon</option>
                    <option value="Offline">Offline</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Ext
                  </label>
                  <input
                    type="text"
                    value={editingDesk.phoneExt}
                    onChange={(e) => setEditingDesk({ ...editingDesk, phoneExt: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDesk(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW AIRPORT DESK ("airport desk add kora jabe")                */}
      {/* ========================================================================= */}
      {showAddDeskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Add New Agent Desk Counter
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Provision new point of sale / hotel partner desk</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDeskModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDesk} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Airport Code *
                  </label>
                  <select
                    value={newAirportCode}
                    onChange={(e) => {
                      setNewAirportCode(e.target.value);
                      setNewAirportName(
                        e.target.value === 'HIA'
                          ? 'Hamad International Airport'
                          : 'Doha International Airport'
                      );
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                  >
                    <option value="HIA">Hamad Int’l Airport (HIA)</option>
                    <option value="DIA">Doha Int’l Airport (DIA)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Desk Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeskCode}
                    onChange={(e) => setNewDeskCode(e.target.value)}
                    placeholder="e.g. HIA-CTR-05"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Desk Name *
                </label>
                <input
                  type="text"
                  required
                  value={newDeskName}
                  onChange={(e) => setNewDeskName(e.target.value)}
                  placeholder="e.g. North Concourse Luxury Lounge Desk"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Stationed Staff Member */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assign Stationed Employee (Counter Staff)
                </label>
                <select
                  value={newAssignedEmployeeId}
                  onChange={(e) => setNewAssignedEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="">-- Leave Unassigned for Now --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role}) - Base Salary: {emp.baseSalaryMonthlyQAR} QAR
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Terminal
                  </label>
                  <input
                    type="text"
                    value={newTerminal}
                    onChange={(e) => setNewTerminal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Concourse / Zone
                  </label>
                  <input
                    type="text"
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Daily Sales Target (QAR)
                  </label>
                  <input
                    type="number"
                    value={newDailyTargetQAR}
                    onChange={(e) => setNewDailyTargetQAR(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Initial Drawer Cash (QAR)
                  </label>
                  <input
                    type="number"
                    value={newDrawerCashQAR}
                    onChange={(e) => setNewDrawerCashQAR(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={newOperatingHours}
                    onChange={(e) => setNewOperatingHours(e.target.value)}
                    placeholder="e.g. 24/7 or 06:00 - 23:00"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Ext
                  </label>
                  <input
                    type="text"
                    value={newPhoneExt}
                    onChange={(e) => setNewPhoneExt(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDeskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Create Agent Desk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AgentDeskPOSView = AirportDeskPOSView;
export default AirportDeskPOSView;
