'use client';

// Build a self-contained printable HTML document (inline CSS + embedded QR data
// URL) for an invoice and open it in a new window to print. Two layouts:
//  - 'a4'      : full A4 tax invoice (Print / PDF buttons)
//  - 'thermal' : 80mm POS receipt (Thermal Print button)
// Self-contained HTML is used (rather than print-CSS over the SPA) so POS
// printers and "Save as PDF" render exactly the invoice, with no app chrome.

import QRCode from 'qrcode';
import { imgSrc } from '../../../lib/uploads';
import type { Invoice, InvoiceProfile } from '../../types';

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const fmt = (n: number | undefined, ccy = 'QAR') =>
  `${ccy} ${(Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const num = (n: number | undefined) =>
  (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dateLabel = (d?: string) => {
  if (!d) return '—';
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

async function qrDataUrl(value: string): Promise<string> {
  try {
    return await QRCode.toDataURL(value || ' ', { errorCorrectionLevel: 'M', margin: 1, width: 240 });
  } catch {
    return '';
  }
}

export type PrintLayout = 'a4' | 'thermal';

export async function buildInvoiceHTML(
  invoice: Invoice,
  profile: InvoiceProfile,
  layout: PrintLayout,
  publicUrl: string
): Promise<string> {
  const ccy = invoice.currency || 'QAR';
  const qr = await qrDataUrl(publicUrl);
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const logo = profile.logo ? imgSrc(profile.logo) : '';
  const sig = profile.signatureImage ? imgSrc(profile.signatureImage) : '';
  const teal = '#0f766e';

  if (layout === 'thermal') {
    const rows = items
      .map(
        (it) => `
        <tr><td colspan="2" class="nm">${esc(it.name)}</td></tr>
        <tr><td class="qt">${esc(it.qty)} x ${num(it.unitCost)}${it.vatPercent ? ` (+${esc(it.vatPercent)}%)` : ''}</td><td class="amt">${num(it.amount)}</td></tr>`
      )
      .join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(invoice.invoiceNumber)}</title>
    <style>
      @page { size: 80mm auto; margin: 0; }
      * { box-sizing: border-box; }
      body { width: 80mm; margin: 0; padding: 6px 8px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; color: #000; }
      .c { text-align: center; } .b { font-weight: 700; } .mut { color: #333; }
      h1 { font-size: 14px; margin: 2px 0; } .logo { max-height: 42px; margin: 0 auto 4px; display:block; }
      hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 1px 0; vertical-align: top; } .amt { text-align: right; } .qt { color:#333; }
      .nm { font-weight: 600; padding-top: 3px; }
      .tot td { padding: 1px 0; } .tot .amt { text-align: right; }
      .qr { width: 110px; height: 110px; margin: 6px auto 0; display:block; }
      .foot { font-size: 10px; text-align:center; margin-top: 6px; }
    </style></head><body onload="window.print()">
      ${logo ? `<img src="${esc(logo)}" class="logo"/>` : ''}
      <div class="c b"><h1>${esc(profile.companyName)}</h1></div>
      ${profile.address ? `<div class="c mut">${esc(profile.address)}</div>` : ''}
      ${profile.phone ? `<div class="c mut">${esc(profile.phone)}</div>` : ''}
      ${profile.trn ? `<div class="c mut">TRN: ${esc(profile.trn)}</div>` : ''}
      <hr/>
      <div><span class="b">Invoice:</span> ${esc(invoice.invoiceNumber)}</div>
      <div><span class="b">Date:</span> ${esc(dateLabel(invoice.invoiceDate))}</div>
      <div><span class="b">Customer:</span> ${esc(invoice.customerName)}</div>
      <hr/>
      <table>${rows}</table>
      <hr/>
      <table class="tot">
        <tr><td>Sub Total</td><td class="amt">${num(invoice.subTotal)}</td></tr>
        ${invoice.discount > 0 ? `<tr><td>Discount</td><td class="amt">-${num(invoice.discount)}</td></tr>` : ''}
        ${invoice.vatTotal > 0 ? `<tr><td>VAT</td><td class="amt">${num(invoice.vatTotal)}</td></tr>` : ''}
        <tr class="b"><td>Grand Total</td><td class="amt">${fmt(invoice.grandTotal, ccy)}</td></tr>
        <tr><td>Paid</td><td class="amt">${num(invoice.amountPaid)}</td></tr>
        <tr class="b"><td>Balance Due</td><td class="amt">${num(invoice.balanceDue)}</td></tr>
      </table>
      <hr/>
      <div class="c mut">${esc(invoice.amountInWords || '')}</div>
      ${qr ? `<img src="${qr}" class="qr"/>` : ''}
      <div class="foot">${esc(profile.footerNote || 'Thank you for your business!')}</div>
      <div class="foot mut">Scan to view / verify this invoice online</div>
    </body></html>`;
  }

  // A4 layout
  const rows = items
    .map((it) => {
      const taxable = (Number(it.qty) || 0) * (Number(it.unitCost) || 0);
      return `<tr>
        <td class="l"><b>${esc(it.name)}</b>${it.description ? `<div class="sub">${esc(it.description)}</div>` : ''}</td>
        <td class="r">${esc(it.qty)}</td>
        <td>${esc(it.unit || '—')}</td>
        <td class="r">${num(it.unitCost)}</td>
        <td class="r">${num(taxable)}</td>
        <td class="r">${it.vatPercent ? `${esc(it.vatPercent)}%` : '—'}</td>
        <td class="r">${it.vatAmount ? num(it.vatAmount) : '—'}</td>
        <td class="r"><b>${num(it.amount)}</b></td>
      </tr>`;
    })
    .join('');

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(invoice.invoiceNumber)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 12px; margin: 0; }
    .head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
    .co { display:flex; gap:14px; align-items:center; }
    .logo { width:64px; height:64px; object-fit:contain; border:1px solid #eee; border-radius:8px; }
    .logo.ph { background:${teal}; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:20px; }
    .co h2 { color:${teal}; margin:0; font-size:17px; } .ar { color:#64748b; font-size:13px; }
    .meta { font-size:11px; color:#64748b; } .meta b { color:#1e293b; }
    .right { text-align:right; font-size:11px; color:#64748b; } .right b { color:#1e293b; }
    h1.title { text-align:center; color:${teal}; letter-spacing:1px; margin:18px 0; font-size:20px; }
    .cols { display:flex; gap:14px; } .cols > div { flex:1; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; }
    .bar { background:${teal}; color:#fff; font-weight:700; font-size:11px; padding:6px 10px; }
    .pad { padding:10px; font-size:11px; } .pad .ln { display:flex; justify-content:space-between; margin-bottom:3px; }
    .pad .ln span:first-child { color:#64748b; font-weight:600; }
    table.items { width:100%; border-collapse:collapse; margin-top:16px; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; }
    table.items th { background:${teal}; color:#fff; font-weight:600; font-size:11px; padding:7px 8px; text-align:right; }
    table.items th.l, table.items td.l { text-align:left; }
    table.items td { padding:7px 8px; border-bottom:1px solid #f1f5f9; text-align:right; } td .sub { color:#94a3b8; font-size:10px; font-weight:400; }
    .bottom { display:flex; justify-content:space-between; gap:20px; margin-top:16px; align-items:flex-start; }
    .words { font-size:11px; max-width:300px; } .words .qr { width:96px; height:96px; margin-top:8px; }
    .totals { width:280px; border:1px solid #e2e8f0; border-radius:8px; font-size:12px; }
    .totals .tr { display:flex; justify-content:space-between; padding:7px 12px; border-bottom:1px solid #f1f5f9; }
    .totals .tr:last-child { border-bottom:0; } .totals .tr span:first-child { color:#64748b; }
    .totals .tr.strong span { font-weight:700; color:#0f172a; } .g { color:#059669; } .r2 { color:#dc2626; }
    .sign { display:flex; justify-content:space-between; align-items:flex-end; margin-top:36px; }
    .sign .sg { text-align:center; } .sign img { height:48px; object-fit:contain; } .sign .nm { font-weight:700; text-transform:uppercase; margin-top:4px; }
    .rc { border-top:1px solid #cbd5e1; width:160px; padding-top:4px; font-size:11px; color:#64748b; }
    .foot { margin-top:26px; border-top:4px solid ${teal}; padding-top:8px; font-size:11px; color:#64748b; display:flex; gap:20px; flex-wrap:wrap; }
    .pill { display:inline-block; padding:2px 8px; border-radius:999px; font-size:10px; font-weight:700; }
    .pill.paid { background:#d1fae5; color:#047857; } .pill.partial { background:#fef3c7; color:#b45309; } .pill.unpaid { background:#fee2e2; color:#b91c1c; }
  </style></head><body onload="window.print()">
    <div class="head">
      <div class="co">
        ${logo ? `<img src="${esc(logo)}" class="logo"/>` : `<div class="logo ph">${esc(profile.companyName.slice(0, 2).toUpperCase())}</div>`}
        <div>
          <h2>${esc(profile.companyName)}</h2>
          ${profile.companyNameAr ? `<div class="ar" dir="rtl">${esc(profile.companyNameAr)}</div>` : ''}
          <div class="meta">
            ${profile.address ? `<div><b>Address:</b> ${esc(profile.address)}</div>` : ''}
            ${profile.email ? `<div><b>Email:</b> ${esc(profile.email)}</div>` : ''}
            ${profile.helpline ? `<div><b>Helpline:</b> ${esc(profile.helpline)}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="right">
        ${profile.trn ? `<div>TRN (VAT Reg. No.)<br><b>${esc(profile.trn)}</b></div>` : ''}
        ${profile.licenseNo ? `<div style="margin-top:6px">Company License No.<br><b>${esc(profile.licenseNo)}</b></div>` : ''}
      </div>
    </div>

    <h1 class="title">TAX INVOICE</h1>

    <div class="cols">
      <div>
        <div class="bar">BILL TO</div>
        <div class="pad">
          <div style="font-weight:700;color:#0f172a">${esc(invoice.customerName)}</div>
          ${invoice.customerPhone ? `<div>${esc(invoice.customerPhone)}</div>` : ''}
          ${invoice.customerEmail ? `<div>${esc(invoice.customerEmail)}</div>` : ''}
          ${invoice.customerAddress ? `<div>${esc(invoice.customerAddress)}</div>` : ''}
          ${invoice.customerTRN ? `<div>TRN: ${esc(invoice.customerTRN)}</div>` : ''}
        </div>
      </div>
      <div>
        <div class="bar">INVOICE DETAILS</div>
        <div class="pad">
          <div class="ln"><span>Invoice #:</span><span><b>${esc(invoice.invoiceNumber)}</b></span></div>
          <div class="ln"><span>Invoice Date:</span><span>${esc(dateLabel(invoice.invoiceDate))}</span></div>
          ${invoice.dueDate ? `<div class="ln"><span>Due Date:</span><span>${esc(dateLabel(invoice.dueDate))}</span></div>` : ''}
          ${invoice.bookingPnr ? `<div class="ln"><span>Booking PNR:</span><span>${esc(invoice.bookingPnr)}</span></div>` : ''}
          <div class="ln"><span>Payment Status:</span><span class="pill ${esc(invoice.status)}">${esc((invoice.status || 'unpaid').toUpperCase())}</span></div>
        </div>
      </div>
    </div>

    <table class="items">
      <thead><tr>
        <th class="l">Name</th><th>Qty</th><th class="l">Unit</th><th>Unit Cost</th><th>Taxable Amt</th><th>VAT %</th><th>VAT Amt</th><th>Amount</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="bottom">
      <div class="words">
        <div><b>Amount in Words:</b></div>
        <div style="color:#475569">${esc(invoice.amountInWords || '')}</div>
        ${invoice.notes ? `<div style="margin-top:8px;color:#64748b"><b>Notes:</b> ${esc(invoice.notes)}</div>` : ''}
        ${qr ? `<img src="${qr}" class="qr"/>` : ''}
      </div>
      <div class="totals">
        <div class="tr"><span>Sub Total</span><span>${fmt(invoice.subTotal, ccy)}</span></div>
        ${invoice.discount > 0 ? `<div class="tr"><span>Discount</span><span>- ${fmt(invoice.discount, ccy)}</span></div>` : ''}
        ${invoice.vatTotal > 0 ? `<div class="tr"><span>VAT</span><span>${fmt(invoice.vatTotal, ccy)}</span></div>` : ''}
        <div class="tr strong"><span>Grand Total (Incl. VAT)</span><span>${fmt(invoice.grandTotal, ccy)}</span></div>
        <div class="tr"><span>Amount Paid</span><span class="g">${fmt(invoice.amountPaid, ccy)}</span></div>
        <div class="tr strong"><span>Balance Due</span><span class="${invoice.balanceDue > 0 ? 'r2' : 'g'}">${fmt(invoice.balanceDue, ccy)}</span></div>
      </div>
    </div>

    <div class="sign">
      <div class="rc">Receiver's Signature</div>
      <div class="sg">
        ${sig ? `<img src="${esc(sig)}"/>` : ''}
        <div class="nm">${esc(profile.signatureName || '')}</div>
        <div style="color:#64748b">${esc(profile.signatureTitle || 'Authorised Signatory')}</div>
      </div>
    </div>

    <div class="foot">
      ${profile.phone ? `<span>☎ ${esc(profile.phone)}</span>` : ''}
      ${profile.email ? `<span>✉ ${esc(profile.email)}</span>` : ''}
      ${profile.website ? `<span>🌐 ${esc(profile.website)}</span>` : ''}
      ${profile.address ? `<span>📍 ${esc(profile.address)}</span>` : ''}
    </div>
  </body></html>`;
}

/** Open a print window for the invoice in the given layout. */
export async function printInvoice(
  invoice: Invoice,
  profile: InvoiceProfile,
  layout: PrintLayout,
  publicUrl: string
) {
  const html = await buildInvoiceHTML(invoice, profile, layout, publicUrl);
  const win = window.open('', '_blank', layout === 'thermal' ? 'width=360,height=640' : 'width=820,height=1000');
  if (!win) {
    alert('Please allow pop-ups to print the invoice.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
