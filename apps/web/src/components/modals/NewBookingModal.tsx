import React, { useState } from 'react';
import {
  X,
  Plane,
  Car,
  User,
  Phone,
  Mail,
  CreditCard,
  Banknote,
  DollarSign,
  CheckCircle2,
  Calendar,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Currency } from '../../types';

export const NewBookingModal: React.FC = () => {
  const {
    packages,
    closeModal,
    addBooking,
    drivers,
    flights,
    convertAmount,
    currency,
    currencies,
    language,
    t,
  } = useApp();

  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('+974 ');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [nationality, setNationality] = useState('United Kingdom');
  const [selectedFlight, setSelectedFlight] = useState(flights[0].flightNumber);
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || 'pkg-1');
  const [paxCount, setPaxCount] = useState(2);
  const [paymentCurrency, setPaymentCurrency] = useState<Currency>(currency);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'POS Card' | 'Payment Link' | 'Prepaid OTA'>('POS Card');
  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0].id);
  const [bookingDate, setBookingDate] = useState('2026-10-15');
  const [bookingTime, setBookingTime] = useState('14:30');
  const [notes, setNotes] = useState('Agent Desk Counter walk-in passenger');

  const selectedPkg = packages.find((p) => p.id === selectedPackageId) || packages[0] || {
    id: 'pkg-fallback',
    name: 'Desert Safari Tour',
    nameAr: 'رحلة سفاري',
    priceQAR: 480,
  };
  const selectedDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];
  const flightObj = flights.find((f) => f.flightNumber === selectedFlight) || flights[0];

  const totalQAR = selectedPkg.priceQAR * paxCount;
  const convertedTotal = convertAmount(totalQAR, paymentCurrency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName.trim()) return;

    const pnr = `ART-QA-${Math.floor(1000 + Math.random() * 9000)}`;

    addBooking({
      pnr,
      passengerName,
      passengerPhone,
      passengerEmail: passengerEmail || `${passengerName.toLowerCase().replace(/\s+/g, '.')}@traveler.com`,
      nationality,
      flightNumber: selectedFlight,
      arrivalAirport: 'Hamad Int’l Airport (DOH)',
      arrivalTime: flightObj.estimatedArrival,
      terminalGate: `Gate ${flightObj.gate} / Belt ${flightObj.carousel}`,
      pickupBay: 'Pickup Bay 3',
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      packageNameAr: selectedPkg.nameAr,
      paxCount,
      totalQAR,
      paymentCurrency,
      paymentMethod,
      driverId: selectedDriver.id,
      driverName: selectedDriver.name,
      driverVehicle: `${selectedDriver.vehicle} (${selectedDriver.plateNumber})`,
      driverPhone: selectedDriver.phone,
      qrStatus: 'checked-in',
      qrCodeUrl: `https://artrust.qa/voucher/${pnr}`,
      voucherSent: false,
      bookingDate,
      bookingTime,
      notes,
      source: 'Agent Desk',
    });

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Plane className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'إنشاء حجز مكتب وكيل / استلام وفود' : 'New Agent Desk Reservation & Chauffeur'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Agent Desk Station · Doha, Qatar
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Passenger Information */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>Passenger & Contact Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Full Name (as on Passport) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Captain James Vance"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  WhatsApp / Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+974 5500 0000"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none rtl:pl-3 rtl:pr-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Passenger Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
                  <input
                    type="email"
                    placeholder="passenger@airline.com"
                    value={passengerEmail}
                    onChange={(e) => setPassengerEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none rtl:pl-3 rtl:pr-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Nationality / Passport Origin
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Flight & Package Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-emerald-500" />
              <span>Arrival Flight & Package Selection</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Arriving Flight (Hamad DOH)
                </label>
                <select
                  value={selectedFlight}
                  onChange={(e) => setSelectedFlight(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-mono"
                >
                  {flights.map((f) => (
                    <option key={f.flightNumber} value={f.flightNumber}>
                      {f.flightNumber} ({f.originCity} - {f.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Number of Passengers (PAX)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPaxCount(num)}
                      className={`flex-1 py-1.5 rounded-lg border font-mono font-bold transition-all ${
                        paxCount === num
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tour / Service Booking Date *</span>
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Scheduled Pickup Time *</span>
                </label>
                <input
                  type="time"
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Select Tour / Chauffeur Service
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {packages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-slate-900 dark:text-white leading-tight">
                          {pkg.name}
                        </span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          QAR {pkg.priceQAR}
                        </span>
                      </div>
                      <span className="mt-1 inline-block text-[10px] text-slate-400 font-mono">
                        {pkg.duration} · {pkg.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chauffeur & Payment Settlement */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-500" />
              <span>Chauffeur Allocation & Multi-Currency Tender</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Assign Driver & Vehicle
                </label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.vehicle} ({d.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                  Tender Currency & Method
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={paymentCurrency}
                    onChange={(e) => setPaymentCurrency(e.target.value as Currency)}
                    className="w-28 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 font-mono font-bold text-slate-900 dark:text-white"
                  >
                    {(currencies.length ? currencies : [{ code: 'QAR', symbol: 'ر.ق' }]).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>

                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="POS Card">POS Card Terminal</option>
                    <option value="Cash">Cash Drawer</option>
                    <option value="Payment Link">Payment Link (WhatsApp)</option>
                    <option value="Prepaid OTA">Prepaid OTA Partner</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Price Preview Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500">Calculated Total Due:</span>
                <div className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {convertedTotal.formatted}
                </div>
              </div>

              <div className="text-right text-[11px] font-mono text-slate-400">
                <div>Base: QAR {totalQAR.toLocaleString()}</div>
                <div>Includes 0% VAT & Tourism Levy</div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-md shadow-emerald-600/20 active:scale-95"
            >
              Issue QR Boarding Pass & Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
