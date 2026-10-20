import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  ShieldCheck,
  Send,
  Coins,
  Globe,
  Save,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAccountsManagerView } from './UserAccountsManagerView';
import { api } from '../../../lib/api';

const DEFAULT_WHATSAPP_TEMPLATE =
  'Marhaba {passenger_name}! Welcome to Doha. Your AR Trust driver {driver_name} ({driver_vehicle}) is awaiting you at Hamad International Airport {pickup_bay}. PNR: {pnr}';

interface AgencyProfile {
  agencyName: string;
  crNumber: string;
  tourismLicense: string;
}

export const SettingsView: React.FC = () => {
  const { language, currentRole } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'accounts'>('general');
  const [agencyName, setAgencyName] = useState('AR Trust Travel & Tourism W.L.L.');
  const [crNumber, setCrNumber] = useState('CR-QA-109482');
  const [tourismLicense, setTourismLicense] = useState('QTA-DMC-8819');
  const [whatsappTemplate, setWhatsappTemplate] = useState(DEFAULT_WHATSAPP_TEMPLATE);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Hydrate the persisted agency profile + WhatsApp template from the settings
  // store (MySQL) so the form reflects the saved config, not placeholders.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [profile, tpl] = await Promise.all([
        api.get<AgencyProfile | null>('/api/settings/agencyProfile').catch(() => null),
        api.get<string | null>('/api/settings/whatsappTemplate').catch(() => null),
      ]);
      if (cancelled) return;
      if (profile) {
        if (profile.agencyName) setAgencyName(profile.agencyName);
        if (profile.crNumber) setCrNumber(profile.crNumber);
        if (profile.tourismLicense) setTourismLicense(profile.tourismLicense);
      }
      if (tpl && typeof tpl === 'string') setWhatsappTemplate(tpl);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    try {
      await Promise.all([
        api.put('/api/settings/agencyProfile', { value: { agencyName, crNumber, tourismLicense } }),
        api.put('/api/settings/whatsappTemplate', { value: whatsappTemplate }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError((err as Error).message || 'Could not save settings');
    }
  };

  return (
    <div className="space-y-5 pb-8 max-w-5xl">
      {/* Sub-tab Switcher Banner */}
      <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit shadow-2xs">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'general'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'إعدادات المنظومة والترخيص' : 'Agency ERP & Licensing'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'accounts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'ar' ? 'حسابات الدخول وكلمات المرور (IDs & Passwords)' : 'User Accounts & Passwords (Admin)'}</span>
        </button>
      </div>

      {activeSubTab === 'accounts' ? (
        <UserAccountsManagerView />
      ) : (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-500" />
                <span>{language === 'ar' ? 'إعدادات المنظومة والترخيص' : 'Agency ERP & License Configuration'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Qatar Tourism accreditation, QCB currency peg rules & WhatsApp messaging gateway
              </p>
            </div>

            {saved && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings Saved</span>
              </span>
            )}
            {saveError && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 font-mono">{saveError}</span>
            )}
          </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>Company & Commercial Registration Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Company Legal Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Commercial Registration (CR)</label>
              <input
                type="text"
                value={crNumber}
                onChange={(e) => setCrNumber(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Qatar Tourism License</label>
              <input
                type="text"
                value={tourismLicense}
                onChange={(e) => setTourismLicense(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Primary Operations Station</label>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300">
                Hamad Int’l Airport (HIA) Arrivals Counter 4 & 7
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Template Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-500" />
            <span>Automated Passenger WhatsApp Voucher Template</span>
          </h3>

          <textarea
            rows={3}
            value={whatsappTemplate}
            onChange={(e) => setWhatsappTemplate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-mono leading-relaxed"
          />
          <p className="text-[11px] text-slate-400">
            Available variables: {'{passenger_name}'}, {'{flight}'}, {'{pnr}'}, {'{driver_name}'}, {'{pickup_bay}'}
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </>
  )}
</div>
);
};
