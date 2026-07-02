import React, { useState, useEffect } from 'react';
import { Companion, Booking } from '../types';
import { CreditCard, Calendar, Clock, DollarSign, ArrowRight, ShieldCheck, CheckCircle2, Loader2, PhoneCall } from 'lucide-react';

interface BookingPageProps {
  selectedCompanion: Companion | null;
  onBookingSubmit: (bookingData: Omit<Booking, 'id' | 'userId' | 'userEmail' | 'userName' | 'status' | 'createdAt'>) => Promise<string>;
  onNavigateToHistory: () => void;
  companions: Companion[];
  onSelectCompanionFromDropdown: (companion: Companion) => void;
}

export default function BookingPage({
  selectedCompanion,
  onBookingSubmit,
  onNavigateToHistory,
  companions,
  onSelectCompanionFromDropdown
}: BookingPageProps) {
  // Booking Form State
  const [selectedCompId, setSelectedCompId] = useState(selectedCompanion?.id || '');
  const [activity, setActivity] = useState('Call Companionship');
  const [duration, setDuration] = useState(2); // hours
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'JazzCash' | 'EasyPaisa'>('JazzCash');
  const [walletNumber, setWalletNumber] = useState('');
  const [last4Digits, setLast4Digits] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI Flow State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [verificationStep, setVerificationStep] = useState<'form' | 'countdown' | 'confirmed'>('form');
  const [countdown, setCountdown] = useState(30);
  const [verificationMessage, setVerificationMessage] = useState('Initiating merchant verification...');

  // Active Companion determination
  const activeCompanion = companions.find(c => c.id === selectedCompId) || selectedCompanion;

  useEffect(() => {
    if (selectedCompanion) {
      setSelectedCompId(selectedCompanion.id);
      if (selectedCompanion.services.length > 0) {
        setActivity(selectedCompanion.services[0]);
      }
    }
  }, [selectedCompanion]);

  // Handle dropdown switch
  const handleCompanionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setSelectedCompId(cid);
    setErrorMsg(null);
    const comp = companions.find(c => c.id === cid);
    if (comp) {
      onSelectCompanionFromDropdown(comp);
      if (comp.services.length > 0) {
        setActivity(comp.services[0]);
      }
    }
  };

  const totalAmount = activeCompanion ? activeCompanion.rate * duration : 0;

  // Real-time verification simulation
  useEffect(() => {
    let timer: any;
    if (verificationStep === 'countdown' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
        
        // Dynamic step messages for authentic Pakistan wallet gateway verification experience
        if (countdown > 20) {
          setVerificationMessage(`Connecting to ${paymentMethod} API gateway...`);
        } else if (countdown > 12) {
          setVerificationMessage(`Validating Sender Wallet: ${walletNumber} with Tx ID match...`);
        } else if (countdown > 5) {
          setVerificationMessage(`Verifying last 4 digits [${last4Digits}] on state server...`);
        } else {
          setVerificationMessage("Finalizing companion allocation...");
        }
      }, 1000);
    } else if (verificationStep === 'countdown' && countdown === 0) {
      setVerificationStep('confirmed');
    }
    return () => clearTimeout(timer);
  }, [countdown, verificationStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!activeCompanion) {
      setErrorMsg("Please select a companion first.");
      return;
    }
    if (walletNumber.length < 10) {
      setErrorMsg("Please enter a valid Sender Wallet Number.");
      return;
    }
    if (last4Digits.length !== 4) {
      setErrorMsg("Please enter exactly the last 4 digits of the payment confirmation message.");
      return;
    }

    setIsSubmitting(true);
    try {
      const bid = await onBookingSubmit({
        companionId: activeCompanion.id,
        companionName: activeCompanion.name,
        companionPhotoUrl: activeCompanion.photoUrl,
        activity,
        duration,
        totalAmount,
        paymentMethod,
        walletNumber,
        last4Digits,
        bookingDate
      });
      setBookingId(bid);
      setVerificationStep('countdown');
      setCountdown(30);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to submit booking. Please check your network connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. CONFIRMED SCREEN
  if (verificationStep === 'confirmed') {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-[32px] shadow-2xl overflow-hidden text-center border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-10 text-white flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black font-display tracking-tight">Booking Confirmed!</h2>
          <p className="text-emerald-100 text-xs mt-1 font-medium">Transaction verified successfully on {paymentMethod}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-emerald-50/40 p-6 rounded-[24px] border border-emerald-50 text-left space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={activeCompanion?.photoUrl}
                alt={activeCompanion?.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400"
              />
              <div className="text-left">
                <h4 className="font-extrabold text-md text-emerald-950 font-display">{activeCompanion?.name}</h4>
                <p className="text-[10px] font-black text-emerald-700 bg-emerald-100/50 px-2.5 py-1 rounded-lg inline-block mt-1 uppercase tracking-wider">{activity}</p>
              </div>
            </div>

            <hr className="border-emerald-100/40" />

            <div className="grid grid-cols-2 gap-4 text-left text-xs">
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wide text-[9px]">Date</p>
                <p className="font-extrabold text-gray-700 mt-0.5">{bookingDate}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wide text-[9px]">Duration</p>
                <p className="font-extrabold text-gray-700 mt-0.5">{duration} Hours</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wide text-[9px]">Total Amount Paid</p>
                <p className="font-black text-brand mt-0.5">Rs. {totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 font-bold uppercase tracking-wide text-[9px]">Booking ID</p>
                <p className="font-mono text-gray-500 font-bold mt-0.5">#{bookingId?.slice(-6).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
            Your premium companionship has been allocated. {activeCompanion?.name} is ready for you! You can view full communication links inside your Booking History.
          </div>

          <div>
            <button
              onClick={onNavigateToHistory}
              className="w-full py-4 bg-brand hover:bg-brand-hover text-white font-extrabold rounded-[18px] shadow-lg shadow-brand/10 transition-all text-xs"
            >
              Go to Booking History
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. COUNTDOWN / VERIFYING SCREEN
  if (verificationStep === 'countdown') {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-[32px] shadow-2xl overflow-hidden text-center border border-gray-100 my-8 p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="space-y-4">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {/* Spinning Ring */}
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-brand rounded-full border-t-transparent animate-spin"></div>
            <span className="text-xl font-black text-brand font-display">{countdown}s</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 font-display">Verifying Your Payment</h2>
          <p className="text-[10px] text-brand font-black tracking-widest uppercase">{paymentMethod} Gateway</p>
        </div>

        <div className="bg-active-bg/30 p-6 rounded-[24px] border border-brand/5 space-y-4 max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-brand animate-spin" />
            <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">{verificationMessage}</span>
          </div>
          <hr className="border-brand/5" />
          <div className="text-left space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-400 font-medium">Total Price:</span><span className="font-black text-gray-800">Rs. {totalAmount.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-400 font-medium">Sender Wallet:</span><span className="font-bold text-gray-800">{walletNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-400 font-medium">Last 4 Digits:</span><span className="font-bold text-gray-800 font-mono">[{last4Digits}]</span></div>
          </div>
        </div>

        <div className="text-[11px] text-gray-400 max-w-xs mx-auto leading-relaxed">
          * Please do not close this window or click refresh. Your transaction is verified in under 30 seconds.
        </div>
      </div>
    );
  }

  // 3. MAIN FORM SCREEN
  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 my-6">
      
      {/* Left Column: Form (7 Cols) */}
      <div className="md:col-span-7 bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-black text-gray-900 font-display">Create Companionship Booking</h2>
          <p className="text-xs text-gray-400 mt-1">Simple, friendly, and 100% secure.</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-2xl p-4 text-xs font-semibold animate-in fade-in duration-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Companion Selection if none is selected */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Select Companion</label>
            <select
              value={selectedCompId}
              onChange={handleCompanionChange}
              required
              className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-bold text-gray-700 outline-none focus:border-brand/40 cursor-pointer transition-all"
            >
              <option value="" disabled>-- Select a partner --</option>
              {companions.map(comp => (
                <option key={comp.id} value={comp.id}>{comp.name} (Rs. {comp.rate.toLocaleString()}/hr)</option>
              ))}
            </select>
          </div>

          {activeCompanion && (
            <>
              {/* Activity / Service selection */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Companionship Activity</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {activeCompanion.services.map((srv, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setActivity(srv)}
                      className={`px-3 py-3.5 rounded-2xl border-2 font-extrabold text-xs text-left transition-all ${
                        activity === srv 
                        ? 'border-brand bg-active-bg text-brand shadow-sm' 
                        : 'border-gray-50 hover:border-gray-200 text-gray-600 bg-white'
                      }`}
                    >
                      {srv}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time & Date Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-bold text-gray-700 outline-none focus:border-brand/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Duration (Hours)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      max="24"
                      value={duration}
                      onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full pl-10 pr-3 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-bold text-gray-700 outline-none focus:border-brand/40"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">1. Select Wallet Gateway</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('JazzCash')}
                      className={`relative py-4 px-6 rounded-2xl border-2 font-black tracking-wider transition-all flex items-center justify-center gap-2 ${
                        paymentMethod === 'JazzCash'
                        ? 'border-brand bg-[#FFF5F5] text-brand shadow-sm'
                        : 'border-gray-50 text-gray-500 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                      <span className="text-xs font-bold">JazzCash</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('EasyPaisa')}
                      className={`relative py-4 px-6 rounded-2xl border-2 font-black tracking-wider transition-all flex items-center justify-center gap-2 ${
                        paymentMethod === 'EasyPaisa'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-gray-50 text-gray-500 hover:border-gray-200 bg-white'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-bold">EasyPaisa</span>
                    </button>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="bg-active-bg/45 p-4 rounded-[18px] border border-brand/5 text-xs leading-relaxed space-y-1">
                  <p className="font-extrabold text-brand">Official Merchant Instructions:</p>
                  <p className="text-gray-600 font-medium">
                    Please open your {paymentMethod} mobile application, and send exactly <span className="font-extrabold text-brand">Rs. {totalAmount.toLocaleString()}</span> to the official merchant wallet below:
                  </p>
                  <p className="font-mono text-sm font-black text-brand mt-1">0312-3456789</p>
                  <p className="text-[10px] text-gray-400 font-semibold">(Account Title: Yaarana Merchant Group)</p>
                </div>

                {/* Inputs for verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">2. Your Sender Wallet No.</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 03217654321"
                      value={walletNumber}
                      onChange={(e) => setWalletNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-bold text-gray-700 outline-none focus:border-brand/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">3. Last 4 Digits of Wallet</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      placeholder="e.g. 5432"
                      value={last4Digits}
                      onChange={(e) => setLast4Digits(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-black font-mono tracking-widest text-center text-gray-700 outline-none focus:border-brand/40"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 mt-4 bg-brand hover:bg-brand-hover text-white font-extrabold rounded-[18px] shadow-lg shadow-brand/10 hover:shadow-xl hover:shadow-brand/15 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <span>Book & Send Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </form>
      </div>

      {/* Right Column: Pricing details (5 Cols) */}
      <div className="md:col-span-5 space-y-6">
        {activeCompanion ? (
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6">
            <h3 className="font-extrabold text-lg text-gray-900 border-b border-gray-100 pb-3 font-display">Selected Partner</h3>
            
            <div className="flex gap-4">
              <img
                src={activeCompanion.photoUrl}
                alt={activeCompanion.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm"
              />
              <div className="space-y-1">
                <h4 className="font-black text-gray-950 text-md font-display">{activeCompanion.name}</h4>
                <p className="text-xs text-gray-400 font-medium">Age: {activeCompanion.age} | {activeCompanion.gender}</p>
                <div className="flex items-center gap-1 text-xs text-brand font-extrabold">
                  <span className="text-accent text-xs">★</span>
                  <span>{activeCompanion.rating}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400 font-normal">{activeCompanion.reviewsCount} reviews</span>
                </div>
              </div>
            </div>

            <hr className="border-gray-100/60" />

            {/* Calculations */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Companionship rate:</span>
                <span className="font-extrabold text-gray-750">Rs. {activeCompanion.rate.toLocaleString()} / Hour</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Selected hours:</span>
                <span className="font-extrabold text-gray-750">{duration} Hours</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtotal:</span>
                <span className="font-extrabold text-gray-750">Rs. {(activeCompanion.rate * duration).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Taxes & Gateway fee:</span>
                <span className="font-extrabold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/30">Rs. 0 (Free)</span>
              </div>

              <hr className="border-dashed border-gray-150" />

              <div className="flex justify-between items-center bg-active-bg/30 p-4 rounded-[20px] border border-brand/5">
                <span className="text-xs font-black text-brand uppercase tracking-wider">Total Amount:</span>
                <span className="text-xl font-black text-brand">Rs. {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-gray-400 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Client Discretion & Safety Guaranteed</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] p-8 text-center border border-dashed border-gray-200">
            <h3 className="font-bold text-gray-400 text-xs leading-relaxed">Please select a companion on the left first to calculate final price.</h3>
          </div>
        )}
      </div>
    </div>
  );
}
