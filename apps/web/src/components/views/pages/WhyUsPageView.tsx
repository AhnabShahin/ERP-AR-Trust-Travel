import React from 'react';
import {
  ShieldCheck,
  Award,
  Users,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  Sparkles,
  PhoneCall,
  MapPin,
  Car,
} from 'lucide-react';
import { BrandLogo } from '../../common/BrandLogo';
import { useWebsiteLanguage } from '../../../context/WebsiteLanguageContext';

interface WhyUsPageViewProps {
  onSelectBooking: () => void;
  onNavigateHome: () => void;
  onNavigateContact: () => void;
}

export const WhyUsPageView: React.FC<WhyUsPageViewProps> = ({
  onSelectBooking,
  onNavigateHome,
  onNavigateContact,
}) => {
  const { t } = useWebsiteLanguage();
  const pillars = [
    {
      title: 'Official Qatar Tourism DMC Licensing',
      desc: 'Accredited under License #QTA-QA-8819. We adhere strictly to Qatar Tourism safety protocols, certified equipment, and licensed drivers.',
      icon: ShieldCheck,
    },
    {
      title: '100% Transparent Upfront Pricing',
      desc: 'All prices are transparent in QAR without unexpected tourist markups, concealed bridge tolls, or booking processing fees.',
      icon: Award,
    },
    {
      title: 'Hamad Airport Flight Delay Tracking',
      desc: 'We track flight arrivals live. If your flight lands early or gets delayed by hours, your private driver will be waiting curbside at no penalty.',
      icon: Clock,
    },
    {
      title: 'Immaculately Sanitized Premium Fleet',
      desc: 'Every vehicle undergoes daily multi-point inspection, thorough ozone sanitization, dual-zone AC cooling, and is stocked with complimentary bottled water.',
      icon: Car,
    },
    {
      title: 'Multilingual Safari Captains & Guides',
      desc: 'Our team speaks English, Arabic, Hindi, Urdu, and Tagalog. Experienced desert veterans who know the Inland Sea dunes like the back of their hand.',
      icon: Users,
    },
    {
      title: '24/7 Live Concierge & WhatsApp Desk',
      desc: 'Real humans located right here in Doha answer inquiries 24/7 via WhatsApp and phone. Never get stuck with automated chatbots.',
      icon: PhoneCall,
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* ─── PAGE HERO BANNER ─── */}
      <section className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden bg-[#05161D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://artrusttravel.com/wp-content/uploads/2026/02/AR-Trust-Travel-Souq-Waqif-2-scaled.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05161D]/80 via-[#05161D]/60 to-[#05161D]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
          {/* Breadcrumb */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D3A48]/80 border border-[#C0AB6F]/30 text-xs font-semibold text-[#E7CF8A]">
            <button onClick={onNavigateHome} className="hover:underline">{t.common.home}</button>
            <span>/</span>
            <span className="text-white">{t.navWhyUs}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {t.whyUsPage.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            {t.whyUsPage.heroSubtitle}
          </p>

          <div className="text-xs text-[#E7CF8A] font-mono">
            {t.common.licensedDmc}
          </div>
        </div>
      </section>

      {/* ─── TRUST METRICS COUNTERS ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: '15,000+', label: 'Happy Guests Hosted', sub: 'Across 65+ countries' },
            { value: '99.8%', label: 'Punctual Pickup Rate', sub: 'Hamad Airport & Hotel' },
            { value: '4.9 ★', label: 'Verified Review Score', sub: '1,200+ 5-star ratings' },
            { value: '12+', label: 'Dedicated Fleet Vehicles', sub: 'Sedans, 4x4s, VIP Vans & Buses' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#05161D] rounded-3xl p-6 border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md text-center space-y-1 hover:border-[#D4AF37] transition"
            >
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F]">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{stat.label}</div>
              <div className="text-[11px] text-slate-400">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 6 CORE VALUE PILLARS ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Built On Integrity & Excellence</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Our 6 Core Commitments to Every Guest
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pil, idx) => {
            const Icon = pil.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#05161D] rounded-3xl p-8 border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md hover:shadow-2xl transition-all duration-300 space-y-4 hover:border-[#D4AF37] group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/40 flex items-center justify-center group-hover:bg-[#C0AB6F] group-hover:text-[#05161D] transition-colors shadow-lg">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors">
                  {pil.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pil.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── COMPANY STORY & HERITAGE ─── */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-slate-100/80 dark:bg-[#09232C]/80 rounded-3xl p-8 sm:p-14 border border-slate-200 dark:border-[#C0AB6F]/30 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 inline-block">
              Our Doha Heritage
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              Crafting Unforgettable Qatar Memories Since Day One
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              AR Trust Travel & Tourism was established in Doha with a single mission: to share Qatar's rich pearling heritage, magnificent futuristic architecture, and mystical desert dunes with guests from around the globe.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We operate our own modern vehicle fleet, maintain high safety standards with commercial passenger insurance, and work in close coordination with Qatar Tourism and Hamad International Airport authorities to guarantee seamless hospitality.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={onSelectBooking}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs shadow-lg active:scale-95 transition cursor-pointer"
              >
                Book Your Tour With Us
              </button>
              <button
                onClick={onNavigateContact}
                className="px-6 py-3 rounded-xl bg-white dark:bg-[#05161D] border border-slate-200 dark:border-[#C0AB6F]/40 text-slate-800 dark:text-white hover:border-[#D4AF37] font-bold text-xs transition cursor-pointer"
              >
                Contact Our Doha Team
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-[#C0AB6F]/30 shadow-2xl">
            <img
              src="https://artrusttravel.com/wp-content/uploads/2026/02/AR-Trust-Travel-Katara-Cultural-Village-3.jpg"
              alt="Katara Cultural Village"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-xs font-bold text-[#E7CF8A]">Katara Cultural Village, Doha</span>
              <span className="text-[11px] text-slate-300">Where traditions meet world-class cultural arts</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
