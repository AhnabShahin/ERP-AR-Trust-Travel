import React, { useState } from 'react';
import {
  Plane,
  MapPin,
  Clock,
  Car,
  ChevronRight,
  Filter,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FlightInfo } from '../../types';

export const FlightTransitMapWidget: React.FC = () => {
  const { flights, language, openModal } = useApp();
  const [selectedFlight, setSelectedFlight] = useState<FlightInfo>(flights[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredFlights = flights.filter((f) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'landed') return f.status === 'Landed' || f.status === 'Baggage Claim';
    if (filterStatus === 'approaching') return f.status === 'Approaching';
    return true;
  });

  // Hotspots representing Doha & Hamad International Airport transit corridors
  const waypoints = [
    { id: 'hia', name: 'Hamad Int’l (DOH)', nameAr: 'مطار حمد الدولي', x: 74, y: 62, type: 'airport', active: true },
    { id: 'bay3', name: 'Arrivals Bay 3', nameAr: 'موقف القادمون 3', x: 68, y: 58, type: 'pickup', active: selectedFlight.flightNumber === 'QR 138' },
    { id: 'westbay', name: 'West Bay Towers', nameAr: 'أبراج الخليج الغربي', x: 52, y: 35, type: 'hotel', active: true },
    { id: 'pearl', name: 'The Pearl Qatar', nameAr: 'جزيرة اللؤلؤة', x: 58, y: 24, type: 'hotel', active: true },
    { id: 'souq', name: 'Souq Waqif Hub', nameAr: 'مركز سوق واقف', x: 50, y: 48, type: 'hub', active: true },
    { id: 'sealine', name: 'Khor Al Adaid Dunes', nameAr: 'كثبان خور العديد', x: 78, y: 88, type: 'safari', active: true },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors flex flex-col justify-between">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {language === 'ar'
                ? 'خريطة استقبال وترانزيت مطار حمد الدولي (DOH)'
                : 'Hamad Int’l (DOH) Live Passenger Transit Radar'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'متابعة مباشرة لهبوط الطائرات، بوابات القدوم، وتوجيه سيارات الاستقبال'
              : 'Real-time flight apron arrivals, pickup bays & chauffeur dispatch'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All Flights'} ({flights.length})
          </button>
          <button
            onClick={() => setFilterStatus('landed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'landed'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? 'وصلت' : 'Landed'}
          </button>
          <button
            onClick={() => setFilterStatus('approaching')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filterStatus === 'approaching'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {language === 'ar' ? 'في الأجواء' : 'Airborne'}
          </button>
        </div>
      </div>

      {/* Main Radar & Flight Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Left: Interactive Tactical Transit Map */}
        <div className="lg:col-span-7 relative h-72 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden group">
          {/* Stylized Doha Bay & Peninsula Graphic Background */}
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 400 300" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
              <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Coastline curve */}
            <path
              d="M 120,0 C 140,80 180,110 240,150 C 300,190 310,250 340,300"
              fill="none"
              stroke="#0f3d38"
              strokeWidth="24"
              strokeLinecap="round"
              opacity="0.4"
            />
            {/* Transit Route Arc from HIA to West Bay */}
            <path
              d="M 296,186 Q 240,130 190,105"
              fill="none"
              stroke="url(#corridorGrad)"
              strokeWidth="3"
              strokeDasharray="4 4"
              className="animate-[dash_20s_linear_infinite]"
            />
            {/* Transit Route Arc from HIA to Dunes */}
            <path
              d="M 296,186 Q 310,230 312,264"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="4 3"
            />
          </svg>

          {/* Map Status Badge Overlay */}
          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 bg-slate-900/90 backdrop-blur-xs border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 flex items-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono">LIVE GPS FEED · DOH SECTOR</span>
          </div>

          <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 bg-slate-900/90 backdrop-blur-xs border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-emerald-400 font-mono z-10">
            28 CHAUFFEURS ON GRID
          </div>

          {/* Waypoints & Pins */}
          {waypoints.map((point) => (
            <div
              key={point.id}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer transition-transform hover:scale-125 z-10"
              title={point.name}
            >
              <div
                className={`relative flex items-center justify-center rounded-full ${
                  point.type === 'airport'
                    ? 'w-7 h-7 bg-blue-600 ring-4 ring-blue-500/30 text-white'
                    : point.type === 'pickup'
                    ? 'w-6 h-6 bg-emerald-500 ring-4 ring-emerald-500/30 text-white'
                    : point.type === 'safari'
                    ? 'w-5 h-5 bg-amber-500 ring-4 ring-amber-500/20 text-white'
                    : 'w-5 h-5 bg-slate-700 text-slate-200'
                }`}
              >
                {point.type === 'airport' ? (
                  <Plane className="w-3.5 h-3.5 -rotate-45" />
                ) : point.type === 'pickup' ? (
                  <Car className="w-3 h-3" />
                ) : (
                  <MapPin className="w-3 h-3" />
                )}
              </div>

              {/* Pin Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/pin:flex flex-col items-center bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap border border-slate-700 z-20">
                <span className="font-semibold">{language === 'ar' ? point.nameAr : point.name}</span>
                <span className="text-slate-400 text-[9px] capitalize">{point.type} station</span>
              </div>
            </div>
          ))}

          {/* Moving aircraft token indicator */}
          <div
            style={{ left: '72%', top: '48%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
          >
            <div className="flex items-center gap-1.5 bg-blue-900/90 border border-blue-400/50 rounded-full px-2 py-0.5 shadow-md">
              <Plane className="w-3 h-3 text-blue-300 animate-pulse -rotate-12" />
              <span className="text-[10px] font-mono font-bold text-blue-200">
                {selectedFlight.flightNumber}
              </span>
            </div>
          </div>

          {/* Bottom Overlay Info Banner */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs z-10">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="text-white font-medium">
                  {selectedFlight.airline} {selectedFlight.flightNumber}
                </span>
                <span className="text-slate-400 mx-1.5">·</span>
                <span className="text-slate-400 font-mono">{selectedFlight.originCity} ({selectedFlight.originIata})</span>
              </div>
            </div>
            <button
              onClick={() => openModal('flight-detail', selectedFlight)}
              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0"
            >
              <span>{language === 'ar' ? 'تفاصيل الركاب' : 'View Manifest'}</span>
              <ChevronRight className="w-3 h-3 rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* Right: Live Flight Arrivals List */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>{language === 'ar' ? 'الرحلات المتزامنة بمطار حمد' : 'Incoming Arrivals (HIA)'}</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Gate & Carousel Sync</span>
          </div>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {filteredFlights.map((flight) => {
              const isSelected = selectedFlight.flightNumber === flight.flightNumber;
              return (
                <div
                  key={flight.flightNumber}
                  onClick={() => setSelectedFlight(flight)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500/50 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                        {flight.flightNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
                        {flight.originCity}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        flight.status === 'Landed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : flight.status === 'Baggage Claim'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                      }`}
                    >
                      {flight.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>ETA: {flight.estimatedArrival}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Gate {flight.gate}</span>
                      <span>·</span>
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Users className="w-3 h-3 text-blue-500" />
                        <span>{flight.assignedBookingsCount} pax</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Live data synced with HIA Apron Control</span>
            <button
              onClick={() => openModal('flight-detail', selectedFlight)}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Expand Radar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
