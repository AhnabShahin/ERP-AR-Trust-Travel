import React, { useState } from 'react';
import {
  X,
  Building2,
  BedDouble,
  DollarSign,
  Users,
  Check,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HotelRoomOption } from '../../types';

export const AddHotelRoomModal: React.FC = () => {
  const {
    modalData,
    closeModal,
    hotelVendors,
    addRoomOptionToVendor,
    addAuditLog,
    addNotification,
  } = useApp();

  const initialVendorId = modalData?.vendorId || hotelVendors[0]?.id || '';
  const [selectedVendorId, setSelectedVendorId] = useState<string>(initialVendorId);
  const [roomType, setRoomType] = useState<string>('');
  const [pricePerNightQAR, setPricePerNightQAR] = useState<number>(1450);
  const [maxPax, setMaxPax] = useState<number>(2);
  const [description, setDescription] = useState<string>('Luxury guest room with panoramic Arabian Gulf views, king-size bedding, and luxury bath amenities.');
  
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([
    'Complimentary Buffet Breakfast',
    'High-Speed Wi-Fi',
    'Hamad Airport Chauffeur Transfer',
    'Executive Club Lounge Access',
    'Private Balcony with Sea View',
    'Espresso Machine & Premium Tea',
    'Late Checkout (3:00 PM)',
  ]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Complimentary Buffet Breakfast',
    'High-Speed Wi-Fi',
    'Hamad Airport Chauffeur Transfer',
  ]);

  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId) {
      setFeedbackError('Please select a hotel property.');
      return;
    }
    if (!roomType.trim()) {
      setFeedbackError('Please enter a room type name.');
      return;
    }
    if (pricePerNightQAR <= 0) {
      setFeedbackError('Price per night must be greater than 0 QAR.');
      return;
    }

    const newRoom: HotelRoomOption = {
      roomType: roomType.trim(),
      ratePerNightQAR: pricePerNightQAR,
      maxPax,
      description: description.trim(),
    };

    const res = addRoomOptionToVendor(selectedVendorId, newRoom);
    if (res.success) {
      const vendor = hotelVendors.find((v) => v.id === selectedVendorId);
      addAuditLog(
        'Hotel Room Type Added',
        'POS',
        `Added new room "${newRoom.roomType}" (${newRoom.ratePerNightQAR} QAR/night) for ${vendor?.name || selectedVendorId}`
      );
      addNotification({
        title: 'New Hotel Room Added',
        titleAr: 'تم إضافة غرفة فندقية جديدة',
        message: `${newRoom.roomType} added to ${vendor?.name || 'hotel'} at ${newRoom.ratePerNightQAR} QAR/night.`,
        messageAr: `تمت إضافة ${newRoom.roomType} إلى الفندق.`,
        time: 'Just now',
        type: 'hotel',
        read: false,
      });

      setFeedbackSuccess(`Room "${newRoom.roomType}" successfully added to ${vendor?.name || 'hotel'}!`);
      setTimeout(() => {
        closeModal();
      }, 1200);
    } else {
      setFeedbackError(res.error || 'Failed to add hotel room.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-[#C0AB6F] text-[#05161D] shadow-md">
              <BedDouble className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Add Hotel Room & Inventory Option
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Configure room categories, nightly rates, and Qatar luxury amenities
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alerts */}
        {feedbackSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}
        {feedbackError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{feedbackError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Target Hotel Property */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              Select Hotel Property *
            </label>
            <select
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-bold outline-none focus:border-[#D4AF37]"
            >
              {hotelVendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} ({vendor.locationZone} · {vendor.starRating}★)
                </option>
              ))}
            </select>
          </div>

          {/* Room Name & Nightly Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Room Category / Type Name *
              </label>
              <input
                type="text"
                required
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                placeholder="e.g. Presidential Sea-View Suite"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Nightly Rate (QAR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">
                  QAR
                </span>
                <input
                  type="number"
                  required
                  min="100"
                  max="50000"
                  value={pricePerNightQAR}
                  onChange={(e) => setPricePerNightQAR(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pl-14 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Max Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Maximum Guest Capacity (Pax)
              </label>
              <select
                value={maxPax}
                onChange={(e) => setMaxPax(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]"
              >
                <option value={1}>1 Guest (Single)</option>
                <option value={2}>2 Guests (Double / King)</option>
                <option value={3}>3 Guests (Triple / Family)</option>
                <option value={4}>4 Guests (Executive Family)</option>
                <option value={6}>6 Guests (Presidential Villa)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Commission Structure
              </label>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Standard Hotel Partner Tier</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">15% Commission</span>
              </div>
            </div>
          </div>

          {/* Amenities & Inclusions */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2">
              Select Inclusions & Room Amenities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableAmenities.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 text-amber-900 dark:text-amber-200 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'border-slate-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-[11px] truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              Room Description & Special Features
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe view, bed setup, luxury bathroom amenities, balcony, etc..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-black shadow-md shadow-[#D4AF37]/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Publish Room Type</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
