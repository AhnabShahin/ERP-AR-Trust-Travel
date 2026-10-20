import React, { useState } from 'react';
import {
  Car,
  MapPin,
  Phone,
  Plane,
  CheckCircle2,
  Clock,
  Navigation,
  Users,
  Compass,
  Send,
  Coins,
  QrCode,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';

export const DriverPortalView: React.FC = () => {
  const { bookings, drivers, convertAmount, openModal, language, t } = useApp();

  // Active driver is Tariq Al-Kuwari (drv-1)
  const currentDriver = drivers[0];

  // Assigned trips for Tariq
  const assignedBookings = bookings.filter((b) => b.driverId === currentDriver.id);

  const [activeStep, setActiveStep] = useState<'bay' | 'boarded' | 'transit' | 'done'>('bay');

  const activeTrip = assignedBookings[0] || bookings[0];

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-12 select-none">
      {/* Mobile-Friendly Driver Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <BrandLogo size="sm" variant="mark-only" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ON DUTY · BAY 3 ACCESS</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-base shadow-md">
            TK
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold truncate">{currentDriver.name}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono mt-0.5">
              <span>{currentDriver.vehicle}</span>
              <span>·</span>
              <span className="text-emerald-400 font-bold">{currentDriver.plateNumber}</span>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Daily Commission</span>
            <span className="text-lg font-extrabold text-emerald-400">{convertAmount(380).formatted}</span>
          </div>
        </div>

        {/* Daily Stats Grid */}
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded-xl bg-slate-800/50">
            <span className="text-[10px] text-slate-400 block">Trips Today</span>
            <span className="text-sm font-bold text-white">4 Trips</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/50">
            <span className="text-[10px] text-slate-400 block">Guests Escorted</span>
            <span className="text-sm font-bold text-blue-400">11 PAX</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/50">
            <span className="text-[10px] text-slate-400 block">Driver Rating</span>
            <span className="text-sm font-bold text-amber-400">★ 4.95</span>
          </div>
        </div>
      </div>

      {/* Active Mission Card */}
      {activeTrip && (
        <div className="bg-white dark:bg-slate-900 border-2 border-blue-500/60 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Navigation className="w-4 h-4 animate-spin-slow" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                  CURRENT ACTIVE MISSION
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activeTrip.packageName}
                </h3>
              </div>
            </div>

            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {activeTrip.pnr}
            </span>
          </div>

          {/* Guest & Flight Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">LEAD PASSENGER</span>
              <div className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                {activeTrip.passengerName}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                {activeTrip.paxCount} Travelers · {activeTrip.nationality}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">FLIGHT & MEETING POINT</span>
              <div className="font-bold text-blue-600 dark:text-blue-400 font-mono text-xs mt-0.5 flex items-center gap-1">
                <Plane className="w-3.5 h-3.5 -rotate-45" />
                <span>{activeTrip.flightNumber}</span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                {activeTrip.pickupBay} (Counter 4 Escort)
              </div>
            </div>
          </div>

          {/* Quick Actions for Passenger Contact */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href={`tel:${activeTrip.passengerPhone}`}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-3.5 h-3.5 text-blue-500" />
              <span>Call Passenger</span>
            </a>

            <button
              onClick={() => openModal('qr-voucher', activeTrip)}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verify QR Pass</span>
            </button>
          </div>

          {/* Mission Progress Tracker */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              MISSION EXECUTION STATUS
            </span>

            <div className="grid grid-cols-4 gap-1.5 text-[11px] font-semibold text-center font-mono">
              <button
                onClick={() => setActiveStep('bay')}
                className={`py-2 px-1 rounded-xl transition ${
                  activeStep === 'bay'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                1. At Bay 3
              </button>
              <button
                onClick={() => setActiveStep('boarded')}
                className={`py-2 px-1 rounded-xl transition ${
                  activeStep === 'boarded'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                2. Boarded
              </button>
              <button
                onClick={() => setActiveStep('transit')}
                className={`py-2 px-1 rounded-xl transition ${
                  activeStep === 'transit'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                3. En Route
              </button>
              <button
                onClick={() => setActiveStep('done')}
                className={`py-2 px-1 rounded-xl transition ${
                  activeStep === 'done'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                4. Completed
              </button>
            </div>

            {/* Prominent Action Button based on current step */}
            <button
              onClick={() => {
                if (activeStep === 'bay') setActiveStep('boarded');
                else if (activeStep === 'boarded') setActiveStep('transit');
                else if (activeStep === 'transit') setActiveStep('done');
                else setActiveStep('bay');
              }}
              className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {activeStep === 'bay'
                  ? 'Confirm Guests Met & Boarded Vehicle'
                  : activeStep === 'boarded'
                  ? 'Depart HIA & Start GPS Navigation'
                  : activeStep === 'transit'
                  ? 'Mark Tour Completed & File Commission'
                  : 'Mission Successfully Completed!'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Completed Trips Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Today's Trip History & Earnings</span>
        </h3>

        <div className="space-y-2 text-xs">
          {assignedBookings.map((b) => (
            <div
              key={b.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {b.passengerName}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {b.packageName} · {b.paxCount} PAX
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Pick: {b.pickupBay} → Drop: Inland Sea Camp
                </span>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  +QAR 120 Comm.
                </span>
                <div className="text-[10px] text-slate-400">Completed</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
