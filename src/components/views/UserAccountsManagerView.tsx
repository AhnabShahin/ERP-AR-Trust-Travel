import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  KeyRound,
  User,
  Users,
  Search,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Trash2,
  RefreshCw,
  Lock,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Shield,
  X,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAccount, UserRole } from '../../types';

export const UserAccountsManagerView: React.FC = () => {
  const {
    userAccounts,
    updateUserAccount,
    addUserAccount,
    deleteUserAccount,
    resetUserPassword,
    currentUser,
    currentRole,
    language,
    t,
  } = useApp();

  const isRtl = language === 'ar';

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Password visibility set (account IDs whose password is revealed)
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickResetAccount, setQuickResetAccount] = useState<UserAccount | null>(null);
  const [quickResetPass, setQuickResetPass] = useState('');
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<UserAccount | null>(null);

  // Edit Modal Form State
  const [editName, setEditName] = useState('');
  const [editNameAr, setEditNameAr] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('transit-agent');
  const [editPhone, setEditPhone] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
  const [showEditPass, setShowEditPass] = useState(false);

  // Add Modal Form State
  const [addName, setAddName] = useState('');
  const [addNameAr, setAddNameAr] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('pass123');
  const [addRole, setAddRole] = useState<UserRole>('transit-agent');
  const [addPhone, setAddPhone] = useState('+974 ');
  const [addDept, setAddDept] = useState('Airport Desk Counter');
  const [showAddPass, setShowAddPass] = useState(false);

  // Feedback notifications
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const notifySuccess = (msg: string) => {
    setFeedbackSuccess(msg);
    setTimeout(() => setFeedbackSuccess(null), 3500);
  };

  const notifyError = (msg: string) => {
    setFeedbackError(msg);
    setTimeout(() => setFeedbackError(null), 4000);
  };

  // Toggle reveal password
  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Copy password to clipboard
  const handleCopyPassword = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    notifySuccess(isRtl ? 'تم نسخ كلمة المرور إلى الحافظة' : 'Password copied to clipboard');
  };

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return userAccounts.filter((acc) => {
      const matchSearch =
        acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (acc.nameAr && acc.nameAr.includes(searchQuery));

      const matchRole = roleFilter === 'ALL' || acc.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || acc.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [userAccounts, searchQuery, roleFilter, statusFilter]);

  // Open Edit Modal
  const handleOpenEdit = (acc: UserAccount) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditNameAr(acc.nameAr || '');
    setEditUsername(acc.username);
    setEditEmail(acc.email);
    setEditPassword(acc.password);
    setEditRole(acc.role);
    setEditPhone(acc.phone || '');
    setEditDept(acc.department || '');
    setEditStatus(acc.status);
    setShowEditPass(false);
  };

  // Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    if (!editUsername.trim()) {
      notifyError(isRtl ? 'اسم المستخدم مطلوب.' : 'Username is required.');
      return;
    }
    if (!editPassword.trim()) {
      notifyError(isRtl ? 'كلمة المرور مطلوبة.' : 'Password cannot be blank.');
      return;
    }

    const res = updateUserAccount(editingAccount.id, {
      name: editName.trim(),
      nameAr: editNameAr.trim() || undefined,
      username: editUsername.trim(),
      email: editEmail.trim(),
      password: editPassword.trim(),
      role: editRole,
      phone: editPhone.trim() || undefined,
      department: editDept.trim() || undefined,
      status: editStatus,
    });

    if (res.success) {
      notifySuccess(
        isRtl
          ? `تم تحديث بيانات وكلمة مرور الحساب ${editUsername} بنجاح!`
          : `Credentials & password updated successfully for ${editUsername}!`
      );
      setEditingAccount(null);
    } else {
      notifyError(res.error || 'Failed to update credentials.');
    }
  };

  // Handle Add Account
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addUsername.trim() || !addEmail.trim() || !addPassword.trim()) {
      notifyError(isRtl ? 'يرجى ملء جميع الحقول الإلزامية.' : 'Please fill all mandatory fields.');
      return;
    }

    const res = addUserAccount({
      name: addName.trim(),
      nameAr: addNameAr.trim() || undefined,
      username: addUsername.trim(),
      email: addEmail.trim(),
      password: addPassword.trim(),
      role: addRole,
      phone: addPhone.trim() || undefined,
      department: addDept.trim() || undefined,
      status: 'active',
      lastLogin: 'Never',
    });

    if (res.success) {
      notifySuccess(
        isRtl
          ? `تم إنشاء الحساب ${addUsername} بنجاح مع كلمة المرور المحددة!`
          : `User account ${addUsername} added successfully with configured ID & password!`
      );
      setShowAddModal(false);
      // Reset form
      setAddName('');
      setAddNameAr('');
      setAddUsername('');
      setAddEmail('');
      setAddPassword('pass123');
    } else {
      notifyError(res.error || 'Failed to add user account.');
    }
  };

  // Handle Quick Password Reset
  const handleQuickResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickResetAccount) return;
    if (!quickResetPass || quickResetPass.trim().length < 4) {
      notifyError(isRtl ? 'يجب أن لا تقل كلمة المرور عن 4 أحرف.' : 'Password must be at least 4 characters.');
      return;
    }

    const res = resetUserPassword(quickResetAccount.id, quickResetPass.trim());
    if (res.success) {
      notifySuccess(
        isRtl
          ? `تم تغيير كلمة المرور للحساب ${quickResetAccount.username} بنجاح!`
          : `Password successfully changed for user ${quickResetAccount.username}!`
      );
      setQuickResetAccount(null);
      setQuickResetPass('');
    } else {
      notifyError(res.error || 'Failed to reset password.');
    }
  };

  // Handle Delete Account
  const handleDelete = () => {
    if (!deleteConfirmAccount) return;
    const res = deleteUserAccount(deleteConfirmAccount.id);
    if (res.success) {
      notifySuccess(
        isRtl
          ? `تم حذف الحساب ${deleteConfirmAccount.username} من المنظومة.`
          : `Account ${deleteConfirmAccount.username} removed from system.`
      );
      setDeleteConfirmAccount(null);
    } else {
      notifyError(res.error || 'Cannot delete account.');
    }
  };

  // Helper to generate a strong random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Top Banner & Stats */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isRtl ? 'إدارة حسابات الدخول وكلمات المرور (Admin ID & Passwords)' : 'System User Accounts & Password Management'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                    Super Admin Console
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRtl
                    ? 'التحكم الكامل بجميع حسابات المنظومة: استعراض وتغيير اسم المستخدم (ID)، والبريد، وكلمة المرور، والصلاحيات مع سجلات المراقبة.'
                    : 'Manage, edit, and reset IDs, usernames, and passwords for all staff and operational roles with full audit tracking.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action: Add User */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{isRtl ? '+ إضافة حساب جديد' : '+ Create User Account'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 text-[10px] font-mono uppercase block">{isRtl ? 'إجمالي الحسابات' : 'Total Accounts'}</span>
            <span className="text-lg font-black text-slate-900 dark:text-white font-mono">{userAccounts.length}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-mono uppercase block">{isRtl ? 'حسابات نشطة' : 'Active Accounts'}</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {userAccounts.filter((u) => u.status === 'active').length}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40">
            <span className="text-purple-600 dark:text-purple-400 text-[10px] font-mono uppercase block">{isRtl ? 'صلاحيات المدير' : 'Super Admins'}</span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
              {userAccounts.filter((u) => u.role === 'super-admin').length}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40">
            <span className="text-blue-600 dark:text-blue-400 text-[10px] font-mono uppercase block">{isRtl ? 'حسابك الحالي' : 'Active Session'}</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate block mt-1">
              {currentUser?.username} ({currentUser?.role})
            </span>
          </div>
        </div>
      </div>

      {/* Notifications banner */}
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

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'بحث بالاسم، اسم المستخدم، أو البريد...' : 'Search by name, ID/username, email...'}
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 pl-9 rtl:pl-3 rtl:pr-9 text-slate-900 dark:text-white placeholder-slate-400 text-xs outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-xs font-medium outline-none cursor-pointer"
          >
            <option value="ALL">{isRtl ? 'جميع الأدوار' : 'All Roles'}</option>
            <option value="super-admin">Super Admin</option>
            <option value="operations-manager">Operations Manager</option>
            <option value="transit-agent">Transit Desk Agent</option>
            <option value="driver-guide">Driver / Guide</option>
            <option value="finance-accountant">Finance / Accountant</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 text-xs font-medium outline-none cursor-pointer"
          >
            <option value="ALL">{isRtl ? 'جميع الحالات' : 'All Status'}</option>
            <option value="active">{isRtl ? 'نشط' : 'Active'}</option>
            <option value="inactive">{isRtl ? 'معطل' : 'Suspended'}</option>
          </select>

          <span className="text-[11px] text-slate-400 font-mono shrink-0 px-1">
            {filteredAccounts.length} / {userAccounts.length}
          </span>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">{isRtl ? 'المستخدم / الكادر' : 'User / Staff Profile'}</th>
                <th className="py-3 px-4">{isRtl ? 'معرف الدخول (ID / Username)' : 'Login ID / Username'}</th>
                <th className="py-3 px-4">{isRtl ? 'كلمة المرور الحالية (Password)' : 'Current Password'}</th>
                <th className="py-3 px-4">{isRtl ? 'الصلاحية / الدور' : 'System Role'}</th>
                <th className="py-3 px-4">{isRtl ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4">{isRtl ? 'آخر دخول' : 'Last Login'}</th>
                <th className="py-3 px-4 text-center">{isRtl ? 'إجراءات المدير' : 'Admin Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredAccounts.map((acc) => {
                const isRevealed = revealedPasswords.has(acc.id);
                const isCurrent = currentUser?.id === acc.id;

                const getRoleBadgeStyle = (r: UserRole) => {
                  switch (r) {
                    case 'super-admin':
                      return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
                    case 'operations-manager':
                      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                    case 'transit-agent':
                      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                    case 'driver-guide':
                      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                    case 'finance-accountant':
                      return 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
                    default:
                      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                  }
                };

                return (
                  <tr
                    key={acc.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isCurrent ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                    }`}
                  >
                    {/* User profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={acc.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={acc.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {acc.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold shrink-0">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {acc.department || acc.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Login ID / Username */}
                    <td className="py-3 px-4 font-mono">
                      <div>
                        <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                          {acc.username}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {acc.email}
                        </span>
                      </div>
                    </td>

                    {/* Password column */}
                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <span className="font-bold tracking-wider">
                            {isRevealed ? acc.password : '••••••••'}
                          </span>

                          {/* Reveal toggle */}
                          <button
                            type="button"
                            onClick={() => toggleRevealPassword(acc.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-0.5"
                            title={isRevealed ? 'Mask password' : 'Show password'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          {/* Copy password */}
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(acc.password, acc.id)}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer p-0.5"
                            title="Copy password"
                          >
                            {copiedId === acc.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Quick Reset Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setQuickResetAccount(acc);
                            setQuickResetPass(generateRandomPassword());
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="Quick Reset Password"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold text-[10px] border ${getRoleBadgeStyle(
                          acc.role
                        )}`}
                      >
                        <Shield className="w-3 h-3" />
                        <span>{acc.role}</span>
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="py-3 px-4">
                      {acc.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      {acc.lastLogin || 'Never'}
                    </td>

                    {/* Admin Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Credentials */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(acc)}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition cursor-pointer active:scale-95"
                          title="Change ID & Password / Edit Profile"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{isRtl ? 'تغيير ID & Pass' : 'Edit ID & Pass'}</span>
                        </button>

                        {/* Delete Account */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmAccount(acc)}
                          disabled={acc.role === 'super-admin' && userAccounts.filter((u) => u.role === 'super-admin').length <= 1}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== MODAL 1: EDIT CREDENTIALS & PASSWORD ===================== */}
      {editingAccount && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setEditingAccount(null)}
              className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isRtl ? 'تعديل بيانات الحساب وكلمة المرور' : 'Change Account Credentials & Password'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  User ID: {editingAccount.id} · ({editingAccount.name})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Full Name & Arabic Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'الاسم الكامل (إنجليزي)' : 'Full Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'الاسم (بالعربي)' : 'Full Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={editNameAr}
                    onChange={(e) => setEditNameAr(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Username (Login ID) & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-blue-600 dark:text-blue-400 font-bold mb-1">
                    {isRtl ? 'اسم الدخول / المعرف (ID)' : 'Login Username / ID'}
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-xl px-3 py-2 pl-8 rtl:pl-3 rtl:pr-8 text-slate-900 dark:text-white font-mono font-bold outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'البريد الإلكتروني' : 'Account Email'}
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pl-8 rtl:pl-3 rtl:pr-8 text-slate-900 dark:text-white font-mono outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password change field with Generator */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'كلمة المرور الجديدة (Change Password)' : 'New Account Password'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setEditPassword(generateRandomPassword())}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isRtl ? 'توليد كلمة سر قوية' : 'Generate Secure'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showEditPass ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/80 rounded-xl px-3 py-2 pr-9 rtl:pr-3 rtl:pl-9 text-slate-900 dark:text-white font-mono font-bold outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
                    className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showEditPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {isRtl
                    ? 'سيتمكن الموظف من تسجيل الدخول بكلمة المرور هذه فور حفظ التغييرات.'
                    : 'The user will immediately authenticate with this password.'}
                </p>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'الدور الوظيفي' : 'System Role'}
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold outline-none cursor-pointer"
                  >
                    <option value="super-admin">Super Admin</option>
                    <option value="operations-manager">Operations Manager</option>
                    <option value="transit-agent">Transit Desk Agent</option>
                    <option value="driver-guide">Driver / Guide</option>
                    <option value="finance-accountant">Finance / Accountant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'حالة الحساب' : 'Account Status'}
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold outline-none cursor-pointer"
                  >
                    <option value="active">{isRtl ? 'نشط (Active)' : 'Active'}</option>
                    <option value="inactive">{isRtl ? 'معطل (Suspended)' : 'Suspended'}</option>
                  </select>
                </div>
              </div>

              {/* Phone & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'رقم الهاتف' : 'Contact Phone'}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'القسم / المحطة' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium outline-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'حفظ بيانات وكلمة مرور الحساب' : 'Save Credentials & Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: ADD NEW USER ACCOUNT ===================== */}
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
              <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isRtl ? 'إنشاء حساب مستخدم جديد (New Staff ID)' : 'Register New System User Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isRtl ? 'تحديد اسم المستخدم، وكلمة المرور، والصلاحيات التشغيلية' : 'Configure login ID, password, and operational role access'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Maryam Al-Kuwari"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-blue-600 dark:text-blue-400 font-bold mb-1">
                    {isRtl ? 'اسم الدخول (Login ID / Username)' : 'Login Username / ID'}
                  </label>
                  <input
                    type="text"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    placeholder="e.g. maryam"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="maryam@artrust.qa"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'الصلاحيات والدور' : 'Operational Role'}
                  </label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as UserRole)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold outline-none cursor-pointer"
                  >
                    <option value="transit-agent">Transit Desk Agent</option>
                    <option value="operations-manager">Operations Manager</option>
                    <option value="driver-guide">Driver / Guide</option>
                    <option value="finance-accountant">Finance / Accountant</option>
                    <option value="super-admin">Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Password configuration */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'كلمة المرور الابتدائية' : 'Initial Password'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setAddPassword(generateRandomPassword())}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isRtl ? 'توليد تلقائي' : 'Auto Generate'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showAddPass ? 'text' : 'password'}
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700/80 rounded-xl px-3 py-2 pr-9 rtl:pr-3 rtl:pl-9 text-slate-900 dark:text-white font-mono font-bold outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPass(!showAddPass)}
                    className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showAddPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Department & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'القسم / المحطة التشغيلية' : 'Department'}
                  </label>
                  <input
                    type="text"
                    value={addDept}
                    onChange={(e) => setAddDept(e.target.value)}
                    placeholder="Arrivals Desk Counter 4"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    {isRtl ? 'رقم الهاتف' : 'Contact Phone'}
                  </label>
                  <input
                    type="text"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="+974 5511 2233"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'إنشاء الحساب وتعيين كلمة المرور' : 'Create Account & Assign Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: QUICK PASSWORD RESET ===================== */}
      {quickResetAccount && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setQuickResetAccount(null)}
              className="absolute top-5 right-5 rtl:right-auto rtl:left-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isRtl ? 'إعادة تعيين كلمة المرور السريعة' : 'Quick Password Reset'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {quickResetAccount.name} (@{quickResetAccount.username})
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickResetSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  {isRtl ? 'كلمة المرور الجديدة' : 'Set New Password'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={quickResetPass}
                    onChange={(e) => setQuickResetPass(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold outline-none focus:border-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setQuickResetPass(generateRandomPassword())}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    {isRtl ? 'عشوائي' : 'Randomize'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickResetAccount(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-md shadow-amber-600/20 flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? 'تحديث كلمة المرور' : 'Apply Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 4: DELETE CONFIRMATION ===================== */}
      {deleteConfirmAccount && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
              {isRtl ? 'تأكيد حذف الحساب' : 'Confirm Account Deletion'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              {isRtl
                ? `هل أنت متأكد من حذف الحساب "${deleteConfirmAccount.username}"؟ لن يتمكن المستخدم من الدخول للمنظومة مجدداً.`
                : `Are you sure you want to permanently delete "${deleteConfirmAccount.username}" (${deleteConfirmAccount.name})? This user will lose system access.`}
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAccount(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                {isRtl ? 'حذف الحساب' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
