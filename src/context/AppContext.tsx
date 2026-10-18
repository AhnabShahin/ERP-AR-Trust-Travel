import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_AIRPORT_DESKS,
  INITIAL_BOOKINGS,
  INITIAL_COMMISSION_RULES,
  INITIAL_DESK_ASSIGNMENT_HISTORY,
  INITIAL_DRIVERS,
  INITIAL_FLEET_VEHICLES,
  INITIAL_EMPLOYEES,
  INITIAL_FINANCE_EXPENSES,
  INITIAL_FLIGHTS,
  INITIAL_GUESTS,
  INITIAL_GUEST_TIERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PACKAGE_CATEGORIES,
  DEFAULT_SERVICE_TYPE_CATEGORIES,
  INITIAL_CATEGORY_SERVICE_MAP,
  getServiceTypeForCategory,
  INITIAL_RATES,
  INITIAL_SALARY_RECORDS,
  INITIAL_SHIFT_DRAWER,
  INITIAL_SYSTEM_LOGS,
  INITIAL_TOUR_GUIDES,
  INITIAL_HOTEL_VENDORS,
  INITIAL_HOTEL_BOOKINGS,
  INITIAL_CURRENCIES,
  INITIAL_CURRENCY_HISTORY,
  INITIAL_USER_ACCOUNTS,
  ROLE_CONFIGS,
  TOUR_PACKAGES,
  SystemAuditLog,
} from '../data/mockData';
import {
  getRoleDashboardSlug,
  getRoleFromSlug,
  isDashboardSlug,
} from '../utils/roleSlugs';
import {
  AirportDesk,
  Booking,
  CommissionRule,
  Currency,
  CurrencyItem,
  CurrencyHistoryRecord,
  DeskAssignmentRecord,
  Driver,
  Employee,
  EmployeeMonthlyRecord,
  ExchangeRates,
  FinanceExpense,
  FleetVehicle,
  FlightInfo,
  Guest,
  GuestTier,
  HotelBooking,
  HotelVendor,
  HotelRoomOption,
  HotelVendorDesk,
  Language,
  NotificationItem,
  RoleConfig,
  SalaryRecord,
  ShiftDrawer,
  Theme,
  TourGuide,
  TourPackage,
  ServiceMainType,
  UserRole,
  UserAccount,
} from '../types';
import { DateFilterState, DEFAULT_DATE_FILTER } from '../utils/dateFilter';

interface AppContextType {
  // Authentication & User Accounts
  userAccounts: UserAccount[];
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => { success: boolean; error?: string; user?: UserAccount };
  logout: () => void;
  signup: (account: Omit<UserAccount, 'id' | 'createdAt'>) => { success: boolean; error?: string; user?: UserAccount };
  updateUserAccount: (id: string, updates: Partial<UserAccount>) => { success: boolean; error?: string };
  addUserAccount: (account: Omit<UserAccount, 'id' | 'createdAt'>) => { success: boolean; error?: string; user?: UserAccount };
  deleteUserAccount: (id: string) => { success: boolean; error?: string };
  resetUserPassword: (id: string, newPassword: string) => { success: boolean; error?: string };

  // Role & Permissions
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  roleConfig: RoleConfig;

  // Language & Currency & Theme
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  theme: Theme;
  toggleTheme: () => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Date & Year Filter Engine
  dateFilter: DateFilterState;
  setDateFilter: React.Dispatch<React.SetStateAction<DateFilterState>>;
  resetDateFilter: () => void;

  // FX Rates & Conversion
  rates: ExchangeRates;
  updateRates: (newRates: Partial<ExchangeRates>) => void;
  convertAmount: (amountQAR: number, targetCurrency?: Currency) => { amount: number; formatted: string; symbol: string };

  // Bookings
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  updateBooking: (id: string, updated: Partial<Booking>) => { success: boolean; error?: string };
  deleteBooking: (id: string) => { success: boolean; error?: string };
  updateBookingStatus: (id: string, status: Booking['qrStatus']) => void;
  toggleVoucherSent: (id: string) => void;

  // Drivers & Fleet Management
  drivers: Driver[];
  updateDriverStatus: (id: string, status: Driver['status'], mission?: string) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => { success: boolean; error?: string; driver?: Driver };
  updateDriver: (id: string, updated: Partial<Driver>) => { success: boolean; error?: string };
  deleteDriver: (id: string) => { success: boolean; error?: string };

  // Fleet Vehicles & Public Website Sync
  fleetVehicles: FleetVehicle[];
  addFleetVehicle: (vehicle: Omit<FleetVehicle, 'id'>) => { success: boolean; error?: string; vehicle?: FleetVehicle };
  updateFleetVehicle: (id: string, updated: Partial<FleetVehicle>) => { success: boolean; error?: string };
  deleteFleetVehicle: (id: string) => { success: boolean; error?: string };
  syncWebsiteFleet: () => { success: boolean; count: number; error?: string };

  // Tour Guides & Scheduling
  tourGuides: import('../types').TourGuide[];
  assignDriverAndGuide: (bookingId: string, driverId: string, guideId?: string) => void;
  approveBooking: (bookingId: string) => void;

  // Salary & Commission Engine
  salaryRecords: import('../types').SalaryRecord[];
  updateSalaryPayout: (id: string, status: import('../types').SalaryRecord['payoutStatus']) => void;
  commissionRules: import('../types').CommissionRule[];
  updateCommissionRule: (id: string, rateValue: number) => void;

  // Tour Services, Packages & Dynamic Categories
  packages: TourPackage[];
  packageCategories: string[];
  categoryServiceMap: Record<string, ServiceMainType>;
  addPackage: (pkg: Omit<TourPackage, 'id'>) => { success: boolean; error?: string; pkg?: TourPackage };
  updatePackage: (id: string, updated: Partial<TourPackage>) => { success: boolean; error?: string };
  deletePackage: (id: string) => { success: boolean; error?: string };
  addPackageCategory: (categoryName: string, serviceType?: ServiceMainType) => { success: boolean; error?: string };
  deletePackageCategory: (categoryName: string) => { success: boolean; error?: string };

  // Airport Desks Management
  airportDesks: AirportDesk[];
  activeDeskId: string;
  setActiveDeskId: (id: string) => void;
  activeDesk: AirportDesk;
  addAirportDesk: (desk: Omit<AirportDesk, 'id'>) => { success: boolean; error?: string; desk?: AirportDesk };
  updateAirportDesk: (id: string, updated: Partial<AirportDesk>) => { success: boolean; error?: string };
  deleteAirportDesk: (id: string) => { success: boolean; error?: string };

  // Desk Staff Assignment History ("kon date date kauke airport er desk a assign kora hoicilo oitar ekta history dekha jabe")
  deskAssignmentHistory: DeskAssignmentRecord[];
  assignEmployeeToDesk: (deskId: string, employeeId: string, shiftTiming?: string, notes?: string) => { success: boolean; error?: string };
  addDeskAssignmentRecord: (record: Omit<DeskAssignmentRecord, 'id'>) => { success: boolean; error?: string; record?: DeskAssignmentRecord };
  deleteDeskAssignmentRecord: (id: string) => { success: boolean; error?: string };
  resetAllDataToDefault: () => void;

  // Employees, Staff & Performance Salary Engine
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => { success: boolean; error?: string; employee?: Employee };
  updateEmployee: (id: string, updated: Partial<Employee>) => { success: boolean; error?: string };
  deleteEmployee: (id: string) => { success: boolean; error?: string };
  recordEmployeeSalaryPayment: (employeeId: string, month: string, amountPaid: number, notes?: string) => { success: boolean; error?: string };
  addEmployeeExpense: (employeeId: string, month: string, expenseAmount: number, description: string) => { success: boolean; error?: string };

  // Guests & Passengers Directory
  guests: Guest[];
  addGuest: (guest: Omit<Guest, 'id'>) => { success: boolean; error?: string; guest?: Guest };
  updateGuest: (id: string, updated: Partial<Guest>) => { success: boolean; error?: string };
  deleteGuest: (id: string) => { success: boolean; error?: string };
  guestTiers: GuestTier[];
  addGuestTier: (tier: Omit<GuestTier, 'id'>) => { success: boolean; error?: string; tier?: GuestTier };
  updateGuestTier: (id: string, updated: Partial<GuestTier>) => { success: boolean; error?: string };
  deleteGuestTier: (id: string) => { success: boolean; error?: string };

  // Hotel Vendors & Qatar Luxury Hotel Partners
  hotelVendors: HotelVendor[];
  addHotelVendor: (vendor: Omit<HotelVendor, 'id' | 'createdAt' | 'totalBookings' | 'totalRevenueQAR'>) => { success: boolean; error?: string; vendor?: HotelVendor };
  updateHotelVendor: (id: string, updated: Partial<HotelVendor>) => { success: boolean; error?: string };
  deleteHotelVendor: (id: string) => { success: boolean; error?: string };
  addRoomOptionToVendor: (vendorId: string, room: HotelRoomOption) => { success: boolean; error?: string };
  addDeskToVendor: (vendorId: string, desk: HotelVendorDesk) => { success: boolean; error?: string };

  // Hotel Booking System
  hotelBookings: HotelBooking[];
  addHotelBooking: (booking: Omit<HotelBooking, 'id' | 'confirmationCode' | 'createdAt'>) => { success: boolean; error?: string; booking?: HotelBooking };
  updateHotelBooking: (id: string, updated: Partial<HotelBooking>) => { success: boolean; error?: string };
  cancelHotelBooking: (id: string, reason?: string) => { success: boolean; error?: string };
  updateHotelBookingStatus: (id: string, status: HotelBooking['bookingStatus']) => { success: boolean; error?: string };

  // Flights
  flights: FlightInfo[];

  // Shift & Drawer
  shiftDrawer: ShiftDrawer;
  updateDrawerCash: (currency: Currency, amount: number) => void;
  closeShiftAndAudit: (countedCash: { QAR: number; USD: number; EUR: number; GBP: number }, notes: string) => void;

  // Multi-Currency Treasury & Historical Rates Archive
  currencies: CurrencyItem[];
  addCurrencyItem: (item: CurrencyItem) => { success: boolean; error?: string };
  updateCurrencyItem: (code: string, updated: Partial<CurrencyItem>) => { success: boolean; error?: string };
  deleteCurrencyItem: (code: string) => { success: boolean; error?: string };
  currencyHistory: CurrencyHistoryRecord[];
  addCurrencyHistoryRecord: (record: Omit<CurrencyHistoryRecord, 'id'>) => { success: boolean; error?: string };
  updateCurrencyHistoryRecord: (id: string, updated: Partial<CurrencyHistoryRecord>) => { success: boolean; error?: string };
  deleteCurrencyHistoryRecord: (id: string) => { success: boolean; error?: string };

  // Finance & Accounting / Company Expenses
  expenses: FinanceExpense[];
  addExpense: (expense: Omit<FinanceExpense, 'id'>) => { success: boolean; error?: string; expense?: FinanceExpense };
  updateExpense: (id: string, updated: Partial<FinanceExpense>) => { success: boolean; error?: string };
  updateExpenseStatus: (id: string, status: FinanceExpense['status'], approvalNotes?: string) => { success: boolean; error?: string };
  deleteExpense: (id: string) => { success: boolean; error?: string };
  systemLogs: SystemAuditLog[];
  addAuditLog: (action: string, category: SystemAuditLog['category'], details: string) => void;

