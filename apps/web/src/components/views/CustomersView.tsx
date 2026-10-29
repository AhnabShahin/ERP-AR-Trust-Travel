// =====================================================================
// Customers screen — the admin list of every USER whose role is
// `customer`. There is no separate "Guest" table in the UI any more:
// customers are simply users with role=customer, so this view reads the
// synced `userAccounts` (the users table) filtered to that role and does
// all CRUD through the same account helpers the Accounts manager uses.
// =====================================================================

import React, { useMemo, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Check,
  UserPlus,
  ShieldCheck,
  Power,
  Crown,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { imgSrc } from '../../../lib/uploads';
import { UserAccount } from '../../types';

export const CustomersView: React.FC = () => {
  const {
    userAccounts,
    addUserAccount,
    updateUserAccount,
    deleteUserAccount,
    customerTiers,
    addCustomerTier,
    updateCustomerTier,
    deleteCustomerTier,
    language,
  } = useApp();

  const isRtl = language === 'ar';

  // Tier name → discount %, for the badge + any pricing display.
  const tierByName = useMemo(() => {
    const m = new Map<string, number>();
    customerTiers.forEach((t) => m.set(t.name.toLowerCase(), t.discountPercentage));
    return m;
  }, [customerTiers]);

  // Only users whose role is `customer` belong on this screen.
  const customers = useMemo(
    () => userAccounts.filter((u) => u.role === 'customer'),
    [userAccounts]
  );

  // Search & status filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive'>('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);

  // Add-form state
  const [addName, setAddName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addPassword, setAddPassword] = useState('pass123');
  const [addNationality, setAddNationality] = useState('');
  const [addCountry, setAddCountry] = useState('');
  const [addVipTier, setAddVipTier] = useState('Standard');

  // Edit-form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNationality, setEditNationality] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
  const [editVipTier, setEditVipTier] = useState('Standard');

  // Tier management (collapsible section)
  const [showTiers, setShowTiers] = useState(false);
  const [newTierName, setNewTierName] = useState('');
  const [newTierDiscount, setNewTierDiscount] = useState('');

  // Feedback
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const notifySuccess = (m: string) => {
    setFeedbackSuccess(m);
    setTimeout(() => setFeedbackSuccess(null), 3500);
  };
  const notifyError = (m: string) => {
    setFeedbackError(m);
    setTimeout(() => setFeedbackError(null), 4000);
  };

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  const activeCount = customers.filter((c) => c.status === 'active').length;
  const verifiedCount = customers.filter((c) => c.isEmailVerified).length;

  const resetAddForm = () => {
    setAddName('');
    setAddUsername('');
    setAddEmail('');
    setAddPhone('');
    setAddPassword('pass123');
    setAddNationality('');
    setAddCountry('');
    setAddVipTier('Standard');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addUsername.trim() || !addEmail.trim() || !addPassword.trim()) {
      notifyError(isRtl ? 'يرجى ملء جميع الحقول الإلزامية.' : 'Please fill all required fields.');
      return;
    }
    const res = addUserAccount({
      name: addName.trim(),
      username: addUsername.trim(),
      email: addEmail.trim(),
      password: addPassword.trim(),
      role: 'customer',
      phone: addPhone.trim() || undefined,
      nationality: addNationality.trim() || undefined,
      country: addCountry.trim() || undefined,
      vipTier: addVipTier,
      status: 'inactive',
      lastLogin: 'Never',
    });
    if (res.success) {
      notifySuccess(isRtl ? `تمت إضافة العميل ${addName}.` : `Customer "${addName}" added.`);
      setShowAddModal(false);
      resetAddForm();
    } else {
      notifyError(res.error || 'Failed to add customer.');
    }
  };

  const openEdit = (c: UserAccount) => {
    setEditing(c);
    setEditName(c.name);
    setEditEmail(c.email);
    setEditPhone(c.phone || '');
    setEditNationality(c.nationality || '');
    setEditCountry(c.country || '');
    setEditStatus(c.status);
    setEditVipTier(c.vipTier || 'Standard');
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const res = updateUserAccount(editing.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim() || undefined,
      nationality: editNationality.trim() || undefined,
      country: editCountry.trim() || undefined,
      vipTier: editVipTier,
      status: editStatus,
    });
    if (res.success) {
      notifySuccess(isRtl ? 'تم تحديث بيانات العميل.' : 'Customer details updated.');
      setEditing(null);
    } else {
      notifyError(res.error || 'Failed to update customer.');
    }
  };

  const handleToggleStatus = (c: UserAccount) => {
    const next = c.status === 'active' ? 'inactive' : 'active';
    const res = updateUserAccount(c.id, { status: next });
    if (res.success) {
      notifySuccess(
        next === 'active'
          ? (isRtl ? `تم تفعيل حساب ${c.name}.` : `${c.name}'s account activated.`)
          : (isRtl ? `تم تعطيل حساب ${c.name}.` : `${c.name}'s account suspended.`)
      );
    } else {
      notifyError(res.error || 'Failed to update status.');
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const res = deleteUserAccount(deleteTarget.id);
    if (res.success) {
      notifySuccess(isRtl ? `تم حذف العميل ${deleteTarget.name}.` : `Customer "${deleteTarget.name}" removed.`);
      setDeleteTarget(null);
    } else {
      notifyError(res.error || 'Cannot delete customer.');
    }
  };

  const handleAddTier = () => {
    if (!newTierName.trim()) {
      notifyError(isRtl ? 'اسم الفئة مطلوب.' : 'Tier name is required.');
      return;
    }
    const res = addCustomerTier({
      name: newTierName.trim(),
      discountPercentage: Number(newTierDiscount) || 0,
    });
    if (res.success) {
      notifySuccess(isRtl ? 'تمت إضافة الفئة.' : 'Tier added.');
      setNewTierName('');
      setNewTierDiscount('');
    } else {
      notifyError(res.error || 'Failed to add tier.');
    }
  };

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Header + stats */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isRtl ? 'العملاء' : 'Customers'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl
                  ? 'جميع المستخدمين الذين يحملون دور "عميل" في قاعدة البيانات.'
                  : 'Every user account whose role is “customer”.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition cursor-pointer active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>{isRtl ? 'إضافة عميل' : 'Add Customer'}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 text-[10px] font-mono uppercase block">{isRtl ? 'إجمالي العملاء' : 'Total Customers'}</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{customers.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-mono uppercase block">{isRtl ? 'نشط' : 'Active'}</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{activeCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800/40">
            <span className="text-sky-600 dark:text-sky-400 text-[10px] font-mono uppercase block">{isRtl ? 'موثّق' : 'Verified'}</span>
            <span className="text-lg font-black text-sky-600 dark:text-sky-400 font-mono">{verifiedCount}</span>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedbackSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}
      {feedbackError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'بحث بالاسم، البريد، أو الهاتف...' : 'Search by name, email, phone...'}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 pl-9 rtl:pl-3 rtl:pr-9 text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:border-purple-500 transition"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'active' | 'inactive')}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-xs font-medium outline-none cursor-pointer"
          >
            <option value="ALL">{isRtl ? 'جميع الحالات' : 'All Status'}</option>
            <option value="active">{isRtl ? 'نشط' : 'Active'}</option>
            <option value="inactive">{isRtl ? 'معطل' : 'Suspended'}</option>
          </select>
          <span className="text-[11px] text-slate-400 font-mono shrink-0 px-1">
            {filtered.length} / {customers.length}
          </span>
        </div>
      </div>

      {/* Customer tiers & discounts (collapsible) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTiers((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-5 py-3.5 text-left cursor-pointer"
        >
          <span className="flex items-center gap-2 font-extrabold text-sm text-slate-900 dark:text-white">
            <Sliders className="w-4 h-4 text-amber-500" />
            {isRtl ? 'فئات العملاء والخصومات' : 'Customer Tiers & Discounts'}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
              {customerTiers.length}
            </span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showTiers ? 'rotate-180' : ''}`} />
        </button>

        {showTiers && (
          <div className="px-5 pb-5 pt-1 space-y-2.5 border-t border-slate-100 dark:border-slate-800">
            {customerTiers.length === 0 && (
              <p className="text-xs text-slate-400 py-2">{isRtl ? 'لا توجد فئات بعد.' : 'No tiers yet.'}</p>
            )}
            {customerTiers.map((t) => (
              <div key={t.id} className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 w-40 shrink-0">
                  <Crown className="w-3 h-3 text-amber-500" />
                  {t.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={t.discountPercentage}
                    onChange={(e) => updateCustomerTier(t.id, { discountPercentage: Number(e.target.value) || 0 })}
                    className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white font-mono outline-none focus:border-amber-500"
                  />
                  <span className="text-slate-400">% {isRtl ? 'خصم' : 'discount'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCustomerTier(t.id)}
                  className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                  title={isRtl ? 'حذف الفئة' : 'Delete tier'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add new tier */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <input
                type="text"
                value={newTierName}
                onChange={(e) => setNewTierName(e.target.value)}
                placeholder={isRtl ? 'اسم الفئة (مثل VIP Gold)' : 'Tier name (e.g. VIP Gold)'}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
              />
              <input
                type="number"
                value={newTierDiscount}
                onChange={(e) => setNewTierDiscount(e.target.value)}
                placeholder="%"
                className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-mono outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddTier}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                {isRtl ? 'إضافة' : 'Add'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">{isRtl ? 'العميل' : 'Customer'}</th>
                <th className="py-3 px-4">{isRtl ? 'التواصل' : 'Contact'}</th>
                <th className="py-3 px-4">{isRtl ? 'الجنسية / الدولة' : 'Nationality / Country'}</th>
                <th className="py-3 px-4">{isRtl ? 'الفئة' : 'Tier'}</th>
                <th className="py-3 px-4">{isRtl ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4">{isRtl ? 'تاريخ الانضمام' : 'Joined'}</th>
                <th className="py-3 px-4 text-center">{isRtl ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    {isRtl ? 'لا يوجد عملاء بعد.' : 'No customers yet.'}
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Customer */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={imgSrc(c.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                        alt={c.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white truncate block">{c.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono block truncate">@{c.username}</span>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{c.email}</span>
                      </span>
                      {c.phone && (
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{c.phone}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Nationality / Country */}
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{c.nationality || c.country || '—'}</span>
                    </span>
                  </td>

                  {/* VIP tier */}
                  <td className="py-3 px-4">
                    {c.vipTier && c.vipTier !== 'Standard' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                        <Crown className="w-2.5 h-2.5" />
                        <span>{c.vipTier}</span>
                        {tierByName.has(c.vipTier.toLowerCase()) && tierByName.get(c.vipTier.toLowerCase())! > 0 && (
                          <span className="opacity-70">· {tierByName.get(c.vipTier.toLowerCase())}%</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">{isRtl ? 'عادي' : 'Standard'}</span>
                    )}
                  </td>

                  {/* Status + verified */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col items-start gap-1">
                      {c.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{isRtl ? 'نشط' : 'Active'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{isRtl ? 'معطل' : 'Suspended'}</span>
                        </span>
                      )}
                      {c.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{isRtl ? 'موثّق' : 'Verified'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                          <Mail className="w-2.5 h-2.5" />
                          <span>{isRtl ? 'غير موثّق' : 'Unverified'}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Joined */}
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    {c.createdAt ? String(c.createdAt).split('T')[0] : '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition cursor-pointer active:scale-95"
                        title={isRtl ? 'تعديل' : 'Edit'}
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c)}
                        className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 border transition cursor-pointer active:scale-95 ${
                          c.status === 'active'
                            ? 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                        title={c.status === 'active' ? (isRtl ? 'تعطيل' : 'Suspend') : (isRtl ? 'تفعيل' : 'Activate')}
                      >
                        {c.status === 'active' ? <Power className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                        <span>{c.status === 'active' ? (isRtl ? 'تعطيل' : 'Suspend') : (isRtl ? 'تفعيل' : 'Activate')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                        title={isRtl ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== ADD CUSTOMER ===================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isRtl ? 'إضافة عميل جديد' : 'Add New Customer'}
              </h3>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                  <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)} required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-blue-600 dark:text-blue-400 font-bold mb-1">{isRtl ? 'اسم المستخدم' : 'Username'}</label>
                  <input type="text" value={addUsername} onChange={(e) => setAddUsername(e.target.value)} required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'البريد الإلكتروني' : 'Email'}</label>
                  <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'رقم الهاتف' : 'Phone'}</label>
                  <input type="text" value={addPhone} onChange={(e) => setAddPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono outline-none focus:border-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'الجنسية' : 'Nationality'}</label>
                  <input type="text" value={addNationality} onChange={(e) => setAddNationality(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'الفئة (VIP)' : 'VIP Tier'}</label>
                  <select value={addVipTier} onChange={(e) => setAddVipTier(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold outline-none cursor-pointer">
                    <option value="Standard">{isRtl ? 'عادي (0%)' : 'Standard (0%)'}</option>
                    {customerTiers.filter((t) => t.name !== 'Standard').map((t) => (
                      <option key={t.id} value={t.name}>{t.name} ({t.discountPercentage}%)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'كلمة المرور الابتدائية' : 'Initial Password'}</label>
                  <input type="text" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-purple-500" />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                {isRtl
                  ? 'يُنشأ الحساب معطلاً — فعّله من زر «تفعيل» في القائمة.'
                  : 'The account is created suspended — activate it from the “Activate” button in the list.'}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer">
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-purple-600/20 flex items-center gap-2 transition cursor-pointer active:scale-95">
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'إضافة العميل' : 'Add Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT CUSTOMER ===================== */}
      {editing && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditing(null)}
              className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Edit2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isRtl ? 'تعديل بيانات العميل' : 'Edit Customer'}
              </h3>
            </div>

            <form onSubmit={handleEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'الاسم الكامل' : 'Full Name'}</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'البريد الإلكتروني' : 'Email'}</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'رقم الهاتف' : 'Phone'}</label>
                  <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'الحالة' : 'Status'}</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold outline-none cursor-pointer">
                    <option value="active">{isRtl ? 'نشط' : 'Active'}</option>
                    <option value="inactive">{isRtl ? 'معطل' : 'Suspended'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'الجنسية' : 'Nationality'}</label>
                  <input type="text" value={editNationality} onChange={(e) => setEditNationality(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'الدولة' : 'Country'}</label>
                  <input type="text" value={editCountry} onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">{isRtl ? 'الفئة (VIP)' : 'VIP Tier'}</label>
                <select value={editVipTier} onChange={(e) => setEditVipTier(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold outline-none cursor-pointer">
                  <option value="Standard">{isRtl ? 'عادي (0%)' : 'Standard (0%)'}</option>
                  {customerTiers.filter((t) => t.name !== 'Standard').map((t) => (
                    <option key={t.id} value={t.name}>{t.name} ({t.discountPercentage}%)</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer">
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition cursor-pointer active:scale-95">
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'حفظ' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== DELETE CONFIRM ===================== */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
              {isRtl ? 'تأكيد حذف العميل' : 'Delete Customer'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              {isRtl
                ? `هل أنت متأكد من حذف "${deleteTarget.name}"؟ سيُحذف حسابه نهائياً.`
                : `Delete "${deleteTarget.name}" (@${deleteTarget.username})? Their account will be permanently removed.`}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer">
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer">
                {isRtl ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
