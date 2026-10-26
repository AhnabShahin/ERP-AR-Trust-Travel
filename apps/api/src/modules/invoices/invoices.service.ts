import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { HttpError } from '../../middleware/error.js';

// =====================================================================
// Invoices service — hand-written (not the generic CRUD factory) because
// invoices need: auto invoice-number + public token, server-computed totals,
// a payment ledger that updates status + payment-account balances, and a
// public (token-based, no-auth) read for the shareable invoice page.
// =====================================================================

export interface InvoiceItemInput {
  name: string;
  description?: string;
  qty: number;
  unit?: string;
  unitCost: number;
  vatPercent?: number;
}

export interface InvoicePaymentInput {
  date?: string;
  method: string;
  accountId?: string;
  note?: string;
  amount: number;
}

interface ComputedItem extends Required<Omit<InvoiceItemInput, 'description' | 'unit'>> {
  description?: string;
  unit?: string;
  vatAmount: number;
  amount: number;
}

interface Totals {
  items: ComputedItem[];
  subTotal: number;
  vatTotal: number;
  grandTotal: number;
}

const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/** Recompute per-line VAT/amount and invoice totals from raw items + discount. */
function computeTotals(rawItems: InvoiceItemInput[], discount = 0): Totals {
  const items: ComputedItem[] = (rawItems || []).map((it) => {
    const qty = Number(it.qty) || 0;
    const unitCost = Number(it.unitCost) || 0;
    const vatPercent = Number(it.vatPercent) || 0;
    const base = round2(qty * unitCost);
    const vatAmount = round2((base * vatPercent) / 100);
    return {
      name: it.name,
      description: it.description,
      qty,
      unit: it.unit,
      unitCost,
      vatPercent,
      vatAmount,
      amount: round2(base + vatAmount),
    };
  });
  const subTotal = round2(items.reduce((s, i) => s + i.qty * i.unitCost, 0));
  const vatTotal = round2(items.reduce((s, i) => s + i.vatAmount, 0));
  const grandTotal = round2(subTotal + vatTotal - (Number(discount) || 0));
  return { items, subTotal, vatTotal, grandTotal };
}

// ---- amount-in-words -------------------------------------------------
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function threeDigitsToWords(n: number): string {
  let out = '';
  if (n >= 100) { out += `${ONES[Math.floor(n / 100)]} Hundred `; n %= 100; }
  if (n >= 20) { out += `${TENS[Math.floor(n / 10)]} `; n %= 10; }
  if (n > 0) out += `${ONES[n]} `;
  return out.trim();
}

function integerToWords(num: number): string {
  if (num === 0) return 'Zero';
  const units = [
    { v: 1_000_000_000, name: 'Billion' },
    { v: 1_000_000, name: 'Million' },
    { v: 1_000, name: 'Thousand' },
    { v: 1, name: '' },
  ];
  let remaining = num;
  const parts: string[] = [];
  for (const u of units) {
    if (remaining >= u.v) {
      const chunk = Math.floor(remaining / u.v);
      remaining %= u.v;
      parts.push(`${threeDigitsToWords(chunk)}${u.name ? ' ' + u.name : ''}`.trim());
    }
  }
  return parts.join(' ').trim();
}

const CURRENCY_WORDS: Record<string, { major: string; minor: string }> = {
  QAR: { major: 'Riyals', minor: 'Dirhams' },
  USD: { major: 'Dollars', minor: 'Cents' },
  EUR: { major: 'Euros', minor: 'Cents' },
  GBP: { major: 'Pounds', minor: 'Pence' },
  SAR: { major: 'Riyals', minor: 'Halalas' },
};

export function amountInWords(amount: number, currency = 'QAR'): string {
  const words = CURRENCY_WORDS[currency] ?? { major: currency, minor: 'Cents' };
  const whole = Math.floor(Math.abs(amount));
  const fraction = Math.round((Math.abs(amount) - whole) * 100);
  let out = `${integerToWords(whole)} ${words.major}`;
  if (fraction > 0) out += ` and ${integerToWords(fraction)} ${words.minor}`;
  return `${out} Only`;
}

