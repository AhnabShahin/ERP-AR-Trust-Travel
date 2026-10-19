import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Plane,
  Building2,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Compass,
  Phone,
  Sparkles,
  Shield,
  Award,
  MessageSquare,
} from 'lucide-react';
import { useWebsiteLanguage } from '../../../context/WebsiteLanguageContext';
import { SERVICES_CATALOG, getServiceBySlug, ServiceItem } from '../../../data/servicesData';
import { SingleServicePageView } from './SingleServicePageView';
import exploreQatarHeroImage from '../../../assets/explore-qatar-hero.jpg';
import { useWebsiteCurrency } from '../../../context/WebsiteCurrencyContext';

interface ServicesPageViewProps {
  onSelectBooking: (serviceTitleOrId: string) => void;
  onNavigateHome: () => void;
  /** Active service slug from the /services/[slug] route (null = catalog). */
  initialSlug?: string | null;
}

export const ServicesPageView: React.FC<ServicesPageViewProps> = ({
  onSelectBooking,
  onNavigateHome,
  initialSlug = null,
}) => {
  const { t } = useWebsiteLanguage();
  const { formatPrice, selectedCurrency } = useWebsiteCurrency();
  const router = useRouter();

  // The active service is driven entirely by the route: /services (catalog)
  // vs /services/:slug (detail). Selecting a service navigates to its route,
  // so the detail page is server-rendered too.
  const selectedServiceSlug = initialSlug ? initialSlug.toLowerCase().trim() : null;

  const handleSelectService = (slug: string | null) => {
    router.push(slug ? `/services/${slug}` : '/services');
  };

  // Check if a service is currently selected
  const activeService = selectedServiceSlug ? getServiceBySlug(selectedServiceSlug) : undefined;

  // Icon mapping helper
  const renderIcon = (name: ServiceItem['iconName'], className: string = 'w-6 h-6') => {
    switch (name) {
      case 'Plane':
        return <Plane className={className} />;
      case 'Building2':
        return <Building2 className={className} />;
      case 'FileCheck2':
        return <FileCheck2 className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // If a single service is selected, render the dedicated Single Service Page!
  if (activeService) {
    return (
      <SingleServicePageView
        service={activeService}
        onBackToServices={() => handleSelectService(null)}
        onNavigateHome={onNavigateHome}
        onSelectOtherService={(s) => handleSelectService(s.slug)}
      />
    );
  }

  // Otherwise, render the Main Services Catalog Overview
  return (
    <div className="space-y-16 pb-20">
      {/* ─── PAGE HERO BANNER ─── */}
      <section className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden bg-[#05161D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url(${exploreQatarHeroImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05161D]/80 via-[#05161D]/60 to-[#05161D]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
          {/* Breadcrumb */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D3A48]/80 border border-[#C0AB6F]/30 text-xs font-semibold text-[#E7CF8A]">
            <button onClick={onNavigateHome} className="hover:underline cursor-pointer">
              {t.common.home}
            </button>
            <span>/</span>
            <span className="text-white">{t.navServices}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {t.servicesPage.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            {t.servicesPage.heroSubtitle}
          </p>

          <div className="text-xs text-[#E7CF8A] font-mono">
            {t.common.licensedDmc}
          </div>
        </div>
      </section>

      {/* ─── SERVICES GRID (6 CARDS WITH DIRECT SINGLE PAGE ACCESS) ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Dedicated Service Divisions</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Comprehensive Destination Travel Services in Qatar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Click on any service to view full specifications, inclusions, step-by-step process, and submit your inquiry directly to our 24/7 Operations Desk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES_CATALOG.map((srv) => (
            <div
              key={srv.id}
              className="bg-white dark:bg-[#05161D] rounded-3xl p-7 border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:border-[#D4AF37] group relative overflow-hidden"
            >
              <div>
                {/* Header Icon & Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/40 flex items-center justify-center group-hover:bg-[#C0AB6F] group-hover:text-[#05161D] transition-colors shadow-md">
                    {renderIcon(srv.iconName, 'w-6 h-6')}
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40">
                    {srv.badge}
                  </span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => handleSelectService(srv.slug)}
                  className="text-xl font-black text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  {srv.title}
                </h3>

                {srv.titleAr && (
                  <p className="text-xs text-[#C0AB6F] font-arabic mt-1 text-left">
                    {srv.titleAr}
                  </p>
                )}

                {/* Starting Price Guidance Tag */}
                <div className="mt-3 inline-flex items-baseline gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/20">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Rates from:</span>
                  <span className="text-sm font-black text-[#D4AF37]">{formatPrice(srv.startingPriceQAR)}</span>
                  <span className="text-[10px] text-slate-400">/{srv.rateType}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  {srv.shortDescription}
                </p>

                {/* Benefits Checkpoints */}
                <div className="mt-5 space-y-2 border-t border-slate-100 dark:border-white/10 pt-4">
                  {srv.highlights.slice(0, 4).map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C0AB6F] shrink-0" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button: View Single Page Details & Inquire Lead Form */}
              <div className="mt-7 pt-4 border-t border-slate-100 dark:border-white/10 space-y-2">
                <button
                  onClick={() => handleSelectService(srv.slug)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-[#D4AF37]/20 active:scale-95 transition cursor-pointer"
                >
                  <span>View Details & Submit Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>24/7 Dedicated Operations Desk</span>
                  <span className="text-[#C0AB6F] font-semibold">Inquiry & Quote Form</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── WHY BOOK SERVICES WITH US ─── */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-slate-100/80 dark:bg-[#09232C]/80 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-[#C0AB6F]/30 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>The AR Trust Guarantee</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Why Corporate Clients & Travelers Trust Our Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 dark:text-slate-300">
            <div className="bg-white dark:bg-[#05161D] p-6 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
              <div className="text-lg font-black text-slate-900 dark:text-white">Government & Tourism Licensed</div>
              <p>We are a fully licensed Destination Management Company under Qatar Tourism (#QTA-QA-8819), assuring complete security, commercial liability insurance, and regulatory compliance.</p>
            </div>
            <div className="bg-white dark:bg-[#05161D] p-6 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
              <div className="text-lg font-black text-slate-900 dark:text-white">24/7 Live Operations Desk</div>
              <p>Unlike international booking bots, our local operations center operates around the clock in Doha. Late night flight changes or emergency transit needs are handled in seconds.</p>
            </div>
            <div className="bg-white dark:bg-[#05161D] p-6 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
              <div className="text-lg font-black text-slate-900 dark:text-white">Transparent QAR Pricing</div>
              <p>All service quotes and ticket pricing are clear, upfront, and free of surprise conversion rates, hidden agency fees, or credit card surcharges.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
