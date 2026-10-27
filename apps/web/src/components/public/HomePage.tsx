'use client';

// =====================================================================
// Public home page CONTENT (client island).
//
// Extracted from the old monolithic HomepageView: this renders only the
// landing-page hero + sections. The fixed header, footer and slide-over
// drawers now live in the (public) layout / PublicShell, and navigation
// uses the Next router + PublicUIProvider instead of window.history.
// Catalogue data (packages / fleet) comes from AppContext, which the SSR
// layout seeds with server-fetched live data — so this renders real
// content on the server.
// =====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Users,
  Compass,
  ArrowRight,
  Check,
  Shield,
  Plane,
  Building2,
  FileCheck2,
  ShieldCheck,
  Calendar as CalendarIcon,
  MessageSquare,
  Search,
  Sun,
  Moon,
  Sparkles,
  Award,
  CheckCircle2,
  LogIn,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PublicPageSlug } from '../common/WebsiteHeader';
import { useWebsiteLanguage } from '../../context/WebsiteLanguageContext';
import { useWebsiteCurrency } from '../../context/WebsiteCurrencyContext';
import { useApp } from '../../context/AppContext';
import { imgSrc } from '../../../lib/uploads';
import { usePublicUI } from './PublicUIProvider';
import { useReviews } from '../../hooks/useReviews';
import { useSiteContent } from '../../context/SiteContentContext';
import type { HeroSlideText } from '../../data/siteContent';
import {
  findExperienceItem,
  getSyncedWebsiteTours,
  getSyncedHolidayPackages,
  getSyncedFleet,
} from '../../data/websiteData';
import { mercedesVClass } from '../../assets/cars';

// Hero slide TEXT structure (count + i18n defaults). The background images are
// dashboard-driven (CMS keys home.hero.slideN.image), read at render below.
const HERO_SLIDES = [
  {
    id: 1,
    title: 'Experience Qatar’s Wonders With',
    titleAr: 'اكتشف روائع ومعالم قطر الساحرة مع',
    highlight: 'AR Trust Travel & Tourism',
    highlightAr: 'الرائد للثقة للسياحة والسفر',
    caption: 'Official Destination Management Company: Desert safaris, inland sea dune thrills, traditional dhow cruises, VIP airport transit, and luxury hotel holidays.',
    captionAr: 'الشركة الرسمية الرائدة لإدارة الوجهات السياحية في قطر: رحلات السفاري الصحراوية، الكثبان الرملية في خور العديد، الرحلات البحرية، واستقبال المطار الفاخر.',
    tag: 'Explore Qatar • All-in-One Destination Services',
    tagAr: 'اكتشف قطر • خدمات إدارة وجهات متكاملة',
  },
  {
    id: 2,
    title: 'Thrilling Inland Sea Dune Safaris',
    titleAr: 'مغامرات السفاري الصحراوية والكثبان الرملية',
    highlight: 'With 4x4 Land Cruiser Expeditions',
    highlightAr: 'مع رحلات لاند كروزر 4x4',
    caption: 'Heart-pounding dune bashing across sweeping desert sands to the UNESCO Inland Sea (Khor Al Adaid) with traditional Bedouin hospitality.',
    captionAr: 'إثارة ركوب الكثبان الرملية في صحراء قطر الخلابة وصولاً إلى خور العديد مع تجربة الضيافة البدوية الأصيلة.',
    tag: 'Desert Safaris & Inland Sea',
    tagAr: 'سفاري الصحراء والبحر الداخلي',
  },
  {
    id: 3,
    title: 'Premier Airport Transit & Fleet',
    titleAr: 'خدمات استقبال المطار والأسطول الفاخر',
    highlight: 'With VIP Driver & Transfers',
    highlightAr: 'مع خدمة السائق الخاص الفاخر',
    caption: 'Luxury Mercedes-Benz V-Class, Land Cruisers & seamless Hamad International Airport layover tours with guaranteed punctual return.',
    captionAr: 'سيارات مرسيدس V-Class ولاند كروزر فاخرة لجولات ترانزيت سلسة ومضمونة لمسافري مطار حمد الدولي.',
    tag: 'Hamad Airport & Luxury Fleet',
    tagAr: 'مطار حمد والأسطول الفاخر',
  },
  {
    id: 4,
    title: 'Authentic Arabian Dhow Cruises',
    titleAr: 'رحلات المراكب الشراعية التقليدية',
    highlight: '& Doha Heritage Excursions',
    highlightAr: 'وجولات التراث في الدوحة',
    caption: 'Traditional wooden Dhow cruises across Doha Bay, Katara Cultural Village strolls, and vibrant Souq Waqif spice market treasures.',
    captionAr: 'رحلات بحرية تقليدية على متن قوارب الداو في خليج الدوحة، وزيارات لقرية كتارا الثقافية وأزقة سوق واقف التاريخية.',
    tag: 'Dhow Cruise & Cultural Heritage',
    tagAr: 'رحلات الداو والتراث الثقافي',
  },
];

