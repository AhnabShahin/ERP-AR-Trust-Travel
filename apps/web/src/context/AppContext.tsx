'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { tabFromPath, adminPath } from '../config/adminTabs';
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
import { api, authApi, ApiError } from '../../lib/api';
import { useResourceSync, useSettingSync } from '../../lib/data';
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
  Location,
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
  dataHydrated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserAccount }>;
  logout: () => void;
  signup: (account: Omit<UserAccount, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string; user?: UserAccount; pendingActivation?: boolean }>;
  updateUserAccount: (id: string, updates: Partial<UserAccount>) => { success: boolean; error?: string };
  addUserAccount: (account: Omit<UserAccount, 'id' | 'createdAt'>) => { success: boolean; error?: string; user?: UserAccount };
  deleteUserAccount: (id: string) => { success: boolean; error?: string };
  resetUserPassword: (id: string, newPassword: string) => { success: boolean; error?: string };

  // Role & Permissions
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  roleConfig: RoleConfig;
  /** Fixed role catalogue from the API (for role pickers in user management). */
  roles: RoleCatalogItem[];

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
  /** Convert an amount entered in the active display currency back to the QAR
   *  base for storage. Identity when the active currency is QAR. */
  toQAR: (amountInActiveCurrency: number, sourceCurrency?: Currency) => number;

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

  // Locations (airports + resorts) Management
  locations: Location[];
  addLocation: (location: Omit<Location, 'id'>) => { success: boolean; error?: string; location?: Location };
  updateLocation: (id: string, updates: Partial<Location>) => { success: boolean; error?: string };
  deleteLocation: (id: string) => { success: boolean; error?: string };

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
  deleteNotification: (id: string) => void;
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

// Catalogue the public website fetches on the server (SSR) and hands to the
// provider so the first render already contains live data instead of empty
// arrays. The client-side hydration effects below still refresh it.
export interface InitialCatalog {
  packages?: TourPackage[];
  fleetVehicles?: FleetVehicle[];
  currencies?: CurrencyItem[];
}

// One entry of the fixed role catalogue served by GET /api/roles.
export interface RoleCatalogItem {
  key: UserRole;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  defaultTab: string;
  dashboardSlug: string;
}

