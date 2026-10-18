import React, { useState } from 'react';
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Phone,
  Plane,
  MapPin,
  Star,
  Users,
  Calendar,
  Shield,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';

/* â”€â”€â”€ MINI ERP DASHBOARD PREVIEW (left-panel graphic) â”€â”€â”€ */
const ERPPreview: React.FC = () => (
  <div className="relative w-full max-w-[500px] mx-auto select-none pointer-events-none">
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <div className="bg-slate-800/90 backdrop-blur-sm px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="flex-1 bg-slate-700/60 rounded-md px-3 py-1 text-[10px] text-slate-400 font-mono">
          erp.artrust.qa/dashboard
        </div>
      </div>
      <div className="bg-slate-900 p-3 space-y-2">
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Bookings', value: '248', color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/30', text: 'text-blue-400' },
            { label: 'Revenue', value: '82K', color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
            { label: 'Drivers', value: '14', color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', text: 'text-amber-400' },
            { label: 'Hotels', value: '37', color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/30', text: 'text-purple-400' },
          ].map((k) => (
            <div key={k.label} className={`bg-gradient-to-br ${k.color} border ${k.border} rounded-lg p-2`}>
              <div className={`text-sm font-black ${k.text}`}>{k.value}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] text-slate-400 font-semibold">Booking Trends (24h)</span>
            <span className="text-[9px] text-emerald-400">â–² 18.4%</span>
          </div>
          <div className="flex items-end gap-1 h-10">
            {[4,6,5,8,7,9,11,10,13,12,14,11,9,10,13,15,14,16,12,11].map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${(v / 16) * 100}%`,
                  background: `hsl(${210 + i * 3}, 70%, ${40 + (v / 16) * 20}%)`,
                  opacity: 0.7 + (i / 20) * 0.3,
                }}
              />
            ))}
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-lg overflow-hidden">
          <div className="px-2.5 py-1.5 border-b border-slate-700/40 flex gap-2">
            <span className="text-[9px] text-slate-500 flex-1">PNR / Passenger</span>
            <span className="text-[9px] text-slate-500">Amount</span>
            <span className="text-[9px] text-slate-500 w-14 text-right">Status</span>
          </div>
          {[
            { pnr: 'QA-29311', name: 'Ahmad Al-Baker', amt: '1,250', color: 'bg-emerald-500/20 text-emerald-400', status: 'checked-in' },
            { pnr: 'QA-29312', name: 'Sarah Mitchell', amt: '840', color: 'bg-blue-500/20 text-blue-400', status: 'in-transit' },
            { pnr: 'QA-29313', name: 'Kenji Tanaka', amt: '2,100', color: 'bg-amber-500/20 text-amber-400', status: 'scheduled' },
          ].map((row) => (
            <div key={row.pnr} className="px-2.5 py-1.5 flex gap-2 border-b border-slate-700/20 last:border-0 items-center">
              <div className="flex-1 min-w-0">
                <div className="text-[9px] text-slate-300 font-mono font-semibold">{row.pnr}</div>
                <div className="text-[8px] text-slate-500 truncate">{row.name}</div>
              </div>
              <div className="text-[9px] text-slate-300 font-mono">QAR {row.amt}</div>
              <div className={`text-[8px] px-1.5 py-0.5 rounded-full w-14 text-center ${row.color}`}>{row.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-indigo-600/20 blur-2xl rounded-full" />
  </div>
);

const features = [
  { icon: Plane, label: 'Airport & Transit Bookings' },
  { icon: MapPin, label: 'Qatar Tour Packages' },
  { icon: Star, label: 'Luxury Hotel Partners' },
  { icon: Users, label: 'Multi-Role Access Control' },
  { icon: Calendar, label: 'Real-Time Scheduling' },
  { icon: Shield, label: 'QCB Compliance & Audit' },
];

interface AuthViewProps {
  onNavigateToHome?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onNavigateToHome }) => {
  const { login, signup, language, theme, toggleTheme } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [loginId, setLoginId] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPwd, setShowSignupPwd] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isRtl = language === 'ar';

  const switchMode = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setError(null);
    setSuccess(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!loginId.trim()) { setError('Please enter your username or email.'); return; }
    if (!loginPassword) { setError('Please enter your password.'); return; }
    setIsLoading(true);
    setTimeout(async () => {
      const res = await login(loginId.trim(), loginPassword);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please check your credentials.');
      } else {
        setSuccess(`Welcome back, ${res.user?.name}!`);
      }
    }, 500);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!signupName.trim()) { setError('Please enter your full name.'); return; }
    if (!signupUsername.trim()) { setError('Please choose a username.'); return; }
    if (!signupEmail.trim() || !signupEmail.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (!signupPassword || signupPassword.length < 4) { setError('Password must be at least 4 characters.'); return; }
    setIsLoading(true);
    setTimeout(async () => {
      const res = await signup({
        name: signupName.trim(),
        username: signupUsername.trim().toLowerCase(),
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword,
        role: 'customer',
        phone: signupPhone.trim(),
        department: undefined,
        status: 'active',
      });
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Registration failed. Please try again.');
      } else {
        setSuccess('Account created successfully! Welcome to AR Trust Travel.');
      }
    }, 500);
  };

  return (
    <div
      className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* â•â•â•â•â•â•â•â•â•â• LEFT PANEL â•â•â•â•â•â•â•â•â•â• */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-700/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full px-10 py-8">
          <div
            className="mb-auto cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 select-none w-fit"
            onClick={onNavigateToHome}
            title="Return to Website Homepage"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (onNavigateToHome) onNavigateToHome();
              }
            }}
          >
            <BrandLogo size="md" variant="full" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              {isRtl ? 'Ù…Ù†Ø¸ÙˆÙ…Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ù…ØªÙƒØ§Ù…Ù„Ø©' : 'Qatar Travel'}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
                {isRtl ? 'Ù„Ø´Ø±ÙƒØ© Ø§Ù„Ø±Ø§Ø¦Ø¯ Ù„Ù„Ø«Ù‚Ø© Ù„Ù„Ø³ÙØ± ÙˆØ§Ù„Ø³ÙŠØ§Ø­Ø©' : 'Operations ERP'}
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {isRtl
                ? 'Ø¥Ø¯Ø§Ø±Ø© Ø­Ø¬ÙˆØ²Ø§Øª Ø§Ù„Ù…Ø·Ø§Ø±ØŒ Ø±Ø­Ù„Ø§Øª Ø§Ù„Ù…Ø´Ø§Ø©ØŒ ÙˆØ§Ù„ÙÙ†Ø§Ø¯Ù‚ Ø§Ù„ÙØ§Ø®Ø±Ø© ÙÙŠ Ù‚Ø·Ø± Ù…Ù† Ù…Ù†ØµØ© ÙˆØ§Ø­Ø¯Ø©.'
                : 'Manage airport transit bookings, tour packages, hotel partners, fleet dispatch, and financial operations â€” all in one place.'}
            </p>
          </div>

          <div className="mb-8">
            <ERPPreview />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2"
              >
                <f.icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-[11px] text-slate-300 font-medium">{f.label}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-600 font-mono">
            AR Trust Travel & Tourism W.L.L. Â· QTA-QA-8819 Â· Hamad Int'l Airport, Doha
          </p>
        </div>
      </div>

      {/* â•â•â•â•â•â•â•â•â•â• RIGHT PANEL â•â•â•â•â•â•â•â•â•â• */}
      <div className="flex flex-col w-full lg:w-[440px] xl:w-[480px] shrink-0 bg-white dark:bg-slate-900 shadow-2xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800">
          <div
            className="lg:hidden cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none"
            onClick={onNavigateToHome}
            title="Return to Website Homepage"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (onNavigateToHome) onNavigateToHome();
              }
            }}
          >
            <BrandLogo size="sm" variant="full" showSubtitle={false} />
          </div>
          <div className="flex items-center gap-3">
            {onNavigateToHome && (
              <button
                type="button"
                onClick={onNavigateToHome}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-semibold transition cursor-pointer"
                title="Return to public homepage"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Return to Website</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex flex-col justify-center px-8 py-8 overflow-y-auto">

          {authMode === 'signup' && (
            <button
              onClick={() => switchMode('login')}
              className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-6 w-fit font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              {isRtl ? 'Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„' : 'Back to Sign In'}
            </button>
          )}

          <div className="mb-7">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {authMode === 'login'
                ? (isRtl ? 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„' : 'Sign in')
                : (isRtl ? 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨ Ù…Ø³Ø§ÙØ±' : 'Create Account')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {authMode === 'login'
                ? (isRtl ? 'Ø£Ø¯Ø®Ù„ Ø¨ÙŠØ§Ù†Ø§Øª Ø­Ø³Ø§Ø¨Ùƒ Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ø¨ÙˆØ§Ø¨Ø© Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª' : 'AR Trust Travel & Tourism â€” Operations Portal')
                : (isRtl ? 'Ø£Ù†Ø´Ø¦ Ø­Ø³Ø§Ø¨Ø§Ù‹ ÙƒÙ…Ø³Ø§ÙØ± Ø£Ùˆ Ø¹Ù…ÙŠÙ„ Ø¬Ø¯ÙŠØ¯' : 'Register as a traveler or customer')}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* â”€â”€ LOGIN FORM â”€â”€ */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø£Ùˆ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ' : 'Username or Email'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-username"
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder={isRtl ? 'Ù…Ø«Ø§Ù„: admin' : 'e.g. admin or admin@artrust.qa'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl px-4 py-3 pl-10 text-slate-900 dark:text-white text-sm outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => { setLoginId('admin'); setLoginPassword('admin123'); setError(null); }}
                    className="text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition"
                  >
                    {isRtl ? 'Ù†Ø³ÙŠØª ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±ØŸ' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showLoginPwd ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl px-4 py-3 pl-10 pr-11 text-slate-900 dark:text-white text-sm outline-none transition"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPwd(!showLoginPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                  >
                    {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-sign-in"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? <span className="animate-pulse">{isRtl ? 'Ø¬Ø§Ø±Ù Ø§Ù„ØªØ­Ù‚Ù‚...' : 'Verifying...'}</span>
                  : <><span>{isRtl ? 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„' : 'Sign In'}</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400">{isRtl ? 'Ø£Ùˆ' : 'or'}</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                {isRtl ? 'Ù„Ø§ ØªÙ…Ù„Ùƒ Ø­Ø³Ø§Ø¨Ø§Ù‹ØŸ' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  id="link-to-signup"
                  onClick={() => switchMode('signup')}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition"
                >
                  {isRtl ? 'Ø³Ø¬Ù‘Ù„ ÙƒÙ…Ø³Ø§ÙØ±' : 'Register as Traveler'}
                </button>
              </p>

              <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-[11px] text-slate-400 font-mono text-center">
                  Demo: <span className="text-slate-600 dark:text-slate-300">admin</span> / <span className="text-slate-600 dark:text-slate-300">admin123</span>
                </p>
              </div>
            </form>
          )}

          {/* â”€â”€ SIGNUP FORM â”€â”€ */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30">
                <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  {isRtl
                    ? 'Ù‡Ø°Ø§ Ø§Ù„ØªØ³Ø¬ÙŠÙ„ Ù…Ø®ØµØµ Ù„Ù„Ù…Ø³Ø§ÙØ±ÙŠÙ† ÙˆØ§Ù„Ø¹Ù…Ù„Ø§Ø¡ ÙÙ‚Ø·. ÙŠØªÙ… ØªØ¹ÙŠÙŠÙ† Ø¨Ø§Ù‚ÙŠ Ø§Ù„Ø£Ø¯ÙˆØ§Ø± Ù…Ù† Ù‚ÙØ¨Ù„ Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„.'
                    : 'This registration is for travelers & customers only. Staff roles are assigned by the Super Admin from the dashboard.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'Ø§Ù„Ø§Ø³Ù… Ø§Ù„ÙƒØ§Ù…Ù„' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder={isRtl ? 'Ù…Ø«Ø§Ù„: Ø£Ø­Ù…Ø¯ Ø§Ù„Ø¨ÙƒØ±' : 'e.g. Ahmad Al-Baker'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl px-4 py-3 pl-10 text-slate-900 dark:text-white text-sm outline-none transition placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isRtl ? 'Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…' : 'Username'}
                  </label>
                  <input
                    id="signup-username"
                    type="text"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    placeholder="e.g. ahmad"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm outline-none transition font-mono placeholder:text-slate-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isRtl ? 'Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ' : 'Phone (optional)'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="signup-phone"
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+974 5511 2233"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl px-4 py-3 pl-10 text-slate-900 dark:text-white text-sm outline-none transition font-mono placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl px-4 py-3 pl-10 text-slate-900 dark:text-white text-sm outline-none transition placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-password"
                    type={showSignupPwd ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-xl px-4 py-3 pl-10 pr-11 text-slate-900 dark:text-white text-sm outline-none transition"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPwd(!showSignupPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                  >
                    {showSignupPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-create-account"
                type="submit"
                disabled={isLoading}
                className="w-full mt-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? <span className="animate-pulse">{isRtl ? 'Ø¬Ø§Ø±Ù Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨...' : 'Creating account...'}</span>
                  : <><span>{isRtl ? 'Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨' : 'Create Account'}</span><CheckCircle2 className="w-4 h-4" /></>
                }
              </button>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-1">
                {isRtl ? 'Ù„Ø¯ÙŠÙƒ Ø­Ø³Ø§Ø¨ Ø¨Ø§Ù„ÙØ¹Ù„ØŸ' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  id="link-to-login"
                  onClick={() => switchMode('login')}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition"
                >
                  {isRtl ? 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„' : 'Sign In'}
                </button>
              </p>
            </form>
          )}
        </div>

        <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 font-mono">
            Â© 2026 AR Trust Travel & Tourism W.L.L. Â· Doha, Qatar
          </p>
        </div>
      </div>
    </div>
  );
};

