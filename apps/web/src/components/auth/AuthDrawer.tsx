import React, { useState, useEffect } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  Loader2,
  Check,
  Building2,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { imgSrc } from '../../../lib/uploads';
import { BrandLogo } from '../common/BrandLogo';

export interface AuthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onNavigateToERP?: () => void;
  onNavigateHome?: () => void;
  onOpenBookingDrawer?: () => void;
}

export const AuthDrawer: React.FC<AuthDrawerProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onNavigateToERP,
  onNavigateHome,
  onOpenBookingDrawer,
}) => {
  const {
    login,
    signup,
    verifyEmail,
    resendVerificationCode,
    logout,
    isAuthenticated,
    currentUser,
    currentRole,
    roleConfig,
    language,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>(initialMode);

  // Email-verification step state.
  const [verifyEmailAddr, setVerifyEmailAddr] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Login form state
  const [loginId, setLoginId] = useState('customer');
  const [loginPassword, setLoginPassword] = useState('customer123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);

  // Auth state comes from localStorage (client-only), so gate the
  // logged-in vs login-form branch behind `mounted`: the server and the first
  // client render both show the login form, avoiding a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Sync mode with prop when opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccess(null);
      setForgotPasswordMessage(null);
    }
  }, [isOpen, initialMode]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    setForgotPasswordMessage(null);
  };

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setForgotPasswordMessage(null);

    const cleanId = loginId.trim();
    if (!cleanId) {
      setError('Please enter your username or email address.');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      const res = await login(cleanId, loginPassword);
      setIsLoading(false);
      if (!res.success) {
        if (res.needsVerification) {
          // Account exists but the email isn't verified yet. Send a fresh code
          // (the one from signup may have expired) and open the code step.
          const target = res.email || cleanId;
          await resendVerificationCode(target);
          setSuccess('Your email needs verifying first — we just sent a fresh code to your inbox.');
          enterVerifyMode(target);
          return;
        }
        setError(res.error || 'Invalid credentials. Please verify your username and password.');
      } else {
        setSuccess(`Welcome back, ${res.user?.name || 'Traveler'}!`);
      }
    }, 450);
  };

  // Handle Signup
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setForgotPasswordMessage(null);

    if (!signupName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!signupUsername.trim()) {
      setError('Please choose a preferred username.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      const res = await signup({
        name: signupName.trim(),
        username: signupUsername.trim().toLowerCase(),
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword,
        role: 'customer',
        phone: signupPhone.trim() || '+974 5555 7164',
        department: 'VIP Leisure Traveler',
        status: 'inactive',
      });
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'Registration failed. Please try a different username or email.');
      } else if (res.requiresVerification) {
        setSuccess(
          `Welcome, ${res.user?.name}! We've emailed a 6-digit verification code to ${signupEmail.trim().toLowerCase()}.`
        );
        enterVerifyMode(signupEmail.trim().toLowerCase());
      } else {
        setSuccess(`Account created, ${res.user?.name}! You can now sign in.`);
        setMode('login');
      }
    }, 550);
  };

  // Countdown for the "resend code" cooldown.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Switch into the email-verification step for a given address.
  const enterVerifyMode = (email: string) => {
    setVerifyEmailAddr(email);
    setVerifyCode('');
    setResendCooldown(60);
    setMode('verify');
    setError(null);
  };

  // Handle verification code submit
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const code = verifyCode.replace(/\D/g, '');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      const res = await verifyEmail(verifyEmailAddr, code);
      setIsLoading(false);
      if (!res.success) {
        setError(res.error || 'That code is incorrect or expired. Please try again.');
      } else {
        setSuccess(`Email verified — welcome, ${res.user?.name || 'Traveler'}! You're now signed in.`);
      }
    }, 350);
  };

  // Handle resend code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || !verifyEmailAddr) return;
    setError(null);
    setSuccess(null);
    const res = await resendVerificationCode(verifyEmailAddr);
    if (res.success) {
      setSuccess('A new code is on its way to your inbox.');
      setResendCooldown(60);
    } else {
      setError(res.error || 'Could not resend the code right now.');
    }
  };

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: '', percent: 0 };
    if (pwd.length < 4) return { label: 'Too short', color: 'bg-red-500', percent: 25 };
    if (pwd.length < 7) return { label: 'Medium', color: 'bg-amber-500', percent: 65 };
    return { label: 'Strong', color: 'bg-emerald-500', percent: 100 };
  };

  const pwdStrength = getPasswordStrength(signupPassword);
  const isRtl = language === 'ar';

  return (
    <div
      className={`fixed inset-0 z-[120] transition-visibility duration-300 ${
        isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* ─── BACKDROP OVERLAY ─── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-[#05161D]/80 backdrop-blur-md transition-opacity duration-300 z-[120] ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* ─── RIGHT-ALIGNED SLIDING DRAWER ─── */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg bg-gradient-to-b from-[#09232C] via-[#05161D] to-[#041117] text-slate-100 shadow-[0_0_80px_rgba(0,0,0,0.9)] border-l border-[#C0AB6F]/40 flex flex-col z-[121] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#C0AB6F]/30 bg-[#05161D]/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="cursor-pointer transition-transform hover:scale-105 active:scale-95 select-none"
              onClick={() => {
                onClose();
                if (onNavigateHome) onNavigateHome();
              }}
              title="Return to Website Homepage"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClose();
                  if (onNavigateHome) onNavigateHome();
                }
              }}
            >
              <BrandLogo size="sm" variant="full" />
            </div>
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#E7CF8A] text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
              Official Portal
            </span>
          </div>

          {/* Quick Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-[#C0AB6F]/30 bg-[#09232C]/80 hover:bg-[#D4AF37] text-slate-300 hover:text-[#05161D] transition-all shadow-md active:scale-95 cursor-pointer group"
            title="Close popup (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ════════════════════════════════════════════════════════════════ */}
          {/* STATE 1: ALREADY AUTHENTICATED / LOGGED IN                     */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {mounted && isAuthenticated && currentUser ? (
            <div className="space-y-5 py-2 animate-in fade-in duration-300">
              {/* Profile Card */}
              <div className="p-5 rounded-2xl bg-[#0D3A48]/70 border border-[#C0AB6F]/40 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start gap-4">
                  {currentUser.avatar ? (
                    <img
                      src={imgSrc(currentUser.avatar)}
                      alt={currentUser.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-lg shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C0AB6F] text-[#05161D] font-black text-xl flex items-center justify-center shrink-0 shadow-lg">
                      {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base truncate">
                        {currentUser.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E7CF8A] text-[10px] font-mono font-bold uppercase tracking-wider">
                        {currentUser.role}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-mono mt-0.5 truncate">
                      @{currentUser.username} · {currentUser.email}
                    </p>

                    {currentUser.department && (
                      <p className="text-[11px] text-[#C0AB6F] mt-1 font-medium">
                        {currentUser.department}
                      </p>
                    )}
                  </div>
                </div>

                {/* Member Perks Badge */}
                <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Traveler Perks Active</span>
                  </span>
                  <span className="text-[11px] text-[#E7CF8A] font-bold">10% Off All Tours</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToERP) onNavigateToERP();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C0AB6F] to-[#A79257] hover:brightness-110 text-[#05161D] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/25 transition cursor-pointer active:scale-95"
                >
                  <LayoutDashboard className="w-4 h-4 text-[#05161D]" />
                  <span>
                    {currentRole === 'customer'
                      ? 'Go to My Traveler Dashboard'
                      : currentRole === 'vendor-partner'
                      ? 'Open Partner Concierge Console'
                      : 'Open Operations ERP Console'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onOpenBookingDrawer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBookingDrawer();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0D3A48] hover:bg-[#14495A] border border-[#C0AB6F]/40 text-[#E7CF8A] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Book a Desert Safari or Luxury Transfer</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setError(null);
                    setSuccess('You have been logged out.');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Log Out from Session</span>
                </button>
              </div>

              {/* Security info */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Security & Account Status</span>
                </div>
                <p>
                  Last authenticated login: <span className="font-mono text-slate-300">{currentUser.lastLogin || 'Just now'}</span>.
                  Role authorization level: <span className="font-mono text-[#E7CF8A]">{currentUser.role}</span>.
                </p>
              </div>
            </div>
          ) : (
            /* ════════════════════════════════════════════════════════════════ */
            /* STATE 2: NOT AUTHENTICATED (LOGIN / SIGNUP FORM)               */
            /* ════════════════════════════════════════════════════════════════ */
            <>
              {/* Mode Toggle Switch (Sign In vs Create Account) — hidden during
                  the email-verification step. */}
              {mode !== 'verify' && (
              <div className="p-1 rounded-2xl bg-[#05161D] border border-[#C0AB6F]/40 flex gap-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] shadow-md shadow-[#D4AF37]/20 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] shadow-md shadow-[#D4AF37]/20 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
              )}

              {/* VIP Welcome Privilege Banner — hidden during verification. */}
              {mode !== 'verify' && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0D3A48]/80 to-[#05161D]/90 border border-[#C0AB6F]/30 flex items-start gap-3 shadow-md">
                <div className="p-2 rounded-xl bg-[#D4AF37]/20 text-[#E7CF8A] shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>VIP Traveler Membership</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                      10% OFF
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    {mode === 'login'
                      ? 'Sign in to access your booked safaris, instant vouchers, and member pricing.'
                      : 'Register for free and get an instant 10% discount on all Doha desert tours.'}
                  </p>
                </div>
              </div>
              )}

              {/* Alert Feedback Messages */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">{error}</div>
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">{success}</div>
                </div>
              )}

              {forgotPasswordMessage && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs leading-snug">
                  {forgotPasswordMessage}
                </div>
              )}

              {/* ─── TAB 1: LOGIN FORM ─── */}
              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Username / Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Username or Email</span>
                      <span className="text-[10px] text-slate-400">Required</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="e.g. customer or traveler@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#05161D] border border-white/15 focus:border-[#D4AF37] text-white text-xs placeholder:text-slate-500 focus:outline-none transition-colors shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() =>
                          setForgotPasswordMessage(
                            'Demo passwords are: customer123 (Traveler) or admin123 (Admin). For live accounts, contact support@artrust.qa.'
                          )
                        }
                        className="text-[11px] text-[#C0AB6F] hover:text-[#D4AF37] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#05161D] border border-white/15 focus:border-[#D4AF37] text-white text-xs placeholder:text-slate-500 focus:outline-none transition-colors shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                        title={showLoginPassword ? 'Hide password' : 'Show password'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember-me-checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 bg-[#05161D] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                    />
                    <label htmlFor="remember-me-checkbox" className="text-xs text-slate-300 cursor-pointer select-none">
                      Remember this browser session
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C0AB6F] to-[#A79257] hover:brightness-110 disabled:opacity-50 text-[#05161D] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/25 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#05161D]" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 text-[#05161D]" />
                        <span>Sign In to Account</span>
                      </>
                    )}
                  </button>

                  {/* Switch to Signup */}
                  <div className="text-center pt-2 text-xs text-slate-400">
                    <span>Don't have an account yet? </span>
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="text-[#D4AF37] font-bold hover:underline cursor-pointer"
                    >
                      Create Account Free
                    </button>
                  </div>
                </form>
              ) : mode === 'signup' ? (
                /* ─── TAB 2: SIGNUP FORM ─── */
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Alexander Wright"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#05161D] border border-white/15 focus:border-[#D4AF37] text-white text-xs placeholder:text-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Username & Phone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Username</label>
                      <input
                        type="text"
                        required
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        placeholder="e.g. alexander26"
                        className="w-full px-3 py-2 rounded-xl bg-[#05161D] border border-white/15 focus:border-[#D4AF37] text-white text-xs placeholder:text-slate-500 focus:outline-none transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Phone / WhatsApp</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="tel"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          placeholder="+974 5555 7164"
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#05161D] border border-white/15 focus:border-[#D4AF37] text-white text-xs placeholder:text-slate-500 focus:outline-none transition-colors font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#05161D] border border-white/15 focus:border-[#D4AF37] text-white text-xs placeholder:text-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">Password</label>
                        {pwdStrength.label && (
                          <span className="text-[10px] text-slate-400">{pwdStrength.label}</span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? 'text' : 'password'}
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Min 4 chars"
                          className="w-full px-3 py-2 rounded-xl bg-[#05161D] border border-white/15 focus:border-[#D4AF37] text-white text-xs placeholder:text-slate-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Re-type password"
                        className="w-full px-3 py-2 rounded-xl bg-[#05161D] border border-white/15 focus:border-[#D4AF37] text-white text-xs placeholder:text-slate-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password Strength Bar */}
                  {signupPassword && (
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                        style={{ width: `${pwdStrength.percent}%` }}
                      />
                    </div>
                  )}

                  {/* Show password toggle */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSignupPassword ? 'Hide passwords' : 'Show passwords'}</span>
                    </button>
                  </div>

                  {/* Terms & Privacy checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="signup-agree-checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-[#05161D] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer shrink-0"
                    />
                    <label htmlFor="signup-agree-checkbox" className="text-[11px] text-slate-300 leading-snug cursor-pointer select-none">
                      I agree to the AR Trust Travel Terms of Service, Privacy Policy, and travel advisory updates.
                    </label>
                  </div>

                  {/* Submit Signup Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C0AB6F] to-[#A79257] hover:brightness-110 disabled:opacity-50 text-[#05161D] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/25 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#05161D]" />
                        <span>Registering Account...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-[#05161D]" />
                        <span>Create Traveler Account (Free)</span>
                      </>
                    )}
                  </button>

                  {/* Switch to Login */}
                  <div className="text-center pt-1 text-xs text-slate-400">
                    <span>Already registered? </span>
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-[#D4AF37] font-bold hover:underline cursor-pointer"
                    >
                      Sign In to Account
                    </button>
                  </div>
                </form>
              ) : (
                /* ─── TAB 3: EMAIL VERIFICATION FORM ─── */
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                  <div className="flex flex-col items-center text-center gap-2 pb-1">
                    <div className="p-3 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30">
                      <KeyRound className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-sm font-black text-white">Verify Your Email</h3>
                    <p className="text-[11px] text-slate-300 leading-snug max-w-xs">
                      Enter the 6-digit code we sent to{' '}
                      <span className="font-bold text-[#E7CF8A] break-all">{verifyEmailAddr}</span>.
                      It expires in a few minutes.
                    </p>
                  </div>

                  {/* 6-digit code input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Verification Code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoFocus
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="● ● ● ● ● ●"
                      className="w-full px-4 py-3 rounded-xl bg-[#05161D] border border-white/15 focus:border-[#D4AF37] text-white text-center text-2xl font-mono tracking-[0.5em] placeholder:tracking-[0.3em] placeholder:text-slate-600 focus:outline-none transition-colors shadow-inner"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C0AB6F] to-[#A79257] hover:brightness-110 disabled:opacity-50 text-[#05161D] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/25 transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#05161D]" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#05161D]" />
                        <span>Verify & Continue</span>
                      </>
                    )}
                  </button>

                  {/* Resend */}
                  <div className="text-center text-xs text-slate-400">
                    <span>Didn't get the code? </span>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0}
                      className="text-[#D4AF37] font-bold hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>

                  {/* Back to login */}
                  <div className="text-center pt-1 text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-slate-400 hover:text-white hover:underline cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* DRAWER FOOTER: ERP OPERATIONS LINK & QATAR TOURISM LICENSING   */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <div className="pt-4 border-t border-[#C0AB6F]/20 space-y-3">
            {onNavigateToERP && (
              <div className="p-3 rounded-xl bg-[#05161D]/90 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Staff & Operations ERP</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Airport Desks, Drivers, Dispatch & Admin Console
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToERP();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0D3A48] hover:bg-[#14495A] border border-[#C0AB6F]/40 text-[#E7CF8A] text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <span>ERP Login</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Licensed by Qatar Tourism #QTA-8819</span>
              <span>256-bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
