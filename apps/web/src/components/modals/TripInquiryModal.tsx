import React, { useState } from 'react';
import { X, CheckCircle2, Calendar, Users, MapPin, Send, MessageSquare, ShieldCheck, Plane, Car } from 'lucide-react';

interface TripInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTour?: string;
}

export const TripInquiryModal: React.FC<TripInquiryModalProps> = ({
  isOpen,
  onClose,
  preselectedTour,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+974 ');
  const [tourType, setTourType] = useState(preselectedTour || 'Doha Desert Safari: Dune Bashing & Inland Sea Adventure');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('2');
  const [pickup, setPickup] = useState('Hamad International Airport (HIA)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  const whatsappMessage = encodeURIComponent(
    `Hello AR Trust Travel! I'd like to book: ${tourType} on ${date || 'upcoming dates'} for ${guests} guests. My name is ${name}.`
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-teal-500/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30">
                Official Reservation
              </span>
              <span className="text-xs text-slate-400">Qatar Tourism DMC #QTA-QA-8819</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Book Your Qatar Experience
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          /* Confirmation View */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                Booking Request Received!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Thank you <span className="font-semibold text-slate-900 dark:text-white">{name}</span>. Our concierge team is processing your request for <span className="font-semibold text-teal-600 dark:text-teal-400">{tourType}</span>. You will receive an official confirmation via email & WhatsApp within 15 minutes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{date || 'Flexible / To be confirmed'}</span>
              </div>
              <div className="flex justify-between">
                <span>Travelers:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{guests} Guests</span>
              </div>
              <div className="flex justify-between">
                <span>Pickup:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{pickup}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://wa.me/97455557164?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Instant WhatsApp Confirm</span>
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Tour Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Tour Package / Service *
              </label>
              <select
                value={tourType}
                onChange={(e) => setTourType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium outline-none transition cursor-pointer"
                required
              >
                <optgroup label="🏜️ Desert Safaris & Dunes">
                  <option value="Doha Desert Safari: Dune Bashing & Inland Sea Adventure">Doha Desert Safari: Dune Bashing & Inland Sea (QAR 250)</option>
                  <option value="Qatar Sunset Desert Safari by Dune Buggy Riding">Qatar Sunset Desert Safari by Dune Buggy (QAR 320)</option>
                  <option value="Doha Safari Adventure, Quad Biking & Sunset Horse Riding">Safari, Quad Biking & Horse Riding (QAR 380)</option>
                </optgroup>
                <optgroup label="🏙️ City & Transit Tours">
                  <option value="Half-Day City Tour With Dhow Boat Cruise Adventure">Half-Day City Tour & Dhow Cruise (QAR 180)</option>
                  <option value="Transit Doha City Tour Experience (Airport Pickup & Drop)">Transit Doha City Tour Express (QAR 150)</option>
                  <option value="Private Group City Tour in Doha With Luxury Boat Tour">Private Luxury City Tour & Yacht (QAR 650)</option>
                </optgroup>
                <optgroup label="🚗 Airport Transfers & Fleet">
                  <option value="Mercedes-Benz V-Class VIP Airport Transfer">Mercedes-Benz V-Class VIP Transfer (QAR 280)</option>
                  <option value="Toyota Land Cruiser 4x4 Driver Transfer">Toyota Land Cruiser 4x4 Transfer (QAR 220)</option>
                  <option value="Executive Sedan Airport Pickup">Executive Sedan Transfer (QAR 120)</option>
                  <option value="Hyundai Staria / Group Van Transfer">Group Van Transfer (QAR 190)</option>
                </optgroup>
                <optgroup label="🏨 Multi-Day Holiday Itineraries">
                  <option value="2 Days / 1 Night: Essential Qatar Transit & Dunes">2 Days / 1 Night Essential Qatar (QAR 850)</option>
                  <option value="3 Days / 2 Nights: Cultural Treasures & Desert Safari">3 Days / 2 Nights Heritage & Safari (QAR 1,450)</option>
                  <option value="4 Days / 3 Nights: Grand Qatar Luxury Experience">4 Days / 3 Nights Grand Luxury (QAR 2,350)</option>
                </optgroup>
              </select>
            </div>

            {/* Traveler Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Sterling"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+974 5555 7164"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveler@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Number of Guests
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2.5 pl-9 text-xs text-slate-900 dark:text-slate-100 outline-none transition"
                  >
                    <option value="1">1 Person (Solo Explorer)</option>
                    <option value="2">2 Persons (Couple / Friends)</option>
                    <option value="3">3 Persons</option>
                    <option value="4">4 Persons (Family Group)</option>
                    <option value="5">5 Persons</option>
                    <option value="6">6+ Persons (Private Group)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Date & Pickup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2.5 pl-9 text-xs text-slate-900 dark:text-slate-100 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Airport Bay or Hotel Name"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2.5 pl-9 text-xs text-slate-900 dark:text-slate-100 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Flight Details / Special Requests (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Flight number (e.g. QR 004), child seat requirements, or dietary preferences..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-teal-500 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 outline-none transition"
              />
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-800 dark:text-teal-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
              <span>No immediate payment required. We verify flight times and availability before final confirmation.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Confirming availability...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Official Booking Request</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