  // Notifications & Realtime Live Alerts
  notifications: NotificationItem[];
  addNotification: (notif: Omit<NotificationItem, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  liveFeedEnabled: boolean;
  toggleLiveFeed: () => void;
  latestToastNotification: NotificationItem | null;
  dismissToastNotification: () => void;

  // Modals
  activeModal: string | null;
  modalData: any;
  openModal: (modal: string, data?: any) => void;
  closeModal: () => void;

  // Sidebar Layout
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;

  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Translations dictionary for bilingual support (English & Arabic)
const TRANSLATIONS: Record<string, { en: string; ar: string }> = {
  // Brand & Nav
  brandName: { en: 'AR Trust Travel & Tourism', ar: 'الرائد للثقة للسياحة والسفر' },
  brandSubtitle: { en: 'Qatar Luxury DMC & Airport Concierge', ar: 'الدوحة - إدارة الوجهات واستقبال المطار' },
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  bookings: { en: 'Bookings & Calendar', ar: 'الحجوزات والتقويم' },
  pos: { en: 'Agent Desk POS', ar: 'نقطة بيع مكاتب الوكلاء والفنادق' },
  dispatch: { en: 'Dispatch & Field Ops', ar: 'العمليات والتوجيه الميداني' },
  eod: { en: 'Shift Reconciliation (EOD)', ar: 'مطابقة الوردية وإغلاق اليوم' },
  payroll: { en: 'Commission & Payroll', ar: 'العمولات والرواتب' },
  ledger: { en: 'Multi-Currency Ledger', ar: 'دفتر الأستاذ متعدد العملات' },
  'audit-logs': { en: 'System Logs & Audit', ar: 'سجلات النظام والمراقبة' },
  'payout-approvals': { en: 'Payout Approvals', ar: 'اعتمادات الصرف والعمولات' },
  expenses: { en: 'Expense Journal', ar: 'يومية المصروفات التشغيلية' },
  'tax-reports': { en: 'Tax & QTA Reports', ar: 'التقارير الضريبية والسياحية' },
  'driver-portal': { en: 'Driver Mission Console', ar: 'لوحة مهام السائق الميدانية' },
  employees: { en: 'Employees & Desk Staff', ar: 'الكوادر وموظفو الكاونترات' },
  guests: { en: 'Guests & Travelers', ar: 'سجل الضيوف والمسافرين' },
  'airport-desks': { en: 'Agent Desks & Hotel Counters', ar: 'مكاتب الوكلاء وكاونترات الفنادق' },
  vendors: { en: 'Hotel Vendors & Partners', ar: 'فنادق وشركاء قطر' },
  hotelBookings: { en: 'Hotel Booking System', ar: 'منظومة حجز الفنادق' },
  'agent-bookings': { en: 'Counter Vouchers', ar: 'قسائم الكاونتر الصادرة' },
  'agent-drawer': { en: 'My Cash Drawer', ar: 'صندوقي النقدي الفعلي' },
  'agent-commission': { en: 'My Commission Log', ar: 'سجل عمولاتي اليومية' },
  settings: { en: 'Settings', ar: 'الإعدادات' },

  // Header
  searchPlaceholder: { en: 'Search PNR, passenger name, flight number, voucher...', ar: 'ابحث برقم الحجز، اسم الراكب، رقم الرحلة، القسيمة...' },
  newBooking: { en: '+ New Booking', ar: '+ حجز جديد' },
  liveFx: { en: 'Live FX', ar: 'أسعار الصرف' },
  activeBranch: { en: 'Hamad Int’l Airport (HIA) - Counter 4', ar: 'مطار حمد الدولي - كاونتر 4' },

  // Roles
  roleSuperAdmin: { en: 'Super Admin', ar: 'المدير العام' },
  roleOpsManager: { en: 'Branch / Ops Manager', ar: 'مدير العمليات' },
  roleTransitAgent: { en: 'Transit Desk Agent', ar: 'موظف الكاونتر' },
  roleDriverGuide: { en: 'Driver / Guide Portal', ar: 'تطبيق السائق' },
  roleAccountant: { en: 'Finance / Accountant', ar: 'المحاسب المالي' },

  // KPIs
  kpiDailyBookings: { en: 'Total Daily Bookings', ar: 'إجمالي حجوزات اليوم' },
  kpiDailyRevenue: { en: 'Multi-Currency Revenue', ar: 'الإيراد متعدد العملات' },
  kpiActiveDrivers: { en: 'Active Drivers Dispatched', ar: 'السائقون والمرشدون بالخدمة' },
  kpiPendingShifts: { en: 'Agent Desk Shift Status', ar: 'حالة ورديات مكاتب الوكلاء' },
  vsYesterday: { en: 'vs. yesterday', ar: 'مقارنة بالأمس' },
  onDuty: { en: 'on duty & active', ar: 'على رأس العمل' },
  closingIn: { en: 'closing in 1h 05m', ar: 'ينتهي خلال ساعة و 5 دقائق' },

  // Widgets
  flightScheduleTitle: { en: 'Live Passenger Transit & Flight Radar (Hamad Int’l DOH)', ar: 'حركة الترانزيت واستقبال الرحلات (مطار حمد الدولي)' },
  bookingTrendsTitle: { en: 'Booking Volume Trends (24h Timeline)', ar: 'مؤشر حركة الحجوزات (خلال 24 ساعة)' },
  airportDeskBookings: { en: 'Live Agent Desk Bookings & QR Verification', ar: 'حجوزات مكاتب الوكلاء والتحقق الفوري بالرمز' },
  eodReconTitle: { en: 'Daily EOD Shift Reconciliation (Agent Desks)', ar: 'مطابقة الصندوق والوردية اليومية (مكاتب الوكلاء)' },

  // Table Headers
  pnrVoucher: { en: 'PNR / Voucher', ar: 'رقم الحجز / القسيمة' },
  passenger: { en: 'Passenger & Flight', ar: 'الراكب وتفاصيل الرحلة' },
  package: { en: 'Package / Service', ar: 'البرنامج / الخدمة' },
  amount: { en: 'Amount Total', ar: 'المبلغ الإجمالي' },
  driverVehicle: { en: 'Assigned Chauffeur', ar: 'السائق والمركبة' },
  status: { en: 'QR Check-in', ar: 'حالة التحقق' },
  actions: { en: 'Actions', ar: 'إجراءات' },

  // Statuses
  'checked-in': { en: 'Checked In', ar: 'تم التحقق' },
  'in-transit': { en: 'In Transit', ar: 'في الطريق' },
  scheduled: { en: 'Scheduled', ar: 'مجدول' },
  completed: { en: 'Completed', ar: 'مكتمل' },
  cancelled: { en: 'Cancelled', ar: 'ملغى' },

  // EOD
  countedCash: { en: 'Counted Drawer Cash', ar: 'النقد الفعلي بالصندوق' },
  systemExpectedText: { en: 'System Expected Cash', ar: 'النقد المسجل بالنظام' },
  cardPosTotal: { en: 'POS Card Terminals', ar: 'أجهزة الدفع الإلكتروني' },
  paymentLinks: { en: 'Online / Payment Links', ar: 'روابط الدفع الرقمية' },
  variance: { en: 'Drawer Variance', ar: 'فارق الصندوق' },
  balanced: { en: 'Exact Match · Balanced', ar: 'مطابق تماماً · متوازن' },
  closeShiftBtn: { en: 'Close Shift & Audit (EOD)', ar: 'إغلاق الوردية والمصادقة' },
};

// LocalStorage persistence helpers for Real production persistence
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Accounts State (Persistent)
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const loaded = loadFromStorage('artrust_user_accounts', INITIAL_USER_ACCOUNTS);
    const existingIds = new Set(loaded.map((u: UserAccount) => u.id));
    const missing = INITIAL_USER_ACCOUNTS.filter((u) => !existingIds.has(u.id));
    if (missing.length > 0) {
      const merged = [...loaded, ...missing];
      try { localStorage.setItem('artrust_user_accounts', JSON.stringify(merged)); } catch {}
      return merged;
    }
    return loaded;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('artrust_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_USER_ACCOUNTS[0]; // Default to Super Admin
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('artrust_is_authenticated');
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true;
  });

