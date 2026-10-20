import React, { useState, useMemo } from 'react';
import {
  Compass,
  Clock,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  Shield,
  HelpCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { WEBSITE_TOURS, WebsiteTour, getSyncedWebsiteTours } from '../../../data/websiteData';
import { imgSrc } from '../../../../lib/uploads';
import { useApp } from '../../../context/AppContext';
import { useWebsiteLanguage } from '../../../context/WebsiteLanguageContext';
import { useWebsiteCurrency } from '../../../context/WebsiteCurrencyContext';

interface ToursSafarisPageViewProps {
  onSelectBooking: (tourIdOrTitle: string) => void;
  onNavigateHome: () => void;
}

export const ToursSafarisPageView: React.FC<ToursSafarisPageViewProps> = ({
  onSelectBooking,
  onNavigateHome,
}) => {
  const { packages } = useApp();
  const { t } = useWebsiteLanguage();
  const { formatPrice, selectedCurrency } = useWebsiteCurrency();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allTours = useMemo(() => getSyncedWebsiteTours(packages), [packages]);

  const categories = [
    { id: 'All', label: t.common.all },
    { id: 'Desert Safari', label: t.toursPage.catDesert },
    { id: 'City Tour', label: t.toursPage.catCity },
    { id: 'Airport Transit', label: t.toursPage.catTransit },
    { id: 'Sea Tour', label: t.toursPage.catSea },
    { id: 'Private Luxury', label: t.toursPage.catPrivate },
  ];

  const filteredTours = useMemo(() => {
    return allTours.filter((tour) => {
      const matchCat = selectedCategory === 'All' || tour.category === selectedCategory;
      const matchSearch =
        tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allTours, selectedCategory, searchQuery]);

  return (
    <div className="space-y-16 pb-20">
      {/* ─── PAGE HERO BANNER ─── */}
      <section className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden bg-[#05161D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://artrusttravel.com/wp-content/uploads/al_opt_content/IMAGE/artrusttravel.com/wp-content/uploads/2026/02/AR-Trust-Travel-Hero-Slider-1.webp.bv.webp')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05161D]/80 via-[#05161D]/60 to-[#05161D]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
          {/* Breadcrumb */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D3A48]/80 border border-[#C0AB6F]/30 text-xs font-semibold text-[#E7CF8A]">
            <button onClick={onNavigateHome} className="hover:underline">{t.common.home}</button>
            <span>/</span>
            <span className="text-white">{t.navTours}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {t.toursPage.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            {t.toursPage.heroSubtitle}
          </p>

          <div className="text-xs text-[#E7CF8A] font-mono">
            {t.common.licensedDmc}
          </div>
        </div>
      </section>

      {/* ─── FILTER & SEARCH BAR ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-white dark:bg-[#05161D] rounded-3xl p-6 border border-slate-200 dark:border-[#C0AB6F]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar touch-pan-x">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer active:scale-95 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] shadow-md shadow-[#D4AF37]/20 scale-105'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:border-[#C0AB6F]/50 border border-slate-200 dark:border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#C0AB6F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.toursPage.searchPlaceholder}
              className="w-full bg-slate-50 dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>

      {/* ─── TOURS GRID ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        {filteredTours.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#05161D] rounded-3xl border border-slate-200 dark:border-white/10">
            <Compass className="w-12 h-12 text-[#C0AB6F] mx-auto mb-3 opacity-60 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No tours found matching your search</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or searching with different keywords.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#C0AB6F] text-[#05161D] font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <div
                key={tour.id}
                className="group bg-white dark:bg-[#05161D] rounded-3xl overflow-hidden border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:border-[#D4AF37]"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={imgSrc(tour.image)}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badge */}
                    {tour.badge && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#05161D]/90 text-[#E7CF8A] border border-[#C0AB6F]/50 shadow-md">
                        {tour.badge}
                      </span>
                    )}

                    {/* Category pill */}
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#0D3A48]/90 text-white backdrop-blur-sm">
                      {tour.category}
                    </span>

                    {/* Rating badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#E7CF8A] text-xs font-bold border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                      <span>{tour.rating}</span>
                      <span className="text-[10px] text-slate-300 font-normal">({tour.reviewCount})</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                      {tour.title}
                    </h3>

                    {tour.titleAr && (
                      <p className="text-xs text-[#C0AB6F] font-arabic mt-1 text-left">
                        {tour.titleAr}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                      {tour.description}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#C0AB6F]" />
                        <span>{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#C0AB6F]" />
                        <span>{tour.groupSize}</span>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="mt-4 space-y-1.5">
                      {tour.includes.slice(0, 3).map((inc, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                          <span className="truncate">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#C0AB6F] tracking-wider block">
                        {t.common.startingFrom}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {formatPrice(tour.priceQAR)}
                        </span>
                        <span className="text-[10px] text-slate-400">/ {t.common.perPerson}</span>
                      </div>
                      {selectedCurrency.code !== 'QAR' && (
                        <span className="text-[9px] text-slate-400 font-mono block">
                          ≈ QAR {tour.priceQAR}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectBooking(tour.id)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-[#D4AF37]/20"
                    >
                      <span>{t.common.bookNow}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── DESERT SAFARI PREPARATION & FAQ SECTION ─── */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-slate-100/80 dark:bg-[#09232C]/80 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-[#C0AB6F]/30 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 text-xs font-bold uppercase tracking-widest">
              <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Essential Qatar Tour Advice</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions About Our Tours
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300">
            <div className="bg-white dark:bg-[#05161D] p-5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">What should I wear on a Desert Safari?</h4>
              <p>Comfortable lightweight clothing, sunglasses, and slip-on sandals or trainers. In winter months (Nov - Feb), evenings can be cool so bringing a light jacket is recommended.</p>
            </div>
            <div className="bg-white dark:bg-[#05161D] p-5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Do you offer Hamad Airport pickup and dropoff?</h4>
              <p>Yes! All our transit tours and private safaris include curbside airport reception at Hamad International Airport with flight arrival monitoring.</p>
            </div>
            <div className="bg-white dark:bg-[#05161D] p-5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Is dune bashing safe for children and seniors?</h4>
              <p>Yes. Our drivers are licensed safari captains and we can adjust the thrill level from gentle scenic gliding to adventurous high-dune bashing upon your request.</p>
            </div>
            <div className="bg-white dark:bg-[#05161D] p-5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">What is the cancellation policy?</h4>
              <p>Cancellations made up to 24 hours prior to the scheduled departure receive a full 100% refund without hidden administrative deductions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
