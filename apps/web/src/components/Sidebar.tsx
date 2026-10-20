import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  Store,
  Compass,
  Receipt,
  BadgePercent,
  Coins,
  Settings,
  ShieldCheck,
  FileText,
  UserCheck,
  Users,
  ChevronDown,
  Building2,
  Sparkles,
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ChevronLeft,
  KeyRound,
  LogOut,
  FolderKanban,
  Layers,
  Briefcase,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { imgSrc } from '../../lib/uploads';
import { BrandLogo } from './common/BrandLogo';
import { getRoleDashboardSlug } from '../utils/roleSlugs';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    openModal,
    roleConfig,
    currentRole,
    currentUser,
    logout,
    language,
    expenses,
    hotelVendors,
    hotelBookings,
    sidebarOpen,
    toggleSidebar,
    t,
  } = useApp();

  const isRtl = language === 'ar';
  const pendingExpensesCount = expenses.filter((e) => e.status === 'Pending Review').length;

  const getDashboardNavLabel = () => {
    if (language === 'ar') {
      switch (currentRole) {
        case 'super-admin':
          return 'لوحة التحكم الإدارية العامة';
        case 'customer':
          return 'لوحة تحكم المسافر والعميل';
        case 'vendor-partner':
          return 'لوحة شريك الفنادق';
        case 'operations-manager':
          return 'لوحة إدارة العمليات';
        case 'transit-agent':
          return 'لوحة كاونتر المطار والترانزيت';
        case 'driver-guide':
          return 'لوحة السائق والمرشد الميداني';
        case 'finance-accountant':
          return 'لوحة الحسابات والمالية';
        default:
          return t('dashboard');
      }
    }
    switch (currentRole) {
      case 'super-admin':
        return 'Executive Super Admin';
      case 'customer':
        return 'Customer Dashboard';
      case 'vendor-partner':
        return 'Hotel Partner Dashboard';
      case 'operations-manager':
        return 'Operations Dashboard';
      case 'transit-agent':
        return 'Transit Desk Dashboard';
      case 'driver-guide':
        return 'Driver & Chauffeur Dashboard';
      case 'finance-accountant':
        return 'Finance Dashboard';
      default:
        return t('dashboard');
    }
  };

  // Count hotel bookings specifically for the active or logged-in vendor partner
  const vendorHotelBookingsCount = useMemo(() => {
    const vId = currentUser?.vendorId === 'h-marsa' ? 'h-marsamalaz' : currentUser?.vendorId;
    if (vId) {
      return hotelBookings.filter(
        (b) => b.hotelId === vId || b.hotelName.toLowerCase().includes(vId.replace('h-', ''))
      ).length;
    }
    return hotelBookings.length;
  }, [hotelBookings, currentUser]);

  // Collapsed categories state (keys are category IDs)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  interface SidebarNavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    badge?: string;
    alert?: boolean;
  }

  interface SidebarCategory {
    id: string;
    title: string;
    titleAr: string;
    icon: React.ComponentType<{ className?: string }>;
    items: SidebarNavItem[];
  }

  // Structured Category-Wise Navigation Configuration
  const categories: SidebarCategory[] = [
    {
      id: 'overview',
      title: 'Main & Overview',
      titleAr: 'الرئيسية والمؤشرات',
      icon: LayoutDashboard,
      items: [
        {
          id: 'dashboard',
          label: getDashboardNavLabel(),
          icon: LayoutDashboard,
          badge: currentRole === 'super-admin' ? '/dashboard' : getRoleDashboardSlug(currentRole),
        },
        {
          id: 'my-account',
          label: language === 'ar' ? 'حسابي وبياناتي الشخصية' : 'My Account & Profile',
          icon: UserCheck,
          badge: currentUser?.isEmailVerified ? 'Verified' : 'Verify Email',
          alert: !currentUser?.isEmailVerified,
        },
      ],
    },
    {
      id: 'hospitality',
      title: 'Bookings & Hospitality',
      titleAr: 'الحجوزات والضيافة والفنادق',
      icon: Building2,
      items: [
        {
          id: 'vendor-portal',
          label: language === 'ar' ? 'بوابة وإحصائيات الفندق الشريك' : 'Hotel Partner Console & Bookings',
          icon: Building2,
          count: vendorHotelBookingsCount,
          badge: currentRole === 'vendor-partner' ? 'My Hotel' : 'Partner',
        },
        {
          id: 'bookings',
          label: language === 'ar' ? 'حجوزات المنظومة الموحدة' : 'Unified Bookings Engine',
          icon: CalendarCheck2,
          count: 8,
        },
        {
          id: 'hotel-bookings',
          label: language === 'ar' ? 'منظومة حجز الفنادق' : 'Hotel Booking System',
          icon: Building2,
          count: hotelBookings.length,
          badge: 'Qatar',
        },
        {
          id: 'vendors',
          label: language === 'ar' ? 'فنادق وشركاء قطر (Vendors)' : 'Hotel Vendors & Partners',
          icon: Building2,
          count: hotelVendors.length,
          badge: '5★',
        },
        {
          id: 'pos',
          label: language === 'ar' ? 'نقطة بيع مكاتب الوكلاء' : 'Agent Desk POS',
          icon: Store,
          badge: 'Agent',
        },
        {
          id: 'guests',
          label: language === 'ar' ? 'لوحة العملاء والمسافرين (Customers)' : 'Customer & Guest Dashboard',
          icon: UserCheck,
          count: 7,
          badge: 'Customers',
        },
      ],
    },
    {
      id: 'operations',
      title: 'Field Operations & Fleet',
      titleAr: 'العمليات الميدانية والأسطول',
      icon: Compass,
      items: [
        {
          id: 'dispatch',
          label: language === 'ar' ? 'توجيه الأسطول والكوادر' : 'Fleet & Field Ops',
          icon: Compass,
          count: 28,
        },
        {
          id: 'services',
          label: language === 'ar' ? 'باقات وخدمات الرحلات' : 'Tour Services & Packages',
          icon: Sparkles,
          badge: currentRole === 'super-admin' ? 'Admin' : undefined,
        },
        {
          id: 'driver-portal',
          label: language === 'ar' ? 'لوحة مهام السائق' : 'Driver Mission Console',
          icon: Compass,
          badge: 'Driver',
        },
      ],
    },
    {
      id: 'workforce',
      title: 'HR & Counters',
      titleAr: 'الكوادر البشرية والكاونترات',
      icon: Users,
      items: [
        {
          id: 'employees',
          label: language === 'ar' ? 'الموظفون' : 'Staff',
          icon: Users,
          badge: 'Staff',
        },
        {
          id: 'payroll',
          label: language === 'ar' ? 'الرواتب والعمولات' : 'Salaries & Commissions',
          icon: BadgePercent,
        },
      ],
    },
    {
      id: 'finance',
      title: 'Finance & Treasury',
      titleAr: 'المالية والخزينة والمطابقة',
      icon: DollarSign,
      items: [
        {
          id: 'eod',
          label: t('eod'),
          icon: Receipt,
          alert: true,
        },
        {
          id: 'expenses',
          label: language === 'ar' ? 'مصروفات الشركة واعتماداتها' : 'Company Expenses & Approvals',
          icon: DollarSign,
          count: pendingExpensesCount > 0 ? pendingExpensesCount : undefined,
          badge: pendingExpensesCount > 0 ? `${pendingExpensesCount} Review` : undefined,
          alert: pendingExpensesCount > 0,
        },
        {
          id: 'ledger',
          label: language === 'ar' ? 'الخزينة متعددة العملات' : 'Multi-Currency Treasury',
          icon: Coins,
        },
        {
          id: 'reports',
          label: language === 'ar' ? 'التقارير والأرباح (P&L)' : 'Financial Reports & P&L',
          icon: FileText,
          badge: '68% Margin',
        },
      ],
    },
    {
      id: 'admin',
      title: 'Administration & Security',
      titleAr: 'إدارة المنظومة والأمان',
      icon: ShieldCheck,
      items: [
        {
          id: 'accounts',
          label: language === 'ar' ? 'حسابات الدخول وكلمات المرور' : 'Accounts & Passwords (Admin)',
          icon: KeyRound,
          badge: currentRole === 'super-admin' ? 'Admin' : undefined,
        },
        {
          id: 'audit-logs',
          label: language === 'ar' ? 'سجلات النظام والمراقبة' : 'System Logs & Audit',
          icon: ShieldCheck,
        },
        {
          id: 'settings',
          label: t('settings'),
          icon: Settings,
        },
      ],
    },
  ];

  // Helper to determine if an item is permitted for current role
  const isItemAllowed = (itemId: string) => {
    // Hotel Vendor & Partner should only access their dedicated Partner Dashboard & My Account (no Booking & Hospitality features)
    if (currentRole === 'vendor-partner') {
      return itemId === 'dashboard' || itemId === 'my-account';
    }
    if (itemId === 'my-account') return true;
    return (
      roleConfig.allowedTabs.includes(itemId) ||
      ((currentRole === 'super-admin' || currentRole === 'admin' || currentRole === 'operations-manager') &&
        (itemId === 'reports' ||
          itemId === 'audit-logs' ||
          itemId === 'services' ||
          itemId === 'employees' ||
          itemId === 'guests' ||
          itemId === 'expenses' ||
          itemId === 'vendors' ||
          itemId === 'hotel-bookings' ||
          itemId === 'vendor-portal' ||
          itemId === 'accounts'))
    );
  };

  // Filter categories to only include permitted items, and exclude empty categories
  const visibleCategories = categories
    .filter((cat) => {
      // Hotel vendor & partner dashboard should not have the Booking & Hospitality category
      if (currentRole === 'vendor-partner' && cat.id === 'hospitality') {
        return false;
      }
      return true;
    })
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => isItemAllowed(item.id)),
    }))
    .filter((cat) => cat.items.length > 0);

  // Helper for role initials in compact mode
  const getRoleInitials = () => {
    switch (currentRole) {
      case 'super-admin':
        return 'SA';
      case 'operations-manager':
        return 'OM';
      case 'transit-agent':
        return 'TA';
      case 'driver-guide':
        return 'DG';
      case 'finance-accountant':
        return 'FA';
      default:
        return 'AR';
    }
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'dashboard') {
      const slug = getRoleDashboardSlug(currentRole);
      if (typeof window !== 'undefined' && window.location.pathname !== slug) {
        window.history.pushState(null, '', slug);
      }
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`shrink-0 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out select-none z-40 h-screen max-h-screen overflow-hidden overscroll-contain max-md:fixed max-md:inset-y-0 max-md:left-0 rtl:max-md:left-auto rtl:max-md:right-0 max-md:shadow-2xl md:relative md:z-20 ${
          sidebarOpen ? 'w-72 max-md:translate-x-0' : 'w-[72px] max-md:-translate-x-full md:translate-x-0'
        }`}
      >
        {/* -------------------- EXPANDED SIDEBAR (sidebarOpen = true) -------------------- */}
        {sidebarOpen ? (
          <>
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Brand Header with Logo and Collapse Toggle */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                <div className="flex items-center justify-between">
                  <BrandLogo size="md" variant="full" tone="auto" />
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isRtl ? 'تصغير إلى لوحة أيقونات' : 'Collapse to icon rail panel'}
                    aria-label="Collapse sidebar"
                  >
                    <PanelLeftClose className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Current Role Indicator Pill */}
                <div className="mt-3.5 flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div className="truncate">
                      <span className="font-extrabold text-[11px] block text-slate-900 dark:text-white truncate">
                        {roleConfig.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        {roleConfig.userDisplayName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold shrink-0">
                    ACTIVE
                  </span>
                </div>
              </div>

              {/* Navigation Links - Category Wise Grouping */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-4 overscroll-contain">
                {visibleCategories.map((category, catIdx) => {
                  const isCollapsed = collapsedCategories[category.id];
                  const hasActiveItem = category.items.some((i) => i.id === activeTab);

                  return (
                    <div key={category.id} className="space-y-1">
                      {/* Category Section Header */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between px-2.5 py-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              hasActiveItem ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400'
                            }`}
                          />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider truncate">
                            {isRtl ? category.titleAr : category.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.2 rounded-md">
                            {category.items.length}
                          </span>
                          <ChevronDown
                            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                              isCollapsed ? (isRtl ? 'rotate-90' : '-rotate-90') : 'rotate-0'
                            }`}
                          />
                        </div>
                      </button>

                      {/* Category Navigation Items */}
                      {!isCollapsed && (
                        <div className="space-y-0.5 pt-0.5">
                          {category.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                              <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                title={item.label}
                                aria-label={item.label}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                                  isActive
                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate min-w-0">
                                  <Icon
                                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'
                                    }`}
                                  />
                                  <span className="truncate">{item.label}</span>
                                </div>

                                {/* Badges */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {item.badge && (
                                    <span
                                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                        isActive
                                          ? 'bg-blue-500/80 text-white'
                                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40'
                                      }`}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                  {item.count && (
                                    <span
                                      className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full ${
                                        isActive
                                          ? 'bg-blue-700 text-white'
                                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                      }`}
                                    >
                                      {item.count}
                                    </span>
                                  )}
                                  {item.alert && (
                                    <span
                                      className={`w-2 h-2 rounded-full ${
                                        isActive ? 'bg-amber-300' : 'bg-amber-500 animate-pulse'
                                      }`}
                                      title="Action Pending"
                                    />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Subtle divider between categories (except last) */}
                      {catIdx < visibleCategories.length - 1 && (
                        <div className="pt-2 border-b border-slate-100 dark:border-slate-800/60" />
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* User Account & Logout Card in Expanded Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 shrink-0">
              <div
                onClick={() => setActiveTab('my-account')}
                className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-slate-800/90 transition cursor-pointer group"
                title={isRtl ? 'عرض وتعديل حسابي الشخصي' : 'View & Edit My Account Profile'}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={imgSrc(currentUser?.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={currentUser?.name || 'User'}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    {currentUser?.isEmailVerified && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" title="Email Verified" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white text-xs block truncate leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {currentUser?.name || roleConfig.userDisplayName}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-bold block truncate">
                        @{currentUser?.username || 'user'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono truncate">
                        ({currentRole})
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer shrink-0"
                  title={isRtl ? 'تسجيل الخروج' : 'Sign Out / Lock Console'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  AR Trust Travel · QTA DMC Lic. #QA-7819
                </p>
              </div>
            </div>
          </>
        ) : (
          /* -------------------- COLLAPSED ICON RAIL PANEL (sidebarOpen = false) -------------------- */
          <>
            <div className="flex-1 flex flex-col items-center min-h-0">
              {/* Compact Header with Emblem and Expand Toggle */}
              <div className="w-full py-3 px-2 border-b border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-2 shrink-0">
                <button
                  onClick={toggleSidebar}
                  className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-200/60 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors shadow-xs group cursor-pointer"
                  title={isRtl ? 'توسيع القائمة الجانبية الكاملة' : 'Expand full sidebar'}
                  aria-label="Expand sidebar"
                >
                  <span className="font-extrabold font-mono text-xs tracking-tighter text-blue-700 dark:text-blue-300 group-hover:scale-105 transition-transform">
                    AR
                  </span>
                </button>

                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isRtl ? 'توسيع القائمة' : 'Expand Sidebar'}
                >
                  {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              {/* Navigation Icons Stack - Grouped with Category Dividers */}
              <nav className="flex-1 w-full overflow-y-auto py-2.5 px-2 flex flex-col items-center gap-1 overscroll-contain">
                {visibleCategories.map((category, catIdx) => (
                  <React.Fragment key={category.id}>
                    {/* Items inside category */}
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;

                      return (
                        <div key={item.id} className="relative group/tooltip flex justify-center w-full">
                          <button
                            onClick={() => setActiveTab(item.id)}
                            title={`${item.label} ${item.badge ? `[${item.badge}]` : ''}`}
                            aria-label={item.label}
                            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-400/40'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <Icon
                              className={`w-4.5 h-4.5 transition-transform group-hover/tooltip:scale-110 ${
                                isActive ? 'text-white' : ''
                              }`}
                            />

                            {/* Pending alert pulse dot */}
                            {item.alert && (
                              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                            )}

                            {/* Item count badge indicator */}
                            {item.count && !item.alert && (
                              <span className="absolute -top-1 -right-1 px-1 py-0.2 min-w-3.5 text-[8px] font-mono font-bold rounded-full bg-blue-600 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs flex items-center justify-center">
                                {item.count}
                              </span>
                            )}

                            {/* Small badge dot if badge is present */}
                            {item.badge && !item.count && !item.alert && (
                              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                            )}
                          </button>

                          {/* Floating Hover Tooltip Flyout with Category Context */}
                          <div
                            className={`absolute top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white text-xs font-medium rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all duration-150 z-50 whitespace-nowrap border border-slate-700/80 flex flex-col gap-0.5 ${
                              isRtl
                                ? 'right-full mr-2.5 shadow-[-4px_0_15px_rgba(0,0,0,0.3)]'
                                : 'left-full ml-2.5 shadow-[4px_0_15px_rgba(0,0,0,0.3)]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30">
                                  {item.badge}
                                </span>
                              )}
                              {item.count && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-700 text-slate-200">
                                  {item.count}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-mono text-slate-400">
                              {isRtl ? category.titleAr : category.title}
                            </span>

                            {/* Pointer triangle */}
                            <div
                              className={`absolute top-1/2 -translate-y-1/2 border-4 border-transparent ${
                                isRtl
                                  ? 'left-full border-l-slate-900/95 dark:border-l-slate-800/95'
                                  : 'right-full border-r-slate-900/95 dark:border-r-slate-800/95'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* Category Divider in Rail */}
                    {catIdx < visibleCategories.length - 1 && (
                      <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800 my-1 rounded-full shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </div>

            {/* Compact Footer with Role Avatar and Expand Prompt */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-2 shrink-0">
              <div className="relative group/role flex justify-center w-full">
                <button
                  onClick={toggleSidebar}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200 hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer"
                  title={`${roleConfig.title} - ${roleConfig.userDisplayName}`}
                >
                  {getRoleInitials()}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </button>

                {/* Floating Tooltip for Active Role */}
                <div
                  className={`absolute bottom-0 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 pointer-events-none group-hover/role:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700 ${
                    isRtl ? 'right-full mr-2.5' : 'left-full ml-2.5'
                  }`}
                >
                  <div className="font-bold">{roleConfig.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{roleConfig.userDisplayName}</div>
                  <div className="text-[9px] text-blue-400 mt-1">
                    {isRtl ? 'انقر لتوسيع الشريط الجانبي' : 'Click to expand sidebar'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={toggleSidebar}
                  className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title={isRtl ? 'توسيع القائمة الجانبية' : 'Expand Sidebar'}
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>

                <button
                  onClick={logout}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  title={isRtl ? 'تسجيل الخروج' : 'Sign Out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
};
