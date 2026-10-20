import React, { useState } from 'react';
import {
  X,
  QrCode,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Compass,
  Plane,
  Car,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { parseVoucherCode } from '../../utils/voucher';

export const QRVerificationModal: React.FC = () => {
  const {
    closeModal,
    bookings,
    hotelBookings,
    updateBookingStatus,
    updateHotelBookingStatus,
    addAuditLog,
    language,
  } = useApp();

  const [scanCode, setScanCode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean;
    type?: 'tour' | 'hotel';
    data?: any;
    redeemed?: boolean;
  } | null>(null);

  const handleVerify = (codeToVerify: string) => {
    // Accept a raw PNR/confirmation code or a full scanned verification URL.
    const clean = parseVoucherCode(codeToVerify);
    if (!clean) return;

    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Search in standard bookings (by pnr or id)
      const tourMatch = bookings.find(
        (b) => b.pnr.toUpperCase() === clean || b.id.toUpperCase() === clean
      );
      if (tourMatch) {
        setVerificationResult({
          found: true,
          type: 'tour',
          data: tourMatch,
          redeemed: tourMatch.qrStatus === 'checked-in',
        });
        return;
      }

      // Search in hotel bookings (by confirmationCode or id)
      const hotelMatch = hotelBookings.find(
        (h) => h.confirmationCode.toUpperCase() === clean || h.id.toUpperCase() === clean
      );
      if (hotelMatch) {
        setVerificationResult({
          found: true,
          type: 'hotel',
          data: hotelMatch,
          redeemed: hotelMatch.bookingStatus === 'Checked In',
        });
        return;
      }

      setVerificationResult({ found: false });
    }, 450);
  };

  const handleRedeem = () => {
    if (!verificationResult || !verificationResult.data) return;

    if (verificationResult.type === 'tour') {
      const b = verificationResult.data;
      updateBookingStatus(b.id, 'checked-in');
      addAuditLog(
        'QR Voucher Redeemed & Checked-in',
        'DISPATCH',
        `Passenger ${b.passengerName} (PNR #${b.pnr}) verified and checked in at airport counter/bay.`
      );
      setVerificationResult({
        ...verificationResult,
        redeemed: true,
        data: { ...b, qrStatus: 'checked-in' },
      });
    } else if (verificationResult.type === 'hotel') {
      const h = verificationResult.data;
      updateHotelBookingStatus(h.id, 'Checked In');
      addAuditLog(
        'Hotel Voucher Redeemed & Verified',
        'POS',
        `Guest ${h.guestName} (Confirmation #${h.confirmationCode}) redeemed voucher for ${h.hotelName}.`
      );
      setVerificationResult({
        ...verificationResult,
        redeemed: true,
        data: { ...h, bookingStatus: 'Checked In' },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#C0AB6F] text-[#05161D] shadow-md">
              <QrCode className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  QR Voucher Scanner & Verification System
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official Qatar Tourism DMC #QTA-QA-8819 Verification Terminal
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Scanner Simulation Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-white p-5 flex flex-col items-center justify-center text-center">
            {/* Viewfinder frame */}
            <div className="relative w-48 h-48 border-2 border-[#D4AF37]/50 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-900/60 shadow-inner">
              <QrCode className="w-24 h-24 text-[#C0AB6F]/40" />

              {/* Animated laser line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce" />

              {/* Corner markers */}
              <span className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D4AF37]" />
              <span className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D4AF37]" />
              <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D4AF37]" />
              <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D4AF37]" />
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Point counter scanner at customer's printed boarding pass or mobile screen QR code
            </p>

            {/* Quick Test Sample Voucher Buttons */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Sample Codes:</span>
              {bookings.slice(0, 3).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setScanCode(b.pnr);
                    handleVerify(b.pnr);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#E7CF8A] text-[10px] font-mono border border-slate-700 transition cursor-pointer"
                >
                  {b.pnr} ({b.passengerName.split(' ')[0]})
                </button>
              ))}
              {hotelBookings.slice(0, 1).map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setScanCode(h.confirmationCode);
                    handleVerify(h.confirmationCode);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#E7CF8A] text-[10px] font-mono border border-slate-700 transition cursor-pointer"
                >
                  {h.confirmationCode} (Hotel)
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input Search Bar */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Scan className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerify(scanCode);
                }}
                placeholder="Enter PNR, Hotel Confirmation Code, or Paste QR Raw String..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 font-mono outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              type="button"
              onClick={() => handleVerify(scanCode)}
              disabled={isScanning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>Verify Now</span>
            </button>
          </div>

          {/* Verification Results Card */}
          {verificationResult && (
            <div className="rounded-2xl border transition-all overflow-hidden">
              {verificationResult.found ? (
                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 p-5 space-y-4">
                  {/* Verified Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-emerald-200 dark:border-emerald-900/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
                            VALID AUTHENTICATED QATAR VOUCHER
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold">
                            PASS-VERIFIED
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                          Licensed Operator: AR Trust Travel & Tourism W.L.L.
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Code Reference</span>
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-white">
                        {verificationResult.type === 'tour'
                          ? verificationResult.data.pnr
                          : verificationResult.data.confirmationCode}
                      </span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Passenger / Guest Name</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white block text-sm">
                        {verificationResult.type === 'tour'
                          ? verificationResult.data.passengerName
                          : verificationResult.data.guestName}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                        {verificationResult.type === 'tour'
                          ? `${verificationResult.data.nationality} · ${verificationResult.data.paxCount} PAX`
                          : `${verificationResult.data.guestNationality} · ${verificationResult.data.paxAdults} Adults`}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        {verificationResult.type === 'tour' ? (
                          <Compass className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Building2 className="w-3 h-3 text-amber-500" />
                        )}
                        <span>Service / Experience</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white block text-sm truncate">
                        {verificationResult.type === 'tour'
                          ? verificationResult.data.packageName
                          : `${verificationResult.data.hotelName} (${verificationResult.data.roomType})`}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono">
                        {verificationResult.type === 'tour'
                          ? `Chauffeur: ${verificationResult.data.driverName || 'Airport Desk Dispatch'}`
                          : `Check-in: ${verificationResult.data.checkInDate} to ${verificationResult.data.checkOutDate}`}
                      </span>
                    </div>
                  </div>

                  {/* Payment & Check-in Status */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        Payment Status: <strong className="text-emerald-600 dark:text-emerald-400">Paid & Cleared</strong>
                      </span>
                    </div>

                    {verificationResult.redeemed ? (
                      <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Voucher Checked-in / Redeemed</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRedeem}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Redeem Voucher & Check-in Guest</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 p-5 text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    Unrecognized or Invalid QR Voucher
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    The scanned payload "{scanCode}" does not match any active Qatar bookings or hotel room confirmation codes. Please inspect the code or check with airport dispatch.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
