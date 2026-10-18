import React, { useState, useMemo } from 'react';
import {
  Compass,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Clock,
  MapPin,
  Tag,
  CheckCircle2,
  Trash2,
  Edit3,
  Store,
  DollarSign,
  AlertCircle,
  X,
  Layers,
  Sparkles,
  FolderPlus,
  FolderOpen,
  LayoutGrid,
  List,
  Globe,
  Star,
  Users,
  Calendar,
  Image as ImageIcon,
  Car,
  Plane,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TourPackage, ServiceMainType } from '../../types';
import { DEFAULT_SERVICE_TYPE_CATEGORIES, getServiceTypeForCategory } from '../../data/mockData';

export const ServicesManagementView: React.FC = () => {
  const {
    packages,
    packageCategories,
    categoryServiceMap,
    addPackage,
    updatePackage,
    deletePackage,
    addPackageCategory,
    deletePackageCategory,
    currentRole,
    roleConfig,
    language,
    convertAmount,
    setActiveTab,
  } = useApp();

  const isSuperAdmin = currentRole === 'super-admin';

  // Primary Service Type Filter ('All' | 'Tour Service' | 'Tour Package' | 'Transfer Service')
  const [selectedMainType, setSelectedMainType] = useState<'All' | ServiceMainType>('All');
  // Secondary Sub-Category Filter ('All' or specific category name)
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [layoutMode, setLayoutMode] = useState<'card' | 'list'>('card');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryServiceType, setNewCategoryServiceType] = useState<ServiceMainType>('Tour Service');
  const [categoryModalError, setCategoryModalError] = useState<string | null>(null);
  const [categoryModalSuccess, setCategoryModalSuccess] = useState<string | null>(null);

  // Inline Category Add inside Add Package Modal
  const [showInlineAddCategory, setShowInlineAddCategory] = useState<boolean>(false);
  const [inlineCategoryInput, setInlineCategoryInput] = useState<string>('');

  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceMainType>('Tour Service');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [category, setCategory] = useState<string>('Desert Safari');
  const [duration, setDuration] = useState('4 Hours');
  const [priceQAR, setPriceQAR] = useState<number>(450);
  const [pickupLocation, setPickupLocation] = useState('Hamad Int’l Airport (HIA) Arrivals Bay 4');
  const [inclusionsInput, setInclusionsInput] = useState('4x4 Land Cruiser, Licensed Safari Guide, Refreshments');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');

  // Rich Website Sync Form State
  const [image, setImage] = useState('');
  const [badge, setBadge] = useState('');
  const [groupSize, setGroupSize] = useState('1 - 10 Guests');
  const [departure, setDeparture] = useState('Daily departures');
  const [rating, setRating] = useState<number>(4.9);
  const [reviewCount, setReviewCount] = useState<number>(150);
  const [isMultiDay, setIsMultiDay] = useState<boolean>(false);
  const [days, setDays] = useState<number>(3);
  const [nights, setNights] = useState<number>(2);
  const [highlightsInput, setHighlightsInput] = useState('');
  const [excludedInput, setExcludedInput] = useState('');
  const [isFeatured, setIsFeatured] = useState<boolean>(true);

  // Helper to determine service type for a package
  const getPkgServiceType = (pkg: TourPackage): ServiceMainType => {
    return pkg.serviceType || categoryServiceMap[pkg.category] || getServiceTypeForCategory(pkg.category, pkg.isMultiDay);
  };

  // Helper to determine service type for a category name
  const getCategoryServiceType = (catName: string): ServiceMainType => {
    return categoryServiceMap[catName] || getServiceTypeForCategory(catName);
  };

  // Group categories by Service Type
  const categoriesByType = useMemo(() => {
    const map: Record<ServiceMainType, string[]> = {
      'Tour Service': [],
      'Tour Package': [],
      'Transfer Service': [],
    };

    // First seed defaults
    (Object.keys(DEFAULT_SERVICE_TYPE_CATEGORIES) as ServiceMainType[]).forEach((type) => {
      DEFAULT_SERVICE_TYPE_CATEGORIES[type].forEach((c) => {
        if (!map[type].includes(c)) map[type].push(c);
      });
    });

    // Then add any dynamic categories from packageCategories
    packageCategories.forEach((cat) => {
      if (!cat || cat.toLowerCase() === 'all') return;
      const type = getCategoryServiceType(cat);
      if (map[type] && !map[type].includes(cat)) {
        map[type].push(cat);
      }
    });

    return map;
  }, [packageCategories, categoryServiceMap]);

  // Total counts per service type
  const typeCounts = useMemo(() => {
    const counts: Record<'All' | ServiceMainType, number> = {
      All: packages.length,
      'Tour Service': 0,
      'Tour Package': 0,
      'Transfer Service': 0,
    };
    packages.forEach((p) => {
      const type = getPkgServiceType(p);
      if (type in counts) counts[type]++;
    });
    return counts;
  }, [packages, categoryServiceMap]);

  // Filtered packages by Main Service Type & Sub-Category
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const pkgType = getPkgServiceType(pkg);
      if (selectedMainType !== 'All' && pkgType !== selectedMainType) {
        return false;
      }
      if (activeCategory !== 'All' && pkg.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [packages, selectedMainType, activeCategory, categoryServiceMap]);

  const handleSelectMainType = (type: 'All' | ServiceMainType) => {
    setSelectedMainType(type);
    setActiveCategory('All');
  };

  const handleOpenAddModal = (presetType?: ServiceMainType) => {
    if (!isSuperAdmin) {
      setErrorMessage(
        language === 'ar'
          ? 'عذراً: فقط المدير العام (Super Admin) يملك صلاحية إضافة وتعديل باقات الخدمات.'
          : 'Access Denied: Only Super Admin (Sheikh Nasser Al-Thani) has permission to add or modify tour services.'
      );
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const initialType = presetType || (selectedMainType !== 'All' ? selectedMainType : 'Tour Service');
    setSelectedServiceType(initialType);
    setEditingPkgId(null);
    setName('');
    setNameAr('');

    if (initialType === 'Tour Package') {
      setCategory('Holiday Package');
      setDuration('3 Days / 2 Nights');
      setPriceQAR(1450);
      setPickupLocation('Hamad International Airport (Arrivals & Departures)');
      setInclusionsInput('5-Star Hotel Stay, Private Chauffeur, Inland Sea Safari, Daily Breakfast');
      setDescription('Comprehensive multi-day Qatar experience combining luxury accommodation and guided excursions.');
      setDescriptionAr('باقة متكاملة لعدة أيام تجمع بين الإقامة الفندقية الفاخرة وسفاري الصحراء.');
      setIsMultiDay(true);
      setDays(3);
      setNights(2);
      setHighlightsInput('Day 1: Airport VIP reception & Doha orientation\nDay 2: Full-day desert safari & Inland Sea\nDay 3: The Pearl yacht cruise & VIP airport departure');
      setExcludedInput('International Airfare, Personal Shopping');
    } else if (initialType === 'Transfer Service') {
      setCategory('Airport Transit');
      setDuration('Point-to-Point / 2 Hours');
      setPriceQAR(280);
      setPickupLocation('Hamad Int’l Airport (HIA) Arrivals Bay 4');
      setInclusionsInput('Mercedes-Benz / AC Chauffeur, Meet & Greet, Bottled Water, Wi-Fi');
      setDescription('Punctual, luxury airport and city chauffeur transfer with dedicated driver.');
      setDescriptionAr('خدمة نقل ترانزيت واستقبال كبار الشخصيات بمطار حمد الدولي بسيارات فاخرة.');
      setIsMultiDay(false);
      setDays(1);
      setNights(0);
      setHighlightsInput('');
      setExcludedInput('Overtime beyond 60 minutes');
    } else {
      setCategory('Desert Safari');
      setDuration('4 Hours');
      setPriceQAR(450);
      setPickupLocation('Hamad Int’l Airport (HIA) Arrivals Bay 4');
      setInclusionsInput('4x4 Land Cruiser, Licensed Tour Guide, Mineral Water & Karak');
      setDescription('Exclusive guided tour tailored for Qatar travelers and transit guests.');
      setDescriptionAr('جولة سياحية بإشراف مرشدين معتمدين خصيصاً لمسافري الدوحة وترانزيت مطار حمد.');
      setIsMultiDay(false);
      setDays(1);
      setNights(0);
      setHighlightsInput('');
      setExcludedInput('Personal Expenses');
    }

    setImage('https://artrusttravel.com/wp-content/uploads/2026/01/Half-Day-City-Tour-With-Dhow-Boat-Cruise-Adventure-1000x1000.jpg');
    setBadge('Popular Choice');
    setGroupSize('1 - 10 Guests');
    setDeparture('Daily departures');
    setRating(4.9);
    setReviewCount(120);
    setIsFeatured(true);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (pkg: TourPackage) => {
    if (!isSuperAdmin) {
      setErrorMessage(
        language === 'ar'
          ? 'عذراً: تعديل الخدمات محصور بالمدير العام فقط.'
          : 'Access Denied: Modifying services is restricted to Super Admin.'
      );
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    const type = getPkgServiceType(pkg);
    setSelectedServiceType(type);
    setEditingPkgId(pkg.id);
    setName(pkg.name);
    setNameAr(pkg.nameAr);
    setCategory(pkg.category);
    setDuration(pkg.duration);
    setPriceQAR(pkg.priceQAR);
    setPickupLocation(pkg.pickupLocation);
    setInclusionsInput(pkg.includes.join(', '));
    setDescription(pkg.description);
    setDescriptionAr(pkg.descriptionAr);
    setImage(pkg.image || '');
    setBadge(pkg.badge || '');
    setGroupSize(pkg.groupSize || '1 - 10 Guests');
    setDeparture(pkg.departure || 'Daily departures');
    setRating(pkg.rating ?? 4.9);
    setReviewCount(pkg.reviewCount ?? 120);
    setIsMultiDay(Boolean(pkg.isMultiDay || type === 'Tour Package' || pkg.category === 'Holiday Package'));
    setDays(pkg.days || 3);
    setNights(pkg.nights || 2);
    setHighlightsInput((pkg.highlights || []).join('\n'));
    setExcludedInput((pkg.excluded || []).join(', '));
    setIsFeatured(pkg.isFeatured !== false);
    setShowAddModal(true);
  };

  const handleDelete = (id: string, pkgName: string) => {
    if (!isSuperAdmin) {
      setErrorMessage('Access Denied: Only Super Admin can delete services.');
      setTimeout(() => setErrorMessage(null), 3500);
      return;
    }
    if (window.confirm(`Are you sure you want to remove "${pkgName}" from the tour catalog?`)) {
      const res = deletePackage(id);
      if (res.success) {
        setSuccessMessage(`Package "${pkgName}" successfully deleted.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.error || 'Failed to delete package.');
        setTimeout(() => setErrorMessage(null), 3500);
      }
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const res = addPackageCategory(newCategoryName, newCategoryServiceType);
    if (res.success) {
      setCategoryModalSuccess(`Category "${newCategoryName.trim()}" created under ${newCategoryServiceType}!`);
      setNewCategoryName('');
      setTimeout(() => setCategoryModalSuccess(null), 3000);
    } else {
      setCategoryModalError(res.error || 'Failed to add category.');
      setTimeout(() => setCategoryModalError(null), 3500);
    }
  };

  const handleDeleteCategory = (catName: string) => {
    if (!isSuperAdmin) {
      setCategoryModalError('Access Denied: Only Super Admin can delete tour categories.');
      setTimeout(() => setCategoryModalError(null), 3500);
      return;
    }
    const res = deletePackageCategory(catName);
    if (res.success) {
      setCategoryModalSuccess(`Category "${catName}" removed.`);
      if (activeCategory === catName) setActiveCategory('All');
      setTimeout(() => setCategoryModalSuccess(null), 3000);
    } else {
      setCategoryModalError(res.error || 'Failed to remove category.');
      setTimeout(() => setCategoryModalError(null), 3500);
    }
  };

  const handleInlineAddCategory = () => {
    if (!inlineCategoryInput.trim()) return;
    const res = addPackageCategory(inlineCategoryInput, selectedServiceType);
    if (res.success) {
      setCategory(inlineCategoryInput.trim());
      setInlineCategoryInput('');
      setShowInlineAddCategory(false);
      setSuccessMessage(`Category "${inlineCategoryInput.trim()}" created under ${selectedServiceType}!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(res.error || 'Failed to create category.');
      setTimeout(() => setErrorMessage(null), 3500);
    }
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const includesArray = inclusionsInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const highlightsArray = highlightsInput
      .split('\n')
      .map((h) => h.trim())
      .filter(Boolean);

    const excludedArray = excludedInput
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    const payload = {
      name,
      nameAr: nameAr || name,
      serviceType: selectedServiceType,
      category,
      duration,
      priceQAR: Number(priceQAR),
      pickupLocation,
      includes: includesArray,
      description,
      descriptionAr: descriptionAr || description,
      image: image.trim() || undefined,
      badge: badge.trim() || undefined,
      groupSize: groupSize.trim() || undefined,
      departure: departure.trim() || undefined,
      rating: Number(rating) || 4.9,
      reviewCount: Number(reviewCount) || 120,
      isMultiDay: Boolean(isMultiDay || selectedServiceType === 'Tour Package'),
      days: isMultiDay || selectedServiceType === 'Tour Package' ? Number(days) : undefined,
      nights: isMultiDay || selectedServiceType === 'Tour Package' ? Number(nights) : undefined,
      highlights: highlightsArray.length > 0 ? highlightsArray : undefined,
      excluded: excludedArray.length > 0 ? excludedArray : undefined,
      isFeatured,
      showOnWebsite: true,
    };

    if (editingPkgId) {
      // Update existing
      const res = updatePackage(editingPkgId, payload);

      if (res.success) {
        setSuccessMessage(`Service "${name}" updated successfully & synced with website!`);
        setShowAddModal(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(res.error || 'Update failed.');
      }
    } else {
      // Add new
      const res = addPackage(payload);

      if (res.success) {
        setSuccessMessage(`New tour service "${name}" created and synced with website & POS!`);
        setShowAddModal(false);
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        setErrorMessage(res.error || 'Creation failed.');
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Module Header & Permissions Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'إدارة باقات وخدمات الرحلات' : 'Tour Packages & Services Catalog'}</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {packages.length} Active
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'باقات سياحية معتمدة من قطر للسياحة، مع تحويل العملات وتعيين مواقع الالتقاء بمطار حمد'
                  : 'Qatar Tourism accredited packages, live multi-currency pricing & HIA arrivals dispatch slots'}
              </p>
            </div>
          </div>
        </div>

        {/* Super Admin Action Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAddModal()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isSuperAdmin
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-98 cursor-pointer'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
            title={
              isSuperAdmin
                ? 'Add a new tour package / service'
                : 'Restricted: Only Super Admin can add new tour services'
            }
          >
            {isSuperAdmin ? (
              <>
                <Plus className="w-4 h-4" />
                <span>{language === 'ar' ? '+ إضافة خدمة / باقة جديدة' : '+ Add New Tour Service'}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-500" />
                <span>{language === 'ar' ? 'إضافة خدمة (صلاحية Super Admin)' : '+ Add Service (Super Admin Only)'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Role Security Scope Notification */}
      {isSuperAdmin ? (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">Super Admin Privilege Verified: </span>
              <span>
                You are logged in as <strong className="font-semibold">{roleConfig.userDisplayName}</strong>. You have exclusive authority to create new services, configure pricing rules, and delete catalog items.
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
            SERVICE CREATOR AUTHORIZED
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Catalog Read-Only Mode: </span>
              <span>
                Service creation and price adjustments are restricted strictly to <strong>Super Admin</strong>. Your current role is <strong>{roleConfig.title}</strong> ({roleConfig.userDisplayName}).
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold shrink-0">
            RESTRICTED
          </span>
        </div>
      )}

      {/* Toasts / Flash Alerts */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 3. Primary Service Type Classification Tabs & Filter Management */}
      <div className="space-y-3">
        {/* Top-Level: Main Service Type Classification Tabs */}
        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              {
                type: 'All' as const,
                label: language === 'ar' ? 'جميع الخدمات والباقات' : 'All Catalog Items',
                icon: Layers,
                count: typeCounts.All,
                activeClass: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm',
                badgeClass: 'bg-slate-800 dark:bg-slate-200 text-slate-200 dark:text-slate-800',
              },
              {
                type: 'Tour Service' as const,
                label: language === 'ar' ? 'خدمات الجولات والسفاري' : 'Tour Services',
                icon: Compass,
                count: typeCounts['Tour Service'],
                activeClass: 'bg-blue-600 text-white shadow-sm shadow-blue-500/20',
                badgeClass: 'bg-blue-700 text-white',
              },
              {
                type: 'Tour Package' as const,
                label: language === 'ar' ? 'باقات الإقامة المتعددة الأيام' : 'Tour Packages',
                icon: Sparkles,
                count: typeCounts['Tour Package'],
                activeClass: 'bg-amber-600 text-white shadow-sm shadow-amber-500/20',
                badgeClass: 'bg-amber-700 text-white',
              },
              {
                type: 'Transfer Service' as const,
                label: language === 'ar' ? 'خدمات النقل والترانزيت' : 'Transfer Services',
                icon: Car,
                count: typeCounts['Transfer Service'],
                activeClass: 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20',
                badgeClass: 'bg-emerald-700 text-white',
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedMainType === tab.type;
              return (
                <button
                  key={tab.type}
                  onClick={() => handleSelectMainType(tab.type)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? tab.activeClass
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? tab.badgeClass : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action buttons: Categories Modal & Layout Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 cursor-pointer"
              title={language === 'ar' ? 'إدارة وإضافة التصنيفات' : 'Manage & Add Tour Package Categories'}
            >
              <FolderPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{language === 'ar' ? '+ إدارة وإضافة التصنيفات' : '+ Manage Categories'}</span>
            </button>

            {/* Card / List Layout Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
              <button
                type="button"
                onClick={() => setLayoutMode('card')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  layoutMode === 'card'
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
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  layoutMode === 'list'
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
        </div>

        {/* Second Level: Sub-Categories Filter Bar */}
        {selectedMainType === 'All' ? (
          /* When ALL is selected, show grouped sub-category panels */
          <div className="bg-slate-50/70 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تصفية التصنيفات الفرعية:' : 'Sub-Category Filter:'}</span>
                </span>
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === 'All'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {language === 'ar' ? 'عرض الكل' : 'All Categories'} ({packages.length})
                </button>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Showing <strong>{filteredPackages.length}</strong> of {packages.length} services
              </span>
            </div>

            {/* 3 Structured Category Groups */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Tour Services Group */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-blue-700 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تصنيفات جولات وسفاري' : 'Tour Services'}</span>
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                    {typeCounts['Tour Service']} active
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categoriesByType['Tour Service'].map((cat) => {
                    const count = packages.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
                    const isSel = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSel
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/60'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] font-mono opacity-80 font-bold">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tour Packages Group */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-amber-700 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تصنيفات باقات الإقامة' : 'Tour Packages'}</span>
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                    {typeCounts['Tour Package']} active
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categoriesByType['Tour Package'].map((cat) => {
                    const count = packages.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
                    const isSel = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSel
                            ? 'bg-amber-600 text-white font-bold shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/60'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] font-mono opacity-80 font-bold">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transfer Services Group */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-emerald-700 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تصنيفات النقل والترانزيت' : 'Transfer Services'}</span>
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    {typeCounts['Transfer Service']} active
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categoriesByType['Transfer Service'].map((cat) => {
                    const count = packages.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
                    const isSel = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSel
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] font-mono opacity-80 font-bold">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* When a specific Main Type is selected, show focused category pills */
          <div className="bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveCategory('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeCategory === 'All'
                    ? selectedMainType === 'Tour Package'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : selectedMainType === 'Transfer Service'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>All {selectedMainType}s</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-black/20 text-white">
                  {typeCounts[selectedMainType]}
                </span>
              </button>

              {(categoriesByType[selectedMainType] || []).map((cat) => {
                const count = packages.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? selectedMainType === 'Tour Package'
                          ? 'bg-amber-600 text-white shadow-xs font-bold'
                          : selectedMainType === 'Transfer Service'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-black/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap shrink-0">
              Showing <strong>{filteredPackages.length}</strong> of {typeCounts[selectedMainType]} services
            </span>
          </div>
        )}
      </div>

      {/* 4. Packages Grid or List Table */}
      {layoutMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPackages.map((pkg) => {
          const usdPrice = convertAmount(pkg.priceQAR, 'USD');
          const eurPrice = convertAmount(pkg.priceQAR, 'EUR');
          const pkgType = getPkgServiceType(pkg);

          return (
            <div
              key={pkg.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between group overflow-hidden"
            >
              <div>
                {/* Media Image & Badges */}
                {pkg.image ? (
                  <div className="relative -mx-5 -mt-5 mb-4 h-44 overflow-hidden bg-slate-950">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/30" />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs ${
                        pkgType === 'Tour Package'
                          ? 'bg-amber-600'
                          : pkgType === 'Transfer Service'
                          ? 'bg-emerald-600'
                          : 'bg-blue-600'
                      }`}>
                        {pkg.category}
                      </span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-black/60 text-slate-200 backdrop-blur-xs font-mono">
                        {pkgType === 'Tour Package' ? '🏖️ Package' : pkgType === 'Transfer Service' ? '🚗 Transfer' : '🧭 Tour'}
                      </span>
                      {pkg.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-xs">
                          ★ {pkg.badge}
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 shadow-xs">
                        <Globe className="w-2.5 h-2.5" />
                        <span>Website Live</span>
                      </span>
                    </div>
                    {pkg.rating && (
                      <div className="absolute bottom-2 left-2.5 flex items-center gap-1 text-[11px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{pkg.rating.toFixed(1)}</span>
                        {pkg.reviewCount && <span className="text-slate-300 font-normal text-[10px]">({pkg.reviewCount})</span>}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Header & Badges fallback if no image */
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        pkgType === 'Tour Package'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60'
                          : pkgType === 'Transfer Service'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60'
                      }`}>
                        {pkg.category}
                      </span>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        {pkgType === 'Tour Package' ? '🏖️ Package' : pkgType === 'Transfer Service' ? '🚗 Transfer' : '🧭 Tour'}
                      </span>
                      {pkg.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pkg.duration}</span>
                    </div>
                  </div>
                )}

                {/* Meta Bar if image is present */}
                {pkg.image && (
                  <div className="flex items-center justify-between gap-2 text-slate-500 text-[11px] font-mono mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pkg.duration}</span>
                    </div>
                    {pkg.groupSize && (
                      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                        <Users className="w-3 h-3" />
                        <span>{pkg.groupSize}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Title */}
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {pkg.name}
                </h3>
                {pkg.nameAr && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5 font-medium">
                    {pkg.nameAr}
                  </p>
                )}

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {pkg.description}
                </p>

                {/* Location */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{pkg.pickupLocation}</span>
                </div>

                {/* Inclusions Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pkg.includes.map((inc, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                    >
                      ✓ {inc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom: Pricing & Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400 font-mono">QAR</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                      {pkg.priceQAR.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                    ≈ {usdPrice.formatted} | {eurPrice.formatted}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('pos')}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    title="Book in Agent Desk POS"
                  >
                    <Store className="w-4 h-4" />
                  </button>

                  {isSuperAdmin ? (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(pkg)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        title="Edit Service & Website Display"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id, pkg.name)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <span
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400 flex items-center gap-1"
                      title="Modification locked to Super Admin"
                    >
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span>Admin Only</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        /* Packages List / Table View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-4">Service & Media</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Duration & Schedule</th>
                  <th className="py-3.5 px-4 text-right">Price (QAR)</th>
                  <th className="py-3.5 px-4 text-right">FX (USD / EUR)</th>
                  <th className="py-3.5 px-4">Included Highlights</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredPackages.map((pkg) => {
                  const usdPrice = convertAmount(pkg.priceQAR, 'USD');
                  const eurPrice = convertAmount(pkg.priceQAR, 'EUR');
                  const pkgType = getPkgServiceType(pkg);

                  return (
                    <tr
                      key={pkg.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {pkg.image ? (
                            <img
                              src={pkg.image}
                              alt={pkg.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {pkg.name}
                              </span>
                              {pkg.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  {pkg.badge}
                                </span>
                              )}
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 flex items-center gap-0.5">
                                <Globe className="w-2.5 h-2.5" />
                                <span>Website</span>
                              </span>
                            </div>
                            {pkg.nameAr && (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                                {pkg.nameAr}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md font-mono border ${
                            pkgType === 'Tour Package'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60'
                              : pkgType === 'Transfer Service'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60'
                          }`}>
                            {pkgType === 'Tour Package' ? '🏖️ Package' : pkgType === 'Transfer Service' ? '🚗 Transfer' : '🧭 Tour Service'}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {pkg.category}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{pkg.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{pkg.pickupLocation}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {pkg.priceQAR.toLocaleString()} QAR
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        <div>${usdPrice.amount.toFixed(0)} USD</div>
                        <div className="text-[10px]">€{eurPrice.amount.toFixed(0)} EUR</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {pkg.includes.slice(0, 2).map((inc, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[130px]"
                            >
                              {inc}
                            </span>
                          ))}
                          {pkg.includes.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              +{pkg.includes.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveTab('pos');
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs"
                            title="Direct Book at POS"
                          >
                            <Store className="w-3 h-3" />
                            <span>POS</span>
                          </button>

                          {isSuperAdmin ? (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(pkg)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 transition cursor-pointer"
                                title="Edit Service"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDelete(pkg.id, pkg.name)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 transition cursor-pointer"
                                title="Delete Service"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span
                              className="px-1.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-400 flex items-center gap-0.5"
                              title="Modification locked to Super Admin"
                            >
                              <Lock className="w-3 h-3 text-amber-500" />
                            </span>
                          )}
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

      {/* 5. Add / Edit Package Modal (Super Admin Only) */}
      {showAddModal && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingPkgId
                      ? (language === 'ar' ? 'تعديل باقة سياحية' : 'Edit Tour Service Package')
                      : (language === 'ar' ? 'إنشاء باقة سياحية جديدة' : 'Create New Tour Service (Super Admin)')}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Will instantly sync with Agent Desk POS and Unified Bookings Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePackage} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Service Type Classification */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{language === 'ar' ? 'نوع الخدمة الأساسي *' : 'Service Type Classification *'}</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Select catalog category section</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedServiceType('Tour Service');
                      setIsMultiDay(false);
                      const available = categoriesByType['Tour Service'];
                      if (available.length > 0 && !available.includes(category)) {
                        setCategory(available[0]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedServiceType === 'Tour Service'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    <span>Tour Service</span>
                    <span className="text-[9px] font-normal opacity-85">Safaris, Cruises, Tours</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedServiceType('Tour Package');
                      setIsMultiDay(true);
                      const available = categoriesByType['Tour Package'];
                      if (available.length > 0 && !available.includes(category)) {
                        setCategory(available[0]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedServiceType === 'Tour Package'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Tour Package</span>
                    <span className="text-[9px] font-normal opacity-85">Multi-day & Holidays</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedServiceType('Transfer Service');
                      setIsMultiDay(false);
                      const available = categoriesByType['Transfer Service'];
                      if (available.length > 0 && !available.includes(category)) {
                        setCategory(available[0]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedServiceType === 'Transfer Service'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span>Transfer Service</span>
                    <span className="text-[9px] font-normal opacity-85">Airport, VIP, Transit</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Service Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Al Zubarah Fort & North Qatar Safari"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Service Name (Arabic)
                  </label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: جولة قلعة الزبارة وشمال قطر التراثية"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-bold">
                      Category *
                    </label>
                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => setShowInlineAddCategory((prev) => !prev)}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{showInlineAddCategory ? 'Cancel' : '+ New'}</span>
                      </button>
                    )}
                  </div>

                  {showInlineAddCategory && (
                    <div className="mb-2 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 space-y-1.5 animate-in fade-in">
                      <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300">
                        Add under {selectedServiceType}:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={inlineCategoryInput}
                          onChange={(e) => setInlineCategoryInput(e.target.value)}
                          placeholder="e.g. Dhow Marina Cruise"
                          className="flex-1 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleInlineAddCategory}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white font-medium"
                  >
                    <optgroup label={`📁 ${selectedServiceType} Categories`}>
                      {(categoriesByType[selectedServiceType] || []).map((catName) => (
                        <option key={catName} value={catName}>
                          {catName}
                        </option>
                      ))}
                    </optgroup>
                    {packageCategories.filter((catName) => !categoriesByType[selectedServiceType]?.includes(catName)).length > 0 && (
                      <optgroup label="── Other System Categories ──">
                        {packageCategories
                          .filter((catName) => !categoriesByType[selectedServiceType]?.includes(catName))
                          .map((catName) => (
                            <option key={catName} value={catName}>
                              {catName} ({getCategoryServiceType(catName)})
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 4.5 Hours"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Price in QAR *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={50}
                      step={10}
                      value={priceQAR}
                      onChange={(e) => setPriceQAR(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-bold font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[11px]">
                      QAR
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Default Pickup Bay / Airport Location *
                </label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. HIA Arrivals Counter 4 / Pickup Bay 2"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Included Amenities & Perks (comma separated)
                </label>
                <input
                  type="text"
                  value={inclusionsInput}
                  onChange={(e) => setInclusionsInput(e.target.value)}
                  placeholder="e.g. 4x4 Land Cruiser, Licensed Guide, Camel Ride, Bedouin Refreshments"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Detailed Description (English)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide an enticing itinerary overview for transit desk agents and passengers..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Detailed Description (Arabic)
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder="وصف الباقة باللغة العربية لعرضها في الموقع ومكتب الاستقبال..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* ─── PUBLIC WEBSITE & MEDIA INTEGRATION SECTION ─── */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-extrabold text-blue-900 dark:text-blue-300">
                      Public Website Presentation & Sync Settings
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    Live Sync Enabled
                  </span>
                </div>

                {/* Image URL & Thumbnail Preview */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Website Showcase Image URL
                  </label>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://artrusttravel.com/... or https://..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono text-[11px]"
                      />
                      {/* Image Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="text-slate-400">Presets:</span>
                        <button
                          type="button"
                          onClick={() => setImage('https://artrusttravel.com/wp-content/uploads/2026/01/Half-Day-City-Tour-With-Dhow-Boat-Cruise-Adventure-1000x1000.jpg')}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          City Dhow
                        </button>
                        <button
                          type="button"
                          onClick={() => setImage('https://artrusttravel.com/wp-content/uploads/2026/01/Doha-Desert-Safari_-Dune-Bashing-Inland-Sea-Adventure-2-1000x1000.jpg')}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          Desert Safari
                        </button>
                        <button
                          type="button"
                          onClick={() => setImage('https://artrusttravel.com/wp-content/uploads/2026/01/Transit-Doha-City-Tour-Private-Quick-Highlights-with-Airport-Pickup-2-1000x1000.jpg')}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          Transit Pickup
                        </button>
                        <button
                          type="button"
                          onClick={() => setImage('https://artrusttravel.com/wp-content/uploads/2026/01/Qatar-Sunset-Desert-Safari-by-Dune-Buggy-Riding.jpg')}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          Dune Buggy
                        </button>
                        <button
                          type="button"
                          onClick={() => setImage('https://artrusttravel.com/wp-content/uploads/2026/04/Mercedes-Benz-V-Class-1000x1296.png')}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                          Mercedes V-Class
                        </button>
                      </div>
                    </div>
                    {image && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 bg-slate-950 shadow-xs">
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge, Group Size, Departure */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Website Badge Tag
                    </label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="e.g. Popular Choice, Must Experience"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Group Size / Capacity
                    </label>
                    <input
                      type="text"
                      value={groupSize}
                      onChange={(e) => setGroupSize(e.target.value)}
                      placeholder="e.g. 1 - 15 Guests, Up to 6"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Departure Schedule
                    </label>
                    <input
                      type="text"
                      value={departure}
                      onChange={(e) => setDeparture(e.target.value)}
                      placeholder="e.g. Daily at 09:00 AM & 03:00 PM"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Rating & Reviews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Public Star Rating (1.0 - 5.0)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Verified Review Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={reviewCount}
                      onChange={(e) => setReviewCount(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* ─── MULTI-DAY / HOLIDAY PACKAGE ACCORDION ─── */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMultiDay || category === 'Holiday Package'}
                      onChange={(e) => setIsMultiDay(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Multi-Day Holiday Package (Show on Holiday Packages Page)
                    </span>
                  </label>
                </div>

                {(isMultiDay || category === 'Holiday Package') && (
                  <div className="space-y-3 pt-2 border-t border-amber-200/50 dark:border-amber-800/40">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                          Days Count
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={days}
                          onChange={(e) => setDays(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                          Nights Count
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={nights}
                          onChange={(e) => setNights(Number(e.target.value))}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Day-by-Day Highlights (one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={highlightsInput}
                        onChange={(e) => setHighlightsInput(e.target.value)}
                        placeholder="Day 1: Airport VIP arrival & Souq Waqif walk&#10;Day 2: Full-day desert safari with beach BBQ&#10;Day 3: The Pearl yacht cruise & departure"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                        Excluded Items (comma separated)
                      </label>
                      <input
                        type="text"
                        value={excludedInput}
                        onChange={(e) => setExcludedInput(e.target.value)}
                        placeholder="e.g. International Airfare, Personal Shopping, Visa Fees"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/20 active:scale-98"
                >
                  {editingPkgId ? 'Save Changes & Sync Website' : 'Publish Tour Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Manage & Add Categories Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {language === 'ar' ? 'إدارة وتصنيف باقات الرحلات' : 'Manage Tour Package Categories'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar'
                      ? 'إضافة فئات وتصنيفات مخصصة للرحلات والربط مع نظام نقاط البيع'
                      : 'Configure customizable tour categories for catalog filtering and agent desk POS'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setCategoryModalError(null);
                  setCategoryModalSuccess(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role privilege notice */}
            {isSuperAdmin ? (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Super Admin authorized: You can add new tour categories and delete unused ones.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Only Super Admin has permissions to create or delete tour categories.</span>
              </div>
            )}

            {/* In-modal alerts */}
            {categoryModalError && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{categoryModalError}</span>
              </div>
            )}
            {categoryModalSuccess && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{categoryModalSuccess}</span>
              </div>
            )}

            {/* Add Category Form (Only Super Admin can submit) */}
            {isSuperAdmin && (
              <form onSubmit={handleCreateCategory} className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'تعيين نوع الخدمة *' : 'Assign to Service Type *'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Tour Service', 'Tour Package', 'Transfer Service'] as ServiceMainType[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewCategoryServiceType(st)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          newCategoryServiceType === st
                            ? st === 'Tour Package'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : st === 'Transfer Service'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {st === 'Tour Package' ? '🏖️ Package' : st === 'Transfer Service' ? '🚗 Transfer' : '🧭 Tour'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'اسم التصنيف الجديد' : 'New Category Name'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Dhow Marina Cruise, Extreme Dune Bashing, VIP Chauffeur..."
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/30"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'ar' ? 'إضافة' : 'Add Category'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Existing Categories List - Grouped by Service Type */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Active Categories ({packageCategories.length})</span>
                <span>Structured by Type</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {(['Tour Service', 'Tour Package', 'Transfer Service'] as ServiceMainType[]).map((serviceType) => {
                  const typeCats = categoriesByType[serviceType] || [];
                  const badgeColor =
                    serviceType === 'Tour Package'
                      ? 'text-amber-700 dark:text-amber-400 border-amber-200/80 bg-amber-50/70 dark:bg-amber-950/40'
                      : serviceType === 'Transfer Service'
                      ? 'text-emerald-700 dark:text-emerald-400 border-emerald-200/80 bg-emerald-50/70 dark:bg-emerald-950/40'
                      : 'text-blue-700 dark:text-blue-400 border-blue-200/80 bg-blue-50/70 dark:bg-blue-950/40';

                  return (
                    <div key={serviceType} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div className={`px-3 py-2 text-xs font-extrabold flex items-center justify-between border-b border-slate-200 dark:border-slate-800 ${badgeColor}`}>
                        <span className="flex items-center gap-1.5">
                          {serviceType === 'Tour Package' ? <Sparkles className="w-3.5 h-3.5" /> : serviceType === 'Transfer Service' ? <Car className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5" />}
                          <span>{serviceType} Categories</span>
                        </span>
                        <span className="font-mono text-[10px] font-bold">
                          {typeCats.length} categories
                        </span>
                      </div>

                      <div className="p-2 space-y-1 bg-white dark:bg-slate-900">
                        {typeCats.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic px-2 py-1">No categories assigned to {serviceType}.</p>
                        ) : (
                          typeCats.map((catName) => {
                            const pkgCount = packages.filter((p) => p.category.toLowerCase() === catName.toLowerCase()).length;
                            return (
                              <div
                                key={catName}
                                className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                              >
                                <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                                  <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{catName}</span>
                                </div>

                                <div className="flex items-center gap-2.5">
                                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                                    {pkgCount} {pkgCount === 1 ? 'service' : 'services'}
                                  </span>
                                  {isSuperAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCategory(catName)}
                                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                      title={pkgCount > 0 ? `Cannot delete: ${pkgCount} service(s) currently in this category` : 'Delete category'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setCategoryModalError(null);
                  setCategoryModalSuccess(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
