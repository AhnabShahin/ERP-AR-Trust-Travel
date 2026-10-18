import React, { useState } from 'react';
import { AR_TRUST_LOGO_URL } from '../../types';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'full' | 'mark-only';
  tone?: 'gold' | 'auto' | 'dark';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'full',
  tone = 'gold',
}) => {
  const [imageError, setImageError] = useState(false);

  // Height mappings
  const heightClasses = {
    sm: 'h-7 sm:h-8',
    md: 'h-8 sm:h-10 md:h-11',
    lg: 'h-11 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  const maxWidthClasses = {
    sm: 'max-w-[125px] sm:max-w-[150px]',
    md: 'max-w-[135px] sm:max-w-[180px] md:max-w-[210px]',
    lg: 'max-w-[190px] sm:max-w-[240px]',
    xl: 'max-w-[250px] sm:max-w-[300px]',
  };

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-3 select-none ${className}`}>
      {!imageError ? (
        <div className="relative flex items-center justify-center p-1 sm:p-1.5 rounded-xl bg-white dark:bg-white/95 border border-slate-200/80 dark:border-slate-300 shadow-xs shrink-0 overflow-hidden">
          <img
            src={AR_TRUST_LOGO_URL}
            alt="AR Trust Travel & Tourism Logo"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className={`${heightClasses[size]} w-auto object-contain ${maxWidthClasses[size]} transition-transform`}
          />
        </div>
      ) : (
        /* Handcrafted Resilient SVG Replica matching image.png */
        <div className="flex items-center gap-2 shrink-0">
          <svg
            className={`${heightClasses[size]} w-auto aspect-[16/9] ${maxWidthClasses[size]}`}
            viewBox="0 0 240 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Navy 'A' shape */}
            <path
              d="M 25,100 L 68,15 L 94,15 L 115,58 L 90,64 L 78,42 L 56,86 L 82,86 L 75,100 Z"
              fill="#0F172A"
              className="dark:fill-slate-100"
            />
            {/* Gold 'R' shape */}
            <path
              d="M 108,18 L 160,18 C 182,18 198,28 198,46 C 198,60 186,70 170,73 L 198,100 L 172,100 L 148,76 L 128,76 L 128,100 L 108,100 Z M 128,34 L 128,60 L 158,60 C 168,60 176,55 176,47 C 176,39 168,34 158,34 Z"
              fill="#D4AF37"
            />
            {/* Contrail ascending swoosh */}
            <path
              d="M 40,88 Q 120,65 210,22"
              stroke="#D4AF37"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M 50,86 Q 130,62 205,24"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              className="dark:stroke-slate-900"
            />
            {/* Jet Silhouette */}
            <g transform="translate(208, 16) rotate(-28) scale(0.65)">
              <path
                d="M 0,-15 L 4,-5 L 20,4 L 20,8 L 4,4 L 3,16 L 8,20 L 8,23 L 0,21 L -8,23 L -8,20 L -3,16 L -4,4 L -20,8 L -20,4 L -4,-5 Z"
                fill="#0F172A"
                className="dark:fill-slate-100"
              />
            </g>
          </svg>
        </div>
      )}

      {variant === 'full' && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black text-sm sm:text-base tracking-tight uppercase font-sans ${
                tone === 'auto'
                  ? 'text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-[#E7CF8A] dark:to-[#D4AF37]'
                  : 'text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E7CF8A] to-[#D4AF37] drop-shadow-xs'
              }`}
            >
              AR TRUST
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                tone === 'auto'
                  ? 'text-amber-800 dark:text-[#E7CF8A] bg-amber-100/80 dark:bg-[#D4AF37]/20 border-amber-300 dark:border-[#D4AF37]/40'
                  : 'text-[#E7CF8A] bg-[#D4AF37]/20 border-[#D4AF37]/50 shadow-xs'
              }`}
            >
              QATAR
            </span>
          </div>

          <span
            className={`text-[11px] sm:text-xs font-black tracking-wider uppercase ${
              tone === 'auto'
                ? 'text-[#0D3A48] dark:text-[#E7CF8A]'
                : 'text-[#E7CF8A] drop-shadow-xs'
            }`}
          >
            TRAVEL & TOURISM
          </span>

          {showSubtitle && (
            <span
              className={`text-[9px] italic font-serif tracking-wide truncate ${
                tone === 'auto'
                  ? 'text-[#88743F] dark:text-[#C0AB6F]'
                  : 'text-[#C0AB6F]'
              }`}
            >
              Journeys, Explorations, & Adventures
            </span>
          )}
        </div>
      )}
    </div>
  );
};