  // Active Role state: default to role from URL slug if visiting a specific dashboard slug, or currentUser's role, or 'super-admin'
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const fromPath = getRoleFromSlug(window.location.pathname);
      if (fromPath) return fromPath;
      const cleanHash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
      const fromHash = getRoleFromSlug(cleanHash);
      if (fromHash) return fromHash;
    }
    return currentUser?.role || 'super-admin';
  });
  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS['super-admin'];

  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('QAR');
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('artrust_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // fallback
    }
    return 'dark';
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rates, setRates] = useState<ExchangeRates>(() => loadFromStorage('artrust_rates', INITIAL_RATES));

  // Persistent Real Production Datasets (never lose user input or CRUD changes)
  const [bookings, setBookings] = useState<Booking[]>(() => loadFromStorage('artrust_bookings', INITIAL_BOOKINGS));
  const [drivers, setDrivers] = useState<Driver[]>(() => loadFromStorage('artrust_drivers', INITIAL_DRIVERS));
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>(() => {
    const loaded = loadFromStorage('artrust_fleet_vehicles', INITIAL_FLEET_VEHICLES);
    const existingIds = new Set(loaded.map((v: FleetVehicle) => v.id));
    const updatedLoaded = loaded.map((v: FleetVehicle) => {
      const initial = INITIAL_FLEET_VEHICLES.find((iv) => iv.id === v.id);
      if (initial) {
        const isOldUrl = typeof v.image === 'string' && (v.image.includes('artrusttravel.com') || !v.image);
        return {
          ...initial,
          ...v,
          image: isOldUrl ? initial.image : (v.image || initial.image),
          category: v.category || initial.category,
        };
      }
      return v;
    });
    const missing = INITIAL_FLEET_VEHICLES.filter((v) => !existingIds.has(v.id));
    if (missing.length > 0) {
      const merged = [...updatedLoaded, ...missing];
      try {
        localStorage.setItem('artrust_fleet_vehicles', JSON.stringify(merged));
      } catch {}
      return merged;
    }
    return updatedLoaded;
  });
  const [flights] = useState<FlightInfo[]>(INITIAL_FLIGHTS);
  const [shiftDrawer, setShiftDrawer] = useState<ShiftDrawer>(() => loadFromStorage('artrust_shift_drawer', INITIAL_SHIFT_DRAWER));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage('artrust_notifications', INITIAL_NOTIFICATIONS)
  );
  const [latestToastNotification, setLatestToastNotification] = useState<NotificationItem | null>(null);
  const [liveFeedEnabled, setLiveFeedEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('artrust_live_feed');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [expenses, setExpenses] = useState<FinanceExpense[]>(() => loadFromStorage('artrust_expenses', INITIAL_FINANCE_EXPENSES));
  const [systemLogs, setSystemLogs] = useState<SystemAuditLog[]>(() => loadFromStorage('artrust_system_logs', INITIAL_SYSTEM_LOGS));
  const [tourGuides, setTourGuides] = useState<TourGuide[]>(() => loadFromStorage('artrust_tour_guides', INITIAL_TOUR_GUIDES));
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(() => loadFromStorage('artrust_salary_records', INITIAL_SALARY_RECORDS));
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(INITIAL_COMMISSION_RULES);
  const [packages, setPackages] = useState<TourPackage[]>(() => {
    const loaded = loadFromStorage('artrust_packages', TOUR_PACKAGES);
    const existingIds = new Set(loaded.map((p) => p.id));
    const updatedLoaded = loaded.map((p) => {
      const initial = TOUR_PACKAGES.find((tp) => tp.id === p.id);
      const serviceType = p.serviceType || initial?.serviceType || getServiceTypeForCategory(p.category, p.isMultiDay);
      if (initial && (!p.image || !p.badge || !p.serviceType || (p.id === 'pkg-5' && p.image?.includes('Mercedes-Benz-V-Class-1000x1296.png')))) {
        return {
          ...initial,
          ...p,
          serviceType,
          image: initial.image,
          badge: p.badge || initial.badge,
        };
      }
      return { ...p, serviceType };
    });
    const missing = TOUR_PACKAGES.filter((p) => !existingIds.has(p.id));
    const finalPackages = missing.length > 0 ? [...updatedLoaded, ...missing] : updatedLoaded;
    try {
      localStorage.setItem('artrust_packages', JSON.stringify(finalPackages));
    } catch {}
    return finalPackages;
  });
  const [packageCategories, setPackageCategories] = useState<string[]>(() => {
    const loaded = loadFromStorage('artrust_package_categories', INITIAL_PACKAGE_CATEGORIES);
    const filteredLoaded = (Array.isArray(loaded) ? loaded : []).filter(
      (c: string) => c && typeof c === 'string' && c.trim().toLowerCase() !== 'all'
    );
    const combined = Array.from(new Set([...filteredLoaded, ...INITIAL_PACKAGE_CATEGORIES]));
    try {
      localStorage.setItem('artrust_package_categories', JSON.stringify(combined));
    } catch {}
    return combined;
  });
  const [categoryServiceMap, setCategoryServiceMap] = useState<Record<string, ServiceMainType>>(() => {
    const loaded = loadFromStorage('artrust_category_service_map', INITIAL_CATEGORY_SERVICE_MAP);
    return { ...INITIAL_CATEGORY_SERVICE_MAP, ...(loaded || {}) };
  });

  // Airport & Hotel Partner Agent Desks State
  const [airportDesks, setAirportDesks] = useState<AirportDesk[]>(() => {
    const loaded = loadFromStorage('artrust_airport_desks', INITIAL_AIRPORT_DESKS);
    const existingIds = new Set(loaded.map((d) => d.id));
    const missing = INITIAL_AIRPORT_DESKS.filter((d) => !existingIds.has(d.id));
    if (missing.length > 0) {
      const merged = [...loaded, ...missing];
      try {
        localStorage.setItem('artrust_airport_desks', JSON.stringify(merged));
      } catch {}
      return merged;
    }
    return loaded;
  });
  const [deskAssignmentHistory, setDeskAssignmentHistory] = useState<DeskAssignmentRecord[]>(() => {
    const loaded = loadFromStorage('artrust_desk_assignments', INITIAL_DESK_ASSIGNMENT_HISTORY);
    const existingIds = new Set(loaded.map((d) => d.id));
    const missing = INITIAL_DESK_ASSIGNMENT_HISTORY.filter((d) => !existingIds.has(d.id));
    if (missing.length > 0) {
      const merged = [...loaded, ...missing];
      try { localStorage.setItem('artrust_desk_assignments', JSON.stringify(merged)); } catch {}
      return merged;
    }
    return loaded;
  });
  const [activeDeskId, setActiveDeskId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('artrust_active_desk_id');
      if (saved) return saved;
    } catch {}
    return 'desk-hia-01';
  });
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const loaded = loadFromStorage('artrust_employees', INITIAL_EMPLOYEES);
    const existingIds = new Set(loaded.map((e) => e.id));
    const missing = INITIAL_EMPLOYEES.filter((e) => !existingIds.has(e.id));
    if (missing.length > 0) {
      const merged = [...loaded, ...missing];
      try { localStorage.setItem('artrust_employees', JSON.stringify(merged)); } catch {}
      return merged;
    }
    return loaded;
  });
  const [guests, setGuests] = useState<Guest[]>(() => loadFromStorage('artrust_guests', INITIAL_GUESTS));
  const [guestTiers, setGuestTiers] = useState<GuestTier[]>(() => loadFromStorage('artrust_guest_tiers', INITIAL_GUEST_TIERS));
  const [hotelVendors, setHotelVendors] = useState<HotelVendor[]>(() => {
    const loaded = loadFromStorage('artrust_hotel_vendors', INITIAL_HOTEL_VENDORS);
    const existingIds = new Set(loaded.map((v) => v.id));
    const missing = INITIAL_HOTEL_VENDORS.filter((v) => !existingIds.has(v.id));
    if (missing.length > 0) {
      const merged = [...loaded, ...missing];
      try { localStorage.setItem('artrust_hotel_vendors', JSON.stringify(merged)); } catch {}
      return merged;
    }
    return loaded;
  });
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>(() => {
    const loaded = loadFromStorage('artrust_hotel_bookings', INITIAL_HOTEL_BOOKINGS);
    const existingIds = new Set(loaded.map((b) => b.id));
    const missing = INITIAL_HOTEL_BOOKINGS.filter((b) => !existingIds.has(b.id));
    if (missing.length > 0) {
      const merged = [...loaded, ...missing];
      try { localStorage.setItem('artrust_hotel_bookings', JSON.stringify(merged)); } catch {}
      return merged;
    }
    return loaded;
  });

  // Multi-Currency Treasury & Vault Reserves State
  const [currencies, setCurrencies] = useState<CurrencyItem[]>(() => {
    const loaded = loadFromStorage('artrust_custom_currencies', INITIAL_CURRENCIES);
    const existingCodes = new Set(loaded.map((c: CurrencyItem) => c.code));
    const missing = INITIAL_CURRENCIES.filter((c) => !existingCodes.has(c.code));
    if (missing.length > 0) {
      const merged = [...loaded, ...missing];
      try { localStorage.setItem('artrust_custom_currencies', JSON.stringify(merged)); } catch {}
      return merged;
    }
    return loaded;
  });

  // Historical Exchange Rates & Vault Reserves Ledger
  const [currencyHistory, setCurrencyHistory] = useState<CurrencyHistoryRecord[]>(() => {
    const loaded = loadFromStorage('artrust_currency_history', INITIAL_CURRENCY_HISTORY);
    const existingIds = new Set(loaded.map((h: CurrencyHistoryRecord) => h.id));
    const missing = INITIAL_CURRENCY_HISTORY.filter((h) => !existingIds.has(h.id));
    if (missing.length > 0) {
      const merged = [...loaded, ...missing];
      try { localStorage.setItem('artrust_currency_history', JSON.stringify(merged)); } catch {}
      return merged;
    }
    return loaded;
  });

  // Date & Year Filter state
  const [dateFilter, setDateFilter] = useState<DateFilterState>(DEFAULT_DATE_FILTER);
  const resetDateFilter = () => setDateFilter(DEFAULT_DATE_FILTER);

  const activeDesk = airportDesks.find((d) => d.id === activeDeskId) || airportDesks[0];

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  // Sidebar Layout state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    // Update document dir and lang attribute
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    // Synchronize dark class on document root element for Tailwind CSS
    try {
      localStorage.setItem('artrust_theme', theme);
    } catch {
      // ignore
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  // Production localStorage Auto-Sync (Preserves all CRUD updates permanently)
  useEffect(() => {
    try { localStorage.setItem('artrust_bookings', JSON.stringify(bookings)); } catch {}
  }, [bookings]);

  useEffect(() => {
    try { localStorage.setItem('artrust_rates', JSON.stringify(rates)); } catch {}
  }, [rates]);

  useEffect(() => {
    try { localStorage.setItem('artrust_fleet_vehicles', JSON.stringify(fleetVehicles)); } catch {}
  }, [fleetVehicles]);

  useEffect(() => {
    try { localStorage.setItem('artrust_airport_desks', JSON.stringify(airportDesks)); } catch {}
  }, [airportDesks]);

  useEffect(() => {
    try { localStorage.setItem('artrust_desk_assignments', JSON.stringify(deskAssignmentHistory)); } catch {}
  }, [deskAssignmentHistory]);

  useEffect(() => {
    try { localStorage.setItem('artrust_active_desk_id', activeDeskId); } catch {}
  }, [activeDeskId]);

  useEffect(() => {
    try { localStorage.setItem('artrust_employees', JSON.stringify(employees)); } catch {}
  }, [employees]);

  useEffect(() => {
    try { localStorage.setItem('artrust_guests', JSON.stringify(guests)); } catch {}
  }, [guests]);

  useEffect(() => {
    try { localStorage.setItem('artrust_guest_tiers', JSON.stringify(guestTiers)); } catch {}
  }, [guestTiers]);

  useEffect(() => {
    try { localStorage.setItem('artrust_hotel_vendors', JSON.stringify(hotelVendors)); } catch {}
  }, [hotelVendors]);

  useEffect(() => {
    try { localStorage.setItem('artrust_hotel_bookings', JSON.stringify(hotelBookings)); } catch {}
  }, [hotelBookings]);

  useEffect(() => {
    try { localStorage.setItem('artrust_expenses', JSON.stringify(expenses)); } catch {}
  }, [expenses]);

  useEffect(() => {
    try { localStorage.setItem('artrust_packages', JSON.stringify(packages)); } catch {}
  }, [packages]);

  useEffect(() => {
    try { localStorage.setItem('artrust_package_categories', JSON.stringify(packageCategories)); } catch {}
  }, [packageCategories]);

  useEffect(() => {
    try { localStorage.setItem('artrust_category_service_map', JSON.stringify(categoryServiceMap)); } catch {}
  }, [categoryServiceMap]);

  useEffect(() => {
    try { localStorage.setItem('artrust_drivers', JSON.stringify(drivers)); } catch {}
  }, [drivers]);

  useEffect(() => {
    try { localStorage.setItem('artrust_salary_records', JSON.stringify(salaryRecords)); } catch {}
  }, [salaryRecords]);

  useEffect(() => {
    try { localStorage.setItem('artrust_shift_drawer', JSON.stringify(shiftDrawer)); } catch {}
  }, [shiftDrawer]);

  useEffect(() => {
    try { localStorage.setItem('artrust_system_logs', JSON.stringify(systemLogs)); } catch {}
  }, [systemLogs]);

  useEffect(() => {
    try { localStorage.setItem('artrust_custom_currencies', JSON.stringify(currencies)); } catch {}
  }, [currencies]);

  useEffect(() => {
    try { localStorage.setItem('artrust_currency_history', JSON.stringify(currencyHistory)); } catch {}
  }, [currencyHistory]);

  useEffect(() => {
    try { localStorage.setItem('artrust_notifications', JSON.stringify(notifications)); } catch {}
  }, [notifications]);

  useEffect(() => {
    try { localStorage.setItem('artrust_live_feed', JSON.stringify(liveFeedEnabled)); } catch {}
  }, [liveFeedEnabled]);

  // Real-Time Background Operations Feed Ticker
  useEffect(() => {
    if (!liveFeedEnabled) return;

    const operationalAlerts = [
      {
        title: 'Qatar Airways QR 004 Landed at HIA',
        titleAr: 'هبوط رحلة الخطوط القطرية QR 004 في مطار حمد',
        message: 'Flight QR 004 from London Heathrow (LHR) has landed at Gate A7. 48 transit passengers arriving at Agent Desk Counter 4.',
        messageAr: 'وصلت الرحلة QR 004 من مطار هيثرو لندن عند البوابة A7، وتوجه الركاب إلى كاونتر 4.',
        type: 'flight' as const,
      },
      {
        title: 'Walk-In Booking at HIA Counter 4',
        titleAr: 'حجز فوري في كاونتر 4 بمطار حمد',
        message: 'Agent Desk Counter 4 issued a Half-Day Desert Safari & Camel Ride for 2 British passengers.',
        messageAr: 'تم تسجيل حجز جولة صحراوية وركوب جمال لراكبين عبر كاونتر 4.',
        type: 'booking' as const,
      },
      {
        title: 'Hotel Concierge Limousine Dispatch',
        titleAr: 'انطلاق سيارة ليموزين فندقية فاخرة',
        message: 'Katara Towers Fairmont concierge dispatched VIP BMW 7-Series transfer to Pearl-Qatar.',
        messageAr: 'انطلقت سيارة الليموزين لنزيل في فندق فيرمونت أبراج كتارا باتجاه اللؤلؤة.',
        type: 'driver' as const,
      },
      {
        title: 'Luxury Hotel Suite Reserved',
        titleAr: 'تأكيد حجز جناح فندقي فاخر',
        message: 'Marsa Malaz Kempinski lobby desk booked a Deluxe Arabian Suite for 3 nights.',
        messageAr: 'تم تأكيد حجز جناح عربي فاخر لمدة 3 ليالٍ في فندق مرسى ملاذ كمبينسكي.',
        type: 'hotel' as const,
      },
      {
        title: 'QCB Treasury Currency Balance Verified',
        titleAr: 'مطابقة رصيد الخزينة بالعملات الأجنبية',
        message: 'Foreign currency cash vault reserves balanced against Qatar Central Bank daily rates.',
        messageAr: 'تمت مراجعة ومطابقة رصيد النقد بالعملات الأجنبية مع تسعيرة المصرف المركزي.',
        type: 'cash' as const,
      },
    ];

    let alertIdx = 0;
    const interval = setInterval(() => {
      const alert = operationalAlerts[alertIdx % operationalAlerts.length];
      alertIdx++;

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: alert.title,
        titleAr: alert.titleAr,
        message: alert.message,
        messageAr: alert.messageAr,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: alert.type,
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
      setLatestToastNotification(newNotif);
    }, 45000); // Pulse every 45s

    return () => clearInterval(interval);
  }, [liveFeedEnabled]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    try { localStorage.setItem('artrust_user_accounts', JSON.stringify(userAccounts)); } catch {}
  }, [userAccounts]);

  const login = (usernameOrEmail: string, password: string): { success: boolean; error?: string; user?: UserAccount } => {
    const query = usernameOrEmail.trim().toLowerCase();
    const account = userAccounts.find(
      (u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query
    );

    if (!account) {
      return { success: false, error: 'User account not found. Please verify your username or email.' };
    }

    if (account.password !== password) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    if (account.status === 'inactive') {
      return { success: false, error: 'This account has been deactivated by the system administrator.' };
    }

    const updatedAccount: UserAccount = { ...account, lastLogin: 'Just now' };
    setUserAccounts((prev) => prev.map((u) => (u.id === account.id ? updatedAccount : u)));
    setCurrentUser(updatedAccount);
    setCurrentRole(updatedAccount.role);
    setIsAuthenticated(true);

    try {
      localStorage.setItem('artrust_current_user', JSON.stringify(updatedAccount));
      localStorage.setItem('artrust_is_authenticated', JSON.stringify(true));
    } catch {}

    addAuditLog('User Login', 'SECURITY', `${account.name} (${account.username}) signed in as ${account.role}.`);
    return { success: true, user: updatedAccount };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('artrust_is_authenticated', JSON.stringify(false));
    } catch {}
    addAuditLog('User Logout', 'SECURITY', `${currentUser?.name || 'User'} logged out.`);
  };

  const signup = (data: Omit<UserAccount, 'id' | 'createdAt'>): { success: boolean; error?: string; user?: UserAccount } => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    if (userAccounts.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'Username is already taken. Please choose another.' };
    }
    if (userAccounts.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email is already registered. Please login instead.' };
    }

    const newAccount: UserAccount = {
      ...data,
      id: `usr-${Date.now().toString(36)}`,
      username: data.username.trim(),
      email: data.email.trim(),
      status: 'active',
      lastLogin: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const nextAccounts = [...userAccounts, newAccount];
    setUserAccounts(nextAccounts);
    setCurrentUser(newAccount);
    setCurrentRole(newAccount.role);
    setIsAuthenticated(true);

    try {
      localStorage.setItem('artrust_user_accounts', JSON.stringify(nextAccounts));
      localStorage.setItem('artrust_current_user', JSON.stringify(newAccount));
      localStorage.setItem('artrust_is_authenticated', JSON.stringify(true));
    } catch {}

    addAuditLog('Account Created', 'SECURITY', `New user registered: ${newAccount.name} (${newAccount.username}, Role: ${newAccount.role}).`);
    return { success: true, user: newAccount };
  };

  const updateUserAccount = (id: string, updates: Partial<UserAccount>): { success: boolean; error?: string } => {
    const existing = userAccounts.find((u) => u.id === id);
    if (!existing) return { success: false, error: 'User account not found.' };

    if (updates.username) {
      const q = updates.username.trim().toLowerCase();
      if (userAccounts.some((u) => u.id !== id && u.username.toLowerCase() === q)) {
        return { success: false, error: 'Username already in use by another account.' };
      }
    }

    if (updates.email) {
      const e = updates.email.trim().toLowerCase();
      if (userAccounts.some((u) => u.id !== id && u.email.toLowerCase() === e)) {
        return { success: false, error: 'Email already in use by another account.' };
      }
    }

    const updated = { ...existing, ...updates };
    const nextAccounts = userAccounts.map((u) => (u.id === id ? updated : u));
    setUserAccounts(nextAccounts);

    if (currentUser && currentUser.id === id) {
      setCurrentUser(updated);
      if (updates.role) setCurrentRole(updates.role);
      try {
        localStorage.setItem('artrust_current_user', JSON.stringify(updated));
      } catch {}
    }

    try {
      localStorage.setItem('artrust_user_accounts', JSON.stringify(nextAccounts));
    } catch {}

    const changedKeys = Object.keys(updates).join(', ');
    addAuditLog('Account Credentials Updated', 'SECURITY', `Admin modified account ${existing.name} (${existing.username}) fields: ${changedKeys}`);
    return { success: true };
  };

  const addUserAccount = (accountData: Omit<UserAccount, 'id' | 'createdAt'>): { success: boolean; error?: string; user?: UserAccount } => {
    const cleanUsername = accountData.username.trim().toLowerCase();
    const cleanEmail = accountData.email.trim().toLowerCase();

    if (userAccounts.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'Username already taken.' };
    }
    if (userAccounts.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email already registered.' };
    }

    const newAcc: UserAccount = {
      ...accountData,
      id: `usr-${Date.now().toString(36)}`,
      username: accountData.username.trim(),
      email: accountData.email.trim(),
      status: accountData.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const nextAccounts = [...userAccounts, newAcc];
    setUserAccounts(nextAccounts);
    try {
      localStorage.setItem('artrust_user_accounts', JSON.stringify(nextAccounts));
    } catch {}

    addAuditLog('User Added', 'SECURITY', `Admin created new account: ${newAcc.name} (${newAcc.username}, Role: ${newAcc.role}).`);
    return { success: true, user: newAcc };
  };

  const deleteUserAccount = (id: string): { success: boolean; error?: string } => {
    const acc = userAccounts.find((u) => u.id === id);
    if (!acc) return { success: false, error: 'Account not found.' };

    if (acc.role === 'super-admin') {
      const superAdminCount = userAccounts.filter((u) => u.role === 'super-admin').length;
      if (superAdminCount <= 1) {
        return { success: false, error: 'Cannot delete the only Super Admin account in the system.' };
      }
    }

    if (currentUser?.id === id) {
      return { success: false, error: 'Cannot delete your currently active account.' };
    }

    const next = userAccounts.filter((u) => u.id !== id);
    setUserAccounts(next);
    try {
      localStorage.setItem('artrust_user_accounts', JSON.stringify(next));
    } catch {}

    addAuditLog('Account Deleted', 'SECURITY', `Admin removed user account: ${acc.name} (${acc.username}).`);
    return { success: true };
  };

  const resetUserPassword = (id: string, newPass: string): { success: boolean; error?: string } => {
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }
    return updateUserAccount(id, { password: newPass.trim() });
  };

  const setRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    const targetConfig = ROLE_CONFIGS[newRole];
    setActiveTab(targetConfig.defaultTab);

    // Also link currentUser if matching account exists
    const match = userAccounts.find((u) => u.role === newRole);
    if (match) {
      setCurrentUser(match);
      try { localStorage.setItem('artrust_current_user', JSON.stringify(match)); } catch {}
    }

    // Sync browser URL to role-based dashboard slug if currently in an ERP/dashboard route
    if (typeof window !== 'undefined') {
      const targetSlug = getRoleDashboardSlug(newRole);
      const currentPath = window.location.pathname.toLowerCase();
      if (
        currentPath === '/dashboard' ||
        isDashboardSlug(currentPath) ||
        currentPath === '/erp' ||
        currentPath.includes('dashboard')
      ) {
        if (window.location.pathname !== targetSlug) {
          window.history.pushState(null, '', targetSlug);
        }
      }
    }

    // Add log
    addAuditLog('Role Context Switched', 'SECURITY', `User role switched to ${targetConfig.title}`);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key]) {
      return TRANSLATIONS[key][language] || TRANSLATIONS[key].en;
    }
    return key;
  };

  const getCurrencyRate = (curr: Currency): number => {
    if (curr === 'USD') return rates.USD;
    if (curr === 'EUR') return rates.EUR;
    if (curr === 'GBP') return rates.GBP;
    return 1;
  };

  const updateRates = (newRates: Partial<ExchangeRates>) => {
    setRates((prev) => ({
      ...prev,
      ...newRates,
      lastUpdated: 'Manual Super Admin Override',
    }));
    addAuditLog('Exchange Rates Modified', 'FINANCE', `Rates updated: USD: ${newRates.USD ?? rates.USD}, EUR: ${newRates.EUR ?? rates.EUR}`);
  };

  const convertAmount = (amountQAR: number, targetCurrency: Currency = currency) => {
    let rate = 1;
    let symbol = 'QAR';

    switch (targetCurrency) {
      case 'USD':
        rate = 1 / rates.USD;
        symbol = '$';
        break;
      case 'EUR':
        rate = 1 / rates.EUR;
        symbol = '€';
        break;
      case 'GBP':
        rate = 1 / rates.GBP;
        symbol = '£';
        break;
      case 'QAR':
      default:
        rate = 1;
        symbol = language === 'ar' ? 'ر.ق' : 'QAR';
        break;
    }

    const calculated = amountQAR * rate;
    return {
      amount: calculated,
      formatted: `${symbol} ${calculated.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      symbol,
    };
  };

  // Multi-Currency Treasury Management Methods
  const addCurrencyItem = (item: CurrencyItem): { success: boolean; error?: string } => {
    const cleanCode = item.code.trim().toUpperCase();
    if (!cleanCode) return { success: false, error: 'Currency code is required.' };
    if (currencies.some((c) => c.code === cleanCode)) {
      return { success: false, error: `Currency ${cleanCode} already exists.` };
    }
    const cleanItem: CurrencyItem = {
      ...item,
      code: cleanCode,
      rateToQAR: Number(item.rateToQAR) || 1.0,
      cashVaultBalance: Number(item.cashVaultBalance) || 0,
    };
    setCurrencies((prev) => [...prev, cleanItem]);
    updateRates({ [cleanCode]: cleanItem.rateToQAR } as any);

    // Auto-record in currency history
    const historyRec: CurrencyHistoryRecord = {
      id: `ch-${Date.now().toString(36)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      currencyCode: cleanCode,
      currencyName: cleanItem.name,
      rateToQAR: cleanItem.rateToQAR,
      vaultBalance: cleanItem.cashVaultBalance,
      balanceQAREquivalent: Math.round(cleanItem.cashVaultBalance * cleanItem.rateToQAR),
      recordedBy: roleConfig.userDisplayName,
      changeType: 'Rate Update',
      notes: `New currency registered in Treasury. Initial balance: ${cleanItem.symbol} ${cleanItem.cashVaultBalance.toLocaleString()}.`,
    };
    setCurrencyHistory((prev) => [historyRec, ...prev]);

    addAuditLog('Currency Created', 'FINANCE', `New currency registered: ${cleanCode} at ${cleanItem.rateToQAR} QAR`);
    return { success: true };
  };

  const updateCurrencyItem = (code: string, updated: Partial<CurrencyItem>): { success: boolean; error?: string } => {
    const target = currencies.find((c) => c.code === code);
    if (!target) return { success: false, error: 'Currency not found.' };

    const oldRate = target.rateToQAR;
    const oldBalance = target.cashVaultBalance;
    const newRate = updated.rateToQAR !== undefined ? Number(updated.rateToQAR) : oldRate;
    const newBalance = updated.cashVaultBalance !== undefined ? Number(updated.cashVaultBalance) : oldBalance;

    setCurrencies((prev) =>
      prev.map((c) => (c.code === code ? { ...c, ...updated, rateToQAR: newRate, cashVaultBalance: newBalance } : c))
    );

    if (updated.rateToQAR !== undefined && newRate !== oldRate) {
      updateRates({ [code]: newRate } as any);
    }

    // Record in history if rate or balance changed
    if (newRate !== oldRate || newBalance !== oldBalance || updated.peggedNote) {
      const historyRec: CurrencyHistoryRecord = {
        id: `ch-${Date.now().toString(36)}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        currencyCode: code,
        currencyName: updated.name || target.name,
        rateToQAR: newRate,
        previousRateToQAR: oldRate,
        vaultBalance: newBalance,
        balanceQAREquivalent: Math.round(newBalance * newRate),
        recordedBy: roleConfig.userDisplayName,
        changeType: newRate !== oldRate ? 'Rate Update' : 'Vault Audit',
        notes: updated.peggedNote || `Treasury update: Rate changed to ${newRate} QAR, Vault reserve ${newBalance.toLocaleString()}.`,
      };
      setCurrencyHistory((prev) => [historyRec, ...prev]);
    }

    addAuditLog('Currency Updated', 'FINANCE', `Updated currency ${code} (Rate: ${newRate} QAR, Vault: ${newBalance.toLocaleString()})`);
    return { success: true };
  };

  const deleteCurrencyItem = (code: string): { success: boolean; error?: string } => {
    if (code === 'QAR') {
      return { success: false, error: 'Cannot remove sovereign base currency QAR.' };
    }
    const target = currencies.find((c) => c.code === code);
    if (!target) return { success: false, error: 'Currency not found.' };

    setCurrencies((prev) => prev.filter((c) => c.code !== code));

    // Record in history
    const historyRec: CurrencyHistoryRecord = {
      id: `ch-${Date.now().toString(36)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      currencyCode: code,
      currencyName: target.name,
      rateToQAR: target.rateToQAR,
      vaultBalance: 0,
      balanceQAREquivalent: 0,
      recordedBy: roleConfig.userDisplayName,
      changeType: 'Vault Audit',
      notes: `Currency ${code} decommissioned from active Treasury. Remaining vault balance liquidated or transferred.`,
    };
    setCurrencyHistory((prev) => [historyRec, ...prev]);

    addAuditLog('Currency Removed', 'FINANCE', `Decommissioned currency ${code} from Multi-Currency Treasury.`);
    return { success: true };
  };

  const addCurrencyHistoryRecord = (record: Omit<CurrencyHistoryRecord, 'id'>): { success: boolean; error?: string } => {
    if (!record.currencyCode || !record.date || record.rateToQAR <= 0) {
      return { success: false, error: 'Currency, date, and valid rate are required.' };
    }
    const newId = `ch-${Date.now().toString(36)}`;
    const newRec: CurrencyHistoryRecord = {
      ...record,
      id: newId,
      time: record.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      balanceQAREquivalent: Math.round((record.vaultBalance || 0) * record.rateToQAR),
    };
    setCurrencyHistory((prev) => [newRec, ...prev]);

    // If date is today, also synchronize the active currency item
    const todayStr = new Date().toISOString().split('T')[0];
    if (record.date === todayStr) {
      setCurrencies((prev) =>
        prev.map((c) =>
          c.code === record.currencyCode
            ? { ...c, rateToQAR: record.rateToQAR, cashVaultBalance: record.vaultBalance }
            : c
        )
      );
      updateRates({ [record.currencyCode]: record.rateToQAR } as any);
    }

    addAuditLog('Currency History Recorded', 'FINANCE', `Historical rate entry logged for ${record.currencyCode} on ${record.date}: ${record.rateToQAR} QAR`);
    return { success: true };
  };

  const updateCurrencyHistoryRecord = (id: string, updated: Partial<CurrencyHistoryRecord>): { success: boolean; error?: string } => {
    setCurrencyHistory((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const rate = updated.rateToQAR !== undefined ? updated.rateToQAR : h.rateToQAR;
          const balance = updated.vaultBalance !== undefined ? updated.vaultBalance : h.vaultBalance;
          return {
            ...h,
            ...updated,
            balanceQAREquivalent: Math.round(balance * rate),
          };
        }
        return h;
      })
    );
    addAuditLog('Currency History Edited', 'FINANCE', `Modified historical currency record #${id}`);
    return { success: true };
  };

  const deleteCurrencyHistoryRecord = (id: string): { success: boolean; error?: string } => {
    setCurrencyHistory((prev) => prev.filter((h) => h.id !== id));
    addAuditLog('Currency History Deleted', 'FINANCE', `Removed historical currency entry #${id}`);
    return { success: true };
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking => {
    const bookingDateStr = `Oct 09, 2026, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newBooking: Booking = {
      ...bookingData,
      id: `bkg-${Date.now()}`,
      createdAt: bookingDateStr,
    };
    setBookings((prev) => [newBooking, ...prev]);

    // 1. Synchronize Shift Drawer
    if (bookingData.paymentMethod === 'Cash') {
      const rate = getCurrencyRate(bookingData.paymentCurrency);
      const addedAmount = bookingData.totalQAR / rate;
      setShiftDrawer((prev) => ({
        ...prev,
        currentCashDrawer: {
          ...prev.currentCashDrawer,
          [bookingData.paymentCurrency]: (prev.currentCashDrawer[bookingData.paymentCurrency] || 0) + addedAmount,
        },
        systemExpected: {
          ...prev.systemExpected,
          [bookingData.paymentCurrency]: (prev.systemExpected[bookingData.paymentCurrency] || 0) + addedAmount,
        },
        transactionsCount: prev.transactionsCount + 1,
      }));
    } else if (bookingData.paymentMethod === 'POS Card') {
      setShiftDrawer((prev) => ({
        ...prev,
        posCardTotalQAR: prev.posCardTotalQAR + bookingData.totalQAR,
        transactionsCount: prev.transactionsCount + 1,
      }));
    }

    // 2. Synchronize Airport Desk cash balance
    if (bookingData.paymentMethod === 'Cash') {
      setAirportDesks((prev) =>
        prev.map((d) =>
          d.id === activeDeskId
            ? { ...d, currentDrawerCashQAR: (d.currentDrawerCashQAR || 0) + bookingData.totalQAR }
            : d
        )
      );
    }

    // 3. Synchronize Employee Performance, Target Count & Commission
    const targetDesk = airportDesks.find((d) => d.id === activeDeskId);
    const responsibleEmpId = targetDesk?.assignedEmployeeId || 'emp-102';
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === responsibleEmpId) {
          const currentMonthName = 'October 2026';
          let monthFound = false;
          const updatedMonthly = emp.monthlyRecords.map((mRec) => {
            if (mRec.month === currentMonthName) {
              monthFound = true;
              const newCompleted = mRec.completedServices + 1;
              const isMet = newCompleted >= mRec.targetServices;
              const excess = Math.max(0, newCompleted - mRec.targetServices);
              const commRate = mRec.commissionRatePerService || emp.commissionPerServiceQAR || 35;
              const commissionEarned = excess * commRate;
              const gross = mRec.baseSalaryQAR + commissionEarned + mRec.expensesReimbursedQAR - mRec.deductionsQAR;
              const due = Math.max(0, gross - mRec.amountPaidQAR);
              return {
                ...mRec,
                completedServices: newCompleted,
                targetMet: isMet,
                excessServices: excess,
                commissionEarnedQAR: commissionEarned,
                grossPayableQAR: gross,
                amountDueQAR: due,
                notes: `Auto-synced: ${newCompleted} services recorded.`,
              };
            }
            return mRec;
          });

          if (!monthFound) {
            updatedMonthly.unshift({
              month: currentMonthName,
              baseSalaryQAR: emp.baseSalaryMonthlyQAR,
              targetServices: emp.monthlyServiceTarget,
              completedServices: 1,
              targetMet: 1 >= emp.monthlyServiceTarget,
              excessServices: Math.max(0, 1 - emp.monthlyServiceTarget),
              commissionRatePerService: emp.commissionPerServiceQAR,
              commissionEarnedQAR: 0,
              expensesReimbursedQAR: 0,
              deductionsQAR: 0,
              grossPayableQAR: emp.baseSalaryMonthlyQAR,
              amountPaidQAR: 0,
              amountDueQAR: emp.baseSalaryMonthlyQAR,
              status: 'Pending Payout',
              notes: 'Initial monthly booking logged.',
            });
          }

          return { ...emp, monthlyRecords: updatedMonthly };
        }
        return emp;
      })
    );

    // 4. Synchronize Guest Directory (Passenger ledger)
    setGuests((prev) => {
      const matchIndex = prev.findIndex(
        (g) =>
          (bookingData.passengerPhone && g.phone === bookingData.passengerPhone) ||
          (bookingData.passengerEmail && g.email.toLowerCase() === bookingData.passengerEmail.toLowerCase()) ||
          g.name.toLowerCase() === bookingData.passengerName.toLowerCase()
      );

      if (matchIndex >= 0) {
        const existing = prev[matchIndex];
        const updatedGuest: Guest = {
          ...existing,
          totalBookings: existing.totalBookings + 1,
          totalSpentQAR: existing.totalSpentQAR + bookingData.totalQAR,
          lastArrivalAirport: bookingData.arrivalAirport || existing.lastArrivalAirport,
          lastFlight: bookingData.flightNumber || existing.lastFlight,
          lastTripDate: 'Oct 09, 2026',
          bookingIds: [newBooking.id, ...existing.bookingIds.filter((bId) => bId !== newBooking.id)],
        };
        const nextList = [...prev];
        nextList[matchIndex] = updatedGuest;
        return nextList;
      } else {
        const newGuest: Guest = {
          id: `gst-${Date.now()}`,
          name: bookingData.passengerName,
          nationality: bookingData.nationality || 'International',
          phone: bookingData.passengerPhone || '+974 5500 0000',
          email: bookingData.passengerEmail || `${bookingData.passengerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@traveler.com`,
          vipTier: bookingData.totalQAR >= 2000 || bookingData.paxCount >= 4 ? 'VIP Gold' : 'Standard',
          totalBookings: 1,
          totalSpentQAR: bookingData.totalQAR,
          lastArrivalAirport: bookingData.arrivalAirport || 'Hamad Int’l Airport (DOH)',
          lastFlight: bookingData.flightNumber || 'QR 138',
          lastTripDate: 'Oct 09, 2026',
          specialPreferences: bookingData.notes || 'Counter booking',
          bookingIds: [newBooking.id],
        };
        return [newGuest, ...prev];
      }
    });

    // 5. Synchronize Driver Trip and Mission
    if (bookingData.driverId) {
      setDrivers((prev) =>
        prev.map((drv) =>
          drv.id === bookingData.driverId
            ? {
                ...drv,
                totalTripsToday: drv.totalTripsToday + 1,
                activePassengers: (drv.activePassengers || 0) + (bookingData.paxCount || 1),
                currentMission: `Assigned to ${bookingData.passengerName} (${bookingData.flightNumber || 'Arrival'})`,
              }
            : drv
        )
      );
    }

    addAuditLog(
      'New Booking Created & Synced',
      'POS',
      `Issued voucher ${newBooking.pnr} for ${newBooking.passengerName} (${newBooking.totalQAR} QAR). Synced with Shift Drawer, Desk, Guest profile and Staff performance.`
    );

    addNotification({
      title: `New Service Booking: ${newBooking.pnr}`,
      titleAr: `حجز خدمة جديد: ${newBooking.pnr}`,
      message: `${newBooking.passengerName} booked "${newBooking.packageName}" via ${newBooking.source || 'Agent Desk'} (${newBooking.totalQAR} QAR).`,
      messageAr: `تم تسجيل حجز الخدمة للراكب ${newBooking.passengerName} بقيمة ${newBooking.totalQAR} ر.ق.`,
      time: 'Just now',
      type: 'booking',
      read: false,
      actionLabel: 'View in POS / Central Inventory',
    });

    return newBooking;
  };

  const updateBooking = (id: string, updated: Partial<Booking>): { success: boolean; error?: string } => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );
    addAuditLog('Booking Updated', 'POS', `Updated booking #${id} (${updated.passengerName || ''})`);
    return { success: true };
  };

  const deleteBooking = (id: string): { success: boolean; error?: string } => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    addAuditLog('Booking Cancelled/Deleted', 'POS', `Deleted booking #${id}`);
    return { success: true };
  };

  const updateBookingStatus = (id: string, status: Booking['qrStatus']) => {
    const target = bookings.find((b) => b.id === id);
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, qrStatus: status } : b))
    );

    // Sync Driver & Fleet status
    if (target && target.driverId) {
      if (status === 'completed') {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === target.driverId
              ? {
                  ...d,
                  status: 'At Airport Bay',
                  currentMission: 'Staged at Terminal 1 Bay 3',
                  activePassengers: 0,
                  totalTripsToday: (d.totalTripsToday || 0) + 1,
                }
              : d
          )
        );
      } else if (status === 'in-transit') {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === target.driverId
              ? { ...d, status: 'En Route', location: 'Corniche / West Bay Highway' }
              : d
          )
        );
      }
    }
  };

  const toggleVoucherSent = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, voucherSent: !b.voucherSent } : b))
    );
  };

  const updateDriverStatus = (id: string, status: Driver['status'], mission?: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status, currentMission: mission || d.currentMission } : d))
    );
  };

  const addDriver = (driverData: Omit<Driver, 'id'>): { success: boolean; error?: string; driver?: Driver } => {
    const newDriver: Driver = {
      ...driverData,
      id: `drv-${Date.now()}`,
      rating: driverData.rating || 5.0,
      totalTripsToday: driverData.totalTripsToday || 0,
      activePassengers: driverData.activePassengers || 0,
    };
    setDrivers((prev) => [newDriver, ...prev]);
    addAuditLog('New Fleet Vehicle & Chauffeur Added', 'DISPATCH', `${roleConfig.title} registered ${newDriver.vehicle} (${newDriver.plateNumber}) driven by ${newDriver.name}`);
    return { success: true, driver: newDriver };
  };

  const updateDriver = (id: string, updated: Partial<Driver>): { success: boolean; error?: string } => {
    setDrivers((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
    addAuditLog('Fleet Vehicle / Chauffeur Updated', 'DISPATCH', `${roleConfig.title} updated vehicle/chauffeur record #${id}`);
    return { success: true };
  };

  const deleteDriver = (id: string): { success: boolean; error?: string } => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    addAuditLog('Fleet Vehicle Decommissioned', 'DISPATCH', `${roleConfig.title} decommissioned driver/vehicle #${id}`);
    return { success: true };
  };

  // Fleet Vehicles CRUD Operations (Direct sync with public website & booking engine)
  const addFleetVehicle = (vehicleData: Omit<FleetVehicle, 'id'>): { success: boolean; error?: string; vehicle?: FleetVehicle } => {
    if (!vehicleData.name.trim()) {
      return { success: false, error: 'Vehicle name is required.' };
    }
    const newVehicle: FleetVehicle = {
      ...vehicleData,
      id: `fleet-${Date.now()}`,
      showOnWebsite: vehicleData.showOnWebsite !== undefined ? vehicleData.showOnWebsite : true,
    };
    setFleetVehicles((prev) => [newVehicle, ...prev]);
    addAuditLog(
      'New Fleet Vehicle Registered',
      'DISPATCH',
      `${roleConfig.title} registered vehicle ${newVehicle.name} (${newVehicle.category}) with price QAR ${newVehicle.priceQAR}`
    );
    return { success: true, vehicle: newVehicle };
  };

  const updateFleetVehicle = (id: string, updated: Partial<FleetVehicle>): { success: boolean; error?: string } => {
    const existing = fleetVehicles.find((v) => v.id === id);
    if (!existing) return { success: false, error: 'Fleet vehicle not found.' };

    setFleetVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updated } : v))
    );
    addAuditLog(
      'Fleet Vehicle Updated',
      'DISPATCH',
      `${roleConfig.title} updated vehicle ${existing.name} (pricing & specs synced with website)`
    );
    return { success: true };
  };

  const deleteFleetVehicle = (id: string): { success: boolean; error?: string } => {
    const existing = fleetVehicles.find((v) => v.id === id);
    setFleetVehicles((prev) => prev.filter((v) => v.id !== id));
    addAuditLog(
      'Fleet Vehicle Removed',
      'DISPATCH',
      `${roleConfig.title} decommissioned fleet vehicle ${existing?.name || id}`
    );
    return { success: true };
  };

  const syncWebsiteFleet = (): { success: boolean; count: number; error?: string } => {
    try {
      const existingMap = new Map(fleetVehicles.map((v) => [v.id, v]));

      // Merge initial/website fleet specifications with any local updates
      const merged = INITIAL_FLEET_VEHICLES.map((initialV) => {
        const existing = existingMap.get(initialV.id);
        if (existing) {
          return {
            ...initialV,
            ...existing,
            image: initialV.image || existing.image,
            category: existing.category || initialV.category,
            name: existing.name || initialV.name,
            nameAr: existing.nameAr || initialV.nameAr,
            priceQAR: existing.priceQAR || initialV.priceQAR,
            features: existing.features && existing.features.length > 0 ? existing.features : initialV.features,
            plateNumber: existing.plateNumber || initialV.plateNumber,
            assignedDriverId: existing.assignedDriverId || initialV.assignedDriverId,
            assignedDriverName: existing.assignedDriverName || initialV.assignedDriverName,
            showOnWebsite: existing.showOnWebsite !== undefined ? existing.showOnWebsite : true,
          };
        }
        return initialV;
      });

      // Keep any user-created custom vehicles (not in INITIAL_FLEET_VEHICLES)
      const initialIds = new Set(INITIAL_FLEET_VEHICLES.map((v) => v.id));
      const customVehicles = fleetVehicles.filter((v) => !initialIds.has(v.id));
      const fullList = [...merged, ...customVehicles];

      setFleetVehicles(fullList);
      try {
        localStorage.setItem('artrust_fleet_vehicles', JSON.stringify(fullList));
      } catch {}

      addAuditLog(
        'Fleet & Website Catalog Synced',
        'DISPATCH',
        `${roleConfig.title} imported and synchronized ${fullList.length} vehicles with public website catalog`
      );

      addNotification({
        title: 'Fleet & Website Catalog Synced',
        titleAr: 'تمت مزامنة أسطول المركبات مع الموقع',
        message: `Successfully synchronized ${fullList.length} fleet vehicles & field operations across operations dashboard and public website.`,
        messageAr: `تمت مزامنة ${fullList.length} مركبة بنجاح عبر لوحة العمليات والموقع الإلكتروني العام.`,
        type: 'driver',
        read: false,
        time: 'Just now',
      });

      return { success: true, count: fullList.length };
    } catch (err: any) {
      return { success: false, count: 0, error: err?.message || 'Sync failed' };
    }
  };

  const assignDriverAndGuide = (bookingId: string, driverId: string, guideId?: string) => {
    const drv = drivers.find((d) => d.id === driverId);
    const gd = tourGuides.find((g) => g.id === guideId);
    const targetBooking = bookings.find((b) => b.id === bookingId);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              driverId,
              driverName: drv ? drv.name : b.driverName,
              driverVehicle: drv ? `${drv.vehicle} (${drv.plateNumber})` : b.driverVehicle,
              driverPhone: drv ? drv.phone : b.driverPhone,
              guideId: guideId || b.guideId,
              guideName: gd ? gd.name : b.guideName,
              qrStatus: 'driver-assigned',
            }
          : b
      )
    );

    // Sync Driver status and mission
    if (drv && targetBooking) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driverId
            ? {
                ...d,
                status: 'Dispatched',
                currentMission: `Mission: ${targetBooking.packageName} (${targetBooking.passengerName})`,
                activePassengers: targetBooking.paxCount || 1,
              }
            : d
        )
      );
    }

    addAuditLog('Driver/Guide Scheduled', 'DISPATCH', `Assigned ${drv?.name} and ${gd?.name || 'Guide'} to PNR booking`);
  };

  const approveBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              qrStatus: 'confirmed',
              voucherSent: true,
              driverName:
                b.driverName === 'Awaiting Admin Approval' || b.driverName === 'Awaiting Operations Approval'
                  ? 'Assigned by Operations'
                  : b.driverName,
            }
          : b
      )
    );
    addAuditLog('Web Booking Lead Approved', 'DISPATCH', `Website API booking lead ${bookingId} approved & digital voucher issued by admin`);
    addNotification({
      title: 'Web Booking Lead Approved',
      titleAr: 'تم اعتماد حجز الموقع الإلكتروني',
      message: `Website reservation ${bookingId} has been confirmed. Passenger voucher is now activated for operations.`,
      messageAr: `تم تأكيد حجز الموقع ${bookingId} وتفعيل قسيمة الراكب للعمليات.`,
      type: 'booking',
      read: false,
      time: 'Just now',
    });
  };

  const updateSalaryPayout = (id: string, status: SalaryRecord['payoutStatus']) => {
    const targetRec = salaryRecords.find((s) => s.id === id);
    setSalaryRecords((prev) =>
      prev.map((s) => (s.id === id ? { ...s, payoutStatus: status } : s))
    );

    // Sync with Employee Monthly records
    if (targetRec && status === 'Paid') {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.name.toLowerCase() === targetRec.employeeName.toLowerCase()) {
            return {
              ...emp,
              monthlyRecords: emp.monthlyRecords.map((m) =>
                m.month === 'October 2026'
                  ? { ...m, status: 'Fully Paid', amountPaidQAR: m.grossPayableQAR, amountDueQAR: 0 }
                  : m
              ),
            };
          }
          return emp;
        })
      );
    }

    addAuditLog('Salary Payout Status Updated', 'FINANCE', `Salary record #${id} updated to ${status}`);
  };

  const updateCommissionRule = (id: string, rateValue: number) => {
    setCommissionRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, rateValue } : r))
    );
    addAuditLog('Commission Rate Altered', 'FINANCE', `Commission rule #${id} updated to ${rateValue}`);
  };

  const updateDrawerCash = (curr: Currency, amount: number) => {
    setShiftDrawer((prev) => ({
      ...prev,
      currentCashDrawer: {
        ...prev.currentCashDrawer,
        [curr]: amount,
      },
    }));
  };

  const closeShiftAndAudit = (countedCash: { QAR: number; USD: number; EUR: number; GBP: number }, notes: string) => {
    setShiftDrawer((prev) => ({
      ...prev,
      currentCashDrawer: countedCash,
      status: 'Audited & Closed',
    }));

    const auditNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Shift Audit Closed & Filed (Z-Report)',
      titleAr: 'تم إغلاق الوردية والمصادقة (تقرير Z)',
      message: `Shift HIA-CTR-04 closed by ${roleConfig.userDisplayName}. Notes: ${notes || 'Zero discrepancy.'}`,
      messageAr: `تم إغلاق كاونتر 4. الملاحظات: ${notes || 'مطابقة تامة'}`,
      time: 'Just now',
      type: 'cash',
      read: false,
    };
    setNotifications((prev) => [auditNotif, ...prev]);

    addAuditLog(
      'EOD Shift Audited & Locked',
      'FINANCE',
      `Counter 4 drawer audited. Net cash: QAR ${countedCash.QAR.toLocaleString()}`
    );
  };

  const addExpense = (expenseData: Omit<FinanceExpense, 'id'>): { success: boolean; error?: string; expense?: FinanceExpense } => {
    if (!expenseData.description || !expenseData.amountQAR) {
      return { success: false, error: 'Please provide description and valid amount in QAR.' };
    }
    const newExp: FinanceExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    addAuditLog(
      'Company Expense Filed',
      'FINANCE',
      `${expenseData.category}: QAR ${Number(expenseData.amountQAR).toLocaleString()} (${expenseData.description}) filed by ${expenseData.requestedBy || roleConfig.userDisplayName}`
    );
    return { success: true, expense: newExp };
  };

  const updateExpense = (id: string, updated: Partial<FinanceExpense>): { success: boolean; error?: string } => {
    const existing = expenses.find((e) => e.id === id);
    if (!existing) return { success: false, error: 'Expense record not found' };

    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
    addAuditLog('Expense Record Modified', 'FINANCE', `Expense #${id} modified by ${roleConfig.userDisplayName}`);
    return { success: true };
  };

  const updateExpenseStatus = (id: string, status: FinanceExpense['status'], approvalNotes?: string): { success: boolean; error?: string } => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return { success: false, error: 'Expense record not found.' };

    const approvedBy = (status === 'Approved' || status === 'Paid') ? roleConfig.userDisplayName : target.approvedBy;
    const approvedAt = (status === 'Approved' || status === 'Paid' || status === 'Rejected') ? 'Just now' : target.approvedAt;

    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status,
              approvedBy,
              approvedAt,
              approvalNotes: approvalNotes !== undefined ? approvalNotes : e.approvalNotes,
            }
          : e
      )
    );

    // Create notification if status changes to Approved, Paid, or Rejected
    if (status === 'Approved' || status === 'Rejected' || status === 'Paid') {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Expense ${status}: ${target.category}`,
        titleAr: `تم تحديث حالة المصروف: ${target.category}`,
        message: `Expense #${target.id} (${target.amountQAR.toLocaleString()} QAR) was marked as "${status}" by ${roleConfig.userDisplayName}.${approvalNotes ? ` Notes: ${approvalNotes}` : ''}`,
        messageAr: `المصروف #${target.id} بقيمة ${target.amountQAR.toLocaleString()} ر.ق تم اعتماده/تحديثه إلى "${status}"`,
        time: 'Just now',
        type: 'cash',
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    addAuditLog(
      `Expense Status Updated: ${status}`,
      'FINANCE',
      `Expense #${id} (${target.amountQAR.toLocaleString()} QAR - ${target.category}) marked as "${status}" by ${roleConfig.userDisplayName}.${approvalNotes ? ` Remarks: ${approvalNotes}` : ''}`
    );

    return { success: true };
  };

  const deleteExpense = (id: string): { success: boolean; error?: string } => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return { success: false, error: 'Expense not found' };

    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addAuditLog('Expense Record Deleted', 'FINANCE', `Expense #${id} (${target.amountQAR} QAR) removed by ${roleConfig.userDisplayName}`);
    return { success: true };
  };

  const addAuditLog = (action: string, category: SystemAuditLog['category'], details: string) => {
    const newLog: SystemAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      actor: roleConfig.userDisplayName,
      role: roleConfig.title,
      action,
      category,
      details,
      status: 'SUCCESS',
    };
    setSystemLogs((prev) => [newLog, ...prev]);
  };

  const addPackage = (pkgData: Omit<TourPackage, 'id'>): { success: boolean; error?: string; pkg?: TourPackage } => {
    const inferredServiceType =
      pkgData.serviceType ||
      categoryServiceMap[pkgData.category] ||
      getServiceTypeForCategory(pkgData.category, pkgData.isMultiDay);
    const newPkg: TourPackage = {
      ...pkgData,
      serviceType: inferredServiceType,
      id: `pkg-${Date.now()}`,
    };
    setPackages((prev) => [newPkg, ...prev]);
    addAuditLog('New Tour Service Created', 'SYSTEM', `${roleConfig.userDisplayName} added ${newPkg.serviceType} "${newPkg.name}" (${newPkg.priceQAR} QAR)`);
    return { success: true, pkg: newPkg };
  };

  const updatePackage = (id: string, updated: Partial<TourPackage>): { success: boolean; error?: string } => {
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const merged = { ...p, ...updated };
          if (!merged.serviceType && merged.category) {
            merged.serviceType =
              categoryServiceMap[merged.category] ||
              getServiceTypeForCategory(merged.category, merged.isMultiDay);
          }
          return merged;
        }
        return p;
      })
    );
    addAuditLog('Tour Service Modified', 'SYSTEM', `${roleConfig.userDisplayName} updated package #${id}`);
    return { success: true };
  };

  const deletePackage = (id: string): { success: boolean; error?: string } => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('Tour Service Deleted', 'SYSTEM', `${roleConfig.userDisplayName} deleted package #${id}`);
    return { success: true };
  };

  const addPackageCategory = (categoryName: string, serviceType?: ServiceMainType): { success: boolean; error?: string } => {
    const trimmed = categoryName.trim();
    if (!trimmed) {
      return { success: false, error: 'Category name cannot be empty.' };
    }
    if (trimmed.toLowerCase() === 'all') {
      return { success: false, error: '"All" is a reserved catalog filter.' };
    }
    if (packageCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return { success: false, error: `Category "${trimmed}" already exists in the catalog.` };
    }
    const targetServiceType: ServiceMainType = serviceType || getServiceTypeForCategory(trimmed);
    setPackageCategories((prev) => [...prev, trimmed]);
    setCategoryServiceMap((prev) => ({
      ...prev,
      [trimmed]: targetServiceType,
    }));
    addAuditLog('Tour Package Category Created', 'SYSTEM', `${roleConfig.userDisplayName} created category "${trimmed}" under ${targetServiceType}`);
    return { success: true };
  };

  const deletePackageCategory = (categoryName: string): { success: boolean; error?: string } => {
    // Check if any package is currently using this category
    const countUsing = packages.filter((p) => p.category.toLowerCase() === categoryName.toLowerCase()).length;
    if (countUsing > 0) {
      return { success: false, error: `Cannot delete category "${categoryName}" because ${countUsing} active package(s) are assigned to it.` };
    }
    setPackageCategories((prev) => prev.filter((c) => c.toLowerCase() !== categoryName.toLowerCase()));
    setCategoryServiceMap((prev) => {
      const copy = { ...prev };
      delete copy[categoryName];
      return copy;
    });
    addAuditLog('Tour Package Category Deleted', 'SYSTEM', `${roleConfig.userDisplayName} removed category "${categoryName}"`);
    return { success: true };
  };

  // Airport Desks Management
  const addAirportDesk = (deskData: Omit<AirportDesk, 'id'>): { success: boolean; error?: string; desk?: AirportDesk } => {
    if (!deskData.deskName.trim()) {
      return { success: false, error: 'Desk name is required.' };
    }
    const newDesk: AirportDesk = {
      ...deskData,
      id: `desk-${Date.now()}`,
    };
    setAirportDesks((prev) => [...prev, newDesk]);
    addAuditLog('New Agent Desk Added', 'DISPATCH', `Added desk "${newDesk.deskName}" at ${newDesk.airportName} assigned to ${newDesk.assignedEmployeeName}`);
    return { success: true, desk: newDesk };
  };

  const updateAirportDesk = (id: string, updated: Partial<AirportDesk>): { success: boolean; error?: string } => {
    const existing = airportDesks.find((d) => d.id === id);
    setAirportDesks((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
    );

    // Sync with employee if assignedEmployeeId is modified
    if (updated.assignedEmployeeId) {
      const assignedEmp = employees.find((emp) => emp.id === updated.assignedEmployeeId);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === updated.assignedEmployeeId
            ? {
                ...emp,
                assignedDeskId: id,
                assignedDeskName: updated.deskName || (existing ? existing.deskName : emp.assignedDeskName),
                assignedAirport: existing ? existing.airportName : emp.assignedAirport,
                status: 'On Duty',
              }
            : emp
        )
      );

      // Record in Desk Assignment History if employee changed or new assignment
      if (!existing || existing.assignedEmployeeId !== updated.assignedEmployeeId) {
        const now = new Date();
        const dateFormatted = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const empName = assignedEmp ? assignedEmp.name : (updated.assignedEmployeeName || 'Assigned Staff');
        const empRole = assignedEmp ? assignedEmp.role : (updated.assignedEmployeeRole || 'Transit Desk Agent');
        const deskCode = updated.deskCode || existing?.deskCode || 'CTR-04';
        const deskName = updated.deskName || existing?.deskName || 'Agent Desk';
        const airportCode = updated.airportCode || existing?.airportCode || 'DOH';
        const terminal = updated.terminal || existing?.terminal || 'Terminal 1';

        const newRec: DeskAssignmentRecord = {
          id: `asg-${Date.now()}`,
          deskId: id,
          deskCode,
          deskName,
          airportCode,
          terminal,
          employeeId: updated.assignedEmployeeId,
          employeeName: empName,
          employeeRole: empRole,
          assignedDate: dateFormatted,
          shiftTiming: updated.shiftTiming || existing?.shiftTiming || 'Morning (06:00 - 14:30)',
          assignedBy: roleConfig.title || 'Operations Manager',
          status: 'Active',
          notes: updated.notes ? `Reassigned: ${updated.notes}` : `Stationed at ${deskCode} by ${roleConfig.userDisplayName}`,
        };

        setDeskAssignmentHistory((prev) => [
          newRec,
          ...prev.map((a) => (a.deskId === id && a.status === 'Active' ? { ...a, status: 'Completed' as const } : a)),
        ]);
      }
    }
    addAuditLog('Agent Desk Updated', 'DISPATCH', `Updated agent desk #${id} and synced with assigned staff and history`);
    return { success: true };
  };

  const deleteAirportDesk = (id: string): { success: boolean; error?: string } => {
    if (airportDesks.length <= 1) {
      return { success: false, error: 'At least one agent desk must remain active.' };
    }
    setAirportDesks((prev) => prev.filter((d) => d.id !== id));
    if (activeDeskId === id) {
      const remaining = airportDesks.filter((d) => d.id !== id);
      if (remaining.length > 0) setActiveDeskId(remaining[0].id);
    }
    addAuditLog('Agent Desk Removed', 'DISPATCH', `Removed agent desk #${id}`);
    return { success: true };
  };

  // Desk Staff Assignment History Methods ("kon date date kauke airport er desk a assign kora hoicilo oitar ekta history dekha jabe")
  const assignEmployeeToDesk = (deskId: string, employeeId: string, shiftTiming?: string, notes?: string): { success: boolean; error?: string } => {
    const targetDesk = airportDesks.find((d) => d.id === deskId);
    const targetEmp = employees.find((e) => e.id === employeeId);
    if (!targetDesk) return { success: false, error: 'Desk not found.' };
    if (!targetEmp) return { success: false, error: 'Employee not found.' };

    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newShift = shiftTiming || targetDesk.shiftTiming || 'Morning (06:00 - 14:30)';

    setAirportDesks((prev) =>
      prev.map((d) =>
        d.id === deskId
          ? {
              ...d,
              assignedEmployeeId: targetEmp.id,
              assignedEmployeeName: targetEmp.name,
              assignedEmployeeRole: targetEmp.role,
              shiftTiming: newShift,
            }
          : d
      )
    );

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              assignedDeskId: targetDesk.id,
              assignedDeskName: targetDesk.deskName,
              assignedAirport: targetDesk.airportName,
              status: 'On Duty',
            }
          : e
      )
    );

    const newAssignment: DeskAssignmentRecord = {
      id: `asg-${Date.now()}`,
      deskId: targetDesk.id,
      deskCode: targetDesk.deskCode,
      deskName: targetDesk.deskName,
      airportCode: targetDesk.airportCode,
      terminal: targetDesk.terminal,
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      employeeRole: targetEmp.role,
      assignedDate: dateFormatted,
      shiftTiming: newShift,
      assignedBy: roleConfig.title || 'Operations Manager',
      status: 'Active',
      notes: notes || `Stationed at ${targetDesk.deskCode} by ${roleConfig.userDisplayName}`,
    };

    setDeskAssignmentHistory((prev) => [
      newAssignment,
      ...prev.map((a) => (a.deskId === deskId && a.status === 'Active' ? { ...a, status: 'Completed' as const } : a)),
    ]);

    addAuditLog(
      'Desk Staff Assigned',
      'DISPATCH',
      `${targetEmp.name} assigned to counter ${targetDesk.deskCode} on ${dateFormatted}`
    );
    return { success: true };
  };

  const addDeskAssignmentRecord = (recordData: Omit<DeskAssignmentRecord, 'id'>): { success: boolean; error?: string; record?: DeskAssignmentRecord } => {
    const newRec: DeskAssignmentRecord = {
      ...recordData,
      id: `asg-${Date.now()}`,
    };
    setDeskAssignmentHistory((prev) => [newRec, ...prev]);
    addAuditLog('Desk Assignment Logged', 'DISPATCH', `Logged assignment for ${newRec.employeeName} to ${newRec.deskCode} (${newRec.assignedDate})`);
    return { success: true, record: newRec };
  };

  const deleteDeskAssignmentRecord = (id: string): { success: boolean; error?: string } => {
    setDeskAssignmentHistory((prev) => prev.filter((r) => r.id !== id));
    addAuditLog('Desk Assignment Record Removed', 'DISPATCH', `Deleted desk assignment history record #${id}`);
    return { success: true };
  };

  const resetAllDataToDefault = () => {
    try {
      localStorage.removeItem('artrust_bookings');
      localStorage.removeItem('artrust_airport_desks');
      localStorage.removeItem('artrust_desk_assignments');
      localStorage.removeItem('artrust_employees');
      localStorage.removeItem('artrust_guests');
      localStorage.removeItem('artrust_expenses');
      localStorage.removeItem('artrust_packages');
      localStorage.removeItem('artrust_package_categories');
      localStorage.removeItem('artrust_drivers');
      localStorage.removeItem('artrust_fleet_vehicles');
      localStorage.removeItem('artrust_salary_records');
      localStorage.removeItem('artrust_shift_drawer');
      localStorage.removeItem('artrust_system_logs');
      localStorage.removeItem('artrust_hotel_vendors');
      localStorage.removeItem('artrust_hotel_bookings');
    } catch {}
    setBookings(INITIAL_BOOKINGS);
    setAirportDesks(INITIAL_AIRPORT_DESKS);
    setDeskAssignmentHistory(INITIAL_DESK_ASSIGNMENT_HISTORY);
    setEmployees(INITIAL_EMPLOYEES);
    setGuests(INITIAL_GUESTS);
    setHotelVendors(INITIAL_HOTEL_VENDORS);
    setHotelBookings(INITIAL_HOTEL_BOOKINGS);
    setExpenses(INITIAL_FINANCE_EXPENSES);
    setPackages(TOUR_PACKAGES);
    setPackageCategories(INITIAL_PACKAGE_CATEGORIES);
    setDrivers(INITIAL_DRIVERS);
    setFleetVehicles(INITIAL_FLEET_VEHICLES);
    setSalaryRecords(INITIAL_SALARY_RECORDS);
    setShiftDrawer(INITIAL_SHIFT_DRAWER);
    setSystemLogs(INITIAL_SYSTEM_LOGS);
    addAuditLog('System Reset', 'SYSTEM', 'All application datasets restored to initial factory database state.');
  };

  // Employees Management
  const addEmployee = (empData: Omit<Employee, 'id'>): { success: boolean; error?: string; employee?: Employee } => {
    if (!empData.name.trim()) {
      return { success: false, error: 'Employee name is required.' };
    }
    const newId = `emp-${Math.floor(100 + Math.random() * 900)}`;
    const newEmployee: Employee = {
      ...empData,
      id: newId,
      monthlyRecords: empData.monthlyRecords && empData.monthlyRecords.length > 0 ? empData.monthlyRecords : [
        {
          month: 'October 2026',
          baseSalaryQAR: empData.baseSalaryMonthlyQAR,
          targetServices: empData.monthlyServiceTarget,
          completedServices: 0,
          targetMet: false,
          excessServices: 0,
          commissionRatePerService: empData.commissionPerServiceQAR,
          commissionEarnedQAR: 0,
          expensesReimbursedQAR: 0,
          deductionsQAR: 0,
          grossPayableQAR: empData.baseSalaryMonthlyQAR,
          amountPaidQAR: 0,
          amountDueQAR: empData.baseSalaryMonthlyQAR,
          status: 'Pending Payout',
          notes: 'New employee onboarded for current cycle.',
        }
      ],
      totalExpensesQAR: empData.totalExpensesQAR || 0,
      rating: empData.rating || 5.0,
    };
    setEmployees((prev) => [newEmployee, ...prev]);

    // If assigned to a desk, update that desk's assigned employee
    if (newEmployee.assignedDeskId) {
      setAirportDesks((prev) =>
        prev.map((d) =>
          d.id === newEmployee.assignedDeskId
            ? {
                ...d,
                assignedEmployeeId: newEmployee.id,
                assignedEmployeeName: newEmployee.name,
                assignedEmployeeRole: newEmployee.role,
              }
            : d
        )
      );
    }

    addAuditLog('New Staff / Employee Added', 'DISPATCH', `Registered employee "${newEmployee.name}" (${newEmployee.role}) at ${newEmployee.assignedAirport}`);
    return { success: true, employee: newEmployee };
  };

  const updateEmployee = (id: string, updated: Partial<Employee>): { success: boolean; error?: string } => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          return { ...emp, ...updated };
        }
        return emp;
      })
    );

    // If desk changed, sync with airportDesks
    if (updated.assignedDeskId && updated.name) {
      setAirportDesks((prev) =>
        prev.map((d) =>
          d.id === updated.assignedDeskId
            ? {
                ...d,
                assignedEmployeeId: id,
                assignedEmployeeName: updated.name || d.assignedEmployeeName,
                assignedEmployeeRole: updated.role || d.assignedEmployeeRole,
              }
            : d
        )
      );
    }

    addAuditLog('Employee Record Updated', 'DISPATCH', `Updated employee #${id} profile and salary parameters`);
    return { success: true };
  };

  const deleteEmployee = (id: string): { success: boolean; error?: string } => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    addAuditLog('Employee Removed', 'DISPATCH', `Removed employee #${id}`);
    return { success: true };
  };

  const recordEmployeeSalaryPayment = (employeeId: string, month: string, amountPaid: number, notes?: string): { success: boolean; error?: string } => {
    if (amountPaid <= 0) {
      return { success: false, error: 'Payment amount must be greater than 0.' };
    }
    let found = false;
    let targetEmployee: Employee | null = null;
    let isFullyPaid = false;

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          found = true;
          targetEmployee = emp;
          const updatedRecords = emp.monthlyRecords.map((rec) => {
            if (rec.month === month) {
              const newAmountPaid = rec.amountPaidQAR + amountPaid;
              const newAmountDue = Math.max(0, rec.grossPayableQAR - newAmountPaid);
              const newStatus = newAmountDue <= 0 ? 'Fully Paid' : 'Partially Paid';
              if (newAmountDue <= 0) isFullyPaid = true;
              return {
                ...rec,
                amountPaidQAR: newAmountPaid,
                amountDueQAR: newAmountDue,
                status: newStatus as any,
                paidDate: `Oct 09, 2026`,
                notes: notes ? `${rec.notes ? rec.notes + ' | ' : ''}${notes}` : rec.notes,
              };
            }
            return rec;
          });
          return { ...emp, monthlyRecords: updatedRecords };
        }
        return emp;
      })
    );

    if (found && targetEmployee) {
      const emp: Employee = targetEmployee;
      // 1. Sync with Finance Expenses: automatically add record
      addExpense({
        date: 'Oct 09, 2026',
        category: 'Chauffeur Per Diem',
        description: `Staff Salary Payout to ${emp.name} (${emp.role}) for ${month}${notes ? ` - ${notes}` : ''}`,
        amountQAR: amountPaid,
        approvedBy: roleConfig.userDisplayName,
        status: 'Paid',
        paymentMethod: 'QNB Bank Transfer',
        department: emp.department === 'Airport Desk' ? 'Airport Operations' : 'Administration',
        requestedBy: emp.name,
        requestedByRole: emp.role,
        deskId: emp.assignedDeskId,
        deskName: emp.assignedDeskName,
        receiptRef: `SAL-${Date.now().toString().slice(-5)}`,
      });

      // 2. Sync with Salary Records
      setSalaryRecords((prev) =>
        prev.map((s) => {
          if (s.employeeName.toLowerCase() === emp.name.toLowerCase()) {
            return {
              ...s,
              payoutStatus: isFullyPaid ? 'Paid' : 'Processing',
            };
          }
          return s;
        })
      );

      addAuditLog(
        'Salary Payment Disbursed & Synced',
        'FINANCE',
        `Disbursed ${amountPaid} QAR salary payment to ${emp.name} for ${month}. Synced with Company Expenses.`
      );
      return { success: true };
    }
    return { success: false, error: 'Employee or month record not found.' };
  };

  const addEmployeeExpense = (employeeId: string, month: string, expenseAmount: number, description: string): { success: boolean; error?: string } => {
    if (expenseAmount <= 0) {
      return { success: false, error: 'Expense amount must be greater than 0.' };
    }
    let found = false;
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          found = true;
          const updatedRecords = emp.monthlyRecords.map((rec) => {
            if (rec.month === month) {
              const newExpenses = rec.expensesReimbursedQAR + expenseAmount;
              const newGross = rec.baseSalaryQAR + rec.commissionEarnedQAR + newExpenses - rec.deductionsQAR;
              const newDue = Math.max(0, newGross - rec.amountPaidQAR);
              return {
                ...rec,
                expensesReimbursedQAR: newExpenses,
                grossPayableQAR: newGross,
                amountDueQAR: newDue,
                status: (newDue <= 0 ? 'Fully Paid' : 'Partially Paid') as any,
              };
            }
            return rec;
          });
          return {
            ...emp,
            totalExpensesQAR: (emp.totalExpensesQAR || 0) + expenseAmount,
            monthlyRecords: updatedRecords,
          };
        }
        return emp;
      })
    );

    addExpense({
      date: 'Just now',
      category: 'Hospitality / Karak',
      description: `Staff Reimbursement (${description})`,
      amountQAR: expenseAmount,
      approvedBy: roleConfig.userDisplayName,
      status: 'Paid',
      paymentMethod: 'Corporate Petty Cash',
    });

    if (found) {
      addAuditLog('Employee Expense Reimbursed', 'FINANCE', `Reimbursed ${expenseAmount} QAR (${description}) for employee #${employeeId}`);
      return { success: true };
    }
    return { success: false, error: 'Employee or month record not found.' };
  };

  // Guests Management
  const addGuest = (guestData: Omit<Guest, 'id'>): { success: boolean; error?: string; guest?: Guest } => {
    if (!guestData.name.trim()) {
      return { success: false, error: 'Guest name is required.' };
    }
    const newGuest: Guest = {
      ...guestData,
      id: `gst-${Math.floor(100 + Math.random() * 900)}`,
    };
    setGuests((prev) => [newGuest, ...prev]);
    addAuditLog('New Guest Profile Created', 'SYSTEM', `Registered traveler "${newGuest.name}" (${newGuest.nationality})`);
    return { success: true, guest: newGuest };
  };

  const updateGuest = (id: string, updated: Partial<Guest>): { success: boolean; error?: string } => {
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, ...updated } : g)));
    addAuditLog('Guest Profile Updated', 'SYSTEM', `Updated guest profile #${id}`);
    return { success: true };
  };

  const deleteGuest = (id: string): { success: boolean; error?: string } => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    addAuditLog('Guest Profile Removed', 'SYSTEM', `Removed guest #${id}`);
    return { success: true };
  };

  // Guest VIP Tiers & Discount Management
  const addGuestTier = (tierData: Omit<GuestTier, 'id'>): { success: boolean; error?: string; tier?: GuestTier } => {
    if (!tierData.name.trim()) {
      return { success: false, error: 'Tier name is required.' };
    }
    const newTier: GuestTier = {
      ...tierData,
      id: `tier-${Date.now()}`,
    };
    setGuestTiers((prev) => [...prev, newTier]);
    addAuditLog('New VIP Tier Created', 'SYSTEM', `Added VIP tier "${newTier.name}" with ${newTier.discountPercentage}% discount`);
    return { success: true, tier: newTier };
  };

  const updateGuestTier = (id: string, updated: Partial<GuestTier>): { success: boolean; error?: string } => {
    setGuestTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    addAuditLog('VIP Tier Updated', 'SYSTEM', `Modified VIP tier #${id}`);
    return { success: true };
  };

  const deleteGuestTier = (id: string): { success: boolean; error?: string } => {
    setGuestTiers((prev) => prev.filter((t) => t.id !== id));
    addAuditLog('VIP Tier Removed', 'SYSTEM', `Removed VIP tier #${id}`);
    return { success: true };
  };

  // Hotel Vendors & Qatar Luxury Hotel Partners
  const addHotelVendor = (vendorData: Omit<HotelVendor, 'id' | 'createdAt' | 'totalBookings' | 'totalRevenueQAR'>): { success: boolean; error?: string; vendor?: HotelVendor } => {
    if (!vendorData.name?.trim()) {
      return { success: false, error: 'Hotel vendor name is required.' };
    }
    const newId = `h-${Date.now().toString(36)}`;
    const newVendor: HotelVendor = {
      ...vendorData,
      id: newId,
      totalBookings: 0,
      totalRevenueQAR: 0,
      createdAt: new Date().toISOString().split('T')[0],
      desks: vendorData.desks || [],
      roomOptions: vendorData.roomOptions || [],
      amenities: vendorData.amenities || [],
    };
    setHotelVendors((prev) => [newVendor, ...prev]);
    addAuditLog('Hotel Vendor Added', 'DISPATCH', `Added Qatar hotel vendor "${newVendor.name}" in ${newVendor.locationZone}`);
    return { success: true, vendor: newVendor };
  };

  const updateHotelVendor = (id: string, updated: Partial<HotelVendor>): { success: boolean; error?: string } => {
    setHotelVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
    addAuditLog('Hotel Vendor Updated', 'DISPATCH', `Updated Qatar hotel vendor #${id}`);
    return { success: true };
  };

  const deleteHotelVendor = (id: string): { success: boolean; error?: string } => {
    setHotelVendors((prev) => prev.filter((v) => v.id !== id));
    addAuditLog('Hotel Vendor Removed', 'DISPATCH', `Deleted hotel vendor #${id}`);
    return { success: true };
  };

  const addRoomOptionToVendor = (vendorId: string, room: HotelRoomOption): { success: boolean; error?: string } => {
    setHotelVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, roomOptions: [...v.roomOptions, room] } : v))
    );
    return { success: true };
  };

  const addDeskToVendor = (vendorId: string, desk: HotelVendorDesk): { success: boolean; error?: string } => {
    setHotelVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, desks: [...v.desks, desk] } : v))
    );
    return { success: true };
  };

  // Hotel Booking System
  const addHotelBooking = (bookingData: Omit<HotelBooking, 'id' | 'confirmationCode' | 'createdAt'>): { success: boolean; error?: string; booking?: HotelBooking } => {
    if (!bookingData.guestName?.trim() || !bookingData.hotelId) {
      return { success: false, error: 'Guest name and hotel selection are required.' };
    }
    const newId = `hb-${Date.now().toString(36)}`;
    const confCode = `HTL-QA-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: HotelBooking = {
      ...bookingData,
      id: newId,
      confirmationCode: confCode,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setHotelBookings((prev) => [newBooking, ...prev]);

    // Update vendor bookings and revenue metrics
    setHotelVendors((prev) =>
      prev.map((v) => {
        if (v.id === bookingData.hotelId) {
          return {
            ...v,
            totalBookings: (v.totalBookings || 0) + 1,
            totalRevenueQAR: (v.totalRevenueQAR || 0) + bookingData.totalQAR,
          };
        }
        return v;
      })
    );

    // Sync with Shift Drawer & Agent Desk cash
    if (bookingData.paymentMethod === 'Cash') {
      setShiftDrawer((prev) => ({
        ...prev,
        currentCashDrawer: {
          ...prev.currentCashDrawer,
          QAR: prev.currentCashDrawer.QAR + bookingData.totalQAR,
        },
        transactionsCount: prev.transactionsCount + 1,
      }));
      if (bookingData.deskCode) {
        setAirportDesks((prev) =>
          prev.map((d) =>
            d.deskCode === bookingData.deskCode
              ? { ...d, currentDrawerCashQAR: (d.currentDrawerCashQAR || 0) + bookingData.totalQAR }
              : d
          )
        );
      }
    } else if (bookingData.paymentMethod === 'POS Card') {
      setShiftDrawer((prev) => ({
        ...prev,
        posCardTotalQAR: prev.posCardTotalQAR + bookingData.totalQAR,
        transactionsCount: prev.transactionsCount + 1,
      }));
    }

    addAuditLog(
      'Hotel Reservation Created',
      'POS',
      `Booked ${confCode} at ${newBooking.hotelName} for ${newBooking.guestName} (${newBooking.totalQAR} QAR)`
    );

    addNotification({
      title: `Hotel Reservation: ${confCode}`,
      titleAr: `تم تأكيد حجز فندق: ${confCode}`,
      message: `${newBooking.guestName} reserved ${newBooking.hotelName} (${newBooking.roomType}) for ${newBooking.totalQAR} QAR.`,
      messageAr: `تم تسجيل حجز الفندق للنزيل ${newBooking.guestName} في ${newBooking.hotelName}.`,
      time: 'Just now',
      type: 'hotel',
      read: false,
      actionLabel: 'View Hotel Reservation',
    });

    return { success: true, booking: newBooking };
  };

  const updateHotelBooking = (id: string, updated: Partial<HotelBooking>): { success: boolean; error?: string } => {
    setHotelBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
    addAuditLog('Hotel Reservation Updated', 'POS', `Updated hotel booking #${id}`);
    return { success: true };
  };

  const cancelHotelBooking = (id: string, reason?: string): { success: boolean; error?: string } => {
    setHotelBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              bookingStatus: 'Cancelled' as const,
              specialRequests: reason ? `${b.specialRequests ? b.specialRequests + ' | ' : ''}Cancellation Note: ${reason}` : b.specialRequests,
            }
          : b
      )
    );
    addAuditLog('Hotel Reservation Cancelled', 'POS', `Cancelled booking #${id}${reason ? ` (${reason})` : ''}`);
    return { success: true };
  };

  const updateHotelBookingStatus = (id: string, status: HotelBooking['bookingStatus']): { success: boolean; error?: string } => {
    setHotelBookings((prev) => prev.map((b) => (b.id === id ? { ...b, bookingStatus: status } : b)));
    addAuditLog('Hotel Booking Status Updated', 'POS', `Updated status of hotel booking #${id} to ${status}`);
    return { success: true };
  };

  const addNotification = (notif: Omit<NotificationItem, 'id'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: notif.time || 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
    setLatestToastNotification(newNotif);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setLatestToastNotification(null);
  };

  const toggleLiveFeed = () => {
    setLiveFeedEnabled((prev) => !prev);
  };

  const dismissToastNotification = () => {
    setLatestToastNotification(null);
  };

  const openModal = (modal: string, data?: any) => {
    setActiveModal(modal);
    setModalData(data || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  return (
    <AppContext.Provider
      value={{
        userAccounts,
        currentUser,
        isAuthenticated,
        login,
        logout,
        signup,
        updateUserAccount,
        addUserAccount,
        deleteUserAccount,
        resetUserPassword,
        currentRole,
        setRole,
        roleConfig,
        language,
        setLanguage,
        currency,
        setCurrency,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        dateFilter,
        setDateFilter,
        resetDateFilter,
        rates,
        updateRates,
        convertAmount,
        bookings,
        addBooking,
        updateBooking,
        deleteBooking,
        updateBookingStatus,
        toggleVoucherSent,
        drivers,
        updateDriverStatus,
        addDriver,
        updateDriver,
        deleteDriver,
        fleetVehicles,
        addFleetVehicle,
        updateFleetVehicle,
        deleteFleetVehicle,
        syncWebsiteFleet,
        tourGuides,
        assignDriverAndGuide,
        approveBooking,
        salaryRecords,
        updateSalaryPayout,
        commissionRules,
        updateCommissionRule,
        packages,
        packageCategories,
        categoryServiceMap,
        addPackage,
        updatePackage,
        deletePackage,
        addPackageCategory,
        deletePackageCategory,
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
        resetAllDataToDefault,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        recordEmployeeSalaryPayment,
        addEmployeeExpense,
        guests,
        addGuest,
        updateGuest,
        deleteGuest,
        guestTiers,
        addGuestTier,
        updateGuestTier,
        deleteGuestTier,
        hotelVendors,
        addHotelVendor,
        updateHotelVendor,
        deleteHotelVendor,
        addRoomOptionToVendor,
        addDeskToVendor,
        hotelBookings,
        addHotelBooking,
        updateHotelBooking,
        cancelHotelBooking,
        updateHotelBookingStatus,
        flights,
        shiftDrawer,
        updateDrawerCash,
        closeShiftAndAudit,
        currencies,
        addCurrencyItem,
        updateCurrencyItem,
        deleteCurrencyItem,
        currencyHistory,
        addCurrencyHistoryRecord,
        updateCurrencyHistoryRecord,
        deleteCurrencyHistoryRecord,
        expenses,
        addExpense,
        updateExpense,
        updateExpenseStatus,
        deleteExpense,
        systemLogs,
        addAuditLog,
        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        liveFeedEnabled,
        toggleLiveFeed,
        latestToastNotification,
        dismissToastNotification,
        activeModal,
        modalData,
        openModal,
        closeModal,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        t,
      }}
    >
      <div className={theme === 'dark' ? 'dark' : ''}>{children}</div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
