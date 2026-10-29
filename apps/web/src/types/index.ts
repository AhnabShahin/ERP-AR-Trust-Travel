// Audit metadata stamped by the API on every create/update: who added the row
// and who last changed it (user id + display name). Entity records carry these
// optionally; the server is authoritative. `createdAt`/`updatedAt` come from the
// DB. Use the `LastUpdatedBy` component to render them.
export interface AuditMeta {
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Open currency code: well-known codes kept as literals for autocomplete, but
// any code from the Currency CRUD is valid. Base currency is always QAR.
export type Currency = 'QAR' | 'USD' | 'EUR' | 'GBP' | (string & {});

export type Language = 'en' | 'ar';

export type Theme = 'dark' | 'light';

export type UserRole =
  | 'super-admin'
  | 'admin'
  | 'operations-manager'
  | 'transit-agent'
  | 'driver-guide'
  | 'finance-accountant'
  | 'vendor-partner'
  | 'staff'
  | 'customer';

export interface RoleConfig {
  id: UserRole;
  title: string;
  titleAr: string;
  userDisplayName: string;
  userDisplayNameAr: string;
  scopeSummary: string;
  scopeSummaryAr: string;
  defaultTab: string;
  allowedTabs: string[];
  permissions: {
    canViewAllFinancials: boolean;
    canEditExchangeRates: boolean;
    canApprovePayouts: boolean;
    canAssignDrivers: boolean;
    canAuditShifts: boolean;
    canIssueVouchers: boolean;
    canViewDriverTrips: boolean;
    canViewSystemLogs: boolean;
    canManageServices: boolean;
    canManageFleet: boolean;
    canManageEmployees?: boolean;
    canManageDesks?: boolean;
    canManageGuests?: boolean;
    canApproveExpenses?: boolean;
  };
}

export const AR_TRUST_LOGO_URL =
  'https://artrusttravel.com/wp-content/uploads/al_opt_content/IMAGE/artrusttravel.com/wp-content/uploads/2026/01/AR-Trust-Travel-logo--e1768655182358.png.bv_resized_desktop.png.bv.webp';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'driver-assigned'
  | 'in-progress'
  | 'checked-in'
  | 'in-transit'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export interface TourGuide {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  languages: string[];
  specialty: 'Desert Safari' | 'Doha Cultural Heritage' | 'Museum VIP' | 'Dhow Marina Cruise';
  status: 'Assigned' | 'Available' | 'On Tour';
  toursLedToday: number;
  totalCommissionQAR: number;
  rating: number;
}

export interface SalaryRecord {
  id: string;
  employeeName: string;
  roleTitle: string;
  department: 'Operations' | 'Airport Desk' | 'Field Drivers' | 'Tour Guides' | 'Finance';
  fixedBaseMonthlyQAR: number;
  accruedCommissionQAR: number;
  netPayableQAR: number;
  paymentCycle: 'Monthly 30th';
  payoutStatus: 'Paid' | 'Processing' | 'Approved for Payroll';
}

export interface CommissionRule {
  id: string;
  targetRole: 'Transit Desk Agent' | 'Field Driver' | 'Licensed Tour Guide';
  ruleDescription: string;
  type: 'FIXED_PER_BOOKING' | 'PERCENTAGE_REVENUE' | 'PER_TRIP_COMPLETED';
  rateValue: number; // e.g. 25 QAR, 12%, 45 QAR
  unit: 'QAR' | '%';
  appliesTo: string;
}

export interface Booking {
  id: string;
  pnr: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  nationality: string;
  passportNumber?: string;
  flightNumber: string;
  arrivalAirport: string;
  arrivalTime: string;
  terminalGate: string;
  pickupBay: string;
  packageId: string;
  packageName: string;
  packageNameAr: string;
  paxCount: number;
  totalQAR: number;
  paymentCurrency: Currency;
  paymentMethod: 'Cash' | 'POS Card' | 'Payment Link' | 'Prepaid OTA' | 'Website Online Gateway';
  driverId: string;
  driverName: string;
  driverVehicle?: string; // deprecated — use vehicleId/vehicleName (per-trip vehicle)
  driverPhone: string;
  guideId?: string;
  guideName?: string;
  qrStatus: BookingStatus;
  qrCodeUrl: string;
  voucherSent: boolean;
  bookingDate?: string; // e.g. '2026-10-15' or customer desired booking date
  bookingTime?: string; // e.g. '14:30' or time customer requested for tour/pickup
  notes?: string;
  deskId?: string;
  deskCode?: string;
  createdAt: string;
  source: 'Airport Desk' | 'Agent Desk' | 'Online Web' | 'VIP Concierge' | 'OTA Partner' | 'Website Direct Lead' | 'Web Integration API' | string;
  leadType?: 'tour' | 'package' | 'fleet' | 'service';
  // ---- Service / trip layer (unified booking = consumed service record) ----
  serviceType?: 'tour-service' | 'tour-package' | 'transfer';
  customerId?: string; // link to a Guest (CRM)
  vehicleId?: string; // fleet vehicle assigned for this trip
  vehicleName?: string;
  vehiclePlate?: string;
  tripStatus?: 'Scheduled' | 'On Trip' | 'Completed' | 'Cancelled' | 'No Show';
  scheduledStart?: string;
  scheduledEnd?: string;
  startedAt?: string;
  completedAt?: string;
  invoiceId?: string;
}

// ---- Billing: payment accounts + invoices (BizBill-style) ---------------

export interface PaymentAccount extends Partial<AuditMeta> {
  id: string;
  title: string;
  openingDate: string; // yyyy-mm-dd
  accountNumber?: string;
  currency: Currency;
  openingBalance: number;
  currentBalance: number;
  note?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type InvoiceStatus = 'unpaid' | 'partial' | 'paid';

export interface InvoiceItem {
  name: string;
  description?: string;
  qty: number;
  unit?: string; // e.g. 'pax', 'night', 'trip'
  unitCost: number;
  vatPercent: number; // 0..100
  vatAmount: number;
  amount: number; // line total incl. VAT
}

export interface InvoicePayment {
  id: string;
  date: string; // yyyy-mm-dd
  method: string; // account title, e.g. 'Qatar Bank' / 'Cash'
  accountId?: string; // PaymentAccount.id when chosen from the list
  note?: string;
  amount: number;
}

export interface Invoice extends Partial<AuditMeta> {
  id: string;
  invoiceNumber: string; // e.g. 'INV-260001'
  publicToken: string; // opaque token for /invoice/<token>
  status: InvoiceStatus;

  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerTRN?: string;