// ---- number + token --------------------------------------------------
async function nextInvoiceNumber(prefix: string): Promise<string> {
  // Find the highest numeric suffix in use and increment. Base 260000 keeps
  // the first invoice at INV-260001 (matching the familiar 26xxxx style).
  const rows = await prisma.invoice.findMany({ select: { invoiceNumber: true } });
  let max = 260000;
  for (const r of rows) {
    const m = r.invoiceNumber.match(/(\d+)\s*$/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}${max + 1}`;
}

const newToken = () => crypto.randomBytes(12).toString('hex');

// ---- list / get ------------------------------------------------------
export interface ListInvoicesQuery {
  status?: string;
  source?: string;
  search?: string;
  skip?: number;
  take?: number;
}

export function list(query: ListInvoicesQuery) {
  const where: Prisma.InvoiceWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.source) where.source = query.source;
  if (query.search) {
    where.OR = [
      { invoiceNumber: { contains: query.search } },
      { customerName: { contains: query.search } },
      { customerPhone: { contains: query.search } },
      { bookingPnr: { contains: query.search } },
    ];
  }
  return prisma.$transaction([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: query.skip ?? 0,
      take: Math.min(query.take ?? 50, 200),
    }),
    prisma.invoice.count({ where }),
  ]);
}

export async function getById(id: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) throw new HttpError(404, 'Invoice not found');
  return invoice;
}

export async function getByToken(token: string) {
  const invoice = await prisma.invoice.findUnique({ where: { publicToken: token } });
  if (!invoice) throw new HttpError(404, 'Invoice not found');
  return invoice;
}

/**
 * Public share payload — the invoice plus the company header/footer profile
 * (from the `invoiceProfile` setting). Bundled here because the settings
 * endpoint requires auth, which the public /invoice/<token> page does not have.
 */
export async function getPublicPayload(token: string) {
  const invoice = await getByToken(token);
  const row = await prisma.appSetting.findUnique({ where: { key: 'invoiceProfile' } });
  return { invoice, profile: (row?.value as unknown) ?? null };
}

// ---- create / update -------------------------------------------------
export interface CreateInvoiceInput {
  id?: string;
  prefix?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  customerTRN?: string;
  invoiceDate: string;
  dueDate?: string;
  currency?: string;
  items: InvoiceItemInput[];
  discount?: number;
  notes?: string;
  terms?: string;
  source?: string;
  bookingId?: string;
  bookingPnr?: string;
  audit?: { id: string; username: string };
}

export async function create(input: CreateInvoiceInput) {
  const currency = input.currency || 'QAR';
  const discount = Number(input.discount) || 0;
  const { items, subTotal, vatTotal, grandTotal } = computeTotals(input.items, discount);

  const data: Prisma.InvoiceCreateInput = {
    id: input.id,
    invoiceNumber: await nextInvoiceNumber(input.prefix || 'INV-'),
    publicToken: newToken(),
    status: 'unpaid',
    customerId: input.customerId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    customerAddress: input.customerAddress,
    customerTRN: input.customerTRN,
    invoiceDate: input.invoiceDate,
    dueDate: input.dueDate,
    currency,
    items: items as unknown as Prisma.InputJsonValue,
    subTotal,
    discount,
    vatTotal,
    grandTotal,
    amountPaid: 0,
    balanceDue: grandTotal,
    amountInWords: amountInWords(grandTotal, currency),
    payments: [] as unknown as Prisma.InputJsonValue,
    notes: input.notes,
    terms: input.terms,
    source: input.source || 'Manual',
    bookingId: input.bookingId,
    bookingPnr: input.bookingPnr,
    createdBy: input.audit?.id,
    createdByName: input.audit?.username,
    updatedBy: input.audit?.id,
    updatedByName: input.audit?.username,
  };
  return prisma.invoice.create({ data });
}

export interface UpdateInvoiceInput extends Partial<Omit<CreateInvoiceInput, 'items'>> {
  items?: InvoiceItemInput[];
  status?: string;
}

export async function update(id: string, input: UpdateInvoiceInput) {
  const existing = await getById(id);
  const data: Prisma.InvoiceUpdateInput = {
    customerId: input.customerId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    customerAddress: input.customerAddress,
    customerTRN: input.customerTRN,
    invoiceDate: input.invoiceDate,
    dueDate: input.dueDate,
    currency: input.currency,
    notes: input.notes,
    terms: input.terms,
    bookingId: input.bookingId,
    bookingPnr: input.bookingPnr,
    updatedBy: input.audit?.id,
    updatedByName: input.audit?.username,
  };

  // Recompute money whenever items or discount change.
  if (input.items || input.discount !== undefined) {
    const currency = input.currency || existing.currency;
    const discount = input.discount !== undefined ? Number(input.discount) || 0 : existing.discount;
    const rawItems = input.items ?? (existing.items as unknown as InvoiceItemInput[]);
    const { items, subTotal, vatTotal, grandTotal } = computeTotals(rawItems, discount);
    data.items = items as unknown as Prisma.InputJsonValue;
    data.subTotal = subTotal;
    data.discount = discount;
    data.vatTotal = vatTotal;
    data.grandTotal = grandTotal;
    data.amountInWords = amountInWords(grandTotal, currency);
    data.balanceDue = round2(grandTotal - existing.amountPaid);
    data.status = statusFor(grandTotal, existing.amountPaid);
  }

  // Strip undefined so a partial update never nulls untouched columns.
  for (const k of Object.keys(data) as (keyof typeof data)[]) {
    if (data[k] === undefined) delete data[k];
  }
  return prisma.invoice.update({ where: { id }, data });
}

export async function remove(id: string) {
  await getById(id);
  await prisma.invoice.delete({ where: { id } });
}

function statusFor(grandTotal: number, paid: number): string {
  if (paid <= 0) return 'unpaid';
  if (paid + 0.009 >= grandTotal) return 'paid';
  return 'partial';
}

// ---- payments --------------------------------------------------------
export async function addPayment(
  id: string,
  input: InvoicePaymentInput,
  audit?: { id: string; username: string }
) {
  const invoice = await getById(id);
  const amount = round2(input.amount);
  if (amount <= 0) throw new HttpError(400, 'Payment amount must be greater than zero');

  const payments = ((invoice.payments as unknown as Array<Record<string, unknown>>) || []).slice();
  payments.push({
    id: crypto.randomBytes(6).toString('hex'),
    date: input.date || new Date().toISOString().slice(0, 10),
    method: input.method,
    accountId: input.accountId,
    note: input.note,
    amount,
  });

  const amountPaid = round2(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0));
  const balanceDue = round2(invoice.grandTotal - amountPaid);
  const status = statusFor(invoice.grandTotal, amountPaid);

  // Bump the chosen payment account's running balance (best-effort).
  if (input.accountId) {
    await prisma.paymentAccount
      .update({ where: { id: input.accountId }, data: { currentBalance: { increment: amount } } })
      .catch(() => undefined);
  }

  return prisma.invoice.update({
    where: { id },
    data: {
      payments: payments as unknown as Prisma.InputJsonValue,
      amountPaid,
      balanceDue,
      status,
      updatedBy: audit?.id,
      updatedByName: audit?.username,
    },
  });
}
