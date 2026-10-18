import React, { useState, useMemo } from 'react';
import {
  Coins,
  Building2,
  TrendingUp,
  Plus,
  Edit2,
  Check,
  X,
  RefreshCw,
  Sliders,
  DollarSign,
  AlertCircle,
  Percent,
  Trash2,
  History,
  Calendar,
  Search,
  Camera,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpDown,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DateFilterBar } from '../common/DateFilterBar';
import { CurrencyItem, CurrencyHistoryRecord } from '../../types';

export const MultiCurrencyLedgerView: React.FC = () => {
  const {
    currencies,
    addCurrencyItem,
    updateCurrencyItem,
    deleteCurrencyItem,
    currencyHistory,
    addCurrencyHistoryRecord,
    updateCurrencyHistoryRecord,
    deleteCurrencyHistoryRecord,
    rates,
    updateRates,
    language,
    dateFilter,
    setDateFilter,
    addAuditLog,
    roleConfig,
  } = useApp();

  // Quick inline rate editing state
  const [inlineEditingCode, setInlineEditingCode] = useState<string | null>(null);
  const [inlineEditingRate, setInlineEditingRate] = useState<number>(1);

  // Full Edit Currency Modal state
  const [editingCurrency, setEditingCurrency] = useState<CurrencyItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editSymbol, setEditSymbol] = useState('');
  const [editRate, setEditRate] = useState<number>(1);
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editAccount, setEditAccount] = useState('');
  const [editIsPegged, setEditIsPegged] = useState(false);
  const [editPeggedNote, setEditPeggedNote] = useState('');

  // Delete Currency Modal state
  const [currencyToDelete, setCurrencyToDelete] = useState<CurrencyItem | null>(null);

  // Add new currency modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newRate, setNewRate] = useState<number>(1.0);
  const [newAccount, setNewAccount] = useState('');
  const [newBalance, setNewBalance] = useState<number>(0);
  const [newIsPegged, setNewIsPegged] = useState(false);
  const [newPeggedNote, setNewPeggedNote] = useState('');

  // History section filters & search
  const [historySearch, setHistorySearch] = useState('');
  const [historyCurrencyFilter, setHistoryCurrencyFilter] = useState('ALL');
  const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');

  // Add / Edit History Record Modal state
  const [showAddHistoryModal, setShowAddHistoryModal] = useState(false);
  const [editingHistoryRecord, setEditingHistoryRecord] = useState<CurrencyHistoryRecord | null>(null);
  const [historyRecordToDelete, setHistoryRecordToDelete] = useState<CurrencyHistoryRecord | null>(null);

  const [histDate, setHistDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [histTime, setHistTime] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [histCurrencyCode, setHistCurrencyCode] = useState('USD');
  const [histRate, setHistRate] = useState<number>(3.64);
  const [histBalance, setHistBalance] = useState<number>(50000);
  const [histType, setHistType] = useState<CurrencyHistoryRecord['changeType']>('Daily EOD Snapshot');
  const [histRecordedBy, setHistRecordedBy] = useState(() => roleConfig?.userDisplayName || 'Finance Controller');
  const [histNotes, setHistNotes] = useState('');

  // Feedback banner state
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Quick Inline Rate Edit
  const handleStartInlineEdit = (curr: CurrencyItem) => {
    setInlineEditingCode(curr.code);
    const currentRate = (rates as any)[curr.code] ?? curr.rateToQAR;
    setInlineEditingRate(currentRate);
  };

  const handleSaveInlineRate = (code: string) => {
    if (inlineEditingRate <= 0) {
      showToast('Exchange rate must be greater than 0', 'error');
      return;
    }
    const res = updateCurrencyItem(code, { rateToQAR: inlineEditingRate });
    if (res.success) {
      setInlineEditingCode(null);
      showToast(`Exchange rate for ${code} successfully updated to ${inlineEditingRate} QAR.`);
    } else {
      showToast(res.error || 'Failed to update rate', 'error');
    }
  };

  // Open Full Edit Modal
  const handleOpenFullEdit = (curr: CurrencyItem) => {
    setEditingCurrency(curr);
    setEditName(curr.name);
    setEditSymbol(curr.symbol);
    const activeRate = (rates as any)[curr.code] ?? curr.rateToQAR;
    setEditRate(activeRate);
    setEditBalance(curr.cashVaultBalance);
    setEditAccount(curr.bankAccount || '');
    setEditIsPegged(!!curr.isPegged);
    setEditPeggedNote(curr.peggedNote || '');
  };

  // Save Full Edit
  const handleSaveFullEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCurrency) return;
    if (editRate <= 0) {
      showToast('Exchange rate must be greater than 0', 'error');
      return;
    }
    const res = updateCurrencyItem(editingCurrency.code, {
      name: editName.trim() || editingCurrency.name,
      symbol: editSymbol.trim() || editingCurrency.symbol,
      rateToQAR: editRate,
      cashVaultBalance: Number(editBalance) || 0,
      bankAccount: editAccount.trim(),
      isPegged: editIsPegged,
      peggedNote: editPeggedNote.trim() || undefined,
    });

    if (res.success) {
      setEditingCurrency(null);
      showToast(`Currency ${editingCurrency.code} details and vault balance updated successfully!`);
    } else {
      showToast(res.error || 'Failed to update currency', 'error');
    }
  };

  // Delete Currency Action
  const handleConfirmDeleteCurrency = () => {
    if (!currencyToDelete) return;
    if (currencyToDelete.code === 'QAR') {
      showToast('Cannot delete sovereign base currency QAR.', 'error');
      setCurrencyToDelete(null);
      return;
    }
    const code = currencyToDelete.code;
    const res = deleteCurrencyItem(code);
    if (res.success) {
      setCurrencyToDelete(null);
      showToast(`Currency ${code} removed from active Treasury and archived.`);
    } else {
      showToast(res.error || 'Failed to delete currency', 'error');
    }
  };

  // Add Currency Action
  const handleAddCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCode.trim().toUpperCase();
    if (!cleanCode || newRate <= 0) {
      showToast('Valid currency ISO code and positive rate are required', 'error');
      return;
    }

    if (currencies.some((c) => c.code === cleanCode)) {
      showToast(`Currency ${cleanCode} already exists! You can edit its details directly.`, 'error');
      return;
    }

    const item: CurrencyItem = {
      code: cleanCode,
      name: newName.trim() || `${cleanCode} Currency`,
      symbol: newSymbol.trim() || cleanCode,
      rateToQAR: newRate,
      bankAccount: newAccount.trim() || `QNB Treasury Foreign Vault #${cleanCode}99201`,
      cashVaultBalance: Number(newBalance) || 0,
      isPegged: newIsPegged,
      peggedNote: newPeggedNote.trim() || undefined,
    };

    const res = addCurrencyItem(item);
    if (res.success) {
      setShowAddModal(false);
      setNewCode('');
      setNewName('');
      setNewSymbol('');
      setNewRate(1.0);
      setNewAccount('');
      setNewBalance(0);
      setNewIsPegged(false);
      setNewPeggedNote('');
      showToast(`New currency ${cleanCode} added successfully! Rates and reserves are now active across all tables.`);
    } else {
      showToast(res.error || 'Failed to add currency', 'error');
    }
  };

  // Add or Update Historical Record
  const handleSaveHistoryRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!histDate || !histCurrencyCode || histRate <= 0) {
      showToast('Please provide a valid date, currency, and positive exchange rate', 'error');
      return;
    }

    const targetCurr = currencies.find((c) => c.code === histCurrencyCode);
    const currencyName = targetCurr?.name || `${histCurrencyCode} Currency`;

    if (editingHistoryRecord) {
      // Update
      const res = updateCurrencyHistoryRecord(editingHistoryRecord.id, {
        date: histDate,
        time: histTime,
        currencyCode: histCurrencyCode,
        currencyName,
        rateToQAR: Number(histRate),
        vaultBalance: Number(histBalance) || 0,
        changeType: histType,
        recordedBy: histRecordedBy.trim() || (roleConfig?.userDisplayName || 'Treasury Officer'),
        notes: histNotes.trim() || undefined,
      });

      if (res.success) {
        setEditingHistoryRecord(null);
        showToast(`Historical record for ${histCurrencyCode} on ${histDate} updated!`);
      } else {
        showToast(res.error || 'Failed to update record', 'error');
      }
    } else {
      // Add new
      const res = addCurrencyHistoryRecord({
        date: histDate,
        time: histTime,
        currencyCode: histCurrencyCode,
        currencyName,
        rateToQAR: Number(histRate),
        vaultBalance: Number(histBalance) || 0,
        balanceQAREquivalent: Math.round((Number(histBalance) || 0) * Number(histRate)),
        changeType: histType,
        recordedBy: histRecordedBy.trim() || (roleConfig?.userDisplayName || 'Treasury Officer'),
        notes: histNotes.trim() || undefined,
      });

      if (res.success) {
        setShowAddHistoryModal(false);
        showToast(`Historical snapshot for ${histCurrencyCode} on ${histDate} saved!`);
      } else {
        showToast(res.error || 'Failed to save historical record', 'error');
      }
    }
  };

  // Open Edit Historical Record Modal
  const handleStartEditHistory = (rec: CurrencyHistoryRecord) => {
    setEditingHistoryRecord(rec);
    setHistDate(rec.date);
    setHistTime(rec.time || '12:00');
    setHistCurrencyCode(rec.currencyCode);
    setHistRate(rec.rateToQAR);
    setHistBalance(rec.vaultBalance);
    setHistType(rec.changeType);
    setHistRecordedBy(rec.recordedBy);
    setHistNotes(rec.notes || '');
  };

  // Open Add Historical Record Modal
  const handleOpenAddHistory = () => {
    setEditingHistoryRecord(null);
    setHistDate(new Date().toISOString().split('T')[0]);
    setHistTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setHistCurrencyCode(currencies[1]?.code || 'USD');
    const firstNonQAR = currencies[1] || currencies[0];
    setHistRate((rates as any)[firstNonQAR.code] ?? firstNonQAR.rateToQAR);
    setHistBalance(firstNonQAR.cashVaultBalance);
    setHistType('Daily EOD Snapshot');
    setHistRecordedBy(roleConfig?.userDisplayName || 'Finance Controller');
    setHistNotes('');
    setShowAddHistoryModal(true);
  };

  // Delete Historical Record Action
  const handleConfirmDeleteHistory = () => {
    if (!historyRecordToDelete) return;
    const res = deleteCurrencyHistoryRecord(historyRecordToDelete.id);
    if (res.success) {
      setHistoryRecordToDelete(null);
      showToast('Historical record removed.');
    } else {
      showToast(res.error || 'Failed to delete record', 'error');
    }
  };

  // Capture Today's Snapshot for all currencies
  const handleCaptureTodaySnapshot = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let count = 0;

    currencies.forEach((curr) => {
      const activeRate = (rates as any)[curr.code] ?? curr.rateToQAR;
      addCurrencyHistoryRecord({
        date: todayStr,
        time: timeStr,
        currencyCode: curr.code,
        currencyName: curr.name,
        rateToQAR: activeRate,
        vaultBalance: curr.cashVaultBalance,
        balanceQAREquivalent: Math.round(curr.cashVaultBalance * activeRate),
        recordedBy: `${roleConfig?.userDisplayName || 'Finance Officer'} (Live Snapshot)`,
        changeType: 'Daily EOD Snapshot',
        notes: `Automated Treasury snapshot: Active rate ${activeRate} QAR, Vault reserve ${curr.symbol} ${curr.cashVaultBalance.toLocaleString()}.`,
      });
      count++;
    });

    showToast(`Captured today's snapshot for all ${count} currencies into Historical Ledger!`);
  };

  // Calculate total reserves in QAR across all currencies
  const totalTreasuryQAR = useMemo(() => {
    return currencies.reduce((sum, h) => {
      const rate = (rates as any)[h.code] ?? h.rateToQAR;
      return sum + h.cashVaultBalance * rate;
    }, 0);
  }, [currencies, rates]);

  // Filtered currency history records
  const filteredHistory = useMemo(() => {
    return currencyHistory.filter((rec) => {
      if (historyCurrencyFilter !== 'ALL' && rec.currencyCode !== historyCurrencyFilter) {
        return false;
      }
      if (historyTypeFilter !== 'ALL' && rec.changeType !== historyTypeFilter) {
        return false;
      }
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const mDate = rec.date.includes(q);
        const mCode = rec.currencyCode.toLowerCase().includes(q);
        const mName = rec.currencyName.toLowerCase().includes(q);
        const mOfficer = rec.recordedBy.toLowerCase().includes(q);
        const mNotes = (rec.notes || '').toLowerCase().includes(q);
        if (!mDate && !mCode && !mName && !mOfficer && !mNotes) return false;
      }
      return true;
    });
  }, [currencyHistory, historyCurrencyFilter, historyTypeFilter, historySearch]);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl font-semibold text-xs flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-1 ${
            feedback.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {language === 'ar'
                  ? 'إدارة الخزينة والعملات والاحتياطيات التاريخية (QCB)'
                  : 'Multi-Currency Treasury, Fully Editable Reserves & Rates'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Add, edit, or remove currencies, manage physical vault reserves, and track date-wise historical snapshots
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCaptureTodaySnapshot}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
            title="Take a snapshot of all active currency balances and rates for today"
          >
            <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Capture Today's Snapshot</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Currency</span>
          </button>

          <div className="text-right font-mono pl-3 border-l border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Reserves (QAR EQV)</span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              QAR {Math.round(totalTreasuryQAR).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Active Currencies</div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
            {currencies.length} <span className="text-xs font-semibold text-slate-400">Tracked</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            Full add, edit & remove access
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">QCB Pegged Baseline</div>
          <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">
            1 USD = 3.64 QAR
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Sovereign exchange anchor
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Historical Records</div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
            {currencyHistory.length} <span className="text-xs font-semibold text-slate-400">Logs</span>
          </div>
          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
            Date-wise reserve tracking
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Base Vault Currency</div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
            QAR (ر.ق)
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Protected sovereign reserve
          </div>
        </div>
      </div>

      {/* Date & Year Filter */}
      <DateFilterBar
        filter={dateFilter}
        onChange={setDateFilter}
        label={language === 'ar' ? 'تصفية تسويات العملات والاحتياطيات' : 'Ledger Reserves Date Filter'}
      />

      {/* SECTION 1: Active Currencies & Fully Editable Reserves Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {language === 'ar' ? 'العملات النشطة واحتياطيات الخزينة (قابلة للتعديل والحذف بالكامل)' : 'Active Treasury Currencies & Live Vault Reserves'}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {currencies.length} Currencies in active ledger · Fully Editable & Removable
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currencies.map((curr) => {
            const effectiveRate = (rates as any)[curr.code] ?? curr.rateToQAR;
            const eqvQAR = curr.cashVaultBalance * effectiveRate;
            const share = totalTreasuryQAR > 0 ? ((eqvQAR / totalTreasuryQAR) * 100).toFixed(1) : '0';
            const isInlineEditing = inlineEditingCode === curr.code;
            const isBaseQAR = curr.code === 'QAR';

            return (
              <div
                key={curr.code}
                className="p-4.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3.5 transition hover:border-slate-300 dark:hover:border-slate-700 relative group"
              >
                <div>
                  {/* Card Header with Badges and Delete Action */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-black text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                        {curr.symbol || curr.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-base text-slate-900 dark:text-white">
                            {curr.code}
                          </span>
                          {curr.isPegged && (
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                              Pegged
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]" title={curr.name}>
                          {curr.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                        {share}%
                      </span>

                      {/* Remove / Delete Button */}
                      {!isBaseQAR ? (
                        <button
                          onClick={() => setCurrencyToDelete(curr)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                          title={`Remove ${curr.code} from Treasury`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="p-1.5 text-slate-300 dark:text-slate-700 cursor-not-allowed" title="Sovereign base currency cannot be removed">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vault Reserve Balance */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold flex items-center justify-between">
                      <span>Vault Reserve Balance:</span>
                      <button
                        onClick={() => handleOpenFullEdit(curr)}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="font-mono text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      {curr.symbol} {curr.cashVaultBalance.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      ≈ QAR {Math.round(eqvQAR).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Exchange Rate Area */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                      Exchange Rate:
                    </span>
                    {!isInlineEditing && !isBaseQAR && (
                      <button
                        onClick={() => handleStartInlineEdit(curr)}
                        className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Quick Rate</span>
                      </button>
                    )}
                  </div>

                  {isInlineEditing ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        value={inlineEditingRate}
                        onChange={(e) => setInlineEditingRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 rounded-lg border border-blue-400 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveInlineRate(curr.code)}
                        className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                        title="Save Rate"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setInlineEditingCode(null)}
                        className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                        1 {curr.code} = {effectiveRate} QAR
                      </span>
                      {curr.isPegged && (
                        <span className="text-[9px] font-mono uppercase text-blue-600 dark:text-blue-400 font-bold">
                          Official QCB
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-2 text-[10px] text-slate-400 font-mono truncate" title={curr.bankAccount}>
                    {curr.bankAccount || 'Main Vault Ledger'}
                  </div>

                  {/* Action Bar: Edit All Fields & History Snapshot */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenFullEdit(curr)}
                      className="flex-1 py-1 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 text-slate-500" />
                      <span>Edit Currency</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingHistoryRecord(null);
                        setHistDate(new Date().toISOString().split('T')[0]);
                        setHistTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                        setHistCurrencyCode(curr.code);
                        setHistRate(effectiveRate);
                        setHistBalance(curr.cashVaultBalance);
                        setHistType('Vault Audit');
                        setHistRecordedBy(roleConfig?.userDisplayName || 'Finance Controller');
                        setHistNotes(`Vault balance check for ${curr.code}: ${curr.symbol} ${curr.cashVaultBalance.toLocaleString()}`);
                        setShowAddHistoryModal(true);
                      }}
                      className="py-1 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      title="Log a historical snapshot for this currency"
                    >
                      <History className="w-3 h-3" />
                      <span>Log Snapshot</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FX Rates & Central Bank Pegging Directives */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs shadow-xs">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
          <Building2 className="w-4 h-4 text-blue-500" />
          <span>Qatar Central Bank (QCB) Pegging & Dynamic Multi-Currency Directives</span>
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
          Under Qatar Central Bank regulations, the Qatari Riyal is officially pegged to the US Dollar at 1 USD = 3.64 QAR. Agent desk cashiers and POS stations are authorized to accept multi-currency cash and card settlements at the active configured conversion rates above. All transactions automatically sync against the Qatar National Bank (QNB) foreign currency ledger. When rates or vault balances are updated here, they immediately propagate to POS checkout stations, EOD shift reconciliations, and financial ledger reports.
        </p>
      </div>

      {/* SECTION 2: Historical Reserves & Rates Ledger Archive ("eta te ekta history thakbe jeta te kon date a kon currucy koto chilo eta thakbe store") */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        {/* History Header & Toolbar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {language === 'ar'
                  ? 'أرشيف تسويات واحتياطيات العملات حسب التاريخ'
                  : 'Historical Currency Reserves & Rates Archive (Date-Wise Store)'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track on which date each currency was held, its exchange rate to QAR, and its historical cash vault reserve balance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenAddHistory}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Historical Entry</span>
            </button>
          </div>
        </div>

        {/* History Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Currency */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 font-semibold text-[11px]">Currency:</span>
              <select
                value={historyCurrencyFilter}
                onChange={(e) => setHistoryCurrencyFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Currencies ({currencyHistory.length})</option>
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 font-semibold text-[11px]">Change Type:</span>
              <select
                value={historyTypeFilter}
                onChange={(e) => setHistoryTypeFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="Daily EOD Snapshot">Daily EOD Snapshot</option>
                <option value="Rate Update">Rate Update</option>
                <option value="Vault Audit">Vault Audit</option>
                <option value="Manual Log">Manual Log</option>
                <option value="Initial Baseline">Initial Baseline</option>
              </select>
            </div>
          </div>

          {/* Search History */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by date (YYYY-MM-DD), currency, notes..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4">Rate (1 Unit)</th>
                <th className="py-3 px-4">Historical Vault Balance</th>
                <th className="py-3 px-4">Total Value (QAR EQV)</th>
                <th className="py-3 px-4">Change Type</th>
                <th className="py-3 px-4">Recorded By & Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
                    <p className="font-semibold text-xs">No historical currency records found</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {historySearch || historyCurrencyFilter !== 'ALL' || historyTypeFilter !== 'ALL'
                        ? 'Try clearing the search or filters.'
                        : 'Click "+ Record Historical Entry" or "Capture Today\'s Snapshot" to add logs.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((rec) => {
                  const currMatch = currencies.find((c) => c.code === rec.currencyCode);
                  const symbol = currMatch?.symbol || rec.currencyCode;

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                    >
                      {/* Date & Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {rec.date}
                          </span>
                          {rec.time && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {rec.time}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Currency */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-black text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {symbol}
                          </span>
                          <div>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {rec.currencyCode}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                              {rec.currencyName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rate */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {rec.rateToQAR} QAR
                        </div>
                        {rec.previousRateToQAR && rec.previousRateToQAR !== rec.rateToQAR && (
                          <div className="text-[10px] font-mono text-slate-400">
                            Prev: {rec.previousRateToQAR} QAR
                          </div>
                        )}
                      </td>

                      {/* Historical Vault Balance ("kon date a kon currucy koto chilo") */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-black text-slate-900 dark:text-white text-xs">
                          {symbol} {rec.vaultBalance.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Vault Physical Stored
                        </div>
                      </td>

                      {/* QAR Equivalent */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                          QAR {rec.balanceQAREquivalent.toLocaleString()}
                        </span>
                      </td>

                      {/* Change Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                            rec.changeType === 'Daily EOD Snapshot'
                              ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : rec.changeType === 'Rate Update'
                              ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : rec.changeType === 'Vault Audit'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          }`}
                        >
                          {rec.changeType}
                        </span>
                      </td>

                      {/* Recorded By & Notes */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-800 dark:text-slate-200 font-medium truncate">
                          {rec.recordedBy}
                        </div>
                        {rec.notes && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5" title={rec.notes}>
                            {rec.notes}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEditHistory(rec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition cursor-pointer"
                            title="Edit Historical Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setHistoryRecordToDelete(rec)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                            title="Delete Historical Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add New Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Add New Foreign Currency & Set Rate
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCurrency} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Currency ISO Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JPY, KWD, AED"
                    maxLength={4}
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Currency Symbol *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ¥, د.ك, د.إ"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Currency Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Japanese Yen / Kuwaiti Dinar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Conversion Rate (QAR per 1 Unit) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    required
                    value={newRate}
                    onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Cash Vault Balance
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newBalance}
                    onChange={(e) => setNewBalance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Settlement Account (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. QNB Foreign Vault #QA92..."
                  value={newAccount}
                  onChange={(e) => setNewAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              {/* Pegged checkbox */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsPegged}
                    onChange={(e) => setNewIsPegged(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Official Central Bank Pegged Currency
                  </span>
                </label>
                {newIsPegged && (
                  <input
                    type="text"
                    placeholder="e.g. Qatar Central Bank Sovereign Peg: 1 USD = 3.64 QAR"
                    value={newPeggedNote}
                    onChange={(e) => setNewPeggedNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[11px]"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save & Register Currency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Full Edit Currency Modal ("fully editable hobe") */}
      {editingCurrency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Edit Currency & Vault Reserves: {editingCurrency.code}
                </h3>
              </div>
              <button
                onClick={() => setEditingCurrency(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFullEdit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Currency Code (ISO)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingCurrency.code}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 font-mono font-bold uppercase cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Currency Symbol *
                  </label>
                  <input
                    type="text"
                    required
                    value={editSymbol}
                    onChange={(e) => setEditSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Currency Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exchange Rate (1 {editingCurrency.code} = X QAR) *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    required
                    value={editRate}
                    onChange={(e) => setEditRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cash Vault Reserve Balance *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editBalance}
                    onChange={(e) => setEditBalance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Settlement Account
                </label>
                <input
                  type="text"
                  value={editAccount}
                  onChange={(e) => setEditAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              {/* Pegged checkbox */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsPegged}
                    onChange={(e) => setEditIsPegged(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Official Central Bank Pegged Currency
                  </span>
                </label>
                {editIsPegged && (
                  <input
                    type="text"
                    placeholder="e.g. Qatar Central Bank Sovereign Peg: 1 USD = 3.64 QAR"
                    value={editPeggedNote}
                    onChange={(e) => setEditPeggedNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[11px]"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCurrency(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Currency Confirmation Modal ("remove kore jay na -> fixed!") */}
      {currencyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Remove Currency {currencyToDelete.code}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove <strong>{currencyToDelete.name}</strong> ({currencyToDelete.code}) from active Treasury? Its remaining vault balance ({currencyToDelete.symbol} {currencyToDelete.cashVaultBalance.toLocaleString()}) will be liquidated and logged in the historical ledger.
              </p>
            </div>

            <div className="flex justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCurrencyToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCurrency}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Yes, Remove Currency
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Add / Edit Historical Record Modal */}
      {(showAddHistoryModal || editingHistoryRecord) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {editingHistoryRecord
                    ? `Edit Historical Record (#${editingHistoryRecord.id})`
                    : 'Record Historical Currency & Vault Snapshot'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddHistoryModal(false);
                  setEditingHistoryRecord(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHistoryRecord} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Snapshot Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={histDate}
                    onChange={(e) => setHistDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Snapshot Time
                  </label>
                  <input
                    type="text"
                    value={histTime}
                    onChange={(e) => setHistTime(e.target.value)}
                    placeholder="e.g. 18:00 or 09:30"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Currency *
                  </label>
                  <select
                    value={histCurrencyCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setHistCurrencyCode(code);
                      const targetCurr = currencies.find((c) => c.code === code);
                      if (targetCurr) {
                        setHistRate((rates as any)[code] ?? targetCurr.rateToQAR);
                        setHistBalance(targetCurr.cashVaultBalance);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Change Type *
                  </label>
                  <select
                    value={histType}
                    onChange={(e) => setHistType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Daily EOD Snapshot">Daily EOD Snapshot</option>
                    <option value="Rate Update">Rate Update</option>
                    <option value="Vault Audit">Vault Audit</option>
                    <option value="Manual Log">Manual Log</option>
                    <option value="Initial Baseline">Initial Baseline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rate to QAR on this Date *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    required
                    value={histRate}
                    onChange={(e) => setHistRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vault Reserve Balance on this Date *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={histBalance}
                    onChange={(e) => setHistBalance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recorded By / Officer
                </label>
                <input
                  type="text"
                  value={histRecordedBy}
                  onChange={(e) => setHistRecordedBy(e.target.value)}
                  placeholder="e.g. Treasury Desk / Finance Lead"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Audit Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={histNotes}
                  onChange={(e) => setHistNotes(e.target.value)}
                  placeholder="e.g. Closing shift physical cash vault counting across airport counters and hotel desks."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddHistoryModal(false);
                    setEditingHistoryRecord(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingHistoryRecord ? 'Update Record' : 'Save Historical Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Delete Historical Record Confirmation */}
      {historyRecordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Delete Historical Log?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove the historical snapshot for <strong>{historyRecordToDelete.currencyCode}</strong> on <strong>{historyRecordToDelete.date}</strong>?
              </p>
            </div>

            <div className="flex justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setHistoryRecordToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteHistory}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Yes, Delete Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
