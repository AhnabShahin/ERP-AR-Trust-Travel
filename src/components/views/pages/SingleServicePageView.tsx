import React, { useState } from 'react';
import {
  Plane,
  Building2,
  FileCheck2,
  ShieldCheck,
  Award,
  Compass,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Users,
  Phone,
  Mail,
  User,
  MessageSquare,
  Sparkles,
  Shield,
  Clock,
  Check,
  Send,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { ServiceItem, SERVICES_CATALOG } from '../../../data/servicesData';
import { useApp } from '../../../context/AppContext';
import { useWebsiteLanguage } from '../../../context/WebsiteLanguageContext';
import { useWebsiteCurrency } from '../../../context/WebsiteCurrencyContext';

interface SingleServicePageViewProps {
  service: ServiceItem;
  onBackToServices: () => void;
  onNavigateHome: () => void;
  onSelectOtherService: (service: ServiceItem) => void;
}

export const SingleServicePageView: React.FC<SingleServicePageViewProps> = ({
  service,
  onBackToServices,
  onNavigateHome,
  onSelectOtherService,
}) => {
  const { addBooking } = useApp();
  const { t } = useWebsiteLanguage();
  const { formatPrice, selectedCurrency } = useWebsiteCurrency();

  // Form State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [serviceOption, setServiceOption] = useState(service.inquiryConfig.defaultOption);
  const [travelDate, setTravelDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [paxCount, setPaxCount] = useState(2);
  const [specialNotes, setSpecialNotes] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Icon mapping
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

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;

    setIsSubmitting(true);
    const generatedRef = `AR-SRV-${Math.floor(1000 + Math.random() * 9000)}`;

    const compiledNotes = `[⚡ Website Service Lead] Service: ${service.title} | Option: ${serviceOption} | Date: ${travelDate} | Travelers: ${paxCount} | Client Notes: ${specialNotes || 'None'}`;

    try {
      if (addBooking) {
        addBooking({
          pnr: generatedRef,
          passengerName: guestName,
          passengerPhone: guestPhone,
          passengerEmail: guestEmail || 'inquiry@artrusttravel.com',
          nationality: 'International / Qatar',
          flightNumber: 'Service Inquiry',
          arrivalAirport: 'Hamad International (DOH)',
          arrivalTime: '10:00 AM',
          terminalGate: 'Central Concierge Desk',
          pickupBay: 'Doha Office Concierge',
          packageId: service.id,
          packageName: `${service.title} - ${serviceOption}`,
          packageNameAr: service.titleAr,
          paxCount: paxCount,
          totalQAR: service.startingPriceQAR,
          paymentCurrency: 'QAR',
          paymentMethod: 'Website Online Gateway',
          driverId: 'drv-concierge',
          driverName: 'Assigned to Service Manager',
          driverVehicle: 'VIP Operations Desk',
          driverPhone: '+974 5555 7164',
          qrStatus: 'confirmed',
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${generatedRef}`,
          voucherSent: true,
          bookingDate: travelDate,
          bookingTime: '10:00 AM',
          notes: compiledNotes,
          source: 'Website Direct Lead',
          leadType: 'service',
        });
      }
    } catch (err) {
      console.warn('Service lead sync error:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedRef(generatedRef);
    }, 700);
  };

  const otherServices = SERVICES_CATALOG.filter((s) => s.id !== service.id);

  return (
    <div className="space-y-16 pb-24 text-slate-900 dark:text-slate-100">
      {/* ─── HERO SECTION: FULL-COVER BACKGROUND (NO RIGHT IMAGE) ─── */}
      <section className="relative min-h-[460px] sm:min-h-[520px] flex flex-col justify-between pt-8 pb-14 border-b border-[#C0AB6F]/30 bg-[#05161D] text-white overflow-hidden">
        {/* Full Cover Background Image with subtle cinematic scale */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: `url('${service.heroImage}')`,
          }}
        />

        {/* High-Contrast Luxury Gradient Overlays for Optimal Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#05161D]/95 via-[#05161D]/85 to-[#05161D]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05161D] via-transparent to-[#05161D]/60" />
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 w-full space-y-8">
          {/* Breadcrumb Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#05161D]/80 backdrop-blur-md border border-[#C0AB6F]/35 text-xs font-semibold text-[#E7CF8A] shadow-md">
              <button onClick={onNavigateHome} className="hover:underline cursor-pointer">
                {t.common.home}
              </button>
              <span>/</span>
              <button onClick={onBackToServices} className="hover:underline cursor-pointer">
                {t.navServices}
              </button>
              <span>/</span>
              <span className="text-white truncate max-w-[200px] sm:max-w-none">{service.title}</span>
            </div>

            <button
              onClick={onBackToServices}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#05161D]/80 hover:bg-[#C0AB6F]/20 text-white text-xs font-bold border border-[#C0AB6F]/40 backdrop-blur-md transition-all cursor-pointer shadow-md active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Back to All Services</span>
            </button>
          </div>

          {/* Full-Width Hero Typography (No right image) */}
          <div className="max-w-4xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C0AB6F]/25 backdrop-blur-md text-[#E7CF8A] border border-[#C0AB6F]/50 text-xs font-bold uppercase tracking-widest shadow-md">
              {renderIcon(service.iconName, 'w-4 h-4 text-[#D4AF37]')}
              <span>{service.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              {service.title}
            </h1>

            {service.titleAr && (
              <p className="text-xl sm:text-2xl text-[#E7CF8A] font-arabic leading-relaxed drop-shadow-sm text-left">
                {service.titleAr}
              </p>
            )}

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl drop-shadow-sm font-normal">
              {service.shortDescription}
            </p>

            {/* Quick Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs text-slate-200">
              <span className="flex items-center gap-2 bg-[#05161D]/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Licensed Qatar Tourism DMC #QA-8819</span>
              </span>
              <span className="flex items-center gap-2 bg-[#05161D]/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>Average Response Time: 15 Mins</span>
              </span>
              <span className="flex items-center gap-2 bg-[#05161D]/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Doha Operations Desk</span>
              </span>
            </div>

            {/* Price & Jump to Form Button */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="#inquiry-form"
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-[#D4AF37]/25 active:scale-95 transition cursor-pointer"
              >
                <span>Submit Inquiry & Get Quote</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <div className="px-5 py-2.5 rounded-2xl bg-[#05161D]/80 backdrop-blur-md border border-[#C0AB6F]/40 shadow-lg">
                <span className="text-[10px] uppercase font-bold text-[#C0AB6F] block tracking-wider">
                  Pricing Guidance
                </span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-xl font-black text-[#E7CF8A]">{formatPrice(service.startingPriceQAR)}</span>
                  <span className="text-xs text-slate-300">/{service.rateType}</span>
                </div>
                {selectedCurrency.code !== 'QAR' && (
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    ≈ QAR {service.startingPriceQAR.toLocaleString()}
                  </span>
                )}
              </div>

              <a
                href={`https://wa.me/97455557164?text=${encodeURIComponent(
                  `Hello AR Trust Travel! I'd like to inquire about your service: "${service.title}". Please provide details.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 backdrop-blur-md transition active:scale-95 border border-emerald-500/40 shadow-lg"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Instant Help</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT: DETAILS + LEAD INQUIRY FORM ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT 7 COLS: SERVICE OVERVIEW, INCLUSIONS, PROCESS, FAQS */}
          <div className="lg:col-span-7 space-y-12">
            {/* 1. Overview */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#D4AF37]" />
                <span>Service Overview</span>
              </h2>
              <div className="p-6 rounded-3xl bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 shadow-xs leading-relaxed text-sm text-slate-600 dark:text-slate-300 space-y-3">
                <p>{service.overview}</p>
              </div>
            </section>

            {/* 2. Key Highlights & Inclusions */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D4AF37]" />
                <span>Key Features & Inclusions</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {service.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/25 flex items-start gap-3 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Inclusions List */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                What’s Included in Every Booking
              </h2>
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#05161D] border border-slate-200 dark:border-white/10 space-y-3">
                {service.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-[#C0AB6F]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Step-by-Step Process */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
                <span>How It Works</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.processSteps.map((step) => (
                  <div
                    key={step.step}
                    className="p-5 rounded-2xl bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 space-y-2 relative overflow-hidden"
                  >
                    <span className="text-3xl font-black font-mono text-[#D4AF37]/20 absolute top-3 right-4">
                      {step.step}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#C0AB6F]/20 text-[#E7CF8A] flex items-center justify-center font-mono text-xs font-bold">
                        {step.step}
                      </span>
                      <span>{step.title}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Why Choose Us */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                <span>The AR Trust Guarantee</span>
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {service.whyChooseUs.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-white dark:from-[#09232C] dark:to-[#05161D] border border-slate-200 dark:border-[#C0AB6F]/30 space-y-1.5"
                  >
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                      <span>{w.title}</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {w.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. Frequently Asked Questions */}
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
                <span>Frequently Asked Questions</span>
              </h2>
              <div className="space-y-3">
                {service.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/25 space-y-2 shadow-xs"
                  >
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-start gap-2">
                      <span className="text-[#D4AF37] font-mono">Q.</span>
                      <span>{faq.q}</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT 5 COLS: STICKY INTERACTIVE LEAD & INQUIRY FORM */}
          <div className="lg:col-span-5">
            <div id="inquiry-form" className="sticky top-28 space-y-6">
              <div className="bg-white dark:bg-[#09232C] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#C0AB6F]/40 shadow-xl space-y-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 text-[10px] font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span>Direct Concierge Booking</span>
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Request / Inquire Service
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Fill out this inquiry form. Your request is directly sent to our 24/7 Operations Desk in Doha for immediate quotation.
                  </p>
                </div>

                {/* SUCCESS CONFIRMATION MODAL / STATE */}
                {submittedRef ? (
                  <div className="p-6 rounded-2xl bg-[#05161D] border border-emerald-500/50 text-white space-y-5 animate-in fade-in duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>

                    <div className="text-center space-y-1">
                      <h4 className="text-base font-black text-white">Inquiry Successfully Submitted!</h4>
                      <p className="text-xs text-slate-300">
                        Thank you, <strong className="text-white">{guestName}</strong>. Our specialist will respond within 15 minutes.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#09232C] border border-[#C0AB6F]/30 text-center space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#C0AB6F] tracking-wider block">
                        Official Inquiry Reference
                      </span>
                      <span className="text-lg font-mono font-black text-[#E7CF8A] tracking-wider block">
                        {submittedRef}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Status: Direct Operations Lead Dispatched
                      </span>
                    </div>

                    {/* Instant WhatsApp Action */}
                    <a
                      href={`https://wa.me/97455557164?text=${encodeURIComponent(
                        `Hello AR Trust Travel! I just submitted an inquiry for "${service.title}" (Ref: ${submittedRef}). Guest Name: ${guestName}. Please provide details.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-emerald-600/30"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat on WhatsApp With Reference</span>
                    </a>

                    <button
                      onClick={() => {
                        setSubmittedRef(null);
                        setGuestName('');
                        setGuestPhone('');
                        setSpecialNotes('');
                      }}
                      className="w-full py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitLead} className="space-y-4">
                    {/* Specific Service Option Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        {service.inquiryConfig.serviceTypeLabel} <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={serviceOption}
                        onChange={(e) => setServiceOption(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#05161D] border border-slate-200 dark:border-[#C0AB6F]/30 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#D4AF37]"
                      >
                        {service.inquiryConfig.options.map((opt, i) => (
                          <option key={i} value={opt} className="bg-[#05161D] text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Guest Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. John Doe / Mohammed Ali"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#05161D] border border-slate-200 dark:border-[#C0AB6F]/30 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    {/* Guest Phone / WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Phone / WhatsApp Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="+974 5555 7164 or +44 ..."
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#05161D] border border-slate-200 dark:border-[#C0AB6F]/30 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    {/* Guest Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="client@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#05161D] border border-slate-200 dark:border-[#C0AB6F]/30 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    {/* Travel Date & Pax Count Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          {service.inquiryConfig.dateLabel}
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="date"
                            value={travelDate}
                            onChange={(e) => setTravelDate(e.target.value)}
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#05161D] border border-slate-200 dark:border-[#C0AB6F]/30 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          {service.inquiryConfig.paxLabel}
                        </label>
                        <div className="relative">
                          <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={paxCount}
                            onChange={(e) => setPaxCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#05161D] border border-slate-200 dark:border-[#C0AB6F]/30 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        Specific Requirements / Notes
                      </label>
                      <textarea
                        rows={3}
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        placeholder={service.inquiryConfig.notesPrompt}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#05161D] border border-slate-200 dark:border-[#C0AB6F]/30 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37] leading-relaxed resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#05161D] border-t-transparent rounded-full animate-spin" />
                          <span>Dispatching to Operations Desk...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Inquiry & Get Instant Quote</span>
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-slate-400">
                      🔒 Your information is confidential and protected under Qatar Tourism privacy laws.
                    </p>
                  </form>
                )}
              </div>

              {/* Direct WhatsApp Callout Box */}
              <div className="p-4 rounded-2xl bg-[#05161D] border border-[#C0AB6F]/30 flex items-center justify-between text-xs text-white">
                <div className="space-y-0.5">
                  <span className="text-[#E7CF8A] font-bold block">Need Urgent Assistance?</span>
                  <span className="text-[11px] text-slate-400">Direct WhatsApp Concierge</span>
                </div>
                <a
                  href="https://wa.me/97455557164?text=Hello%20AR%20Trust%20Travel!%20I%20have%20an%20urgent%20service%20inquiry."
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>+974 5555 7164</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── OTHER TRAVEL SERVICES CAROUSEL / BROWSE MORE ─── */}
      <section className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#C0AB6F] tracking-wider block">
              Complete Travel Suite
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Explore Other AR Trust Travel Services
            </h3>
          </div>

          <button
            onClick={onBackToServices}
            className="text-xs font-bold text-[#E7CF8A] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherServices.slice(0, 3).map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectOtherService(item);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-6 rounded-3xl bg-white dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 hover:border-[#D4AF37] shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#0D3A48] text-[#E7CF8A] flex items-center justify-center">
                    {renderIcon(item.iconName, 'w-5 h-5')}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A]">
                    {item.badge}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#D4AF37] transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {item.shortDescription}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#D4AF37]">
                <span>View Details & Inquire</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
