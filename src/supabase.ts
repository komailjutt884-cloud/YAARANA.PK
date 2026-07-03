import { createClient } from '@supabase/supabase-js';

// Load Supabase URL and Anon Key from environment variables (Vite-prefixed)
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * DATABASE SCHEMA SQL FOR SUPABASE (Copy & paste into Supabase SQL Editor):
 * 
-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  uid text PRIMARY KEY,
  email text NOT NULL,
  phone text,
  name text,
  photo_url text,
  status text CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  role text CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to insert/update their own profile" ON public.profiles FOR ALL USING (auth.uid()::text = uid);

-- 2. COMPANIONS TABLE
CREATE TABLE IF NOT EXISTS public.companions (
  id text PRIMARY KEY,
  name text NOT NULL,
  age integer,
  gender text,
  location text,
  photo_url text,
  rate numeric,
  services text[], -- Array of services
  about text,
  availability text CHECK (availability IN ('Available', 'Busy', 'Offline')) DEFAULT 'Available',
  rating numeric DEFAULT 5.0,
  reviews_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for companions
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to companions" ON public.companions FOR SELECT USING (true);
CREATE POLICY "Allow write access to companions for all users" ON public.companions FOR ALL USING (true);

-- 3. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  user_email text NOT NULL,
  user_name text,
  companion_id text NOT NULL,
  companion_name text NOT NULL,
  companion_photo_url text,
  activity text,
  duration integer,
  total_amount numeric,
  payment_method text CHECK (payment_method IN ('JazzCash', 'EasyPaisa')),
  wallet_number text,
  last_4_digits text,
  status text CHECK (status IN ('pending_verification', 'confirmed', 'cancelled')) DEFAULT 'pending_verification',
  booking_date text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all actions on bookings" ON public.bookings FOR ALL USING (true);

-- Seed initial companions (optional)
INSERT INTO public.companions (id, name, age, gender, location, photo_url, rate, services, about, availability, rating, reviews_count) VALUES
('comp_1', 'Aliza Sheikh', 23, 'Female', 'Lahore, Pakistan', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', 3000, ARRAY['Dining', 'Movies', 'Travel', 'Spending a Day/Night'], 'Professional host and brilliant conversationalist. Loves exploring Lahore coffee spots and food streets.', 'Available', 4.9, 28),
('comp_2', 'Hamza Butt', 25, 'Male', 'Islamabad, Pakistan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', 2500, ARRAY['Movies', 'Travel', 'Call Companionship'], 'Nature explorer, photographer, and trekking enthusiast. Great company for long drives and outdoor trips around Margalla Hills.', 'Available', 4.8, 19),
('comp_3', 'Zara Khan', 24, 'Female', 'Karachi, Pakistan', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', 3500, ARRAY['Dining', 'Movies', 'Spending a Day/Night', 'Call Companionship'], 'Fashion designer and gourmet foodie. Let me guide you to the premium seaside dining and entertainment spots in Clifton/DHA.', 'Busy', 5.0, 34);
 */
