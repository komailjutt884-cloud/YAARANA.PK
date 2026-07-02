export type UserStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  phone: string;
  name: string;
  photoURL: string;
  status: UserStatus;
  role: UserRole;
  createdAt: any; // Firestore Timestamp
}

export interface Companion {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  photoUrl: string;
  rate: number; // PKR per hour
  services: string[]; // e.g., ["Dining", "Movies", "Travel", "Spending a Day/Night", "Call Companionship"]
  about: string;
  availability: 'Available' | 'Busy' | 'Offline';
  rating: number;
  reviewsCount: number;
  createdAt: any; // Firestore Timestamp
}

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  companionId: string;
  companionName: string;
  companionPhotoUrl: string;
  activity: string;
  duration: number; // in hours
  totalAmount: number; // in PKR
  paymentMethod: 'JazzCash' | 'EasyPaisa';
  walletNumber: string; // e.g. "03217654321"
  last4Digits: string; // last 4 digits of tx id or wallet
  status: 'pending_verification' | 'confirmed' | 'cancelled';
  createdAt: any; // Firestore Timestamp
  bookingDate: string; // "YYYY-MM-DD"
}
