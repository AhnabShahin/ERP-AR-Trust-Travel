import React from 'react';
import { X, Plane, Users, MapPin, Clock, Luggage, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FlightInfo } from '../../types';

export const FlightDetailModal: React.FC = () => {
  const { modalData, closeModal, bookings, convertAmount } = useApp();

  const flight: FlightInfo = modalData;
  if (!flight) return null;

  const flightBookings = bookings.filter((b) => b.flightNumber === flight.flightNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {flight.flightNumber}
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {flight.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {flight.airline} · {flight.originCity} ({flight.originIata}) → Doha (DOH)
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Apron Details */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh] text-xs">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-mono">ARRIVAL TIME</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {flight.estimatedArrival}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-mono">GATE & TERMINAL</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                Gate {flight.gate}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-mono">BAGGAGE BELT</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {flight.carousel}
              </span>
            </div>
          </div>

          {/* Assigned Passengers Manifest */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Assigned Passengers ({flightBookings.length} bookings)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">Meeting at Counter 4</span>
            </div>

            <div className="mt-2 space-y-2">
              {flightBookings.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  No reservations currently linked to this flight.
                </div>
              ) : (
                flightBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{b.passengerName}</span>
                        <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                          {b.pnr}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {b.packageName} · {b.paxCount} PAX
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Driver: {b.driverName} ({b.driverVehicle})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {convertAmount(b.totalQAR).formatted}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {b.qrStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-medium hover:bg-slate-800 dark:hover:bg-slate-700 text-xs"
          >
            Close Manifest
          </button>
        </div>
      </div>
    </div>
  );
};
