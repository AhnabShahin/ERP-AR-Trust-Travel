import React, { useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Hotel,
  Car,
  Compass,
  Star,
} from 'lucide-react';
import { MultiDayPackage, getSyncedHolidayPackages } from '../../../data/websiteData';
import { imgSrc } from '../../../../lib/uploads';
import { useApp } from '../../../context/AppContext';
import { useWebsiteLanguage } from '../../../context/WebsiteLanguageContext';
import { useWebsiteCurrency } from '../../../context/WebsiteCurrencyContext';
import holidayPackagesHeroImage from '../../../assets/holiday-packages-hero.jpg';

interface HolidayPackagesPageViewProps {
  onSelectBooking: (packageIdOrTitle: string) => void;
  onNavigateHome: () => void;
}

export const HolidayPackagesPageView: React.FC<HolidayPackagesPageViewProps> = ({
  onSelectBooking,
  onNavigateHome,
}) => {
  const { packages } = useApp();
  const { t } = useWebsiteLanguage();
  const { formatPrice, selectedCurrency } = useWebsiteCurrency();
  const allPackages = useMemo(() => getSyncedHolidayPackages(packages), [packages]);
  return (
    <div className="space-y-16 pb-20">
      {/* ─── PAGE HERO BANNER ─── */}
      <section className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden bg-[#05161D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url(${holidayPackagesHeroImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05161D]/80 via-[#05161D]/60 to-[#05161D]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
          {/* Breadcrumb */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D3A48]/80 border border-[#C0AB6F]/30 text-xs font-semibold text-[#E7CF8A]">
            <button onClick={onNavigateHome} className="hover:underline">{t.common.home}</button>
            <span>/</span>
            <span className="text-white">{t.navPackages}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {t.packagesPage.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            {t.packagesPage.heroSubtitle}
          </p>

          <div className="text-xs text-[#E7CF8A] font-mono">
            {t.common.licensedDmc}
          </div>
        </div>
      </section>

      {/* ─── PACKAGES LIST ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
        {allPackages.map((pkg, idx) => (
          <div
            key={pkg.id}
            className="bg-white dark:bg-[#05161D] rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-xl overflow-hidden hover:border-[#D4AF37] transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Image & Summary */}
              <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full">
                <img
                  src={imgSrc(pkg.image)}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#05161D]" />

                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/40 shadow-lg">
                    {pkg.days} Days / {pkg.nights} Nights
                  </span>
                  {pkg.badge && (
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] shadow-lg">
                      {pkg.badge}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white lg:hidden">
                  <h3 className="text-xl font-black">{pkg.title}</h3>
                </div>
              </div>

              {/* Right Details & Timeline */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="hidden lg:block text-2xl font-black text-slate-900 dark:text-white">
                    {pkg.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {pkg.tagline}
                  </p>

                  {/* Day-by-Day Highlights */}
                  <div className="mt-6 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#C0AB6F]">
                      Day-by-Day Itinerary Highlights
                    </h4>
                    <div className="space-y-2">
                      {pkg.highlights.map((hl, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#09232C] border border-slate-200/80 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inclusions & Exclusions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-white/10 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Included In Package</span>
                      </span>
                      <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                        {pkg.included.map((inc, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C0AB6F]" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2 text-[11px] uppercase tracking-wider text-rose-500">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Excluded</span>
                      </span>
                      <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                        {pkg.excluded.map((exc, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Pricing & Booking Trigger */}
                <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#C0AB6F] tracking-wider block">
                      {t.common.startingFrom}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        {formatPrice(pkg.priceQAR)}
                      </span>
                      <span className="text-xs text-slate-400">/ {t.common.perPerson}</span>
                    </div>
                    {selectedCurrency.code !== 'QAR' && (
                      <span className="text-[9px] text-slate-400 font-mono block">
                        ≈ QAR {pkg.priceQAR}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectBooking(pkg.id)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs shadow-lg shadow-[#D4AF37]/25 active:scale-95 transition cursor-pointer flex items-center gap-2"
                  >
                    <span>{t.packagesPage.reservePackage}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── CUSTOM TAILOR-MADE ITINERARY BANNER ─── */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#05161D] via-[#0D3A48] to-[#09232C] border border-[#C0AB6F]/40 shadow-2xl text-white text-center space-y-4 max-w-4xl mx-auto">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 inline-block">
            Tailor-Made Qatar Vacations
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            Want a Custom Multi-Day Itinerary or Private Yacht Glamping?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Our luxury travel designers customize hotel stays, desert Majlis glamping, and VIP chauffeur schedules according to your group size and preferences.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/97455557164?text=Hello%20AR%20Trust%20Travel!%20I%20would%20like%20to%20request%20a%20customized%20vacation%20package."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs shadow-xl active:scale-95 transition cursor-pointer"
            >
              <span>Design My Custom Trip on WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
