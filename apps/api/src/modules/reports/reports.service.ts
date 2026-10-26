import { prisma } from '../../config/prisma.js';

// =====================================================================
// Reports service — read-only aggregation over the EXISTING tables
// (invoices, invoice payments, bookings, expenses, payroll, payment
// accounts). Amounts are treated as QAR-base (the app is QAR-pegged).
// Dates are mixed: bookings.createdAt is a DateTime; invoices/expenses store
// yyyy-mm-dd strings; invoice payments live in a JSON array. So rows are
// fetched and aggregated in JS rather than via Prisma groupBy.
// =====================================================================

export interface DateRange {
  from?: string; // yyyy-mm-dd (inclusive)
  to?: string; // yyyy-mm-dd (inclusive)
}

const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** yyyy-mm-dd of any Date/string, or '' when unparseable. */
function dayOf(v: unknown): string {
  if (!v) return '';
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  // Already yyyy-mm-dd(…)? take the first 10 chars.
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

/** Inclusive yyyy-mm-dd range test (lexicographic works for ISO dates). */
function inRange(day: string, range: DateRange): boolean {
  if (!day) return false;
  if (range.from && day < range.from) return false;
  if (range.to && day > range.to) return false;
  return true;
}

const monthOf = (day: string) => (day ? day.slice(0, 7) : '');

interface PaymentRow {
  date?: string;
  method?: string;
  accountId?: string;
  amount?: number;
}

export async function overview(range: DateRange) {
  const [invoices, bookings, expenses, salaryRecords, accounts] = await Promise.all([
    prisma.invoice.findMany({
      select: {
        invoiceNumber: true, invoiceDate: true, grandTotal: true, amountPaid: true,
        balanceDue: true, status: true, customerName: true, currency: true, payments: true,
      },
    }),
    prisma.booking.findMany({ select: { totalQAR: true, source: true, packageName: true, paymentMethod: true, paxCount: true, createdAt: true } }),
    prisma.financeExpense.findMany({ select: { amountQAR: true, category: true, status: true, date: true } }),
    prisma.salaryRecord.findMany({ select: { fixedBaseMonthlyQAR: true, accruedCommissionQAR: true, netPayableQAR: true } }),
    prisma.paymentAccount.findMany({ select: { title: true, currentBalance: true, currency: true } }),
  ]);

  // ---- invoices in range (by invoice date) --------------------------
  const invInRange = invoices.filter((i) => inRange(dayOf(i.invoiceDate), range));
  const invoicedTotal = round2(invInRange.reduce((s, i) => s + (i.grandTotal || 0), 0));
  const invoiceCount = invInRange.length;

  const invoiceStatus = { paid: { count: 0, amount: 0 }, partial: { count: 0, amount: 0 }, unpaid: { count: 0, amount: 0 } };
  for (const i of invInRange) {
    const k = (['paid', 'partial', 'unpaid'] as const).includes(i.status as never) ? (i.status as 'paid' | 'partial' | 'unpaid') : 'unpaid';
    invoiceStatus[k].count += 1;
    invoiceStatus[k].amount = round2(invoiceStatus[k].amount + (i.grandTotal || 0));
  }

  // ---- collections (invoice payments) in range ----------------------
  const accountTitleById = new Map(accounts.map((a) => [a.title, a.title]));
  const byMethod = new Map<string, number>();
  const byAccountId = new Map<string, number>();
  let collectedTotal = 0;
  const collectionSeries = new Map<string, number>(); // month -> collected
  for (const inv of invoices) {
    const pays = (inv.payments as unknown as PaymentRow[]) || [];
    for (const p of pays) {
      const day = dayOf(p.date);
      if (!inRange(day, range)) continue;
      const amt = Number(p.amount) || 0;
      collectedTotal += amt;
      const method = p.method || 'Other';
      byMethod.set(method, (byMethod.get(method) || 0) + amt);
      const accKey = p.accountId || method;
      byAccountId.set(accKey, (byAccountId.get(accKey) || 0) + amt);
      collectionSeries.set(monthOf(day), (collectionSeries.get(monthOf(day)) || 0) + amt);
    }
  }
  collectedTotal = round2(collectedTotal);

  // ---- outstanding receivables + aging (all open invoices) ----------
  const todayDay = new Date().toISOString().slice(0, 10);
  const todayMs = new Date(todayDay).getTime();
  const aging = { current: 0, d30: 0, d60: 0, d90plus: 0 };
  let outstandingTotal = 0;
  const customerMap = new Map<string, { invoiced: number; outstanding: number }>();
  for (const i of invInRange) {
    const c = customerMap.get(i.customerName) || { invoiced: 0, outstanding: 0 };
    c.invoiced = round2(c.invoiced + (i.grandTotal || 0));
    c.outstanding = round2(c.outstanding + (i.balanceDue || 0));
    customerMap.set(i.customerName, c);
  }
  for (const i of invoices) {
    const due = i.balanceDue || 0;
    if (due <= 0) continue;
    outstandingTotal += due;
    const ageDays = Math.floor((todayMs - new Date(dayOf(i.invoiceDate) || todayDay).getTime()) / 86400000);
    if (ageDays <= 30) aging.current = round2(aging.current + due);
    else if (ageDays <= 60) aging.d30 = round2(aging.d30 + due);
    else if (ageDays <= 90) aging.d60 = round2(aging.d60 + due);
    else aging.d90plus = round2(aging.d90plus + due);
  }
  outstandingTotal = round2(outstandingTotal);

  // ---- bookings in range --------------------------------------------
  const bkInRange = bookings.filter((b) => inRange(dayOf(b.createdAt), range));
  const bookingTotal = round2(bkInRange.reduce((s, b) => s + (b.totalQAR || 0), 0));
  const bookingCount = bkInRange.length;
  const bookingPax = bkInRange.reduce((s, b) => s + (b.paxCount || 0), 0);
  const bookingsBySource = groupSum(bkInRange, (b) => b.source || 'Unknown', (b) => b.totalQAR || 0);
  const bookingsByPackage = groupSum(bkInRange, (b) => b.packageName || 'Unknown', (b) => b.totalQAR || 0).slice(0, 8);
  const bookingsByMethod = groupSum(bkInRange, (b) => b.paymentMethod || 'Unknown', (b) => b.totalQAR || 0);

  // ---- expenses in range --------------------------------------------
  const expInRange = expenses.filter((e) => inRange(dayOf(e.date), range));
  const expenseTotal = round2(expInRange.reduce((s, e) => s + (e.amountQAR || 0), 0));
  const expensesByCategory = groupSum(expInRange, (e) => e.category || 'Other', (e) => e.amountQAR || 0);
  const expensesByStatus = groupSum(expInRange, (e) => e.status || 'Pending Review', (e) => e.amountQAR || 0);

  // ---- payroll (not date-filtered; it's a monthly roster) -----------
  const payrollTotal = round2(salaryRecords.reduce((s, r) => s + (r.netPayableQAR || r.fixedBaseMonthlyQAR || 0) + (r.accruedCommissionQAR || 0), 0));

  // ---- combined monthly sales series --------------------------------
  const invSeries = new Map<string, number>();
  for (const i of invInRange) invSeries.set(monthOf(dayOf(i.invoiceDate)), round2((invSeries.get(monthOf(dayOf(i.invoiceDate))) || 0) + (i.grandTotal || 0)));
  const bkSeries = new Map<string, number>();
  for (const b of bkInRange) bkSeries.set(monthOf(dayOf(b.createdAt)), round2((bkSeries.get(monthOf(dayOf(b.createdAt))) || 0) + (b.totalQAR || 0)));
  const months = Array.from(new Set([...invSeries.keys(), ...bkSeries.keys(), ...collectionSeries.keys()].filter(Boolean))).sort();
  const salesSeries = months.map((m) => ({
    period: m,
    invoiced: round2(invSeries.get(m) || 0),
    bookings: round2(bkSeries.get(m) || 0),
    collected: round2(collectionSeries.get(m) || 0),
  }));

  // revenue = invoices + bookings (bookings may be billed separately); net of costs
  const grossRevenue = round2(invoicedTotal + bookingTotal);
  const netProfit = round2(grossRevenue - expenseTotal - payrollTotal);

  const topCustomers = Array.from(customerMap.entries())
    .map(([name, v]) => ({ name, invoiced: v.invoiced, outstanding: v.outstanding }))
    .sort((a, b) => b.invoiced - a.invoiced)
    .slice(0, 8);

  const collectionsByAccount = Array.from(byAccountId.entries())
    .map(([key, amount]) => ({ account: accountTitleById.get(key) || key, amount: round2(amount) }))
    .sort((a, b) => b.amount - a.amount);
  const collectionsByMethod = Array.from(byMethod.entries())
    .map(([method, amount]) => ({ method, amount: round2(amount) }))
    .sort((a, b) => b.amount - a.amount);

  return {
    range,
    generatedAt: new Date().toISOString(),
    kpis: {
      invoicedTotal, collectedTotal, outstandingTotal, invoiceCount,
      bookingTotal, bookingCount, bookingPax, expenseTotal, payrollTotal,
      grossRevenue, netProfit,
    },
    salesSeries,
    invoiceStatus,
    receivablesAging: aging,
    topCustomers,
    collectionsByAccount,
    collectionsByMethod,
    expensesByCategory,
    expensesByStatus,
    bookingsBySource,
    bookingsByPackage,
    bookingsByMethod,
    accountBalances: accounts.map((a) => ({ account: a.title, currency: a.currency, balance: round2(a.currentBalance || 0) })),
  };
}

/** Group rows by a key and sum a value, returned sorted desc as [{label,amount,count}]. */
function groupSum<T>(rows: T[], keyFn: (r: T) => string, valFn: (r: T) => number) {
  const m = new Map<string, { amount: number; count: number }>();
  for (const r of rows) {
    const k = keyFn(r);
    const cur = m.get(k) || { amount: 0, count: 0 };
    cur.amount = round2(cur.amount + valFn(r));
    cur.count += 1;
    m.set(k, cur);
  }
  return Array.from(m.entries())
    .map(([label, v]) => ({ label, amount: v.amount, count: v.count }))
    .sort((a, b) => b.amount - a.amount);
}
