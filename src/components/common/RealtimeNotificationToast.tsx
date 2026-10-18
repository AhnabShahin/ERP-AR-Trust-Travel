import React, { useEffect } from 'react';
import {
  Bell,
  X,
  Plane,
  Building2,
  Compass,
  Car,
  Coins,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RealtimeNotificationToast: React.FC = () => {
  const { latestToastNotification, dismissToastNotification, language, setActiveTab } = useApp();

  useEffect(() => {
    if (!latestToastNotification) return;

    const timer = setTimeout(() => {
      dismissToastNotification();
    }, 5000);

    return () => clearTimeout(timer);
  }, [latestToastNotification, dismissToastNotification]);

  if (!latestToastNotification) return null;

  const notif = latestToastNotification;

  const getIcon = () => {
    switch (notif.type) {
      case 'flight':
        return <Plane className="w-4 h-4 text-sky-500" />;
      case 'hotel':
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case 'booking':
        return <Compass className="w-4 h-4 text-emerald-500" />;
      case 'driver':
        return <Car className="w-4 h-4 text-amber-500" />;
      case 'cash':
        return <Coins className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleActionClick = () => {
    if (notif.type === 'booking') {
      setActiveTab('bookings');
    } else if (notif.type === 'hotel') {
      setActiveTab('hotel-bookings');
    } else if (notif.type === 'cash') {
      setActiveTab('eod');
    } else if (notif.type === 'driver') {
      setActiveTab('dispatch');
    }
    dismissToastNotification();
  };

  return (
    <div className="fixed top-4 right-4 rtl:right-auto rtl:left-4 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300 select-none">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xl shadow-slate-900/20 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
              {getIcon()}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Live Real-Time Alert
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400">
              {notif.time || 'Just now'}
            </span>
            <button
              onClick={dismissToastNotification}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
            {language === 'ar' ? notif.titleAr : notif.title}
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            {language === 'ar' ? notif.messageAr : notif.message}
          </p>
        </div>

        {notif.actionLabel && (
          <div className="pt-1 flex justify-end">
            <button
              onClick={handleActionClick}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{notif.actionLabel}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
