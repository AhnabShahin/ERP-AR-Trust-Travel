import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  Search,
  Sun,
  Moon,
  Award,
  LogIn,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Compass,
  Globe,
  ChevronDown,
  Check,
  Coins,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { CountryFlag } from './CountryFlag';
import { useApp } from '../../context/AppContext';
import { getRoleDashboardSlug } from '../../utils/roleSlugs';
import {
  WEBSITE_LANGUAGES,
  WEBSITE_TRANSLATIONS,
  WebsiteLanguageCode,
} from '../../data/websiteTranslations';
import { useWebsiteLanguage } from '../../context/WebsiteLanguageContext';
import { useWebsiteCurrency } from '../../context/WebsiteCurrencyContext';

export type PublicPageSlug =
  | 'home'
  | 'tours'
  | 'fleet'
  | 'packages'
  | 'services'
  | 'why-us'
  | 'reviews'
  | 'contact'
  | 'search';

export interface WebsiteHeaderProps {
  currentSlug: PublicPageSlug;
  onNavigate: (slug: PublicPageSlug) => void;
  onOpenDrawer: (tourIdOrTitle?: string) => void;
  onNavigateToAuth: () => void;
  onOpenAuthDrawer?: (initialMode?: 'login' | 'signup') => void;
  isTransparentHero?: boolean;
  websiteLang?: WebsiteLanguageCode;
  onSelectWebsiteLang?: (lang: WebsiteLanguageCode) => void;
}

