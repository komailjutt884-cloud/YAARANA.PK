import React, { useState } from 'react';
import { signInWithGoogle, sendPhoneOTP, verifyPhoneOTP } from '../dbAdapter';
import { User, Phone, Mail, Image as ImageIcon, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onRegisterSubmit: (profileData: { name: string; phone: string; email: string; photoURL: string }) => Promise<void>;
  userEmail?: string | null;
  userPhone?: string | null;
  onDemoLogin: (role: 'user' | 'admin') => void;
}

export default function LoginPage({ onRegisterSubmit, userEmail, userPhone, onDemoLogin }: LoginPageProps) {
  const [loginMethod, setLoginMethod] = useState<'options' | 'google' | 'phone'>('options');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState(userPhone || '');
  const [regEmail, setRegEmail] = useState(userEmail || '');
  const [regPhoto, setRegPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    setError(null);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+92${phoneNumber.replace(/^0/, '')}`;
      const resultObj = await sendPhoneOTP(false, formattedPhone);
      setVerificationId(resultObj);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send SMS code. Make sure format is correct (+923xxxxxxxxx).");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || !verificationId) return;
    setLoading(true);
    setError(null);
    try {
      await verifyPhoneOTP(false, verificationId, verificationCode);
    } catch (err: any) {
      console.error(err);
      setError("Invalid confirmation code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!regPhone.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (!regEmail.trim()) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onRegisterSubmit({
        name: regName,
        phone: regPhone,
        email: regEmail,
        photoURL: regPhoto
      });
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Predefined avatar selections for high-quality profile picture
  const AVATARS = [
    { name: "Sassy Pink", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" },
    { name: "Smart Boy", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" },
    { name: "Elegant Lady", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" },
    { name: "Cool Guy", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" }
  ];

  // If user is logged in, but needs to fill profile registration
  if (userEmail !== undefined || userPhone !== undefined) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white rounded-[32px] shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-slate-900 p-8 text-white text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-brand animate-bounce" />
          <h2 className="text-2xl font-black font-display uppercase tracking-tight">Complete Profile</h2>
          <p className="text-gray-300 mt-1 text-xs">Verify your details to start browsing verified companion partners on Yaarana.pk</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-6">
          {error && (
            <div className="bg-rose-50 text-brand p-3 rounded-xl flex items-center gap-2 text-xs border border-brand/10">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Select Profile Avatar</label>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {AVATARS.map((avatar, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setRegPhoto(avatar.url)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all aspect-square ${
                    regPhoto === avatar.url ? 'border-brand scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <ImageIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Or paste custom image URL"
                value={regPhoto}
                onChange={(e) => setRegPhoto(e.target.value)}
                className="w-full bg-transparent text-xs text-gray-650 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="e.g. Komail Ahmed"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-150 outline-none focus:border-brand/40 focus:bg-white text-xs text-gray-800 transition-all font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                required
                placeholder="e.g. 03217654321"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-150 outline-none focus:border-brand/40 focus:bg-white text-xs text-gray-800 transition-all font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="e.g. companion@yaarana.pk"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-150 outline-none focus:border-brand/40 focus:bg-white text-xs text-gray-800 transition-all font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-wider rounded-2xl text-xs transition-all duration-200 disabled:opacity-50 transform active:scale-95 shadow-md shadow-brand/10"
          >
            {loading ? "Registering..." : "Create Account & Start Browsing"}
          </button>
        </form>
      </div>
    );
  }

  // Otherwise, standard Login Page
  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-[32px] shadow-xl overflow-hidden border border-gray-100">
      
      {/* Dynamic Header */}
      <div className="bg-slate-900 p-10 text-white text-center relative border-b border-gray-800">
        <div className="absolute top-4 right-4 bg-white/10 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black tracking-widest text-brand">
          Secure Core
        </div>
        <div className="w-16 h-16 bg-white rounded-[20px] mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-6 border border-gray-100">
          <span className="text-xl font-black text-brand">Y.pk</span>
        </div>
        <h1 className="text-2xl font-black tracking-widest uppercase font-display">Yaarana.pk</h1>
        <p className="text-gray-300 mt-2 text-xs font-medium">Your premium companionship service in Pakistan.</p>
        <p className="text-gray-400 text-[10px] mt-1">Certified voice companions & dine-out activity partners.</p>
      </div>

      <div className="p-8">
        {error && (
          <div className="bg-rose-50 text-brand p-3 rounded-xl mb-6 flex items-center gap-2 text-xs border border-brand/10">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loginMethod === 'options' && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gray-50 hover:bg-gray-100 text-gray-700 font-extrabold rounded-2xl shadow-sm border border-gray-200 hover:border-gray-300 flex items-center justify-center gap-3 transition-all text-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? "Connecting..." : "Continue with Google"}</span>
            </button>

            <button
              onClick={() => setLoginMethod('phone')}
              className="w-full py-3.5 px-6 bg-brand hover:bg-brand-hover text-white font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-3 transition-all text-xs"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>Continue with Phone Number</span>
            </button>

            {/* Developer Bypass Option */}
            <div className="mt-4 border-t border-dashed border-gray-200 pt-4 space-y-2.5">
              <div className="text-[10px] uppercase font-black tracking-widest text-gray-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>AI Studio Developer Fast-Pass</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onDemoLogin('user')}
                  className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 border border-emerald-100"
                >
                  Demo User Mode
                </button>
                <button
                  type="button"
                  onClick={() => onDemoLogin('admin')}
                  className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-[10px] transition-all flex items-center justify-center gap-1 border border-slate-800"
                >
                  Demo Admin Mode
                </button>
              </div>
              <p className="text-[9px] text-gray-400 text-center leading-normal">
                Bypasses standard Google/SMS auth constraints to test all features instantly.
              </p>
            </div>
          </div>
        )}

        {loginMethod === 'phone' && !verificationId && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Enter Phone Number</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs text-gray-500 font-extrabold font-sans">+92</span>
                <input
                  type="tel"
                  required
                  placeholder="300 1234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-brand/40 focus:bg-white text-xs font-semibold tracking-wider text-gray-800 transition-all"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">We will send a 6-digit confirmation code via SMS verification.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLoginMethod('options')}
                className="w-1/3 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !phoneNumber}
                className="w-2/3 py-2.5 bg-brand text-white font-extrabold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Sending..." : "Send SMS Code"}
              </button>
            </div>
          </form>
        )}

        {loginMethod === 'phone' && verificationId && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Verification Code</label>
              <input
                type="text"
                required
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-center font-black text-lg tracking-widest text-gray-800 focus:border-brand/40 focus:bg-white transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1">Check your phone messages for the OTP verification code.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setVerificationId(null)}
                className="w-1/3 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !verificationCode}
                className="w-2/3 py-2.5 bg-brand text-white font-extrabold rounded-xl text-xs transition-all disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP Code"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 border-t border-gray-100 pt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold uppercase tracking-wider">End-to-End Encryption & Security Guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
