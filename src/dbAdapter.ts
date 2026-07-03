import { isSupabaseConfigured, supabase } from './supabase';
import { UserProfile, Companion, Booking } from './types';
import { SAMPLE_COMPANIONS } from './data/sampleCompanions';

// ============================================================================
// SUPABASE FIELD MAPPERS (camelCase <-> snake_case)
// ============================================================================

function mapProfileFromDb(row: any): UserProfile {
  return {
    uid: row.uid,
    email: row.email,
    phone: row.phone || '',
    name: row.name || '',
    photoURL: row.photo_url || '',
    status: row.status || 'pending',
    role: row.role || 'user',
    createdAt: row.created_at
  };
}

function mapProfileToDb(profile: any) {
  return {
    uid: profile.uid,
    email: profile.email,
    phone: profile.phone,
    name: profile.name,
    photo_url: profile.photoURL,
    status: profile.status,
    role: profile.role,
    created_at: profile.createdAt || new Date().toISOString()
  };
}

function mapCompanionFromDb(row: any): Companion {
  return {
    id: row.id,
    name: row.name,
    age: Number(row.age || 0),
    gender: row.gender || '',
    location: row.location || '',
    city: row.city || row.location || '',
    photoUrl: row.photo_url || '',
    rate: Number(row.rate || 0),
    services: row.services || [],
    about: row.about || '',
    availability: row.availability || 'Available',
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || 0),
    createdAt: row.created_at
  };
}

function mapCompanionToDb(comp: any) {
  return {
    id: comp.id,
    name: comp.name,
    age: comp.age,
    gender: comp.gender,
    location: comp.location,
    city: comp.city || comp.location || '',
    photo_url: comp.photoUrl,
    rate: comp.rate,
    services: comp.services,
    about: comp.about,
    availability: comp.availability,
    rating: comp.rating || 5.0,
    reviews_count: comp.reviewsCount || 0,
    created_at: comp.createdAt || new Date().toISOString()
  };
}

function mapBookingFromDb(row: any): Booking {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.user_email,
    userName: row.user_name || '',
    companionId: row.companion_id,
    companionName: row.companion_name,
    companionPhotoUrl: row.companion_photo_url || '',
    activity: row.activity || '',
    duration: Number(row.duration || 0),
    totalAmount: Number(row.total_amount || 0),
    paymentMethod: row.payment_method || 'JazzCash',
    walletNumber: row.wallet_number || '',
    last4Digits: row.last_4_digits || '',
    status: row.status || 'pending_verification',
    bookingDate: row.booking_date || '',
    createdAt: row.created_at
  };
}

function mapBookingToDb(booking: any) {
  return {
    id: booking.id,
    user_id: booking.userId,
    user_email: booking.userEmail,
    user_name: booking.userName,
    companion_id: booking.companionId,
    companion_name: booking.companionName,
    companion_photo_url: booking.companionPhotoUrl,
    activity: booking.activity,
    duration: booking.duration,
    total_amount: booking.totalAmount,
    payment_method: booking.paymentMethod,
    wallet_number: booking.walletNumber,
    last_4_digits: booking.last4Digits,
    status: booking.status,
    booking_date: booking.bookingDate,
    created_at: booking.createdAt || new Date().toISOString()
  };
}

// ============================================================================
// LOCAL STORAGE BACKEND & OBSERVABLE EMITTER
// ============================================================================

const listeners = {
  auth: [] as ((user: any) => void)[],
  companions: [] as ((list: Companion[]) => void)[],
  bookings: [] as ((list: Booking[]) => void)[],
  profiles: [] as ((list: UserProfile[]) => void)[]
};

function notify(type: keyof typeof listeners) {
  if (type === 'auth') {
    const user = getLocalUser();
    listeners.auth.forEach(cb => cb(user));
  } else if (type === 'companions') {
    const list = getLocalCompanions();
    listeners.companions.forEach(cb => cb(list));
  } else if (type === 'bookings') {
    const list = getLocalBookings();
    listeners.bookings.forEach(cb => cb(list));
  } else if (type === 'profiles') {
    const list = getLocalProfiles();
    listeners.profiles.forEach(cb => cb(list));
  }
}

function getLocalUser() {
  const data = localStorage.getItem('yaarana_user');
  return data ? JSON.parse(data) : null;
}

