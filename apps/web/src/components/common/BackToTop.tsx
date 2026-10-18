import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial position on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to Top"
      className={`fixed bottom-23 right-7 z-40 w-12 h-12 rounded-2xl bg-[#05161D]/90 hover:bg-[#0D3A48] border border-[#C0AB6F]/50 hover:border-[#D4AF37] text-[#E7CF8A] hover:text-white shadow-2xl shadow-black/50 hover:shadow-[#D4AF37]/30 backdrop-blur-md flex items-center justify-center transition-all duration-300 group cursor-pointer ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-4 pointer-events-none scale-90'
      }`}
    >
      <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-1 group-active:translate-y-0 text-[#E7CF8A] group-hover:text-[#D4AF37]" />
      <span className="sr-only">Back to Top</span>
    </button>
  );
};
