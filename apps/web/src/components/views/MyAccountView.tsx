import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Send,
  Calendar,
  Building2,
  Compass,
  Car,
  Plane,
  Sparkles,
  QrCode,
  Clock,
  Globe,
  FileText,
  BadgeCheck,
  RotateCw,
  Award,
  ChevronRight,
  Save,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAccount, UserRole } from '../../types';
import { ImageUploadField } from '../common/ImageUploadField';
import { imgSrc } from '../../../lib/uploads';

export const MyAccountView: React.FC = () => {
  const {
    currentUser,
    updateUserAccount,
    roleConfig,
    currentRole,
    bookings,
    openModal,
    language,
    t,
  } = useApp();

  const isRtl = language === 'ar';

  // Active Tab: 'profile' | 'role-info' | 'email-verify' | 'security'
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'role-info' | 'email-verify' | 'security'>('profile');

  // Form states initialized with currentUser data
  const [name, setName] = useState(currentUser?.name || '');
  const [nameAr, setNameAr] = useState(currentUser?.nameAr || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || 'Doha');
  const [country, setCountry] = useState(currentUser?.country || 'Qatar');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [emergencyContact, setEmergencyContact] = useState(currentUser?.emergencyContact || '');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.emergencyPhone || '');

  // Role-Specific & Customer fields
  const [nationality, setNationality] = useState(currentUser?.nationality || 'Qatar');
  const [passportNumber, setPassportNumber] = useState(currentUser?.passportNumber || '');
  const [passportExpiry, setPassportExpiry] = useState(currentUser?.passportExpiry || '');
  const [preferredLanguage, setPreferredLanguage] = useState(currentUser?.preferredLanguage || 'English');
  const [dietaryNotes, setDietaryNotes] = useState(currentUser?.dietaryNotes || '');
  const [licenseNumber, setLicenseNumber] = useState(currentUser?.licenseNumber || '');
  const [licenseCategory, setLicenseCategory] = useState(currentUser?.licenseCategory || 'Light Vehicle & Desert 4x4');
  const [experienceYears, setExperienceYears] = useState(currentUser?.experienceYears || 5);

  // Password Change state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Email Verification State
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Feedback notifications
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Sync state whenever currentUser changes (e.g. role switch or external update)
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setNameAr(currentUser.nameAr || '');
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setAvatar(currentUser.avatar || '');
      setAddress(currentUser.address || '');
      setCity(currentUser.city || 'Doha');
      setCountry(currentUser.country || 'Qatar');
      setBio(currentUser.bio || '');
      setEmergencyContact(currentUser.emergencyContact || '');
      setEmergencyPhone(currentUser.emergencyPhone || '');
      setNationality(currentUser.nationality || 'Qatar');
      setPassportNumber(currentUser.passportNumber || '');
      setPassportExpiry(currentUser.passportExpiry || '');
      setPreferredLanguage(currentUser.preferredLanguage || 'English');
      setDietaryNotes(currentUser.dietaryNotes || '');
      setLicenseNumber(currentUser.licenseNumber || '');
      setLicenseCategory(currentUser.licenseCategory || 'Light Vehicle & Desert 4x4');
      setExperienceYears(currentUser.experienceYears || 5);
    }
  }, [currentUser]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const notifySuccess = (msg: string) => {
    setFeedbackSuccess(msg);
    setFeedbackError(null);
    setTimeout(() => setFeedbackSuccess(null), 4000);
  };

  const notifyError = (msg: string) => {
    setFeedbackError(msg);
    setFeedbackSuccess(null);
    setTimeout(() => setFeedbackError(null), 5000);
  };

  if (!currentUser) {
    return (
      <div className="p-8 text-center text-slate-500">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">User Session Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">Please log in to access your account profile.</p>
      </div>
    );
  }

  // Preset Avatars
  const presetAvatars = [
    { label: 'Executive Gold', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
    { label: 'Operations Blue', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
    { label: 'Airport Agent', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
    { label: 'VIP Chauffeur', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
    { label: 'Female Executive', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { label: 'Traveler Guest', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
  ];

  // Save General Profile Info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      notifyError(isRtl ? 'الاسم مطلوب' : 'Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      notifyError(isRtl ? 'البريد الإلكتروني غير صالح' : 'Please provide a valid email address.');
      return;
    }

    const emailChanged = email.trim().toLowerCase() !== currentUser.email.toLowerCase();

    const updates: Partial<UserAccount> = {
      name: name.trim(),
      nameAr: nameAr.trim() || undefined,
      username: username.trim() || currentUser.username,
      email: email.trim(),
      phone: phone.trim(),
      avatar: avatar.trim() || currentUser.avatar,
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      bio: bio.trim(),
      emergencyContact: emergencyContact.trim(),
      emergencyPhone: emergencyPhone.trim(),
      // If email changed, require re-verification
      ...(emailChanged ? { isEmailVerified: false, emailVerifiedAt: undefined } : {}),
    };

    const res = updateUserAccount(currentUser.id, updates);
    if (!res.success) {
      notifyError(res.error || 'Failed to update profile.');
    } else {
      if (emailChanged) {
        notifySuccess(
          isRtl
            ? 'تم حفظ البيانات! نظراً لتغيير البريد الإلكتروني، يرجى إعادة تأكيد البريد.'
            : 'Profile saved! As you updated your email, please re-verify your new address.'
        );
        setActiveSubTab('email-verify');
      } else {
        notifySuccess(isRtl ? 'تم تحديث بيانات الحساب بنجاح' : 'Your personal account details have been updated.');
      }
    }
  };

  // Save Role-Specific & Customer Details
  const handleSaveRoleDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<UserAccount> = {
      nationality: nationality.trim(),
      passportNumber: passportNumber.trim(),
      passportExpiry: passportExpiry.trim(),
      preferredLanguage: preferredLanguage.trim(),
      dietaryNotes: dietaryNotes.trim(),
      licenseNumber: licenseNumber.trim(),
      licenseCategory: licenseCategory.trim(),
      experienceYears: Number(experienceYears) || 0,
    };

    const res = updateUserAccount(currentUser.id, updates);
    if (!res.success) {
      notifyError(res.error || 'Failed to update details.');
    } else {
      notifySuccess(isRtl ? 'تم حفظ بيانات الملف التفصيلية بنجاح' : 'Detailed role and customer preferences saved successfully.');
    }
  };

  // Trigger Send Simulated Verification Code
  const handleSendVerificationCode = () => {
    if (!email || !email.includes('@')) {
      notifyError(isRtl ? 'يرجى إدخال بريد إلكتروني صالح أولاً' : 'Please ensure a valid email address is set.');
      return;
    }
    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setCodeSent(true);
    setCountdown(60);
    setVerificationCode('');
    notifySuccess(
      isRtl
        ? `تم إرسال رمز التحقق إلى ${email}. (رمز المحاكاة للتجربة: ${code})`
        : `Verification code sent to ${email}. (Demo Code for testing: ${code})`
    );
  };

  // Confirm Verification Code
  const handleConfirmVerification = () => {
    if (!generatedCode) {
      notifyError(isRtl ? 'يرجى طلب رمز التحقق أولاً' : 'Please request a verification code first.');
      return;
    }
    if (verificationCode.trim() !== generatedCode) {
      notifyError(isRtl ? 'رمز التحقق غير صحيح. حاول مجدداً.' : 'Invalid verification code. Please check and try again.');
      return;
    }

    const res = updateUserAccount(currentUser.id, {
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString().split('T')[0],
    });

    if (res.success) {
      setGeneratedCode(null);
      setCodeSent(false);
      notifySuccess(
        isRtl
          ? 'تهانينا! تم تأكيد بريدك الإلكتروني بنجاح واكتمل توثيق الحساب.'
          : 'Congratulations! Your email has been successfully verified.'
      );
    } else {
      notifyError(res.error || 'Could not verify email.');
    }
  };

  // Change Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPasswordInput !== currentUser.password) {
      notifyError(isRtl ? 'كلمة المرور الحالية غير صحيحة' : 'Current password does not match.');
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 4) {
      notifyError(isRtl ? 'كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل' : 'New password must be at least 4 characters long.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      notifyError(isRtl ? 'كلمتا المرور غير متطابقتين' : 'New password and confirmation do not match.');
      return;
    }

    const res = updateUserAccount(currentUser.id, { password: newPasswordInput.trim() });
    if (res.success) {
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      notifySuccess(isRtl ? 'تم تغيير كلمة المرور بنجاح' : 'Password updated successfully!');
    } else {
      notifyError(res.error || 'Failed to update password.');
    }
  };

  // Filter user bookings if customer
  const userBookings = bookings.filter(
    (b) =>
      b.passengerName?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      b.passengerEmail?.toLowerCase() === currentUser.email.toLowerCase()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* ─── TOAST NOTIFICATIONS ─── */}
      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-xs font-semibold shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}
      {feedbackError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-center gap-3 text-xs font-semibold shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* ─── LUXURY PROFILE HERO BANNER ─── */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-[#C0AB6F]/30 bg-gradient-to-r from-[#05161D] via-[#0D3A48] to-[#05161D] text-white p-6 sm:p-8 shadow-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Glow Ring */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-tr from-[#D4AF37] via-[#C0AB6F] to-emerald-400 shadow-xl">
              <img
                src={imgSrc(currentUser.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-full h-full object-cover rounded-[22px] bg-slate-900"
              />
            </div>
            {currentUser.isEmailVerified ? (
              <span
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-emerald-500 text-slate-950 shadow-md ring-4 ring-[#05161D]"
                title="Verified User Account"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
              </span>
            ) : (
              <span
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-amber-500 text-slate-950 shadow-md ring-4 ring-[#05161D]"
                title="Email Verification Needed"
              >
                <AlertTriangle className="w-4 h-4 text-slate-950" />
              </span>
            )}
          </div>

          {/* User Info Header */}
          <div className="flex-1 text-center md:text-left rtl:md:text-right min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white truncate">
                {currentUser.name}
              </h1>
              {currentUser.nameAr && (
                <span className="text-sm font-semibold text-[#E7CF8A] font-sans">
                  ({currentUser.nameAr})
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-300 mb-4">
              <span className="font-mono text-[#D4AF37] font-bold">@{currentUser.username}</span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
                {roleConfig.title}
              </span>
            </div>

            {/* Verification Status Banner Pill */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {currentUser.isEmailVerified ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-xs">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isRtl ? 'البريد الإلكتروني موثق رسميًا ✓' : 'Email Address Verified ✓'}
                  </span>
                  {currentUser.emailVerifiedAt && (
                    <span className="text-[10px] text-emerald-400/80 font-mono font-normal">
                      ({currentUser.emailVerifiedAt})
                    </span>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-xs animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    {isRtl ? 'البريد الإلكتروني غير مؤكد' : 'Email Not Verified'}
                  </span>
                  <button
                    onClick={() => setActiveSubTab('email-verify')}
                    className="ml-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] text-[11px] font-extrabold hover:brightness-110 active:scale-95 transition cursor-pointer"
                  >
                    {isRtl ? 'تأكيد الآن' : 'Verify Now'}
                  </button>
                </div>
              )}

              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Joined: {currentUser.createdAt || '2026-01-01'}</span>
              </span>
            </div>
          </div>

          {/* Quick Security Badge Box */}
          <div className="hidden lg:flex flex-col gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs font-mono text-slate-300 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Account ID:</span>
              <span className="font-bold text-white">{currentUser.id}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Role Scope:</span>
              <span className="font-bold text-[#E7CF8A]">{currentRole}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Status:</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {currentUser.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── NAVIGATION TABS ─── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{isRtl ? 'البيانات الشخصية وجهات الاتصال' : 'Personal & Contact Info'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('role-info')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'role-info'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          {currentRole === 'customer' ? (
            <Plane className="w-4 h-4 text-emerald-400" />
          ) : currentRole === 'driver-guide' ? (
            <Compass className="w-4 h-4 text-amber-400" />
          ) : currentRole === 'vendor-partner' ? (
            <Building2 className="w-4 h-4 text-purple-400" />
          ) : (
            <Award className="w-4 h-4 text-blue-400" />
          )}
          <span>
            {currentRole === 'customer'
              ? isRtl
                ? 'ملف المسافر وحجوزاتي (Customer Profile)'
                : 'Customer Travel Profile & Vouchers'
              : currentRole === 'driver-guide'
              ? isRtl
                ? 'بيانات السائق ورخصة القيادة'
                : 'Chauffeur & License Details'
              : currentRole === 'vendor-partner'
              ? isRtl
                ? 'بيانات الفندق والشركاء'
                : 'Hotel Partner Desk Info'
              : isRtl
              ? 'صلاحيات الدور والوظيفة'
              : 'Operational Staff Details'}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('email-verify')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer relative ${
            activeSubTab === 'email-verify'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>{isRtl ? 'توثيق وتأكيد البريد الإلكتروني' : 'Email Verification Center'}</span>
          {!currentUser.isEmailVerified && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>{isRtl ? 'الأمان وتغيير كلمة المرور' : 'Security & Password'}</span>
        </button>
      </div>

      {/* ─── TAB 1: PERSONAL & CONTACT INFO ─── */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>{isRtl ? 'البيانات الشخصية وهوية الحساب' : 'Identity & Contact Information'}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name (English) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'الاسم الكامل (إنجليزي)' : 'Full Name (English)'} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium"
                  required
                />
              </div>

              {/* Name (Arabic) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'الاسم باللغة العربية' : 'Full Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium font-sans"
                  placeholder="مثال: الشيخ ناصر آل ثاني"
                />
              </div>

              {/* Username (Readonly / audited) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'اسم المستخدم / المعرف (@username)' : 'System Username (@handle)'}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  required
                />
              </div>

              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isRtl ? 'البريد الإلكتروني' : 'Email Address'} *
                  </label>
                  {currentUser.isEmailVerified ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('email-verify')}
                      className="text-[10px] text-amber-500 hover:underline font-bold"
                    >
                      Verify Email
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-medium font-mono"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isRtl
                    ? 'ملاحظة: تعديل البريد سيتطلب تأكيد الرمز مجدداً.'
                    : 'Note: Changing your email address will require re-verification via OTP.'}
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'رقم الهاتف / الجوال' : 'Phone / Mobile Number'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+974 5555 7164"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Avatar upload + preset selector */}
              <ImageUploadField
                value={avatar}
                onChange={(ref) => setAvatar(ref || '')}
                variant="avatar"
                shape="round"
                label={isRtl ? 'الصورة الرمزية (Avatar)' : 'Avatar Image'}
                hint={isRtl ? 'ارفع صورة أو اختر صورة جاهزة بالأسفل' : 'Upload a photo, or pick a preset below'}
                presets={presetAvatars.map((p) => ({ url: p.url, label: p.label }))}
              />
            </div>

            {/* Address & Location */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'العنوان / المنطقة' : 'Address / Residence Area'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. West Bay Lagoon / Bin Dirham Plaza"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'المدينة والدولة' : 'City & Country'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Doha"
                    className="w-1/2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Qatar"
                    className="w-1/2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'جهة الاتصال في حالات الطوارئ' : 'Emergency Contact Name'}
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Spouse / Family Member / Manager"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'هاتف الطوارئ' : 'Emergency Phone Number'}
                </label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+974 ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isRtl ? 'نبذة تعريفية / ملاحظات السفر' : 'Bio / Travel Profile Notes'}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="A brief intro about yourself..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 active:scale-95 transition flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isRtl ? 'حفظ التغييرات' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 2: ROLE DETAILS & CUSTOMER PROFILE ─── */}
      {activeSubTab === 'role-info' && (
        <div className="space-y-6">
          {/* If Customer: Full Travel Portal */}
          {currentRole === 'customer' ? (
            <div className="space-y-6">
              <form onSubmit={handleSaveRoleDetails} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Plane className="w-5 h-5 text-emerald-500" />
                    <span>{isRtl ? 'بيانات المسافر والجواز والتفضيلات' : 'Customer Passport & Travel Preferences'}</span>
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                    VIP Club Tier: Gold
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isRtl ? 'الجنسية' : 'Nationality'}
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white"
                      placeholder="e.g. United Kingdom / Qatar"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isRtl ? 'رقم جواز السفر' : 'Passport Number'}
                    </label>
                    <input
                      type="text"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono uppercase"
                      placeholder="e.g. GB98234102"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isRtl ? 'تاريخ انتهاء الجواز' : 'Passport Expiry Date'}
                    </label>
                    <input
                      type="date"
                      value={passportExpiry}
                      onChange={(e) => setPassportExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isRtl ? 'اللغة المفضلة للتواصل' : 'Preferred Language'}
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="English">English</option>
                      <option value="Arabic">Arabic (العربية)</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Russian">Russian</option>
                      <option value="Chinese">Mandarin</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isRtl ? 'تفضيلات الوجبات والمساعدة الخاصة' : 'Dietary Needs & Special Assistance'}
                    </label>
                    <input
                      type="text"
                      value={dietaryNotes}
                      onChange={(e) => setDietaryNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white"
                      placeholder="e.g. Vegetarian, Halal meal required, Wheelchair assistance"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isRtl ? 'حفظ تفضيلات السفر' : 'Save Travel Preferences'}</span>
                  </button>
                </div>
              </form>

              {/* Customer's Bookings and QR Vouchers */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-[#D4AF37]" />
                      <span>{isRtl ? 'حجوزاتي وقسائم السفر الصادرة' : 'My Qatar Tours & Vouchers'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isRtl
                        ? 'عرض تفاصيل الحجوزات ورموز الاستجابة السريعة (QR) لمسحها بالمطار والفنادق.'
                        : 'View your confirmed bookings and generate instant QR boarding vouchers.'}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {userBookings.length} {userBookings.length === 1 ? 'Booking' : 'Bookings'}
                  </span>
                </div>

                {userBookings.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <Plane className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isRtl ? 'لا توجد حجوزات مسجلة حالياً' : 'No upcoming bookings found under your profile.'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isRtl ? 'احجز جولة صحراوية أو توصيلة مطار من الصفحة الرئيسية' : 'Explore Desert Safaris or Airport Transfers to start your journey.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between hover:border-[#D4AF37]/50 transition"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                              {b.pnr}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {b.qrStatus}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                            {b.packageName}
                          </h4>
                          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{b.bookingDate || b.arrivalTime} ({b.bookingTime || 'Scheduled'})</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate">{b.pickupBay || b.terminalGate || 'HIA Terminal'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            QAR {b.totalQAR}
                          </span>
                          <button
                            onClick={() => openModal('qr-voucher', b)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C0AB6F] text-[#05161D] text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>{isRtl ? 'عرض القسيمة (QR)' : 'View QR Voucher'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : currentRole === 'driver-guide' ? (
            /* Driver-Guide Profile */
            <form onSubmit={handleSaveRoleDetails} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Car className="w-5 h-5 text-amber-500" />
                <span>{isRtl ? 'بيانات رخصة القيادة والأسطول الميداني' : 'Chauffeur License & Fleet Credentials'}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isRtl ? 'رقم رخصة القيادة القطرية' : 'Qatar Driving License No.'}
                  </label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono uppercase"
                    placeholder="QA-DL-884920"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isRtl ? 'فئة الرخصة وتصريح السفاري' : 'License Category & Permits'}
                  </label>
                  <input
                    type="text"
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isRtl ? 'سنوات الخبرة بالسياحة القطرية' : 'Years of Driving Experience'}
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono"
                    min={1}
                    max={40}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isRtl ? 'القسم / الفريق' : 'Assigned Division'}
                  </label>
                  <input
                    type="text"
                    value={currentUser.department || 'Chauffeur Fleet & Desert Guides'}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isRtl ? 'تحديث بيانات الرخصة' : 'Update Credentials'}</span>
                </button>
              </div>
            </form>
          ) : currentRole === 'vendor-partner' ? (
            /* Hotel Vendor Profile */
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-purple-500" />
                <span>{isRtl ? 'بيانات الشريك الفندقي وكاونتر الضيافة' : 'Hotel Partner Organization & Desk'}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40">
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block mb-1">
                    Hotel Property
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white block">
                    {currentUser.department || 'Luxury Hotel Partner Qatar'}
                  </span>
                  <span className="text-slate-400 font-mono mt-1 block">Vendor ID: {currentUser.vendorId || 'N/A'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Direct Contact Phone
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white font-mono block">
                    {currentUser.phone || '+974 4484 8000'}
                  </span>
                  <span className="text-emerald-500 font-medium mt-1 block">Live 24/7 Concierge Channel</span>
                </div>
              </div>
            </div>
          ) : (
            /* General Staff: Admin, Ops, Transit Agent, Finance */
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-blue-500" />
                <span>{isRtl ? 'صلاحيات الموظف وبيانات النطاق التشغيلي' : 'Staff Scope & Enterprise Permissions'}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Assigned Department
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {currentUser.department || 'General Administration'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Security Scope
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
                    {roleConfig.title}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Allowed Navigation Tabs
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs font-mono">
                    {roleConfig.allowedTabs.length} Console Tabs
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                  Role Operational Summary:
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isRtl ? roleConfig.scopeSummaryAr : roleConfig.scopeSummary}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: EMAIL VERIFICATION CENTER (sobai email verification korte parbe) ─── */}
      {activeSubTab === 'email-verify' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>{isRtl ? 'مركز توثيق وتأكيد البريد الإلكتروني لجميع المستخدمين' : 'Official Email Verification Center'}</span>
              </h2>
              {currentUser.isEmailVerified ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Action Required
                </span>
              )}
            </div>

            {/* If Already Verified */}
            {currentUser.isEmailVerified && !codeSent ? (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col md:flex-row items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="flex-1 text-center md:text-left rtl:md:text-right">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isRtl ? 'عنوان بريدك الإلكتروني موثق ومحمٍ بنجاح' : 'Your Email Address is Fully Verified!'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {currentUser.email} has been verified and authorized for instant voucher dispatches, QR boarding passes, and security resets.
                  </p>
                  {currentUser.emailVerifiedAt && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                      Verified on: {currentUser.emailVerifiedAt}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إعادة طلب رمز تأكيد' : 'Re-verify / Test OTP'}</span>
                </button>
              </div>
            ) : (
              /* Unverified or In-Progress Verification Flow */
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">
                        {isRtl ? 'بريدك الإلكتروني بحاجة إلى تأكيد وتفعيل' : 'Please verify your email address'}
                      </p>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        {isRtl
                          ? `سيتم إرسال رمز تحقق سري مكون من 6 أرقام إلى (${currentUser.email}).`
                          : `We will send a 6-digit one-time passcode (OTP) to your registered email (${currentUser.email}).`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Send Button or OTP Input */}
                {!codeSent ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isRtl ? 'إرسال رمز التحقق المكون من 6 أرقام' : 'Send 6-Digit Verification Code'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSubTab('profile')}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold underline"
                    >
                      {isRtl ? 'تغيير عنوان البريد الإلكتروني' : 'Change email address in profile'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Simulated Dispatch Banner with One-Click Copy */}
                    {generatedCode && (
                      <div className="p-4 rounded-2xl bg-[#0D3A48] border border-[#C0AB6F]/40 text-[#E7CF8A] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0" />
                          <div className="text-left rtl:text-right">
                            <span className="text-[11px] uppercase tracking-wider font-bold block text-slate-300">
                              📧 [Simulated Email Sent to {currentUser.email}]
                            </span>
                            <span className="text-xs font-medium">
                              Your Verification Code is:{' '}
                              <strong className="text-lg font-mono font-black text-white tracking-widest ml-1">
                                {generatedCode}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setVerificationCode(generatedCode);
                              notifySuccess('Code auto-filled into input!');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:brightness-110 text-[#05161D] font-bold text-xs transition cursor-pointer shadow-xs active:scale-95"
                          >
                            Auto-Fill Code
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedCode);
                              setCopiedCode(true);
                              setTimeout(() => setCopiedCode(false), 2000);
                            }}
                            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 6-Digit Code Input Box */}
                    <div className="max-w-md">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {isRtl ? 'أدخل رمز التحقق (6 أرقام):' : 'Enter 6-Digit Passcode:'}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full text-center tracking-[0.5em] font-mono text-2xl font-black py-3 px-4 rounded-2xl border-2 border-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                        autoFocus
                      />
                    </div>

                    {/* Actions: Confirm & Resend */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleConfirmVerification}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isRtl ? 'تأكيد وتوثيق الحساب' : 'Confirm & Verify Email'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={countdown > 0}
                        onClick={handleSendVerificationCode}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          countdown > 0
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>
                          {countdown > 0
                            ? isRtl
                              ? `إعادة الإرسال بعد (${countdown}ث)`
                              : `Resend in ${countdown}s`
                            : isRtl
                            ? 'إعادة إرسال الرمز'
                            : 'Resend Code'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: SECURITY & PASSWORD MANAGEMENT ─── */}
      {activeSubTab === 'security' && (
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>{isRtl ? 'تغيير كلمة المرور وأمان الحساب' : 'Change Password & Security Credentials'}</span>
            </h2>

            <div className="max-w-md space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'كلمة المرور الحالية' : 'Current Password'} *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'كلمة المرور الجديدة' : 'New Password'} *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    required
                    minLength={4}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isRtl ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'} *
                </label>
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  required
                  minLength={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 active:scale-95 transition flex items-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isRtl ? 'تحديث كلمة المرور' : 'Update Password'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