function setLocalUser(user: any) {
  if (user) {
    localStorage.setItem('yaarana_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('yaarana_user');
  }
  notify('auth');
}

function getLocalCompanions(): Companion[] {
  const data = localStorage.getItem('yaarana_companions');
  if (!data) {
    const list: Companion[] = (SAMPLE_COMPANIONS as Companion[]).map((c, i) => ({
      id: `comp_${i + 1}`,
      name: c.name,
      age: c.age,
      gender: c.gender,
      location: c.location,
      city: c.city || c.location,
      photoUrl: c.photoUrl,
      rate: c.rate,
      services: c.services,
      about: c.about,
      availability: c.availability,
      rating: c.rating || 5.0,
      reviewsCount: c.reviewsCount || 0,
      createdAt: new Date().toISOString()
    } as any));
    localStorage.setItem('yaarana_companions', JSON.stringify(list));
    return list;
  }
  return JSON.parse(data);
}

function setLocalCompanions(list: Companion[]) {
  localStorage.setItem('yaarana_companions', JSON.stringify(list));
  notify('companions');
}

function getLocalBookings(): Booking[] {
  const data = localStorage.getItem('yaarana_bookings');
  return data ? JSON.parse(data) : [];
}

function setLocalBookings(list: Booking[]) {
  localStorage.setItem('yaarana_bookings', JSON.stringify(list));
  notify('bookings');
}

function getLocalProfiles(): UserProfile[] {
  const data = localStorage.getItem('yaarana_profiles');
  return data ? JSON.parse(data) : [];
}

function setLocalProfiles(list: UserProfile[]) {
  localStorage.setItem('yaarana_profiles', JSON.stringify(list));
  notify('profiles');
}

// ============================================================================
// DYNAMIC ADAPTER EXPORTS
// ============================================================================

// 1. Auth subscription (Unifies Supabase Auth & Local Fallback)
export function subscribeAuth(isDemoMode: boolean, callback: (user: any) => void): () => void {
  if (isDemoMode) {
    return () => {};
  }

  if (isSupabaseConfigured && supabase) {
    // 1. Set initial user immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      callback(session?.user || null);
    });

    // 2. Subscribe to auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  } else {
    // Local memory/storage fallback subscription
    listeners.auth.push(callback);
    const user = getLocalUser();
    setTimeout(() => callback(user), 0);

    return () => {
      listeners.auth = listeners.auth.filter(cb => cb !== callback);
    };
  }
}

// 2. Sign Out
export async function signOutUser(isDemoMode: boolean): Promise<void> {
  if (isDemoMode) return;

  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  } else {
    setLocalUser(null);
  }
}

// 3. Get User Profile
export async function getProfile(isDemoMode: boolean, user: any): Promise<UserProfile | null> {
  if (isDemoMode || !user) return null;

  const userId = user.id || user.uid;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('uid', userId)
      .single();

    if (error || !data) return null;
    return mapProfileFromDb(data);
  } else {
    const list = getLocalProfiles();
    const profile = list.find(p => p.uid === userId);
    return profile || null;
  }
}

// 4. Create or Update User Profile
export async function saveProfile(
  isDemoMode: boolean,
  user: any,
  profileData: { name: string; phone: string; email: string; photoURL: string },
  currentRole?: string
): Promise<UserProfile> {
  const userId = user?.id || user?.uid || 'mock_user';
  const isAdminEmail = (profileData.email || '').toLowerCase() === 'komailjutt884@gmail.com';
  const initialRole = currentRole || (isAdminEmail ? 'admin' : 'user');
  const initialStatus = 'approved';

  const newProfile: UserProfile = {
    uid: userId,
    email: profileData.email,
    phone: profileData.phone,
    name: profileData.name,
    photoURL: profileData.photoURL,
    status: initialStatus,
    role: initialRole as any,
    createdAt: new Date().toISOString()
  };

  if (isDemoMode) {
    return newProfile;
  }

  if (isSupabaseConfigured && supabase) {
    const dbPayload = mapProfileToDb(newProfile);
    
    // Check if profile already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('uid')
      .eq('uid', userId)
      .maybeSingle();

    let error;
    if (existing) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(dbPayload)
        .eq('uid', userId);
      error = updateError;
    } else {
      // Insert new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(dbPayload);
      error = insertError;
    }

    if (error) throw error;
    return newProfile;
  } else {
    const list = getLocalProfiles();
    const filtered = list.filter(p => p.uid !== userId);
    filtered.push(newProfile);
    setLocalProfiles(filtered);
    return newProfile;
  }
}

// 5. Real-time Companions Snapshot
export function subscribeCompanions(
  isDemoMode: boolean,
  callback: (companions: Companion[]) => void
): () => void {
  if (isDemoMode) {
    return () => {};
  }

  if (isSupabaseConfigured && supabase) {
    // Load initial list
    supabase.from('companions')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          callback(data.map(mapCompanionFromDb));
        }
      });

    // Real-time listener
    const channel = supabase
      .channel('schema-db-companions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'companions' },
        () => {
          supabase.from('companions')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
              if (data) callback(data.map(mapCompanionFromDb));
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    // Local storage companions listener
    listeners.companions.push(callback);
    const list = getLocalCompanions();
    setTimeout(() => callback(list), 0);

    return () => {
      listeners.companions = listeners.companions.filter(cb => cb !== callback);
    };
  }
}

