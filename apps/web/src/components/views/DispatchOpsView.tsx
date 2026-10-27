import React, { useState } from 'react';
import {
  Compass,
  Car,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  Search,
  Filter,
  Users,
  Navigation,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Driver } from '../../types';

export const DispatchOpsView: React.FC = () => {
  const { drivers, updateDriverStatus, language, t } = useApp();
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [dispatchedId, setDispatchedId] = useState<string | null>(null);

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      d.plateNumber.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'all' || d.status === filterType;
    return matchesSearch && matchesType;
  });

  const handleSendDispatchAlert = (driver: Driver) => {
    const msg = `AR Trust Dispatch: Driver ${driver.name}, your assigned pickup at HIA Bay is confirmed. Active passengers: ${driver.activePassengers}. Mission: ${driver.currentMission}`;
    navigator.clipboard?.writeText(msg);
    setDispatchedId(driver.id);
    setTimeout(() => setDispatchedId(null), 2500);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-500" />
            <span>{language === 'ar' ? 'غرفة العمليات والتوجيه الميداني (السائقون والمرشدون)' : 'Dispatch & Field Operations Control'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time telemetry, airport apron pickup permits & desert safari driver dispatching
          </p>
        </div>

        {/* Status count */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
            28 / 34 Active on Duty
          </span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          {['all', 'At Airport Bay', 'Dispatched', 'En Route', 'Standby'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterType(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterType === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search driver name, vehicle model, plate number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => {
          return (
            <div
              key={driver.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 transition hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between"
            >
              <div>
                {/* Driver Name & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs">
                      {driver.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                        {driver.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {driver.phone}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      driver.status === 'At Airport Bay'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : driver.status === 'Dispatched'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : driver.status === 'En Route'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {driver.status}
                  </span>
                </div>

                {/* Vehicle Details */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{driver.vehicle}</span>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                      {driver.plateNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[150px]">{driver.location}</span>
                    </div>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ★ {driver.rating}
                    </span>
                  </div>
                </div>

                {/* Current Active Mission */}
                <div className="mt-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Assignment:</span>
                  <p className="mt-0.5 text-[11px] text-slate-700 dark:text-slate-300 leading-tight">
                    {driver.currentMission}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <select
                  value={driver.status}
                  onChange={(e) => updateDriverStatus(driver.id, e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200"
                >
                  <option value="At Airport Bay">At Airport Bay</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="En Route">En Route</option>
                  <option value="Standby">Standby</option>
                  <option value="Off Duty">Off Duty</option>
                </select>

                <button
                  onClick={() => handleSendDispatchAlert(driver)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition ${
                    dispatchedId === driver.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600'
                  }`}
                  title="Send WhatsApp Dispatch Order"
                >
                  <Send className="w-3 h-3" />
                  <span>{dispatchedId === driver.id ? 'Dispatched!' : 'WhatsApp'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
