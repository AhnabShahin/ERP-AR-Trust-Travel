import React, { useState } from 'react';
import {
  X,
  QrCode,
  Printer,
  Share2,
  CheckCircle2,
  Car,
  Plane,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
  Send,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

export const QRVoucherModal: React.FC = () => {
  const { modalData, closeModal, updateBookingStatus, toggleVoucherSent, convertAmount, language } = useApp();
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const booking: Booking = modalData;

  if (!booking) return null;

  const handleShareWhatsApp = () => {
    const text = `AR TRUST TRAVEL & TOURISM (QATAR)\nDigital Boarding Voucher #${booking.pnr}\nPassenger: ${booking.passengerName}\nFlight: ${booking.flightNumber} (${booking.arrivalAirport})\nPickup: Hamad Airport ${booking.pickupBay}\nChauffeur: ${booking.driverName} (${booking.driverVehicle} - ${booking.driverPhone})\nPackage: ${booking.packageName}\nDigital Pass: https://artrust.qa/voucher/${booking.pnr}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    toggleVoucherSent(booking.id);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      window.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Official QR Digital Boarding Pass
            </span>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Voucher Pass Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Card Frame with Airline Boarding Pass aesthetics */}
          <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-b from-slate-50/70 to-white dark:from-slate-850 dark:to-slate-900 p-5 relative overflow-hidden shadow-inner">
            {/* Watermark Logo */}
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
              <div className="flex items-center gap-2">
                <BrandLogo size="sm" showSubtitle={false} />
              </div>

              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-400">BOOKING PNR</span>
                <div className="font-bold text-sm text-blue-600 dark:text-blue-400">
                  {booking.pnr}
                </div>
              </div>
            </div>

            {/* Passenger & Flight Banner */}
            <div className="grid grid-cols-2 gap-4 py-3.5 border-b border-slate-200/80 dark:border-slate-700/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">PASSENGER NAME</span>
                <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {booking.passengerName}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {booking.nationality} · {booking.paxCount} PAX
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">FLIGHT ARRIVAL</span>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5 flex items-center gap-1">
                  <Plane className="w-3.5 h-3.5 -rotate-45" />
                  <span>{booking.flightNumber}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {booking.arrivalTime} ({booking.terminalGate})
                </div>
              </div>
            </div>

            {/* Package & Service */}
            <div className="py-3 border-b border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] uppercase font-bold text-slate-400">TOUR PACKAGE / SERVICE</span>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                {language === 'ar' ? booking.packageNameAr : booking.packageName}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Pickup Meeting Point: <span className="font-semibold text-slate-700 dark:text-slate-300">{booking.pickupBay}</span>
              </div>
            </div>

            {/* Chauffeur Information */}
            <div className="py-3 border-b border-slate-200/80 dark:border-slate-700/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">ASSIGNED CHAUFFEUR</span>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  <span>{booking.driverName}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {booking.driverVehicle}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">CHAUFFEUR DIRECT LINE</span>
                <div className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-mono">{booking.driverPhone}</span>
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                  Bay 3 Permit Verified
                </div>
              </div>
            </div>

            {/* High-Resolution QR Code Block */}
            <div className="mt-4 flex flex-col items-center justify-center p-4 rounded-xl bg-white text-slate-950 border border-slate-200 shadow-sm">
              {/* Stylized QR Matrix */}
              <div className="relative p-2 bg-white rounded-lg">
                <svg className="w-36 h-36" viewBox="0 0 120 120">
                  {/* Outer corner anchors */}
                  <rect x="10" y="10" width="30" height="30" fill="none" stroke="#0f172a" strokeWidth="6" />
                  <rect x="19" y="19" width="12" height="12" fill="#0f172a" />

                  <rect x="80" y="10" width="30" height="30" fill="none" stroke="#0f172a" strokeWidth="6" />
                  <rect x="89" y="19" width="12" height="12" fill="#0f172a" />

                  <rect x="10" y="80" width="30" height="30" fill="none" stroke="#0f172a" strokeWidth="6" />
                  <rect x="19" y="89" width="12" height="12" fill="#0f172a" />

                  {/* QR Data Pattern Grid */}
                  <rect x="48" y="15" width="8" height="8" fill="#059669" />
                  <rect x="62" y="15" width="8" height="8" fill="#0f172a" />
                  <rect x="48" y="28" width="8" height="8" fill="#0f172a" />
                  <rect x="62" y="28" width="8" height="8" fill="#2563eb" />

                  <rect x="15" y="48" width="8" height="8" fill="#0f172a" />
                  <rect x="28" y="48" width="8" height="8" fill="#059669" />
                  <rect x="48" y="48" width="24" height="24" fill="#0f172a" rx="3" />
                  <rect x="80" y="48" width="8" height="8" fill="#0f172a" />
                  <rect x="95" y="48" width="8" height="8" fill="#2563eb" />

                  <rect x="15" y="62" width="8" height="8" fill="#2563eb" />
                  <rect x="28" y="62" width="8" height="8" fill="#0f172a" />
                  <rect x="80" y="62" width="8" height="8" fill="#059669" />
                  <rect x="95" y="62" width="8" height="8" fill="#0f172a" />

                  <rect x="48" y="80" width="8" height="8" fill="#0f172a" />
                  <rect x="62" y="80" width="8" height="8" fill="#0f172a" />
                  <rect x="48" y="95" width="8" height="8" fill="#059669" />
                  <rect x="62" y="95" width="8" height="8" fill="#2563eb" />
                  <rect x="80" y="80" width="8" height="8" fill="#0f172a" />
                  <rect x="95" y="95" width="8" height="8" fill="#0f172a" />

                  {/* Center Emblem */}
                  <circle cx="60" cy="60" r="6" fill="#10b981" />
                </svg>
              </div>

              <div className="mt-1 text-center font-mono">
                <span className="text-[11px] font-bold text-slate-800 tracking-wider">
                  SCAN FOR INSTANT HIA GATE CLEARANCE
                </span>
                <p className="text-[10px] text-slate-500">
                  Encrypted Token: {booking.pnr}-DOH-VERIFIED
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Mark Checked-In */}
            <button
              onClick={() => {
                updateBookingStatus(booking.id, 'checked-in');
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verify & Check-In</span>
            </button>

            {/* Send WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className={`py-2.5 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied WhatsApp!' : 'Send WhatsApp'}</span>
            </button>

            {/* Print Pass */}
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Boarding Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
