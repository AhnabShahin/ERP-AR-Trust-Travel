import React from 'react';
import {
  BadgePercent,
  Coins,
  CheckCircle2,
  Clock,
  Download,
  Users,
  Car,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommissionPayrollView: React.FC = () => {
  const { drivers, convertAmount, language, t } = useApp();

  const driverCommissions = [
    { id: 'drv-1', name: 'Tariq Al-Kuwari', role: 'Senior Safari & 4x4 Chauffeur', tours: 4, safariTrips: 2, airportTransfers: 2, earnedCommissionQAR: 380, bonusQAR: 50, status: 'Approved' },
    { id: 'drv-2', name: 'Rashid Mansoor', role: 'VIP Mercedes Limousine Chauffeur', tours: 3, safariTrips: 0, airportTransfers: 3, earnedCommissionQAR: 210, bonusQAR: 75, status: 'Approved' },
    { id: 'drv-3', name: 'Ahmed El-Sayed', role: 'Airport Express Chauffeur', tours: 2, safariTrips: 0, airportTransfers: 2, earnedCommissionQAR: 90, bonusQAR: 0, status: 'Pending' },
    { id: 'drv-4', name: 'Nasser Al-Nuaimi', role: 'Desert Safari Specialist', tours: 5, safariTrips: 3, airportTransfers: 2, earnedCommissionQAR: 510, bonusQAR: 100, status: 'Approved' },
    { id: 'drv-5', name: 'Farhan Malik', role: 'Multi-lingual Cultural Guide', tours: 2, safariTrips: 1, airportTransfers: 1, earnedCommissionQAR: 165, bonusQAR: 0, status: 'Pending' },
    { id: 'drv-6', name: 'Salem Al-Marri', role: 'VIP Al Maha Escort Chauffeur', tours: 3, safariTrips: 0, airportTransfers: 3, earnedCommissionQAR: 285, bonusQAR: 120, status: 'Approved' },
  ];

  const totalCommissionsQAR = driverCommissions.reduce((sum, d) => sum + d.earnedCommissionQAR + d.bonusQAR, 0);

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-emerald-500" />
            <span>{language === 'ar' ? 'العمولات والرواتب (السائقون والمرشدون)' : 'Commission & Chauffeur Payroll Ledger'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            12% Safari dune commission, QAR 45 per HIA transfer & VIP customer gratuities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block">TOTAL PAYOUT DUE TODAY</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {convertAmount(totalCommissionsQAR).formatted}
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Chauffeur / Guide</th>
                <th className="py-3 px-4">Duty Role</th>
                <th className="py-3 px-4 text-center">Tours Today</th>
                <th className="py-3 px-4 text-center">Safari / Transfers</th>
                <th className="py-3 px-4 text-right rtl:text-left">Base Commission</th>
                <th className="py-3 px-4 text-right rtl:text-left">VIP Bonus</th>
                <th className="py-3 px-4 text-right rtl:text-left">Net Payable</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
              {driverCommissions.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-sans font-bold text-slate-900 dark:text-white">
                    {row.name}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">
                    {row.role}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                    {row.tours}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 text-[11px]">
                    {row.safariTrips} Safari / {row.airportTransfers} HIA
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left font-semibold text-slate-900 dark:text-white">
                    {convertAmount(row.earnedCommissionQAR).formatted}
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left text-emerald-600 dark:text-emerald-400">
                    +{convertAmount(row.bonusQAR).formatted}
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left font-extrabold text-slate-900 dark:text-white">
                    {convertAmount(row.earnedCommissionQAR + row.bonusQAR).formatted}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        row.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
