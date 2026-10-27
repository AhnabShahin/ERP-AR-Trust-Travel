import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  LogIn,
  LogOut,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
  Star,
  MessageSquare,
  Sparkles,
  Gift,
  Percent,
  Plane,
  Copy,
  Check,
  Crown,
  User,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PublicPageSlug } from './WebsiteHeader';
import { BackToTop } from './BackToTop';
import { useApp } from '../../context/AppContext';
import { useWebsiteLanguage } from '../../context/WebsiteLanguageContext';

export interface WebsiteFooterProps {
  onNavigate: (slug: PublicPageSlug) => void;
  onNavigateToAuth: () => void;
}

export const WebsiteFooter: React.FC<WebsiteFooterProps> = ({
  onNavigate,
  onNavigateToAuth,
}) => {
  const { isAuthenticated, logout } = useApp();
  const { t } = useWebsiteLanguage();

  // Auth state is client-only (localStorage); gate auth-dependent UI behind
  // `mounted` so SSR and the first client render match (no hydration mismatch).
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => setMounted(true), []);
  const showAuthed = mounted && isAuthenticated;

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('Desert Safari');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
  };

  const copyVoucher = () => {
    navigator.clipboard.writeText('QATARVIP10');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* ─── OFFICIAL QATAR TRAVEL CLUB (EXPANDED LUXURY SHOWCASE) ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-10 w-full max-w-[1720px] 2xl:max-w-[1820px] mx-auto">
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#021015] via-[#07242E] to-[#031319] text-white p-8 sm:p-12 lg:p-16 border border-[#C0AB6F]/40 shadow-[0_25px_60px_rgba(0,0,0,0.55)]">
          {/* Subtle Ambient Golden Radial Glows & Background Elements */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.14)_0%,transparent_70%)] pointer-events-none blur-2xl" />
          <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(13,58,72,0.45)_0%,transparent_70%)] pointer-events-none blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(192,171,111,0.08)_0%,transparent_60%)] pointer-events-none" />

          {/* Decorative Subtle Geometric Lines */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-[#C0AB6F]/10 pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-96 h-96 rounded-full border border-[#C0AB6F]/15 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* ─── LEFT COLUMN: EXPANSIVE EDITORIAL & PRIVILEGES (7 cols) ─── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badges & Live Status */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/20 via-[#C0AB6F]/15 to-[#D4AF37]/10 border border-[#C0AB6F]/50 text-[#E7CF8A] text-xs font-black tracking-wider uppercase shadow-xs">
                  <Crown className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span>Official Qatar Travel Club</span>
                  <span className="text-[#C0AB6F]/40">|</span>
                  <span className="font-normal font-mono text-[11px] text-[#E7CF8A]">نادي قطر للسفر</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>12,850+ Active VIP Members</span>
                </div>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                  Unlock Exclusive Qatar Travel Privileges & Secret Desert Safaris
                </h2>
                <div className="text-xs sm:text-sm text-[#E7CF8A] font-arabic text-left">
                  خدمات السفر الفاخرة، استقبال مطار حمد الدولي، وجولات الكثبان الرملية الخاصة
                </div>
              </div>

              {/* Subtitle Description */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Join Doha’s premier insider travel club. Enjoy an instant 10% welcome discount, prioritized curbside greetings at Hamad International Airport, private Majlis desert camp invites, and unadvertised transit layover privileges.
              </p>

              {/* 4-Pillar Privileges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {[
                  {
                    icon: Percent,
                    title: 'Instant 10% Welcome Discount',
                    desc: 'Applicable across all desert dune safaris, city tours & luxury airport transfers',
                  },
                  {
                    icon: Plane,
                    title: 'Flight Delay Auto-Protection',
                    desc: 'Zero extra charge if your Qatar Airways or international flight arrival shifts',
                  },
                  {
                    icon: Gift,
                    title: 'Priority Curbside Meet & Greet',
                    desc: 'Uniformed driver holding a personalized digital nameboard at HIA Arrivals',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Guaranteed Fixed Upfront Rates',
                    desc: 'No surge pricing during high-demand holidays, F1 Grand Prix, or winter events',
                  },
                ].map((perk, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/50 transition-colors backdrop-blur-xs group"
                  >
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#D4AF37]/25 to-[#C0AB6F]/10 border border-[#C0AB6F]/30 text-[#E7CF8A] shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <perk.icon className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#E7CF8A] transition-colors">
                        {perk.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {perk.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust Indicators & Review Rating */}
              <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-white">4.9 / 5.0</span>
                  <span className="text-slate-400 text-[11px]">(1,420+ Verified Travelers)</span>
                </div>
                <div className="h-3 w-px bg-white/20 hidden sm:block" />
                <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Licensed by Qatar Tourism: #QTA-QA-8819</span>
                </div>
              </div>
            </div>

            {/* ─── RIGHT COLUMN: VIP MEMBERSHIP PASS & ENROLLMENT (5 cols) ─── */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-b from-[#0B2E3A]/95 via-[#072129]/95 to-[#04161C]/98 p-6 sm:p-8 border border-[#D4AF37]/40 shadow-2xl backdrop-blur-xl">
                {/* Gold Crest Ribbon Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C0AB6F] flex items-center justify-center text-[#05161D] shadow-md shadow-[#D4AF37]/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-widest text-[#E7CF8A] block">
                        VIP Club Pass
                      </span>
                      <h3 className="text-base font-extrabold text-white">
                        Join AR Trust Travel Club
                      </h3>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E7CF8A] text-[10px] font-black uppercase tracking-wider">
                    10% OFF VOUCHER
                  </div>
                </div>

                {!isSubscribed ? (
                  <form onSubmit={handleSubscribe} className="space-y-4 pt-5">
                    <p className="text-xs text-slate-300">
                      Enroll today to receive your personal 10% welcome promo code directly on screen.
                    </p>

                    {/* Interest Preferences Selector */}
                    <div>
                      <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                        I am most interested in:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'Desert Safari', label: 'Desert Safari', icon: '🏜️' },
                          { id: 'Airport Driver', label: 'Airport Driver', icon: '🚘' },
                          { id: 'City Tour', label: 'Doha City Tour', icon: '🏙️' },
                          { id: 'Holiday Packages', label: 'Holiday Packages', icon: '🏖️' },
                        ].map((opt) => (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => setSelectedInterest(opt.id)}
                            className={`p-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2 transition cursor-pointer border ${
                              selectedInterest === opt.id
                                ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#C0AB6F]/10 border-[#D4AF37] text-white shadow-xs'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                            }`}
                          >
                            <span>{opt.icon}</span>
                            <span className="truncate">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Full Name Input */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 tracking-wider block mb-1.5">
                        Your Name (Optional)
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#C0AB6F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sheikh Ahmed / Sarah Miller"
                          className="w-full bg-[#031319]/90 border border-[#C0AB6F]/30 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 transition"
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 tracking-wider block mb-1.5">
                        Your Email Address <span className="text-[#D4AF37]">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#C0AB6F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-[#031319]/90 border border-[#C0AB6F]/30 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 transition"
                          required
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E7CF8A] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs transition shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <span>Claim VIP Membership & 10% Voucher</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Anti-spam Guarantee */}
                    <p className="text-[10px] text-slate-400 text-center leading-normal">
                      🔒 Zero spam guaranteed. 1-click unsubscribe anytime. Your details are safe with Qatar Tourism licensed operator #QTA-QA-8819.
                    </p>
                  </form>
                ) : (
                  /* ─── SUCCESS STATE: INTERACTIVE VIP PASS WITH VOUCHER CODE ─── */
                  <div className="pt-6 space-y-5 animate-in fade-in duration-500">
                    <div className="text-center space-y-1.5">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
                        <Check className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-black text-white">
                        Welcome to Qatar Travel Club{name ? `, ${name}` : ''}!
                      </h4>
                      <p className="text-xs text-slate-300">
                        Your VIP Membership has been activated for <span className="text-[#E7CF8A] font-semibold">{email}</span>.
                      </p>
                    </div>

                    {/* Digital Gold Card Display */}
                    <div className="rounded-2xl p-4 bg-gradient-to-br from-[#123E4D] via-[#092B37] to-[#051B22] border border-[#D4AF37]/60 shadow-xl space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#E7CF8A]">
                        <span>MEMBER TIER: GOLD VIP</span>
                        <span>INTEREST: {selectedInterest}</span>
                      </div>

                      <div className="bg-[#031319]/90 border border-dashed border-[#D4AF37]/60 rounded-xl p-3 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">
                            Your 10% Discount Voucher Code
                          </span>
                          <span className="text-xl font-mono font-black text-[#E7CF8A] tracking-widest">
                            QATARVIP10
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={copyVoucher}
                          className="px-3 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E7CF8A] text-[#05161D] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 shrink-0"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        ✓ Apply <strong className="text-white">QATARVIP10</strong> at booking checkout for an instant 10% discount on any desert safari tour, transit city tour, or airport limousine transfer.
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                      <button
                        onClick={() => {
                          onNavigate('tours');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] font-black text-xs text-center transition cursor-pointer hover:brightness-110 flex items-center justify-center gap-1.5"
                      >
                        <span>Explore Tours & Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('fleet');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs text-center transition cursor-pointer"
                      >
                        Book Airport Fleet
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSubscribed(false)}
                      className="text-[11px] text-slate-400 hover:text-white transition text-center block w-full underline cursor-pointer"
                    >
                      Subscribe another email address
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#05161D] text-slate-300 pt-16 pb-12 border-t border-[#C0AB6F]/30 text-xs">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Bio */}
          <div className="space-y-4">
            <BrandLogo size="md" variant="full" />
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {t.footer.aboutDesc}
            </p>
            <div className="text-[11px] text-[#E7CF8A] font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t.common.licensedDmc}</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              Headquarters & Concierge
            </h4>
            <div className="space-y-2 text-slate-400 text-[11px]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C0AB6F] shrink-0 mt-0.5" />
                <span>B Ring Road, Lulu Express, Bin Dirham Plaza, 6th Floor, Unit 607, Al Mansoura, Doha, Qatar</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C0AB6F] shrink-0" />
                <a href="tel:+97455557164" className="hover:text-white transition">+974 5555 7164 / +974 5550 2878</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C0AB6F] shrink-0" />
                <a href="mailto:support@artrusttravel.com" className="hover:text-white transition">support@artrusttravel.com</a>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C0AB6F] shrink-0" />
                <span>24/7 Hamad Airport Desk Operations</span>
              </p>
            </div>
          </div>

          {/* Quick Links with Slugs */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              {t.footer.quickLinksTitle}
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li>
                <button
                  onClick={() => {
                    onNavigate('tours');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#E7CF8A] text-left transition cursor-pointer"
                >
                  {t.navTours}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('fleet');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#E7CF8A] text-left transition cursor-pointer"
                >
                  {t.navFleet}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('packages');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#E7CF8A] text-left transition cursor-pointer"
                >
                  {t.navPackages}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('services');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#E7CF8A] text-left transition cursor-pointer"
                >
                  {t.navServices}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('why-us');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#E7CF8A] text-left transition cursor-pointer"
                >
                  {t.navWhyUs}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('reviews');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#E7CF8A] text-left transition cursor-pointer"
                >
                  {t.navReviews}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#E7CF8A] text-left transition cursor-pointer"
                >
                  {t.navContact}
                </button>
              </li>
            </ul>
          </div>

          {/* Operations & Staff Portal */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              Operations & Staff
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Authorized airport agents, guides, and operations staff can access the central operations console.
            </p>
            {showAuthed ? (
              <div className="space-y-2">
                <button
                  onClick={onNavigateToAuth}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer hover:brightness-110 active:scale-95 shadow-md shadow-[#D4AF37]/20"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#05161D]" />
                  <span>Go to Operations Dashboard</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="w-full py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>Logout from Session</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onNavigateToAuth}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0D3A48] hover:bg-[#14495A] border border-[#C0AB6F]/40 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
              >
                <LogIn className="w-4 h-4 text-[#D4AF37]" />
                <span>Operations ERP Login</span>
              </button>
            )}
            <p className="text-[10px] text-slate-500 font-mono text-center">
              Licensed by Qatar Tourism #QTA-QA-8819
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© 2026 AR Trust Travel & Tourism W.L.L. · All Rights Reserved.</p>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('why-us')} className="hover:text-slate-400 transition cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => onNavigate('why-us')} className="hover:text-slate-400 transition cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-400 transition cursor-pointer">
              Help & Support
            </button>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING BACK TO TOP BUTTON ─── */}
      <BackToTop />

      {/* ─── FLOATING OFFICIAL WHATSAPP CHAT BUTTON ─── */}
      <a
        href="https://wa.me/97455557164?text=Hello%20AR%20Trust%20Travel!%20I%20would%20like%20to%20inquire%20about%20your%20services%20and%20tours."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 group flex items-center justify-center cursor-pointer"
        title="Chat with AR Trust Travel on WhatsApp (+974 5555 7164)"
        aria-label="Chat on WhatsApp"
      >
        {/* Pulsing radar ping animation */}
        <span className="absolute w-14 h-14 rounded-full bg-[#25D366]/40 animate-ping -z-10" />

        {/* Floating tooltip on hover */}
        <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-[#05161D]/90 text-white text-xs font-semibold whitespace-nowrap border border-[#25D366]/40 shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none backdrop-blur-md">
          Chat on WhatsApp
        </span>

        {/* WhatsApp Icon Circle Button */}
        <div className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-2xl shadow-[#25D366]/50 flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-active:scale-95">
          <svg className="w-8 h-8 fill-white" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </div>
      </a>
    </>
  );
};
