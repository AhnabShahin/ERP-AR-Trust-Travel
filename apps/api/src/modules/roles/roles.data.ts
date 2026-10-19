// =====================================================================
// Fixed role catalogue — the single source of truth for the application's
// roles. Every user record is assigned exactly ONE of these role keys
// (see the `role` column on the User model); that key alone determines the
// user's access. There is no runtime role switching.
//
// Served to the frontend via GET /api/roles (e.g. to populate the role
// dropdown when creating/editing a user). The per-tab permission matrix
// lives on the frontend keyed by these same `key` values.
// =====================================================================

export type RoleKey =
  | 'super-admin'
  | 'admin'
  | 'operations-manager'
  | 'transit-agent'
  | 'driver-guide'
  | 'finance-accountant'
  | 'vendor-partner'
  | 'customer';

export interface RoleDefinition {
  /** Stable identifier stored on the user record and used for access control. */
  key: RoleKey;
  /** Human-readable role name (English). */
  title: string;
  /** Human-readable role name (Arabic). */
  titleAr: string;
  /** Short description of what the role can do (English). */
  description: string;
  /** Short description of what the role can do (Arabic). */
  descriptionAr: string;
  /** Default dashboard tab this role lands on. */
  defaultTab: string;
  /** Clean URL slug for this role's dashboard. */
  dashboardSlug: string;
}

export const ROLES: RoleDefinition[] = [
  {
    key: 'super-admin',
    title: 'Super Admin',
    titleAr: 'المدير العام (Super Admin)',
    description:
      'Full access to financial reports, salary configurations, commission rates, exchange rate settings, tour services creation, and system logs.',
    descriptionAr:
      'وصول شامل للتقارير المالية، وهيكل الرواتب، ونسب العمولات، وأسعار الصرف، وإنشاء وتعديل باقات الخدمات السياحية، وسجلات النظام الكاملة.',
    defaultTab: 'dashboard',
    dashboardSlug: '/dashboard',
  },
  {
    key: 'admin',
    title: 'Admin',
    titleAr: 'مدير',
    description:
      'Full administrative access to all operations, the same as a super-admin, except this account can itself be deactivated or removed by a super-admin or another admin.',
    descriptionAr:
      'صلاحية إدارية كاملة لجميع العمليات مثل المدير العام، باستثناء أن هذا الحساب يمكن تعطيله أو حذفه من قبل المدير العام أو مدير آخر.',
    defaultTab: 'dashboard',
    dashboardSlug: '/admin-dashboard',
  },
  {
    key: 'operations-manager',
    title: 'Branch / Operations Manager',
    titleAr: 'مدير العمليات والفروع',
    description:
      'Manages booking approvals, driver/guide assignments, vehicle allocation, and daily shift reconciliations.',
    descriptionAr:
      'إدارة الموافقات على الحجوزات، وتعيين السائقين والمرشدين، وتخصيص الأسطول، ومطابقة الورديات اليومية.',
    defaultTab: 'dashboard',
    dashboardSlug: '/manager-dashboard',
  },
  {
    key: 'transit-agent',
    title: 'Agent Desk Lead (HIA & Hotels)',
    titleAr: 'موظف كاونتر ومكتب الوكيل (المطار والفنادق)',
    description:
      'Enters walk-in transit passenger bookings, hotel room reservations, collects payments, and issues vouchers.',
    descriptionAr:
      'إدخال حجوزات ركاب الترانزيت وحجوزات الفنادق، وتحصيل المدفوعات، وإصدار القسائم، وعرض عمولاته وجرد الصندوق.',
    defaultTab: 'pos',
    dashboardSlug: '/agent-dashboard',
  },
  {
    key: 'driver-guide',
    title: 'Driver / Guide Access',
    titleAr: 'سائق / مرشد سياحي (واجهة الجوال)',
    description:
      'Simplified mobile view/interface to check daily assigned trips, pickup points, guest lists, and completed trip logs.',
    descriptionAr:
      'واجهة مخصصة ومبسطة لمتابعة الرحلات اليومية الموكلة، ونقاط الالتقاء بالمطار، وقوائم الضيوف، وسجل الإنجاز.',
    defaultTab: 'driver-portal',
    dashboardSlug: '/driver-dashboard',
  },
  {
    key: 'finance-accountant',
    title: 'Finance / Accountant',
    titleAr: 'المالية والمحاسبة',
    description:
      'Manages payout approvals, multi-currency cash deposits, expense entries, and exports tax/accounting reports.',
    descriptionAr:
      'إدارة اعتمادات الصرف، وإيداعات العملات المتعددة، وتسجيل المصروفات، وتصدير التقارير الضريبية والمحاسبية.',
    defaultTab: 'dashboard',
    dashboardSlug: '/finance-dashboard',
  },
  {
    key: 'vendor-partner',
    title: 'Hotel Vendor & Partner',
    titleAr: 'الشريك الفندقي ومزود الخدمة',
    description:
      'Vendor access to monitor hotel bookings, occupancy statistics, guest lists, and verify/redeem customer vouchers via QR scan or confirmation code.',
    descriptionAr:
      'واجهة مخصصة للفندق الشريك لمتابعة حجوزات الغرف، النزلاء القادمين، نسب الإشغال، ومسح وتأكيد قسائم النزلاء عبر رمز QR أو رقم الحجز.',
    defaultTab: 'dashboard',
    dashboardSlug: '/vendor-dashboard',
  },
  {
    key: 'customer',
    title: 'Customer / Traveler',
    titleAr: 'عميل / مسافر',
    description: 'Customer self-service portal to view bookings, packages, and travel information.',
    descriptionAr: 'بوابة العميل لمتابعة الحجوزات والباقات السياحية ومعلومات السفر.',
    defaultTab: 'dashboard',
    dashboardSlug: '/customer-dashboard',
  },
];

export const ROLE_KEYS: RoleKey[] = ROLES.map((r) => r.key);

export function getRoleByKey(key: string): RoleDefinition | undefined {
  return ROLES.find((r) => r.key === key);
}