  invoiceDate: string; // yyyy-mm-dd
  dueDate?: string;

  currency: Currency;
  items: InvoiceItem[];
  subTotal: number;
  discount: number;
  vatTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  amountInWords?: string;

  payments?: InvoicePayment[];

  notes?: string;
  terms?: string;
  source: 'Manual' | 'Booking' | string;
  bookingId?: string;
  bookingPnr?: string;

  createdAt?: string;
  updatedAt?: string;
}

/** Company header/footer shown on invoices — stored in settings `invoiceProfile`. */
export interface InvoiceProfile {
  companyName: string;
  companyNameAr?: string;
  address?: string;
  phone?: string;
  email?: string;
  helpline?: string;
  website?: string;
  trn?: string; // VAT / tax registration number
  licenseNo?: string; // company / tourism license
  logo?: string; // image ref (/api/uploads/<id> or data URL)
  signatureImage?: string; // authorised-signatory image
  signatureName?: string;
  signatureTitle?: string;
  footerNote?: string;
  defaultVatPercent?: number;
  invoicePrefix?: string; // default 'INV-'
  defaultNotes?: string;
  defaultTerms?: string;
}

// ---- Reporting (aggregation payload from /api/reports/overview) ---------

export interface ReportBreakdownItem {
  label: string;
  amount: number;
  count: number;
}

export interface ReportOverview {
  range: { from?: string; to?: string };
  generatedAt: string;
  kpis: {
    invoicedTotal: number;
    collectedTotal: number;
    outstandingTotal: number;
    invoiceCount: number;
    bookingTotal: number;
    bookingCount: number;
    bookingPax: number;
    expenseTotal: number;
    payrollTotal: number;
    grossRevenue: number;
    netProfit: number;
  };
  salesSeries: Array<{ period: string; invoiced: number; bookings: number; collected: number }>;
  invoiceStatus: Record<'paid' | 'partial' | 'unpaid', { count: number; amount: number }>;
  receivablesAging: { current: number; d30: number; d60: number; d90plus: number };
  topCustomers: Array<{ name: string; invoiced: number; outstanding: number }>;
  collectionsByAccount: Array<{ account: string; amount: number }>;
  collectionsByMethod: Array<{ method: string; amount: number }>;
  expensesByCategory: ReportBreakdownItem[];
  expensesByStatus: ReportBreakdownItem[];
  bookingsBySource: ReportBreakdownItem[];
  bookingsByPackage: ReportBreakdownItem[];
  bookingsByMethod: ReportBreakdownItem[];
  revenueByServiceType: ReportBreakdownItem[];
  driverUtilization: ReportBreakdownItem[];
  vehicleUtilization: ReportBreakdownItem[];
  tripsByStatus: ReportBreakdownItem[];
  accountBalances: Array<{ account: string; currency: string; balance: number }>;
}

export interface ExchangeRates {
  USD: number; // e.g. 3.64 QAR per USD (pegged)
  EUR: number; // e.g. 3.96 QAR per EUR
  GBP: number; // e.g. 4.74 QAR per GBP
  SAR: number; // e.g. 0.99 QAR per SAR
  lastUpdated: string;
  [key: string]: number | string | undefined;
}

export type ServiceMainType = 'Tour Service' | 'Tour Package' | 'Transfer Service';

export interface ServiceCategoryDef {
  id: string;
  name: string;
  nameAr?: string;
  serviceType: ServiceMainType;
}

export interface TourPackage {
  id: string;
  name: string;
  nameAr: string;
  serviceType?: ServiceMainType;
  category: string;
  duration: string;
  priceQAR: number;
  description: string;
  descriptionAr: string;
  pickupLocation: string;
  includes: string[];
  // Rich Website & Dashboard Sync Fields
  image?: string;
  badge?: string;
  groupSize?: string;
  departure?: string;
  rating?: number;
  reviewCount?: number;
  originalPriceQAR?: number;
  isMultiDay?: boolean;
  days?: number;
  nights?: number;
  highlights?: string[];
  excluded?: string[];
  isFeatured?: boolean;
  showOnWebsite?: boolean;
}

export interface FleetVehicle {
  id: string;
  name: string;
  nameAr?: string;
  category: 'VIP Luxury' | 'Safari 4x4' | 'Executive Sedan' | 'Group Van' | 'Coaster Bus' | 'Luxury Coach' | 'Family MPV' | string;
  passengers: number;
  luggage: number;
  priceQAR: number;
  rateType: string;
  features: string[];
  image: string;
  idealFor: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  plateNumber?: string;
  modelYear?: string;
  make?: string;
  model?: string;
  color?: string;
  // Operational availability + sourcing.
  status?: 'Available' | 'On Trip' | 'Maintenance' | 'Reserved';
  ownership?: 'owned' | 'third-party';
  showOnWebsite?: boolean;
}

// Online booking platform / channel (tour or airport-transfer OTA).
export type PlatformType = 'tour' | 'airport-transfer';

export interface Platform {
  id: string;
  name: string;
  type: PlatformType;
  contactPhone?: string;
  website?: string;
  notes?: string;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  // Sourcing: in-house staff vs. external/contracted driver.
  driverType?: 'first-party' | 'third-party';
  company?: string; // third-party company / vendor name
  // DEPRECATED free-text vehicle fields — a vehicle is assigned per-trip now.
  vehicle?: string;
  plateNumber?: string;
  vehicleType?: '4x4 SUV' | 'VIP Van' | 'Luxury Sedan' | 'Mini Bus' | 'Luxury Limousine' | 'Coaster Bus' | string;
  status: 'Dispatched' | 'At Airport Bay' | 'En Route' | 'Standby' | 'Off Duty' | 'Maintenance' | 'Available' | 'On Trip';
  currentMission?: string;
  activePassengers?: number;
  totalTripsToday: number;
  location: string;
  rating: number;
  // Fleet Sync fields
  image?: string;
  fleetVehicleId?: string;
  priceQAR?: number;
}

export interface FlightInfo {
  flightNumber: string;
  airline: string;
  airlineCode: string;
  originCity: string;
  originIata: string;
  scheduledArrival: string;
  estimatedArrival: string;
  status: 'Landed' | 'Taxiing' | 'Baggage Claim' | 'Approaching' | 'Delayed';
  gate: string;
  carousel: string;
  assignedBookingsCount: number;
  terminal: 'Terminal 1 Arrivals' | 'VIP Al Maha Lounge' | 'Emiri Terminal';
}

export interface ShiftDrawer {
  counterId: string;
  counterName: string;
  counterNameAr: string;
  agentName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  openingCash: {
    QAR: number;
    USD: number;
    EUR: number;
    GBP: number;
  };
  currentCashDrawer: {
    QAR: number;
    USD: number;
    EUR: number;
    GBP: number;
  };
  systemExpected: {
    QAR: number;
    USD: number;
    EUR: number;
    GBP: number;
  };
  posCardTotalQAR: number;
  paymentLinkTotalQAR: number;
  transactionsCount: number;
  status: 'Active' | 'Closing Pending' | 'Audited & Closed';
}

export interface NotificationItem {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  time: string;
  type: 'flight' | 'driver' | 'cash' | 'vip' | 'booking' | 'hotel';
  read: boolean;
  actionLabel?: string;
}

export type LocationType = 'airport' | 'resort';

// A physical location (airport or resort/hotel) where an agent desk can be
// stationed. Managed via its own CRUD and used as the single source for the
// desk "location" dropdown.
export interface Location {
  id: string;
  name: string;
  nameAr?: string;
  type: LocationType;
  code: string;
  city?: string;
  address?: string;
  hotelVendorId?: string;
  active?: boolean;
}

export interface AirportDesk {
  id: string;
  locationId?: string;
  airportCode: string;
  airportName: string;
  deskCode: string;
  deskName: string;
  deskNameAr: string;
  terminal: string;
  zone: string;
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  assignedEmployeeRole?: string;
  status: 'Active' | 'Closing Soon' | 'Offline' | 'Under Maintenance';
  shiftTiming: string;
  phoneExt: string;
  notes?: string;
  operatingHours?: string;
  dailyTargetQAR?: number;
  currentDrawerCashQAR?: number;
  deskType?: 'Airport Counter' | 'Hotel Vendor Desk' | 'Flagship Office';
  hotelVendorId?: string;
  hotelName?: string;
}

export interface DeskAssignmentRecord {
  id: string;
  deskId: string;
  deskCode: string;
  deskName: string;
  airportCode: string;
  terminal: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  assignedDate: string; // e.g. 'Oct 09, 2026, 06:00 AM'
  shiftTiming: string;
  assignedBy: string;
  status: 'Active' | 'Completed' | 'Reassigned' | 'Shift Ended';
  notes?: string;
}

export interface EmployeeMonthlyRecord {
  month: string; // e.g. 'October 2026'
  baseSalaryQAR: number;
  targetServices: number;
  completedServices: number;
  targetMet: boolean;
  excessServices: number;
  commissionRatePerService: number;
  commissionEarnedQAR: number;
  expensesReimbursedQAR: number;
  deductionsQAR: number;
  grossPayableQAR: number;
  amountPaidQAR: number;
  amountDueQAR: number;
  status: 'Fully Paid' | 'Partially Paid' | 'Pending Payout' | 'Approved';
  paidDate?: string;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  phone: string;
  role: string;
  department: 'Airport Desk' | 'Agent Desk' | 'Hotel Partner Desks' | 'Operations' | 'Field Drivers' | 'Tour Guides' | 'Finance';
  assignedAirport: string;
  assignedDeskId: string;
  assignedDeskName: string;
  status: 'On Duty' | 'Available' | 'On Leave' | 'Off Duty';
  hireDate: string;
  baseSalaryMonthlyQAR: number;
  monthlyServiceTarget: number;
  commissionPerServiceQAR: number;
  monthlyRecords: EmployeeMonthlyRecord[];
  totalExpensesQAR: number;
  rating: number;
  emergencyContact: string;
}

export interface CustomerTier {
  id: string;
  name: string;
  nameAr?: string;
  discountPercentage: number; // e.g. 15 for 15% discount
  badgeColor?: string; // e.g. 'purple', 'amber', 'emerald', 'blue'
  minSpendQAR?: number;
  description?: string;
}

export type ExpenseCategory =
  | 'Fleet Fuel'
  | 'Airport Apron Permits'
  | 'Camp Maintenance'
  | 'Hospitality / Karak'
  | 'Driver Per Diem'
  | 'Vehicle Maintenance'
  | 'Marketing & Collateral'
  | 'Marketing & PR'
  | 'Uniforms & Badges'
  | 'IT & Telecom'
  | 'Office Supplies'
  | 'VIP Terminal Concierge'
  | 'Other Operational'
  | 'Licensing & Government'
  | 'Office & Utility'
  | 'Equipment & Gear';

export type ExpenseStatus = 'Pending Review' | 'Approved' | 'Paid' | 'Rejected';

export interface FinanceExpense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amountQAR: number;
  approvedBy: string;
  status: ExpenseStatus;
  paymentMethod?: string;
  department?: string;
  requestedBy?: string;
  requestedByRole?: string;
  submittedBy?: string;
  receiptRef?: string;
  receiptNumber?: string;
  merchant?: string;
  deskId?: string;
  relatedDeskId?: string;
  deskName?: string;
  approvedAt?: string;
  approvalNotes?: string;
  notes?: string;
  rejectedReason?: string;
}

export interface HotelRoomOption {
  roomType: string;
  ratePerNightQAR: number;
  maxPax: number;
  description: string;
}

export interface HotelVendorDesk {
  deskCode: string;
  deskName: string;
  locationInHotel: string;
  assignedStaff: string;
  phone: string;
  status: 'Active' | 'Offline';
}

export interface HotelVendor {
  id: string;
  name: string;
  nameAr?: string;
  locationZone: string; // e.g. 'West Bay, Doha', 'The Pearl-Qatar', 'Lusail Marina', 'Msheireb Downtown'
  starRating: 4 | 5;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  commissionRate: number; // e.g. 15 for 15%
  desks: HotelVendorDesk[];
  roomOptions: HotelRoomOption[];
  contractStatus: 'Active Partner' | 'Pending Renewal' | 'Exclusive Partner';
  totalBookings: number;
  totalRevenueQAR: number;
  imageUrl?: string;
  amenities: string[];
  notes?: string;
  createdAt: string;
}

export interface HotelBooking {
  id: string;
  confirmationCode: string; // e.g. 'HTL-QA-9042'
  hotelId: string;
  hotelName: string;
  hotelLocation: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestNationality: string;
  roomType: string;
  roomsCount: number;
  paxAdults: number;
  paxChildren: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  nights: number;
  mealPlan: 'Room Only' | 'Bed & Breakfast' | 'Half Board' | 'Full Board' | 'All Inclusive';
  ratePerNightQAR: number;
  totalQAR: number;
  commissionRate: number; // percentage
  commissionEarnedQAR: number;
  bookingSource: 'Agent Desk (Hotel Lobby)' | 'Airport Desk Counter' | 'Online Web Portal' | 'VIP Concierge Direct';
  deskCode?: string;
  agentName?: string;
  paymentMethod: 'Cash' | 'POS Card' | 'Payment Link Online' | 'Bill to Room';
  paymentStatus: 'Paid & Verified' | 'Pending Payment' | 'Deposit Paid';
  bookingStatus: 'Confirmed' | 'Checked In' | 'Completed' | 'Cancelled';
  specialRequests?: string;
  voucherSent: boolean;
  createdAt: string;
}

export interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  rateToQAR: number; // 1 unit of currency = X QAR
  isPegged?: boolean;
  peggedNote?: string;
  bankAccount: string;
  cashVaultBalance: number;
}

