import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Car,
  Plane,
  MessageSquare,
  ArrowRight,
  CreditCard,
  Check,
  X,
  Compass,
} from 'lucide-react';
import {
  WEBSITE_TOURS,
  WEBSITE_FLEET,
  findExperienceItem,
  getAllExperienceItems,
  ExperienceItem,
} from '../../data/websiteData';
import { useApp } from '../../context/AppContext';
import { imgSrc } from '../../../lib/uploads';
import { useWebsiteCurrency } from '../../context/WebsiteCurrencyContext';

interface InteractiveCalendarBookingEngineProps {
  initialTourId?: string;
  onBookingSuccess?: (bookingDetails: any) => void;
  className?: string;
}

export const InteractiveCalendarBookingEngine: React.FC<InteractiveCalendarBookingEngineProps> = ({
  initialTourId,
  onBookingSuccess,
  className = '',
}) => {
  const { addBooking, packages, fleetVehicles } = useApp();
  const { formatPrice, selectedCurrency } = useWebsiteCurrency();

  // Booking Flow Steps: 1: Experience & Date, 2: Guests & Addons, 3: Details & Confirm, 4: Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected tour or service (can be any tour, vehicle, package)
  const [selectedTourId, setSelectedTourId] = useState<string>(initialTourId || WEBSITE_TOURS[1].id);
  const [showItemPicker, setShowItemPicker] = useState<boolean>(false);

  useEffect(() => {
    if (initialTourId) {
      setSelectedTourId(initialTourId);
    }
  }, [initialTourId]);

  const selectedExperience = useMemo(
    () => findExperienceItem(selectedTourId, packages, fleetVehicles),
    [selectedTourId, packages, fleetVehicles]
  );
  // Alias for compatibility with rest of component
  const selectedTour = selectedExperience;

  // Calendar State (Current visible month/year)
  const today = new Date();
  const [visibleYear, setVisibleYear] = useState<number>(today.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState<number>(today.getMonth()); // 0 - 11

  // Selected Date string (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const nextDay = new Date();
    nextDay.setDate(today.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  });

  // Time Slot Selection
  const [selectedSlot, setSelectedSlot] = useState<string>('02:30 PM (Sunset Special)');

  // Guest counts
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [isPrivateVehicle, setIsPrivateVehicle] = useState<boolean>(false);

  // Add-ons
  const [addons, setAddons] = useState<{ [key: string]: boolean }>({
    camelTrek: false,
    falconryPhoto: false,
    bbqDinner: false,
  });

  // Guest Details
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('+974 ');
  const [pickupLocation, setPickupLocation] = useState<string>('Hamad International Airport (HIA) - Arrivals Gate 4');
  const [flightNumber, setFlightNumber] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  // Completed Booking Reference
  const [bookingRef, setBookingRef] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Month Names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Calendar calculations
  const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(visibleYear, visibleMonth, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    if (visibleMonth === 0) {
      setVisibleMonth(11);
      setVisibleYear((y) => y - 1);
    } else {
      setVisibleMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (visibleMonth === 11) {
      setVisibleMonth(0);
      setVisibleYear((y) => y + 1);
    } else {
      setVisibleMonth((m) => m + 1);
    }
  };

  // Pricing calculations
  const adultPrice = selectedTour.priceQAR;
  const childPrice = Math.round(selectedTour.priceQAR * 0.6);
  const privateFee = isPrivateVehicle ? 350 : 0;
  const camelFee = addons.camelTrek ? 60 * (adults + children) : 0;
  const falconFee = addons.falconryPhoto ? 45 * adults : 0;
  const bbqFee = addons.bbqDinner ? 120 * (adults + children) : 0;

  const totalQAR =
    adults * adultPrice +
    children * childPrice +
    privateFee +
    camelFee +
    falconFee +
    bbqFee;

  // Handle final booking submission
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedRef = `ART-WEB-${Math.floor(10000 + Math.random() * 90000)}`;
    setBookingRef(generatedRef);

    const expType: 'tour' | 'package' | 'fleet' | 'service' = selectedTour.type || 'tour';

    // Tailor vehicle, package naming & notes based on experience classification
    let driverVehicleName = isPrivateVehicle ? 'Mercedes V-Class VIP' : 'Toyota Land Cruiser 4x4';
    let typeTag = '[🧭 Website Tour Service Lead]';
    let fullPackageName = selectedTour.title;

    if (expType === 'fleet') {
      driverVehicleName = selectedTour.title;
      typeTag = '[🚗 Website Fleet Driver Lead]';
      fullPackageName = `${selectedTour.title} (${selectedTour.category || 'Driver Transfer'})`;
    } else if (expType === 'package') {
      driverVehicleName = 'Dedicated Tour Guide & Driver';
      typeTag = '[🏖️ Website Holiday Package Lead]';
      fullPackageName = `${selectedTour.title} (${selectedTour.duration || 'Holiday Package'})`;
    } else if (expType === 'service') {
      typeTag = '[⚡ Website Concierge Service Lead]';
    }

    const compiledNotes = `${typeTag} Category: ${selectedTour.category || 'General'}. Time Slot: ${selectedSlot}. Adults: ${adults}, Children: ${children}. Private Option: ${isPrivateVehicle ? 'Yes' : 'No'}. Add-ons: ${Object.entries(addons).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'None'}. Special Notes: ${specialNotes || 'None'}`;

    // Save directly into ERP state so it appears in the Central Dashboard, Bookings list & Notifications
    try {
      if (addBooking) {
        addBooking({
          pnr: generatedRef,
          passengerName: guestName || 'Online Booking Lead',
          passengerPhone: guestPhone,
          passengerEmail: guestEmail,
          nationality: 'International / Qatar',
          flightNumber: flightNumber || 'QR Transit',
          arrivalAirport: 'Hamad International (DOH)',
          arrivalTime: selectedSlot.split(' ')[0],
          terminalGate: 'Arrivals Bay 4',
          pickupBay: pickupLocation,
          packageId: selectedTour.id,
          packageName: fullPackageName,
          packageNameAr: selectedTour.titleAr || fullPackageName,
          paxCount: adults + children,
          totalQAR: totalQAR,
          paymentCurrency: 'QAR',
          paymentMethod: 'Website Online Gateway',
          driverId: 'drv-pending',
          driverName: 'Awaiting Operations Approval',
          driverVehicle: driverVehicleName,
          driverPhone: '+974 5555 7164',
          qrStatus: 'pending',
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${generatedRef}`,
          voucherSent: false,
          bookingDate: selectedDate,
          bookingTime: selectedSlot.split(' ')[0],
          notes: compiledNotes,
          source: 'Website Direct Lead',
          leadType: expType,
        });
      }
    } catch (err) {
      console.warn('Booking sync notice:', err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep(4);
      if (onBookingSuccess) {
        onBookingSuccess({
          ref: generatedRef,
          tour: selectedTour.title,
          date: selectedDate,
          total: totalQAR,
        });
      }
    }, 700);
  };

  const whatsappConfirmLink = encodeURIComponent(
    `Hello AR Trust Travel! I just submitted an online booking.\nReference: ${bookingRef}\nTour: ${selectedTour.title}\nDate: ${selectedDate} (${selectedSlot})\nGuests: ${adults} Adults, ${children} Children\nTotal: QAR ${totalQAR}\nName: ${guestName}`
  );

  return (
    <div
      id="booking-engine"
      className={`rounded-3xl border border-[#C0AB6F]/30 bg-[#09232C] text-slate-100 shadow-2xl overflow-hidden ${className}`}
    >
      {/* ─── ENGINE HEADER (Brand Navy & Gold) ─── */}
      <div className="relative px-5 sm:px-6 py-4 bg-gradient-to-r from-[#05161D] via-[#0D3A48] to-[#09232C] border-b border-[#C0AB6F]/30 text-white pr-16 sm:pr-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                Live Instant Booking Engine
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Qatar Tourism Licensed #QTA-QA-8819
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Reserve Your Qatar Experience</span>
            </h3>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {[
              { num: 1, label: 'Date & Slot' },
              { num: 2, label: 'Guests & Addons' },
              { num: 3, label: 'Contact' },
            ].map((st) => (
              <div
                key={st.num}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border transition-all ${
                  currentStep === st.num
                    ? 'bg-[#C0AB6F] text-[#05161D] border-[#D4AF37] font-bold shadow-md'
                    : currentStep > st.num
                    ? 'bg-[#0D3A48] text-[#E7CF8A] border-[#C0AB6F]/30'
                    : 'bg-[#05161D]/60 text-slate-400 border-white/10'
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold bg-black/20">
                  {currentStep > st.num ? '✓' : st.num}
                </span>
                <span className="hidden sm:inline">{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── STEP 1: EXPERIENCE, INTERACTIVE CALENDAR & TIME SLOT ─── */}
      {currentStep === 1 && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* 1. Dedicated Selected Experience Showcase (Shows ONLY what customer selected) */}
          <div className="rounded-2xl border border-[#C0AB6F]/40 bg-gradient-to-r from-[#05161D] via-[#09232C] to-[#0D3A48] p-4 sm:p-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative shrink-0 w-full sm:w-36 h-28 rounded-xl overflow-hidden border border-[#C0AB6F]/30 shadow-md">
                {imgSrc(selectedExperience.image) && (
                  <img
                    src={imgSrc(selectedExperience.image)}
                    alt={selectedExperience.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {selectedExperience.badge && (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#05161D]/90 text-[#E7CF8A] border border-[#C0AB6F]/40">
                    {selectedExperience.badge}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/40">
                    Selected For Booking • {selectedExperience.category}
                  </span>
                  {selectedExperience.duration && (
                    <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">
                      • {selectedExperience.duration}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  {selectedExperience.title}
                </h3>
                {selectedExperience.titleAr && (
                  <p className="text-xs font-arabic text-[#C0AB6F] opacity-90 text-left">
                    {selectedExperience.titleAr}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-xs text-slate-400">Starting Rate:</span>
                    <span className="text-lg font-black text-[#E7CF8A]">{formatPrice(selectedExperience.priceQAR)}</span>
                    {selectedCurrency.code !== 'QAR' && (
                      <span className="text-[11px] text-slate-400">
                        (≈ QAR {selectedExperience.priceQAR.toLocaleString()})
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">/ {selectedExperience.rateType || 'person'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowItemPicker(!showItemPicker)}
                    className="text-xs text-[#C0AB6F] hover:text-[#E7CF8A] font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showItemPicker ? 'Close Selection' : 'Change Service / Package'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showItemPicker ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Collapsible Change Picker */}
            {showItemPicker && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <div className="text-[11px] font-bold text-[#E7CF8A] uppercase tracking-wider">
                  Select another package or vehicle:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {getAllExperienceItems().map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedTourId(item.id);
                        setShowItemPicker(false);
                      }}
                      className={`p-2 rounded-xl text-left flex items-center gap-2.5 border transition cursor-pointer ${
                        selectedExperience.id === item.id
                          ? 'bg-[#0D3A48] border-[#D4AF37] text-white ring-1 ring-[#D4AF37]'
                          : 'bg-[#05161D]/80 border-white/10 hover:border-[#C0AB6F]/40 text-slate-300'
                      }`}
                    >
                      <img src={imgSrc(item.image)} alt={item.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate text-white">{item.title}</div>
                        <div className="text-[10px] text-[#E7CF8A] font-semibold">
                          QAR {item.priceQAR} • {item.category}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Interactive Monthly Calendar */}
          <div className="bg-[#05161D]/90 p-4 sm:p-5 rounded-2xl border border-[#C0AB6F]/25 shadow-xl w-full">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="text-sm sm:text-base font-black text-white tracking-wide">
                  {monthNames[visibleMonth]} {visibleYear}
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-[#0D3A48] hover:bg-[#14495A] text-slate-200 border border-[#C0AB6F]/30 transition cursor-pointer active:scale-95"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-[#0D3A48] hover:bg-[#14495A] text-slate-200 border border-[#C0AB6F]/30 transition cursor-pointer active:scale-95"
                  title="Next Month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Day of Week Header */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[10px] sm:text-xs font-bold text-[#E7CF8A] mb-2 uppercase tracking-wider py-1.5 bg-[#0D3A48]/50 rounded-xl border border-[#C0AB6F]/20">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-xs">
              {/* Blank days before 1st of month */}
              {[...Array(firstDayOfWeek)].map((_, i) => (
                <div key={`empty-${i}`} className="h-9 sm:h-11 opacity-0 pointer-events-none" />
              ))}

              {/* Actual Month Days */}
              {[...Array(daysInMonth)].map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${visibleYear}-${String(visibleMonth + 1).padStart(2, '0')}-${String(
                  dayNum
                ).padStart(2, '0')}`;
                const thisDateObj = new Date(visibleYear, visibleMonth, dayNum);
                const isPast =
                  thisDateObj.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
                const isSelected = selectedDate === dateStr;
                const isWeekend = thisDateObj.getDay() === 5 || thisDateObj.getDay() === 6; // Fri / Sat

                return (
                  <button
                    key={dayNum}
                    type="button"
                    disabled={isPast}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-9 sm:h-11 rounded-xl flex flex-col items-center justify-center p-0.5 transition-all cursor-pointer ${
                      isPast
                        ? 'opacity-20 cursor-not-allowed text-slate-600 bg-transparent'
                        : isSelected
                        ? 'bg-[#D4AF37] text-[#05161D] font-black shadow-md shadow-[#D4AF37]/30 ring-2 ring-[#E7CF8A] scale-[1.03] z-10'
                        : 'bg-[#0D3A48]/50 hover:bg-[#0D3A48] text-slate-200 border border-white/5 hover:border-[#C0AB6F]/50'
                    }`}
                  >
                    <span className="text-xs font-bold leading-none">{dayNum}</span>

                    {/* Availability Dot */}
                    {!isPast && (
                      <span className="mt-1 flex items-center gap-0.5">
                        <span
                          className={`w-1 h-1 rounded-full ${
                            isSelected
                              ? 'bg-[#05161D]'
                              : isWeekend
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Weekend</span>
              </span>
              <span className="text-[#E7CF8A] font-mono">
                Date: <strong className="text-white">{selectedDate}</strong>
              </span>
            </div>
          </div>

          {/* 3. Select Departure Slot (Placed directly BELOW calendar) */}
          <div className="bg-[#05161D]/90 p-5 sm:p-6 rounded-3xl border border-[#C0AB6F]/25 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
                <h4 className="text-sm sm:text-base font-bold text-[#E7CF8A] uppercase tracking-wider">
                  Select Departure Slot
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Departing on: {selectedDate}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {[
                {
                  slot: '08:30 AM (Morning Safari)',
                  desc: 'Cool desert breeze & soft golden morning light',
                  badge: 'Cool Weather',
                },
                {
                  slot: '02:30 PM (Sunset Special)',
                  desc: 'Most popular! Spectacular golden hour & sunset dunes',
                  badge: 'Top Rated',
                },
                {
                  slot: '07:00 PM (Night Stargazing)',
                  desc: 'Bedouin Majlis bonfire, Arabian BBQ & night stars',
                  badge: 'Dinner Option',
                },
              ].map((s) => {
                const isSelected = selectedSlot.startsWith(s.slot.split(' ')[0]);
                return (
                  <button
                    key={s.slot}
                    type="button"
                    onClick={() => setSelectedSlot(s.slot)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#0D3A48] border-[#D4AF37] ring-2 ring-[#C0AB6F]/40 text-white shadow-lg shadow-[#D4AF37]/15'
                        : 'bg-[#05161D] border-white/10 hover:border-[#C0AB6F]/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C0AB6F]/20 text-[#E7CF8A] border border-[#C0AB6F]/30 font-semibold inline-block mb-1.5">
                          {s.badge}
                        </span>
                        <div className="text-xs sm:text-sm font-bold text-white leading-tight">
                          {s.slot}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-[#05161D]'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && '✓'}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed border-t border-white/5 pt-2">
                      {s.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Inclusions & Continue CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#05161D]/90 border border-[#C0AB6F]/25 shadow-xl">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#E7CF8A]">
                  Experience Inclusions:
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Guaranteed
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                {(selectedTour.includes || [
                  'Curbside VIP Reception',
                  'Licensed English/Arabic Driver',
                  'Bottled Mineral Water',
                ]).slice(0, 3).map((inc: string, i: number) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    <span>{inc}</span>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C0AB6F] to-[#A79257] hover:from-[#E7CF8A] hover:to-[#C0AB6F] text-[#05161D] font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#D4AF37]/25 active:scale-95 transition cursor-pointer shrink-0"
            >
              <span>Continue: Select Guests & Add-ons</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: GUESTS, PRIVATE VEHICLE & ADD-ONS ─── */}
      {currentStep === 2 && (
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-[#E7CF8A] uppercase tracking-wider">
                Step 2 of 3
              </span>
              <h4 className="text-xl font-black text-white">Party Size & VIP Upgrades</h4>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Change Date / Tour</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guest Counters */}
            <div className="space-y-4 bg-[#05161D]/80 p-5 rounded-3xl border border-[#C0AB6F]/25">
              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]" />
                <span>Traveler Count</span>
              </h5>

              {/* Adults Counter */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0D3A48]/50 border border-white/5">
                <div>
                  <div className="font-bold text-sm text-white">Adults (Age 12+)</div>
                  <div className="text-xs text-[#E7CF8A]">QAR {adultPrice} / person</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults((a) => Math.max(1, a - 1))}
                    className="w-8 h-8 rounded-xl bg-[#05161D] text-white border border-white/20 font-bold hover:bg-[#C0AB6F] hover:text-[#05161D] transition"
                  >
                    -
                  </button>
                  <span className="text-base font-black w-6 text-center text-white">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults((a) => a + 1)}
                    className="w-8 h-8 rounded-xl bg-[#05161D] text-white border border-white/20 font-bold hover:bg-[#C0AB6F] hover:text-[#05161D] transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0D3A48]/50 border border-white/5">
                <div>
                  <div className="font-bold text-sm text-white">Children (Age 3-11)</div>
                  <div className="text-xs text-[#E7CF8A]">QAR {childPrice} (40% OFF)</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren((c) => Math.max(0, c - 1))}
                    className="w-8 h-8 rounded-xl bg-[#05161D] text-white border border-white/20 font-bold hover:bg-[#C0AB6F] hover:text-[#05161D] transition"
                  >
                    -
                  </button>
                  <span className="text-base font-black w-6 text-center text-white">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren((c) => c + 1)}
                    className="w-8 h-8 rounded-xl bg-[#05161D] text-white border border-white/20 font-bold hover:bg-[#C0AB6F] hover:text-[#05161D] transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Private Vehicle Toggle */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0D3A48] border border-[#C0AB6F]/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrivateVehicle}
                  onChange={(e) => setIsPrivateVehicle(e.target.checked)}
                  className="rounded border-[#C0AB6F] text-[#D4AF37] focus:ring-0 mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white flex items-center gap-1.5">
                      <Car className="w-4 h-4 text-[#D4AF37]" />
                      <span>Upgrade to Private Vehicle / VIP Land Cruiser</span>
                    </span>
                    <span className="text-xs font-black text-[#E7CF8A]">+QAR 350</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    No other passengers in your 4x4. Dedicated safari marshal exclusively for your family/group.
                  </p>
                </div>
              </label>
            </div>

            {/* Experience Add-ons */}
            <div className="space-y-3 bg-[#05161D]/80 p-5 rounded-3xl border border-[#C0AB6F]/25">
              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Optional Arabian Add-ons</span>
              </h5>

              {[
                {
                  id: 'camelTrek',
                  name: 'Extended Camel Safari & Photo Stop',
                  price: 60,
                  desc: 'Ride through towering dunes on purebred Arabian camels (+QAR 60/pax)',
                },
                {
                  id: 'falconryPhoto',
                  name: 'Royal Falcon Hand Photo Experience',
                  price: 45,
                  desc: 'Hold a trained hunting falcon with Arabian traditional headdress (+QAR 45/pax)',
                },
                {
                  id: 'bbqDinner',
                  name: 'Bedouin Majlis Live BBQ Dinner',
                  price: 120,
                  desc: 'Freshly grilled lamb kebabs, shish taouk, hummus, salads & soft drinks (+QAR 120/pax)',
                },
              ].map((addon) => {
                const checked = addons[addon.id];
                return (
                  <label
                    key={addon.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      checked
                        ? 'bg-[#0D3A48] border-[#D4AF37]'
                        : 'bg-[#0D3A48]/30 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setAddons((prev) => ({ ...prev, [addon.id]: e.target.checked }))
                      }
                      className="rounded border-[#C0AB6F] text-[#D4AF37] focus:ring-0 mt-1 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{addon.name}</span>
                        <span className="text-[#E7CF8A] font-mono">+{formatPrice(addon.price)}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{addon.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Pricing Total Summary bar */}
          <div className="p-4 rounded-2xl bg-[#0D3A48] border border-[#C0AB6F]/40 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold block">
                Total Price ({selectedCurrency.code})
              </span>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl font-black text-[#E7CF8A]">{formatPrice(totalQAR)}</span>
                {selectedCurrency.code !== 'QAR' && (
                  <span className="text-xs text-slate-300 font-mono">
                    (≈ QAR {totalQAR.toLocaleString()})
                  </span>
                )}
                <span className="text-xs text-slate-300 font-mono">
                  ({adults} Adults{children > 0 ? `, ${children} Children` : ''} on {selectedDate})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-2.5 px-4 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-semibold text-slate-200 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] font-black text-xs shadow-md shadow-[#D4AF37]/30 hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                Continue to Lead Guest Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 3: LEAD GUEST DETAILS & PAYMENT METHOD ─── */}
      {currentStep === 3 && (
        <form onSubmit={handleFinalSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-[#E7CF8A] uppercase tracking-wider">
                Step 3 of 3
              </span>
              <h4 className="text-xl font-black text-white">Lead Traveler & Pickup Location</h4>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Party Size</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#E7CF8A] mb-1">
                Full Name (Lead Passenger) *
              </label>
              <input
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Marcus Aurelius"
                className="w-full bg-[#05161D] border border-[#C0AB6F]/30 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E7CF8A] mb-1">
                WhatsApp / Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+974 5555 7164"
                className="w-full bg-[#05161D] border border-[#C0AB6F]/30 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E7CF8A] mb-1">
                Email Address for Official Voucher *
              </label>
              <input
                type="email"
                required
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="passenger@domain.com"
                className="w-full bg-[#05161D] border border-[#C0AB6F]/30 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#E7CF8A] mb-1">
                Flight Number (For Airport Arrival / Transit)
              </label>
              <div className="relative">
                <Plane className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="e.g. QR 008 or BA 123"
                  className="w-full bg-[#05161D] border border-[#C0AB6F]/30 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white font-mono outline-none uppercase"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#E7CF8A] mb-1">
              Pickup Location in Doha *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Hamad Int'l Airport (HIA) / Hotel Name / Souq Waqif"
                className="w-full bg-[#05161D] border border-[#C0AB6F]/30 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#E7CF8A] mb-1">
              Special Requests (Child Seats, Dietary, Wheelchair)
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Any special requests or instructions for your driver / guide..."
              className="w-full bg-[#05161D] border border-[#C0AB6F]/30 focus:border-[#D4AF37] rounded-xl p-3 text-xs text-white outline-none"
            />
          </div>

          {/* Payment Guarantee Notice */}
          <div className="p-4 rounded-2xl bg-[#05161D] border border-[#C0AB6F]/40 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white block">
                Guaranteed Official Booking & Free Cancellation
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                You can pay online or upon departure. Free cancellation up to 24 hours before your trip. Flight delays are tracked in real-time.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">
                Total Payable ({selectedCurrency.code})
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#E7CF8A]">{formatPrice(totalQAR)}</span>
                {selectedCurrency.code !== 'QAR' && (
                  <span className="text-xs text-slate-400 font-mono">
                    (≈ QAR {totalQAR.toLocaleString()})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-3 px-5 rounded-xl border border-white/20 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C0AB6F] to-[#A79257] hover:brightness-110 text-[#05161D] font-black text-sm flex items-center gap-2 shadow-xl shadow-[#D4AF37]/30 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Generating Official Voucher...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Generate Voucher</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── STEP 4: SUCCESS CONFIRMATION ─── */}
      {currentStep === 4 && (
        <div className="p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-xl shadow-amber-500/10">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Booking Lead Received • Pending Operations Approval
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Marhaba, {guestName}! Your Booking Lead is Registered.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Your online booking request <strong className="text-[#E7CF8A] font-mono">{bookingRef}</strong> has been transmitted to our Operations Desk. Our dispatch team is reviewing your schedule and will approve your trip and activate your official digital voucher shortly.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#05161D] border border-[#C0AB6F]/30 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">Approval Status:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 animate-spin" />
                <span>Pending Admin Approval (قيد الموافقة)</span>
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">Experience:</span>
              <span className="text-white font-bold">{selectedTour.title}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">Date & Slot:</span>
              <span className="text-[#E7CF8A] font-bold">
                {selectedDate} ({selectedSlot.split(' ')[0]})
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">Party:</span>
              <span className="text-white">
                {adults} Adults {children > 0 ? `, ${children} Children` : ''}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-slate-400">Pickup:</span>
              <span className="text-white truncate max-w-[200px]">{pickupLocation}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400 font-bold">Total Amount:</span>
              <span className="text-base font-black text-[#D4AF37]">QAR {totalQAR}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <a
              href={`https://wa.me/97455557164?text=${whatsappConfirmLink}`}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Connect with Driver on WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setCurrentStep(1);
                setGuestName('');
              }}
              className="py-3 px-6 rounded-xl border border-[#C0AB6F]/40 text-[#E7CF8A] hover:bg-[#C0AB6F]/10 font-bold text-xs transition"
            >
              Book Another Tour
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
