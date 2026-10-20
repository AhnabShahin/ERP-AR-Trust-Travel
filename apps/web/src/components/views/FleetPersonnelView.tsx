import React, { useState } from 'react';
import {
  Compass,
  Car,
  Users,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Printer,
  Send,
  Calendar,
  FileSpreadsheet,
  FileText,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Lock,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  ExternalLink,
  Sparkles,
  PhoneCall,
  ChevronDown,
  LayoutGrid,
  List,
  Briefcase,
  Tag,
  Globe,
  Star,
  Image as ImageIcon,
  RefreshCw,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Driver, FleetVehicle, TourGuide } from '../../types';
import { mercedesVClass } from '../../assets/cars';
import { MoneyInput } from '../common/MoneyInput';
import { ImageUploadField } from '../common/ImageUploadField';
import { imgSrc } from '../../../lib/uploads';

export const FleetPersonnelView: React.FC = () => {
  const {
    drivers,
    addDriver,
    updateDriver,
    deleteDriver,
    updateDriverStatus,
    fleetVehicles,
    addFleetVehicle,
    updateFleetVehicle,
    deleteFleetVehicle,
    syncWebsiteFleet,
    tourGuides,
    bookings,
    currentRole,
    roleConfig,
    language,
    convertAmount,
    currency,
    t,
  } = useApp();

  const canManageFleet = roleConfig.permissions.canManageFleet;

  const [activePersonnelTab, setActivePersonnelTab] = useState<'drivers' | 'vehicles' | 'guides' | 'roster'>('drivers');
  const [selectedPassengerSheet, setSelectedPassengerSheet] = useState<any>(bookings[0] || null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [fleetLayoutMode, setFleetLayoutMode] = useState<'card' | 'list'>('card');

  // Modals & Feedback
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Form State
  const [driverName, setDriverName] = useState('');
  const [driverNameAr, setDriverNameAr] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<string>('4x4 SUV');
  const [phone, setPhone] = useState('+974 ');
  const [location, setLocation] = useState('HIA Terminal Arrivals Bay 3');
  const [status, setStatus] = useState<Driver['status']>('Standby');
  const [currentMission, setCurrentMission] = useState('');
  const [activePassengers, setActivePassengers] = useState<number>(0);

  // ─── VEHICLE FLEET & PUBLIC WEBSITE SYNC STATE ───
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState('ALL');
  const [vehicleLayoutMode, setVehicleLayoutMode] = useState<'card' | 'list'>('card');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<FleetVehicle | null>(null);

  // Vehicle Form State
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleNameAr, setVehicleNameAr] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState<string>('VIP Luxury');
  const [vehiclePassengers, setVehiclePassengers] = useState<number>(7);
  const [vehicleLuggage, setVehicleLuggage] = useState<number>(7);
  const [vehiclePriceQAR, setVehiclePriceQAR] = useState<number>(280);
  const [vehicleRateType, setVehicleRateType] = useState('per airport transfer');
  const [vehicleImage, setVehicleImage] = useState('');
  const [vehicleIdealFor, setVehicleIdealFor] = useState('');
  const [vehicleFeatures, setVehicleFeatures] = useState('');
  const [vehicleAssignedDriverId, setVehicleAssignedDriverId] = useState('');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [vehicleShowOnWebsite, setVehicleShowOnWebsite] = useState(true);

  // Filtered Vehicle Fleet
  const filteredVehicles = fleetVehicles.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
      (v.nameAr && v.nameAr.toLowerCase().includes(vehicleSearchQuery.toLowerCase())) ||
      v.category.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
      v.idealFor.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
      (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(vehicleSearchQuery.toLowerCase())) ||
      (v.plateNumber && v.plateNumber.toLowerCase().includes(vehicleSearchQuery.toLowerCase()));

    const matchesCategory = vehicleCategoryFilter === 'ALL' || v.category === vehicleCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Vehicle Fleet Statistics
  const vipLuxuryCount = fleetVehicles.filter((v) => v.category === 'VIP Luxury' || v.category === 'Executive Sedan').length;
  const safari4x4Count = fleetVehicles.filter((v) => v.category === 'Safari 4x4').length;
  const mpvVanCount = fleetVehicles.filter((v) => v.category === 'Group Van' || v.category === 'Family MPV').length;
  const coachBusCount = fleetVehicles.filter((v) => v.category === 'Coaster Bus' || v.category === 'Luxury Coach').length;

  // Filtered Drivers
  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || d.vehicleType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Fleet Statistics
  const atAirportCount = drivers.filter((d) => d.status === 'At Airport Bay').length;
  const dispatchedCount = drivers.filter((d) => d.status === 'Dispatched' || d.status === 'En Route').length;
  const standbyCount = drivers.filter((d) => d.status === 'Standby').length;
  const maintenanceCount = drivers.filter((d) => d.status === 'Maintenance' || d.status === 'Off Duty').length;
  const activeUtilization = drivers.length > 0 ? Math.round(((atAirportCount + dispatchedCount) / drivers.length) * 100) : 0;

  const handleOpenAddModal = () => {
    if (!canManageFleet) {
      setFeedbackError(
        language === 'ar'
          ? 'عذراً: فقط مدير العمليات أو المدير العام يملك صلاحية إضافة مركبات وسائقين للأسطول.'
          : 'Access Denied: Only Operations Manager or Super Admin can register fleet vehicles.'
      );
      setTimeout(() => setFeedbackError(null), 3500);
      return;
    }
    setEditingDriver(null);
    setDriverName('');
    setDriverNameAr('');
    setVehicleModel('Toyota Land Cruiser 300 VXR');
    setPlateNumber('QA ');
    setVehicleType('4x4 SUV');
    setPhone('+974 55');
    setLocation('Hamad International Airport Bay 4');
    setStatus('Standby');
    setCurrentMission('Available for HIA airport transit pickups');
    setActivePassengers(0);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (d: Driver) => {
    if (!canManageFleet) {
      setFeedbackError('Access Denied: Modifying fleet vehicles is restricted to Operations Manager & Super Admin.');
      setTimeout(() => setFeedbackError(null), 3500);
      return;
    }
    setEditingDriver(d);
    setDriverName(d.name);
    setDriverNameAr(d.nameAr);
    setVehicleModel(d.vehicle);
    setPlateNumber(d.plateNumber);
    setVehicleType(d.vehicleType);
    setPhone(d.phone);
    setLocation(d.location);
    setStatus(d.status);
    setCurrentMission(d.currentMission || '');
    setActivePassengers(d.activePassengers || 0);
    setShowAddModal(true);
  };

  const handleDeleteDriver = (d: Driver) => {
    if (!canManageFleet) {
      setFeedbackError('Access Denied: Only Operations Manager or Super Admin can decommission fleet vehicles.');
      setTimeout(() => setFeedbackError(null), 3500);
      return;
    }
    if (window.confirm(`Are you sure you want to decommission vehicle ${d.vehicle} (${d.plateNumber}) driven by ${d.name}?`)) {
      const res = deleteDriver(d.id);
      if (res.success) {
        setFeedbackSuccess(`Vehicle ${d.vehicle} (${d.plateNumber}) successfully decommissioned.`);
        setTimeout(() => setFeedbackSuccess(null), 3000);
      } else {
        setFeedbackError(res.error || 'Failed to remove driver.');
        setTimeout(() => setFeedbackError(null), 3500);
      }
    }
  };

  // ─── FLEET VEHICLE HANDLERS ───
  const handleOpenAddVehicleModal = () => {
    if (!canManageFleet) {
      setFeedbackError(
        language === 'ar'
          ? 'عذراً: فقط مدير العمليات أو المدير العام يملك صلاحية إضافة وتعديل مركبات الأسطول.'
          : 'Access Denied: Only Operations Manager or Super Admin can register fleet vehicles.'
      );
      setTimeout(() => setFeedbackError(null), 3500);
      return;
    }
    setEditingVehicle(null);
    setVehicleName('');
    setVehicleNameAr('');
    setVehicleCategory('VIP Luxury');
    setVehiclePassengers(7);
    setVehicleLuggage(7);
    setVehiclePriceQAR(280);
    setVehicleRateType('per airport transfer');
    setVehicleImage('https://artrusttravel.com/wp-content/uploads/2026/04/Mercedes-Benz-V-Class-1000x1296.png');
    setVehicleIdealFor('Executive VIPs, Diplomats & Luxury Family Transit');
    setVehicleFeatures('Leather Captain Seats, High-Speed Wi-Fi, Evian Water, Chauffeur in Formal Attire, Curbside Greeting');
    setVehicleAssignedDriverId('');
    setVehiclePlateNumber('QA ');
    setVehicleShowOnWebsite(true);
    setShowVehicleModal(true);
  };

  const handleSyncWebsiteFleet = () => {
    const res = syncWebsiteFleet();
    if (res.success) {
      setFeedbackSuccess(
        language === 'ar'
          ? `تم استيراد ومزامنة ${res.count} مركبة بنجاح مع أسطول الموقع والعمليات الميدانية!`
          : `Successfully imported & synchronized ${res.count} fleet vehicles with public website catalog & field operations!`
      );
      setTimeout(() => setFeedbackSuccess(null), 4500);
    } else {
      setFeedbackError(res.error || 'Failed to sync with website fleet.');
      setTimeout(() => setFeedbackError(null), 4000);
    }
  };

  const handleOpenEditVehicleModal = (v: FleetVehicle) => {
    if (!canManageFleet) {
      setFeedbackError('Access Denied: Modifying fleet vehicles is restricted to Operations Manager & Super Admin.');
      setTimeout(() => setFeedbackError(null), 3500);
      return;
    }
    setEditingVehicle(v);
    setVehicleName(v.name);
    setVehicleNameAr(v.nameAr || '');
    setVehicleCategory(v.category);
    setVehiclePassengers(v.passengers);
    setVehicleLuggage(v.luggage);
    setVehiclePriceQAR(v.priceQAR);
    setVehicleRateType(v.rateType);
    setVehicleImage(v.image);
    setVehicleIdealFor(v.idealFor);
    setVehicleFeatures(v.features ? v.features.join(', ') : '');
    setVehicleAssignedDriverId(v.assignedDriverId || '');
    setVehiclePlateNumber(v.plateNumber || '');
    setVehicleShowOnWebsite(v.showOnWebsite !== false);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = (v: FleetVehicle) => {
    if (!canManageFleet) {
      setFeedbackError('Access Denied: Only Operations Manager or Super Admin can remove fleet vehicles.');
      setTimeout(() => setFeedbackError(null), 3500);
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${v.name} from public fleet and system?`)) {
      const res = deleteFleetVehicle(v.id);
      if (res.success) {
        setFeedbackSuccess(`Vehicle "${v.name}" removed from website fleet.`);
        setTimeout(() => setFeedbackSuccess(null), 3000);
      } else {
        setFeedbackError(res.error || 'Failed to delete vehicle.');
        setTimeout(() => setFeedbackError(null), 3500);
      }
    }
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleName.trim() || !vehiclePriceQAR) {
      setFeedbackError('Please enter a valid vehicle name and QAR price.');
      return;
    }

    const assignedDrv = drivers.find((d) => d.id === vehicleAssignedDriverId);
    const parsedFeatures = vehicleFeatures
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload: Omit<FleetVehicle, 'id'> = {
      name: vehicleName.trim(),
      nameAr: vehicleNameAr.trim() || undefined,
      category: vehicleCategory as any,
      passengers: Number(vehiclePassengers) || 4,
      luggage: Number(vehicleLuggage) || 3,
      priceQAR: Number(vehiclePriceQAR) || 150,
      rateType: vehicleRateType.trim() || 'per transfer',
      image: vehicleImage.trim() || 'https://artrusttravel.com/wp-content/uploads/2026/04/Mercedes-Benz-V-Class-1000x1296.png',
      idealFor: vehicleIdealFor.trim() || 'Private Doha Airport & Hotel Transfers',
      features: parsedFeatures.length > 0 ? parsedFeatures : ['Chauffeur in Formal Attire', 'Air Conditioned', 'Hamad Airport Meet & Greet'],
      assignedDriverId: assignedDrv ? assignedDrv.id : undefined,
      assignedDriverName: assignedDrv ? assignedDrv.name : undefined,
      plateNumber: vehiclePlateNumber.trim() || (assignedDrv ? assignedDrv.plateNumber : undefined),
      showOnWebsite: vehicleShowOnWebsite,
    };

    if (editingVehicle) {
      const res = updateFleetVehicle(editingVehicle.id, payload);
      if (res.success) {
        setFeedbackSuccess(`Fleet vehicle "${vehicleName}" updated & synced with public website!`);
        setShowVehicleModal(false);
        setTimeout(() => setFeedbackSuccess(null), 3500);
      } else {
        setFeedbackError(res.error || 'Failed to update vehicle.');
      }
    } else {
      const res = addFleetVehicle(payload);
      if (res.success) {
        setFeedbackSuccess(`New vehicle "${vehicleName}" registered & published to public website!`);
        setShowVehicleModal(false);
        setTimeout(() => setFeedbackSuccess(null), 3500);
      } else {
        setFeedbackError(res.error || 'Failed to register vehicle.');
      }
    }
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName.trim() || !vehicleModel.trim() || !plateNumber.trim()) {
      setFeedbackError('Please complete all required fields.');
      return;
    }

    if (editingDriver) {
      const res = updateDriver(editingDriver.id, {
        name: driverName.trim(),
        nameAr: driverNameAr.trim() || driverName.trim(),
        vehicle: vehicleModel.trim(),
        plateNumber: plateNumber.trim(),
        vehicleType,
        phone: phone.trim(),
        location: location.trim(),
        status,
        currentMission: currentMission.trim(),
        activePassengers: Number(activePassengers),
      });

      if (res.success) {
        setFeedbackSuccess(`Vehicle and chauffeur "${driverName}" updated successfully.`);
        setShowAddModal(false);
        setTimeout(() => setFeedbackSuccess(null), 3000);
      } else {
        setFeedbackError(res.error || 'Update failed.');
      }
    } else {
      const res = addDriver({
        name: driverName.trim(),
        nameAr: driverNameAr.trim() || driverName.trim(),
        vehicle: vehicleModel.trim(),
        plateNumber: plateNumber.trim(),
        vehicleType,
        phone: phone.trim(),
        location: location.trim(),
        status,
        currentMission: currentMission.trim(),
        activePassengers: Number(activePassengers),
        totalTripsToday: 0,
        rating: 5.0,
      });

      if (res.success) {
        setFeedbackSuccess(`New fleet vehicle "${vehicleModel}" (${plateNumber}) registered with chauffeur ${driverName}!`);
        setShowAddModal(false);
        setTimeout(() => setFeedbackSuccess(null), 3500);
      } else {
        setFeedbackError(res.error || 'Registration failed.');
      }
    }
  };

  const getStatusBadgeClass = (st: Driver['status']) => {
    switch (st) {
      case 'At Airport Bay':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
      case 'Dispatched':
      case 'En Route':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'Standby':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
      case 'Maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      case 'Off Duty':
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* 1. Top Banner & Primary Action */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'إدارة الأسطول الميداني والكوادر وتوزيع المهام' : 'Fleet & Field Personnel Scheduling & Duty Roster'}</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {drivers.length} Vehicles
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar'
                  ? 'أسطول الدفع الرباعي 4x4، ليموزينات VIP، حافلات الكوستر، المرشدين المرخصين، وقسائم الركاب'
                  : '4x4 Land Cruiser convoys, VIP luxury limousines, licensed multilingual tour guides & passenger manifests'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sub Tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs">
            <button
              onClick={() => setActivePersonnelTab('drivers')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activePersonnelTab === 'drivers'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Chauffeurs & Dispatch ({drivers.length})
            </button>
            <button
              onClick={() => setActivePersonnelTab('vehicles')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activePersonnelTab === 'vehicles'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-emerald-500" />
              <span>Vehicle Fleet & Website Sync ({fleetVehicles.length})</span>
            </button>
            <button
              onClick={() => setActivePersonnelTab('guides')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activePersonnelTab === 'guides'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Tour Guides ({tourGuides.length})
            </button>
            <button
              onClick={() => setActivePersonnelTab('roster')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activePersonnelTab === 'roster'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Passenger Slips
            </button>
          </div>

          {/* 1-Click Sync & Import Website Fleet Catalog */}
          <button
            onClick={handleSyncWebsiteFleet}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110 text-white text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
            title="Import and synchronize all 12 vehicles & field operations with website catalog"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>
              {language === 'ar' ? 'مزامنة أسطول الموقع (12 مركبة)' : 'Sync Website Fleet (12 Models)'}
            </span>
          </button>

          {/* Primary Action Button (Contextual for Drivers vs Vehicles) */}
          <button
            onClick={activePersonnelTab === 'vehicles' ? handleOpenAddVehicleModal : handleOpenAddModal}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm ${
              canManageFleet
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 active:scale-98 cursor-pointer'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
            title={canManageFleet ? (activePersonnelTab === 'vehicles' ? 'Add new vehicle to fleet & public website' : 'Register new chauffeur driver') : 'Restricted: Operations Manager or Super Admin only'}
          >
            {canManageFleet ? (
              <>
                <Plus className="w-4 h-4" />
                <Car className="w-3.5 h-3.5" />
                <span>
                  {activePersonnelTab === 'vehicles'
                    ? (language === 'ar' ? '+ إضافة مركبة للأسطول والموقع' : '+ Add Fleet Vehicle')
                    : (language === 'ar' ? '+ إضافة سائق ميداني' : '+ Add Chauffeur Driver')}
                </span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'ar' ? 'إضافة أسطول (للمدراء)' : '+ Add Fleet (Restricted)'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Feedback Toasts */}
      {feedbackError && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}
      {feedbackSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* 3. Sub Tab 1: Chauffeur Fleet Operations */}
      {activePersonnelTab === 'drivers' && (
        <div className="space-y-4">
          {/* Fleet Operational Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Vehicles</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{drivers.length} Units</div>
              <span className="text-[10px] text-slate-500">100% Accredited</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block">At Airport Bay</span>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">{atAirportCount} Staged</div>
              <span className="text-[10px] text-slate-500">Terminal 1 & Al Maha</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">Dispatched / En Route</span>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{dispatchedCount} Active</div>
              <span className="text-[10px] text-slate-500">On Highway & Dunes</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 block">Standby Ready</span>
              <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">{standbyCount} Units</div>
              <span className="text-[10px] text-slate-500">Depot Reserve</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">Fleet Utilization</span>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{activeUtilization}%</div>
              <span className="text-[10px] text-slate-500">{maintenanceCount} Maintenance/Off</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chauffeur, vehicle model, QA plate, location..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="ALL">All Statuses ({drivers.length})</option>
                <option value="At Airport Bay">At Airport Bay</option>
                <option value="Dispatched">Dispatched</option>
                <option value="En Route">En Route</option>
                <option value="Standby">Standby</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Off Duty">Off Duty</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="ALL">All Vehicle Types</option>
                <option value="4x4 SUV">4x4 SUV</option>
                <option value="VIP Van">VIP Van</option>
                <option value="Luxury Sedan">Luxury Sedan</option>
                <option value="Mini Bus">Mini Bus</option>
                <option value="Luxury Limousine">Luxury Limousine</option>
                <option value="Coaster Bus">Coaster Bus</option>
              </select>

              {/* Card / List Layout Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setFleetLayoutMode('card')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    fleetLayoutMode === 'card'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFleetLayoutMode('list')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    fleetLayoutMode === 'list'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="List Table View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Fleet Cards Grid vs List Table View */}
          {fleetLayoutMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 hover:shadow-md transition-shadow relative group"
              >
                {/* Header: Driver Name & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                        {d.name}
                      </h4>
                      {d.nameAr && (
                        <span className="text-[11px] text-slate-400 font-medium block">
                          {d.nameAr}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for Authorized Users */}
                  {canManageFleet && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(d)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit fleet vehicle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDriver(d)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Decommission vehicle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Vehicle Specs & Qatar Plate Badge */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {d.vehicle}
                    </div>
                    {/* Authentic Qatar Plate pill */}
                    <div className="flex items-center rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs shrink-0">
                      <span className="bg-rose-900 text-white text-[9px] font-bold px-1.5 py-0.5">QATAR</span>
                      <span className="text-slate-900 dark:text-white font-mono font-bold text-[10px] px-1.5 py-0.5">
                        {d.plateNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                      {d.vehicleType}
                    </span>
                    <a
                      href={`tel:${d.phone}`}
                      className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{d.phone}</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate">{d.location}</span>
                  </div>
                </div>

                {/* Mission Status */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Duty Assignment:</span>
                    <span className="font-mono text-slate-500 text-[10px]">
                      ★ {d.rating} ({d.totalTripsToday} trips)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-2 rounded-xl">
                    {d.currentMission || 'Awaiting dispatch assignment from operations desk.'}
                  </p>
                </div>

                {/* Status Switcher & Action */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    {canManageFleet ? (
                      <div className="relative">
                        <select
                          value={d.status}
                          onChange={(e) => updateDriverStatus(d.id, e.target.value as any)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer appearance-none pr-5 ${getStatusBadgeClass(
                            d.status
                          )}`}
                        >
                          <option value="At Airport Bay">At Airport Bay</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="En Route">En Route</option>
                          <option value="Standby">Standby</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Off Duty">Off Duty</option>
                        </select>
                        <ChevronDown className="w-2.5 h-2.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    ) : (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatusBadgeClass(d.status)}`}>
                        {d.status}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">
                    {d.activePassengers ? `${d.activePassengers} Pax aboard` : 'Empty / Staged'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fleet Chauffeurs & Vehicles List / Table View ("list view te dekha jay ei option ta add koro") */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    <th className="py-3.5 px-4">Chauffeur & Rating</th>
                    <th className="py-3.5 px-4">Vehicle Specs</th>
                    <th className="py-3.5 px-4">Qatar Plate & Type</th>
                    <th className="py-3.5 px-4">Current Bay / Location</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Trips Today</th>
                    <th className="py-3.5 px-4">Current Mission</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredDrivers.map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {d.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {d.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ★ {d.rating} · {d.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {d.vehicle}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                          {d.plateNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {d.vehicleType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate max-w-[150px]">{d.location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadgeClass(d.status)}`}>
                          {d.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {d.totalTripsToday}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                        {d.currentMission || 'Available on standby'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(d)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
                            title="Edit Vehicle & Chauffeur"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDriver(d)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 transition"
                            title="Decommission Vehicle"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* ─── NEW SUB TAB: VEHICLE FLEET & PUBLIC WEBSITE SYNC ─── */}
      {activePersonnelTab === 'vehicles' && (
        <div className="space-y-4">
          {/* Fleet Composition Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Fleet Models</span>
              <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{fleetVehicles.length} Vehicles</div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Synced with Website</span>
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 block">VIP Luxury & Sedans</span>
              <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5">{vipLuxuryCount} Models</div>
              <span className="text-[10px] text-slate-500">V-Class, B70, K5, Changan</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">Safari 4x4 SUVs</span>
              <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">{safari4x4Count} Models</div>
              <span className="text-[10px] text-slate-500">Land Cruiser VXR/GR</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block">Family MPVs & Vans</span>
              <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">{mpvVanCount} Models</div>
              <span className="text-[10px] text-slate-500">Staria, Carnival, Veloz, etc.</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">Buses & Coaches</span>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{coachBusCount} Models</div>
              <span className="text-[10px] text-slate-500">Coaster (22) & Coach (35)</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vehicleSearchQuery}
                onChange={(e) => setVehicleSearchQuery(e.target.value)}
                placeholder="Search vehicle model, category, chauffeur, plate..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                <span>Category:</span>
              </div>
              <select
                value={vehicleCategoryFilter}
                onChange={(e) => setVehicleCategoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="ALL">All Categories ({fleetVehicles.length})</option>
                <option value="VIP Luxury">VIP Luxury</option>
                <option value="Safari 4x4">Safari 4x4</option>
                <option value="Executive Sedan">Executive Sedan</option>
                <option value="Group Van">Group Van</option>
                <option value="Family MPV">Family MPV</option>
                <option value="Coaster Bus">Coaster Bus</option>
                <option value="Luxury Coach">Luxury Coach</option>
              </select>

              {/* Card / List Layout Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setVehicleLayoutMode('card')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    vehicleLayoutMode === 'card'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleLayoutMode('list')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    vehicleLayoutMode === 'list'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="List Table View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">List</span>
                </button>
              </div>

              {/* Sync with Website Fleet Button */}
              <button
                type="button"
                onClick={handleSyncWebsiteFleet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold transition cursor-pointer shrink-0"
                title="Import & synchronize all 12 vehicles with website catalog"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync with Website ({fleetVehicles.length})</span>
              </button>
            </div>
          </div>

          {/* Cards Grid vs List View */}
          {vehicleLayoutMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVehicles.map((v) => {
                const assignedDriver = drivers.find((d) => d.id === v.assignedDriverId);
                return (
                  <div
                    key={v.id}
                    className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image & Header Overlay */}
                      <div className="relative h-48 bg-slate-900 overflow-hidden">
                        <img
                          src={imgSrc(v.image)}
                          alt={v.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = mercedesVClass;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#05161D]/80 backdrop-blur-md text-amber-400 border border-amber-400/20 shadow-xs">
                            {v.category}
                          </span>
                          {v.showOnWebsite !== false ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-xs flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5" />
                              <span>Live on Website</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 shadow-xs">
                              Hidden
                            </span>
                          )}
                        </div>

                        {/* Price Badge on Top Right */}
                        <div className="absolute top-3 right-3 text-right">
                          <div className="bg-emerald-600/95 backdrop-blur-md text-white font-extrabold text-xs px-2.5 py-1 rounded-xl shadow-md">
                            {convertAmount(v.priceQAR).formatted}
                          </div>
                          <span className="text-[9px] font-bold text-slate-300 block drop-shadow-sm mt-0.5">
                            {v.rateType}
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {v.name}
                          </h3>
                          {v.nameAr && (
                            <p className="text-[11px] text-slate-400 font-medium">
                              {v.nameAr}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {v.idealFor}
                          </p>
                        </div>

                        {/* Passenger & Luggage Specs */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            <span>{v.passengers} Pax</span>
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                            <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                            <span>{v.luggage} Bags</span>
                          </span>
                          {v.plateNumber && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono">
                              {v.plateNumber}
                            </span>
                          )}
                        </div>

                        {/* Features Tags */}
                        {v.features && v.features.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {v.features.slice(0, 3).map((feat, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                              >
                                {feat}
                              </span>
                            ))}
                            {v.features.length > 3 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400">
                                +{v.features.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Assigned Driver Box */}
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                              {assignedDriver ? assignedDriver.name.charAt(0) : '—'}
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                Assigned Chauffeur
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                {assignedDriver ? assignedDriver.name : v.assignedDriverName || 'Pool Standby (Unassigned)'}
                              </span>
                            </div>
                          </div>
                          {assignedDriver && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                              {assignedDriver.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditVehicleModal(v)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Edit Vehicle & Pricing</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVehicle(v)}
                        className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove vehicle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List Table View */
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="py-3 px-4">Vehicle Model</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Capacity</th>
                      <th className="py-3 px-4">Price (QAR)</th>
                      <th className="py-3 px-4">Assigned Chauffeur</th>
                      <th className="py-3 px-4">Website Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredVehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={imgSrc(v.image)}
                              alt={v.name}
                              className="w-12 h-10 object-contain rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{v.name}</span>
                              <span className="text-[11px] text-slate-400">{v.idealFor}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {v.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {v.passengers} Pax · {v.luggage} Bags
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {convertAmount(v.priceQAR).formatted}
                          <span className="text-[10px] text-slate-400 block font-normal">{v.rateType}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-800 dark:text-slate-200 font-bold">
                            {v.assignedDriverName || 'Pool Standby'}
                          </span>
                          {v.plateNumber && (
                            <span className="text-[10px] text-slate-400 block font-mono">{v.plateNumber}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {v.showOnWebsite !== false ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              Hidden
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditVehicleModal(v)}
                              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                              title="Edit Vehicle"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVehicle(v)}
                              className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Vehicle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* 4. Sub Tab 3: Licensed Tour Guides */}
      {activePersonnelTab === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tourGuides.map((g) => (
            <div
              key={g.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">{g.name}</span>
                  {g.nameAr && <span className="text-[10px] text-slate-400">{g.nameAr}</span>}
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {g.status}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                <div className="text-slate-700 dark:text-slate-300 font-bold">{g.specialty}</div>
                <div className="text-[11px] text-slate-500">
                  Languages: <span className="font-medium text-slate-700 dark:text-slate-200">{g.languages.join(', ')}</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  Accrued Commission: {convertAmount(g.totalCommissionQAR).formatted} (★ {g.rating})
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                Phone: {g.phone} · Tours Today: {g.toursLedToday}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Sub Tab 3: Printable Passenger Information Sheet */}
      {activePersonnelTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Reservation to Print Information Slip
            </span>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 text-xs">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedPassengerSheet(b)}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    selectedPassengerSheet?.id === b.id
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>{b.passengerName}</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{b.pnr}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{b.packageName}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Passenger Information Slip Preview */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">OFFICIAL PASSENGER MANIFEST SLIP</span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Hamad International Airport Pickup Voucher #{selectedPassengerSheet?.pnr || 'N/A'}
                </h3>
              </div>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
            </div>

            {selectedPassengerSheet && (
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 space-y-3 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Lead Passenger</span>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                      {selectedPassengerSheet.passengerName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {selectedPassengerSheet.paxCount} Travelers · {selectedPassengerSheet.nationality}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Flight & Meeting Point</span>
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                      {selectedPassengerSheet.flightNumber} ({selectedPassengerSheet.arrivalTime})
                    </div>
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Terminal Meeting Bay: {selectedPassengerSheet.pickupBay}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase">Assigned Chauffeur & Escort</span>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {selectedPassengerSheet.driverName} — {selectedPassengerSheet.driverVehicle}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Chauffeur Direct Contact: {selectedPassengerSheet.driverPhone}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-bold">Special Operational Notes: </span>
                  {selectedPassengerSheet.notes || 'No special requests.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Register / Edit Fleet Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingDriver
                      ? language === 'ar' ? 'تعديل بيانات المركبة والسائق' : 'Edit Fleet Vehicle & Chauffeur'
                      : language === 'ar' ? 'تسجيل مركبة وسائق جديد في الأسطول' : 'Register New Fleet Vehicle & Chauffeur'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar'
                      ? 'إضافة سيارة جديدة لأسطول النقل السياحي بمطار حمد الدولي ومطابقتها مع المهام'
                      : 'Deploy vehicle to Hamad Airport staging bays, desert safari convoys, and VIP transfers'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveDriver} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Chauffeur / Driver Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Mansoor Al-Hajri"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Chauffeur Name (Arabic)
                  </label>
                  <input
                    type="text"
                    value={driverNameAr}
                    onChange={(e) => setDriverNameAr(e.target.value)}
                    placeholder="مثال: منصور الهاجري"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Vehicle Model & Make *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Toyota Land Cruiser 300 VXR"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Qatar Plate Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="e.g. QA 84920"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="4x4 SUV">4x4 SUV (Land Cruiser/Patrol)</option>
                    <option value="VIP Van">VIP Van (Staria/V-Class)</option>
                    <option value="Luxury Sedan">Luxury Sedan (Lexus/S-Class)</option>
                    <option value="Mini Bus">Mini Bus (HiAce)</option>
                    <option value="Luxury Limousine">Luxury Limousine (Escalade/Maybach)</option>
                    <option value="Coaster Bus">Coaster Bus (22 Pax)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Direct Mobile / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+974 5512 8899"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Current Staging Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. HIA Terminal Arrivals Bay 3"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Initial Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Standby">Standby (Ready at Depot)</option>
                    <option value="At Airport Bay">At Airport Bay (Terminal 1)</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="En Route">En Route</option>
                    <option value="Maintenance">Under Maintenance</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Assigned Mission / Duty Description
                </label>
                <textarea
                  rows={2}
                  value={currentMission}
                  onChange={(e) => setCurrentMission(e.target.value)}
                  placeholder="e.g. Staged at HIA Arrivals Bay 3 for Qatar Airways QR 138 transit transfers..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingDriver ? 'Save Fleet Updates' : 'Add Vehicle to Fleet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 7. MODAL: ADD / EDIT FLEET VEHICLE & WEBSITE SYNC ─── */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {editingVehicle ? 'Edit Fleet Vehicle & Website Sync' : 'Add New Vehicle to Fleet'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Changes here immediately sync with public /fleet, booking calendar, and homepage
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVehicleModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Vehicle Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleName}
                    onChange={(e) => setVehicleName(e.target.value)}
                    placeholder="e.g. Mercedes-Benz V-Class"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Vehicle Name (Arabic)
                  </label>
                  <input
                    type="text"
                    value={vehicleNameAr}
                    onChange={(e) => setVehicleNameAr(e.target.value)}
                    placeholder="مثال: مرسيدس بنز الفئة V"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-medium text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Fleet Category *
                  </label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="VIP Luxury">VIP Luxury</option>
                    <option value="Safari 4x4">Safari 4x4</option>
                    <option value="Executive Sedan">Executive Sedan</option>
                    <option value="Group Van">Group Van</option>
                    <option value="Family MPV">Family MPV</option>
                    <option value="Coaster Bus">Coaster Bus</option>
                    <option value="Luxury Coach">Luxury Coach</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Transfer Rate ({currency}) *
                  </label>
                  <MoneyInput
                    valueQAR={vehiclePriceQAR}
                    onChangeQAR={setVehiclePriceQAR}
                    required
                    min={1}
                    placeholder="280"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Rate Type Label
                  </label>
                  <input
                    type="text"
                    value={vehicleRateType}
                    onChange={(e) => setVehicleRateType(e.target.value)}
                    placeholder="per airport transfer"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Passenger Capacity (Seats) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={vehiclePassengers}
                    onChange={(e) => setVehiclePassengers(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Luggage Capacity (Pieces) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={vehicleLuggage}
                    onChange={(e) => setVehicleLuggage(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Vehicle Photo upload */}
              <ImageUploadField
                value={vehicleImage}
                onChange={(ref) => setVehicleImage(ref || '')}
                variant="default"
                label="Vehicle Photo"
                hint="Upload a PNG / JPG / WebP. Auto-optimized and stored securely."
              />

              {/* Ideal For tagline */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Ideal For / Recommended Usage
                </label>
                <input
                  type="text"
                  value={vehicleIdealFor}
                  onChange={(e) => setVehicleIdealFor(e.target.value)}
                  placeholder="e.g. Executive VIPs, Diplomats & Luxury Family Transit"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Vehicle Features (comma-separated) */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center justify-between">
                  <span>Vehicle Key Features</span>
                  <span className="text-[10px] text-slate-400">Separate with commas</span>
                </label>
                <input
                  type="text"
                  value={vehicleFeatures}
                  onChange={(e) => setVehicleFeatures(e.target.value)}
                  placeholder="Leather Captain Seats, High-Speed Wi-Fi, Evian Water, Curbside Greeting"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Link to Chauffeur Driver & QA Plate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Assigned Primary Chauffeur
                  </label>
                  <select
                    value={vehicleAssignedDriverId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      setVehicleAssignedDriverId(selId);
                      const d = drivers.find((drv) => drv.id === selId);
                      if (d) {
                        setVehiclePlateNumber(d.plateNumber);
                      }
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="">Pool Reserve (Unassigned)</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.vehicle} ({d.plateNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Qatar License Plate Number
                  </label>
                  <input
                    type="text"
                    value={vehiclePlateNumber}
                    onChange={(e) => setVehiclePlateNumber(e.target.value)}
                    placeholder="e.g. QA 51294"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Publish on Website Toggle */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="showOnWebsiteToggle"
                  checked={vehicleShowOnWebsite}
                  onChange={(e) => setVehicleShowOnWebsite(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="showOnWebsiteToggle"
                  className="text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Publish and show on Public Website (/fleet, booking engine, search)
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingVehicle ? 'Update Vehicle & Sync Website' : 'Publish to Website & Fleet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
