import React from 'react';
import { UserProfile, Booking } from '../types';
import { User, Phone, Mail, History, Shield, CheckCircle, Clock, AlertCircle, XCircle, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface MyAccountProps {
  profile: UserProfile | null;
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => Promise<void>;
  onLogout: () => void;
}

export default function MyAccount({ profile, bookings, onCancelBooking, onLogout }: MyAccountProps) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  // Helper for status styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-100/50">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-750 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Verifying</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 my-6">
      
      {/* Profile Details (4 Cols) */}
      <div className="md:col-span-4 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-6 self-start">
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-gray-50 shadow-md">
            <img
              src={profile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={profile?.name || 'User Profile'}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 font-display">{profile?.name || 'Anonymous User'}</h2>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <span className={`px-3 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${
                profile?.status === 'approved' ? 'bg-emerald-500 text-white shadow-sm' :
                profile?.status === 'rejected' ? 'bg-brand text-white shadow-sm' :
                'bg-amber-400 text-amber-950 animate-pulse shadow-sm'
              }`}>
                {profile?.status || 'Pending Review'}
              </span>
              <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
                {profile?.role || 'User'}
              </span>
            </div>
          </div>
        </div>

        <hr className="border-gray-100/60" />

        {/* User Stats/Details */}
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-active-bg rounded-xl text-brand border border-brand/5">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Account Name</p>
              <p className="font-extrabold text-gray-800 mt-0.5">{profile?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-active-bg rounded-xl text-brand border border-brand/5">
              <Mail className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Registered Email</p>
              <p className="font-extrabold text-gray-800 mt-0.5 truncate">{profile?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-active-bg rounded-xl text-brand border border-brand/5">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Phone Number</p>
              <p className="font-extrabold text-gray-800 mt-0.5">{profile?.phone}</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100/60" />

        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-gray-50 hover:bg-rose-50 hover:text-brand hover:border-brand/20 text-gray-600 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 border border-gray-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out / Disconnect</span>
        </button>
      </div>

      {/* Booking History (8 Cols) */}
      <div className="md:col-span-8 bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-brand" />
            <h2 className="text-xl font-black text-gray-900 font-display">Booking History</h2>
          </div>
          <span className="bg-gray-50 border border-gray-100 text-gray-650 text-[10px] font-black px-3 py-1 rounded-full">
            {bookings.length} Bookings
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-gray-100 rounded-[24px]">
            <div className="max-w-xs mx-auto space-y-3">
              <div className="w-12 h-12 bg-active-bg rounded-full flex items-center justify-center mx-auto text-brand">
                <History className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-gray-800 text-base font-display">No Bookings Yet</h3>
              <p className="text-xs text-gray-400 leading-relaxed">You haven't rented any companion yet. Browse from the partners menu to make your first booking!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 rounded-[24px] border border-gray-100 bg-gray-50/30 hover:bg-white hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 justify-between duration-200"
              >
                <div className="flex gap-4">
                  <img
                    src={booking.companionPhotoUrl}
                    alt={booking.companionName}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-100"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-gray-950 text-sm font-display">{booking.companionName}</h4>
                      <span className="text-[9px] font-black text-brand bg-active-bg px-2 py-0.5 rounded-lg border border-brand/10">
                        {booking.activity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">Date: {booking.bookingDate} | {booking.duration} Hours</p>
                    <div className="text-[10px] text-gray-500">
                      Payment via <span className="font-bold">{booking.paymentMethod}</span> ({booking.walletNumber}) • Last 4 digits: <span className="font-bold font-mono">[{booking.last4Digits}]</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col justify-between sm:items-end gap-2 shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Paid Price</p>
                    <p className="font-black text-brand text-sm">Rs. {booking.totalAmount.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {booking.status === 'pending_verification' && (
                      <button
                        onClick={() => {
                          if(confirm("Are you sure you want to cancel this pending booking?")) {
                            onCancelBooking(booking.id);
                          }
                        }}
                        className="text-[10px] font-bold text-brand hover:text-white bg-rose-50 hover:bg-brand px-2.5 py-1 rounded-full transition-all border border-brand/10"
                      >
                        Cancel
                      </button>
                    )}
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
