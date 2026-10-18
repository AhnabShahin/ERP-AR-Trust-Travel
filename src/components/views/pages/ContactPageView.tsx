import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { useWebsiteLanguage } from '../../../context/WebsiteLanguageContext';

interface ContactPageViewProps {
  onNavigateHome: () => void;
}

export const ContactPageView: React.FC<ContactPageViewProps> = ({
  onNavigateHome,
}) => {
  const { t } = useWebsiteLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+974 ',
    service: 'Desert Safari Tour',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '+974 ',
        service: 'Desert Safari Tour',
        message: '',
      });
    }, 4000);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* ─── PAGE HERO BANNER ─── */}
      <section className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center overflow-hidden bg-[#05161D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://artrusttravel.com/wp-content/uploads/2026/02/AR-Trust-Travel-Lusail-City-1-1000x629.jpg')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05161D]/80 via-[#05161D]/60 to-[#05161D]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-4">
          {/* Breadcrumb */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D3A48]/80 border border-[#C0AB6F]/30 text-xs font-semibold text-[#E7CF8A]">
            <button onClick={onNavigateHome} className="hover:underline">{t.common.home}</button>
            <span>/</span>
            <span className="text-white">{t.navContact}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {t.contactPage.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            {t.contactPage.heroSubtitle}
          </p>

          <div className="text-xs text-[#E7CF8A] font-mono">
            {t.common.licensedDmc}
          </div>
        </div>
      </section>

      {/* ─── CONTACT CHANNELS GRID ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Channel 1: Headquarters */}
          <div className="bg-white dark:bg-[#05161D] p-6 rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md space-y-3 hover:border-[#D4AF37] transition">
            <div className="w-12 h-12 rounded-2xl bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/40 flex items-center justify-center shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Head Office</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bin Dirham Plaza, 6th Floor, Unit 607, B Ring Road, Al Mansoura, Doha, Qatar
            </p>
            <span className="text-[11px] font-mono text-[#D4AF37] block">Qatar Tourism #QTA-QA-8819</span>
          </div>

          {/* Channel 2: Phone & 24/7 Hotlines */}
          <div className="bg-white dark:bg-[#05161D] p-6 rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md space-y-3 hover:border-[#D4AF37] transition">
            <div className="w-12 h-12 rounded-2xl bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/40 flex items-center justify-center shadow-md">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Direct Phone Lines</h3>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <p><a href="tel:+97455557164" className="hover:text-[#D4AF37] transition font-bold">+974 5555 7164</a> (Hotline)</p>
              <p><a href="tel:+97455502878" className="hover:text-[#D4AF37] transition">+974 5550 2878</a> (Bookings)</p>
              <p><a href="tel:+97444448920" className="hover:text-[#D4AF37] transition">+974 4444 8920</a> (Office)</p>
            </div>
          </div>

          {/* Channel 3: Email Desk */}
          <div className="bg-white dark:bg-[#05161D] p-6 rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md space-y-3 hover:border-[#D4AF37] transition">
            <div className="w-12 h-12 rounded-2xl bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/40 flex items-center justify-center shadow-md">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Email Inquiries</h3>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <p><a href="mailto:support@artrusttravel.com" className="hover:text-[#D4AF37] transition font-bold">support@artrusttravel.com</a></p>
              <p><a href="mailto:bookings@artrusttravel.com" className="hover:text-[#D4AF37] transition">bookings@artrusttravel.com</a></p>
              <p><a href="mailto:info@artrusttravel.com" className="hover:text-[#D4AF37] transition">info@artrusttravel.com</a></p>
            </div>
          </div>

          {/* Channel 4: WhatsApp Concierge */}
          <div className="bg-white dark:bg-[#05161D] p-6 rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-md space-y-3 hover:border-[#D4AF37] transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">24/7 WhatsApp Desk</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant responses within 3 minutes for airport pickups, last-minute tours, and pricing.
            </p>
            <a
              href="https://wa.me/97455557164"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition"
            >
              <span>Chat with Us Now</span>
              <Navigation className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ─── CONTACT FORM & LOCATION MAP SECTION ─── */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-[#05161D] p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-xl space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#C0AB6F] tracking-wider block">
                Send a Message
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                How Can We Help Your Qatar Journey?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fill out the form below and our Doha reservations team will reply within 30 minutes.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Message Received!</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Thank you, {formData.name}. One of our senior travel concierges is reviewing your inquiry and will contact you via email / phone shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. David Sterling"
                      className="w-full bg-slate-50 dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="david@example.com"
                      className="w-full bg-slate-50 dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                      Interested Service
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]"
                    >
                      <option>Desert Safari Tour</option>
                      <option>Airport Limousine Transfer</option>
                      <option>Doha City & Dhow Cruise</option>
                      <option>Multi-Day Holiday Package</option>
                      <option>Airline Ticket & Qatar Visa</option>
                      <option>Corporate Fleet / Event Logistics</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                    Your Message / Travel Dates *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your arrival date, number of passengers, hotel preferences or specific requests..."
                    className="w-full bg-slate-50 dark:bg-[#09232C] border border-slate-200 dark:border-[#C0AB6F]/30 rounded-xl p-4 text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs shadow-lg shadow-[#D4AF37]/25 active:scale-95 transition cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Concierge</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: Location Map & Office Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#05161D] p-6 rounded-3xl border border-slate-200 dark:border-[#C0AB6F]/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#D4AF37]" />
                  <span>Find Us in Doha</span>
                </h3>
                <a
                  href="https://maps.google.com/?q=Bin+Dirham+Plaza,+Al+Mansoura,+Doha,+Qatar"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0D3A48] hover:bg-[#14495A] border border-[#C0AB6F]/40 text-xs font-bold text-[#E7CF8A] transition shadow-xs cursor-pointer"
                  title="Open in Google Maps"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Interactive Google Map Embed */}
              <div className="relative aspect-[16/11] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-inner bg-slate-900">
                <iframe
                  title="AR Trust Travel Location Map - Bin Dirham Plaza, Doha"
                  src="https://maps.google.com/maps?q=Bin+Dirham+Plaza,+B+Ring+Road,+Al+Mansoura,+Doha,+Qatar&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Verified Address & Landmark Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#09232C] border border-slate-200/80 dark:border-white/10 space-y-3">
                <div className="flex items-start gap-2.5 text-xs">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      AR Trust Travel & Tourism W.L.L.
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      Bin Dirham Plaza, 6th Floor, Unit 607, B Ring Road (Lulu Express Building), Al Mansoura, Doha, Qatar
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#C0AB6F] font-mono pt-0.5">
                      <span className="bg-[#05161D]/60 px-2 py-0.5 rounded border border-[#C0AB6F]/30">
                        📍 Metro: Al Mansoura Station (Gold Line - 4 min walk)
                      </span>
                      <span className="bg-[#05161D]/60 px-2 py-0.5 rounded border border-[#C0AB6F]/30">
                        ✈️ 12 mins to Hamad Airport (HIA)
                      </span>
                    </div>
                  </div>
                </div>

                <a
                  href="https://maps.google.com/?q=Bin+Dirham+Plaza,+Al+Mansoura,+Doha,+Qatar"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-[#D4AF37]/20 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#05161D]" />
                  <span>Get Driving Directions on Google Maps</span>
                </a>
              </div>

              <div className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#C0AB6F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Working Hours</span>
                    <span>Saturday - Thursday: 08:00 AM - 10:00 PM</span>
                    <span className="block text-slate-400">Friday: 02:00 PM - 09:00 PM</span>
                    <span className="block text-[#E7CF8A] font-semibold mt-1">24/7 Airport Emergency Dispatch</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100 dark:border-white/10">
                  <ShieldCheck className="w-4 h-4 text-[#C0AB6F] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Official Verification</span>
                    <span>Commercial Registration: 184592</span>
                    <span className="block text-slate-400">Qatar Tourism License: #QTA-QA-8819</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
