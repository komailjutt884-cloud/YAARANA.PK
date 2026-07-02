import React, { useEffect, useState } from 'react';
import { UserProfile, Companion, Booking } from './types';
import LoginPage from './components/LoginPage';
import BrowseCompanions from './components/BrowseCompanions';
import BookingPage from './components/BookingPage';
import MyAccount from './components/MyAccount';
import AdminPanel from './components/AdminPanel';
import { Heart, User, ShieldCheck, History, LogOut, Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { SAMPLE_COMPANIONS } from './data/sampleCompanions';
import { isSupabaseConfigured } from './supabase';

// Import unified database operations
import {
  subscribeAuth,
  signOutUser,
  getProfile,
  saveProfile,
  subscribeCompanions,
  subscribeBookings,
  subscribeUsersQueue,
  approveUser,
  rejectUser,
  addCompanion,
  deleteCompanion,
  submitBooking,
  cancelBooking,
  approveBooking,
  rejectBooking,
  seedCompanions
} from './dbAdapter';

export default function App() {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('yaarana_demo_mode') === 'true';
  });

  const [user, setUser] = useState<any>(() => {
    if (localStorage.getItem('yaarana_demo_mode') === 'true') {
      const savedUser = localStorage.getItem('yaarana_demo_user');
      return savedUser ? JSON.parse(savedUser) : { uid: 'demo_user_id', email: 'demo@yaarana.pk', displayName: 'Demo Companion Partner' };
    }
    return null;
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (localStorage.getItem('yaarana_demo_mode') === 'true') {
      const savedProfile = localStorage.getItem('yaarana_demo_profile');
      return savedProfile ? JSON.parse(savedProfile) : {
        uid: 'demo_user_id',
        email: 'demo@yaarana.pk',
        phone: '03001234567',
        name: 'Demo Companion Partner',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        status: 'approved',
        role: 'user',
        createdAt: new Date().toISOString()
      };
    }
    return null;
  });

  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'booking' | 'history' | 'admin'>('browse');

  // Unified Data State
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersQueue, setUsersQueue] = useState<UserProfile[]>([]);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);

  // Dev state
  const [devBypassLoading, setDevBypassLoading] = useState(false);

  // Helper functions for local demo data saving
  const saveDemoCompanions = (list: Companion[]) => {
    setCompanions(list);
    localStorage.setItem('yaarana_demo_companions', JSON.stringify(list));
  };

  const saveDemoBookings = (list: Booking[]) => {
    setBookings(list);
    localStorage.setItem('yaarana_demo_bookings', JSON.stringify(list));
  };

  const saveDemoUsersQueue = (list: UserProfile[]) => {
    setUsersQueue(list);
    localStorage.setItem('yaarana_demo_users_queue', JSON.stringify(list));
  };

  // Load local data in Demo Mode
  useEffect(() => {
    if (!isDemoMode) return;
    
    // Load Companions
    const savedComps = localStorage.getItem('yaarana_demo_companions');
    if (savedComps) {
      setCompanions(JSON.parse(savedComps));
    } else {
      setCompanions(SAMPLE_COMPANIONS.map((c, i) => ({ id: `comp_${i + 1}`, ...c, createdAt: new Date().toISOString() })));
    }

    // Load Bookings
    const savedBookings = localStorage.getItem('yaarana_demo_bookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      setBookings([]);
    }

    // Load Users Queue
    const savedQueue = localStorage.getItem('yaarana_demo_users_queue');
    if (savedQueue) {
      setUsersQueue(JSON.parse(savedQueue));
    } else {
      // Seed with some pending demo user profiles for admin testing
      const initialQueue: UserProfile[] = [
        {
          uid: 'demo_pending_1',
          name: 'Hassan Ali',
          email: 'hassan@gmail.com',
          phone: '03211112222',
          photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
          status: 'pending',
          role: 'user',
          createdAt: new Date().toISOString()
        },
        {
          uid: 'demo_pending_2',
          name: 'Ayesha Khan',
          email: 'ayesha@gmail.com',
          phone: '03334445555',
          photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
          status: 'pending',
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ];
      saveDemoUsersQueue(initialQueue);
    }
  }, [isDemoMode]);

  // Demo Login Handler
  const handleDemoLogin = (role: 'user' | 'admin') => {
    const mockUserObj = {
      uid: 'demo_user_id',
      email: role === 'admin' ? 'komailjutt884@gmail.com' : 'demo@yaarana.pk',
      displayName: role === 'admin' ? 'Komail Ahmed (Admin)' : 'Demo Companion Partner',
      photoURL: role === 'admin' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    };

    const mockProfileObj: UserProfile = {
      uid: 'demo_user_id',
      email: mockUserObj.email,
      phone: role === 'admin' ? '03217654321' : '03001234567',
      name: mockUserObj.displayName,
      photoURL: mockUserObj.photoURL,
      status: 'approved',
      role: role,
      createdAt: new Date().toISOString()
    };

    setIsDemoMode(true);
    setUser(mockUserObj);
    setProfile(mockProfileObj);
    localStorage.setItem('yaarana_demo_mode', 'true');
    localStorage.setItem('yaarana_demo_user', JSON.stringify(mockUserObj));
    localStorage.setItem('yaarana_demo_profile', JSON.stringify(mockProfileObj));
    
    if (role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('browse');
    }
  };

  // 1. Auth Listener using unified adapter
  useEffect(() => {
    if (isDemoMode) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = subscribeAuth(isDemoMode, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const fetchedProfile = await getProfile(isDemoMode, currentUser);
          if (fetchedProfile) {
            const isAdminEmail = (currentUser.email || '').toLowerCase() === 'komailjutt884@gmail.com';
            if (isAdminEmail && (fetchedProfile.role !== 'admin' || fetchedProfile.status !== 'approved')) {
              const updated = await saveProfile(
                isDemoMode, 
                currentUser, 
                {
                  name: fetchedProfile.name,
                  phone: fetchedProfile.phone,
                  email: fetchedProfile.email,
                  photoURL: fetchedProfile.photoURL
                }, 
                'admin'
              );
              setProfile(updated);
            } else {
              setProfile(fetchedProfile);
            }
          } else {
            // Wait for user registration form input
            setProfile(null);
          }
        } catch (err) {
          console.error("Error reading profile:", err);
        }
      } else {
        setProfile(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, [isDemoMode]);

  // 2. Real-time companions snapshot using unified adapter
  useEffect(() => {
    if (isDemoMode) return;
    if (!user || !profile || (profile.status !== 'approved' && profile.role !== 'admin')) return;

    const unsubscribe = subscribeCompanions(isDemoMode, (list) => {
      setCompanions(list);
    });

    return unsubscribe;
  }, [user, profile?.status, profile?.role, isDemoMode]);

  // 3. Real-time user bookings snapshot using unified adapter
  useEffect(() => {
    if (isDemoMode) return;
    if (!user || !profile) return;

    const unsubscribe = subscribeBookings(isDemoMode, user, profile, (list) => {
      setBookings(list);
    });

    return unsubscribe;
  }, [user, profile?.role, isDemoMode]);

  // 4. Real-time admin users list using unified adapter
  useEffect(() => {
    if (isDemoMode) return;
    if (!user || profile?.role !== 'admin') return;

    const unsubscribe = subscribeUsersQueue(isDemoMode, user, profile, (list) => {
      setUsersQueue(list);
    });

    return unsubscribe;
  }, [user, profile?.role, isDemoMode]);

  // 5. Actions Handlers

  const handleRegisterSubmit = async (profileData: { name: string; phone: string; email: string; photoURL: string }) => {
    if (isDemoMode) {
      const newProfile: UserProfile = {
        uid: 'demo_user_id',
        email: profileData.email,
        phone: profileData.phone,
        name: profileData.name,
        photoURL: profileData.photoURL,
        status: 'approved',
        role: profile?.role || 'user',
        createdAt: new Date().toISOString()
      };
      setProfile(newProfile);
      localStorage.setItem('yaarana_demo_profile', JSON.stringify(newProfile));
      return;
    }
    if (!user) return;
    
    try {
      const saved = await saveProfile(isDemoMode, user, profileData);
      setProfile(saved);
    } catch (err) {
      console.error("Register submit error:", err);
    }
  };

  const handleApproveUser = async (uid: string) => {
    if (isDemoMode) {
      const updated = usersQueue.map(u => u.uid === uid ? { ...u, status: 'approved' as const } : u);
      saveDemoUsersQueue(updated);
      return;
    }
    try {
      await approveUser(isDemoMode, uid);
    } catch (err) {
      console.error("Approve user error:", err);
    }
  };

  const handleRejectUser = async (uid: string) => {
    if (isDemoMode) {
      const updated = usersQueue.map(u => u.uid === uid ? { ...u, status: 'rejected' as const } : u);
      saveDemoUsersQueue(updated);
      return;
    }
    try {
      await rejectUser(isDemoMode, uid);
    } catch (err) {
      console.error("Reject user error:", err);
    }
  };

  const handleAddCompanion = async (companionData: Omit<Companion, 'id' | 'createdAt'>) => {
    if (isDemoMode) {
      const newComp: Companion = {
        id: `comp_${Date.now()}`,
        ...companionData,
        rating: 5.0,
        reviewsCount: 1,
        createdAt: new Date().toISOString()
      };
      saveDemoCompanions([newComp, ...companions]);
      return;
    }
    try {
      await addCompanion(isDemoMode, companionData);
    } catch (err) {
      console.error("Add companion error:", err);
    }
  };

  const handleDeleteCompanion = async (companionId: string) => {
    if (isDemoMode) {
      const updated = companions.filter(c => c.id !== companionId);
      saveDemoCompanions(updated);
      return;
    }
    try {
      await deleteCompanion(isDemoMode, companionId);
    } catch (err) {
      console.error("Delete companion error:", err);
    }
  };

  const handleBookingSubmit = async (bookingData: Omit<Booking, 'id' | 'userId' | 'userEmail' | 'userName' | 'status' | 'createdAt'>) => {
    if (isDemoMode) {
      const newBooking: Booking = {
        ...bookingData,
        id: `book_${Date.now()}`,
        userId: user?.uid || 'demo_user_id',
        userEmail: profile?.email || 'demo@yaarana.pk',
        userName: profile?.name || 'Demo User',
        status: 'pending_verification',
        createdAt: new Date().toISOString()
      };
      saveDemoBookings([newBooking, ...bookings]);
      return newBooking.id;
    }
    try {
      return await submitBooking(isDemoMode, user, profile, bookingData);
    } catch (err) {
      console.error("Submit booking error:", err);
      throw err;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (isDemoMode) {
      const updated = bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b);
      saveDemoBookings(updated);
      return;
    }
    try {
      await cancelBooking(isDemoMode, bookingId);
    } catch (err) {
      console.error("Cancel booking error:", err);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    if (isDemoMode) {
      const updated = bookings.map(b => b.id === bookingId ? { ...b, status: 'confirmed' as const } : b);
      saveDemoBookings(updated);
      return;
    }
    try {
      await approveBooking(isDemoMode, bookingId);
    } catch (err) {
      console.error("Approve booking error:", err);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    if (isDemoMode) {
      const updated = bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b);
      saveDemoBookings(updated);
      return;
    }
    try {
      await rejectBooking(isDemoMode, bookingId);
    } catch (err) {
      console.error("Reject booking error:", err);
    }
  };

  const handleSeedDemoCompanions = async () => {
    if (isDemoMode) {
      const list = SAMPLE_COMPANIONS.map((c, i) => ({ id: `comp_${Date.now()}_${i}`, ...c, createdAt: new Date().toISOString() }));
      saveDemoCompanions([...list, ...companions]);
      alert("Successfully seeded 5 detailed companion profiles!");
      return;
    }
    try {
      await seedCompanions(isDemoMode);
      alert("Successfully seeded 5 detailed companion profiles!");
    } catch (err) {
      console.error("Seed error:", err);
    }
  };

  // Developer Bypass to instantly approve currently pending account for easy testing
  const handleInstantApprovalBypass = async () => {
    if (isDemoMode) {
      const newProfile: UserProfile = {
        uid: 'demo_user_id',
        email: profile?.email || 'demo@yaarana.pk',
        phone: profile?.phone || '03001234567',
        name: profile?.name || 'Demo Companion Partner',
        photoURL: profile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        status: 'approved',
        role: 'user',
        createdAt: new Date().toISOString()
      };
      setProfile(newProfile);
      localStorage.setItem('yaarana_demo_profile', JSON.stringify(newProfile));
      return;
    }
    if (!user) return;
    setDevBypassLoading(true);
    try {
      const saved = await saveProfile(isDemoMode, user, {
        name: user.displayName || "Demo User",
        email: user.email || "demo@yaarana.pk",
        phone: "03123456789",
        photoURL: user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
      }, 'user');
      setProfile(saved);
    } catch (err) {
      console.error(err);
      alert("Fast-pass approval failed.");
    } finally {
      setDevBypassLoading(false);
    }
  };

  const handleInstantAdminBypass = async () => {
    if (isDemoMode) {
      const newProfile: UserProfile = {
        uid: 'demo_user_id',
        email: 'komailjutt884@gmail.com',
        phone: '03217654321',
        name: 'Komail Ahmed (Admin)',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        status: 'approved',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      setProfile(newProfile);
      localStorage.setItem('yaarana_demo_profile', JSON.stringify(newProfile));
      setActiveTab('admin');
      return;
    }
    if (!user) return;
    setDevBypassLoading(true);
    try {
      const saved = await saveProfile(isDemoMode, user, {
        name: user.displayName || "Komail Ahmed (Admin)",
        email: user.email || "komailjutt884@gmail.com",
        phone: "03217654321",
        photoURL: user.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
      }, 'admin');
      setProfile(saved);
      setActiveTab('admin');
    } catch (err) {
      console.error(err);
      alert("Admin escalation failed.");
    } finally {
      setDevBypassLoading(false);
    }
  };

  const handleSelectCompanion = (companion: Companion) => {
    setSelectedCompanion(companion);
    setActiveTab('booking');
  };

  const handleLogout = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('yaarana_demo_mode');
      localStorage.removeItem('yaarana_demo_user');
      localStorage.removeItem('yaarana_demo_profile');
      setActiveTab('browse');
      return;
    }
    signOutUser(isDemoMode).then(() => {
      setUser(null);
      setProfile(null);
      setActiveTab('browse');
    }).catch(err => {
      console.error("Signout error", err);
      setUser(null);
      setProfile(null);
      setActiveTab('browse');
    });
  };


  if (authLoading) {
    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
        <p className="text-sm font-semibold text-rose-700 font-sans tracking-wide">Loading Yaarana.pk core services...</p>
      </div>
    );
  }

  // 1. If not logged in at all, show LoginPage
  if (!user) {
    return (
      <div className="min-h-screen bg-rose-50/50 p-4 md:p-8 flex flex-col justify-between">
        <div className="flex-1 flex items-center justify-center">
          <LoginPage onRegisterSubmit={handleRegisterSubmit} onDemoLogin={handleDemoLogin} />
        </div>
        <footer className="text-center text-[10px] text-gray-400 font-medium py-4">
          © 2026 Yaarana.pk Companion Services. All rights reserved. Made for discretion & warmth.
        </footer>
      </div>
    );
  }

  // 2. If logged in but doesn't have a profile record yet, show LoginPage profile form
  if (user && !profile) {
    return (
      <div className="min-h-screen bg-rose-50/50 p-4 md:p-8 flex flex-col justify-between">
        <div className="flex-1 flex items-center justify-center">
          <LoginPage
            onRegisterSubmit={handleRegisterSubmit}
            userEmail={user.email}
            userPhone={user.phoneNumber}
            onDemoLogin={handleDemoLogin}
          />
        </div>
        <footer className="text-center text-[10px] text-gray-400 font-medium py-4">
          © 2026 Yaarana.pk Companion Services. All rights reserved. Made for discretion & warmth.
        </footer>
      </div>
    );
  }

  // 3. If account is pending approval (And is not admin)
  if (profile && profile.status === 'pending' && profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-rose-50/50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-rose-100 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 animate-pulse border border-amber-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-800">Registration Under Review</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Verification Pending</p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Thank you for registering on <span className="font-extrabold text-rose-500">Yaarana.pk</span>! Your account has been received and is currently under review by our safety audit team to prevent fraud and ensure certified credentials.
          </p>
          <div className="bg-rose-50/50 p-4 rounded-2xl text-[11px] text-rose-800 border border-rose-100/50 italic font-medium">
            "Verification typically takes between 5 to 30 minutes. Please refresh this page or check back later."
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={async () => {
                const fetched = await getProfile(isDemoMode, user);
                if (fetched) {
                  setProfile(fetched);
                }
              }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 font-extrabold rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 font-extrabold rounded-xl text-xs transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Tester / Developer Fast-Pass Container */}
          <div className="border-t border-dashed border-gray-200 pt-6 space-y-3">
            <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Studio Developer Fast-Pass</span>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleInstantApprovalBypass}
                disabled={devBypassLoading}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold rounded-xl text-xs shadow hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {devBypassLoading ? "Bypassing..." : "Instant Fast-Pass Approve"}
              </button>
              <button
                onClick={handleInstantAdminBypass}
                disabled={devBypassLoading}
                className="w-full py-2 bg-slate-900 text-white font-extrabold rounded-xl text-xs shadow hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {devBypassLoading ? "Escalating..." : "Log in as Admin Mode"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Main Approved Interface
  return (
    <div className="min-h-screen bg-warm-bg font-sans flex flex-col justify-between">
      
      {/* Top Navigation Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-30 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <button
            onClick={() => setActiveTab('browse')}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-2xl font-display">Y</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-800 font-display">
              Yaarana<span className="text-brand">.pk</span>
            </span>
          </button>

          {/* Navigation Links & User Badge */}
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold tracking-tight transition-all ${
                  activeTab === 'browse' 
                    ? 'bg-active-bg text-brand font-black shadow-sm border border-brand/10' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Partners
              </button>
              
              <button
                onClick={() => setActiveTab('booking')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold tracking-tight transition-all ${
                  activeTab === 'booking' 
                    ? 'bg-active-bg text-brand font-black shadow-sm border border-brand/10' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                Book Now
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold tracking-tight transition-all flex items-center gap-1.5 ${
                  activeTab === 'history' 
                    ? 'bg-active-bg text-brand font-black shadow-sm border border-brand/10' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <History className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">My Account</span>
              </button>

              {profile?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold tracking-tight transition-all bg-slate-900 text-amber-400 border border-slate-850 ${
                    activeTab === 'admin' ? 'ring-2 ring-brand' : 'hover:bg-slate-800'
                  }`}
                >
                  Admin Portal
                </button>
              )}
            </nav>

            {/* User Profile Badge */}
            {profile && (
              <div className="hidden md:flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                <img
                  src={profile.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-brand/10"
                />
                <span className="font-bold text-xs text-gray-700 max-w-[120px] truncate">{profile.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        {activeTab === 'browse' && (
          <BrowseCompanions
            companions={companions}
            onSelectCompanion={handleSelectCompanion}
            onSeedDemoCompanions={handleSeedDemoCompanions}
            isAdmin={profile?.role === 'admin'}
          />
        )}

        {activeTab === 'booking' && (
          <BookingPage
            selectedCompanion={selectedCompanion}
            onBookingSubmit={handleBookingSubmit}
            onNavigateToHistory={() => setActiveTab('history')}
            companions={companions}
            onSelectCompanionFromDropdown={(comp) => setSelectedCompanion(comp)}
          />
        )}

        {activeTab === 'history' && (
          <MyAccount
            profile={profile}
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'admin' && profile?.role === 'admin' && (
          <AdminPanel
            usersQueue={usersQueue}
            companions={companions}
            bookings={bookings}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            onAddCompanion={handleAddCompanion}
            onDeleteCompanion={handleDeleteCompanion}
            onSeedDemoCompanions={handleSeedDemoCompanions}
            onApproveBooking={handleApproveBooking}
            onRejectBooking={handleRejectBooking}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-rose-100/50 py-6 px-4 md:px-8 text-center shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2 justify-center">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Yaarana.pk Companion Booking Service. Curing Loneliness since 2026.</span>
          </div>
          <div>
            Discreet & Certified • All Activities strictly consensual.
          </div>
        </div>
      </footer>
    </div>
  );
}
