import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Globe,
  Sun,
  Moon,
  Check,
  TrendingUp,
  X,
  ExternalLink,
  DollarSign,
  ShieldCheck,
  ChevronDown,
  PanelLeftOpen,
  PanelLeftClose,
  Plane,
  Building2,
  Compass,
  Coins,
  Car,
  CheckCheck,
  Trash2,
  Radio,
  KeyRound,
  LogOut,
  User,
  QrCode,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Currency, UserRole } from '../types';
import { imgSrc } from '../../lib/uploads';

export interface HeaderProps {
  onNavigateToHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateToHome }) => {
  const {
    currentRole,
    currentUser,
    logout,
    roleConfig,
    language,
    currency,
    setCurrency,
    theme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    currencies,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
    liveFeedEnabled,
    toggleLiveFeed,
    setActiveTab,
    openModal,
    sidebarOpen,
    toggleSidebar,
    t,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'BOOKINGS' | 'FLIGHTS' | 'FINANCE'>('ALL');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Currency options are driven by the live Currency CRUD list (QAR always
  // first as the base). Falls back to QAR before the list hydrates.
  const sortedCurrencies = [...currencies].sort((a, b) =>
    a.code === 'QAR' ? -1 : b.code === 'QAR' ? 1 : a.code.localeCompare(b.code)
  );
  const currencyOptions: Currency[] = sortedCurrencies.length
    ? sortedCurrencies.map((c) => c.code)
    : ['QAR'];
  // Non-base currencies with a positive QAR rate, for the FX peg ticker.
  const tickerCurrencies = sortedCurrencies.filter((c) => c.code !== 'QAR' && c.rateToQAR > 0);

  return (
    <header className="h-16 px-3 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between gap-2 sm:gap-3 sticky top-0 z-30 transition-colors select-none">
      {/* Zone 0: Left Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 flex items-center justify-center border border-slate-200/60 dark:border-slate-800"
        title={
          sidebarOpen
            ? language === 'ar'
              ? 'تصغير إلى لوحة أيقونات'
              : 'Collapse Sidebar to Icon Panel'
            : language === 'ar'
            ? 'توسيع القائمة الجانبية'
            : 'Expand Full Sidebar'
        }
        aria-label="Toggle Sidebar"
      >
        {sidebarOpen ? (
          <PanelLeftClose className="w-4.5 h-4.5" />
        ) : (
          <PanelLeftOpen className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
        )}
      </button>

      {/* Zone 1: Global Search & Context */}
      <div className="flex-1 min-w-0 max-w-sm relative">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all rtl:pl-8 rtl:pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Zone 2: Live FX Ticker (QAR, USD, EUR, GBP) */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="text-[11px] uppercase tracking-wide font-mono">QCB Peg:</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
          {tickerCurrencies.length === 0 ? (
            <span className="text-slate-400">QAR base · no FX pairs</span>
          ) : (
            tickerCurrencies.slice(0, 4).map((c, i) => (
              <React.Fragment key={c.code}>
                {i > 0 && <span className="text-slate-300 dark:text-slate-700">|</span>}
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">1 {c.code} =</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{c.rateToQAR} QAR</span>
                </div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* Zone 3: Role Switcher, Currency, Language, Theme, Notifications & New Booking CTA */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-blue-500/30 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/60 text-xs font-bold text-blue-800 dark:text-blue-300 transition-all cursor-pointer shadow-xs"
            title="User Account & Role Scope"
          >
            <img
              src={imgSrc(currentUser?.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'User'}
              className="w-6 h-6 rounded-lg object-cover border border-blue-300 dark:border-blue-700 shrink-0"
            />
            <div className="flex flex-col text-left rtl:text-right max-w-[120px] sm:max-w-[140px]">
              <span className="font-extrabold text-[11px] text-slate-900 dark:text-white truncate leading-tight">
                {currentUser?.name || roleConfig.title}
              </span>
              <span className="text-[9px] text-blue-600 dark:text-blue-400 font-mono truncate">
                @{currentUser?.username || 'user'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-blue-400 shrink-0" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95">
              {/* Profile Card Header */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 mb-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={imgSrc(currentUser?.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={currentUser?.name || 'User'}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                      {currentUser?.name}
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono block truncate">
                      ID: @{currentUser?.username} ({currentUser?.email})
                    </span>
                    <span className="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                      {currentUser?.role}
                    </span>
                  </div>
                </div>

                {/* My Account & Profile Button for ALL users */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('my-account');
                    setShowRoleDropdown(false);
                  }}
                  className="mt-2.5 w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-between gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
                >
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'حسابي وبياناتي وتأكيد البريد' : 'My Account & Profile'}</span>
                  </div>
                  {currentUser?.isEmailVerified ? (
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.5 rounded font-bold">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black animate-pulse">
                      Verify
                    </span>
                  )}
                </button>

                {/* Admin Accounts Link (admin & super-admin) */}
                {(currentRole === 'super-admin' || currentRole === 'admin') && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('accounts');
                      setShowRoleDropdown(false);
                    }}
                    className="mt-1.5 w-full py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إدارة حسابات الدخول وكلمات المرور' : 'Manage Account IDs & Passwords'}</span>
                  </button>
                )}
              </div>

              {/* Current Role — fixed per user, assigned on the account. No
                  runtime switching: one user has exactly one role. */}
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                <span>{language === 'ar' ? 'دورك الحالي:' : 'Your Role:'}</span>
              </div>

              <div className="px-2 pb-1">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">
                      {language === 'ar' ? roleConfig.titleAr : roleConfig.title}
                    </span>
                    <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {language === 'ar' ? roleConfig.scopeSummaryAr : roleConfig.scopeSummary}
                  </p>
                </div>
              </div>

              {/* Visit Public Website Link */}
              {onNavigateToHome && (
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onNavigateToHome();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer mb-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'عرض الموقع العام الرئيسي (/)' : 'Visit Public Website (/)'}</span>
                  </button>
                </div>
              )}

              {/* Logout button at bottom */}
              <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleDropdown(false);
                    logout();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تسجيل الخروج من المنظومة' : 'Sign Out / Lock Console'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Currency Switcher */}
        <div className="relative hidden xl:block">
          <button
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            title="Display Currency"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-mono">{currency}</span>
          </button>

          {showCurrencyDropdown && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-1.5 w-32 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-40">
              <div className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-700">
                Display Base
              </div>
              {currencyOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrency(c);
                    setShowCurrencyDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left rtl:text-right hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    currency === c
                      ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-mono">{c}</span>
                  {currency === c && <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title={theme === 'dark' ? 'Switch to Clean Light Mode' : 'Switch to Dark Slate Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Direct Link to Public Website */}
        {onNavigateToHome && (
          <button
            onClick={onNavigateToHome}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-teal-500/30 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100/60 text-xs font-semibold text-teal-800 dark:text-teal-300 transition-all cursor-pointer shadow-xs"
            title="Switch to Public Website (/)"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden md:inline">Website (/)</span>
          </button>
        )}

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors relative"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-88 sm:w-[420px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {language === 'ar' ? 'تنبيهات العمليات المباشرة' : 'Live Real-Time Alerts'}
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-md">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${liveFeedEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <button
                        onClick={toggleLiveFeed}
                        className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
                        title="Toggle automatic operational radar simulation"
                      >
                        {liveFeedEnabled ? 'Live Feed: ON' : 'Live Feed: PAUSED'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={markAllNotificationsRead}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={clearNotifications}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold cursor-pointer"
                        title="Clear all alerts"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center gap-1 text-[11px] overflow-x-auto">
                <button
                  onClick={() => setNotifFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                    notifFilter === 'ALL'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('BOOKINGS')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                    notifFilter === 'BOOKINGS'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  Bookings & Hotels
                </button>
                <button
                  onClick={() => setNotifFilter('FLIGHTS')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                    notifFilter === 'FLIGHTS'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  Flights & Fleet
                </button>
                <button
                  onClick={() => setNotifFilter('FINANCE')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                    notifFilter === 'FINANCE'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  Cash & Shift
                </button>
              </div>

              {/* Notification List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-84 overflow-y-auto">
                {notifications.filter((n) => {
                  if (notifFilter === 'BOOKINGS') return n.type === 'booking' || n.type === 'hotel';
                  if (notifFilter === 'FLIGHTS') return n.type === 'flight' || n.type === 'driver';
                  if (notifFilter === 'FINANCE') return n.type === 'cash';
                  return true;
                }).length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    <Bell className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-slate-400" />
                    <span>No notifications matching selected filter</span>
                  </div>
                ) : (
                  notifications
                    .filter((n) => {
                      if (notifFilter === 'BOOKINGS') return n.type === 'booking' || n.type === 'hotel';
                      if (notifFilter === 'FLIGHTS') return n.type === 'flight' || n.type === 'driver';
                      if (notifFilter === 'FINANCE') return n.type === 'cash';
                      return true;
                    })
                    .map((notif) => {
                      const getNotifIcon = () => {
                        switch (notif.type) {
                          case 'flight':
                            return <Plane className="w-3.5 h-3.5 text-sky-500" />;
                          case 'hotel':
                            return <Building2 className="w-3.5 h-3.5 text-purple-500" />;
                          case 'booking':
                            return <Compass className="w-3.5 h-3.5 text-emerald-500" />;
                          case 'driver':
                            return <Car className="w-3.5 h-3.5 text-amber-500" />;
                          case 'cash':
                            return <Coins className="w-3.5 h-3.5 text-emerald-500" />;
                          default:
                            return <Bell className="w-3.5 h-3.5 text-blue-500" />;
                        }
                      };

                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.type === 'booking') setActiveTab('bookings');
                            else if (notif.type === 'hotel') setActiveTab('hotel-bookings');
                            else if (notif.type === 'cash') setActiveTab('eod');
                            else if (notif.type === 'driver') setActiveTab('dispatch');
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-3 ${
                            !notif.read ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                            {getNotifIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                {language === 'ar' ? notif.titleAr : notif.title}
                              </h4>
                              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                {notif.time}
                              </span>
                            </div>
                            <p className="mt-0.5 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                              {language === 'ar' ? notif.messageAr : notif.message}
                            </p>
                            {notif.actionLabel && (
                              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                <span>{notif.actionLabel}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="shrink-0 p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-600 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title={language === 'ar' ? 'حذف التنبيه' : 'Delete notification'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action: Verify QR Voucher */}
        <button
          onClick={() => openModal('qr-verification')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 dark:bg-slate-800 hover:bg-[#0D3A48] text-[#E7CF8A] border border-[#C0AB6F]/40 hover:border-[#D4AF37] text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm shrink-0"
          title="Scan and verify Qatar digital vouchers & boarding passes"
        >
          <QrCode className="w-4 h-4 text-[#D4AF37]" />
          <span className="hidden xl:inline">Verify QR Voucher</span>
        </button>

        {/* Quick Action: + New Booking */}
        <button
          onClick={() => openModal('new-booking')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden lg:inline">{t('newBooking')}</span>
        </button>
      </div>
    </header>
  );
};