export interface CurrencyHistoryRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  currencyCode: string;
  currencyName: string;
  rateToQAR: number;
  previousRateToQAR?: number;
  vaultBalance: number;
  balanceQAREquivalent: number;
  recordedBy: string;
  changeType: 'Rate Update' | 'Vault Audit' | 'Daily EOD Snapshot' | 'Manual Log' | 'Initial Baseline';
  notes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  nameAr?: string;
  username: string; // e.g. 'admin' or email
  email: string;
  password: string; // Plaintext representation in administrative audit/manager
  role: UserRole;
  phone?: string;
  avatar?: string;
  department?: string;
  vendorId?: string; // Links to HotelVendor id if role is 'vendor-partner'
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;

  // Verification & Profile Details
  isEmailVerified?: boolean;
  emailVerifiedAt?: string;
  address?: string;
  city?: string;
  country?: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
  preferredLanguage?: string;
  dietaryNotes?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  licenseNumber?: string;
  licenseCategory?: string;
  experienceYears?: number;
  spokenLanguages?: string[];
  companyName?: string;
  bio?: string;
  staffStatus?: string;
  jobTitle?: string;
  // Driver sourcing (role = driver-guide): in-house vs. external/contracted.
  driverType?: 'first-party' | 'third-party';
  // Customer loyalty / VIP tier (role = customer). Matches CustomerTier.name.
  vipTier?: string;
}