// 6. Real-time Bookings Snapshot
export function subscribeBookings(
  isDemoMode: boolean,
  user: any,
  profile: UserProfile | null,
  callback: (bookings: Booking[]) => void
): () => void {
  if (isDemoMode || !user || !profile) {
    return () => {};
  }

  const userId = user.id || user.uid;

  if (isSupabaseConfigured && supabase) {
    const fetchAndCallback = () => {
      let queryBuilder = supabase.from('bookings').select('*');
      
      if (profile.role !== 'admin') {
        queryBuilder = queryBuilder.eq('user_id', userId);
      }
      
      queryBuilder.order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) {
            callback(data.map(mapBookingFromDb));
          }
        });
    };

    fetchAndCallback();

    const channel = supabase
      .channel('schema-db-bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchAndCallback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    // Local storage bookings listener
    listeners.bookings.push(callback);
    const filterAndNotify = () => {
      const list = getLocalBookings();
      if (profile.role === 'admin') {
        callback(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        const userList = list.filter(b => b.userId === userId);
        callback(userList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    };
    setTimeout(filterAndNotify, 0);

    return () => {
      listeners.bookings = listeners.bookings.filter(cb => cb !== callback);
    };
  }
}

// 7. Real-time Admin Users Queue Snapshot
export function subscribeUsersQueue(
  isDemoMode: boolean,
  user: any,
  profile: UserProfile | null,
  callback: (users: UserProfile[]) => void
): () => void {
  if (isDemoMode || !user || profile?.role !== 'admin') {
    return () => {};
  }

  if (isSupabaseConfigured && supabase) {
    const fetchAndCallback = () => {
      supabase.from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) {
            callback(data.map(mapProfileFromDb));
          }
        });
    };

    fetchAndCallback();

    const channel = supabase
      .channel('schema-db-profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchAndCallback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    // Local profiles listener
    listeners.profiles.push(callback);
    const list = getLocalProfiles();
    setTimeout(() => callback(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())), 0);

    return () => {
      listeners.profiles = listeners.profiles.filter(cb => cb !== callback);
    };
  }
}

// 8. Admin User verification
export async function approveUser(isDemoMode: boolean, uid: string): Promise<void> {
  if (isDemoMode) return;

  if (isSupabaseConfigured && supabase) {
    await supabase.from('profiles').update({ status: 'approved' }).eq('uid', uid);
  } else {
    const list = getLocalProfiles();
    const updated = list.map(p => p.uid === uid ? { ...p, status: 'approved' as const } : p);
    setLocalProfiles(updated);
  }
}

export async function rejectUser(isDemoMode: boolean, uid: string): Promise<void> {
  if (isDemoMode) return;

  if (isSupabaseConfigured && supabase) {
    await supabase.from('profiles').update({ status: 'rejected' }).eq('uid', uid);
  } else {
    const list = getLocalProfiles();
    const updated = list.map(p => p.uid === uid ? { ...p, status: 'rejected' as const } : p);
    setLocalProfiles(updated);
  }
}

// 9. Companions Actions
export async function addCompanion(
  isDemoMode: boolean,
  companionData: Omit<Companion, 'id' | 'createdAt'>
): Promise<void> {
  if (isDemoMode) return;

  const id = `comp_${Date.now()}`;
  const newComp: Companion = {
    id,
    ...companionData,
    rating: 5.0,
    reviewsCount: 0,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    const dbPayload = mapCompanionToDb(newComp);
    const { error } = await supabase.from('companions').insert(dbPayload);
    if (error) throw error;
  } else {
    const list = getLocalCompanions();
    setLocalCompanions([newComp, ...list]);
  }
}

export async function deleteCompanion(isDemoMode: boolean, companionId: string): Promise<void> {
  if (isDemoMode) return;

  if (isSupabaseConfigured && supabase) {
    await supabase.from('companions').delete().eq('id', companionId);
  } else {
    const list = getLocalCompanions();
    const updated = list.filter(c => c.id !== companionId);
    setLocalCompanions(updated);
  }
}

export async function clearAllCompanions(isDemoMode: boolean): Promise<void> {
  if (isDemoMode) return;

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('companions').delete().neq('id', '');
    if (error) throw error;
  } else {
    setLocalCompanions([]);
  }
}

export async function getCompanionsList(isDemoMode: boolean): Promise<Companion[]> {
  if (isDemoMode) {
    const savedComps = localStorage.getItem('yaarana_demo_companions');
    return savedComps 
      ? (JSON.parse(savedComps) as Companion[]) 
      : (SAMPLE_COMPANIONS as Companion[]).map((c, i) => ({ 
          id: `comp_${i + 1}`, 
          ...c, 
          createdAt: new Date().toISOString() 
        }));
  }
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('companions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCompanionFromDb);
  } else {
    return getLocalCompanions();
  }
}