export default function HomePage() {
  const { packages, fleetVehicles } = useApp();
  const reviews = useReviews();
  const { c } = useSiteContent();
  // Service cards are editable from the dashboard (home.services); empty when unseeded.
  const services = c<Array<{ id: string; title: string; titleAr?: string; icon: string; description: string; benefits: string[] }>>('home.services', []);
  const { t: tWeb, websiteLang } = useWebsiteLanguage();
  const { formatPrice, selectedCurrency } = useWebsiteCurrency();
  const router = useRouter();
  const { openBookingDrawer } = usePublicUI();

  // Search input state on the Hero section
  const [heroSearchQuery, setHeroSearchQuery] = useState<string>('');

  // Tour category filter for tour cards
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Fleet category filter for fleet cards
  const [selectedFleetCategory, setSelectedFleetCategory] = useState<string>('All');

  // Hero background image slider state & auto-play
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  // Hero text is editable from the dashboard Website Content editor
  // (home.hero.slides); falls back to the translation bundle when unset.
  const heroCms = c<HeroSlideText[]>('home.hero.slides', []);
  // Hero background images are dashboard-editable (CMS image keys). Resolved to
  // loadable URLs; empty when the DB is unseeded (no static demo fallback).
  const heroImages = [1, 2, 3, 4].map((n) => imgSrc(c<string>(`home.hero.slide${n}.image`, '')));
  const baseSlideTrans = tWeb.slides[currentSlide] || tWeb.slides[0];
  const cmsSlide = heroCms[currentSlide];
  // The editable CMS hero text is English; other website languages keep the
  // translated bundle so localisation isn't lost.
  const currentSlideTrans =
    cmsSlide && websiteLang === 'en'
      ? {
          ...baseSlideTrans,
          tag: cmsSlide.tag,
          title: cmsSlide.title,
          highlight: cmsSlide.highlight,
          caption: cmsSlide.caption,
        }
      : baseSlideTrans;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Navigate to another public route via the Next router.
  const handleNavigate = (slug: PublicPageSlug) => {
    router.push(slug === 'home' ? '/' : `/${slug}`);
  };

  const gotoSearch = (q?: string) => {
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  // Dynamic synchronized tours and holiday packages from dashboard
  const dynamicTours = useMemo(() => getSyncedWebsiteTours(packages), [packages]);
  const dynamicHolidayPackages = useMemo(() => getSyncedHolidayPackages(packages), [packages]);
  const dynamicFleet = useMemo(() => getSyncedFleet(fleetVehicles), [fleetVehicles]);

  // Filtered tours for homepage showcase
  const filteredTours = selectedCategory === 'All'
    ? dynamicTours
    : dynamicTours.filter((t) => t.category === selectedCategory);

  // Filtered fleet for homepage showcase
  const filteredFleet = useMemo(() => {
    if (selectedFleetCategory === 'All') return dynamicFleet;
    if (selectedFleetCategory === 'Coaster & Coach') {
      return dynamicFleet.filter((v) => v.category === 'Coaster Bus' || v.category === 'Luxury Coach');
    }
    return dynamicFleet.filter((v) => v.category === selectedFleetCategory);
  }, [selectedFleetCategory, dynamicFleet]);

  const handleOpenDrawer = (tourTitleOrId?: string) => {
    const item = findExperienceItem(tourTitleOrId, packages, fleetVehicles);
    const resolved = item ? item.id : dynamicTours[1]?.id || dynamicTours[0]?.id || 'tour-2';
    openBookingDrawer(resolved);
  };

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    gotoSearch(heroSearchQuery);
  };

  const handleTagClick = (tagQuery: string) => {
    setHeroSearchQuery(tagQuery);
    gotoSearch(tagQuery);
  };

  return (
    <div className="bg-slate-50 dark:bg-[#05161D] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#C0AB6F] selection:text-[#05161D] transition-colors relative">
      {/* ─── HERO CONTAINER WITH MULTI-IMAGE SLIDER & TRANSPARENT GLASS HEADER (FULL SCREEN) ─── */}
      <div className="relative min-h-screen lg:h-screen flex flex-col justify-between overflow-hidden bg-[#05161D] text-white">
        {/* ─── HERO BACKGROUND IMAGE SLIDER (Spans from very top behind Header) ─── */}
        <div className="absolute inset-0 z-0">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
                currentSlide === idx
                  ? 'opacity-65 scale-100'
                  : 'opacity-0 scale-105 pointer-events-none'
              }`}
              style={{ backgroundImage: heroImages[idx] ? `url('${heroImages[idx]}')` : undefined }}
            />
          ))}
          {/* Dark subtle vignette over slide so text and header are crisp and readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#05161D]/75 via-[#05161D]/40 to-[#05161D]" />
        </div>

        {/* ─── HERO CENTER CONTENT (EXPANDED WIDTH FOR 2 BALANCED LINES) ─── */}
        <section className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 text-center space-y-4 sm:space-y-5 flex-1 flex flex-col justify-center pt-28 sm:pt-32">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D3A48]/70 backdrop-blur-md border border-[#C0AB6F]/30 text-xs font-semibold text-[#E7CF8A] mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{currentSlideTrans.tag} • {tWeb.officialDmcBadge}</span>
          </div>

          {/* Headline (Balanced 2-Line Structure with Expanded Width) */}
          <div className="min-h-[4.5rem] sm:min-h-[6.5rem] lg:min-h-[8rem] flex items-center justify-center w-full">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-6xl w-full mx-auto transition-all">
              <span className="block">{currentSlideTrans.title}</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#E7CF8A] via-[#D4AF37] to-[#C0AB6F]">
                {currentSlideTrans.highlight}
              </span>
            </h1>
          </div>

          {/* Subheading */}
          <div className="min-h-[2.5rem] sm:min-h-[3.5rem] flex items-center justify-center">
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {currentSlideTrans.caption}
            </p>
          </div>

          {/* ─── HERO LUXURY SEARCH BAR (Not a bulky form) ─── */}
          <div className="max-w-3xl mx-auto pt-2 w-full">
            <form
              onSubmit={handleHeroSearchSubmit}
              className="p-2 sm:p-2.5 rounded-2xl bg-[#09232C]/85 backdrop-blur-2xl border border-[#C0AB6F]/40 shadow-2xl flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 text-[#C0AB6F] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={heroSearchQuery}
                  onChange={(e) => setHeroSearchQuery(e.target.value)}
                  placeholder={tWeb.searchPlaceholder}
                  className="w-full bg-transparent pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C0AB6F] to-[#A79257] hover:brightness-110 text-[#05161D] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/25 transition active:scale-95 cursor-pointer shrink-0"
              >
                <span>{tWeb.searchBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Search Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] text-slate-300 font-medium">
              <span className="text-slate-400">{tWeb.popularLabel}</span>
              {[
                { tag: tWeb.tagDesertSafari, query: 'Desert Safari' },
                { tag: tWeb.tagDhowCruise, query: 'Dhow' },
                { tag: tWeb.tagMercedesVClass, query: 'Mercedes' },
                { tag: tWeb.tagAirportTransit, query: 'Transit' },
                { tag: tWeb.tagFiveStarHotels, query: 'Hotel' },
              ].map((t) => (
                <button
                  key={t.query}
                  type="button"
                  onClick={() => handleTagClick(t.query)}
                  className="px-2.5 py-1 rounded-lg bg-[#0D3A48]/70 hover:bg-[#0D3A48] border border-[#C0AB6F]/30 text-[#E7CF8A] hover:text-white transition cursor-pointer"
                >
                  {t.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Slider Navigation Controls (Prev/Next buttons & Dots) */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
              className="p-2 rounded-full bg-[#05161D]/60 hover:bg-[#0D3A48] border border-[#C0AB6F]/30 text-slate-300 hover:text-white transition cursor-pointer"
              title="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentSlide === idx
                      ? 'w-7 h-2 bg-[#D4AF37]'
                      : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              className="p-2 rounded-full bg-[#05161D]/60 hover:bg-[#0D3A48] border border-[#C0AB6F]/30 text-slate-300 hover:text-white transition cursor-pointer"
              title="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trust Highlights - Desktop */}
          <div className="hidden md:flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
              <span>{tWeb.homeSections.trustReviews}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C0AB6F]" />
              <span>{tWeb.homeSections.trustLicense}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#C0AB6F]" />
              <span>{tWeb.homeSections.trustPunctual}</span>
            </span>
          </div>

          {/* Trust Highlights - Mobile Infinite Auto-Scrolling Marquee */}
          <div className="md:hidden w-full overflow-hidden pt-2 relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="animate-marquee flex items-center gap-5 text-[11px] text-slate-300 font-medium whitespace-nowrap">
              {/* Group 1 */}
              <div className="flex items-center gap-4 shrink-0">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#05161D]/80 border border-[#C0AB6F]/30 backdrop-blur-md text-[#E7CF8A]">
                  <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37] shrink-0" />
                  <span>{tWeb.homeSections.trustReviews}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#05161D]/80 border border-[#C0AB6F]/30 backdrop-blur-md text-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                  <span>{tWeb.homeSections.trustLicense}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#05161D]/80 border border-[#C0AB6F]/30 backdrop-blur-md text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                  <span>{tWeb.homeSections.trustPunctual}</span>
                </span>
              </div>
              {/* Group 2 (Duplicate for seamless infinite marquee loop) */}
              <div className="flex items-center gap-4 shrink-0" aria-hidden="true">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#05161D]/80 border border-[#C0AB6F]/30 backdrop-blur-md text-[#E7CF8A]">
                  <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37] shrink-0" />
                  <span>{tWeb.homeSections.trustReviews}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#05161D]/80 border border-[#C0AB6F]/30 backdrop-blur-md text-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                  <span>{tWeb.homeSections.trustLicense}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#05161D]/80 border border-[#C0AB6F]/30 backdrop-blur-md text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                  <span>{tWeb.homeSections.trustPunctual}</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ─── POPULAR TOUR PACKAGES SECTION (EXPANDED LUXURY WIDTH) ─── */}
      <section id="tours" className="py-20 px-4 sm:px-8 lg:px-12 max-w-[1560px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C0AB6F] uppercase tracking-widest mb-2">
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              <span>{tWeb.common.licensedDmc}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {tWeb.homeSections.toursTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
              {tWeb.homeSections.toursSubtitle}
            </p>
          </div>

          {/* Category Tabs & View All Page Button (Horizontally swipeable/scrollable on mobile) */}
          <div className="w-full md:w-auto overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x">
              {[
                { id: 'All', label: tWeb.common.all },
                { id: 'Desert Safari', label: tWeb.toursPage.catDesert },
                { id: 'City Tour', label: tWeb.toursPage.catCity },
                { id: 'Airport Transit', label: tWeb.toursPage.catTransit },
                { id: 'Private Luxury', label: tWeb.toursPage.catPrivate },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-[#0D3A48] dark:bg-[#C0AB6F] text-white dark:text-[#05161D] shadow-md font-black'
                      : 'bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 text-slate-600 dark:text-slate-300 hover:border-[#D4AF37]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              <button
                onClick={() => handleNavigate('tours')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] font-black text-xs hover:brightness-110 flex items-center gap-1.5 transition shadow-sm cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
              >
                <span>{tWeb.homeSections.toursViewAll}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tour Grid (Homepage displays 6 packages, 3 per row) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.slice(0, 6).map((tour) => (
            <div
              key={tour.id}
              className="group bg-white dark:bg-[#09232C] rounded-3xl overflow-hidden border border-slate-200 dark:border-[#C0AB6F]/30 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col hover:border-[#D4AF37]"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
                <img
                  src={imgSrc(tour.image)}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05161D] via-transparent to-transparent" />

                {/* Badge */}
                {tour.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/50 shadow-md">
                    {tour.badge}
                  </span>
                )}

                {/* Rating */}
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#05161D]/80 backdrop-blur-md text-[#D4AF37] text-xs font-bold flex items-center gap-1 border border-[#C0AB6F]/30">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
                  <span>{tour.rating}</span>
                  <span className="text-slate-400 font-normal">({tour.reviewCount})</span>
                </div>

                {/* Duration & Category bar */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#E7CF8A]" />
                    <span>{tour.duration}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#E7CF8A]" />
                    <span>{tour.groupSize}</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#C0AB6F] transition-colors leading-snug">
                    {tour.title}
                  </h3>
                  {tour.titleAr && (
                    <p className="text-xs text-[#C0AB6F] font-arabic mt-1 text-left">
                      {tour.titleAr}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {tour.description}
                  </p>

                  {/* Highlights */}
                  <div className="mt-3.5 space-y-1.5 border-t border-slate-100 dark:border-white/10 pt-3">
                    {tour.includes.slice(0, 3).map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                        <span className="truncate">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price and CTA (Triggers Right Slide Drawer) */}
                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#C0AB6F] tracking-wider block">
                      {tWeb.common.startingFrom}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {formatPrice(tour.priceQAR)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">/ {tWeb.common.perPerson}</span>
                    </div>
                    {selectedCurrency.code !== 'QAR' && (
                      <span className="text-[9px] text-slate-400 font-mono block">
                        ≈ QAR {tour.priceQAR}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenDrawer(tour.id)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-[#D4AF37]/20"
                  >
                    <span>{tWeb.common.bookNow}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── AIRPORT TRANSFERS & FLEET SHOWCASE ─── */}
      <section id="fleet" className="py-20 bg-slate-100/70 dark:bg-[#09232C]/60 border-y border-slate-200 dark:border-[#C0AB6F]/25">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 text-xs font-bold uppercase tracking-widest mb-3">
              <Plane className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{tWeb.fleetPage.heroTitle}</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {tWeb.homeSections.fleetTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {tWeb.homeSections.fleetSubtitle}
            </p>
            <div className="pt-3">
              <button
                onClick={() => handleNavigate('fleet')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white dark:bg-[#05161D] border border-slate-200 dark:border-[#C0AB6F]/40 hover:border-[#D4AF37] text-xs font-bold text-[#E7CF8A] transition cursor-pointer"
              >
                <span>{tWeb.homeSections.fleetViewAll}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
              </button>
            </div>
          </div>

          {/* Fleet Category Filter Tabs (Swipeable on mobile) */}
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x">
            {[
              { id: 'All', label: `${tWeb.common.all} (${dynamicFleet.length})` },
              { id: 'VIP Luxury', label: 'VIP Luxury' },
              { id: 'Safari 4x4', label: 'Safari 4x4' },
              { id: 'Executive Sedan', label: 'Executive Sedans' },
              { id: 'Group Van', label: 'Group Vans' },
              { id: 'Family MPV', label: 'Family MPV' },
              { id: 'Coaster & Coach', label: 'Buses & Coaches' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFleetCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer active:scale-95 ${
                  selectedFleetCategory === tab.id
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] shadow-md shadow-[#D4AF37]/25 scale-105'
                    : 'bg-white dark:bg-[#05161D]/80 text-slate-600 dark:text-slate-300 hover:border-[#C0AB6F]/50 border border-slate-200 dark:border-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Fleet Grid (Homepage displays top 6 vehicles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFleet.slice(0, 6).map((vehicle) => (
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
                      {vehicle.passengers} {tWeb.common.passengers} · {vehicle.luggage} {tWeb.common.luggage}
                    </span>
                  </div>

                  {/* Vehicle Image Showroom Stage */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-5 border border-slate-200/60 dark:border-white/10 shadow-md bg-slate-900">
                    <img
                      src={imgSrc(vehicle.image)}
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
                      {tWeb.common.startingFrom}
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
                    onClick={() => handleOpenDrawer(vehicle.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-bold text-xs shadow-md shadow-[#D4AF37]/20 active:scale-95 transition cursor-pointer"
                  >
                    {tWeb.fleetPage.bookTransfer}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MULTI-DAY HOLIDAY PACKAGES ─── */}
      <section id="packages" className="py-20 px-4 sm:px-8 lg:px-12 max-w-[1560px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{tWeb.packagesPage.allInclusiveBadge}</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {tWeb.homeSections.packagesTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {tWeb.homeSections.packagesSubtitle}
          </p>
          <div className="pt-3">
            <button
              onClick={() => handleNavigate('packages')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/40 hover:border-[#D4AF37] text-xs font-bold text-[#E7CF8A] transition cursor-pointer"
            >
              <span>{tWeb.homeSections.packagesViewAll}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {dynamicHolidayPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white dark:bg-[#09232C] rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between hover:border-[#D4AF37]"
            >
              <div>
                {/* Header Graphic */}
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-800">
                  <img
                    src={imgSrc(pkg.image)}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05161D] via-[#05161D]/40 to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D4AF37] text-[#05161D] shadow-md">
                    {pkg.badge}
                  </span>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white font-bold text-xs">
                    <span>{pkg.days} {tWeb.common.days} / {pkg.nights} {tWeb.common.nights}</span>
                    <span className="text-lg font-black text-[#E7CF8A]">{formatPrice(pkg.priceQAR)}</span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {pkg.tagline}
                  </p>

                  {/* Daily Highlights */}
                  <div className="space-y-2 bg-[#0D3A48]/40 p-3.5 rounded-2xl border border-[#C0AB6F]/25">
                    <span className="text-[11px] font-bold text-[#E7CF8A] uppercase tracking-wider block">
                      Itinerary Highlights:
                    </span>
                    {pkg.highlights.map((h, i) => (
                      <p key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                        <span className="text-[#D4AF37] font-bold">•</span>
                        <span>{h}</span>
                      </p>
                    ))}
                  </div>

                  {/* Included list */}
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Included in Package:
                    </span>
                    {pkg.included.map((inc, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => handleOpenDrawer(pkg.title)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  {tWeb.packagesPage.reservePackage}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CORE SERVICES MATRIX ─── */}
      <section id="services" className="py-20 bg-[#05161D] text-white border-y border-[#C0AB6F]/25">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/30 text-xs font-bold uppercase tracking-widest mb-3">
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{tWeb.servicesPage.officialDmcGuarantee}</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {tWeb.homeSections.servicesTitle}
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              {tWeb.homeSections.servicesSubtitle}
            </p>
            <div className="pt-3">
              <button
                onClick={() => handleNavigate('services')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#09232C] border border-[#C0AB6F]/40 hover:border-[#D4AF37] text-xs font-bold text-[#E7CF8A] transition cursor-pointer"
              >
                <span>{tWeb.homeSections.servicesViewAll}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((srv) => (
              <div
                key={srv.id}
                className="bg-[#09232C] border border-[#C0AB6F]/30 rounded-3xl p-6 hover:border-[#D4AF37] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/40 flex items-center justify-center mb-5">
                    {srv.icon === 'Plane' && <Plane className="w-6 h-6 text-[#D4AF37]" />}
                    {srv.icon === 'Building2' && <Building2 className="w-6 h-6 text-[#D4AF37]" />}
                    {srv.icon === 'FileCheck2' && <FileCheck2 className="w-6 h-6 text-[#D4AF37]" />}
                    {srv.icon === 'ShieldCheck' && <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{srv.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {srv.description}
                  </p>

                  <div className="space-y-1.5 border-t border-white/10 pt-3">
                    {srv.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleOpenDrawer(`Service: ${srv.title}`)}
                    className="w-full py-2.5 rounded-xl border border-[#C0AB6F]/40 hover:bg-[#C0AB6F]/10 text-[#E7CF8A] text-xs font-semibold transition cursor-pointer"
                  >
                    {tWeb.servicesPage.getQuote}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE AR TRUST TRAVEL ─── */}
      <section id="why-us" className="py-20 px-4 sm:px-8 lg:px-12 max-w-[1560px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 text-xs font-bold uppercase tracking-widest">
              <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{tWeb.whyUsPage.bookWithConfidence}</span>
            </span>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {tWeb.homeSections.whyUsTitle}
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {tWeb.homeSections.whyUsSubtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { title: 'Qatar Tourism Licensed', desc: 'Accreditation #QTA-QA-8819 under Qatar Central Bank (QCB) compliance standards.' },
                { title: 'Guaranteed Airport Return', desc: 'Never miss a connection — our transit tours prioritize guaranteed on-time return.' },
                { title: 'Private Vetted Fleet', desc: 'Mercedes-Benz, Land Cruisers, and luxury coaches maintained to immaculate standards.' },
                { title: '24/7 Dedicated Concierge', desc: 'Instant support on WhatsApp, phone, and airport desk assistance in English & Arabic.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 shadow-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-[#C0AB6F]" />
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Showcase Box */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#C0AB6F]/40 aspect-[4/3]">
              {imgSrc(c<string>('home.whyus.image', '')) && (
                <img
                  src={imgSrc(c<string>('home.whyus.image', ''))}
                  alt="Qatar Desert Safari Adventure"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#05161D]/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#09232C]/90 backdrop-blur-md border border-[#C0AB6F]/40 text-white flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#E7CF8A] font-bold uppercase tracking-wider">
                    {tWeb.whyUsPage.bookWithConfidence}
                  </div>
                  <div className="text-sm font-black text-white">
                    {tWeb.whyUsPage.heroTitle}
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] font-mono text-xs font-black">
                  Doha, Qatar
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CUSTOMER REVIEWS / TESTIMONIALS ─── */}
      <section id="reviews" className="py-20 bg-slate-100/70 dark:bg-[#09232C]/60 border-t border-slate-200 dark:border-[#C0AB6F]/25">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 text-xs font-bold uppercase tracking-widest mb-3">
              <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
              <span>{tWeb.reviewsPage.ratingSubtitle}</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {tWeb.homeSections.reviewsTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {tWeb.homeSections.reviewsSubtitle}
            </p>
            <div className="pt-3">
              <button
                onClick={() => handleNavigate('reviews')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white dark:bg-[#05161D] border border-slate-200 dark:border-[#C0AB6F]/40 hover:border-[#D4AF37] text-xs font-bold text-[#E7CF8A] transition cursor-pointer"
              >
                <span>{tWeb.reviewsPage.heroTitle} (/reviews)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
              </button>
            </div>
          </div>

          {/* Desktop Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white dark:bg-[#05161D] p-6 rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Star row */}
                  <div className="flex items-center gap-1 mb-3 text-[#D4AF37]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center gap-3">
                  <img
                    src={imgSrc(rev.avatar)}
                    alt={rev.author}
                    className="w-10 h-10 rounded-full object-cover border border-[#C0AB6F]/40"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {rev.author}
                    </h4>
                    <span className="text-[11px] text-slate-400 block">{rev.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Auto-Scrolling Review Cards Track (Continuous marquee, pauses on touch/hover) */}
          <div className="md:hidden w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] py-2">
            <div className="animate-marquee-slow flex items-stretch gap-4">
              {/* Group 1 of cards */}
              {reviews.map((rev) => (
                <div
                  key={`mobile-1-${rev.id}`}
                  className="w-[285px] shrink-0 bg-white dark:bg-[#05161D] p-5 rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-2.5 text-[#D4AF37]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4 line-clamp-4">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center gap-2.5">
                    <img
                      src={imgSrc(rev.avatar)}
                      alt={rev.author}
                      className="w-9 h-9 rounded-full object-cover border border-[#C0AB6F]/40 shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {rev.author}
                      </h4>
                      <span className="text-[10px] text-slate-400 block truncate">{rev.country}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Group 2 of cards (Duplicate for seamless infinite marquee loop) */}
              {reviews.map((rev) => (
                <div
                  key={`mobile-2-${rev.id}`}
                  aria-hidden="true"
                  className="w-[285px] shrink-0 bg-white dark:bg-[#05161D] p-5 rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 mb-2.5 text-[#D4AF37]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4 line-clamp-4">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center gap-2.5">
                    <img
                      src={imgSrc(rev.avatar)}
                      alt={rev.author}
                      className="w-9 h-9 rounded-full object-cover border border-[#C0AB6F]/40 shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {rev.author}
                      </h4>
                      <span className="text-[10px] text-slate-400 block truncate">{rev.country}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