export const WebsiteHeader: React.FC<WebsiteHeaderProps> = ({
  currentSlug,
  onNavigate,
  onOpenDrawer,
  onNavigateToAuth,
  onOpenAuthDrawer,
  isTransparentHero = false,
  websiteLang,
  onSelectWebsiteLang,
}) => {
  const {
    theme,
    toggleTheme,
    isAuthenticated,
    currentUser,
    currentRole,
    roleConfig,
    logout,
  } = useApp();
  const { websiteLang: ctxLang, setWebsiteLang: ctxSetLang } = useWebsiteLanguage();
  const {
    selectedCurrencyCode,
    selectedCurrency,
    setSelectedCurrencyCode,
    availableCurrencies,
  } = useWebsiteCurrency();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  // Auth state lives in localStorage, so it's only known on the client. Gate
  // the auth-dependent UI behind `mounted` so SSR and the first client render
  // both show the logged-out state (no hydration mismatch); after mount it
  // reflects the real session.
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => setMounted(true), []);
  const showAuthed = mounted && isAuthenticated;

  const lastScrollY = React.useRef(0);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const currencyDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if page is scrolled beyond hero top
      setIsScrolled(currentScrollY > 20);

      // Always show header at or near top of page
      if (currentScrollY <= 80) {
        setShowHeader(true);
      } else {
        // Hide when scrolling DOWN by a noticeable delta
        if (currentScrollY > lastScrollY.current + 6) {
          setShowHeader(false);
        }
        // Reveal when scrolling UP by a noticeable delta
        else if (currentScrollY < lastScrollY.current - 6) {
          setShowHeader(true);
        }
      }

      lastScrollY.current = currentScrollY <= 0 ? 0 : currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep header visible if mobile menu or dropdowns are open
  const isHeaderVisible =
    showHeader || mobileMenuOpen || langDropdownOpen || currencyDropdownOpen;

  const activeLang: WebsiteLanguageCode = websiteLang || ctxLang;
  const t = WEBSITE_TRANSLATIONS[activeLang] || WEBSITE_TRANSLATIONS.en;
  const currentLangOption =
    WEBSITE_LANGUAGES.find((l) => l.code === activeLang) || WEBSITE_LANGUAGES[0];

  const handleSelectLanguage = (code: WebsiteLanguageCode) => {
    if (onSelectWebsiteLang) {
      onSelectWebsiteLang(code);
    }
    ctxSetLang(code);
    setLangDropdownOpen(false);
  };

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(event.target as Node)
      ) {
        setCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks: Array<{ slug: PublicPageSlug; label: string }> = [
    { slug: 'home', label: t.navHome },
    { slug: 'tours', label: t.navTours },
    { slug: 'fleet', label: t.navFleet },
    { slug: 'packages', label: t.navPackages },
    { slug: 'services', label: t.navServices },
    { slug: 'why-us', label: t.navWhyUs },
    { slug: 'reviews', label: t.navReviews },
    { slug: 'contact', label: t.navContact },
  ];

  const handleNavClick = (slug: PublicPageSlug) => {
    onNavigate(slug);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ─── FIXED / STICKY HEADER (HIDES ON SCROLL DOWN, REVEALS ON SCROLL UP) ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${
          isHeaderVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        } ${
          isScrolled || !isTransparentHero
            ? 'bg-[#05161D]/95 backdrop-blur-xl border-b border-[#C0AB6F]/30 shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
            : 'bg-[#05161D]/35 backdrop-blur-md border-b border-[#C0AB6F]/15 shadow-lg'
        }`}
      >
        {/* ─── TOP ANNOUNCEMENT & CONTACT BAR ─── */}
        <div
          className={`transition-all duration-300 border-b border-[#C0AB6F]/15 relative z-[60] px-4 sm:px-8 lg:px-12 text-slate-300 text-xs ${
            isScrolled
              ? 'bg-[#05161D]/90 py-1.5'
              : 'bg-[#05161D]/75 backdrop-blur-md py-2'
          }`}
        >
          <div className="max-w-[1560px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center flex-wrap gap-4 text-[11px]">
            <a
              href="mailto:support@artrusttravel.com"
              className="flex items-center gap-1.5 hover:text-[#E7CF8A] transition"
            >
              <Mail className="w-3.5 h-3.5 text-[#C0AB6F]" />
              <span>support@artrusttravel.com</span>
            </a>
            <span className="text-[#C0AB6F]/30 hidden sm:inline">|</span>
            <a
              href="tel:+97455557164"
              className="flex items-center gap-1.5 hover:text-[#E7CF8A] transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#C0AB6F]" />
              <span>+974 5555 7164</span>
            </a>
            <span className="text-[#C0AB6F]/30 hidden md:inline">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Bin Dirham Plaza, Al Mansoura, Doha, Qatar</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto text-[11px]">
            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C0AB6F]/15 text-[#E7CF8A] border border-[#C0AB6F]/40 font-medium">
              <Award className="w-3 h-3 text-[#D4AF37]" />
              <span>{t.licenseBadge}</span>
            </span>

            {/* Website Traveler Language Dropdown (European & Popular Country Languages - Hidden on Mobile/Tablet top bar, placed in mobile menu) */}
            <div className="hidden md:block relative z-[70]" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCurrencyDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#C0AB6F]/40 bg-[#05161D]/90 hover:bg-[#0D3A48] text-[#E7CF8A] hover:text-[#D4AF37] transition cursor-pointer active:scale-95 shadow-sm text-[11px] font-bold"
                title="Select Traveler Language (UK & Europe)"
                aria-label="Select Language"
              >
                <CountryFlag countryCode={currentLangOption.code} size="sm" />
                <span className="font-mono tracking-wide">{currentLangOption.shortCode}</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#D4AF37] transition-transform duration-200 ${
                    langDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Language Dropdown Menu */}
              {langDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#05161D] border border-[#C0AB6F]/60 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl py-1 z-[80] animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-[#C0AB6F]/20 flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                    <span>Traveler Language</span>
                    <Globe className="w-3 h-3 text-[#D4AF37]" />
                  </div>
                  <div className="py-1">
                    {WEBSITE_LANGUAGES.map((lang) => {
                      const isSelected = activeLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            handleSelectLanguage(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#C0AB6F]/20 text-[#D4AF37] font-bold'
                              : 'text-slate-200 hover:bg-[#0D3A48] hover:text-[#E7CF8A]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <CountryFlag countryCode={lang.code} size="md" />
                            <div>
                              <div className="font-semibold text-xs flex items-center gap-1.5">
                                <span>{lang.nativeName}</span>
                                <span className="text-[10px] font-mono text-slate-400">({lang.shortCode})</span>
                              </div>
                              <div className="text-[10px] text-slate-400">{lang.region}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Website Currency Transfer Dropdown (Hidden on Mobile/Tablet top bar, placed in mobile menu) */}
            <div className="hidden md:block relative z-[70]" ref={currencyDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setCurrencyDropdownOpen(!currencyDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#C0AB6F]/40 bg-[#05161D]/90 hover:bg-[#0D3A48] text-[#E7CF8A] hover:text-[#D4AF37] transition cursor-pointer active:scale-95 shadow-sm text-[11px] font-bold"
                title="Select Currency (Synced with Dashboard Treasury)"
                aria-label="Select Currency"
              >
                <CountryFlag countryCode={selectedCurrency.code} size="sm" />
                <span className="font-mono tracking-wide">{selectedCurrency.code}</span>
                <span className="text-[10px] text-slate-400 font-sans">({selectedCurrency.symbol})</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#D4AF37] transition-transform duration-200 ${
                    currencyDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Currency Dropdown Menu */}
              {currencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-[#05161D] border border-[#C0AB6F]/60 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl py-1 z-[80] animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-[#C0AB6F]/20 flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                    <div className="flex items-center gap-1.5 text-[#E7CF8A]">
                      <Coins className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Currency Transfer</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live ERP Sync
                    </span>
                  </div>

                  <div className="py-1 max-h-72 overflow-y-auto">
                    {availableCurrencies.map((curr) => {
                      const isSelected = selectedCurrency.code === curr.code;
                      return (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => {
                            setSelectedCurrencyCode(curr.code);
                            setCurrencyDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#C0AB6F]/20 text-[#D4AF37] font-bold'
                              : 'text-slate-200 hover:bg-[#0D3A48] hover:text-[#E7CF8A]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <CountryFlag countryCode={curr.code} size="md" />
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-xs flex items-center gap-1.5">
                                <span>{curr.code}</span>
                                <span className="text-[#E7CF8A] font-bold">({curr.symbol})</span>
                                {curr.isPegged && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-[#D4AF37]/20 text-[#E7CF8A] border border-[#D4AF37]/30 font-mono">
                                    Pegged
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">{curr.name}</div>
                              <div className="text-[9px] text-[#C0AB6F] font-mono">
                                {curr.code === 'QAR' ? 'Base Sovereign Currency (1.00)' : `1 ${curr.code} = ${curr.rateToQAR} QAR`}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-3 py-1.5 bg-[#09232C]/80 border-t border-[#C0AB6F]/20 text-[9px] text-slate-400 flex items-center justify-between">
                    <span>Synchronized with Central Multi-Currency Vault</span>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle (Hidden on mobile/tablet top bar since it is placed inside the hamburger menu drawer) */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex items-center justify-center p-1.5 rounded-lg border border-[#C0AB6F]/30 hover:bg-[#0D3A48] text-slate-300 hover:text-white transition cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Top Header Auth Buttons: Dashboard & Logout if authenticated, else Sign In */}
            {showAuthed ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onNavigateToAuth}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-bold transition shadow-md shadow-[#D4AF37]/20 cursor-pointer active:scale-95"
                  title={`Open ${roleConfig?.title || 'Dashboard'} (${getRoleDashboardSlug(currentRole)})`}
                >
                  <LayoutDashboard className="w-3 h-3" />
                  <span>
                    {currentRole === 'customer'
                      ? t.myDashboard
                      : currentRole === 'vendor-partner'
                      ? t.partnerConsole
                      : t.dashboard}
                  </span>
                </button>

                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-white font-bold transition cursor-pointer active:scale-95"
                  title={`Logged in as ${currentUser?.name || 'Staff'}. Click to log out.`}
                >
                  <LogOut className="w-3 h-3 text-red-400" />
                  <span>{t.logout}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => (onOpenAuthDrawer ? onOpenAuthDrawer('login') : onNavigateToAuth())}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] hover:brightness-110 text-[#05161D] font-bold transition shadow-md shadow-[#D4AF37]/20 cursor-pointer active:scale-95"
              >
                <LogIn className="w-3 h-3" />
                <span>{t.signInStaff}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── MAIN NAVBAR ─── */}
      <div className={`transition-all duration-300 ${isScrolled ? 'py-2 sm:py-2.5' : 'py-2.5 sm:py-3.5'}`}>
        <div className="max-w-[1560px] mx-auto px-3 sm:px-8 lg:px-12 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo (Responsive sizing: compact on mobile to leave space for right-side buttons) */}
          <div
            className="cursor-pointer shrink-0 max-w-[125px] sm:max-w-[170px] md:max-w-none"
            onClick={() => handleNavClick('home')}
          >
            <div className="block sm:hidden">
              <BrandLogo size="sm" variant="full" />
            </div>
            <div className="hidden sm:block">
              <BrandLogo size="md" variant="full" />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-bold text-slate-200 tracking-wider uppercase">
            {navLinks.map((link) => {
              const isActive = currentSlug === link.slug;
              return (
                <button
                  key={link.slug}
                  onClick={() => handleNavClick(link.slug)}
                  className={`transition-all duration-200 py-1 relative cursor-pointer ${
                    isActive
                      ? 'text-[#D4AF37] font-black'
                      : 'hover:text-[#C0AB6F] text-slate-200'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] rounded-full shadow-[0_0_8px_#D4AF37]" />
                  )}
                </button>
              );
            })}

            {/* Explore Catalog Link */}
            <button
              onClick={() => handleNavClick('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                currentSlug === 'search'
                  ? 'bg-[#C0AB6F]/20 text-[#D4AF37] border-[#D4AF37]'
                  : 'bg-white/5 border-white/10 text-[#E7CF8A] hover:border-[#C0AB6F]/50 hover:bg-[#0D3A48]'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#C0AB6F]" />
              <span>{t.exploreCatalog}</span>
            </button>
          </nav>

          {/* Right Action CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => onOpenDrawer()}
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C0AB6F] to-[#A79257] hover:brightness-110 text-[#05161D] font-black text-[11px] sm:text-xs shadow-md shadow-[#D4AF37]/30 active:scale-95 transition cursor-pointer flex items-center gap-1 sm:gap-1.5 shrink-0"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#05161D]" />
              <span className="hidden xs:inline sm:inline">{t.bookByCalendar}</span>
              <span className="xs:hidden">Book</span>
            </button>

            {/* Mobile Hamburger Toggle (Always visible on mobile & tablet) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl border border-[#C0AB6F]/50 bg-[#05161D] text-[#D4AF37] hover:text-white hover:border-[#D4AF37] transition cursor-pointer shrink-0 flex items-center justify-center shadow-md active:scale-95"
              title="Toggle Menu"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#D4AF37]" /> : <Menu className="w-5 h-5 text-[#D4AF37]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu (Scrollable, full feature set with Currency & Language selectors) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#05161D] border-b border-[#C0AB6F]/30 px-4 sm:px-6 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-4 duration-200 max-h-[82vh] overflow-y-auto">
          {/* Mobile Language Selector Grid */}
          <div className="bg-[#0D3A48]/50 rounded-xl p-3 border border-[#C0AB6F]/30 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#E7CF8A]">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Traveler Language</span>
              </span>
              <span className="font-mono text-[10px] text-slate-300">{currentLangOption.nativeName}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {WEBSITE_LANGUAGES.map((lang) => {
                const isSelected = activeLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      handleSelectLanguage(lang.code);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#C0AB6F] text-[#05161D] shadow-sm'
                        : 'bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <CountryFlag countryCode={lang.code} size="sm" />
                    <span>{lang.shortCode}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Currency Transfer Selector Grid */}
          <div className="bg-[#0D3A48]/50 rounded-xl p-3 border border-[#C0AB6F]/30 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#E7CF8A]">
              <span className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Currency Transfer</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live ERP Synced
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {availableCurrencies.map((curr) => {
                const isSelected = selectedCurrency.code === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => {
                      setSelectedCurrencyCode(curr.code);
                    }}
                    className={`flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#C0AB6F] text-[#05161D] shadow-sm'
                        : 'bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <CountryFlag countryCode={curr.code} size="sm" />
                      <span className="font-mono">{curr.code}</span>
                    </div>
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-[#05161D]' : 'text-[#E7CF8A]'}`}>
                      {curr.symbol}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between items-center pt-1 border-t border-white/5">
              <span>Active: <span className="text-[#D4AF37] font-semibold">{selectedCurrency.name}</span></span>
              <span className="font-mono text-[#C0AB6F]">{selectedCurrency.code === 'QAR' ? 'Base QAR (1.00)' : `1 ${selectedCurrency.code} = ${selectedCurrency.rateToQAR} QAR`}</span>
            </div>
          </div>

          {/* Theme Display Bar */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Sun className="w-3.5 h-3.5 text-[#D4AF37]" />}
              <span>Theme: {theme === 'dark' ? 'Dark Oasis' : 'Light Mode'}</span>
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-2.5 py-1 rounded-lg border border-[#C0AB6F]/40 bg-[#05161D] text-[#E7CF8A] hover:text-[#D4AF37] font-bold text-[11px]"
            >
              Switch Theme
            </button>
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold uppercase tracking-wider">
            {navLinks.map((link) => (
              <button
                key={link.slug}
                onClick={() => handleNavClick(link.slug)}
                className={`text-left px-3 py-2.5 rounded-xl transition ${
                  currentSlug === link.slug
                    ? 'bg-[#C0AB6F] text-[#05161D] font-black shadow-md'
                    : 'bg-white/5 text-slate-200 hover:bg-[#0D3A48] hover:text-[#E7CF8A]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Explore Catalog Button */}
          <button
            onClick={() => handleNavClick('search')}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0D3A48] border border-[#C0AB6F]/40 text-[#E7CF8A] font-bold text-xs"
          >
            <Search className="w-4 h-4 text-[#C0AB6F]" />
            <span>{t.exploreCatalog}</span>
          </button>

          {/* Authentication Actions */}
          {showAuthed ? (
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <button
                onClick={() => {
                  onNavigateToAuth();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] font-bold text-xs"
              >
                <LayoutDashboard className="w-4 h-4 text-[#05161D]" />
                <span>{t.dashboard}</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 font-bold text-xs"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>{t.logout}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenAuthDrawer) {
                  onOpenAuthDrawer('login');
                } else {
                  onNavigateToAuth();
                }
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] font-bold text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>{t.signInStaff}</span>
            </button>
          )}
        </div>
      )}
      </header>

      {/* Spacer for non-transparent hero subpages so content starts below fixed header */}
      {!isTransparentHero && (
        <div className="h-[96px] sm:h-[102px] shrink-0" aria-hidden="true" />
      )}
    </>
  );
};
