import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  Star,
  Clock,
  Plane,
  Check,
  ChevronLeft,
  X,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  CORE_SERVICES,
  getSyncedWebsiteTours,
  getSyncedHolidayPackages,
  getSyncedFleet,
} from '../../data/websiteData';
import { useApp } from '../../context/AppContext';
import { imgSrc } from '../../../lib/uploads';
import { useWebsiteLanguage } from '../../context/WebsiteLanguageContext';
import { useWebsiteCurrency } from '../../context/WebsiteCurrencyContext';

interface ExploreSearchViewProps {
  initialSearchQuery?: string;
  initialCategory?: string;
  onBackToHome: () => void;
  onSelectBooking: (itemTitle: string) => void;
}

export const ExploreSearchView: React.FC<ExploreSearchViewProps> = ({
  initialSearchQuery = '',
  initialCategory = 'All',
  onBackToHome,
  onSelectBooking,
}) => {
  const { packages, fleetVehicles } = useApp();
  const { t } = useWebsiteLanguage();
  const { formatPrice } = useWebsiteCurrency();

  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceFilter, setPriceFilter] = useState<'all' | 'under200' | '200to500' | 'above500'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'priceLow' | 'priceHigh'>('popular');

  const dynamicTours = useMemo(() => getSyncedWebsiteTours(packages), [packages]);
  const dynamicPackages = useMemo(() => getSyncedHolidayPackages(packages), [packages]);
  const dynamicFleet = useMemo(() => getSyncedFleet(fleetVehicles), [fleetVehicles]);

  // Unified items list
  const allItems = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      category: string;
      itemType: 'tour' | 'fleet' | 'multiday' | 'service';
      image?: string;
      priceQAR?: number;
      durationOrCapacity: string;
      description: string;
      rating?: number;
      badge?: string;
      features: string[];
    }> = [];

    // 1. Tours (Dynamic from Dashboard Catalog)
    dynamicTours.forEach((t) => {
      list.push({
        id: t.id,
        title: t.title,
        category: t.category,
        itemType: 'tour',
        image: t.image,
        priceQAR: t.priceQAR,
        durationOrCapacity: t.duration,
        description: t.description,
        rating: t.rating,
        badge: t.badge,
        features: t.includes,
      });
    });

    // 2. Fleet
    dynamicFleet.forEach((f) => {
      list.push({
        id: f.id,
        title: f.name,
        category: 'Airport Fleet',
        itemType: 'fleet',
        image: f.image,
        priceQAR: f.priceQAR,
        durationOrCapacity: `${f.passengers} Pax · ${f.luggage} Luggage`,
        description: f.idealFor,
        badge: f.category,
        features: f.features,
      });
    });

    // 3. Multi-day packages (Dynamic from Dashboard Catalog)
    dynamicPackages.forEach((p) => {
      list.push({
        id: p.id,
        title: p.title,
        category: 'Multi-Day Package',
        itemType: 'multiday',
        image: p.image,
        priceQAR: p.priceQAR,
        durationOrCapacity: `${p.days} Days / ${p.nights} Nights`,
        description: p.tagline,
        badge: p.badge,
        features: p.highlights,
      });
    });

    // 4. Core Services
    CORE_SERVICES.forEach((s) => {
      list.push({
        id: s.id,
        title: s.title,
        category: 'Travel Service',
        itemType: 'service',
        durationOrCapacity: '24/7 Operations',
        description: s.description,
        badge: 'Official Service',
        features: s.benefits,
      });
    });

    return list;
  }, [dynamicTours, dynamicFleet, dynamicPackages]);

  // Filter logic
  const filteredResults = useMemo(() => {
    return allItems
      .filter((item) => {
        // Keyword match
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchFeat = item.features.some((f) => f.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCat && !matchFeat) return false;
        }

        // Category match
        if (selectedCategory !== 'All') {
          if (selectedCategory === 'Tours' && item.itemType !== 'tour') return false;
          if (selectedCategory === 'Fleet' && item.itemType !== 'fleet') return false;
          if (selectedCategory === 'Packages' && item.itemType !== 'multiday') return false;
          if (selectedCategory === 'Services' && item.itemType !== 'service') return false;
          if (
            ['Desert Safari', 'City Tour', 'Airport Transit', 'Private Luxury'].includes(selectedCategory) &&
            item.category !== selectedCategory
          ) {
            return false;
          }
        }

        // Price Filter
        if (item.priceQAR !== undefined) {
          if (priceFilter === 'under200' && item.priceQAR >= 200) return false;
          if (priceFilter === '200to500' && (item.priceQAR < 200 || item.priceQAR > 500)) return false;
          if (priceFilter === 'above500' && item.priceQAR <= 500) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceLow') return (a.priceQAR || 0) - (b.priceQAR || 0);
        if (sortBy === 'priceHigh') return (b.priceQAR || 0) - (a.priceQAR || 0);
        return 0;
      });
  }, [allItems, searchTerm, selectedCategory, priceFilter, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05161D] text-slate-900 dark:text-slate-100 font-sans pb-20 pt-24 sm:pt-28 md:pt-32">
      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 space-y-5 sm:space-y-6">
        {/* Compact Catalog Header Bar (Mobile & Tablet Optimized) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-slate-200 dark:border-[#C0AB6F]/20">
          <div className="space-y-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C0AB6F]">
              <button
                onClick={onBackToHome}
                className="hover:underline text-slate-500 dark:text-slate-400 hover:text-[#E7CF8A] flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{t.common.home}</span>
              </button>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-[#D4AF37]">{t.exploreCatalog}</span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.exploreCatalog}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#C0AB6F]/15 border border-[#C0AB6F]/40 text-[#D4AF37]">
                {filteredResults.length} {t.searchPage.resultsFound}
              </span>
            </div>
          </div>

          {/* Integrated Search Input Bar */}
          <div className="relative w-full lg:w-96">
            <Search className="w-4 h-4 text-[#C0AB6F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none transition shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills (Horizontally Swipeable on Mobile & Tablet) */}
        <div className="space-y-3">
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x">
              {[
                { label: 'All Experiences', val: 'All' },
                { label: '🏜️ Desert Safaris', val: 'Desert Safari' },
                { label: '🏙️ City & Dhow Tours', val: 'City Tour' },
                { label: '✈️ Airport Transit Tours', val: 'Airport Transit' },
                { label: '🚗 Transfer Fleet', val: 'Fleet' },
                { label: '🏨 Holiday Packages', val: 'Packages' },
                { label: '🛡️ Core Services', val: 'Services' },
              ].map((cat) => (
                <button
                  key={cat.val}
                  onClick={() => setSelectedCategory(cat.val)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                    selectedCategory === cat.val
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] shadow-md font-black'
                      : 'bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 text-slate-600 dark:text-slate-300 hover:border-[#D4AF37]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Controls Bar: Price Filter & Sort Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 pt-1 pb-3 border-b border-slate-200 dark:border-[#C0AB6F]/20 text-xs">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Showing {filteredResults.length} curated options</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Price Filter Dropdown */}
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value as any)}
                  className="w-full sm:w-auto bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none font-medium cursor-pointer"
                >
                  <option value="all">Any Price</option>
                  <option value="under200">Under QAR 200</option>
                  <option value="200to500">QAR 200 - 500</option>
                  <option value="above500">QAR 500+</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                <span className="text-slate-400 text-[11px] hidden xs:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 font-semibold outline-none cursor-pointer"
                >
                  <option value="popular">Recommended</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid (Fully Responsive across Mobile, Tablet, and Desktop) */}
        {filteredResults.length === 0 ? (
          <div className="py-16 sm:py-20 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-[#0D3A48] text-[#E7CF8A] flex items-center justify-center shadow-lg">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              No matching experiences found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search keyword or clearing the active category filters to see more results.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setPriceFilter('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0D3A48] border border-[#C0AB6F]/40 text-[#E7CF8A] text-xs font-bold hover:bg-[#14495A] transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className="group bg-white dark:bg-[#09232C] rounded-3xl overflow-hidden border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md hover:shadow-xl hover:border-[#D4AF37] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Image banner (if available) */}
                  {item.image ? (
                    <div className="relative aspect-[16/10] bg-slate-800 overflow-hidden">
                      <img
                        src={imgSrc(item.image)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05161D] via-transparent to-transparent" />
                      {item.badge && (
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/40 shadow-sm">
                          {item.badge}
                        </span>
                      )}
                      {item.rating && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#05161D]/80 text-[#D4AF37] text-xs font-bold flex items-center gap-1 border border-[#C0AB6F]/30 shadow-sm">
                          <Star className="w-3 h-3 fill-[#D4AF37]" />
                          <span>{item.rating}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Service header placeholder */
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-[#05161D] to-[#0D3A48] border-b border-[#C0AB6F]/20 flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-[#C0AB6F]/20 text-[#E7CF8A]">
                        <Plane className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#05161D] text-[#E7CF8A] border border-[#C0AB6F]/30">
                        {item.category}
                      </span>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 space-y-2.5 sm:space-y-3">
                    <div className="text-[11px] font-mono text-[#C0AB6F] font-semibold flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#D4AF37]" />
                      <span>{item.durationOrCapacity}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#C0AB6F] transition line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Features list */}
                    <div className="pt-2 space-y-1 border-t border-slate-100 dark:border-white/10">
                      {item.features.slice(0, 3).map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price & CTA Bar */}
                <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-white/10 mt-3 flex items-center justify-between gap-2">
                  {item.priceQAR !== undefined ? (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#C0AB6F] tracking-wider block">
                        Starting From
                      </span>
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {formatPrice(item.priceQAR)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-[#C0AB6F] tracking-wider block">
                        Official Service
                      </span>
                      <span className="text-xs font-bold text-emerald-400">Custom Quote</span>
                    </div>
                  )}

                  <button
                    onClick={() => onSelectBooking(item.id || item.title)}
                    className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20 active:scale-95 transition cursor-pointer shrink-0"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
