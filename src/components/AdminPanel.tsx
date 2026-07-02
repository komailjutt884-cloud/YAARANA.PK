import React, { useState } from 'react';
import { UserProfile, Companion, Booking } from '../types';
import { Plus, Users, ShieldAlert, Check, X, ShieldCheck, Heart, Trash2, MapPin, DollarSign, ListCollapse } from 'lucide-react';

interface AdminPanelProps {
  usersQueue: UserProfile[];
  companions: Companion[];
  bookings: Booking[];
  onApproveUser: (uid: string) => Promise<void>;
  onRejectUser: (uid: string) => Promise<void>;
  onAddCompanion: (companionData: Omit<Companion, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteCompanion: (companionId: string) => Promise<void>;
  onSeedDemoCompanions: () => void;
  onApproveBooking: (bookingId: string) => Promise<void>;
  onRejectBooking: (bookingId: string) => Promise<void>;
}

export default function AdminPanel({
  usersQueue,
  companions,
  bookings,
  onApproveUser,
  onRejectUser,
  onAddCompanion,
  onDeleteCompanion,
  onSeedDemoCompanions,
  onApproveBooking,
  onRejectBooking
}: AdminPanelProps) {
  // New Companion Form States
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(22);
  const [gender, setGender] = useState('Female');
  const [location, setLocation] = useState('Lahore, Punjab');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400');
  const [rate, setRate] = useState<number>(2000);
  const [about, setAbout] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>(["Call Companionship"]);

  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'companions' | 'add_companion'>('users');
  const [submitting, setSubmitting] = useState(false);

  // Available companion services
  const SERVICE_OPTIONS = [
    "Dining Out",
    "Movies & Cinema",
    "Call Companionship",
    "Scenic Travel",
    "Spending a Day Together",
    "Spending a Night Together"
  ];

  const handleServiceToggle = (srv: string) => {
    if (selectedServices.includes(srv)) {
      setSelectedServices(selectedServices.filter(s => s !== srv));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const handleSubmitCompanion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !about.trim()) {
      alert("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await onAddCompanion({
        name,
        age,
        gender,
        location,
        photoUrl,
        rate,
        services: selectedServices,
        about,
        availability: 'Available',
        rating: 5.0,
        reviewsCount: 1
      });
      alert("Companion added successfully!");
      // Reset form
      setName('');
      setAbout('');
      setSelectedServices(["Call Companionship"]);
      setActiveTab('companions');
    } catch (err) {
      console.error(err);
      alert("Failed to add companion.");
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const totalEarnings = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="space-y-8">
      {/* Admin Dashboard Header / Stats */}
      <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand font-black uppercase text-[10px] tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Yaarana.pk Administrator Control Console</span>
            </div>
            <h1 className="text-3xl font-black mt-1 font-display">Management Portal</h1>
          </div>

          <button
            onClick={onSeedDemoCompanions}
            className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white font-extrabold rounded-2xl text-xs transition-all active:scale-95 shadow-md shadow-brand/10"
          >
            Seed Demo Data
          </button>
        </div>

        {/* Core Admin Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Registrations</p>
            <p className="text-2xl font-black text-brand mt-1">{usersQueue.length}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Approved & Pending Users</p>
          </div>

          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Partners</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{companions.length}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Manual & Demo Companions</p>
          </div>

          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Bookings</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{bookings.length}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Pending & Verified Hires</p>
          </div>

          <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confirmed Revenue</p>
            <p className="text-2xl font-black text-white mt-1">Rs. {totalEarnings.toLocaleString()}</p>
            <p className="text-[9px] text-emerald-500 font-medium mt-0.5">Verified Wallet Earnings</p>
          </div>
        </div>
      </div>

      {/* Admin Subtabs */}
      <div className="flex border-b border-gray-150 gap-1.5 scrollbar-thin overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 font-extrabold text-xs tracking-wider uppercase border-b-2 transition-all shrink-0 ${
            activeTab === 'users' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Registration Queue ({usersQueue.filter(u => u.status === 'pending').length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-3 font-extrabold text-xs tracking-wider uppercase border-b-2 transition-all shrink-0 ${
            activeTab === 'bookings' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Verification Center ({bookings.filter(b => b.status === 'pending_verification').length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('companions')}
          className={`px-5 py-3 font-extrabold text-xs tracking-wider uppercase border-b-2 transition-all shrink-0 ${
            activeTab === 'companions' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Manage Companions ({companions.length})
        </button>

        <button
          onClick={() => setActiveTab('add_companion')}
          className={`px-5 py-3 font-extrabold text-xs tracking-wider uppercase border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'add_companion' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Companion</span>
        </button>
      </div>

      {/* TAB CONTENT: 1. REGISTRATION QUEUE */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-lg text-gray-900 font-display">User Registrations Queue</h3>
            <p className="text-xs text-gray-400 mt-0.5">Admin approval is required before standard users can view companion listings.</p>
          </div>

          {usersQueue.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No registered user records in database yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {usersQueue.map((user) => (
                <div key={user.uid} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-150 shadow-sm"
                    />
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-sm flex items-center gap-2 font-display">
                        <span>{user.name}</span>
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          user.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' :
                          user.status === 'rejected' ? 'bg-rose-50 text-brand border border-brand/10' :
                          'bg-amber-50 text-amber-700 border border-amber-100/50'
                        }`}>
                          {user.status}
                        </span>
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">{user.email} • {user.phone}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {user.status !== 'approved' && (
                      <button
                        onClick={() => onApproveUser(user.uid)}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all shadow-sm border border-emerald-100/50"
                        title="Approve User"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {user.status !== 'rejected' && (
                      <button
                        onClick={() => onRejectUser(user.uid)}
                        className="p-2 bg-rose-50 hover:bg-brand/10 text-brand rounded-xl transition-all shadow-sm border border-brand/10"
                        title="Reject User"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 2. VERIFICATION CENTER */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-lg text-gray-900 font-display">Booking Verification Center</h3>
            <p className="text-xs text-gray-400 mt-0.5">Verify wallet transactions and confirm customer booking requests.</p>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No booking records in database yet.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-gray-900 text-sm font-display">Customer: {booking.userName}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black">#{booking.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="space-y-1 text-gray-500">
                      <div>Booking: <span className="font-bold text-gray-800">{booking.companionName}</span> for <span className="font-bold text-gray-800">{booking.activity}</span></div>
                      <div>Date: <span className="font-semibold text-gray-600">{booking.bookingDate}</span> ({booking.duration} Hours) • Amount: <span className="font-extrabold text-brand">Rs. {booking.totalAmount.toLocaleString()}</span></div>
                      <div className="bg-active-bg/50 p-2.5 rounded-lg border border-brand/5 inline-block text-[11px]">
                        Payment: <span className="font-extrabold text-brand">{booking.paymentMethod}</span> ({booking.walletNumber}) • Last 4 digits: <span className="font-bold font-mono text-brand">[{booking.last4Digits}]</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center shrink-0">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                      booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      booking.status === 'cancelled' ? 'bg-rose-50 text-brand border-brand/10' :
                      'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                    }`}>
                      {booking.status}
                    </span>

                    {booking.status === 'pending_verification' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onApproveBooking(booking.id)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-100 transition-all"
                          title="Verify and Confirm Booking"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRejectBooking(booking.id)}
                          className="p-1.5 bg-rose-50 hover:bg-brand/10 text-brand rounded-lg border border-brand/10 transition-all"
                          title="Reject/Cancel Booking"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. MANAGE COMPANIONS */}
      {activeTab === 'companions' && (
        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-lg text-gray-900 font-display">Manually Added Companions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Review, verify, or remove the active partner database profiles.</p>
          </div>

          {companions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No companion listings in database yet. Click "Add Companion" tab or "Seed Demo Data" above!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {companions.map((comp) => (
                <div key={comp.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={comp.photoUrl}
                      alt={comp.name}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-150 shadow-sm"
                    />
                    <div>
                      <h4 className="font-extrabold text-gray-950 text-sm font-display">{comp.name}, <span className="font-normal text-gray-500">{comp.age} yrs</span></h4>
                      <div className="flex items-center gap-2 text-gray-400 mt-0.5 font-medium">
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-brand" />{comp.location}</span>
                        <span>•</span>
                        <span className="text-brand font-extrabold">Rs. {comp.rate.toLocaleString()}/hr</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-2.5 py-0.5 rounded font-extrabold uppercase text-[9px] tracking-wide">
                      {comp.availability}
                    </span>
                    <button
                      onClick={() => {
                        if(confirm(`Are you sure you want to delete ${comp.name} from the platform?`)) {
                          onDeleteCompanion(comp.id);
                        }
                      }}
                      className="p-2 bg-rose-50 hover:bg-brand/10 text-brand rounded-xl border border-brand/10 transition-all"
                      title="Delete Companion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 4. ADD COMPANION FORM */}
      {activeTab === 'add_companion' && (
        <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-lg text-gray-900 font-display">Register New Companion Profile</h3>
            <p className="text-xs text-gray-400 mt-0.5">Manually input certified companions into the Yaarana.pk database.</p>
          </div>

          <form onSubmit={handleSubmitCompanion} className="space-y-6 text-xs font-semibold text-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alizeh Shah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 outline-none text-gray-700 focus:bg-white focus:border-brand/40"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Age</label>
                <input
                  type="number"
                  required
                  min={18}
                  max={60}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 22)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 outline-none text-gray-700 focus:bg-white focus:border-brand/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 outline-none text-gray-700 focus:bg-white focus:border-brand/40 cursor-pointer"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">City Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore, Punjab"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 outline-none text-gray-700 focus:bg-white focus:border-brand/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Profile Photo URL</label>
                <input
                  type="text"
                  required
                  placeholder="Paste direct Unsplash/image link..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 outline-none text-gray-700 focus:bg-white focus:border-brand/40"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Rate (PKR / Hour)</label>
                <input
                  type="number"
                  required
                  min={100}
                  value={rate}
                  onChange={(e) => setRate(parseInt(e.target.value) || 2000)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 outline-none text-gray-700 focus:bg-white focus:border-brand/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Supported Services / Activities (Select multiple)</label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_OPTIONS.map((srv, idx) => {
                  const isChecked = selectedServices.includes(srv);
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleServiceToggle(srv)}
                      className={`px-3 py-2.5 rounded-xl border font-bold transition-all ${
                        isChecked 
                        ? 'bg-active-bg border-brand/40 text-brand shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {srv}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 mb-1.5">Companion Bio / About</label>
              <textarea
                required
                rows={3}
                placeholder="Write a sweet, inviting description..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 outline-none text-gray-700 focus:bg-white focus:border-brand/40"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? "Registering..." : "Add Partner Profile"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
