import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Plus,
  Eye,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  UserCheck,
  Check,
  X,
  Trash2,
  Edit3,
  TrendingDown,
  Printer,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinanceExpense, ExpenseCategory, ExpenseStatus } from '../../types';
import { DateFilterBar } from '../common/DateFilterBar';
import { MoneyInput } from '../common/MoneyInput';
import { matchesDateFilter } from '../../utils/dateFilter';

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    updateExpenseStatus,
    deleteExpense,
    airportDesks,
    roleConfig,
    currentRole,
    convertAmount,
    currency,
    language,
    dateFilter,
    setDateFilter,
    t,
  } = useApp();

  // Selected expense for detailed inspection & approval
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    expenses[0]?.id || null
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [approvalNoteInput, setApprovalNoteInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Add form fields
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Fleet Fuel');
  const [newDescription, setNewDescription] = useState('');
  const [newAmountQAR, setNewAmountQAR] = useState<number>(500);
  const [newPaymentMethod, setNewPaymentMethod] = useState<FinanceExpense['paymentMethod']>('Corporate Card');
  const [newDepartment, setNewDepartment] = useState('Ground Operations');
  const [newMerchant, setNewMerchant] = useState('Woqod Fuel Station');
  const [newReceiptNumber, setNewReceiptNumber] = useState(`RCP-${Math.floor(10000 + Math.random() * 90000)}`);
  const [newDeskId, setNewDeskId] = useState<string>('');
  const [newNotes, setNewNotes] = useState('');

  // Edit form state
  const [editingExpense, setEditingExpense] = useState<FinanceExpense | null>(null);

  // Categories list
  const categoryOptions: ExpenseCategory[] = [
    'Fleet Fuel',
    'Airport Apron Permits',
    'Camp Maintenance',
    'Hospitality / Karak',
    'Chauffeur Per Diem',
    'Vehicle Maintenance',
    'Marketing & PR',
    'Uniforms & Badges',
    'IT & Telecom',
    'Office Supplies',
    'VIP Terminal Concierge',
    'Other Operational',
  ];

  const departmentOptions = [
    'Ground Operations',
    'VIP Services',
    'Fleet Maintenance',
    'Corporate HQ',
    'Agent Desks',
    'Hospitality & Tourism',
  ];

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (departmentFilter !== 'ALL' && item.department !== departmentFilter) return false;

      // Date & Year Filter
      if (!matchesDateFilter(item.date, dateFilter)) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesMerchant = item.merchant?.toLowerCase().includes(query);
        const matchesSubmitter = item.submittedBy?.toLowerCase().includes(query);
        const matchesId = item.id?.toLowerCase().includes(query);
        const matchesReceipt = item.receiptNumber?.toLowerCase().includes(query);
        if (!matchesDesc && !matchesCategory && !matchesMerchant && !matchesSubmitter && !matchesId && !matchesReceipt) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, statusFilter, categoryFilter, departmentFilter, searchQuery, dateFilter]);

  // Selected item reference
  const selectedExpense = useMemo(() => {
    return expenses.find((e) => e.id === selectedExpenseId) || filteredExpenses[0] || null;
  }, [expenses, selectedExpenseId, filteredExpenses]);

  // Financial aggregates
  const totalAmountQAR = useMemo(() => expenses.reduce((acc, curr) => acc + (curr.amountQAR || 0), 0), [expenses]);
  const pendingExpenses = useMemo(() => expenses.filter((e) => e.status === 'Pending Review'), [expenses]);
  const pendingAmountQAR = useMemo(() => pendingExpenses.reduce((acc, curr) => acc + (curr.amountQAR || 0), 0), [pendingExpenses]);
  const approvedExpenses = useMemo(() => expenses.filter((e) => e.status === 'Approved'), [expenses]);
  const approvedAmountQAR = useMemo(() => approvedExpenses.reduce((acc, curr) => acc + (curr.amountQAR || 0), 0), [approvedExpenses]);
  const paidExpenses = useMemo(() => expenses.filter((e) => e.status === 'Paid'), [expenses]);
  const paidAmountQAR = useMemo(() => paidExpenses.reduce((acc, curr) => acc + (curr.amountQAR || 0), 0), [paidExpenses]);

  // Handle Approvals
  const handleApprove = (id: string) => {
    const res = updateExpenseStatus(id, 'Approved', approvalNoteInput || 'Approved by Executive Management');
    if (res.success) {
      setFeedbackMessage({ text: 'Expense approved successfully!', type: 'success' });
      setApprovalNoteInput('');
      setTimeout(() => setFeedbackMessage(null), 3500);
    } else {
      setFeedbackMessage({ text: res.error || 'Failed to approve', type: 'error' });
    }
  };

  const handleReject = (id: string) => {
    const reason = approvalNoteInput || 'Rejected per policy compliance';
    const res = updateExpenseStatus(id, 'Rejected', reason);
    if (res.success) {
      setFeedbackMessage({ text: 'Expense marked as Rejected.', type: 'success' });
      setApprovalNoteInput('');
      setTimeout(() => setFeedbackMessage(null), 3500);
    } else {
      setFeedbackMessage({ text: res.error || 'Failed to reject', type: 'error' });
    }
  };

  const handleMarkPaid = (id: string) => {
    const res = updateExpenseStatus(id, 'Paid', 'Disbursed via Treasury / Corporate Settlement');
    if (res.success) {
      setFeedbackMessage({ text: 'Expense marked as Paid and Disbursed.', type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3500);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense entry?')) {
      const res = deleteExpense(id);
      if (res.success) {
        if (selectedExpenseId === id) {
          setSelectedExpenseId(null);
        }
        setFeedbackMessage({ text: 'Expense record deleted.', type: 'success' });
        setTimeout(() => setFeedbackMessage(null), 3500);
      }
    }
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim() || newAmountQAR <= 0) {
      setFeedbackMessage({ text: 'Please provide valid description and amount.', type: 'error' });
      return;
    }

    const res = addExpense({
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: newCategory,
      description: newDescription,
      amountQAR: Number(newAmountQAR),
      approvedBy: 'Pending Audit',
      paymentMethod: newPaymentMethod,
      status: 'Pending Review',
      department: newDepartment,
      submittedBy: roleConfig.userDisplayName,
      receiptNumber: newReceiptNumber,
      merchant: newMerchant,
      notes: newNotes,
      relatedDeskId: newDeskId || undefined,
    });

    if (res.success && res.expense) {
      setSelectedExpenseId(res.expense.id);
      setShowAddModal(false);
      setNewDescription('');
      setNewNotes('');
      setFeedbackMessage({ text: 'New company expense successfully filed for review!', type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } else {
      setFeedbackMessage({ text: res.error || 'Failed to create expense', type: 'error' });
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    const res = updateExpense(editingExpense.id, editingExpense);
    if (res.success) {
      setShowEditModal(false);
      setEditingExpense(null);
      setFeedbackMessage({ text: 'Expense details updated.', type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3500);
    } else {
      setFeedbackMessage({ text: res.error || 'Failed to update', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Heading */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {language === 'ar' ? 'مصروفات الشركة واعتمادات الإنفاق' : 'Company Total Expenses & Approvals'}
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                {pendingExpenses.length} Pending Approval
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'ar'
                ? 'مراقبة كافة نفقات الشركة التشغيلية، فحص الفواتير، واعتماد المدفوعات بنداً بنداً.'
                : 'Centralized company expenditures journal. Review line-item vouchers, inspect receipts, and grant official executive approvals.'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? '+ تسجيل مصروف جديد' : '+ File New Expense'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards: Company Financial Expenditure Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Expenses Logged</span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {convertAmount(totalAmountQAR).formatted}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>{expenses.length} total vouchers</span>
            {currency !== 'QAR' && <span>Base: {totalAmountQAR.toLocaleString('en-US', { maximumFractionDigits: 0 })} QAR</span>}
          </div>
        </div>

        {/* Pending Review */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/30 dark:to-slate-900 border border-amber-200/80 dark:border-amber-800/60 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 text-xs font-semibold">
            <span className="uppercase tracking-wider">Awaiting Executive Approval</span>
            <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900 dark:text-amber-300 font-mono">
              {pendingAmountQAR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">QAR</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-300 font-semibold flex items-center justify-between">
            <span>{pendingExpenses.length} vouchers pending</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900 text-[10px] font-bold">Action Required</span>
          </div>
        </div>

        {/* Approved */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Approved / Cleared</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {approvedAmountQAR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">QAR</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>{approvedExpenses.length} vouchers cleared</span>
            <span className="text-emerald-600 font-semibold">Ready for Disbursement</span>
          </div>
        </div>

        {/* Paid / Settled */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span className="font-semibold uppercase tracking-wider">Settled & Paid</span>
            <CreditCard className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {paidAmountQAR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">QAR</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>{paidExpenses.length} vouchers paid</span>
            <span className="text-indigo-500 font-semibold">Treasury Reconciled</span>
          </div>
        </div>
      </div>

      {/* Date & Year Filter Engine */}
      <DateFilterBar
        filter={dateFilter}
        onChange={setDateFilter}
        totalCount={expenses.length}
        filteredCount={filteredExpenses.length}
        label={language === 'ar' ? 'تصفية المصروفات حسب التاريخ والسنة' : 'Expenses Date & Year Filter'}
      />

      {/* Main Split Layout: Left Table / List (7 cols) & Right Deep Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Filter controls + List of all company expenses */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search voucher, merchant, submitter, category..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['ALL', 'Pending Review', 'Approved', 'Paid', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === status
                        ? 'bg-slate-900 text-white dark:bg-blue-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {status}
                    {status === 'Pending Review' && pendingExpenses.length > 0 && (
                      <span className="ml-1.5 px-1 rounded-full bg-amber-500 text-slate-900 text-[10px]">
                        {pendingExpenses.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Filters: Category & Department */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Categories ({categoryOptions.length})</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <span className="text-slate-400 text-[11px] font-semibold ml-2">Department:</span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                {departmentOptions.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>

              {(statusFilter !== 'ALL' || categoryFilter !== 'ALL' || departmentFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setCategoryFilter('ALL');
                    setDepartmentFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold ml-auto"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Expenses List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
              <span>Full Company Expenses ({filteredExpenses.length})</span>
              <span className="font-mono">Select item to view & approve</span>
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 space-y-2">
                <Receipt className="w-8 h-8 mx-auto text-slate-400 opacity-50" />
                <p className="text-sm font-semibold">No expense records match your current filters.</p>
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setCategoryFilter('ALL');
                    setDepartmentFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs text-blue-600 underline font-bold"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredExpenses.map((expense) => {
                const isSelected = selectedExpense?.id === expense.id;
                const isPending = expense.status === 'Pending Review';
                const isApproved = expense.status === 'Approved';
                const isPaid = expense.status === 'Paid';
                const isRejected = expense.status === 'Rejected';

                return (
                  <div
                    key={expense.id}
                    onClick={() => setSelectedExpenseId(expense.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Status Icon Indicator */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isPending
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                              : isApproved
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : isPaid
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                          }`}
                        >
                          {isPending && <Clock className="w-4 h-4 animate-pulse" />}
                          {isApproved && <CheckCircle2 className="w-4 h-4" />}
                          {isPaid && <Check className="w-4 h-4 font-bold" />}
                          {isRejected && <XCircle className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                              {expense.id}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {expense.category}
                            </span>
                            {expense.department && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                • {expense.department}
                              </span>
                            )}
                          </div>

                          <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                            {expense.description}
                          </h3>

                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-mono">
                            <span>{expense.date}</span>
                            {expense.merchant && <span>• {expense.merchant}</span>}
                            {expense.submittedBy && <span>• by {expense.submittedBy}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right Amount & Status */}
                      <div className="text-right shrink-0">
                        <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                          {convertAmount(expense.amountQAR).formatted}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : isPaid
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {expense.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Deep Details & One-by-One Approval Action Panel (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          {selectedExpense ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {selectedExpense.id}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedExpense.status === 'Pending Review'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : selectedExpense.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : selectedExpense.status === 'Paid'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {selectedExpense.status}
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                    {selectedExpense.category}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Receipt Ref: {selectedExpense.receiptNumber || 'None'}
                  </p>
                </div>

                {/* Edit / Delete Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingExpense({ ...selectedExpense });
                      setShowEditModal(true);
                    }}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Expense"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedExpense.id)}
                    className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete Expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Amount Highlight Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Total Expense Amount
                  </span>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                    {convertAmount(selectedExpense.amountQAR).formatted}
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-slate-500">
                  <div>Base: {selectedExpense.amountQAR.toLocaleString('en-US', { minimumFractionDigits: 2 })} QAR</div>
                </div>
              </div>

              {/* Detailed Key-Value Grid */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">Description</span>
                  <span className="text-slate-900 dark:text-slate-200 font-semibold text-right max-w-[240px]">
                    {selectedExpense.description}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">Department</span>
                  <span className="text-slate-900 dark:text-slate-200 font-bold">
                    {selectedExpense.department || 'General Operations'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">Vendor / Merchant</span>
                  <span className="text-slate-900 dark:text-slate-200 font-bold">
                    {selectedExpense.merchant || 'Standard Vendor'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">Payment Method</span>
                  <span className="text-slate-900 dark:text-slate-200 font-mono font-bold">
                    {selectedExpense.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">Submitted By</span>
                  <span className="text-slate-900 dark:text-slate-200 font-bold">
                    {selectedExpense.submittedBy || 'Operations Lead'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 font-medium">Date & Time</span>
                  <span className="text-slate-900 dark:text-slate-200 font-mono">
                    {selectedExpense.date}
                  </span>
                </div>

                {selectedExpense.relatedDeskId && (
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-500 font-medium">Linked Agent Desk</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">
                      {airportDesks.find((d) => d.id === selectedExpense.relatedDeskId)?.deskName || selectedExpense.relatedDeskId}
                    </span>
                  </div>
                )}

                {selectedExpense.notes && (
                  <div className="py-2">
                    <span className="text-slate-500 font-medium block text-[11px] uppercase tracking-wider mb-1">
                      Business Justification & Notes:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs">
                      {selectedExpense.notes}
                    </p>
                  </div>
                )}

                {/* Audit & Approval Trail */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                    Approval Audit Trail:
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sign-off Status:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{selectedExpense.approvedBy}</strong>
                    </div>
                    {selectedExpense.approvedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Approved At:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono">{selectedExpense.approvedAt}</span>
                      </div>
                    )}
                    {selectedExpense.rejectedReason && (
                      <div className="flex justify-between text-rose-600 dark:text-rose-400">
                        <span>Rejection Reason:</span>
                        <span className="font-semibold">{selectedExpense.rejectedReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION AREA: Approval & Disbursal Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Executive Approval Decision:
                </span>

                {/* Input for approval or rejection notes */}
                <div>
                  <input
                    type="text"
                    value={approvalNoteInput}
                    onChange={(e) => setApprovalNoteInput(e.target.value)}
                    placeholder="Approval comments or condition notes..."
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApprove(selectedExpense.id)}
                    disabled={selectedExpense.status === 'Approved'}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedExpense.status === 'Approved'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Voucher</span>
                  </button>

                  <button
                    onClick={() => handleReject(selectedExpense.id)}
                    disabled={selectedExpense.status === 'Rejected'}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      selectedExpense.status === 'Rejected'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject / Flag</span>
                  </button>
                </div>

                {/* Secondary Action: Disburse Payment */}
                {selectedExpense.status === 'Approved' && (
                  <button
                    onClick={() => handleMarkPaid(selectedExpense.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Mark as Paid & Disburse from Treasury</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 space-y-2">
              <Eye className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-sm font-semibold">Select an expense voucher from the left to view details and grant approval.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add New Company Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    File Company Operational Expense
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Submit line item for executive financial audit</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Expense Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description / Purpose *
                </label>
                <input
                  type="text"
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. Woqod Fuel replenishment for desert safari 4x4 convoys"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount ({currency}) *
                  </label>
                  <MoneyInput
                    valueQAR={newAmountQAR}
                    onChangeQAR={setNewAmountQAR}
                    required
                    min={1}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Cash Drawer">Cash Drawer (Petty Cash)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Fuel Card">Woqod Fuel Card</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Department
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    {departmentOptions.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Vendor / Merchant
                  </label>
                  <input
                    type="text"
                    value={newMerchant}
                    onChange={(e) => setNewMerchant(e.target.value)}
                    placeholder="Merchant or Service Provider"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Receipt / Invoice Ref #
                  </label>
                  <input
                    type="text"
                    value={newReceiptNumber}
                    onChange={(e) => setNewReceiptNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Airport Counter Link (Optional)
                  </label>
                  <select
                    value={newDeskId}
                    onChange={(e) => setNewDeskId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="">None / Corporate Wide</option>
                    {airportDesks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.airportCode}: {d.deskName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Audit Notes / Reason
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional context, guest voucher link, or emergency dispatch reason..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Expense */}
      {showEditModal && editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Edit Expense Voucher ({editingExpense.id})
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Modify expense details and records</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount ({currency})
                  </label>
                  <MoneyInput
                    valueQAR={editingExpense.amountQAR}
                    onChangeQAR={(qar) => setEditingExpense({ ...editingExpense, amountQAR: qar })}
                    required
                    min={1}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={editingExpense.category}
                    onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Merchant / Vendor
                  </label>
                  <input
                    type="text"
                    value={editingExpense.merchant || ''}
                    onChange={(e) => setEditingExpense({ ...editingExpense, merchant: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editingExpense.department || ''}
                    onChange={(e) => setEditingExpense({ ...editingExpense, department: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={editingExpense.status}
                    onChange={(e) => setEditingExpense({ ...editingExpense, status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none font-bold"
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={editingExpense.paymentMethod}
                    onChange={(e) => setEditingExpense({ ...editingExpense, paymentMethod: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Cash Drawer">Cash Drawer</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Fuel Card">Fuel Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Audit Notes
                </label>
                <textarea
                  rows={2}
                  value={editingExpense.notes || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