export const AppProvider: React.FC<{
  children: React.ReactNode;
  initialCatalog?: InitialCatalog;
}> = ({ children, initialCatalog }) => {
  // User Accounts State (Persistent)
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('artrust_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null; // No implicit user — require a real login.
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('artrust_is_authenticated');
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return false; // Require authentication before showing the ERP console.
  });

  // Active Role state: default to role from URL slug if visiting a specific dashboard slug, or currentUser's role, or 'super-admin'
  // A user's role is fixed on their account — not derived from the URL and
  // never switched at runtime. currentRole simply mirrors the signed-in user.
  const [currentRole, setCurrentRole] = useState<UserRole>(
    () => currentUser?.role || 'super-admin'
  );
  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS['super-admin'];

  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('QAR');
  // Start from a deterministic default so the server and the client's first
  // (hydration) render agree — localStorage isn't available during SSR, so
  // reading it in the initializer would make the two renders differ and
  // trigger a hydration mismatch. The stored theme is applied in an effect
  // after mount (see below).
  const [theme, setTheme] = useState<Theme>('dark');
  const themeHydrated = React.useRef(false);
  // Navigation is URL-backed: the active console tab is derived from the current
  // /admin/<tab> path, and switching tabs is a real route push — so every menu
  // item has its own URL and a reload (or shared link) lands on the same page.
  const pathname = usePathname();
  const router = useRouter();
  const activeTab = tabFromPath(pathname);
  const setActiveTab = (tab: string) => {
    router.push(adminPath(tab));
  };
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rates, setRates] = useState<ExchangeRates>(INITIAL_RATES); // hydrated from settings

  // Persistent Real Production Datasets (never lose user input or CRUD changes)
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>(initialCatalog?.fleetVehicles ?? []);
  const [flights] = useState<FlightInfo[]>(INITIAL_FLIGHTS); // live flight board — no DB table
  const [shiftDrawer, setShiftDrawer] = useState<ShiftDrawer>(INITIAL_SHIFT_DRAWER); // hydrated from settings
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [latestToastNotification, setLatestToastNotification] = useState<NotificationItem | null>(null);
  // Ids we've already surfaced, so the real-time poll only toasts genuinely new
  // notifications (not our own optimistic creates or the initial backlog).
  const notifSeenIds = useRef<Set<string>>(new Set());
  const [liveFeedEnabled, setLiveFeedEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('artrust_live_feed');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [expenses, setExpenses] = useState<FinanceExpense[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemAuditLog[]>([]);
  const [tourGuides, setTourGuides] = useState<TourGuide[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>(initialCatalog?.packages ?? []);
  const [packageCategories, setPackageCategories] = useState<string[]>(INITIAL_PACKAGE_CATEGORIES); // hydrated from settings
  const [categoryServiceMap, setCategoryServiceMap] = useState<Record<string, ServiceMainType>>(INITIAL_CATEGORY_SERVICE_MAP); // hydrated from settings

  // Airport & Hotel Partner Agent Desks State
  const [airportDesks, setAirportDesks] = useState<AirportDesk[]>([]);
  // Locations (airports + resorts) — the source for the desk location picker.
  const [locations, setLocations] = useState<Location[]>([]);
  const [deskAssignmentHistory, setDeskAssignmentHistory] = useState<DeskAssignmentRecord[]>([]);
  const [activeDeskId, setActiveDeskId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('artrust_active_desk_id');
      if (saved) return saved;
    } catch {}
    return 'desk-hia-01';
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestTiers, setGuestTiers] = useState<GuestTier[]>([]);
  const [hotelVendors, setHotelVendors] = useState<HotelVendor[]>([]);
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);

  // Multi-Currency Treasury & Vault Reserves State
  const [currencies, setCurrencies] = useState<CurrencyItem[]>(initialCatalog?.currencies ?? []);

  // Fixed role catalogue served by the API (GET /api/roles). Used to populate
  // role pickers (e.g. user management). Roles are fixed; this is read-only.
  const [roles, setRoles] = useState<RoleCatalogItem[]>([]);

  // Historical Exchange Rates & Vault Reserves Ledger
  const [currencyHistory, setCurrencyHistory] = useState<CurrencyHistoryRecord[]>([]);

  // Date & Year Filter state
  const [dateFilter, setDateFilter] = useState<DateFilterState>(DEFAULT_DATE_FILTER);
  const resetDateFilter = () => setDateFilter(DEFAULT_DATE_FILTER);

  const activeDesk = airportDesks.find((d) => d.id === activeDeskId) || airportDesks[0];

  // Modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  // Sidebar Layout state
  // Open by default on desktop, collapsed by default on mobile so the slide-over
  // sidebar doesn't cover the content on first load.
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(
    () => (typeof window === 'undefined' ? true : window.innerWidth >= 768)
  );
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // True once all collections have been loaded from the API (MySQL).
  const [dataHydrated, setDataHydrated] = useState<boolean>(false);

  useEffect(() => {
    // Update document dir and lang attribute
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Apply the persisted theme once, after mount. Runs before the persist
  // effect below (declared later) on first commit, so we read the stored
  // value into state before anything writes the default back.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('artrust_theme');
      if (saved === 'light' || saved === 'dark') setTheme(saved);
    } catch {
      // ignore
    }
    themeHydrated.current = true;
  }, []);

  useEffect(() => {
    // Don't persist/apply the theme until we've read the stored value, so the
    // default never clobbers a user's saved preference on first mount.
    if (!themeHydrated.current) return;
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

  // ---- Public catalogue for the marketing website — loads WITHOUT login so
  // the homepage shows live packages & fleet from MySQL (public GET routes).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [pkg, fl] = await Promise.all([
        api.get<TourPackage[]>('/api/tour-packages?take=200').catch(() => null),
        api.get<FleetVehicle[]>('/api/fleet?take=200').catch(() => null),
      ]);
      if (cancelled) return;
      if (pkg?.length) setPackages(pkg);
      if (fl?.length) setFleetVehicles(fl);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Hydrate every collection from the live API (MySQL is the source of
  // truth). Runs once the user is authenticated; on failure the app keeps the
  // locally-loaded fallback data so it still works offline.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      const q = '?take=200';
      const load = <T,>(p: string) => api.get<T[]>(`/api/${p}${q}`).catch(() => null);
      try {
        const [bk, dr, fl, tg, gs, gt, hv, hb, emp, exp, cur, ch, pkg, ad, loc, da, notif] =
          await Promise.all([
            load<Booking>('bookings'),
            load<Driver>('drivers'),
            load<FleetVehicle>('fleet'),
            load<TourGuide>('tour-guides'),
            load<Guest>('guests'),
            load<GuestTier>('guest-tiers'),
            load<HotelVendor>('hotel-vendors'),
            load<HotelBooking>('hotel-bookings'),
            // Staff are users (role=staff) + their ledger; the API returns them
            // in the legacy Employee shape so this view stays unchanged.
            load<Employee>('staff'),
            load<FinanceExpense>('expenses'),
            load<CurrencyItem>('currencies'),
            load<CurrencyHistoryRecord>('currency-history'),
            load<TourPackage>('tour-packages'),
            load<AirportDesk>('airport-desks'),
            load<Location>('locations'),
            load<DeskAssignmentRecord>('desk-assignments'),
            load<NotificationItem>('notifications'),
          ]);
        if (cancelled) return;
        if (bk?.length) setBookings(bk);
        if (dr?.length) setDrivers(dr);
        if (fl?.length) setFleetVehicles(fl);
        if (tg?.length) setTourGuides(tg);
        if (gs?.length) setGuests(gs);
        if (gt?.length) setGuestTiers(gt);
        if (hv?.length) setHotelVendors(hv);
        if (hb?.length) setHotelBookings(hb);
        if (emp?.length) setEmployees(emp);
        if (exp?.length) setExpenses(exp);
        if (cur?.length) setCurrencies(cur);
        if (ch?.length) setCurrencyHistory(ch);
        if (pkg?.length) setPackages(pkg);
        if (ad?.length) setAirportDesks(ad);
        if (loc?.length) setLocations(loc);
        if (da?.length) setDeskAssignmentHistory(da);
        if (notif?.length) {
          setNotifications(notif);
          // Seed the "seen" set so the first real-time poll doesn't toast the backlog.
          for (const n of notif) if (n?.id) notifSeenIds.current.add(n.id);
        }

        // Users + payroll/audit lists + fixed role catalogue + singleton config.
        const [usr, sal, com, logs, rol, rt, sd, pc, csm, actCur] = await Promise.all([
          load<UserAccount>('users'),
          load<SalaryRecord>('salary-records'),
          load<CommissionRule>('commission-rules'),
          load<SystemAuditLog>('audit-logs'),
          api.get<RoleCatalogItem[]>('/api/roles').catch(() => null),
          api.get<ExchangeRates>('/api/settings/rates').catch(() => null),
          api.get<ShiftDrawer>('/api/settings/shiftDrawer').catch(() => null),
          api.get<string[]>('/api/settings/packageCategories').catch(() => null),
          api.get<Record<string, ServiceMainType>>('/api/settings/categoryServiceMap').catch(() => null),
          api.get<string | null>('/api/settings/activeCurrency').catch(() => null),
        ]);
        if (cancelled) return;
        if (usr?.length) setUserAccounts(usr);
        if (sal?.length) setSalaryRecords(sal);
        if (com?.length) setCommissionRules(com);
        if (logs?.length) setSystemLogs(logs);
        if (rol?.length) setRoles(rol);
        if (rt) setRates(rt);
        if (sd) setShiftDrawer(sd);
        if (pc?.length) setPackageCategories(pc);
        if (csm && Object.keys(csm).length) setCategoryServiceMap(csm);
        if (actCur && typeof actCur === 'string') setCurrency(actCur as Currency);
      } catch (e) {
        console.error('[hydrate] failed, using local fallback:', (e as Error).message);
      } finally {
        if (!cancelled) setDataHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Surface a toast when a background write to the API fails.
  const notifySyncError = React.useCallback((message: string) => {
    setLatestToastNotification({
      id: `sync-err-${Date.now()}`,
      title: 'Sync issue',
      titleAr: 'تنبيه المزامنة',
      message,
      messageAr: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'cash',
      read: false,
    });
  }, []);

  // ---- Live write-through: mirror every CRUD change to MySQL via the API.
  // Replaces the old localStorage persistence for all business collections.
  // Persist user-account CRUD (create / activate / role change / delete) to the
  // API so accounts, and especially activation, are the DB's source of truth.
  useResourceSync('users', userAccounts as never, dataHydrated, notifySyncError);
  useResourceSync('bookings', bookings as never, dataHydrated, notifySyncError);
  useResourceSync('drivers', drivers as never, dataHydrated, notifySyncError);
  useResourceSync('fleet', fleetVehicles as never, dataHydrated, notifySyncError);
  useResourceSync('tour-guides', tourGuides as never, dataHydrated, notifySyncError);
  useResourceSync('guests', guests as never, dataHydrated, notifySyncError);
  useResourceSync('guest-tiers', guestTiers as never, dataHydrated, notifySyncError);
  useResourceSync('hotel-vendors', hotelVendors as never, dataHydrated, notifySyncError);
  useResourceSync('hotel-bookings', hotelBookings as never, dataHydrated, notifySyncError);
  // The `employees` collection is backed by the staff endpoint (users + ledger).
  useResourceSync('staff', employees as never, dataHydrated, notifySyncError);
  useResourceSync('expenses', expenses as never, dataHydrated, notifySyncError);
  useResourceSync('currencies', currencies as never, dataHydrated, notifySyncError);
  useResourceSync('currency-history', currencyHistory as never, dataHydrated, notifySyncError);
  useResourceSync('tour-packages', packages as never, dataHydrated, notifySyncError);
  useResourceSync('airport-desks', airportDesks as never, dataHydrated, notifySyncError);
  useResourceSync('locations', locations as never, dataHydrated, notifySyncError);
  useResourceSync('desk-assignments', deskAssignmentHistory as never, dataHydrated, notifySyncError);

  // ---- Payroll / audit lists + singleton config → live API (MySQL).
  useResourceSync('salary-records', salaryRecords as never, dataHydrated, notifySyncError);
  useResourceSync('commission-rules', commissionRules as never, dataHydrated, notifySyncError);
  useResourceSync('audit-logs', systemLogs as never, dataHydrated, notifySyncError);
  useSettingSync('rates', rates, dataHydrated, notifySyncError);
  // Single global active display currency — persisted so every console shows
  // the same currency and the choice survives reloads.
  useSettingSync('activeCurrency', currency, dataHydrated, notifySyncError);
  useSettingSync('shiftDrawer', shiftDrawer, dataHydrated, notifySyncError);
  useSettingSync('packageCategories', packageCategories, dataHydrated, notifySyncError);
  useSettingSync('categoryServiceMap', categoryServiceMap, dataHydrated, notifySyncError);

  // ---- Remaining per-session UI preference — stays in localStorage.
  useEffect(() => {
    try { localStorage.setItem('artrust_active_desk_id', activeDeskId); } catch {}
  }, [activeDeskId]);

  useEffect(() => {
    try { localStorage.setItem('artrust_live_feed', JSON.stringify(liveFeedEnabled)); } catch {}
  }, [liveFeedEnabled]);

  // ---- Real-time notification feed. Polls the API so notifications raised by
  // any user/session (bookings, approvals, payroll, EOD audits, …) surface
  // live across every open dashboard. MySQL is the source of truth; the fetched
  // list replaces local state, and genuinely new unread items pop a toast.
  // Gated by `liveFeedEnabled` so the toggle controls live updates.
  useEffect(() => {
    if (!isAuthenticated || !liveFeedEnabled) return;
    let cancelled = false;

    const poll = async () => {
      const rows = await api
        .get<NotificationItem[]>('/api/notifications?take=50')
        .catch(() => null);
      if (cancelled || !rows) return;

      // Normalise nullable Arabic fields the API may return as null.
      const list = rows.map((n) => ({
        ...n,
        titleAr: n.titleAr ?? '',
        messageAr: n.messageAr ?? '',
        time: n.time ?? '',
      }));

      // Toast the newest notification we haven't surfaced yet (cross-session).
      const unseen = list.filter((n) => n.id && !notifSeenIds.current.has(n.id));
      for (const n of list) if (n.id) notifSeenIds.current.add(n.id);
      const toast = unseen.find((n) => !n.read);
      if (toast) setLatestToastNotification(toast);

      setNotifications(list);
    };

    poll();
    const interval = setInterval(poll, 20000); // refresh every 20s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated, liveFeedEnabled]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // User accounts write-through to the API (passwords hashed server-side).
  useResourceSync('users', userAccounts as never, dataHydrated, notifySyncError);

  const login = async (
    usernameOrEmail: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: UserAccount }> => {
    const query = usernameOrEmail.trim();

    // 1) Try the live backend API first (JWT auth against MySQL).
    try {
      const { user: apiUser } = await authApi.login({ username: query, password });
      const existingLocal = userAccounts.find(
        (u) => u.username.toLowerCase() === apiUser.username.toLowerCase()
      );
      const mergedUser = {
        ...(existingLocal || {}),
        ...apiUser,
        password,
        lastLogin: 'Just now',
      } as UserAccount;

      setCurrentUser(mergedUser);
      setCurrentRole(mergedUser.role);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('artrust_current_user', JSON.stringify(mergedUser));
        localStorage.setItem('artrust_is_authenticated', JSON.stringify(true));
      } catch {}
      addAuditLog('User Login', 'SECURITY', `${mergedUser.name} (${mergedUser.username}) signed in as ${mergedUser.role}.`);
      return { success: true, user: mergedUser };
    } catch (err) {
      // If the API is up and rejected the login, surface its reason instead of
      // silently falling back to local accounts.
      if (err instanceof ApiError) {
        if (err.status === 403) {
          return {
            success: false,
            error: 'This account is inactive — it is pending activation by an admin.',
          };
        }
        return { success: false, error: 'Invalid username or password.' };
      }
      // Non-API error (network / API down) → fall back to local accounts below.
    }

    // 2) Local fallback (offline / API down / local-only accounts).
    const q = query.toLowerCase();
    const account = userAccounts.find(
      (u) => u.username.toLowerCase() === q || u.email.toLowerCase() === q
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
    authApi.logout(); // clear the stored JWT
    try {
      localStorage.setItem('artrust_is_authenticated', JSON.stringify(false));
    } catch {}
    addAuditLog('User Logout', 'SECURITY', `${currentUser?.name || 'User'} logged out.`);
  };

  const signup = async (
    data: Omit<UserAccount, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; error?: string; user?: UserAccount; pendingActivation?: boolean }> => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    if (userAccounts.some((u) => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: 'Username is already taken. Please choose another.' };
    }
    if (userAccounts.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email is already registered. Please login instead.' };
    }

    // Public signup always creates an INACTIVE customer account on the backend.
    // We deliberately do NOT authenticate the user — an admin must activate the
    // account first. The returned `pendingActivation` tells the UI to show a
    // "waiting for approval" message instead of logging the user in.
    try {
      const { user: apiUser } = await authApi.register({
        name: data.name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: data.password,
        phone: data.phone,
      });
      addAuditLog(
        'Account Created',
        'SECURITY',
        `New customer signup pending activation: ${apiUser.name} (${apiUser.username}).`
      );
      return { success: true, user: { ...apiUser, password: data.password } as UserAccount, pendingActivation: true };
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        return { success: false, error: 'Username or email is already registered. Please login instead.' };
      }
      // Other errors (API down) → fall through to a local (inactive) record.
    }

    const newAccount: UserAccount = {
      ...data,
      id: `usr-${Date.now().toString(36)}`,
      username: data.username.trim(),
      email: data.email.trim(),
      role: 'customer',
      status: 'inactive',
      lastLogin: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
    };

    addAuditLog('Account Created', 'SECURITY', `New customer signup pending activation: ${newAccount.name} (${newAccount.username}).`);
    return { success: true, user: newAccount, pendingActivation: true };
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
      // New accounts always start inactive and must be activated by an admin.
      status: 'inactive',
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

    // Navigation to the role's default tab is handled by setActiveTab above
    // (URL-backed, pushes /admin/<defaultTab>).

    // Add log
    addAuditLog('Role Context Switched', 'SECURITY', `User role switched to ${targetConfig.title}`);
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key]) {
      return TRANSLATIONS[key][language] || TRANSLATIONS[key].en;
    }
    return key;
  };

  // How many QAR one unit of `curr` is worth. Driven by the live Currency CRUD
  // list (`rateToQAR`); falls back to the legacy fixed `rates` for the original
  // codes, then to 1 (treat unknown as parity with QAR).
  const getCurrencyRate = (curr: Currency): number => {
    if (curr === 'QAR') return 1;
    const item = currencies.find((c) => c.code === curr);
    if (item && item.rateToQAR > 0) return item.rateToQAR;
    const legacy = (rates as unknown as Record<string, number>)[curr as string];
    if (typeof legacy === 'number' && legacy > 0) return legacy;
    return 1;
  };

  // Resolve the display symbol for a currency from the CRUD list, with sensible
  // fallbacks for the well-known codes.
  const getCurrencySymbol = (curr: Currency): string => {
    if (curr === 'QAR') return language === 'ar' ? 'ر.ق' : 'QAR';
    const item = currencies.find((c) => c.code === curr);
    if (item?.symbol) return item.symbol;
    const fallback: Record<string, string> = { USD: '$', EUR: '€', GBP: '£' };
    return fallback[curr as string] ?? (curr as string);
  };

  const updateRates = (newRates: Partial<ExchangeRates>) => {
    setRates((prev) => ({
      ...prev,
      ...newRates,
      lastUpdated: 'Manual Super Admin Override',
    }));
    addAuditLog('Exchange Rates Modified', 'FINANCE', `Rates updated: USD: ${newRates.USD ?? rates.USD}, EUR: ${newRates.EUR ?? rates.EUR}`);
  };

  // Convert a stored QAR amount into the target (default: active) currency for
  // display. QAR is the base, so target = amountQAR / rateToQAR(target).
  const convertAmount = (amountQAR: number, targetCurrency: Currency = currency) => {
    const rateToQAR = getCurrencyRate(targetCurrency);
    const symbol = getCurrencySymbol(targetCurrency);
    const calculated = (Number(amountQAR) || 0) / (rateToQAR || 1);
    return {
      amount: calculated,
      formatted: `${symbol} ${calculated.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
      symbol,
    };
  };

  // Convert an amount the user typed in the active (or given) display currency
  // back into the QAR base for storage. Identity when the source is QAR.
  const toQAR = (amountInActiveCurrency: number, sourceCurrency: Currency = currency): number => {
    const rateToQAR = getCurrencyRate(sourceCurrency);
    return (Number(amountInActiveCurrency) || 0) * (rateToQAR || 1);
  };

  // Multi-Currency Treasury Management Methods
  const addCurrencyItem = (item: CurrencyItem): { success: boolean; error?: string } => {
    const cleanCode = item.code.trim().toUpperCase();
    if (!cleanCode) return { success: false, error: 'Currency code is required.' };
    if (currencies.some((c) => c.code === cleanCode)) {
      return { success: false, error: `Currency ${cleanCode} already exists.` };
    }
    // A new currency MUST declare its value against the QAR base. QAR itself is
    // always parity (1.0) and never needs a user-supplied rate.
    const rate = Number(item.rateToQAR);
    if (cleanCode !== 'QAR' && (!Number.isFinite(rate) || rate <= 0)) {
      return { success: false, error: `A positive rate to QAR is required for ${cleanCode}.` };
    }
    const cleanItem: CurrencyItem = {
      ...item,
      code: cleanCode,
      rateToQAR: cleanCode === 'QAR' ? 1.0 : rate,
      cashVaultBalance: Number(item.cashVaultBalance) || 0,
    };

    // Fresh-project guard: QAR is the sovereign base every rate references, so
    // if it isn't registered yet, seed the canonical QAR row first (it syncs to
    // the DB via useResourceSync like any other currency).
    const needsQarSeed = cleanCode !== 'QAR' && !currencies.some((c) => c.code === 'QAR');
    const qarBase: CurrencyItem = {
      code: 'QAR',
      name: 'Qatari Riyal (Base Currency)',
      symbol: 'ر.ق',
      rateToQAR: 1.0,
      isPegged: true,
      peggedNote: 'QCB Sovereign Base Currency',
      cashVaultBalance: 0,
    } as CurrencyItem;

    setCurrencies((prev) => [...(needsQarSeed ? [qarBase] : []), ...prev, cleanItem]);
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
    if (code === currency) {
      return { success: false, error: `${code} is the active display currency. Switch the active currency first.` };
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

    addNotification({
      title: 'Shift Audit Closed & Filed (Z-Report)',
      titleAr: 'تم إغلاق الوردية والمصادقة (تقرير Z)',
      message: `Shift HIA-CTR-04 closed by ${roleConfig.userDisplayName}. Notes: ${notes || 'Zero discrepancy.'}`,
      messageAr: `تم إغلاق كاونتر 4. الملاحظات: ${notes || 'مطابقة تامة'}`,
      time: 'Just now',
      type: 'cash',
      read: false,
    });

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
      addNotification({
        title: `Expense ${status}: ${target.category}`,
        titleAr: `تم تحديث حالة المصروف: ${target.category}`,
        message: `Expense #${target.id} (${target.amountQAR.toLocaleString()} QAR) was marked as "${status}" by ${roleConfig.userDisplayName}.${approvalNotes ? ` Notes: ${approvalNotes}` : ''}`,
        messageAr: `المصروف #${target.id} بقيمة ${target.amountQAR.toLocaleString()} ر.ق تم اعتماده/تحديثه إلى "${status}"`,
        time: 'Just now',
        type: 'cash',
        read: false,
      });
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
  // ---- Locations (airports + resorts) CRUD. Synced to /api/locations. ----
  const addLocation = (
    data: Omit<Location, 'id'>
  ): { success: boolean; error?: string; location?: Location } => {
    if (!data.name?.trim()) return { success: false, error: 'Location name is required.' };
    if (!data.code?.trim()) return { success: false, error: 'Location code is required.' };
    const code = data.code.trim().toUpperCase();
    if (locations.some((l) => l.code.toUpperCase() === code)) {
      return { success: false, error: `A location with code "${code}" already exists.` };
    }
    const newLocation: Location = {
      ...data,
      id: `loc-${Date.now().toString(36)}`,
      code,
      active: data.active ?? true,
    };
    setLocations((prev) => [...prev, newLocation]);
    addAuditLog('Location Added', 'SYSTEM', `Added ${data.type} location "${data.name}" (${code}).`);
    return { success: true, location: newLocation };
  };

  const updateLocation = (
    id: string,
    updates: Partial<Location>
  ): { success: boolean; error?: string } => {
    const existing = locations.find((l) => l.id === id);
    if (!existing) return { success: false, error: 'Location not found.' };
    if (updates.code) {
      const code = updates.code.trim().toUpperCase();
      if (locations.some((l) => l.id !== id && l.code.toUpperCase() === code)) {
        return { success: false, error: `Code "${code}" is already in use.` };
      }
      updates = { ...updates, code };
    }
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
    return { success: true };
  };

  const deleteLocation = (id: string): { success: boolean; error?: string } => {
    const inUse = airportDesks.some((d) => d.locationId === id);
    if (inUse) {
      return { success: false, error: 'This location is used by one or more desks. Reassign them first.' };
    }
    setLocations((prev) => prev.filter((l) => l.id !== id));
    return { success: true };
  };

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

  // Create a notification: optimistic local update + write-through to the API
  // (MySQL is the source of truth; the client id is honoured server-side so the
  // optimistic row and the polled row dedupe). Fire-and-forget — the poll
  // reconciles. Callers across the app use this for every real alert.
  const addNotification = (notif: Omit<NotificationItem, 'id'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: notif.time || 'Just now',
      read: false,
    };
    notifSeenIds.current.add(newNotif.id);
    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
    setLatestToastNotification(newNotif);
    if (isAuthenticated) {
      api
        .post('/api/notifications', {
          id: newNotif.id,
          title: newNotif.title,
          titleAr: newNotif.titleAr || undefined,
          message: newNotif.message,
          messageAr: newNotif.messageAr || undefined,
          time: newNotif.time,
          type: newNotif.type,
          read: newNotif.read,
          actionLabel: newNotif.actionLabel,
        })
        .catch(() => {
          /* offline / not yet authed — local state still shows it */
        });
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (isAuthenticated) {
      api.patch(`/api/notifications/${id}`, { read: true }).catch(() => {});
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (isAuthenticated) {
      api.patch('/api/notifications/read-all', {}).catch(() => {});
    }
  };

  // Delete a single notification: optimistic removal + DELETE in the DB.
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    notifSeenIds.current.delete(id);
    setLatestToastNotification((cur) => (cur?.id === id ? null : cur));
    if (isAuthenticated) {
      api.delete(`/api/notifications/${id}`).catch(() => {});
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setLatestToastNotification(null);
    notifSeenIds.current.clear();
    if (isAuthenticated) {
      api.delete('/api/notifications/clear-all').catch(() => {});
    }
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
        dataHydrated,
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
        roles,
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
        toQAR,
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
        locations,
        addLocation,
        updateLocation,
        deleteLocation,
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
        deleteNotification,
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
