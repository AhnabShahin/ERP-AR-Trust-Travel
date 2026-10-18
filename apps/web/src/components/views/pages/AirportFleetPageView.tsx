import React, { useState, useMemo } from 'react';
import {
  Plane,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Users,
  Briefcase,
  Shield,
  Award,
  Sparkles,
} from 'lucide-react';
import { getSyncedFleet, FleetVehicle } from '../../../data/websiteData';
import { useApp } from '../../../context/AppContext';
import { useWebsiteLanguage } from '../../../context/WebsiteLanguageContext';
import { useWebsiteCurrency } from '../../../context/WebsiteCurrencyContext';
import vipAirportTransitHeroImage from '../../../assets/vip-airport-transit-hero.jpg';
import { mercedesVClass } from '../../../assets/cars';

interface AirportFleetPageViewProps {
  onSelectBooking: (vehicleIdOrTitle: string) => void;
  onNavigateHome: () => void;
}

export const AirportFleetPageView: React.FC<AirportFleetPageViewProps> = ({
  onSelectBooking,
  onNavigateHome,
}) => {
  const { fleetVehicles } = useApp();
  const { t } = useWebsiteLanguage();
  const { formatPrice, selectedCurrency } = useWebsiteCurrency();
  const allFleet = useMemo(() => getSyncedFleet(fleetVehicles), [fleetVehicles]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    { id: 'All', label: `${t.fleetPage.allFleet} (${allFleet.length})` },
    { id: 'VIP Luxury', label: 'VIP Luxury' },
    { id: 'Safari 4x4', label: 'Safari 4x4' },
    { id: 'Executive Sedan', label: 'Executive Sedans' },
    { id: 'Group Van', label: 'Group Vans' },
    { id: 'Family MPV', label: 'Family MPV' },
    { id: 'Coaster & Coach', label: 'Buses & Coaches' },
  ];

  const filteredFleet = useMemo(() => {
    if (selectedCategory === 'All') return allFleet;
    if (selectedCategory === 'Coaster & Coach') {
      return allFleet.filter(
        (v) => v.category === 'Coaster Bus' || v.category === 'Luxury Coach'
      );
    }
    return allFleet.filter((v) => v.category === selectedCategory);
  }, [selectedCategory, allFleet]);

  return (
    <div className="space-y-16 pb-20">
      {/* ─── PAGE HERO BANNER ─── */}
      <section className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden bg-[#05161D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url(${vipAirportTransitHeroImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05161D]/80 via-[#05161D]/60 to-[#05161D]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
          {/* Breadcrumb */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D3A48]/80 border border-[#C0AB6F]/30 text-xs font-semibold text-[#E7CF8A]">
            <button onClick={onNavigateHome} className="hover:underline">{t.common.home}</button>
            <span>/</span>
            <span className="text-white">{t.navFleet}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {t.fleetPage.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            {t.fleetPage.heroSubtitle}
          </p>

          <div className="text-xs text-[#E7CF8A] font-mono">
            {t.common.licensedDmc}
          </div>
        </div>
      </section>

      {/* ─── SERVICE GUARANTEES PILLARS ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: t.fleetPage.flightDelayTracking, desc: t.fleetPage.flightDelayTrackingDesc },
            { title: t.fleetPage.curbsideGreeting, desc: t.fleetPage.curbsideGreetingDesc },
            { title: t.fleetPage.complimentaryWater, desc: t.fleetPage.complimentaryWaterDesc },
            { title: t.fleetPage.climateControl, desc: t.fleetPage.climateControlDesc },
          ].map((pill, i) => (
            <div key={i} className="bg-white dark:bg-[#05161D] p-5 rounded-2xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-[#C0AB6F]" />
                <span>{pill.title}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {pill.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CATEGORY FILTER TABS ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] shadow-md shadow-[#D4AF37]/25 scale-105'
                  : 'bg-white dark:bg-[#05161D]/80 text-slate-600 dark:text-slate-300 hover:border-[#C0AB6F]/50 border border-slate-200 dark:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── FLEET VEHICLES GRID (ALL AUTHENTIC CARS) ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFleet.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white dark:bg-[#05161D] rounded-3xl p-6 border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:border-[#D4AF37] group"
            >
              <div>
                {/* Category Pill & Capacity */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/30">
                    {vehicle.category}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                    {vehicle.passengers} Seats · {vehicle.luggage} Bags
                  </span>
                </div>

                {/* Vehicle Image Showroom Stage */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-5 border border-slate-200/60 dark:border-white/10 shadow-md bg-slate-900">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = mercedesVClass;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Title & Ideal For */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors">
                  {vehicle.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {vehicle.idealFor}
                </p>

                {/* Features */}
                <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-white/10 pt-3">
                  {vehicle.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Book Transfer Drawer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C0AB6F] tracking-wider block">
                    {t.common.startingFrom}
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {formatPrice(vehicle.priceQAR)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-normal">
                    {vehicle.rateType}
                  </span>
                  {selectedCurrency.code !== 'QAR' && (
                    <span className="text-[9px] text-slate-400 font-mono block">
                      ≈ QAR {vehicle.priceQAR}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onSelectBooking(vehicle.id)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-bold text-xs shadow-md shadow-[#D4AF37]/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{t.fleetPage.bookTransfer}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CORPORATE & VIP CONCIERGE BANNER ─── */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#05161D] via-[#0D3A48] to-[#09232C] border border-[#C0AB6F]/40 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 inline-block">
              Corporate & Government Delegations
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Need Dedicated 24/7 Chauffeur or Multi-Bus Charter?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              We provide long-term executive vehicle rentals, diplomat motorcades with security liaison, and high-capacity conference transport throughout Doha.
            </p>
          </div>

          <a
            href="https://wa.me/97455557164?text=Hello%20AR%20Trust%20Travel!%20I%20would%20like%20to%20request%20a%20corporate%20fleet%20inquiry."
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs shrink-0 shadow-lg cursor-pointer"
          >
            Inquire Corporate Rates
          </a>
        </div>
      </section>
    </div>
  );
};
