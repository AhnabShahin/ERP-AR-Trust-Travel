// =====================================================================
// Voucher QR payload helpers.
// The QR on a voucher encodes a verification URL carrying the booking code
// (PNR or hotel confirmation). The verification terminal can read either the
// raw code or a full scanned URL/token and recover the code.
// =====================================================================

/** Build the scannable verification payload (a URL) for a booking code. */
export function buildVoucherPayload(code: string): string {
  const clean = (code || '').trim();
  let origin = 'https://artrust.qa';
  try {
    if (typeof window !== 'undefined' && window.location?.origin) origin = window.location.origin;
  } catch {
    /* SSR / no window */
  }
  return `${origin}/verify?c=${encodeURIComponent(clean)}`;
}

/** Recover a booking code from a raw code or a scanned verification URL. */
export function parseVoucherCode(input: string): string {
  const raw = (input || '').trim();
  if (!raw) return '';
  // Try to pull ?c= / &c= out of a URL or query-ish string.
  const match = raw.match(/[?&]c=([^&\s]+)/i);
  if (match) {
    try {
      return decodeURIComponent(match[1]).trim().toUpperCase();
    } catch {
      return match[1].trim().toUpperCase();
    }
  }
  return raw.toUpperCase();
}
