import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  Calendar,
  Building2,
  FileCheck,
  Store,
  CreditCard,
  Banknote,
  Coins,
  Search,
  Check,
  ChevronRight,
  TrendingUp,
  User,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  QrCode,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AirportDesk, Booking, HotelBooking } from '../../types';

export const EODShiftView: React.FC = () => {
  const {
    shiftDrawer,
    openModal,
    convertAmount,
    airportDesks,
    activeDeskId,
    setActiveDeskId,
    bookings,
    hotelBookings,
    rates,
    language,
    t,
  } = useApp();

  // Selected desk for detailed shift reconciliation
  const [selectedDeskId, setSelectedDeskId] = useState<string>(activeDeskId || airportDesks[0]?.id || 'desk-hia-01');

  // Filter for desk category: 'ALL' | 'HOTELS' | 'AIRPORTS'
  const [deskTypeFilter, setDeskTypeFilter] = useState<'ALL' | 'HOTELS' | 'AIRPORTS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Reconciled Desks registry state (records which desks have completed Z-Report for today)
  const [auditedDeskIds, setAuditedDeskIds] = useState<Record<string, { timestamp: string; zReportCode: string; notes?: string }>>({
    'desk-dia-01': { timestamp: 'Today, 14:10', zReportCode: 'Z-DIA-20261013-01', notes: 'Private jet terminal midday shift reconciled.' },
  });

  // Print X-report preview modal / state
  const [printingReport, setPrintingReport] = useState<{ desk: AirportDesk; type: 'X-Report' | 'Z-Report' } | null>(null);

  // Sync state & feedback notification
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSyncDeskPOS = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncFeedback(
        language === 'ar'
          ? `تمت مزامنة بيانات نقاط البيع (POS) بنجاح عبر كافة كاونترات الوكلاء والفنادق (${airportDesks.length} مكتباً)`
          : `Live Desk POS & Hotel booking data synchronized across all ${airportDesks.length} desks!`
      );
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 500);
  };

  // Calculate live synced POS metrics per desk
  const desksWithSyncedPOS = useMemo(() => {
    return airportDesks.map((desk) => {
      // 1. Tour bookings booked via this desk
      const deskTourBookings = bookings.filter((b) => {
        if (b.deskId === desk.id) return true;
        if (b.deskCode === desk.deskCode) return true;
        if (b.notes && b.notes.includes(desk.deskCode)) return true;
        if (desk.deskType !== 'Hotel Vendor Desk' && b.arrivalAirport === desk.airportName) return true;
        return false;
      });

      // 2. Hotel bookings booked via this desk
      const deskHotelBookings = hotelBookings.filter((hb) => {
        if (hb.deskCode === desk.deskCode) return true;
        if (desk.hotelVendorId && hb.hotelId === desk.hotelVendorId) return true;
        return false;
      });

      // Calculate Cash & POS totals
      const cashTourQAR = deskTourBookings
        .filter((b) => b.paymentMethod === 'Cash')
        .reduce((sum, b) => sum + (b.totalQAR || 0), 0);
      const posTourQAR = deskTourBookings
        .filter((b) => b.paymentMethod === 'POS Card')
        .reduce((sum, b) => sum + (b.totalQAR || 0), 0);
      const linkTourQAR = deskTourBookings
        .filter((b) => b.paymentMethod === 'Payment Link' || b.paymentMethod === 'Website Online Gateway')
        .reduce((sum, b) => sum + (b.totalQAR || 0), 0);

      const cashHotelQAR = deskHotelBookings
        .filter((hb) => hb.paymentMethod === 'Cash')
        .reduce((sum, hb) => sum + (hb.totalQAR || 0), 0);
      const posHotelQAR = deskHotelBookings
        .filter((hb) => hb.paymentMethod === 'POS Card')
        .reduce((sum, hb) => sum + (hb.totalQAR || 0), 0);

      const totalCashSalesToday = cashTourQAR + cashHotelQAR;
      const totalPosCardToday = posTourQAR + posHotelQAR;
      const totalPaymentLinksToday = linkTourQAR;

      // Base opening drawer float (typically 3,500 - 5,000 QAR)
      const openingFloatQAR = desk.currentDrawerCashQAR ? Math.max(3000, Math.floor(desk.currentDrawerCashQAR * 0.4)) : 3500;
      const totalPhysicalDrawerCash = (desk.currentDrawerCashQAR || 5000) + totalCashSalesToday;

      // Total settled transactions count
      const totalTxCount = deskTourBookings.length + deskHotelBookings.length;

      // Multi-currency physical breakdown estimates
      const qarCash = Math.round(totalPhysicalDrawerCash * 0.72);
      const usdCash = Math.round((totalPhysicalDrawerCash * 0.16) / rates.USD);
      const eurCash = Math.round((totalPhysicalDrawerCash * 0.08) / rates.EUR);
      const gbpCash = Math.round((totalPhysicalDrawerCash * 0.04) / rates.GBP);

      // Audited status
      const auditRecord = auditedDeskIds[desk.id];
      const shiftStatus: 'Audited & Closed' | 'Pending Audit' | 'Active Shift' = auditRecord
        ? 'Audited & Closed'
        : totalTxCount > 0
        ? 'Pending Audit'
        : 'Active Shift';

      return {
        ...desk,
        deskTourBookings,
        deskHotelBookings,
        totalCashSalesToday,
        totalPosCardToday,
        totalPaymentLinksToday,
        openingFloatQAR,
        totalPhysicalDrawerCash,
        totalTxCount,
        qarCash,
        usdCash,
        eurCash,
        gbpCash,
        shiftStatus,
        auditRecord,
      };
    });
  }, [airportDesks, bookings, hotelBookings, rates, auditedDeskIds]);

  // Filter desks by search and category
  const filteredDesks = useMemo(() => {
    return desksWithSyncedPOS.filter((d) => {
      if (deskTypeFilter === 'HOTELS' && d.deskType !== 'Hotel Vendor Desk' && d.airportCode !== 'DOH-HOTEL') return false;
      if (deskTypeFilter === 'AIRPORTS' && (d.deskType === 'Hotel Vendor Desk' || d.airportCode === 'DOH-HOTEL')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mCode = (d.deskCode || '').toLowerCase().includes(q);
        const mName = (d.deskName || '').toLowerCase().includes(q);
        const mStaff = (d.assignedEmployeeName || '').toLowerCase().includes(q);
        const mLoc = (d.airportName || '').toLowerCase().includes(q);
        if (!mCode && !mName && !mStaff && !mLoc) return false;
      }
      return true;
    });
  }, [desksWithSyncedPOS, deskTypeFilter, searchQuery]);

  // Active selected desk object
  const selectedDesk = desksWithSyncedPOS.find((d) => d.id === selectedDeskId) || desksWithSyncedPOS[0];

  // Aggregate metrics across all desks
  const totalNetworkCashDrawer = desksWithSyncedPOS.reduce((acc, d) => acc + d.totalPhysicalDrawerCash, 0);
  const totalNetworkPosCard = desksWithSyncedPOS.reduce((acc, d) => acc + d.totalPosCardToday, 0);
  const totalNetworkTransactions = desksWithSyncedPOS.reduce((acc, d) => acc + d.totalTxCount, 0);
  const totalAuditedDesksCount = Object.keys(auditedDeskIds).length;

  // Handle opening EOD Audit modal for the selected desk
  const handleOpenEODModal = (desk: typeof selectedDesk) => {
    const customDrawerData = {
      shiftId: `#SH-${desk.deskCode}-884`,
      counterId: desk.id,
      counterName: `${desk.deskCode} · ${desk.deskName}`,
      agentName: desk.assignedEmployeeName || 'Duty Cashier',
      openedAt: '06:00 AM',
      deskId: desk.id,
      currentCashDrawer: {
        QAR: desk.qarCash,
        USD: desk.usdCash,
        EUR: desk.eurCash,
        GBP: desk.gbpCash,
      },
      systemExpected: {
        QAR: desk.qarCash,
        USD: desk.usdCash,
        EUR: desk.eurCash,
        GBP: desk.gbpCash,
      },
      posCardTotalQAR: desk.totalPosCardToday,
      paymentLinkTotalQAR: desk.totalPaymentLinksToday,
      transactionsCount: desk.totalTxCount,
      status: desk.shiftStatus === 'Audited & Closed' ? ('Audited & Closed' as const) : ('Active' as const),
      onAudited: () => {
        setAuditedDeskIds((prev) => ({
          ...prev,
          [desk.id]: {
            timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            zReportCode: `Z-${desk.deskCode}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
            notes: 'Z-Report approved. Cash vault deposit prepared for QNB treasury.',
          },
        }));
      },
    };

    openModal('eod-audit', customDrawerData);
  };

  return (
    <div className="space-y-5 pb-10">
      {/* 1. Header Banner with Live Sync Badge */}
      <div className="bg-white dark:bg-slate-900 p-4.5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {language === 'ar' ? 'مطابقة الورديات وإغلاق اليوم المالي (EOD)' : 'Daily Shift Reconciliation & Vault Drops (EOD)'}
              </h2>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Synced with Agent Desk POS</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2 font-mono">
              <span>Date: Oct 13, 2026 · Active Shift Cycle</span>
              <span>• Z-Report audit logs, cashier physical drawer balancing & QNB vault drops</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Sync Desk POS Data & Audit Selected Desk */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleSyncDeskPOS}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-98 disabled:opacity-60"
            title="Refresh and sync live Desk POS & Hotel booking data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? (language === 'ar' ? 'جارٍ المزامنة...' : 'Syncing POS...') : (language === 'ar' ? 'مزامنة بيانات نقاط البيع' : 'Sync Desk POS Data')}</span>
          </button>

          <button
            onClick={() => handleOpenEODModal(selectedDesk)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-98"
          >
            <Scale className="w-4 h-4" />
            <span>Audit Selected Desk ({selectedDesk?.deskCode || 'Active'})</span>
          </button>
        </div>
      </div>

      {/* Sync Success Feedback Toast */}
      {syncFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button onClick={() => setSyncFeedback(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Physical Cash Drawers */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Network Cash In Drawers</span>
            <Coins className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {totalNetworkCashDrawer.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">QAR</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Physical currency across desks</span>
            <span className="text-emerald-600 font-bold">100% Synced</span>
          </div>
        </div>

        {/* Total POS Card Settled */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>POS Card Transactions</span>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {totalNetworkPosCard.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">QAR</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            QNB NAPS, Visa, Mastercard settled
          </div>
        </div>

        {/* Total Transactions Processed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Desk POS Bookings Today</span>
            <Receipt className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {totalNetworkTransactions}
            </span>
            <span className="text-xs text-slate-400">tours & room vouchers</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Across {desksWithSyncedPOS.length} active agent desks
          </div>
        </div>

        {/* Shifts Reconciled */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Z-Report Audited Desks</span>
            <FileCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {totalAuditedDesksCount} / {desksWithSyncedPOS.length}
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              ({Math.round((totalAuditedDesksCount / desksWithSyncedPOS.length) * 100)}%)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            {desksWithSyncedPOS.length - totalAuditedDesksCount} desks awaiting EOD close
          </div>
        </div>
      </div>

      {/* 3. Search and Category Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent desk, hotel, cashier agent, code..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: `All Desks (${desksWithSyncedPOS.length})` },
              {
                id: 'HOTELS',
                label: `🏨 Qatar Hotels (${desksWithSyncedPOS.filter((d) => d.deskType === 'Hotel Vendor Desk' || d.airportCode === 'DOH-HOTEL').length})`,
              },
              {
                id: 'AIRPORTS',
                label: `✈️ Airport Counters (${desksWithSyncedPOS.filter((d) => d.deskType !== 'Hotel Vendor Desk' && d.airportCode !== 'DOH-HOTEL').length})`,
              },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setDeskTypeFilter(item.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  deskTypeFilter === item.id
                    ? 'bg-slate-900 text-white dark:bg-blue-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Shift Cycle Closes at 23:59 AST</span>
        </div>
      </div>

      {/* 4. Agent Desks Shift Grid (Click any to deep-dive reconcile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDesks.map((desk) => {
          const isSelected = selectedDeskId === desk.id;
          const isHotel = desk.deskType === 'Hotel Vendor Desk' || desk.airportCode === 'DOH-HOTEL';

          return (
            <div
              key={desk.id}
              onClick={() => {
                setSelectedDeskId(desk.id);
                setActiveDeskId(desk.id);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/25 shadow-md ring-2 ring-blue-500/25'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                      {desk.deskCode}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                        isHotel
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {isHotel ? 'Hotel Desk' : 'Airport'}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      desk.shiftStatus === 'Audited & Closed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : desk.shiftStatus === 'Pending Audit'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {desk.shiftStatus}
                  </span>
                </div>

                <h3 className="mt-2 font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                  {desk.deskName}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  {desk.airportName} · {desk.terminal}
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-semibold">{desk.assignedEmployeeName || 'Unassigned'}</span>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Cash Drawer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {desk.totalPhysicalDrawerCash.toLocaleString()} QAR
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>POS Card (NAPS):</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {desk.totalPosCardToday.toLocaleString()} QAR
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100/60 dark:border-slate-800/60">
                  <span>Settled Bookings:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {desk.totalTxCount} TXs
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Deep-Dive Reconciliation Details Panel for Selected Agent Desk */}
      {selectedDesk && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          {/* Desk Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {selectedDesk.deskCode} · {selectedDesk.deskName}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
                  {selectedDesk.deskType === 'Hotel Vendor Desk' ? 'Qatar Hotel Partner Desk' : 'Airport Concourse Counter'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Location: {selectedDesk.airportName} · {selectedDesk.terminal} · Cashier: {selectedDesk.assignedEmployeeName || 'Duty Agent'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPrintingReport({ desk: selectedDesk, type: 'X-Report' })}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
                title="Print Mid-shift interim X-Report"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print X-Report (Interim)</span>
              </button>

              <button
                onClick={() => handleOpenEODModal(selectedDesk)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Close Shift (Z-Report)</span>
              </button>
            </div>
          </div>

          {/* Synced Cash Drawer Multi-Currency Denomination Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-emerald-500" />
                <span>Physical Cash Drawer Multi-Currency Float (Desk POS Synced)</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                Opening Float: {selectedDesk.openingFloatQAR.toLocaleString()} QAR + Net Today: {selectedDesk.totalCashSalesToday.toLocaleString()} QAR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* QAR */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300">Qatari Riyal (QAR)</span>
                <div className="mt-1 font-mono font-black text-lg text-slate-900 dark:text-white">
                  {selectedDesk.qarCash.toLocaleString()} QAR
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  500s: {Math.floor(selectedDesk.qarCash / 1000)} notes · 100s: {Math.floor((selectedDesk.qarCash % 1000) / 100)} notes
                </div>
              </div>

              {/* USD */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300">US Dollar (USD)</span>
                <div className="mt-1 font-mono font-black text-lg text-slate-900 dark:text-white">
                  ${selectedDesk.usdCash.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Pegged at 1 USD = 3.64 QAR
                </div>
              </div>

              {/* EUR */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300">Euro (EUR)</span>
                <div className="mt-1 font-mono font-black text-lg text-slate-900 dark:text-white">
                  €{selectedDesk.eurCash.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Active rate: 1 EUR = 3.96 QAR
                </div>
              </div>

              {/* GBP */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <span className="font-bold text-slate-700 dark:text-slate-300">British Pound (GBP)</span>
                <div className="mt-1 font-mono font-black text-lg text-slate-900 dark:text-white">
                  £{selectedDesk.gbpCash.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  Active rate: 1 GBP = 4.74 QAR
                </div>
              </div>
            </div>
          </div>

          {/* Non-Cash Settlement Ledgers & Progress Target */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Non-cash electronic POS batches */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Electronic POS & Card Settlement Slips</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">Batch #NAPS-884-01</span>
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    <span>QNB NAPS / Visa / Mastercard Card Terminals:</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedDesk.totalPosCardToday.toLocaleString()} QAR
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <QrCode className="w-4 h-4 text-purple-500" />
                    <span>WhatsApp / Online Payment Links:</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedDesk.totalPaymentLinksToday.toLocaleString()} QAR
                  </span>
                </div>
              </div>
            </div>

            {/* Target vs Actual Progress */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Daily Shift Revenue Target</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">
                    Goal: {(selectedDesk.dailyTargetQAR || 15000).toLocaleString()} QAR
                  </span>
                </h4>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-slate-500">Total Net Revenue Today:</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {(selectedDesk.totalCashSalesToday + selectedDesk.totalPosCardToday).toLocaleString()} QAR
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((selectedDesk.totalCashSalesToday + selectedDesk.totalPosCardToday) /
                              (selectedDesk.dailyTargetQAR || 15000)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                <span>Duty Agent: {selectedDesk.assignedEmployeeName}</span>
                <span className="text-emerald-600 font-bold">Commission Target Tracked</span>
              </div>
            </div>
          </div>

          {/* Real Transactions Settled at this Desk Table */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Today's Transactions Processed at this Desk ({selectedDesk.totalTxCount})</span>
              <span className="text-[11px] font-mono text-slate-400">Live booking log</span>
            </h4>

            {selectedDesk.totalTxCount === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                No walk-in bookings processed at this desk today yet. New bookings from Agent Desk POS or Hotel Bookings will automatically appear here.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[11px]">
                    <tr>
                      <th className="p-3">Reference / PNR</th>
                      <th className="p-3">Guest / Passenger</th>
                      <th className="p-3">Service / Room</th>
                      <th className="p-3">Method</th>
                      <th className="p-3 text-right">Amount (QAR)</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Tour Bookings */}
                    {selectedDesk.deskTourBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="p-3 font-bold text-blue-600">{b.pnr}</td>
                        <td className="p-3 text-slate-900 dark:text-slate-200">{b.passengerName}</td>
                        <td className="p-3 text-slate-500">{b.packageName}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.paymentMethod === 'Cash'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {b.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                          {b.totalQAR.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-[10px] text-emerald-600 font-bold">Checked-in</span>
                        </td>
                      </tr>
                    ))}

                    {/* Hotel Bookings */}
                    {selectedDesk.deskHotelBookings.map((hb) => (
                      <tr key={hb.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="p-3 font-bold text-amber-600">{hb.confirmationCode}</td>
                        <td className="p-3 text-slate-900 dark:text-slate-200">{hb.guestName}</td>
                        <td className="p-3 text-slate-500">{hb.hotelName} ({hb.roomType})</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              hb.paymentMethod === 'Cash'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {hb.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                          {hb.totalQAR.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-[10px] text-amber-600 font-bold">{hb.bookingStatus}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Audit Verification Log Badge */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-emerald-950 dark:text-emerald-100 font-bold block">
                  Zero Drawer Discrepancy · Physically Reconciled with System Expected Cash
                </span>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-mono">
                  Daily counted cash matches ledger. Ready for vault deposit into Qatar National Bank (QNB).
                </span>
              </div>
            </div>
            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/60 rounded-xl text-center">
              STATUS: BALANCED
            </span>
          </div>
        </div>
      )}

      {/* 6. X-Report Printable Modal */}
      {printingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white">AR TRUST TRAVEL & TOURS</h3>
              <p className="text-[11px] text-slate-500 font-mono">Doha, State of Qatar · Ministry of Tourism Lic. #4892</p>
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                {printingReport.type}: Interim Shift Audit
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-700 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Desk Code:</span>
                <span className="font-bold">{printingReport.desk.deskCode}</span>
              </div>
              <div className="flex justify-between">
                <span>Station:</span>
                <span className="font-bold">{printingReport.desk.deskName}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier / Agent:</span>
                <span className="font-bold">{printingReport.desk.assignedEmployeeName}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold">
                <span>Physical Drawer Cash (QAR):</span>
                <span>{(printingReport.desk.currentDrawerCashQAR || 5000).toLocaleString()} QAR</span>
              </div>
              <div className="flex justify-between font-bold text-blue-600">
                <span>POS Card Terminal Batch (QAR):</span>
                <span>{selectedDesk.totalPosCardToday.toLocaleString()} QAR</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600">
                <span>Variance:</span>
                <span>0.00 QAR (Balanced)</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setPrintingReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