// 10. Booking Actions
export async function submitBooking(
  isDemoMode: boolean,
  user: any,
  profile: UserProfile | null,
  bookingData: Omit<Booking, 'id' | 'userId' | 'userEmail' | 'userName' | 'status' | 'createdAt'>
): Promise<string> {
  if (!user || !profile) throw new Error("Unauthenticated");

  const id = `book_${Date.now()}`;
  const userId = user.id || user.uid;
  const newBooking: Booking = {
    ...bookingData,
    id,
    userId,
    userEmail: profile.email,
    userName: profile.name,
    status: 'pending_verification',
    createdAt: new Date().toISOString()
  };

  if (isDemoMode) {
    return id;
  }

  if (isSupabaseConfigured && supabase) {
    const dbPayload = mapBookingToDb(newBooking);
    const { error } = await supabase.from('bookings').insert(dbPayload);
    if (error) throw error;
    return id;
  } else {
    const list = getLocalBookings();
    setLocalBookings([newBooking, ...list]);
    return id;
  }
}

export async function cancelBooking(isDemoMode: boolean, bookingId: string): Promise<void> {
  if (isDemoMode) return;

  if (isSupabaseConfigured && supabase) {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
  } else {
    const list = getLocalBookings();
    const updated = list.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b);
    setLocalBookings(updated);
  }
}

export async function approveBooking(isDemoMode: boolean, bookingId: string): Promise<void> {
  if (isDemoMode) return;

  if (isSupabaseConfigured && supabase) {
    await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId);
  } else {
    const list = getLocalBookings();
    const updated = list.map(b => b.id === bookingId ? { ...b, status: 'confirmed' as const } : b);
    setLocalBookings(updated);
  }
}

export async function rejectBooking(isDemoMode: boolean, bookingId: string): Promise<void> {
  if (isDemoMode) return;

  if (isSupabaseConfigured && supabase) {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
  } else {
    const list = getLocalBookings();
    const updated = list.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b);
    setLocalBookings(updated);
  }
}

// 11. Seed Companions
export async function seedCompanions(isDemoMode: boolean): Promise<void> {
  if (isDemoMode) return;

  if (isSupabaseConfigured && supabase) {
    for (const comp of SAMPLE_COMPANIONS) {
      const fullComp = {
        id: `comp_${Math.floor(Math.random() * 100000)}`,
        ...comp,
        createdAt: new Date().toISOString()
      };
      await supabase.from('companions').insert(mapCompanionToDb(fullComp));
    }
  } else {
    const list = getLocalCompanions();
    const seeded = [...list];
    SAMPLE_COMPANIONS.forEach((comp, idx) => {
      if (!seeded.some(c => c.name === comp.name)) {
        seeded.push({
          id: `comp_seed_${Date.now()}_${idx}`,
          ...comp,
          rating: comp.rating || 5.0,
          reviewsCount: comp.reviewsCount || 0,
          createdAt: new Date().toISOString()
        } as any);
      }
    });
    setLocalCompanions(seeded);
  }
}

// 12. Unified Authentication Methods
export async function signInWithGoogle(isDemoMode: boolean): Promise<any> {
  if (isDemoMode) return null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  } else {
    // Return a mock user for Google Sign-In when Supabase isn't configured
    const mockUser = {
      id: 'mock_google_user',
      email: 'komailjutt884@gmail.com',
      displayName: 'Komail Ahmed',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
    };
    setLocalUser(mockUser);
    return mockUser;
  }
}

export async function sendPhoneOTP(isDemoMode: boolean, formattedPhone: string): Promise<any> {
  if (isDemoMode) return null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone
    });
    if (error) throw error;
    return { provider: 'supabase', phone: formattedPhone };
  } else {
    // Return mock confirmation object
    return { provider: 'local_mock', phone: formattedPhone };
  }
}

export async function verifyPhoneOTP(isDemoMode: boolean, confirmationResultOrPhoneObj: any, code: string): Promise<any> {
  if (isDemoMode) return null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: confirmationResultOrPhoneObj.phone,
      token: code,
      type: 'sms'
    });
    if (error) throw error;
    return data;
  } else {
    // Verify any mock code immediately for developer ease
    const mockUser = {
      id: `mock_phone_${confirmationResultOrPhoneObj.phone.replace(/[^a-zA-Z0-9]/g, '')}`,
      email: 'phone_user@yaarana.pk',
      phone: confirmationResultOrPhoneObj.phone,
      displayName: 'Phone Companion Partner',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    };
    setLocalUser(mockUser);
    return mockUser;
  }
}
