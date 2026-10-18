import React from 'react';

interface CountryFlagProps {
  countryCode: string; // 2-letter ISO code or currency/lang code (e.g. 'gb', 'de', 'qa', 'us', 'eu', 'sa', 'ae', 'kw')
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  className = '',
  size = 'md',
}) => {
  const code = (countryCode || '').toLowerCase().trim();

  // Size dimensions
  const sizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-5 h-3.5',
    lg: 'w-6 h-4',
  };

  const baseClass = `inline-block shrink-0 rounded-xs overflow-hidden shadow-xs border border-white/20 ${sizeClasses[size]} ${className}`;

  switch (code) {
    // 🇬🇧 Great Britain / UK / English
    case 'gb':
    case 'uk':
    case 'en':
    case 'gbp':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <clipPath id="gb-clip">
            <rect width="60" height="36" rx="2" />
          </clipPath>
          <g clipPath="url(#gb-clip)">
            <rect width="60" height="36" fill="#012169" />
            <path d="M0 0L60 36M60 0L0 36" stroke="#FFFFFF" strokeWidth="6" />
            <path d="M0 0L60 36M60 0L0 36" stroke="#C8102E" strokeWidth="3" />
            <path d="M30 0V36M0 18H60" stroke="#FFFFFF" strokeWidth="10" />
            <path d="M30 0V36M0 18H60" stroke="#C8102E" strokeWidth="6" />
          </g>
        </svg>
      );

    // 🇩🇪 Germany / Deutsch
    case 'de':
    case 'deu':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="12" fill="#000000" />
          <rect y="12" width="60" height="12" fill="#DD0000" />
          <rect y="24" width="60" height="12" fill="#FFCE00" />
        </svg>
      );

    // 🇫🇷 France / Français
    case 'fr':
    case 'fra':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="20" height="36" fill="#002395" />
          <rect x="20" width="20" height="36" fill="#FFFFFF" />
          <rect x="40" width="20" height="36" fill="#ED2939" />
        </svg>
      );

    // 🇮🇹 Italy / Italiano
    case 'it':
    case 'ita':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="20" height="36" fill="#009246" />
          <rect x="20" width="20" height="36" fill="#FFFFFF" />
          <rect x="40" width="20" height="36" fill="#CE2B37" />
        </svg>
      );

    // 🇪🇸 Spain / Español
    case 'es':
    case 'esp':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="9" fill="#AA151B" />
          <rect y="9" width="60" height="18" fill="#F1BF00" />
          <rect y="27" width="60" height="9" fill="#AA151B" />
          <circle cx="18" cy="18" r="4" fill="#AA151B" opacity="0.6" />
        </svg>
      );

    // 🇷🇺 Russia / Русский
    case 'ru':
    case 'rus':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="12" fill="#FFFFFF" />
          <rect y="12" width="60" height="12" fill="#0039A6" />
          <rect y="24" width="60" height="12" fill="#D52B1E" />
        </svg>
      );

    // 🇶🇦 Qatar / Qatari Riyal (QAR) - Official Maroon (#8D1B3D) with 9 serrated points
    case 'qa':
    case 'qar':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="36" fill="#8D1B3D" />
          <path
            d="M0 0 H20 L24 2 L20 4 L24 6 L20 8 L24 10 L20 12 L24 14 L20 16 L24 18 L20 20 L24 22 L20 24 L24 26 L20 28 L24 30 L20 32 L24 34 L20 36 H0 Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    // 🇺🇸 United States / US Dollar (USD)
    case 'us':
    case 'usa':
    case 'usd':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 13 Stripes */}
          {[...Array(7)].map((_, i) => (
            <rect key={i} y={(i * 36) / 7} width="60" height={36 / 13} fill="#B22234" />
          ))}
          {[...Array(6)].map((_, i) => (
            <rect key={i} y={((2 * i + 1) * 36) / 13} width="60" height={36 / 13} fill="#FFFFFF" />
          ))}
          {/* Blue Canton */}
          <rect width="25" height="19" fill="#3C3B6E" />
          {/* Star dots */}
          <circle cx="6" cy="5" r="1" fill="#FFFFFF" />
          <circle cx="12" cy="5" r="1" fill="#FFFFFF" />
          <circle cx="18" cy="5" r="1" fill="#FFFFFF" />
          <circle cx="9" cy="9.5" r="1" fill="#FFFFFF" />
          <circle cx="15" cy="9.5" r="1" fill="#FFFFFF" />
          <circle cx="6" cy="14" r="1" fill="#FFFFFF" />
          <circle cx="12" cy="14" r="1" fill="#FFFFFF" />
          <circle cx="18" cy="14" r="1" fill="#FFFFFF" />
        </svg>
      );

    // 🇪🇺 European Union / Euro (EUR)
    case 'eu':
    case 'eur':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="36" fill="#003399" />
          {/* Circle of 12 Stars */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const cx = 30 + 10 * Math.sin(angle);
            const cy = 18 - 10 * Math.cos(angle);
            return <circle key={i} cx={cx} cy={cy} r="1.3" fill="#FFCC00" />;
          })}
        </svg>
      );

    // 🇸🇦 Saudi Arabia / Saudi Riyal (SAR)
    case 'sa':
    case 'sau':
    case 'sar':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="36" fill="#006C35" />
          <rect x="18" y="24" width="24" height="2" fill="#FFFFFF" rx="1" />
          <path d="M22 23L16 25L22 27Z" fill="#FFFFFF" />
          <text x="30" y="17" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">
            لا إله إلا الله
          </text>
        </svg>
      );

    // 🇦🇪 United Arab Emirates / UAE Dirham (AED)
    case 'ae':
    case 'are':
    case 'aed':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="0" width="45" height="12" fill="#00732F" />
          <rect x="15" y="12" width="45" height="12" fill="#FFFFFF" />
          <rect x="15" y="24" width="45" height="12" fill="#000000" />
          <rect x="0" y="0" width="15" height="36" fill="#FF0000" />
        </svg>
      );

    // 🇰🇼 Kuwait / Kuwaiti Dinar (KWD)
    case 'kw':
    case 'kwt':
    case 'kwd':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="0" width="60" height="12" fill="#007A3D" />
          <rect y="12" width="60" height="12" fill="#FFFFFF" />
          <rect y="24" width="60" height="12" fill="#CE1126" />
          <polygon points="0,0 16,12 16,24 0,36" fill="#000000" />
        </svg>
      );

    // 🇴🇲 Oman / Omani Rial (OMR)
    case 'om':
    case 'omn':
    case 'omr':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="0" width="45" height="12" fill="#FFFFFF" />
          <rect x="15" y="12" width="45" height="12" fill="#DB161B" />
          <rect x="15" y="24" width="45" height="12" fill="#008000" />
          <rect x="0" y="0" width="15" height="36" fill="#DB161B" />
        </svg>
      );

    // 🇧🇭 Bahrain / Bahraini Dinar (BHD)
    case 'bh':
    case 'bhr':
    case 'bhd':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="36" fill="#CE1126" />
          <path
            d="M0 0 H15 L22 3.6 L15 7.2 L22 10.8 L15 14.4 L22 18 L15 21.6 L22 25.2 L15 28.8 L22 32.4 L15 36 H0 Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    // 🇮🇳 India / Indian Rupee (INR)
    case 'in':
    case 'ind':
    case 'inr':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="0" width="60" height="12" fill="#FF9933" />
          <rect y="12" width="60" height="12" fill="#FFFFFF" />
          <rect y="24" width="60" height="12" fill="#138808" />
          <circle cx="30" cy="18" r="4.5" stroke="#000080" strokeWidth="1" fill="none" />
          <circle cx="30" cy="18" r="1.5" fill="#000080" />
        </svg>
      );

    // 🇨🇭 Switzerland / Swiss Franc (CHF)
    case 'ch':
    case 'che':
    case 'chf':
      return (
        <svg className={baseClass} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="36" fill="#FF0000" />
          <rect x="26" y="8" width="8" height="20" fill="#FFFFFF" />
          <rect x="20" y="14" width="20" height="8" fill="#FFFFFF" />
        </svg>
      );

    // Default Currency / Global Badge
    default:
      return (
        <span className={`${baseClass} bg-[#0D3A48] text-[#E7CF8A] flex items-center justify-center text-[9px] font-black tracking-wider uppercase font-mono`}>
          {code.slice(0, 2).toUpperCase()}
        </span>
      );
  }
};
