import React, { useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { InteractiveCalendarBookingEngine } from './InteractiveCalendarBookingEngine';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTourId?: string;
  onBookingSuccess?: (details: any) => void;
}

export const BookingDrawer: React.FC<BookingDrawerProps> = ({
  isOpen,
  onClose,
  preselectedTourId,
  onBookingSuccess,
}) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] transition-visibility duration-300 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
    >
      {/* ─── BACKDROP OVERLAY ─── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-[#05161D]/80 backdrop-blur-md transition-opacity duration-300 z-[100] ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ─── RIGHT-ALIGNED SLIDING DRAWER ─── */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-3xl lg:max-w-4xl bg-[#09232C] text-slate-100 shadow-[0_0_80px_rgba(0,0,0,0.85)] border-l border-[#C0AB6F]/40 flex flex-col z-[101] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Floating Quick Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-[102] p-2.5 rounded-full border border-[#C0AB6F]/40 bg-[#05161D]/90 hover:bg-[#D4AF37] text-slate-300 hover:text-[#05161D] backdrop-blur-md transition-all shadow-xl active:scale-95 cursor-pointer group"
          title="Close booking drawer (Esc)"
        >
          <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-200" />
        </button>

        {/* Drawer Scrollable Content (lifted higher for seamless luxury view) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 pt-3 sm:pt-4">
          <InteractiveCalendarBookingEngine
            key={preselectedTourId || 'default-engine'}
            initialTourId={preselectedTourId}
            onBookingSuccess={(details) => {
              if (onBookingSuccess) onBookingSuccess(details);
            }}
          />
        </div>

        {/* Drawer Footer Notice */}
        <div className="px-6 py-3 bg-[#05161D] border-t border-[#C0AB6F]/20 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 text-[#E7CF8A]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Directly synchronized with Central Operations Dashboard</span>
          </span>
          <span className="font-mono text-[10px]">Instant Confirmation</span>
        </div>
      </div>
    </div>
  );
};
