import React, { useState } from 'react';
import {
  Users,
  Store,
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  BadgePercent,
  Receipt,
  Printer,
  ChevronDown,
  Building2,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  UserCheck,
  Calendar,
  Layers,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AirportDesk, Employee, EmployeeMonthlyRecord } from '../../types';
import { DateFilterBar } from '../common/DateFilterBar';
import { matchesDateFilter } from '../../utils/dateFilter';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    recordEmployeeSalaryPayment,
    addEmployeeExpense,
    airportDesks,
    addAirportDesk,
    updateAirportDesk,
    deleteAirportDesk,
    roleConfig,
    currentRole,
    convertAmount,
    language,
    dateFilter,
    setDateFilter,
    t,
  } = useApp();

  const isManagerOrAdmin = currentRole === 'super-admin' || currentRole === 'operations-manager';

  // Sub-tabs: 'staff' | 'desks' | 'payroll'
  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'desks' | 'payroll'>('staff');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [airportFilter, setAirportFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [staffLayoutMode, setStaffLayoutMode] = useState<'card' | 'list'>('card');

  // Modals state
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAddDeskModal, setShowAddDeskModal] = useState(false);
  const [showEditDeskModal, setShowEditDeskModal] = useState<AirportDesk | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Quick Payout & Expense Modal inside Details
  const [showPayoutModal, setShowPayoutModal] = useState<{ employeeId: string; month: string; amountDue: number } | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutNotes, setPayoutNotes] = useState<string>('');
  const [showExpenseModal, setShowExpenseModal] = useState<{ employeeId: string; month: string } | null>(null);
  const [expenseAmount, setExpenseAmount] = useState<number>(150);
  const [expenseDesc, setExpenseDesc] = useState<string>('');

  // Selected Month in Employee Details Modal
  const [detailSelectedMonth, setDetailSelectedMonth] = useState<string>('October 2026');

  // Feedback notifications
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Add Employee Form State
  const [empName, setEmpName] = useState('');
  const [empNameAr, setEmpNameAr] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('+974 ');
  const [empRole, setEmpRole] = useState('Transit Desk Lead Agent');
  const [empDept, setEmpDept] = useState<'Airport Desk' | 'Operations' | 'Field Drivers' | 'Tour Guides' | 'Finance'>('Airport Desk');
  const [empAirport, setEmpAirport] = useState('Hamad International Airport (DOH)');
  const [empDeskId, setEmpDeskId] = useState(airportDesks[0]?.id || '');
  const [empBaseSalary, setEmpBaseSalary] = useState<number>(6500);
  const [empTarget, setEmpTarget] = useState<number>(25);
  const [empCommissionPerService, setEmpCommissionPerService] = useState<number>(35);
  const [empEmergencyContact, setEmpEmergencyContact] = useState('+974 ');

  // Add / Edit Desk Form State
  const [deskAirportName, setDeskAirportName] = useState('Hamad International Airport (DOH)');
  const [deskAirportCode, setDeskAirportCode] = useState('DOH');
  const [deskCode, setDeskCode] = useState('HIA-CTR-05');
  const [deskName, setDeskName] = useState('');
  const [deskNameAr, setDeskNameAr] = useState('');
  const [deskTerminal, setDeskTerminal] = useState('Terminal 1 - Arrivals Hall');
  const [deskZone, setDeskZone] = useState('Arrivals Ground Floor / Bay 3');
  const [deskAssignedEmpId, setDeskAssignedEmpId] = useState('');
  const [deskShiftTiming, setDeskShiftTiming] = useState('06:00 AM - 14:30 PM (Morning Shift)');
  const [deskPhoneExt, setDeskPhoneExt] = useState('+974 4010 8850');
  const [deskNotes, setDeskNotes] = useState('');
  const [deskStatus, setDeskStatus] = useState<AirportDesk['status']>('Active');

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setFeedbackError(msg);
      setTimeout(() => setFeedbackError(null), 4000);
    } else {
      setFeedbackSuccess(msg);
      setTimeout(() => setFeedbackSuccess(null), 3500);
    }
  };

  // Filter Employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.phone.includes(searchQuery) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesAirport = airportFilter === 'ALL' || emp.assignedAirport === airportFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesAirport && matchesStatus;
  });

  // Calculate High Level Metrics
  const totalEmployees = employees.length;
  const deskEmployeesCount = employees.filter((e) => e.assignedDeskId).length;
  const totalBasePayroll = employees.reduce((acc, e) => acc + e.baseSalaryMonthlyQAR, 0);

  // Commission accrued in current month (October 2026) across all employees
  const totalAccruedCommissionCurrentMonth = employees.reduce((acc, emp) => {
    const currentRec = emp.monthlyRecords.find((r) => r.month === 'October 2026');
    return acc + (currentRec ? currentRec.commissionEarnedQAR : 0);
  }, 0);

  const targetsAchievedCount = employees.filter((emp) => {
    const currentRec = emp.monthlyRecords.find((r) => r.month === 'October 2026');
    return currentRec && currentRec.targetMet;
  }).length;

  const targetAttainmentRate = totalEmployees > 0 ? Math.round((targetsAchievedCount / totalEmployees) * 100) : 0;

  // Handle Create Employee
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) {
      showNotification('Employee name is required', true);
      return;
    }
    const selectedDesk = airportDesks.find((d) => d.id === empDeskId);
    const res = addEmployee({
      name: empName.trim(),
      nameAr: empNameAr.trim() || empName.trim(),
      email: empEmail.trim() || `${empName.toLowerCase().replace(/\s+/g, '.')}@artrusttravel.com`,
      phone: empPhone,
      role: empRole,
      department: empDept,
      assignedAirport: empAirport,
      assignedDeskId: empDeskId,
      assignedDeskName: selectedDesk ? selectedDesk.deskName : 'Unallocated',
      status: 'On Duty',
      hireDate: new Date().toISOString().split('T')[0],
      baseSalaryMonthlyQAR: Number(empBaseSalary) || 6000,
      monthlyServiceTarget: Number(empTarget) || 20,
      commissionPerServiceQAR: Number(empCommissionPerService) || 30,
      totalExpensesQAR: 0,
      rating: 5.0,
      emergencyContact: empEmergencyContact,
      monthlyRecords: [
        {
          month: 'October 2026',
          baseSalaryQAR: Number(empBaseSalary) || 6000,
          targetServices: Number(empTarget) || 20,
          completedServices: 0,
          targetMet: false,
          excessServices: 0,
          commissionRatePerService: Number(empCommissionPerService) || 30,
          commissionEarnedQAR: 0,
          expensesReimbursedQAR: 0,
          deductionsQAR: 0,
          grossPayableQAR: Number(empBaseSalary) || 6000,
          amountPaidQAR: 0,
          amountDueQAR: Number(empBaseSalary) || 6000,
          status: 'Pending Payout',
          notes: 'Initial cycle setup.',
        },
      ],
    });

    if (res.success) {
      showNotification(`Employee ${empName} successfully added!`);
      setShowAddEmployeeModal(false);
      setEmpName('');
      setEmpNameAr('');
      setEmpEmail('');
      setEmpPhone('+974 ');
    } else {
      showNotification(res.error || 'Failed to add employee', true);
    }
  };

  // Handle Edit Employee Submit
  const handleUpdateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    const selectedDesk = airportDesks.find((d) => d.id === editingEmployee.assignedDeskId);
    const res = updateEmployee(editingEmployee.id, {
      ...editingEmployee,
      assignedDeskName: selectedDesk ? selectedDesk.deskName : editingEmployee.assignedDeskName,
    });
    if (res.success) {
      showNotification(`Employee ${editingEmployee.name} updated successfully!`);
      // Update selectedEmployee if open
      if (selectedEmployee?.id === editingEmployee.id) {
        setSelectedEmployee({ ...editingEmployee, assignedDeskName: selectedDesk ? selectedDesk.deskName : editingEmployee.assignedDeskName });
      }
      setEditingEmployee(null);
    } else {
      showNotification(res.error || 'Failed to update employee', true);
    }
  };

  // Handle Create Airport Desk
  const handleCreateDesk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deskName.trim()) {
      showNotification('Desk name is required', true);
      return;
    }
    const assignedEmp = employees.find((emp) => emp.id === deskAssignedEmpId);
    const res = addAirportDesk({
      airportCode: deskAirportCode.toUpperCase().trim() || 'DOH',
      airportName: deskAirportName.trim(),
      deskCode: deskCode.trim(),
      deskName: deskName.trim(),
      deskNameAr: deskNameAr.trim() || deskName.trim(),
      terminal: deskTerminal.trim(),
      zone: deskZone.trim(),
      assignedEmployeeId: assignedEmp ? assignedEmp.id : '',
      assignedEmployeeName: assignedEmp ? assignedEmp.name : 'Unassigned',
      assignedEmployeeRole: assignedEmp ? assignedEmp.role : 'Desk Staff',
      status: deskStatus,
      shiftTiming: deskShiftTiming,
      phoneExt: deskPhoneExt,
      notes: deskNotes,
    });

    if (res.success && res.desk) {
      // If an employee was assigned to this desk, also update that employee's assigned desk!
      if (assignedEmp) {
        updateEmployee(assignedEmp.id, {
          assignedDeskId: res.desk.id,
          assignedDeskName: res.desk.deskName,
          assignedAirport: res.desk.airportName,
        });
      }
      showNotification(`Airport desk "${deskName}" successfully created at ${deskAirportName}!`);
      setShowAddDeskModal(false);
      setDeskName('');
      setDeskNameAr('');
      setDeskNotes('');
    } else {
      showNotification(res.error || 'Failed to add airport desk', true);
    }
  };

  // Handle Edit Airport Desk
  const handleUpdateDeskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditDeskModal) return;
    const assignedEmp = employees.find((emp) => emp.id === deskAssignedEmpId);
    const res = updateAirportDesk(showEditDeskModal.id, {
      airportName: deskAirportName,
      airportCode: deskAirportCode,
      deskCode,
      deskName,
      deskNameAr,
      terminal: deskTerminal,
      zone: deskZone,
      assignedEmployeeId: assignedEmp ? assignedEmp.id : '',
      assignedEmployeeName: assignedEmp ? assignedEmp.name : 'Unassigned',
      assignedEmployeeRole: assignedEmp ? assignedEmp.role : '',
      status: deskStatus,
      shiftTiming: deskShiftTiming,
      phoneExt: deskPhoneExt,
      notes: deskNotes,
    });

    if (res.success) {
      if (assignedEmp) {
        updateEmployee(assignedEmp.id, {
          assignedDeskId: showEditDeskModal.id,
          assignedDeskName: deskName,
          assignedAirport: deskAirportName,
        });
      }
      showNotification(`Airport desk "${deskName}" updated!`);
      setShowEditDeskModal(null);
    } else {
      showNotification(res.error || 'Failed to update desk', true);
    }
  };

  // Open Edit Desk Modal
  const openEditDesk = (desk: AirportDesk) => {
    setDeskAirportName(desk.airportName);
    setDeskAirportCode(desk.airportCode);
    setDeskCode(desk.deskCode);
    setDeskName(desk.deskName);
    setDeskNameAr(desk.deskNameAr || desk.deskName);
    setDeskTerminal(desk.terminal);
    setDeskZone(desk.zone);
    setDeskAssignedEmpId(desk.assignedEmployeeId || '');
    setDeskShiftTiming(desk.shiftTiming);
    setDeskPhoneExt(desk.phoneExt);
    setDeskNotes(desk.notes || '');
    setDeskStatus(desk.status);
    setShowEditDeskModal(desk);
  };

  // Handle Payout execution
  const handleExecutePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPayoutModal || payoutAmount <= 0) return;
    const res = recordEmployeeSalaryPayment(
      showPayoutModal.employeeId,
      showPayoutModal.month,
      payoutAmount,
      payoutNotes
    );
    if (res.success) {
      showNotification(`Disbursed ${payoutAmount} QAR to staff member!`);
      setShowPayoutModal(null);
      setPayoutAmount(0);
      setPayoutNotes('');
      // Refresh selectedEmployee view
      const updated = employees.find((e) => e.id === showPayoutModal.employeeId);
      if (updated) setSelectedEmployee({ ...updated });
    } else {
      showNotification(res.error || 'Failed to record payout', true);
    }
  };

  // Handle Expense Reimbursement execution
  const handleExecuteExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showExpenseModal || expenseAmount <= 0) return;
    const res = addEmployeeExpense(
      showExpenseModal.employeeId,
      showExpenseModal.month,
      expenseAmount,
      expenseDesc || 'Operating Expense'
    );
    if (res.success) {
      showNotification(`Added ${expenseAmount} QAR expense reimbursement!`);
      setShowExpenseModal(null);
      setExpenseAmount(150);
      setExpenseDesc('');
      // Refresh selectedEmployee view
      const updated = employees.find((e) => e.id === showExpenseModal.employeeId);
      if (updated) setSelectedEmployee({ ...updated });
    } else {
      showNotification(res.error || 'Failed to add expense', true);
    }
  };

  // Distinct Airports List
  const uniqueAirports = Array.from(new Set(airportDesks.map((d) => d.airportName)));

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Toast Feedback */}
      {feedbackSuccess && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 font-medium text-xs animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}
      {feedbackError && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-rose-600 text-white shadow-xl shadow-rose-600/30 font-medium text-xs animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                {language === 'ar' ? 'الكوادر وموظفو الكاونترات ونظام العمولات' : 'Employees, Desk Staff & Target Commissions'}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {totalEmployees} STAFF
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'إدارة مكاتب الوكلاء والفنادق، تخصيص الموظفين لكل كاونتر، وتتبع عمولات ما بعد الهدف'
                  : 'Manage agent desks location-wise, assign staff to counters, set monthly service targets & calculate per-service commissions'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddDeskModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition shadow-xs"
          >
            <Store className="w-4 h-4 text-amber-500" />
            <span>{language === 'ar' ? '+ إضافة مكتب وكيل' : '+ Add Agent Desk'}</span>
          </button>

          <button
            onClick={() => setShowAddEmployeeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? '+ إضافة موظف جديد' : '+ Add New Employee'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Staff */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Total Staff Roster</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{totalEmployees}</span>
            <span className="text-[10px] text-emerald-600 font-bold">100% active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Across 4 departments</p>
        </div>

        {/* Airport Desk Staff */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Sitting at Desks</span>
            <Store className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{deskEmployeesCount}</span>
            <span className="text-[10px] text-slate-400 font-bold">of {airportDesks.length} Desks</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Assigned to airport counters</p>
        </div>

        {/* Base Monthly Payroll */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Base Monthly Wages</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {totalBasePayroll.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">QAR</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Fixed monthly contractual base</p>
        </div>

        {/* Accrued Commission (Current Month) */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Target Commissions</span>
            <BadgePercent className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
              +{totalAccruedCommissionCurrentMonth.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">QAR</span>
          </div>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium mt-1">Earned on excess services</p>
        </div>

        {/* Target Attainment */}
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>Target Attainment</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums">{targetAttainmentRate}%</span>
            <span className="text-[10px] text-emerald-600 font-bold">{targetsAchievedCount} met quota</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">October 2026 performance</p>
        </div>
      </div>

      {/* Date & Year Filter Engine */}
      <DateFilterBar
        filter={dateFilter}
        onChange={setDateFilter}
        totalCount={employees.length}
        label={language === 'ar' ? 'تصفية بيانات الموظفين والرواتب حسب السنة' : 'Staff, Desks & Payroll Date Filter'}
      />

      {/* Sub Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
          <button
            onClick={() => setActiveSubTab('staff')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'staff'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'ar' ? 'سجل الموظفين والكوادر' : 'Staff & Desk Roster'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('desks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'desks'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Store className="w-4 h-4 text-amber-500" />
            <span>{language === 'ar' ? 'مكاتب الوكلاء والفنادق' : 'Agent Desks & Counter Allocation'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              {airportDesks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('payroll')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'payroll'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4 text-emerald-500" />
            <span>{language === 'ar' ? 'جدول الرواتب والعمولات المجمّع' : 'Monthly Salary & Due Ledger'}</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'بحث عن موظف أو كاونتر...' : 'Search staff name, ID, phone, role...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Departments</option>
            <option value="Airport Desk">Agent Desk</option>
            <option value="Hotel Partner Desks">Hotel Partner Desks</option>
            <option value="Operations">Operations</option>
            <option value="Field Drivers">Field Drivers</option>
            <option value="Tour Guides">Tour Guides</option>
            <option value="Finance">Finance</option>
          </select>

          {/* Card / List Layout Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            <button
              type="button"
              onClick={() => setStaffLayoutMode('card')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                staffLayoutMode === 'card'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setStaffLayoutMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                staffLayoutMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="List Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. STAFF ROSTER VIEW */}
      {activeSubTab === 'staff' && (
        staffLayoutMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEmployees.map((emp) => {
            const currentRec = emp.monthlyRecords.find((r) => r.month === 'October 2026') || emp.monthlyRecords[0];
            const targetMet = currentRec ? currentRec.targetMet : false;
            const completedCount = currentRec ? currentRec.completedServices : 0;
            const targetCount = emp.monthlyServiceTarget;
            const progressPercent = Math.min(100, Math.round((completedCount / (targetCount || 1)) * 100));

            return (
              <div
                key={emp.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Avatar & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-blue-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                        {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {emp.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 font-arabic truncate">{emp.nameAr}</p>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold inline-block mt-1">
                          {emp.role}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        emp.status === 'On Duty'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/40'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>

                  {/* Airport & Desk Assignment Pill */}
                  <div className="mt-4 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 uppercase font-mono block">Assigned Agent Desk</span>
                        <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate block">
                          {emp.assignedDeskName || 'No Desk Assigned'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                      SITS AT DESK
                    </span>
                  </div>

                  {/* Monthly Performance & Target Quota Progress */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[11px] text-slate-500">October Target Progress</span>
                      <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                        {completedCount} / {targetCount} Services ({progressPercent}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          targetMet ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Commission Rule Highlight */}
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      {targetMet ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Target Exceeded (+{currentRec?.excessServices} services)
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          Needs {Math.max(0, targetCount - completedCount)} more to unlock commission
                        </span>
                      )}
                      <span className="font-mono text-slate-500 font-bold">
                        +{emp.commissionPerServiceQAR} QAR / service after target
                      </span>
                    </div>
                  </div>

                  {/* Financial Snapshot (Salary + Commission + Paid vs Due) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                      <span className="text-[10px] text-slate-400 block font-medium">Base Salary</span>
                      <span className="font-extrabold text-slate-900 dark:text-white tabular-nums text-xs">
                        {emp.baseSalaryMonthlyQAR.toLocaleString()} QAR
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-medium">Accrued Commission</span>
                      <span className="font-extrabold text-indigo-700 dark:text-indigo-300 tabular-nums text-xs">
                        +{currentRec?.commissionEarnedQAR || 0} QAR
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">Amount Paid (Paice)</span>
                      <span className="font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums text-xs">
                        {currentRec?.amountPaidQAR.toLocaleString() || 0} QAR
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">Balance Due (Baki)</span>
                      <span className="font-extrabold text-amber-700 dark:text-amber-300 tabular-nums text-xs">
                        {currentRec?.amountDueQAR.toLocaleString() || 0} QAR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setDetailSelectedMonth(emp.monthlyRecords[0]?.month || 'October 2026');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>View Details & Ledger</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {isManagerOrAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setShowPayoutModal({
                            employeeId: emp.id,
                            month: currentRec?.month || 'October 2026',
                            amountDue: currentRec?.amountDueQAR || 0,
                          });
                          setPayoutAmount(currentRec?.amountDueQAR || 0);
                        }}
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 transition"
                        title="Record Salary Payment"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setEditingEmployee({ ...emp })}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition"
                        title="Edit Employee"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove employee ${emp.name}?`)) {
                            deleteEmployee(emp.id);
                            showNotification(`Employee ${emp.name} removed`);
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 transition"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          /* Staff Roster List / Table View ("list view te dekha jay ei option ta add koro") */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    <th className="py-3.5 px-4">Staff Member & Role</th>
                    <th className="py-3.5 px-4">Assigned Airport & Desk</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">October Target Progress</th>
                    <th className="py-3.5 px-4 text-right">Base Salary</th>
                    <th className="py-3.5 px-4 text-right">Commission</th>
                    <th className="py-3.5 px-4 text-right">Paid (Paice)</th>
                    <th className="py-3.5 px-4 text-right">Balance Due (Baki)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredEmployees.map((emp) => {
                    const currentRec = emp.monthlyRecords.find((r) => r.month === 'October 2026') || emp.monthlyRecords[0];
                    const targetMet = currentRec ? currentRec.targetMet : false;
                    const completedCount = currentRec ? currentRec.completedServices : 0;
                    const targetCount = emp.monthlyServiceTarget;
                    const progressPercent = Math.min(100, Math.round((completedCount / (targetCount || 1)) * 100));

                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {emp.name}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {emp.role} · {emp.department}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                            <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="font-semibold text-xs truncate max-w-[150px]">
                              {emp.assignedDeskName || 'No Desk'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {emp.assignedAirport}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              emp.status === 'On Duty'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                {completedCount}/{targetCount}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {progressPercent}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${targetMet ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                          {emp.baseSalaryMonthlyQAR.toLocaleString()} QAR
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          +{currentRec?.commissionEarnedQAR || 0} QAR
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {currentRec?.amountPaidQAR.toLocaleString() || 0} QAR
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-black text-amber-600 dark:text-amber-400">
                          {currentRec?.amountDueQAR.toLocaleString() || 0} QAR
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setDetailSelectedMonth(emp.monthlyRecords[0]?.month || 'October 2026');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] shadow-xs"
                              title="View Dossier & Ledger"
                            >
                              Ledger
                            </button>

                            {isManagerOrAdmin && (
                              <>
                                <button
                                  onClick={() => {
                                    setShowPayoutModal({
                                      employeeId: emp.id,
                                      month: currentRec?.month || 'October 2026',
                                      amountDue: currentRec?.amountDueQAR || 0,
                                    });
                                    setPayoutAmount(currentRec?.amountDueQAR || 0);
                                  }}
                                  className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600"
                                  title="Pay Salary"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setEditingEmployee({ ...emp })}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                                  title="Edit Employee"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to remove employee ${emp.name}?`)) {
                                      deleteEmployee(emp.id);
                                      showNotification(`Employee ${emp.name} removed`);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600"
                                  title="Delete Employee"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* 2. AIRPORT DESKS VIEW */}
      {activeSubTab === 'desks' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 p-5 rounded-3xl border border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-500" />
                Agent Desks, Hotels, Terminals & Assigned Counter Agents
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Each agent desk operates within a designated airport terminal or luxury Qatar hotel partner with assigned staff.
              </p>
            </div>
            <button
              onClick={() => setShowAddDeskModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Agent Desk</span>
            </button>
          </div>

          {/* Group desks airport-wise */}
          {uniqueAirports.map((airportName) => {
            const desksForAirport = airportDesks.filter((d) => d.airportName === airportName);
            return (
              <div key={airportName} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{airportName}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                    {desksForAirport.length} {desksForAirport.length === 1 ? 'Desk' : 'Desks'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {desksForAirport.map((desk) => {
                    const assignedEmp = employees.find((e) => e.id === desk.assignedEmployeeId);

                    return (
                      <div
                        key={desk.id}
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                {desk.deskCode}
                              </span>
                              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5">
                                {desk.deskName}
                              </h4>
                              <p className="text-xs text-slate-400 font-arabic">{desk.deskNameAr}</p>
                            </div>

                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                desk.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {desk.status}
                            </span>
                          </div>

                          <div className="mt-3.5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-medium text-[11px] truncate">{desk.terminal} · {desk.zone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-[11px]">{desk.shiftTiming}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-mono text-[11px]">{desk.phoneExt}</span>
                            </div>
                          </div>

                          {/* Assigned Employee Box */}
                          <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                              Employee Sitting at Counter
                            </span>
                            {assignedEmp ? (
                              <div className="mt-1.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                                    {assignedEmp.name[0]}
                                  </div>
                                  <div>
                                    <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                                      {assignedEmp.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono block">
                                      {assignedEmp.role}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                  ON SHIFT
                                </span>
                              </div>
                            ) : (
                              <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                                <span>No staff assigned</span>
                                <span className="text-[10px] text-amber-500 font-bold">UNALLOCATED</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Desk Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditDesk(desk)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Desk / Reassign</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete agent desk "${desk.deskName}"?`)) {
                                deleteAirportDesk(desk.id);
                                showNotification(`Desk ${desk.deskName} removed`);
                              }
                            }}
                            className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                            title="Delete Desk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. PAYROLL & DUE LEDGER VIEW */}
      {activeSubTab === 'payroll' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Monthly Staff Salary, Target Commission & Remaining Due Ledger (October 2026)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Full breakdown of base wages, excess service commissions, logged expense reimbursements, amount disbursed, and remaining due.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Live Payroll Cycle
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200/70 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-3 py-3">Role & Desk</th>
                  <th className="px-3 py-3 text-right">Base Salary</th>
                  <th className="px-3 py-3 text-center">Target / Done</th>
                  <th className="px-3 py-3 text-right">Commission Rate</th>
                  <th className="px-3 py-3 text-right">Earned Commission</th>
                  <th className="px-3 py-3 text-right">Expenses</th>
                  <th className="px-3 py-3 text-right font-bold text-slate-900 dark:text-white">Total Gross</th>
                  <th className="px-3 py-3 text-right font-bold text-emerald-600">Paid (Paice)</th>
                  <th className="px-3 py-3 text-right font-bold text-amber-600">Due (Baki)</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {employees.map((emp) => {
                  const rec = emp.monthlyRecords.find((r) => r.month === 'October 2026') || emp.monthlyRecords[0];
                  const completed = rec ? rec.completedServices : 0;
                  const target = emp.monthlyServiceTarget;
                  const earnedComm = rec ? rec.commissionEarnedQAR : 0;
                  const expenses = rec ? rec.expensesReimbursedQAR : 0;
                  const gross = rec ? rec.grossPayableQAR : emp.baseSalaryMonthlyQAR;
                  const paid = rec ? rec.amountPaidQAR : 0;
                  const due = rec ? rec.amountDueQAR : emp.baseSalaryMonthlyQAR;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div>
                          <span>{emp.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{emp.id}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                        <span className="block font-medium">{emp.role}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{emp.assignedDeskName || 'Unallocated'}</span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono tabular-nums font-medium">
                        {emp.baseSalaryMonthlyQAR.toLocaleString()} QAR
                      </td>
                      <td className="px-3 py-3 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${completed >= target ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {completed} / {target}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-500">
                        {emp.commissionPerServiceQAR} QAR
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        +{earnedComm.toLocaleString()} QAR
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-slate-600 dark:text-slate-300">
                        {expenses.toLocaleString()} QAR
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                        {gross.toLocaleString()} QAR
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {paid.toLocaleString()} QAR
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-extrabold text-amber-600 dark:text-amber-400">
                        {due.toLocaleString()} QAR
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec?.status === 'Fully Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {rec?.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setDetailSelectedMonth('October 2026');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 font-bold transition text-[11px]"
                        >
                          View Ledger
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODALS SECTION ================= */}

      {/* 1. EMPLOYEE DETAILS & LEDGER MODAL */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  {selectedEmployee.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedEmployee.name}
                    </h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {selectedEmployee.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-arabic">{selectedEmployee.nameAr}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedEmployee.role}</span>
                    <span>•</span>
                    <span>{selectedEmployee.department}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">{selectedEmployee.status}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Assigned Airport Desk Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 font-mono block">
                      Airport & Desk Station
                    </span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {selectedEmployee.assignedAirport} — {selectedEmployee.assignedDeskName}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Contact: {selectedEmployee.phone} | Emergency: {selectedEmployee.emergencyContact}
                    </span>
                  </div>
                </div>
                <div className="text-right sm:shrink-0">
                  <span className="text-[10px] text-slate-400 block">Hire Date</span>
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{selectedEmployee.hireDate}</span>
                </div>
              </div>

              {/* Commission & Target Configuration Rule Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60">
                <div className="flex items-center gap-2">
                  <BadgePercent className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-extrabold text-blue-900 dark:text-blue-300">
                    Official Salary & Target Commission Rule
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[10px] text-slate-400 block">Contract Base Salary</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                      {selectedEmployee.baseSalaryMonthlyQAR.toLocaleString()} QAR
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[10px] text-slate-400 block">Monthly Target Quota</span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                      {selectedEmployee.monthlyServiceTarget} Services
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    <span className="text-[10px] text-slate-400 block">Commission After Target</span>
                    <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                      +{selectedEmployee.commissionPerServiceQAR} QAR / Service
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  * Note: For every booking/service completed exceeding the target of {selectedEmployee.monthlyServiceTarget}, the system awards an automated bonus of {selectedEmployee.commissionPerServiceQAR} QAR per service directly added to the monthly payroll ledger.
                </p>
              </div>

              {/* Month Selector for Deep-Dive */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-500" />
                    Month Ledger Breakdown
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Select Month:</span>
                    <select
                      value={detailSelectedMonth}
                      onChange={(e) => setDetailSelectedMonth(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100"
                    >
                      {selectedEmployee.monthlyRecords.map((m) => (
                        <option key={m.month} value={m.month}>
                          {m.month}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Month Detailed Financial Card */}
                {(() => {
                  const currentMonthRec =
                    selectedEmployee.monthlyRecords.find((r) => r.month === detailSelectedMonth) ||
                    selectedEmployee.monthlyRecords[0];

                  if (!currentMonthRec) return null;

                  return (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
                      {/* Metric Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Services Completed</span>
                          <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                            {currentMonthRec.completedServices} / {currentMonthRec.targetServices}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {currentMonthRec.targetMet ? `🏆 Exceeded by ${currentMonthRec.excessServices}` : 'Target pending'}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Commission Earned</span>
                          <span className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400">
                            +{currentMonthRec.commissionEarnedQAR} QAR
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                            {currentMonthRec.excessServices} × {currentMonthRec.commissionRatePerService} QAR
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">Amount Paid (Koto paice)</span>
                          <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                            {currentMonthRec.amountPaidQAR.toLocaleString()} QAR
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                            {currentMonthRec.paidDate || 'No payment recorded'}
                          </span>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-bold">Balance Due (Koto baki ache)</span>
                          <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                            {currentMonthRec.amountDueQAR.toLocaleString()} QAR
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Status: {currentMonthRec.status}
                          </span>
                        </div>
                      </div>

                      {/* Calculations breakdown banner */}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-500">Gross Equation:</span>
                          <span>Base ({currentMonthRec.baseSalaryQAR})</span>
                          <span>+</span>
                          <span className="text-indigo-600 font-bold">Commission ({currentMonthRec.commissionEarnedQAR})</span>
                          <span>+</span>
                          <span className="text-slate-600">Expenses ({currentMonthRec.expensesReimbursedQAR})</span>
                          <span>=</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {currentMonthRec.grossPayableQAR.toLocaleString()} QAR
                          </span>
                        </div>

                        {/* Quick Action buttons */}
                        {isManagerOrAdmin && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setShowExpenseModal({
                                  employeeId: selectedEmployee.id,
                                  month: currentMonthRec.month,
                                });
                                setExpenseAmount(150);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold transition text-xs"
                            >
                              + Add Expense
                            </button>

                            <button
                              onClick={() => {
                                setShowPayoutModal({
                                  employeeId: selectedEmployee.id,
                                  month: currentMonthRec.month,
                                  amountDue: currentMonthRec.amountDueQAR,
                                });
                                setPayoutAmount(currentMonthRec.amountDueQAR);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition text-xs flex items-center gap-1 shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Disburse Payment</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Month by month historical table */}
              <div>
                <h4 className="font-extrabold text-xs text-slate-500 uppercase font-mono mb-2">
                  Complete Historical Salary & Commission Records
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 font-mono text-[10px] text-slate-400 uppercase">
                      <tr>
                        <th className="px-3 py-2.5">Month</th>
                        <th className="px-3 py-2.5 text-right">Base Salary</th>
                        <th className="px-3 py-2.5 text-center">Quota / Done</th>
                        <th className="px-3 py-2.5 text-right">Commission</th>
                        <th className="px-3 py-2.5 text-right">Expenses</th>
                        <th className="px-3 py-2.5 text-right">Gross Total</th>
                        <th className="px-3 py-2.5 text-right text-emerald-600">Paid (Paice)</th>
                        <th className="px-3 py-2.5 text-right text-amber-600">Due (Baki)</th>
                        <th className="px-3 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                      {selectedEmployee.monthlyRecords.map((m) => (
                        <tr key={m.month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="px-3 py-2.5 font-bold">{m.month}</td>
                          <td className="px-3 py-2.5 text-right font-mono">{m.baseSalaryQAR.toLocaleString()} QAR</td>
                          <td className="px-3 py-2.5 text-center font-mono">
                            {m.completedServices} / {m.targetServices}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            +{m.commissionEarnedQAR} QAR
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">{m.expensesReimbursedQAR} QAR</td>
                          <td className="px-3 py-2.5 text-right font-mono font-extrabold">{m.grossPayableQAR.toLocaleString()} QAR</td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600">{m.amountPaidQAR.toLocaleString()} QAR</td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-600">{m.amountDueQAR.toLocaleString()} QAR</td>
                          <td className="px-3 py-2.5 text-center font-bold">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${m.status === 'Fully Paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                AR Trust Travel DMC • Employee Dossier Record
              </span>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADD EMPLOYEE MODAL */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Add New Employee & Configure Salary
                </h3>
              </div>
              <button onClick={() => setShowAddEmployeeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mansoor Al-Kuwari"
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-arabic">
                    الاسم بالكامل (عربي)
                  </label>
                  <input
                    type="text"
                    placeholder="منصور الكواري"
                    value={empNameAr}
                    onChange={(e) => setEmpNameAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="Agent Desk">Agent Desk</option>
                    <option value="Operations">Operations</option>
                    <option value="Field Drivers">Field Drivers</option>
                    <option value="Tour Guides">Tour Guides</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Station / Location</label>
                  <input
                    type="text"
                    value={empAirport}
                    onChange={(e) => setEmpAirport(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assign to Agent Desk (Sitting Station)
                  </label>
                  <select
                    value={empDeskId}
                    onChange={(e) => setEmpDeskId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- No Desk (Mobile / Field) --</option>
                    {airportDesks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.airportCode} - {d.deskName} ({d.deskCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Salary & Target Configuration */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="font-extrabold text-[11px] text-slate-900 dark:text-white block uppercase tracking-wider font-mono">
                  Salary Input & Target Commission Engine
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Base Monthly Salary (QAR) *</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={100}
                      value={empBaseSalary}
                      onChange={(e) => setEmpBaseSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Monthly Service Target *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={empTarget}
                      onChange={(e) => setEmpTarget(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-emerald-600 mb-1">Commission Per Service (QAR)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={5}
                      value={empCommissionPerService}
                      onChange={(e) => setEmpCommissionPerService(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-mono font-bold"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  After completing {empTarget} services in a month, every excess service adds {empCommissionPerService} QAR commission.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD / EDIT AIRPORT DESK MODAL */}
      {(showAddDeskModal || showEditDeskModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {showEditDeskModal ? 'Edit Agent Desk & Assignment' : 'Add Agent Desk (Location Wise)'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowAddDeskModal(false);
                  setShowEditDeskModal(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={showEditDeskModal ? handleUpdateDeskSubmit : handleCreateDesk}
              className="mt-5 space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Airport Name *</label>
                  <input
                    type="text"
                    required
                    value={deskAirportName}
                    onChange={(e) => setDeskAirportName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
                    placeholder="Hamad International Airport (DOH)"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Code</label>
                  <input
                    type="text"
                    value={deskAirportCode}
                    onChange={(e) => setDeskAirportCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono uppercase font-bold"
                    placeholder="DOH"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Desk Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={deskName}
                    onChange={(e) => setDeskName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
                    placeholder="Counter 4 - Arrivals Central"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 font-arabic">اسم الكاونتر (عربي)</label>
                  <input
                    type="text"
                    value={deskNameAr}
                    onChange={(e) => setDeskNameAr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-arabic"
                    placeholder="كاونتر 4 - صالة القادمون"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Desk / Counter Code</label>
                  <input
                    type="text"
                    value={deskCode}
                    onChange={(e) => setDeskCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                    placeholder="HIA-CTR-05"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Which Employee Sits Here? (Assign Staff) *
                  </label>
                  <select
                    value={deskAssignedEmpId}
                    onChange={(e) => setDeskAssignedEmpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="">-- Leave Unallocated --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Terminal</label>
                  <input
                    type="text"
                    value={deskTerminal}
                    onChange={(e) => setDeskTerminal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Zone / Bay Location</label>
                  <input
                    type="text"
                    value={deskZone}
                    onChange={(e) => setDeskZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Shift Timing</label>
                  <input
                    type="text"
                    value={deskShiftTiming}
                    onChange={(e) => setDeskShiftTiming(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Desk Extension Phone</label>
                  <input
                    type="text"
                    value={deskPhoneExt}
                    onChange={(e) => setDeskPhoneExt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDeskModal(false);
                    setShowEditDeskModal(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
                >
                  {showEditDeskModal ? 'Update Desk' : 'Create Agent Desk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. RECORD SALARY PAYOUT MODAL */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Record Salary Payout / Disbursement
                </h3>
              </div>
              <button onClick={() => setShowPayoutModal(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecutePayout} className="mt-4 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">
                  Month Cycle: {showPayoutModal.month}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                  Remaining Amount Due: {showPayoutModal.amountDue.toLocaleString()} QAR
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount to Disburse (QAR) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  step={50}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white text-base"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Disbursement Notes / Method
                </label>
                <input
                  type="text"
                  placeholder="e.g. QNB Corporate Wire / Cash Advance"
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  Confirm Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ADD EXPENSE REIMBURSEMENT MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Add Expense Reimbursement
                </h3>
              </div>
              <button onClick={() => setShowExpenseModal(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteExpense} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expense Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Airport Parking Permit / Passenger Hospitality Karak"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reimbursement Amount (QAR) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                >
                  Add to Month Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT EMPLOYEE MODAL */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Edit Employee Details: {editingEmployee.name}
              </h3>
              <button onClick={() => setEditingEmployee(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployeeSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Role</label>
                  <input
                    type="text"
                    required
                    value={editingEmployee.role}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Assigned Agent Desk
                  </label>
                  <select
                    value={editingEmployee.assignedDeskId}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, assignedDeskId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="">-- No Desk Assigned --</option>
                    {airportDesks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.airportCode} - {d.deskName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={editingEmployee.status}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="Available">Available</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Base Salary (QAR)</label>
                  <input
                    type="number"
                    value={editingEmployee.baseSalaryMonthlyQAR}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, baseSalaryMonthlyQAR: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Target Services</label>
                  <input
                    type="number"
                    value={editingEmployee.monthlyServiceTarget}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, monthlyServiceTarget: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-600 mb-1">Commission/Service</label>
                  <input
                    type="number"
                    value={editingEmployee.commissionPerServiceQAR}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, commissionPerServiceQAR: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-950 font-mono text-emerald-600 dark:text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
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
